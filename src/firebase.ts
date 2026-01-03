import { initializeApp } from 'firebase/app';
import { getAnalytics } from "firebase/analytics";
import { getAuth, GoogleAuthProvider, setPersistence, browserLocalPersistence } from 'firebase/auth';
import { getDatabase } from 'firebase/database';

const firebaseConfig = {
  apiKey: "AIzaSyDySPHRq53wDUSI8PKX4Jd-lRlvdRyTsoI",
  authDomain: "hack-ai-thon-reg.firebaseapp.com",
  databaseURL: "https://hack-ai-thon-reg-default-rtdb.firebaseio.com",
  projectId: "hack-ai-thon-reg",
  storageBucket: "hack-ai-thon-reg.firebasestorage.app",
  messagingSenderId: "115875849364",
  appId: "1:115875849364:web:64e726b1f5b290da22c081",
  measurementId: "G-1XBYKSP56K"
};

import { getStorage } from 'firebase/storage';

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getDatabase(app);
export const storage = getStorage(app);
export const googleProvider = new GoogleAuthProvider();
export const analytics = getAnalytics(app);

// Configure persistence and add required scopes
setPersistence(auth, browserLocalPersistence).catch((error) => {
  console.error("Error setting persistence:", error);
});

googleProvider.addScope('https://www.googleapis.com/auth/userinfo.email');
googleProvider.addScope('https://www.googleapis.com/auth/userinfo.profile');
googleProvider.setCustomParameters({
  prompt: 'select_account'
});
