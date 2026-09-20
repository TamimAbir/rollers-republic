// Checks that server/seed.json is in sync with the canonical frontend data
// (rollon-app/src/data/products.ts). Regenerates to a temp file and diffs.
// Exit 0 = in sync, exit 1 = drift (products.ts changed without regeneration).
//
// Usage: node server/scripts/check-seed-sync.mjs
import { execFileSync } from 'node:child_process';
import { readFileSync, writeFileSync, mkdtempSync, rmSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import os from 'node:os';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const serverDir = path.resolve(__dirname, '..');
const rootDir = path.resolve(serverDir, '..');
const appDir = path.join(rootDir, 'rollon-app');
const dataFile = path.join(appDir, 'src', 'data', 'products.ts');
const committed = path.join(serverDir, 'seed.json');
const tmpDir = mkdtempSync(path.join(os.tmpdir(), 'seed-check-'));

// Locate esbuild: prefer the server's own devDependency, fall back to the app's.
const require = (await import('node:module')).createRequire(import.meta.url);
let esbuildPath;
try {
  esbuildPath = require.resolve('esbuild'); // server/node_modules
} catch {
  esbuildPath = require.resolve('esbuild', { paths: [appDir] }); // rollon-app/node_modules
}
const esbuild = require(esbuildPath);

const outFile = path.join(tmpDir, 'seed-build.mjs');
const candidateFile = path.join(tmpDir, 'seed.json');

try {
  await esbuild.build({ entryPoints: [dataFile], format: 'esm', outfile: outFile, bundle: false, logLevel: 'error' });
  const mod = await import(new URL(`file://${outFile.replaceAll('\\', '/')}`).href);
  const { categories, products, testimonials } = mod;
  writeFileSync(candidateFile, JSON.stringify({ categories, products, testimonials }, null, 2) + '\n');

  const a = readFileSync(committed, 'utf8');
  const b = readFileSync(candidateFile, 'utf8');

  if (a === b) {
    console.log('✅ seed.json is in sync with rollon-app/src/data/products.ts');
    process.exit(0);
  }

  console.error('❌ seed.json is OUT OF SYNC with rollon-app/src/data/products.ts');
  console.error('   Run: npm run generate:seed (in server/) and commit the updated seed.json');
  process.exit(1);
} finally {
  try { rmSync(tmpDir, { recursive: true, force: true }); } catch { /* best effort */ }
}
