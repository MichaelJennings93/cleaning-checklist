/* Stable task IDs and storage keys keep existing visits compatible. */
const CleanCore = (() => {
  const pad = n => String(n).padStart(2, "0");
  const dateKey = d => d.getFullYear() + "-" + pad(d.getMonth() + 1) + "-" + pad(d.getDate());
  function fromKey(key) {
    if (typeof key !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(key)) return null;
    const [y, m, d] = key.split("-").map(Number);
    const date = new Date(y, m - 1, d);
    return dateKey(date) === key ? date : null;
  }
  function dubaiToday(now = new Date()) {
    const parts = new Intl.DateTimeFormat("en-GB", { timeZone: "Asia/Dubai", year: "numeric", month: "2-digit", day: "2-digit" }).formatToParts(now);
    const p = Object.fromEntries(parts.map(x => [x.type, x.value]));
    return fromKey(p.year + "-" + p.month + "-" + p.day);
  }
  const firstMonday = d => d.getDay() === 1 && d.getDate() <= 7;
  const visitDay = d => [1, 4].includes(d.getDay());
  // Preserve the original Monday-list fallback for an unscheduled visit.
  const listFor = d => d.getDay() === 4 ? "thu" : "mon";
  const visible = (when, d) => when === "every" || (when === "monthly" ? firstMonday(d) : when === listFor(d));
  function visitDates(today) {
    const previous = new Date(today);
    do { previous.setDate(previous.getDate() - 1); } while (!visitDay(previous));
    const out = [previous], next = new Date(today);
    if (visitDay(next)) out.push(new Date(next));
    while (out.length < 4) { next.setDate(next.getDate() + 1); if (visitDay(next)) out.push(new Date(next)); }
    return out;
  }
  function tasksFor(rooms, date) {
    return rooms.flatMap((room, ri) => room.tasks.map((t, ti) => ({
      id: ri + "-" + ti, ri, ti, room: room.title, when: t[0], title: t[1], description: t[2]
    }))).filter(t => visible(t.when, date));
  }
  function visitSummary(tasks, ticks, date, notes, supplies) {
    const left = tasks.filter(t => !ticks[t.id]);
    let text = "Azure Residences · Cleaning " + (left.length ? "update" : "complete");
    text += "\n" + date.toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long", year: "numeric" });
    text += "\nDone: " + (tasks.length - left.length) + " of " + tasks.length + " tasks";
    text += left.length ? "\n\nStill to do:\n" + left.map(t => "- " + t.room + ": " + t.title).join("\n") : "\n\nEverything on the list is done.";
    if (notes.trim()) text += "\n\nNotes:\n" + notes.trim();
    if (supplies.length) text += "\n\nPlease restock:\n" + supplies.map(s => "- " + s).join("\n");
    return text;
  }
  class SyncClient {
    constructor({ store, fetcher, ids, onUpdate, onStatus, online = () => true }) {
      Object.assign(this, { store, fetcher, ids: new Set(ids), onUpdate, onStatus, online });
      this.connected = false;
      this.date = null;
    }
    ticks(date = this.date) { return this.store.get("ticks-" + date, {}); }
    pending() { return this.store.get("clean-outbox", {}); }
    status() {
      const count = Object.values(this.pending()).reduce((n, day) => n + Object.keys(day).length, 0);
      this.onStatus(!this.online() ? "offline" : count ? "pending" : this.connected ? "live" : "connecting", count);
    }
    set(id, on) {
      if (!this.ids.has(id) || typeof on !== "boolean") return;
      const date = this.date, times = this.store.get("tick-times-" + date, {});
      const message = { id, on, t: Math.max(Date.now(), (times[id] || 0) + 1) };
      times[id] = message.t;
      const ticks = this.ticks(date);
      if (on) ticks[id] = true; else delete ticks[id];
      this.store.set("ticks-" + date, ticks);
      this.store.set("tick-times-" + date, times);
      const outbox = this.pending();
      (outbox[date] ||= {})[id] = message;
      this.store.set("clean-outbox", outbox);
      this.onUpdate(ticks); this.status(); this.flush();
    }
  }
  return { dateKey, fromKey, dubaiToday, firstMonday, visitDay, listFor, visible, visitDates, tasksFor, visitSummary, SyncClient };
})();
if (typeof module !== "undefined") module.exports = CleanCore;
