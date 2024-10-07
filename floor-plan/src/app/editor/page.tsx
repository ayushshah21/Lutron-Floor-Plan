"use client";
import { fabric } from "fabric";
import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { pdfjs } from "react-pdf";
import { getDocument } from "pdfjs-dist";

import "./editor.css";
import EditorToolbar from "../components/EditorToolbar";
import { ExtendedRect, ExtendedGroup } from '../utils/fabricUtil';
import { useCanvas } from "../hooks/useCanvas";
import { Search, Users, Share, UserRoundPlus, Monitor, Share2, CircleUserRound, User, Fullscreen } from "lucide-react";

import Spinner from "../components/Spinner";

pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.js`;

export default function Editor() {
	const { canvasRef, addRectangleToCanvas, addLightIconToCanvas, deleteSelectedObject, zoomIn, zoomOut, exportCanvasAsPDF, saveFloorPlanChanges, enableFreeDrawing, disableFreeDrawing, enableEraser, disableEraser, isDrawing, isErasing } = useCanvas();
	const [pdfUrl, setPdfUrl] = useState<string>("");
	const [documentID, setDocumentID] = useState<string>("");
	const [fileName, setFileName] = useState<string>("");
	const searchParams = useSearchParams();
	const [openSpinner, setOpeningSpinner] = useState(false);
	const router = useRouter();
	const [isCollaboratorsOpen, setCollaboratorsOpen] = useState(false);
	const pdfContainerRef = useRef<HTMLDivElement>(null);



	const handleShare = () => {
		const shareData = {
			title: 'Editor page',
			text: 'Check out this floor plan!',
			url: window.location.href,
		};

		if (navigator.share) {
			navigator.share(shareData)
				.then(() => console.log('Shared sucessfully'))
				.catch((error) => console.log('Error sharing', error));

		} else {
			alert('wed share API is not supported in this browser')
		}
	};

	const handleUserMenu = () => {
		console.log("User Profile clicked");
		// Logic to open user profile or user settings dropdown menu
	};


	/*
	const handlePresent = () => {
		console.log("Presenting the floor plan...");
		// Add logic to enable presentation mode
	};

	const handleViewCollaborators = () => {
		setCollaboratorsOpen(true);
	  };
	
	const handleCloseCollaborators = () => {
		setCollaboratorsOpen(false);
	  };
	*/

	const handleSearchSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		// Handle the search submission here
		console.log("Search submitted");
	};

	const handleSearchInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		// Handle the input change here
		console.log(e.target.value);
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
    // You can adjust these default coordinates as needed
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

	return (
    <div>
			<div className="toolbar">
				<button className="toolbar-button" onClick={handleShare} aria-label="Share">
					<Share2 size={24} />
					Share
				</button>
				<button className="toolbar-button" onClick={handleUserMenu} aria-label="User Profile">
					<User size={24} />
				</button>
			</div>
			<div className="search-bar-container">
				<form className="search-form" onSubmit={handleSearchSubmit}>
					<input
						type="text"
						className="search-input"
						placeholder="Search..."
						onChange={handleSearchInputChange}
					/>
					<button className="search-button">
						<Search size={17} />
					</button>
				</form>
			</div>
			<nav className="navbar">
				<img
					className="lutronLogo"
					onClick={() => router.push('/home')}
					src="https://umslogin.lutron.com/Content/Dynamic/Default/Images/logo-lutron-blue.svg"
					alt="Lutron Electronics Logo"
				/>
				<div className="navbarBrand"></div>
			</nav>
      <img
        className="lutronLogo"
        onClick={() => router.push('/home')}
        src="https://umslogin.lutron.com/Content/Dynamic/Default/Images/logo-lutron-blue.svg"
        alt="Lutron Electronics Logo"
      />

      <EditorToolbar
        exportCanvasAsPDF={exportCanvasAsPDF}
        saveFloorPlanChanges={() => saveFloorPlanChanges(documentID, fileName)}
        zoomIn={zoomIn}
        zoomOut={zoomOut}
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
      />

      <div className="container">
        <div className="canvas-container" ref={pdfContainerRef}> 
          <canvas id="canvas"></canvas>
        </div>
      </div>
			<div className="fullscreen-bar">
				<button onClick={handleFullscreen} className="fullscreen-button">
					<Fullscreen size={24}/>
				</button>
			</div>
    </div>
  );
}