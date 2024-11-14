"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import styles from "./page.module.css";
import useAuthRedirect from "../hooks/useAuthRedirect";
import { useUploadPdf } from "../hooks/useUploadPdf";
import useStarredFiles from "../hooks/useStarredFiles";
import { useUserFiles } from "../hooks/useUserFiles";
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
import { signOutWithGoogle } from "../utils/auth";
import { useDeleteDocument } from "../hooks/useDeleteDocument";
import { Home as HomeIcon, Users, Clock, Star, Search, MoreVertical } from "react-feather";

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
  const { floorPlans, loading: loadingPlans, error: userFilesError } = useUserFiles(selectedFolder, filterCondition);
  const { handleStarred } = useStarredFiles();
  const { deleteDocument, isDeleting, error: deleteError } = useDeleteDocument();
  const { breadcrumbPath, handleBreadcrumbClick, handleDropOnBreadcrumb } = useBreadcrumbNavigation();
  const { handleDrop, handleDragOver } = useDragAndDrop();
  const { startRenaming, cancelRenaming, submitNewName, isRenaming, docToRename, newName, setNewName } = useUpdateFileName();
  const { showThreeDotPopup, setShowThreeDotPopup, handleThreeDotPopup, selectedFileId, setSelectedFileId } = useThreeDotPopup();

  const [thumbnails, setThumbnails] = useState<{ [key: string]: string }>({});
  const [openSpinner, setOpeningSpinner] = useState(false);
  const [showNewFolderInput, setShowNewFolderInput] = useState(false);
  const [showNewOptions, setShowNewOptions] = useState(false);
  const [folderName, setFolderName] = useState("");

  useEffect(() => {
    // Removed unnecessary fetchFolders() and fetchFloorPlans() calls
  }, [selectedFolder, filterCondition]);

  return (
    <div className={styles.container}>
      {(uploading || loadingFolders || isDeleting || openSpinner || loadingPlans || authLoading) && <Spinner />}
      <>
        <aside className={styles.sidebar}>
          <img
            className={styles.lutronLogo}
            src="https://umslogin.lutron.com/Content/Dynamic/Default/Images/logo-lutron-blue.svg"
            alt="Lutron Logo"
          />
          <nav className={styles.navigation} id="navSidebar">
            <button
              className={`${styles.navButton} ${styles.iconButton}`}
              onClick={() => handleClickFilterOptions("Home")}
            >
              <HomeIcon size={22} /> Home
            </button>
            <button
              className={`${styles.navButton} ${styles.iconButton}`}
              onClick={() => handleClickFilterOptions("Shared")}
            >
              <Users size={22} /> Shared with me
            </button>
            <button
              className={`${styles.navButton} ${styles.iconButton}`}
              onClick={() => handleClickFilterOptions("Recent")}
            >
              <Clock color="black" size={22} /> Recent
            </button>
            <button
              className={`${styles.navButton} ${styles.iconButton}`}
              onClick={() => handleClickFilterOptions("Starred")}
            >
              <Star size={22} /> Starred
            </button>
          </nav>
          <button className={styles.logoutButton} onClick={signOutWithGoogle}>
            Log Out
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
                    onClick={() => {
                      setSelectedFolder(folder.id);
                      handleBreadcrumbClick(folder.id, index);
                    }}
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={(e) => handleDropOnBreadcrumb(e, folder.id)}
                  >
                    {folder.name}
                  </button>
                ) : (
                  <span className={styles.breadcrumbLast}>{folder.name}</span>
                )}
                {index < folderPath.length - 1 && " / "}
              </span>
            ))}
          </div>

          {/* Search Bar */}
          <div className={styles.searchBar}>
            <Search className={styles.searchIcon} />
            <input
              type="text"
              placeholder="Search floor plans"
              className={styles.searchInput}
            />
          </div>

          {/* New Options Section */}
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
                <button
                  onClick={() => {
                    setShowNewFolderInput(!showNewFolderInput);
                    setShowNewOptions(false);
                  }}
                >
                  New Folder
                </button>
                <input
                  type="file"
                  id="fileInput"
                  style={{ display: "none" }}
                  onChange={handleFileChange}
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
                <button onClick={() => createFolder(folderName)} className={styles.button}>
                  Create Folder
                </button>
                <button onClick={() => setShowNewFolderInput(false)} className={styles.button}>
                  Cancel
                </button>
              </div>
            )}
          </div>

          {/* Folder List */}
          <div className={styles.folderList}>
            {loadingFolders ? (
              <div>Loading folders...</div>
            ) : (
              folders.map((folder) => (
                <div
                  key={folder.id}
                  className={styles.folderItem}
                  onClick={() => {
                    setSelectedFolder(folder.id);
                    setFolderPath((prev) => [...prev, { id: folder.id, name: folder.name }]);
                  }}
                  onDrop={(e) => handleDrop(e, folder.id)}
                  onDragOver={(e) => e.preventDefault()}
                >
                  {folder.name}
                  <button
                    className={styles.threeDotButton}
                    onClick={() => handleThreeDotPopup(folder.id)}
                  >
                    <MoreVertical size={20} />
                  </button>
                </div>
              ))
            )}
          </div>
          <div className={styles.prompt}>
            Use the “New” button to upload a file or folder
          </div>

          {/* File List */}
          <div className={styles.fileList}>
            {floorPlans.map((file) => (
              <div
                key={file.id}
                className={styles.fileItem}
                onDoubleClick={() => openFloorplan(file.pdfURL, file.id, file.name || "Untitled")}
                onMouseLeave={() => setShowThreeDotPopup(false)}
              >
                <Thumbnail
                  thumbnail={thumbnails[file.id] || "loading"}
                  onOpen={() => openFloorplan(file.pdfURL, file.id, file.name || "Untitled")}
                />
                <button
                  className={styles.threeDotButton}
                  onClick={() => handleThreeDotPopup(file.id)}
                >
                  <MoreVertical size={20} />
                </button>
                <div className={styles.fileName}>
                  {truncateName(file.name)}
                  <div className={styles.fileNamePopup}>{file.name}</div>
                </div>
                <div className={styles.creatorInfo}>{file.creatorEmail || "Unknown Creator"}</div>

                {/* Popup Menu */}
                {showThreeDotPopup && selectedFileId === file.id && (
                  isRenaming && docToRename === file.id ? (
                    <>
                      <input value={newName || ""} onChange={(e) => setNewName(e.target.value)} />
                      <button onClick={submitNewName}>Save</button>
                      <button onClick={cancelRenaming}>Cancel</button>
                    </>
                  ) : (
                    <div className={styles.popupMenu}>
                      <ShareButton fileId={file.id} />
                      <button onClick={() => startRenaming(file.id, file.name || "")}>Rename</button>
                      <button onClick={() => deleteDocument(file.id)}>Delete</button>
                      <button onClick={() => handleStarred(file.id, true)}>Add to Starred</button>
                      <button onClick={() => handleStarred(file.id, false)}>Remove from Starred</button>
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
