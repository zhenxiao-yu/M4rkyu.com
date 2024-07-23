import { initializeApp } from 'firebase/app';
import { getStorage } from 'firebase/storage';
import { getFirestore, serverTimestamp } from 'firebase/firestore';

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBCrsDXNRnGzGvQU1QnF4Y8TYnmE17bYcQ",
  authDomain: "m4rkyu-3f0ec.firebaseapp.com",
  projectId: "m4rkyu-3f0ec",
  storageBucket: "m4rkyu-3f0ec.appspot.com",
  messagingSenderId: "851628630417",
  appId: "1:851628630417:web:bd9f1b2c876dc38bbcfa30",
  measurementId: "G-WNTKR7YZVM"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize services
const projectStorage = getStorage(app);
const projectFirestore = getFirestore(app);
const timestamp = serverTimestamp();

export { projectStorage, projectFirestore, timestamp };
