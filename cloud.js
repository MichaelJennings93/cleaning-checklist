/* Shared, durable visits. The UI polls while visible; each tick is saved immediately. */
class CloudClient extends CleanCore.SyncClient {
  constructor(options) {
    super(options);
    this.base = options.base;
    this.token = this.store.get("azure-session", "");
    this.polling = false;
    this.flushing = null;
    this.closed = false;
  }
  async session() {
    if (this.token) return this.token;
    if (!this.sessionRequest) this.sessionRequest = (async () => {
      const response = await this.fetcher(this.base + "/api/session", { signal: AbortSignal.timeout(10000) });
      if (!response.ok) throw new Error("Cannot connect right now. Please try again.");
      const result = await response.json();
      this.token = result.token;
      this.store.set("azure-session", this.token);
      return this.token;
    })().finally(() => { this.sessionRequest = null; });
    return this.sessionRequest;
  }
  async request(path, body, retry = true) {
    const token = await this.session();
    const response = await this.fetcher(this.base + path, {
      method: body ? "POST" : "GET",
      headers: { Authorization: "Bearer " + token, ...(body ? { "Content-Type": "application/json" } : {}) },
      ...(body ? { body: JSON.stringify(body) } : {}), signal: AbortSignal.timeout(12000)
    });
    if (response.status === 401 && retry) {
      this.token = ""; this.store.set("azure-session", "");
      return this.request(path, body, false);
    }
    const result = await response.json();
    if (!response.ok) throw Object.assign(new Error(result.error || "Could not save right now. Please try again."), { status: response.status, result });
    return result;
  }
  connect(date) {
    this.closed = false; this.date = date; this.connected = false;
    // Import old device-only ticks without overwriting newer shared records.
    if (!this.store.get("cloud-migrated-" + date, false)) {
      const ticks = this.ticks(date), pending = this.pending(), times = this.store.get("tick-times-" + date, {});
      for (const id of Object.keys(ticks)) if (this.ids.has(id) && ticks[id] && !pending[date]?.[id]) {
        (pending[date] ||= {})[id] = { id, on: true, t: 1 };
        times[id] = 1;
      }
      this.store.set("tick-times-" + date, times);
      this.store.set("clean-outbox", pending);
      this.store.set("cloud-migrated-" + date, true);
    }
    this.onUpdate(this.ticks()); this.status(); this.poll();
  }
  async flush() {
    if (this.flushing) return this.flushing;
    if (!this.online()) { this.status(); return; }
    this.flushing = (async () => {
      for (const [date, entries] of Object.entries(this.pending())) {
        if (!CleanCore.fromKey(date)) continue;
        const changes = Object.values(entries).filter(m => this.ids.has(m.id));
        if (!changes.length) continue;
        try {
          const result = await this.request("/api/ticks", { date, changes });
          const pending = this.pending();
          for (const m of changes) if (pending[date]?.[m.id]?.t === m.t) delete pending[date][m.id];
          if (pending[date] && !Object.keys(pending[date]).length) delete pending[date];
          this.store.set("clean-outbox", pending);
          this.merge(result);
          this.connected = true;
        } catch { this.connected = false; }
      }
    })().finally(() => { this.flushing = null; this.status(); });
    return this.flushing;
  }
  merge(result) {
    const date = result.date, times = this.store.get("tick-times-" + date, {}), ticks = this.ticks(date);
    for (const m of result.ticks || []) {
      if (!this.ids.has(m.id) || typeof m.on !== "boolean" || !Number.isFinite(m.t) || (times[m.id] || 0) > m.t) continue;
      times[m.id] = m.t;
      if (m.on) ticks[m.id] = true; else delete ticks[m.id];
    }
    this.store.set("ticks-" + date, ticks);
    this.store.set("tick-times-" + date, times);
    if (this.date === date) this.onUpdate(ticks);
  }
  async poll() {
    if (this.polling || this.closed || !this.date) return;
    if (!this.online()) { this.connected = false; this.status(); return; }
    this.polling = true;
    const date = this.date;
    try {
      await this.flush();
      const result = await this.request("/api/visit?date=" + date);
      this.merge(result); this.connected = true;
    } catch { this.connected = false; }
    finally {
      this.polling = false; this.status();
      if (date !== this.date) this.poll();
    }
  }
  async saveReport({ id, date, notes, supplies }) {
    if (!this.online()) throw new Error("You’re offline. Progress is kept on this phone. Reconnect to save the shared report.");
    await this.flush();
    if (Object.keys(this.pending()[date] || {}).length) throw new Error("Some ticks are waiting to sync. Please try saving again when connected.");
    return this.request("/api/report", { id, date, notes, supplies });
  }
  close() { this.closed = true; }
}
if (typeof module !== "undefined") module.exports = CloudClient;
