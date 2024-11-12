"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { auth } from "../../../firebase";
import styles from "./page.module.css";

import Spinner from "../components/Spinner";
import ShareButton from "../components/ShareButton";
import { HomeIcon, Users, Clock, Search } from "lucide-react";

// Import your custom hooks
import useAuthRedirect from "../hooks/useAuthRedirect";
import useFilterToggle from "../hooks/useFilterToggle";
import useFetchFloorPlans from "../hooks/useFetchFloorPlans";
import useGenerateThumbnails from "../hooks/useGenerateThumbnails";
import useFileUpload from "../hooks/useFileUpload";
import useDragAndDrop from "../hooks/useDragAndDrop";
import useRenameDocument from "../hooks/useRenameDocument";
import useFolders from "../hooks/useFolders";
import useUserFiles from "../hooks/useUserFiles";
import { signOutWithGoogle } from "../utils/authUtils";
import { truncateFloorPlanName } from "../utils/stringUtils";

export default function Home() {
    const [pdfFile, setPdfFile] = useState<File | null>(null);
    const [selectedFolder, setSelectedFolder] = useState<string | null>(null);
    const [folderName, setFolderName] = useState("");
    const [filterByContributors, setFilterByContributors] = useState(false);
    const [showNewOptions, setShowNewOptions] = useState(false);
    const [showNewFolderInput, setShowNewFolderInput] = useState(false);
    const [folderPath, setFolderPath] = useState<{ id: string; name: string }[]>([{ id: "4", name: "Home" }]);
    const [showThreeDotPopup, setShowThreeDotPopup] = useState(false);
    const [selectedFileId, setSelectedFileId] = useState<string | null>(null);

    const router = useRouter();
    const { isLoading } = useAuthRedirect();
    const { handleClickHome, handleClickSharedWithMe } = useFilterToggle(setFilterByContributors, setSelectedFolder);
    const { floorPlans, loading: loadingFiles, fetchFloorPlans } = useUserFiles(selectedFolder, filterByContributors);
    const { folders, loading: loadingFolders, createFolder, fetchFolders } = useFolders();
    const { uploading, handleFileChange } = useFileUpload(setPdfFile, selectedFolder, fetchFloorPlans);
    const thumbnails = useGenerateThumbnails(floorPlans);
    const { handleDrop, handleDragStart, handleDropOnBreadcrumb } = useDragAndDrop(fetchFloorPlans);
    const { isRenaming, newName, setNewName, startRenaming, cancelRenaming, submitNewName } = useRenameDocument(fetchFloorPlans);

    // Fetch floor plans when `filterByContributors` or `selectedFolder` changes
    useFetchFloorPlans(fetchFloorPlans, filterByContributors, selectedFolder);

    // Handle logout
    const handleLogout = () => signOutWithGoogle(auth);

    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        const folderParam = params.get("folder");
        const folderPathParam = params.get("folderPath");

        if (folderParam) {
            setSelectedFolder(folderParam);
            fetchFolders(folderParam);
        }

        if (folderPathParam) {
            try {
                const pathData = JSON.parse(decodeURIComponent(folderPathParam));
                setFolderPath(pathData);
            } catch (error) {
                console.error("Error parsing folder path:", error);
            }
        }
    }, [fetchFolders]);

    return (
        <div className={styles.container}>
            {(uploading || loadingFiles || isLoading) && <Spinner />}
            <aside className={styles.sidebar}>
                <img className={styles.lutronLogo} src="https://umslogin.lutron.com/Content/Dynamic/Default/Images/logo-lutron-blue.svg" alt="Lutron Logo" />
                <nav className={styles.navigation} id="navSidebar">
                    <button className={`${styles.navButton} ${styles.iconButton}`} onClick={handleClickHome}>
                        <HomeIcon size={22} /> Home
                    </button>
                    <button className={`${styles.navButton} ${styles.iconButton}`} onClick={handleClickSharedWithMe}>
                        <Users size={22} /> Shared with me
                    </button>
                    <button className={`${styles.navButton} ${styles.iconButton}`}>
                        <Clock color="black" size={22} /> Recent
                    </button>
                </nav>
                <button className={styles.logoutButton} onClick={handleLogout}>
                    Logout
                </button>
            </aside>

            <main className={styles.mainContent}>
                {/* Breadcrumb Navigation */}
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
                            {index < folderPath.length - 1 && " / "}
                        </span>
                    ))}
                </div>

                {/* New options section */}
                <div className={styles.newOptionsSection}>
                    <button className={styles.button} onClick={() => setShowNewOptions(!showNewOptions)}>
                        + New
                    </button>
                    {showNewOptions && (
                        <div className={styles.newOptionsDropdown}>
                            <button onClick={() => document.getElementById("fileInput")?.click()}>New File</button>
                            <button onClick={() => setShowNewFolderInput(!showNewFolderInput)}>New Folder</button>
                            <input type="file" id="fileInput" style={{ display: "none" }} onChange={handleFileChange} />
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
                            <button onClick={createFolder} className={styles.button}>Create Folder</button>
                        </div>
                    )}
                </div>

                {/* Folder and file lists */}
                <div className={styles.folderList}>
                    {loadingFolders ? <div>Loading folders...</div> : folders.map((folder) => (
                        <div
                            key={folder.id}
                            className={styles.folderItem}
                            onClick={() => handleFolderClick(folder.id, folder.name)}
                            onDrop={(e) => handleDrop(e, folder.id)}
                            onDragOver={(e) => e.preventDefault()}
                        >
                            {folder.name}
                        </div>
                    ))}
                </div>
                <div className={styles.fileList}>
                    {floorPlans.map((file) => (
                        <div key={file.id} className={styles.fileItem} onDoubleClick={() => openFloorplan(file.pdfURL, file.id, file.name || "Untitled")}>
                            <button className={styles.threeDotButton} onClick={() => handleThreeDotPopup(file.id)}>
                                ...
                            </button>
                            <div className={styles.fileName}>
                                {truncateFloorPlanName(file.name)}
                            </div>
                            <img src={thumbnails[file.id] || "loading"} alt="PDF Thumbnail" className={styles.thumbnail} />
                            <div className={styles.creatorInfo}>{file.creatorEmail || "Unknown Creator"}</div>
                        </div>
                    ))}
                </div>
            </main>
        </div>
    );
}
