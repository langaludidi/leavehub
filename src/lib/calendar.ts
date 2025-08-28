// Calendar integration utilities for Google Calendar and Outlook
export interface CalendarEvent {
  id?: string;
  title: string;
  description?: string;
  start: string;
  end: string;
  allDay?: boolean;
}

export interface CalendarProvider {
  name: string;
  id: 'google' | 'outlook';
  icon: string;
  color: string;
}

export const CALENDAR_PROVIDERS: CalendarProvider[] = [
  {
    name: 'Google Calendar',
    id: 'google',
    icon: '📅',
    color: 'bg-blue-500'
  },
  {
    name: 'Microsoft Outlook',
    id: 'outlook',
    icon: '📧',
    color: 'bg-blue-600'
  }
];

// Google Calendar integration
export class GoogleCalendarIntegration {
  private readonly clientId: string;
  private readonly apiKey: string;
  private readonly scope = 'https://www.googleapis.com/auth/calendar';
  private gapi: any;
  
  constructor(clientId: string, apiKey: string) {
    this.clientId = clientId;
    this.apiKey = apiKey;
  }

  async init(): Promise<void> {
    return new Promise((resolve, reject) => {
      if (typeof window === 'undefined') {
        reject(new Error('Google Calendar integration requires browser environment'));
        return;
      }

      // Load Google API script if not already loaded
      if (!window.gapi) {
        const script = document.createElement('script');
        script.src = 'https://apis.google.com/js/api.js';
        script.onload = () => {
          window.gapi.load('client:auth2', () => {
            this.gapi = window.gapi;
            this.initClient().then(resolve).catch(reject);
          });
        };
        script.onerror = () => reject(new Error('Failed to load Google API'));
        document.head.appendChild(script);
      } else {
        this.gapi = window.gapi;
        this.initClient().then(resolve).catch(reject);
      }
    });
  }

  private async initClient(): Promise<void> {
    await this.gapi.client.init({
      apiKey: this.apiKey,
      clientId: this.clientId,
      discoveryDocs: ['https://www.googleapis.com/discovery/v1/apis/calendar/v3/rest'],
      scope: this.scope
    });
  }

  async signIn(): Promise<boolean> {
    try {
      const authInstance = this.gapi.auth2.getAuthInstance();
      const user = await authInstance.signIn();
      return user.isSignedIn();
    } catch (error) {
      console.error('Google Calendar sign in failed:', error);
      return false;
    }
  }

  async signOut(): Promise<void> {
    const authInstance = this.gapi.auth2.getAuthInstance();
    await authInstance.signOut();
  }

  isSignedIn(): boolean {
    if (!this.gapi?.auth2) return false;
    const authInstance = this.gapi.auth2.getAuthInstance();
    return authInstance.isSignedIn.get();
  }

  async createEvent(event: CalendarEvent): Promise<string | null> {
    if (!this.isSignedIn()) {
      throw new Error('Not signed in to Google Calendar');
    }

    try {
      const response = await this.gapi.client.calendar.events.insert({
        calendarId: 'primary',
        resource: {
          summary: event.title,
          description: event.description,
          start: event.allDay 
            ? { date: event.start.split('T')[0] }
            : { dateTime: event.start },
          end: event.allDay 
            ? { date: event.end.split('T')[0] }
            : { dateTime: event.end }
        }
      });

      return response.result.id;
    } catch (error) {
      console.error('Failed to create Google Calendar event:', error);
      return null;
    }
  }

  async updateEvent(eventId: string, event: CalendarEvent): Promise<boolean> {
    if (!this.isSignedIn()) return false;

    try {
      await this.gapi.client.calendar.events.update({
        calendarId: 'primary',
        eventId,
        resource: {
          summary: event.title,
          description: event.description,
          start: event.allDay 
            ? { date: event.start.split('T')[0] }
            : { dateTime: event.start },
          end: event.allDay 
            ? { date: event.end.split('T')[0] }
            : { dateTime: event.end }
        }
      });

      return true;
    } catch (error) {
      console.error('Failed to update Google Calendar event:', error);
      return false;
    }
  }

  async deleteEvent(eventId: string): Promise<boolean> {
    if (!this.isSignedIn()) return false;

    try {
      await this.gapi.client.calendar.events.delete({
        calendarId: 'primary',
        eventId
      });

      return true;
    } catch (error) {
      console.error('Failed to delete Google Calendar event:', error);
      return false;
    }
  }
}

