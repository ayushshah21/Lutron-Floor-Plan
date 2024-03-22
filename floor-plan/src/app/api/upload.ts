import type { NextApiRequest, NextApiResponse } from 'next';
import { getSession } from 'next-auth/react';
import { app } from '../../../firebaseConfig';
import { getFirestore, collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import formidable from 'formidable';
import * as fs from 'fs';

// Found a workaround for error I was getting: This disables the default body parser to use the 
// formidable library for file parsing for our POST requests
export const config = {
    api: {
        bodyParser: false
    },
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    const session = await getSession({ req });

    if (req.method === 'POST') {// Here we check if the request method is POST and verify user credentials if it is a post request
        if (!session || !session.user || !session.user.email) {
            return res.status(401).json({ message: 'Not authenticated' });
        }
        //Using formidable which is a node.js library for parsing an incoming file
        const form = new formidable.IncomingForm();
        form.parse(req, async (err, fields, files) => {// Parsing form data
            if (err) {
                res.status(500).json({ error: 'Error parsing the files' });
                return;
            }

            // Extracting the file from the parsed data, supporting single file upload which is what we will be uploading
            const fileArray = files.file;
            const file = Array.isArray(fileArray) ? fileArray[0] : fileArray;

            // Checking if the file exists
            if (!file) {
                return res.status(400).json({ error: 'File upload error' });
            }

            const fileName = file.originalFilename;

            // Double-checks that the file and its name exist
            if (!file || !fileName) {
                res.status(400).json({ error: 'No file uploaded' });
                return;
            }

            // Getting references to Firebase Storage and Firestore
            const storage = getStorage(app);
            const db = getFirestore(app);

            // Creating a reference in Firebase Storage for the uploaded file
            const userFileRef = ref(storage, `userFiles/${session?.user?.email}/${fileName}`);

            // Here we read the file using the 'fs' module and upload it to Firebase Storage
            await uploadBytes(userFileRef, await fs.promises.readFile(file.filepath));

            // Getting the URL for the uploaded file
            const fileURL = await getDownloadURL(userFileRef);

            // Saving the file data in Firestore
            await addDoc(collection(db, 'userFiles'), {
                userEmail: session?.user?.email,
                fileName,
                fileURL,
                uploadDate: serverTimestamp(),
            });

            // We send back a response with the file name and URL
            res.status(200).json({ fileName, fileURL });
        });
    } else {
        res.setHeader('Allow', ['POST']);
        res.status(405).end(`Method ${req.method} Not Allowed`);
    }
}
