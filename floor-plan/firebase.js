// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from 'firebase/firestore'; // Import Firestore


// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyBNvczVbxDo3rZKw79q63fYK1C6IAAdBoA",
  authDomain: "lutron-floor-plan-69652.firebaseapp.com",
  projectId: "lutron-floor-plan-69652",
  storageBucket: "lutron-floor-plan-69652.appspot.com",
  messagingSenderId: "580661249618",
  appId: "1:580661249618:web:6a650130b14a6eb1a2018b",
  measurementId: "G-6HNHYYY2LG",
};


// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const googleProvider = new GoogleAuthProvider();
const db = getFirestore(app);

// Exporting the necessary Firebase services
export { app, auth, googleProvider, db };
