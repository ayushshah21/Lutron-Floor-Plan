"use client";
import { useState } from "react";
import { signOut } from "firebase/auth";
import { auth } from "../../../firebase";
import styles from "./page.module.css";
import { useUploadPdf } from "../hooks/useUploadPdf";
import { useRouter } from "next/navigation";
import useAuthRedirect from "../hooks/useAuthRedirect";
import Link from 'next/link'
import { useUserFiles } from '../hooks/useUserFiles';
import { FloorPlanDocument } from '../FloorPlanDocument';
import { useDeleteDocument } from '../hooks/useDeleteDocument';


export default function Home() {
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const { uploadPdf, uploading, error } = useUploadPdf();
  const { floorPlans, loading } = useUserFiles();
  const { deleteDocument, isDeleting, error: deleteError } = useDeleteDocument();


  const { isLoading } = useAuthRedirect();
  const router = useRouter();

  const signOutWithGoogle = async () => {
    try {
      await signOut(auth);
    } catch (err) {
      console.error(err);
    }
  };

  const handleFileChange = async (event: any) => {
    const file = event.target.files[0];
    const url = URL.createObjectURL(file);
    if (file && file.type === "application/pdf") {
      setPdfFile(file);
      const pdfURL = await uploadPdf(file);
      if (pdfURL) {
        router.push(`/editor?pdf=${(url)}`); // Redirect to the editor page with the PDF URL
      } else {
        alert("Failed to upload PDF.");
      }
    } else {
      alert("Please select a valid PDF file.");
    }
  };

  const handleUpload = async () => {
    await uploadPdf(pdfFile);
    if (error) {
      alert(error);
    } else {
      alert("PDF uploaded successfully!");
    }
  };

  const handleFileOpen = (pdfURL: string) => {
    //window.open(pdfURL, '_blank');
    //router.push(`/editor?pdf=${encodeURIComponent(pdfURL)}`);

    window.open(`/editor?pdf=${encodeURIComponent(pdfURL)}`, '_blank');

  };


  return isLoading ? (
    <div>Loading...</div>
  ) : (
    <div className={styles.container}>
      <aside className={styles.sidebar}>
        <img
          className={styles.lutronLogo}
          src="../images/logo-lutron-blue.svg" // Moved to the public directory
          alt="Lutron Logo"
        />
        <nav className={styles.navigation} id="navSidebar">
          <button className={styles.navButton}>Shared with me</button>
          <button className={styles.navButton}>Recent</button>
          <button className={styles.navButton}>Starred</button>
        </nav>
        <button className={styles.logoutButton} onClick={signOutWithGoogle}>
          Logout
        </button>
      </aside>
      <main className={styles.mainContent}>
        <div className={styles.searchBar}>
          <input
            type="text"
            placeholder="Search floor plans"
            className={styles.searchInput}
          />
        </div>
        <form>
          <input
            type="file"
            onChange={handleFileChange}
            accept="application/pdf"
            id="fileInput"
            style={{ display: "none" }} // Hide the default file input
          />
          <button
            className={styles.button}
            id="importButton"
            onClick={(e) => {
              e.preventDefault(); // Prevent form submission
              document.getElementById("fileInput")?.click(); // Programmatically click the file input
            }}
            disabled={uploading}
          >
            {uploading ? "Uploading..." : "+ New"}
          </button>
        </form>
        <div className={styles.fileList}>
          {floorPlans.map((file) => ( // Ensure you're using 'floorPlans' from the state
            <div key={file.id} className={styles.fileItem}>
              <p onClick={() => handleFileOpen(file.pdfURL)}>file.name</p>
              <img src="/icons/pdf-icon.png" alt="PDF" className={styles.fileIcon} />
              <span className={styles.fileName}>{file.name || 'Unnamed File'}</span>
              <button onClick={() => deleteDocument(file.id!)}>Delete</button>
            </div>
          ))}
        </div>


        <div className={styles.prompt}>
          Use the “New” button to upload a file
        </div>
      </main>
    </div>
  );
}
