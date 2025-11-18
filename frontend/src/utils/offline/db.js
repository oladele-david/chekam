// IndexedDB utilities for offline storage
const DB_NAME = 'ChekamOfflineDB';
const DB_VERSION = 1;

// Object store names
export const STORES = {
  BUDGETS: 'budgets_offline',
  CATEGORIES: 'categories_offline',
  TRANSACTIONS: 'transactions_offline',
  SYNC_QUEUE: 'sync_queue',
  NOTIFICATIONS: 'notifications_offline',
};

/**
 * Initialize IndexedDB database
 * @returns {Promise<IDBDatabase>}
 */
export const initDB = () => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = () => {
      console.error('IndexedDB failed to open:', request.error);
      reject(request.error);
    };

    request.onsuccess = () => {
      console.log('IndexedDB opened successfully');
      resolve(request.result);
    };

    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      console.log('IndexedDB upgrade needed, creating object stores');

      // Create budgets store
      if (!db.objectStoreNames.contains(STORES.BUDGETS)) {
        const budgetStore = db.createObjectStore(STORES.BUDGETS, {
          keyPath: 'id',
          autoIncrement: true
        });
        budgetStore.createIndex('user_id', 'user_id', { unique: false });
        budgetStore.createIndex('synced', 'synced', { unique: false });
      }

      // Create categories store
      if (!db.objectStoreNames.contains(STORES.CATEGORIES)) {
        const categoryStore = db.createObjectStore(STORES.CATEGORIES, {
          keyPath: 'id',
          autoIncrement: true
        });
        categoryStore.createIndex('user_id', 'user_id', { unique: false });
        categoryStore.createIndex('synced', 'synced', { unique: false });
      }

      // Create transactions store
      if (!db.objectStoreNames.contains(STORES.TRANSACTIONS)) {
        const transactionStore = db.createObjectStore(STORES.TRANSACTIONS, {
          keyPath: 'id',
          autoIncrement: true
        });
        transactionStore.createIndex('user_id', 'user_id', { unique: false });
        transactionStore.createIndex('synced', 'synced', { unique: false });
        transactionStore.createIndex('date', 'date', { unique: false });
      }

      // Create notifications store
      if (!db.objectStoreNames.contains(STORES.NOTIFICATIONS)) {
        const notificationStore = db.createObjectStore(STORES.NOTIFICATIONS, {
          keyPath: 'id',
          autoIncrement: true
        });
        notificationStore.createIndex('user_id', 'user_id', { unique: false });
        notificationStore.createIndex('is_read', 'is_read', { unique: false });
      }

      // Create sync queue store
      if (!db.objectStoreNames.contains(STORES.SYNC_QUEUE)) {
        const syncStore = db.createObjectStore(STORES.SYNC_QUEUE, {
          keyPath: 'id',
          autoIncrement: true
        });
        syncStore.createIndex('timestamp', 'timestamp', { unique: false });
        syncStore.createIndex('status', 'status', { unique: false });
      }
    };
  });
};

/**
 * Generic add operation
 * @param {string} storeName - Object store name
 * @param {Object} data - Data to add
 * @returns {Promise<number>}
 */
export const addItem = async (storeName, data) => {
  const db = await initDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([storeName], 'readwrite');
    const store = transaction.objectStore(storeName);
    const request = store.add({
      ...data,
      synced: false,
      offline_created: true,
      created_at: new Date().toISOString()
    });

    request.onsuccess = () => {
      console.log(`Added item to ${storeName}:`, request.result);
      resolve(request.result);
    };

    request.onerror = () => {
      console.error(`Error adding item to ${storeName}:`, request.error);
      reject(request.error);
    };
  });
};

/**
 * Generic get operation by ID
 * @param {string} storeName - Object store name
 * @param {number} id - Item ID
 * @returns {Promise<Object|null>}
 */
export const getItem = async (storeName, id) => {
  const db = await initDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([storeName], 'readonly');
    const store = transaction.objectStore(storeName);
    const request = store.get(id);

    request.onsuccess = () => {
      resolve(request.result || null);
    };

    request.onerror = () => {
      console.error(`Error getting item from ${storeName}:`, request.error);
      reject(request.error);
    };
  });
};

/**
 * Generic get all operation
 * @param {string} storeName - Object store name
 * @param {number} userId - Filter by user ID
 * @returns {Promise<Array>}
 */
export const getAllItems = async (storeName, userId = null) => {
  const db = await initDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([storeName], 'readonly');
    const store = transaction.objectStore(storeName);

    let request;
    if (userId) {
      const index = store.index('user_id');
      request = index.getAll(userId);
    } else {
      request = store.getAll();
    }

    request.onsuccess = () => {
      resolve(request.result || []);
    };

    request.onerror = () => {
      console.error(`Error getting all items from ${storeName}:`, request.error);
      reject(request.error);
    };
  });
};

/**
 * Generic update operation
 * @param {string} storeName - Object store name
 * @param {Object} data - Data to update (must include id)
 * @returns {Promise<number>}
 */
export const updateItem = async (storeName, data) => {
  const db = await initDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([storeName], 'readwrite');
    const store = transaction.objectStore(storeName);
    const request = store.put({
      ...data,
      synced: false,
      updated_at: new Date().toISOString()
    });

    request.onsuccess = () => {
      console.log(`Updated item in ${storeName}:`, request.result);
      resolve(request.result);
    };

    request.onerror = () => {
      console.error(`Error updating item in ${storeName}:`, request.error);
      reject(request.error);
    };
  });
};

/**
 * Generic delete operation
 * @param {string} storeName - Object store name
 * @param {number} id - Item ID
 * @returns {Promise<void>}
 */
