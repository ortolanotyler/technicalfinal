import { JobPosting, Domain, LinkedInPost } from '../types';

const getAuthToken = () => localStorage.getItem('admin_token');

export const jobService = {
  seedDatabase: async (): Promise<void> => {
    // No-op for local backend as it's seeded in server.ts
  },

  getJobs: async (): Promise<JobPosting[]> => {
    try {
      const response = await fetch('/api/jobs');
      if (!response.ok) throw new Error('Failed to fetch jobs');
      return await response.json();
    } catch (error) {
      console.error('Error fetching jobs:', error);
      return [];
    }
  },

  getJobsByDomain: async (domain: Domain): Promise<JobPosting[]> => {
    try {
      const url = domain ? `/api/jobs?domain=${domain}` : '/api/jobs';
      const response = await fetch(url);
      if (!response.ok) throw new Error('Failed to fetch jobs');
      return await response.json();
    } catch (error) {
      console.error('Error fetching jobs by domain:', error);
      return [];
    }
  },

  saveJob: async (job: JobPosting): Promise<void> => {
    try {
      const isUpdate = !!job.id;
      const url = isUpdate ? `/api/jobs/${job.id}` : '/api/jobs';
      const method = isUpdate ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${getAuthToken()}`
        },
        body: JSON.stringify(job)
      });
      
      if (!response.ok) throw new Error('Failed to save job');
    } catch (error) {
      console.error('Error saving job:', error);
      throw error;
    }
  },

  deleteJob: async (id: string | number): Promise<void> => {
    try {
      const response = await fetch(`/api/jobs/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${getAuthToken()}`
        }
      });
      if (!response.ok) throw new Error('Failed to delete job');
    } catch (error) {
      console.error('Error deleting job:', error);
      throw error;
    }
  },

  login: async (username: string, password: string): Promise<boolean> => {
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });
      
      if (response.ok) {
        const { token } = await response.json();
        localStorage.setItem('admin_token', token);
        localStorage.setItem('admin_user', username);
        return true;
      }
      return false;
    } catch (error) {
      console.error('Login error:', error);
      return false;
    }
  },

  logout: async (): Promise<void> => {
    localStorage.removeItem('admin_token');
    localStorage.removeItem('admin_user');
  },

  isLoggedIn: (): boolean => {
    return !!localStorage.getItem('admin_token');
  },

  onAuthChange: (callback: (user: any | null) => void) => {
    // Simple mock for local auth
    const user = localStorage.getItem('admin_user');
    callback(user ? { displayName: user } : null);
    return () => {};
  },

  getLinkedInPosts: async (): Promise<LinkedInPost[]> => {
    try {
      const response = await fetch('/api/linkedin-posts');
      if (!response.ok) throw new Error('Failed to fetch posts');
      return await response.json();
    } catch (error) {
      console.error('Error fetching posts:', error);
      return [];
    }
  },

  saveLinkedInPost: async (post: Partial<LinkedInPost>): Promise<void> => {
    try {
      const response = await fetch('/api/linkedin-posts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${getAuthToken()}`
        },
        body: JSON.stringify(post)
      });
      if (!response.ok) throw new Error('Failed to save post');
    } catch (error) {
      console.error('Error saving post:', error);
      throw error;
    }
  },

  deleteLinkedInPost: async (id: string): Promise<void> => {
    try {
      const response = await fetch(`/api/linkedin-posts/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${getAuthToken()}`
        }
      });
      if (!response.ok) throw new Error('Failed to delete post');
    } catch (error) {
      console.error('Error deleting post:', error);
      throw error;
    }
  }
};
