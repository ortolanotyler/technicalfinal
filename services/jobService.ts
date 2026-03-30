import { JobPosting, LinkedInPost } from '../types';
import { 
  collection, 
  getDocs, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc, 
  query, 
  orderBy,
  Timestamp,
  getDoc
} from 'firebase/firestore';
import { 
  signInWithPopup, 
  GoogleAuthProvider, 
  signOut, 
  onAuthStateChanged,
  User
} from 'firebase/auth';
import { db, auth } from '../firebase';

const STORAGE_KEYS = {
  AUTH_TOKEN: 'certus_auth_token',
  AUTH_USER: 'certus_auth_user'
};

export const jobService = {
  getJobs: async (): Promise<JobPosting[]> => {
    try {
      const q = query(collection(db, 'jobs'), orderBy('createdAt', 'desc'));
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as JobPosting[];
    } catch (error) {
      console.error('Error fetching jobs:', error);
      throw error;
    }
  },

  getJobsByDomain: async (): Promise<JobPosting[]> => {
    return jobService.getJobs();
  },

  saveJob: async (job: Partial<JobPosting>): Promise<void> => {
    try {
      const { id, ...data } = job;
      if (id && typeof id === 'string') {
        const jobRef = doc(db, 'jobs', id);
        await updateDoc(jobRef, {
          ...data,
          updatedAt: Timestamp.now().toDate().toISOString()
        });
      } else {
        await addDoc(collection(db, 'jobs'), {
          ...data,
          createdAt: Timestamp.now().toDate().toISOString(),
          updatedAt: Timestamp.now().toDate().toISOString()
        });
      }
    } catch (error) {
      console.error('Error saving job:', error);
      throw error;
    }
  },

  deleteJob: async (id: string | number): Promise<void> => {
    try {
      await deleteDoc(doc(db, 'jobs', String(id)));
    } catch (error) {
      console.error('Error deleting job:', error);
      throw error;
    }
  },

  login: async (): Promise<boolean> => {
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      return !!result.user;
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

  isAdmin: async (user: User | null): Promise<boolean> => {
    if (!user) return false;
    
    // Check if user is the hardcoded admin in rules
    if (user.email === 'tyler.ortolano95@gmail.com' && user.emailVerified) {
      return true;
    }

    // Check users collection for admin role
    try {
      const userDoc = await getDoc(doc(db, 'users', user.uid));
      if (userDoc.exists()) {
        return userDoc.data()?.role === 'admin';
      }
    } catch (error) {
      console.error('Error checking admin status:', error);
    }
    
    return false;
  },

  onAuthChange: (callback: (user: User | null) => void) => {
    return onAuthStateChanged(auth, (user) => {
      callback(user);
    });
  },

  getLinkedInPosts: async (): Promise<LinkedInPost[]> => {
    try {
      const q = query(collection(db, 'linkedinPosts'), orderBy('createdAt', 'desc'));
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as LinkedInPost[];
    } catch (error) {
      console.error('Error fetching posts:', error);
      throw error;
    }
  },

  saveLinkedInPost: async (post: Partial<LinkedInPost>): Promise<void> => {
    try {
      const { id, ...data } = post;
      if (id && typeof id === 'string') {
        const postRef = doc(db, 'linkedinPosts', id);
        await updateDoc(postRef, {
          ...data,
          updatedAt: Timestamp.now().toDate().toISOString()
        });
      } else {
        await addDoc(collection(db, 'linkedinPosts'), {
          ...data,
          createdAt: Timestamp.now().toDate().toISOString(),
          updatedAt: Timestamp.now().toDate().toISOString()
        });
      }
    } catch (error) {
      console.error('Error saving post:', error);
      throw error;
    }
  },

  deleteLinkedInPost: async (id: string): Promise<void> => {
    try {
      await deleteDoc(doc(db, 'linkedinPosts', id));
    } catch (error) {
      console.error('Error deleting post:', error);
      throw error;
    }
  }
};
