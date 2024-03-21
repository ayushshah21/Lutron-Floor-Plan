//"use client";
// src/app/page.tsx
import { signOut, useSession } from "next-auth/react";
import styles from './MainPage.module.css';

export default function Home() {
  const { data: session, status } = useSession();
  
  // Wait until we know if we have a session or not before rendering
  if (status === "loading") {
    return <p>Loading...</p>;
  }

  return (
    <main className={styles.container}>
      <header className={styles.header}>
        <img src="/logo.png" alt="Company Logo" className={styles.logo} />
        <input
          type="search"
          placeholder="Search floor plans"
          className={styles.searchInput}
        />
      </header>
      
      <aside className={styles.sidebar}>
        <button className={styles.newButton}>New</button>
        <nav className={styles.nav}>
          <a className={styles.navItem} href="/shared">Shared with me</a>
          <a className={styles.navItem} href="/recent">Recent</a>
          <a className={styles.navItem} href="/starred">Starred</a>
        </nav>
      </aside>
      
      <section className={styles.content}>
        {session && (
          <div className={styles.welcomeBox}>
            Welcome back, {session.user?.name}
            <button className={styles.button} onClick={() => signOut()}>Logout</button>
          </div>
        )}
      </section>
    </main>
  );
}
