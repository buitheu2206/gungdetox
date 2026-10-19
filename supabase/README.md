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
6. `defer-order-until-payment.sql` — orders are only created once their payment receipt already exists in storage; the id becomes client-chosen.
7. `flexible-order-lookup.sql` — lookup accepts a code or phone and returns an array of summaries.
8. `migrations/20261019100129_order_lookup_newest_first.sql` — select the newest 20 matches before limiting, with stable ordering for equal timestamps.

Then configure the receipt email webhook and deploy `resend-email` following `functions/resend-email/README.md`. For a fresh database, configure `notify_new_order_email` for INSERT on `orders`, no condition needed — every inserted order already has a confirmed receipt by the time it's written. Keep the webhook secret and API keys in Supabase secrets/Dashboard, outside SQL committed to Git.

## Existing project

Check the migration history and current RPC definitions first. Apply only missing migrations in the numbered order above; do not replay the whole bootstrap against a running database. The receipt and deferred-order migrations contain one-time changes.

For a project already using `flexible-order-lookup.sql`, apply only `migrations/20261019100129_order_lookup_newest_first.sql` in its transaction. It replaces `lookup_order` without changing its parameters, array response, access rules or stored orders. Existing clients remain compatible. Deploy the frontend CSV fix separately; the lookup correction takes effect immediately at the database.

For an older project, coordinate the database, frontend and email deployment. `defer-order-until-payment.sql` renames the creation RPC parameter from `upload_token` to `order_id`, requires an uploaded receipt and removes the old receipt capability table/functions. Clients using the old signature must reload after the new frontend is deployed. The email handler must match the INSERT notification flow. `flexible-order-lookup.sql` changes lookup from a single object/null to an array; deploy a matching frontend rather than treating these versions as interchangeable.

The current lookup accepts either code or phone; supplying both narrows the result. It returns at most 20 summaries, newest first, excluding names, addresses, full UUIDs and receipt paths. Phone-only lookup intentionally exposes purchase summaries to anyone who knows the phone number; the ordering fix does not change that policy. Admin access uses `admin_users`. Price snapshots come from the product table; existing orders retain their saved prices and delivery fields.

Keep `admin_users` and the UUID allowlists in Storage policies synchronized when changing admins. Do not enable writes to `admin_users` from browser roles. Disable open Auth signup in Dashboard if accounts are provisioned only by the shop.

## Verification and rollback

Run `tests/harden-orders.sql` after `defer-order-until-payment.sql` but before flexible lookup: it checks the earlier code-and-phone contract as well as authorization and order writes. After all migrations, run `tests/flexible-order-lookup.sql` for the current contract, including more than 20 matches and timestamp ties. Run these fixture tests on staging; their data rolls back. Receipt/email integration still needs a separate staging smoke test with test recipients.

Automated tests execute the migrations and SQL assertions in PGlite (PostgreSQL in memory), with minimal Auth/Storage schemas. They also check fresh bootstrap, rollback of test fixtures and reapplying the hardening migration. This does not exercise the real Supabase gateway, Storage service, Auth sessions or email webhook; run the SQL checks and integration smoke test on staging before production rollout.

If migration fails, its transaction rolls back. After a successful migration, roll back the client only to a compatible version; do not restore public SELECT/INSERT or broad authenticated policies. Nullable delivery fields can remain in place. Do not restore the old receipt RPC after its supporting table has been removed. Preserve the current receipt contract and restricted policies while repairing the client.

## Credentials and abandoned images

The historical verification scripts now require `VERIFY_ADMIN_PASSWORD`. Use a staging admin account. The old password remains in Git history: rotate it if still active or reused, and revoke existing sessions. This repository change does not rotate live credentials or rewrite history.

Image uploads are cached for retries while an editor remains open. Cancelling/reloading an editor can leave an unreferenced image. `scripts/audit-orphan-images.mjs` lists root-level images older than 24 hours that are not referenced by content rows. Run with `node --experimental-strip-types --env-file=.env.production scripts/audit-orphan-images.mjs` after setting `SUPABASE_SERVICE_ROLE_KEY` for the intended project. It is read-only by default; review candidates, stop editor activity and explicitly add `--delete` to remove them. No cleanup was executed during this change. Do not delete recent uploads or files while editors are actively saving.

## Manual migrations (CLI or MCP)

