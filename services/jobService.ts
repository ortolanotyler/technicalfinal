import { JobPosting, LinkedInPost } from '../types';
import jobsData from '../data/jobs.json';
import postsData from '../data/linkedinPosts.json';

// Jobs and LinkedIn posts are now static data in /data (no Firebase). To add or
// edit a posting, edit data/jobs.json (or data/linkedinPosts.json) and deploy.
const JOBS = jobsData as unknown as JobPosting[];
const POSTS = postsData as unknown as LinkedInPost[];

const byNewest = (a: { createdAt?: string }, b: { createdAt?: string }) =>
  (b.createdAt || '').localeCompare(a.createdAt || '');

export const jobService = {
  getJobs: async (): Promise<JobPosting[]> => [...JOBS].sort(byNewest),
  getJobsByDomain: async (): Promise<JobPosting[]> => [...JOBS].sort(byNewest),
  getLinkedInPosts: async (): Promise<LinkedInPost[]> => [...POSTS].sort(byNewest),

  // Writes are no-ops: postings are managed in code now, not a database.
  saveJob: async (_job: Partial<JobPosting>): Promise<void> => {},
  deleteJob: async (_id: string | number): Promise<void> => {},
  saveLinkedInPost: async (_post: Partial<LinkedInPost>): Promise<void> => {},
  deleteLinkedInPost: async (_id: string): Promise<void> => {},

  // Auth stubs: the admin portal is no longer the source of truth for data.
  login: async (): Promise<boolean> => false,
  logout: async (): Promise<void> => {},
  isLoggedIn: (): boolean => false,
  isAdmin: async (_user: unknown): Promise<boolean> => false,
  onAuthChange: (callback: (user: unknown) => void) => {
    callback(null);
    return () => {};
  },
};
