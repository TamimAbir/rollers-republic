import { useSyncExternalStore } from 'react';
import { apiHealth } from '@/lib/api';

/**
 * Visible degraded-mode indicator.
 *
 * When the app runs in remote mode (VITE_USE_REMOTE_API=true) and a remote
 * call fails, the API client falls back to the bundled dataset silently.
 * That fallback must never be invisible — a backend outage hidden behind
 * stale local data looks like a working store and erodes trust.
 *
 * This banner subscribes to the apiHealth observable and renders only when
 * the client has actually degraded. Hidden entirely in local mode.
 */
export function DegradedModeBanner() {
  const degraded = useSyncExternalStore(apiHealth.subscribe, () => apiHealth.degraded, () => false);

  if (!degraded) {
    return null;
  }

  return (
    <div
      role="status"
      className="w-full bg-amber-500/15 border-b border-amber-500/30 px-4 py-2 flex items-center justify-center gap-2"
    >
      <span aria-hidden="true" className="text-amber-400 text-sm">⚠️</span>
      <p className="text-amber-300 text-xs sm:text-sm font-medium tracking-wide">
        Live data is unavailable right now — showing cached catalog. Orders may be limited.
      </p>
    </div>
  );
}
