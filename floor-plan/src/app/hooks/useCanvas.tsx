import { fabric } from "fabric";
import { useRef, useState } from "react";
import { jsPDF } from "jspdf";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { ExtendedGroup } from "../utils/fabricUtil";
import { useUploadPdf } from "./useUploadPdf";
import { app, db, auth } from "../../../firebase";

export const useCanvas = () => {
  const canvasRef = useRef<fabric.Canvas | null>(null);
  const [zoomLevel, setZoomLevel] = useState(1);
  const { updatePdfUrl } = useUploadPdf();
  const storage = getStorage(app);

  const [isDrawing, setIsDrawing] = useState(false);
  const [isErasing, setIsErasing] = useState(false);

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
    addIconToCanvas("/sensor.jpg", x, y, isOriginal);
  };

  const addRectangleToCanvas = () => {
    const fabricCanvas = canvasRef.current;
    if (fabricCanvas) {
      const canvasCenter = fabricCanvas.getCenter();
      const rect = new fabric.Rect({
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
    addIconToCanvas("/security-camera.jpg", x, y, isOriginal);
  };

  const addWallIconToCanvas = (x: number, y: number, isOriginal = false) => {
    addIconToCanvas("/wall.png", x, y, isOriginal);
  };

  const addDoorIconToCanvas = (x: number, y: number, isOriginal = false) => {
    addIconToCanvas("/door.jpg", x, y, isOriginal);
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
  };
};