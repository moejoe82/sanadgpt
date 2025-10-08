#!/usr/bin/env node

/**
 * Setup Admin Role Script
 *
 * This script uses the Supabase service role key to bypass RLS
 * and set up the admin role for a user.
 *
 * Usage: node scripts/setupAdmin.js <email>
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

async function setupAdmin(email) {
  try {
    console.log(`🔍 Looking up user: ${email}`);

    // Get user by email
    const { data: users, error: userError } =
      await supabaseAdmin.auth.admin.listUsers();

    if (userError) {
      console.error("❌ Error fetching users:", userError.message);
      return;
    }

    const user = users.users.find((u) => u.email === email);

    if (!user) {
      console.error(`❌ User not found: ${email}`);
      console.log("Available users:");
      users.users.forEach((u) => console.log(`  - ${u.email} (${u.id})`));
      return;
    }

    console.log(`✅ Found user: ${user.email} (${user.id})`);

    // Check if user already has a role
    const { data: existingRole, error: roleError } = await supabaseAdmin
      .from("user_roles")
      .select("role")
      .eq("user_id", user.id)
      .maybeSingle();

    if (roleError) {
      console.error("❌ Error checking existing role:", roleError.message);
      return;
    }

    if (existingRole) {
      console.log(`ℹ️  User already has role: ${existingRole.role}`);
      if (existingRole.role === "admin") {
        console.log("✅ User is already an admin!");
        return;
      }

      // Update existing role to admin
      const { error: updateError } = await supabaseAdmin
        .from("user_roles")
        .update({ role: "admin" })
        .eq("user_id", user.id);

      if (updateError) {
        console.error("❌ Error updating role:", updateError.message);
        return;
      }

      console.log("✅ Updated user role to admin!");
    } else {
      // Insert new admin role
      const { error: insertError } = await supabaseAdmin
        .from("user_roles")
        .insert({
          user_id: user.id,
          role: "admin",
        });

      if (insertError) {
        console.error("❌ Error inserting role:", insertError.message);
        return;
      }

      console.log("✅ Created admin role for user!");
    }

    console.log("\n🎉 Admin setup complete!");
    console.log("You can now login and access admin features.");
  } catch (error) {
    console.error("❌ Unexpected error:", error.message);
  }
}

// Get email from command line arguments
const email = process.argv[2];

if (!email) {
  console.error("❌ Please provide an email address");
  console.log("Usage: node scripts/setupAdmin.js <email>");
  console.log("Example: node scripts/setupAdmin.js admin@diwangpt.com");
  process.exit(1);
}

setupAdmin(email);
