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
    <div className={styles.container}>
      <aside className={styles.sidebar}>
        {/* Assuming you are using an SVG for the logo */}
        <img
          className={styles.lutronLogo}
          src="https://umslogin.lutron.com/Content/Dynamic/Default/Images/logo-lutron-blue.svg"
          alt="Lutron Logo"
        />
        <nav className={styles.navigation}>
          {/* Your navigation links/buttons */}
          <button className={styles.navButton}>Shared with me</button>
          <button className={styles.navButton}>Recent</button>
          <button className={styles.navButton}>Starred</button>
        </nav>
        <button className={styles.logoutButton} onClick={signOutWithGoogle}>
          Logout
        </button>
      </aside>
      <main className={styles.mainContent}>
        <div className={styles.searchBar}>
          <input type="text" placeholder="Search floor plans" className={styles.searchInput} />
        </div>
        <div className={styles.newButton}>
          <button className={styles.button}>+ New</button>
        </div>
        <div className={styles.prompt}>
          Use the “New” button to upload a file
        </div>
        {/* Add other components and content as needed */}
      </main>
    </div>
  );
}