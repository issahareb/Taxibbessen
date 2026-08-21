/**
 * Canvas-based scroll scrubber for image sequences.
 *
 * Why not <img src={...}> per scroll frame: assigning `src` on a visible image
 * makes the browser re-attach, decode and repaint the element on the main
 * thread. At scroll speed that stutters badly. Here each frame is decoded
 * once into an ImageBitmap (off the main thread) and painted with a single
 * drawImage call, which costs almost nothing per frame.
 *
 * Only a window of frames around the current playback position stays
 * decoded. Unlike a plain <img>, an ImageBitmap is not something the browser
 * can quietly discard and redecode under memory pressure - it stays fully
 * resident until explicitly closed. A 600x1067 frame decodes to roughly
 * 2.5MB of pixel data, so keeping all ~120 frames of three sequences
 * resident at once approaches a gigabyte and reliably crashes the tab on
 * iOS Safari ("A Problem Repeatedly Occurred"). Bounding the window to a
 * couple dozen frames per sequence keeps memory in the tens of megabytes
 * while scrubbing stays just as smooth near the playhead; frames that
 * scroll back into range are cheap to redecode because the browser's HTTP
 * cache still has them.
 */

export interface FrameSequence {
  /** Start downloading. Safe to call repeatedly; only the first call counts. */
  start(): void;
  /** Nearest already-decoded frame to `index`, or null while nothing is ready. */
  nearest(index: number): ImageBitmap | HTMLImageElement | null;
  destroy(): void;
}

interface Options {
  /** Parallel downloads. Kept low so a sequence never floods the connection. */
  concurrency?: number;
  /** Frames kept decoded on each side of the current playback position. */
  windowRadius?: number;
}

type Frame = ImageBitmap | HTMLImageElement;

function closeFrame(frame: Frame): void {
  if ("close" in frame) frame.close();
}

export function createFrameSequence(
  count: number,
  pathFor: (frame: number) => string,
  { concurrency = 4, windowRadius = 12 }: Options = {},
): FrameSequence {
  const decoded = new Map<number, Frame>();
  const pending = new Set<number>();
  const queue: number[] = [];
  let disposed = false;
  let started = false;
  let active = 0;

  const canUseBitmap = typeof createImageBitmap === "function";

  async function decodeOne(index: number): Promise<void> {
    pending.add(index);
    const url = pathFor(index + 1);
    try {
      let frame: Frame;
      if (canUseBitmap) {
        const response = await fetch(url);
        const blob = await response.blob();
        if (disposed) return;
        frame = await createImageBitmap(blob);
      } else {
        frame = await new Promise<HTMLImageElement>((resolve, reject) => {
          const img = new Image();
          img.decoding = "async";
          img.onload = () => resolve(img);
          img.onerror = () => reject(new Error(`failed to load ${url}`));
          img.src = url;
        });
      }
      if (disposed) {
        closeFrame(frame);
        return;
      }
      decoded.set(index, frame);
    } catch {
      // Left undecoded; the next reconcile re-queues it if still in window.
    } finally {
      pending.delete(index);
    }
  }

  function pump(): void {
    while (!disposed && active < concurrency && queue.length > 0) {
      const index = queue.shift() as number;
      if (decoded.has(index) || pending.has(index)) continue;
      active++;
      void decodeOne(index).finally(() => {
        active--;
        pump();
      });
    }
  }

  // Re-centers the decoded window on `center`: evicts frames that fell
  // outside it (closing their ImageBitmap) and queues the missing frames
  // inside it, nearest first so the playhead fills in before the edges. A
  // hard cap on top of the distance check is what actually bounds memory:
  // a burst of in-flight decodes can finish after the playhead has already
  // moved on, and without the cap those stragglers would sit resident until
  // the next reconcile happens to notice them individually.
  const hardCap = windowRadius * 2;

  function reconcile(center: number): void {
    const clamped = Math.min(count - 1, Math.max(0, center));

    for (const [index, frame] of decoded) {
      if (Math.abs(index - clamped) > windowRadius) {
        closeFrame(frame);
        decoded.delete(index);
      }
    }

    if (decoded.size > hardCap) {
      const byDistance = [...decoded.keys()].sort(
        (a, b) => Math.abs(a - clamped) - Math.abs(b - clamped),
      );
      for (const index of byDistance.slice(hardCap)) {
        closeFrame(decoded.get(index) as Frame);
        decoded.delete(index);
      }
    }

    queue.length = 0;
    for (let d = 0; d <= windowRadius; d++) {
      const low = clamped - d;
      const high = clamped + d;
      if (low >= 0 && !decoded.has(low) && !pending.has(low)) queue.push(low);
      if (d > 0 && high < count && !decoded.has(high) && !pending.has(high)) queue.push(high);
    }
    pump();
  }

  return {
    start() {
      if (started || prefersLessMedia()) return;
      started = true;
      reconcile(0);
    },
    nearest(index) {
      if (disposed) return null;
      reconcile(index);
      const clamped = Math.min(count - 1, Math.max(0, index));
      if (decoded.has(clamped)) return decoded.get(clamped) as Frame;
      for (let d = 1; d <= windowRadius; d++) {
        const low = decoded.get(clamped - d);
        if (low) return low;
        const high = decoded.get(clamped + d);
        if (high) return high;
      }
      return null;
    },
    destroy() {
      disposed = true;
      queue.length = 0;
      for (const frame of decoded.values()) closeFrame(frame);
      decoded.clear();
    },
  };
}

/**
 * Paints `source` into `canvas` the way `object-fit: cover` would, resizing the
 * backing store to the element's box first. Device pixel ratio is capped at 2:
 * beyond that the extra pixels cost fill rate without being visible on a
 * blurred background image.
 */
export function drawCover(
  canvas: HTMLCanvasElement,
  source: ImageBitmap | HTMLImageElement,
): void {
  const cssWidth = canvas.clientWidth;
  const cssHeight = canvas.clientHeight;
  if (cssWidth === 0 || cssHeight === 0) return;

  const ratio = Math.min(window.devicePixelRatio || 1, 2);
  const targetWidth = Math.round(cssWidth * ratio);
  const targetHeight = Math.round(cssHeight * ratio);
  if (canvas.width !== targetWidth || canvas.height !== targetHeight) {
    canvas.width = targetWidth;
    canvas.height = targetHeight;
  }

  const context = canvas.getContext("2d", { alpha: false });
  if (!context) return;

  const sourceWidth = "naturalWidth" in source ? source.naturalWidth : source.width;
  const sourceHeight = "naturalHeight" in source ? source.naturalHeight : source.height;
  if (!sourceWidth || !sourceHeight) return;

  const scale = Math.max(targetWidth / sourceWidth, targetHeight / sourceHeight);
  const drawWidth = sourceWidth * scale;
  const drawHeight = sourceHeight * scale;
  context.drawImage(
    source,
    (targetWidth - drawWidth) / 2,
    (targetHeight - drawHeight) / 2,
    drawWidth,
    drawHeight,
  );
}

/** True while the viewport is phone-sized, where the portrait sequences are used. */
export function isPhoneViewport(): boolean {
  return window.matchMedia("(max-width: 767px)").matches;
}

/**
 * Visitors who asked for reduced motion, or who are on a metered connection,
 * keep the still poster instead of downloading a few megabytes of frames.
 */
export function prefersLessMedia(): boolean {
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return true;
  const connection = (navigator as Navigator & { connection?: { saveData?: boolean } }).connection;
  return connection?.saveData === true;
}
