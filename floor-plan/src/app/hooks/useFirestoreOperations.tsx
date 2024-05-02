// src/app/hooks/useFirestoreOperations.tsx
import { db } from '../../../firebase';
import { useState } from 'react';
import { collection, addDoc, updateDoc, doc, query, where, getDocs } from 'firebase/firestore';

export const useFirestoreOperations = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const createFolder = async (folderName: string, parentId: string, userId: string) => {
    setIsLoading(true);
    try {
      const folderRef = collection(db, 'Folders');
      const folderDocRef = await addDoc(folderRef, {
        name: folderName,
        parentId: parentId, // reference to the parent folder
        creatorId: userId,
        createdAt: new Date(),
      });
      return folderDocRef;
    } catch (error) {
      console.error("Failed to create a folder: ", error);
      //alert("Failed to create a folder: " + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchFolders = async (userId: string) => {
    setIsLoading(true);
    try {
      const q = query(collection(db, 'Folders'), where('creatorId', '==', userId));
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        name: doc.data().name,
        parentId: doc.data().parentId,
      }));
    } catch (error) {
      console.error("Failed to fetch folders: ", error);
      return [];
    } finally {
      setIsLoading(false);
    }
  };

  return { createFolder, fetchFolders, isLoading, error };
};
