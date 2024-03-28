"use client";
import { useState, useEffect, useRef } from "react";
import { signOut, useSession } from "next-auth/react";
import "./editor.css";

// Needed for react-pdf to work
import { Document, Page, pdfjs } from "react-pdf";
pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.js`;

export default function Home() {
  const session = useSession();
  const [pdfFile, setPdfFile] = useState<File | null>(null);


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
    <main className="main">

      <nav className="navbar">
        <img
          className="lutronLogo"
          src="https://umslogin.lutron.com/Content/Dynamic/Default/Images/logo-lutron-blue.svg"
          alt="Lutron-logo"
        />
        <h1 className="navbarBrand">Test Floor Plan #1 </h1>
        <ul className="navbarNav">
          <li className="navbarItem">
            <button className="button" onClick={() => signOut()}>Logout</button>
          </li>
          <li>
            {/* File Import Button */}
            <form>
              <input type="file" onChange={handleFileChange} accept="application/pdf" />
            </form>
            {/* File Export Button to be added: */}
          </li>
        </ul>
      </nav>
      <div className="canvasBox">
        {/* Displays pdf*/}
        {/* Add feature to zoom in and zoom out of pdf */}
        {pdfFile && (
          <Document file={URL.createObjectURL(pdfFile)}>
            <Page pageNumber={1} renderAnnotationLayer={false} renderTextLayer={false} />
          </Document>
        )}

      </div>
    </main>
  );
}

