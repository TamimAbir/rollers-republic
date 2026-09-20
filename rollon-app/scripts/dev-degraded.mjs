// Dev-server launcher for degraded-mode E2E: VITE_USE_REMOTE_API=true,
// VITE_API_BASE_URL pointed at a dead port (59999 — nothing listens there),
// so every remote call fails and the client must degrade visibly.
import { spawn } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const appDir = path.resolve(__dirname, '..');

const env = {
  ...process.env,
  VITE_USE_REMOTE_API: 'true',
  VITE_API_BASE_URL: 'http://localhost:59999',
  VITE_PORT: '5174',
};

const child = spawn('npx', ['vite', '--port', '5174', '--strictPort'], {
  cwd: appDir,
  env,
  stdio: ['ignore', 'inherit', 'inherit'],
  shell: process.platform === 'win32',
});

child.on('exit', (code) => process.exit(code ?? 0));
process.on('SIGTERM', () => child.kill('SIGTERM'));
process.on('SIGINT', () => child.kill('SIGINT'));
