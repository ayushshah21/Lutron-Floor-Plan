"use client";
import Link from "next/link";
import { Inter } from "next/font/google";
import styles from "./page.module.css"; // Ensure you have some basic styles
import { User } from "firebase/auth";
import { auth } from "../../firebase";
import { useRouter } from "next/navigation";
import { useEffect } from 'react';

const inter = Inter({ subsets: ["latin"] });

export default function Page() {
  const router = useRouter();
  const currentUser = auth.currentUser;

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(user => {
      if (user) {
        router.push('/home');
      } else {
        router.push('/login');
      }
    });

    return () => unsubscribe();
  }, [router]);

  return null; //We should probably create a nice landing page sometime soon to put here
}
