// hooks/useDragAndDrop.tsx
import { useState } from "react";

/**
 * Hook to manage drag-and-drop events for files and folders.
 */
export const useDragAndDrop = () => {
  const [isDragging, setIsDragging] = useState<boolean>(false);

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    // Handle dropped item logic here
    const droppedItem = e.dataTransfer.getData("text");
    console.log(`Dropped item: ${droppedItem}`);
  };

  return {
    isDragging,
    handleDragOver,
    handleDrop,
  };
};

export default useDragAndDrop;
