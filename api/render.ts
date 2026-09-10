import type { VercelRequest, VercelResponse } from '@vercel/node';
import { readFileSync } from 'fs';
import { join } from 'path';

// Self-contained on purpose: this runs as a @vercel/node ESM function, which
// does not bundle cross-directory relative TS imports, so we avoid them.
// Jobs are static data in data/jobs.json (bundled via vercel.json includeFiles).

const SITE_ORIGIN = 'https://technical.certusgroup.com';
const ORG_NAME = 'Certus Technical Search';
const ORG_LOGO =
  'https://res.cloudinary.com/dvbubqhpp/image/upload/v1770919808/CertusLOGO_szfewa.png';

interface JobDoc {
  id: string;
  ref?: string;
  title?: string;
  location?: string;
  type?: string;
  salary?: string;
  summary?: string;
  description?: string;
  responsibilities?: string[];
  requirements?: string[];
  posted?: string;
  createdAt?: string;
  updatedAt?: string;
}

function loadJobs(): JobDoc[] {
  try {
    return JSON.parse(readFileSync(join(process.cwd(), 'data/jobs.json'), 'utf8'));
  } catch (err) {
    console.error('render: could not read data/jobs.json:', err);
    return [];
  }
}

// Slug helpers — keep identical to services/jobSlug.ts.
function slugify(input: string): string {
  return String(input)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-+|-+$)/g, '');
}
function jobSlug(job: JobDoc): string {
  return slugify(`${job.title || 'job'} ${job.ref || job.id}`) || String(job.id);
}

// Resolve a job from a URL segment that may be a pretty slug
// (service-manager-trd-2817) or a legacy raw id.
function findJob(idOrSlug: string): JobDoc | null {
  return loadJobs().find((j) => String(j.id) === idOrSlug || jobSlug(j) === idOrSlug) || null;
}

interface BlogDoc {
  slug: string;
  title: string;
  excerpt: string;
  author?: string;
  date?: string;
  tags?: string[];
  coverImage?: string;
  content?: string;
}

function loadBlogPosts(): BlogDoc[] {
  try {
    return JSON.parse(readFileSync(join(process.cwd(), 'data/blog.json'), 'utf8'));
  } catch (err) {
    console.error('render: could not read data/blog.json:', err);
    return [];
  }
}

function findBlogPost(slug: string): BlogDoc | null {
  return loadBlogPosts().find((p) => p.slug === slug) || null;
}

// Absolute URL for an image that may be a site-relative path (/posts/x.jpg).
function absUrl(src?: string): string | undefined {
  if (!src) return undefined;
  return src.startsWith('http') ? src : `${SITE_ORIGIN}${src.startsWith('/') ? '' : '/'}${src}`;
}

function blogPostingJsonLd(post: BlogDoc): Record<string, unknown> {
  const url = `${SITE_ORIGIN}/insights/${post.slug}`;
  const schema: Record<string, unknown> = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: post.title,
    description: post.excerpt,
    mainEntityOfPage: { '@type': 'WebPage', '@id': url },
    url,
    author: { '@type': 'Organization', name: post.author || ORG_NAME, url: SITE_ORIGIN },
    publisher: {
      '@type': 'Organization',
      name: ORG_NAME,
      logo: { '@type': 'ImageObject', url: ORG_LOGO },
    },
  };
  if (post.date) {
    schema.datePublished = post.date;
    schema.dateModified = post.date;
  }
  const img = absUrl(post.coverImage);
  if (img) schema.image = img;
  if (post.tags?.length) schema.keywords = post.tags.join(', ');
  return schema;
}

function escapeHtml(s = ''): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

const EMPLOYMENT_TYPES: Record<string, string> = {
  'full-time': 'FULL_TIME',
  'full time': 'FULL_TIME',
  'part-time': 'PART_TIME',
  'part time': 'PART_TIME',
  contract: 'CONTRACTOR',
  contractor: 'CONTRACTOR',
  temporary: 'TEMPORARY',
  temp: 'TEMPORARY',
  internship: 'INTERN',
  intern: 'INTERN',
};

