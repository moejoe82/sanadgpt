const { createClient } = require("@supabase/supabase-js");

// Initialize Supabase admin client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error("Missing required environment variables");
  console.log("Make sure NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are set");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function createAdminUser() {
  try {
    console.log("🔐 Creating admin user...");
    
    const adminEmail = "admin@diwangpt.com";
    const adminPassword = "admin123456"; // Change this in production!
    
    // Create user in Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email: adminEmail,
      password: adminPassword,
      email_confirm: true, // Auto-confirm email
    });

    if (authError) {
      if (authError.message.includes("already registered")) {
        console.log("✅ Admin user already exists");
        return;
      }
      throw authError;
    }

    console.log("✅ Admin user created successfully!");
    console.log(`📧 Email: ${adminEmail}`);
    console.log(`🔑 Password: ${adminPassword}`);
    console.log(`🆔 User ID: ${authData.user.id}`);
    
    // Create user role entry (optional - the dashboard checks email as fallback)
    try {
      const { error: roleError } = await supabase
        .from("user_roles")
        .insert({
          user_id: authData.user.id,
          role: "admin",
          created_at: new Date().toISOString(),
        });

      if (roleError) {
        console.log("⚠️  Could not create role entry (table might not exist):", roleError.message);
        console.log("✅ Admin access will work via email-based detection");
      } else {
        console.log("✅ Admin role assigned successfully");
      }
    } catch (roleErr) {
      console.log("⚠️  Role table doesn't exist, using email-based admin detection");
    }

    console.log("\n🎉 Admin setup complete!");
    console.log("You can now login with:");
    console.log(`Email: ${adminEmail}`);
    console.log(`Password: ${adminPassword}`);
    
  } catch (error) {
    console.error("❌ Error creating admin user:", error.message);
  }
}

// Run the script
createAdminUser();
