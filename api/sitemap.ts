import type { VercelRequest, VercelResponse } from '@vercel/node';
import { initializeApp, getApps, type FirebaseApp } from 'firebase/app';
import { getFirestore, collection, getDocs } from 'firebase/firestore';

// Self-contained (see api/render.ts for why).
const SITE_ORIGIN = 'https://thecertusgroup.tech';
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

async function getAllJobs(): Promise<JobDoc[]> {
  const app: FirebaseApp = getApps()[0] || initializeApp(FIREBASE_CONFIG);
  const dbRef = getFirestore(app, FIRESTORE_DB_ID);
  const snap = await getDocs(collection(dbRef, 'jobs'));
  return snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<JobDoc, 'id'>) }));
}

export default async function handler(_req: VercelRequest, res: VercelResponse) {
  const today = new Date().toISOString().slice(0, 10);
  const urls = [
    { loc: `${SITE_ORIGIN}/`, lastmod: today, priority: '1.0', changefreq: 'weekly' },
    { loc: `${SITE_ORIGIN}/employers`, lastmod: today, priority: '0.9', changefreq: 'monthly' },
    { loc: `${SITE_ORIGIN}/jobs`, lastmod: today, priority: '0.9', changefreq: 'daily' },
  ];

  try {
    for (const job of await getAllJobs()) {
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
