import express from "express";
import path from "path";
import dotenv from "dotenv";
import { fileURLToPath } from 'url';
import fs from 'fs';
import admin from 'firebase-admin';
import { getFirestore } from 'firebase-admin/firestore';
import contactHandler from './api/contact';
import applyHandler from './api/apply';
import uploadHandler from './api/upload';
import employerInquiryHandler from './api/employer-inquiry';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load Firebase config for server-side admin.
// NOTE: this is only consumed by the /sitemap.xml route, which is unreachable
// on Vercel (vercel.json routes only /api/* to this function; /sitemap.xml
// falls through to the SPA). Initializing firebase-admin with a real projectId
// but no credentials can block on cold start while it probes for Application
// Default Credentials, which hangs every function invocation. So only init it
// when explicitly enabled.
const firebaseConfigPath = path.join(process.cwd(), 'firebase-applet-config.json');
let dbAdmin: any = null;

if (process.env.ENABLE_FIREBASE_ADMIN === 'true') {
  try {
    const firebaseConfig = JSON.parse(fs.readFileSync(firebaseConfigPath, 'utf8'));

    if (!admin.apps.length) {
      admin.initializeApp({
        projectId: firebaseConfig.projectId,
      });
    }

    // Use the specific database if provided, otherwise default
    dbAdmin = getFirestore(firebaseConfig.firestoreDatabaseId || '(default)');
    console.log(`Firebase Admin initialized with database: ${firebaseConfig.firestoreDatabaseId || '(default)'}`);
  } catch (error) {
    console.error("Error initializing Firebase Admin:", error);
  }
}

const app = express();

// Sitemap dynamic generation - Register this EARLY
app.get("/sitemap.xml", async (req, res) => {
  console.log("Sitemap request received");
  try {
    const baseUrl = process.env.APP_URL || `https://${req.get('host')}`;
    console.log(`Generating sitemap with baseUrl: ${baseUrl}`);
    
    // Fetch jobs from Firestore
    let jobs: any[] = [];
    if (dbAdmin) {
      const jobsSnapshot = await dbAdmin.collection('jobs').get();
      jobs = jobsSnapshot.docs.map((doc: any) => ({ id: doc.id, ...doc.data() }));
      console.log(`Fetched ${jobs.length} jobs for sitemap`);
    } else {
      console.warn("dbAdmin not initialized, sitemap will be partial");
    }

    let xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>${baseUrl}/</loc>
    <changefreq>weekly</changefreq>
    <priority>1.0</priority>
  </url>
  <url>
    <loc>${baseUrl}/jobs</loc>
    <changefreq>daily</changefreq>
    <priority>0.9</priority>
  </url>`;

    jobs.forEach((job: any) => {
      xml += `
  <url>
    <loc>${baseUrl}/jobs/${job.id}</loc>
    <lastmod>${job.updatedAt ? job.updatedAt.split('T')[0] : new Date().toISOString().split('T')[0]}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.7</priority>
  </url>`;
    });

    xml += `
</urlset>`;

    res.set('Content-Type', 'application/xml');
    res.status(200).send(xml);
    console.log("Sitemap sent successfully");
  } catch (error) {
    console.error("Error generating sitemap:", error);
    res.status(500).set('Content-Type', 'text/plain').send("Error generating sitemap");
  }
});

// Resumes are sent as base64 data URLs in the JSON body, so raise the limit
// above the 100kb default for local dev. (On Vercel these routes are served by
// the native functions in /api, not this Express app.)
app.use(express.json({ limit: '10mb' }));

// In production the API is served by native Vercel Serverless Functions under
// /api (see api/contact.ts and api/apply.ts). For local dev (`npm run dev` ->
// `tsx server.ts`) we mount those same handlers on Express so there is a single
// source of truth and no logic drift between local and deployed behaviour.
app.post("/api/contact", (req, res) => contactHandler(req as any, res as any));
app.post("/api/apply", (req, res) => applyHandler(req as any, res as any));
app.post("/api/upload", (req, res) => uploadHandler(req as any, res as any));
app.post("/api/employer-inquiry", (req, res) => employerInquiryHandler(req as any, res as any));

async function setupVite() {
  if (process.env.NODE_ENV !== "production") {
    const { createServer: createViteServer } = await import("vite");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    if (fs.existsSync(distPath)) {
      app.use(express.static(distPath));
      app.get("*", (req, res) => {
        res.sendFile(path.join(distPath, "index.html"));
      });
    }
  }
}

setupVite();

const PORT = 3000;
app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

export default app;
