// ─────────────────────────────────────────────
// LuantiStudio — projecten opslaan/openen (IndexedDB)
// Elk project wordt bewaard onder de naam die de gebruiker opgeeft.
// IndexedDB i.p.v. localStorage omdat geüploade textures (data-URLs)
// al snel te groot zijn voor localStorage's ~5-10MB limiet.
// ─────────────────────────────────────────────

const DB_NAME = 'luantistudio';
const DB_VERSION = 1;
const STORE = 'projects';

function openProjectDB() {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION);
    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains(STORE)) {
        db.createObjectStore(STORE, { keyPath: 'name' });
      }
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

async function saveProject(name, data) {
  const db = await openProjectDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE, 'readwrite');
    tx.objectStore(STORE).put({ name, ...data, savedAt: Date.now() });
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

async function loadProject(name) {
  const db = await openProjectDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE, 'readonly');
    const req = tx.objectStore(STORE).get(name);
    req.onsuccess = () => resolve(req.result || null);
    req.onerror = () => reject(req.error);
  });
}

async function listProjects() {
  const db = await openProjectDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE, 'readonly');
    const req = tx.objectStore(STORE).getAll();
    req.onsuccess = () => resolve((req.result || []).sort((a, b) => b.savedAt - a.savedAt));
    req.onerror = () => reject(req.error);
  });
}

async function deleteProject(name) {
  const db = await openProjectDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE, 'readwrite');
    tx.objectStore(STORE).delete(name);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}
