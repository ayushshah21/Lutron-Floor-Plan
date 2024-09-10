import { useState, useEffect } from 'react';
import { collection, addDoc, getDocs, deleteDoc, doc } from "firebase/firestore"; 
import { Folder } from '../interfaces/folders';

export const useFolders = (userId: string) => {
    const [folders, setFolders] = useState<Folder[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
  
    const fetchFolders = async () => {
        setLoading(true);
        try {
          const querySnapshot = await getDocs(collection(db, "folders"));
          const foldersData: Folder[] = [];
          querySnapshot.forEach((doc) => {
            foldersData.push({ id: doc.id, ...doc.data() } as Folder);
          });
          setFolders(foldersData);
        } catch (err) {
          console.error("Error fetching folders: ", err);
          setError("Failed to fetch folders.");
        } finally {
          setLoading(false);
        }
      };





}
