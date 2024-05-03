// src/app/hooks/useFirestoreOperations.tsx
import { db } from '../../../firebase';
import { useState } from 'react';
import { collection, addDoc, updateDoc, doc, query, where, getDocs } from 'firebase/firestore';
import { Folder, FloorPlanDocument } from '../FloorPlanDocument';

export const useFirestoreOperations = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);



  const createFolder = async (folderName: string, parentFolderId: string, userId: string) => {
    setIsLoading(true);
    try {
      const folderRef = collection(db, 'Folders');
      const newFolder = {
        name: folderName,
        parentFolderId: parentFolderId,
        creatorId: userId,
        createdAt: new Date(),
      };
      const folderDocRef = await addDoc(folderRef, newFolder);
      return folderDocRef;
    } catch (error) {
      console.error("Failed to create a folder: ", error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchFoldersAndDocuments = async (folderId: string) => {
    setIsLoading(true);
    const folders: Folder[] = [];
    const documents: FloorPlanDocument[] = [];
    try {

      
      // Fetch sub-folders
      const folderQuery = query(collection(db, 'Folders'), where('parentFolderId', '==', folderId));
      const folderSnapshot = await getDocs(folderQuery);
      folderSnapshot.forEach(doc => {
        folders.push({ id: doc.id, ...doc.data() } as Folder);
      });

      // Fetch documents
      const documentQuery = query(collection(db, 'Documents'), where('folderId', '==', folderId));
      const documentSnapshot = await getDocs(documentQuery);
      documentSnapshot.forEach(doc => {
        documents.push({ id: doc.id, ...doc.data() } as FloorPlanDocument);
      });

      return { folders, documents };
    } catch (error) {
      console.error("Failed to fetch folders and documents: ", error);
      return { folders: [], documents: [] }; // Return empty arrays on error
    } finally {
      setIsLoading(false);
    }
  };

  return { createFolder, fetchFoldersAndDocuments, isLoading, error };
};