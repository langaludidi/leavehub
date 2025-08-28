import { supabase } from './supabase';

export interface LeaveRequestData {
  start_date: string;
  end_date: string;
  leave_type: string;
  leave_type_id: string;
  total_days: number;
  employee_id: string;
}

export interface PolicyValidationError {
  rule_name: string;
  rule_type: string;
  error_message: string;
}

export interface ValidationResult {
  isValid: boolean;
  errors: PolicyValidationError[];
  warnings: string[];
}

async function getOrganizationPolicyRules(organizationId: string, leaveTypeId?: string) {
  const { data, error } = await supabase
    .from('leave_policy_rules')
    .select('*')
    .eq('organization_id', organizationId)
    .eq('is_active', true);

  if (error) throw error;

  // Filter rules that apply to this leave type
  return (data || []).filter(rule => {
    // If rule has no leave_type_ids, it applies to all leave types
    if (!rule.leave_type_ids || rule.leave_type_ids.length === 0) {
      return true;
    }
    // If leave type ID is provided, check if rule applies to this type
    if (leaveTypeId) {
      return rule.leave_type_ids.includes(leaveTypeId);
    }
    return false;
  });
}

async function getLeaveTypeSettings(organizationId: string, leaveTypeCode: string) {
  const { data, error } = await supabase
    .from('leave_types')
    .select('*')
    .eq('organization_id', organizationId)
    .eq('code', leaveTypeCode)
    .eq('is_active', true)
    .single();

  if (error && error.code !== 'PGRST116') throw error; // PGRST116 = no rows returned
  return data;
}

async function getEmployeeLeaveBalance(employeeId: string, leaveTypeId: string) {
  const currentYear = new Date().getFullYear();
  
  const { data, error } = await supabase
    .from('employee_leave_balances')
    .select('current_balance')
    .eq('employee_id', employeeId)
    .eq('leave_type_id', leaveTypeId)
    .eq('year', currentYear)
    .single();

  if (error && error.code !== 'PGRST116') throw error;
  return data?.current_balance || 0;
}

function validateBlackoutPeriod(rule: any, requestData: LeaveRequestData): PolicyValidationError | null {
  const { start_date, end_date } = requestData;
  const { parameters } = rule;
  
  if (!parameters.start_date || !parameters.end_date) return null;
  
  const requestStart = new Date(start_date);
  const requestEnd = new Date(end_date);
  const blackoutStart = new Date(parameters.start_date);
  const blackoutEnd = new Date(parameters.end_date);
  
  // Handle recurring blackout periods
  if (parameters.recurring) {
    const currentYear = requestStart.getFullYear();
    blackoutStart.setFullYear(currentYear);
    blackoutEnd.setFullYear(currentYear);
  }
  
  // Check if request overlaps with blackout period
  const overlaps = requestStart <= blackoutEnd && requestEnd >= blackoutStart;
  
  if (overlaps) {
    return {
      rule_name: rule.rule_name,
      rule_type: rule.rule_type,
      error_message: rule.error_message
    };
  }
  
  return null;
}

function validateMinimumNotice(rule: any, requestData: LeaveRequestData): PolicyValidationError | null {
  const { start_date } = requestData;
  const { parameters } = rule;
  
  if (!parameters.days) return null;
  
  const requestStart = new Date(start_date);
  const today = new Date();
  const requiredNoticeDate = new Date(today);
  requiredNoticeDate.setDate(today.getDate() + parameters.days);
  
  if (requestStart < requiredNoticeDate) {
    return {
      rule_name: rule.rule_name,
      rule_type: rule.rule_type,
      error_message: rule.error_message
    };
  }
  
  return null;
}

function validateMaximumDuration(rule: any, requestData: LeaveRequestData): PolicyValidationError | null {
  const { total_days } = requestData;
  const { parameters } = rule;
  
  if (!parameters.max_days) return null;
  
  if (total_days > parameters.max_days) {
    return {
      rule_name: rule.rule_name,
      rule_type: rule.rule_type,
      error_message: rule.error_message
    };
  }
  
  return null;
}

