import { initializeApp, getApps, type FirebaseApp } from 'firebase/app';
import { getFirestore, collection, getDocs, doc, getDoc } from 'firebase/firestore';
import cfg from '../firebase-applet-config.json';

// Server-side reads use the Firebase web SDK with the public config — the same
// path the browser uses (jobs are `allow read: if true`). No admin credentials,
// which avoids the Application-Default-Credentials cold-start hang on Vercel.
function getDb() {
  const app: FirebaseApp = getApps()[0] || initializeApp(cfg as Record<string, string>);
  const dbId = (cfg as Record<string, string>).firestoreDatabaseId;
  return dbId && dbId !== '(default)' ? getFirestore(app, dbId) : getFirestore(app);
}

export interface JobDoc {
  id: string;
  ref?: string;
  title?: string;
  location?: string;
  type?: string;
  salary?: string;
  summary?: string;
  description?: string;
  responsibilities?: string[];
  requirements?: string[];
  posted?: string;
  createdAt?: string;
  updatedAt?: string;
}

export async function getAllJobs(): Promise<JobDoc[]> {
  const snap = await getDocs(collection(getDb(), 'jobs'));
  return snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<JobDoc, 'id'>) }));
}

export async function getJob(id: string): Promise<JobDoc | null> {
  const d = await getDoc(doc(getDb(), 'jobs', id));
  return d.exists() ? ({ id: d.id, ...(d.data() as Omit<JobDoc, 'id'>) }) : null;
}
