/**
 * photoBlobStore — Lokale IndexedDB-Ablage für Foto-Bilddaten (dataUrl).
 *
 * localStorage hat nur ~5MB Quota und wird bei jeder Statusänderung neu
 * geschrieben — Base64-Fotos dort zu halten sprengt die Quota nach wenigen
 * Dutzend Bildern (siehe Issue #16). IndexedDB hat ein deutlich größeres
 * Limit und wird hier ausschließlich als lokaler Blob-Cache verwendet;
 * die autoritative Kopie inkl. Bilddaten bleibt weiterhin der lokale
 * Server (server/garden-data.json).
 */
const DB_NAME    = 'gartenplaner-photos';
const DB_VERSION = 1;
const STORE_NAME = 'blobs';

function openDb() {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION);
    req.onupgradeneeded = () => {
      req.result.createObjectStore(STORE_NAME);
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

export async function putPhotoBlob(id, dataUrl) {
  const db = await openDb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readwrite');
    tx.objectStore(STORE_NAME).put(dataUrl, id);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

export async function deletePhotoBlob(id) {
  const db = await openDb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readwrite');
    tx.objectStore(STORE_NAME).delete(id);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

export async function getAllPhotoBlobs() {
  const db = await openDb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readonly');
    const cursorReq = tx.objectStore(STORE_NAME).openCursor();
    const result = new Map();
    cursorReq.onsuccess = (e) => {
      const cursor = e.target.result;
      if (cursor) {
        result.set(cursor.key, cursor.value);
        cursor.continue();
      } else {
        resolve(result);
      }
    };
    cursorReq.onerror = () => reject(cursorReq.error);
  });
}
