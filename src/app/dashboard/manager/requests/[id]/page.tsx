'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calendar, ArrowLeft, User, FileText, AlertCircle, CheckCircle, XCircle, Clock } from 'lucide-react';
import Link from 'next/link';

interface LeaveRequest {
  id: string;
  start_date: string;
  end_date: string;
  working_days: number;
  total_days: number;
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
    id: string;
    first_name: string;
    last_name: string;
    email: string;
  };
}

export default function ReviewLeaveRequestPage() {
  const params = useParams();
  const router = useRouter();
  const requestId = params?.id as string;

  const [leaveRequest, setLeaveRequest] = useState<LeaveRequest | null>(null);
  const [loading, setLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [comments, setComments] = useState('');
  const [showApproval, setShowApproval] = useState(false);
  const [showRejection, setShowRejection] = useState(false);

  useEffect(() => {
    if (requestId) {
      fetchLeaveRequest();
    }
  }, [requestId]);

  async function fetchLeaveRequest() {
    try {
      const response = await fetch('/api/leave-requests');
      const data = await response.json();

      if (data.leaveRequests) {
        const request = data.leaveRequests.find((r: LeaveRequest) => r.id === requestId);
        setLeaveRequest(request || null);
      }
    } catch (error) {
      console.error('Error fetching leave request:', error);
    } finally {
      setLoading(false);
    }
  }

  async function handleApprove() {
    if (!leaveRequest) return;

    setIsProcessing(true);
    try {
      const response = await fetch(`/api/leave-requests/${requestId}/approve`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          comments: comments || undefined,
          managerId: 'demo-manager-123', // TODO: Get from auth
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to approve request');
      }

      // Show success and redirect
      alert('Leave request approved successfully!');
      router.push('/dashboard/manager');
    } catch (error) {
      console.error('Error approving request:', error);
      alert(error instanceof Error ? error.message : 'Failed to approve request');
    } finally {
      setIsProcessing(false);
    }
  }

  async function handleReject() {
    if (!leaveRequest) return;
    if (!comments.trim()) {
      alert('Please provide a reason for rejection');
      return;
    }

    setIsProcessing(true);
    try {
      const response = await fetch(`/api/leave-requests/${requestId}/reject`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          comments,
          managerId: 'demo-manager-123', // TODO: Get from auth
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to reject request');
      }

      // Show success and redirect
      alert('Leave request rejected');
      router.push('/dashboard/manager');
    } catch (error) {
      console.error('Error rejecting request:', error);
      alert(error instanceof Error ? error.message : 'Failed to reject request');
    } finally {
      setIsProcessing(false);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading request...</p>
        </div>
      </div>
    );
  }

  if (!leaveRequest) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="p-8 text-center max-w-md">
          <p className="text-gray-600 mb-4">Leave request not found</p>
          <Link href="/dashboard/manager">
            <Button>Back to Dashboard</Button>
          </Link>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top Navigation */}
      <nav className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex items-center gap-3">
              <Link href="/dashboard/manager">
                <Button variant="ghost" size="sm">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back
                </Button>
              </Link>
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <Calendar className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold text-gray-900">Review Leave Request</span>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Status Header */}
        {leaveRequest.status !== 'pending' && (
          <Card className={`p-6 mb-6 ${
            leaveRequest.status === 'approved' ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'
          }`}>
            <div className="flex items-center gap-3">
              {leaveRequest.status === 'approved' ? (
                <CheckCircle className="w-6 h-6 text-green-600" />
              ) : (
                <XCircle className="w-6 h-6 text-red-600" />
              )}
              <div>
                <p className={`font-semibold ${
                  leaveRequest.status === 'approved' ? 'text-green-900' : 'text-red-900'
                }`}>
                  This request has been {leaveRequest.status}
                </p>
                <p className={`text-sm ${
                  leaveRequest.status === 'approved' ? 'text-green-700' : 'text-red-700'
                }`}>
                  No further action is needed
                </p>
              </div>
            </div>
          </Card>
        )}

        {/* Employee & Request Info */}
        <Card className="p-8 mb-6">
          <div className="flex items-start gap-6 mb-8">
            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
              <User className="w-8 h-8 text-primary" />
            </div>
            <div className="flex-1">
              <h1 className="text-2xl font-bold text-gray-900 mb-2">
                {leaveRequest.profiles.first_name} {leaveRequest.profiles.last_name}
              </h1>
              <p className="text-gray-600 mb-4">{leaveRequest.profiles.email}</p>
              <span className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium ${
                leaveRequest.status === 'approved' ? 'bg-success/10 text-success' :
                leaveRequest.status === 'rejected' ? 'bg-error/10 text-error' :
                'bg-warning/10 text-warning'
              }`}>
                <Clock className="w-4 h-4" />
                {leaveRequest.status.charAt(0).toUpperCase() + leaveRequest.status.slice(1)}
              </span>
            </div>
          </div>

          <div className="space-y-6">
            {/* Leave Type */}
            <div>
              <p className="text-sm font-medium text-gray-500 mb-2">Leave Type</p>
              <div className="flex items-center gap-2">
                <div
                  className="w-4 h-4 rounded-full"
                  style={{ backgroundColor: leaveRequest.leave_types.color }}
                />
                <p className="text-lg font-semibold">{leaveRequest.leave_types.name}</p>
                <span className="text-sm text-gray-500">({leaveRequest.leave_types.code})</span>
              </div>
            </div>

            {/* Dates */}
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <p className="text-sm font-medium text-gray-500 mb-2">Start Date</p>
                <p className="text-lg text-gray-900">
                  {new Date(leaveRequest.start_date).toLocaleDateString('en-ZA', {
                    weekday: 'long',
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric'
                  })}
                </p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500 mb-2">End Date</p>
                <p className="text-lg text-gray-900">
                  {new Date(leaveRequest.end_date).toLocaleDateString('en-ZA', {
                    weekday: 'long',
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric'
                  })}
                </p>
              </div>
            </div>

            {/* Duration */}
            <div>
              <p className="text-sm font-medium text-gray-500 mb-2">Duration</p>
              <p className="text-lg text-gray-900">
                {leaveRequest.working_days} working day{leaveRequest.working_days !== 1 ? 's' : ''}
                {leaveRequest.total_days !== leaveRequest.working_days && (
                  <span className="text-sm text-gray-500 ml-2">
                    ({leaveRequest.total_days} calendar days)
                  </span>
                )}
              </p>
            </div>

            {/* Reason */}
            <div>
              <p className="text-sm font-medium text-gray-500 mb-2">Reason</p>
              <p className="text-gray-900">{leaveRequest.reason}</p>
            </div>

            {/* Supporting Documents */}
            {leaveRequest.document_paths && leaveRequest.document_paths.length > 0 && (
              <div>
                <p className="text-sm font-medium text-gray-500 mb-3">Supporting Documents</p>
                <div className="space-y-2">
                  {leaveRequest.document_paths.map((path, index) => (
                    <div
                      key={index}
                      className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg border border-gray-200"
                    >
                      <FileText className="w-5 h-5 text-gray-600" />
                      <span className="text-sm text-gray-900 flex-1">
                        Document {index + 1}
                      </span>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          // TODO: Implement document download/view
                          alert('Document viewing will be implemented');
                        }}
                      >
                        View
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Submitted Date */}
            <div>
              <p className="text-sm font-medium text-gray-500 mb-2">Submitted</p>
              <p className="text-gray-900">
                {new Date(leaveRequest.created_at).toLocaleDateString('en-ZA', {
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </p>
            </div>
          </div>
        </Card>

        {/* Manager Comments/Actions */}
        {leaveRequest.status === 'pending' && (
          <Card className="p-8">
            <h2 className="text-xl font-semibold mb-6">Manager Review</h2>

            {/* Comments Field */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Comments {showRejection && <span className="text-red-500">*</span>}
              </label>
              <textarea
                value={comments}
                onChange={(e) => setComments(e.target.value)}
                rows={4}
                placeholder={showRejection ? "Please provide a reason for rejection..." : "Optional: Add comments for the employee..."}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent resize-none"
              />
              <p className="text-sm text-gray-500 mt-1">
                {comments.length}/500 characters
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3">
              {!showApproval && !showRejection && (
                <>
                  <Button
                    onClick={() => setShowApproval(true)}
                    className="flex-1 bg-success hover:bg-success/90"
                    disabled={isProcessing}
                  >
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Approve Request
                  </Button>
                  <Button
                    onClick={() => setShowRejection(true)}
                    variant="outline"
                    className="flex-1 border-error text-error hover:bg-error/10"
                    disabled={isProcessing}
                  >
                    <XCircle className="w-4 h-4 mr-2" />
                    Reject Request
                  </Button>
                </>
              )}

              {showApproval && (
                <>
                  <Button
                    onClick={handleApprove}
                    className="flex-1 bg-success hover:bg-success/90"
                    disabled={isProcessing}
                  >
                    {isProcessing ? 'Processing...' : 'Confirm Approval'}
                  </Button>
                  <Button
                    onClick={() => setShowApproval(false)}
                    variant="outline"
                    disabled={isProcessing}
                  >
                    Cancel
                  </Button>
                </>
              )}

              {showRejection && (
                <>
                  <Button
                    onClick={handleReject}
                    className="flex-1 bg-error hover:bg-error/90"
                    disabled={isProcessing || !comments.trim()}
                  >
                    {isProcessing ? 'Processing...' : 'Confirm Rejection'}
                  </Button>
                  <Button
                    onClick={() => {
                      setShowRejection(false);
                      setComments('');
                    }}
                    variant="outline"
                    disabled={isProcessing}
                  >
                    Cancel
                  </Button>
                </>
              )}
            </div>

            {showRejection && !comments.trim() && (
              <div className="mt-4 flex items-start gap-2 text-sm text-error">
                <AlertCircle className="w-4 h-4 mt-0.5" />
                <p>A reason must be provided when rejecting a leave request</p>
              </div>
            )}
          </Card>
        )}
      </main>
    </div>
  );
}
