const $ = id => document.getElementById(id);
const safe = value => String(value).replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
const ICONS = {
  sun: '<circle cx="12" cy="12" r="4"/><path d="M12 2v2m0 16v2M2 12h2m16 0h2M5 5l1.5 1.5m11 11L19 19M5 19l1.5-1.5m11-11L19 5"/>',
  checklist: '<rect x="5" y="4" width="15" height="17" rx="2"/><path d="M9 2v4m7-4v4M9 11l1 1 2-2m2 1h3M9 16l1 1 2-2m2 1h3"/>',
  repair: '<path d="M14 6a5 5 0 0 0-6 6L3 17a3 3 0 0 0 4 4l5-5a5 5 0 0 0 6-6l-3 3-4-4 3-3Z"/>',
  bag: '<path d="M5 7h14l2 14H3L5 7Z"/><path d="M9 8V6a3 3 0 0 1 6 0v2"/>',
  send: '<path d="m21 3-7 18-4-7-7-4 18-7ZM10 14 21 3"/>',
  plus: '<path d="M12 5v14M5 12h14"/>', close: '<path d="m6 6 12 12M6 18 18 6"/>',
  check: '<path d="m5 12 4 4L19 6"/>', search: '<circle cx="10" cy="10" r="6"/><path d="m15 15 5 5"/>',
  coffee: '<path d="M4 8h12v9a3 3 0 0 1-3 3H7a3 3 0 0 1-3-3V8Zm12 1h2a3 3 0 0 1 0 6h-2M7 2v3m5-3v3M2 23h18"/>',
  spray: '<path d="M8 9h7l3 4v8H5v-8l3-4Zm1 0V5h5v4M9 5V2h9v3h-4m4-2 3 2M5 15h13"/>'
};
const icon = name => '<svg viewBox="0 0 24 24" aria-hidden="true">' + ICONS[name] + '</svg>';
document.querySelectorAll('[data-icon]').forEach(el => { el.innerHTML = icon(el.dataset.icon); });
const memory = new Map();
const store = { get(key, fallback) { try { return JSON.parse(localStorage.getItem(key) || 'null') ?? fallback; } catch { return memory.get(key) ?? fallback; } }, set(key, value) { memory.set(key, value); try { localStorage.setItem(key, JSON.stringify(value)); } catch {} } };
const local = ['localhost', '127.0.0.1', '::1'].includes(location.hostname);
const transport = new CloudClient({ store, fetcher: (...args) => fetch(...args), base: local ? 'http://127.0.0.1:5173' : 'https://azure-residence-care.michael726848.chatgpt.site', ids: [], onUpdate: () => {}, onStatus: () => {} });
const labels = { needed: 'Needed', ordered: 'Ordered', restocked: 'Restocked', cancelled: 'No longer needed' };
const colours = { needed: 'todo', ordered: 'progress', restocked: 'fixed', cancelled: 'todo' };
const order = { needed: 0, ordered: 1, restocked: 2, cancelled: 3 };
const isActive = item => ['needed', 'ordered'].includes(item.status);
const norm = name => name.normalize('NFKC').trim().replace(/\s+/g, ' ').toLowerCase();
const date = value => new Date(value).toLocaleDateString('en-GB', { timeZone: 'Asia/Dubai', day: 'numeric', month: 'short', year: 'numeric' });
let items = [], filter = 'active', loaded = false, editor = null, formSaving = false, conflictItem = null, sending = false;
const busy = new Set();
const client = new RepairsClient({ request: (...args) => transport.request(...args), endpoint: '/api/supplies', listKey: 'items', itemKey: 'item', onChange: rows => { items = rows; loaded = true; render(); } });
const notice = text => { $('supply-notice').textContent = text; $('supply-notice').hidden = !text; };
function render() {
  const active = document.activeElement?.closest('[data-request-action]');
  const focus = active && { id: active.dataset.id, action: active.dataset.requestAction };
  for (const status of ['needed', 'ordered', 'restocked']) $('count-' + status).textContent = items.filter(x => x.status === status).length;
  $('send-supplies').disabled = sending || !items.some(isActive);
  const query = $('supply-search').value.trim().toLowerCase();
  const visible = items.filter(x => (filter === 'all' || (filter === 'active' ? isActive(x) : !isActive(x))) && [x.name, x.quantity, x.notes].join(' ').toLowerCase().includes(query))
    .sort((a, b) => order[a.status] - order[b.status] || (isActive(a) ? (a.priority === 'out' ? 0 : 1) - (b.priority === 'out' ? 0 : 1) || a.createdAt - b.createdAt : b.updatedAt - a.updatedAt));
  $('request-list').setAttribute('aria-busy', 'false');
  $('request-list').innerHTML = visible.length ? visible.map(item => {
    const control = (action, text, style = '') => '<button class="repair-action ' + style + '" data-request-action="' + action + '" data-id="' + safe(item.id) + '"' + (busy.has(item.id) ? ' disabled' : '') + '>' + text + '</button>';
    return '<article class="repair-card supply-card ' + item.status + '" aria-label="' + safe(item.name) + '"><div class="repair-card-head"><div class="repair-heading"><p class="repair-kicker">Requested ' + date(item.createdAt) + '</p><h3>' + safe(item.name) + '</h3></div><span class="repair-badge ' + colours[item.status] + '"><span class="status-dot ' + colours[item.status] + '"></span>' + labels[item.status] + '</span></div>' +
      '<div class="repair-meta"><span>Quantity: <b>' + safe(item.quantity || 'To be confirmed') + '</b></span></div>' +
      (isActive(item) && item.priority === 'out' ? '<span class="stock-level">Out of stock</span>' : '') +
      (item.notes ? '<p class="repair-notes">' + safe(item.notes.slice(0, 240)) + (item.notes.length > 240 ? '… (more in details)' : '') + '</p>' : '') +
      '<div class="repair-actions">' + control('edit', 'Details & notes') + (item.status === 'needed' ? control('ordered', 'Mark ordered', 'primary') : '') +
      (isActive(item) ? control('restocked', 'Mark restocked', 'primary') : control('again', 'Request again', 'primary')) +
      '<span class="repair-updated">' + (item.restockedAt ? 'Restocked ' + date(item.restockedAt) : 'Updated ' + date(item.updatedAt)) + '</span></div></article>';
  }).join('') : '<div class="repair-empty"><h3>' + (query ? 'No matching requests.' : filter === 'history' ? 'Past requests will live here.' : 'No open requests.' ) + '</h3><p>' + (query ? 'Try another word or choose All requests.' : filter === 'history' ? 'Restocked and cancelled requests stay here as a record.' : 'Request an item when something is running low.') + '</p></div>';
  if (focus) [...document.querySelectorAll('[data-request-action]')].find(el => el.dataset.id === focus.id && el.dataset.requestAction === focus.action)?.focus({ preventScroll: true });
}
async function refresh() {
  try {
    await client.refresh(); $('supply-sync').textContent = 'Live · shared between your phones'; $('supply-sync').className = 'sync on'; $('retry-supplies').hidden = true; return true;
  } catch {
    $('supply-sync').textContent = loaded ? 'Offline · showing the last loaded list' : 'Could not connect. Please try again.'; $('supply-sync').className = 'sync off'; $('retry-supplies').hidden = false;
    if (!loaded) { $('request-list').setAttribute('aria-busy', 'false'); $('request-list').innerHTML = '<div class="repair-empty"><h3>Your shared list could not load.</h3><p>Check your connection and tap Try again.</p></div>'; }
    return false;
  }
}
const fields = ['name', 'quantity', 'priority', 'notes', 'status'];
function fillEditor(item = {}) {
  editor = { id: item.id || crypto.randomUUID(), revision: item.revision || 0 };
  $('supply-dialog-title').textContent = item.revision ? 'Supply request' : 'Request an item';
  fields.forEach(key => { $('supply-' + key).value = item[key] || ({ status: 'needed', priority: 'soon' }[key] || ''); });
  $('supply-error').hidden = true; $('open-existing').hidden = true; conflictItem = null;
}
function openEditor(item = {}) { fillEditor(item); $('supply-dialog').showModal(); $('supply-name').focus(); }
function requestNamed(name) {
  const existing = items.find(x => isActive(x) && norm(x.name) === norm(name));
  openEditor(existing || { name });
}
$('add-request').addEventListener('click', () => openEditor());
document.querySelectorAll('[data-preset]').forEach(button => button.addEventListener('click', () => requestNamed(button.dataset.preset === 'coffee' ? 'Coffee-machine filters' : 'Shark StainForce spray')));
const suggestions = ['Dishwasher tablets', 'Rinse aid', 'Bin bags', 'Laundry detergent', 'Microfibre cloths', 'Cleaning gloves'];
$('supply-suggestions').innerHTML = suggestions.map(name => '<button type="button" data-suggestion="' + safe(name) + '">+ ' + safe(name) + '</button>').join('');
$('supply-suggestions').addEventListener('click', e => { const button = e.target.closest('[data-suggestion]'); if (button) requestNamed(button.dataset.suggestion); });
const closeEditor = () => { if (!formSaving) $('supply-dialog').close(); };
$('close-request').addEventListener('click', closeEditor); $('cancel-request').addEventListener('click', closeEditor);
$('supply-dialog').addEventListener('cancel', e => { if (formSaving) e.preventDefault(); });
$('open-existing').addEventListener('click', () => { if (conflictItem) fillEditor(client.records.get(conflictItem.id) || conflictItem); });
$('supply-form').addEventListener('submit', async e => {
  e.preventDefault(); if (formSaving) return;
  const values = Object.fromEntries(fields.map(key => [key, $('supply-' + key).value.trim()]));
  if (!values.name) { $('supply-name').focus(); return; }
  formSaving = true; $('save-request').disabled = true; $('save-request').textContent = 'Saving…'; $('supply-error').hidden = true; $('open-existing').hidden = true;
  fields.forEach(key => { $('supply-' + key).disabled = true; });
  try { await client.save(editor.id, values, editor.revision); $('supply-dialog').close(); notice('Request saved. Both phones can see it.'); }
  catch (error) {
    $('supply-error').textContent = error.status === 409 ? error.message : 'Could not save. Your entries are still here—check your connection and try again.';
    $('supply-error').hidden = false; conflictItem = error.result?.item; $('open-existing').hidden = !conflictItem;
  } finally { formSaving = false; $('save-request').disabled = false; $('save-request').innerHTML = 'Save request' + icon('check'); fields.forEach(key => { $('supply-' + key).disabled = false; }); }
});
$('request-list').addEventListener('click', async e => {
  const button = e.target.closest('[data-request-action]'); if (!button) return;
  const item = client.records.get(button.dataset.id); if (!item || busy.has(item.id)) return;
  const action = button.dataset.requestAction;
  if (action === 'edit') return openEditor(item);
  if (action === 'again') return requestNamed(item.name);
  if (!['ordered', 'restocked'].includes(action)) return;
  busy.add(item.id); render();
  try { await client.save(item.id, { status: action }, item.revision); notice(action === 'restocked' ? 'Marked restocked. Kept in History.' : 'Marked ordered. Update it again when it arrives.'); }
  catch (error) { notice(error.status === 409 ? 'Someone else updated this request. The latest details are now shown; please try again.' : 'Could not save this change. Check your connection and try again.'); }
  finally { busy.delete(item.id); render(); }
});
document.querySelectorAll('[data-filter]').forEach(button => button.addEventListener('click', () => {
  filter = button.dataset.filter; document.querySelectorAll('[data-filter]').forEach(el => el.setAttribute('aria-pressed', String(el === button))); if (loaded) render();
}));
$('supply-search').addEventListener('input', () => { if (loaded) render(); });
$('retry-supplies').addEventListener('click', refresh);
$('send-supplies').addEventListener('click', async () => {
  if (sending) return; sending = true; $('send-supplies').disabled = true;
  try {
    if (!(await refresh())) return notice('Reconnect to load the latest requests before sharing.');
    const active = items.filter(isActive); if (!active.length) return notice('There are no open requests to send.');
    let message = 'Azure Residences · Cleaning supplies\n\n' + active.map(item => '- ' + item.name + (item.quantity ? ' · ' + item.quantity : '') + ' [' + (item.status === 'ordered' ? 'Ordered' : item.priority === 'out' ? 'Needed — out of stock' : 'Needed') + ']' + (item.notes ? '\n  ' + item.notes : '')).join('\n');
    if (message.length > 6000) message = message.slice(0, 5900) + '\n…Full details in the shared list.';
    message += '\n\nShared list: https://michaeljennings93.github.io/cleaning-checklist/supplies.html';
    location.assign('https://wa.me/971585915293?text=' + encodeURIComponent(message));
  } finally { sending = false; render(); }
});
window.addEventListener('online', refresh);
window.addEventListener('offline', () => { $('supply-sync').textContent = 'Offline · reconnect to save changes'; $('supply-sync').className = 'sync off'; });
document.addEventListener('visibilitychange', () => { if (!document.hidden) refresh(); });
window.addEventListener('pageshow', e => { if (e.persisted) refresh(); });
setInterval(() => { if (!document.hidden) refresh(); }, 3000);
refresh();
CupboardPhotos.latest($('latest-cupboard'), transport);
if (new URLSearchParams(location.search).get('request') === '1') {
  openEditor();
  history.replaceState(null, '', location.pathname + location.hash);
}
