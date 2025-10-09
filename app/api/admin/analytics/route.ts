export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

export async function GET() {
  try {
    // Load documents
    const { data: docs } = await supabaseAdmin
      .from("documents")
      .select("*")
      .order("uploaded_at", { ascending: false });

    // Load users (simplified - in real app you'd have a users table)
    const { data: authUsers } = await supabaseAdmin.auth.admin.listUsers();

    // Map Supabase users to our User interface, filtering out users without emails
    const mappedUsers = (authUsers?.users || [])
      .filter((user: any) => user.email) // Filter out users without email
      .map((user: any) => ({
        id: user.id,
        email: user.email!, // We know email exists due to filter above
        created_at: user.created_at,
        last_sign_in_at: user.last_sign_in_at,
      }));

    const docsByStatus = (docs || []).reduce((acc, doc) => {
      acc[doc.status] = (acc[doc.status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const analytics = {
      totalDocuments: (docs || []).length,
      totalUsers: mappedUsers.length,
      documentsByStatus: docsByStatus,
      recentUploads: (docs || []).slice(0, 5),
      activeUsers: mappedUsers.slice(0, 5),
    };

    return NextResponse.json({
      analytics,
      documents: docs || [],
      users: mappedUsers,
    });
  } catch (error) {
    console.error("Error loading analytics:", error);
    return NextResponse.json(
      { error: "Failed to load analytics" },
      { status: 500 }
    );
  }
}
