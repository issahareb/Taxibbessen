import { readFileSync, readdirSync, statSync } from 'fs';
import { join } from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const DIST = join(__dirname, '..', 'dist', 'public');
const DEEP = process.argv.includes('--deep');

const SCHEMA_ORG_API = 'https://validator.schema.org/validate';

type SchemaBlock = {
  file: string;
  index: number;
  data: unknown;
};

type ValidationError = {
  file: string;
  index: number;
  message: string;
};

function collectHtmlFiles(dir: string): string[] {
  const results: string[] = [];
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) {
      results.push(...collectHtmlFiles(full));
    } else if (entry === 'index.html') {
      results.push(full);
    }
  }
  return results;
}

function extractSchemaBlocks(file: string): SchemaBlock[] {
  const html = readFileSync(file, 'utf-8');
  const blocks: SchemaBlock[] = [];
  const re = /<script[^>]+type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi;
  let match: RegExpExecArray | null;
  let index = 0;
  while ((match = re.exec(html)) !== null) {
    blocks.push({ file, index: index++, data: match[1].trim() });
  }
  return blocks;
}

function validateStructure(block: SchemaBlock): ValidationError[] {
  const errors: ValidationError[] = [];
  let parsed: unknown;

  try {
    parsed = JSON.parse(block.data as string);
  } catch (e: unknown) {
    errors.push({
      file: block.file,
      index: block.index,
      message: `JSON parse error: ${(e as Error).message}`,
    });
    return errors;
  }

  block.data = parsed;

  function checkNode(node: unknown, path: string) {
    if (typeof node !== 'object' || node === null || Array.isArray(node)) {
      errors.push({
        file: block.file,
        index: block.index,
        message: `${path}: Schema root must be a JSON object.`,
      });
      return;
    }

    const obj = node as Record<string, unknown>;

    if (typeof obj['@context'] !== 'string' || !obj['@context']) {
      errors.push({
        file: block.file,
        index: block.index,
        message: `${path}: Missing or invalid "@context" field.`,
      });
    }

    const typeValue = obj['@type'];
    const hasType =
      (typeof typeValue === 'string' && typeValue.length > 0) ||
      (Array.isArray(typeValue) &&
        typeValue.length > 0 &&
        typeValue.every((t) => typeof t === 'string' && t.length > 0));
    const hasGraph =
      Array.isArray(obj['@graph']) && obj['@graph'].length > 0;

    if (!hasType && !hasGraph) {
      errors.push({
        file: block.file,
        index: block.index,
        message:
          `${path}: Must have a non-empty "@type" (string or string[]) or a non-empty "@graph" array.`,
      });
    }

    if (hasGraph) {
      (obj['@graph'] as unknown[]).forEach((item, i) => {
        if (typeof item !== 'object' || item === null || Array.isArray(item)) {
          errors.push({
            file: block.file,
            index: block.index,
            message: `${path}/@graph[${i}]: Each graph node must be a JSON object.`,
          });
          return;
        }
        const graphNode = item as Record<string, unknown>;
        const nodeType = graphNode['@type'];
        const nodeHasType =
          (typeof nodeType === 'string' && nodeType.length > 0) ||
          (Array.isArray(nodeType) &&
            nodeType.length > 0 &&
            nodeType.every((t) => typeof t === 'string' && t.length > 0));
        if (!nodeHasType) {
          errors.push({
            file: block.file,
            index: block.index,
            message: `${path}/@graph[${i}]: Missing or invalid "@type" field.`,
          });
        }
      });
    }
  }

  checkNode(parsed, `block[${block.index}]`);
  return errors;
}

