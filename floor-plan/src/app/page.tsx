"use client";
import { useState, useEffect, useRef } from "react";
import { signOut, useSession } from "next-auth/react";
import styles from "./editor.module.css";

export default function Home() {
  const session = useSession();
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  // const canvasRef = useRef<HTMLCanvasElement>(null);


  // Checks file type and if it is a pdf
  const handleFileChange = (event: any) => {
    const file = event.target.files[0];
    if (file && file.type === "application/pdf") {
      setPdfFile(file);
    } else {
      alert("Please select a valid PDF file.");
    }
  };

  return (
    <main className={styles.main}>

      <nav className={styles.navbar}>
        <img
          className={styles.lutronLogo}
          src="https://umslogin.lutron.com/Content/Dynamic/Default/Images/logo-lutron-blue.svg"
          alt="Lutron-logo"
        />
        <h1 className={styles.navbarBrand}>Test Floor Plan #1 </h1>
        <ul className={styles.navbarNav}>
          <li className={styles.navbarItem}>
            <button className={styles.button} onClick={() => signOut()}>Logout</button>
          </li>
        </ul>
      </nav>
      <div className={styles.canvasBox}>
        <p>This is where the pdf should appear</p>

        <form>
          <input type="file" onChange={handleFileChange} accept="application/pdf" />
        </form>


        {/* Displays pdf */}
        {pdfFile && (
          <object data={URL.createObjectURL(pdfFile)} width="100%" height="100%"></object>
        )}

        {/* <canvas ref={canvasRef}></canvas> */}
      </div>
    </main>
  );
}

