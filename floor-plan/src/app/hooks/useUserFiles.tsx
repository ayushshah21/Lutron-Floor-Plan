// hooks/useUserFiles.tsx
import { useState, useEffect } from "react";
import { collection, query, where, getDocs, onSnapshot, orderBy } from "firebase/firestore";
import { auth, db } from "../../../firebase";
import { FloorPlanDocument } from '../interfaces/FloorPlanDocument';

/**
 * Hook to manage fetching user files, with added filter functionality for displaying categories.
 */
export const useUserFiles = (selectedFolder: string | null, filterCondition: string) => {
  const [floorPlans, setFloorPlans] = useState<FloorPlanDocument[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    setLoading(true);
    let q = query(
      collection(db, "floorPlans"),
      where("userId", "==", auth.currentUser?.uid)
    );

    if (filterCondition === "Starred") {
      q = query(q, where("isStarred", "==", true));
    }

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const plans: FloorPlanDocument[] = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      } as FloorPlanDocument));
      setFloorPlans(plans);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [selectedFolder, filterCondition]);

  return {
    floorPlans,
    loading,
    fetchFloorPlans: () => {},
  };
};

export default useUserFiles;
