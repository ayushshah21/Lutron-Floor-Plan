"use client";
import { useState, useEffect } from "react";
import { onAuthStateChanged, User } from "firebase/auth";
import { auth } from "../../firebase"; // Adjust the path as needed to import your Firebase auth object
import "./globals.css";
import { Inter } from "next/font/google";
import Login from "./Login";
import Home from "./page";
import Editor from "./editor";

const inter = Inter({ subsets: ["latin"] });

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const logout = onAuthStateChanged(auth, (currentUser: User | null) => {
      setUser(currentUser);
    });
    return () => logout();
  }, []);

  return (
    <html lang="en">
      <body className={inter.className}>
        {user ? (
          <Editor user={user} setUser={setUser} />
        ) : (
          <Home user={user} setUser={setUser} />
        )}
      </body>
    </html>
  );
}
