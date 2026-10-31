const test = require('node:test');
const assert = require('node:assert/strict');
const RepairsClient = require('../repairs-client.js');
const item = (revision, status = 'todo') => ({ id: 'test-job', revision, status });

test('supply clients preserve confirmed state and expose existing requests on conflicts', async () => {
  let fail = false;
  const calls = [];
  const client = new RepairsClient({ endpoint: '/api/supplies', listKey: 'items', itemKey: 'item', request: async (path, body) => {
    calls.push({ path, body });
    if (fail) throw Object.assign(new Error('Already requested'), { status: 409, result: { item: { id: 'existing-item', revision: 2, status: 'ordered' } } });
    return body ? { item: { id: 'supply-item', revision: 1, status: 'needed' } } : { items: [] };
  } });
  await client.refresh(); await client.save('supply-item', { name: 'Filter' });
  assert.equal(calls[0].path, '/api/supplies');
  fail = true;
  await assert.rejects(client.save('supply-item', { status: 'restocked' }, 1));
  assert.equal(calls[2].path, '/api/supplies/supply-item');
  assert.equal(client.records.get('supply-item').status, 'needed');
  assert.equal(client.records.get('existing-item').status, 'ordered');
});

test('delayed polling cannot replace a newer confirmed repair', () => {
  let renders = 0;
  const client = new RepairsClient({ request: async () => {}, onChange: () => renders++ });
  client.merge([item(2, 'fixed')]);
  client.merge([item(1)]);
  client.merge([item(2, 'fixed')]);
  assert.equal(client.records.get('test-job').status, 'fixed');
  assert.equal(renders, 1, 'unchanged polls should not replace focused controls');
});

test('failed saves retain the last confirmed state; conflicts show the latest shared state', async () => {
  let failure = new Error('Offline');
  const client = new RepairsClient({ request: async () => { throw failure; } });
  client.merge([item(1)]);
  await assert.rejects(client.save('test-job', { status: 'fixed' }, 1));
  assert.equal(client.records.get('test-job').status, 'todo');
  failure = Object.assign(new Error('Conflict'), { status: 409, result: { issue: item(2, 'progress') } });
  await assert.rejects(client.save('test-job', { status: 'fixed' }, 1));
  assert.equal(client.records.get('test-job').status, 'progress');
});

test('overlapping refreshes share one request, and retries reuse the same new-job ID', async () => {
  let finish, reads = 0, writes = [];
  const client = new RepairsClient({ request: (path, body) => {
    if (!body) { reads++; return new Promise(resolve => { finish = resolve; }); }
    writes.push({ path, body }); return Promise.resolve({ issue: item(1) });
  } });
  const a = client.refresh(), b = client.refresh();
  finish({ issues: [item(1)] }); await Promise.all([a, b]);
  assert.equal(reads, 1);
  await client.save('test-job', { title: 'New repair' }, 0);
  await client.save('test-job', { title: 'New repair' }, 0);
  assert.equal(writes[0].path, '/api/issues');
  assert.deepEqual(writes[0], writes[1]);
});
