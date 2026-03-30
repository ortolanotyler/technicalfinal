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
  JOBS: 'certus_jobs',
  POSTS: 'certus_posts',
  AUTH: 'certus_is_logged_in'
};

const getStoredData = <T>(key: string, initial: T): T => {
  const stored = localStorage.getItem(key);
  if (!stored) {
    localStorage.setItem(key, JSON.stringify(initial));
    return initial;
  }
  return JSON.parse(stored);
};

const setStoredData = <T>(key: string, data: T): void => {
  localStorage.setItem(key, JSON.stringify(data));
};

export const jobService = {
  seedDatabase: async (): Promise<void> => {
    // LocalStorage handles its own seeding in getStoredData
    getStoredData(STORAGE_KEYS.JOBS, INITIAL_JOBS);
    getStoredData(STORAGE_KEYS.POSTS, INITIAL_LINKEDIN);
  },

  getJobs: async (): Promise<JobPosting[]> => {
    return getStoredData(STORAGE_KEYS.JOBS, INITIAL_JOBS);
  },

  getJobsByDomain: async (): Promise<JobPosting[]> => {
    return getStoredData(STORAGE_KEYS.JOBS, INITIAL_JOBS);
  },

  saveJob: async (job: JobPosting): Promise<void> => {
    const jobs = getStoredData(STORAGE_KEYS.JOBS, INITIAL_JOBS);
    if (job.id) {
      const index = jobs.findIndex(j => j.id === job.id);
      if (index !== -1) {
        jobs[index] = { ...job, updatedAt: new Date().toISOString() } as any;
      } else {
        jobs.push({ ...job, createdAt: new Date().toISOString() });
      }
    } else {
      const newJob = { 
        ...job, 
        id: Date.now(),
        createdAt: new Date().toISOString() 
      };
      jobs.push(newJob);
    }
    setStoredData(STORAGE_KEYS.JOBS, jobs);
  },

  deleteJob: async (id: string | number): Promise<void> => {
    const jobs = getStoredData(STORAGE_KEYS.JOBS, INITIAL_JOBS);
    const filtered = jobs.filter(j => j.id.toString() !== id.toString());
    setStoredData(STORAGE_KEYS.JOBS, filtered);
  },

  login: async (email: string, password: string): Promise<boolean> => {
    // Simple mock login for demo purposes
    if ((email === 'tyler' || email === 'tyler.ortolano95@gmail.com') && password === 'certusadmin') {
      localStorage.setItem(STORAGE_KEYS.AUTH, 'true');
      return true;
    }
    return false;
  },

  logout: async (): Promise<void> => {
    localStorage.removeItem(STORAGE_KEYS.AUTH);
  },

  isLoggedIn: (): boolean => {
    return localStorage.getItem(STORAGE_KEYS.AUTH) === 'true';
  },

  onAuthChange: (callback: (user: any | null) => void) => {
    // Mock auth change listener
    const checkAuth = () => {
      const isLoggedIn = localStorage.getItem(STORAGE_KEYS.AUTH) === 'true';
      callback(isLoggedIn ? { email: 'tyler@certusgroup.com' } : null);
    };
    window.addEventListener('storage', checkAuth);
    checkAuth();
    return () => window.removeEventListener('storage', checkAuth);
  },

  getLinkedInPosts: async (): Promise<LinkedInPost[]> => {
    return getStoredData(STORAGE_KEYS.POSTS, INITIAL_LINKEDIN) as LinkedInPost[];
  },

  saveLinkedInPost: async (post: Partial<LinkedInPost>): Promise<void> => {
    const posts = getStoredData(STORAGE_KEYS.POSTS, INITIAL_LINKEDIN);
    if (post.id) {
      const index = posts.findIndex(p => p.id === post.id);
      if (index !== -1) {
        posts[index] = { ...post, updatedAt: new Date().toISOString() };
      }
    } else {
      const newPost = { 
        ...post, 
        id: Date.now().toString(),
        createdAt: new Date().toISOString() 
      };
      posts.push(newPost);
    }
    setStoredData(STORAGE_KEYS.POSTS, posts);
  },

  deleteLinkedInPost: async (id: string): Promise<void> => {
    const posts = getStoredData(STORAGE_KEYS.POSTS, INITIAL_LINKEDIN);
    const filtered = posts.filter(p => p.id !== id);
    setStoredData(STORAGE_KEYS.POSTS, filtered);
  }
};
