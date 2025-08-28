import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useToast } from "../../components/Toast";
import { supabase } from "../../lib/supabase";
import { validateLeaveRequest, LeaveRequestData } from "../../lib/policyValidation";

interface LeaveType {
  id: string;
  name: string;
  code: string;
  color: string;
  icon: string;
  requires_approval: boolean;
  min_advance_notice_days: number;
  max_consecutive_days: number | null;
  is_paid: boolean;
}

async function fetchAvailableLeaveTypes(): Promise<LeaveType[]> {
  const { data: user } = await supabase.auth.getUser();
  if (!user.user) throw new Error('Not authenticated');

  // Get user's organization
  const { data: userProfile } = await supabase
    .from('user_profiles')
    .select('organization_id')
    .eq('user_id', user.user.id)
    .single();

  if (!userProfile?.organization_id) {
    // Fallback to South African BCEA-compliant leave types
    return [
      { id: 'annual', name: 'Annual Leave', code: 'annual', color: '#10b981', icon: '🏖️', requires_approval: true, min_advance_notice_days: 21, max_consecutive_days: null, is_paid: true },
      { id: 'sick', name: 'Sick Leave', code: 'sick', color: '#f59e0b', icon: '🤒', requires_approval: false, min_advance_notice_days: 0, max_consecutive_days: null, is_paid: true },
      { id: 'family_responsibility', name: 'Family Responsibility Leave', code: 'family_responsibility', color: '#f97316', icon: '👨‍👩‍👧‍👦', requires_approval: false, min_advance_notice_days: 0, max_consecutive_days: 3, is_paid: true },
      { id: 'maternity', name: 'Maternity Leave', code: 'maternity', color: '#ec4899', icon: '👶', requires_approval: true, min_advance_notice_days: 30, max_consecutive_days: 120, is_paid: false },
      { id: 'study', name: 'Study Leave', code: 'study', color: '#7c3aed', icon: '📚', requires_approval: true, min_advance_notice_days: 30, max_consecutive_days: null, is_paid: false },
      { id: 'compassionate', name: 'Compassionate Leave', code: 'compassionate', color: '#6b7280', icon: '🕊️', requires_approval: true, min_advance_notice_days: 0, max_consecutive_days: 5, is_paid: true }
    ];
  }

  const { data, error } = await supabase
    .from('leave_types')
    .select('id, name, code, color, icon, requires_approval, min_advance_notice_days, max_consecutive_days, is_paid')
    .eq('organization_id', userProfile.organization_id)
    .eq('is_active', true)
    .order('name');

  if (error) throw error;
  return data || [];
}

