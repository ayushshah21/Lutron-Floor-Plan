// hooks/useDragAndDrop.tsx
import { useState } from 'react';

const useDragAndDrop = (updateFileFolder: (fileId: string, folderID: string) => Promise<void>, fetchFloorPlans: () => void) => {
  const [draggedFileId, setDraggedFileId] = useState<string | null>(null);

  const handleDragStart = (event: React.DragEvent<HTMLDivElement>, fileId: string) => {
    event.dataTransfer.setData('fileId', fileId);
    setDraggedFileId(fileId);
  };

  const handleDrop = async (event: React.DragEvent<HTMLDivElement>, folderId: string) => {
    event.preventDefault();
    const fileId = event.dataTransfer.getData('fileId');
    if (fileId) {
      await updateFileFolder(fileId, folderId);
      fetchFloorPlans();
    }
  };

  const handleDropOnBreadcrumb = async (event: React.DragEvent, targetFolderId: string) => {
    event.preventDefault();
    const fileId = event.dataTransfer.getData('fileId');
    if (fileId) {
      await updateFileFolder(fileId, targetFolderId);
      fetchFloorPlans();
    }
  };

  return { handleDragStart, handleDrop, handleDropOnBreadcrumb };
};

export default useDragAndDrop;
