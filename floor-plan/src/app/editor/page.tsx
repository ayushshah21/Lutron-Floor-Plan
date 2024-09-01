"use client";
import { fabric } from "fabric";
import { useEffect, useState, useRef } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { pdfjs } from "react-pdf";
import * as pdfjsLib from "pdfjs-dist";
import "./editor.css";
import { jsPDF } from "jspdf";

import EditorToolbar from "../components/EditorToolbar"
import { ExtendedRect, ExtendedGroup } from '../utils/fabricUtil';
import { useCanvas } from "../hooks/useCanvas";

// Needed for pdfjs to work
pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.js`;

export default function Editor() {
	// const [pdfFile, setPdfFile] = useState<File | null>(null);
	const { canvasRef, addImageToCanvas, addLightIconToCanvas, addRectangleToCanvas, deleteSelectedObject } = useCanvas();
	const [fileUrl, setFileUrl] = useState<string>("");
	const [pdfUrl, setPdfUrl] = useState<string>("");
	const fileInputRef = useRef<HTMLInputElement | null>(null);
	const searchParams = useSearchParams();
	const [zoomLevel, setZoomLevel] = useState(1); // Manages zoom level, initial zoom level set to 1 (100%)
	const router = useRouter();

	const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
		const file = event.target.files?.[0];
		if (file) {
			const url = URL.createObjectURL(file);
			setFileUrl(url);
		}
	};

	useEffect(() => {
		if (!searchParams.get('pdf')) return;
		const url = String(searchParams.get('pdf'));
		setFileUrl(url);
	}, [searchParams])

	
	// Renders FabricJS canvas on top of floor plan
	useEffect(() => {
		if (fileUrl) {
			const reader = new FileReader();
			reader.onload = async function (event) {
				if (event.target?.result) {
					const pdf = await pdfjsLib.getDocument(
						new Uint8Array(event.target.result as ArrayBuffer)
					).promise;
					const page = await pdf.getPage(1);
					const viewport = page.getViewport({ scale: 0.6 });

					const canvasEl = document.createElement("canvas");
					const context = canvasEl.getContext("2d");
					canvasEl.width = viewport.width;
					canvasEl.height = viewport.height;
					if (!context) {
						throw new Error("Could not get 2D context from canvas");
					}

					await page.render({ canvasContext: context, viewport }).promise;

					const img = new Image();
					img.src = canvasEl.toDataURL();

					img.onload = function () {
						const fabricCanvas = new fabric.Canvas("canvas", {
							width: viewport.width,
							height: viewport.height,
						});
						canvasRef.current = fabricCanvas;
						// Ensure width and height are not undefined before using
						const canvasWidth = fabricCanvas.width || 800; // Default to 800 if width is undefined
						const canvasHeight = fabricCanvas.height || 600; // Default to 600 if height is undefined

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


						fabricCanvas.on('mouse:down', function (options) {
							if (options.target) {
								const target = options.target as ExtendedRect | ExtendedGroup;
								if (target.isOriginal) {
									const clone = fabric.util.object.clone(target);
									clone.set("top", clone.top + 5);
									clone.set("left", clone.left + 5);
									clone.isOriginal = false; // Set isOriginal to false for the cloned object
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
				}
			};
			// Fetch the file and read it as an ArrayBuffer in one line
			fetch(fileUrl)
				.then(response => {
					if (!response.ok) {
						throw new Error('Network response was not ok.');
					}
					return response.blob();
				})
				.then(blob => reader.readAsArrayBuffer(blob))
				.catch(error => console.error("Failed to fetch or read file:", error));
		}
	}, [fileUrl]);

	// Zoom into the floor plan
	const zoomIn = () => {
		const newZoom = zoomLevel * 1.1; // Increase zoom by 10%
		canvasRef.current?.setZoom(newZoom);
		setZoomLevel(newZoom);
	};

	// Zoom out of the floor plan
	const zoomOut = () => {
		const newZoom = zoomLevel * 0.9; // Decrease zoom by 10%
		canvasRef.current?.setZoom(newZoom);
		setZoomLevel(newZoom);
	};

	// Export floor plan including annotations back as a pdf using jsPDF
	const exportCanvasAsPDF = () => {
		const fabricCanvas = canvasRef.current;
		if (!fabricCanvas) {
			console.error("No canvas reference");
			return;
		}

		// Set options for toDataURL
		const options = {
			format: 'png',  // Specify the format as 'png'
			quality: 1      // Optional: set the quality from 0 to 1
		};

		const imgData = fabricCanvas.toDataURL(options);

		// Check canvas dimensions are defined
		const width = fabricCanvas.width || 800; // Provide default if undefined
		const height = fabricCanvas.height || 600; // Provide default if undefined

		const pdf = new jsPDF({
			orientation: 'landscape',
			unit: 'px',
			format: [width, height]
		});

		pdf.addImage(imgData, 'PNG', 0, 0, width, height);
		pdf.save('annotated-floorplan.pdf');
	};

	return (
		<div>
			<img
				className="lutronLogo"
				onClick={() => router.push('/home')}
				src="https://umslogin.lutron.com/Content/Dynamic/Default/Images/logo-lutron-blue.svg"
				alt="Lutron Electronics Logo"
			/>

			<EditorToolbar
				exportCanvasAsPDF={exportCanvasAsPDF}
				zoomIn={zoomIn}
				zoomOut={zoomOut}
				addRectangleToCanvas={addRectangleToCanvas}
				addLightIcon={() => addLightIconToCanvas(900, 600)}
				deleteSelectedObject={deleteSelectedObject}
			/>

			<div className="container">
				<div className="canvas-container">
					<canvas id="canvas"></canvas>
				</div>
			</div>
		</div>
	);
}
