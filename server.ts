// Server version: 1.0.4 - Vercel-native refactor
import express from "express";
import path from "path";
import sgMail from "@sendgrid/mail";
import dotenv from "dotenv";
import { fileURLToPath } from 'url';

dotenv.config();

console.log(`[Startup] ADMIN_USERNAME set: ${!!process.env.ADMIN_USERNAME}`);
console.log(`[Startup] ADMIN_PASSWORD set: ${!!process.env.ADMIN_PASSWORD}`);

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(express.json());

if (process.env.SENDGRID_API_KEY) {
  sgMail.setApiKey(process.env.SENDGRID_API_KEY);
}

// In-memory storage
let jobs = [
  { 
      id: "1", 
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
      id: "2", 
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

let linkedinPosts = [
  {
    id: "1",
    author: 'Tyler Ortolano',
    role: 'Managing Partner',
    content: 'Excited to announce that Certus Group has successfully placed a Lead Heavy Duty Mechanic for one of our key mining partners in Alberta. The skilled trades market remains highly competitive, and we are proud to connect top-tier talent with industry leaders. #SkilledTrades #Recruitment #CertusGroup',
    date: '2d ago',
    avatar: 'https://res.cloudinary.com/dvbubqhpp/image/upload/v1710947667/tyler-avatar_eiabfr.jpg',
    createdAt: new Date().toISOString()
  },
  {
    id: "2",
    author: 'Certus Group',
    role: 'Executive Search',
    content: 'We are currently seeing a surge in demand for Industrial Electricians across Ontario. If you are a licensed professional looking for your next challenge, check out our latest openings. #IndustrialElectrician #HamiltonJobs #Manufacturing',
    date: '5d ago',
    avatar: 'https://res.cloudinary.com/dvbubqhpp/image/upload/v1710947667/certus-logo-avatar_eiabfr.jpg',
    createdAt: new Date().toISOString()
  }
];

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

app.get("/api/jobs", (req, res) => {
  res.json(jobs.sort((a, b) => b.createdAt.localeCompare(a.createdAt)));
});

app.post("/api/jobs", adminAuth, (req, res) => {
  const newJob = { 
    ...req.body, 
    id: Math.random().toString(36).substr(2, 9),
    createdAt: new Date().toISOString()
  };
  jobs.push(newJob);
  res.status(201).json(newJob);
});

app.put("/api/jobs/:id", adminAuth, (req, res) => {
  const { id } = req.params;
  const index = jobs.findIndex(j => j.id === id);
  if (index !== -1) {
    jobs[index] = { ...jobs[index], ...req.body, updatedAt: new Date().toISOString() };
    res.json(jobs[index]);
  } else {
    res.status(404).json({ error: "Job not found" });
  }
});

app.delete("/api/jobs/:id", adminAuth, (req, res) => {
  const { id } = req.params;
  jobs = jobs.filter(j => j.id !== id);
  res.json({ success: true });
});

app.get("/api/linkedin-posts", (req, res) => {
  res.json(linkedinPosts.sort((a, b) => b.createdAt.localeCompare(a.createdAt)));
});

app.post("/api/linkedin-posts", adminAuth, (req, res) => {
  const newPost = { 
    ...req.body, 
    id: Math.random().toString(36).substr(2, 9),
    createdAt: new Date().toISOString()
  };
  linkedinPosts.push(newPost);
  res.status(201).json(newPost);
});

app.delete("/api/linkedin-posts/:id", adminAuth, (req, res) => {
  const { id } = req.params;
  linkedinPosts = linkedinPosts.filter(p => p.id !== id);
  res.json({ success: true });
});

// Export CSV routes
app.get("/api/export/jobs", adminAuth, (req, res) => {
  const header = "ID,Ref,Title,Location,Type,Salary,Posted,CreatedAt\n";
  const rows = jobs.map(j => 
    `"${j.id}","${j.ref}","${j.title}","${j.location}","${j.type}","${j.salary}","${j.posted}","${j.createdAt}"`
  ).join("\n");
  
  res.setHeader('Content-Type', 'text/csv');
  res.setHeader('Content-Disposition', 'attachment; filename=jobs_export.csv');
  res.send(header + rows);
});

app.get("/api/export/linkedin", adminAuth, (req, res) => {
  const header = "ID,Author,Role,Content,Date,CreatedAt\n";
  const rows = linkedinPosts.map(p => 
    `"${p.id}","${p.author}","${p.role}","${p.content.replace(/"/g, '""')}","${p.date}","${p.createdAt}"`
  ).join("\n");
  
  res.setHeader('Content-Type', 'text/csv');
  res.setHeader('Content-Disposition', 'attachment; filename=linkedin_export.csv');
  res.send(header + rows);
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
