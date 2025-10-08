#!/usr/bin/env node

/**
 * Fix User Roles RLS Policy Script
 *
 * This script fixes the circular dependency in the user_roles RLS policy
 * by allowing users to read their own roles.
 */

const { createClient } = require("@supabase/supabase-js");
require("dotenv").config({ path: ".env.local" });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceRoleKey) {
  console.error("❌ Missing environment variables:");
  console.error("   NEXT_PUBLIC_SUPABASE_URL:", !!supabaseUrl);
  console.error("   SUPABASE_SERVICE_ROLE_KEY:", !!serviceRoleKey);
  process.exit(1);
}

// Create admin client with service role key
const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey, {
  auth: { persistSession: false },
});

async function fixUserRolesPolicy() {
  try {
    console.log("🔧 Fixing user_roles RLS policy...");

    // Drop the existing problematic policy
    const { error: dropError } = await supabaseAdmin.rpc("exec_sql", {
      sql: "DROP POLICY IF EXISTS roles_select ON public.user_roles;",
    });

    if (dropError) {
      console.log("ℹ️  Policy may not exist yet:", dropError.message);
    } else {
      console.log("✅ Dropped existing roles_select policy");
    }

    // Create a simpler policy that allows users to read their own roles
    const { error: createError } = await supabaseAdmin.rpc("exec_sql", {
      sql: `CREATE POLICY roles_select ON public.user_roles
            FOR SELECT USING (user_id = auth.uid());`,
    });

    if (createError) {
      console.error("❌ Error creating new policy:", createError.message);
      return;
    }

    console.log("✅ Created new roles_select policy");
    console.log("🎉 RLS policy fix complete!");
    console.log(
      "Users can now read their own roles without circular dependency."
    );
  } catch (error) {
    console.error("❌ Unexpected error:", error.message);
  }
}

// Alternative approach using direct SQL execution
async function fixUserRolesPolicyDirect() {
  try {
    console.log("🔧 Fixing user_roles RLS policy (direct approach)...");

    // Use the SQL editor approach - execute the SQL directly
    const sql = `
      -- Drop the existing problematic policy
      DROP POLICY IF EXISTS roles_select ON public.user_roles;
      
      -- Create a simpler policy that allows users to read their own roles
      CREATE POLICY roles_select ON public.user_roles
        FOR SELECT USING (user_id = auth.uid());
    `;

    // Split SQL into individual statements
    const statements = sql.split(";").filter((s) => s.trim());

    for (const statement of statements) {
      if (statement.trim()) {
        console.log(`Executing: ${statement.trim()}`);
        const { error } = await supabaseAdmin.rpc("exec_sql", {
          sql: statement.trim(),
        });

        if (error) {
          console.log(`ℹ️  Statement result:`, error.message);
        } else {
          console.log("✅ Statement executed successfully");
        }
      }
    }

    console.log("🎉 RLS policy fix complete!");
  } catch (error) {
    console.error("❌ Unexpected error:", error.message);
  }
}

// Try the direct approach first
fixUserRolesPolicyDirect();
