// hooks/useCanvas.ts
import { fabric } from 'fabric';
import { useRef } from 'react';
import { ExtendedRect, ExtendedGroup } from '../utils/fabricUtil';

export const useCanvas = () => {
  const canvasRef = useRef<fabric.Canvas | null>(null);

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

  return {
    canvasRef,
    addImageToCanvas,
    addLightIconToCanvas,
    addRectangleToCanvas,
    deleteSelectedObject,
  };
};
