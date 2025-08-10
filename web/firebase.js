// Firebase initialization and Firestore realtime utilities
import { initializeApp, getApps, getApp } from 'https://www.gstatic.com/firebasejs/12.1.0/firebase-app.js';
import { getFirestore, collection, onSnapshot } from 'https://www.gstatic.com/firebasejs/12.1.0/firebase-firestore.js';

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBVjT-lp95QrRjIXj72ReAiktrPEJLuMIQ",
  authDomain: "mansion-espiritus-lkgoxs.firebaseapp.com",
  databaseURL: "https://mansion-espiritus-lkgoxs.firebaseio.com",
  projectId: "mansion-espiritus-lkgoxs",
  storageBucket: "mansion-espiritus-lkgoxs.firebasestorage.app",
  messagingSenderId: "997389903772",
  appId: "1:997389903772:web:88d82929f2593fe6744a59",
  measurementId: "G-KJ2VGH8RL2"
};

// Ensure single app instance
let appInstance;
try {
  appInstance = getApps().length ? getApp() : initializeApp(firebaseConfig);
} catch (e) {
  // Fallback in case getApps/getApp are unavailable
  appInstance = initializeApp(firebaseConfig);
}

const db = getFirestore(appInstance);

// Subscribe to realtime message count for a given game code
export function subscribeToMessageCount(gameCode, onCountChange) {
  if (!gameCode || typeof onCountChange !== 'function') {
    return () => {};
  }
  const messagesRef = collection(db, 'twin-islands', gameCode, 'messages');
  const unsubscribe = onSnapshot(
    messagesRef,
    (snapshot) => {
      try {
        onCountChange(snapshot.size);
      } catch (callbackError) {
        console.error('Error in onCountChange callback:', callbackError);
      }
    },
    (error) => {
      console.error('Firestore onSnapshot error:', error);
    }
  );
  return unsubscribe;
}