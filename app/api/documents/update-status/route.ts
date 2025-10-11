export const runtime = "nodejs";

import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { openai } from "@/lib/openai";

async function checkFileStatus(fileId: string) {
  try {
    const file = await openai.files.retrieve(fileId);
    return {
      id: file.id,
      status: file.status,
      filename: file.filename,
      purpose: file.purpose,
      created_at: file.created_at,
      bytes: file.bytes,
    };
  } catch (error) {
    return {
      id: fileId,
      status: "error",
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

async function checkVectorStoreFileStatus(fileId: string, vectorStoreId: string) {
  try {
    const response = await fetch(
      `https://api.openai.com/v1/vector_stores/${vectorStoreId}/files?limit=100`,
      {
        headers: {
          Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
        },
      }
    );

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${await response.text()}`);
    }

    const data = await response.json();
    const vectorStoreFile = data.data.find((f: { file_id?: string; status?: string; id?: string; created_at?: number }) => f.file_id === fileId);
    
    return {
      found: !!vectorStoreFile,
      status: vectorStoreFile?.status || "not_found",
      vectorStoreFileId: vectorStoreFile?.id,
      created_at: vectorStoreFile?.created_at,
    };
  } catch (error) {
    return {
      found: false,
      status: "error",
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

export async function POST(req: NextRequest) {
  try {
    const { documentIds } = await req.json();

    if (!documentIds || !Array.isArray(documentIds)) {
      return NextResponse.json(
        { error: "Missing or invalid documentIds array" },
        { status: 400 }
      );
    }

    // Load documents with their OpenAI file IDs
    const { data: docs, error: loadErr } = await supabaseAdmin
      .from("documents")
      .select("id, title, status, openai_file_id, openai_vector_store_id")
      .in("id", documentIds);

    if (loadErr) {
      return NextResponse.json({ error: loadErr.message }, { status: 500 });
    }

    const statuses: Record<string, string> = {};
    const errors: Record<string, string> = {};

    // Check each document
    for (const doc of docs || []) {
      const id = doc.id;
      
      // Already ready – keep as ready
      if (doc.status === "ready") {
        statuses[id] = "ready";
        continue;
      }

      const vectorStoreId = doc.openai_vector_store_id;
      const openaiFileId = doc.openai_file_id;

      if (!openaiFileId) {
        errors[id] = "No OpenAI file ID found";
        continue;
      }

      try {
        // Check OpenAI file status
        const fileStatus = await checkFileStatus(openaiFileId);
        console.log(`[UpdateStatus] Doc ${id}: OpenAI file status = ${fileStatus.status}`);

        // Check vector store status
        let vectorStatus = { found: false, status: "not_found" };
        if (vectorStoreId) {
          vectorStatus = await checkVectorStoreFileStatus(openaiFileId, vectorStoreId);
          console.log(`[UpdateStatus] Doc ${id}: Vector store status = ${vectorStatus.status}`);
        }

        // Determine final status
        const isFileReady = fileStatus.status === "processed" || fileStatus.status === "succeeded";
        const isVectorReady = vectorStatus.status === "completed";

        if (isFileReady && isVectorReady) {
          statuses[id] = "ready";
        } else if (fileStatus.status === "error" || vectorStatus.status === "failed") {
          statuses[id] = "failed";
        } else {
          statuses[id] = "processing";
        }

      } catch (e: unknown) {
        errors[id] = e instanceof Error ? e.message : "OpenAI status check failed";
      }
    }

    // Update documents with new statuses
    const updatePromises = Object.entries(statuses).map(async ([id, status]) => {
      if (status === "ready" || status === "failed") {
        const { error: updateErr } = await supabaseAdmin
          .from("documents")
          .update({ status })
          .eq("id", id);
        
        if (updateErr) {
          console.error(`[UpdateStatus] Failed to update doc ${id}:`, updateErr);
        }
      }
    });

    await Promise.all(updatePromises);

    return NextResponse.json({
      message: `Checked ${documentIds.length} documents`,
      statuses,
      errors: Object.keys(errors).length > 0 ? errors : undefined,
    });
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
