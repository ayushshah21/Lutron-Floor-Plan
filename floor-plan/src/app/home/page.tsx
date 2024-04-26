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
import { useFirestoreOperations } from "../hooks/useFirestoreOperations";


//import {} from "../lutron-electronics-vector-logo.svg"; 


//import { thumbnailPlugin } from '@react-pdf-viewer/thumbnail';
//import '@react-pdf-viewer/thumbnail/lib/styles/index.css';


//import PDFasImage from './PDFasImage'; 

// Assuming the original FloorPlanDocument is defined somewhere in your project
interface ExtendedFloorPlanDocument extends FloorPlanDocument {
  thumbnailUrl: string; // Ensure this matches the expected type for thumbnail URLs
}

export default function Home() {
  //Uploading files
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const { uploadPdf, uploading, error } = useUploadPdf();
  //delete files
  const { floorPlans, loading, fetchFloorPlans } = useUserFiles();
  const { deleteDocument, isDeleting, error: deleteError } = useDeleteDocument();
  //rename files
  const [isRenaming, setIsRenaming] = useState(false);
  const [docToRename, setDocToRename] = useState<string | null>(null);
  const [newName, setNewName] = useState('');
  const { updateFileName } = useUpdateFileName();
  //use folders
  const [newFolderName, setNewFolderName] = useState('');
  const [folders, setFolders] = useState([]); // State to store folder data
  //const { createFolder } = useFirestoreOperations(); // From our new hook
  const { createFolder, fetchFolders, assignFileToFolder } = useFirestoreOperations();

  
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


  //handler for creating a new folder
  const handleCreateFolder = async () => {
    if (!newFolderName.trim()) {
      alert("Folder name cannot be empty");
      return;
    }
    try {
      const userId = auth.currentUser?.uid; // Assuming you have the current user's ID
      if (userId) {
        const folderDocRef = await createFolder(newFolderName, userId);
        // You may want to fetch folders again or add the new folder to the state
        setFolders([...folders, { id: folderDocRef.id, name: newFolderName }]);
        setNewFolderName(''); // Clear the input after creating the folder
      } else {
        throw new Error('User ID is not available');
      }
    } catch (error) {
      console.error("Failed to create folder:", error);
      // Handle the error, possibly by showing a message to the user
    }
  };

  //adds file to folder
  const assignFileToFolder = async (fileId: string, folderId: string) => {
    // Show loading indicator if needed
    // ...

    try {
      const fileRef = doc(db, 'FloorPlans', fileId);
      await updateDoc(fileRef, {
        folderId: folderId
      });

      // Update the local state to reflect the change
      setFloorPlans(prevFloorPlans => prevFloorPlans.map(file => {
        if (file.id === fileId) {
          return { ...file, folderId: folderId };
        }
        return file;
      }));
    } catch (error) {
      console.error("Error assigning file to folder:", error);
      // Handle the error, possibly showing a message to the user
    } finally {
      // Hide loading indicator if it was shown
      // ...
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

  
  /*
  Changes the new name in firebase and on screen
  */
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
        <div className={styles.folderCreationContainer}>
          <input
            type="text"
            value={newFolderName}
            onChange={(e) => setNewFolderName(e.target.value)}
            placeholder="New folder name"
            className={styles.folderInput}
          />
          <button onClick={handleCreateFolder} className={styles.createFolderButton}>
            Create Folder
          </button>
        </div>
        <div className={styles.fileList}>
          {floorPlans.map((file: FloorPlanDocument) => (
            <div key={file.id} className={styles.fileItem}>
              <span className={styles.fileName}>{file.name || 'Unnamed File'}</span>
              
              {/* Add the dropdown for folder selection here */}
              <select
                value={file.folderId || ''}
                onChange={(e) => assignFileToFolder(file.id, e.target.value)}
                className={styles.folderSelect}
              >
                <option value="">No Folder</option>
                {/* Render the folder options here */}
                {folders.map(folder => (
                  <option key={folder.id} value={folder.id}>{folder.name}</option>
                ))}
              </select>

              {/* Existing buttons for file operations */}
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
