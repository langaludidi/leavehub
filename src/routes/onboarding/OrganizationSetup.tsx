import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../../lib/supabase';
import { useToast } from '../../components/Toast';
import { useUserRole } from '../../components/RequireRole';
import OnboardingWizard, { WizardStep } from '../../components/OnboardingWizard';

interface OrganizationData {
  name: string;
  industry: string;
  timezone: string;
  country: string;
  website: string;
  logo_url?: string;
  address: {
    street?: string;
    city?: string;
    state?: string;
    postal_code?: string;
  };
}

interface LeavePolicy {
  name: string;
  type: string;
  days_allowed: number;
  carryover_days: number;
  approval_required: boolean;
  notice_period_days: number;
}

interface Holiday {
  name: string;
  date: string;
  holiday_type: 'public' | 'company';
}

const INDUSTRIES = [
  'Technology', 'Healthcare', 'Finance', 'Education', 'Manufacturing',
  'Retail', 'Consulting', 'Non-profit', 'Government', 'Other'
];

const COUNTRIES = [
  { code: 'ZA', name: 'South Africa', timezone: 'Africa/Johannesburg' },
  { code: 'US', name: 'United States', timezone: 'America/New_York' },
  { code: 'GB', name: 'United Kingdom', timezone: 'Europe/London' },
  { code: 'AU', name: 'Australia', timezone: 'Australia/Sydney' },
  { code: 'CA', name: 'Canada', timezone: 'America/Toronto' },
];

const DEFAULT_LEAVE_POLICIES: LeavePolicy[] = [
  {
    name: 'Annual Leave',
    type: 'annual',
    days_allowed: 21,
    carryover_days: 5,
    approval_required: true,
    notice_period_days: 14
  },
  {
    name: 'Sick Leave',
    type: 'sick',
    days_allowed: 10,
    carryover_days: 0,
    approval_required: false,
    notice_period_days: 0
  },
  {
    name: 'Family Responsibility',
    type: 'family',
    days_allowed: 3,
    carryover_days: 0,
    approval_required: true,
    notice_period_days: 1
  }
];

const SA_PUBLIC_HOLIDAYS_2024: Holiday[] = [
  { name: "New Year's Day", date: '2024-01-01', holiday_type: 'public' },
  { name: "Human Rights Day", date: '2024-03-21', holiday_type: 'public' },
  { name: "Good Friday", date: '2024-03-29', holiday_type: 'public' },
  { name: "Family Day", date: '2024-04-01', holiday_type: 'public' },
  { name: "Freedom Day", date: '2024-04-27', holiday_type: 'public' },
  { name: "Workers' Day", date: '2024-05-01', holiday_type: 'public' },
  { name: "Youth Day", date: '2024-06-16', holiday_type: 'public' },
  { name: "National Women's Day", date: '2024-08-09', holiday_type: 'public' },
  { name: "Heritage Day", date: '2024-09-24', holiday_type: 'public' },
  { name: "Day of Reconciliation", date: '2024-12-16', holiday_type: 'public' },
  { name: "Christmas Day", date: '2024-12-25', holiday_type: 'public' },
  { name: "Day of Goodwill", date: '2024-12-26', holiday_type: 'public' }
];

