/**
 * Wub Works - IndexedDB & Local Storage Service
 * Manages persistent storage for DJ recordings, custom hot cues, and project state.
 */

export interface SavedRecording {
  id: string;
  name: string;
  timestamp: number;
  duration: number;
  blob: Blob;
  size: number;
}

const DB_NAME = 'wub_works_db';
const DB_VERSION = 1;
const STORE_RECORDINGS = 'recordings';
const STORE_TRACK_DATA = 'track_data';

class StorageServiceSingleton {
  private dbPromise: Promise<IDBDatabase> | null = null;

  private getDB(): Promise<IDBDatabase> {
    if (this.dbPromise) return this.dbPromise;

    this.dbPromise = new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION);
      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(request.result);
      request.onupgradeneeded = (e) => {
        const db = (e.target as IDBOpenDBRequest).result;
        if (!db.objectStoreNames.contains(STORE_RECORDINGS)) {
          db.createObjectStore(STORE_RECORDINGS, { keyPath: 'id' });
        }
        if (!db.objectStoreNames.contains(STORE_TRACK_DATA)) {
          db.createObjectStore(STORE_TRACK_DATA, { keyPath: 'trackHash' });
        }
      };
    });

    return this.dbPromise;
  }

  public async saveRecording(recording: SavedRecording): Promise<void> {
    const db = await this.getDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_RECORDINGS, 'readwrite');
      const store = tx.objectStore(STORE_RECORDINGS);
      const req = store.put(recording);
      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });
  }

  public async getAllRecordings(): Promise<SavedRecording[]> {
    const db = await this.getDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_RECORDINGS, 'readonly');
      const store = tx.objectStore(STORE_RECORDINGS);
      const req = store.getAll();
      req.onsuccess = () => resolve(req.result || []);
      req.onerror = () => reject(req.error);
    });
  }

  public async deleteRecording(id: string): Promise<void> {
    const db = await this.getDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_RECORDINGS, 'readwrite');
      const store = tx.objectStore(STORE_RECORDINGS);
      const req = store.delete(id);
      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });
  }
}

export const StorageService = new StorageServiceSingleton();
