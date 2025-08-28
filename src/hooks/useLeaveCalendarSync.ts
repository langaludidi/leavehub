import { useCallback, useEffect } from 'react';
import { useCalendarIntegration } from './useCalendarIntegration';
import { createLeaveEvent } from '../lib/calendar';
import { supabase } from '../lib/supabase';

interface LeaveRequest {
  id: string;
  user_id: string;
  start_date: string;
  end_date: string;
  leave_type: string;
  reason?: string;
  status: 'pending' | 'approved' | 'denied';
  calendar_event_ids?: { [provider: string]: string };
}

interface UseLeaveCalendarSyncReturn {
  syncLeaveToCalendar: (leaveRequest: LeaveRequest, employeeName: string) => Promise<void>;
  removeLeaveFromCalendar: (leaveRequest: LeaveRequest) => Promise<void>;
  updateLeaveInCalendar: (leaveRequest: LeaveRequest, employeeName: string) => Promise<void>;
}

export function useLeaveCalendarSync(): UseLeaveCalendarSyncReturn {
  const {
    isConnected,
    createEvent,
    updateEvent,
    deleteEvent
  } = useCalendarIntegration();

  // Sync approved leave request to connected calendars
  const syncLeaveToCalendar = useCallback(async (
    leaveRequest: LeaveRequest, 
    employeeName: string
  ): Promise<void> => {
    if (leaveRequest.status !== 'approved') {
      return; // Only sync approved requests
    }

    const calendarEvent = createLeaveEvent(leaveRequest, employeeName);
    const eventIds: { [provider: string]: string } = {};

    // Sync to Google Calendar if connected
    if (isConnected('google')) {
      try {
        const eventId = await createEvent('google', calendarEvent);
        if (eventId) {
          eventIds.google = eventId;
        }
      } catch (error) {
        console.error('Failed to sync to Google Calendar:', error);
      }
    }

    // Sync to Outlook if connected
    if (isConnected('outlook')) {
      try {
        const eventId = await createEvent('outlook', calendarEvent);
        if (eventId) {
          eventIds.outlook = eventId;
        }
      } catch (error) {
        console.error('Failed to sync to Outlook:', error);
      }
    }

    // Update the leave request with calendar event IDs
    if (Object.keys(eventIds).length > 0) {
      try {
        await supabase
          .from('leave_requests')
          .update({ 
            calendar_event_ids: {
              ...leaveRequest.calendar_event_ids,
              ...eventIds
            }
          })
          .eq('id', leaveRequest.id);
      } catch (error) {
        console.error('Failed to update leave request with calendar event IDs:', error);
      }
    }
  }, [isConnected, createEvent]);

  // Remove leave request from connected calendars
  const removeLeaveFromCalendar = useCallback(async (
    leaveRequest: LeaveRequest
  ): Promise<void> => {
    if (!leaveRequest.calendar_event_ids) {
      return;
    }

    const promises: Promise<boolean>[] = [];

    // Remove from Google Calendar
    if (leaveRequest.calendar_event_ids.google && isConnected('google')) {
      promises.push(deleteEvent('google', leaveRequest.calendar_event_ids.google));
    }

    // Remove from Outlook
    if (leaveRequest.calendar_event_ids.outlook && isConnected('outlook')) {
      promises.push(deleteEvent('outlook', leaveRequest.calendar_event_ids.outlook));
    }

    try {
      await Promise.all(promises);
      
      // Clear calendar event IDs from the database
      await supabase
        .from('leave_requests')
        .update({ calendar_event_ids: null })
        .eq('id', leaveRequest.id);
    } catch (error) {
      console.error('Failed to remove leave from calendars:', error);
    }
  }, [isConnected, deleteEvent]);

  // Update leave request in connected calendars
  const updateLeaveInCalendar = useCallback(async (
    leaveRequest: LeaveRequest, 
    employeeName: string
  ): Promise<void> => {
    if (leaveRequest.status !== 'approved' || !leaveRequest.calendar_event_ids) {
      return;
    }

    const calendarEvent = createLeaveEvent(leaveRequest, employeeName);

    // Update Google Calendar event
    if (leaveRequest.calendar_event_ids.google && isConnected('google')) {
      try {
        await updateEvent('google', leaveRequest.calendar_event_ids.google, calendarEvent);
      } catch (error) {
        console.error('Failed to update Google Calendar event:', error);
      }
    }

    // Update Outlook event
    if (leaveRequest.calendar_event_ids.outlook && isConnected('outlook')) {
      try {
        await updateEvent('outlook', leaveRequest.calendar_event_ids.outlook, calendarEvent);
      } catch (error) {
        console.error('Failed to update Outlook event:', error);
      }
    }
  }, [isConnected, updateEvent]);

  return {
    syncLeaveToCalendar,
    removeLeaveFromCalendar,
    updateLeaveInCalendar
  };
}

// Hook for automatically syncing leave requests based on status changes
export function useAutoLeaveSync(userId: string) {
  const { syncLeaveToCalendar, removeLeaveFromCalendar } = useLeaveCalendarSync();

  useEffect(() => {
    // Subscribe to leave request changes
    const subscription = supabase
      .channel('leave_requests_calendar_sync')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'leave_requests',
          filter: `user_id=eq.${userId}`
        },
        async (payload) => {
          const leaveRequest = payload.new as LeaveRequest;
          
          // Get employee name for calendar event
          const { data: profile } = await supabase
            .from('profiles')
            .select('full_name, email')
            .eq('id', userId)
            .single();
          
          const employeeName = profile?.full_name || profile?.email || 'Employee';

          if (payload.eventType === 'INSERT' || payload.eventType === 'UPDATE') {
            if (leaveRequest.status === 'approved') {
              await syncLeaveToCalendar(leaveRequest, employeeName);
            } else if (leaveRequest.status === 'denied' && leaveRequest.calendar_event_ids) {
              await removeLeaveFromCalendar(leaveRequest);
            }
          } else if (payload.eventType === 'DELETE') {
            const oldRequest = payload.old as LeaveRequest;
            if (oldRequest.calendar_event_ids) {
              await removeLeaveFromCalendar(oldRequest);
            }
          }
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [userId, syncLeaveToCalendar, removeLeaveFromCalendar]);
}