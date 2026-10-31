const $ = id => document.getElementById(id);
const safe = value => String(value).replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
const ICONS = {
  book: '<path d="M12 5c-3-2-6-2-9-1v15c3-1 6-1 9 1m0-15c3-2 6-2 9-1v15c-3-1-6-1-9 1V5Z"/>',
  bag: '<path d="M5 7h14l2 14H3L5 7Z"/><path d="M9 8V6a3 3 0 0 1 6 0v2"/>',
  sun: '<circle cx="12" cy="12" r="4"/><path d="M12 2v2m0 16v2M2 12h2m16 0h2M5 5l1.5 1.5m11 11L19 19M5 19l1.5-1.5m11-11L19 5"/>',
  checklist: '<rect x="5" y="4" width="15" height="17" rx="2"/><path d="M9 2v4m7-4v4M9 11l1 1 2-2m2 1h3M9 16l1 1 2-2m2 1h3"/>',
  repair: '<path d="M14 6a5 5 0 0 0-6 6L3 17a3 3 0 0 0 4 4l5-5a5 5 0 0 0 6-6l-3 3-4-4 3-3Z"/>',
  send: '<path d="m21 3-7 18-4-7-7-4 18-7ZM10 14 21 3"/>',
  plus: '<path d="M12 5v14M5 12h14"/>', close: '<path d="m6 6 12 12M6 18 18 6"/>',
  check: '<path d="m5 12 4 4L19 6"/>', search: '<circle cx="10" cy="10" r="6"/><path d="m15 15 5 5"/>'
};
const icon = name => '<svg viewBox="0 0 24 24" aria-hidden="true">' + ICONS[name] + '</svg>';
document.querySelectorAll('[data-icon]').forEach(el => { el.innerHTML = icon(el.dataset.icon); });
const sessionMemory = new Map();
const store = {
  get(key, fallback) { try { return JSON.parse(localStorage.getItem(key) || "null") ?? fallback; } catch { return sessionMemory.get(key) ?? fallback; } },
  set(key, value) { sessionMemory.set(key, value); try { localStorage.setItem(key, JSON.stringify(value)); } catch {} }
};
const preview = ["localhost", "127.0.0.1", "::1"].includes(location.hostname);
const transport = new CloudClient({ store, fetcher: (...args) => fetch(...args), base: preview ? "http://127.0.0.1:5173" : "https://azure-residence-care.michael726848.chatgpt.site", ids: [], onUpdate: () => {}, onStatus: () => {} });
const labels = { todo: "To do", progress: "In progress", fixed: "Fixed" };
const order = { todo: 0, progress: 1, fixed: 2 };
let issues = [], filter = "all", loaded = false, editor = null, formSaving = false;
const busy = new Set();
const client = new RepairsClient({ request: (...args) => transport.request(...args), onChange: rows => { issues = rows; loaded = true; render(); } });
const formatDate = timestamp => new Date(timestamp).toLocaleDateString("en-GB", { timeZone: "Asia/Dubai", day: "numeric", month: "short", year: "numeric" });
function notice(message) { $("repair-notice").textContent = message; $("repair-notice").hidden = !message; }
function render() {
  const active = document.activeElement?.closest('[data-job-action]');
  const focus = active && { id: active.dataset.id, action: active.dataset.jobAction };
  for (const status of Object.keys(labels)) $("count-" + status).textContent = issues.filter(x => x.status === status).length;
  const query = $("job-search").value.trim().toLowerCase();
  const visible = issues.filter(x => (filter === "all" || x.status === filter) && [x.title, x.detail, x.area, x.trade, x.assignedTo, x.notes].join(" ").toLowerCase().includes(query))
    .sort((a, b) => order[a.status] - order[b.status] || (a.status === "fixed" ? b.fixedAt - a.fixedAt : a.createdAt - b.createdAt));
  $("issue-list").setAttribute("aria-busy", "false");
  $("issue-list").innerHTML = visible.length ? visible.map(item => {
    const disabled = busy.has(item.id) ? ' disabled' : '';
    const control = (action, text, style = "") => '<button class="repair-action ' + style + '" data-job-action="' + action + '" data-id="' + safe(item.id) + '"' + disabled + '>' + text + '</button>';
    const help = item.trade ? '<a class="repair-action" href="https://www.google.com/maps/search/?api=1&amp;query=' + encodeURIComponent(item.trade + ' Palm Jumeirah Dubai') + '" target="_blank" rel="noopener">Find help ↗</a>' : '';
    return '<article class="repair-card ' + item.status + '" aria-label="' + safe(item.title) + '"><div class="repair-card-head">' +
      '<button class="repair-complete" data-job-action="complete" data-id="' + safe(item.id) + '" aria-pressed="' + (item.status === "fixed") + '" aria-label="' + (item.status === "fixed" ? 'Reopen: ' : 'Mark fixed: ') + safe(item.title) + '"' + disabled + '>' + icon('check') + '</button>' +
      '<div class="repair-heading"><p class="repair-kicker">' + safe(item.area || 'At home') + '</p><h3>' + safe(item.title) + '</h3>' + (item.detail ? '<p class="repair-detail">' + safe(item.detail) + '</p>' : '') + '</div>' +
      '<span class="repair-badge ' + item.status + '"><span class="status-dot ' + item.status + '"></span>' + labels[item.status] + '</span></div>' +
      '<div class="repair-meta"><span>Help needed: <b>' + safe(item.trade || 'To be confirmed') + '</b></span><span>Handling it: <b>' + safe(item.assignedTo || 'Not arranged yet') + '</b></span></div>' +
      (item.notes ? '<p class="repair-notes">' + safe(item.notes.slice(0, 240)) + (item.notes.length > 240 ? '… (more in details)' : '') + '</p>' : '') +
      '<div class="repair-actions">' + control('edit', 'Details & notes') + control('status', item.status === 'todo' ? 'Start job →' : item.status === 'progress' ? 'Back to to do' : 'Reopen job', 'primary') + (item.status !== 'fixed' ? help : '') +
      '<span class="repair-updated">' + (item.fixedAt ? 'Fixed ' + formatDate(item.fixedAt) : 'Updated ' + formatDate(item.updatedAt)) + '</span></div></article>';
  }).join('') : '<div class="repair-empty"><h3>' + (query ? 'No matching jobs.' : filter === 'fixed' ? 'The fixes will live here.' : filter === 'progress' ? 'Nothing in progress yet.' : 'All clear here.') + '</h3><p>' + (query ? 'Try another word or choose All jobs.' : filter === 'fixed' ? 'Tick a job when it is fixed to keep a record.' : 'Use Add a job or choose another status.') + '</p></div>';
  if (focus) {
    const target = [...document.querySelectorAll('[data-job-action]')].find(el => el.dataset.id === focus.id && el.dataset.jobAction === focus.action);
    target?.focus({ preventScroll: true });
  }
}
async function refresh() {
  try {
    await client.refresh();
    $("repair-sync").textContent = "Live · shared between your phones"; $("repair-sync").className = "sync on"; $("retry-load").hidden = true;
  } catch {
    $("repair-sync").textContent = loaded ? "Offline · showing the last loaded list" : "Could not connect. Please try again.";
    $("repair-sync").className = "sync off"; $("retry-load").hidden = false;
    if (!loaded) { $("issue-list").setAttribute("aria-busy", "false"); $("issue-list").innerHTML = '<div class="repair-empty"><h3>Your shared list could not load.</h3><p>Check your connection and tap Try again.</p></div>'; }
  }
}
const fieldNames = ["title", "area", "status", "detail", "trade", "assignedTo", "notes"];
function fillEditor(item) {
  editor = { id: item.id || crypto.randomUUID(), revision: item.revision || 0 };
  $("issue-dialog-title").textContent = item.revision ? "Repair details" : "Add a job";
  for (const key of fieldNames) $("issue-" + key).value = item[key] || (key === 'status' ? 'todo' : '');
  $("issue-error").hidden = true; $("load-latest").hidden = true;
}
function openEditor(item = {}) { fillEditor(item); $("issue-dialog").showModal(); $("issue-title").focus(); }
function closeEditor() { if (!formSaving) $("issue-dialog").close(); }
$("add-issue").addEventListener("click", () => openEditor());
$("close-issue").addEventListener("click", closeEditor); $("cancel-issue").addEventListener("click", closeEditor);
$("issue-dialog").addEventListener("cancel", e => { if (formSaving) e.preventDefault(); });
$("load-latest").addEventListener("click", () => { const latest = client.records.get(editor.id); if (latest) fillEditor(latest); });
$("issue-form").addEventListener("submit", async e => {
  e.preventDefault(); if (formSaving) return;
  const fields = Object.fromEntries(fieldNames.map(key => [key, $("issue-" + key).value.trim()]));
  if (!fields.title) { $("issue-title").focus(); return; }
  formSaving = true; $("save-issue").disabled = true; $("save-issue").textContent = "Saving…"; $("issue-error").hidden = true;
  for (const key of fieldNames) $("issue-" + key).disabled = true;
  try {
    await client.save(editor.id, fields, editor.revision);
    $("issue-dialog").close(); notice("Job saved to the shared list.");
  } catch (error) {
    $("issue-error").textContent = error.status === 409 ? error.message : "Could not save. Your entries are still here—check your connection and try again.";
    $("issue-error").hidden = false; $("load-latest").hidden = error.status !== 409;
  } finally {
    formSaving = false; $("save-issue").disabled = false; $("save-issue").innerHTML = 'Save job' + icon('check');
    for (const key of fieldNames) $("issue-" + key).disabled = false;
  }
});
$("issue-list").addEventListener("click", async e => {
  const button = e.target.closest('[data-job-action]'); if (!button) return;
  const item = client.records.get(button.dataset.id); if (!item || busy.has(item.id)) return;
  if (button.dataset.jobAction === "edit") return openEditor(item);
  const status = button.dataset.jobAction === "complete" ? (item.status === "fixed" ? "todo" : "fixed") : (item.status === "todo" ? "progress" : "todo");
  busy.add(item.id); render();
  try { await client.save(item.id, { status }, item.revision); notice(status === 'fixed' ? 'Marked fixed. Kept in your repair history.' : 'Status saved to the shared list.'); }
  catch (error) { notice(error.status === 409 ? 'Someone else updated this job. The latest details are now shown; please try again.' : 'Could not save this change. Check your connection and try again.'); }
  finally { busy.delete(item.id); render(); }
});
document.querySelectorAll('[data-filter]').forEach(button => button.addEventListener("click", () => {
  filter = button.dataset.filter;
  document.querySelectorAll('[data-filter]').forEach(el => el.setAttribute('aria-pressed', String(el === button)));
  if (loaded) render();
}));
$("job-search").addEventListener("input", () => { if (loaded) render(); });
$("retry-load").addEventListener("click", refresh);
window.addEventListener("online", refresh);
window.addEventListener("offline", () => { $("repair-sync").textContent = "Offline · reconnect to save changes"; $("repair-sync").className = "sync off"; });
document.addEventListener("visibilitychange", () => { if (!document.hidden) refresh(); });
window.addEventListener("pageshow", e => { if (e.persisted) refresh(); });
setInterval(() => { if (!document.hidden) refresh(); }, 3000);
refresh();
