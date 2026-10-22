# Contributing to Rollers Republic

Thank you for considering a contribution! This project follows a strict **Definition of Done** — please read it before submitting.

## Quick Links
- [Definition of Done](#definition-of-done) — mandatory gates
- [Architecture](docs/ARCHITECTURE.md) — system overview
- [SSOT](docs/SSOT.md) — single source of truth (read first)
- [API Contract](docs/API.md) — reference API specification

## Code of Conduct

This project adheres to a [Code of Conduct](CODE_OF_CONDUCT.md). By participating, you agree to uphold this code.

## Development Setup

```bash
git clone https://github.com/TamimAbir/rollers-republic.git
cd rollers-republic/app
npm ci
npm run dev          # http://localhost:5173
```

No `.env` files needed — the app serves the bundled seed catalog out of the box.

## Definition of Done (MANDATORY)

**A task is NOT done unless ALL of the following hold:**

1. **Tests green** — `npm test -- --run` passes (159 unit tests)
2. **Coverage holds** — `npm run test:coverage` clears thresholds (84/75/80/84)
3. **Lint clean** — `npm run lint` returns zero errors
4. **Build clean** — `npm run build` succeeds (tsc + Vite + 484-route prerender)
5. **E2E green** — `npm run test:e2e` + `npm run test:e2e:degraded` pass
6. **Server tests** — `cd ../server && npm test` (37 integration tests)
7. **Catalog sync** — `npm run catalog:check` passes
8. **Working tree committed** — `git status --short` shows nothing
9. **Docs updated** — README/CHANGELOG/ARCHITECTURE/SSOT updated when behavior changes
10. **Honest claims** — every claim backed by a command you ran

## Pull Request Process

1. Fork the repo and create a feature branch from `main`
2. Make your changes following the [Code Style](#code-style)
3. Run **all** quality gates locally (see above)
4. Open a PR against `main` with:
   - Clear title and description
   - Linked issue (if applicable)
   - Screenshots for UI changes
   - Checklist completed (auto-populated from PR template)
5. Address review feedback — CI must pass
6. Squash-merge after approval (branch protection enabled)

## Code Style

### Component Structure
```tsx
// Imports
import { useState } from 'react';
import { Link } from 'react-router-dom';

// Types
interface Props {
  title: string;
}

// Component
export function Component({ title }: Props) {
  // Hooks first
  const [state, setState] = useState(false);

  // Handlers
  const handleClick = () => {};

  // Render
  return (
    <div>
      <button aria-label="Action description">Action</button>
    </div>
  );
}
```

### Accessibility (WCAG 2.1 AA — enforced in CI)
- All icon-only buttons/links MUST have `aria-label`
- Product links: `aria-label="View {product.name} details"`
- Color contrast: 4.5:1 normal, 3:1 large text
- Touch targets: minimum 24×24px
- Heading hierarchy: never skip levels (h1 → h3 without h2)

### Dead-Code Policy
**One rule:** Is it part of the template's public surface or an orphaned detail?
- **DELETE** app-level components/hooks with zero consumers (superseded/removed features)
- **KEEP** shadcn/ui primitives in `src/components/ui/` — template contract, tree-shaken
- **KEEP** `src/hooks/useApi.ts` exports — data-access contract for template consumers
- Before deleting: `npx tsc --noEmit` must pass (proves no consumer exists)

## Catalog Data (SSOT)

The catalog lives in `server/seed.json` — **this is the only place to edit product data**.

```bash
# Edit seed.json directly, then regenerate:
cd app
node scripts/generate-catalog.mjs    # updates src/data/catalog.ts
node scripts/generate-sitemap.mjs    # updates public/sitemap.xml
npm run build                        # full prerender
```

To re-snapshot from the live store:
```bash
cd app
node scripts/fetch-catalog.mjs       # pulls from rollerspub.com → ../../server/seed.json
```

## Branching & Commits

- Branch naming: `feat/short-description`, `fix/short-description`, `docs/short-description`
- Commits: conventional style (`feat:`, `fix:`, `docs:`, `perf:`, `chore:`)
- Reference SSOT sections: `SSOT §7` in commit messages

## Reporting Issues

Use the issue templates:
- **Bug report** — reproducible steps, environment, expected vs actual
- **Feature request** — problem statement, proposed solution, SSOT alignment
- **Question** — clarifications on architecture, SSOT, or process

## Security

- No secrets in code — use Vercel project settings for env vars
- CSP, HSTS, X-Frame-Options, Permissions-Policy configured in `vercel.json`
- Dependency audit runs in CI (`npm audit --audit-level=high`)

## License

By contributing, you agree your contributions will be licensed under the [MIT License](LICENSE) (dual attribution: Fahad Ibrahim for RollON template + Tamim Abir for Rollers Republic implementation).

---

**Reminder:** This repo is a portfolio showcase. The code quality, test coverage, documentation, and CI/CD pipeline *are* the product being demonstrated. Treat every contribution accordingly.