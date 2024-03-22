"use client";
// src/app/page.tsx
import { useEffect } from 'react';
import { useRouter } from 'next/router';
import { useSession, signOut } from 'next-auth/react';
import styles from '../src/styles/MainPage.module.css';


export default function Home() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    // If the session status is "unauthenticated", redirect to the login page
    if (status === 'unauthenticated') {
      router.push('/login');
    }
  }, [status, router]);

  if (status === "loading") {
    return <p>Loading...</p>;
  }

  if (!session) {
    // The message will only show briefly before the redirection kicks in
    return <div>You must be logged in to view this page.</div>;
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
            <button className={styles.button} onClick={() => signOut({ redirect: true, callbackUrl: '/login' })}>Logout</button>
          </div>
        )}
      </section>
    </main>
  );
}
