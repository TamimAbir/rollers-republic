// Dev-server launcher that sets remote-API env vars cross-platform,
// then spawns Vite. Used by playwright.remote.config.ts webServer entry.
import { spawn } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const npmCmd = process.platform === 'win32' ? 'npm.cmd' : 'npm';

const child = spawn(npmCmd, ['run', 'dev'], {
  cwd: __dirname,
  env: {
    ...process.env,
    VITE_USE_REMOTE_API: 'true',
    VITE_API_BASE_URL: 'http://localhost:8787',
  },
  stdio: ['ignore', 'pipe', 'pipe'],
  shell: process.platform === 'win32',
});

child.stdout?.on('data', (d) => process.stdout.write(d));
child.stderr?.on('data', (d) => process.stderr.write(d));
child.on('exit', (code) => process.exit(code ?? 0));
