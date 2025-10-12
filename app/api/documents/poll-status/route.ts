export const runtime = "nodejs";

import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { openai } from "@/lib/openai";

interface PollingConfig {
  maxAttempts: number;
  baseDelay: number;
  maxDelay: number;
}

const DEFAULT_CONFIG: PollingConfig = {
  maxAttempts: 20,
  baseDelay: 2000, // 2 seconds
  maxDelay: 30000, // 30 seconds
};

/**
 * Test if a document is actually searchable by making a minimal query
 */
async function testFileSearch(documentId: string): Promise<boolean> {
  try {
    const { data: doc, error } = await supabaseAdmin
      .from("documents")
      .select("openai_file_id, openai_vector_store_id, title")
      .eq("id", documentId)
      .single();

    if (error || !doc?.openai_file_id || !doc?.openai_vector_store_id) {
      console.log(`[PollStatus] Document ${documentId} missing OpenAI IDs`);
      return false;
    }

    // Make a minimal test query to verify file search works
    const testResponse = await openai.responses.create({
      model: "gpt-4o",
      input: "test", // Minimal query to test searchability
      tools: [
        {
          type: "file_search",
          vector_store_ids: [doc.openai_vector_store_id],
          max_num_results: 1, // Limit results for faster testing
        },
      ],
    });

    // Check if file search call completed successfully
    const fileSearchCall = testResponse.output?.find(
      (item: any) => item.type === "file_search_call"
    );

    const isSearchable = fileSearchCall?.status === "completed";
    
    console.log(
      `[PollStatus] Document ${documentId} (${doc.title}) searchable: ${isSearchable}`
    );

    return isSearchable;
  } catch (error) {
    console.log(
      `[PollStatus] File search test failed for doc ${documentId}:`,
      error instanceof Error ? error.message : "Unknown error"
    );
    return false;
  }
}

/**
 * Calculate exponential backoff delay
 */
function calculateDelay(attempt: number, baseDelay: number, maxDelay: number): number {
  const delay = baseDelay * Math.pow(1.5, attempt - 1);
  return Math.min(delay, maxDelay);
}

/**
 * Poll document status with exponential backoff
 */
async function pollDocumentStatus(
  documentId: string,
  config: PollingConfig = DEFAULT_CONFIG
): Promise<{ success: boolean; attempts: number; finalStatus: string }> {
  console.log(`[PollStatus] Starting polling for document ${documentId}`);

  for (let attempt = 1; attempt <= config.maxAttempts; attempt++) {
    try {
      const isReady = await testFileSearch(documentId);

      if (isReady) {
        // Update document status to ready
        const { error: updateError } = await supabaseAdmin
          .from("documents")
          .update({ status: "ready" })
          .eq("id", documentId);

        if (updateError) {
          console.error(
            `[PollStatus] Failed to update document ${documentId} to ready:`,
            updateError
          );
          return { success: false, attempts, finalStatus: "update_failed" };
        }

        console.log(
          `[PollStatus] Document ${documentId} marked as ready after ${attempt} attempts`
        );
        return { success: true, attempts, finalStatus: "ready" };
      }

      // If not ready and not the last attempt, wait before next check
      if (attempt < config.maxAttempts) {
        const delay = calculateDelay(attempt, config.baseDelay, config.maxDelay);
        console.log(
          `[PollStatus] Document ${documentId} not ready (attempt ${attempt}/${config.maxAttempts}), waiting ${delay}ms`
        );
        await new Promise((resolve) => setTimeout(resolve, delay));
      }
    } catch (error) {
      console.error(
        `[PollStatus] Error polling document ${documentId} (attempt ${attempt}):`,
        error instanceof Error ? error.message : "Unknown error"
      );

      // If this is the last attempt, mark as failed
      if (attempt === config.maxAttempts) {
        break;
      }

      // Wait before retrying on error
      const delay = calculateDelay(attempt, config.baseDelay, config.maxDelay);
      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }

  // If max attempts reached, mark as failed
  const { error: updateError } = await supabaseAdmin
    .from("documents")
    .update({ status: "failed" })
    .eq("id", documentId);

  if (updateError) {
    console.error(
      `[PollStatus] Failed to update document ${documentId} to failed:`,
      updateError
    );
    return { success: false, attempts: config.maxAttempts, finalStatus: "update_failed" };
  }

  console.log(
    `[PollStatus] Document ${documentId} marked as failed after ${config.maxAttempts} attempts`
  );
  return { success: false, attempts: config.maxAttempts, finalStatus: "failed" };
}

export async function POST(req: NextRequest) {
  try {
    const { documentId, config } = await req.json();

    if (!documentId) {
      return NextResponse.json(
        { error: "Missing documentId" },
        { status: 400 }
      );
    }

    // Verify document exists and is in processing state
    const { data: doc, error: docError } = await supabaseAdmin
      .from("documents")
      .select("id, status, title")
      .eq("id", documentId)
      .single();

    if (docError || !doc) {
      return NextResponse.json(
        { error: "Document not found" },
        { status: 404 }
      );
    }

    if (doc.status !== "processing") {
      return NextResponse.json(
        { 
          message: `Document is already ${doc.status}`,
          status: doc.status 
        },
        { status: 200 }
      );
    }

    // Start polling (don't await - run in background)
    const pollingConfig = { ...DEFAULT_CONFIG, ...config };
    pollDocumentStatus(documentId, pollingConfig).catch((error) => {
      console.error(`[PollStatus] Background polling failed for ${documentId}:`, error);
    });

    return NextResponse.json({
      message: "Polling started",
      documentId,
      config: pollingConfig,
    });
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : "Unknown error";
    console.error("[PollStatus] Error:", errorMessage);
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}

/**
 * GET endpoint to check current polling status
 */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const documentId = searchParams.get("documentId");

    if (!documentId) {
      return NextResponse.json(
        { error: "Missing documentId parameter" },
        { status: 400 }
      );
    }

    const { data: doc, error } = await supabaseAdmin
      .from("documents")
      .select("id, status, title, uploaded_at")
      .eq("id", documentId)
      .single();

    if (error || !doc) {
      return NextResponse.json(
        { error: "Document not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      documentId: doc.id,
      status: doc.status,
      title: doc.title,
      uploadedAt: doc.uploaded_at,
    });
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
