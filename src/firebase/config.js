import { initializeApp } from 'firebase/app';
import { getStorage } from 'firebase/storage';
import { isSupported, getAnalytics } from "firebase/analytics";
import { getFirestore, serverTimestamp } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID
};

const app = initializeApp(firebaseConfig);

isSupported().then((supported) => {
  if (supported && firebaseConfig.projectId) getAnalytics(app);
});

const projectStorage = getStorage(app);
const projectFirestore = getFirestore(app);
const timestamp = serverTimestamp;

export { projectStorage, projectFirestore, timestamp };
