export const runtime = "nodejs";

import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

export async function POST(req: NextRequest) {
  try {
    const { documentIds } = await req.json();

    if (!documentIds || !Array.isArray(documentIds)) {
      return NextResponse.json(
        { error: "Missing or invalid documentIds array" },
        { status: 400 }
      );
    }

    // Update documents from processing to ready
    const { data, error } = await supabaseAdmin
      .from("documents")
      .update({ status: "ready" })
      .in("id", documentIds)
      .eq("status", "processing")
      .select("id, title");

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({
      message: `Updated ${
        data?.length || 0
      } documents from processing to ready`,
      updatedDocuments: data,
    });
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
