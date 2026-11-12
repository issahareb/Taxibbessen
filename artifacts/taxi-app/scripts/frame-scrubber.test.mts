import assert from "node:assert/strict";
import { after, test } from "node:test";
import { createFrameSequence } from "../src/lib/frame-scrubber";

const originalFetch = globalThis.fetch;
const originalWindow = Object.getOwnPropertyDescriptor(globalThis, "window");
const originalBitmap = Object.getOwnPropertyDescriptor(globalThis, "createImageBitmap");
let reducedMotion = false;
let requests: { url: string; priority: unknown }[] = [];
Object.defineProperty(globalThis, "window", { configurable: true, value: {
  matchMedia: () => ({ matches: reducedMotion }),
} });
Object.defineProperty(globalThis, "createImageBitmap", { configurable: true, value: async () => ({
  width: 600, height: 1067, close() {},
}) });
globalThis.fetch = async (url, options) => {
  requests.push({ url: String(url), priority: options?.priority });
  return new Response(new Uint8Array([1]), { status: 200 });
};
const settle = () => new Promise<void>(resolve => setImmediate(resolve));
after(() => {
  globalThis.fetch = originalFetch;
  for (const [key, descriptor] of [["window", originalWindow], ["createImageBitmap", originalBitmap]] as const) {
    if (descriptor) Object.defineProperty(globalThis, key, descriptor);
    else Reflect.deleteProperty(globalThis, key);
  }
});

test("foreground warmup keeps two frames ready, then restores the normal buffer", async () => {
  requests = [];
  const sequence = createFrameSequence(91, frame => `/frame-${frame}.jpg`, { warmupRadius: 1 });
  sequence.start();
  await settle();
  assert.deepEqual(requests.map(request => request.url), ["/frame-1.jpg", "/frame-2.jpg"]);
  assert(sequence.exact(0));
  assert(sequence.exact(1));
  assert(requests.every(request => request.priority === "low"));
  sequence.finishWarmup();
  await settle();
  // exact(1) moved the playhead, so its normal window spans frames 0–13.
  assert.equal(new Set(requests.map(request => request.url)).size, 14);
  sequence.finishWarmup();
  sequence.start();
  await settle();
  assert.equal(requests.length, 14);
  sequence.destroy();
});

test("an early scroll fills the normal window around the requested frame", async () => {
  requests = [];
  const sequence = createFrameSequence(91, frame => `/frame-${frame}.jpg`, { warmupRadius: 1 });
  sequence.start();
  sequence.finishWarmup();
  sequence.exact(60);
  await settle();
  assert(sequence.exact(60));
  assert(requests.some(request => request.url === "/frame-61.jpg"));
  sequence.destroy();
  const count = requests.length;
  sequence.finishWarmup();
  sequence.exact(0);
  await settle();
  assert.equal(requests.length, count);
});

test("reduced motion still avoids every frame request", async () => {
  requests = [];
  reducedMotion = true;
  const sequence = createFrameSequence(91, frame => `/frame-${frame}.jpg`, { warmupRadius: 1 });
  sequence.finishWarmup();
  sequence.start();
  await settle();
  assert.equal(requests.length, 0);
  sequence.destroy();
  reducedMotion = false;
});
