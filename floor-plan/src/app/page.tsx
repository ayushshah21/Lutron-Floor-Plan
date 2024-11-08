"use client";
import { auth } from "../../firebase";
import { useRouter } from "next/navigation";
import { useEffect } from 'react';

export default function Page() {
  const router = useRouter();

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

  return null; 
}
