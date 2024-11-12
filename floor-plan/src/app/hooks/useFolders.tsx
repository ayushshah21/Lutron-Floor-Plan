import { useState, useEffect } from "react";
import { collection, addDoc, deleteDoc, onSnapshot, doc } from "firebase/firestore";
import { db } from "../../../firebase";

/**
 * Hook to manage folders including creation, navigation, and deletion.
 */
export const useFolders = () => {
  const [folders, setFolders] = useState<{ id: string; name: string }[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, "folders"), (snapshot) => {
      const folderData = snapshot.docs.map((doc) => {
        const data = doc.data() as { name: string }; // Explicitly cast the data
        return {
          id: doc.id,
          name: data.name, // Make sure `name` is being assigned properly
        };
      });
      setFolders(folderData);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const createFolder = async (name: string) => {
    try {
      await addDoc(collection(db, "folders"), { name });
      console.log("Folder created");
    } catch (error) {
      console.error("Error creating folder: ", error);
    }
  };

  const deleteFolder = async (id: string) => {
    try {
      const folderDocRef = doc(db, "folders", id); // Use `doc()` to get reference to the specific folder document
      await deleteDoc(folderDocRef);
      console.log("Folder deleted");
    } catch (error) {
      console.error("Error deleting folder: ", error);
    }
  };

  return {
    folders,
    loading,
    createFolder,
    deleteFolder,
    fetchFolders: () => {}, // Placeholder function (consider removing if unused)
  };
};

export default useFolders;
