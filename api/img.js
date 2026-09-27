/**
 * /img/:path proxy — the catalog's ~900 remote product images live on
 * rollerspub.com, whose CDN 503s browser requests carrying a Referer
 * (hotlink protection), so hotlinking them left most of the storefront
 * without pictures. This function fetches them server-side (no Referer →
 * allowed) and caches aggressively at the edge.
 *
 * Mounted via vercel.json rewrite: /img/(.*) → /api/img?path=$1
 * The prerender script mirrors this route for local chromium renders.
 */
const ALLOWED_HOST = 'rollerspub.com';

export default async function handler(req, res) {
  const raw = String(req.query.path ?? '');

  // Path-traversal and host-spoofing guards; the rewrite only forwards
  // wp-content/upload paths.
  let clean;
  try {
    clean = decodeURIComponent(raw);
  } catch {
    res.status(400).json({ error: 'bad encoding' });
    return;
  }
  if (!clean || clean.includes('..') || clean.startsWith('/') || clean.includes('\0')) {
    res.status(400).json({ error: 'bad path' });
    return;
  }

  const upstreamUrl = `https://${ALLOWED_HOST}/wp-content/${encodeURI(clean)}`;
  try {
    const upstream = await fetch(upstreamUrl, { signal: AbortSignal.timeout(10_000) });
    const contentType = upstream.headers.get('content-type') ?? '';
    if (!upstream.ok || !contentType.startsWith('image/')) {
      res.status(404).json({ error: 'image not found' });
      return;
    }
    const body = Buffer.from(await upstream.arrayBuffer());
    res.setHeader('content-type', contentType);
    // Long edge cache: product photos are immutable; browsers get 1 day,
    // the CDN keeps them warm for a week with SWR beyond that.
    res.setHeader('cache-control', 'public, max-age=86400, s-maxage=604800, stale-while-revalidate=86400');
    res.status(200).send(body);
  } catch {
    res.status(504).json({ error: 'upstream fetch failed' });
  }
}
