export const runtime = "nodejs";

import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createClient } from "@supabase/supabase-js";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { openai } from "@/lib/openai";

export async function POST(req: NextRequest) {
  try {
    // Auth: get user from Supabase session cookies
    const cookieStore = cookies();
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    if (!supabaseUrl || !anonKey) {
      return NextResponse.json(
        { error: "Server misconfiguration" },
        { status: 500 }
      );
    }
    const supabase = createClient(supabaseUrl, anonKey, {
      global: { headers: { Cookie: cookieStore.toString() } },
    });

    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { documentId } = await req.json();
    if (!documentId) {
      return NextResponse.json(
        { error: "Missing documentId" },
        { status: 400 }
      );
    }

    // Verify ownership & get metadata
    const { data: doc, error: docErr } = await supabaseAdmin
      .from("documents")
      .select("id,user_id,openai_file_id,file_path")
      .eq("id", documentId)
      .maybeSingle();
    if (docErr) {
      return NextResponse.json({ error: docErr.message }, { status: 500 });
    }
    if (!doc || doc.user_id !== user.id) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    // Delete row first (so UI updates even if storage cleanup happens after)
    const { error: delErr } = await supabaseAdmin
      .from("documents")
      .delete()
      .eq("id", documentId);
    if (delErr) {
      return NextResponse.json({ error: delErr.message }, { status: 500 });
    }

    // Best-effort cleanup (storage + OpenAI). Errors here won't fail the request.
    const cleanupTasks: Promise<any>[] = [];

    // Remove from Supabase Storage
    cleanupTasks.push(
      supabaseAdmin.storage.from("documents").remove([doc.file_path])
    );

    // Remove file from OpenAI (if we know file id)
    if (doc.openai_file_id) {
      cleanupTasks.push(openai.files.delete(doc.openai_file_id));
    }

    // Fire and forget
    Promise.allSettled(cleanupTasks).catch(() => {});

    return NextResponse.json({ ok: true });
  } catch (err: any) {
    return NextResponse.json(
      { error: err?.message ?? "Unknown error" },
      { status: 500 }
    );
  }
}
