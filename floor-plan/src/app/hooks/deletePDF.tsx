import { useState, useEffect } from 'react';
import { collection, query, where, getDocs, deleteDoc } from 'firebase/firestore';
import { auth, db } from '../../../firebase';
import { getAuth } from "firebase/auth";


export const deletePDF = () => {
    const auth = getAuth();
    const currentUser = auth.currentUser;


    async function deleteDocument() {
       
        // Define the query to get the specific document
        const q = query(collection(db, 'yourCollectionName'), where('conditionField', '==', 'value'));
   
        // Get the document based on the query
        const querySnapshot = await getDocs(q);
   
        // Iterate over each document and delete it
        querySnapshot.forEach(async (document) => {
            await deleteDoc(document.ref);
        });
    }


}
