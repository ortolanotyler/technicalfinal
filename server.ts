import express from "express";
import path from "path";
import sgMail from "@sendgrid/mail";
import dotenv from "dotenv";
import { fileURLToPath } from 'url';
import fs from 'fs';
import admin from 'firebase-admin';
import { getFirestore } from 'firebase-admin/firestore';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load Firebase config for server-side admin
const firebaseConfigPath = path.join(process.cwd(), 'firebase-applet-config.json');
let dbAdmin: any;

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

app.use(express.json());

if (process.env.SENDGRID_API_KEY) {
  sgMail.setApiKey(process.env.SENDGRID_API_KEY);
}

// Email API routes
app.post("/api/contact", async (req, res) => {
  const { email, name, company, message } = req.body;

  if (!email || !name) {
    return res.status(400).json({ error: "Name and Email are required" });
  }

  if (!process.env.SENDGRID_API_KEY) {
    console.log("[Dev] Contact form submission:", { name, email, company, message });
    return res.json({ success: true, message: "Dev mode: Email logged to console" });
  }

  const msg = {
    to: "recruit@certusgroup.com",
    from: "tyler@certusgroup.com", 
    subject: `New Contact: ${name}`,
    text: `Name: ${name}\nEmail: ${email}\nCompany: ${company || 'N/A'}\nMessage: ${message || 'N/A'}`,
    html: `
      <h3>New Contact Form Submission</h3>
      <p><strong>Name:</strong> ${name}</p>
      <p><strong>Email:</strong> ${email}</p>
      <p><strong>Company:</strong> ${company || 'N/A'}</p>
      <p><strong>Message:</strong> ${message || 'N/A'}</p>
    `,
  };

  try {
    await sgMail.send(msg);
    res.json({ success: true });
  } catch (error) {
    console.error("Error sending email:", error);
    res.status(500).json({ error: "Failed to send email" });
  }
});

app.post("/api/apply", async (req, res) => {
  const { firstName, lastName, email, phone, linkedin, jobTitle, jobRef, resumeBase64, resumeName } = req.body;

  if (!email || !firstName || !lastName) {
    return res.status(400).json({ error: "Required fields missing" });
  }

  if (!process.env.SENDGRID_API_KEY) {
    console.log("[Dev] Job application:", { firstName, lastName, email, jobTitle });
    return res.json({ success: true, message: "Dev mode: Application logged to console" });
  }

  const msg: any = {
    to: "recruit@certusgroup.com",
    from: "tyler@certusgroup.com",
    subject: `New Job Application: ${jobTitle} (${jobRef || 'No Ref'})`,
    text: `
      New application for ${jobTitle} (${jobRef || 'No Ref'})
      
      Name: ${firstName} ${lastName}
      Email: ${email}
      Phone: ${phone || 'Not provided'}
      LinkedIn: ${linkedin || 'Not provided'}
    `,
    html: `
      <h3>New Job Application</h3>
      <p><strong>Job:</strong> ${jobTitle} (${jobRef || 'No Ref'})</p>
      <p><strong>Name:</strong> ${firstName} ${lastName}</p>
      <p><strong>Email:</strong> ${email}</p>
      <p><strong>Phone:</strong> ${phone || 'Not provided'}</p>
      <p><strong>LinkedIn:</strong> ${linkedin || 'Not provided'}</p>
    `,
  };

  if (resumeBase64) {
    msg.attachments = [
      {
        content: resumeBase64.split(',')[1],
        filename: resumeName || 'resume.pdf',
        type: 'application/pdf',
        disposition: 'attachment',
      },
    ];
  }

  try {
    await sgMail.send(msg);
    res.json({ success: true });
  } catch (error) {
    console.error("Error sending application email:", error);
    res.status(500).json({ error: "Failed to send application" });
  }
});

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
