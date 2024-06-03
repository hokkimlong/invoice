import { createClient } from "@refinedev/supabase";

const SUPABASE_URL = "https://gyjoalbfywrqgfdlsfpd.supabase.co";
const SUPABASE_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imd5am9hbGJmeXdycWdmZGxzZnBkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MTcyNjY0NjEsImV4cCI6MjAzMjg0MjQ2MX0.e-p-aIoAwruOHyaqNfbSx80IckVmRQRLDVdEhN0HJPY";

export const supabaseClient = createClient(SUPABASE_URL, SUPABASE_KEY, {
  db: {
    schema: "public",
  },
  auth: {
    persistSession: true,
  },
});
