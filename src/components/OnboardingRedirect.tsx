import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';
import { useUserRole } from './RequireRole';

export default function OnboardingRedirect() {
  const navigate = useNavigate();
  const { data: userRole } = useUserRole();

  const { data: onboardingStatus, isLoading } = useQuery({
    queryKey: ['onboarding-status', userRole?.userId, userRole?.orgId],
    queryFn: async () => {
      if (!userRole?.userId || !userRole?.orgId) return null;

      // Check organization onboarding status
      const { data: orgData, error: orgError } = await supabase
        .from('organizations')
        .select('onboarding_completed')
        .eq('id', userRole.orgId)
        .single();

      if (orgError && orgError.code !== 'PGRST116') {
        throw orgError;
      }

      // Check employee onboarding status
      const { data: empData, error: empError } = await supabase
        .from('employee_profiles')
        .select('onboarding_completed')
        .eq('user_id', userRole.userId)
        .single();

      if (empError && empError.code !== 'PGRST116') {
        // Employee profile doesn't exist, needs onboarding
      }

      return {
        orgOnboardingComplete: orgData?.onboarding_completed ?? false,
        employeeOnboardingComplete: empData?.onboarding_completed ?? false,
        userRole: userRole.role
      };
    },
    enabled: !!userRole?.userId && !!userRole?.orgId,
    retry: false
  });

  useEffect(() => {
    if (isLoading || !onboardingStatus) return;

    const { orgOnboardingComplete, employeeOnboardingComplete, userRole: role } = onboardingStatus;

    // Admin users need to complete org setup first
    if (role === 'admin' && !orgOnboardingComplete) {
      navigate('/onboarding/organization');
      return;
    }

    // All users (including admins after org setup) need employee profile
    if (!employeeOnboardingComplete) {
      navigate('/onboarding/employee');
      return;
    }

    // Onboarding complete, redirect to appropriate dashboard
    if (role === 'admin') {
      navigate('/admin');
    } else {
      navigate('/employee');
    }
  }, [onboardingStatus, isLoading, navigate]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-gray-100 dark:from-gray-950 dark:to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin h-8 w-8 mx-auto mb-4">
            <svg className="w-8 h-8 text-teal-600" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 714 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
            </svg>
          </div>
          <div className="text-gray-600 dark:text-gray-400">
            <p className="mb-2">Setting up your workspace...</p>
            <p className="text-sm">This will just take a moment</p>
          </div>
        </div>
      </div>
    );
  }

  return null; // Component handles redirects, no UI needed
}