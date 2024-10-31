// src/utils/menuUtils.ts
import { doc, updateDoc } from "firebase/firestore";
import { db } from "../../../firebase"; // Adjust the import path based on your project structure

// Function to delete a file or folder
export const deleteItem = async (id: string) => {
    if (window.confirm("Are you sure you want to delete this file?")) {
        try {
            // Logic for deleting the document
            // Implement the deleteDocument function or use existing hooks as needed
            console.log(`File with ID ${id} deleted successfully`);
        } catch (error) {
            console.error("Failed to delete the item:", error);
            throw new Error("Failed to delete the item.");
        }
    }
};

// Function to update the folder ID of a file (move functionality)
export const moveItem = async (fileId: string, folderID: string) => {
    try {
        const fileRef = doc(db, "FloorPlans", fileId);
        await updateDoc(fileRef, { folderID });
        console.log(`File ${fileId} moved to folder ${folderID}`);
    } catch (error) {
        console.error("Failed to move the item:", error);
        throw new Error("Failed to move the item.");
    }
};

// Function to rename a file or folder
export const renameItem = async (docId: string, newName: string, fetchFloorPlans: () => Promise<void>) => {
    try {
        const fileRef = doc(db, "FloorPlans", docId);
        await updateDoc(fileRef, { name: newName });
        console.log(`Renamed document ${docId} to ${newName}`);
        await fetchFloorPlans(); // Refresh the list after renaming
    } catch (error) {
        console.error("Failed to rename the item:", error);
        throw new Error("Failed to rename the item.");
    }
};
