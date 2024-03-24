"use client";

import { useState, useEffect } from 'react';
import { signInWithPopup, signOut, onAuthStateChanged, User } from "firebase/auth";
import { auth, googleProvider } from "../../firebase";
import styles from "./page.module.css";

interface HomeProps {
  user: User | null;
  setUser: (user: User | null) => void;
}

export default function Login({ user, setUser }: HomeProps) {


  const signInWithGoogle = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <main className={styles.main}>
      <div className={styles.loginBox}>
            {/* Show login button if no user is signed in */}
            <img
              className={styles.lutronLogo}
              src="https://umslogin.lutron.com/Content/Dynamic/Default/Images/logo-lutron-blue.svg"
              alt="Lutron-logo"
            />
            <h3>Sign into Lutron Floor Plan</h3>
            <button className={styles.button} onClick={signInWithGoogle}>
              Google Login
            </button>
      </div>
    </main>
  );
}
