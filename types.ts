export enum Section {
  HERO = 'hero',
  INDUSTRIES = 'industries',
  SERVICES = 'services',
  INSIGHTS = 'insights',
  CONTACT = 'contact',
  JOB_BOARD = 'job-board',
  ADMIN = 'admin'
}

export type View = 'gateway' | 'landing' | 'jobs' | 'admin';

export interface JobPosting {
  id: string | number;
  ref: string;
  title: string;
  location: string;
  type: string;
  salary: string;
  posted?: string;
  summary: string;
  description?: string;
  responsibilities: string[];
  requirements: string[];
  createdAt?: string;
  updatedAt?: string;
}

export interface LinkedInPost {
  id: string;
  author: string;
  role: string;
  content: string;
  date: string;
  avatar: string;
  image?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface AdminCredentials {
  username: string;
  password: string;
}