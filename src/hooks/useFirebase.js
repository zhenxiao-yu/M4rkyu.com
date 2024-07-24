import { useState, useEffect } from 'react';
import { collection, query, orderBy, onSnapshot } from 'firebase/firestore';
import { projectFirestore } from '../firebase/config';


const useFirestore = (collectionName) => {
  const [docs, setDocs] = useState([]);

  useEffect(() => {
    const collectionRef = collection(projectFirestore, collectionName);
    const q = query(collectionRef, orderBy('date', 'asc'));

    const unsub = onSnapshot(q, (snapshot) => {
      let documents = [];
      snapshot.forEach((doc) => {
        documents.push({ ...doc.data(), id: doc.id });
      });
      setDocs(documents);
    });

    // Cleanup function to unsubscribe from the snapshot listener
    return () => unsub();
  }, [collectionName]);

  return { docs };
};

export default useFirestore;
