// A simple key-value store using IndexedDB (browser only). On the server, we
// provide a no-op stub to avoid SSR build/runtime errors.

const DB_NAME = 'MonAssistantDeCoursesDB';
const DB_VERSION = 1;
const STORE_NAME = 'keyval';

class AppDB {
  private dbPromise: Promise<IDBDatabase>;

  constructor() {
    this.dbPromise = new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION);

      request.onerror = () => {
        reject(request.error);
      };

      request.onsuccess = () => {
        resolve(request.result);
      };

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          db.createObjectStore(STORE_NAME);
        }
      };
    });
  }

  private async getStore(mode: IDBTransactionMode): Promise<IDBObjectStore> {
    const db = await this.dbPromise;
    return db.transaction(STORE_NAME, mode).objectStore(STORE_NAME);
  }

  async get<T>(key: IDBValidKey): Promise<T | undefined> {
    const store = await this.getStore('readonly');
    return new Promise((resolve, reject) => {
      const request = store.get(key);
      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(request.result as T | undefined);
    });
  }

  async set(key: IDBValidKey, value: any): Promise<void> {
    const store = await this.getStore('readwrite');
    return new Promise((resolve, reject) => {
      const request = store.put(value, key);
      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve();
    });
  }

  async delete(key: IDBValidKey): Promise<void> {
    const store = await this.getStore('readwrite');
    return new Promise((resolve, reject) => {
      const request = store.delete(key);
      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve();
    });
  }

  async clear(): Promise<void> {
    const store = await this.getStore('readwrite');
    return new Promise((resolve, reject) => {
      const request = store.clear();
      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve();
    });
  }
}

class NoopDB {
  async get<T>(_key: IDBValidKey): Promise<T | undefined> {
    return undefined;
  }
  async set(_key: IDBValidKey, _value: any): Promise<void> {
    return;
  }
  async delete(_key: IDBValidKey): Promise<void> {
    return;
  }
  async clear(): Promise<void> {
    return;
  }
}

export const db = typeof indexedDB === 'undefined' ? (new NoopDB() as unknown as AppDB) : new AppDB();
