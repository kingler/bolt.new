import type { Message } from 'ai';
import { createScopedLogger } from '~/utils/logger';
import type { ChatHistoryItem } from './useChatHistory';

const logger = createScopedLogger('ChatHistory');

/**
 * Opens the IndexedDB database for chat history.
 *
 * @returns {Promise<IDBDatabase | undefined>} A promise that resolves to the opened database or undefined if an error occurs.
 */
export async function openDatabase(): Promise<IDBDatabase | undefined> {
  return new Promise((resolve) => {
    const request = indexedDB.open('boltHistory', 1);

    request.onupgradeneeded = (event: IDBVersionChangeEvent) => {
      const db = (event.target as IDBOpenDBRequest).result;

      if (!db.objectStoreNames.contains('chats')) {
        const store = db.createObjectStore('chats', { keyPath: 'id' });
        store.createIndex('id', 'id', { unique: true });
        store.createIndex('urlId', 'urlId', { unique: true });
      }
    };

    request.onsuccess = (event: Event) => {
      resolve((event.target as IDBOpenDBRequest).result);
    };

    request.onerror = (event: Event) => {
      resolve(undefined);
      logger.error((event.target as IDBOpenDBRequest).error);
    };
  });
}

/**
 * Retrieves all chat history items from the database.
 *
 * @param {IDBDatabase} db - The IndexedDB database instance.
 * @returns {Promise<ChatHistoryItem[]>} A promise that resolves to an array of chat history items.
 */
export async function getAll(db: IDBDatabase): Promise<ChatHistoryItem[]> {
  return new Promise((resolve, reject) => {
    const transaction = db.transaction('chats', 'readonly');
    const store = transaction.objectStore('chats');
    const request = store.getAll();

    request.onsuccess = () => resolve(request.result as ChatHistoryItem[]);
    request.onerror = () => reject(request.error);
  });
}

/**
 * Stores chat messages in the database.
 *
 * @param {IDBDatabase} db - The IndexedDB database instance.
 * @param {string} id - The chat ID.
 * @param {Message[]} messages - The chat messages to store.
 * @param {string} [urlId] - The URL ID for the chat.
 * @param {string} [description] - The description of the chat.
 * @returns {Promise<void>} A promise that resolves when the messages are successfully stored.
 */
export async function setMessages(
  db: IDBDatabase,
  id: string,
  messages: Message[],
  urlId?: string,
  description?: string,
): Promise<void> {
  return new Promise((resolve, reject) => {
    const transaction = db.transaction('chats', 'readwrite');
    const store = transaction.objectStore('chats');

    const request = store.put({
      id,
      messages,
      urlId,
      description,
      timestamp: new Date().toISOString(),
    });

    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
}

/**
 * Retrieves chat messages from the database by ID or URL ID.
 *
 * @param {IDBDatabase} db - The IndexedDB database instance.
 * @param {string} id - The chat ID or URL ID.
 * @returns {Promise<ChatHistoryItem>} A promise that resolves to the chat history item.
 */
export async function getMessages(db: IDBDatabase, id: string): Promise<ChatHistoryItem> {
  return (await getMessagesById(db, id)) || (await getMessagesByUrlId(db, id));
}

/**
 * Retrieves chat messages from the database by URL ID.
 *
 * @param {IDBDatabase} db - The IndexedDB database instance.
 * @param {string} id - The URL ID.
 * @returns {Promise<ChatHistoryItem>} A promise that resolves to the chat history item.
 */
export async function getMessagesByUrlId(db: IDBDatabase, id: string): Promise<ChatHistoryItem> {
  return new Promise((resolve, reject) => {
    const transaction = db.transaction('chats', 'readonly');
    const store = transaction.objectStore('chats');
    const index = store.index('urlId');
    const request = index.get(id);

    request.onsuccess = () => resolve(request.result as ChatHistoryItem);
    request.onerror = () => reject(request.error);
  });
}

/**
 * Retrieves chat messages from the database by chat ID.
 *
 * @param {IDBDatabase} db - The IndexedDB database instance.
 * @param {string} id - The chat ID.
 * @returns {Promise<ChatHistoryItem>} A promise that resolves to the chat history item.
 */
export async function getMessagesById(db: IDBDatabase, id: string): Promise<ChatHistoryItem> {
  return new Promise((resolve, reject) => {
    const transaction = db.transaction('chats', 'readonly');
    const store = transaction.objectStore('chats');
    const request = store.get(id);

    request.onsuccess = () => resolve(request.result as ChatHistoryItem);
    request.onerror = () => reject(request.error);
  });
}

/**
 * Deletes chat messages from the database by chat ID.
 *
 * @param {IDBDatabase} db - The IndexedDB database instance.
 * @param {string} id - The chat ID.
 * @returns {Promise<void>} A promise that resolves when the messages are successfully deleted.
 */
export async function deleteById(db: IDBDatabase, id: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const transaction = db.transaction('chats', 'readwrite');
    const store = transaction.objectStore('chats');
    const request = store.delete(id);

    request.onsuccess = () => resolve(undefined);
    request.onerror = () => reject(request.error);
  });
}

/**
 * Generates the next available chat ID.
 *
 * @param {IDBDatabase} db - The IndexedDB database instance.
 * @returns {Promise<string>} A promise that resolves to the next available chat ID.
 */
export async function getNextId(db: IDBDatabase): Promise<string> {
  return new Promise((resolve, reject) => {
    const transaction = db.transaction('chats', 'readonly');
    const store = transaction.objectStore('chats');
    const request = store.getAllKeys();

    request.onsuccess = () => {
      const highestId = request.result.reduce((cur, acc) => Math.max(+cur, +acc), 0);
      resolve(String(+highestId + 1));
    };

    request.onerror = () => reject(request.error);
  });
}

/**
 * Generates a unique URL ID for the chat.
 *
 * @param {IDBDatabase} db - The IndexedDB database instance.
 * @param {string} id - The base ID for the URL.
 * @returns {Promise<string>} A promise that resolves to a unique URL ID.
 */
export async function getUrlId(db: IDBDatabase, id: string): Promise<string> {
  const idList = await getUrlIds(db);

  if (!idList.includes(id)) {
    return id;
  } else {
    let i = 2;

    while (idList.includes(`${id}-${i}`)) {
      i++;
    }

    return `${id}-${i}`;
  }
}

/**
 * Retrieves all URL IDs from the database.
 *
 * @param {IDBDatabase} db - The IndexedDB database instance.
 * @returns {Promise<string[]>} A promise that resolves to an array of URL IDs.
 */
async function getUrlIds(db: IDBDatabase): Promise<string[]> {
  return new Promise((resolve, reject) => {
    const transaction = db.transaction('chats', 'readonly');
    const store = transaction.objectStore('chats');
    const idList: string[] = [];

    const request = store.openCursor();

    request.onsuccess = (event: Event) => {
      const cursor = (event.target as IDBRequest<IDBCursorWithValue>).result;

      if (cursor) {
        idList.push(cursor.value.urlId);
        cursor.continue();
      } else {
        resolve(idList);
      }
    };

    request.onerror = () => {
      reject(request.error);
    };
  });
}
