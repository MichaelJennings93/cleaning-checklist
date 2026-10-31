const assert = require('node:assert/strict');
const { randomUUID } = require('node:crypto');
const base = process.env.AZURE_TEST_API || 'http://127.0.0.1:5173';
if (new URL(base).hostname !== '127.0.0.1' || new URL(base).protocol !== 'http:') throw new Error('Repairs tests require the loopback test database.');
const origin = 'http://127.0.0.1:4173';
async function phone() {
  const response = await fetch(base + '/api/session', { headers: { Origin: origin } });
  assert.equal(response.status, 200);
  const { token } = await response.json();
  return async (path, body) => {
    const result = await fetch(base + path, { method: body ? 'POST' : 'GET', headers: { Origin: origin, Authorization: 'Bearer ' + token, 'Content-Type': 'application/json' }, ...(body ? { body: JSON.stringify(body) } : {}) });
    return { status: result.status, ...await result.json() };
  };
}
(async () => {
  const [a, b] = await Promise.all([phone(), phone()]);
  assert.equal((await fetch(base + '/api/issues')).status, 401);
  let all = await a('/api/issues');
  for (const id of ['sauna-benches', 'sauna-glass-timber', 'fountain-bottom-light', 'artificial-grass', 'sofa-cushions', 'bathroom-bidet-spray']) assert(all.issues.some(x => x.id === id));
  assert.match(all.issues.find(x => x.id === 'bathroom-bidet-spray').title, /leaking bidet spray/);
  const id = randomUUID(), path = '/api/issues/' + id;
  let result = await a('/api/issues', { id, fields: { title: 'Local integration repair', area: 'Bathroom', trade: 'Plumber' } });
  assert.equal(result.status, 201); assert.equal(result.issue.revision, 1);
  const repeat = await a('/api/issues', { id, fields: { title: 'Must not overwrite' } });
  assert.equal(repeat.issue.title, 'Local integration repair');
  result = await a(path, { revision: 1, changes: { status: 'progress', assignedTo: 'Local test contractor', notes: 'Quote requested' } });
  assert.equal(result.status, 200);
  const onOtherPhone = (await b('/api/issues')).issues.find(x => x.id === id);
  assert.equal(onOtherPhone.status, 'progress'); assert.equal(onOtherPhone.notes, 'Quote requested');
  const conflict = await b(path, { revision: 1, changes: { status: 'fixed' } });
  assert.equal(conflict.status, 409); assert.equal(conflict.issue.status, 'progress');
  result = await b(path, { revision: 2, changes: { status: 'fixed' } });
  assert.equal(result.status, 200); assert(result.issue.fixedAt > 0);
  const fixedAt = result.issue.fixedAt;
  result = await a(path, { revision: 3, changes: { notes: 'Repair completed' } });
  assert.equal(result.issue.fixedAt, fixedAt);
  result = await a(path, { revision: 4, changes: { status: 'todo' } });
  assert.equal(result.issue.fixedAt, null);
  const race = await Promise.all([a(path, { revision: 5, changes: { status: 'progress' } }), b(path, { revision: 5, changes: { status: 'fixed' } })]);
  assert.deepEqual(race.map(x => x.status).sort(), [200, 409]);
  for (const changes of [{ status: 'unknown' }, { title: '   ' }, { revision: 1 }, { notes: 'x'.repeat(5001) }]) assert.equal((await a(path, { revision: 6, changes })).status, 400);
  assert.equal((await a('/api/issues', { id: randomUUID(), fields: { title: '' } })).status, 400);
  const final = (await b('/api/issues')).issues.find(x => x.id === id);
  assert.equal(final.revision, 6); assert.equal(final.notes, 'Repair completed');
  console.log('PASS: six seeded repairs, two-phone shared state, idempotent creation, completion dates, reopen, simultaneous edit protection and validation.');
})().catch(error => { console.error(error); process.exitCode = 1; });
