// hooks/useDeleteDocument.tsx
import { useState } from 'react';
import { deleteDoc, doc } from 'firebase/firestore';
import { db } from '../../../firebase'; // Adjust this path as needed

export const useDeleteDocument = () => {
  const [isDeleting, setIsDeleting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const deleteDocument = async (documentId: string) => {
    setIsDeleting(true);
    setError(null);

    try {
      const docRef = doc(db, 'FloorPlans', documentId);
      await deleteDoc(docRef);
    } catch (err) {
      setError(`Error deleting document: ${(err as Error).message}`);
    } finally {
      setIsDeleting(false);
    }
  };

  return { deleteDocument, isDeleting, error };
};
