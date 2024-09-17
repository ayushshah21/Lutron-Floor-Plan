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
import { FloorPlanDocument } from '../interfaces/FloorPlanDocument';
import { useUpdateFileName } from '../hooks/useUpdateFileName';
import { Clock, Search, Star, Users } from "lucide-react";
import { useFolders } from '../hooks/useFolders';
import { doc, updateDoc } from "firebase/firestore";
import { db } from "../../../firebase"; 

export default function Home() {
	const [pdfFile, setPdfFile] = useState<File | null>(null);
	const { uploadPdf, uploading, error } = useUploadPdf();
	//const { floorPlans, loading, fetchFloorPlans } = useUserFiles();
	const [selectedFolder, setSelectedFolder] = useState<string | null>(null);

	const { floorPlans, loading, fetchFloorPlans } = useUserFiles(selectedFolder); // Pass selected folder ID to hook

	const { deleteDocument, isDeleting, error: deleteError } = useDeleteDocument();
	const { isLoading } = useAuthRedirect();
	const [showThreeDotPopup, setShowThreeDotPopup] = useState(false);
	const [selectedFileId, setSelectedFileId] = useState(String);
	const [folderName, setFolderName] = useState('');
	const { folders, loading: loadingFolders, createFolder, deleteFolder } = useFolders();  
	
	const router = useRouter();

	const [isRenaming, setIsRenaming] = useState(false);
	const [docToRename, setDocToRename] = useState<string | null>(null);
	const [newName, setNewName] = useState('');
	const { updateFileName } = useUpdateFileName();

	const [showNewOptions, setShowNewOptions] = useState(false); // State to handle showing new options

	const [showNewFolderInput, setShowNewFolderInput] = useState(false); // For showing the new folder input field


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
			const pdfURL = await uploadPdf(file, selectedFolder || "0"); // Pass selected folder ID or default to '0'
			if (pdfURL) {
				router.push(`/editor?pdf=${(url)}`); // Redirect to the editor page with the PDF URL
			} else {
				alert("Failed to upload PDF.");
			}
		} else {
			alert("Please select a valid PDF file.");
		}
	};

	// Function to update the folderID of a file in Firestore
	const updateFileFolder = async (fileId: string, folderID: string) => {
		try {
		const fileRef = doc(db, "FloorPlans", fileId); // Reference to the specific file document
		await updateDoc(fileRef, { folderID }); // Update the folderID field in Firestore
		console.log(`File ${fileId} moved to folder ${folderID}`);
		} catch (error) {
		console.error("Failed to update file folder:", error);
		throw new Error("Failed to update file folder.");
		}
	};

	const handleDrop = async (event: React.DragEvent<HTMLDivElement>, folderId: string) => {
		event.preventDefault();
		const fileId = event.dataTransfer.getData("fileId"); // Get the dragged file ID
		if (fileId) {
		  try {
			// Call the updateFileFolder function to change the folderID in Firestore
			await updateFileFolder(fileId, folderId);
			fetchFloorPlans(); // Refresh the file list after moving the file
		  } catch (err) {
			console.error("Failed to move file:", err);
			alert("Failed to move file.");
		  }
		}
	};


	const handleFolderClick = (folderId: string) => {
		setSelectedFolder(folderId); // Set the selected folder ID to display its contents
		if (folderId === "1") {
		  // Logic for "Shared with me"
		  console.log("Fetching files shared with the user...");
		} else if (folderId === "2") {
		  // Logic for "Recent"
		  console.log("Fetching recent files...");
		} else if (folderId === "3") {
		  // Logic for "Starred"
		  console.log("Fetching starred files...");
		} else if (folderId === "4") {
		  // Logic for "Home"
		  console.log("Fetching files in Home...");
		} else {
		  fetchFloorPlans(); // Fetch files inside the selected folder
		}
	  };
	  
	
	const handleDragStart = (event: React.DragEvent<HTMLDivElement>, fileId: string) => {
		event.dataTransfer.setData('fileId', fileId); // Set the dragged file ID
	};
	

	  
	const handleCreateFolder = async () => {
		if (folderName.trim()) {
		  await createFolder(folderName);
		  setFolderName(''); 
		} else {
		  alert("Please enter a folder name.");
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
		// router.push(`/editor?pdf=${encodeURIComponent(pdfURL)}`);
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

	// Hide three dot pop up menu when you hover away
	const handleMouseLeave = () => {
		setShowThreeDotPopup(false);
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
				{/* Folders Display Above Files */}


			</aside>


			<main className={styles.mainContent}>
  {/* Search Bar */}
  <div className={styles.searchBar}>
    <Search className={styles.searchIcon} />
    <input
      type="text"
      placeholder="Search floor plans"
      className={styles.searchInput}
    />
  </div>

  {/* New Folder and File Input Section */}
{/* New Button and Dropdown Options */}
<div className={styles.newOptionsSection}>
  <button
    className={styles.button}
    onClick={() => setShowNewOptions(!showNewOptions)}
  >
    + New
  </button>

  {showNewOptions && (
    <div className={styles.newOptionsDropdown}>
      <button onClick={() => document.getElementById("fileInput")?.click()}>
        New File
      </button>
      <button onClick={() => setShowNewFolderInput(!showNewFolderInput)}>
        New Folder
      </button>
    </div>
  )}

  {showNewFolderInput && (
    <div className={styles.newFolderInput}>
      <input
        type="text"
        placeholder="Enter folder name"
        value={folderName}
        onChange={(e) => setFolderName(e.target.value)}
        className={styles.input}
      />
      <button onClick={handleCreateFolder} className={styles.button}>
        Create Folder
      </button>
    </div>
  )}
</div>


  {/* Folders Display */}
  <div className={styles.folderList}>
    {loadingFolders ? (
      <div>Loading folders...</div>
    ) : (
      folders.map((folder) => (
        <div
          key={folder.id}
          className={styles.folderItem}
          onClick={() => handleFolderClick(folder.id)}
          onDrop={(e) => handleDrop(e, folder.id)} // Enable dropping files into the folder
          onDragOver={(e) => e.preventDefault()}  // Allow drag over
        >
          {folder.name}
        </div>
      ))
    )}
  </div>

  {/* Files Display */}
  <div className={styles.fileList}>
    {floorPlans.map((file: FloorPlanDocument) => (
      <div
        key={file.id}
        className={styles.fileItem}
        draggable
        onDragStart={(e) => handleDragStart(e, file.id)} // Enable dragging files
      >
        <div className={styles.fileItemTopRow}>
          <img
            className={styles.floorPlanLogo}
            src="https://t4.ftcdn.net/jpg/02/48/67/69/360_F_248676911_NFIOCDSZuImzKaFVsml79S0ooEnyyIUB.jpg"
            alt="floor plan logo"
          />
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
          isRenaming && docToRename === file.id ? (
          <>
            <input value={newName} onChange={(e) => setNewName(e.target.value)} />
            <button onClick={submitNewName}>Save</button>
            <button onClick={cancelRenaming}>Cancel</button>
          </>
          ) : (
          <div className={styles.popupMenu} onMouseLeave={handleMouseLeave}>
            <button onClick={() => handleFileOpen(file.pdfURL)}>Open</button>
            <button onClick={() => handleDelete(file.id)}>Delete</button>
            <button onClick={() => startRenaming(file.id!, file.name)}>Rename</button>
          </div>
          )
        )}
        <p>{"Creator: " + file.creatorEmail || "Unknown Creator"}</p>
      </div>
    ))}
  </div>
</main>

		</div>
	);
}
