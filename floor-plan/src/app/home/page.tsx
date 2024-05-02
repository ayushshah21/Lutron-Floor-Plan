import React, { useState, useEffect } from 'react';
import { signOut } from "firebase/auth";
import { useRouter } from "next/router";
import { auth } from "../../../firebase";
import styles from "./page.module.css";
//import { useUploadPdf, useDeleteDocument, useUserFiles, useUpdateFileName, useFirestoreOperations } from "../hooks";

import { Clock, Search, Star, Users } from "lucide-react";
import { Folder, FloorPlanDocument } from "../FloorPlanDocument"; // Assuming the interface file is in ../interfaces


import { useUploadPdf } from "../hooks/useUploadPdf";
import { useDeleteDocument } from "../hooks/useDeleteDocument";
import { useUserFiles } from '../hooks/useUserFiles';
import { useUpdateFileName } from '../hooks/useUpdateFileName';
import { useFirestoreOperations } from "../hooks/useFirestoreOperations";

export default function Home() {
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');
  const [isRenaming, setIsRenaming] = useState(false);
  const [docToRename, setDocToRename] = useState<string | null>(null);
  const [newName, setNewName] = useState('');
  const { uploadPdf, uploading, error: uploadError } = useUploadPdf();
  const { floorPlans, fetchFloorPlans } = useUserFiles();
  const { deleteDocument } = useDeleteDocument();
  const { updateFileName } = useUpdateFileName();
  const { createFolder, assignFileToFolder, fetchFolders } = useFirestoreOperations();
  const [folders, setFolders] = useState<{ id: string; name: string }[]>([]);
  const router = useRouter();
  
  

  useEffect(() => {
    const loadFolders = async() => {
      // Ensure currentUser is not null before accessing uid
      if (auth.currentUser) {
        const fetchedFolders = await fetchFolders(auth.currentUser.uid);
        setFolders(fetchedFolders || []);
      }
    };
    loadFolders();
    fetchFloorPlans();
  }, []);

  const handleCreateFolderClick = async () => {
    if (!newFolderName.trim()) {
      alert("Folder name cannot be empty.");
      return;
    }
    setIsLoading(true);
    try {
      // Ensure currentUser is not null before accessing uid
      if (auth.currentUser) {
        const folderDocRef = await createFolder(newFolderName, auth.currentUser.uid);
        if (folderDocRef) {
          setFolders([...folders, { id: folderDocRef.id, name: newFolderName }]);
          setNewFolderName('');
        }
      }
    } catch (error) {
      alert("Failed to create folder. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && file.type === "application/pdf") {
      setPdfFile(file);
      const pdfURL = await uploadPdf(file);
      if (pdfURL) {
        router.push(`/editor?pdf=${pdfURL}`);
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
      await fetchFloorPlans();
    }
  };

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

  const signOutWithGoogle = async () => {
    try {
      await signOut(auth);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className={styles.container}>
      <aside className={styles.sidebar}>
        <img src="/lutron-electronics-vector-logo.svg" alt="Lutron Logo" className={styles.lutronLogo} />
        <nav className={styles.navigation}>
          <button className={styles.navButton}><Users />Shared with me</button>
          <button className={styles.navButton}><Clock />Recent</button>
          <button className={styles.navButton}><Star />Starred</button>
        </nav>
        <button onClick={signOutWithGoogle} className={styles.logoutButton}>Logout</button>
      </aside>
      <main className={styles.mainContent}>
        <div className={styles.searchBar}>
          <Search />
          <input type="text" placeholder="Search floor plans" className={styles.searchInput} />
        </div>
        <form>
          <input
            type="file"
            onChange={handleFileChange}
            accept="application/pdf"
            id="fileInput"
            style={{ display: "none" }}
          />
          <button
            className={styles.button}
            onClick={(e) => {
              e.preventDefault();
              document.getElementById("fileInput")?.click();
            }}
            disabled={uploading}
          >
            {uploading ? "Uploading..." : "+ New File"}
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
          <button onClick={handleCreateFolderClick} disabled={isLoading}>
            Create Folder
          </button>
        </div>
        <div className={styles.fileList}>
          {folders.map(folder => (
            <div key={folder.id}>
              <span>{folder.name}</span>
              {floorPlans.filter((fp: FloorPlanDocument) => fp.folderId === folder.id).map((file: FloorPlanDocument) => (
                <div key={file.id}>{file.name}</div>
              ))}
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}















//No folders


/*
"use client";
//import { useState, useEffect } from "react";
import React, { useState, useEffect } from 'react';
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
  const { uploadPdf, uploading, error: uploadError } = useUploadPdf();
  const { floorPlans, loading: loadingFiles, fetchFloorPlans } = useUserFiles();
  //delete file
  const { deleteDocument, isDeleting, error: deleteError } = useDeleteDocument();
  //rename files
  const [isRenaming, setIsRenaming] = useState(false);
  const [docToRename, setDocToRename] = useState<string | null>(null);
  const [newName, setNewName] = useState('');
  const { updateFileName } = useUpdateFileName();
  //use folders
  const [newFolderName, setNewFolderName] = useState('');
  const [folders, setFolders] = useState([]);
  const [currentFolderId, setCurrentFolderId] = useState('0'); // '0' indicates the home directory
  const { createFolder, assignFileToFolder, fetchFolders, error } = useFirestoreOperations();


  
  /*
  const { updateFileName } = useUpdateFileName(); // Destructure the function from your custom hook
  const [isRenaming, setIsRenaming] = useState(false); // State to track if rename mode is active
  const [newName, setNewName] = useState(''); // State to track the new name input by the user
  const [docToRename, setDocToRename] = useState<string | null>(null); // ID of the document to rename
  */

  //const { Thumbnails } = thumbnailPluginInstance;


  //const [selectedImage, setSelectImage] = useState<string>();


  //const { isLoading } = useAuthRedirect();
  /*
  const [isLoading, setIsLoading] = useState(false); // Ensure this is the only place isLoading is declared

  const router = useRouter();

  useEffect(() => {
    // Function to fetch folders and set them in state
    const loadFolders = async () => {
      const fetchedFolders = await fetchFolders(auth.currentUser?.uid || '');
      setFolders(fetchedFolders);
    };

    loadFolders();
  }, []);

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

  
  /*
  Changes the new name in firebase and on screen
  */
 /*
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
  

  const handleCreateFolderClick = async () => {
    if (!newFolderName.trim()) {
      alert("Folder name cannot be empty.");
      return;
    }
    try {
      setIsLoading(true);
      const folderDocRef = await createFolder(newFolderName, auth.currentUser?.uid);
      setFolders([...folders, { id: folderDocRef.id, name: newFolderName }]);
      setNewFolderName(''); // Clear the folder name input
    } catch (error) {
      console.error("Error creating folder:", error);
      alert("Failed to create folder. Please try again.");
    } finally {
      setIsLoading(false);
      fetchFolders(auth.currentUser?.uid); // Re-fetch folders to update the UI
    }
  };
  

  const assignFileToFolderHandler = async (fileId: string, folderId: string) => {
    try {
      setIsLoading(true);
      await assignFileToFolder(fileId, folderId);
      setFloorPlans((currentFloorPlans) =>
        currentFloorPlans.map((file) =>
          file.id === fileId ? { ...file, folderId: folderId } : file
        )
      );
    } catch (error) {
      console.error("Error moving file to folder:", error);
      alert("Failed to move file. Please try again.");
    } finally {
      setIsLoading(false);
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
          <button onClick={handleCreateFolderClick} disabled={isLoading}>
            Create Folder
          </button>
        </div>
        <div className={styles.fileList}>
          {floorPlans.map((file: FloorPlanDocument) => (
            <div key={file.id} className={styles.fileItem}>
              <span className={styles.fileName}>{file.name || 'Unnamed File'}</span>
              
              
              <select
                value={file.folderId}
                onChange={(e) => assignFileToFolderHandler(file.id, e.target.value)}
                className={styles.folderSelect}
                disabled={isLoading}
              >
                <option value="0">Home</option>
                {folders.map(folder => (
                  <option key={folder.id} value={folder.id}>{folder.name}</option>
                ))}
              </select>

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
*/
