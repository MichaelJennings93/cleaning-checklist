const { test } = require("node:test");
const assert = require("node:assert/strict");
global.CleanCore = require("../core.js");
const CloudClient = require("../cloud.js");
function fixture() {
  const db = new Map(), remote = new Map(), updates = [];
  let fail = false;
  const store = { get: (k, d) => db.has(k) ? JSON.parse(db.get(k)) : structuredClone(d), set: (k, v) => db.set(k, JSON.stringify(v)) };
  const state = date => ({ date, ticks: Object.values(remote.get(date) || {}) });
  const client = new CloudClient({
    store, base: "https://example.test", ids: ["0-0", "0-1"], onUpdate: t => updates.push(t), onStatus: () => {},
    fetcher: async (url, options = {}) => {
      if (fail) throw new Error("offline");
      if (url.endsWith("/api/session")) return { ok: true, json: async () => ({ token: "test-session" }) };
      if (url.includes("/api/visit")) return { ok: true, json: async () => state(new URL(url).searchParams.get("date")) };
      if (url.endsWith("/api/ticks")) {
        const { date, changes } = JSON.parse(options.body), records = remote.get(date) || {};
        for (const m of changes) if (!records[m.id] || records[m.id].t <= m.t) records[m.id] = m;
        remote.set(date, records);
        return { ok: true, json: async () => state(date) };
      }
      if (url.endsWith("/api/report")) return { ok: true, json: async () => ({ saved: true }) };
      throw new Error("Unexpected request: " + url);
    }
  });
  return { client, store, updates, remote, setFailure: value => { fail = value; } };
}
const settled = () => new Promise(resolve => setImmediate(resolve));
test("cloud tick is saved immediately and another client sees it on refresh", async () => {
  const f = fixture(); f.client.connect("2026-11-02"); await settled();
  f.client.set("0-0", true); await f.client.flush();
  assert.equal(f.remote.get("2026-11-02")["0-0"].on, true);
  assert.deepEqual(f.client.pending(), {});
  f.remote.get("2026-11-02")["0-1"] = { id: "0-1", on: true, t: Date.now() };
  await f.client.poll();
  assert.equal(f.client.ticks()["0-1"], true);
});
test("cloud failures retain ticks and retry after reconnecting", async () => {
  const f = fixture(); f.setFailure(true); f.client.connect("2026-11-02"); await settled();
  f.client.set("0-0", true); await f.client.flush();
  assert.equal(f.client.pending()["2026-11-02"]["0-0"].on, true);
  await assert.rejects(f.client.saveReport({ id: "example-request-id", date: "2026-11-02", notes: "", supplies: [] }), /waiting to sync/);
  f.setFailure(false); await f.client.poll();
  assert.deepEqual(f.client.pending(), {});
  assert.equal(f.remote.get("2026-11-02")["0-0"].on, true);
});
test("cloud date switching isolates progress", async () => {
  const f = fixture(); f.client.connect("2026-11-02"); await settled();
  f.client.set("0-0", true); await f.client.flush();
  f.client.connect("2026-11-05"); await settled();
  assert.deepEqual(f.client.ticks(), {});
  f.client.set("0-1", true); await f.client.flush();
  assert.equal(f.remote.get("2026-11-02")["0-0"].on, true);
  assert.equal(f.remote.get("2026-11-05")["0-1"].on, true);
});
test("legacy checked tasks migrate without overriding newer shared unchecks", async () => {
  const f = fixture();
  f.store.set("ticks-2026-11-02", { "0-0": true });
  f.remote.set("2026-11-02", { "0-0": { id: "0-0", on: false, t: 100 } });
  f.client.connect("2026-11-02"); await settled();
  assert.equal(f.client.ticks()["0-0"], undefined);
  assert.deepEqual(f.client.pending(), {});
});
test("a delayed response from another date never replaces the visible date", async () => {
  const f = fixture(); f.client.date = "2026-11-05";
  f.client.merge({ date: "2026-11-02", ticks: [{ id: "0-0", on: true, t: 100 }] });
  assert.deepEqual(f.client.ticks(), {});
  assert.equal(f.updates.length, 0);
  assert.equal(f.client.ticks("2026-11-02")["0-0"], true);
});
test("offline save cannot claim that a report was saved", async () => {
  const f = fixture(); f.client.online = () => false;
  await assert.rejects(f.client.saveReport({ date: "2026-11-02" }), /offline/);
});