export default function OrganizationSetup() {
  const [currentStep, setCurrentStep] = useState(0);
  const [orgData, setOrgData] = useState<OrganizationData>({
    name: '',
    industry: '',
    timezone: 'Africa/Johannesburg',
    country: 'ZA',
    website: '',
    address: {}
  });
  const [leavePolicies, setLeavePolicies] = useState<LeavePolicy[]>(DEFAULT_LEAVE_POLICIES);
  const [holidays, setHolidays] = useState<Holiday[]>([]);
  const [approvalWorkflow, setApprovalWorkflow] = useState('simple');
  const [employeeData, setEmployeeData] = useState('');
  const [customHolidays, setCustomHolidays] = useState<Holiday[]>([]);

  const navigate = useNavigate();
  const toast = useToast();
  const queryClient = useQueryClient();
  const { data: userRole } = useUserRole();

  const steps: WizardStep[] = [
    {
      id: 'company-basics',
      title: 'Company Basics',
      description: 'Tell us about your organization',
      icon: '🏢',
      completed: false
    },
    {
      id: 'leave-policies',
      title: 'Leave Policies',
      description: 'Configure leave types and allowances',
      icon: '📋',
      completed: false
    },
    {
      id: 'approval-workflow',
      title: 'Approval Process',
      description: 'Set up your approval workflow',
      icon: '✅',
      completed: false
    },
    {
      id: 'holidays',
      title: 'Holiday Calendar',
      description: 'Add public and company holidays',
      icon: '🎉',
      completed: false
    },
    {
      id: 'employees',
      title: 'Add Employees',
      description: 'Invite your team members',
      icon: '👥',
      completed: false
    }
  ];

  // Check if organization setup is needed
  const { data: orgSetupNeeded } = useQuery({
    queryKey: ['org-setup-needed', userRole?.orgId],
    queryFn: async () => {
      if (!userRole?.orgId) return true;

      const { data, error } = await supabase
        .from('organizations')
        .select('onboarding_completed')
        .eq('id', userRole.orgId)
        .single();

      if (error) return true;
      return !data.onboarding_completed;
    },
    enabled: !!userRole?.orgId
  });

  // Save organization setup
  const saveOrgMutation = useMutation({
    mutationFn: async () => {
      if (!userRole?.orgId) throw new Error('No organization');

      // Update organization
      const { error: orgError } = await supabase
        .from('organizations')
        .update({
          ...orgData,
          address: orgData.address,
          onboarding_completed: true,
          updated_at: new Date().toISOString()
        })
        .eq('id', userRole.orgId);

      if (orgError) throw orgError;

      // Save leave policies
      const { error: policiesError } = await supabase
        .from('leave_policies')
        .upsert(
          leavePolicies.map(policy => ({
            ...policy,
            org_id: userRole.orgId
          })),
          { onConflict: 'org_id,name' }
        );

      if (policiesError) throw policiesError;

      // Save holidays
      if (holidays.length > 0) {
        const { error: holidaysError } = await supabase
          .from('company_holidays')
          .upsert(
            holidays.map(holiday => ({
              ...holiday,
              org_id: userRole.orgId
            })),
            { onConflict: 'org_id,date,name' }
          );

        if (holidaysError) throw holidaysError;
      }

      // Save approval workflow
      const { error: workflowError } = await supabase
        .from('approval_workflows')
        .upsert({
          org_id: userRole.orgId,
          name: 'Default Workflow',
          steps: approvalWorkflow === 'simple' 
            ? [{ type: 'manager', required: true }]
            : [
                { type: 'manager', required: true },
                { type: 'hr', required: true },
                { type: 'director', required: false }
              ],
          default_workflow: true
        }, { onConflict: 'org_id,name' });

      if (workflowError) throw workflowError;

      // Process employee CSV if provided
      if (employeeData.trim()) {
        const employees = parseEmployeeCSV(employeeData);
        // This would normally call an edge function to send invitations
        console.log('Inviting employees:', employees);
      }

      return true;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['org-setup-needed'] });
      toast('🎉 Organization setup complete! Welcome to LeaveHub!', 'success');
      navigate('/admin');
    },
    onError: (error) => {
      console.error('Setup failed:', error);
      toast('Failed to complete setup. Please try again.', 'error');
    }
  });

  const parseEmployeeCSV = (csvData: string) => {
    const lines = csvData.trim().split('\n');
    const employees = [];
    
    for (let i = 1; i < lines.length; i++) { // Skip header
      const [name, email, role] = lines[i].split(',').map(s => s.trim());
      if (name && email) {
        employees.push({ name, email, role: role || 'employee' });
      }
    }
    
    return employees;
  };

  // Auto-load holidays for selected country
  useEffect(() => {
    if (orgData.country === 'ZA') {
      setHolidays(SA_PUBLIC_HOLIDAYS_2024);
    } else {
      setHolidays([]);
    }
  }, [orgData.country]);

  // Skip onboarding if already completed
  useEffect(() => {
    if (orgSetupNeeded === false) {
      navigate('/admin');
    }
  }, [orgSetupNeeded, navigate]);

  if (orgSetupNeeded === false) {
    return null; // Will redirect
  }

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      saveOrgMutation.mutate();
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const canProceed = () => {
    switch (currentStep) {
      case 0: return orgData.name && orgData.industry;
      case 1: return leavePolicies.length > 0;
      case 2: return true;
      case 3: return true;
      case 4: return true;
      default: return false;
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 0:
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold mb-2">Tell us about your company</h2>
              <p className="text-gray-600 dark:text-gray-400">
                This information helps us customize LeaveHub for your organization
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium mb-2">Company Name *</label>
                <input
                  type="text"
                  value={orgData.name}
                  onChange={(e) => setOrgData(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Acme Corporation"
                  className="input w-full"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Industry *</label>
                <select
                  value={orgData.industry}
                  onChange={(e) => setOrgData(prev => ({ ...prev, industry: e.target.value }))}
                  className="select w-full"
                >
                  <option value="">Select your industry</option>
                  {INDUSTRIES.map(industry => (
                    <option key={industry} value={industry}>{industry}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Country</label>
                <select
                  value={orgData.country}
                  onChange={(e) => {
                    const country = COUNTRIES.find(c => c.code === e.target.value);
                    setOrgData(prev => ({ 
                      ...prev, 
                      country: e.target.value,
                      timezone: country?.timezone || 'UTC'
                    }));
                  }}
                  className="select w-full"
                >
                  {COUNTRIES.map(country => (
                    <option key={country.code} value={country.code}>{country.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Website (Optional)</label>
                <input
                  type="url"
                  value={orgData.website}
                  onChange={(e) => setOrgData(prev => ({ ...prev, website: e.target.value }))}
                  placeholder="https://acme.com"
                  className="input w-full"
                />
              </div>
            </div>

            {orgData.country === 'ZA' && (
              <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800/30 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-green-600 dark:text-green-400">🇿🇦</span>
                  <span className="font-semibold text-green-800 dark:text-green-200">
                    South African Compliance
                  </span>
                </div>
                <p className="text-sm text-green-700 dark:text-green-300">
                  We've pre-configured South African leave policies and public holidays to ensure compliance with local labor laws.
                </p>
              </div>
            )}
          </div>
        );

      case 1:
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold mb-2">Configure Leave Policies</h2>
              <p className="text-gray-600 dark:text-gray-400">
                Set up your leave types and allowances. You can always modify these later.
              </p>
            </div>

            <div className="space-y-4">
              {leavePolicies.map((policy, index) => (
                <div key={index} className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-center">
                    <div>
                      <input
                        type="text"
                        value={policy.name}
                        onChange={(e) => {
                          const updated = [...leavePolicies];
                          updated[index].name = e.target.value;
                          setLeavePolicies(updated);
                        }}
                        className="input w-full"
                        placeholder="Leave type name"
                      />
                    </div>
                    <div>
                      <input
                        type="number"
                        value={policy.days_allowed}
                        onChange={(e) => {
                          const updated = [...leavePolicies];
                          updated[index].days_allowed = parseInt(e.target.value) || 0;
                          setLeavePolicies(updated);
                        }}
                        className="input w-full"
                        placeholder="Days allowed"
                        min="0"
                      />
                      <span className="text-xs text-gray-500">Days per year</span>
                    </div>
                    <div>
                      <input
                        type="number"
                        value={policy.carryover_days}
                        onChange={(e) => {
                          const updated = [...leavePolicies];
                          updated[index].carryover_days = parseInt(e.target.value) || 0;
                          setLeavePolicies(updated);
                        }}
                        className="input w-full"
                        placeholder="Carryover days"
                        min="0"
                      />
                      <span className="text-xs text-gray-500">Can carry over</span>
                    </div>
                    <div className="flex gap-2">
                      <label className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={policy.approval_required}
                          onChange={(e) => {
                            const updated = [...leavePolicies];
                            updated[index].approval_required = e.target.checked;
                            setLeavePolicies(updated);
                          }}
                          className="rounded"
                        />
                        <span className="text-sm">Requires approval</span>
                      </label>
                    </div>
                  </div>
                </div>
              ))}

              <button
                onClick={() => setLeavePolicies(prev => [...prev, {
                  name: 'Custom Leave',
                  type: 'custom',
                  days_allowed: 0,
                  carryover_days: 0,
                  approval_required: true,
                  notice_period_days: 0
                }])}
                className="btn-secondary w-full"
              >
                + Add Custom Leave Type
              </button>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold mb-2">Approval Workflow</h2>
              <p className="text-gray-600 dark:text-gray-400">
                Choose how leave requests should be approved in your organization
              </p>
            </div>

            <div className="space-y-4">
              <label className="flex items-start gap-4 p-4 border rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800/50">
                <input
                  type="radio"
                  name="workflow"
                  value="simple"
                  checked={approvalWorkflow === 'simple'}
                  onChange={(e) => setApprovalWorkflow(e.target.value)}
                  className="mt-1"
                />
                <div>
                  <div className="font-semibold">Simple Approval</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                    Manager approves → Request approved
                  </div>
                  <div className="text-xs text-gray-500">
                    Best for smaller teams or flat organizations
                  </div>
                </div>
              </label>

              <label className="flex items-start gap-4 p-4 border rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800/50">
                <input
                  type="radio"
                  name="workflow"
                  value="multi-step"
                  checked={approvalWorkflow === 'multi-step'}
                  onChange={(e) => setApprovalWorkflow(e.target.value)}
                  className="mt-1"
                />
                <div>
                  <div className="font-semibold">Multi-step Approval</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                    Manager → HR → Director (optional)
                  </div>
                  <div className="text-xs text-gray-500">
                    Best for larger organizations with formal approval processes
                  </div>
                </div>
              </label>
            </div>

            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800/30 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <span className="text-blue-500 text-lg">💡</span>
                <div>
                  <div className="font-semibold text-blue-800 dark:text-blue-200 mb-1">
                    Pro Tip
                  </div>
                  <p className="text-sm text-blue-700 dark:text-blue-300">
                    You can customize approval workflows later and create different flows for different leave types.
                  </p>
                </div>
              </div>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold mb-2">Holiday Calendar</h2>
              <p className="text-gray-600 dark:text-gray-400">
                We've pre-loaded holidays for your country. You can add custom company holidays too.
              </p>
            </div>

            {holidays.length > 0 && (
              <div>
                <h3 className="font-semibold mb-4 flex items-center gap-2">
                  <span>🎉</span>
                  Public Holidays ({holidays.length})
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-h-60 overflow-y-auto">
                  {holidays.map((holiday, index) => (
                    <div key={index} className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3">
                      <div className="font-medium">{holiday.name}</div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">
                        {new Date(holiday.date).toLocaleDateString()}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div>
              <h3 className="font-semibold mb-4 flex items-center gap-2">
                <span>🏢</span>
                Company Holidays
              </h3>
              
              <div className="space-y-4">
                {customHolidays.map((holiday, index) => (
                  <div key={index} className="flex gap-4 items-center">
                    <input
                      type="text"
                      value={holiday.name}
                      onChange={(e) => {
                        const updated = [...customHolidays];
                        updated[index].name = e.target.value;
                        setCustomHolidays(updated);
                      }}
                      placeholder="Holiday name"
                      className="input flex-1"
                    />
                    <input
                      type="date"
                      value={holiday.date}
                      onChange={(e) => {
                        const updated = [...customHolidays];
                        updated[index].date = e.target.value;
                        setCustomHolidays(updated);
                      }}
                      className="input"
                    />
                    <button
                      onClick={() => {
                        const updated = customHolidays.filter((_, i) => i !== index);
                        setCustomHolidays(updated);
                      }}
                      className="text-red-500 hover:text-red-700"
                    >
                      Remove
                    </button>
                  </div>
                ))}

                <button
                  onClick={() => setCustomHolidays(prev => [...prev, {
                    name: '',
                    date: '',
                    holiday_type: 'company'
                  }])}
                  className="btn-secondary w-full"
                >
                  + Add Company Holiday
                </button>
              </div>
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold mb-2">Invite Your Team</h2>
              <p className="text-gray-600 dark:text-gray-400">
                Add your employees to get started. You can invite them individually or upload a CSV file.
              </p>
            </div>

            <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800/30 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <span className="text-yellow-500 text-lg">⚠️</span>
                <div>
                  <div className="font-semibold text-yellow-800 dark:text-yellow-200 mb-1">
                    Optional Step
                  </div>
                  <p className="text-sm text-yellow-700 dark:text-yellow-300">
                    You can skip this step and invite employees later from the admin dashboard.
                  </p>
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Employee CSV Data (Optional)
              </label>
              <p className="text-xs text-gray-500 mb-2">
                Format: Name, Email, Role (one per line with header)
              </p>
              <textarea
                value={employeeData}
                onChange={(e) => setEmployeeData(e.target.value)}
                placeholder={`Name,Email,Role
John Doe,john@company.com,employee
Jane Smith,jane@company.com,manager`}
                rows={8}
                className="textarea w-full font-mono text-sm"
              />
              {employeeData && (
                <p className="text-sm text-gray-500 mt-2">
                  {parseEmployeeCSV(employeeData).length} employees will be invited
                </p>
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
      isLoading={saveOrgMutation.isPending}
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
          disabled={!canProceed() || saveOrgMutation.isPending}
          className="btn-primary disabled:opacity-50"
        >
          {currentStep === steps.length - 1 ? 
            (saveOrgMutation.isPending ? 'Completing Setup...' : '🎉 Complete Setup') : 
            'Next →'
          }
        </button>
      </div>
    </OnboardingWizard>
  );
}