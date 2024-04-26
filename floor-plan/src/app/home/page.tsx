"use client";
import { useState } from "react";
import { signOut } from "firebase/auth";
import { auth } from "../../../firebase";
import styles from "./page.module.css";
import { useUploadPdf } from "../hooks/useUploadPdf";
import { useDeleteDocument } from "../hooks/useDeleteDocument";
import { useRouter } from "next/navigation";
import useAuthRedirect from "../hooks/useAuthRedirect";
import Link from 'next/link'
import { useUserFiles } from '../hooks/useUserFiles';
import { FloorPlanDocument } from '../FloorPlanDocument';
import { Clock, Search, Star, Users } from "lucide-react";
import { useUpdateFileName } from '../hooks/useUpdateFileName';


//import {} from "../lutron-electronics-vector-logo.svg"; 


//import { thumbnailPlugin } from '@react-pdf-viewer/thumbnail';
//import '@react-pdf-viewer/thumbnail/lib/styles/index.css';


//import PDFasImage from './PDFasImage'; 

// Assuming the original FloorPlanDocument is defined somewhere in your project
interface ExtendedFloorPlanDocument extends FloorPlanDocument {
  thumbnailUrl: string; // Ensure this matches the expected type for thumbnail URLs
}

export default function Home() {
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const { uploadPdf, uploading, error } = useUploadPdf();
  const { floorPlans, loading, fetchFloorPlans } = useUserFiles();
  const { deleteDocument, isDeleting, error: deleteError } = useDeleteDocument();


  const [isRenaming, setIsRenaming] = useState(false);
  const [docToRename, setDocToRename] = useState<string | null>(null);
  const [newName, setNewName] = useState('');
  

  const { updateFileName } = useUpdateFileName();

  /*
  const { updateFileName } = useUpdateFileName(); // Destructure the function from your custom hook
  const [isRenaming, setIsRenaming] = useState(false); // State to track if rename mode is active
  const [newName, setNewName] = useState(''); // State to track the new name input by the user
  const [docToRename, setDocToRename] = useState<string | null>(null); // ID of the document to rename
  */

  //const { Thumbnails } = thumbnailPluginInstance;


  //const [selectedImage, setSelectImage] = useState<string>();


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

  
  const startRenaming = (docId: string, currentName?: string) => {
    setIsRenaming(true);
    setDocToRename(docId);
    setNewName(currentName || ''); // Pre-fill with current name if available
  };
  

  const cancelRenaming = () => {
    setIsRenaming(false);
    setDocToRename(null);
  };

  
  const submitNewName = async () => {
    if (docToRename && newName) {
      await updateFileName(docToRename, newName);
      setIsRenaming(false);
      setDocToRename(null);
      // Optionally refresh the list of floor plans to show the updated name
      await fetchFloorPlans();

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

  return isLoading ? (
    <div>Loading...</div>
  ) : (
    <div className={styles.container}>
      <aside className={styles.sidebar}>
        <img className={styles.lutronLogo} src="lutron-electronics-vector-logo.svg" alt="Lutron Logo" />
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
          {floorPlans.map((file: FloorPlanDocument) => (
            <div key={file.id} className={styles.fileItem}>
              <span className={styles.fileName}>{file.name || 'Unnamed File'}</span>
              {isRenaming && docToRename === file.id ? (
                <>
                  <input value={newName} onChange={(e) => setNewName(e.target.value)} />
                  <button onClick={submitNewName}>Save</button>
                  <button onClick={cancelRenaming}>Cancel</button>
                </>
              ) : (
                <>
                  <button onClick={() => handleFileOpen(file.pdfURL)}>Open</button>
                  <button onClick={() => handleDelete(file.id!)}>Delete</button>
                  <button onClick={() => startRenaming(file.id!, file.name)}>Rename</button>
                </>
              )}
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
