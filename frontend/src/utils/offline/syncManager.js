// Sync Manager for offline data synchronization
import {
  STORES,
  queueSync,
  getPendingSyncOperations,
  updateSyncStatus,
  markAsSynced,
  getUnsyncedItems,
  cleanupCompletedSync
} from './db';

class SyncManager {
  constructor() {
    this.isSyncing = false;
    this.syncInProgress = false;
    this.listeners = [];
    this.lastSyncTime = null;
    this.syncErrors = [];
  }

  /**
   * Add listener for sync events
   * @param {Function} callback
   */
  addListener(callback) {
    this.listeners.push(callback);
  }

  /**
   * Remove listener
   * @param {Function} callback
   */
  removeListener(callback) {
    this.listeners = this.listeners.filter(listener => listener !== callback);
  }

  /**
   * Notify all listeners
   * @param {Object} event
   */
  notifyListeners(event) {
    this.listeners.forEach(listener => {
      try {
        listener(event);
      } catch (error) {
        console.error('Error in sync listener:', error);
      }
    });
  }

  /**
   * Queue an operation for sync
   * @param {string} type - Operation type (create, update, delete)
   * @param {string} entity - Entity type (budget, category, transaction)
   * @param {Object} data - Operation data
   * @param {Object} apiClient - API client instance
   * @returns {Promise<number>}
   */
  async queueOperation(type, entity, data, apiClient) {
    try {
      const operation = {
        type,
        entity,
        data,
        timestamp: new Date().toISOString()
      };

      const id = await queueSync(operation);
      console.log(`Queued ${type} operation for ${entity}:`, id);

      // Notify listeners
      this.notifyListeners({
        type: 'OPERATION_QUEUED',
        operation: { ...operation, id }
      });

      // Try to sync immediately if online
      if (navigator.onLine) {
        this.sync(apiClient);
      }

      return id;
    } catch (error) {
      console.error('Error queueing operation:', error);
      throw error;
    }
  }

  /**
   * Sync all pending operations
   * @param {Object} apiClient - API client instance
   * @returns {Promise<Object>}
   */
  async sync(apiClient) {
    // Prevent concurrent syncs
    if (this.syncInProgress) {
      console.log('Sync already in progress, skipping');
      return { skipped: true };
    }

    if (!navigator.onLine) {
      console.log('Cannot sync while offline');
      return { offline: true };
    }

    this.syncInProgress = true;
    this.syncErrors = [];

    this.notifyListeners({
      type: 'SYNC_START',
      timestamp: new Date().toISOString()
    });

    try {
      const pendingOperations = await getPendingSyncOperations();
      console.log(`Starting sync of ${pendingOperations.length} operations`);

      const results = {
        total: pendingOperations.length,
        succeeded: 0,
        failed: 0,
        errors: []
      };

      // Process operations sequentially to maintain order
      for (const operation of pendingOperations) {
        try {
          await updateSyncStatus(operation.id, 'syncing');

          await this.executeOperation(operation, apiClient);

          await updateSyncStatus(operation.id, 'completed');
          results.succeeded++;

          this.notifyListeners({
            type: 'OPERATION_SYNCED',
            operation
          });
        } catch (error) {
          console.error(`Failed to sync operation ${operation.id}:`, error);

          // Retry logic - fail after 3 attempts
          if ((operation.retries || 0) < 3) {
            await updateSyncStatus(operation.id, 'pending');
          } else {
            await updateSyncStatus(operation.id, 'failed');
          }

          results.failed++;
          results.errors.push({
            operation,
            error: error.message
          });

          this.syncErrors.push({
            operation,
            error
          });
        }
      }

      // Sync unsynced items from local stores
      await this.syncUnsyncedItems(apiClient);

      // Cleanup old completed operations
      await cleanupCompletedSync(7); // Keep 7 days of history

      this.lastSyncTime = new Date().toISOString();

      this.notifyListeners({
        type: 'SYNC_COMPLETE',
        results,
        timestamp: this.lastSyncTime
      });

      console.log('Sync complete:', results);
      return results;
    } catch (error) {
      console.error('Sync failed:', error);

      this.notifyListeners({
        type: 'SYNC_ERROR',
        error: error.message
      });

      throw error;
    } finally {
      this.syncInProgress = false;
    }
  }

  /**
   * Execute a single sync operation
   * @param {Object} operation
   * @param {Object} apiClient
   * @returns {Promise<void>}
   */
  async executeOperation(operation, apiClient) {
    const { type, entity, data } = operation;

    try {
      let result;

      switch (type) {
        case 'create':
          result = await this.executeCreate(entity, data, apiClient);
          break;

        case 'update':
          result = await this.executeUpdate(entity, data, apiClient);
          break;

        case 'delete':
          result = await this.executeDelete(entity, data, apiClient);
          break;

        default:
          throw new Error(`Unknown operation type: ${type}`);
      }

      return result;
    } catch (error) {
      console.error(`Error executing ${type} operation on ${entity}:`, error);
      throw error;
    }
  }

