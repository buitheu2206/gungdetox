// The database authorizes the scheduler token and retires paths before any Storage deletion.
import type { SupabaseClient } from "@supabase/supabase-js";

const RECEIPT_PATH = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}\/receipt(?:-[0-9a-f]{64})?$/;

export async function handleReceiptCleanup(request: Request, client: SupabaseClient): Promise<Response> {
  if (request.method !== "POST") return new Response("Method not allowed", { status: 405 });
  const token = request.headers.get("x-cleanup-token");
  if (!token) return new Response("Unauthorized", { status: 401 });
  try {
    const { data: paths, error } = await client.rpc("claim_payment_receipt_cleanup", { cleanup_token: token });
    if (error?.code === "28000") return new Response("Unauthorized", { status: 401 });
    if (error) throw error;
    if (!Array.isArray(paths) || paths.some((path) => typeof path !== "string" || !RECEIPT_PATH.test(path))) {
      throw new Error("Database returned invalid receipt cleanup paths.");
    }
    if (!paths.length) return Response.json({ claimed: 0, deleted: 0 });
    // Storage API removes both the object and metadata; SQL-only deletes would leak blobs.
    const { error: deleteError } = await client.storage.from("payment-receipts").remove(paths);
    if (deleteError) throw deleteError;
    const { data: deleted, error: finishError } = await client.rpc("complete_payment_receipt_cleanup", {
      cleanup_token: token, receipt_paths: paths,
    });
    if (finishError) throw finishError;
    if (deleted !== paths.length) throw new Error("Receipt deletion is incomplete; the next scheduled run must retry it.");
    console.info("Receipt cleanup completed", { claimed: paths.length, deleted });
    return Response.json({ claimed: paths.length, deleted });
  } catch (error) {
    console.error("Receipt cleanup failed; retired paths will be retried by the next scheduled run", { error });
    return new Response("Receipt cleanup failed", { status: 502 });
  }
}
