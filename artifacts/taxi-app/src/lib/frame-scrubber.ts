/**
 * Canvas-based scroll scrubber for image sequences.
 *
 * Why not <img src={...}> per scroll frame: assigning `src` on a visible image
 * makes the browser re-attach, decode and repaint the element on the main
 * thread. At scroll speed that stutters badly. Here every frame is decoded
 * once into an ImageBitmap (off the main thread) and painted with a single
 * drawImage call, which costs almost nothing per frame.
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
}

export function createFrameSequence(
  count: number,
  pathFor: (frame: number) => string,
  { concurrency = 6 }: Options = {},
): FrameSequence {
  const decoded: (ImageBitmap | HTMLImageElement | null)[] = new Array(count).fill(null);
  let started = false;
  let disposed = false;
  let next = 0;
  let active = 0;

  const canUseBitmap = typeof createImageBitmap === "function";

  async function decode(index: number): Promise<void> {
    const url = pathFor(index + 1);
    try {
      if (canUseBitmap) {
        const response = await fetch(url);
        const blob = await response.blob();
        if (disposed) return;
        decoded[index] = await createImageBitmap(blob);
        return;
      }
    } catch {
      // fall through to the <img> path below
    }
    await new Promise<void>((resolve) => {
      const img = new Image();
      img.decoding = "async";
      img.onload = () => {
        if (!disposed) decoded[index] = img;
        resolve();
      };
      img.onerror = () => resolve();
      img.src = url;
    });
  }

  function pump(): void {
    while (!disposed && active < concurrency && next < count) {
      const index = next++;
      active++;
      void decode(index).finally(() => {
        active--;
        pump();
      });
    }
  }

  return {
    start() {
      if (started || prefersLessMedia()) return;
      started = true;
      pump();
    },
    nearest(index) {
      const clamped = Math.min(count - 1, Math.max(0, index));
      if (decoded[clamped]) return decoded[clamped];
      for (let distance = 1; distance < count; distance++) {
        const low = clamped - distance;
        if (low >= 0 && decoded[low]) return decoded[low];
        const high = clamped + distance;
        if (high < count && decoded[high]) return decoded[high];
      }
      return null;
    },
    destroy() {
      disposed = true;
      for (const frame of decoded) {
        if (frame && "close" in frame) frame.close();
      }
      decoded.fill(null);
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
