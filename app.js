const $ = id => document.getElementById(id);
const C = CleanCore;
const ICONS = {
  repair: '<path d="M14 6a5 5 0 0 0-6 6L3 17a3 3 0 0 0 4 4l5-5a5 5 0 0 0 6-6l-3 3-4-4 3-3Z"/>',
  sun: '<circle cx="12" cy="12" r="4"/><path d="M12 2v2m0 16v2M2 12h2m16 0h2M5 5l1.5 1.5m11 11L19 19M5 19l1.5-1.5m11-11L19 5"/>',
  checklist: '<rect x="5" y="4" width="15" height="17" rx="2"/><path d="M9 2v4m7-4v4M9 11l1 1 2-2m2 1h3M9 16l1 1 2-2m2 1h3"/>',
  arrow: '<path d="M4 12h16m-6-6 6 6-6 6"/>',
  chevron: '<path d="m7 10 5 5 5-5"/>',
  pin: '<path d="M19 10c0 5-7 11-7 11S5 15 5 10a7 7 0 1 1 14 0Z"/><circle cx="12" cy="10" r="2"/>',
  people: '<circle cx="9" cy="8" r="3"/><path d="M3 20v-2a6 6 0 0 1 12 0v2M16 5a3 3 0 0 1 0 6m2 3a5 5 0 0 1 3 5"/>',
  send: '<path d="m21 3-7 18-4-7-7-4 18-7ZM10 14 21 3"/>',
  sparkle: '<path d="m12 3 2.5 6.5L21 12l-6.5 2.5L12 21l-2.5-6.5L3 12l6.5-2.5L12 3ZM20 2v4m-2-2h4"/>',
  "check-circle": '<circle cx="12" cy="12" r="9"/><path d="m8 12 3 3 5-6"/>',
  check: '<path d="m5 12 4 4L19 6"/>',
  bag: '<path d="M4 7h16l-1 14H5L4 7Zm4 0V6a4 4 0 0 1 8 0v1"/>',
  plus: '<path d="M12 5v14M5 12h14"/>',
  close: '<path d="m6 6 12 12M6 18 18 6"/>',
  copy: '<rect x="8" y="8" width="12" height="13" rx="2"/><path d="M16 5V3H3v13h2"/>',
  message: '<path d="M21 11.5a9 9 0 0 1-9 9 10 10 0 0 1-4-.9L3 21l1.4-4.6A9 9 0 1 1 21 11.5Z"/><path d="M8 9h8m-8 4h5"/>',
  machine: '<rect x="4" y="3" width="16" height="18" rx="2"/><circle cx="12" cy="13" r="5"/><path d="M7 6h.1M10 6h.1M9 13c1 2 4 2 6 0"/>',
  kitchen: '<path d="M5 3v6a3 3 0 0 0 6 0V3M8 3v18M18 3c-4 4-4 9 0 9v9m0-18v9"/>',
  bath: '<path d="M3 12h18v3a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4v-3ZM6 12V5a2 2 0 0 1 4 0m-4 14v2m12-2v2"/>',
  bed: '<path d="M3 18V7m18 11V7M3 14h18M5 14V9h14v5M8 9V5h8v4M3 21v-3h18v3"/>',
  sofa: '<path d="M5 11V7a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v4M5 11H3v7h18v-7h-2v4H5v-4Zm0 7v3m14-3v3"/>',
  balcony: '<path d="M3 13h18M4 13v8m4-8v8m4-8v8m4-8v8m4-8v8M3 20h18M13 9a4 4 0 0 1 8 0M17 2v1M10 5l1 1"/>',
  home: '<path d="m3 10 9-7 9 7M5 9v12h14V9M9 21v-8h6v8"/>',
  photo: '<rect x="3" y="4" width="18" height="16" rx="2"/><circle cx="8" cy="9" r="1.5"/><path d="m3 17 5-5 4 4 4-6 5 7"/>',
  play: '<circle cx="12" cy="12" r="9"/><path d="m10 8 6 4-6 4V8Z"/>',
  alert: '<path d="m12 3 10 18H2L12 3Zm0 6v5m0 3v.1"/>'
};
function icon(name) { return '<svg viewBox="0 0 24 24" aria-hidden="true">' + (ICONS[name] || ICONS.home) + '</svg>'; }
document.querySelectorAll("[data-icon]").forEach(el => { el.innerHTML = icon(el.dataset.icon); });
const safe = text => String(text).replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
const plain = html => html.replace(/<[^>]*>/g, "");
const roomMeta = [
  ["First things first", "machine", "Start the machines"],
  ["Kitchen", "kitchen", "Kitchen"], ["Bathrooms", "bath", "Bathrooms"],
  ["Bedroom", "bed", "Bedroom"], ["Living room", "sofa", "Living room"],
  ["Balcony", "balcony", "Balcony"], ["Shared areas", "home", "Around the apartment"],
  ["Laundry", "machine", "Laundry"], ["Final checks", "check-circle", "The finishing touches"]
];
const LABEL = { every: "Every visit", mon: "Monday extra", thu: "Thursday extra", monthly: "Monthly care" };
let storageWarning = false;
const memory = new Map();
const store = {
  get(key, fallback) {
    if (memory.has(key)) return JSON.parse(memory.get(key));
    try {
      const raw = localStorage.getItem(key);
      const value = raw === null ? fallback : JSON.parse(raw);
      if (value === null || typeof value !== typeof fallback || Array.isArray(value) !== Array.isArray(fallback)) return fallback;
      return value;
    } catch { return memory.has(key) ? JSON.parse(memory.get(key)) : fallback; }
  },
  set(key, value) {
    memory.set(key, JSON.stringify(value));
    try { localStorage.setItem(key, JSON.stringify(value)); }
    catch { if (!storageWarning) { storageWarning = true; toast("This browser cannot save progress. Keep this page open."); } }
  }
};
const today = C.dubaiToday();
const dates = C.visitDates(today);
let selected = store.get("clean-date", "");
if (!C.fromKey(selected) || Math.abs(C.fromKey(selected) - today) > 3 * 864e5) selected = C.dateKey(C.visitDay(today) ? today : dates[1]);
let activeRoom = 0, ticks = {}, lowSupplies = [], toastTimer;
const preview = ["localhost", "127.0.0.1", "::1", ""].includes(location.hostname);
const sync = new CloudClient({
  store, fetcher: (...args) => fetch(...args),
  base: preview ? "http://127.0.0.1:5173" : "https://azure-residence-care.michael726848.chatgpt.site",
  ids: ROOMS.flatMap((r, ri) => r.tasks.map((_, ti) => ri + "-" + ti)),
  onUpdate: next => { ticks = next; updateProgress(); updateTaskStates(); },
  onStatus: (state, count) => {
    const messages = {
      live: "Live · updates shared between both phones",
      offline: "Offline · ticks saved on this phone",
      pending: count + " change" + (count === 1 ? "" : "s") + " saved · waiting to sync",
      connecting: "Reconnecting · ticks saved on this phone"
    };
    $("sync").className = "sync " + (state === "live" ? "on" : state === "offline" ? "off" : "");
    if ($("sync").textContent !== messages[state]) $("sync").textContent = messages[state];
  }, online: () => navigator.onLine !== false
});
const selectedDate = () => C.fromKey(selected);
const cupboard = new CupboardPhotos.Visit($("cupboard-photos"), sync);
const savedPhotos = new CupboardPhotos.Gallery($("saved-report-photos"), sync);
const allTasks = () => C.tasksFor(ROOMS, selectedDate());
const currentTasks = () => allTasks().filter(t => t.ri === activeRoom);
const availableRooms = () => ROOMS.map((_, i) => i);
const fmt = (d, options) => d.toLocaleDateString("en-GB", options);
function toast(message) {
  clearTimeout(toastTimer);
  $("toast").textContent = message;
  $("toast").hidden = false;
  toastTimer = setTimeout(() => { $("toast").hidden = true; }, 3600);
}
function chooseDate(key) {
  if (!C.fromKey(key)) return;
  if (key !== selected && (cupboard.hasPending() || cupboard.locked)) {
    toast("Finish or discard the pending photo upload before changing visits.");
    $("other-date").value = selected; return;
  }
  selected = key;
  store.set("clean-date", key);
  ticks = store.get("ticks-" + key, {});
  $("notes").value = store.get("notes-" + key, "");
  lowSupplies = store.get("supplies-" + key, []).filter(s => SUPPLIES.includes(s));
  $("status").textContent = "";
  renderDates(); renderNavigation(); renderRoom(); renderSupplies();
  sync.connect(key);
  cupboard.setDate(key);
}
function renderDates() {
  const d = selectedDate();
  $("visit-date").textContent = fmt(d, { weekday: "short", day: "numeric", month: "long" });
  $("visit-tags").innerHTML = '<span class="tag">Every-visit tasks</span><span class="tag">' + (C.listFor(d) === "thu" ? "Thursday" : "Monday") + ' extras</span>' + (C.firstMonday(d) ? '<span class="tag monthly">Monthly care</span>' : "") + (!C.visitDay(d) ? '<span class="tag custom">Extra visit · Monday list</span>' : "");
  $("dates").innerHTML = dates.map(date => {
    const key = C.dateKey(date), rel = key === C.dateKey(today) ? "Today" : date < today ? "Previous visit" : "Coming up";
    return '<button class="date-option" data-date="' + key + '" aria-pressed="' + (key === selected) + '"><strong>' + fmt(date, { weekday: "long" }) + '</strong><span>' + fmt(date, { day: "numeric", month: "long" }) + '</span><small>' + rel + (C.firstMonday(date) ? " · monthly care" : "") + '</small></button>';
  }).join("");
  $("other-date").value = selected;
}
function renderNavigation() {
  const rooms = availableRooms();
  $("room-total").textContent = rooms.length;
  const button = (ri, side) => {
    const ts = allTasks().filter(t => t.ri === ri), done = ts.filter(t => ticks[t.id]).length;
    return '<button class="' + (side ? "side-room" : "room-tab") + (done === ts.length ? " done" : "") + '" data-room="' + ri + '" ' + (side ? 'aria-current' : 'aria-pressed') + '="' + (ri === activeRoom) + '">' + icon(roomMeta[ri][1]) + '<span>' + roomMeta[ri][0] + '</span><span class="side-count">' + done + '/' + ts.length + '</span></button>';
  };
  $("side-rooms").innerHTML = rooms.map(ri => button(ri, true)).join("");
  $("room-tabs").innerHTML = rooms.map(ri => button(ri, false)).join("");
}
function mediaFor(task) {
  const media = MEDIA[task.title] || {};
  return {
    photos: (media.p || []).filter(key => !key.startsWith("done:")).map(key => ALL_PHOTOS[key]).filter(Boolean),
    videos: (media.v || []).map(key => V[key]).filter(Boolean),
    note: media.note || "",
    tool: media.tool && ALL_PHOTOS[media.tool.photo] ? { ...media.tool, image: ALL_PHOTOS[media.tool.photo] } : null
  };
}
function renderRoom() {
  const room = ROOMS[activeRoom], tasks = currentTasks();
  const ownerLabel = "Shared checklist";
  $("workflow-note").hidden = activeRoom !== 0 && activeRoom !== 7;
  $("room-content").innerHTML = '<section class="room" aria-labelledby="active-room-title"><div class="room-head"><div class="room-icon">' + icon(roomMeta[activeRoom][1]) + '</div><div><div class="room-kicker">' + (activeRoom === 0 ? "START HERE" : activeRoom === 8 ? "BEFORE YOU LEAVE" : "ROOM BY ROOM") + ' <span>· ' + ownerLabel + '</span></div><h3 id="active-room-title" tabindex="-1">' + roomMeta[activeRoom][2] + '</h3><p>' + safe(room.lead) + '</p></div><span class="room-count"></span></div><div class="room-bar"><span></span></div>' +
    (room.warn?.length ? '<div class="room-warnings">' + room.warn.map(w => '<div class="warning">' + icon("alert") + '<span>' + safe(w) + '</span></div>').join("") + '</div>' : "") +
    '<ul class="tasks">' + tasks.map(t => {
      const media = mediaFor(t);
      return '<li class="task" data-task="' + t.id + '"><label class="task-main" for="t-' + t.id + '"><input type="checkbox" id="t-' + t.id + '" data-tick="' + t.id + '" aria-label="' + safe(t.title) + '" aria-describedby="desc-' + t.id + '"><span class="task-copy"><span class="task-title"><strong>' + safe(t.title) + '</strong>' + (t.when !== "every" ? '<span class="tag ' + t.when + '">' + LABEL[t.when] + '</span>' : "") + '</span><span class="task-description" id="desc-' + t.id + '">' + safe(t.description) + '</span></span></label>' +
        media.photos.filter(p => p.bad).map(p => '<p class="notok">' + p.cap + '</p>').join("") +
        (media.tool ? '<button class="tool-preview" data-photos="' + t.id + '" aria-label="Open ' + safe(media.tool.name) + ' photo and care guide"><img src="' + safe(media.tool.image.src) + '" alt="' + safe(media.tool.image.alt || media.tool.name) + '" width="80" height="80" loading="lazy"><span><small>YOUR CLEANING KIT</small><strong>' + safe(media.tool.name) + '</strong><span>Photo, instructions &amp; aftercare ' + icon("arrow") + '</span></span></button>' : "") +
        (media.photos.length || media.videos.length ? '<div class="task-media">' + (media.photos.length && !media.tool ? '<button class="media-button" data-photos="' + t.id + '">' + icon("photo") + 'Photo guide <span>· ' + media.photos.length + '</span></button>' : "") +
        media.videos.map(v => '<a class="media-button" href="' + v[1] + '" target="_blank" rel="noopener">' + icon("play") + safe(v[0]) + '</a>').join("") + '</div>' : "") +
        (media.note ? '<p class="media-note">' + safe(media.note) + '</p>' : "") + '</li>';
    }).join("") + '</ul><div class="empty-state" hidden>' + icon("check-circle") + '<h3>This area is all taken care of.</h3><p>Move on to the next room, or turn off “Hide completed” to review.</p></div></section>';
  const rooms = availableRooms(), position = rooms.indexOf(activeRoom);
  $("room-position").textContent = "Area " + (position + 1) + " of " + rooms.length + " · Clean together";
  $("next-room").innerHTML = (position === rooms.length - 1 ? "Finish & report" : "Next: " + roomMeta[rooms[position + 1]][0]) + icon("arrow");
  updateTaskStates();
}
function updateTaskStates() {
  const section = $("room-content").querySelector(".room");
  if (!section) return;
  const tasks = currentTasks(), done = tasks.filter(t => ticks[t.id]).length;
  const hide = $("hide-done").checked;
  section.classList.toggle("complete", done === tasks.length);
  section.querySelector(".room-count").textContent = done === tasks.length ? "Complete" : done + " / " + tasks.length;
  section.querySelector(".room-bar span").style.width = (done / tasks.length * 100) + "%";
  section.querySelectorAll("[data-task]").forEach(li => {
    const checked = !!ticks[li.dataset.task];
    li.classList.toggle("checked", checked);
    li.querySelector("input").checked = checked;
    li.hidden = hide && checked;
  });
  section.querySelector(".empty-state").hidden = !(hide && done === tasks.length);
}
function updateProgress() {
  const tasks = allTasks(), done = tasks.filter(t => ticks[t.id]).length, percent = Math.round(done / tasks.length * 100);
  $("progress-ring").style.setProperty("--progress", percent + "%");
  $("percentage").innerHTML = percent + "<small>%</small>";
  $("prog-count").textContent = done + " of " + tasks.length + " tasks";
  $("prog-label").textContent = done === tasks.length ? "Beautifully done. Ready for the final report." : done === 0 ? "A fresh checklist, ready for you." : tasks.length - done + " left · every little detail counts.";
  $("side-total").textContent = tasks.length - done;
  $("mobile-progress").textContent = percent + "%";
  $("report-count").textContent = done === tasks.length ? "Everything checked. Lovely work." : (tasks.length - done) + " tasks still to do across the home";
  // Update counts without replacing navigation or stealing keyboard focus.
  document.querySelectorAll("[data-room]").forEach(b => {
    const ri = Number(b.dataset.room), ts = tasks.filter(t => t.ri === ri), n = ts.filter(t => ticks[t.id]).length;
    b.querySelector(".side-count").textContent = n + "/" + ts.length;
    b.classList.toggle("done", n === ts.length);
  });
  summary();
}
function selectRoom(ri, scroll = true) {
  if (!availableRooms().includes(ri)) return;
  activeRoom = ri;
  renderNavigation(); renderRoom();
  if (scroll) {
    $("checklist").scrollIntoView({ behavior: matchMedia("(prefers-reduced-motion: reduce)").matches ? "instant" : "smooth", block: "start" });
    $("active-room-title").focus({ preventScroll: true });
    const active = $("room-tabs").querySelector('[data-room="' + ri + '"]');
    $("room-tabs").scrollTo({ left: Math.max(0, active.offsetLeft - $("room-tabs").offsetLeft - 17), behavior: "smooth" });
  }
}
function renderSupplies() {
  $("legacy-supplies").hidden = !lowSupplies.length;
  $("supplies").innerHTML = SUPPLIES.map(s => '<button class="supply" data-supply="' + safe(s) + '" aria-pressed="' + lowSupplies.includes(s) + '">' + safe(s) + '</button>').join("");
  $("supply-count").textContent = lowSupplies.length ? "(" + lowSupplies.length + ")" : "";
}
function summary() {
  const text = C.visitSummary(allTasks(), ticks, selectedDate(), $("notes").value, lowSupplies);
  $("summary").textContent = text;
  return text;
}
function openPhotos(id) {
  const task = allTasks().find(t => t.id === id);
  if (!task) return;
  $("photo-title").textContent = task.title;
  $("lb-gallery").innerHTML = mediaFor(task).photos.map(p => '<figure class="' + (p.bad ? "bad" : "") + '"><img src="' + p.src + '" alt="' + safe(p.alt || plain(p.cap)) + '"><figcaption>' + p.cap + '</figcaption></figure>').join("");
  $("lightbox").showModal(); $("lightbox").scrollTop = 0;
}
document.addEventListener("click", event => {
  const button = event.target.closest("button");
  if (!button) return;
  if (button.dataset.close) $(button.dataset.close).close();
  if (button.dataset.room) selectRoom(Number(button.dataset.room));
  if (button.dataset.photos) openPhotos(button.dataset.photos);
  if (button.dataset.date) chooseDate(button.dataset.date);
  if (button.dataset.supply) {
    const value = button.dataset.supply;
    lowSupplies = lowSupplies.includes(value) ? lowSupplies.filter(s => s !== value) : [...lowSupplies, value];
    store.set("supplies-" + selected, lowSupplies);
    button.setAttribute("aria-pressed", lowSupplies.includes(value));
    $("supply-count").textContent = lowSupplies.length ? "(" + lowSupplies.length + ")" : "";
    summary();
  }
});
$("room-content").addEventListener("change", event => {
  if (!event.target.dataset.tick) return;
  const id = event.target.dataset.tick, on = event.target.checked;
  sync.set(id, on);
  if (on && currentTasks().every(t => ticks[t.id])) toast(roomMeta[activeRoom][0] + " complete. Lovely work.");
  if ($("hide-done").checked && on) {
    const next = $("room-content").querySelector(".task:not([hidden]) input");
    (next || $("next-room")).focus({ preventScroll: true });
  }
});
$("hide-done").addEventListener("change", updateTaskStates);
$("change-date").addEventListener("click", () => $("date-dialog").showModal());
$("other-date").addEventListener("change", e => chooseDate(e.target.value));
$("next-room").addEventListener("click", () => {
  const rooms = availableRooms(), next = rooms[rooms.indexOf(activeRoom) + 1];
  if (next === undefined) { $("report").scrollIntoView({ behavior: "smooth" }); $("notes").focus({ preventScroll: true }); }
  else selectRoom(next);
});
$("notes").addEventListener("input", e => { store.set("notes-" + selected, e.target.value); summary(); });
$("copy").addEventListener("click", async () => {
  try { await navigator.clipboard.writeText(summary()); $("status").textContent = "Copied. Ready to paste into your message to Michael."; toast("Visit summary copied."); }
  catch {
    document.querySelector(".summary-details").open = true;
    const range = document.createRange(); range.selectNodeContents($("summary"));
    const selection = getSelection(); selection.removeAllRanges(); selection.addRange(range);
    $("status").textContent = "Summary selected. Use Copy, then paste it into your message.";
  }
});
const whatsapp = text => "https://wa.me/971585915293?text=" + encodeURIComponent(text);
let saving = false, viewedReport = null;
async function saveVisit(andSend) {
  if (saving) return;
  if (cupboard.hasPending()) { $("status").textContent = "Please wait for the photos to finish uploading. Retry or discard any failed uploads, then save."; return; }
  saving = true;
  cupboard.setLocked(true);
  $("save-visit").disabled = true; $("save-send").disabled = true;
  $("status").textContent = "Syncing both phones and saving this visit…";
  const date = selected, notes = $("notes").value, supplies = [...lowSupplies];
  const fingerprint = JSON.stringify({ date, notes, supplies, ticks, photos: cupboard.photos.map(p => p.id) });
  let pending = store.get("report-request-" + date, {});
  if (pending.fingerprint !== fingerprint) {
    pending = { id: crypto.randomUUID(), fingerprint };
    store.set("report-request-" + date, pending);
  }
  try {
    const report = await sync.saveReport({ id: pending.id, date, notes, supplies });
    store.set("report-request-" + date, {});
    store.set("last-report-" + date, report);
    const at = new Date(report.savedAt).toLocaleTimeString("en-GB", { timeZone: "Asia/Dubai", hour: "2-digit", minute: "2-digit" });
    $("status").textContent = "Saved for " + fmt(C.fromKey(date), { day: "numeric", month: "long" }) + " at " + at + " · " + report.done + "/" + report.total + " tasks. Available in Saved visits on both phones.";
    toast("Visit saved for both phones.");
    if (andSend) location.assign(whatsapp(report.summary));
  } catch (error) {
    $("status").textContent = error.message || "Could not save. Your progress is still on this phone.";
  } finally {
    cupboard.setLocked(false);
    saving = false; $("save-visit").disabled = false; $("save-send").disabled = false;
  }
}
$("save-visit").addEventListener("click", () => saveVisit(false));
$("save-send").addEventListener("click", () => saveVisit(true));
$("share-access").addEventListener("click", async () => {
  try { await navigator.clipboard.writeText("https://michaeljennings93.github.io/cleaning-checklist/"); toast("Cleaning link copied. Open it on both phones."); }
  catch { toast("Share this address: michaeljennings93.github.io/cleaning-checklist/"); }
});
async function loadHistory() {
  $("saved-report").hidden = true; $("history-list").hidden = false;
  $("history-list").textContent = "Loading saved visits…";
  try {
    const result = await sync.request("/api/history");
    $("history-list").innerHTML = result.reports.length ? result.reports.map(r => {
      const date = C.fromKey(r.date);
      const saved = new Date(r.savedAt).toLocaleString("en-GB", { timeZone: "Asia/Dubai", day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" });
      return '<button class="history-row" data-report="' + safe(r.id) + '"><span><strong>' + safe(fmt(date, { weekday: "short", day: "numeric", month: "long", year: "numeric" })) + '</strong><small>Saved ' + safe(saved) + ' · Dubai time</small></span><span class="tag ' + (r.done === r.total ? "" : "monthly") + '">' + r.done + '/' + r.total + '</span>' + icon("arrow") + '</button>';
    }).join("") : '<div class="empty-state">' + icon("checklist") + '<h3>Your visits will live here.</h3><p>Choose “Save visit” at the end of a clean to keep a dated record.</p></div>';
  } catch { $("history-list").textContent = "Could not load saved visits. Check your connection and reopen this window."; }
}
$("view-history").addEventListener("click", () => { $("history-dialog").showModal(); loadHistory(); });
$("history-back").addEventListener("click", loadHistory);
async function openSavedReport(id) {
  viewedReport = await sync.request("/api/report?id=" + encodeURIComponent(id));
  $("history-list").hidden = true; $("saved-report").hidden = false;
  $("saved-report-text").textContent = viewedReport.summary + "\n\nFull checklist:\n" + viewedReport.tasks.map(t => (t.done ? "✓ " : "○ ") + t.room + " · " + t.title).join("\n");
  $("saved-wa").href = whatsapp(viewedReport.summary);
  savedPhotos.render(viewedReport.cupboardPhotos || []);
}
$("history-list").addEventListener("click", async e => {
  const button = e.target.closest("[data-report]");
  if (!button) return;
  button.disabled = true;
  try {
    await openSavedReport(button.dataset.report);
  } catch { toast("Could not open this report. Please try again."); }
  finally { button.disabled = false; }
});
$("download-report").addEventListener("click", () => {
  if (!viewedReport) return;
  const url = URL.createObjectURL(new Blob([$("saved-report-text").textContent], { type: "text/plain;charset=utf-8" }));
  const link = document.createElement("a"); link.href = url; link.download = "Azure-cleaning-" + viewedReport.date + ".txt"; link.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
});
document.querySelectorAll("dialog").forEach(dialog => dialog.addEventListener("click", e => {
  const r = dialog.getBoundingClientRect();
  if (e.target === dialog && (e.clientX < r.left || e.clientX > r.right || e.clientY < r.top || e.clientY > r.bottom)) dialog.close();
}));
document.querySelectorAll('a[href^="#"]').forEach(a => a.addEventListener("click", () => {
  const target = a.getAttribute("href");
  document.querySelectorAll(".mobile-nav a").forEach(link => link.classList.toggle("active", link.getAttribute("href") === target));
}));
let navFrame = false;
function updateMobileNav() {
  const target = $("report").getBoundingClientRect().top < innerHeight * .45 ? "#report" : $("checklist").getBoundingClientRect().top < innerHeight * .45 ? "#checklist" : "#visit";
  document.querySelectorAll(".mobile-nav a").forEach(link => {
    const active = link.getAttribute("href") === target;
    link.classList.toggle("active", active);
    if (active) link.setAttribute("aria-current", "location"); else link.removeAttribute("aria-current");
  });
  navFrame = false;
}
window.addEventListener("scroll", () => { if (!navFrame) { navFrame = true; requestAnimationFrame(updateMobileNav); } }, { passive: true });
window.addEventListener("resize", updateMobileNav);
window.addEventListener("online", () => { sync.connect(selected); });
window.addEventListener("offline", () => sync.status());
document.addEventListener("visibilitychange", () => { if (!document.hidden) sync.poll(); });
setInterval(() => { if (!document.hidden) sync.poll(); }, 2000);
window.addEventListener("pagehide", () => sync.close());
window.addEventListener("pageshow", e => { if (e.persisted) sync.connect(selected); });
chooseDate(selected);
updateMobileNav();
const linkedReport = new URLSearchParams(location.search).get("report");
if (linkedReport) {
  $("history-dialog").showModal();
  $("history-list").textContent = "Opening saved visit…";
  openSavedReport(linkedReport).catch(() => { $("history-list").textContent = "This report could not load. Close this window and try Saved visits, or reopen the link when connected."; });
}
