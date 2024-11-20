// hooks/useUserFiles.ts
import { useState, useEffect } from 'react';
import { collection, query, where, getDocs, onSnapshot, orderBy } from 'firebase/firestore';
import { auth, db } from '../../../firebase'; // Adjust this path as needed
import { FloorPlanDocument } from '../interfaces/FloorPlanDocument';

export const useUserFiles = (selectedFolder: string | null, filterCondition: string) => {
	const [floorPlans, setFloorPlans] = useState<FloorPlanDocument[]>([]);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState<string | null>(null); // Allow `string` or `null`

	const fetchFloorPlans = async () => {
		setLoading(true);
		setError(null);

		try {
			// Check and retrieve user authentication
			const user = auth.currentUser;
			if (!user) {
				throw new Error('User not authenticated');
			}
			
			// Store firebase query
			let q;
			switch (filterCondition) {
				case "Shared":
					q = query(
						collection(db, 'FloorPlans'),
						where('contributors', 'array-contains', user.email)
					);
					break;
				case "Home":
					q = query(
						collection(db, 'FloorPlans'),
						where('originalCreator', '==', user.uid),
						where('folderID', '==', selectedFolder || '4')
					);
					break;
				case "Starred":
					q = query(
						collection(db, 'FloorPlans'),
						where('originalCreator', '==', user.uid),
						where('starred', '==', true)
					);
					break;
				default:
					throw new Error('Invalid filter condition');
			}

			const querySnapshot = await getDocs(q);
			setFloorPlans(querySnapshot.docs.map(doc => ({
				id: doc.id,
				...doc.data() as Omit<FloorPlanDocument, 'id'>
			})));
		} catch (error) {
			setError("Error fetching files");
		}
		setLoading(false);
	};

	useEffect(() => {
		fetchFloorPlans(); // Fetch files whenever `selectedFolder` changes
	}, [selectedFolder]);

	return { floorPlans, loading, fetchFloorPlans, error };
};
