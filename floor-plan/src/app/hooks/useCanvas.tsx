import { fabric } from "fabric";
import { useRef, useState, useEffect } from "react";
import { jsPDF } from "jspdf";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { ExtendedGroup, ExtendedRect, ExtendedText, ExtendedPath } from '../utils/fabricUtil';
import { useUploadPdf } from "./useUploadPdf";
import { app, db, auth } from "../../../firebase";
import socket from "../../socket";

export const useCanvas = () => {
	const canvasRef = useRef<fabric.Canvas | null>(null);
	const [zoomLevel, setZoomLevel] = useState(1);
	const { updatePdfUrl } = useUploadPdf();
	const storage = getStorage(app);

	const [isDrawing, setIsDrawing] = useState(false);
	const [isErasing, setIsErasing] = useState(false);
	
	// Socket.io UseEffects
	useEffect(() => {
        // Check if WebSocket connection is established
        socket.on('connect', () => {
            console.log('Connected to WebSocket server with ID:', socket.id);
        });

        // Clean up the connection when the component unmounts
        return () => {
            socket.off('connect');
        };
    }, []);
	
    useEffect(() => {
        if (!canvasRef.current) {
            canvasRef.current = new fabric.Canvas('c', {
                isDrawingMode: false,
            });
        }

        if (socket) {
            socket.on('addObject', (data) => {
                const fabricCanvas = canvasRef.current;
                if (fabricCanvas) {
                    fabric.util.enlivenObjects([data], (objects: fabric.Object[]) => {
                        objects.forEach((obj) => {
                            fabricCanvas.add(obj);  // Add the object to the canvas
                            fabricCanvas.renderAll(); // Re-render the canvas
                        });
                    }, '');  // Pass an empty string for now as the reviver
                }
            });
        }
        
        return () => {
            if (socket) socket.off('addObject');
        };
    }, [socket]);

    useEffect(() => {
        if (socket) {
            socket.on('deleteObject', (data) => {
                const fabricCanvas = canvasRef.current;
                if (fabricCanvas) {
                    // Find the object with the matching custom ID and remove it
                    const objectToRemove = fabricCanvas.getObjects().find((o) => 
                        (o as ExtendedRect | ExtendedGroup | ExtendedText | ExtendedPath).customId === data.customId
                    );
    
                    if (objectToRemove) {
                        fabricCanvas.remove(objectToRemove);
                        fabricCanvas.renderAll();
                    }
                }
            });
        }
    
        return () => {
            if (socket) socket.off('deleteObject');
        };
    }, [socket]);

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
				});

				const group = new ExtendedGroup([img], {
					left: x,
					top: y,
					selectable: true,
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
		addIconToCanvas("/light-1.png", x, y, isOriginal);
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
				opacity: 0.9,
			});
			fabricCanvas.add(rect);
			fabricCanvas.setActiveObject(rect);
			fabricCanvas.renderAll();

			const serializedRect = rect.toObject();
            serializedRect.customId = rect.customId; // Include customId in the emitted object
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
		const newZoom = zoomLevel * 1.1;
		canvasRef.current?.setZoom(newZoom);
		setZoomLevel(newZoom);
	};

	const zoomOut = () => {
		const newZoom = zoomLevel * 0.9;
		canvasRef.current?.setZoom(newZoom);
		setZoomLevel(newZoom);
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

	const exportCanvasAsPDF = () => {
		const pdf = generatePdf();
		if (!pdf) return;

		const fileName = prompt(
			"Enter the file name for the exported PDF:",
			"annotated-floorplan"
		);
		pdf.save(`${fileName || "annotated-floorplan"}.pdf`);
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