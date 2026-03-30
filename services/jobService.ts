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
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

export const jobService = {
  getJobs: async (): Promise<JobPosting[]> => {
    const path = 'jobs';
    try {
      const q = query(collection(db, path), orderBy('createdAt', 'desc'));
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as JobPosting[];
    } catch (error) {
      console.error('Error fetching jobs:', error);
      handleFirestoreError(error, OperationType.LIST, path);
      return [];
    }
  },

  getJobsByDomain: async (): Promise<JobPosting[]> => {
    return jobService.getJobs();
  },

  saveJob: async (job: Partial<JobPosting>): Promise<void> => {
    const path = 'jobs';
    try {
      const { id, ...data } = job;
      if (id && typeof id === 'string') {
        const jobRef = doc(db, path, id);
        await updateDoc(jobRef, {
          ...data,
          updatedAt: Timestamp.now().toDate().toISOString()
        });
      } else {
        await addDoc(collection(db, path), {
          ...data,
          createdAt: Timestamp.now().toDate().toISOString(),
          updatedAt: Timestamp.now().toDate().toISOString()
        });
      }
    } catch (error) {
      console.error('Error saving job:', error);
      handleFirestoreError(error, job.id ? OperationType.UPDATE : OperationType.CREATE, path);
    }
  },

  deleteJob: async (id: string | number): Promise<void> => {
    const path = 'jobs';
    try {
      await deleteDoc(doc(db, path, String(id)));
    } catch (error) {
      console.error('Error deleting job:', error);
      handleFirestoreError(error, OperationType.DELETE, path);
    }
  },

  login: async (): Promise<boolean> => {
    try {
      console.log('[Auth] Starting Google Sign-In...');
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      console.log('[Auth] Sign-In successful, user:', result.user.email);
      return !!result.user;
    } catch (error: any) {
      console.error('[Auth] Login error:', error);
      // Throw the error so the UI can handle it specifically
      throw error;
    }
  },

  logout: async (): Promise<void> => {
    await signOut(auth);
  },

  isLoggedIn: (): boolean => {
    return !!auth.currentUser;
  },

  isAdmin: async (user: User | null): Promise<boolean> => {
    if (!user) {
      console.log('[AdminCheck] No user provided');
      return false;
    }
    
    console.log('[AdminCheck] Checking user:', user.email, 'UID:', user.uid, 'Verified:', user.emailVerified);

    if (user.email === 'tyler.ortolano95@gmail.com') {
      console.log('[AdminCheck] Hardcoded admin match');
      return true;
    }

    try {
      const userDoc = await getDoc(doc(db, 'users', user.uid));
      if (userDoc.exists()) {
        const role = userDoc.data()?.role;
        console.log('[AdminCheck] User doc found, role:', role);
        return role === 'admin';
      } else {
        console.log('[AdminCheck] No user doc found in Firestore');
      }
    } catch (error) {
      console.error('[AdminCheck] Error checking admin status in Firestore:', error);
    }
    
    return false;
  },

  onAuthChange: (callback: (user: User | null) => void) => {
    return onAuthStateChanged(auth, (user) => {
      callback(user);
    });
  },

  getLinkedInPosts: async (): Promise<LinkedInPost[]> => {
    const path = 'linkedinPosts';
    try {
      const q = query(collection(db, path), orderBy('createdAt', 'desc'));
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as LinkedInPost[];
    } catch (error) {
      console.error('Error fetching posts:', error);
      handleFirestoreError(error, OperationType.LIST, path);
      return [];
    }
  },

  saveLinkedInPost: async (post: Partial<LinkedInPost>): Promise<void> => {
    const path = 'linkedinPosts';
    try {
      const { id, ...data } = post;
      if (id && typeof id === 'string') {
        const postRef = doc(db, path, id);
        await updateDoc(postRef, {
          ...data,
          updatedAt: Timestamp.now().toDate().toISOString()
        });
      } else {
        await addDoc(collection(db, path), {
          ...data,
          createdAt: Timestamp.now().toDate().toISOString(),
          updatedAt: Timestamp.now().toDate().toISOString()
        });
      }
    } catch (error) {
      console.error('Error saving post:', error);
      handleFirestoreError(error, post.id ? OperationType.UPDATE : OperationType.CREATE, path);
    }
  },

  deleteLinkedInPost: async (id: string): Promise<void> => {
    const path = 'linkedinPosts';
    try {
      await deleteDoc(doc(db, path, id));
    } catch (error) {
      console.error('Error deleting post:', error);
      handleFirestoreError(error, OperationType.DELETE, path);
    }
  }
};
