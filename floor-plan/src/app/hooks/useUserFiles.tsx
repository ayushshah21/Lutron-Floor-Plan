// hooks/useUserFiles.ts
import { useState, useEffect } from 'react';
import { collection, query, where, getDocs, onSnapshot } from 'firebase/firestore';
import { auth, db } from '../../../firebase'; // Adjust this path as needed
import { FloorPlanDocument } from '../FloorPlanDocument';

// hooks/useUserFiles.ts



export const useUserFiles = () => {
  const [floorPlans, setFloorPlans] = useState<FloorPlanDocument[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchFloorPlans = async () => {
    setLoading(true);
    setError(null);
    try {
      const q = query(collection(db, 'FloorPlans'), where('originalCreator', '==', auth.currentUser?.uid));
      const querySnapshot = await getDocs(q);
      setFloorPlans(querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() as Omit<FloorPlanDocument, 'id'> })));
    } catch (error) {
      const errorMessage = (error as Error).message;  // Cast the error to the Error type to access the message property
      console.error("Failed to fetch the files: ", errorMessage);     // Now you are passing a string to setError
      alert("Failed to fetch the files: " + errorMessage);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchFloorPlans();
    const unsubscribe = auth.onAuthStateChanged(user => {
      if (user) fetchFloorPlans();
    });
    return () => unsubscribe();
  }, []);

  return { floorPlans, loading, fetchFloorPlans, error };
};

/*
export const useUserFiles = () => {
  const [floorPlans, setFloorPlans] = useState<FloorPlanDocument[]>([]);
  const [loading, setLoading] = useState(false);


  
  useEffect(() => {
      // Set up an authentication state listener
      const unsubscribe = auth.onAuthStateChanged(user => {
          if (user) {
              // Define a function to fetch floor plans when a user is authenticated
              const fetchFloorPlans = async () => {
                  setLoading(true); // Indicate loading process starts
                  try {
                      // Create a query to fetch floor plans where 'originalCreator' is the current user
                      const q = query(
                        collection(db, 'FloorPlans'), 
                        where('originalCreator', '==', user.uid));
                      const querySnapshot = await getDocs(q);

                      // Map over each document and reconstruct it into a FloorPlanDocument format
                      const fetchedFloorPlans = querySnapshot.docs.map(doc => ({
                          id: doc.id, // Ensure document ID is included
                          ...doc.data() as Omit<FloorPlanDocument, 'id'> // Spread the rest of the data
                      }));
                      setFloorPlans(fetchedFloorPlans); // Update state with fetched documents
                  } catch (error) {
                      console.error("Error fetching floor plans:", error); // Handle possible errors
                  }
                  setLoading(false); // Indicate loading process ends
              };
              fetchFloorPlans(); // Call the fetch function
          }
      });

      return () => unsubscribe();  // Clean up the listener when the component unmounts
  }, []);

  return { floorPlans, loading };
};

*/
