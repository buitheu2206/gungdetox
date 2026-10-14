import assert from "node:assert/strict";
import { test } from "node:test";
import { saveOrderPayment } from "../src/lib/order-payment.ts";

const ORDER_ID = "abcdef00-0000-4000-8000-000000000001";

function paymentClient(result = { data: { id: ORDER_ID }, error: null }) {
  const calls = [];
  const query = {
    update(value) { calls.push(["update", value]); return query; },
    eq(...args) { calls.push(["eq", ...args]); return query; },
    select(...args) { calls.push(["select", ...args]); return query; },
    async single() { return result; },
  };
  return { calls, from(table) { assert.equal(table, "orders"); return query; } };
}

test("should confirm or undo payment on the selected order without changing status or history", async () => {
  for (const paid of [true, false]) {
    const client = paymentClient();
    assert.deepEqual(await saveOrderPayment(client, ORDER_ID, paid), { paid });
    assert.deepEqual(client.calls, [["update", { paid }], ["eq", "id", ORDER_ID], ["select", "id"]]);
  }
});

test("should reject invalid payment input before making a request", async () => {
  const client = paymentClient();
  for (const [id, paid] of [["", true], [null, true], [ORDER_ID, "true"], [ORDER_ID, null]]) {
    await assert.rejects(saveOrderPayment(client, id, paid), /không hợp lệ/);
  }
  assert.equal(client.calls.length, 0);
});

test("should report rejected or missing orders instead of confirming payment", async () => {
  for (const result of [{ data: null, error: new Error("access denied") }, { data: null, error: null }]) {
    await assert.rejects(saveOrderPayment(paymentClient(result), ORDER_ID, true), /Không cập nhật được thanh toán/);
  }
  const client = paymentClient();
  client.from = () => { throw new Error("network failed"); };
  await assert.rejects(saveOrderPayment(client, ORDER_ID, true), /Không cập nhật được thanh toán/);
});
