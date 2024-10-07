"use client";
import { useEffect, useState } from "react";
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
import { Clock, Search, Star, Users, HomeIcon, Trash2, CircleUser } from "lucide-react";

import * as pdfjsLib from 'pdfjs-dist/build/pdf'; // Import the PDF.js library
import 'pdfjs-dist/build/pdf.worker.entry';

import Spinner from "../components/Spinner";

export default function Home() {
	const [pdfFile, setPdfFile] = useState<File | null>(null);
	const { uploadPdf, uploading, error } = useUploadPdf();
	const { floorPlans, loading, fetchFloorPlans } = useUserFiles();
	const { deleteDocument, isDeleting, error: deleteError } = useDeleteDocument();
	const { isLoading } = useAuthRedirect();
	const [showThreeDotPopup, setShowThreeDotPopup] = useState(false);
	const [selectedFileId, setSelectedFileId] = useState(String);
	const router = useRouter();
	const [thumbnails, setThumbnails] = useState<{ [key: string]: string }>({}); // Store thumbnails

	const [openSpinner, setOpeningSpinner] = useState(false);

	const [isRenaming, setIsRenaming] = useState(false);
	const [docToRename, setDocToRename] = useState<string | null>(null);
	const [newName, setNewName] = useState('');
	const { updateFileName } = useUpdateFileName();


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

	// Upload new floor plan
	const uploadFloorplan = async (event: any) => {
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
		} else {
			alert("Please select a valid PDF file.");
		}
	};

	// Opening existing floor plans
	const openFloorplan = (pdfURL: string, documentID: string, fileName: string) => {
		setOpeningSpinner(true);
		router.push(`/editor?pdf=${encodeURIComponent(pdfURL)}&documentID=${documentID}&fileName=${encodeURIComponent(fileName)}`);
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

	const toggleStar = async (fileId: string) => {
		const updatedFile = floorPlans.find((file) => file.id === fileId);
		if (updatedFile) {
			updatedFile.isStarred = !updatedFile.isStarred; // Toggle starred status
			await updateFileStatus(fileId, { isStarred: updatedFile.isStarred }); // Update the file's status
			await fetchFloorPlans(); // Re-fetch the floor plans to update the UI
		}
	};

	// Function to update the file's status in Firebase or another database
	const updateFileStatus = async (fileId: string, updateData: { isStarred: boolean }) => {
		try {
			// Assuming you have a Firebase function to update the file metadata
			await firebase.firestore().collection('floorPlans').doc(fileId).update(updateData);
		} catch (error) {
			console.error("Error updating file status:", error);
		}
	};

	const starredFiles = floorPlans.filter(file => file.isStarred);


	return (
		<div className={styles.container}>
			{(uploading || loading || isDeleting || openSpinner) && <Spinner />}
			<>
				<aside className={styles.sidebar}>
					<img className={styles.lutronLogo} src="https://umslogin.lutron.com/Content/Dynamic/Default/Images/logo-lutron-blue.svg" alt="Lutron Logo" />
					<nav className={styles.navigation} id="navSidebar">
						<button className={`${styles.navButton} ${styles.iconButton}`}>
							<HomeIcon size={22} /> Home
						</button>
						<button className={`${styles.navButton} ${styles.iconButton}`}>
							< Users size={22} /> Shared with me
						</button>
						<button className={`${styles.navButton} ${styles.iconButton}`}>
							<Clock color="black" size={22} /> Recent
						</button>
						<button className={`${styles.navButton} ${styles.iconButton}`} onClick={() => setViewingStarred(true)}>
							<Star size={22} /> Starred
						</button>
						<button className={`${styles.navButton} ${styles.iconButton}`} onClick={() => setViewingStarred(true)}>
							<Trash2 size={22} /> Recently Deleted
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
					<div className={styles.fileList}>
						{floorPlans.map((file: FloorPlanDocument) => ( // Corrected to use 'FloorPlanDocument' from the state
							<div key={file.id} className={styles.fileItem} onMouseLeave={handleMouseLeave}>
								<div className={styles.fileItemTopRow}>
									<img
										src={thumbnails[file.id] || 'default-thumbnail.png'} // Display thumbnail or fallback
										alt="PDF Thumbnail"
										className={styles.thumbnail}
									/*
									className={styles.threeDotLogo}
									src="https://cdn.icon-icons.com/icons2/2645/PNG/512/three_dots_vertical_icon_159806.png"
									alt="three-dots-icon"
									onClick={() => handleThreeDotPopup(file.id)}
									*/
									/>
									<div className={styles.fileOptions}>
										{/* Star Button */}
										<button className={styles.starButton} onClick={() => toggleStar(file.id)}>
											<Star color={file.isStarred ? "yellow" : "grey"} />
										</button>
										<button className={styles.threeDotButton} onClick={() => handleThreeDotPopup(file.id)}>
											<img
												className={styles.threeDotLogo}
												src="https://cdn.icon-icons.com/icons2/2645/PNG/512/three_dots_vertical_icon_159806.png"
												alt="three-dots-icon"
												onClick={() => handleThreeDotPopup(file.id)}
											/>
										</button>
									</div>
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

								<p
									className={styles.fileInfo}>
									<span className={styles.fileName}>
										{file.name}
									</span>
									<br />
									{/* Display creator name in a smaller font */}
									<span className={styles.creatorInfo}>
										{file.creatorEmail || 'Unknown Creator'}
									</span>
								</p>
							</div>
						))}
					</div>
					<div className={styles.prompt}>
						Use the “New” button to upload a file
					</div>
				</main>
			</>
		</div >
	);
}	
