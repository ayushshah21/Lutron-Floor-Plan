"use client";
import { fabric } from "fabric";
import { useEffect, useState, useRef } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { pdfjs } from "react-pdf";
import { getDocument } from "pdfjs-dist";
import Link from 'next/link';

import "./editor.css";
import EditorToolbar from "../components/EditorToolbar";
import { ExtendedRect, ExtendedGroup } from '../utils/fabricUtil';
import { useCanvas } from "../hooks/useCanvas";
import { Search, Users, Share, UserRoundPlus, Monitor, Share2, CircleUserRound, User, Fullscreen, ZoomIn, ZoomOut, FileText, Save } from "lucide-react";
import React from "react";
import ShareButton from "../components/ShareButton";

pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.js`;

export default function Editor() {
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
	} = useCanvas();
	const [pdfUrl, setPdfUrl] = useState<string>("");
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
		}
	}, [searchParams]);

	// Renders FabricJS canvas on top of floor plan
	useEffect(() => {
		if (pdfUrl) {
			(async function renderPdf() {
				try {
					// Fetch the PDF document
					const pdf = await getDocument(pdfUrl).promise;
					const page = await pdf.getPage(1); // Get the first page
					const viewport = page.getViewport({ scale: 0.6 }); // Adjust scale as necessary

					// Create a temporary canvas to render the PDF page
					const canvasEl = document.createElement("canvas");
					const context = canvasEl.getContext("2d");
					canvasEl.width = viewport.width;
					canvasEl.height = viewport.height;

					if (!context) {
						throw new Error("Could not get 2D context from canvas");
					}

					await page.render({ canvasContext: context, viewport }).promise;

					// Create an image from the rendered canvas
					const img = new Image();
					img.src = canvasEl.toDataURL();

					// When image is loaded, set it as Fabric.js background
					img.onload = function () {
						const fabricCanvas = new fabric.Canvas("canvas", {
							width: viewport.width,
							height: viewport.height,
						});
						canvasRef.current = fabricCanvas;
						// Ensure width and height are not undefined before using
						const canvasWidth = fabricCanvas.width || 800; // Default to 800 if width is undefined
						const canvasHeight = fabricCanvas.height || 600; // Default to 600 if height is undefined

						// Set image as the background image of Fabric.js canvas
						fabricCanvas.setBackgroundImage(
							img.src,
							fabricCanvas.renderAll.bind(fabricCanvas),
							{
								originX: 'center',
								originY: 'center',
								top: canvasHeight / 2,
								left: canvasWidth / 2,
								scaleX: 1,
								scaleY: 1,
							}
						);

						// Example event: Allow cloning of original objects
						fabricCanvas.on('mouse:down', function (options) {
							if (options.target) {
								const target = options.target as ExtendedRect | ExtendedGroup;
								if (target.isOriginal) {
									const clone = fabric.util.object.clone(target);
									clone.set("top", clone.top + 5);
									clone.set("left", clone.left + 5);
									clone.isOriginal = false;
									fabricCanvas.add(clone);
								}
							}
						});

						// Make all objects on the canvas selectable and movable
						fabricCanvas.forEachObject(function (o) {
							o.selectable = true;
							o.lockMovementX = false;
							o.lockMovementY = false;
						});
					};
				} catch (error) {
					console.error("Error loading or rendering PDF:", error);
				}
			})();
		}
	}, [pdfUrl]);

	const folderPath = searchParams.get('folderPath'); // Expect a JSON string of the folder path
  
	// Parse the folder path from the URL parameter
	const pathSegments = folderPath ? JSON.parse(decodeURIComponent(folderPath)) : [{ id: "4", name: "Home" }];

	// Log the folder path to verify what we're getting
	console.log('Folder Path:', folderPath);
	console.log('Path Segments:', pathSegments);

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
