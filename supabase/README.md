# Database setup and audit fixes

Use a staging Supabase project first. No SQL file here should be run automatically against production.
Create the three approved admin accounts in Auth before the storage/receipt migrations; the scripts fail closed if the accounts are missing. Never commit their passwords.

## Fresh project

Run these files in order in the SQL Editor, with transaction rollback on any error:

1. `schema.sql` — tables and closed write policies.
2. `secure-storage-policies.sql` — UUID-based storage administration.
3. `payment-receipts.sql` — private receipt bucket and order creation capability.
4. `payment-receipt-confirmation.sql` — receipt confirmation. An empty new database may skip converting the old email trigger.
5. `harden-orders.sql` — admin allowlist, protected order table, customer lookup RPC and structured delivery fields.

Then configure the receipt email webhook and deploy `resend-email` following `functions/resend-email/README.md`. For a fresh database, configure `notify_order_receipt_email` for UPDATE on `orders`, with the condition `OLD.payment_receipt_submitted_at IS NULL AND NEW.payment_receipt_submitted_at IS NOT NULL`. Do not configure an INSERT webhook. Keep the webhook secret and API keys in Supabase secrets/Dashboard, outside SQL committed to Git.

## Existing project

Apply only `harden-orders.sql` in one transaction after the previously deployed receipt migrations. It preserves existing rows, adds nullable delivery fields and retains the existing receipt RPC signature. Its price snapshots come from the product table, not prices supplied by a browser. Legacy rows retain their original prices and readable delivery notes.

Deploy the frontend and email function after the migration. Old clients can still create orders through the existing RPC, but phone-only lookup stops working as soon as permissions are restricted. New clients use `lookup_order(code, phone)`; the response excludes contact details, database UUIDs and receipt capabilities. Admin access is determined by `admin_users`, not by the presence of an Auth session.

Keep `admin_users` and the UUID allowlists in Storage policies synchronized when changing admins. Do not enable writes to `admin_users` from browser roles. Disable open Auth signup in Dashboard if accounts are provisioned only by the shop.

## Verification and rollback

Run `tests/harden-orders.sql` on staging after migration. It checks anon access, unapproved users, approved admins, matching lookup credentials, item validation, server-side price snapshots and stale status updates. Fixtures roll back. The receipt/email integration still needs a separate staging smoke test with test recipients.

Automated tests execute the migrations and SQL assertions in PGlite (PostgreSQL in memory), with minimal Auth/Storage schemas. They also check fresh bootstrap, rollback of test fixtures and reapplying the hardening migration. This does not exercise the real Supabase gateway, Storage service, Auth sessions or email webhook; run the SQL checks and integration smoke test on staging before production rollout.

If migration fails, its transaction rolls back. After a successful migration, roll back the client only to a compatible version; do not restore public SELECT/INSERT or broad authenticated policies. Nullable delivery fields can remain in place. If needed, keep order creation on the previous receipt RPC while repairing the new client; preserve the restricted policies and exact lookup RPC.

## Credentials and abandoned images

The historical verification scripts now require `VERIFY_ADMIN_PASSWORD`. Use a staging admin account. The old password remains in Git history: rotate it if still active or reused, and revoke existing sessions. This repository change does not rotate live credentials or rewrite history.

Image uploads are cached for retries while an editor remains open. Cancelling/reloading an editor can leave an unreferenced image. `scripts/audit-orphan-images.mjs` lists root-level images older than 24 hours that are not referenced by content rows. Run with `node --experimental-strip-types --env-file=.env.production scripts/audit-orphan-images.mjs` after setting `SUPABASE_SERVICE_ROLE_KEY` for the intended project. It is read-only by default; review candidates, stop editor activity and explicitly add `--delete` to remove them. No cleanup was executed during this change. Do not delete recent uploads or files while editors are actively saving.
