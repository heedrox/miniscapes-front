// Firebase initialization and Firestore realtime utilities
import { initializeApp, getApps, getApp } from 'https://www.gstatic.com/firebasejs/12.1.0/firebase-app.js';
import { getFirestore, collection, onSnapshot, query, orderBy, limit, connectFirestoreEmulator } from 'https://www.gstatic.com/firebasejs/12.1.0/firebase-firestore.js';

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
  try {
    appInstance = initializeApp(firebaseConfig);
  } catch (fallbackError) {
    throw fallbackError;
  }
}

// Inicializar Firestore con la base de datos específica "miniscapes"
const db = getFirestore(appInstance, 'miniscapes');

// Verificar si estamos en desarrollo local y conectar al emulador si es necesario
if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
  try {
    // Intentar conectar al emulador local si está disponible
    connectFirestoreEmulator(db, 'localhost', 8080);
  } catch (error) {
    // Emulador local no disponible, usar Firestore en la nube
  }
}

// Subscribe to realtime message count for a given game code
export function subscribeToMessageCount(gameCode, onCountChange) {
  if (!gameCode || typeof onCountChange !== 'function') {
    return () => {};
  }

  try {
    // Construir la ruta de la colección
    const messagesRef = collection(db, 'twin-islands', gameCode, 'messages');
    
    // Crear query simple para evitar problemas con ordenamiento
    const messagesQuery = query(messagesRef);
    
    const unsubscribe = onSnapshot(
      messagesQuery,
      (snapshot) => {
        try {
          onCountChange(snapshot.size);
        } catch (callbackError) {
          // Error silencioso en callback
        }
      },
      (error) => {
        // Error silencioso en suscripción
      }
    );
    
    return unsubscribe;
    
  } catch (error) {
    return () => {};
  }
}