function isRemote(job: JobDoc): boolean {
  return /remote|work from home|wfh|telecommute/i.test(
    `${job.location || ''} ${job.type || ''} ${job.title || ''}`
  );
}

function parseSalary(salary = ''): Record<string, unknown> | null {
  const unit = /hour|\/hr|hourly/i.test(salary)
    ? 'HOUR'
    : /week/i.test(salary)
      ? 'WEEK'
      : /month/i.test(salary)
        ? 'MONTH'
        : 'YEAR';
  const nums = (salary.match(/\d[\d,]*(?:\.\d+)?/g) || [])
    .map((n) => parseFloat(n.replace(/,/g, '')))
    .filter((n) => !Number.isNaN(n) && n > 0)
    .map((n) => (n < 1000 && /k/i.test(salary) && unit === 'YEAR' ? n * 1000 : n));
  if (!nums.length) return null;
  const value: Record<string, unknown> = { '@type': 'QuantitativeValue', unitText: unit };
  if (nums.length >= 2) {
    value.minValue = Math.min(...nums);
    value.maxValue = Math.max(...nums);
  } else {
    value.value = nums[0];
  }
  return { '@type': 'MonetaryAmount', currency: 'CAD', value };
}

function descriptionHtml(job: JobDoc): string {
  const parts: string[] = [];
  if (job.summary) parts.push(`<p>${escapeHtml(job.summary)}</p>`);
  if (job.description) parts.push(`<p>${escapeHtml(job.description)}</p>`);
  if (job.responsibilities?.length)
    parts.push(
      `<h3>Responsibilities</h3><ul>${job.responsibilities.map((r) => `<li>${escapeHtml(r)}</li>`).join('')}</ul>`
    );
  if (job.requirements?.length)
    parts.push(
      `<h3>Requirements</h3><ul>${job.requirements.map((r) => `<li>${escapeHtml(r)}</li>`).join('')}</ul>`
    );
  return parts.join('') || `<p>${escapeHtml(job.title || 'Career opportunity')}</p>`;
}

// A stable "data was published" date — the newest real posting date across the
// dataset, memoized at cold start. Used only as a last resort for a job that
// somehow carries no date of its own (see postingDate). Deliberately NOT a
// rolling `new Date()`: behind the 5-min CDN cache that would make datePosted
// creep forward on every render, which Google can read as freshness gaming.
let _publishedDate: string | null = null;
function dataPublishedDate(): string {
  if (_publishedDate) return _publishedDate;
  const stamps = loadJobs()
    .flatMap((j) => [j.createdAt, j.posted, j.updatedAt])
    .map((v) => (v ? Date.parse(v) : NaN))
    .filter((t) => !Number.isNaN(t));
  _publishedDate = (stamps.length ? new Date(Math.max(...stamps)) : new Date())
    .toISOString()
    .slice(0, 10);
  return _publishedDate;
}

// Resolve a JobPosting's datePosted (YYYY-MM-DD). Walk the explicit date fields
// in order of trust; only if a job has none do we fall back to the dataset's
// publish date — and log it, so a dateless job shows up in function logs
// instead of silently shipping a wrong date. We never omit the field: an absent
// datePosted is exactly the error Search Console flagged on 2026-05-30.
function postingDate(job: JobDoc): string {
  for (const v of [job.createdAt, job.posted, job.updatedAt]) {
    const t = v ? Date.parse(v) : NaN;
    if (!Number.isNaN(t)) return new Date(t).toISOString().slice(0, 10);
  }
  console.warn(
    `render: job ${job.id ?? '?'} (${job.ref ?? 'no ref'}) has no usable date; ` +
      `falling back to data publish date ${dataPublishedDate()}`
  );
  return dataPublishedDate();
}

