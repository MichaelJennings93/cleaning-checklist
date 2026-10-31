const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const root = path.resolve(__dirname, '..');
const source = ['data.js', 'guides-data.js'].map(file => fs.readFileSync(path.join(root, file), 'utf8')).join('\n');
const { guides, videos, metadata, photos, tasks, categories } = vm.runInNewContext(source + '; ({guides: HOME_GUIDES, videos: V, metadata: GUIDE_VIDEOS, photos: ALL_PHOTOS, tasks: ROOMS.flatMap(r => r.tasks), categories: GUIDE_CATEGORIES})');

test('the handbook includes every checklist video and resolves all device content', () => {
  const ids = new Set(), included = new Set(), taskTitles = new Set(tasks.map(t => t[1]));
  for (const guide of guides) {
    assert(!ids.has(guide.id), 'duplicate guide link: ' + guide.id); ids.add(guide.id);
    assert(categories.some(([id]) => id === guide.category), guide.id + ': category');
    for (const key of new Set([guide.photo, ...(guide.photos || [])])) {
      assert(photos[key], guide.id + ': missing photo ' + key);
      assert(fs.existsSync(path.join(root, photos[key].src)), photos[key].src);
    }
    for (const key of guide.videos || []) {
      assert(videos[key] && metadata[key], guide.id + ': missing video ' + key);
      assert.match(videos[key][1], /^https:\/\/(www\.)?youtube\.com\/watch\?v=[\w-]{11}$/);
      included.add(key);
    }
    for (const title of guide.tasks || []) assert(taskTitles.has(title), guide.id + ': missing task ' + title);
    assert(guide.html || guide.steps?.length || guide.tasks?.length, guide.id + ': missing care notes');
  }
  assert.deepEqual([...included].sort(), Object.keys(videos).sort(), 'every video must be discoverable in Guides');
});
