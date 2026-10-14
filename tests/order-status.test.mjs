import assert from "node:assert/strict";
import { test } from "node:test";
import { saveOrderStatus } from "../src/lib/order-status.ts";

function statusClient(result = { data: { id: "order-id" }, error: null }) {
  const calls = [];
  const query = {
    update(value) { calls.push(["update", value]); return query; },
    eq(...args) { calls.push(["eq", ...args]); return query; },
    select(...args) { calls.push(["select", ...args]); return query; },
    async single() { return result; },
  };
  return { calls, from(table) { assert.equal(table, "orders"); return query; } };
}

test("should save the selected order status and append history without changing payment", async () => {
  const client = statusClient();
  const order = { id: "order-id", status: "processing", status_history: [{ status: "processing", at: "2026-10-13T00:00:00Z" }], paid: false };
  const update = await saveOrderStatus(client, order, "delivering");
  assert.equal(update.status, "delivering");
  assert.deepEqual(update.status_history[0], order.status_history[0]);
  assert.equal(update.status_history[1].status, "delivering");
  assert.ok(Number.isFinite(Date.parse(update.status_history[1].at)));
  assert.deepEqual(client.calls[1], ["eq", "id", "order-id"]);
  assert.equal("paid" in client.calls[0][1], false);
  assert.equal(order.status, "processing");
});

test("should support delivered and cancelled states on legacy orders without history", async () => {
  for (const status of ["delivered", "cancelled"]) {
    const update = await saveOrderStatus(statusClient(), { id: "order-id", status: "processing", status_history: null }, status);
    assert.equal(update.status, status);
    assert.equal(update.status_history.length, 1);
  }
});

test("should reject invalid statuses and avoid duplicate history for an unchanged status", async () => {
  const client = statusClient();
  const order = { id: "order-id", status: "processing", status_history: [] };
  await assert.rejects(saveOrderStatus(client, order, "__proto__"), /không hợp lệ/);
  assert.deepEqual(await saveOrderStatus(client, order, "processing"), { status: "processing", status_history: [] });
  assert.equal(client.calls.length, 0);
});

test("should report denied or missing orders instead of claiming the status was saved", async () => {
  for (const result of [{ data: null, error: new Error("access denied") }, { data: null, error: null }]) {
    const order = { id: "order-id", status: "processing", status_history: [] };
    await assert.rejects(saveOrderStatus(statusClient(result), order, "delivering"), /Không cập nhật được/);
    assert.equal(order.status, "processing");
    assert.equal(order.status_history.length, 0);
  }
});
