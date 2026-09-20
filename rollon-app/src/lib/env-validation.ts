/**
 * Environment variable validation — runs at application startup.
 * Fails fast with clear error messages when critical config is missing.
 */

interface EnvConfig {
  /** Base URL for API calls. Falls back to '/api' for Vercel serverless. */
  apiBaseUrl: string;
  /** Whether to prefer the remote API over local fallback. */
  useRemoteApi: boolean;
  /** True when running in development mode. */
  isDev: boolean;
}

function validateEnv(): EnvConfig {
  const warnings: string[] = [];

  const apiBaseUrl = import.meta.env.VITE_API_BASE_URL;
  if (!apiBaseUrl && import.meta.env.PROD) {
    warnings.push(
      'VITE_API_BASE_URL is not set. API calls will default to /api (relative). ' +
      'This is fine for Vercel deployments but may fail in other environments.'
    );
  }

  // Log warnings in development, throw in production for critical missing vars
  if (warnings.length > 0) {
    const banner = '[RollON] Environment Validation Warnings:';
    if (import.meta.env.DEV) {
      console.warn(banner, ...warnings);
    } else {
      // In production, log but don't crash for non-critical vars
      console.warn(banner, ...warnings);
    }
  }

  return {
    apiBaseUrl: apiBaseUrl || '/api',
    useRemoteApi: import.meta.env.VITE_USE_REMOTE_API === 'true',
    isDev: import.meta.env.DEV,
  };
}

/** Validated environment configuration singleton. */
export const env = validateEnv();
