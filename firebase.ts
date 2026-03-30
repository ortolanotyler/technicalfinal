import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore, getDocFromServer, doc } from 'firebase/firestore';
import firebaseConfig from './firebase-applet-config.json';

// Initialize Firebase
const config = firebaseConfig as any;
const app = initializeApp(config);
export const auth = getAuth(app);

// Handle "(default)" database ID by passing nothing
export const db = (config.firestoreDatabaseId && config.firestoreDatabaseId !== "(default)")
  ? getFirestore(app, config.firestoreDatabaseId)
  : getFirestore(app);

// Test connection to Firestore
async function testConnection() {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
    console.log('[Firebase] Connection test successful');
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.error('[Firebase] Connection failed: The client is offline. Check your configuration.');
    }
    // Skip logging for other errors, as this is simply a connection test.
  }
}
testConnection();

export default app;
