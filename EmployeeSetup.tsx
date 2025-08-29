import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../../lib/supabase';
import { useToast } from '../../components/Toast';
import { useUserRole } from '../../components/RequireRole';
import OnboardingWizard, { WizardStep } from '../../components/OnboardingWizard';

interface EmployeeProfile {
  full_name: string;
  job_title: string;
  employee_id: string;
  hire_date: string;
  phone: string;
  emergency_contact: {
    name: string;
    relationship: string;
    phone: string;
    email?: string;
  };
  preferences: {
    default_leave_type: string;
    notification_preferences: {
      email: boolean;
      slack: boolean;
    };
  };
}

export default function EmployeeSetup() {
  const [currentStep, setCurrentStep] = useState(0);
  const [profileData, setProfileData] = useState<EmployeeProfile>({
    full_name: '',
    job_title: '',
    employee_id: '',
    hire_date: '',
    phone: '',
    emergency_contact: {
      name: '',
      relationship: '',
      phone: ''
    },
    preferences: {
      default_leave_type: 'annual',
      notification_preferences: {
        email: true,
        slack: false
      }
    }
  });
  const [tourCompleted, setTourCompleted] = useState(false);

  const navigate = useNavigate();
  const toast = useToast();
  const queryClient = useQueryClient();
  const { data: userRole } = useUserRole();

  const steps: WizardStep[] = [
    {
      id: 'personal-info',
      title: 'Personal Information',
      description: 'Tell us about yourself',
      icon: '👤',
      completed: false
    },
    {
      id: 'job-details',
      title: 'Job Details',
      description: 'Your role and department info',
      icon: '💼',
      completed: false
    },
    {
      id: 'emergency-contact',
      title: 'Emergency Contact',
      description: 'Someone we can reach in emergencies',
      icon: '🚨',
      completed: false
    },
    {
      id: 'preferences',
      title: 'Leave Preferences',
      description: 'Set your default leave settings',
      icon: '⚙️',
      completed: false
    },
    {
      id: 'tour',
      title: 'Quick Tour',
      description: 'Learn how to use LeaveHub',
      icon: '🎯',
      completed: tourCompleted
    }
  ];

  // Check if employee setup is needed
  const { data: employeeSetupNeeded, isLoading: checkingSetup } = useQuery({
    queryKey: ['employee-setup-needed', userRole?.userId],
    queryFn: async () => {
      if (!userRole?.userId) return true;

      const { data, error } = await supabase
        .from('employee_profiles')
        .select('onboarding_completed')
        .eq('user_id', userRole.userId)
        .single();

      if (error && error.code !== 'PGRST116') { // Not found error
        throw error;
      }

      return !data?.onboarding_completed;
    },
    enabled: !!userRole?.userId
  });

  // Get organization leave policies for preferences
  const { data: leavePolicies } = useQuery({
    queryKey: ['leave-policies', userRole?.orgId],
    queryFn: async () => {
      if (!userRole?.orgId) return [];

      const { data, error } = await supabase
        .from('leave_policies')
        .select('*')
        .eq('org_id', userRole.orgId)
        .eq('active', true)
        .order('name');

      if (error) throw error;
      return data;
    },
    enabled: !!userRole?.orgId
  });

  // Get current user profile to pre-fill data
  const { data: currentProfile } = useQuery({
    queryKey: ['current-profile', userRole?.userId],
    queryFn: async () => {
      if (!userRole?.userId) return null;

      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userRole.userId)
        .single();

      if (error) throw error;
      return data;
    },
    enabled: !!userRole?.userId
  });

  // Save employee profile
  const saveProfileMutation = useMutation({
    mutationFn: async () => {
      if (!userRole?.userId || !userRole?.orgId) throw new Error('Missing user or org data');

      // Update main profile
      const { error: profileError } = await supabase
        .from('profiles')
        .update({
          full_name: profileData.full_name,
          updated_at: new Date().toISOString()
        })
        .eq('id', userRole.userId);

      if (profileError) throw profileError;

      // Upsert employee profile
      const { error: empError } = await supabase
        .from('employee_profiles')
        .upsert({
          user_id: userRole.userId,
          org_id: userRole.orgId,
          job_title: profileData.job_title,
          employee_id: profileData.employee_id,
          hire_date: profileData.hire_date || null,
          phone: profileData.phone,
          emergency_contact: profileData.emergency_contact,
          preferences: profileData.preferences,
          onboarding_completed: true,
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'user_id'
        });

      if (empError) throw empError;

      return true;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['employee-setup-needed'] });
      toast('🎉 Profile setup complete! Welcome to your team!', 'success');
      navigate('/employee');
    },
    onError: (error) => {
      console.error('Profile setup failed:', error);
      toast('Failed to save profile. Please try again.', 'error');
    }
  });

  // Pre-fill data from existing profile
  useEffect(() => {
    if (currentProfile) {
      setProfileData(prev => ({
        ...prev,
        full_name: currentProfile.full_name || '',
      }));
    }
  }, [currentProfile]);

  // Skip onboarding if already completed
  useEffect(() => {
    if (employeeSetupNeeded === false) {
      navigate('/employee');
    }
  }, [employeeSetupNeeded, navigate]);

  if (checkingSetup) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-gray-100 dark:from-gray-950 dark:to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin h-8 w-8 mx-auto mb-4">
            <svg className="w-8 h-8 text-teal-600" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 714 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
            </svg>
          </div>
          <p className="text-gray-600 dark:text-gray-400">Loading...</p>
        </div>
      </div>
    );
  }

  if (employeeSetupNeeded === false) {
    return null; // Will redirect
  }

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      saveProfileMutation.mutate();
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const canProceed = () => {
    switch (currentStep) {
      case 0: return profileData.full_name.trim();
      case 1: return profileData.job_title.trim();
      case 2: return profileData.emergency_contact.name.trim() && profileData.emergency_contact.phone.trim();
      case 3: return true;
      case 4: return tourCompleted;
      default: return false;
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 0:
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold mb-2">Welcome to the team! 👋</h2>
              <p className="text-gray-600 dark:text-gray-400">
                Let's set up your profile so you can start managing your leave
              </p>
            </div>

            <div className="max-w-md mx-auto space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Full Name *</label>
                <input
                  type="text"
                  value={profileData.full_name}
                  onChange={(e) => setProfileData(prev => ({ ...prev, full_name: e.target.value }))}
                  placeholder="John Doe"
                  className="input w-full"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Phone Number (Optional)</label>
                <input
                  type="tel"
                  value={profileData.phone}
                  onChange={(e) => setProfileData(prev => ({ ...prev, phone: e.target.value }))}
                  placeholder="+1 (555) 123-4567"
                  className="input w-full"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Employee ID (Optional)</label>
                <input
                  type="text"
                  value={profileData.employee_id}
                  onChange={(e) => setProfileData(prev => ({ ...prev, employee_id: e.target.value }))}
                  placeholder="EMP001"
                  className="input w-full"
                />
                <p className="text-xs text-gray-500 mt-1">This helps HR identify you in reports</p>
              </div>
            </div>
          </div>
        );

      case 1:
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold mb-2">Tell us about your role</h2>
              <p className="text-gray-600 dark:text-gray-400">
                This helps us organize your leave requests properly
              </p>
            </div>

            <div className="max-w-md mx-auto space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Job Title *</label>
                <input
                  type="text"
                  value={profileData.job_title}
                  onChange={(e) => setProfileData(prev => ({ ...prev, job_title: e.target.value }))}
                  placeholder="Software Engineer"
                  className="input w-full"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Hire Date (Optional)</label>
                <input
                  type="date"
                  value={profileData.hire_date}
                  onChange={(e) => setProfileData(prev => ({ ...prev, hire_date: e.target.value }))}
                  className="input w-full"
                />
                <p className="text-xs text-gray-500 mt-1">Used to calculate leave balances</p>
              </div>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold mb-2">Emergency Contact</h2>
              <p className="text-gray-600 dark:text-gray-400">
                Someone we can contact in case of an emergency
              </p>
            </div>

            <div className="max-w-md mx-auto space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Contact Name *</label>
                <input
                  type="text"
                  value={profileData.emergency_contact.name}
                  onChange={(e) => setProfileData(prev => ({ 
                    ...prev, 
                    emergency_contact: { ...prev.emergency_contact, name: e.target.value }
                  }))}
                  placeholder="Jane Doe"
                  className="input w-full"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Relationship</label>
                <select
                  value={profileData.emergency_contact.relationship}
                  onChange={(e) => setProfileData(prev => ({ 
                    ...prev, 
                    emergency_contact: { ...prev.emergency_contact, relationship: e.target.value }
                  }))}
                  className="select w-full"
                >
                  <option value="">Select relationship</option>
                  <option value="spouse">Spouse</option>
                  <option value="parent">Parent</option>
                  <option value="sibling">Sibling</option>
                  <option value="child">Child</option>
                  <option value="friend">Friend</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Phone Number *</label>
                <input
                  type="tel"
                  value={profileData.emergency_contact.phone}
                  onChange={(e) => setProfileData(prev => ({ 
                    ...prev, 
                    emergency_contact: { ...prev.emergency_contact, phone: e.target.value }
                  }))}
                  placeholder="+1 (555) 123-4567"
                  className="input w-full"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Email (Optional)</label>
                <input
                  type="email"
                  value={profileData.emergency_contact.email || ''}
                  onChange={(e) => setProfileData(prev => ({ 
                    ...prev, 
                    emergency_contact: { ...prev.emergency_contact, email: e.target.value }
                  }))}
                  placeholder="jane@example.com"
                  className="input w-full"
                />
              </div>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold mb-2">Leave Preferences</h2>
              <p className="text-gray-600 dark:text-gray-400">
                Set your default leave settings to make requesting time off easier
              </p>
            </div>

            <div className="max-w-md mx-auto space-y-6">
              <div>
                <label className="block text-sm font-medium mb-2">Default Leave Type</label>
                <select
                  value={profileData.preferences.default_leave_type}
                  onChange={(e) => setProfileData(prev => ({ 
                    ...prev, 
                    preferences: { ...prev.preferences, default_leave_type: e.target.value }
                  }))}
                  className="select w-full"
                >
                  {leavePolicies?.map(policy => (
                    <option key={policy.id} value={policy.type}>
                      {policy.name} ({policy.days_allowed} days/year)
                    </option>
                  ))}
                </select>
                <p className="text-xs text-gray-500 mt-1">
                  This will be pre-selected when you request leave
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium mb-3">Notification Preferences</label>
                <div className="space-y-3">
                  <label className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      checked={profileData.preferences.notification_preferences.email}
                      onChange={(e) => setProfileData(prev => ({ 
                        ...prev, 
                        preferences: { 
                          ...prev.preferences, 
                          notification_preferences: { 
                            ...prev.preferences.notification_preferences,
                            email: e.target.checked 
                          }
                        }
                      }))}
                      className="rounded"
                    />
                    <div>
                      <div className="font-medium">Email Notifications</div>
                      <div className="text-sm text-gray-500">
                        Get notified about leave request updates via email
                      </div>
                    </div>
                  </label>

                  <label className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      checked={profileData.preferences.notification_preferences.slack}
                      onChange={(e) => setProfileData(prev => ({ 
                        ...prev, 
                        preferences: { 
                          ...prev.preferences, 
                          notification_preferences: { 
                            ...prev.preferences.notification_preferences,
                            slack: e.target.checked 
                          }
                        }
                      }))}
                      className="rounded"
                    />
                    <div>
                      <div className="font-medium">Slack Notifications</div>
                      <div className="text-sm text-gray-500">
                        Get updates in Slack (if configured)
                      </div>
                    </div>
                  </label>
                </div>
              </div>
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold mb-2">Quick Tour</h2>
              <p className="text-gray-600 dark:text-gray-400">
                Learn how to make the most of LeaveHub
              </p>
            </div>

            <div className="max-w-2xl mx-auto space-y-6">
              {/* Tour Steps */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-gradient-to-r from-teal-50 to-cyan-50 dark:from-teal-900/20 dark:to-cyan-900/20 border border-teal-200 dark:border-teal-800/30 rounded-lg p-6">
                  <div className="text-3xl mb-3">📋</div>
                  <h3 className="font-semibold mb-2">Request Leave</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Submit leave requests with just a few clicks. Your manager will be notified automatically.
                  </p>
                </div>

                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border border-blue-200 dark:border-blue-800/30 rounded-lg p-6">
                  <div className="text-3xl mb-3">📊</div>
                  <h3 className="font-semibold mb-2">Track Balances</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Keep track of your leave balances and see how many days you have remaining.
                  </p>
                </div>

                <div className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border border-green-200 dark:border-green-800/30 rounded-lg p-6">
                  <div className="text-3xl mb-3">📱</div>
                  <h3 className="font-semibold mb-2">Mobile Access</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Access LeaveHub from any device. The mobile-friendly interface works everywhere.
                  </p>
                </div>

                <div className="bg-gradient-to-r from-purple-50 to-violet-50 dark:from-purple-900/20 dark:to-violet-900/20 border border-purple-200 dark:border-purple-800/30 rounded-lg p-6">
                  <div className="text-3xl mb-3">📈</div>
                  <h3 className="font-semibold mb-2">View History</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    See all your past leave requests and track patterns in your time off.
                  </p>
                </div>
              </div>

              {/* Approval Process */}
              <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800/30 rounded-lg p-6">
                <h3 className="font-semibold mb-3 flex items-center gap-2">
                  <span>✅</span>
                  Your Approval Process
                </h3>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  <p>When you submit a leave request:</p>
                  <ol className="list-decimal list-inside mt-2 space-y-1">
                    <li>Your manager gets notified immediately</li>
                    <li>They can approve or request more information</li>
                    <li>You'll be notified of the decision via email</li>
                    <li>Calendar events are created automatically</li>
                  </ol>
                </div>
              </div>

              {/* Ready to Start */}
              <div className="text-center">
                <label className="flex items-center justify-center gap-3">
                  <input
                    type="checkbox"
                    checked={tourCompleted}
                    onChange={(e) => setTourCompleted(e.target.checked)}
                    className="rounded"
                  />
                  <span className="font-medium">
                    I understand how to use LeaveHub and I'm ready to get started!
                  </span>
                </label>
              </div>

              {tourCompleted && (
                <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800/30 rounded-lg p-6 text-center">
                  <div className="text-3xl mb-3">🎉</div>
                  <h3 className="font-semibold text-green-800 dark:text-green-200 mb-2">
                    You're all set!
                  </h3>
                  <p className="text-sm text-green-700 dark:text-green-300">
                    Ready to submit your first leave request?
                  </p>
                </div>
              )}
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <OnboardingWizard
      steps={steps}
      currentStep={currentStep}
      onStepChange={setCurrentStep}
      isLoading={saveProfileMutation.isPending}
    >
      {renderStepContent()}
      
      <div className="flex justify-between mt-8">
        <button
          onClick={handlePrevious}
          disabled={currentStep === 0}
          className="btn-secondary disabled:opacity-50"
        >
          ← Previous
        </button>
        
        <button
          onClick={handleNext}
          disabled={!canProceed() || saveProfileMutation.isPending}
          className="btn-primary disabled:opacity-50"
        >
          {currentStep === steps.length - 1 ? 
            (saveProfileMutation.isPending ? 'Completing Setup...' : '🎉 Complete Setup') : 
            'Next →'
          }
        </button>
      </div>
    </OnboardingWizard>
  );
}