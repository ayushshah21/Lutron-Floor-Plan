"use client";
import { fabric } from "fabric";
import { useEffect, useState, useRef } from "react";
import { Document, Page, pdfjs } from "react-pdf";
import * as pdfjsLib from "pdfjs-dist";
import "./editor.css";

pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.js`;

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
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const canvasRef = useRef<fabric.Canvas | null>(null);

  const handleFileChange = (event: any) => {
    if (event.target) {
      const file = event.target.files[0];
      if (file && file.type === "application/pdf") {
        setPdfFile(file);
      } else {
        alert("Please select a valid PDF file.");
      }
    }
  };

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

  const addRectangleToCanvas = (x: number, y: number, isOriginal = false) => {
    const rect = new ExtendedRect({
      left: x,
      top: y,
      fill: "red",
      width: 60,
      height: 70,
      isOriginal: isOriginal,
    });
  
    if (canvasRef.current) {
      canvasRef.current.add(rect);
    }
  };

  

  useEffect(() => {
    if (pdfFile) {
      const reader = new FileReader();
      reader.onload = async function (event) {
        if (event.target?.result) {
          const pdf = await pdfjsLib.getDocument(
            new Uint8Array(event.target.result as ArrayBuffer)
          ).promise;
          const page = await pdf.getPage(1);
          const viewport = page.getViewport({ scale: 1 });
  
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
              width: viewport.width + 500,
              height: viewport.height + 500,
            });
            canvasRef.current = fabricCanvas;
            fabricCanvas.setBackgroundImage(
              img.src,
              fabricCanvas.renderAll.bind(fabricCanvas),
              {
                width: 900,
                height: 900,
                originX: "left",
                originY: "top",
              }
            );
          
            // Add a rectangle object to the canvas initially
            addRectangleToCanvas(100, 100);
          
            // Add a light icon to the canvas initially
            addLightIconToCanvas(200, 200);
          
            fabricCanvas.on('mouse:down', function (options) {
              if (options.target) {
                const target = options.target as ExtendedRect | ExtendedGroup;
                if (target.isOriginal) {
                  const clone = fabric.util.object.clone(target);
                  clone.set("top", clone.top+5);
                  clone.set("left", clone.left+5);
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
      reader.readAsArrayBuffer(pdfFile);
    }
  }, [pdfFile]);

  return (
    <div className="container">
      <input
        className="file-input"
        type="file"
        onChange={handleFileChange}
        accept="application/pdf"
      />
      <div className="canvas-container">
        <canvas id="canvas"></canvas>
      </div>
    </div>
  );
}