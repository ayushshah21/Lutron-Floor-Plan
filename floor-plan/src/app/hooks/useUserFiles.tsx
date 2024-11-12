// hooks/useUserFiles.tsx
import { useState, useEffect } from 'react';
import { collection, query, where, getDocs, orderBy } from 'firebase/firestore';
import { auth, db } from '../../../firebase'; // Adjust this path as needed
import { FloorPlanDocument } from '../interfaces/FloorPlanDocument';

export const useUserFiles = (selectedFolder: string | null, filterCondition: string) => {
  const [floorPlans, setFloorPlans] = useState<FloorPlanDocument[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const fetchFloorPlans = async () => {
    setLoading(true);
    setError(null);

    try {
      const user = auth.currentUser;
      if (!user) {
        throw new Error('User not authenticated');
      }

      let q;
      switch (filterCondition) {
        case 'Shared':
          q = query(
            collection(db, 'FloorPlans'),
            where('contributors', 'array-contains', user.email)
          );
          break;
        case 'Home':
          q = query(
            collection(db, 'FloorPlans'),
            where('originalCreator', '==', user.uid),
            where('folderID', '==', selectedFolder || '4')
          );
          break;
        case 'Starred':
          q = query(
            collection(db, 'FloorPlans'),
            where('originalCreator', '==', user.uid),
            where('starred', '==', true)
          );
          break;
        case 'Recent':
          q = query(
            collection(db, 'FloorPlans'),
            where('originalCreator', '==', user.uid),
            where('folderID', '==', selectedFolder || '4'),
            orderBy('updatedAt', 'desc')
          );
          break;
        default:
          throw new Error('Invalid filter condition');
      }

      const querySnapshot = await getDocs(q);
      const filesData = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...(doc.data() as Omit<FloorPlanDocument, 'id'>),
      }));

      setFloorPlans(filesData);
    } catch (err) {
      setError(`Error fetching files: ${(err as Error).message}`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFloorPlans();
  }, [selectedFolder, filterCondition]);

  return { floorPlans, loading, error };
};
