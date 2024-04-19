import { useState } from 'react';
import { doc, deleteDoc } from 'firebase/firestore';
import { db } from '../../../firebase'; 

/**
 * Custom hook to handle the deletion of documents from Firestore.
 * Provides the function to delete a document, a flag indicating if a deletion is in progress,
 * and any errors that might have occurred during the deletion process.
 */
export const useDeleteDocument = () => {
    const [isDeleting, setIsDeleting] = useState(false); // State to track whether deletion is in progress
    const [error, setError] = useState<Error | null>(null); // State to store any errors that occur

    /**
     * Function to delete a document from the 'FloorPlans' collection in Firestore.
     * @param {string} docId - The ID of the document to delete.
     */
    const deleteDocument = async (docId: string) => {
        setIsDeleting(true); // Set deleting state to true to indicate the process has started
        try {
            const docRef = doc(db, 'FloorPlans', docId); // Get a reference to the specific document
            await deleteDoc(docRef); // Attempt to delete the document
        } catch (err) {
            console.error("Error deleting document:", err); // Log and store any errors that occur
            setError(err as Error);
        }
        setIsDeleting(false); // Reset deleting state once the deletion process is complete
    };

    return { deleteDocument, isDeleting, error }; // Return the delete function, deletion state, and error state
};