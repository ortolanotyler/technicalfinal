import type { VercelRequest, VercelResponse } from '@vercel/node';
import { initializeApp, getApps, type FirebaseApp } from 'firebase/app';
import { getFirestore, doc, getDoc } from 'firebase/firestore';

// Self-contained on purpose: this runs as a @vercel/node ESM function, which
// does not bundle cross-directory relative TS imports, so we avoid them.

const SITE_ORIGIN = 'https://thecertusgroup.tech';
const ORG_NAME = 'Certus Technical Search';
const ORG_LOGO =
  'https://res.cloudinary.com/dvbubqhpp/image/upload/v1770919808/CertusLOGO_szfewa.png';

// Public Firebase web config (same one shipped to the browser). Jobs are
// `allow read: if true`, so no admin credentials are needed.
const FIREBASE_CONFIG = {
  projectId: 'gen-lang-client-0136431445',
  appId: '1:297393652693:web:d86902435371a7b6d8b35c',
  apiKey: 'AIzaSyDZUaXzOPr9fu7C96t1OgVoiUuPbf52xOc',
  authDomain: 'gen-lang-client-0136431445.firebaseapp.com',
  storageBucket: 'gen-lang-client-0136431445.firebasestorage.app',
  messagingSenderId: '297393652693',
};
const FIRESTORE_DB_ID = 'ai-studio-dc60054d-2d97-45c7-ab15-6ec5d6ba4885';

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

function db() {
  const app: FirebaseApp = getApps()[0] || initializeApp(FIREBASE_CONFIG);
  return getFirestore(app, FIRESTORE_DB_ID);
}

async function getJob(id: string): Promise<JobDoc | null> {
  const d = await getDoc(doc(db(), 'jobs', id));
  return d.exists() ? { id: d.id, ...(d.data() as Omit<JobDoc, 'id'>) } : null;
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

function isoDate(input?: string): string {
  const t = input ? Date.parse(input) : NaN;
  return (Number.isNaN(t) ? new Date() : new Date(t)).toISOString().slice(0, 10);
}

function jobPostingJsonLd(job: JobDoc): Record<string, unknown> {
  const base = Date.parse(job.createdAt || job.posted || '') || Date.now();
  const schema: Record<string, unknown> = {
    '@context': 'https://schema.org/',
    '@type': 'JobPosting',
    title: job.title,
    description: descriptionHtml(job),
    datePosted: isoDate(job.createdAt || job.posted),
    validThrough: new Date(base + 60 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10),
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
    .map((o) => `<script type="application/ld+json">${JSON.stringify(o).replace(/</g, '\\u003c')}</script>`)
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
