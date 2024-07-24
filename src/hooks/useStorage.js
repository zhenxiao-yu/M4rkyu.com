import { useState, useEffect, useCallback } from 'react';
import { projectStorage, projectFirestore, timestamp } from '../firebase/config';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { collection, addDoc } from 'firebase/firestore';

const useStorage = () => {
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState(null);
  const [url, setUrl] = useState(null);

  const uploadFile = useCallback((file, metadata) => {
    return new Promise((resolve, reject) => {
      const storageRef = ref(projectStorage, file.name);
      const collectionRef = collection(projectFirestore, 'images');

      const uploadTask = uploadBytesResumable(storageRef, file);

      uploadTask.on(
        'state_changed',
        (snapshot) => {
          let percentage = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          setProgress(percentage);
        },
        (err) => {
          setError(err);
          reject(err);
        },
        async () => {
          try {
            const downloadURL = await getDownloadURL(storageRef);
            const createdAt = timestamp();
            await addDoc(collectionRef, { url: downloadURL, createdAt, ...metadata });
            setUrl(downloadURL);
            resolve(downloadURL);
          } catch (err) {
            setError(err);
            reject(err);
          }
        }
      );
    });
  }, []);

  return { progress, url, error, uploadFile };
};

export default useStorage;
