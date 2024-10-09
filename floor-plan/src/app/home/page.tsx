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
import Spinner from "../components/Spinner";
import { useFolders } from '../hooks/useFolders';
import { doc, updateDoc } from "firebase/firestore";
import { db } from "../../../firebase"; 

/*
Back B
Delete
*/

export default function Home() {
	const [pdfFile, setPdfFile] = useState<File | null>(null);
	const { uploadPdf, uploading, error } = useUploadPdf();
	const [selectedFolder, setSelectedFolder] = useState<string | null>(null);
	const [folderName, setFolderName] = useState('');
	const { folders, loading: loadingFolders, createFolder, deleteFolder, fetchFolders } = useFolders();
	const { floorPlans, loading, fetchFloorPlans } = useUserFiles(selectedFolder); // Pass selected folder ID to hook
	const { deleteDocument, isDeleting, error: deleteError } = useDeleteDocument();
	const { isLoading } = useAuthRedirect();
	const [showThreeDotPopup, setShowThreeDotPopup] = useState(false);
	const [selectedFileId, setSelectedFileId] = useState(String);
	const router = useRouter();
	const [openSpinner, setOpeningSpinner] = useState(false);

	const [isRenaming, setIsRenaming] = useState(false);
	const [docToRename, setDocToRename] = useState<string | null>(null);
	const [newName, setNewName] = useState('');
	const { updateFileName } = useUpdateFileName();
	const [showNewOptions, setShowNewOptions] = useState(false); // State to handle showing new options
	const [showNewFolderInput, setShowNewFolderInput] = useState(false); // For showing the new folder input field
	const [folderPath, setFolderPath] = useState<{ id: string; name: string }[]>([ { id: "4", name: "Home" }, ]); // Keeps track of the folder path

	const signOutWithGoogle = async () => {
		try {
			await signOut(auth);
		} catch (err) {
			console.error(err);
		}
	};

	const handleFileChange = async (event: any) => {
		const file = event.target.files[0];
		if (file && file.type === "application/pdf") {
			setPdfFile(file);
			const result = await uploadPdf(file); // Upload the PDF and get both pdfURL and documentId
			if (result) {
				const { pdfURL, documentId } = result;
				// Redirect to the editor page, passing the PDF URL and documentId
				router.push(`/editor?pdf=${encodeURIComponent(pdfURL)}&documentID=${documentId}&fileName=${encodeURIComponent(file.name)}`);
			} else {
				alert("Failed to upload PDF.");
			}
		}
	};
	
	// Opening existing floor plans
	const openFloorplan = (pdfURL: string, documentID: string, fileName: string) => {
		setOpeningSpinner(true);
		router.push(`/editor?pdf=${encodeURIComponent(pdfURL)}&documentID=${documentID}&fileName=${encodeURIComponent(fileName)}`);
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

	const handleFolderClick = (folderId: string, folderName: string) => {
		setSelectedFolder(folderId);  // Set the selected folder ID to display its contents
		fetchFolders(folderId);  // Fetch subfolders inside the selected folder
		fetchFloorPlans(); // Fetch files inside the selected folder
		setFolderPath((prevPath) => [...prevPath, { id: folderId, name: folderName }]); // Add the new folder to the path
	};

	const handleBackClick = () => {
		const newPath = [...folderPath];
		newPath.pop(); // Remove the last folder from the path
		const lastFolder = newPath[newPath.length - 1]; // Get the new last folder
		setSelectedFolder(lastFolder.id); // Set the selected folder to the last one
		fetchFolders(lastFolder.id); // Fetch the contents of the last folder
		setFolderPath(newPath); // Update the folder path
	};

	const handleDragStart = (event: React.DragEvent<HTMLDivElement>, fileId: string) => {
		event.dataTransfer.setData('fileId', fileId); // Set the dragged file ID
	};

	const handleBreadcrumbClick = (folderId: string) => {
		// Find the folder's index in the folderPath array
		const clickedFolderIndex = folderPath.findIndex(folder => folder.id === folderId);
	  
		// Remove all folders after the clicked folder
		const newFolderPath = folderPath.slice(0, clickedFolderIndex + 1);
	  
		setSelectedFolder(folderId);  // Set the selected folder ID to display its contents
		fetchFolders(folderId);  // Fetch subfolders inside the selected folder
		fetchFloorPlans(); // Fetch files inside the selected folder
		setFolderPath(newFolderPath);  // Update the folder path to only include folders up to this one
	};

	const handleDropOnBreadcrumb = async (event: React.DragEvent, targetFolderId: string) => {
		event.preventDefault();
		const fileId = event.dataTransfer.getData("fileId");  // Get the file ID from the drag event
	  
		if (fileId) {
		  try {
			// Update the file's folderID to the target folder in Firestore
			await updateFileFolder(fileId, targetFolderId);
			fetchFloorPlans();  // Refresh the file list after moving the file
		  } catch (err) {
			console.error("Failed to move file:", err);
			alert("Failed to move file.");
		  }
		}
	};

	const handleCreateFolder = async () => {
		if (folderName.trim()) {
		  const parentFolderId = selectedFolder || "4";
		  await createFolder(folderName, parentFolderId);  // Pass the parent folder ID
		  setFolderName(''); 
		  setShowNewFolderInput(false);  // Hide the new folder input after creation
		} else {
		  alert("Please enter a folder name.");
		}
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

	// Changes the new name in firebase and on screen
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

	return (
		<div className={styles.container}>
			{(uploading || loading || isDeleting || openSpinner) && <Spinner />}
			<>
				<aside className={styles.sidebar}>
					<img className={styles.lutronLogo} src="https://umslogin.lutron.com/Content/Dynamic/Default/Images/logo-lutron-blue.svg" alt="Lutron Logo" />
					<nav className={styles.navigation} id="navSidebar">
						<button className={`${styles.navButton} ${styles.iconButton}`}>
							<Users />Shared with me
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
					{/* Breadcrumb Navigation with Drag-and-Drop */}
					<div className={styles.breadcrumb}>
						{folderPath.map((folder, index) => (
							<span key={folder.id}>
							<button
								className={styles.breadcrumbButton}
								onClick={() => handleBreadcrumbClick(folder.id)}
								onDragOver={(e) => e.preventDefault()}  
								onDrop={(e) => handleDropOnBreadcrumb(e, folder.id)}  
							>
								{folder.name}
							</button>
							{index < folderPath.length - 1 && ' / '} {/* Display a separator between items */}
							</span>
						))}
					</div>
						{/* Back Button and Folder Name Display */}
						{folderPath.length > 1 && (
							<div className={styles.folderNavigation}>
							<button className={styles.backButton} onClick={handleBackClick}>
								Back to {folderPath[folderPath.length - 2].name}
							</button>
							<span>Current Folder: {folderPath[folderPath.length - 1].name}</span>
							</div>
						)}
					<div className={styles.searchBar}>
						<Search className={styles.searchIcon} />
						<input
							type="text"
							placeholder="Search floor plans"
							className={styles.searchInput}
						/>
					</div>
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
					  			{/* Hidden input field for file selection */}
								<input
									type="file"
									id="fileInput"
									style={{ display: 'none' }}  // Hide the default input
									onChange={handleFileChange}  // Trigger file change logic
							/>
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

						
						<div className={styles.folderList}>
							{loadingFolders ? (
								<div>Loading folders...</div>
							) : (
								folders.map((folder) => (
								<div
									key={folder.id}
									className={styles.folderItem}
									onClick={() => handleFolderClick(folder.id, folder.name)} // Pass both folder ID and Name
									onDrop={(e) => handleDrop(e, folder.id)} // Enable dropping files into the folder
									onDragOver={(e) => e.preventDefault()} // Allow drag over
								>
									{folder.name}
								</div>
								))
							)}
						</div>

 
				{/*	<form>
						<input
							type="file"
							onChange={uploadFloorplan}
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
				*/}
					<div className={styles.fileList}>
						{floorPlans.map((file: FloorPlanDocument) => (
							<div key={file.id} className={styles.fileItem} onMouseLeave={handleMouseLeave}>
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
									isRenaming && docToRename === file.id ? (
										<>
											<input value={newName} onChange={(e) => setNewName(e.target.value)} />
											<button onClick={submitNewName}>Save</button>
											<button onClick={cancelRenaming}>Cancel</button>
										</>
									) : (
										<div className={styles.popupMenu} onMouseLeave={handleMouseLeave}>
											<button onClick={() => openFloorplan(file.pdfURL, file.id, file.name || 'Untitled')}>Open</button>
											<button onClick={() => handleDelete(file.id)}>Delete</button>
											<button onClick={() => startRenaming(file.id!, file.name)}>Rename</button>
										</div>
									)
								)}
								<p>{"Creator: " + file.creatorEmail || 'Unknown Creator'}</p>
							</div>
						))}
					</div>
					<div className={styles.prompt}>
						Use the “New” button to upload a file
					</div>
				</main>
			</>
		</div>
	);
}