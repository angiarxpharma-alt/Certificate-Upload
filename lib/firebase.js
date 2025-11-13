import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import { getAnalytics, isSupported } from 'firebase/analytics';

const firebaseConfig = {
  apiKey: "AIzaSyD6p9lSmvpy4fRSE_FWvwo-gnUPNHeCsTs",
  authDomain: "angiarx-certificate-upload.firebaseapp.com",
  projectId: "angiarx-certificate-upload",
  storageBucket: "angiarx-certificate-upload.firebasestorage.app",
  messagingSenderId: "709625572575",
  appId: "1:709625572575:web:7908b1556889098b43cd6a",
  measurementId: "G-BQG1H7PYDK"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

// Initialize Analytics (only in browser and if supported)
export const getAnalyticsInstance = async () => {
  if (typeof window !== 'undefined') {
    try {
      const supported = await isSupported();
      if (supported) {
        return getAnalytics(app);
      }
    } catch (error) {
      console.warn('Analytics not supported:', error);
    }
  }
  return null;
};

export default app;

