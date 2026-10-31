const assert = require('node:assert/strict');
const { randomUUID } = require('node:crypto');
const fs = require('node:fs');
const path = require('node:path');
const base = process.env.AZURE_TEST_API || 'http://127.0.0.1:5173';
if (new URL(base).hostname !== '127.0.0.1' || new URL(base).protocol !== 'http:') throw new Error('Photo tests require the loopback test database.');
const origin = 'http://127.0.0.1:4173';
async function phone() {
  const { token } = await (await fetch(base + '/api/session', { headers: { Origin: origin } })).json();
  return (route, body, type = 'application/json') => fetch(base + route, {
    method: body ? 'POST' : 'GET', headers: { Origin: origin, Authorization: 'Bearer ' + token, 'Content-Type': type },
    ...(body ? { body: type === 'application/json' ? JSON.stringify(body) : body } : {})
  });
}
(async () => {
  const [a, b] = await Promise.all([phone(), phone()]);
  const date = '2098-10-21', other = '2098-10-22', root = '/api/cupboard-photos';
  // Re-runnable fixtures: soft-remove only this test's local dated photos.
  for (const day of [date, other]) {
    const prior = await (await a(root + '?date=' + day)).json();
    for (const p of prior.photos) await a(root + '/' + p.id + '/remove', {});
  }
  const photo = fs.readFileSync(path.join(__dirname, '../img/palm-coast.jpg'));
  const upload = (client, id, day = date, bytes = photo, type = 'image/jpeg') => client(root + '?date=' + day + '&id=' + id, bytes, type);
  assert.equal((await fetch(base + root + '?date=' + date)).status, 401);
  assert.equal((await upload(a, randomUUID(), 'invalid')).status, 400);
  assert.equal((await upload(a, randomUUID(), date, 'not a photo', 'text/plain')).status, 415);
  assert.equal((await upload(a, randomUUID(), date, Buffer.from('not a jpeg'))).status, 415);
  assert.equal((await upload(a, randomUUID(), date, Buffer.alloc(3 * 1024 * 1024 + 1))).status, 413);
  const id = randomUUID(); assert.equal((await upload(a, id)).status, 201);
  assert.equal((await upload(b, id)).status, 200);
  assert.equal((await upload(b, id, other)).status, 409);
  const list = await (await b(root + '?date=' + date)).json();
  assert.deepEqual(list.photos.map(p => p.id), [id]);
  assert.equal((await (await b(root + '?date=' + other)).json()).photos.length, 0);
  const image = await b(root + '/' + id + '/image'); assert.equal(image.headers.get('content-type'), 'image/jpeg');
  assert.deepEqual(Buffer.from(await image.arrayBuffer()), photo);
  // A retry must never replace the bytes referenced by a previous report.
  await upload(b, id, date, Buffer.from([255, 216, 255, 217]));
  assert.deepEqual(Buffer.from(await (await b(root + '/' + id + '/image')).arrayBuffer()), photo);
  const reportId = randomUUID();
  const report = await (await a('/api/report', { id: reportId, date, notes: 'Local cupboard-photo QA', supplies: [] })).json();
  assert.deepEqual(report.cupboardPhotos.map(p => p.id), [id]);
  assert(report.summary.includes('?report=' + reportId + '#report'));
  const races = await Promise.all(Array.from({ length: 7 }, (_, i) => upload(i % 2 ? a : b, randomUUID())));
  assert.equal(races.filter(r => r.status === 201).length, 5);
  assert.equal(races.filter(r => r.status === 409).length, 2);
  assert.equal((await (await b(root + '?date=' + date)).json()).photos.length, 6);
  const concurrentId = randomUUID();
  const repeats = await Promise.all([upload(a, concurrentId, other), upload(b, concurrentId, other)]);
  assert.deepEqual(repeats.map(r => r.status).sort(), [200, 201]);
  assert.equal((await (await b(root + '?date=' + other)).json()).photos.length, 1);
  assert.equal((await (await b(root + '/latest')).json()).date, other);
  await b(root + '/' + id + '/remove', {});
  assert.equal((await upload(a, id)).status, 409);
  assert(!(await (await a(root + '?date=' + date)).json()).photos.some(p => p.id === id));
  const saved = await (await b('/api/report?id=' + reportId)).json();
  assert.deepEqual(saved, report);
  assert.deepEqual(Buffer.from(await (await b(root + '/' + id + '/image')).arrayBuffer()), photo);
  assert.equal((await fetch(base + root + '/' + id + '/image')).status, 401);
  console.log('PASS: photo upload/readback, two phones, validation, retry safety, date isolation, concurrent six-photo limit, latest photos and immutable report photos after removal.');
})().catch(error => { console.error(error); process.exitCode = 1; });
