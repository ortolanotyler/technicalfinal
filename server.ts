// Server version: 1.0.4 - Vercel-native refactor
import express from "express";
import path from "path";
import sgMail from "@sendgrid/mail";
import dotenv from "dotenv";
import { fileURLToPath } from 'url';
import admin from "firebase-admin";
import { getFirestore } from "firebase-admin/firestore";
import firebaseConfig from './firebase-applet-config.json' assert { type: 'json' };

dotenv.config();

// Initialize Firebase Admin
const adminApp = !admin.apps.length 
  ? admin.initializeApp({ projectId: firebaseConfig.projectId })
  : admin.app();

const db = getFirestore(adminApp, firebaseConfig.firestoreDatabaseId);
const jobsCol = db.collection("jobs");
const postsCol = db.collection("linkedinPosts");

console.log(`[Startup] ADMIN_USERNAME set: ${!!process.env.ADMIN_USERNAME}`);
console.log(`[Startup] ADMIN_PASSWORD set: ${!!process.env.ADMIN_PASSWORD}`);

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(express.json());

if (process.env.SENDGRID_API_KEY) {
  sgMail.setApiKey(process.env.SENDGRID_API_KEY);
}

// Seed Firestore if empty
async function seedFirestore() {
  try {
    const jobsSnapshot = await jobsCol.limit(1).get();
    if (jobsSnapshot.empty) {
      console.log("[Seeding] Adding initial jobs to Firestore...");
      const initialJobs = [
        { 
            ref: 'TRD-2401', 
            title: 'Lead Heavy Duty Mechanic', 
            location: 'Edmonton, AB', 
            type: 'Full-Time', 
            salary: '$48 - $55 / hr', 
            posted: '2 days ago',
            summary: "A high-visibility leadership role for a Journeyman HD Mechanic, responsible for overseeing a fleet of mining and heavy construction equipment.",
            responsibilities: [
                "Lead a team of 15+ mechanics and apprentices in a high-volume shop environment.",
                "Oversee preventative maintenance programs for a diverse fleet of CAT and Komatsu equipment.",
                "Manage shop P&L and parts inventory to ensure maximum uptime.",
                "Mentor junior technicians and ensure strict adherence to safety protocols."
            ],
            requirements: [
                "Journeyman Heavy Duty Mechanic certification (Red Seal preferred).",
                "10+ years of experience in heavy equipment maintenance.",
                "Proven leadership experience in a shop foreman or lead hand capacity.",
                "Deep expertise in hydraulic systems and electronic diagnostics."
            ],
            createdAt: new Date().toISOString()
        },
        { 
            ref: 'TRD-2404', 
            title: 'Industrial Electrician', 
            location: 'Hamilton, ON', 
            type: 'Full-Time', 
            salary: '$42 - $48 / hr', 
            posted: '1 week ago',
            summary: "Joining a leading manufacturing facility to oversee plant-wide electrical maintenance and automation systems.",
            responsibilities: [
                "Troubleshoot and repair complex industrial control systems and PLC logic.",
                "Perform preventative maintenance on high-voltage distribution systems.",
                "Collaborate with engineering teams on equipment upgrades and commissioning.",
                "Ensure compliance with all electrical codes and safety standards."
            ],
            requirements: [
                "442A or 309A Electrician license.",
                "5+ years of experience in an industrial manufacturing environment.",
                "Strong proficiency in Allen-Bradley or Siemens PLC troubleshooting.",
                "Experience with VFDs and industrial motor controls."
            ],
            createdAt: new Date().toISOString()
        }
      ];
      for (const job of initialJobs) {
        await jobsCol.add(job);
      }
    }

    const postsSnapshot = await postsCol.limit(1).get();
    if (postsSnapshot.empty) {
      console.log("[Seeding] Adding initial LinkedIn posts to Firestore...");
      const initialPosts = [
        {
          author: 'Tyler Ortolano',
          role: 'Managing Partner',
          content: 'Excited to announce that Certus Group has successfully placed a Lead Heavy Duty Mechanic for one of our key mining partners in Alberta. The skilled trades market remains highly competitive, and we are proud to connect top-tier talent with industry leaders. #SkilledTrades #Recruitment #CertusGroup',
          date: '2d ago',
          avatar: 'https://res.cloudinary.com/dvbubqhpp/image/upload/v1710947667/tyler-avatar_eiabfr.jpg',
          createdAt: new Date().toISOString()
        },
        {
          author: 'Certus Group',
          role: 'Executive Search',
          content: 'We are currently seeing a surge in demand for Industrial Electricians across Ontario. If you are a licensed professional looking for your next challenge, check out our latest openings. #IndustrialElectrician #HamiltonJobs #Manufacturing',
          date: '5d ago',
          avatar: 'https://res.cloudinary.com/dvbubqhpp/image/upload/v1710947667/certus-logo-avatar_eiabfr.jpg',
          createdAt: new Date().toISOString()
        }
      ];
      for (const post of initialPosts) {
        await postsCol.add(post);
      }
    }
  } catch (error) {
    console.error("[Seeding] Error seeding Firestore:", error);
  }
}

