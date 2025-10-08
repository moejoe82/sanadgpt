// SERVER-SIDE ONLY - DO NOT import in browser code!
import { createClient } from "@supabase/supabase-js";

const adminUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!adminUrl || !serviceRoleKey) {
  throw new Error(
    "Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY environment variables"
  );
}

export const supabaseAdmin = createClient(adminUrl, serviceRoleKey, {
  auth: { persistSession: false },
});
