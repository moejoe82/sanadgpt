export const runtime = "nodejs";

import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { openai } from "@/lib/openai";
import { toFile } from "openai/uploads";
import { createHash } from "crypto";

// Simplified hash calculation using Node.js crypto
function sha256HexBuffer(buffer: Buffer): string {
  const hash = createHash("sha256");
  hash.update(buffer);
  return hash.digest("hex");
}

function getFileExtension(filename: string, mimeType: string): string {
  const dot = filename.lastIndexOf(".");
  if (dot !== -1 && dot < filename.length - 1) {
    return filename.slice(dot + 1).toLowerCase();
  }
  switch (mimeType) {
    case "text/plain":
      return "txt";
    case "application/pdf":
      return "pdf";
    case "application/vnd.openxmlformats-officedocument.wordprocessingml.document":
      return "docx";
    default:
      return "bin";
  }
}

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("document") as File | null;
    const title = (formData.get("title") as string) || "Untitled";
    const emirate_scope = (formData.get("emirate_scope") as string) || null;
    const authority_name = (formData.get("authority_name") as string) || null;

    if (!file) {
      return NextResponse.json(
        { error: "Missing file 'document'" },
        { status: 400 }
      );
    }

    // Use the test user we created
    const user_id = "8647beeb-845c-4024-b6b1-a475ddcc5f91";

    const arrayBuffer = await file.arrayBuffer();
    const nodeBuffer = Buffer.from(arrayBuffer);
    const hash = sha256HexBuffer(nodeBuffer);

    // Duplicate check by file_hash
    const { data: dup, error: dupErr } = await supabaseAdmin
      .from("documents")
      .select("id")
      .eq("file_hash", hash)
      .eq("user_id", user_id)
      .maybeSingle();
    if (dupErr) {
      return NextResponse.json({ error: dupErr.message }, { status: 500 });
    }
    if (dup) {
      return NextResponse.json({ id: dup.id, title }, { status: 200 });
    }

    const ext = getFileExtension(file.name, file.type);
    const objectKey = `${user_id}/${hash}.${ext}`;

    // Upload to Supabase Storage (bucket: documents)
    const { error: uploadErr } = await supabaseAdmin.storage
      .from("documents")
      .upload(objectKey, nodeBuffer, {
        upsert: true,
        contentType: file.type || "application/octet-stream",
      });
    if (uploadErr) {
      return NextResponse.json({ error: uploadErr.message }, { status: 500 });
    }

    // Upload to OpenAI Vector Store
    // OpenAI automatically handles PDF text extraction, chunking, and embeddings
    const vectorStoreId = process.env.OPENAI_VECTOR_STORE_ID;
    if (!vectorStoreId) {
      return NextResponse.json(
        { error: "Missing OPENAI_VECTOR_STORE_ID" },
        { status: 500 }
      );
    }

    // Upload raw PDF file - OpenAI does all the processing automatically
    const uploaded = await openai.files.create({
      file: await toFile(nodeBuffer, file.name),
      purpose: "assistants",
    });

    // Add to vector store for search using REST API
    try {
      const vectorStoreResponse = await fetch(
        `https://api.openai.com/v1/vector_stores/${vectorStoreId}/files`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            file_id: uploaded.id,
          }),
        }
      );

      if (!vectorStoreResponse.ok) {
        console.error("Vector store error:", await vectorStoreResponse.text());
      }
    } catch (vectorStoreError: unknown) {
      console.error("Vector store error:", vectorStoreError);
      // Continue with the upload even if vector store fails
    }

    // Insert into documents table
    const { data: inserted, error: insertErr } = await supabaseAdmin
      .from("documents")
      .insert({
        user_id,
        title,
        file_path: objectKey,
        file_hash: hash,
        emirate_scope,
        authority_name,
        openai_file_id: uploaded.id,
        openai_vector_store_id: vectorStoreId,
        status: "processing",
      })
      .select("id")
      .single();
    if (insertErr) {
      return NextResponse.json({ error: insertErr.message }, { status: 500 });
    }

    return NextResponse.json({ id: inserted.id, title }, { status: 200 });
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
