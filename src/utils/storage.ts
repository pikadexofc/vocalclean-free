import { openDB, IDBPDatabase } from 'idb';
import { ProcessedResult, SessionFile } from '../types';

const DB_NAME = 'VocalCleanDB';
const STORE_NAME = 'history';
const VERSION = 1;

export interface HistoryItem extends ProcessedResult {
  id: string;
  timestamp: number;
  status: 'completed' | 'failed';
  error?: string;
  customPrompt?: string;
}

let dbPromise: Promise<IDBPDatabase<any>> | null = null;

const getDB = () => {
  if (!dbPromise) {
    dbPromise = openDB(DB_NAME, VERSION, {
      upgrade(db) {
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          const store = db.createObjectStore(STORE_NAME, { keyPath: 'id' });
          store.createIndex('timestamp', 'timestamp');
        }
      },
    });
  }
  return dbPromise;
};

export const saveToHistory = async (item: HistoryItem) => {
  const db = await getDB();
  await db.put(STORE_NAME, item);
};

export const getHistory = async (): Promise<HistoryItem[]> => {
  const db = await getDB();
  const items = await db.getAllFromIndex(STORE_NAME, 'timestamp');
  return items.reverse(); // Newest first
};

export const deleteFromHistory = async (id: string) => {
  const db = await getDB();
  await db.delete(STORE_NAME, id);
};

export const clearHistory = async () => {
  const db = await getDB();
  await db.clear(STORE_NAME);
};

export const updateHistoryItem = async (id: string, updates: Partial<HistoryItem>) => {
  const db = await getDB();
  const item = await db.get(STORE_NAME, id);
  if (item) {
    await db.put(STORE_NAME, { ...item, ...updates });
  }
};
