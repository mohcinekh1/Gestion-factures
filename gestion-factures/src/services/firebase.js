import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getDatabase } from 'firebase/database';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  databaseURL: import.meta.env.VITE_FIREBASE_DATABASE_URL,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID
};

// #region agent log
fetch('http://127.0.0.1:7917/ingest/6da683cf-3b2e-4b89-bb75-50469f877af6',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'0be1d4'},body:JSON.stringify({sessionId:'0be1d4',location:'firebase.js:15',message:'Firebase config loaded',data:{apiKey: import.meta.env.VITE_FIREBASE_API_KEY ? 'PRESENT' : 'MISSING', authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || 'MISSING', databaseURL: import.meta.env.VITE_FIREBASE_DATABASE_URL || 'MISSING', projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || 'MISSING'},hypothesisId:'H-E',timestamp:Date.now()})}).catch(()=>{});
// #endregion

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const database = getDatabase(app);