seedFirestore();

// Auth middleware (simple for demo)
const adminAuth = (req: express.Request, res: express.Response, next: express.NextFunction) => {
  const adminPassword = req.headers['x-admin-password'];
  const expectedPass = (process.env.ADMIN_PASSWORD || 'certusadmin').trim();

  if (adminPassword === expectedPass) {
    next();
  } else {
    res.status(401).json({ error: "Unauthorized" });
  }
};

// Firestore Error Handler
enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

const handleFirestoreError = (error: any, operation: OperationType, path: string) => {
  console.error(`[Firestore Error] ${operation} on ${path}:`, error);
  const errInfo = {
    error: error.message || String(error),
    operationType: operation,
    path: path,
    code: error.code
  };
  return errInfo;
};

// API routes
app.post("/api/auth/login", (req, res) => {
  const username = (req.body.username || "").trim();
  const password = (req.body.password || "").trim();
  
  const expectedUser = (process.env.ADMIN_USERNAME || 'tyler').trim();
  const expectedPass = (process.env.ADMIN_PASSWORD || 'certusadmin').trim();

  console.log(`[Auth] Login attempt for: "${username}"`);
  console.log(`[Auth] Expected user length: ${expectedUser.length}, Expected pass length: ${expectedPass.length}`);
  console.log(`[Auth] Provided user length: ${username.length}, Provided pass length: ${password.length}`);

  if (username === expectedUser && password === expectedPass) {
    console.log(`[Auth] Login successful for: "${username}"`);
    res.json({ token: expectedPass });
  } else {
    console.log(`[Auth] Login failed for: "${username}". Expected user: "${expectedUser}"`);
    res.status(401).json({ error: "Invalid credentials" });
  }
});

app.get("/api/jobs", async (req, res) => {
  try {
    const snapshot = await jobsCol.orderBy("createdAt", "desc").get();
    const jobsList = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    res.json(jobsList);
  } catch (error) {
    res.status(500).json(handleFirestoreError(error, OperationType.LIST, "jobs"));
  }
});

app.post("/api/jobs", adminAuth, async (req, res) => {
  try {
    const newJob = { 
      ...req.body, 
      createdAt: new Date().toISOString()
    };
    const docRef = await jobsCol.add(newJob);
    res.status(201).json({ id: docRef.id, ...newJob });
  } catch (error) {
    res.status(500).json(handleFirestoreError(error, OperationType.CREATE, "jobs"));
  }
});

app.put("/api/jobs/:id", adminAuth, async (req, res) => {
  try {
    const id = req.params.id as string;
    const updateData = { ...req.body, updatedAt: new Date().toISOString() };
    await jobsCol.doc(id).update(updateData);
    const updatedDoc = await jobsCol.doc(id).get();
    res.json({ id: updatedDoc.id, ...updatedDoc.data() });
  } catch (error) {
    res.status(500).json(handleFirestoreError(error, OperationType.UPDATE, `jobs/${req.params.id}`));
  }
});

app.delete("/api/jobs/:id", adminAuth, async (req, res) => {
  try {
    const id = req.params.id as string;
    await jobsCol.doc(id).delete();
    res.json({ success: true });
  } catch (error) {
    res.status(500).json(handleFirestoreError(error, OperationType.DELETE, `jobs/${req.params.id}`));
  }
});

app.get("/api/linkedin-posts", async (req, res) => {
  try {
    const snapshot = await postsCol.orderBy("createdAt", "desc").get();
    const postsList = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    res.json(postsList);
  } catch (error) {
    res.status(500).json(handleFirestoreError(error, OperationType.LIST, "linkedinPosts"));
  }
});

