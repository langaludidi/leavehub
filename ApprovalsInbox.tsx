import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "../lib/supabase";
import { useToast } from "../components/Toast";

interface LeaveRequest {
  id: string;
  user_id: string;
  start_date: string;
  end_date: string;
  leave_type: string;
  reason: string | null;
  status: 'pending' | 'approved' | 'denied';
  total_days: number;
  created_at: string;
  profiles?: {
    full_name: string;
    email: string;
  };
}

export default function ApprovalsInbox() {
  const toast = useToast();
  const queryClient = useQueryClient();

  // Fetch pending leave requests
  const { data: pendingRequests = [], isLoading, error } = useQuery({
    queryKey: ['pending-requests'],
    queryFn: async (): Promise<LeaveRequest[]> => {
      // For development - return mock data
      return [
        {
          id: "1",
          user_id: "user1",
          start_date: "2024-03-15",
          end_date: "2024-03-20",
          leave_type: "vacation",
          reason: "Family vacation to the coast",
          status: "pending",
          total_days: 5,
          created_at: new Date().toISOString(),
          profiles: {
            full_name: "John Doe",
            email: "john.doe@company.com"
          }
        },
        {
          id: "4",
          user_id: "user4",
          start_date: "2024-03-25",
          end_date: "2024-03-26",
          leave_type: "sick",
          reason: "Doctor's appointment",
          status: "pending",
          total_days: 2,
          created_at: new Date(Date.now() - 86400000).toISOString(),
          profiles: {
            full_name: "Sarah Wilson",
            email: "sarah.wilson@company.com"
          }
        }
      ];

      /* Original database query - will be activated when database is ready
      const { data, error } = await supabase
        .from('leave_requests')
        .select(`
          *,
          profiles (
            full_name,
            email
          )
        `)
        .eq('status', 'pending')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as LeaveRequest[];
      */
    }
  });

  // Mutation for approving/denying requests
  const updateRequestMutation = useMutation({
    mutationFn: async ({ id, status, comment }: { id: string, status: 'approved' | 'denied', comment?: string }) => {
      const { data, error } = await supabase
        .from('leave_requests')
        .update({ 
          status, 
          approved_at: status === 'approved' ? new Date().toISOString() : null,
          approval_comment: comment || null
        })
        .eq('id', id)
        .select();

      if (error) throw error;
      return data;
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['pending-requests'] });
      toast(`Request ${variables.status} successfully!`, "success");

      // Send notification email
      const request = pendingRequests?.find(r => r.id === variables.id);
      if (request?.profiles?.email) {
        supabase.functions.invoke('notify', {
          body: {
            to: request.profiles.email,
            event: "request_" + variables.status,
            payload: { 
              request_id: variables.id,
              status: variables.status,
              start_date: request.start_date,
              end_date: request.end_date,
              leave_type: request.leave_type
            }
          }
        }).catch(console.log); // Don't fail if notification fails
      }
    },
    onError: (error) => {
      toast("Failed to update request. Please try again.", "error");
      console.error("Error updating request:", error);
    }
  });

  const handleApprove = (id: string) => {
    updateRequestMutation.mutate({ id, status: 'approved' });
  };

  const handleDeny = (id: string) => {
    updateRequestMutation.mutate({ id, status: 'denied' });
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const getLeaveTypeIcon = (type: string) => {
    switch (type) {
      case 'vacation': return '🏖️';
      case 'sick': return '🤒';
      case 'personal': return '👤';
      case 'maternity': return '👶';
      case 'bereavement': return '🕊️';
      default: return '📋';
    }
  };

  if (isLoading) {
    return (
      <div className="container py-8">
        <div className="card">
          <div className="card-body text-center py-12">
            <div className="animate-spin h-8 w-8 mx-auto mb-4">
              <svg className="w-8 h-8 text-teal-600" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
              </svg>
            </div>
            <p className="text-gray-600 dark:text-gray-400">Loading pending requests...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container py-8">
        <div className="card">
          <div className="card-body text-center py-12">
            <p className="text-red-600 dark:text-red-400">Error loading requests. Please refresh the page.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container py-8 animate-fade-in">
      <div className="mb-8">
        <h1 className="text-4xl font-bold gradient-text mb-4">Approval Inbox</h1>
        <p className="text-xl text-gray-600 dark:text-gray-300">
          Review and approve pending leave requests
        </p>
      </div>

      <div className="card">
        <div className="card-header">
          <div className="card-title">Pending Approvals</div>
          <div className="card-subtle mt-1">{pendingRequests?.length || 0} requests waiting for approval</div>
        </div>
        <div className="card-body">
          {!pendingRequests || pendingRequests.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">✅</div>
              <h3 className="text-xl font-semibold text-gray-700 dark:text-gray-300 mb-2">All caught up!</h3>
              <p className="text-gray-600 dark:text-gray-400">No pending leave requests to review.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {pendingRequests.map((request) => (
                <div key={request.id} className="bg-gradient-to-r from-slate-50 to-gray-50 dark:from-gray-800/50 dark:to-slate-800/50 rounded-2xl border border-gray-200 dark:border-gray-700/50 p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-2xl">{getLeaveTypeIcon(request.leave_type)}</span>
                        <h3 className="font-semibold text-lg capitalize">
                          {request.leave_type} Leave
                        </h3>
                        <span className="badge-yellow">Pending</span>
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {request.profiles?.full_name || request.profiles?.email || 'Unknown Employee'}
                      </p>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-medium">{request.total_days} day{request.total_days !== 1 ? 's' : ''}</div>
                    </div>
                  </div>

                  <div className="space-y-2 mb-4">
                    <div className="flex items-center gap-2 text-sm">
                      <span className="font-medium">Dates:</span>
                      <span>{formatDate(request.start_date)} → {formatDate(request.end_date)}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <span className="font-medium">Submitted:</span>
                      <span>{formatDate(request.created_at)}</span>
                    </div>
                  </div>

                  {request.reason && (
                    <div className="bg-white dark:bg-gray-800 rounded-lg p-3 mb-4">
                      <div className="text-sm font-medium mb-1">Reason:</div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">
                        {request.reason}
                      </div>
                    </div>
                  )}

                  <div className="flex gap-3 pt-2">
                    <button 
                      onClick={() => handleDeny(request.id)}
                      disabled={updateRequestMutation.isPending}
                      className="btn-secondary flex-1 disabled:opacity-50"
                    >
                      ❌ Deny
                    </button>
                    <button 
                      onClick={() => handleApprove(request.id)}
                      disabled={updateRequestMutation.isPending}
                      className="btn-primary flex-1 disabled:opacity-50"
                    >
                      ✅ Approve
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
