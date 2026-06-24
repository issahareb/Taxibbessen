import sharp from "sharp";
import { readdir, stat, access } from "fs/promises";
import { join, extname, basename } from "path";
import { fileURLToPath } from "url";
import { dirname } from "path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const publicDir = join(__dirname, "..", "public");

const AVIF_OPTIONS = { quality: 60, effort: 4 };
const WEBP_OPTIONS = { quality: 82, effort: 4 };

async function exists(p) {
  try { await access(p); return true; } catch { return false; }
}

async function convertDir(dir) {
  let files;
  try {
    files = await readdir(dir);
  } catch {
    console.log(`Skipping ${dir} (not found)`);
    return;
  }

  for (const file of files) {
    const ext = extname(file).toLowerCase();
    const filePath = join(dir, file);
    const s = await stat(filePath);
    if (!s.isFile()) continue;

    const nameNoExt = basename(file, ext);

    if (ext === ".png" || ext === ".jpg" || ext === ".jpeg") {
      const webpOut = join(dir, `${nameNoExt}.webp`);
      const avifOut = join(dir, `${nameNoExt}.avif`);

      await sharp(filePath).webp(WEBP_OPTIONS).toFile(webpOut);
      console.log(`  ✓ ${file} → ${nameNoExt}.webp`);

      await sharp(filePath).avif(AVIF_OPTIONS).toFile(avifOut);
      console.log(`  ✓ ${file} → ${nameNoExt}.avif`);
    }

    if (ext === ".webp") {
      const avifOut = join(dir, `${nameNoExt}.avif`);
      await sharp(filePath).avif(AVIF_OPTIONS).toFile(avifOut);
      console.log(`  ✓ ${file} → ${nameNoExt}.avif`);
    }
  }
}

// Generate responsive (resized) variants for specific key images.
// This helps browsers on narrow viewports load a smaller file.
async function generateResponsiveVariants() {
  const variants = [
    {
      src: join(publicDir, "hero-sharp.webp"),
      outputs: [
        { suffix: "-540w", width: 540 },
      ],
    },
    {
      src: join(publicDir, "story-bg.webp"),
      outputs: [
        { suffix: "-400w", width: 400 },
        { suffix: "-800w", width: 800 },
      ],
    },
  ];

  for (const { src, outputs } of variants) {
    if (!(await exists(src))) {
      console.log(`  Skipping responsive variants for ${src} (not found)`);
      continue;
    }
    const dir = dirname(src);
    const nameNoExt = basename(src, extname(src));
    for (const { suffix, width } of outputs) {
      const outWebp = join(dir, `${nameNoExt}${suffix}.webp`);
      await sharp(src).resize(width).webp(WEBP_OPTIONS).toFile(outWebp);
      console.log(`  ✓ ${basename(src)} → ${basename(outWebp)}`);
    }
  }
}

console.log("Converting public/icons/ …");
await convertDir(join(publicDir, "icons"));

console.log("Converting public/images/ …");
await convertDir(join(publicDir, "images"));

console.log("Generating responsive image variants …");
await generateResponsiveVariants();

console.log("Done.");
