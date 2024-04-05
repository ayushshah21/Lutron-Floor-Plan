"use client";

import { signInWithPopup } from "firebase/auth";
import { useRouter } from "next/navigation";
import { auth, googleProvider } from "../../../firebase"; // Adjust the path as needed
import styles from "./login.module.css"; // Ensure this is the correct path to your CSS module
import Image from "next/image"; // Importing Next.js Image component

export default function Login() {
    const router = useRouter();
    
  const signInWithGoogle = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
      router.push("/home");
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <main className={styles.main}>
      <div className={styles.loginBox} id="loginBox">
        <Image
          src="https://umslogin.lutron.com/Content/Dynamic/Default/Images/logo-lutron-blue.svg" // Consider hosting this yourself or ensuring you have permission to link directly
          alt="Lutron-logo"
          width={100} // Set appropriate width
          height={100} // Set appropriate height
          className={styles.lutronLogo}
        />
        <h3>Sign into Lutron Floor Plan</h3>
        <button className={styles.button} onClick={signInWithGoogle} id="loginButton">
          Google Login
        </button>
      </div>
    </main>
  );
}
