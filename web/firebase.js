// Firebase initialization and Firestore realtime utilities
import { initializeApp, getApps, getApp } from 'https://www.gstatic.com/firebasejs/12.1.0/firebase-app.js';
import { getFirestore, collection, onSnapshot, query, orderBy, limit, connectFirestoreEmulator, doc } from 'https://www.gstatic.com/firebasejs/12.1.0/firebase-firestore.js';

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

// Subscribe to realtime message count and messages for a given game code
export function subscribeToMessageCount(gameCode, onCountChange, onMessagesChange) {
  if (!gameCode || typeof onCountChange !== 'function') {
    return () => {};
  }

  try {
    // Construir la ruta de la colección
    const messagesRef = collection(db, 'twin-islands', gameCode, 'messages');
    
    // Crear query ordenado por timestamp para obtener mensajes en orden cronológico
    const messagesQuery = query(messagesRef, orderBy('timestamp', 'asc'));
    
    const unsubscribe = onSnapshot(
      messagesQuery,
      (snapshot) => {
        try {
          // Llamar al callback del contador
          onCountChange(snapshot.size);
          
          // Si hay callback para mensajes, procesar y enviar los datos
          if (onMessagesChange && typeof onMessagesChange === 'function') {
            const messages = [];
            snapshot.forEach((doc) => {
              messages.push({
                id: doc.id,
                ...doc.data()
              });
            });
            onMessagesChange(messages);
          }
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

// Subscribe to game document for current room updates
export function subscribeToGameDocument(gameCode, onRoomChange) {
  if (!gameCode || typeof onRoomChange !== 'function') {
    return () => {};
  }

  try {
    // Construir la ruta del documento principal de la partida
    const gameDocRef = doc(db, 'twin-islands', gameCode);
    
    const unsubscribe = onSnapshot(
      gameDocRef,
      (docSnapshot) => {
        try {
          if (docSnapshot.exists()) {
            const data = docSnapshot.data();
            // Llamar al callback con el título de la habitación actual
            if (data.currentRoomTitle) {
              onRoomChange(data.currentRoomTitle);
            }
          }
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