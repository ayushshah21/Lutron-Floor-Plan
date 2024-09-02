import { fabric } from 'fabric';
import { useRef, useState } from 'react';
import { jsPDF } from 'jspdf';
import { ExtendedGroup } from '../utils/fabricUtil';

export const useCanvas = () => {
    const canvasRef = useRef<fabric.Canvas | null>(null);
    const [zoomLevel, setZoomLevel] = useState(1); // Manages zoom level, initial zoom level set to 1 (100%)

    // Track drawing or erasing mode
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

    const addLightIconToCanvas = (x: number, y: number, isOriginal = false) => {
        const circle = new fabric.Circle({
            radius: 20,
            fill: "yellow",
            left: x,
            top: y,
            originX: "center",
            originY: "center",
        });

        const line = new fabric.Line([x, y + 20, x, y + 40], {
            stroke: "yellow",
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
        group.isOriginal = true;

        if (canvasRef.current) {
            canvasRef.current.add(group);
        }
    };

    const addRectangleToCanvas = () => {
        const fabricCanvas = canvasRef.current;
        if (fabricCanvas) {
            const rect = new fabric.Rect({
                left: 900,
                top: 600,
                fill: 'pink',
                width: 60,
                height: 70,
                selectable: true,
                opacity: 0.9,
            });
            fabricCanvas.add(rect);
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

    // Enable free drawing mode
    const enableFreeDrawing = () => {
        const fabricCanvas = canvasRef.current;
        if (fabricCanvas) {
            fabricCanvas.isDrawingMode = true;
            fabricCanvas.freeDrawingBrush.color = 'black'; // Set drawing color
            fabricCanvas.freeDrawingBrush.width = 5; // Set drawing width
            setIsDrawing(true);
            setIsErasing(false); // Disable erasing if it was active
        }
    };

    // Disable free drawing mode
    const disableFreeDrawing = () => {
        const fabricCanvas = canvasRef.current;
        if (fabricCanvas) {
            fabricCanvas.isDrawingMode = false;
            setIsDrawing(false);
        }
    };

    // Enable eraser mode
    const enableEraser = () => {
        const fabricCanvas = canvasRef.current;
        if (fabricCanvas) {
            fabricCanvas.isDrawingMode = false; // Disable drawing mode
            setIsErasing(true);
            setIsDrawing(false);

            // Custom eraser functionality
            fabricCanvas.on('mouse:down', function (event) {
                const pointer = fabricCanvas.getPointer(event.e);
                const point = new fabric.Point(pointer.x, pointer.y); // Create a fabric.Point instance

                const objects = fabricCanvas.getObjects();

                // Loop through objects on canvas, and check if the object is a free drawing (black path)
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

    // Disable eraser mode
    const disableEraser = () => {
        const fabricCanvas = canvasRef.current;
        if (fabricCanvas) {
            fabricCanvas.isDrawingMode = false;
            setIsErasing(false);
        }
    };

    // Save function (WIP)
    // Something similar to export pdf, take the saved pdf file and 
    // update existing floor plan pdf with the new annotated one
    // Fix opening existing floor plan bug first before working on this

    return {
        canvasRef,
        addImageToCanvas,
        addLightIconToCanvas,
        addRectangleToCanvas,
        deleteSelectedObject,
        zoomIn,
        zoomOut,
        exportCanvasAsPDF,
        enableFreeDrawing,
        disableFreeDrawing,
        enableEraser,
        disableEraser,
        isDrawing,
        isErasing,
    };
};
