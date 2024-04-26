import { useState } from 'react';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../../../firebase'; 


/**
 * Hook to handle the renaming of documents in Firestore.
 */
export const useUpdateFileName = () => {
    const [isUpdating, setIsUpdating] = useState(false); // State to track whether update file name is in progress
    const [error, setError] = useState<Error | null>(null); // State to store any errors that occur
  
    /**
     * Function to update the name of a document in the 'FloorPlans' collection.
     * @param {string} docId - The ID of the document to update.
     * @param {string} newName - The new name for the document.
     */
    const updateFileName = async (docId: string, newName: string) => {
        setIsUpdating(true);
        try {
        const docRef = doc(db, 'FloorPlans', docId);
        await updateDoc(docRef, { name: newName });
        } catch (err) {
        console.error("Error updating document name:", err);
        setError(err as Error);
        }
        setIsUpdating(false);
    };


    return { updateFileName, isUpdating, error };
};