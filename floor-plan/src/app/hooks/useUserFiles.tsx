// hooks/useUserFiles.ts
import { useState, useEffect } from 'react';
import { collection, query, where, getDocs, onSnapshot } from 'firebase/firestore';
import { auth, db } from '../../../firebase'; // Adjust this path as needed
import { FloorPlanDocument } from '../interfaces/FloorPlanDocument';

// Future: instead of passing booleans for shared with me, recent, etc
// Pass in a filter string like (recent, shared, home, etc)
// based on this filter string, filter floor plans as needed
export const useUserFiles = (selectedFolder: string | null, filterByContributors: boolean) => {
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

			if (filterByContributors) {
				// Filter floor plans where the user's email is in the contributors array
				q = query(
					collection(db, 'FloorPlans'),
					where('contributors', 'array-contains', user.email)
				);
			} else {
				// Default filter by originalCreator and folderID
				q = query(
					collection(db, 'FloorPlans'),
					where('originalCreator', '==', user.uid),
					where('folderID', '==', selectedFolder || '4') // Default to folder "4" (Home)
				);
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
