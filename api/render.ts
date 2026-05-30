import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getJob } from '../lib/jobs';
import { SITE_ORIGIN, ORG_NAME, escapeHtml, jobPostingJsonLd } from '../lib/seo';

// Server-renders /jobs and /jobs/:id so the correct <title>, meta and (for job
// pages) JobPosting JSON-LD are present in the HTML Google reads — the SPA still
// boots from the same HTML for users. Any failure falls back to the plain SPA
// shell, so this can never be worse than the previous behaviour.

let cachedShell: string | null = null;
async function getShell(origin: string): Promise<string> {
  if (cachedShell) return cachedShell;
  const res = await fetch(`${origin}/index.html`);
  cachedShell = await res.text();
  return cachedShell;
}

function setTag(html: string, re: RegExp, replacement: string): string {
  return re.test(html) ? html.replace(re, replacement) : html;
}

function applyMeta(
  html: string,
  meta: { title: string; description: string; canonical: string; ogType: string }
): string {
  const t = escapeHtml(meta.title);
  const d = escapeHtml(meta.description);
  let out = html;
  out = setTag(out, /<title>[\s\S]*?<\/title>/, `<title>${t}</title>`);
  out = setTag(out, /(<meta name="description" content=")[^"]*(")/, `$1${d}$2`);
  out = setTag(out, /(<link rel="canonical" href=")[^"]*(")/, `$1${meta.canonical}$2`);
  out = setTag(out, /(<meta property="og:type" content=")[^"]*(")/, `$1${meta.ogType}$2`);
  out = setTag(out, /(<meta property="og:url" content=")[^"]*(")/, `$1${meta.canonical}$2`);
  out = setTag(out, /(<meta property="og:title" content=")[^"]*(")/, `$1${t}$2`);
  out = setTag(out, /(<meta property="og:description" content=")[^"]*(")/, `$1${d}$2`);
  return out;
}

function injectJsonLd(html: string, objects: Record<string, unknown>[]): string {
  const scripts = objects
    .map(
      (o) =>
        `<script type="application/ld+json">${JSON.stringify(o).replace(/</g, '\\u003c')}</script>`
    )
    .join('\n');
  return html.replace('</head>', `${scripts}\n</head>`);
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const host = (req.headers['x-forwarded-host'] || req.headers.host || 'thecertusgroup.tech') as string;
  const origin = `https://${host}`;
  const id = typeof req.query.id === 'string' ? req.query.id : undefined;

  let html: string;
  try {
    html = await getShell(origin);
  } catch {
    // Couldn't read the shell — let the platform serve the static SPA instead.
    res.setHeader('Location', '/index.html');
    return res.status(302).end();
  }

  try {
    if (id) {
      const job = await getJob(id);
      if (job && job.title) {
        const canonical = `${SITE_ORIGIN}/jobs/${job.id}`;
        const description = (job.summary || `${job.title} — ${job.location || ''}`).slice(0, 320);
        html = applyMeta(html, {
          title: `${job.title}${job.location ? ` — ${job.location}` : ''} | ${ORG_NAME}`,
          description,
          canonical,
          ogType: 'article',
        });
        // Organization + WebSite JSON-LD already live in the shell (index.html);
        // here we only add the per-job JobPosting.
        html = injectJsonLd(html, [jobPostingJsonLd(job)]);
      } else {
        // Unknown/removed job — mark noindex so Google drops the stale URL.
        html = applyMeta(html, {
          title: `Position filled | ${ORG_NAME}`,
          description: 'This position is no longer available. View current openings.',
          canonical: `${SITE_ORIGIN}/jobs`,
          ogType: 'website',
        });
        html = html.replace(
          /<meta name="robots" content="[^"]*"\s*\/?>/,
          '<meta name="robots" content="noindex, follow" />'
        );
      }
    } else {
      html = applyMeta(html, {
        title: `Open Positions | ${ORG_NAME}`,
        description:
          'Browse current openings in skilled trades, industrial maintenance, engineering operations and technical roles across Canada.',
        canonical: `${SITE_ORIGIN}/jobs`,
        ogType: 'website',
      });
      // Board shell already carries Organization + WebSite JSON-LD.
    }
  } catch (err) {
    console.error('render: falling back to plain shell:', err);
    // html stays as the unmodified shell — SPA still works.
  }

  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  res.setHeader('Cache-Control', 'public, s-maxage=300, stale-while-revalidate=86400');
  return res.status(200).send(html);
}
