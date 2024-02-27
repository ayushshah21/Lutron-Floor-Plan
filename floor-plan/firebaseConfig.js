import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyB7uhZyRnLXVlCpD-X_HKG84I_ILRyrFMU",
  authDomain: "lutron-floor-plan.firebaseapp.com",
  projectId: "lutron-floor-plan",
  storageBucket: "lutron-floor-plan.appspot.com",
  messagingSenderId: "808163386870",
  appId: "1:808163386870:web:e15dc6c2d7350d472e53d7",
  measurementId: "G-VYC6QSGR25"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);