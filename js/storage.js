// ─────────────────────────────────────────────
// LuantiStudio — projecten opslaan/openen (IndexedDB)
// Elk project wordt bewaard onder de naam die de gebruiker opgeeft.
// IndexedDB i.p.v. localStorage omdat geüploade textures (data-URLs)
// al snel te groot zijn voor localStorage's ~5-10MB limiet. Dezelfde
// database heeft ook een kleine "settings"-store — o.a. voor de
// FileSystemDirectoryHandle van de gekozen Luanti mods-map ("Test in
// Luanti"). IndexedDB kan zulke handles direct opslaan (structured
// clone), zodat de gebruiker de map niet elke sessie opnieuw hoeft te
// kiezen.
// ─────────────────────────────────────────────

const DB_NAME = 'luantistudio';
const DB_VERSION = 2;
const STORE = 'projects';
const SETTINGS_STORE = 'settings';

function openProjectDB() {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION);
    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains(STORE)) {
        db.createObjectStore(STORE, { keyPath: 'name' });
      }
      if (!db.objectStoreNames.contains(SETTINGS_STORE)) {
        db.createObjectStore(SETTINGS_STORE, { keyPath: 'key' });
      }
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

async function saveSetting(key, value) {
  const db = await openProjectDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(SETTINGS_STORE, 'readwrite');
    tx.objectStore(SETTINGS_STORE).put({ key, value });
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

async function loadSetting(key) {
  const db = await openProjectDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(SETTINGS_STORE, 'readonly');
    const req = tx.objectStore(SETTINGS_STORE).get(key);
    req.onsuccess = () => resolve(req.result ? req.result.value : null);
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
