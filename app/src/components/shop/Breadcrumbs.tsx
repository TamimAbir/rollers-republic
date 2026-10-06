import { Link } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';

export interface Crumb {
  name: string;
  /** Route path relative to the site root (e.g. "/shop?category=vapes"). */
  path: string;
}

/**
 * Breadcrumbs — visual trail for the Shop page (SEO + navigation).
 *
 * Styled inline (not Tailwind gradient classes) so the prerendered HTML
 * looks identical to the hydrated app — no post-hydration flash.
 * Mirrors the visible trail in BreadcrumbList JSON-LD (useDocumentSEO).
 */
export function Breadcrumbs({ trail }: { trail: Crumb[] }) {
  return (
    <nav aria-label="Breadcrumb" className="mb-8">
      <ol className="flex flex-wrap items-center gap-2 text-sm text-white/60">
        {trail.map((crumb, index) => {
          const isLast = index === trail.length - 1;
          // Each crumb must be an <li>: axe-core's `list` rule (WCAG 1.3.1,
          // EN-301-549 9.1.3.1) requires <ol>/<ul> to contain only <li>/
          // <script>/<template> directly. Rendering bare spans/links under the
          // <ol> — as a React <Fragment> does — fails the a11y E2E gate.
          // The <li> carries the flex/gap so the visual trail is unchanged.
          return (
            <li key={crumb.path} className="flex items-center gap-2">
              {index > 0 && (
                <ChevronRight className="h-4 w-4 text-white/30" aria-hidden="true" />
              )}
              {isLast ? (
                <span aria-current="page" className="font-medium text-white/90">
                  {crumb.name}
                </span>
              ) : (
                <Link
                  to={crumb.path}
                  className="transition-colors hover:text-primary"
                >
                  {crumb.name}
                </Link>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
