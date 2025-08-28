import { useState, ReactNode } from 'react';

interface WizardStep {
  id: string;
  title: string;
  description: string;
  icon: string;
  completed: boolean;
}

interface OnboardingWizardProps {
  steps: WizardStep[];
  currentStep: number;
  onStepChange: (step: number) => void;
  children: ReactNode;
  isLoading?: boolean;
}

export default function OnboardingWizard({ 
  steps, 
  currentStep, 
  onStepChange, 
  children,
  isLoading = false 
}: OnboardingWizardProps) {
  const [collapsedSteps, setCollapsedSteps] = useState<Set<number>>(new Set());

  const toggleStepCollapse = (stepIndex: number) => {
    const newCollapsed = new Set(collapsedSteps);
    if (newCollapsed.has(stepIndex)) {
      newCollapsed.delete(stepIndex);
    } else {
      newCollapsed.add(stepIndex);
    }
    setCollapsedSteps(newCollapsed);
  };

  const getStepStatus = (stepIndex: number) => {
    if (stepIndex < currentStep) return 'completed';
    if (stepIndex === currentStep) return 'current';
    return 'upcoming';
  };

  const completedSteps = steps.filter(step => step.completed).length;
  const progressPercentage = Math.round((completedSteps / steps.length) * 100);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-gray-100 dark:from-gray-950 dark:to-slate-900">
      <div className="container py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 bg-teal-100 dark:bg-teal-900/20 px-4 py-2 rounded-full mb-4">
            <span className="text-2xl">🚀</span>
            <span className="text-teal-800 dark:text-teal-200 font-medium">Welcome to LeaveHub</span>
          </div>
          <h1 className="text-4xl font-bold gradient-text mb-2">Let's get you set up!</h1>
          <p className="text-xl text-gray-600 dark:text-gray-300">
            Complete your profile in just a few minutes
          </p>
        </div>

        {/* Progress Bar */}
        <div className="max-w-4xl mx-auto mb-8">
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Setup Progress
            </span>
            <span className="text-sm font-medium text-teal-600 dark:text-teal-400">
              {progressPercentage}% Complete
            </span>
          </div>
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3 mb-6">
            <div
              className="bg-gradient-to-r from-teal-500 to-cyan-500 h-3 rounded-full transition-all duration-500 relative overflow-hidden"
              style={{ width: `${progressPercentage}%` }}
            >
              <div className="absolute inset-0 bg-white/20 animate-pulse" />
            </div>
          </div>
        </div>

        <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Step Navigation */}
          <div className="lg:col-span-1">
            <div className="card sticky top-6">
              <div className="card-body">
                <h3 className="font-semibold text-lg mb-4 text-gray-800 dark:text-gray-200">
                  Setup Steps
                </h3>
                <div className="space-y-2">
                  {steps.map((step, index) => {
                    const status = getStepStatus(index);
                    const isCollapsed = collapsedSteps.has(index);
                    
                    return (
                      <div key={step.id}>
                        <button
                          onClick={() => onStepChange(index)}
                          className={[
                            "w-full text-left p-3 rounded-lg transition-all duration-200 group",
                            status === 'current' ? 'bg-teal-50 dark:bg-teal-900/20 border-2 border-teal-200 dark:border-teal-700' :
                            status === 'completed' ? 'bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800' :
                            'hover:bg-gray-50 dark:hover:bg-gray-800 border border-gray-200 dark:border-gray-700'
                          ].join(' ')}
                        >
                          <div className="flex items-center gap-3">
                            <div className={[
                              "flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-colors",
                              status === 'current' ? 'bg-teal-500 text-white' :
                              status === 'completed' ? 'bg-green-500 text-white' :
                              'bg-gray-200 dark:bg-gray-600 text-gray-600 dark:text-gray-300'
                            ].join(' ')}>
                              {status === 'completed' ? '✓' : 
                               status === 'current' ? step.icon :
                               index + 1}
                            </div>
                            
                            <div className="flex-1 min-w-0">
                              <div className={[
                                "font-medium transition-colors",
                                status === 'current' ? 'text-teal-700 dark:text-teal-300' :
                                status === 'completed' ? 'text-green-700 dark:text-green-300' :
                                'text-gray-700 dark:text-gray-300'
                              ].join(' ')}>
                                {step.title}
                              </div>
                              {status === 'current' && !isCollapsed && (
                                <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                  {step.description}
                                </div>
                              )}
                            </div>

                            <div className={[
                              "flex-shrink-0 w-5 h-5 transition-transform duration-200",
                              status === 'current' ? 'text-teal-500' : 'text-gray-400'
                            ].join(' ')}>
                              {status === 'current' && (
                                <svg 
                                  className={`w-5 h-5 transform transition-transform ${isCollapsed ? 'rotate-180' : ''}`}
                                  fill="none" 
                                  viewBox="0 0 24 24" 
                                  stroke="currentColor"
                                >
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                </svg>
                              )}
                            </div>
                          </div>
                        </button>
                      </div>
                    );
                  })}
                </div>

                {/* Completion Celebration */}
                {completedSteps === steps.length && (
                  <div className="mt-6 p-4 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border border-green-200 dark:border-green-800/30 rounded-lg">
                    <div className="text-center">
                      <div className="text-3xl mb-2">🎉</div>
                      <div className="font-semibold text-green-800 dark:text-green-200 mb-1">
                        Setup Complete!
                      </div>
                      <div className="text-sm text-green-600 dark:text-green-400">
                        You're ready to start using LeaveHub
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Step Content */}
          <div className="lg:col-span-3">
            <div className="card">
              <div className="card-body">
                {isLoading ? (
                  <div className="text-center py-12">
                    <div className="animate-spin h-8 w-8 mx-auto mb-4">
                      <svg className="w-8 h-8 text-teal-600" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 714 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
                      </svg>
                    </div>
                    <p className="text-gray-600 dark:text-gray-400">Loading...</p>
                  </div>
                ) : (
                  children
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export { type WizardStep };