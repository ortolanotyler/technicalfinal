import type { VercelRequest, VercelResponse } from '@vercel/node';
import { readFileSync } from 'fs';
import { join } from 'path';

// Self-contained. Jobs are static data in data/jobs.json (bundled via
// vercel.json includeFiles).
const SITE_ORIGIN = 'https://thecertusgroup.tech';

interface JobDoc {
  id: string;
  title?: string;
  ref?: string;
  createdAt?: string;
  updatedAt?: string;
}

// Keep identical to services/jobSlug.ts.
function slugify(input: string): string {
  return String(input)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-+|-+$)/g, '');
}
function jobSlug(job: JobDoc): string {
  return slugify(`${job.title || 'job'} ${job.ref || job.id}`) || String(job.id);
}

function getAllJobs(): JobDoc[] {
  try {
    return JSON.parse(readFileSync(join(process.cwd(), 'data/jobs.json'), 'utf8'));
  } catch (err) {
    console.error('sitemap: could not read data/jobs.json:', err);
    return [];
  }
}

interface BlogDoc {
  slug: string;
  date?: string;
  updatedAt?: string;
}

function getAllPosts(): BlogDoc[] {
  try {
    return JSON.parse(readFileSync(join(process.cwd(), 'data/blog.json'), 'utf8'));
  } catch (err) {
    console.error('sitemap: could not read data/blog.json:', err);
    return [];
  }
}

export default async function handler(_req: VercelRequest, res: VercelResponse) {
  const today = new Date().toISOString().slice(0, 10);
  const urls = [
    { loc: `${SITE_ORIGIN}/`, lastmod: today, priority: '1.0', changefreq: 'weekly' },
    { loc: `${SITE_ORIGIN}/employers`, lastmod: today, priority: '0.9', changefreq: 'monthly' },
    { loc: `${SITE_ORIGIN}/jobs`, lastmod: today, priority: '0.9', changefreq: 'daily' },
    { loc: `${SITE_ORIGIN}/insights`, lastmod: today, priority: '0.8', changefreq: 'weekly' },
  ];

  try {
    for (const post of getAllPosts()) {
      urls.push({
        loc: `${SITE_ORIGIN}/insights/${post.slug}`,
        lastmod: (post.updatedAt || post.date || '').slice(0, 10) || today,
        priority: '0.7',
        changefreq: 'monthly',
      });
    }
  } catch (err) {
    console.error('sitemap: failed to load posts:', err);
  }

  try {
    for (const job of getAllJobs()) {
      urls.push({
        loc: `${SITE_ORIGIN}/jobs/${jobSlug(job)}`,
        lastmod: (job.updatedAt || job.createdAt || '').slice(0, 10) || today,
        priority: '0.7',
        changefreq: 'weekly',
      });
    }
  } catch (err) {
    console.error('sitemap: failed to load jobs:', err);
  }

  const xml =
    `<?xml version="1.0" encoding="UTF-8"?>\n` +
    `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n` +
    urls
      .map(
        (u) =>
          `  <url>\n    <loc>${u.loc}</loc>\n    <lastmod>${u.lastmod}</lastmod>\n` +
          `    <changefreq>${u.changefreq}</changefreq>\n    <priority>${u.priority}</priority>\n  </url>`
      )
      .join('\n') +
    `\n</urlset>\n`;

  res.setHeader('Content-Type', 'application/xml; charset=utf-8');
  res.setHeader('Cache-Control', 'public, s-maxage=3600, stale-while-revalidate=86400');
  return res.status(200).send(xml);
}
