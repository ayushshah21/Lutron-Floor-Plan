// hooks/useStarredFiles.tsx
import { useState } from "react";
import { doc, updateDoc } from "firebase/firestore";
import { db } from "../../../firebase";

/**
 * Hook to manage starring and unstarring files.
 */
export const useStarredFiles = () => {
  const [updating, setUpdating] = useState(false);

  const handleStarred = async (documentId: string, isStarred: boolean) => {
    setUpdating(true);
    try {
      const docRef = doc(db, "floorPlans", documentId);
      await updateDoc(docRef, {
        isStarred: isStarred,
      });
      console.log(`File ${isStarred ? "starred" : "unstarred"} successfully`);
    } catch (error) {
      console.error("Error updating starred status: ", error);
    } finally {
      setUpdating(false);
    }
  };

  return {
    handleStarred,
    updating,
  };
};

export default useStarredFiles;