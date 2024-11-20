"use client";
import { useEffect, useState } from "react";
import { signOut } from "firebase/auth";
import { auth } from "../../../firebase";
import styles from "./page.module.css";
import { useUploadPdf } from "../hooks/useUploadPdf";
import { useDeleteDocument } from "../hooks/useDeleteDocument";
import { useStarredFile } from "../hooks/useStarredFiles"
import { useRouter } from "next/navigation";
import useAuthRedirect from "../hooks/useAuthRedirect";
import { useUserFiles } from '../hooks/useUserFiles';
import { FloorPlanDocument } from '../interfaces/FloorPlanDocument';
import { useUpdateFileName } from '../hooks/useUpdateFileName';
import { Clock, Search, Star, Users, HomeIcon, Trash2, CircleUser } from "lucide-react";
import Spinner from "../components/Spinner";
import { useFolders } from '../hooks/useFolders';
import { doc, updateDoc } from "firebase/firestore";
import { db } from "../../../firebase";
import ShareButton from "../components/ShareButton";
import Menu from "../components/Menu";


import * as pdfjsLib from 'pdfjs-dist/build/pdf'; // Import the PDF.js library
import 'pdfjs-dist/build/pdf.worker.entry';

export default function Home() {
	const [pdfFile, setPdfFile] = useState<File | null>(null);
	const { uploadPdf, uploading, error } = useUploadPdf();
	const [selectedFolder, setSelectedFolder] = useState<string | null>(null);
	const [folderName, setFolderName] = useState('');
	const { folders, loading: loadingFolders, createFolder, deleteFolder, fetchFolders } = useFolders();
	const [filterCondition, setFilterCondition] = useState<string>("Home"); // Default is home
	const { floorPlans, loading, fetchFloorPlans } = useUserFiles(selectedFolder, filterCondition);
	const { updateStarredFloorplan } = useStarredFile();
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
	const [folderPath, setFolderPath] = useState<{ id: string; name: string }[]>([{ id: "4", name: "Home" },]); // Keeps track of the folder path

	const [thumbnails, setThumbnails] = useState<{ [key: string]: string }>({}); // Store thumbnails
	const [searchTerm, setSearchTerm] = useState(''); // Store search terms for the search bar


	// Functions for switching between home, recent, starred, and sharred
	const handleClickFilterOptions = (filterParameter: string) => {
		setFilterCondition(filterParameter); 
		setSelectedFolder(null); 
	};

	// Ensure `fetchFloorPlans` is called whenever `filterByContributors` or `selectedFolder` changes
	useEffect(() => {
		fetchFloorPlans(); // Fetch files when the filter or folder changes
	}, [filterCondition, selectedFolder]);

	// Removes the border around the home page
	useEffect(() => {
		document.body.style.margin = "0";
		document.body.style.padding = "0";
		document.body.style.boxSizing = "border-box";
		document.body.style.background = "#F9F9F9";
	
		return () => {
		  document.body.style.margin = "";
		  document.body.style.padding = "";
		  document.body.style.boxSizing = "";
		  document.body.style.background = "";
		};
	  }, []);

	// Function to render PDF thumbnail
	const renderThumbnail = async (pdfUrl: string) => {
		try {
			const pdf = await pdfjsLib.getDocument(pdfUrl).promise;
			const page = await pdf.getPage(1); // Get the first page
			const scale = 0.5;
			const viewport = page.getViewport({ scale });

			// Create canvas and draw the page as an image
			const canvas = document.createElement('canvas');
			const context = canvas.getContext('2d');
			canvas.height = viewport.height;
			canvas.width = viewport.width;

			const renderContext = {
				canvasContext: context!,
				viewport,
			};

			await page.render(renderContext).promise;

			// Convert canvas to image URL
			const thumbnailUrl = canvas.toDataURL();
			return thumbnailUrl;
		} catch (error) {
			console.error('Error rendering PDF thumbnail:', error);
			return null;
		}
	};

	useEffect(() => {
		const generateThumbnails = async () => {
			const thumbnailsData: { [key: string]: string } = {};
			for (const file of floorPlans) {
				if (file.pdfURL) {
					const thumbnailUrl = await renderThumbnail(file.pdfURL);
					if (thumbnailUrl) {
						thumbnailsData[file.id] = thumbnailUrl;
					}
				}
			}
			setThumbnails(thumbnailsData);
		};

		generateThumbnails();
	}, [floorPlans]);

	const signOutWithGoogle = async () => {
		try {
			await signOut(auth);
		} catch (err) {
			console.error(err);
		}
	};

	//renamed from uploadFloorplan
	const handleFileChange = async (event: any) => {
		const file = event.target.files[0];
		if (file && file.type === "application/pdf") {
			setPdfFile(file);

			const folderId = selectedFolder || "4"; // Default to "4" (Home folder) if no folder is selected
			const result = await uploadPdf(file, folderId); // Upload the PDF and get both pdfURL and documentId
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
		const encodedFolderPath = encodeURIComponent(JSON.stringify(folderPath));
		router.push(`/editor?pdf=${encodeURIComponent(pdfURL)}&documentID=${documentID}&fileName=${encodeURIComponent(fileName)}&folderPath=${encodedFolderPath}`);
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

	// Handle starring floorplans
	const handleStarredFloorplans = async (documentId: string, isStarred: boolean) => {
		await updateStarredFloorplan(documentId, isStarred);
		if (isStarred) {
			alert("Floorplan successfully starred")
		} else {
			alert("Floorplan removed from starred")
		}
	}

	const handleRenameFolder = (folderId: string) => {
		// Placeholder function to handle renaming folders
		console.log(`Rename folder with ID: ${folderId}`);
		// Add your renaming logic here (e.g., prompt for new folder name, update in database)
	};
	const handleMoveFolder = (folderId: string) => {
    // Placeholder function to handle moving folders
    console.log(`Move folder with ID: ${folderId}`);
    // Add your moving logic here (e.g., select target folder, update in database)
	};

	const handleDeleteFolder = (folderId: string) => {
		// Placeholder function to delete  folders
		console.log(`Delete folder with ID: ${folderId}`);
		// Add your delete logic here (e.g., select target folder, update in database)
		};


	useEffect(() => {
		const params = new URLSearchParams(window.location.search);
		const folderParam = params.get('folder');
		const folderPathParam = params.get('folderPath');

		if (folderParam) {
			setSelectedFolder(folderParam);
			fetchFolders(folderParam);
		}

		if (folderPathParam) {
			try {
				const pathData = JSON.parse(decodeURIComponent(folderPathParam));
				setFolderPath(pathData);
			} catch (error) {
				console.error('Error parsing folder path:', error);
			}
		}
	}, []);

	const filteredFloorPlans = floorPlans.filter((file) => 
		file.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
		file.creatorEmail?.toLowerCase().includes(searchTerm.toLowerCase())
	);
	
	return (
		<div className={styles.container}>
			{(uploading || loading || isDeleting || openSpinner) && <Spinner />}
			<>
				<aside className={styles.sidebar}>
					<img className={styles.lutronLogo} src="https://umslogin.lutron.com/Content/Dynamic/Default/Images/logo-lutron-blue.svg" alt="Lutron Logo" />
					<h4>Floor Plan Application</h4>
					<nav className={styles.navigation} id="navSidebar">
						<button className={`${styles.navButton} ${styles.iconButton}`} onClick={() => handleClickFilterOptions("Home")}>
							<HomeIcon size={22} /> Home
						</button>
						<button className={`${styles.navButton} ${styles.iconButton}`} onClick={() => handleClickFilterOptions("Shared")}>
							< Users size={22} /> Shared with me
						</button>
						<button className={`${styles.navButton} ${styles.iconButton}`} onClick={() => handleClickFilterOptions("Recent")}>
							<Clock color="black" size={22} /> Recent
						</button>
						<button className={`${styles.navButton} ${styles.iconButton}`} onClick={() => handleClickFilterOptions("Starred")}>
							<Star size={22} /> Starred
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
								{index < folderPath.length - 1 ? (
									<button
										className={styles.breadcrumbButton}
										onClick={() => handleBreadcrumbClick(folder.id)}
										onDragOver={(e) => e.preventDefault()}
										onDrop={(e) => handleDropOnBreadcrumb(e, folder.id)}
									>
										{folder.name}
									</button>
								) : (
									<span className={styles.breadcrumbLast}>{folder.name}</span>
								)}
								{index < folderPath.length - 1 && ' / '} {/* Display a separator between items */}
							</span>
						))}
					</div>

					{/* Back Button and Folder Name Display */}
					{folderPath.length > 1 && (
						<div className={styles.folderNavigation}>
						</div>
					)}

					<div className={styles.searchBar}>
						<Search className={styles.searchIcon} />
						<input
							type="text"
							placeholder="Search floor plans"
							className={styles.searchInput}
							value={searchTerm}
							onChange={(e) => setSearchTerm(e.target.value)}
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
								<button onClick={() => {
									document.getElementById("fileInput")?.click();
								}}>
									New File
								</button>
								<button onClick={() => {
									setShowNewFolderInput(!showNewFolderInput);
									setShowNewOptions(false); // Hide the menu after clicking "New Folder"
								}}>
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
								<button onClick={() => setShowNewFolderInput(false)} className={styles.button}>Cancel</button>
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
									<span>{folder.name}</span>
									<Menu
										onDelete={() => handleDeleteFolder(folder.id)}
										onRename={() => handleRenameFolder(folder.id)}
										onMove={() => handleMoveFolder(folder.id)}
									/>
								</div>
							))
						)}
					</div>

					<div className={styles.prompt}>
						Use the “New” button to upload a floor plan (PDF format) or folder
					</div>
					<div className={styles.fileList}>
						{filteredFloorPlans.map((file: FloorPlanDocument) => (
							<div key={file.id} className={styles.fileItem} onDoubleClick={() => openFloorplan(file.pdfURL, file.id, file.name || 'Untitled')} onMouseLeave={handleMouseLeave}>
								{/* Three-dot button */}
								<button className={styles.threeDotButton} onClick={() => handleThreeDotPopup(file.id)}>
									<img
										className={styles.threeDotLogo}
										src="https://cdn.icon-icons.com/icons2/2645/PNG/512/three_dots_vertical_icon_159806.png"
										alt="three-dots-icon"
									/>
								</button>
								<div className={styles.fileName}>
									{truncateFloorPlanName(file.name)}
									<div className={styles.fileNamePopup}>{file.name}</div>
								</div>
								<img src={thumbnails[file.id] || 'loading'} alt="PDF Thumbnail" className={styles.thumbnail} />
								<div className={styles.creatorInfo}>{file.creatorEmail || 'Unknown Creator'}</div>

								{/* Popup Menu */}
								{showThreeDotPopup && selectedFileId === file.id && (
									isRenaming && docToRename === file.id ? (
										<>
											<input value={newName} onChange={(e) => setNewName(e.target.value)} />
											<button onClick={submitNewName}>Save</button>
											<button onClick={cancelRenaming}>Cancel</button>
										</>
									) : (
										<div className={styles.popupMenu} onMouseLeave={handleMouseLeave}>
											<ShareButton fileId={file.id} />
											<button onClick={() => startRenaming(file.id!, file.name)}>Rename</button>
											<button onClick={() => handleDelete(file.id)}>Delete</button>
											<button onClick={() => handleStarredFloorplans(file.id, true)}>Add to Starred</button>
											<button onClick={() => handleStarredFloorplans(file.id, false)}>Remove from Starred</button>
										</div>
									)
								)}
							</div>
						))}
					</div>
				</main>
			</>
		</div>
	);
}