app.post("/api/linkedin-posts", adminAuth, async (req, res) => {
  try {
    const newPost = { 
      ...req.body, 
      createdAt: new Date().toISOString()
    };
    const docRef = await postsCol.add(newPost);
    res.status(201).json({ id: docRef.id, ...newPost });
  } catch (error) {
    res.status(500).json(handleFirestoreError(error, OperationType.CREATE, "linkedinPosts"));
  }
});

app.delete("/api/linkedin-posts/:id", adminAuth, async (req, res) => {
  try {
    const id = req.params.id as string;
    await postsCol.doc(id).delete();
    res.json({ success: true });
  } catch (error) {
    res.status(500).json(handleFirestoreError(error, OperationType.DELETE, `linkedinPosts/${req.params.id}`));
  }
});

// Export CSV routes
app.get("/api/export/jobs", adminAuth, async (req, res) => {
  try {
    const snapshot = await jobsCol.orderBy("createdAt", "desc").get();
    const jobsList = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() as any }));
    
    const header = "ID,Ref,Title,Location,Type,Salary,Posted,CreatedAt\n";
    const rows = jobsList.map(j => 
      `"${j.id}","${j.ref}","${j.title}","${j.location}","${j.type}","${j.salary}","${j.posted}","${j.createdAt}"`
    ).join("\n");
    
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=jobs_export.csv');
    res.send(header + rows);
  } catch (error) {
    res.status(500).json({ error: "Failed to export jobs" });
  }
});

app.get("/api/export/linkedin", adminAuth, async (req, res) => {
  try {
    const snapshot = await postsCol.orderBy("createdAt", "desc").get();
    const postsList = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() as any }));

    const header = "ID,Author,Role,Content,Date,CreatedAt\n";
    const rows = postsList.map(p => 
      `"${p.id}","${p.author}","${p.role}","${p.content.replace(/"/g, '""')}","${p.date}","${p.createdAt}"`
    ).join("\n");
    
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=linkedin_export.csv');
    res.send(header + rows);
  } catch (error) {
    res.status(500).json({ error: "Failed to export posts" });
  }
});

app.post("/api/contact", async (req, res) => {
  const { email, name } = req.body;

  if (!email || !name) {
    return res.status(400).json({ error: "Name and Email are required" });
  }

  if (!process.env.SENDGRID_API_KEY) {
    console.error("SENDGRID_API_KEY is not set.");
    return res.status(500).json({ error: "Email service not configured" });
  }

  const msg = {
    to: "recruit@certusgroup.com",
    from: "tyler@certusgroup.com", 
    subject: `New Contact: ${name}`,
    text: `Name: ${name}\nEmail: ${email}`,
    html: `
      <h3>New Contact Form Submission</h3>
      <p><strong>Name:</strong> ${name}</p>
      <p><strong>Email:</strong> ${email}</p>
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
  const { firstName, lastName, email, linkedin, jobTitle, jobRef } = req.body;

  if (!email || !firstName || !lastName) {
    return res.status(400).json({ error: "Required fields missing" });
  }

  if (!process.env.SENDGRID_API_KEY) {
    console.error("SENDGRID_API_KEY is not set.");
    return res.status(500).json({ error: "Email service not configured" });
  }

  const msg = {
    to: "recruit@certusgroup.com",
    from: "tyler@certusgroup.com",
    subject: `New Job Application: ${jobTitle} (${jobRef})`,
    text: `
      New application for ${jobTitle} (${jobRef})
      
      Name: ${firstName} ${lastName}
      Email: ${email}
      LinkedIn: ${linkedin || 'Not provided'}
    `,
    html: `
      <h3>New Job Application</h3>
      <p><strong>Job:</strong> ${jobTitle} (${jobRef})</p>
      <p><strong>Name:</strong> ${firstName} ${lastName}</p>
      <p><strong>Email:</strong> ${email}</p>
      <p><strong>LinkedIn:</strong> ${linkedin || 'Not provided'}</p>
    `,
  };

  try {
    await sgMail.send(msg);
    res.json({ success: true });
  } catch (error) {
    console.error("Error sending application email:", error);
    res.status(500).json({ error: "Failed to send application" });
  }
});

async function setupVite() {
  if (process.env.NODE_ENV !== "production" && !process.env.VERCEL) {
    const { createServer: createViteServer } = await import("vite");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else if (!process.env.VERCEL) {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }
}

setupVite();

if (!process.env.VERCEL) {
  const PORT = 3000;
  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

export default app;
