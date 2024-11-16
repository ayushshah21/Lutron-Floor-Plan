"use client";
import { useEffect, useState, useRef } from "react";
import { useSearchParams } from "next/navigation";
import { pdfjs } from "react-pdf";
import Link from 'next/link';

import "./editor.css";
import EditorToolbar from "../components/EditorToolbar";
import { useCanvas } from "../hooks/useCanvas";
import { Fullscreen, ZoomIn, ZoomOut, FileText, Save } from "lucide-react";
import { auth } from "../../../firebase";
import React from "react";
import ShareButton from "../components/ShareButton";
import ExportPDFButton from "../components/ExportPDFButton";
import socket from "../../socket";

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
	
	const currentUser = auth.currentUser?.email;
	const [currentUsers, setCurrentUsers] = useState<string[]>([]); // State to hold current users
	const [minimized, setMinimized] = useState(false); // Track if current users box is minimized

	const toggleMinimize = () => {
		setMinimized(!minimized);
	}

	const handleFullscreen = () => {
		const container = document.querySelector('.main') as HTMLElement;
		if (!document.fullscreenElement && container) {
			container.requestFullscreen().catch((err) => {
				console.log(`Error attempting to enable fullscreen mode: ${err.message}`);
			});
		} else {
			if (document.exitFullscreen) {
				document.exitFullscreen();
			}
		}
	};

	// Keep track of the last icon position
	const [lastIconPosition, setLastIconPosition] = useState({ x: 100, y: 100 });
	const GRID_SPACING = 50; // Space between icons

	// Updated function to add icons at incremental positions
	const addIconAtDefaultPosition = (addIconFunction: (x: number, y: number) => void) => {
		// Add the icon at the current position
		addIconFunction(lastIconPosition.x, lastIconPosition.y);
		
		// Update the position for the next icon
		// Move right by GRID_SPACING, and if too far right, move down and reset x
		const newX = lastIconPosition.x + GRID_SPACING;
		const newY = newX > 800 ? lastIconPosition.y + GRID_SPACING : lastIconPosition.y;
		
		setLastIconPosition({
			x: newX > 800 ? 100 : newX, // Reset to left side if too far right
			y: newY
		});
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
		}
	}, [searchParams]);

	const folderPath = searchParams.get('folderPath'); // Expect a JSON string of the folder path
  
	// Parse the folder path from the URL parameter
	const pathSegments = folderPath ? JSON.parse(decodeURIComponent(folderPath)) : [{ id: "4", name: "Home" }];

	// Handle Socket.IO connections and events
	useEffect(() => {
		// Join the room with documentID and username
		socket.emit('joinRoom', { room_id: documentID, username: currentUser });

		// Listen for user list updates
		socket.on('userList', (users: string[]) => {
			setCurrentUsers(users);
		});

		// Cleanup on unmount
		return () => {
			socket.emit('leaveRoom', { room_id: documentID });
			socket.off('userList');
		};
	}, [documentID, currentUser]);

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
				<ExportPDFButton exportCanvasAsPDF={(fileName) => exportCanvasAsPDF(fileName)} />
				<button className="toolbar-button" onClick={() => saveFloorPlanChanges(documentID, fileName)} aria-label="Save Changes">
					<Save size={18} />
					Save Changes
				</button>
				<ShareButton fileId={documentID}/>
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

			{/* Display the list of current users */}
			<div className={`current-users ${minimized ? 'minimized' : ''}`}>
				<button onClick={toggleMinimize} className="minimize-button">
					{minimized ? '+' : '-'}
				</button>
				{!minimized && (
					<>
						<p><strong>Current users:</strong></p>
						<ul>
							{currentUsers.map((user, index) => (
								<li key={index}>{user}</li>
							))}
						</ul>
					</>
				)}
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
