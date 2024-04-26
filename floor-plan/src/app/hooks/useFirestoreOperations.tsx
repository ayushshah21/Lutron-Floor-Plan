// src/app/hooks/useFirestoreOperations.tsx
import { db } from '../../../firebase'; 
import { useState } from 'react';
import { collection, addDoc, updateDoc, doc, query, where, getDocs } from 'firebase/firestore';

export const useFirestoreOperations = () => {
    // State to handle loading or any errors could be added here
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    
  
    const createFolder = async (folderName: string, userId: string) => {
        setIsLoading(true);
        setError(null);
        try {
          const folderRef = collection(db, 'Folders');
          const folderDocRef = await addDoc(folderRef, {
            name: folderName,
            creatorId: userId,
            createdAt: new Date()
          });
          setIsLoading(false);
          return folderDocRef;
        } catch (err) {
          setError(error);
          setIsLoading(false);
          throw err; // Re-throw the error to handle it in the component
        }
      };
  
      const starDocument = async (docId: string, shouldStar: boolean) => {
        setIsLoading(true);
        setError(null);
        try {
          const docRef = doc(db, 'FloorPlans', docId);
          await updateDoc(docRef, { isStarred: shouldStar });
          setIsLoading(false);
        } catch (err) {
          setError(error);
          setIsLoading(false);
          throw err;
        }
      };
  
      const fetchStarredFiles = async (userId: string) => {
        setIsLoading(true);
        setError(null);
        try {
          const q = query(collection(db, 'FloorPlans'), where('originalCreator', '==', userId), where('isStarred', '==', true));
          const querySnapshot = await getDocs(q);
          const files = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
          setIsLoading(false);
          return files;
        } catch (err) {
          setError(error);
          setIsLoading(false);
          throw err;
        }
      };
  
    // Any other Firestore operations
  
    return { createFolder, starDocument, fetchStarredFiles };
  };