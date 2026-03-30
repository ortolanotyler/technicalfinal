import { JobPosting, LinkedInPost } from '../types';

// Seed Data for initial migration
const INITIAL_JOBS: JobPosting[] = [
    { 
        id: 1, 
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
        ]
    },
    { 
        id: 2, 
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
        ]
    }
];

const INITIAL_LINKEDIN: Partial<LinkedInPost>[] = [
  {
    id: '1',
    author: 'Certus Technical Search',
    role: 'Technical Search & Recruitment',
    content: 'Excited to announce that Certus Group has successfully placed a Lead Heavy Duty Mechanic for one of our key mining partners in Alberta. The skilled trades market remains highly competitive, and we are proud to connect top-tier talent with industry leaders. #SkilledTrades #Recruitment #CertusGroup',
    date: '2d ago',
    avatar: 'https://res.cloudinary.com/dvbubqhpp/image/upload/v1770919808/CertusLOGO_szfewa.png'
  },
  {
    id: '2',
    author: 'Certus Technical Search',
    role: 'Technical Search & Recruitment',
    content: 'We are currently seeing a surge in demand for Industrial Electricians across Ontario. If you are a licensed professional looking for your next challenge, check out our latest openings. #IndustrialElectrician #HamiltonJobs #Manufacturing',
    date: '5d ago',
    avatar: 'https://res.cloudinary.com/dvbubqhpp/image/upload/v1770919808/CertusLOGO_szfewa.png'
  }
];

const STORAGE_KEYS = {
  AUTH_TOKEN: 'certus_auth_token',
  AUTH_USER: 'certus_auth_user'
};

const getAuthHeaders = () => {
  const token = localStorage.getItem(STORAGE_KEYS.AUTH_TOKEN);
  return {
    'Content-Type': 'application/json',
    'Authorization': token ? `Bearer ${token}` : ''
  };
};

export const jobService = {
  seedDatabase: async (): Promise<void> => {
    // Backend handles its own seeding
  },

  getJobs: async (): Promise<JobPosting[]> => {
    const res = await fetch('/api/jobs');
    if (!res.ok) throw new Error('Failed to fetch jobs');
    return res.json();
  },

  getJobsByDomain: async (): Promise<JobPosting[]> => {
    return jobService.getJobs();
  },

  saveJob: async (job: JobPosting): Promise<void> => {
    const isNew = !job.id || typeof job.id === 'number'; // Initial seed IDs are numbers
    const url = isNew ? '/api/jobs' : `/api/jobs/${job.id}`;
    const method = isNew ? 'POST' : 'PUT';

    const res = await fetch(url, {
      method,
      headers: getAuthHeaders(),
      body: JSON.stringify(job)
    });

    if (!res.ok) throw new Error('Failed to save job');
  },

  deleteJob: async (id: string | number): Promise<void> => {
    const res = await fetch(`/api/jobs/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders()
    });

    if (!res.ok) throw new Error('Failed to delete job');
  },

  login: async (username: string, password: string): Promise<boolean> => {
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password })
    });

    if (res.ok) {
      const data = await res.json();
      localStorage.setItem(STORAGE_KEYS.AUTH_TOKEN, data.token);
      localStorage.setItem(STORAGE_KEYS.AUTH_USER, username);
      return true;
    }
    return false;
  },

  logout: async (): Promise<void> => {
    localStorage.removeItem(STORAGE_KEYS.AUTH_TOKEN);
    localStorage.removeItem(STORAGE_KEYS.AUTH_USER);
  },

  isLoggedIn: (): boolean => {
    return !!localStorage.getItem(STORAGE_KEYS.AUTH_TOKEN);
  },

  onAuthChange: (callback: (user: any | null) => void) => {
    const checkAuth = () => {
      const token = localStorage.getItem(STORAGE_KEYS.AUTH_TOKEN);
      const user = localStorage.getItem(STORAGE_KEYS.AUTH_USER);
      callback(token ? { email: user } : null);
    };
    window.addEventListener('storage', checkAuth);
    checkAuth();
    return () => window.removeEventListener('storage', checkAuth);
  },

  getLinkedInPosts: async (): Promise<LinkedInPost[]> => {
    const res = await fetch('/api/linkedin-posts');
    if (!res.ok) throw new Error('Failed to fetch posts');
    return res.json();
  },

  saveLinkedInPost: async (post: Partial<LinkedInPost>): Promise<void> => {
    const res = await fetch('/api/linkedin-posts', {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(post)
    });

    if (!res.ok) throw new Error('Failed to save post');
  },

  deleteLinkedInPost: async (id: string): Promise<void> => {
    const res = await fetch(`/api/linkedin-posts/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders()
    });

    if (!res.ok) throw new Error('Failed to delete post');
  }
};
