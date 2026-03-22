import { JobPosting, Domain, LinkedInPost } from '../types';
import { 
  collection, 
  getDocs, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc, 
  query, 
  where, 
  orderBy,
  setDoc,
  getDoc
} from 'firebase/firestore';
import { 
  signInWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged,
  User
} from 'firebase/auth';
import { db, auth } from '../firebase';

enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId: string | undefined;
    email: string | null | undefined;
    emailVerified: boolean | undefined;
    isAnonymous: boolean | undefined;
    tenantId: string | null | undefined;
    providerInfo: {
      providerId: string;
      displayName: string | null;
      email: string | null;
      photoUrl: string | null;
    }[];
  }
}

function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo: auth.currentUser?.providerData.map(provider => ({
        providerId: provider.providerId,
        displayName: provider.displayName,
        email: provider.email,
        photoUrl: provider.photoURL
      })) || []
    },
    operationType,
    path
  }
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

// Seed Data for initial migration
const INITIAL_JOBS: JobPosting[] = [
    { 
        id: 1, 
        domain: 'skilled-trades',
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
        domain: 'skilled-trades',
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
    author: 'Tyler Ortolano',
    role: 'Managing Partner',
    content: 'Excited to announce that Certus Group has successfully placed a Lead Heavy Duty Mechanic for one of our key mining partners in Alberta. The skilled trades market remains highly competitive, and we are proud to connect top-tier talent with industry leaders. #SkilledTrades #Recruitment #CertusGroup',
    date: '2d ago',
    avatar: 'https://res.cloudinary.com/dvbubqhpp/image/upload/v1710947667/tyler-avatar_eiabfr.jpg'
  },
  {
    author: 'Certus Group',
    role: 'Executive Search',
    content: 'We are currently seeing a surge in demand for Industrial Electricians across Ontario. If you are a licensed professional looking for your next challenge, check out our latest openings. #IndustrialElectrician #HamiltonJobs #Manufacturing',
    date: '5d ago',
    avatar: 'https://res.cloudinary.com/dvbubqhpp/image/upload/v1710947667/certus-logo-avatar_eiabfr.jpg'
  }
];

export const jobService = {
  seedDatabase: async (): Promise<void> => {
    try {
      const jobsSnap = await getDocs(collection(db, 'jobs'));
      if (jobsSnap.empty) {
        console.log('Seeding jobs...');
        for (const job of INITIAL_JOBS) {
          const { id, ...jobData } = job;
          try {
            await addDoc(collection(db, 'jobs'), { ...jobData, createdAt: new Date().toISOString() });
          } catch (e) {
            console.warn('Failed to seed a job document. Likely permission denied.', e);
          }
        }
      }

      const postsSnap = await getDocs(collection(db, 'linkedin_posts'));
      if (postsSnap.empty) {
        console.log('Seeding LinkedIn posts...');
        for (const post of INITIAL_LINKEDIN) {
          try {
            await addDoc(collection(db, 'linkedin_posts'), { ...post, createdAt: new Date().toISOString() });
          } catch (e) {
            console.warn('Failed to seed a LinkedIn post document. Likely permission denied.', e);
          }
        }
      }
    } catch (error) {
      console.warn('Seed database check failed. Likely permission denied or offline.', error);
    }
  },

  getJobs: async (): Promise<JobPosting[]> => {
    try {
      const q = query(collection(db, 'jobs'), orderBy('createdAt', 'desc'));
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({
        id: doc.id as any,
        ...doc.data()
      } as JobPosting));
    } catch (error) {
      handleFirestoreError(error, OperationType.LIST, 'jobs');
      return [];
    }
  },

  getJobsByDomain: async (domain: Domain): Promise<JobPosting[]> => {
    try {
      const jobsRef = collection(db, 'jobs');
      const q = domain 
        ? query(jobsRef, where('domain', '==', domain), orderBy('createdAt', 'desc'))
        : query(jobsRef, orderBy('createdAt', 'desc'));
      
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({
        id: doc.id as any,
        ...doc.data()
      } as JobPosting));
    } catch (error) {
      handleFirestoreError(error, OperationType.LIST, 'jobs');
      return [];
    }
  },

  saveJob: async (job: JobPosting): Promise<void> => {
    try {
      if (job.id && typeof job.id === 'string') {
        const jobRef = doc(db, 'jobs', job.id);
        const { id, ...data } = job;
        await updateDoc(jobRef, { ...data, updatedAt: new Date().toISOString() });
      } else {
        const { id, ...data } = job;
        await addDoc(collection(db, 'jobs'), { 
          ...data, 
          createdAt: new Date().toISOString() 
        });
      }
    } catch (error) {
      handleFirestoreError(error, job.id ? OperationType.UPDATE : OperationType.CREATE, 'jobs');
    }
  },

  deleteJob: async (id: string | number): Promise<void> => {
    try {
      await deleteDoc(doc(db, 'jobs', id.toString()));
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `jobs/${id}`);
    }
  },

  login: async (email: string, password: string): Promise<boolean> => {
    try {
      // If the user entered a simple username like 'tyler', append a domain to make it an email
      const loginEmail = email.includes('@') ? email : `${email}@certusgroup.com`;
      await signInWithEmailAndPassword(auth, loginEmail, password);
      return true;
    } catch (error) {
      console.error('Login error:', error);
      return false;
    }
  },

  logout: async (): Promise<void> => {
    await signOut(auth);
  },

  isLoggedIn: (): boolean => {
    return !!auth.currentUser;
  },

  onAuthChange: (callback: (user: User | null) => void) => {
    return onAuthStateChanged(auth, callback);
  },

  getLinkedInPosts: async (): Promise<LinkedInPost[]> => {
    try {
      const q = query(collection(db, 'linkedin_posts'), orderBy('createdAt', 'desc'));
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as LinkedInPost));
    } catch (error) {
      handleFirestoreError(error, OperationType.LIST, 'linkedin_posts');
      return [];
    }
  },

  saveLinkedInPost: async (post: Partial<LinkedInPost>): Promise<void> => {
    try {
      if (post.id) {
        const postRef = doc(db, 'linkedin_posts', post.id);
        const { id, ...data } = post;
        await updateDoc(postRef, { ...data, updatedAt: new Date().toISOString() });
      } else {
        await addDoc(collection(db, 'linkedin_posts'), { 
          ...post, 
          createdAt: new Date().toISOString() 
        });
      }
    } catch (error) {
      handleFirestoreError(error, post.id ? OperationType.UPDATE : OperationType.CREATE, 'linkedin_posts');
    }
  },

  deleteLinkedInPost: async (id: string): Promise<void> => {
    try {
      await deleteDoc(doc(db, 'linkedin_posts', id));
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `linkedin_posts/${id}`);
    }
  }
};
