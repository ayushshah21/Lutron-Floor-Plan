//uploads pdf to firebase

import { useState } from "react";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";
import {
  getFirestore,
  collection,
  addDoc,
  serverTimestamp,
} from "firebase/firestore";
import { getAuth } from "firebase/auth";

const storage = getStorage();
const firestore = getFirestore();

export const useUploadPdf = () => {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");

  const auth = getAuth();
  const currentUser = auth.currentUser;

  // Function to extract the name of the floor plan from the PDF file name
  const extractFloorPlanName = (file: { name: any; }) => {
    if (!file) return '';
    const name = file.name;
    const floorPlanName = name.replace(/\.pdf$/i, '');
    return floorPlanName;
  };

  const uploadPdf = async (pdfFile: File | null): Promise<string | null> => {
    if (!pdfFile) {
      console.log("No file provided for upload.");
      setError("No PDF file selected.");
      return null;
    }

    setUploading(true);
    setError(""); // Reset the error state

    try {
      const userId = currentUser?.uid; // Get the authenticated user's ID
      console.log(`Uploading PDF for user: ${userId}`);
      console.log(currentUser?.email);
      const filePath = `floorplans/${userId}/${pdfFile.name}`; // Construct the file path
      const storageRef = ref(storage, filePath);

      // Upload the PDF to Firebase Storage
      const uploadResult = await uploadBytes(storageRef, pdfFile);
      console.log("Upload result:", uploadResult);

      // Get the download URL of the uploaded file
      const pdfURL = await getDownloadURL(uploadResult.ref);
      console.log("PDF URL:", pdfURL);

      // Save the PDF metadata in Firestore
      const floorPlanName = extractFloorPlanName(pdfFile); // Call the function to extract the name
      const docRef = await addDoc(collection(firestore, "FloorPlans"), {
        originalCreator: userId,
        creatorEmail: currentUser?.email,
        contributors: [userId],
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        pdfURL,
        name: floorPlanName, // Use your extract function here
      });

      
      setUploading(false);
      return pdfURL; // Return the PDF URL after successful upload
    } catch (err) {
    console.error("Error uploading PDF:", err);
      setError("Error uploading PDF");
      setUploading(false);
      return null; // Return null if there's an error
    }
  };

  return { uploadPdf, uploading, error };
};
