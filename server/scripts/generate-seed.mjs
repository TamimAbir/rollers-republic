#!/usr/bin/env node
/**
 * Generates server/seed.json from the frontend's canonical data source
 * (rollon-app/src/data/products.ts).
 *
 * The data file is the single source of truth (AGENTS.md: no duplicate data).
 * This script transpiles it with esbuild (already available in rollon-app's
 * node_modules), imports the exports, and writes a plain JSON snapshot that the
 * reference API server can load without TypeScript tooling.
 *
 * Usage:
 *   node server/scripts/generate-seed.mjs
 *
 * Output:
 *   server/seed.json  — { categories, products, testimonials }
 */
import { writeFileSync, mkdirSync, rmSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import { createRequire } from 'node:module';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const serverDir = path.resolve(__dirname, '..');
const rootDir = path.resolve(serverDir, '..');
const appDir = path.join(rootDir, 'rollon-app');
const dataFile = path.join(appDir, 'src', 'data', 'products.ts');
const outFile = path.join(serverDir, '.seed-build.mjs');

// Load esbuild: prefer the server's own devDependency, fall back to the app's.
const require = (await import('node:module')).createRequire(import.meta.url);
let esbuildPath;
try {
  esbuildPath = require.resolve('esbuild'); // server/node_modules
} catch {
  esbuildPath = require.resolve('esbuild', { paths: [appDir] }); // rollon-app/node_modules
}
const esbuild = require(esbuildPath);

// 1. Transpile the TS data file to ESM (type-only imports are dropped).
try {
  await esbuild.build({
    entryPoints: [dataFile],
    format: 'esm',
    outfile: outFile,
    bundle: false,
    logLevel: 'error',
  });
} catch (err) {
  console.error('Failed to transpile data file with esbuild.', err.message);
  process.exit(1);
}

// 2. Import the transpiled module and snapshot its exports.
const mod = await import(new URL(`file://${outFile.replaceAll('\\', '/')}`).href);
const { categories, products, testimonials } = mod;

if (!Array.isArray(products) || !Array.isArray(categories)) {
  console.error('Unexpected exports in data file. Expected categories[], products[], testimonials[].');
  process.exit(1);
}

// 3. Write the seed snapshot.
const seed = { categories, products, testimonials };
mkdirSync(serverDir, { recursive: true });
writeFileSync(path.join(serverDir, 'seed.json'), JSON.stringify(seed, null, 2) + '\n');

// 4. Clean up the temp build file.
try {
  rmSync(outFile, { force: true });
} catch { /* non-fatal */ }

console.log(
  `seed.json written: ${categories.length} categories, ${products.length} products, ${testimonials.length} testimonials`,
);
