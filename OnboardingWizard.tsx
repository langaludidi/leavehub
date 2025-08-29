import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from '../../components/Toast';
import { supabase } from '../../lib/supabase';
import {
  CheckCircleIcon,
  ChevronRightIcon,
  ChevronLeftIcon,
  ExclamationTriangleIcon,
  ShieldCheckIcon,
  UserGroupIcon,
  CogIcon,
  DocumentCheckIcon,
  RocketLaunchIcon
} from '@heroicons/react/24/outline';

interface OnboardingStep {
  step_number: number;
  step_name: string;
  step_description: string;
  required_fields: string[];
  field_templates: Record<string, any>;
  estimated_duration_minutes: number;
  is_required: boolean;
  can_skip: boolean;
}

interface OnboardingProgress {
  id: string;
  current_step: number;
  total_steps: number;
  completed_steps: number;
  progress_percentage: number;
  is_completed: boolean;
  compliance_framework: string;
  compliance_validated: boolean;
  step_status: Record<string, any>;
}

const STEP_ICONS = {
  1: UserGroupIcon,
  2: ShieldCheckIcon,
  3: DocumentCheckIcon,
  4: UserGroupIcon,
  5: CogIcon,
  6: DocumentCheckIcon,
  7: CogIcon,
  8: RocketLaunchIcon
};

const STEP_COLORS = {
  1: 'blue',
  2: 'green',
  3: 'purple',
  4: 'orange',
  5: 'teal',
  6: 'red',
  7: 'indigo',
  8: 'emerald'
};

async function fetchOnboardingSteps(framework: string = 'south_africa_bcea'): Promise<OnboardingStep[]> {
  const { data, error } = await supabase
    .from('onboarding_step_templates')
    .select('*')
    .eq('compliance_framework', framework)
    .order('step_number');

  if (error) throw error;
  return data || [];
}

async function fetchOnboardingProgress(): Promise<OnboardingProgress | null> {
  const { data: user } = await supabase.auth.getUser();
  if (!user.user) return null;

  const { data: userProfile } = await supabase
    .from('user_profiles')
    .select('organization_id')
    .eq('user_id', user.user.id)
    .single();

  if (!userProfile?.organization_id) return null;

  const { data, error } = await supabase.rpc('get_onboarding_progress', {
    org_id: userProfile.organization_id
  });

  if (error) throw error;
  return data;
}

async function completeOnboardingStep(stepNumber: number, stepData: Record<string, any>): Promise<void> {
  const { data: user } = await supabase.auth.getUser();
  if (!user.user) throw new Error('Not authenticated');

  const { data: userProfile } = await supabase
    .from('user_profiles')
    .select('organization_id')
    .eq('user_id', user.user.id)
    .single();

  if (!userProfile?.organization_id) throw new Error('No organization found');

  const { data, error } = await supabase.rpc('complete_onboarding_step', {
    org_id: userProfile.organization_id,
    step_num: stepNumber,
    step_data: stepData
  });

  if (error) throw error;
  return data;
}

