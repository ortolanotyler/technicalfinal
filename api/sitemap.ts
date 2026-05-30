import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getAllJobs } from '../lib/jobs';
import { SITE_ORIGIN } from '../lib/seo';

// Dynamic sitemap built from live jobs, so Google discovers every /jobs/:id URL.
export default async function handler(_req: VercelRequest, res: VercelResponse) {
  const today = new Date().toISOString().slice(0, 10);

  const urls: { loc: string; lastmod: string; priority: string; changefreq: string }[] = [
    { loc: `${SITE_ORIGIN}/`, lastmod: today, priority: '1.0', changefreq: 'weekly' },
    { loc: `${SITE_ORIGIN}/jobs`, lastmod: today, priority: '0.9', changefreq: 'daily' },
  ];

  try {
    const jobs = await getAllJobs();
    for (const job of jobs) {
      urls.push({
        loc: `${SITE_ORIGIN}/jobs/${job.id}`,
        lastmod: (job.updatedAt || job.createdAt || '').slice(0, 10) || today,
        priority: '0.7',
        changefreq: 'weekly',
      });
    }
  } catch (err) {
    console.error('sitemap: failed to load jobs, returning static URLs:', err);
  }

  const xml =
    `<?xml version="1.0" encoding="UTF-8"?>\n` +
    `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n` +
    urls
      .map(
        (u) =>
          `  <url>\n` +
          `    <loc>${u.loc}</loc>\n` +
          `    <lastmod>${u.lastmod}</lastmod>\n` +
          `    <changefreq>${u.changefreq}</changefreq>\n` +
          `    <priority>${u.priority}</priority>\n` +
          `  </url>`
      )
      .join('\n') +
    `\n</urlset>\n`;

  res.setHeader('Content-Type', 'application/xml; charset=utf-8');
  res.setHeader('Cache-Control', 'public, s-maxage=3600, stale-while-revalidate=86400');
  return res.status(200).send(xml);
}
