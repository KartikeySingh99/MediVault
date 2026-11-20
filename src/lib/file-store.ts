// TEMPORARY file storage in the browser's IndexedDB, until Supabase Storage is set up.
// IndexedDB can hold real File/Blob objects (localStorage can't). Use synthetic files only.

const DB_NAME = "medivault-files";
const STORE = "files";

function openDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, 1);
    request.onupgradeneeded = () => request.result.createObjectStore(STORE);
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

async function run<T>(
  mode: IDBTransactionMode,
  operation: (store: IDBObjectStore) => IDBRequest<T>
): Promise<T> {
  const db = await openDb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE, mode);
    const request = operation(tx.objectStore(STORE));
    tx.oncomplete = () => {
      db.close();
      resolve(request.result);
    };
    tx.onerror = () => reject(tx.error);
  });
}

export const putFile = (id: string, file: File) =>
  run("readwrite", (store) => store.put(file, id)).then(() => undefined);
export const getFile = (id: string) =>
  run<File | undefined>("readonly", (store) => store.get(id));
export const deleteFile = (id: string) => run("readwrite", (store) => store.delete(id));
