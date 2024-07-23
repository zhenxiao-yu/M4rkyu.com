import { useState, useEffect } from 'react';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { projectStorage, projectFirestore } from '../firebase/config';

const useStorage = (file, metadata) => {
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState(null);
  const [url, setUrl] = useState(null);

  useEffect(() => {
    if (!file) return;

    const storageRef = ref(projectStorage, file.name);
    const collectionRef = collection(projectFirestore, 'images');

    const uploadTask = uploadBytesResumable(storageRef, file);

    uploadTask.on('state_changed', (snapshot) => {
      let percentage = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
      setProgress(percentage);
    }, (err) => {
      setError(err);
    }, async () => {
      const url = await getDownloadURL(uploadTask.snapshot.ref);
      const createdAt = serverTimestamp();
      await addDoc(collectionRef, { url, createdAt, ...metadata });
      setUrl(url);
    });
  }, [file, metadata]);

  return { progress, url, error };
};

export default useStorage;
