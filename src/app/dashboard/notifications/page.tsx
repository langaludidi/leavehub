'use client';

import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Bell,
  Check,
  X,
  CheckCheck,
  Trash2,
  Filter,
  Calendar,
  AlertCircle,
  FileText,
  TrendingUp,
} from 'lucide-react';
import { formatDistanceToNow, format } from 'date-fns';
import Link from 'next/link';
import DashboardHeader from '@/components/DashboardHeader';

interface Notification {
  id: string;
  type: string;
  title: string;
  message: string;
  action_url: string | null;
  is_read: boolean;
  created_at: string;
  read_at: string | null;
  metadata: Record<string, unknown> | null;
}

export default function NotificationsPage() {
  const userId = 'demo-user-123';
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [filter, setFilter] = useState<'all' | 'unread' | 'read'>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [loading, setLoading] = useState(true);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    fetchNotifications();
  }, [userId]);

  async function fetchNotifications() {
    setLoading(true);
    try {
      const response = await fetch(`/api/notifications?userId=${userId}&limit=100`);
      const data = await response.json();

      if (data.notifications) {
        setNotifications(data.notifications);
      }
    } catch (error) {
      console.error('Error fetching notifications:', error);
    } finally {
      setLoading(false);
    }
  }

  async function markAsRead(notificationId: string) {
    try {
      await fetch(`/api/notifications/${notificationId}`, {
        method: 'PATCH',
      });

      setNotifications(notifications.map(n =>
        n.id === notificationId ? { ...n, is_read: true, read_at: new Date().toISOString() } : n
      ));
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  }

  async function markAllAsRead() {
    try {
      await fetch('/api/notifications', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, action: 'mark_all_read' }),
      });

      setNotifications(notifications.map(n => ({
        ...n,
        is_read: true,
        read_at: new Date().toISOString()
      })));
    } catch (error) {
      console.error('Error marking all as read:', error);
    }
  }

  async function deleteNotification(notificationId: string) {
    try {
      await fetch(`/api/notifications/${notificationId}`, {
        method: 'DELETE',
      });

      setNotifications(notifications.filter(n => n.id !== notificationId));
      selectedIds.delete(notificationId);
      setSelectedIds(new Set(selectedIds));
    } catch (error) {
      console.error('Error deleting notification:', error);
    }
  }

  async function deleteSelected() {
    try {
      await Promise.all(
        Array.from(selectedIds).map(id =>
          fetch(`/api/notifications/${id}`, { method: 'DELETE' })
        )
      );

      setNotifications(notifications.filter(n => !selectedIds.has(n.id)));
      setSelectedIds(new Set());
    } catch (error) {
      console.error('Error deleting selected notifications:', error);
    }
  }

  function toggleSelect(id: string) {
    const newSelected = new Set(selectedIds);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedIds(newSelected);
  }

  function toggleSelectAll() {
    if (selectedIds.size === filteredNotifications.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(filteredNotifications.map(n => n.id)));
    }
  }

  function getNotificationIcon(type: string) {
    switch (type) {
      case 'leave_request_approved':
        return <Check className="w-6 h-6 text-green-500" />;
      case 'leave_request_rejected':
        return <X className="w-6 h-6 text-red-500" />;
      case 'leave_request_submitted':
        return <FileText className="w-6 h-6 text-blue-500" />;
      case 'leave_balance_low':
        return <AlertCircle className="w-6 h-6 text-yellow-500" />;
      case 'leave_reminder':
        return <Calendar className="w-6 h-6 text-purple-500" />;
      default:
        return <Bell className="w-6 h-6 text-gray-500" />;
    }
  }

  function getNotificationColor(type: string) {
    switch (type) {
      case 'leave_request_approved':
        return 'border-l-green-500 bg-green-50';
      case 'leave_request_rejected':
        return 'border-l-red-500 bg-red-50';
      case 'leave_request_submitted':
        return 'border-l-blue-500 bg-blue-50';
      case 'leave_balance_low':
        return 'border-l-yellow-500 bg-yellow-50';
      case 'leave_reminder':
        return 'border-l-purple-500 bg-purple-50';
      default:
        return 'border-l-gray-500 bg-gray-50';
    }
  }

  // Filter notifications
  const filteredNotifications = notifications.filter(n => {
    if (filter === 'unread' && n.is_read) return false;
    if (filter === 'read' && !n.is_read) return false;
    if (typeFilter !== 'all' && n.type !== typeFilter) return false;
    return true;
  });

  const unreadCount = notifications.filter(n => !n.is_read).length;
  const notificationTypes = Array.from(new Set(notifications.map(n => n.type)));

  return (
    <div className="min-h-screen bg-gray-50">
      <DashboardHeader userId={userId} userName="Demo User" />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Notifications</h1>
          <p className="text-gray-600">
            {unreadCount > 0
              ? `You have ${unreadCount} unread notification${unreadCount !== 1 ? 's' : ''}`
              : 'You\'re all caught up!'}
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid md:grid-cols-3 gap-6 mb-6">
          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <Bell className="w-6 h-6 text-blue-600" />
              </div>
              <span className="text-2xl font-bold text-gray-900">
                {notifications.length}
              </span>
            </div>
            <h3 className="font-semibold mb-1">Total Notifications</h3>
            <p className="text-sm text-gray-600">All time</p>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                <AlertCircle className="w-6 h-6 text-red-600" />
              </div>
              <span className="text-2xl font-bold text-red-600">
                {unreadCount}
              </span>
            </div>
            <h3 className="font-semibold mb-1">Unread</h3>
            <p className="text-sm text-gray-600">Requires attention</p>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <CheckCheck className="w-6 h-6 text-green-600" />
              </div>
              <span className="text-2xl font-bold text-green-600">
                {notifications.filter(n => n.is_read).length}
              </span>
            </div>
            <h3 className="font-semibold mb-1">Read</h3>
            <p className="text-sm text-gray-600">Marked as read</p>
          </Card>
        </div>

        {/* Controls */}
        <Card className="p-6 mb-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            {/* Filters */}
            <div className="flex items-center gap-3">
              <Filter className="w-5 h-5 text-gray-600" />
              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value as 'all' | 'unread' | 'read')}
                className="px-3 py-2 border border-gray-300 rounded-md text-sm"
              >
                <option value="all">All Notifications</option>
                <option value="unread">Unread Only</option>
                <option value="read">Read Only</option>
              </select>
              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md text-sm"
              >
                <option value="all">All Types</option>
                {notificationTypes.map(type => (
                  <option key={type} value={type}>
                    {type.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                  </option>
                ))}
              </select>
            </div>

            {/* Bulk Actions */}
            <div className="flex items-center gap-2">
              {selectedIds.size > 0 && (
                <>
                  <span className="text-sm text-gray-600 mr-2">
                    {selectedIds.size} selected
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={deleteSelected}
                    className="text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Delete Selected
                  </Button>
                </>
              )}
              {unreadCount > 0 && (
                <Button variant="outline" size="sm" onClick={markAllAsRead}>
                  <CheckCheck className="w-4 h-4 mr-2" />
                  Mark All Read
                </Button>
              )}
            </div>
          </div>
        </Card>

        {/* Notifications List */}
        {loading ? (
          <Card className="p-12">
            <div className="flex items-center justify-center">
              <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
              <p className="ml-3 text-gray-600">Loading notifications...</p>
            </div>
          </Card>
        ) : filteredNotifications.length === 0 ? (
          <Card className="p-12 text-center">
            <Bell className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              No notifications found
            </h3>
            <p className="text-gray-600">
              {filter !== 'all'
                ? 'Try adjusting your filters'
                : 'You\'ll receive notifications here for leave updates'}
            </p>
          </Card>
        ) : (
          <Card>
            {/* Select All Header */}
            <div className="p-4 border-b bg-gray-50 flex items-center">
              <input
                type="checkbox"
                checked={selectedIds.size === filteredNotifications.length}
                onChange={toggleSelectAll}
                className="w-4 h-4 text-primary rounded border-gray-300"
              />
              <label className="ml-3 text-sm font-medium text-gray-700">
                Select All
              </label>
            </div>

            {/* Notifications */}
            <div className="divide-y">
              {filteredNotifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`p-6 border-l-4 transition-colors hover:bg-gray-50 ${
                    !notification.is_read ? getNotificationColor(notification.type) : 'border-l-gray-200'
                  }`}
                >
                  <div className="flex items-start gap-4">
                    {/* Checkbox */}
                    <input
                      type="checkbox"
                      checked={selectedIds.has(notification.id)}
                      onChange={() => toggleSelect(notification.id)}
                      className="mt-1 w-4 h-4 text-primary rounded border-gray-300"
                    />

                    {/* Icon */}
                    <div className="flex-shrink-0 mt-1">
                      {getNotificationIcon(notification.type)}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-4 mb-2">
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-semibold text-gray-900">
                              {notification.title}
                            </h3>
                            {!notification.is_read && (
                              <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                            )}
                          </div>
                          <p className="text-sm text-gray-600">{notification.message}</p>
                        </div>
                        <div className="flex flex-col items-end gap-2">
                          <span className="text-xs text-gray-500 whitespace-nowrap">
                            {formatDistanceToNow(new Date(notification.created_at), {
                              addSuffix: true,
                            })}
                          </span>
                          {notification.is_read && notification.read_at && (
                            <span className="text-xs text-green-600">
                              Read {formatDistanceToNow(new Date(notification.read_at), { addSuffix: true })}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-2 mt-3">
                        {notification.action_url && (
                          <Link
                            href={notification.action_url}
                            onClick={() => !notification.is_read && markAsRead(notification.id)}
                          >
                            <Button variant="outline" size="sm">
                              View Details
                            </Button>
                          </Link>
                        )}
                        {!notification.is_read && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => markAsRead(notification.id)}
                          >
                            <Check className="w-4 h-4 mr-2" />
                            Mark as Read
                          </Button>
                        )}
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => deleteNotification(notification.id)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        )}
      </main>
    </div>
  );
}
