# Security Policy

## Supported Versions

| Version | Supported          |
| ------- | ------------------ |
| 1.0.x   | :white_check_mark: |

## Reporting a Vulnerability

We take the security of RollON seriously. If you discover a security vulnerability, please follow these steps:

1. **Do NOT** open a public GitHub issue
2. Email your findings to: FahadIbrahim93@gmail.com
3. Include a detailed description of the vulnerability
4. Include steps to reproduce the issue if possible
5. Allow reasonable time for a response before public disclosure

## What to Include in Reports

- Description of the vulnerability
- Steps to reproduce
- Potential impact
- Suggested fix (if any)
- Your contact information for follow-up

## Security Measures

This project implements the following security measures:

- **Content Security Policy (CSP)**: Configured in `vercel.json` to prevent XSS attacks
- **Environment Variable Validation**: Critical config validated at startup
- **Dependency Auditing**: CI runs `npm audit` on every push
- **CodeQL Analysis**: Automated security scanning on schedule and PRs
- **No Hardcoded Secrets**: All sensitive values use `.env` placeholders
- **PBKDF2-SHA256 Password Hashing**: Local auth fallback hashes passwords with 100k iterations; hashes never persist to localStorage
- **Dev-Only Local Auth Fallback**: The mock/local auth path is gated to `import.meta.env.DEV` and is never active in production

## Known Advisory Status

| Advisory | Scope | Status |
|----------|-------|--------|
| [GHSA-qwww-vcr4-c8h2](https://github.com/advisories/GHSA-qwww-vcr4-c8h2) (react-router RSC-mode CSRF bypass) | Only affects React Server Components mode with actions/loaders. RollON is a client-side SPA using plain `BrowserRouter` — no RSC, no loaders/actions | **Not exploitable**; tracked until react-router-dom publishes a patched release (react-router ≥ 8.3.0) |
| Vite dev-server advisories (GHSA-fx2h-pf6j-xcff et al.) | Dev server only, never exposed in the Vercel production build | **Not exploitable in production**; resolved by pinning Vite to a patched minor |

All production-relevant dependencies are kept at the latest patched versions via `npm audit fix` in CI.

## Security Best Practices for Users

- Never commit `.env` files — use `.env.example` as a template
- Keep dependencies updated: `npm audit fix`
- Review `vercel.json` security headers before production deployment
- Use HTTPS for all production deployments

## Dependencies

We use the following security-focused dependencies:

- `@sentry/react` — Error tracking and monitoring
- `axe-core` — Accessibility testing
- `eslint-plugin-jsx-a11y` — Accessibility linting