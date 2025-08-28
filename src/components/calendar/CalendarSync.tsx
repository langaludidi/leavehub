import { useState } from 'react';
import { useCalendarIntegration } from '../../hooks/useCalendarIntegration';
import { CalendarProvider } from '../../lib/calendar';

interface CalendarSyncProps {
  onSync?: (provider: 'google' | 'outlook', success: boolean) => void;
  compact?: boolean;
}

export default function CalendarSync({ onSync, compact = false }: CalendarSyncProps) {
  const {
    providers,
    isConnected,
    connect,
    disconnect,
    loading,
    error
  } = useCalendarIntegration();
  
  const [connectingProvider, setConnectingProvider] = useState<'google' | 'outlook' | null>(null);

  const handleConnect = async (providerId: 'google' | 'outlook') => {
    setConnectingProvider(providerId);
    
    try {
      const success = await connect(providerId);
      onSync?.(providerId, success);
      
      if (success) {
        // Show success message or toast
        console.log(`Connected to ${providerId} successfully`);
      }
    } finally {
      setConnectingProvider(null);
    }
  };

  const handleDisconnect = async (providerId: 'google' | 'outlook') => {
    try {
      await disconnect(providerId);
      onSync?.(providerId, false);
      console.log(`Disconnected from ${providerId}`);
    } catch (err) {
      console.error(`Failed to disconnect from ${providerId}:`, err);
    }
  };

  if (compact) {
    return (
      <div className="flex items-center gap-2">
        {providers.map((provider) => {
          const connected = isConnected(provider.id);
          const isConnecting = connectingProvider === provider.id;
          
          return (
            <button
              key={provider.id}
              onClick={() => connected ? handleDisconnect(provider.id) : handleConnect(provider.id)}
              disabled={loading || isConnecting}
              className={[
                'inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-md transition',
                connected
                  ? 'bg-green-100 text-green-700 hover:bg-green-200 dark:bg-green-900/20 dark:text-green-300'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300'
              ].join(' ')}
              title={connected ? `Disconnect ${provider.name}` : `Connect ${provider.name}`}
            >
              <span>{provider.icon}</span>
              {isConnecting ? (
                <div className="w-3 h-3 border border-current border-t-transparent rounded-full animate-spin" />
              ) : connected ? (
                <span className="text-green-600">✓</span>
              ) : (
                <span>+</span>
              )}
            </button>
          );
        })}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Calendar Integration</h3>
        <div className="text-sm text-gray-500 dark:text-gray-400">
          Sync your leave with your calendar
        </div>
      </div>

      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      <div className="grid gap-3">
        {providers.map((provider) => {
          const connected = isConnected(provider.id);
          const isConnecting = connectingProvider === provider.id;
          
          return (
            <CalendarProviderCard
              key={provider.id}
              provider={provider}
              connected={connected}
              connecting={isConnecting}
              onConnect={() => handleConnect(provider.id)}
              onDisconnect={() => handleDisconnect(provider.id)}
            />
          );
        })}
      </div>

      <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
        <div className="flex items-start gap-2">
          <span className="text-blue-600 mt-0.5">💡</span>
          <div className="text-sm text-blue-700">
            <p className="font-medium mb-1">How calendar sync works:</p>
            <ul className="text-xs space-y-1 text-blue-600">
              <li>• Approved leave requests are automatically added to your calendar</li>
              <li>• Updates to leave dates sync to your calendar events</li>
              <li>• Cancelled requests remove calendar events automatically</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

interface CalendarProviderCardProps {
  provider: CalendarProvider;
  connected: boolean;
  connecting: boolean;
  onConnect: () => void;
  onDisconnect: () => void;
}

function CalendarProviderCard({ 
  provider, 
  connected, 
  connecting, 
  onConnect, 
  onDisconnect 
}: CalendarProviderCardProps) {
  return (
    <div className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
      <div className="flex items-center gap-3">
        <div className={[
          'w-10 h-10 rounded-lg flex items-center justify-center text-xl',
          provider.color,
          'text-white'
        ].join(' ')}>
          {provider.icon}
        </div>
        <div>
          <h4 className="font-medium">{provider.name}</h4>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {connected ? 'Connected' : 'Not connected'}
          </p>
        </div>
      </div>

      <button
        onClick={connected ? onDisconnect : onConnect}
        disabled={connecting}
        className={[
          'px-4 py-2 text-sm font-medium rounded-lg transition',
          connected
            ? 'bg-red-100 text-red-700 hover:bg-red-200 dark:bg-red-900/20 dark:text-red-300'
            : 'bg-blue-100 text-blue-700 hover:bg-blue-200 dark:bg-blue-900/20 dark:text-blue-300',
          connecting && 'opacity-50 cursor-not-allowed'
        ].join(' ')}
      >
        {connecting ? (
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 border border-current border-t-transparent rounded-full animate-spin" />
            Connecting...
          </div>
        ) : connected ? (
          'Disconnect'
        ) : (
          'Connect'
        )}
      </button>
    </div>
  );
}