export default function NewRequest() {
  const [formData, setFormData] = useState({
    startDate: "",
    endDate: "",
    type: "",
    reason: ""
  });
  const [isLoading, setIsLoading] = useState(false);
  const toast = useToast();

  const { data: leaveTypes, isLoading: typesLoading } = useQuery({
    queryKey: ['available-leave-types'],
    queryFn: fetchAvailableLeaveTypes
  });

  const selectedLeaveType = leaveTypes?.find(type => type.code === formData.type);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Basic validation
      if (!formData.startDate || !formData.endDate || !formData.type) {
        toast("Please fill in all required fields", "error");
        return;
      }

      if (new Date(formData.startDate) > new Date(formData.endDate)) {
        toast("End date must be after start date", "error");
        return;
      }

      // Get current user
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      if (authError || !user) {
        toast("Authentication error. Please sign in again.", "error");
        return;
      }

      // Calculate total days
      const startDate = new Date(formData.startDate);
      const endDate = new Date(formData.endDate);
      const totalDays = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)) + 1;

      // Submit leave request to Supabase
      const { data, error } = await supabase
        .from('leave_requests')
        .insert([
          {
            user_id: user.id,
            start_date: formData.startDate,
            end_date: formData.endDate,
            leave_type: formData.type,
            leave_type_id: selectedLeaveType?.id || formData.type,
            reason: formData.reason || null,
            status: 'pending',
            total_days: totalDays,
            created_at: new Date().toISOString()
          }
        ])
        .select();

      if (error) {
        console.error('Error submitting leave request:', error);
        toast("Failed to submit leave request. Please try again.", "error");
        return;
      }

      toast("Leave request submitted successfully! Your manager will be notified.", "success");
      setFormData({ startDate: "", endDate: "", type: "", reason: "" });

      // Optional: Send notification email
      try {
        await supabase.functions.invoke('notify', {
          body: {
            to: "manager@company.com", // In real app, get from user's manager
            event: "request_submitted",
            payload: { 
              request_id: data?.[0]?.id, 
              employee_name: user.email,
              start_date: formData.startDate,
              end_date: formData.endDate,
              leave_type: formData.type,
              total_days: totalDays
            }
          }
        });
      } catch (notifError) {
        console.log("Notification email failed:", notifError);
        // Don't show error to user as the request was successful
      }
    } catch (err) {
      toast("Failed to submit request. Please try again.", "error");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-gray-100 dark:from-gray-950 dark:to-slate-900">
      <div className="container py-12 px-6 sm:px-8 lg:px-12">
        <div className="max-w-4xl mx-auto animate-fade-in">
          <div className="text-center mb-12">
            <h1 className="text-5xl font-bold gradient-text mb-6">New Leave Request</h1>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto leading-relaxed">
              Submit your leave request with all the necessary details and we'll process it promptly
            </p>
          </div>
          
          <div className="card shadow-2xl">
            <div className="card-body">
              <form onSubmit={handleSubmit} className="space-y-10">
                <div className="bg-gradient-to-r from-teal-50 to-cyan-50 dark:from-teal-900/20 dark:to-cyan-900/20 rounded-2xl p-8 border border-teal-100 dark:border-teal-800/30">
                  <h2 className="text-2xl font-semibold text-teal-800 dark:text-teal-200 mb-6 flex items-center gap-2">
                    📅 Leave Dates
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-4">
                      <label htmlFor="startDate" className="label text-teal-700 dark:text-teal-300">
                        Start Date *
                      </label>
                      <input
                        id="startDate"
                        type="date"
                        value={formData.startDate}
                        onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                        className="input bg-white dark:bg-gray-800 border-teal-200 dark:border-teal-700 focus:border-teal-400 focus:ring-teal-400/30"
                        required
                      />
                    </div>
                    
                    <div className="space-y-4">
                      <label htmlFor="endDate" className="label text-teal-700 dark:text-teal-300">
                        End Date *
                      </label>
                      <input
                        id="endDate"
                        type="date"
                        value={formData.endDate}
                        onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                        className="input bg-white dark:bg-gray-800 border-teal-200 dark:border-teal-700 focus:border-teal-400 focus:ring-teal-400/30"
                        required
                      />
                    </div>
                  </div>
                </div>

                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-2xl p-8 border border-blue-100 dark:border-blue-800/30">
                  <h2 className="text-2xl font-semibold text-blue-800 dark:text-blue-200 mb-6 flex items-center gap-2">
                    🏷️ Leave Type
                  </h2>
                  <div className="space-y-4">
                    <label htmlFor="type" className="label text-blue-700 dark:text-blue-300">
                      Select Leave Type *
                    </label>
                    <select
                      id="type"
                      value={formData.type}
                      onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                      className="select bg-white dark:bg-gray-800 border-blue-200 dark:border-blue-700 focus:border-blue-400 focus:ring-blue-400/30"
                      required
                    >
                      <option value="">Choose your leave type...</option>
                      <option value="vacation">🏖️ Vacation</option>
                      <option value="sick">🤒 Sick Leave</option>
                      <option value="personal">👤 Personal Leave</option>
                      <option value="maternity">👶 Maternity/Paternity Leave</option>
                      <option value="bereavement">🕊️ Bereavement Leave</option>
                    </select>
                  </div>
                </div>

                <div className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-2xl p-8 border border-purple-100 dark:border-purple-800/30">
                  <h2 className="text-2xl font-semibold text-purple-800 dark:text-purple-200 mb-6 flex items-center gap-2">
                    💭 Additional Details
                  </h2>
                  <div className="space-y-4">
                    <label htmlFor="reason" className="label text-purple-700 dark:text-purple-300">
                      Reason (Optional)
                    </label>
                    <textarea
                      id="reason"
                      value={formData.reason}
                      onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                      rows={5}
                      className="textarea resize-none bg-white dark:bg-gray-800 border-purple-200 dark:border-purple-700 focus:border-purple-400 focus:ring-purple-400/30"
                      placeholder="Please provide any additional details about your leave request that would help us process it more effectively..."
                    />
                    <p className="help text-purple-600 dark:text-purple-400">Help us understand the context of your request for faster processing</p>
                  </div>
                </div>

                <div className="bg-gradient-to-r from-gray-50 to-slate-50 dark:from-gray-800/50 dark:to-slate-800/50 rounded-2xl p-8 border border-gray-200 dark:border-gray-700/50">
                  <div className="flex flex-col sm:flex-row gap-6 justify-between items-center">
                    <div className="text-center sm:text-left">
                      <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-2">Ready to Submit?</h3>
                      <p className="text-gray-600 dark:text-gray-400">Review your information and submit your leave request</p>
                    </div>
                    <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
                      <button
                        type="button"
                        onClick={() => setFormData({ startDate: "", endDate: "", type: "", reason: "" })}
                        className="btn-secondary min-w-32"
                      >
                        🗑️ Clear Form
                      </button>
                      <button
                        type="submit"
                        disabled={isLoading}
                        className="btn-primary min-w-40 relative"
                      >
                        {isLoading ? (
                          <span className="flex items-center gap-2">
                            <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
                            </svg>
                            Submitting...
                          </span>
                        ) : (
                          <span className="flex items-center gap-2">
                            📋 Submit Request
                          </span>
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}