import { readFile } from "node:fs/promises";

// PostgreSQL in memory: emulate only Supabase's auth/storage schema, never contact a project.
export const platformSchema = `
  create role anon;
  create role authenticated;
  create role service_role bypassrls;
  create schema auth;
  create schema storage;
  create schema vault;
  create table vault.decrypted_secrets(name text primary key, decrypted_secret text);
  insert into vault.decrypted_secrets values ('payment_receipt_cleanup_token','test-cleanup-token');
  create table auth.users(id uuid primary key default gen_random_uuid(), email text);
  create function auth.uid() returns uuid language sql stable as
    $$ select nullif(current_setting('request.jwt.claim.sub', true), '')::uuid $$;
  create table storage.buckets(id text primary key, name text, public boolean, file_size_limit bigint, allowed_mime_types text[]);
  create table storage.objects(id uuid primary key default gen_random_uuid(), bucket_id text, name text, metadata jsonb,
    created_at timestamptz not null default now());
  alter table storage.objects enable row level security;
  grant usage on schema public, auth, storage to anon, authenticated;
  grant usage on schema public to service_role;
  grant all on storage.objects to anon, authenticated;
  alter default privileges in schema public grant all on tables to anon, authenticated;
  insert into auth.users(email) values ('buitheu698@gmail.com'), ('chubaohong2206@gmail.com'), ('hoabachhop79@gmail.com');
`;

export const readSql = (path) => readFile(new URL(`../../supabase/${path}`, import.meta.url), "utf8");

