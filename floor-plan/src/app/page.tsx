"use client";
import { signOut, useSession } from "next-auth/react";
import styles from "./page.module.css";

export default function Home() {
  const session = useSession();
  return (
    <main className={styles.main}>
      <div className={styles.loginBox}>
        <p>
          Floor plan editor page
        </p>
        <>
          <div>{"Welcome back, " + session?.data?.user?.name}</div>
          <button className={styles.button} onClick={() => signOut()}>Logout</button>
        </>
      </div>
    </main>
  );
}