// Microsoft Outlook integration using Microsoft Graph API
export class OutlookCalendarIntegration {
  private readonly clientId: string;
  private readonly redirectUri: string;
  private readonly scope = 'https://graph.microsoft.com/calendars.readwrite';
  private accessToken: string | null = null;

  constructor(clientId: string, redirectUri: string) {
    this.clientId = clientId;
    this.redirectUri = redirectUri;
  }

  async signIn(): Promise<boolean> {
    try {
      // Use Microsoft Authentication Library (MSAL) for production
      // For now, implementing basic OAuth2 flow
      const authUrl = `https://login.microsoftonline.com/common/oauth2/v2.0/authorize?` +
        `client_id=${this.clientId}&` +
        `response_type=token&` +
        `redirect_uri=${encodeURIComponent(this.redirectUri)}&` +
        `scope=${encodeURIComponent(this.scope)}`;

      // Open popup for authentication
      const popup = window.open(authUrl, 'outlook-auth', 'width=500,height=600');
      
      return new Promise((resolve) => {
        const checkClosed = setInterval(() => {
          if (popup?.closed) {
            clearInterval(checkClosed);
            // Check if we got the token from the URL hash
            const token = this.extractTokenFromUrl();
            if (token) {
              this.accessToken = token;
              localStorage.setItem('outlook_access_token', token);
              resolve(true);
            } else {
              resolve(false);
            }
          }
        }, 1000);
      });
    } catch (error) {
      console.error('Outlook Calendar sign in failed:', error);
      return false;
    }
  }

  private extractTokenFromUrl(): string | null {
    const hash = window.location.hash.substring(1);
    const params = new URLSearchParams(hash);
    return params.get('access_token');
  }

  async signOut(): Promise<void> {
    this.accessToken = null;
    localStorage.removeItem('outlook_access_token');
  }

  isSignedIn(): boolean {
    if (!this.accessToken) {
      this.accessToken = localStorage.getItem('outlook_access_token');
    }
    return !!this.accessToken;
  }

  async createEvent(event: CalendarEvent): Promise<string | null> {
    if (!this.isSignedIn()) {
      throw new Error('Not signed in to Outlook');
    }

    try {
      const response = await fetch('https://graph.microsoft.com/v1.0/me/events', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.accessToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          subject: event.title,
          body: {
            contentType: 'text',
            content: event.description || ''
          },
          start: {
            dateTime: event.start,
            timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone
          },
          end: {
            dateTime: event.end,
            timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone
          },
          isAllDay: event.allDay || false
        })
      });

      if (response.ok) {
        const result = await response.json();
        return result.id;
      }

      return null;
    } catch (error) {
      console.error('Failed to create Outlook event:', error);
      return null;
    }
  }

  async updateEvent(eventId: string, event: CalendarEvent): Promise<boolean> {
    if (!this.isSignedIn()) return false;

    try {
      const response = await fetch(`https://graph.microsoft.com/v1.0/me/events/${eventId}`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${this.accessToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          subject: event.title,
          body: {
            contentType: 'text',
            content: event.description || ''
          },
          start: {
            dateTime: event.start,
            timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone
          },
          end: {
            dateTime: event.end,
            timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone
          },
          isAllDay: event.allDay || false
        })
      });

      return response.ok;
    } catch (error) {
      console.error('Failed to update Outlook event:', error);
      return false;
    }
  }

  async deleteEvent(eventId: string): Promise<boolean> {
    if (!this.isSignedIn()) return false;

    try {
      const response = await fetch(`https://graph.microsoft.com/v1.0/me/events/${eventId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${this.accessToken}`
        }
      });

      return response.ok;
    } catch (error) {
      console.error('Failed to delete Outlook event:', error);
      return false;
    }
  }
}

// Utility functions
export function formatDateForCalendar(date: Date): string {
  return date.toISOString();
}

export function createLeaveEvent(
  leaveRequest: {
    start_date: string;
    end_date: string;
    leave_type: string;
    reason?: string;
  },
  employeeName: string
): CalendarEvent {
  const startDate = new Date(leaveRequest.start_date);
  const endDate = new Date(leaveRequest.end_date);
  
  // Add one day to end date for all-day events
  endDate.setDate(endDate.getDate() + 1);

  return {
    title: `${employeeName} - ${leaveRequest.leave_type.charAt(0).toUpperCase() + leaveRequest.leave_type.slice(1)} Leave`,
    description: leaveRequest.reason 
      ? `Leave Request: ${leaveRequest.reason}`
      : `${leaveRequest.leave_type} leave request`,
    start: formatDateForCalendar(startDate),
    end: formatDateForCalendar(endDate),
    allDay: true
  };
}