async function validateDeep(block: SchemaBlock): Promise<ValidationError[]> {
  const errors: ValidationError[] = [];
  const payload = JSON.stringify(block.data);

  try {
    const res = await fetch(SCHEMA_ORG_API, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: `url=&code=${encodeURIComponent(payload)}`,
      signal: AbortSignal.timeout(10_000),
    });

    if (!res.ok) {
      errors.push({
        file: block.file,
        index: block.index,
        message: `Schema.org API returned HTTP ${res.status} – skipping deep check.`,
      });
      return errors;
    }

    const json = (await res.json()) as {
      errors?: Array<{ message?: string; owlErrors?: string[] }>;
      warnings?: unknown[];
    };

    const apiErrors = json.errors ?? [];
    for (const err of apiErrors) {
      const msg =
        err.owlErrors?.join('; ') ?? err.message ?? JSON.stringify(err);
      errors.push({
        file: block.file,
        index: block.index,
        message: `Schema.org Validator: ${msg}`,
      });
    }
  } catch (e: unknown) {
    errors.push({
      file: block.file,
      index: block.index,
      message: `Schema.org API unreachable (${(e as Error).message}) – deep check skipped.`,
    });
  }

  return errors;
}

async function main() {
  let htmlFiles: string[];

  try {
    htmlFiles = collectHtmlFiles(DIST);
  } catch {
    console.error(`\n❌  dist/public not found – run the build first.\n`);
    process.exit(1);
  }

  if (htmlFiles.length === 0) {
    console.error(`\n❌  No index.html files found in dist/public.\n`);
    process.exit(1);
  }

  const allBlocks: SchemaBlock[] = [];
  for (const file of htmlFiles) {
    allBlocks.push(...extractSchemaBlocks(file));
  }

  if (allBlocks.length === 0) {
    console.warn(
      '\n⚠️   No <script type="application/ld+json"> blocks found in any page.\n',
    );
    process.exit(0);
  }

  const allErrors: ValidationError[] = [];

  for (const block of allBlocks) {
    const structErrors = validateStructure(block);
    allErrors.push(...structErrors);
  }

  if (DEEP) {
    console.log(
      `\n🔍  Deep validation via Schema.org Validator API (${allBlocks.length} blocks)…`,
    );
    const validBlocks = allBlocks.filter((b) => typeof b.data === 'object');
    const deepResults = await Promise.all(
      validBlocks.map((b) => validateDeep(b)),
    );
    for (const errs of deepResults) {
      allErrors.push(...errs);
    }
  }

  if (allErrors.length > 0) {
    const fatal = allErrors.filter(
      (e) =>
        !e.message.startsWith('Schema.org API unreachable') &&
        !e.message.includes('HTTP '),
    );
    const warnings = allErrors.filter(
      (e) =>
        e.message.startsWith('Schema.org API unreachable') ||
        e.message.includes('HTTP '),
    );

    if (warnings.length > 0) {
      console.warn('\n⚠️   Deep-validation warnings (non-fatal):');
      for (const w of warnings) {
        const rel = w.file.replace(DIST, 'dist/public');
        console.warn(`   ${rel} block[${w.index}]: ${w.message}`);
      }
    }

    if (fatal.length > 0) {
      console.error(`\n❌  Schema-Markup validation failed:\n`);
      for (const err of fatal) {
        const rel = err.file.replace(DIST, 'dist/public');
        console.error(`   ${rel} block[${err.index}]: ${err.message}`);
      }
      console.error(
        `\nBitte korrigiere das Schema-Markup in prerender.mts und baue erneut.\n`,
      );
      process.exit(1);
    }
  }

  const relPaths = [...new Set(allBlocks.map((b) => b.file))].map((f) =>
    f.replace(DIST, 'dist/public'),
  );

  console.log(
    `\n✅  Schema-Markup valid: ${allBlocks.length} ld+json block(s) across ${htmlFiles.length} page(s).`,
  );
  if (DEEP) {
    console.log(`   Deep validation via Schema.org API: passed.\n`);
  }
  relPaths.forEach((p) => console.log(`   ${p}`));
  console.log('');
}

main().catch((e: unknown) => {
  console.error('Unexpected error:', e);
  process.exit(1);
});
