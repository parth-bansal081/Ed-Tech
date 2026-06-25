const DB_NAME = 'AeroLearnOfflineDB';
const DB_VERSION = 1;
const STORE_NAME = 'cached_documents';

export function initDb() {
  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined') {
      resolve(null);
      return;
    }
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = (event) => {
      console.error('IndexedDB open error:', event);
      reject(event);
    };

    request.onsuccess = (event) => {
      resolve(event.target.result);
    };

    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'id' });
      }
    };
  });
}

export async function saveDocumentToCache(docId, docData, topics) {
  const db = await initDb();
  if (!db) return;
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORE_NAME], 'readwrite');
    const store = transaction.objectStore(STORE_NAME);
    const data = {
      id: docId,
      document: docData,
      topics: topics,
      cached_at: new Date().toISOString()
    };
    const request = store.put(data);

    request.onsuccess = () => resolve(true);
    request.onerror = (event) => reject(event);
  });
}

export async function getDocumentFromCache(docId) {
  const db = await initDb();
  if (!db) return null;
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORE_NAME], 'readonly');
    const store = transaction.objectStore(STORE_NAME);
    const request = store.get(docId);

    request.onsuccess = (event) => resolve(event.target.result || null);
    request.onerror = (event) => reject(event);
  });
}

export async function getAllCachedDocuments() {
  const db = await initDb();
  if (!db) return [];
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORE_NAME], 'readonly');
    const store = transaction.objectStore(STORE_NAME);
    const request = store.getAll();

    request.onsuccess = (event) => resolve(event.target.result || []);
    request.onerror = (event) => reject(event);
  });
}

export async function removeDocumentFromCache(docId) {
  const db = await initDb();
  if (!db) return;
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORE_NAME], 'readwrite');
    const store = transaction.objectStore(STORE_NAME);
    const request = store.delete(docId);

    request.onsuccess = () => resolve(true);
    request.onerror = (event) => reject(event);
  });
}
