export const runtime = "nodejs";

import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createClient } from "@supabase/supabase-js";
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

interface BulkUploadResult {
  fileId: string;
  title: string;
  filename: string;
  status: "success" | "error";
  error?: string;
}

interface BulkUploadSummary {
  total: number;
  successful: number;
  failed: number;
}

export async function POST(req: NextRequest) {
  try {
    // For now, let's use a simpler approach - get user ID from request body
    // This is a temporary solution while we debug the session issue
    const formData = await req.formData();
    const templateData = formData.get("template") as string;
    const files = formData.getAll("files") as File[];
    const titles = formData.getAll("titles") as string[];
    const userId = formData.get("userId") as string;

    if (!templateData || !files || files.length === 0) {
      return NextResponse.json(
        { error: "Missing template or files" },
        { status: 400 }
      );
    }

    if (!userId) {
      return NextResponse.json({ error: "Missing userId" }, { status: 400 });
    }

    // Verify user exists and has admin role
    const { data: userRole, error: roleError } = await supabaseAdmin
      .from("user_roles")
      .select("role")
      .eq("user_id", userId)
      .maybeSingle();

    if (roleError) {
      return NextResponse.json({ error: roleError.message }, { status: 500 });
    }

    if (!userRole || userRole.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const template = JSON.parse(templateData);
    const { emirateScope, authorityName } = template;

    if (!emirateScope || !authorityName) {
      return NextResponse.json(
        { error: "Template must include emirateScope and authorityName" },
        { status: 400 }
      );
    }

    const user_id = userId;
    const results: BulkUploadResult[] = [];
    let successful = 0;
    let failed = 0;

    // Process each file
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const title = titles[i] || file.name.replace(/\.[^.]+$/, "");

      try {
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
          throw new Error(dupErr.message);
        }

        if (dup) {
          results.push({
            fileId: dup.id,
            title,
            filename: file.name,
            status: "success",
          });
          successful++;
          continue;
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
          throw new Error(uploadErr.message);
        }

        // Upload to OpenAI Vector Store
        const vectorStoreId = process.env.OPENAI_VECTOR_STORE_ID;
        if (!vectorStoreId) {
          throw new Error("Missing OPENAI_VECTOR_STORE_ID");
        }

        // Upload raw file - OpenAI does all the processing automatically
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
            console.error(
              "Vector store error:",
              await vectorStoreResponse.text()
            );
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
            emirate_scope: emirateScope,
            authority_name: authorityName,
            openai_file_id: uploaded.id,
            openai_vector_store_id: vectorStoreId,
            status: "processing",
          })
          .select("id")
          .single();

        if (insertErr) {
          throw new Error(insertErr.message);
        }

        results.push({
          fileId: inserted.id,
          title,
          filename: file.name,
          status: "success",
        });
        successful++;
      } catch (error: unknown) {
        const errorMessage =
          error instanceof Error ? error.message : "Unknown error";
        results.push({
          fileId: "",
          title,
          filename: file.name,
          status: "error",
          error: errorMessage,
        });
        failed++;
      }
    }

    const summary: BulkUploadSummary = {
      total: files.length,
      successful,
      failed,
    };

    // Update status to ready for all successful uploads
    const successfulDocumentIds = results
      .filter((r) => r.status === "success" && r.fileId)
      .map((r) => r.fileId);

    if (successfulDocumentIds.length > 0) {
      try {
        await fetch(
          `${
            process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"
          }/api/documents/update-status`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ documentIds: successfulDocumentIds }),
          }
        );
      } catch (statusError) {
        console.error("Failed to update document status:", statusError);
        // Don't fail the upload if status update fails
      }
    }

    return NextResponse.json({
      success: true,
      results,
      summary,
    });
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
