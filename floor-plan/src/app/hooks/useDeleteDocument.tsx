// hooks/useDeleteDocument.tsx
import { useState } from "react";
import { deleteDoc, doc } from "firebase/firestore";
import { db } from "../../../firebase";

/**
 * Hook to manage document deletion from Firebase Firestore.
 */
const useDeleteDocument = () => {
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<null | Error>(null);

  /**
   * Function to delete a document by ID.
   * @param documentId - The ID of the document to delete.
   */
  const deleteDocument = async (documentId: string) => {
    setIsDeleting(true);
    try {
      await deleteDoc(doc(db, "floorPlans", documentId));
      setDeleteError(null);
    } catch (error) {
      setDeleteError(error as Error);
    } finally {
      setIsDeleting(false);
    }
  };

  return { deleteDocument, isDeleting, deleteError };
};

export default useDeleteDocument;
