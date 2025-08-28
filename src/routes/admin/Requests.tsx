import { useQuery } from "@tanstack/react-query";
import { supabase } from "../../lib/supabase";
import Badge from "../../components/ui/Badge";

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

export default function AdminRequests() {
  const { data: requests = [], isLoading, error } = useQuery({
    queryKey: ['admin-requests'],
    queryFn: async (): Promise<LeaveRequest[]> => {
      // For development - return mock data
      return [
        {
          id: "1",
          user_id: "user1",
          start_date: "2024-03-15",
          end_date: "2024-03-20",
          leave_type: "vacation",
          reason: "Family vacation",
          status: "pending",
          total_days: 5,
          created_at: new Date().toISOString(),
          profiles: {
            full_name: "John Doe",
            email: "john.doe@company.com"
          }
        },
        {
          id: "2",
          user_id: "user2",
          start_date: "2024-03-10",
          end_date: "2024-03-12",
          leave_type: "sick",
          reason: "Medical appointment",
          status: "approved",
          total_days: 2,
          created_at: new Date(Date.now() - 86400000).toISOString(),
          profiles: {
            full_name: "Jane Smith",
            email: "jane.smith@company.com"
          }
        },
        {
          id: "3",
          user_id: "user3",
          start_date: "2024-02-28",
          end_date: "2024-03-01",
          leave_type: "personal",
          reason: "Moving to new apartment",
          status: "denied",
          total_days: 2,
          created_at: new Date(Date.now() - 172800000).toISOString(),
          profiles: {
            full_name: "Mike Johnson",
            email: "mike.johnson@company.com"
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
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as LeaveRequest[];
      */
    }
  });

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

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'approved': return <Badge tone="green">Approved</Badge>;
      case 'pending': return <Badge tone="yellow">Pending</Badge>;
      case 'denied': return <Badge tone="red">Denied</Badge>;
      default: return <Badge>Unknown</Badge>;
    }
  };

  const statusCounts = requests?.reduce((acc, req) => {
    acc[req.status] = (acc[req.status] || 0) + 1;
    return acc;
  }, {} as Record<string, number>) || {};

  if (isLoading) {
    return (
      <div className="container py-8">
        <div className="card">
          <div className="card-body text-center py-12">
            <div className="animate-spin h-8 w-8 mx-auto mb-4">
              <svg className="w-8 h-8 text-teal-600" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 714 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
              </svg>
            </div>
            <p className="text-gray-600 dark:text-gray-400">Loading requests...</p>
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
        <h1 className="text-4xl font-bold gradient-text mb-4">All Leave Requests</h1>
        <p className="text-xl text-gray-600 dark:text-gray-300">
          Complete overview of leave requests across the organization
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="card bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border-blue-200 dark:border-blue-800/30">
          <div className="card-body text-center">
            <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">{requests?.length || 0}</div>
            <div className="text-sm text-blue-700 dark:text-blue-300">Total Requests</div>
          </div>
        </div>
        
        <div className="card bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20 border-yellow-200 dark:border-yellow-800/30">
          <div className="card-body text-center">
            <div className="text-3xl font-bold text-yellow-600 dark:text-yellow-400">{statusCounts.pending || 0}</div>
            <div className="text-sm text-yellow-700 dark:text-yellow-300">Pending</div>
          </div>
        </div>
        
        <div className="card bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border-green-200 dark:border-green-800/30">
          <div className="card-body text-center">
            <div className="text-3xl font-bold text-green-600 dark:text-green-400">{statusCounts.approved || 0}</div>
            <div className="text-sm text-green-700 dark:text-green-300">Approved</div>
          </div>
        </div>
        
        <div className="card bg-gradient-to-r from-red-50 to-rose-50 dark:from-red-900/20 dark:to-rose-900/20 border-red-200 dark:border-red-800/30">
          <div className="card-body text-center">
            <div className="text-3xl font-bold text-red-600 dark:text-red-400">{statusCounts.denied || 0}</div>
            <div className="text-sm text-red-700 dark:text-red-300">Denied</div>
          </div>
        </div>
      </div>

      {/* Requests Table */}
      <div className="card">
        <div className="card-header">
          <div className="card-title">All Leave Requests</div>
          <div className="card-subtle mt-1">Showing all requests from all employees</div>
        </div>
        <div className="card-body">
          {!requests || requests.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">📋</div>
              <h3 className="text-xl font-semibold text-gray-700 dark:text-gray-300 mb-2">No requests found</h3>
              <p className="text-gray-600 dark:text-gray-400">No leave requests have been submitted yet.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="table">
                <thead>
                  <tr>
                    <th className="px-4 py-3 text-left text-sm font-semibold">Employee</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold">Leave Type</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold">Dates</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold">Days</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold">Status</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold">Submitted</th>
                  </tr>
                </thead>
                <tbody>
                  {requests.map((request) => (
                    <tr key={request.id} className="border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800/50">
                      <td className="px-4 py-4">
                        <div>
                          <div className="font-medium text-gray-900 dark:text-gray-100">
                            {request.profiles?.full_name || request.profiles?.email || 'Unknown Employee'}
                          </div>
                          {request.profiles?.email && request.profiles?.full_name && (
                            <div className="text-sm text-gray-500 dark:text-gray-400">
                              {request.profiles.email}
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-2">
                          <span className="text-lg">{getLeaveTypeIcon(request.leave_type)}</span>
                          <span className="capitalize">{request.leave_type}</span>
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <div className="text-sm">
                          <div>{formatDate(request.start_date)}</div>
                          <div className="text-gray-500">to {formatDate(request.end_date)}</div>
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <span className="font-medium">{request.total_days}</span>
                      </td>
                      <td className="px-4 py-4">
                        {getStatusBadge(request.status)}
                      </td>
                      <td className="px-4 py-4 text-sm text-gray-500">
                        {formatDate(request.created_at)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}