Database migrations are applied manually using the Supabase CLI or MCP. There is no database deployment workflow in GitHub Actions. CLI `db push` records applied versions and skips them on subsequent runs; it only applies files in `supabase/migrations/`.

For CLI deployment, supply these environment variables locally without committing their values:

- `SUPABASE_ACCESS_TOKEN`: Supabase personal access token.
- `SUPABASE_PROJECT_REF`: the target project's reference.
- `SUPABASE_DB_PASSWORD`: the target database password, not the anon/service-role API key.

The machine running the CLI must be permitted by the project's database network restrictions. Keep the repository Actions secrets `SUPABASE_ACCESS_TOKEN` and `SUPABASE_PROJECT_REF` for email deployment; the remaining workflows do not use `SUPABASE_DB_PASSWORD`.

### One-time setup for the existing project

On 2026-10-19, the six recorded migrations for project `bjenawwpxwivocsmsmzd` were retrieved through MCP into `supabase/migrations/`, preserving their versions, names and SQL (apart from trailing whitespace). Their contents were reviewed for embedded credentials. No remote history or application data was changed. The ordering fix was initially local-only as `20261019110000_order_lookup_newest_first`. MCP subsequently applied it as `20261019100129_order_lookup_newest_first`; the local filename now matches that recorded remote version. The function definition, execution grants and empty/invalid-input behavior were verified through MCP after deployment.

The live database already has the `order_id` creation parameter, no `order_receipt_uploads` table, and the flexible array-returning lookup function. These later changes are not recorded in its migration history. Do not rerun the deferred-order migration or invent historical versions. The imported files reconcile recorded history for deployment to this existing project; they are not a complete fresh-database baseline. Use the numbered bootstrap above for a new project, not `supabase db reset` with this history folder.

For subsequent reconciliation, or a different target project, use the following commands and review the results before deployment:

With the Supabase CLI installed and credentials supplied through environment variables, run:

```sh
supabase link --project-ref "$SUPABASE_PROJECT_REF"
supabase migration list --linked
supabase migration fetch --linked
git diff -- supabase/migrations
supabase db push --linked --dry-run
```

Review every fetched file, including untracked files, before committing the history. Historical webhook SQL can contain secrets: do not commit credentials; reconcile those files deliberately. Fetch retrieves recorded migration statements, not unrecorded SQL Editor changes and not a full schema baseline. Compare the recorded history with the live schema when manual changes are missing. Do not invent applied versions or automatically run `migration repair` to suppress a mismatch.

The ordering fix is `migrations/20261019100129_order_lookup_newest_first.sql`. At the history check above, the project had its required flexible lookup contract but still limited before sorting. Check the current state before applying it. If an equivalent fix was applied manually, reconcile its version rather than assuming the new file is pending. Resolve history mismatches before deployment; do not reset the database or rerun root-level bootstrap scripts. An MCP history comparison does not verify the CLI database connection.

### Subsequent changes and deployment order

Create future changes with `supabase migration new descriptive_name`, edit the generated SQL, and add regression coverage. Keep applied files unchanged; fixes use a new migration. The current in-memory test explicitly loads the ordering migration after the legacy bootstrap. Add new migration files to the tested sequence as they are introduced; it does not automatically test arbitrary SQL files.

Run `npm run check`, then use the CLI to preview and apply reviewed migrations:

```sh
supabase link --project-ref "$SUPABASE_PROJECT_REF"
supabase migration list --linked
supabase db push --linked --dry-run
# Review the pending versions before running this command.
supabase db push --linked
supabase migration list --linked
```

A dry-run checks the pending list; it does not execute SQL to prove it will succeed. Alternatively, use the authenticated Supabase MCP connection to inspect migration history and the live schema, then apply only the reviewed pending SQL with its migration tool. Verify the resulting history and schema afterward. If MCP assigns a different version, reconcile the local filename with the recorded remote version before using CLI deployment again; do not apply the same SQL twice.

Website and email workflows remain independent. For changes requiring a new schema, deploy a backward-compatible database migration before merging the dependent frontend/email change. Pushing all changes together does not guarantee the database runs first. The current CSV fix is independent of the lookup ordering migration.

References: [Supabase CI/CD](https://supabase.com/docs/guides/deployment/managing-environments), [migration commands](https://supabase.com/docs/reference/cli/supabase-migration-list).