function jobPostingJsonLd(job: JobDoc): Record<string, unknown> {
  // validThrough is a ROLLING future date (today + 45d), recomputed on each
  // render, so a posting that stays open longer than ~60 days doesn't silently
  // expire out of Google for Jobs. When a job is removed from Firestore, the
  // page already returns a noindex "Position filled" shell instead.
  const validThrough = new Date(Date.now() + 45 * 24 * 60 * 60 * 1000)
    .toISOString()
    .slice(0, 10);
  const schema: Record<string, unknown> = {
    '@context': 'https://schema.org/',
    '@type': 'JobPosting',
    title: job.title,
    description: descriptionHtml(job),
    datePosted: postingDate(job),
    validThrough,
    employmentType: EMPLOYMENT_TYPES[(job.type || '').trim().toLowerCase()] || 'FULL_TIME',
    directApply: true,
    hiringOrganization: {
      '@type': 'Organization',
      name: ORG_NAME,
      sameAs: SITE_ORIGIN,
      logo: ORG_LOGO,
    },
  };
  if (job.ref) schema.identifier = { '@type': 'PropertyValue', name: ORG_NAME, value: job.ref };
  const salary = parseSalary(job.salary);
  if (salary) schema.baseSalary = salary;
  if (isRemote(job)) {
    schema.jobLocationType = 'TELECOMMUTE';
    schema.applicantLocationRequirements = { '@type': 'Country', name: 'Canada' };
  } else {
    const [locality, region] = (job.location || '').split(',').map((s) => s.trim());
    schema.jobLocation = {
      '@type': 'Place',
      address: {
        '@type': 'PostalAddress',
        addressLocality: locality || job.location || 'Canada',
        addressRegion: region || 'ON',
        addressCountry: 'CA',
      },
    };
  }
  return schema;
}

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
  meta: { title: string; description: string; canonical: string; ogType: string; image?: string }
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
  if (meta.image) {
    const img = escapeHtml(meta.image);
    out = setTag(out, /(<meta property="og:image" content=")[^"]*(")/, `$1${img}$2`);
    out = setTag(out, /(<meta name="twitter:image" content=")[^"]*(")/, `$1${img}$2`);
    out = setTag(out, /(<meta name="twitter:title" content=")[^"]*(")/, `$1${t}$2`);
    out = setTag(out, /(<meta name="twitter:description" content=")[^"]*(")/, `$1${d}$2`);
  }
  return out;
}

function injectJsonLd(html: string, objects: Record<string, unknown>[]): string {
  const scripts = objects
    .map((o) => `<script type="application/ld+json">${JSON.stringify(o).replace(/</g, '\\u003c')}</script>`)
    .join('\n');
  return html.replace('</head>', `${scripts}\n</head>`);
}

// Static, real, crawlable HTML dropped into <div id="root"> so a crawler that
// never runs JS (or Google's slow, resource-limited JS-render pass) sees real
// text instead of an empty shell. The client bundle's createRoot(...).render()
// simply overwrites this on load - same behavior as today for a JS visitor,
// real content for everyone/everything else. This is the actual fix for "most
// pages aren't being indexed" (2026-09-09): head metadata alone was correct,
// but the body a crawler reads was always empty.
// Minimal dark-theme styling for the prerendered content above, so the brief
// window before the client bundle takes over reads as "the page is loading"
// rather than a broken unstyled bullet list (reported live 2026-09-09 on
// /jobs: a flash of plain black-on-white text on the left before the real
// UI painted). Matches the site's actual palette (tailwind.config.js:
// brand.dark #0E141E, brand.white #fff, brand.silver #9FA8B5) closely enough
// to look intentional, without trying to replicate the full design system.
//
// CRITICAL: every rule below is scoped to .ssr-fallback, NEVER bare #root.
// The <style> tag lives in <head> and is never removed, but #root's own ID
// persists for the app's entire life — a rule on #root itself would keep
// squishing/overriding the REAL hydrated app forever, not just the fallback
// flash. That exact bug shipped once already (2026-09-09: #root{max-width:
// 820px;margin:0 auto;padding:...} plus forced h1/h2/p/li rules collided
// with the live app's own layout on every page, permanently, and looked
// like "everything is squished and overlapping" to a real visitor). Scoping
// to .ssr-fallback means the rules become inert the instant
// createRoot(...).render() replaces #root's children - .ssr-fallback no
// longer exists in the DOM, so nothing matches, regardless of the <style>
// tag still sitting in <head>.
const PRERENDER_STYLE = `<style>
html,body{background:#0E141E;margin:0}
.ssr-fallback{font-family:system-ui,-apple-system,sans-serif;color:#fff;max-width:820px;margin:0 auto;padding:32px 24px}
.ssr-fallback h1{font-size:1.9rem;font-weight:600;margin:0 0 12px}
.ssr-fallback h2{font-size:1.05rem;font-weight:600;margin:0;color:#fff}
.ssr-fallback p{color:#9FA8B5;line-height:1.5;margin:4px 0 0}
.ssr-fallback nav{margin-bottom:16px}
.ssr-fallback nav a,.ssr-fallback article a{color:#9FA8B5;text-decoration:none}
.ssr-fallback ul{list-style:none;margin:20px 0 0;padding:0}
.ssr-fallback li{padding:16px 0;border-top:1px solid rgba(255,255,255,0.1)}
.ssr-fallback li a{display:block;color:inherit;text-decoration:none}
.ssr-fallback li a:hover h2{color:#9FA8B5}
</style>`;

function injectBody(html: string, bodyHtml: string): string {
  html = html.replace('</head>', `${PRERENDER_STYLE}\n</head>`);
  return html.replace(
    /<div id="root">[\s\S]*?<\/div>/,
    `<div id="root"><div class="ssr-fallback">${bodyHtml}</div></div>`
  );
}

function jobBodyHtml(job: JobDoc): string {
  const meta = [job.location, job.type, job.salary].filter(Boolean).map(escapeHtml).join(' &middot; ');
  return (
    `<main><article>` +
    `<nav><a href="/jobs">Open Positions</a></nav>` +
    `<h1>${escapeHtml(job.title || 'Career opportunity')}</h1>` +
    (meta ? `<p>${meta}</p>` : '') +
    descriptionHtml(job) +
    `<p><a href="/jobs/${escapeHtml(jobSlug(job))}">Apply for this role</a></p>` +
    `</article></main>`
  );
}

function jobNotFoundBodyHtml(): string {
  return (
    `<main><h1>Position filled</h1>` +
    `<p>This position is no longer available. <a href="/jobs">View current openings</a>.</p></main>`
  );
}

function jobsListingBodyHtml(): string {
  const jobs = loadJobs();
  const items = jobs
    .map((j) => {
      const meta = [j.location, j.salary].filter(Boolean).map(escapeHtml).join(' &middot; ');
      return (
        `<li><a href="/jobs/${escapeHtml(jobSlug(j))}"><h2>${escapeHtml(j.title || 'Career opportunity')}</h2></a>` +
        (meta ? `<p>${meta}</p>` : '') +
        `</li>`
      );
    })
    .join('');
  return (
    `<main><h1>Open Positions</h1>` +
    `<p>Current openings in skilled trades, industrial maintenance, engineering operations and technical roles across Canada.</p>` +
    `<ul>${items}</ul></main>`
  );
}

function employersBodyHtml(): string {
  return (
    `<main>` +
    `<h1>Hire skilled technical talent.</h1>` +
    `<p>We place vetted trades, maintenance and technical professionals with employers across Canada. Tell us the role and we bring you a focused shortlist.</p>` +
    `<h2>Sectors we cover</h2>` +
    `<ul>${['Skilled Trades & Apprentices', 'Industrial & Plant Maintenance', 'Industrial Millwrights', 'Heavy-Duty / 310T Mechanics', 'Fleet & Transportation', 'Engineering & Operations', 'Technical Leadership'].map((s) => `<li>${escapeHtml(s)}</li>`).join('')}</ul>` +
    `</main>`
  );
}

function homeBodyHtml(): string {
  return (
    `<main>` +
    `<h1>Technical and skilled trades search</h1>` +
    `<p>Certus Technical Search is part of The Certus Group of Companies Inc. Founded in 2008, The Certus Group has been operating in the technical space for over 15 years. Our Technical division specializes in connecting licensed and certified professionals with leading employers across material handling, manufacturing, transportation, heavy equipment, and industrial services. We understand the urgency, compliance requirements, and operational demands of technical hiring, and we deliver talent that keeps projects moving and businesses running.</p>` +
    `<p><a href="/jobs">View open positions</a> &middot; <a href="/employers">Hire technical talent</a></p>` +
    `</main>`
  );
}

function submitResumeBodyHtml(): string {
  return (
    `<main>` +
    `<h1>Submit your resume</h1>` +
    `<p>Not seeing a fit among our current openings? Join the Certus Technical Search pipeline. We place skilled trades, industrial maintenance, fleet and technical professionals across Canada, and reach out when a matching mandate opens.</p>` +
    `<p><a href="/jobs">View open positions</a></p>` +
    `</main>`
  );
}

function insightsListingBodyHtml(): string {
  const posts = loadBlogPosts();
  const items = posts
    .map(
      (p) =>
        `<li><a href="/insights/${escapeHtml(p.slug)}"><h2>${escapeHtml(p.title)}</h2></a><p>${escapeHtml(p.excerpt || '')}</p></li>`
    )
    .join('');
  return (
    `<main><h1>Insights</h1>` +
    `<p>Market commentary and hiring insight on the skilled-trades, heavy-duty and industrial maintenance talent market across Canada.</p>` +
    `<ul>${items}</ul></main>`
  );
}

function insightBodyHtml(post: BlogDoc): string {
  const paragraphs = (post.content || post.excerpt || '')
    .split(/\n\n+/)
    .filter((p) => p.trim())
    .map((p) => `<p>${escapeHtml(p.trim())}</p>`)
    .join('');
  return (
    `<main><article>` +
    `<nav><a href="/insights">Insights</a></nav>` +
    `<h1>${escapeHtml(post.title)}</h1>` +
    (post.date ? `<p><time>${escapeHtml(post.date)}</time></p>` : '') +
    paragraphs +
    `</article></main>`
  );
}

function insightNotFoundBodyHtml(): string {
  return (
    `<main><h1>Article not found</h1>` +
    `<p>This insight may have moved or been retired. <a href="/insights">Browse the latest insights</a>.</p></main>`
  );
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const host = (req.headers['x-forwarded-host'] || req.headers.host || 'technical.certusgroup.com') as string;
  const origin = `https://${host}`;
  const id = typeof req.query.id === 'string' ? req.query.id : undefined;
  const page = typeof req.query.page === 'string' ? req.query.page : undefined;
  const insight = typeof req.query.insight === 'string' ? req.query.insight : undefined;

  let html: string;
  try {
    html = await getShell(origin);
  } catch {
    res.setHeader('Location', '/index.html');
    return res.status(302).end();
  }

  try {
    if (page === 'employers') {
      html = applyMeta(html, {
        title: `Hire Technical Talent | ${ORG_NAME}`,
        description:
          'Hire vetted skilled trades, industrial maintenance and technical professionals across Canada. Certus Technical Search delivers a focused shortlist. Request talent today.',
        canonical: `${SITE_ORIGIN}/employers`,
        ogType: 'website',
      });
      html = injectJsonLd(html, [
        {
          '@context': 'https://schema.org',
          '@type': 'Service',
          serviceType: 'Technical & Skilled Trades Recruitment',
          provider: { '@type': 'EmploymentAgency', name: ORG_NAME, url: SITE_ORIGIN },
          areaServed: { '@type': 'Country', name: 'Canada' },
          description:
            'Specialized recruitment and executive search for skilled trades, industrial maintenance, engineering operations and technical roles.',
        },
      ]);
      html = injectBody(html, employersBodyHtml());
    } else if (page === 'submit-resume') {
      html = applyMeta(html, {
        title: `Submit Your Resume | ${ORG_NAME}`,
        description:
          'Join the Certus Technical Search pipeline. Submit your resume for skilled trades, industrial maintenance, fleet and technical roles across Canada.',
        canonical: `${SITE_ORIGIN}/submit-resume`,
        ogType: 'website',
      });
      html = html.replace(
        /<meta name="robots" content="[^"]*"\s*\/?>/,
        '<meta name="robots" content="noindex, follow" />'
      );
      html = injectBody(html, submitResumeBodyHtml());
    } else if (id) {
      const job = findJob(id);
      if (job && job.title) {
        const canonical = `${SITE_ORIGIN}/jobs/${jobSlug(job)}`;
        const description = (job.summary || `${job.title} in ${job.location || 'Canada'}`).slice(0, 320);
        html = applyMeta(html, {
          title: `${job.title}${job.location ? ` in ${job.location}` : ''} | ${ORG_NAME}`,
          description,
          canonical,
          ogType: 'article',
        });
        html = injectJsonLd(html, [jobPostingJsonLd(job)]);
        html = injectBody(html, jobBodyHtml(job));
      } else {
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
        html = injectBody(html, jobNotFoundBodyHtml());
      }
    } else if (page === 'insights') {
      html = applyMeta(html, {
        title: `Insights | ${ORG_NAME}`,
        description:
          'Market commentary and hiring insight on the skilled-trades, heavy-duty and industrial maintenance talent market across Canada.',
        canonical: `${SITE_ORIGIN}/insights`,
        ogType: 'website',
      });
      const posts = loadBlogPosts();
      html = injectJsonLd(html, [
        {
          '@context': 'https://schema.org',
          '@type': 'Blog',
          name: `${ORG_NAME} — Insights`,
          url: `${SITE_ORIGIN}/insights`,
          publisher: {
            '@type': 'Organization',
            name: ORG_NAME,
            logo: { '@type': 'ImageObject', url: ORG_LOGO },
          },
          blogPost: posts.map((p) => ({
            '@type': 'BlogPosting',
            headline: p.title,
            url: `${SITE_ORIGIN}/insights/${p.slug}`,
            datePublished: p.date,
          })),
        },
      ]);
      html = injectBody(html, insightsListingBodyHtml());
    } else if (insight) {
      const post = findBlogPost(insight);
      if (post) {
        const canonical = `${SITE_ORIGIN}/insights/${post.slug}`;
        html = applyMeta(html, {
          title: `${post.title} | ${ORG_NAME}`,
          description: (post.excerpt || '').slice(0, 320),
          canonical,
          ogType: 'article',
          image: absUrl(post.coverImage),
        });
        html = injectJsonLd(html, [blogPostingJsonLd(post)]);
        html = injectBody(html, insightBodyHtml(post));
      } else {
        html = applyMeta(html, {
          title: `Article not found | ${ORG_NAME}`,
          description: 'This insight may have moved or been retired. Browse the latest insights.',
          canonical: `${SITE_ORIGIN}/insights`,
          ogType: 'website',
        });
        html = html.replace(
          /<meta name="robots" content="[^"]*"\s*\/?>/,
          '<meta name="robots" content="noindex, follow" />'
        );
        html = injectBody(html, insightNotFoundBodyHtml());
      }
    } else if (page === 'home') {
      html = applyMeta(html, {
        title: `${ORG_NAME} | Technical and Skilled Trades Recruitment`,
        description:
          'Certus Technical Search connects licensed and certified skilled trades and technical professionals with leading employers across Canada.',
        canonical: `${SITE_ORIGIN}/`,
        ogType: 'website',
      });
      html = injectBody(html, homeBodyHtml());
    } else {
      html = applyMeta(html, {
        title: `Open Positions | ${ORG_NAME}`,
        description:
          'Browse current openings in skilled trades, industrial maintenance, engineering operations and technical roles across Canada.',
        canonical: `${SITE_ORIGIN}/jobs`,
        ogType: 'website',
      });
      html = injectBody(html, jobsListingBodyHtml());
    }
  } catch (err) {
    console.error('render: falling back to plain shell:', err);
  }

  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  res.setHeader('Cache-Control', 'public, s-maxage=300, stale-while-revalidate=86400');
  return res.status(200).send(html);
}
