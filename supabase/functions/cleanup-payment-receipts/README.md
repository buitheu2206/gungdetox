# Scheduled payment receipt cleanup

The function runs hourly at minute 17 through Supabase Cron and deletes at most 100 unreferenced receipts older than 24 hours per run. It handles both abandoned checkouts and image versions replaced before an order was created. It preserves the exact path saved on an order and the legacy `{order_id}/receipt` fallback. Product/blog images are outside its scope.

## Safety and retries

`claim_payment_receipt_cleanup` and `create_order_with_receipt` acquire the same transaction advisory lock for each order UUID. Collection rechecks references after locking and permanently records retired names before the Storage API deletes anything. Creation and anonymous uploads reject retired names. The browser chooses a fresh version when a previously selected path was retired, keeping the same UUID and transfer code.

Retired names remain as small database records after deletion. Do not prune them or allow those names to be reused: overlapping runs and delayed Storage requests may still target them. Failed deletes stay pending for the next hourly run. The function removes the actual files through `storage.remove`; SQL only records progress. Do not delete rows from `storage.objects` directly.

Customer creation must go through the coordinated RPC. Manual service-role writes to order receipt paths or Storage can bypass that protocol and should not run concurrently with cleanup.

## Deployment

1. Apply `migrations/20261020032123_cleanup_receipts_and_validate_retries.sql` after the receipt-version migration.
2. Deploy `cleanup-payment-receipts` with its `deno.json` and `verify_jwt = false`. The function authenticates its scheduler through the privileged claim RPC, which verifies `x-cleanup-token` against Vault. Anonymous and authenticated browser roles cannot call the cleanup RPCs.
3. In Supabase Vault, create `payment_receipt_cleanup_url` containing the target project's base URL, such as `https://YOUR_PROJECT_REF.supabase.co`. This configuration is project-specific; do not copy another project's URL.
4. Apply `migrations/20261020032141_schedule_payment_receipt_cleanup.sql`. It generates a private scheduler token in Vault and schedules the HTTP call. No secret value is committed to Git or included in the cron SQL text.
5. Deploy the frontend so stale checkouts can choose a fresh receipt version and changed-data retries show the explicit existing-order notice.

The Edge runtime provides `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY`; no new GitHub Actions secret or workflow is required. Keep the scheduler token private. To rotate it, update the named Vault secret; the claim RPC and scheduled HTTP call both read the current value.

On 2026-10-20, MCP applied migrations `20261020032123_cleanup_receipts_and_validate_retries` and `20261020032141_schedule_payment_receipt_cleanup` to project `bjenawwpxwivocsmsmzd`, deployed version 1 of the function and enabled the hourly schedule. A hosted invocation returned HTTP 200 with zero claimed/deleted files; an invocation without a token returned HTTP 401. The bucket was empty, so no real receipt was deleted and actual blob deletion was not exercised. No test order or email was generated. Frontend changes still require deployment separately.

Check Edge Function logs and `net._http_response` for HTTP outcomes. A successful cron SQL run only confirms the HTTP request was queued. To pause collection without interrupting checkout, set `active = false` for the `cleanup-payment-receipts` job in Supabase Cron. Keep the database coordination and retired-name records when pausing or rolling back the function.

## Verification

`tests/receipt-cleanup.test.mjs` uses PGlite and a Storage adapter to test reference preservation, the 24-hour boundary, bounded batches, failed deletes, public-access denial, stale checkout recovery, and both creation/collection interleavings. It also verifies changed customer fields are rejected on retries while admin status and catalog price changes do not break identical retries. These tests do not replace a hosted Storage smoke test or a real concurrent PostgreSQL session test.
