// TEMPORARY file storage in the browser's IndexedDB, until Supabase Storage is set up.
// IndexedDB can hold real File/Blob objects (localStorage can't). Use synthetic files only.

const DB_NAME = "medivault-files";
const STORE = "files";

function openDb() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, 1);
    request.onupgradeneeded = () => request.result.createObjectStore(STORE);
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

async function run(mode, operation) {
  const db = await openDb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE, mode);
    const request = operation(tx.objectStore(STORE));
    tx.oncomplete = () => {
      db.close();
      resolve(request?.result);
    };
    tx.onerror = () => reject(tx.error);
  });
}

export const putFile = (id, file) => run("readwrite", (store) => store.put(file, id));
export const getFile = (id) => run("readonly", (store) => store.get(id));
export const deleteFile = (id) => run("readwrite", (store) => store.delete(id));