  /**
   * Execute create operation
   * @param {string} entity
   * @param {Object} data
   * @param {Object} apiClient
   * @returns {Promise<Object>}
   */
  async executeCreate(entity, data, apiClient) {
    const endpoint = this.getEndpoint(entity);
    const response = await apiClient.fetchData(`/api/v1/${endpoint}/`, 'POST', data);
    return response;
  }

  /**
   * Execute update operation
   * @param {string} entity
   * @param {Object} data
   * @param {Object} apiClient
   * @returns {Promise<Object>}
   */
  async executeUpdate(entity, data, apiClient) {
    const endpoint = this.getEndpoint(entity);
    const response = await apiClient.fetchData(
      `/api/v1/${endpoint}/${data.id}`,
      'PUT',
      data
    );
    return response;
  }

  /**
   * Execute delete operation
   * @param {string} entity
   * @param {Object} data
   * @param {Object} apiClient
   * @returns {Promise<void>}
   */
  async executeDelete(entity, data, apiClient) {
    const endpoint = this.getEndpoint(entity);
    await apiClient.fetchData(`/api/v1/${endpoint}/${data.id}`, 'DELETE');
  }

  /**
   * Get API endpoint for entity
   * @param {string} entity
   * @returns {string}
   */
  getEndpoint(entity) {
    const endpoints = {
      budget: 'budgets',
      category: 'categories',
      transaction: 'transactions',
      notification: 'notifications'
    };

    return endpoints[entity] || entity;
  }

  /**
   * Sync unsynced items from local stores
   * @param {Object} apiClient
   * @returns {Promise<void>}
   */
  async syncUnsyncedItems(apiClient) {
    const stores = [
      { name: STORES.BUDGETS, entity: 'budget' },
      { name: STORES.CATEGORIES, entity: 'category' },
      { name: STORES.TRANSACTIONS, entity: 'transaction' }
    ];

    for (const { name, entity } of stores) {
      try {
        const unsyncedItems = await getUnsyncedItems(name);

        for (const item of unsyncedItems) {
          try {
            // Determine if this is a create or update based on whether it has offline_created flag
            const operationType = item.offline_created ? 'create' : 'update';

            if (operationType === 'create') {
              const { id, synced, offline_created, created_at, updated_at, synced_at, ...cleanData } = item;
              await this.executeCreate(entity, cleanData, apiClient);
            } else {
              await this.executeUpdate(entity, item, apiClient);
            }

            // Mark as synced
            await markAsSynced(name, item.id);

            console.log(`Synced ${entity} item:`, item.id);
          } catch (error) {
            console.error(`Error syncing ${entity} item ${item.id}:`, error);
            // Continue with other items even if one fails
          }
        }
      } catch (error) {
        console.error(`Error syncing ${name}:`, error);
      }
    }
  }

  /**
   * Force sync now
   * @param {Object} apiClient
   * @returns {Promise<Object>}
   */
  async syncNow(apiClient) {
    console.log('Force sync requested');
    return this.sync(apiClient);
  }

  /**
   * Get sync status
   * @returns {Object}
   */
  getStatus() {
    return {
      isSyncing: this.syncInProgress,
      lastSyncTime: this.lastSyncTime,
      errors: this.syncErrors,
      hasErrors: this.syncErrors.length > 0
    };
  }

  /**
   * Clear sync errors
   */
  clearErrors() {
    this.syncErrors = [];
    this.notifyListeners({
      type: 'ERRORS_CLEARED'
    });
  }

  /**
   * Check if there are pending operations
   * @returns {Promise<boolean>}
   */
  async hasPendingOperations() {
    const operations = await getPendingSyncOperations();
    return operations.length > 0;
  }

  /**
   * Get pending operations count
   * @returns {Promise<number>}
   */
  async getPendingCount() {
    const operations = await getPendingSyncOperations();
    return operations.length;
  }
}

// Create singleton instance
const syncManager = new SyncManager();

// Auto-sync when coming back online
window.addEventListener('online', () => {
  console.log('Connection restored, triggering sync');
  syncManager.notifyListeners({
    type: 'ONLINE',
    timestamp: new Date().toISOString()
  });
});

window.addEventListener('offline', () => {
  console.log('Connection lost');
  syncManager.notifyListeners({
    type: 'OFFLINE',
    timestamp: new Date().toISOString()
  });
});

// Service worker sync event listener
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.addEventListener('message', (event) => {
    if (event.data && event.data.type === 'SYNC_START') {
      console.log('Sync triggered by service worker');
      // The app will handle the actual sync when it gets the apiClient
    }
  });
}

export default syncManager;
