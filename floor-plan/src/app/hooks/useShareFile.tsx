import { useState } from "react";
import { getFirestore, doc, updateDoc, arrayUnion } from "firebase/firestore";

const firestore = getFirestore();

// Hook that takes in email parameter
// and updates the contributors field of a floor plan to include the email
export const useShareFile = () => {
	const [updating, setUpdating] = useState(false);
	const [error, setError] = useState("");

	// Add the provided email to the list
	const addContributor = async (documentId: string, email: string) => {
		setUpdating(true);
		setError(""); // Reset the error state

		try {
			// Reference to the specific document in Firestore
			const docRef = doc(firestore, "FloorPlans", documentId);

			// Update the contributors field by adding the new email
			await updateDoc(docRef, {
				contributors: arrayUnion(email),
			});
		} catch (err) {
			console.error("Error updating contributors:", err);
			setError("Error updating contributors");
		} finally {
			setUpdating(false);
		}
	};

	return { addContributor, updating, error };
};