function StepForm({ 
  step, 
  initialData = {}, 
  onSubmit,
  isLoading = false
}: { 
  step: OnboardingStep;
  initialData?: Record<string, any>;
  onSubmit: (data: Record<string, any>) => void;
  isLoading?: boolean;
}) {
  const [formData, setFormData] = useState(initialData);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};
    
    for (const field of step.required_fields) {
      const template = step.field_templates[field];
      if (!template) continue;

      const value = formData[field];
      
      if (!template.optional && (!value || (typeof value === 'string' && !value.trim()))) {
        newErrors[field] = `${template.label} is required`;
      }
      
      if (template.type === 'email' && value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
        newErrors[field] = 'Please enter a valid email address';
      }
      
      if (template.type === 'number' && value && template.min && Number(value) < template.min) {
        newErrors[field] = `Minimum value is ${template.min}`;
      }
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      onSubmit(formData);
    }
  };

  const renderField = (fieldName: string, template: any) => {
    const value = formData[fieldName] || template.default || '';
    const hasError = errors[fieldName];
    
    const baseClasses = `input ${hasError ? 'border-red-500 focus:border-red-500 focus:ring-red-500/30' : ''}`;
    
    const updateValue = (newValue: any) => {
      setFormData(prev => ({ ...prev, [fieldName]: newValue }));
      if (errors[fieldName]) {
        setErrors(prev => ({ ...prev, [fieldName]: '' }));
      }
    };

    switch (template.type) {
      case 'text':
      case 'email':
      case 'tel':
        return (
          <div key={fieldName} className="space-y-2">
            <label className="label">
              {template.label} {!template.optional && '*'}
            </label>
            <input
              type={template.type}
              value={value}
              onChange={(e) => updateValue(e.target.value)}
              className={baseClasses}
              placeholder={template.placeholder}
            />
            {hasError && <p className="text-sm text-red-600">{hasError}</p>}
          </div>
        );

      case 'textarea':
        return (
          <div key={fieldName} className="space-y-2">
            <label className="label">
              {template.label} {!template.optional && '*'}
            </label>
            <textarea
              value={value}
              onChange={(e) => updateValue(e.target.value)}
              className={baseClasses.replace('input', 'textarea')}
              placeholder={template.placeholder}
              rows={3}
            />
            {hasError && <p className="text-sm text-red-600">{hasError}</p>}
          </div>
        );

      case 'select':
        return (
          <div key={fieldName} className="space-y-2">
            <label className="label">
              {template.label} {!template.optional && '*'}
            </label>
            <select
              value={value}
              onChange={(e) => updateValue(e.target.value)}
              className={baseClasses.replace('input', 'select')}
            >
              <option value="">Select an option...</option>
              {template.options?.map((option: string) => (
                <option key={option} value={option}>{option}</option>
              ))}
            </select>
            {hasError && <p className="text-sm text-red-600">{hasError}</p>}
          </div>
        );

      case 'checkbox':
        return (
          <div key={fieldName} className="space-y-2">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={!!value}
                onChange={(e) => updateValue(e.target.checked)}
                className="checkbox"
              />
              <span className="text-sm">
                {template.label} {!template.optional && '*'}
              </span>
            </label>
            {hasError && <p className="text-sm text-red-600">{hasError}</p>}
          </div>
        );

      case 'number':
        return (
          <div key={fieldName} className="space-y-2">
            <label className="label">
              {template.label} {!template.optional && '*'}
            </label>
            <input
              type="number"
              value={value}
              onChange={(e) => updateValue(Number(e.target.value))}
              className={baseClasses}
              min={template.min}
              max={template.max}
            />
            {hasError && <p className="text-sm text-red-600">{hasError}</p>}
          </div>
        );

      case 'file':
        return (
          <div key={fieldName} className="space-y-2">
            <label className="label">
              {template.label} {!template.optional && '*'}
            </label>
            <input
              type="file"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) updateValue(file);
              }}
              className={baseClasses}
              accept={template.accept}
            />
            {hasError && <p className="text-sm text-red-600">{hasError}</p>}
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-4">
        {Object.entries(step.field_templates).map(([fieldName, template]) =>
          renderField(fieldName, template)
        )}
      </div>
      
      <div className="flex justify-end">
        <button
          type="submit"
          disabled={isLoading}
          className="btn-primary flex items-center gap-2"
        >
          {isLoading ? (
            <>
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              Processing...
            </>
          ) : (
            <>
              Continue
              <ChevronRightIcon className="w-4 h-4" />
            </>
          )}
        </button>
      </div>
    </form>
  );
}

