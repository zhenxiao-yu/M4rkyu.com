import { useState, useEffect } from 'react';
import { collection, query, orderBy, onSnapshot } from 'firebase/firestore';
import { projectFirestore } from '../firebase/config';

const useFirestore = (collectionName) => {
  const [docs, setDocs] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    const collectionRef = collection(projectFirestore, collectionName);
    const q = query(collectionRef, orderBy('date', 'desc'));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const documents = snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id }));
      setDocs(documents);
    }, (err) => {
      console.error("Error fetching documents: ", err);
      setError(err.message);
    });

    return () => {
      unsubscribe();
    };
  }, [collectionName]);

  return { docs, error };
};

export default useFirestore;
