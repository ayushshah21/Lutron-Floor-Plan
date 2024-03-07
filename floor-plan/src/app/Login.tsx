"use client";

import { signIn } from "next-auth/react";
import styles from "./page.module.css";

export default function Login() {
  return (
    <main className={styles.main}>
      <div className={styles.loginBox}>
        <img
          className={styles.lutronLogo}
          src="https://umslogin.lutron.com/Content/Dynamic/Default/Images/logo-lutron-blue.svg"
          alt="Lutron-logo"
        />
        <h3>
          Sign into Lutron Floor Plan
        </h3>

        {/* Login with google */}
        <button className={styles.button} onClick={() => signIn("google")}>Google Login</button>
      </div>
    </main>
  );
}
