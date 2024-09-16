import { fabric } from 'fabric';
import { useRef, useState } from 'react';
import { jsPDF } from 'jspdf';
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { ExtendedGroup } from '../utils/fabricUtil';
import { useUploadPdf } from './useUploadPdf';
import { app, db, auth } from "../../../firebase"; 

export const useCanvas = () => {
    const canvasRef = useRef<fabric.Canvas | null>(null);
    const [zoomLevel, setZoomLevel] = useState(1);
    const { updatePdfUrl } = useUploadPdf();
    const storage = getStorage(app);

    const [isDrawing, setIsDrawing] = useState(false);
    const [isErasing, setIsErasing] = useState(false);

    const addImageToCanvas = (imageUrl: string, x: number, y: number) => {
        fabric.Image.fromURL(imageUrl, function (img) {
            if (img) {
                img.set({
                    left: x,
                    top: y,
                    scaleX: 0.5,
                    scaleY: 0.5,
                    selectable: true,
                });
                if (canvasRef.current) {
                    canvasRef.current.add(img);
                }
            }
        });
    };

    const addRectangleToCanvas = () => {
        const fabricCanvas = canvasRef.current;
        if (fabricCanvas) {
            const canvasCenter = fabricCanvas.getCenter();
            const rect = new fabric.Rect({
                left: canvasCenter.left,
                top: canvasCenter.top,
                fill: 'rgba(255, 99, 71, 0.5)', // Semi-transparent tomato color
                width: 60,
                height: 70,
                originX: 'center',
                originY: 'center',
                selectable: true,
                opacity: 0.9,
            });
            fabricCanvas.add(rect);
            fabricCanvas.setActiveObject(rect);
            fabricCanvas.renderAll();
        }
    };

    const addLightIconToCanvas = (x: number, y: number, isOriginal = false) => {
        const circle = new fabric.Circle({
            radius: 20,
            fill: "#FFA500", // Accessible orange color
            left: x,
            top: y,
            originX: "center",
            originY: "center",
        });

        const line = new fabric.Line([x, y + 20, x, y + 40], {
            stroke: "#FFA500", // Matching orange color for the line
            strokeWidth: 5,
            originX: "center",
            originY: "center",
        });

        const group = new ExtendedGroup([circle, line], {
            left: x,
            top: y,
            selectable: true,
            isOriginal: isOriginal,
        });

        if (canvasRef.current) {
            canvasRef.current.add(group);
            canvasRef.current.setActiveObject(group);
            canvasRef.current.renderAll();
        }
    };

    const addFixtureIconToCanvas = (x: number, y: number, isOriginal = false) => {
        const square = new fabric.Rect({
            width: 40,
            height: 40,
            fill: "blue",
            left: x,
            top: y,
            originX: "center",
            originY: "center",
        });

        const circle = new fabric.Circle({
            radius: 10,
            fill: "white",
            left: x,
            top: y,
            originX: "center",
            originY: "center",
        });

        const group = new ExtendedGroup([square, circle], {
            left: x,
            top: y,
            selectable: true,
            isOriginal: isOriginal,
        });

        if (canvasRef.current) {
            canvasRef.current.add(group);
        }
    };

    const addDeviceIconToCanvas = (x: number, y: number, isOriginal = false) => {
        const rect = new fabric.Rect({
            width: 30,
            height: 50,
            fill: "green",
            left: x,
            top: y,
            rx: 5,
            ry: 5,
            originX: "center",
            originY: "center",
        });

        const screen = new fabric.Rect({
            width: 20,
            height: 30,
            fill: "lightgreen",
            left: x,
            top: y - 5,
            originX: "center",
            originY: "center",
        });

        const button = new fabric.Circle({
            radius: 5,
            fill: "white",
            left: x,
            top: y + 20,
            originX: "center",
            originY: "center",
        });

        const group = new ExtendedGroup([rect, screen, button], {
            left: x,
            top: y,
            selectable: true,
            isOriginal: isOriginal,
        });

        if (canvasRef.current) {
            canvasRef.current.add(group);
        }
    };

    const addSensorIconToCanvas = (x: number, y: number, isOriginal = false) => {
        const circle = new fabric.Circle({
            radius: 20,
            fill: "red",
            left: x,
            top: y,
            originX: "center",
            originY: "center",
        });

        const wave1 = new fabric.Path('M -15 0 Q 0 -20 15 0', {
            fill: '',
            stroke: 'white',
            strokeWidth: 2,
            left: x,
            top: y,
            originX: "center",
            originY: "center",
        });

        const wave2 = new fabric.Path('M -10 -5 Q 0 -15 10 -5', {
            fill: '',
            stroke: 'white',
            strokeWidth: 2,
            left: x,
            top: y,
            originX: "center",
            originY: "center",
        });

        const group = new ExtendedGroup([circle, wave1, wave2], {
            left: x,
            top: y,
            selectable: true,
            isOriginal: isOriginal,
        });

        if (canvasRef.current) {
            canvasRef.current.add(group);
        }
    };

    const deleteSelectedObject = () => {
        const fabricCanvas = canvasRef.current;
        if (fabricCanvas) {
            const activeObject = fabricCanvas.getActiveObject();
            if (activeObject) {
                fabricCanvas.remove(activeObject);
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
            format: 'png',
            quality: 1
        };

        const imgData = fabricCanvas.toDataURL(options);

        const width = fabricCanvas.width || 800;
        const height = fabricCanvas.height || 600;

        const pdf = new jsPDF({
            orientation: 'landscape',
            unit: 'px',
            format: [width, height]
        });

        pdf.addImage(imgData, 'PNG', 0, 0, width, height);

        return pdf;
    };

    const exportCanvasAsPDF = () => {
        const pdf = generatePdf();
        if (!pdf) return;

        const fileName = prompt('Enter the file name for the exported PDF:', 'annotated-floorplan');
        pdf.save(`${fileName || 'annotated-floorplan'}.pdf`);
    };

    const saveFloorPlanChanges = async (documentId: string, originalFileName: string) => {
        const pdf = generatePdf();
        if (pdf) {
            const pdfBlob = pdf.output('blob');
            const storageRef = ref(storage, `floorplans/${documentId}/${originalFileName}`);

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
    }

    const enableFreeDrawing = () => {
        const fabricCanvas = canvasRef.current;
        if (fabricCanvas) {
            fabricCanvas.isDrawingMode = true;
            fabricCanvas.freeDrawingBrush.color = 'black';
            fabricCanvas.freeDrawingBrush.width = 5;
            setIsDrawing(true);
            setIsErasing(false);
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

            fabricCanvas.on('mouse:down', function (event) {
                const pointer = fabricCanvas.getPointer(event.e);
                const point = new fabric.Point(pointer.x, pointer.y);

                const objects = fabricCanvas.getObjects();

                for (let i = 0; i < objects.length; i++) {
                    const object = objects[i];
                    if (object.type === 'path' && object.stroke === 'black') {
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

    return {
        canvasRef,
        addImageToCanvas,
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
    };
};