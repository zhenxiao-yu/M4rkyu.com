import { useState, useEffect } from 'react';
import { collection, query, orderBy, onSnapshot } from 'firebase/firestore';
import { projectFirestore } from '../firebase/config';

/**
 * Shared hook for listening to a Firestore collection of gallery images.
 * Images are always ordered by section then by the custom `order` field,
 * falling back to `createdAt` for deterministic ordering when order is missing.
 */
const useFirestore = (collectionName, { section } = {}) => {
  const [docs, setDocs] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    const collectionRef = collection(projectFirestore, collectionName);
    const constraints = [
      orderBy('section', 'asc'),
      orderBy('order', 'asc'),
      orderBy('createdAt', 'desc'),
    ];
    const q = query(collectionRef, ...constraints);

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const documents = snapshot.docs
          .map((doc) => ({
            id: doc.id,
            ...doc.data(),
            imageUrl: doc.data().imageUrl || doc.data().url, // backward compatibility
          }))
          .filter((doc) => (section ? doc.section === section : true));
        setDocs(documents);
      },
      (err) => {
        console.error('Error fetching documents: ', err);
        setError(err.message);
      }
    );

    return () => {
      unsubscribe();
    };
  }, [collectionName, section]);

  return { docs, error };
};

export default useFirestore;
