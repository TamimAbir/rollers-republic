/**
 * Global Vitest setup — runs once per test file, before any test executes.
 *
 * ## Why this file exists: Node >= 24 shadows jsdom's Web Storage
 *
 * Node 24+ exposes an experimental Web Storage global. When it is present but
 * unconfigured (i.e. `node --localstorage-file` was not passed), Node installs a
 * `localStorage` accessor on `globalThis` whose getter returns `undefined`.
 *
 * In Vitest's `jsdom` environment `window === globalThis`, so that Node accessor
 * sits directly on top of jsdom's own storage. The result is subtle and
 * deceptive: `'localStorage' in window` is `true`, yet
 * `window.localStorage` is `undefined`, so every storage-backed store test dies
 * with `TypeError: Cannot read properties of undefined (reading 'clear')`.
 *
 * This is *environment* breakage, not application breakage — the code under test
 * is correct. The fix installs a real, working Storage implementation so the
 * suite describes the application rather than the runner.
 *
 * We deliberately do NOT read storage off `document.defaultView`: that view is
 * the very global Node has shadowed, so it yields `undefined` too. Instead we
 * take storage from a freshly constructed jsdom window — which is unaffected —
 * and install it on the shared global so all consumers see one consistent
 * instance.
 *
 * Everything here is guarded and idempotent: on Node versions without the
 * Node-side global, a healthy `localStorage` is detected and left untouched.
 */
import { JSDOM } from 'jsdom';
import { afterEach, beforeEach } from 'vitest';

type StorageKind = 'localStorage' | 'sessionStorage';

const globalRef = globalThis as unknown as Partial<Record<StorageKind, Storage>>;

const isWorkingStorage = (value: unknown): value is Storage =>
  !!value &&
  typeof (value as Storage).getItem === 'function' &&
  typeof (value as Storage).setItem === 'function' &&
  typeof (value as Storage).removeItem === 'function';

/**
 * Builds a fresh JSDOM window and returns its Web Storage implementations.
 *
 * Node's shadowed global does not affect a JSDOM instance we construct
 * ourselves, so this is the one reliable source of a working implementation.
 */
function createWorkingStorage(): Partial<Record<StorageKind, Storage>> {
  const dom = new JSDOM('<!doctype html><html><body></body></html>', {
    url: 'http://localhost:3000/',
  });
  // The window is intentionally never closed: closing it can tear down its
  // storage, and these objects are handed to the entire test run.
  return { localStorage: dom.window.localStorage, sessionStorage: dom.window.sessionStorage };
}

function installStorage(): void {
  const fresh = createWorkingStorage();

  for (const kind of ['localStorage', 'sessionStorage'] as StorageKind[]) {
    const current = globalRef[kind];
    // Never clobber a healthy implementation (Node 20/22, or an already-fixed run).
    if (isWorkingStorage(current)) continue;
    const replacement = fresh[kind];
    if (!isWorkingStorage(replacement)) continue;

    Object.defineProperty(globalThis, kind, {
      value: replacement,
      configurable: true,
      enumerable: true,
      writable: false,
    });
  }
}

installStorage();

// Per-test isolation: no state may leak between tests or between files that
// share a jsdom instance.
beforeEach(() => {
  if (isWorkingStorage(globalRef.localStorage)) globalRef.localStorage.clear();
  if (isWorkingStorage(globalRef.sessionStorage)) globalRef.sessionStorage.clear();
});

afterEach(() => {
  if (isWorkingStorage(globalRef.localStorage)) globalRef.localStorage.clear();
  if (isWorkingStorage(globalRef.sessionStorage)) globalRef.sessionStorage.clear();
});