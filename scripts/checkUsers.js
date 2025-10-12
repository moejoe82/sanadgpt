require("dotenv").config({ path: ".env.local" });
const { createClient } = require("@supabase/supabase-js");

// Initialize clients
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error("Missing required environment variables");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkUsers() {
  try {
    console.log("🔍 Checking users in the database...\n");

    // Get all users from auth.users
    const { data: authUsers, error: authError } = await supabase.auth.admin.listUsers();
    
    if (authError) {
      console.error("❌ Error fetching auth users:", authError);
      return;
    }

    console.log(`👥 Found ${authUsers.users.length} users in auth.users:`);
    authUsers.users.forEach((user, index) => {
      console.log(`   ${index + 1}. ID: ${user.id}`);
      console.log(`      Email: ${user.email}`);
      console.log(`      Created: ${new Date(user.created_at).toLocaleString("en-US")}`);
      console.log(`      Last Sign In: ${user.last_sign_in_at ? new Date(user.last_sign_in_at).toLocaleString("en-US") : 'Never'}`);
      console.log("");
    });

    // Check if there are any user_roles entries
    const { data: userRoles, error: rolesError } = await supabase
      .from("user_roles")
      .select("user_id, role, created_at");

    if (rolesError) {
      console.error("❌ Error fetching user roles:", rolesError);
    } else {
      console.log(`🔐 Found ${userRoles.length} user roles:`);
      userRoles.forEach((role, index) => {
        console.log(`   ${index + 1}. User ID: ${role.user_id}`);
        console.log(`      Role: ${role.role}`);
        console.log(`      Created: ${new Date(role.created_at).toLocaleString("en-US")}`);
        console.log("");
      });
    }

    // Check documents table for user references
    const { data: documents, error: docsError } = await supabase
      .from("documents")
      .select("user_id")
      .limit(10);

    if (docsError) {
      console.error("❌ Error fetching documents:", docsError);
    } else {
      const uniqueUserIds = [...new Set(documents.map(d => d.user_id))];
      console.log(`📄 Found ${uniqueUserIds.length} unique user IDs in documents table:`);
      uniqueUserIds.forEach((userId, index) => {
        console.log(`   ${index + 1}. ${userId}`);
      });
    }

  } catch (error) {
    console.error("💥 Script failed:", error);
  }
}

// Run the script
checkUsers();
