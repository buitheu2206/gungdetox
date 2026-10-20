// Model Storage deletion locally; production deletion always uses the Storage API.
import assert from "node:assert/strict";

export const CLEANUP_TOKEN = "test-cleanup-token";

export async function queryAsCleanupService(database, sql, params = []) {
  return database.transaction(async (transaction) => {
    await transaction.exec("set local role service_role");
    return transaction.query(sql, params);
  });
}

export function createCleanupClient(database) {
  const state = { failDelete: false, beforeRemove: null, removeCalls: [] };
  const bucket = {
    async remove(paths) {
      state.removeCalls.push(paths);
      if (state.failDelete) return { data: null, error: new Error("Storage unavailable") };
      if (state.beforeRemove) await state.beforeRemove(paths);
      await database.query("delete from storage.objects where bucket_id='payment-receipts' and name=any($1)", [paths]);
      return { data: paths.map((name) => ({ name })), error: null };
    },
  };
  const client = {
    storage: { from(name) { assert.equal(name, "payment-receipts"); return bucket; } },
    async rpc(name, args) {
      try {
        if (name === "claim_payment_receipt_cleanup") {
          const { rows } = await queryAsCleanupService(database,
            "select public.claim_payment_receipt_cleanup($1) as path", [args.cleanup_token]);
          return { data: rows.map((row) => row.path), error: null };
        }
        assert.equal(name, "complete_payment_receipt_cleanup");
        const { rows } = await queryAsCleanupService(database,
          "select public.complete_payment_receipt_cleanup($1,$2) as completed", [args.cleanup_token, args.receipt_paths]);
        return { data: rows[0].completed, error: null };
      } catch (error) { return { data: null, error }; }
    },
  };
  return { client, state };
}
