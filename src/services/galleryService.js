import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDocs,
  orderBy,
  query,
  serverTimestamp,
  updateDoc,
  where,
  writeBatch,
} from 'firebase/firestore';
import { projectFirestore } from '../firebase/config';
import { deleteFile } from './storageService';

/**
 * @typedef {Object} GalleryImage
 * @property {string} id
 * @property {string} imageUrl
 * @property {string} storagePath
 * @property {string} section
 * @property {string} title
 * @property {string} description
 * @property {string} alt
 * @property {string[]} tags
 * @property {string} [location]
 * @property {string} [dateTaken]
 * @property {number} [order]
 * @property {number} [width]
 * @property {number} [height]
 * @property {any} [createdAt]
 * @property {any} [updatedAt]
 */

const collectionName = 'images';
const imagesCollection = collection(projectFirestore, collectionName);

const mapDoc = (docSnapshot) => {
  const data = docSnapshot.data();
  return {
    id: docSnapshot.id,
    ...data,
    imageUrl: data.imageUrl || data.url,
    alt: data.alt || data.title || 'Gallery image',
    tags: data.tags || [],
  };
};

export const listImages = async (section) => {
  const constraints = [orderBy('section', 'asc'), orderBy('order', 'asc'), orderBy('createdAt', 'desc')];
  const q = section
    ? query(imagesCollection, where('section', '==', section), ...constraints)
    : query(imagesCollection, ...constraints);
  const snapshot = await getDocs(q);
  return snapshot.docs.map(mapDoc);
};

export const createImage = async (payload) => {
  const now = serverTimestamp();
  const docRef = await addDoc(imagesCollection, {
    ...payload,
    createdAt: now,
    updatedAt: now,
  });
  return docRef.id;
};

export const updateImage = async (id, payload) => {
  const docRef = doc(projectFirestore, collectionName, id);
  await updateDoc(docRef, { ...payload, updatedAt: serverTimestamp() });
};

export const deleteImage = async (id, storagePath) => {
  const docRef = doc(projectFirestore, collectionName, id);
  await deleteDoc(docRef);
  if (storagePath) {
    try {
      await deleteFile(storagePath);
    } catch (error) {
      console.error('Failed to delete storage file', error);
    }
  }
};

export const bulkUpdateSection = async (ids, section) => {
  const batch = writeBatch(projectFirestore);
  ids.forEach((id) => {
    const docRef = doc(projectFirestore, collectionName, id);
    batch.update(docRef, { section, updatedAt: serverTimestamp() });
  });
  await batch.commit();
};

export const updateOrder = async (updates) => {
  const batch = writeBatch(projectFirestore);
  updates.forEach(({ id, order, section }) => {
    const docRef = doc(projectFirestore, collectionName, id);
    const payload = { order, updatedAt: serverTimestamp() };
    if (section) payload.section = section;
    batch.update(docRef, payload);
  });
  await batch.commit();
};

export const deleteImagesBulk = async (items) => {
  const batch = writeBatch(projectFirestore);
  items.forEach(({ id }) => {
    const docRef = doc(projectFirestore, collectionName, id);
    batch.delete(docRef);
  });
  await batch.commit();
  await Promise.all(
    items
      .filter((item) => item.storagePath)
      .map((item) => deleteFile(item.storagePath).catch((err) => console.error('Storage delete failed', err)))
  );
};
