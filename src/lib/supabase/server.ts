import { createClient } from "@supabase/supabase-js";
import { env } from "@/lib/env";

// Server client — uses service role key for worker/API routes
export function createServerClient() {
  return createClient(
    env.NEXT_PUBLIC_SUPABASE_URL,
    env.SUPABASE_SERVICE_ROLE_KEY
  );
}
