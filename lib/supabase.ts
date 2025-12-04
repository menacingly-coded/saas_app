import { createClient, SupabaseClient } from "@supabase/supabase-js";
import { auth } from "@clerk/nextjs/server";

let supabaseClient: SupabaseClient | null = null;

export const createSupabaseClient = async () => {
  if (supabaseClient) return supabaseClient;

  // Default headers for client-side (no token)
  let headers: Record<string, string> = {};

  // Server-side: inject Clerk JWT if available
  if (typeof window === "undefined") {
    const token = await auth().getToken({ template: "supabase" });
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }
  }

  supabaseClient = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { global: { headers } }
  );

  return supabaseClient;
};
