import { getDownloadURL, ref, uploadBytesResumable, deleteObject } from 'firebase/storage';
import { projectStorage } from '../firebase/config';

const MAX_CONCURRENT_UPLOADS = 3;

const getImageDimensions = (file) =>
  new Promise((resolve) => {
    const img = new Image();
    img.onload = () => resolve({ width: img.naturalWidth, height: img.naturalHeight });
    img.onerror = () => resolve({ width: null, height: null });
    img.src = URL.createObjectURL(file);
  });

export const uploadFile = async (file, onProgress) => {
  const uniquePath = `gallery/${Date.now()}-${file.name}`;
  const storageRef = ref(projectStorage, uniquePath);
  const uploadTask = uploadBytesResumable(storageRef, file);

  return new Promise((resolve, reject) => {
    uploadTask.on(
      'state_changed',
      (snapshot) => {
        const percentage = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        onProgress?.(percentage);
      },
      (error) => reject(error),
      async () => {
        const [downloadURL, dimensions] = await Promise.all([
          getDownloadURL(uploadTask.snapshot.ref),
          getImageDimensions(file),
        ]);
        resolve({
          imageUrl: downloadURL,
          storagePath: uniquePath,
          width: dimensions.width,
          height: dimensions.height,
        });
      }
    );
  });
};

export const uploadWithLimit = async (files, onStatusChange) => {
  const queue = [...files];
  const results = [];
  const active = [];

  const runNext = async () => {
    if (queue.length === 0) return Promise.resolve();
    const file = queue.shift();
    const task = uploadFile(file, (progress) => onStatusChange?.(file, { status: 'uploading', progress })).then(
      (res) => {
        results.push({ file, ...res });
        onStatusChange?.(file, { status: 'success', progress: 100 });
      },
      (error) => {
        onStatusChange?.(file, { status: 'error', error });
      }
    );
    active.push(task);
    const cleanup = () => {
      const index = active.indexOf(task);
      if (index > -1) active.splice(index, 1);
    };
    task.finally(cleanup);
    if (active.length >= MAX_CONCURRENT_UPLOADS) {
      await Promise.race(active);
    }
    return runNext();
  };

  await runNext();
  await Promise.all(active);
  return results;
};

export const deleteFile = (storagePath) => {
  const fileRef = ref(projectStorage, storagePath);
  return deleteObject(fileRef);
};
