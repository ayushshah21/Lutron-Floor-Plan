"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import styles from "./page.module.css";
import useAuthRedirect from "../hooks/useAuthRedirect";
import { useUploadPdf } from "../hooks/useUploadPdf";  // Changed to named import
import useStarredFiles from "../hooks/useStarredFiles";
import useUserFiles from "../hooks/useUserFiles";
import useUpdateFileName from "../hooks/useUpdateFileName";
import useFolders from "../hooks/useFolders";
import useBreadcrumbNavigation from "../hooks/useBreadcrumbNavigation";
import useThreeDotPopup from "../hooks/useThreeDotPopup";
import useDragAndDrop from "../hooks/useDragAndDrop";
import useFilterOptions from "../hooks/useFilterOptions";
import useFloorplanManager from "../hooks/useFloorplanManager";
import useFileHandler from "../hooks/useFileHandler";
import Thumbnail from "../components/Thumbnail";
import Spinner from "../components/Spinner";
import ShareButton from "../components/ShareButton";
import { truncateName } from "../utils/stringUtils";
import signOutWithGoogle from "../utils/auth";
import useDeleteDocument from "../hooks/useDeleteDocument";

export default function HomePage() {
	const router = useRouter();
	const { isLoading: authLoading } = useAuthRedirect();
	const { uploadPdf, uploading, error: uploadError } = useUploadPdf();
	const { filterCondition, handleClickFilterOptions } = useFilterOptions();
	const { file, handleFileChange } = useFileHandler();
	const { openFloorplan } = useFloorplanManager();
	const [selectedFolder, setSelectedFolder] = useState<string | null>(null);
	const [folderPath, setFolderPath] = useState<{ id: string; name: string }[]>([{ id: "4", name: "Home" }]);
	const { folders, loading: loadingFolders, createFolder, deleteFolder } = useFolders();
	const { floorPlans, loading: loadingPlans } = useUserFiles(selectedFolder, filterCondition);
	const { handleStarred } = useStarredFiles(); // Updated to use `handleStarred`
	const { deleteDocument, isDeleting, deleteError } = useDeleteDocument(); // Corrected destructuring
	const { breadcrumbPath, handleBreadcrumbClick, handleDropOnBreadcrumb } = useBreadcrumbNavigation();
	const { handleDrop, handleDragOver } = useDragAndDrop();
	const { startRenaming, cancelRenaming, submitNewName, isRenaming, docToRename, newName, setNewName } = useUpdateFileName();
	const { showThreeDotPopup, setShowThreeDotPopup, handleThreeDotPopup, selectedFileId, setSelectedFileId } = useThreeDotPopup();
  
	const [thumbnails, setThumbnails] = useState<{ [key: string]: string }>({});
	const [openSpinner, setOpeningSpinner] = useState(false);
	const [showNewFolderInput, setShowNewFolderInput] = useState(false);
  
	useEffect(() => {
	  // Removed unnecessary fetchFolders() and fetchFloorPlans() calls
	}, [selectedFolder, filterCondition]);
  
	return (
	  <div className={styles.container}>
		{authLoading || loadingFolders || loadingPlans ? (
		  <Spinner />
		) : (
		  <>
			<div className={styles.breadcrumbs}>
			  {breadcrumbPath.map((crumb, index) => (
				<button key={crumb.id} onClick={() => handleBreadcrumbClick(crumb, index)}>
				  {crumb.name}
				</button>
			  ))}
			</div>
  
			<div className={styles.thumbnails} onDragOver={handleDragOver} onDrop={handleDrop}>
			  {floorPlans.map((file) => (
				<div key={file.id} className={styles.thumbnailContainer}>
				  <Thumbnail
					thumbnail={thumbnails[file.id] || "loading"}
					onOpen={() => openFloorplan(file.id)}
				  />
				  <button
					className={styles.threeDotButton}
					onClick={() => handleThreeDotPopup(file.id)}
				  >
					<img
					  className={styles.threeDotLogo}
					  src="https://cdn.icon-icons.com/icons2/2645/PNG/512/three_dots_vertical_icon_159806.png"
					  alt="three-dots-icon"
					/>
				  </button>
				  <div className={styles.fileName}>{truncateName(file.name ?? "Unnamed File")}</div>
				  <div className={styles.creatorInfo}>{file.creatorEmail ?? "Unknown Creator"}</div>
				  {showThreeDotPopup && selectedFileId === file.id && (
					isRenaming && docToRename === file.id ? (
					  <>
						<input value={newName ?? ""} onChange={(e) => setNewName(e.target.value)} />
						<button onClick={submitNewName}>Save</button>
						<button onClick={cancelRenaming}>Cancel</button>
					  </>
					) : (
					  <div className={styles.popupMenu}>
						<ShareButton fileId={file.id} />
						<button onClick={() => startRenaming(file.id, file.name ?? "Unnamed File")}>Rename</button>
						<button onClick={() => deleteDocument(file.id)}>Delete</button>
						<button onClick={() => handleStarred(file.id, true)}>Add to Starred</button>
						<button onClick={() => handleStarred(file.id, false)}>Remove from Starred</button>
					  </div>
					)
				  )}
				</div>
			  ))}
			</div>
			{showNewFolderInput && (
			  <input
				type="text"
				value={folderPath[folderPath.length - 1]?.name ?? ""}
				onChange={(e) => setFolderPath([...folderPath, { id: "new", name: e.target.value }])}
			  />
			)}
			<button onClick={() => setShowNewFolderInput(true)}>Create New Folder</button>
			{showNewFolderInput && (
			  <button onClick={() => createFolder(folderPath[folderPath.length - 1]?.name ?? "New Folder")}>Save Folder</button>
			)}
		  </>
		)}
	  </div>
	);
  }
  