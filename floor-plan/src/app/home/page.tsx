"use client";
import { useState } from "react";
import { signOut } from "firebase/auth";
import { auth } from "../../../firebase";
import styles from "./page.module.css";
import { useUploadPdf } from "../hooks/useUploadPdf";
import { useDeleteDocument } from "../hooks/useDeleteDocument";
import { useRouter } from "next/navigation";
import useAuthRedirect from "../hooks/useAuthRedirect";
import { useUserFiles } from '../hooks/useUserFiles';
import { FloorPlanDocument } from '../FloorPlanDocument';
import { Clock, Search, Star, Users } from "lucide-react";

export default function Home() {
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const { uploadPdf, uploading, error } = useUploadPdf();
  const { floorPlans, loading } = useUserFiles();
  const { deleteDocument, isDeleting, error: deleteError } = useDeleteDocument();
  const { isLoading } = useAuthRedirect();
  const [showThreeDotPopup, setShowThreeDotPopup] = useState(false);
  const [selectedFileId, setSelectedFileId] = useState(String);
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

  // Creates a pop up when user tries to delete a floor plan
  // Askes if they want to proceed
  const handleDelete = async (id: string) => {
    if (window.confirm("Are you sure you want to delete this file?")) {
      try {
        await deleteDocument(id);
        window.location.reload(); // Refreshes the page after successful deletion
      } catch (error) {
        console.error("Failed to delete the floor plan:", error);
        alert("Failed to delete the floor plan.");
      }
    }
  };

  // Display pop up menu when clicking on three dot icon
  const handleThreeDotPopup = (id: string) => {
    // Check if the currently selected file ID is the same as the clicked one and if the popup is shown
    if (selectedFileId === id && showThreeDotPopup) {
      setShowThreeDotPopup(false); // Hide the popup if it's already shown for the same file ID
    } else {
      setSelectedFileId(id); // Set the new file ID
      setShowThreeDotPopup(true); // Show the popup
    }
  };

  // Truncate a floor plan name
  const truncateFloorPlanName = (name: string | undefined) => {
    if (!name) return 'Unnamed File'; // Handle undefined or empty names
    return name.length > 10 ? `${name.substring(0, 7)}...` : name;
  };

  return isLoading ? (
    <div>Loading...</div>
  ) : (
    <div className={styles.container}>
      <aside className={styles.sidebar}>
        <img className={styles.lutronLogo} src="https://umslogin.lutron.com/Content/Dynamic/Default/Images/logo-lutron-blue.svg" alt="Lutron Logo" />
        <nav className={styles.navigation} id="navSidebar">
          <button className={`${styles.navButton} ${styles.iconButton}`}>
            < Users />Shared with me
          </button>
          <button className={`${styles.navButton} ${styles.iconButton}`}>
            <Clock color="black" /> Recent
          </button>
          <button className={`${styles.navButton} ${styles.iconButton}`}>
            <Star /> Starred
          </button>
        </nav>
        <button className={styles.logoutButton} onClick={signOutWithGoogle}>
          Logout
        </button>
      </aside>
      <main className={styles.mainContent}>
        <div className={styles.searchBar}>
          <Search className={styles.searchIcon} />
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
          {floorPlans.map((file: FloorPlanDocument) => ( // Corrected to use 'FloorPlanDocument' from the state
            <div key={file.id} className={styles.fileItem}>
              <div className={styles.fileItemTopRow}>
                <img
                  className={styles.floorPlanLogo}
                  src="https://t4.ftcdn.net/jpg/02/48/67/69/360_F_248676911_NFIOCDSZuImzKaFVsml79S0ooEnyyIUB.jpg"
                  alt="floor plan logo" />
                <div className={styles.fileName}>
                  {truncateFloorPlanName(file.name)}
                  <div className={styles.fileNamePopup}>{file.name}</div>
                </div>
                <img
                  className={styles.threeDotLogo}
                  src="https://cdn.icon-icons.com/icons2/2645/PNG/512/three_dots_vertical_icon_159806.png"
                  alt="three-dots-icon"
                  onClick={() => handleThreeDotPopup(file.id)}
                />
              </div>
              {showThreeDotPopup && selectedFileId === file.id && (
                <div className={styles.popupMenu}>
                  <button onClick={() => handleFileOpen(file.pdfURL)}>Open</button>
                  <button onClick={() => handleDelete(file.id)}>Delete</button>
                </div>
              )}
              <p>{"Creator: " + file.creatorEmail || 'Unknown Creator'}</p>
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
