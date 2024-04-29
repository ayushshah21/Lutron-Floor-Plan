"use client";
import { fabric } from "fabric";
import { useEffect, useState, useRef } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Document, Page, pdfjs } from "react-pdf";
import * as pdfjsLib from "pdfjs-dist";
import "./editor.css";
import { useUserFiles } from "../hooks/useUserFiles";

// Needed for pdfjs to work
pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.js`;

// Consider moving these into a utils folder, better to modularize code / functions / annotations
interface IExtendedRectOptions extends fabric.IRectOptions {
  isOriginal?: boolean;
}

class ExtendedRect extends fabric.Rect {
  isOriginal?: boolean;

  constructor(options?: IExtendedRectOptions) {
    super(options);
    this.isOriginal = options?.isOriginal;
  }
}
interface IExtendedGroupOptions extends fabric.IGroupOptions {
  isOriginal?: boolean;
}

class ExtendedGroup extends fabric.Group {
  isOriginal?: boolean;

  constructor(items?: fabric.Object[], options?: IExtendedGroupOptions) {
    super(items, options);
    this.isOriginal = options?.isOriginal;
  }
}

export default function Editor() {
  // const [pdfFile, setPdfFile] = useState<File | null>(null);
  const canvasRef = useRef<fabric.Canvas | null>(null);
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

  // Function to add a light icon to the canvas at a default position
  const addLightIcon = () => {
    // You can set default positions or get them from state or props
    const defaultX = 900;
    const defaultY = 600;
    addLightIconToCanvas(defaultX, defaultY);
  };

  // Add a pink rectangle to the canvas
  const addRectangleToCanvas = () => {
    const fabricCanvas = canvasRef.current;
    if (fabricCanvas) {
      const rect = new fabric.Rect({
        left: 900, // Starting position on the canvas
        top: 600, // Starting position on the canvas
        fill: 'pink',
        width: 60,
        height: 70,
        selectable: true,
        opacity: 0.9,
      });
      fabricCanvas.add(rect);
    }
  };

  // Delete a selected object 
  const deleteSelectedObject = () => {
    const fabricCanvas = canvasRef.current;
    if (fabricCanvas) {
      const activeObject = fabricCanvas.getActiveObject();
      if (activeObject) {
        fabricCanvas.remove(activeObject);
      }
    }
  };

  // const addRectangleToCanvas = (x: number, y: number, isOriginal = false) => {
  //   const rect = new ExtendedRect({
  //     left: x,
  //     top: y,
  //     fill: "red",
  //     width: 60,
  //     height: 70,
  //     isOriginal: isOriginal,
  //   });

  //   if (canvasRef.current) {
  //     canvasRef.current.add(rect);
  //   }
  // };

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
          const viewport = page.getViewport({ scale: 0.8 });

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

  return (
    <div>
      <img className="lutronLogo" onClick={() => router.push('/home')} src="https://umslogin.lutron.com/Content/Dynamic/Default/Images/logo-lutron-blue.svg" alt="bruh" />
      <div className="container">
        <div className="canvas-container">
          <canvas id="canvas"></canvas>
        </div>
        <input
          className="file-input"
          type="file"
          onChange={handleFileChange}
          accept="application/pdf"
        />
        <button onClick={zoomIn}>Zoom In</button>
        <button onClick={zoomOut}>Zoom Out</button>
        <button onClick={addRectangleToCanvas}>Add Rectangle</button>
        <button onClick={addLightIcon}>Add Light Icon</button>  {/* Added button for adding light icon */}
        <button onClick={deleteSelectedObject}>Delete Selected Object</button>
      </div>
    </div>
  );
}
