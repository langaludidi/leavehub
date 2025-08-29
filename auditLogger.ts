import { supabase } from './supabase';

export interface AuditEventData {
  entity_type: string;
  entity_id?: string;
  action: 'create' | 'update' | 'delete' | 'approve' | 'deny' | 'cancel' | 'restore';
  old_values?: any;
  new_values?: any;
  metadata?: Record<string, any>;
}

export class AuditLogger {
  private static async getCurrentUserAndOrg(): Promise<{ userId: string; orgId: string } | null> {
    try {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) return null;

      const { data: userProfile } = await supabase
        .from('user_profiles')
        .select('organization_id')
        .eq('user_id', user.user.id)
        .single();

      if (!userProfile?.organization_id) return null;

      return {
        userId: user.user.id,
        orgId: userProfile.organization_id
      };
    } catch (error) {
      console.error('Failed to get user/org for audit:', error);
      return null;
    }
  }

  static async logEvent(eventData: AuditEventData): Promise<void> {
    try {
      const userOrgData = await this.getCurrentUserAndOrg();
      if (!userOrgData) {
        console.warn('Unable to log audit event - no user/org context');
        return;
      }

      // Add system metadata
      const metadata = {
        ...eventData.metadata,
        timestamp: new Date().toISOString(),
        user_agent: navigator.userAgent,
        source: 'web'
      };

      const { error } = await supabase.rpc('log_audit_event', {
        p_organization_id: userOrgData.orgId,
        p_user_id: userOrgData.userId,
        p_entity_type: eventData.entity_type,
        p_entity_id: eventData.entity_id || null,
        p_action: eventData.action,
        p_old_values: eventData.old_values || null,
        p_new_values: eventData.new_values || null,
        p_metadata: metadata
      });

      if (error) {
        console.error('Failed to log audit event:', error);
      }
    } catch (error) {
      console.error('Audit logging error:', error);
    }
  }

  // Convenience methods for common audit scenarios
  static async logLeaveRequestCreated(leaveRequest: any): Promise<void> {
    await this.logEvent({
      entity_type: 'leave_request',
      entity_id: leaveRequest.id,
      action: 'create',
      new_values: {
        start_date: leaveRequest.start_date,
        end_date: leaveRequest.end_date,
        leave_type: leaveRequest.leave_type,
        total_days: leaveRequest.total_days,
        status: leaveRequest.status
      },
      metadata: {
        leave_type: leaveRequest.leave_type,
        duration_days: leaveRequest.total_days
      }
    });
  }

  static async logLeaveRequestStatusChange(
    leaveRequestId: string,
    oldStatus: string,
    newStatus: string,
    reason?: string
  ): Promise<void> {
    const action = newStatus === 'approved' ? 'approve' : 
                   newStatus === 'denied' ? 'deny' : 
                   newStatus === 'cancelled' ? 'cancel' : 'update';

    await this.logEvent({
      entity_type: 'leave_request',
      entity_id: leaveRequestId,
      action,
      old_values: { status: oldStatus },
      new_values: { status: newStatus },
      metadata: {
        status_change: `${oldStatus} -> ${newStatus}`,
        reason: reason
      }
    });
  }

  static async logUserCreated(userId: string, userData: any): Promise<void> {
    await this.logEvent({
      entity_type: 'user',
      entity_id: userId,
      action: 'create',
      new_values: {
        email: userData.email,
        role: userData.role,
        organization_id: userData.organization_id
      },
      metadata: {
        user_role: userData.role,
        invitation_sent: userData.invitation_sent || false
      }
    });
  }

  static async logUserRoleChange(
    userId: string,
    oldRole: string,
    newRole: string
  ): Promise<void> {
    await this.logEvent({
      entity_type: 'user',
      entity_id: userId,
      action: 'update',
      old_values: { role: oldRole },
      new_values: { role: newRole },
      metadata: {
        role_change: `${oldRole} -> ${newRole}`,
        security_relevant: true
      }
    });
  }

  static async logPolicyCreated(
    policyType: 'leave_type' | 'accrual_policy' | 'policy_rule',
    policyId: string,
    policyData: any
  ): Promise<void> {
    await this.logEvent({
      entity_type: policyType,
      entity_id: policyId,
      action: 'create',
      new_values: policyData,
      metadata: {
        policy_type: policyType,
        policy_name: policyData.name || policyData.policy_name || policyData.rule_name
      }
    });
  }

  static async logPolicyUpdated(
    policyType: 'leave_type' | 'accrual_policy' | 'policy_rule',
    policyId: string,
    oldData: any,
    newData: any
  ): Promise<void> {
    await this.logEvent({
      entity_type: policyType,
      entity_id: policyId,
      action: 'update',
      old_values: oldData,
      new_values: newData,
      metadata: {
        policy_type: policyType,
        changes_made: Object.keys(newData).filter(key => oldData[key] !== newData[key])
      }
    });
  }

  static async logDataExport(
    exportType: string,
    recordCount: number,
    filters?: any
  ): Promise<void> {
    await this.logEvent({
      entity_type: 'data_export',
      action: 'create',
      new_values: {
        export_type: exportType,
        record_count: recordCount,
        filters: filters
      },
      metadata: {
        export_type: exportType,
        record_count: recordCount,
        privacy_relevant: true
      }
    });
  }

  static async logLogin(loginMethod: 'email' | 'sso' | 'api_key' = 'email'): Promise<void> {
    try {
      const userOrgData = await this.getCurrentUserAndOrg();
      if (!userOrgData) return;

      const { error } = await supabase.rpc('log_system_event', {
        p_organization_id: userOrgData.orgId,
        p_event_type: 'user_login',
        p_severity: 'info',
        p_user_id: userOrgData.userId,
        p_event_data: {
          login_method: loginMethod,
          timestamp: new Date().toISOString()
        },
        p_source: 'web'
      });

      if (error) {
        console.error('Failed to log login event:', error);
      }
    } catch (error) {
      console.error('Login logging error:', error);
    }
  }

  static async logSecurityEvent(
    eventType: 'failed_login' | 'password_change' | 'permission_escalation' | 'suspicious_activity',
    severity: 'warning' | 'error' | 'critical' = 'warning',
    eventData?: any
  ): Promise<void> {
    try {
      const userOrgData = await this.getCurrentUserAndOrg();
      
      const { error } = await supabase.rpc('log_system_event', {
        p_organization_id: userOrgData?.orgId || null,
        p_event_type: eventType,
        p_severity: severity,
        p_user_id: userOrgData?.userId || null,
        p_event_data: {
          ...eventData,
          timestamp: new Date().toISOString(),
          security_event: true
        },
        p_source: 'web'
      });

      if (error) {
        console.error('Failed to log security event:', error);
      }
    } catch (error) {
      console.error('Security event logging error:', error);
    }
  }
}

