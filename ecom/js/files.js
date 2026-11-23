// Gestion des fichiers par projet (§18). Binaire dans IndexedDB, métadonnées dans le store
// (collection "files", scopée par projet). Migration prévue vers Supabase Storage.

const DB = 'ecc-files';
const OS = 'blobs';
export const MAX_FILE_BYTES = 25 * 1024 * 1024;

function open() {
  return new Promise((res, rej) => {
    const r = indexedDB.open(DB, 1);
    r.onupgradeneeded = () => r.result.createObjectStore(OS);
    r.onsuccess = () => res(r.result);
    r.onerror = () => rej(r.error);
  });
}

async function tx(mode, fn) {
  const db = await open();
  return new Promise((res, rej) => {
    const t = db.transaction(OS, mode);
    const out = fn(t.objectStore(OS));
    t.oncomplete = () => res(out?.result ?? out);
    t.onerror = () => rej(t.error);
  });
}

export function categorize(file) {
  const t = file.type || '';
  if (t.startsWith('image/')) return 'Image';
  if (t.startsWith('video/')) return 'Vidéo';
  if (t === 'application/pdf') return 'PDF';
  if (/sheet|csv|excel/.test(t) || /\.(csv|xlsx?)$/i.test(file.name)) return 'Tableur';
  if (/word|text|document/.test(t)) return 'Document';
  return 'Autre';
}

export async function saveFile(store, projectId, file) {
  if (file.size > MAX_FILE_BYTES) throw new Error(`${file.name} dépasse 25 Mo`);
  const meta = store.add('files', { projectId, name: file.name.slice(0, 200), type: file.type, size: file.size, category: categorize(file) });
  try {
    await tx('readwrite', (os) => os.put(file, meta.id));
  } catch (e) {
    store.remove('files', meta.id);
    throw e;
  }
  return meta;
}

export async function getBlob(id) {
  const db = await open();
  return new Promise((res, rej) => {
    const r = db.transaction(OS).objectStore(OS).get(id);
    r.onsuccess = () => res(r.result || null);
    r.onerror = () => rej(r.error);
  });
}

export async function deleteFile(store, id) {
  await tx('readwrite', (os) => os.delete(id));
  store.remove('files', id);
}

/** Supprime les binaires orphelins (après suppression d'un projet). */
export async function purgeOrphans(store) {
  const keep = new Set(store.state.files.map((f) => f.id));
  const db = await open();
  const keys = await new Promise((res, rej) => {
    const r = db.transaction(OS).objectStore(OS).getAllKeys();
    r.onsuccess = () => res(r.result);
    r.onerror = () => rej(r.error);
  });
  const orphans = keys.filter((k) => !keep.has(k));
  if (orphans.length) await tx('readwrite', (os) => orphans.forEach((k) => os.delete(k)));
  return orphans.length;
}