export default function OnboardingWizard() {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const toast = useToast();
  const queryClient = useQueryClient();

  const { data: steps, isLoading: stepsLoading } = useQuery({
    queryKey: ['onboarding-steps'],
    queryFn: () => fetchOnboardingSteps()
  });

  const { data: progress, isLoading: progressLoading } = useQuery({
    queryKey: ['onboarding-progress'],
    queryFn: fetchOnboardingProgress,
    refetchInterval: 5000 // Refresh every 5 seconds
  });

  const completeStepMutation = useMutation({
    mutationFn: ({ stepNumber, data }: { stepNumber: number; data: Record<string, any> }) =>
      completeOnboardingStep(stepNumber, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['onboarding-progress'] });
      toast('Step completed successfully!', 'success');
      
      // Auto-advance to next step
      if (currentStepIndex < (steps?.length || 0) - 1) {
        setCurrentStepIndex(prev => prev + 1);
      }
    },
    onError: (error: Error) => {
      toast(`Failed to complete step: ${error.message}`, 'error');
    }
  });

  // Sync current step with progress
  useEffect(() => {
    if (progress && progress.current_step && steps) {
      const stepIndex = Math.min(progress.current_step - 1, steps.length - 1);
      setCurrentStepIndex(Math.max(0, stepIndex));
    }
  }, [progress, steps]);

  const handleStepComplete = (stepData: Record<string, any>) => {
    const currentStep = steps?.[currentStepIndex];
    if (!currentStep) return;

    completeStepMutation.mutate({
      stepNumber: currentStep.step_number,
      data: stepData
    });
  };

  if (stepsLoading || progressLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading onboarding wizard...</p>
        </div>
      </div>
    );
  }

  if (progress?.is_completed) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-emerald-100 dark:from-green-950 dark:to-emerald-950">
        <div className="text-center max-w-md mx-auto p-8">
          <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircleIcon className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-green-800 dark:text-green-200 mb-4">
            🎉 Onboarding Complete!
          </h1>
          <p className="text-green-600 dark:text-green-300 mb-6">
            Your organization is now set up and ready to use LeaveHub. Your 14-day trial has been activated.
          </p>
          <button 
            onClick={() => window.location.href = '/admin'}
            className="btn-primary"
          >
            Go to Dashboard
          </button>
        </div>
      </div>
    );
  }

  if (!steps || steps.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <ExclamationTriangleIcon className="w-12 h-12 text-yellow-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold mb-2">No Onboarding Steps Found</h2>
          <p className="text-gray-600">Unable to load the onboarding process.</p>
        </div>
      </div>
    );
  }

  const currentStep = steps[currentStepIndex];
  const StepIcon = STEP_ICONS[currentStep.step_number as keyof typeof STEP_ICONS] || CogIcon;
  const stepColor = STEP_COLORS[currentStep.step_number as keyof typeof STEP_COLORS] || 'blue';
  const completedSteps = progress?.completed_steps || 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-gray-100 dark:from-gray-950 dark:to-slate-900">
      <div className="container py-8 px-6">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold gradient-text mb-2">Organization Onboarding</h1>
            <p className="text-gray-600 dark:text-gray-300">
              Set up your organization with South African BCEA compliance
            </p>
          </div>

          {/* Progress Bar */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Step {currentStepIndex + 1} of {steps.length}
              </span>
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                {progress?.progress_percentage || 0}% Complete
              </span>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
              <div
                className="bg-gradient-to-r from-blue-500 to-green-500 h-2 rounded-full transition-all duration-500"
                style={{ width: `${(completedSteps / steps.length) * 100}%` }}
              />
            </div>
          </div>

          {/* Step Navigation */}
          <div className="flex items-center justify-center mb-8 overflow-x-auto">
            <div className="flex items-center space-x-4">
              {steps.map((step, index) => {
                const Icon = STEP_ICONS[step.step_number as keyof typeof STEP_ICONS] || CogIcon;
                const isCompleted = progress?.step_status[`step_${step.step_number}`]?.completed;
                const isCurrent = index === currentStepIndex;
                const isAccessible = index <= currentStepIndex || isCompleted;

                return (
                  <div key={step.step_number} className="flex items-center">
                    <button
                      onClick={() => isAccessible && setCurrentStepIndex(index)}
                      disabled={!isAccessible}
                      className={`flex items-center justify-center w-10 h-10 rounded-full transition-colors ${
                        isCompleted
                          ? 'bg-green-500 text-white'
                          : isCurrent
                          ? `bg-${stepColor}-500 text-white`
                          : isAccessible
                          ? 'bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
                          : 'bg-gray-100 dark:bg-gray-800 text-gray-400 cursor-not-allowed'
                      }`}
                    >
                      {isCompleted ? (
                        <CheckCircleIcon className="w-5 h-5" />
                      ) : (
                        <Icon className="w-5 h-5" />
                      )}
                    </button>
                    {index < steps.length - 1 && (
                      <div className={`w-8 h-0.5 mx-2 ${
                        isCompleted ? 'bg-green-500' : 'bg-gray-200 dark:bg-gray-700'
                      }`} />
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Current Step Content */}
          <div className="card shadow-xl">
            <div className="card-body">
              <div className="flex items-center gap-4 mb-6">
                <div className={`p-3 bg-${stepColor}-100 dark:bg-${stepColor}-900/20 rounded-lg`}>
                  <StepIcon className={`w-8 h-8 text-${stepColor}-600 dark:text-${stepColor}-400`} />
                </div>
                <div>
                  <h2 className="text-2xl font-bold">{currentStep.step_name}</h2>
                  <p className="text-gray-600 dark:text-gray-400">{currentStep.step_description}</p>
                  <p className="text-sm text-gray-500 mt-1">
                    ⏱️ Estimated time: {currentStep.estimated_duration_minutes} minutes
                  </p>
                </div>
              </div>

              {/* Compliance Warning for Step 2 */}
              {currentStep.step_number === 2 && (
                <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4 mb-6">
                  <div className="flex items-start gap-3">
                    <ShieldCheckIcon className="w-6 h-6 text-yellow-600 dark:text-yellow-400 flex-shrink-0 mt-0.5" />
                    <div>
                      <h3 className="font-medium text-yellow-800 dark:text-yellow-200">
                        BCEA Compliance Required
                      </h3>
                      <p className="text-sm text-yellow-700 dark:text-yellow-300 mt-1">
                        Your organization must comply with the Basic Conditions of Employment Act (BCEA). 
                        This includes specific leave entitlements, working time regulations, and employee rights.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              <StepForm
                step={currentStep}
                initialData={progress?.step_status[`step_${currentStep.step_number}`]?.data || {}}
                onSubmit={handleStepComplete}
                isLoading={completeStepMutation.isPending}
              />
            </div>
          </div>

          {/* Navigation */}
          <div className="flex justify-between items-center mt-6">
            <button
              onClick={() => setCurrentStepIndex(prev => Math.max(0, prev - 1))}
              disabled={currentStepIndex === 0}
              className="btn-secondary flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronLeftIcon className="w-4 h-4" />
              Previous
            </button>

            <div className="text-sm text-gray-500">
              {progress?.compliance_validated ? (
                <span className="flex items-center gap-1 text-green-600">
                  <CheckCircleIcon className="w-4 h-4" />
                  Compliance Validated
                </span>
              ) : (
                <span className="flex items-center gap-1 text-yellow-600">
                  <ExclamationTriangleIcon className="w-4 h-4" />
                  Compliance Pending
                </span>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}