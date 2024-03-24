"use client";
import {
  signInWithPopup,
  signOut,
  onAuthStateChanged,
  User,
} from "firebase/auth";
import styles from "./page.module.css";
import { auth, googleProvider } from "../../firebase";


interface HomeProps {
  user: User | null;
  setUser: (user: User | null) => void;
}

export default function Home({ user, setUser }: HomeProps) {
  const signOutWithGoogle = async () => {
    try {
      await signOut(auth);
      setUser(null);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <main className={styles.main}>
      <div className={styles.loginBox}>
        <p>Floor plan editor page</p>
        <>
          <div>Welcome back, {user?.displayName?.split(" ")[0]}</div>
          <button className={styles.button} onClick={() => signOutWithGoogle()}>
            Logout
          </button>
        </>
      </div>
    </main>
  );
}
