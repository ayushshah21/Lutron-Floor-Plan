import { fabric } from "fabric";
import { useRef, useState, useEffect } from "react";
import { jsPDF } from "jspdf";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { ExtendedGroup, ExtendedRect, ExtendedText, ExtendedPath } from '../utils/fabricUtil';
import { useUploadPdf } from "./useUploadPdf";
import { app, db, auth } from "../../../firebase";
import socket from "../../socket";
import { getDocument } from "pdfjs-dist";

export const useCanvas = (pdfUrl: string) => {
	const canvasRef = useRef<fabric.Canvas | null>(null);
	const [zoomLevel, setZoomLevel] = useState(1);
	const { updatePdfUrl } = useUploadPdf();
	const storage = getStorage(app);

	const [isDrawing, setIsDrawing] = useState(false);
	const [isErasing, setIsErasing] = useState(false);

	// Canvas initalization
	useEffect(() => {
        let cleanup: (() => void) | undefined;

        if (pdfUrl && !canvasRef.current) {
            (async function initializeCanvas() {
                try {
                    // Fetch the PDF document
                    const pdf = await getDocument(pdfUrl).promise;
                    const page = await pdf.getPage(1);
                    const viewport = page.getViewport({ scale: 0.6 });

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

                    img.onload = function () {
                        const fabricCanvas = new fabric.Canvas("canvas", {
                            width: viewport.width,
                            height: viewport.height,
                            isDrawingMode: false,
                            selection: true,
                        });

                        canvasRef.current = fabricCanvas;

                        // Set image as the background image of Fabric.js canvas
                        fabricCanvas.setBackgroundImage(
                            img.src,
                            fabricCanvas.renderAll.bind(fabricCanvas),
                            {
                                originX: 'center',
                                originY: 'center',
                                top: (fabricCanvas.height || 600) / 2,
                                left: (fabricCanvas.width || 800) / 2,
                                scaleX: 1,
                                scaleY: 1,
                            }
                        );

                        // Attach event listeners and capture the cleanup function
                        cleanup = attachEventListeners(fabricCanvas);
                    };
                } catch (error) {
                    console.error("Error loading or rendering PDF:", error);
                }
            })();
        }

        // Cleanup function to run when the component unmounts
        return () => {
            if (cleanup) cleanup();
        };
    }, [pdfUrl]);
	
	// Socket.io
	const attachEventListeners = (fabricCanvas: fabric.Canvas) => {
		const handleObjectModified = (event: fabric.IEvent) => {
			const target = event.target as ExtendedGroup | ExtendedRect | ExtendedText | ExtendedPath;
			if (target && target.customId) {
				const center = target.getCenterPoint();
				const { scaleX, scaleY, angle, customId } = target;
		
				const data = {
					customId,
					left: center.x,
					top: center.y,
					scaleX,
					scaleY,
					angle,
				};
		
				socket.emit('updateObject', data);
			}
		};

    	fabricCanvas.on('object:modified', handleObjectModified);

        // Socket.io event listeners for real-time collaboration
        if (socket) {
            // Listen for 'addObject' event from the server
            socket.on('addObject', (data) => {
                fabric.util.enlivenObjects([data], (objects: fabric.Object[]) => {
                    objects.forEach((obj) => {
                        fabricCanvas.add(obj);
                        fabricCanvas.renderAll();
                    });
                }, '');
            });

            // Listen for 'deleteObject' event from the server
            socket.on('deleteObject', (data) => {
                const objectToRemove = fabricCanvas.getObjects().find((o) =>
                    (o as ExtendedRect | ExtendedGroup | ExtendedText | ExtendedPath).customId === data.customId
                );
                if (objectToRemove) {
                    fabricCanvas.remove(objectToRemove);
                    fabricCanvas.renderAll();
                }
            });

            socket.on('updateObject', (data) => {
				const objectToUpdate = fabricCanvas.getObjects().find((o) =>
					(o as ExtendedRect | ExtendedGroup | ExtendedText | ExtendedPath).customId === data.customId
				);
				if (objectToUpdate) {
					objectToUpdate.set({
						left: data.left,
						top: data.top,
						scaleX: data.scaleX,
						scaleY: data.scaleY,
						angle: data.angle,
						originX: 'center',
						originY: 'center',
					});
					objectToUpdate.setCoords();
					fabricCanvas.renderAll();
				}
			});
        }

        // Clean up function to remove event listeners when the component unmounts
        const cleanup = () => {
            fabricCanvas.off('object:modified', handleObjectModified);

            if (socket) {
                socket.off('addObject');
                socket.off('deleteObject');
                socket.off('updateObject');
            }
        };

        return cleanup;
    };

	const addIconToCanvas = (
		iconPath: string,
		x: number,
		y: number,
		isOriginal = false
	) => {
		fabric.Image.fromURL(iconPath, (img) => {
			if (img) {
				img.scaleToWidth(40); // Set the width to 50 pixels, adjust as needed
				img.set({
					left: x,
					top: y,
					originX: "center",
					originY: "center",
					selectable: true,
            		lockMovementX: false,
            		lockMovementY: false,
					evented: true, // Ensures the object can trigger events
				});

				const group = new ExtendedGroup([img], {
					left: x,
					top: y,
					originX: "center",
					originY: "center",
					selectable: true,
					lockMovementX: false,
					lockMovementY: false,
					evented: true, // Ensures the object can trigger events
					isOriginal: isOriginal,
				});

				if (canvasRef.current) {
					canvasRef.current.add(group);
					canvasRef.current.setActiveObject(group);
					canvasRef.current.renderAll();
					
					// Emit object to socket io server for multi-collaboration
					const serializedGroup = group.toObject();
					serializedGroup.customId = group.customId;
					socket.emit('addObject', serializedGroup);
				}
			}
		});
	};

	const addLightIconToCanvas = (x: number, y: number, isOriginal = false) => {
		addIconToCanvas("/light.png", x, y, isOriginal);
	};

	const addFixtureIconToCanvas = (x: number, y: number, isOriginal = false) => {
		addIconToCanvas("/fixture.png", x, y, isOriginal);
	};

	const addDeviceIconToCanvas = (x: number, y: number, isOriginal = false) => {
		addIconToCanvas("/device.png", x, y, isOriginal);
	};

	const addSensorIconToCanvas = (x: number, y: number, isOriginal = false) => {
		addIconToCanvas("/sensor.png", x, y, isOriginal);
	};

	const addRectangleToCanvas = () => {
		const fabricCanvas = canvasRef.current;
		if (fabricCanvas) {
			const canvasCenter = fabricCanvas.getCenter();
			const rect = new ExtendedRect({
				left: canvasCenter.left,
				top: canvasCenter.top,
				fill: "rgba(255, 99, 71, 0.5)",
				width: 50,
				height: 60,
				originX: "center",
				originY: "center",
				selectable: true,
				lockMovementX: false,
            	lockMovementY: false,
				evented: true, // Ensures the object can trigger events
				opacity: 0.9,
			});
			fabricCanvas.add(rect);
			fabricCanvas.setActiveObject(rect);
			fabricCanvas.renderAll();

			const serializedRect = rect.toObject();
			serializedRect.customId = rect.customId;
			socket.emit('addObject', serializedRect);
		}
	};

	const deleteSelectedObject = () => {
        const fabricCanvas = canvasRef.current;
        if (fabricCanvas) {
            const activeObject = fabricCanvas.getActiveObject();
            if (activeObject) {
                const customId = (activeObject as ExtendedRect | ExtendedGroup).customId; // Access customId
                fabricCanvas.remove(activeObject);
    
                // Emit the deleteObject event to the server
                socket.emit('deleteObject', { customId });
            }
        }
    };

	const zoomIn = () => {
		const canvas = canvasRef.current;
		if (!canvas) return;

		// Get the center point of the canvas viewport
		const centerPoint = new fabric.Point(
			canvas.getWidth() / 2,
			canvas.getHeight() / 2
		);

		// Calculate new zoom level
		const newZoom = canvas.getZoom() * 1.1;

		// Zoom to point (center)
		canvas.zoomToPoint(centerPoint, newZoom);
		canvas.requestRenderAll();
	};

	const zoomOut = () => {
		const canvas = canvasRef.current;
		if (!canvas) return;

		// Get the center point of the canvas viewport
		const centerPoint = new fabric.Point(
			canvas.getWidth() / 2,
			canvas.getHeight() / 2
		);

		// Calculate new zoom level
		const newZoom = canvas.getZoom() / 1.1;

		// Zoom to point (center)
		canvas.zoomToPoint(centerPoint, newZoom);
		canvas.requestRenderAll();
	};

	const generatePdf = () => {
		const fabricCanvas = canvasRef.current;
		if (!fabricCanvas) {
			console.error("No canvas reference");
			return null;
		}

		const options = {
			format: "png",
			quality: 1,
		};

		const imgData = fabricCanvas.toDataURL(options);

		const width = fabricCanvas.width || 800;
		const height = fabricCanvas.height || 600;

		const pdf = new jsPDF({
			orientation: "landscape",
			unit: "px",
			format: [width, height],
		});

		pdf.addImage(imgData, "PNG", 0, 0, width, height);

		return pdf;
	};

	const exportCanvasAsPDF = (fileName: string) => {
		const pdf = generatePdf();
		if (!pdf) return;
		pdf.save(fileName);
	};

	const saveFloorPlanChanges = async (
		documentId: string,
		originalFileName: string
	) => {
		const pdf = generatePdf();
		if (pdf) {
			const pdfBlob = pdf.output("blob");
			const storageRef = ref(
				storage,
				`floorplans/${documentId}/${originalFileName}`
			);

			try {
				const uploadResult = await uploadBytes(storageRef, pdfBlob);
				const downloadURL = await getDownloadURL(uploadResult.ref);
				await updatePdfUrl(documentId, downloadURL);
				alert("Changes successfully saved");
			} catch (err) {
				console.error("Error uploading PDF to Firebase Storage:", err);
			}
		} else {
			console.error("Failed to generate PDF");
		}
	};

	const enableFreeDrawing = () => {
		const fabricCanvas = canvasRef.current;
		if (fabricCanvas) {
			fabricCanvas.isDrawingMode = true;
			fabricCanvas.freeDrawingBrush.color = "black";
			fabricCanvas.freeDrawingBrush.width = 5;
			setIsDrawing(true);
			setIsErasing(false);

			// Listen for path creation and emit each new path
			fabricCanvas.on('path:created', (event: fabric.IEvent & { path?: fabric.Path }) => {
				const path = event.path as ExtendedPath; 
				const serializedPath = path.toObject();
				serializedPath.customId = path.customId; 
				socket.emit('addObject', serializedPath);
			});
		}
	};

	const disableFreeDrawing = () => {
		const fabricCanvas = canvasRef.current;
		if (fabricCanvas) {
			fabricCanvas.isDrawingMode = false;
			setIsDrawing(false);
		}
	};

	const enableEraser = () => {
		const fabricCanvas = canvasRef.current;
		if (fabricCanvas) {
			fabricCanvas.isDrawingMode = false;
			setIsErasing(true);
			setIsDrawing(false);

			fabricCanvas.on("mouse:down", function (event) {
				const pointer = fabricCanvas.getPointer(event.e);
				const point = new fabric.Point(pointer.x, pointer.y);

				const objects = fabricCanvas.getObjects();

				for (let i = 0; i < objects.length; i++) {
					const object = objects[i];
					if (object.type === "path" && object.stroke === "black") {
						if (object.containsPoint(point)) {
							fabricCanvas.remove(object);
						}
					}
				}
			});
		}
	};

	const disableEraser = () => {
		const fabricCanvas = canvasRef.current;
		if (fabricCanvas) {
			fabricCanvas.isDrawingMode = false;
			setIsErasing(false);
		}
	};

	const addSecurityCameraIconToCanvas = (x: number, y: number, isOriginal = false) => {
		addIconToCanvas("/security-camera.png", x, y, isOriginal);
	};

	const addWallIconToCanvas = (x: number, y: number, isOriginal = false) => {
		addIconToCanvas("/wall.png", x, y, isOriginal);
	};

	const addDoorIconToCanvas = (x: number, y: number, isOriginal = false) => {
		addIconToCanvas("/door.png", x, y, isOriginal);
	};

	const addRightArrowIconToCanvas = (x: number, y: number, isOriginal = false) => {
		addIconToCanvas("/right-arrow.png", x, y, isOriginal);
	};
	
	const addTextbox = () => {
		const fabricCanvas = canvasRef.current;
		if (fabricCanvas) {
			const canvasCenter = fabricCanvas.getCenter();
			const text = new ExtendedText('Edit this text', {
				left: canvasCenter.left,
				top: canvasCenter.top,
				fontFamily: 'Arial',
				fill: '#000000',
				fontSize: 20,
				originX: 'center',
				originY: 'center',
				selectable: true,
			});
			
			fabricCanvas.add(text);
			fabricCanvas.setActiveObject(text);
			fabricCanvas.renderAll();
	
			// Emit object to socket io server for multi-collaboration
			const serializedText = text.toObject();
			serializedText.customId = text.customId;  
			socket.emit('addObject', serializedText);
		}
	};
	
	return {
		canvasRef,
		addLightIconToCanvas,
		addFixtureIconToCanvas,
		addDeviceIconToCanvas,
		addSensorIconToCanvas,
		addRectangleToCanvas,
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
		addTextbox,
	};
};