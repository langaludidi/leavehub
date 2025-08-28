import { useState, useEffect, useCallback } from 'react';
import { 
  GoogleCalendarIntegration, 
  OutlookCalendarIntegration, 
  CalendarEvent, 
  CalendarProvider,
  CALENDAR_PROVIDERS
} from '../lib/calendar';

interface CalendarIntegrationState {
  google: {
    connected: boolean;
    integration: GoogleCalendarIntegration | null;
  };
  outlook: {
    connected: boolean;
    integration: OutlookCalendarIntegration | null;
  };
}

interface UseCalendarIntegrationReturn {
  providers: CalendarProvider[];
  isConnected: (provider: 'google' | 'outlook') => boolean;
  connect: (provider: 'google' | 'outlook') => Promise<boolean>;
  disconnect: (provider: 'google' | 'outlook') => Promise<void>;
  createEvent: (provider: 'google' | 'outlook', event: CalendarEvent) => Promise<string | null>;
  updateEvent: (provider: 'google' | 'outlook', eventId: string, event: CalendarEvent) => Promise<boolean>;
  deleteEvent: (provider: 'google' | 'outlook', eventId: string) => Promise<boolean>;
  loading: boolean;
  error: string | null;
}

export function useCalendarIntegration(): UseCalendarIntegrationReturn {
  const [state, setState] = useState<CalendarIntegrationState>({
    google: { connected: false, integration: null },
    outlook: { connected: false, integration: null }
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Initialize integrations
  useEffect(() => {
    const initIntegrations = async () => {
      try {
        setLoading(true);
        
        // Initialize Google Calendar (you'll need to set these environment variables)
        const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
        const googleApiKey = import.meta.env.VITE_GOOGLE_API_KEY;
        
        if (googleClientId && googleApiKey) {
          const googleIntegration = new GoogleCalendarIntegration(googleClientId, googleApiKey);
          await googleIntegration.init();
          
          setState(prev => ({
            ...prev,
            google: {
              integration: googleIntegration,
              connected: googleIntegration.isSignedIn()
            }
          }));
        }

        // Initialize Outlook Calendar
        const outlookClientId = import.meta.env.VITE_OUTLOOK_CLIENT_ID;
        const outlookRedirectUri = `${window.location.origin}/auth/outlook/callback`;
        
        if (outlookClientId) {
          const outlookIntegration = new OutlookCalendarIntegration(outlookClientId, outlookRedirectUri);
          
          setState(prev => ({
            ...prev,
            outlook: {
              integration: outlookIntegration,
              connected: outlookIntegration.isSignedIn()
            }
          }));
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to initialize calendar integrations');
      } finally {
        setLoading(false);
      }
    };

    initIntegrations();
  }, []);

  const isConnected = useCallback((provider: 'google' | 'outlook'): boolean => {
    return state[provider].connected;
  }, [state]);

  const connect = useCallback(async (provider: 'google' | 'outlook'): Promise<boolean> => {
    try {
      setLoading(true);
      setError(null);

      const integration = state[provider].integration;
      if (!integration) {
        throw new Error(`${provider} integration not initialized`);
      }

      const success = await integration.signIn();
      
      setState(prev => ({
        ...prev,
        [provider]: {
          ...prev[provider],
          connected: success
        }
      }));

      return success;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : `Failed to connect to ${provider}`;
      setError(errorMessage);
      return false;
    } finally {
      setLoading(false);
    }
  }, [state]);

  const disconnect = useCallback(async (provider: 'google' | 'outlook'): Promise<void> => {
    try {
      setLoading(true);
      setError(null);

      const integration = state[provider].integration;
      if (!integration) {
        throw new Error(`${provider} integration not initialized`);
      }

      await integration.signOut();
      
      setState(prev => ({
        ...prev,
        [provider]: {
          ...prev[provider],
          connected: false
        }
      }));
    } catch (err) {
      setError(err instanceof Error ? err.message : `Failed to disconnect from ${provider}`);
    } finally {
      setLoading(false);
    }
  }, [state]);

  const createEvent = useCallback(async (
    provider: 'google' | 'outlook', 
    event: CalendarEvent
  ): Promise<string | null> => {
    try {
      setError(null);
      const integration = state[provider].integration;
      
      if (!integration) {
        throw new Error(`${provider} integration not initialized`);
      }

      if (!state[provider].connected) {
        throw new Error(`Not connected to ${provider}`);
      }

      return await integration.createEvent(event);
    } catch (err) {
      setError(err instanceof Error ? err.message : `Failed to create ${provider} event`);
      return null;
    }
  }, [state]);

  const updateEvent = useCallback(async (
    provider: 'google' | 'outlook', 
    eventId: string,
    event: CalendarEvent
  ): Promise<boolean> => {
    try {
      setError(null);
      const integration = state[provider].integration;
      
      if (!integration) {
        throw new Error(`${provider} integration not initialized`);
      }

      if (!state[provider].connected) {
        throw new Error(`Not connected to ${provider}`);
      }

      return await integration.updateEvent(eventId, event);
    } catch (err) {
      setError(err instanceof Error ? err.message : `Failed to update ${provider} event`);
      return false;
    }
  }, [state]);

  const deleteEvent = useCallback(async (
    provider: 'google' | 'outlook', 
    eventId: string
  ): Promise<boolean> => {
    try {
      setError(null);
      const integration = state[provider].integration;
      
      if (!integration) {
        throw new Error(`${provider} integration not initialized`);
      }

      if (!state[provider].connected) {
        throw new Error(`Not connected to ${provider}`);
      }

      return await integration.deleteEvent(eventId);
    } catch (err) {
      setError(err instanceof Error ? err.message : `Failed to delete ${provider} event`);
      return false;
    }
  }, [state]);

  return {
    providers: CALENDAR_PROVIDERS,
    isConnected,
    connect,
    disconnect,
    createEvent,
    updateEvent,
    deleteEvent,
    loading,
    error
  };
}