import firebase from 'firebase/app';
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";

export default async () => {
    const firebaseConfig = {
        apiKey: "AIzaSyAeu1lrM7kbskxHrIr1-9E29EUctAu4QK4",
        authDomain: "virtual-care-b5304.firebaseapp.com",
        projectId: "virtual-care-b5304",
        storageBucket: "virtual-care-b5304.appspot.com",
        messagingSenderId: "620332107461",
        appId: "1:620332107461:web:1734a6dc1aba349cd2d2ac",
        measurementId: "G-ZYE8LJQWCC"
      };
      
      // Initialize Firebase
      const app = initializeApp(firebaseConfig);
      const analytics = getAnalytics(app);
}