export const deleteItem = async (storeName, id) => {
  const db = await initDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([storeName], 'readwrite');
    const store = transaction.objectStore(storeName);
    const request = store.delete(id);

    request.onsuccess = () => {
      console.log(`Deleted item from ${storeName}:`, id);
      resolve();
    };

    request.onerror = () => {
      console.error(`Error deleting item from ${storeName}:`, request.error);
      reject(request.error);
    };
  });
};

/**
 * Mark item as synced
 * @param {string} storeName - Object store name
 * @param {number} id - Item ID
 * @returns {Promise<void>}
 */
export const markAsSynced = async (storeName, id) => {
  const db = await initDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([storeName], 'readwrite');
    const store = transaction.objectStore(storeName);
    const getRequest = store.get(id);

    getRequest.onsuccess = () => {
      const item = getRequest.result;
      if (item) {
        item.synced = true;
        item.synced_at = new Date().toISOString();
        const putRequest = store.put(item);

        putRequest.onsuccess = () => resolve();
        putRequest.onerror = () => reject(putRequest.error);
      } else {
        resolve(); // Item doesn't exist, consider it synced
      }
    };

    getRequest.onerror = () => {
      console.error(`Error marking item as synced in ${storeName}:`, getRequest.error);
      reject(getRequest.error);
    };
  });
};

/**
 * Get unsynced items
 * @param {string} storeName - Object store name
 * @returns {Promise<Array>}
 */
export const getUnsyncedItems = async (storeName) => {
  const db = await initDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([storeName], 'readonly');
    const store = transaction.objectStore(storeName);
    const index = store.index('synced');
    const request = index.getAll(false);

    request.onsuccess = () => {
      resolve(request.result || []);
    };

    request.onerror = () => {
      console.error(`Error getting unsynced items from ${storeName}:`, request.error);
      reject(request.error);
    };
  });
};

/**
 * Clear all data from a store
 * @param {string} storeName - Object store name
 * @returns {Promise<void>}
 */
export const clearStore = async (storeName) => {
  const db = await initDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([storeName], 'readwrite');
    const store = transaction.objectStore(storeName);
    const request = store.clear();

    request.onsuccess = () => {
      console.log(`Cleared all data from ${storeName}`);
      resolve();
    };

    request.onerror = () => {
      console.error(`Error clearing ${storeName}:`, request.error);
      reject(request.error);
    };
  });
};

/**
 * Add operation to sync queue
 * @param {Object} operation - Operation details
 * @returns {Promise<number>}
 */
export const queueSync = async (operation) => {
  const db = await initDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORES.SYNC_QUEUE], 'readwrite');
    const store = transaction.objectStore(STORES.SYNC_QUEUE);
    const request = store.add({
      ...operation,
      timestamp: new Date().toISOString(),
      status: 'pending', // pending, syncing, completed, failed
      retries: 0
    });

    request.onsuccess = () => {
      console.log('Added operation to sync queue:', request.result);
      resolve(request.result);
    };

    request.onerror = () => {
      console.error('Error adding to sync queue:', request.error);
      reject(request.error);
    };
  });
};

/**
 * Get pending sync operations
 * @returns {Promise<Array>}
 */
export const getPendingSyncOperations = async () => {
  const db = await initDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORES.SYNC_QUEUE], 'readonly');
    const store = transaction.objectStore(STORES.SYNC_QUEUE);
    const index = store.index('status');
    const request = index.getAll('pending');

    request.onsuccess = () => {
      resolve(request.result || []);
    };

    request.onerror = () => {
      console.error('Error getting pending sync operations:', request.error);
      reject(request.error);
    };
  });
};

/**
 * Update sync operation status
 * @param {number} id - Operation ID
 * @param {string} status - New status
 * @returns {Promise<void>}
 */
export const updateSyncStatus = async (id, status) => {
  const db = await initDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORES.SYNC_QUEUE], 'readwrite');
    const store = transaction.objectStore(STORES.SYNC_QUEUE);
    const getRequest = store.get(id);

    getRequest.onsuccess = () => {
      const operation = getRequest.result;
      if (operation) {
        operation.status = status;
        operation.updated_at = new Date().toISOString();

        if (status === 'failed') {
          operation.retries = (operation.retries || 0) + 1;
        }

        const putRequest = store.put(operation);
        putRequest.onsuccess = () => resolve();
        putRequest.onerror = () => reject(putRequest.error);
      } else {
        resolve();
      }
    };

    getRequest.onerror = () => reject(getRequest.error);
  });
};

/**
 * Remove completed sync operations older than specified days
 * @param {number} days - Number of days to keep
 * @returns {Promise<void>}
 */
export const cleanupCompletedSync = async (days = 7) => {
  const db = await initDB();
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - days);

  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORES.SYNC_QUEUE], 'readwrite');
    const store = transaction.objectStore(STORES.SYNC_QUEUE);
    const request = store.openCursor();

    request.onsuccess = (event) => {
      const cursor = event.target.result;
      if (cursor) {
        const operation = cursor.value;
        if (operation.status === 'completed' &&
            new Date(operation.updated_at) < cutoffDate) {
          cursor.delete();
        }
        cursor.continue();
      } else {
        console.log('Cleanup completed');
        resolve();
      }
    };

    request.onerror = () => {
      console.error('Error during cleanup:', request.error);
      reject(request.error);
    };
  });
};

export default {
  initDB,
  addItem,
  getItem,
  getAllItems,
  updateItem,
  deleteItem,
  markAsSynced,
  getUnsyncedItems,
  clearStore,
  queueSync,
  getPendingSyncOperations,
  updateSyncStatus,
  cleanupCompletedSync,
  STORES
};