async function validateRequiredBalance(rule: any, requestData: LeaveRequestData): Promise<PolicyValidationError | null> {
  const { total_days, employee_id, leave_type_id } = requestData;
  const { parameters } = rule;
  
  if (!parameters.min_balance) return null;
  
  const currentBalance = await getEmployeeLeaveBalance(employee_id, leave_type_id);
  const balanceAfterRequest = currentBalance - total_days;
  
  if (balanceAfterRequest < parameters.min_balance) {
    return {
      rule_name: rule.rule_name,
      rule_type: rule.rule_type,
      error_message: rule.error_message
    };
  }
  
  return null;
}

export async function validateLeaveRequest(requestData: LeaveRequestData): Promise<ValidationResult> {
  try {
    const errors: PolicyValidationError[] = [];
    const warnings: string[] = [];
    
    // Get user's organization
    const { data: userProfile } = await supabase
      .from('user_profiles')
      .select('organization_id')
      .eq('user_id', requestData.employee_id)
      .single();
    
    if (!userProfile?.organization_id) {
      return { isValid: true, errors: [], warnings: ['No organization found - using default validation'] };
    }
    
    // Get leave type settings
    const leaveType = await getLeaveTypeSettings(userProfile.organization_id, requestData.leave_type);
    
    if (leaveType) {
      // Validate leave type specific rules
      if (leaveType.min_advance_notice_days > 0) {
        const requestStart = new Date(requestData.start_date);
        const today = new Date();
        const requiredNoticeDate = new Date(today);
        requiredNoticeDate.setDate(today.getDate() + leaveType.min_advance_notice_days);
        
        if (requestStart < requiredNoticeDate) {
          errors.push({
            rule_name: `${leaveType.name} Advance Notice`,
            rule_type: 'minimum_notice',
            error_message: `This leave type requires at least ${leaveType.min_advance_notice_days} days advance notice`
          });
        }
      }
      
      if (leaveType.max_consecutive_days && requestData.total_days > leaveType.max_consecutive_days) {
        errors.push({
          rule_name: `${leaveType.name} Maximum Duration`,
          rule_type: 'maximum_duration',
          error_message: `This leave type allows a maximum of ${leaveType.max_consecutive_days} consecutive days`
        });
      }
    }
    
    // Get and validate policy rules
    const policyRules = await getOrganizationPolicyRules(userProfile.organization_id, requestData.leave_type_id);
    
    for (const rule of policyRules) {
      let ruleError: PolicyValidationError | null = null;
      
      switch (rule.rule_type) {
        case 'blackout_period':
          ruleError = validateBlackoutPeriod(rule, requestData);
          break;
        case 'minimum_notice':
          ruleError = validateMinimumNotice(rule, requestData);
          break;
        case 'maximum_duration':
          ruleError = validateMaximumDuration(rule, requestData);
          break;
        case 'required_balance':
          ruleError = await validateRequiredBalance(rule, requestData);
          break;
        default:
          // Custom rules would be handled here
          break;
      }
      
      if (ruleError) {
        errors.push(ruleError);
      }
    }
    
    return {
      isValid: errors.length === 0,
      errors,
      warnings
    };
  } catch (error) {
    console.error('Policy validation error:', error);
    return {
      isValid: true, // Default to allowing request if validation fails
      errors: [],
      warnings: ['Policy validation failed - request processed with default rules']
    };
  }
}

export async function getLeaveTypeOptions(organizationId?: string) {
  if (!organizationId) {
    // Return default leave types
    return [
      { id: 'vacation', name: 'Vacation', code: 'vacation', icon: '🏖️', color: '#10b981' },
      { id: 'sick', name: 'Sick Leave', code: 'sick', icon: '🤒', color: '#f59e0b' },
      { id: 'personal', name: 'Personal Leave', code: 'personal', icon: '👤', color: '#8b5cf6' },
      { id: 'maternity', name: 'Maternity/Paternity Leave', code: 'maternity', icon: '👶', color: '#ec4899' },
      { id: 'bereavement', name: 'Bereavement Leave', code: 'bereavement', icon: '🕊️', color: '#6b7280' }
    ];
  }
  
  const { data, error } = await supabase
    .from('leave_types')
    .select('id, name, code, icon, color, min_advance_notice_days, max_consecutive_days, requires_approval, is_paid')
    .eq('organization_id', organizationId)
    .eq('is_active', true)
    .order('name');
  
  if (error) throw error;
  return data || [];
}