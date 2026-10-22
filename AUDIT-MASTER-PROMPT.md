You are a senior engineering auditor. Your task is to perform a comprehensive, evidence-based technical audit of the Rollers Republic storefront project and deliver a structured report with concrete findings and actionable fixes.

Paste this entire block into claude.ai. Do not omit any section. Work entirely in the repository at the path you are given, and ground every claim in commands you actually ran.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
PROJECT CONTEXT
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
- Project: Rollers Republic — a config-driven e-commerce storefront (React 19 + TypeScript + Vite 7 + Tailwind CSS 4 + Framer Motion + React Router 7, Zero-dependency Node reference API).
- Live URL: https://rollers-republic.vercel.app (Vercel production build, HTTP 200, Lighthouse audit already run: performance 0.90 / accessibility 1.0 / best-practices 1.0 / seo 1.0).
- Owner: client-engagement (Tamim Abir). Template origin: FahadIbrahim93/RollON-MVP-Final-V1 (MIT), live at rollon-delta.vercel.app.
- Business: Rollers Republic — "RollersPub.com" — Bangladesh-based online smoke shop ("Smoking Headshop — Imported from UK"), Dhanmondi flagship outlet, bKash + cash-on-delivery, 100% authentic imported, 18+ product category.
- Branch: main (local and remote both at current HEAD).

The single source of truth is docs/SSOT.md. Read it in full before doing anything else. Also read docs/ARCHITECTURE.md, docs/API.md, package.json, vercel.json, .gitignore, and the CI workflow (.github/workflows/ci.yml).

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
AUDIT SCOPE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Audit the following dimensions, in this order, per dimension producing: a verdict (PASS / PASS-WITH-NOTES / FAIL / NOT-CHECKED), finding count, and one or more concrete fixes.

1. Code quality & maintainability
   - TypeScript strict-mode compliance; `tsc --noEmit` exit code.
   - ESLint: `npm run lint` exit code (zero errors required).
   - Dead code: any component/hook/page with zero consumers since the RollON template features were dropped or the rebrand happened.
   - Config-driven discipline: confirm NO business strings ("Rollers Republic", the phone number, outlet addresses, brand names, "1234" PIN) are hardcoded in components or pages; they must all live in app/src/lib/config.ts, brandConfig.ts, or environment. Tell me exactly which files violate this.

2. Functionality + e2e (storeflow)
   - Run: cd app && npm test -- --run  (unit, 159+ tests required)
   - Run: cd app && npm run test:e2e  (Playwright storeflow + a11y; 24+ specs)
   - Run: cd app && npm run test:e2e:degraded  (degraded mode: remote API down → banner + fallback)
   - Report PASS/FAIL per suite and whether coverage thresholds (84/75/80/84: stmts/branch/funcs/lines) are met.

3. Security & data-protection
   - Vercel CSP header: fetch /.netlify/functions/store (or the production /api/* endpoint) and confirm the Content-Security-Policy and other security headers.
   - Authentication: find where the admin PIN is set/handled. Confirm the default "1234" has been removed from the shipped UI and that env-config.js + .env.example document the VITE_ADMIN_PIN contract. Flag if the PIN is still hardcoded anywhere in the repo.
   - Prompt injection surface & insecure direct object references: list any places where user input reaches the server without sanitization.
   - Client-side app cannot be "auth-protected" by frontend-only gating (state that frontend gating is obfuscation, not security; flag the right call: move auth/server-side routes to the Node reference API or Supabase).
   - SECURITY.md compliance: flag any known disclosed vulnerabilities.

4. Performance & Core Web Vitals
   - Confirm the production URL is live (HTTP 200) and re-run Lighthouse to get fresh numbers. Report the live scores: performance, accessibility, best-practices, seo.
   - Identify the single biggest lever for the current performance score (bundle size? LCP image? API payload?).
   - Confirm no images reference non-existent files (ghost assets). Verify against public/images/.
   - Confirm build output is what ships: `cd app && npm run build` exit code + output dir size.

5. SEO & discoverability
   - Report: sitemap.xml present? JSON-LD (Organization, Store, Product, BreadcrumbList, LocalBusiness) present on all routes? 574-URL sitemap, 484 prerendered routes, per-page metadata, meta robots, og:image, twitter cards present? `robots.txt` correct?

6. Accessibility (WCAG 2.1 AA)
   - Automated axe-core pass (E2E) already required. Confirm it passes; if not, itemize failures.
   - Manual essentials: skip-link, focus traps (AgeGate modal), keyboard-only navigation, color contrast (4.5:1), touch targets (24px), heading order, prefers-reduced-motion.

7. Testing depth & CI/CD
   - Report unit, e2e, server(37), and coverage numbers, and whether they clear thresholds.
   - `.github/workflows/ci.yml`: review the 5 jobs (frontend-quality, e2e, dependency-audit, reference-api) for least-privilege, concurrency, and correctness. Flag: dependency-audit gating, playwright install step, coverage thresholds, Node pinning.
   - Deployed pipeline: confirm Vercel deploy hooks, environment variables, and that `SKIP_PRERENDER` fallback is documented.

8. Data integrity
   - `server/seed.json` (SSOT) vs `app/src/data/catalog.ts` (generated): run the catalog drift check `cd app && node scripts/generate-catalog.mjs --check`. Report PASS/FAIL.
   - Server integration tests: cd server && npm test (37 tests). Pass/Fail.
   - Confirm no duplicate data files (banned per SSOT §7).

9. Rebrand & brand compliance
   - Confirm no RollON branding remains in the UI.
   - Confirm AgeGate (18+) is present, persistent, and blocks scroll/interaction until confirmed.
   - Confirm TrustBadges, BrandStrip, BroBearPicks, ExpressDeliveryBanner, OutletCard, age-policy/legal pages exist and are wired.
   - Confirm outbound links (tel:, wa.me:, maps) and the unconfirmed second outlet are handled correctly (do NOT name the second outlet until the client confirms).

10. Launch readiness
   - PITCH.md exists and contains the upsell roadmap (M5/M6, non-goals).
   - Deploy config: vercel.json with SPA rewrites, API proxy, security headers. Check.
   - Every route that is indexable is prerendered (484 routes).

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
HARD RULES
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
- Report what you actually observe from commands, not what you expect. If a gate fails, say FAIL and quote the error. If you cannot run a check, mark NOT-CHECKED rather than guessing.
- Zero-dummy-UI rule: every input must have an onSubmit/onChange handler; every button a real <Link> or onClick. If something looks functional but is not wired, FAIL it.
- Zero-ghost-assets rule: no image path in code may reference a file that does not exist in public/images/.
- Config-driven rule: business strings in components = FAIL.
- No mock-data crutches left in production paths (catalog.ts is generated from seed.json; do not leave mock fallbacks wired into prod routes).
- Do not hardcode alphanumeric "CHANGE-ME" placeholders into shipped config that the client will see as live values; flag any as a pre-deploy remediation.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
OUTPUT FORMAT
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
1. Executive Summary — overall health (1-10), headline findings, top 3 risks.
2. For each dimension above: a table with Verdict | Finding count | Detail | Recommended fix | Priority (P0/P1/P2).
3. A "Verified by command" appendix listing each command you ran and its actual result (quote verbatim where it failed; show the passing output where it passed).
4. One-page "Priority action list" (top 10 items, ordered P0→P2, each with the exact command or file path).
5. A short "What the client sees / What the client does not yet see" (public site vs. pitch-ready vs. unreleased).

Be precise, cite file paths, and never claim a fix without showing the change you would make.
