// import { useState } from "react";
// import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";
// import {
//   getFirestore,
//   collection,
//   addDoc,
//   serverTimestamp,
// } from "firebase/firestore";
// import { User, getAuth } from "firebase/auth";

// const storage = getStorage();
// const firestore = getFirestore();


// export const useUploadPdf = () => {
//   const [uploading, setUploading] = useState(false);
//   const [error, setError] = useState("");

//   const auth = getAuth();

//   const currentUser = auth.currentUser;

//   const uploadPdf = async (pdfFile: File | null) => {
//     if (!pdfFile) {
//       setError("No PDF file selected.");
//       return;
//     }

//     setUploading(true);
//     setError("");

//     const handleUpload = async () => {
//         await uploadPdf(pdfFile);
//         if (error) {
//           alert(error);
//         } else {
//           alert("PDF uploaded successfully!");
//         }
//       };

//     try {
//       // Define the file path in Firebase Storage
//       const userId = currentUser?.uid; // Get the authenticated user's ID
//       console.log(userId);
//       const filePath = `floorplans/${userId}/${pdfFile.name}`; // Construct the file path
//       const storageRef = ref(storage, filePath);
//       const uploadResult = await uploadBytes(storageRef, pdfFile);

//       // Get the download URL of the uploaded file
//       const pdfURL = await getDownloadURL(uploadResult.ref);

//       // Save the PDF metadata in Firestore
//       await addDoc(collection(firestore, "FloorPlans"), {
//         originalCreator: currentUser?.uid, // Use user UID as the original creator
//         contributors: [currentUser?.uid], // Initially, the user is the only contributor
//         createdAt: serverTimestamp(),
//         updatedAt: serverTimestamp(),
//         pdfURL,
//       });

//       setUploading(false);
//     } catch (err) {
//       setError("Error");
//       setUploading(false);
//     }
//   };

//   return { uploadPdf, uploading, error };
// };
