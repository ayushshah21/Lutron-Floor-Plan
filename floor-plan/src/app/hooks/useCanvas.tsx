// hooks/useCanvas.ts
import { fabric } from 'fabric';
import { useRef, useState } from 'react';
import { jsPDF } from 'jspdf';
import { ExtendedGroup } from '../utils/fabricUtil';

export const useCanvas = () => {
    const canvasRef = useRef<fabric.Canvas | null>(null);
    const [zoomLevel, setZoomLevel] = useState(1); // Manages zoom level, initial zoom level set to 1 (100%)

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

    // Save function (WIP)
    // Something similar to export pdf, take the saved pdf file and 
    // update existing floor plan pdf with the new annotated one

    return {
        canvasRef,
        addImageToCanvas,
        addLightIconToCanvas,
        addRectangleToCanvas,
        deleteSelectedObject,
        zoomIn,
        zoomOut,
        exportCanvasAsPDF,
    };
};
