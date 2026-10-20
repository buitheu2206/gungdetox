// Integrate the real checkout helpers, SQL/RLS and email handler without external services.
import assert from "node:assert/strict";
import { PGlite } from "@electric-sql/pglite";
import { platformSchema, readSql } from "./database.mjs";

export async function createCheckoutDatabase() {
  const database = new PGlite();
  try {
    await database.exec(platformSchema);
    for (const file of ["schema.sql", "secure-storage-policies.sql", "payment-receipts.sql"]) {
      await database.exec(await readSql(file));
    }
    await database.exec(`
      create schema net;
      create table net.http_request_queue(id bigint generated always as identity, payload jsonb);
      create function public.test_queue_email() returns trigger language plpgsql security definer as
        $$ begin insert into net.http_request_queue(payload) values (
          jsonb_build_object('type', TG_OP, 'schema', TG_TABLE_SCHEMA, 'table', TG_TABLE_NAME,
            'record', to_jsonb(NEW), 'old_record', null)); return NEW; end $$;
      create trigger notify_new_order_email after insert on public.orders
        for each row execute function public.test_queue_email();
      create unique index on storage.objects(bucket_id, name);
    `);
    for (const file of ["payment-receipt-confirmation.sql", "harden-orders.sql", "defer-order-until-payment.sql"]) {
      await database.exec(await readSql(file));
    }
    await database.exec(await readSql("migrations/20261020021257_version_payment_receipts.sql"));
    await database.exec(await readSql("migrations/20261020032123_cleanup_receipts_and_validate_retries.sql"));
    await database.exec(`insert into public.products(slug,type,name,price_retail,in_stock) values
      ('ginger-shot','single','Ginger shot',42000,true), ('sold-out','single','Sold out',42000,false);`);
    return database;
  } catch (error) {
    await database.close();
    throw error;
  }
}

export async function queryAsCustomer(database, sql, params = []) {
  return database.transaction(async (transaction) => {
    await transaction.exec("set local role anon");
    return transaction.query(sql, params);
  });
}

function productsQuery(database) {
  const query = {
    select() { return query; },
    eq(column, value) { assert.equal(column, "in_stock"); query.available = value; return query; },
    async order(column) {
      assert.equal(column, "sort_order");
      const { rows } = await queryAsCustomer(database,
        "select products.*,price::float8,price_retail::float8 from public.products where in_stock=$1 order by sort_order", [query.available]);
      return { data: rows, error: null };
    },
    async in(column, slugs) {
      assert.equal(column, "slug");
      const { rows } = await queryAsCustomer(database, "select * from public.products where slug=any($1)", [slugs]);
      return { data: rows, error: null };
    },
  };
  return query;
}

export function createCheckoutClient(database) {
  const state = { uploadFailure: false, createFailure: false, loseUploadResponse: false, loseOrderResponse: false, files: new Map(), calls: [] };
  async function upload(path, file, options) {
    state.calls.push("upload");
    assert.equal(options.upsert, false);
    if (state.uploadFailure) return { error: new Error("Storage unavailable") };
    try {
      await queryAsCustomer(database, "insert into storage.objects(bucket_id,name) values ('payment-receipts',$1)", [path]);
      state.files.set(path, await file.text());
      return { error: state.loseUploadResponse ? new Error("Upload response lost") : null };
    } catch (error) { return { error }; }
  }
  async function rpcResult(name, args) {
    state.calls.push(name);
    try {
      if (name === "is_payment_receipt_retired") {
        const { rows } = await queryAsCustomer(database, "select public.is_payment_receipt_retired($1) as retired", [args.receipt_path]);
        return { data: rows[0].retired, error: null };
      }
      if (name === "has_payment_receipt") {
        const { rows } = await queryAsCustomer(database, "select public.has_payment_receipt($1,$2) as uploaded", [args.order_id, args.receipt_path]);
        return { data: rows[0].uploaded, error: null };
      }
      assert.equal(name, "create_order_with_receipt");
      if (state.createFailure) throw new Error("Database temporarily unavailable");
      const { rows } = await queryAsCustomer(database, "select * from public.create_order_with_receipt($1::jsonb,$2::uuid)",
        [JSON.stringify(args.order_data), args.order_id]);
      return { data: state.loseOrderResponse ? null : rows[0], error: state.loseOrderResponse ? new Error("Order response lost") : null };
    } catch (error) {
      return { data: null, error: { message: error.message, code: error.code, details: error.detail ?? null } };
    }
  }
  const client = {
    from(table) { assert.equal(table, "products"); return productsQuery(database); },
    storage: { from(bucket) { assert.equal(bucket, "payment-receipts"); return { upload }; } },
    rpc(name, args) {
      return ["has_payment_receipt", "is_payment_receipt_retired"].includes(name) ? rpcResult(name, args) : { single: () => rpcResult(name, args) };
    },
  };
  return { client, state };
}
