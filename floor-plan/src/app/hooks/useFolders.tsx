import { useState, useEffect } from 'react';
import { collection, addDoc, getDocs, deleteDoc, query, where, doc as firestoreDoc } from 'firebase/firestore'; 
import { auth, db } from '../../../firebase'; 
import { Folder } from '../interfaces/folders';


export const useFolders = () => {
  const [folders, setFolders] = useState<Folder[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch folders from Firestore
// Update the fetchFolders function to accept parentFolderId
const fetchFolders = async (parentFolderId: string = "4") => { // Default to "4" for "Home" folder
  setLoading(true);
  setError(null);
  try {
    const user = auth.currentUser;
    if (user) {
      // Query folders where the owner is the authenticated user and match the parent folder ID
      const q = query(
        collection(db, 'folders'),
        where('userId', '==', user.uid),
        where('parentFolderId', '==', parentFolderId)  // Filter by parent folder ID
      );
      const querySnapshot = await getDocs(q);
      const fetchedFolders: Folder[] = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      } as Folder));
      setFolders(fetchedFolders);
    }
  } catch (err) {
    console.error('Error fetching folders:', err);
    setError('Failed to fetch folders.');
  } finally {
    setLoading(false);
  }
};



  // Create a new folder in Firestore
  const createFolder = async (name: string, parentFolderId: string) => {
    const user = auth.currentUser;
    if (!user) {
      setError('User is not authenticated.');
      return;
    }

    try {
      //const maxFolderId = folders.reduce((max, folder) => Math.max(max, parseInt(folder.id, 10)), 4); // Start from 4 for 'Home'
      //const newFolderId = (maxFolderId + 1).toString(); // Increment ID by 1
  
      const newFolderId = `${Date.now()}-${user.uid}`;

      await addDoc(collection(db, 'folders'), {
        id: newFolderId,  // Set unique folder ID
        name,
        userId: user.uid,  // Associate folder with the authenticated user
        parentFolderId: parentFolderId,  // Use the correct parent folder ID
      });
      fetchFolders(); // Refresh the folders after creation
    } catch (err) {
      console.error('Error creating folder:', err);
      setError('Failed to create folder.');
    }
  };


  // Delete a folder from Firestore
  const deleteFolder = async (id: string) => {
    try {
      await deleteDoc(firestoreDoc(db, 'folders', id));
      fetchFolders(); // Refresh the folders after deletion
    } catch (err) {
      console.error('Error deleting folder:', err);
      setError('Failed to delete folder.');
    }
  };

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        fetchFolders("4"); // Default to "4" for the Home folder
      }
    });
    return () => unsubscribe();
  }, []);

  return { folders, loading, error, createFolder, deleteFolder, fetchFolders };
};

