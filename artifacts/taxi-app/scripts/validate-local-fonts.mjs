import { readdir, readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { join } from 'node:path';

// Check the shipped files, including bundled CSS and prerendered HTML.
const root = fileURLToPath(new URL('../dist/public/', import.meta.url));
async function check(directory) {
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const path = join(directory, entry.name);
    if (entry.isDirectory()) await check(path);
    else if (/\.(html|css|js)$/.test(entry.name)) {
      const source = await readFile(path, 'utf8');
      if (/fonts\.(?:googleapis|gstatic)\.com/i.test(source)) {
        throw new Error(`External Google Fonts reference in ${path}; use local font files.`);
      }
    }
  }
}
await check(root);
console.log('OK — production output contains no external Google Fonts references.');
