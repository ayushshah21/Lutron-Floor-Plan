// src/app/hooks/useFirestoreOperations.tsx
import { db } from '../../../firebase'; 
import { useState } from 'react';
import { collection, addDoc, updateDoc, doc, query, where, getDocs } from 'firebase/firestore';

export const useFirestoreOperations = () => {
  // State to handle loading or any errors could be added here
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // Function to create a new folder
  const createFolder = async (folderName: string, userId: string) => {
    setIsLoading(true);
    try {
      const folderRef = collection(db, 'Folders');
      const folderDocRef = await addDoc(folderRef, {
        name: folderName,
        creatorId: userId,
        createdAt: new Date(),
      });
      return folderDocRef;
    } catch (err) {
      setError(err as any); // Use the caught error, not the state error variable
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  // Function to assign a file to a folder
  const assignFileToFolder = async (fileId: string, folderId: string) => {
    setIsLoading(true);
    try {
      const fileRef = doc(db, 'FloorPlans', fileId);
      await updateDoc(fileRef, { folderId });
    } catch (err) {
      setError(error);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

    // Function to fetch folders
  const fetchFolders = async (userId: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const q = query(collection(db, 'Folders'), where('creatorId', '==', userId));
      const querySnapshot = await getDocs(q);
      const folders = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setIsLoading(false);
      return folders;
    } catch (err) {
      setError(err as any);
      setIsLoading(false);
      return []; // or handle the error as appropriate
    }
  };

  // Function to fetch starred files
  const fetchStarredFiles = async (userId: string) => {
    setIsLoading(true);
    try {
      const q = query(collection(db, 'FloorPlans'), where('originalCreator', '==', userId), where('isStarred', '==', true));
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (err) {
      setError(error);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  return { createFolder, assignFileToFolder, fetchStarredFiles, fetchFolders, isLoading, error };
};
