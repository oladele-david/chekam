import React, { useState } from 'react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import {
  WifiOff,
  Wifi,
  RefreshCw,
  AlertCircle,
  CheckCircle2,
  Loader2,
  X
} from 'lucide-react';
import { useOffline, useSync } from '../contexts/OfflineContext';

const OfflineIndicator = () => {
  const { isOnline, pendingCount } = useOffline();
  const { isSyncing, performSync, syncErrors, clearSyncErrors } = useSync();
  const [isMinimized, setIsMinimized] = useState(false);
  const [showErrors, setShowErrors] = useState(false);

  // Don't show anything if online and no pending operations
  if (isOnline && pendingCount === 0 && !isSyncing && syncErrors.length === 0) {
    return null;
  }

  // Handle manual sync
  const handleSync = async () => {
    try {
      await performSync();
    } catch (error) {
      console.error('Manual sync failed:', error);
    }
  };

  // Render minimized version
  if (isMinimized) {
    return (
      <div className="fixed bottom-4 right-4 z-50">
        <Button
          onClick={() => setIsMinimized(false)}
          className={`rounded-full h-12 w-12 shadow-lg ${
            isOnline
              ? 'bg-customBlue hover:bg-blue-700'
              : 'bg-orange-500 hover:bg-orange-600'
          }`}
        >
          {!isOnline ? (
            <WifiOff className="h-5 w-5 text-white" />
          ) : isSyncing ? (
            <Loader2 className="h-5 w-5 text-white animate-spin" />
          ) : pendingCount > 0 ? (
            <div className="relative">
              <RefreshCw className="h-5 w-5 text-white" />
              {pendingCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                  {pendingCount}
                </span>
              )}
            </div>
          ) : (
            <Wifi className="h-5 w-5 text-white" />
          )}
        </Button>
      </div>
    );
  }

  return (
    <div className="fixed bottom-4 right-4 z-50 max-w-md">
      {/* Offline/Sync Status Alert */}
      {!isOnline && (
        <Alert className="mb-2 border-orange-200 bg-orange-50 shadow-lg">
          <WifiOff className="h-4 w-4 text-orange-600" />
          <AlertDescription className="flex items-center justify-between">
            <div className="flex-1">
              <p className="font-semibold text-orange-900">You're Offline</p>
              <p className="text-sm text-orange-700">
                Changes will sync when connection is restored
              </p>
              {pendingCount > 0 && (
                <p className="text-xs text-orange-600 mt-1">
                  {pendingCount} operation{pendingCount !== 1 ? 's' : ''} pending
                </p>
              )}
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsMinimized(true)}
              className="ml-2"
            >
              <X className="h-4 w-4" />
            </Button>
          </AlertDescription>
        </Alert>
      )}

      {/* Syncing Status */}
      {isOnline && isSyncing && (
        <Alert className="mb-2 border-blue-200 bg-blue-50 shadow-lg">
          <Loader2 className="h-4 w-4 text-customBlue animate-spin" />
          <AlertDescription className="flex items-center justify-between">
            <div className="flex-1">
              <p className="font-semibold text-customBlue">Syncing...</p>
              <p className="text-sm text-blue-700">
                Syncing your data with the server
              </p>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsMinimized(true)}
              className="ml-2"
            >
              <X className="h-4 w-4" />
            </Button>
          </AlertDescription>
        </Alert>
      )}

      {/* Pending Operations */}
      {isOnline && !isSyncing && pendingCount > 0 && (
        <Alert className="mb-2 border-yellow-200 bg-yellow-50 shadow-lg">
          <RefreshCw className="h-4 w-4 text-yellow-600" />
          <AlertDescription className="flex items-center justify-between">
            <div className="flex-1">
              <p className="font-semibold text-yellow-900">Sync Pending</p>
              <p className="text-sm text-yellow-700">
                {pendingCount} operation{pendingCount !== 1 ? 's' : ''} waiting to sync
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Button
                onClick={handleSync}
                size="sm"
                className="bg-yellow-600 hover:bg-yellow-700 text-white"
              >
                Sync Now
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsMinimized(true)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </AlertDescription>
        </Alert>
      )}

      {/* Sync Errors */}
      {syncErrors.length > 0 && (
        <Alert variant="destructive" className="shadow-lg">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            <div className="flex items-center justify-between mb-2">
              <p className="font-semibold">Sync Errors ({syncErrors.length})</p>
              <div className="flex items-center gap-2">
                <Button
                  onClick={() => setShowErrors(!showErrors)}
                  size="sm"
                  variant="ghost"
                  className="text-red-700"
                >
                  {showErrors ? 'Hide' : 'Show'}
                </Button>
                <Button
                  onClick={clearSyncErrors}
                  size="sm"
                  variant="ghost"
                  className="text-red-700"
                >
                  Clear
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsMinimized(true)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {showErrors && (
              <div className="mt-2 space-y-1 max-h-40 overflow-y-auto">
                {syncErrors.map((error, index) => (
                  <div
                    key={index}
                    className="text-sm p-2 bg-red-100 rounded border border-red-200"
                  >
                    <p className="font-medium">
                      {error.operation?.entity} - {error.operation?.type}
                    </p>
                    <p className="text-xs text-red-700">{error.error}</p>
                  </div>
                ))}
              </div>
            )}

            <div className="mt-2 flex gap-2">
              <Button
                onClick={handleSync}
                size="sm"
                className="bg-red-600 hover:bg-red-700"
              >
                <RefreshCw className="h-3 w-3 mr-1" />
                Retry Sync
              </Button>
            </div>
          </AlertDescription>
        </Alert>
      )}

      {/* Sync Success (temporary) */}
      {isOnline && !isSyncing && pendingCount === 0 && syncErrors.length === 0 && (
        <Alert className="border-green-200 bg-green-50 shadow-lg">
          <CheckCircle2 className="h-4 w-4 text-green-600" />
          <AlertDescription className="flex items-center justify-between">
            <div className="flex-1">
              <p className="font-semibold text-green-900">All Synced</p>
              <p className="text-sm text-green-700">
                Your data is up to date
              </p>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsMinimized(true)}
              className="ml-2"
            >
              <X className="h-4 w-4" />
            </Button>
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
};

export default OfflineIndicator;
