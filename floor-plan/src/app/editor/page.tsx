"use client";
import { useEffect, useState, useRef } from "react";
import { useSearchParams } from "next/navigation";
import { pdfjs } from "react-pdf";
import Link from 'next/link';
import { doc, getDoc } from "firebase/firestore";

import "./editor.css";
import EditorToolbar from "../components/EditorToolbar";
import { useCanvas } from "../hooks/useCanvas";
import { User, Fullscreen, ZoomIn, ZoomOut, FileText, Save } from "lucide-react";
import React from "react";
import ShareButton from "../components/ShareButton";
import { db } from "../../../firebase";

pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.js`;

export default function Editor() {
	const [pdfUrl, setPdfUrl] = useState<string>("");
	const {
		canvasRef,
		addRectangleToCanvas,
		addLightIconToCanvas,
		addFixtureIconToCanvas,
		addDeviceIconToCanvas,
		addSensorIconToCanvas,
		deleteSelectedObject,
		zoomIn,
		zoomOut,
		exportCanvasAsPDF,
		saveFloorPlanChanges,
		enableFreeDrawing,
		disableFreeDrawing,
		enableEraser,
		disableEraser,
		isDrawing,
		isErasing,
		addSecurityCameraIconToCanvas,
		addWallIconToCanvas,
		addDoorIconToCanvas,
		addRightArrowIconToCanvas,
		addTextbox
	} = useCanvas(pdfUrl);
	const [documentID, setDocumentID] = useState<string>("");
	const [fileName, setFileName] = useState<string>("");
	const searchParams = useSearchParams();
	const pdfContainerRef = useRef<HTMLDivElement>(null);

	const handleUserMenu = () => {
		console.log("User Profile clicked");
		// Logic to open user profile or user settings dropdown menu
	};
	
	const handleFullscreen = () => {
		const pdfContainer = pdfContainerRef.current;
		if (!document.fullscreenElement && pdfContainer) {
			pdfContainer.requestFullscreen().catch((err) => {
				console.log(`Error attempting to enable fullscreen mode: ${err.message}`);
			});
		} else {
			if (document.exitFullscreen) {
				document.exitFullscreen();
			}
		}
	};

	// Function to add icons at a default position
	const addIconAtDefaultPosition = (addIconFunction: (x: number, y: number) => void) => {
		const defaultX = 450;
		const defaultY = 300;
		addIconFunction(defaultX, defaultY);
	};

	// Extract pdf url from search params
	useEffect(() => {
		const searchParamPdf = searchParams.get('pdf');
		const searchParamDocId = searchParams.get('documentID');
		const originalFileName = searchParams.get('fileName');
		if (searchParamPdf && searchParamDocId && originalFileName) {
			setPdfUrl(searchParamPdf);
			setDocumentID(searchParamDocId);
			setFileName(originalFileName);

			// Load icon positions from Firestore
			loadIconPositions(searchParamDocId);
		}
	}, [searchParams]);

	const folderPath = searchParams.get('folderPath'); // Expect a JSON string of the folder path
  
	// Parse the folder path from the URL parameter
	const pathSegments = folderPath ? JSON.parse(decodeURIComponent(folderPath)) : [{ id: "4", name: "Home" }];

	// Function to load icon positions from Firestore
	const loadIconPositions = async (documentId: string) => {
		const docRef = doc(db, "floorplans", documentId);
		const docSnap = await getDoc(docRef);
		if (docSnap.exists()) {
			const data = docSnap.data();
			const iconPositions = data.iconPositions || [];
			iconPositions.forEach((icon: any) => {
				switch (icon.type) {
					case 'light':
						addLightIconToCanvas(icon.left, icon.top);
						break;
					case 'fixture':
						addFixtureIconToCanvas(icon.left, icon.top);
						break;
					case 'device':
						addDeviceIconToCanvas(icon.left, icon.top);
						break;
					case 'sensor':
						addSensorIconToCanvas(icon.left, icon.top);
						break;
					case 'securityCamera':
						addSecurityCameraIconToCanvas(icon.left, icon.top);
						break;
					case 'wall':
						addWallIconToCanvas(icon.left, icon.top);
						break;
					case 'door':
						addDoorIconToCanvas(icon.left, icon.top);
						break;
					default:
						console.log(`Unsupported icon type: ${icon.type}`);
				}
			});
		} else {
			console.log("No such document!");
		}
	};

	return (
		<div className="main">
			{/* Update the breadcrumb navigation to include folder path */}
			<div className="breadcrumbs">
				{pathSegments.map((segment: { id: string, name: string }, index: number) => (
					<React.Fragment key={segment.id}>
						<Link 
							href={`/home?folder=${segment.id}&folderPath=${encodeURIComponent(
								JSON.stringify(pathSegments.slice(0, index + 1))
							)}`}
						>
							{segment.name}
						</Link>
						{index < pathSegments.length - 1 && <span className="separator">/</span>}
					</React.Fragment>
				))}
			</div>
			
			<div className="toolbar">
				<button className="toolbar-button" onClick={exportCanvasAsPDF} aria-label="Export as PDF">
					<FileText size={18} />
					Export PDF
				</button>
				<button className="toolbar-button" onClick={() => saveFloorPlanChanges(documentID, fileName)} aria-label="Save Changes">
					<Save size={18} />
					Save Changes
				</button>
				<ShareButton fileId={documentID}/>
				<button className="toolbar-button" onClick={handleUserMenu} aria-label="User Profile">
					<User size={18} />
				</button>
			</div>
			<EditorToolbar
				addRectangleToCanvas={addRectangleToCanvas}
				addLightIcon={() => addIconAtDefaultPosition(addLightIconToCanvas)}
				addFixtureIcon={() => addIconAtDefaultPosition(addFixtureIconToCanvas)}
				addDeviceIcon={() => addIconAtDefaultPosition(addDeviceIconToCanvas)}
				addSensorIcon={() => addIconAtDefaultPosition(addSensorIconToCanvas)}
				deleteSelectedObject={deleteSelectedObject}
				enableFreeDrawing={enableFreeDrawing}
				disableFreeDrawing={disableFreeDrawing}
				enableEraser={enableEraser}
				disableEraser={disableEraser}
				isDrawing={isDrawing}
				isErasing={isErasing}
				addSecurityCameraIcon={() => addIconAtDefaultPosition(addSecurityCameraIconToCanvas)}
				addWallIcon={() => addIconAtDefaultPosition(addWallIconToCanvas)}
				addDoorIcon={() => addIconAtDefaultPosition(addDoorIconToCanvas)}
				addRightArrowIcon={() => addIconAtDefaultPosition(addRightArrowIconToCanvas)}
				addTextbox={addTextbox}
			/>

			<div className="container">
				<div className="canvas-container">
					<canvas id="canvas"></canvas>
				</div>
			</div>
			<div className="bottom-right-controls">
				<button onClick={zoomIn} className="control-button" aria-label="Zoom In">
					<ZoomIn size={24}/>
				</button>
				<button onClick={zoomOut} className="control-button" aria-label="Zoom Out">
					<ZoomOut size={24}/>
				</button>
				<button onClick={handleFullscreen} className="control-button" aria-label="Toggle Fullscreen">
					<Fullscreen size={24}/>
				</button>
			</div>
		</div>
	);
}
