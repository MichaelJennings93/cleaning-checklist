const { test } = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");
const cp = require("node:child_process");
const C = require("../core.js");
const root = path.resolve(__dirname, "..");
const dataText = fs.readFileSync(path.join(root, "data.js"), "utf8");
const { rooms, media, photos, videos } = vm.runInNewContext(dataText + "; ({ rooms: ROOMS, media: MEDIA, photos: ALL_PHOTOS, videos: V })");
const mon = C.fromKey("2026-11-09"), thu = C.fromKey("2026-11-05"), monthly = C.fromKey("2026-11-02");
test("guide additions preserve original task IDs, schedules, safety notes and media", () => {
  const original = cp.execFileSync("git", ["show", "64887cad9aaf6abc8393d8965d71e84a737811f2:index.html"], { cwd: root, encoding: "utf8" });
  const start = original.indexOf("const V ="), end = original.indexOf("const COLORS =");
  const baseline = vm.runInNewContext(original.slice(start, end) + "; ({ rooms: ROOMS, media: MEDIA, photos: ALL_PHOTOS, videos: V })");
  const json = value => JSON.stringify(value);
  assert.equal(rooms.length, baseline.rooms.length);
  baseline.rooms.forEach((room, ri) => {
    assert.equal(rooms[ri].title, room.title);
    assert(rooms[ri].tasks.length >= room.tasks.length, "new tasks must be appended after existing IDs");
    assert.equal(json(rooms[ri].warn), json(room.warn));
    room.tasks.forEach((task, ti) => {
      assert.equal(json(rooms[ri].tasks[ti].slice(0, 2)), json(task.slice(0, 2)), `stable task ${ri}-${ti}`);
      if (!["Grill: clean and polish", "Sofa", "Floors touch-up"].includes(task[1])) assert.equal(rooms[ri].tasks[ti][2], task[2]);
      if (["Sofa", "Floors touch-up"].includes(task[1])) assert(rooms[ri].tasks[ti][2].startsWith(task[2]), `retain original instructions for ${task[1]}`);
    });
  });
  for (const [key, photo] of Object.entries(baseline.photos)) assert.equal(json(photos[key]), json(photo));
  for (const [key, video] of Object.entries(baseline.videos)) assert.equal(json(videos[key]), json(video));
  for (const [title, guide] of Object.entries(baseline.media)) {
    for (const key of guide.p || []) assert(media[title].p.includes(key), `${title}: ${key}`);
    for (const key of guide.v || []) assert(media[title].v.includes(key), `${title}: ${key}`);
  }
});
test("Monday, Thursday, and first-Monday monthly schedules are distinct", () => {
  const monday = C.tasksFor(rooms, mon), thursday = C.tasksFor(rooms, thu), month = C.tasksFor(rooms, monthly);
  assert.equal(monday.length, 62); assert.equal(thursday.length, 49); assert.equal(month.length, 69);
  assert(monday.some(t => t.title === "Change the bedding"));
  assert(!thursday.some(t => t.title === "Change the bedding"));
  assert(thursday.some(t => t.title === "Balcony glass"));
  assert(!monday.some(t => t.when === "monthly"));
  assert.equal(month.filter(t => t.when === "monthly").length, 6);
});
test("fountain water changes repeat every 14 days across month and year boundaries", () => {
  const title = "Fountain: replace all the water";
  const due = ["2026-11-02", "2026-11-16", "2026-11-30", "2026-12-14", "2026-12-28", "2027-01-11"];
  for (const key of due) {
    const date = C.fromKey(key), tasks = C.tasksFor(rooms, date), task = tasks.find(t => t.title === title);
    assert(task, key + " must include the full water change");
    assert.equal(task.id, "5-12");
    assert(tasks.some(t => t.title === "Fountain" && t.when === "every"));
    assert(C.visitSummary(tasks, {}, date, "", []).includes(title));
  }
  for (const key of ["2026-10-19", "2026-10-26", "2026-11-05", "2026-11-09", "2026-11-23", "2026-12-07", "2027-01-04"]) {
    assert(!C.tasksFor(rooms, C.fromKey(key)).some(t => t.title === title), key + " must not include a water change");
  }
});

test("Dubai date handles UTC midnight boundaries; invalid dates are rejected", () => {
  assert.equal(C.dateKey(C.dubaiToday(new Date("2026-10-31T21:00:00Z"))), "2026-11-01");
  assert.equal(C.dateKey(C.dubaiToday(new Date("2026-10-31T19:59:00Z"))), "2026-10-31");
  for (const value of ["2026-02-30", "bad", "", null, "2026-13-01"]) assert.equal(C.fromKey(value), null);
  assert.deepEqual(C.visitDates(C.fromKey("2026-10-31")).map(C.dateKey), ["2026-10-29", "2026-11-02", "2026-11-05", "2026-11-09"]);
  assert(C.firstMonday(C.fromKey("2026-12-07")));
  assert(!C.firstMonday(C.fromKey("2026-12-14")));
});
test("one shared list includes every room with unique stable task IDs", () => {
  const tasks = C.tasksFor(rooms, monthly);
  assert.equal(new Set(tasks.map(t => t.id)).size, tasks.length);
  assert.equal(new Set(tasks.map(t => t.ri)).size, rooms.length);
});
test("all referenced guide photos exist locally", () => {
  for (const p of Object.values(photos)) assert(fs.existsSync(path.join(root, p.src)), p.src);
  for (const m of Object.values(media)) for (const name of m.p || []) if (!name.startsWith("done:")) assert(photos[name], name);
});
test("reports stay truthful and include outstanding work, notes and selected supplies", () => {
  const tasks = C.tasksFor(rooms, thu);
  const incomplete = C.visitSummary(tasks, { [tasks[0].id]: true }, thu, "Test note", ["Bin bags"]);
  assert.match(incomplete, /Cleaning update/);
  assert.match(incomplete, /Done: 1 of 49 tasks/);
  assert.match(incomplete, /Still to do:/);
  assert(!incomplete.includes("- Robot and dishwasher: Robot: empty, fill, start"));
  assert.match(incomplete, /Test note/); assert.match(incomplete, /Please restock:\n- Bin bags/);
  const complete = C.visitSummary(tasks, Object.fromEntries(tasks.map(t => [t.id, true])), thu, "", []);
  assert.match(complete, /Cleaning complete/); assert(!complete.includes("Still to do"));
});
