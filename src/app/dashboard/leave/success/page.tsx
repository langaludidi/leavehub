'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle, Calendar, FileText, Clock, Home, List } from 'lucide-react';
import Link from 'next/link';

interface LeaveRequest {
  id: string;
  start_date: string;
  end_date: string;
  working_days: number;
  reason: string;
  status: string;
  created_at: string;
  leave_types: {
    name: string;
    code: string;
    color: string;
  };
  document_paths: string[];
}

function LeaveRequestSuccessContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const requestId = searchParams?.get('id');

  const [leaveRequest, setLeaveRequest] = useState<LeaveRequest | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!requestId) {
      // Redirect to dashboard if no request ID
      router.push('/dashboard');
      return;
    }

    // Fetch the leave request details
    async function fetchLeaveRequest() {
      try {
        const response = await fetch(`/api/leave-requests?userId=demo-user-123`);
        const data = await response.json();

        if (data.leaveRequests) {
          // Find the specific request
          const request = data.leaveRequests.find((lr: LeaveRequest) => lr.id === requestId);
          setLeaveRequest(request || null);
        }
      } catch (error) {
        console.error('Error fetching leave request:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchLeaveRequest();
  }, [requestId, router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your request...</p>
        </div>
      </div>
    );
  }

  if (!leaveRequest) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="p-8 text-center max-w-md">
          <p className="text-gray-600 mb-4">Leave request not found</p>
          <Link href="/dashboard">
            <Button>Return to Dashboard</Button>
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
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <Calendar className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold text-gray-900">LeaveHub</span>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Success Icon and Message */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-green-100 rounded-full mb-4">
            <CheckCircle className="w-12 h-12 text-green-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Leave Request Submitted!
          </h1>
          <p className="text-lg text-gray-600">
            Your leave request has been successfully submitted and is pending approval.
          </p>
        </div>

        {/* Request Details Card */}
        <Card className="p-8 mb-6">
          <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
            <FileText className="w-5 h-5" />
            Request Details
          </h2>

          <div className="space-y-6">
            {/* Leave Type */}
            <div>
              <p className="text-sm font-medium text-gray-500 mb-1">Leave Type</p>
              <div className="flex items-center gap-2">
                <div
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: leaveRequest.leave_types.color }}
                />
                <p className="text-lg font-semibold text-gray-900">
                  {leaveRequest.leave_types.name}
                </p>
              </div>
            </div>

            {/* Dates */}
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <p className="text-sm font-medium text-gray-500 mb-1">Start Date</p>
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
                <p className="text-sm font-medium text-gray-500 mb-1">End Date</p>
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
              <p className="text-sm font-medium text-gray-500 mb-1">Duration</p>
              <p className="text-lg text-gray-900">
                {leaveRequest.working_days} working day{leaveRequest.working_days !== 1 ? 's' : ''}
              </p>
            </div>

            {/* Reason */}
            <div>
              <p className="text-sm font-medium text-gray-500 mb-1">Reason</p>
              <p className="text-gray-900">{leaveRequest.reason}</p>
            </div>

            {/* Supporting Documents */}
            {leaveRequest.document_paths && leaveRequest.document_paths.length > 0 && (
              <div>
                <p className="text-sm font-medium text-gray-500 mb-2">Supporting Documents</p>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <FileText className="w-4 h-4" />
                  <span>{leaveRequest.document_paths.length} document{leaveRequest.document_paths.length !== 1 ? 's' : ''} uploaded</span>
                </div>
              </div>
            )}

            {/* Status */}
            <div>
              <p className="text-sm font-medium text-gray-500 mb-1">Status</p>
              <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium bg-warning/10 text-warning">
                <Clock className="w-4 h-4" />
                Pending Approval
              </span>
            </div>
          </div>
        </Card>

        {/* What Happens Next Card */}
        <Card className="p-8 mb-6 bg-blue-50 border-blue-200">
          <h3 className="font-semibold text-blue-900 mb-3">What happens next?</h3>
          <ul className="space-y-2 text-sm text-blue-800">
            <li className="flex items-start gap-2">
              <span className="text-blue-600 mt-0.5">•</span>
              <span>Your manager will be notified and will review your request</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-600 mt-0.5">•</span>
              <span>You&apos;ll receive an email notification once your request is approved or rejected</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-600 mt-0.5">•</span>
              <span>You can track the status of your request on your dashboard</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-600 mt-0.5">•</span>
              <span>If your request is approved, the days will be deducted from your leave balance</span>
            </li>
          </ul>
        </Card>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3">
          <Link href="/dashboard" className="flex-1">
            <Button className="w-full bg-primary hover:bg-primary/90">
              <Home className="w-4 h-4 mr-2" />
              Return to Dashboard
            </Button>
          </Link>
          <Link href="/dashboard/leave/requests" className="flex-1">
            <Button variant="outline" className="w-full">
              <List className="w-4 h-4 mr-2" />
              View All Requests
            </Button>
          </Link>
        </div>
      </main>
    </div>
  );
}

export default function LeaveRequestSuccessPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    }>
      <LeaveRequestSuccessContent />
    </Suspense>
  );
}
