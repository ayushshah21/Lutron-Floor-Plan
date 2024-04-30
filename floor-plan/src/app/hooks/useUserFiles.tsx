// hooks/useUserFiles.ts

// hooks/useUserFiles.ts
import { useState, useEffect } from 'react';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { auth, db } from '../../../firebase';
import { FloorPlanDocument } from '../FloorPlanDocument';

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
    } catch (err) {
      console.error("Error fetching floor plans:", err);
      setError(err);
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
import { useState, useEffect } from 'react';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { auth, db } from '../../../firebase'; // Adjust this path as needed
import { FloorPlanDocument } from '../FloorPlanDocument';

export const useUserFiles = () => {
  const [floorPlans, setFloorPlans] = useState<FloorPlanDocument[]>([]);
  const [loading, setLoading] = useState(false);

  // Define fetchFloorPlans outside of useEffect so it can be used elsewhere
  const fetchFloorPlans = async () => {
    setLoading(true);
    try {
      const q = query(
        collection(db, 'FloorPlans'),
        where('originalCreator', '==', auth.currentUser?.uid)
      );
      const querySnapshot = await getDocs(q);
      const fetchedFloorPlans = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data() as Omit<FloorPlanDocument, 'id'>
      }));
      setFloorPlans(fetchedFloorPlans);
    } catch (error) {
      console.error("Error fetching floor plans:", error);
    }
    setLoading(false);
  };

  useEffect(() => {
    // Call fetchFloorPlans when the component mounts
    fetchFloorPlans();

    // Set up an authentication state listener
    const unsubscribe = auth.onAuthStateChanged(user => {
      if (user) {
        fetchFloorPlans();
      }
    });

    return () => unsubscribe(); // Clean up on unmount
  }, []);

  return { floorPlans, loading, fetchFloorPlans }; // Include fetchFloorPlans in the returned object
};
*/