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

export default function Home() {
	const [pdfFile, setPdfFile] = useState<File | null>(null);
	const { uploadPdf, uploading, error } = useUploadPdf();
	const { floorPlans, loading, fetchFloorPlans } = useUserFiles();
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
			)
		</div>
	);
}	
