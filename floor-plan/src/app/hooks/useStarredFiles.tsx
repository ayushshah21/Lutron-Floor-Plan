import { useState } from "react";
import { getFirestore, doc, updateDoc } from "firebase/firestore";

const firestore = getFirestore();

export const useStarredFile = () => {
	const [updating, setUpdating] = useState(false);
	const [error, setError] = useState("");

	// Set starred attribute to false or true given a documentID, and a boolean
	const updateStarredFloorplan = async (documentId: string, isStarred: boolean) => {
		setUpdating(true);
		setError(""); // Reset the error state

		try {
			// Reference to the specific document in Firestore
			const docRef = doc(firestore, "FloorPlans", documentId);

			// Update the starred field 
			await updateDoc(docRef, {
				starred: isStarred,
			});
		} catch (err) {
			console.error("Error updating starred floorplan:", err);
			setError("Error updating starred floorplan");
		} finally {
			setUpdating(false);
		}
	};

	return { updateStarredFloorplan, updating, error };
};