import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";


const firebaseConfig = {
  apiKey: "AIzaSyCBrCFNV-R0_uAsngVG5rQCdAbIowIifSc",
  authDomain: "alwadichat.firebaseapp.com",
  projectId: "alwadichat",
  storageBucket: "alwadichat.firebasestorage.app",
  messagingSenderId: "478385045140",
  appId: "1:478385045140:web:9fd78141115af3e41b3e81",
};


const app = initializeApp(firebaseConfig);


export default app;


export const db = getFirestore(app);


// تخزين الصور والملفات
export const storage = getStorage(app);