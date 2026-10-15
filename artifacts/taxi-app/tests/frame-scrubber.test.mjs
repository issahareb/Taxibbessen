import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createFrameSequence } from '../src/lib/frame-scrubber.ts';

globalThis.window = { matchMedia: () => ({ matches: false }) };
const tick = () => new Promise(resolve => setTimeout(resolve, 0));

test('defers both exact and nearest reads until start; stops work on destroy', async () => {
  let fetched = 0;
  let live = 0;
  globalThis.fetch = async () => { fetched++; return { blob: async () => ({}) }; };
  globalThis.createImageBitmap = async () => { live++; return { close() { live--; } }; };
  const sequence = createFrameSequence(100, n => `/frame-${n}`, { windowRadius: 2 });
  assert.equal(sequence.nearest(4), null);
  assert.equal(sequence.exact(4), null);
  assert.equal(fetched, 0);
  sequence.start();
  await tick();
  assert.ok(fetched > 0);
  sequence.destroy();
  await tick();
  assert.equal(live, 0);
  assert.equal(sequence.exact(4), null);
});

test('settled playhead does not repeatedly evict and decode the edge frame', async () => {
  let fetched = 0;
  let live = 0;
  globalThis.fetch = async () => { fetched++; return { blob: async () => ({}) }; };
  globalThis.createImageBitmap = async () => { live++; return { close() { live--; } }; };
  const sequence = createFrameSequence(100, n => `/frame-${n}`, { windowRadius: 2 });
  sequence.start();
  await tick();
  sequence.exact(30);
  await tick();
  assert.equal(live, 5);
  const settled = fetched;
  for (let i = 0; i < 10; i++) { assert.ok(sequence.exact(30)); await tick(); }
  assert.equal(fetched, settled);
  sequence.destroy();
  assert.equal(live, 0);
});

test('late decodes outside the new playhead window are released', async () => {
  const completions = [];
  let live = 0;
  globalThis.fetch = async () => ({ blob: async () => ({}) });
  globalThis.createImageBitmap = () => new Promise(resolve => completions.push(() => {
    live++;
    resolve({ close() { live--; } });
  }));
  const sequence = createFrameSequence(100, n => `/frame-${n}`, { concurrency: 2, windowRadius: 1 });
  sequence.start();
  await tick();
  sequence.exact(80);
  completions.splice(0).forEach(finish => finish());
  await tick();
  assert.equal(live, 0);
  sequence.destroy();
  completions.splice(0).forEach(finish => finish());
  await tick();
  assert.equal(live, 0);
});
