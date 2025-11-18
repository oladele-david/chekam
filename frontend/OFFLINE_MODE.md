# Chekam Offline Mode Documentation

## Overview

Chekam now supports full offline functionality as a Progressive Web App (PWA). Users can continue using the app without an internet connection, and all changes will automatically sync when the connection is restored.

## Features

### 1. **Service Worker Caching**
- Static assets are cached for offline access
- API responses are cached with network-first strategy
- Automatic cache updates when new versions are deployed

### 2. **IndexedDB Offline Storage**
- Local storage for budgets, categories, transactions, and notifications
- Sync queue for operations performed while offline
- Automatic cleanup of synced operations

### 3. **Background Sync**
- Automatic sync when connection is restored
- Manual sync trigger available
- Retry logic for failed sync operations (up to 3 attempts)

### 4. **PWA Features**
- Installable on desktop and mobile devices
- App shortcuts for quick access to common features
- Offline fallback page
- Native app-like experience

## How It Works

### Online Mode
1. User performs operations (create, update, delete)
2. Operations are sent to the server immediately
3. Data is also cached locally for offline access
4. Service worker caches responses

### Offline Mode
1. User performs operations while offline
2. Operations are queued in IndexedDB sync queue
3. Data is stored locally in IndexedDB
4. User sees offline indicator with pending count
5. When connection is restored:
   - Sync automatically starts
   - Queued operations are sent to server
   - Local data is synced with server
   - User is notified of sync completion

## Components

### OfflineProvider Context
Provides offline state and sync functionality throughout the app.

```javascript
import { useOffline, useSync, useOfflineOperations } from '@/contexts/OfflineContext';

// In your component
const { isOnline, pendingCount } = useOffline();
const { isSyncing, performSync } = useSync();
const { createOffline, updateOffline, deleteOffline } = useOfflineOperations();
```

### OfflineIndicator Component
Visual indicator showing:
- Offline status
- Sync progress
- Pending operations count
- Sync errors
- Manual sync button

### Custom Hooks

#### `useOffline()`
Returns offline state and operations:
- `isOnline`: Boolean - Connection status
- `isSyncing`: Boolean - Sync in progress
- `pendingCount`: Number - Pending operations
- `performSync()`: Function - Trigger manual sync
- `queueOperation()`: Function - Queue an operation

#### `useSync()`
Returns sync-specific state:
- `isSyncing`: Boolean
- `performSync()`: Function
- `syncStatus`: String
- `lastSyncTime`: String
- `syncErrors`: Array
- `clearSyncErrors()`: Function

#### `useOfflineOperations()`
Returns CRUD operations for offline mode:
- `createOffline(entity, data)`: Create operation
- `updateOffline(entity, data)`: Update operation
- `deleteOffline(entity, data)`: Delete operation
- `isOnline`: Boolean
- `hasPendingOperations()`: Function

## Usage Example

### Using Offline Operations in a Component

```javascript
import { useOfflineOperations } from '@/contexts/OfflineContext';

function BudgetForm() {
  const { createOffline, isOnline } = useOfflineOperations();

  const handleSubmit = async (budgetData) => {
    if (isOnline) {
      // Normal API call
      await apiClient.post('/budgets', budgetData);
    } else {
      // Queue for sync
      await createOffline('budget', budgetData);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      {/* form fields */}
    </form>
  );
}
```

### Manual Sync Trigger

```javascript
import { useSync } from '@/contexts/OfflineContext';

function SyncButton() {
  const { performSync, isSyncing, pendingCount } = useSync();

  return (
    <button onClick={performSync} disabled={isSyncing}>
      {isSyncing ? 'Syncing...' : `Sync (${pendingCount})`}
    </button>
  );
}
```

## Files Structure

```
frontend/
├── public/
│   ├── sw.js                      # Service Worker
│   ├── offline.html               # Offline fallback page
│   └── manifest.json              # PWA manifest
├── src/
│   ├── contexts/
│   │   └── OfflineContext.jsx     # Offline context and hooks
│   ├── components/
│   │   └── OfflineIndicator.jsx   # Offline status indicator
│   └── utils/
│       └── offline/
│           ├── db.js              # IndexedDB utilities
│           └── syncManager.js     # Sync manager
```

## Testing Offline Mode

### In Chrome DevTools:
1. Open DevTools (F12)
2. Go to Network tab
3. Select "Offline" from throttling dropdown
4. Test app functionality
5. Go back online to see sync

### In Application Tab:
1. Check "Service Workers" for registration status
2. Check "IndexedDB" > "ChekamOfflineDB" for stored data
3. Check "Cache Storage" for cached resources

## Sync Queue Operations

The sync queue stores operations with the following structure:
```javascript
{
  id: 1,
  type: 'create' | 'update' | 'delete',
  entity: 'budget' | 'category' | 'transaction',
  data: { /* operation data */ },
  timestamp: '2025-01-01T00:00:00Z',
  status: 'pending' | 'syncing' | 'completed' | 'failed',
  retries: 0
}
```

## Error Handling

- Failed operations retry up to 3 times
- After 3 failures, operation is marked as failed
- User can view errors in OfflineIndicator
- Manual retry available through "Retry Sync" button
- Errors can be cleared manually

## Cache Strategy

### Static Assets (Cache-First)
- JavaScript bundles
- CSS files
- Images
- Fonts
- Icons

### API Calls (Network-First)
- Dashboard data
- Transactions
- Budgets
- Categories
- Analytics

### Fallback
- Offline page for navigation
- Error response for API calls

## PWA Installation

### Desktop (Chrome)
1. Visit the app
2. Look for install icon in address bar
3. Click to install
4. App appears in applications menu

### Mobile (Chrome/Safari)
1. Visit the app
2. Tap "Add to Home Screen"
3. Confirm installation
4. App appears on home screen

## Performance Considerations

- IndexedDB operations are asynchronous
- Sync operations run sequentially to maintain order
- Cache size is managed automatically
- Old sync operations (>7 days) are cleaned up automatically
- Service worker updates check every minute

## Browser Support

- Chrome 67+
- Firefox 62+
- Safari 11.1+
- Edge 79+
- Opera 54+

Note: IndexedDB and Service Workers are required for offline functionality.

## Future Enhancements

- Conflict resolution strategies (currently last-write-wins)
- Selective sync (choose what to sync)
- Background sync for large operations
- Push notifications for sync status
- Offline analytics
- Data compression for storage optimization
