import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useSelector } from 'react-redux';
import syncManager from '../utils/offline/syncManager';
import { initDB } from '../utils/offline/db';
import ApiClient from '../api/ApiClient';

const OfflineContext = createContext(null);

export const OfflineProvider = ({ children }) => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [isSyncing, setIsSyncing] = useState(false);
  const [pendingCount, setPendingCount] = useState(0);
  const [syncStatus, setSyncStatus] = useState(null);
  const [lastSyncTime, setLastSyncTime] = useState(null);
  const [syncErrors, setSyncErrors] = useState([]);

  const access_token = useSelector((state) => state.auth.token);

  // Initialize database on mount
  useEffect(() => {
    initDB()
      .then(() => {
        console.log('IndexedDB initialized successfully');
      })
      .catch((error) => {
        console.error('Failed to initialize IndexedDB:', error);
      });
  }, []);

  // Monitor online/offline status
  useEffect(() => {
    const handleOnline = () => {
      console.log('App is online');
      setIsOnline(true);

      // Auto-sync when coming back online
      if (access_token) {
        performSync();
      }
    };

    const handleOffline = () => {
      console.log('App is offline');
      setIsOnline(false);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [access_token]);

  // Listen to sync manager events
  useEffect(() => {
    const handleSyncEvent = (event) => {
      console.log('Sync event:', event);

      switch (event.type) {
        case 'SYNC_START':
          setIsSyncing(true);
          setSyncStatus('syncing');
          break;

        case 'SYNC_COMPLETE':
          setIsSyncing(false);
          setSyncStatus('completed');
          setLastSyncTime(event.timestamp);
          if (event.results) {
            if (event.results.failed > 0) {
              setSyncErrors(event.results.errors);
            } else {
              setSyncErrors([]);
            }
          }
          updatePendingCount();
          break;

        case 'SYNC_ERROR':
          setIsSyncing(false);
          setSyncStatus('error');
          console.error('Sync error:', event.error);
          break;

        case 'OPERATION_QUEUED':
          updatePendingCount();
          break;

        case 'OPERATION_SYNCED':
          updatePendingCount();
          break;

        case 'ONLINE':
          setIsOnline(true);
          break;

        case 'OFFLINE':
          setIsOnline(false);
          break;

        case 'ERRORS_CLEARED':
          setSyncErrors([]);
          break;

        default:
          break;
      }
    };

    syncManager.addListener(handleSyncEvent);

    return () => {
      syncManager.removeListener(handleSyncEvent);
    };
  }, []);

  // Update pending operations count
  const updatePendingCount = useCallback(async () => {
    try {
      const count = await syncManager.getPendingCount();
      setPendingCount(count);
    } catch (error) {
      console.error('Error getting pending count:', error);
    }
  }, []);

  // Update pending count periodically
  useEffect(() => {
    updatePendingCount();

    const interval = setInterval(() => {
      updatePendingCount();
    }, 30000); // Every 30 seconds

    return () => clearInterval(interval);
  }, [updatePendingCount]);

  // Perform sync
  const performSync = useCallback(async () => {
    if (!access_token) {
      console.log('Cannot sync: No access token');
      return { error: 'Not authenticated' };
    }

    if (!isOnline) {
      console.log('Cannot sync: Offline');
      return { error: 'Offline' };
    }

    try {
      const apiClient = new ApiClient(import.meta.env.VITE_DEVELOPMENT_URL, access_token);
      const result = await syncManager.syncNow(apiClient);
      return result;
    } catch (error) {
      console.error('Sync failed:', error);
      return { error: error.message };
    }
  }, [access_token, isOnline]);

  // Queue operation for sync
  const queueOperation = useCallback(async (type, entity, data) => {
    if (!access_token) {
      console.warn('Cannot queue operation: Not authenticated');
      return null;
    }

    try {
      const apiClient = new ApiClient(import.meta.env.VITE_DEVELOPMENT_URL, access_token);
      const id = await syncManager.queueOperation(type, entity, data, apiClient);
      return id;
    } catch (error) {
      console.error('Error queueing operation:', error);
      throw error;
    }
  }, [access_token]);

  // Clear sync errors
  const clearSyncErrors = useCallback(() => {
    syncManager.clearErrors();
    setSyncErrors([]);
  }, []);

  // Check if there are pending operations
  const hasPendingOperations = useCallback(async () => {
    return await syncManager.hasPendingOperations();
  }, []);

  const value = {
    isOnline,
    isSyncing,
    pendingCount,
    syncStatus,
    lastSyncTime,
    syncErrors,
    performSync,
    queueOperation,
    clearSyncErrors,
    hasPendingOperations,
    updatePendingCount
  };

  return (
    <OfflineContext.Provider value={value}>
      {children}
    </OfflineContext.Provider>
  );
};

// Custom hook to use offline context
export const useOffline = () => {
  const context = useContext(OfflineContext);

  if (!context) {
    throw new Error('useOffline must be used within an OfflineProvider');
  }

  return context;
};

// Custom hook for sync operations
export const useSync = () => {
  const {
    isSyncing,
    performSync,
    syncStatus,
    lastSyncTime,
    syncErrors,
    clearSyncErrors,
    pendingCount
  } = useOffline();

  return {
    isSyncing,
    performSync,
    syncStatus,
    lastSyncTime,
    syncErrors,
    clearSyncErrors,
    pendingCount
  };
};

// Custom hook for offline operations
export const useOfflineOperations = () => {
  const { queueOperation, isOnline, hasPendingOperations } = useOffline();

  const createOffline = useCallback(async (entity, data) => {
    return await queueOperation('create', entity, data);
  }, [queueOperation]);

  const updateOffline = useCallback(async (entity, data) => {
    return await queueOperation('update', entity, data);
  }, [queueOperation]);

  const deleteOffline = useCallback(async (entity, data) => {
    return await queueOperation('delete', entity, data);
  }, [queueOperation]);

  return {
    createOffline,
    updateOffline,
    deleteOffline,
    isOnline,
    hasPendingOperations
  };
};

export default OfflineContext;
