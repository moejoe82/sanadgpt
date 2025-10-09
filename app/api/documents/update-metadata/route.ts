export const runtime = "nodejs";

import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createClient } from "@supabase/supabase-js";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

export async function POST(req: NextRequest) {
  try {
    // Auth: get user from Supabase session cookies
    const cookieStore = await cookies();
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

    const { documentId, title, emirateScope, authorityName } = await req.json();

    if (!documentId) {
      return NextResponse.json(
        { error: "Missing documentId" },
        { status: 400 }
      );
    }

    // Verify ownership & get metadata
    const { data: doc, error: docErr } = await supabaseAdmin
      .from("documents")
      .select("id,user_id")
      .eq("id", documentId)
      .maybeSingle();

    if (docErr) {
      return NextResponse.json({ error: docErr.message }, { status: 500 });
    }

    if (!doc || doc.user_id !== user.id) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    // Update document metadata
    const updateData: any = {};
    if (title !== undefined) updateData.title = title;
    if (emirateScope !== undefined) updateData.emirate_scope = emirateScope;
    if (authorityName !== undefined) updateData.authority_name = authorityName;

    const { error: updateErr } = await supabaseAdmin
      .from("documents")
      .update(updateData)
      .eq("id", documentId);

    if (updateErr) {
      return NextResponse.json({ error: updateErr.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
