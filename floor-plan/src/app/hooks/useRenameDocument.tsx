// hooks/useRenameDocument.tsx
import { useState } from 'react';

const useRenameDocument = (updateFileName: (docId: string, newName: string) => Promise<void>, fetchFloorPlans: () => void) => {
  const [isRenaming, setIsRenaming] = useState(false);
  const [docToRename, setDocToRename] = useState<string | null>(null);
  const [newName, setNewName] = useState('');

  const startRenaming = (docId: string, currentName = '') => {
    setIsRenaming(true);
    setDocToRename(docId);
    setNewName(currentName);
  };

  const cancelRenaming = () => {
    setIsRenaming(false);
    setDocToRename(null);
  };

  const submitNewName = async () => {
    if (docToRename && newName) {
      await updateFileName(docToRename, newName);
      setIsRenaming(false);
      setDocToRename(null);
      fetchFloorPlans();
    }
  };

  return { isRenaming, newName, setNewName, startRenaming, cancelRenaming, submitNewName };
};

export default useRenameDocument;
