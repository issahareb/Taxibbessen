import { routeConfigs } from '../src/routes.ts';
import { PAGE_META_MANIFEST } from '../src/page-meta-manifest.ts';

const manifestPaths = new Set(PAGE_META_MANIFEST.map((e) => e.path));

const missing = routeConfigs.filter((r) => !manifestPaths.has(r.path));

if (missing.length > 0) {
  console.error('\n❌  Build aborted: Fehlende Einträge in page-meta-manifest.ts:\n');
  missing.forEach((r) => console.error(`   ${r.path}`));
  console.error(
    '\nBitte füge für jede fehlende Route einen Eintrag in\n' +
    'artifacts/taxi-app/src/page-meta-manifest.ts hinzu.\n' +
    'Indexierbare Routen benötigen title + description.\n' +
    'Nicht-indexierbare Routen benötigen zusätzlich noindex: true.\n',
  );
  process.exit(1);
}

console.log(`✅  page-meta-manifest: alle ${routeConfigs.length} Routen abgedeckt.`);
