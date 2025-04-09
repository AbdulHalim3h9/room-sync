import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
  apiKey: "AIzaSyCVgBuLIIIll5rfkQLugdIb0L1PhItqeAA",
  authDomain: "project-room-sync.firebaseapp.com",
  projectId: "project-room-sync",
  storageBucket: "project-room-sync.appspot.com",
  messagingSenderId: "875551708478",
  appId: "1:875551708478:web:a1e096b64ddc4b3623486f",
  measurementId: "G-QK0HZW2CD9",
};

const app = initializeApp(firebaseConfig);
const db = getFirestore();
const storage = getStorage();
const auth = getAuth();

export { db, storage, auth };
