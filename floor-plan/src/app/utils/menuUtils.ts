import { doc, updateDoc } from "firebase/firestore";
import { db } from "../../../firebase";

export const deleteItem = async (id: string, deleteDocument: (id: string) => Promise<void>) => {
    await deleteDocument(id);
};

export const moveItem = async (fileId: string, folderID: string) => {
    try {
        const fileRef = doc(db, "FloorPlans", fileId);
        await updateDoc(fileRef, { folderID });
    } catch (error) {
        console.error("Failed to move the item:", error);
        throw new Error("Failed to move the item.");
    }
};

export const renameItem = async (docId: string, newName: string) => {
    try {
        const fileRef = doc(db, "FloorPlans", docId);
        await updateDoc(fileRef, { name: newName });
    } catch (error) {
        console.error("Failed to rename the item:", error);
        throw new Error("Failed to rename the item.");
    }
};
