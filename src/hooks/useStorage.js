import { useState, useEffect } from 'react';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { projectStorage, projectFirestore } from '../firebase/config';


const useStorage = (file) => {
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState(null);
  const [url, setUrl] = useState(null);

  useEffect(() => {
    // Create a storage reference
    const storageRef = ref(projectStorage, file.name);
    // Create a Firestore reference
    const collectionRef = collection(projectFirestore, 'images');

    // Upload the file
    const uploadTask = uploadBytesResumable(storageRef, file);

    // Monitor the upload progress
    uploadTask.on('state_changed', (snapshot) => {
      let percentage = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
      setProgress(percentage);
    }, (err) => {
      setError(err);
    }, async () => {
      // Get the download URL
      const url = await getDownloadURL(uploadTask.snapshot.ref);
      // Add the URL and timestamp to Firestore
      const createdAt = serverTimestamp();
      await addDoc(collectionRef, { url, createdAt });
      setUrl(url);
    });
  }, [file]);

  return { progress, url, error };
}

export default useStorage;
