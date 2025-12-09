'use client';

import { useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calendar, User, Clock, CheckCircle, XCircle, FileText, Filter } from 'lucide-react';
import Link from 'next/link';

interface LeaveRequest {
  id: string;
  start_date: string;
  end_date: string;
  working_days: number;
  reason: string;
  status: string;
  created_at: string;
  document_paths: string[];
  leave_types: {
    name: string;
    code: string;
    color: string;
  };
  profiles: {
    first_name: string;
    last_name: string;
    email: string;
  };
}

export default function ManagerDashboardPage() {
  const [leaveRequests, setLeaveRequests] = useState<LeaveRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('pending');

  useEffect(() => {
    fetchLeaveRequests();
  }, [filter]);

  async function fetchLeaveRequests() {
    try {
      setLoading(true);
      const url = filter === 'all'
        ? '/api/leave-requests'
        : `/api/leave-requests?status=${filter}`;

      const response = await fetch(url);
      const data = await response.json();

      if (data.leaveRequests) {
        setLeaveRequests(data.leaveRequests);
      }
    } catch (error) {
      console.error('Error fetching leave requests:', error);
    } finally {
      setLoading(false);
    }
  }

  const pendingCount = leaveRequests.filter(r => r.status === 'pending').length;
  const approvedThisMonth = leaveRequests.filter(r => {
    if (r.status !== 'approved') return false;
    const created = new Date(r.created_at);
    const now = new Date();
    return created.getMonth() === now.getMonth() && created.getFullYear() === now.getFullYear();
  }).length;

  const getStatusBadge = (status: string) => {
    const styles = {
      pending: 'bg-warning/10 text-warning',
      approved: 'bg-success/10 text-success',
      rejected: 'bg-error/10 text-error',
    };
    const icons = {
      pending: <Clock className="w-4 h-4" />,
      approved: <CheckCircle className="w-4 h-4" />,
      rejected: <XCircle className="w-4 h-4" />,
    };

    return (
      <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium ${styles[status as keyof typeof styles]}`}>
        {icons[status as keyof typeof icons]}
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top Navigation */}
      <nav className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <Calendar className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold text-gray-900">LeaveHub Manager</span>
            </div>
            <div className="flex items-center gap-4">
              <Link href="/dashboard">
                <Button variant="outline" size="sm">
                  Employee View
                </Button>
              </Link>
              <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                <User className="w-5 h-5 text-white" />
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Leave Request Management
          </h1>
          <p className="text-gray-600">
            Review and manage team leave requests
          </p>
        </div>

        {/* Quick Stats */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-warning/10 rounded-lg flex items-center justify-center">
                <Clock className="w-6 h-6 text-warning" />
              </div>
              <span className="text-3xl font-bold text-warning">
                {pendingCount}
              </span>
            </div>
            <h3 className="font-semibold mb-1">Pending Requests</h3>
            <p className="text-sm text-gray-600">Awaiting your review</p>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-success/10 rounded-lg flex items-center justify-center">
                <CheckCircle className="w-6 h-6 text-success" />
              </div>
              <span className="text-3xl font-bold text-success">
                {approvedThisMonth}
              </span>
            </div>
            <h3 className="font-semibold mb-1">Approved This Month</h3>
            <p className="text-sm text-gray-600">Current month approvals</p>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                <User className="w-6 h-6 text-primary" />
              </div>
              <span className="text-3xl font-bold text-primary">
                {leaveRequests.length}
              </span>
            </div>
            <h3 className="font-semibold mb-1">Total Requests</h3>
            <p className="text-sm text-gray-600">All leave requests</p>
          </Card>
        </div>

        {/* Filters */}
        <Card className="p-6 mb-6">
          <div className="flex items-center gap-2 mb-4">
            <Filter className="w-5 h-5 text-gray-500" />
            <h3 className="font-semibold">Filter Requests</h3>
          </div>
          <div className="flex gap-2">
            <Button
              variant={filter === 'pending' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilter('pending')}
            >
              Pending
            </Button>
            <Button
              variant={filter === 'approved' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilter('approved')}
            >
              Approved
            </Button>
            <Button
              variant={filter === 'rejected' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilter('rejected')}
            >
              Rejected
            </Button>
            <Button
              variant={filter === 'all' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilter('all')}
            >
              All
            </Button>
          </div>
        </Card>

        {/* Leave Requests List */}
        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-6">
            {filter === 'all' ? 'All Leave Requests' : `${filter.charAt(0).toUpperCase() + filter.slice(1)} Requests`}
          </h2>

          {loading ? (
            <div className="text-center py-12">
              <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-gray-600">Loading requests...</p>
            </div>
          ) : leaveRequests.length === 0 ? (
            <div className="text-center py-12">
              <Clock className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">No {filter !== 'all' ? filter : ''} leave requests found</p>
            </div>
          ) : (
            <div className="space-y-4">
              {leaveRequests.map((request) => (
                <div
                  key={request.id}
                  className="border border-gray-200 rounded-lg p-6 hover:border-gray-300 transition-colors"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-start gap-4 flex-1">
                      {/* Employee Info */}
                      <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                        <User className="w-6 h-6 text-primary" />
                      </div>

                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="font-semibold text-lg">
                            {request.profiles.first_name} {request.profiles.last_name}
                          </h3>
                          {getStatusBadge(request.status)}
                        </div>

                        <div className="grid md:grid-cols-2 gap-4 text-sm">
                          <div>
                            <p className="text-gray-500 mb-1">Leave Type</p>
                            <div className="flex items-center gap-2">
                              <div
                                className="w-3 h-3 rounded-full"
                                style={{ backgroundColor: request.leave_types.color }}
                              />
                              <p className="font-medium">{request.leave_types.name}</p>
                            </div>
                          </div>

                          <div>
                            <p className="text-gray-500 mb-1">Duration</p>
                            <p className="font-medium">{request.working_days} working days</p>
                          </div>

                          <div>
                            <p className="text-gray-500 mb-1">Start Date</p>
                            <p className="font-medium">
                              {new Date(request.start_date).toLocaleDateString('en-ZA', {
                                day: 'numeric',
                                month: 'short',
                                year: 'numeric'
                              })}
                            </p>
                          </div>

                          <div>
                            <p className="text-gray-500 mb-1">End Date</p>
                            <p className="font-medium">
                              {new Date(request.end_date).toLocaleDateString('en-ZA', {
                                day: 'numeric',
                                month: 'short',
                                year: 'numeric'
                              })}
                            </p>
                          </div>
                        </div>

                        <div className="mt-3">
                          <p className="text-gray-500 text-sm mb-1">Reason</p>
                          <p className="text-gray-900">{request.reason}</p>
                        </div>

                        {request.document_paths && request.document_paths.length > 0 && (
                          <div className="mt-3 flex items-center gap-2 text-sm text-gray-600">
                            <FileText className="w-4 h-4" />
                            <span>{request.document_paths.length} document(s) attached</span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Actions */}
                    {request.status === 'pending' && (
                      <div className="flex gap-2 flex-shrink-0">
                        <Link href={`/dashboard/manager/requests/${request.id}`}>
                          <Button size="sm" className="bg-primary hover:bg-primary/90">
                            Review
                          </Button>
                        </Link>
                      </div>
                    )}
                  </div>

                  <div className="text-xs text-gray-500 mt-4 pt-4 border-t">
                    Submitted {new Date(request.created_at).toLocaleDateString('en-ZA', {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      </main>
    </div>
  );
}
