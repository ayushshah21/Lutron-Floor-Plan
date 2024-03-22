"use client";
import { useState, useEffect, useRef } from "react";
import { signOut, useSession } from "next-auth/react";
import styles from "./editor.module.css";
import pdfJS from "pdfjs-dist"; // Library for converting pdf into a canvas


export default function Home() {
  const session = useSession();
  // const [pdfFile, setPdfFile] = useState<File | null>(null);
  // const canvasRef = useRef<HTMLCanvasElement>(null);


  // // Checks file type and if it is a pdf
  // const handleFileChange = (event: any) => {
  //   const file = event.target.files[0];
  //   if (file && file.type === "application/pdf") {
  //     setPdfFile(file);
  //   } else {
  //     alert("Please select a valid PDF file.");
  //   }
  // };

  // useEffect(() => {
  //   if (pdfFile) {
  //     (async function () {
  //       pdfJS.GlobalWorkerOptions.workerSrc = window.location.origin + '/pdf.worker.min.js';
  //       const pdf = await pdfJS.getDocument(pdfFile).promise;

  //       const page = await pdf.getPage(1);
  //       const viewport = page.getViewport({ scale: 1.5 });

  //       // Prepare canvas using PDF page dimensions.
  //       const canvas = canvasRef.current;
  //       const canvasContext = canvas.getContext('2d');
  //       canvas.height = viewport.height;
  //       canvas.width = viewport.width;

  //       // Render PDF page into canvas context.
  //       const renderContext = { canvasContext, viewport };
  //       page.render(renderContext);
  //     })();
  //   }
  // }, []);


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


        {/* <form>
          <input type="file" onChange={handleFileChange} accept="application/pdf" />
        </form> */}

        {/* <canvas ref={canvasRef}></canvas> */}
      </div>
    </main>
  );
}

