//loads in the user's files

// hooks/useUserFiles.ts
import { useState, useEffect } from 'react';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { auth, db } from '../../../firebase'; // Adjust this path as needed
import { FloorPlanDocument } from '../FloorPlanDocument'; 
//import { db } from '../../../firebase'; // Make sure the path is correct

export const useUserFiles = () => {
    const [floorPlans, setFloorPlans] = useState<FloorPlanDocument[]>([]);
    const [loading, setLoading] = useState(false);
  

useEffect(() => {
    const fetchFloorPlans = async () => {
      if (auth.currentUser) {
        setLoading(true);
        try {
          const q = query(
            collection(db, 'FloorPlans'),
            where('originalCreator', '==', auth.currentUser.uid)
          );
          const querySnapshot = await getDocs(q);
          const fetchedFloorPlans: FloorPlanDocument[] = querySnapshot.docs.map(doc => {
            // Make sure you're not overwriting the id property
            const data = doc.data() as Omit<FloorPlanDocument, 'id'>;
            return {
              id: doc.id, // Correctly set the id property from the doc ref
              ...data, // Spread the Firestore document data
            };
          });        

          setFloorPlans(fetchedFloorPlans); // Update state with the fetched documents
        } catch (error) {
          console.error("Error fetching floor plans:", error);
          // Handle errors appropriately
        }
        setLoading(false);
      }
    };

    fetchFloorPlans();
  }, []);

  return { floorPlans, loading };
};
  
  /**
  useEffect(() => {
    const fetchFiles = async () => {
      if (auth.currentUser) {
        const filesQuery = query(
          collection(db, 'FloorPlans'),
          where('originalCreator', '==', auth.currentUser.uid)
        );
        const querySnapshot = await getDocs(filesQuery);
        const filesData: FileData[] = querySnapshot.docs.map(doc => ({
            id: doc.id,
          ...doc.data() as FileData,
        }));
        setFiles(filesData);
      }
      setLoading(false);
    };

    fetchFiles();
  }, []);
*/