// Helper function to automatically log leave request changes
export async function withAuditLogging<T>(
  operation: () => Promise<T>,
  auditData: AuditEventData
): Promise<T> {
  try {
    const result = await operation();
    await AuditLogger.logEvent(auditData);
    return result;
  } catch (error) {
    // Log failed operations too
    await AuditLogger.logEvent({
      ...auditData,
      metadata: {
        ...auditData.metadata,
        operation_failed: true,
        error_message: error instanceof Error ? error.message : 'Unknown error'
      }
    });
    throw error;
  }
}

// Decorator for audit logging (for class methods)
export function auditLog(auditData: Partial<AuditEventData>) {
  return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
    const originalMethod = descriptor.value;
    
    descriptor.value = async function (...args: any[]) {
      const result = await originalMethod.apply(this, args);
      
      // Try to extract entity info from result or args
      const entityId = result?.id || args[0]?.id || auditData.entity_id;
      
      await AuditLogger.logEvent({
        entity_type: auditData.entity_type || 'unknown',
        entity_id: entityId,
        action: auditData.action || 'update',
        ...auditData,
        metadata: {
          ...auditData.metadata,
          method_name: propertyKey,
          timestamp: new Date().toISOString()
        }
      });
      
      return result;
    };
    
    return descriptor;
  };
}