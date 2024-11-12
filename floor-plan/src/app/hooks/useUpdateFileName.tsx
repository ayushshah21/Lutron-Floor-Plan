
// hooks/useUpdateFileName.tsx
import { useState } from "react";
import { doc, updateDoc } from "firebase/firestore";
import { db } from "../../../firebase";



/**
 * Hook to manage renaming files.
 */
export const useUpdateFileName = () => {
  const [isRenaming, setIsRenaming] = useState(false);
  const [docToRename, setDocToRename] = useState<string | null>(null);
  const [newName, setNewName] = useState<string>("");

  const startRenaming = (docId: string, currentName: string) => {
    setDocToRename(docId);
    setNewName(currentName);
    setIsRenaming(true);
  };

  const cancelRenaming = () => {
    setDocToRename(null);
    setNewName("");
    setIsRenaming(false);
  };

  const submitNewName = async () => {
    if (!docToRename) return;
    try {
      const docRef = doc(db, "floorPlans", docToRename);
      await updateDoc(docRef, { name: newName });
      console.log("Document renamed successfully");
    } catch (error) {
      console.error("Error renaming document: ", error);
    } finally {
      cancelRenaming();
    }
  };

  return {
    isRenaming,
    docToRename,
    newName,
    setNewName,
    startRenaming,
    cancelRenaming,
    submitNewName,
  };
};

export default useUpdateFileName;
