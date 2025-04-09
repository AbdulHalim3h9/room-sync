import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

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
const db = getFirestore(app);
const storage = getStorage(app);

export { db, storage };
