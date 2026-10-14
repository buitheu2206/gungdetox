// UI gates mirror the database allowlist; RLS remains the authorization boundary.
import type { SupabaseClient } from "@supabase/supabase-js";

export async function hasAdminAccess(client: SupabaseClient): Promise<boolean> {
  const { data, error } = await client.rpc("is_admin");
  if (error) throw new Error("Không xác minh được quyền quản trị. Vui lòng thử lại.", { cause: error });
  return data === true;
}
