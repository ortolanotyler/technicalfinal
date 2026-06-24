import type { VercelRequest, VercelResponse } from '@vercel/node';
import { readFileSync } from 'fs';
import { join } from 'path';

// Self-contained on purpose: this runs as a @vercel/node ESM function, which
// does not bundle cross-directory relative TS imports, so we avoid them.
// Jobs are static data in data/jobs.json (bundled via vercel.json includeFiles).

const SITE_ORIGIN = 'https://thecertusgroup.tech';
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

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const host = (req.headers['x-forwarded-host'] || req.headers.host || 'thecertusgroup.tech') as string;
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
      }
    } else {
      html = applyMeta(html, {
        title: `Open Positions | ${ORG_NAME}`,
        description:
          'Browse current openings in skilled trades, industrial maintenance, engineering operations and technical roles across Canada.',
        canonical: `${SITE_ORIGIN}/jobs`,
        ogType: 'website',
      });
    }
  } catch (err) {
    console.error('render: falling back to plain shell:', err);
  }

  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  res.setHeader('Cache-Control', 'public, s-maxage=300, stale-while-revalidate=86400');
  return res.status(200).send(html);
}
