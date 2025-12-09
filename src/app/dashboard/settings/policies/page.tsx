'use client';

import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  FileText,
  Save,
  Check,
  Calendar,
  Clock,
  AlertCircle,
  ChevronDown,
  ChevronUp,
  Settings,
} from 'lucide-react';
import DashboardHeader from '@/components/DashboardHeader';

interface LeavePolicy {
  id?: string;
  company_id: string;
  leave_type_id: string;
  leave_type?: {
    id: string;
    name: string;
    code: string;
    color: string;
    description: string;
  };
  default_days: number;
  max_days: number | null;
  min_days: number;
  accrual_type: string;
  accrual_rate: number | null;
  allow_carryover: boolean;
  max_carryover_days: number;
  carryover_expiry_months: number;
  min_notice_days: number;
  max_consecutive_days: number | null;
  requires_approval: boolean;
  requires_documentation: boolean;
  allow_negative_balance: boolean;
  allow_half_days: boolean;
  exclude_weekends: boolean;
  exclude_public_holidays: boolean;
}

const ACCRUAL_TYPES = [
  { value: 'annual', label: 'Annual' },
  { value: 'monthly', label: 'Monthly' },
  { value: 'weekly', label: 'Weekly' },
];

export default function LeavePoliciesPage() {
  const userId = 'demo-user-123';
  const companyId = '12345678-1234-1234-1234-123456789012'; // Demo company ID

  const [policies, setPolicies] = useState<LeavePolicy[]>([]);
  const [expandedPolicies, setExpandedPolicies] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<string | null>(null);
  const [saved, setSaved] = useState<string | null>(null);

  useEffect(() => {
    fetchPolicies();
  }, [companyId]);

  async function fetchPolicies() {
    setLoading(true);
    try {
      const response = await fetch(`/api/settings/policies?companyId=${companyId}`);
      const data = await response.json();

      if (data.policies) {
        setPolicies(data.policies);
      }
    } catch (error) {
      console.error('Error fetching leave policies:', error);
    } finally {
      setLoading(false);
    }
  }

  async function savePolicy(policy: LeavePolicy) {
    setSaving(policy.leave_type_id);
    try {
      const response = await fetch('/api/settings/policies', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          companyId: policy.company_id,
          leaveTypeId: policy.leave_type_id,
          defaultDays: policy.default_days,
          maxDays: policy.max_days,
          minDays: policy.min_days,
          accrualType: policy.accrual_type,
          accrualRate: policy.accrual_rate,
          allowCarryover: policy.allow_carryover,
          maxCarryoverDays: policy.max_carryover_days,
          carryoverExpiryMonths: policy.carryover_expiry_months,
          minNoticeDays: policy.min_notice_days,
          maxConsecutiveDays: policy.max_consecutive_days,
          requiresApproval: policy.requires_approval,
          requiresDocumentation: policy.requires_documentation,
          allowNegativeBalance: policy.allow_negative_balance,
          allowHalfDays: policy.allow_half_days,
          excludeWeekends: policy.exclude_weekends,
          excludePublicHolidays: policy.exclude_public_holidays,
        }),
      });

      if (response.ok) {
        setSaved(policy.leave_type_id);
        setTimeout(() => setSaved(null), 3000);
        await fetchPolicies();
      }
    } catch (error) {
      console.error('Error saving leave policy:', error);
    } finally {
      setSaving(null);
    }
  }

  function updatePolicy(leaveTypeId: string, updates: Partial<LeavePolicy>) {
    setPolicies(
      policies.map(policy =>
        policy.leave_type_id === leaveTypeId
          ? { ...policy, ...updates }
          : policy
      )
    );
  }

  function toggleExpanded(leaveTypeId: string) {
    const newExpanded = new Set(expandedPolicies);
    if (newExpanded.has(leaveTypeId)) {
      newExpanded.delete(leaveTypeId);
    } else {
      newExpanded.add(leaveTypeId);
    }
    setExpandedPolicies(newExpanded);
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <DashboardHeader userId={userId} userName="Demo User" />
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-center py-12">
            <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
            <p className="ml-3 text-gray-600">Loading policies...</p>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <DashboardHeader userId={userId} userName="Demo User" />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Leave Policies
          </h1>
          <p className="text-gray-600">
            Configure leave entitlements and rules for each leave type
          </p>
        </div>

        {/* Info Card */}
        <Card className="p-4 mb-6 bg-blue-50 border-blue-200">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5" />
            <div>
              <h3 className="font-semibold text-blue-900 mb-1">
                BCEA Compliance Notice
              </h3>
              <p className="text-sm text-blue-800">
                Ensure your leave policies comply with the Basic Conditions of Employment Act (BCEA).
                Annual leave: minimum 21 consecutive days per year. Sick leave: 30 days per 3-year cycle.
              </p>
            </div>
          </div>
        </Card>

        {/* Leave Policies */}
        {policies.length === 0 ? (
          <Card className="p-12 text-center">
            <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              No leave policies found
            </h3>
            <p className="text-gray-600">
              Run the company settings SQL to create default leave policies
            </p>
          </Card>
        ) : (
          <div className="space-y-4">
            {policies.map((policy) => {
              const isExpanded = expandedPolicies.has(policy.leave_type_id);
              const isSaving = saving === policy.leave_type_id;
              const isSaved = saved === policy.leave_type_id;

              return (
                <Card key={policy.leave_type_id} className="overflow-hidden">
                  {/* Header */}
                  <div
                    className="p-6 cursor-pointer hover:bg-gray-50 transition-colors"
                    onClick={() => toggleExpanded(policy.leave_type_id)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div
                          className="w-12 h-12 rounded-lg flex items-center justify-center"
                          style={{
                            backgroundColor: `${policy.leave_type?.color}15`,
                            color: policy.leave_type?.color,
                          }}
                        >
                          <Calendar className="w-6 h-6" />
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold">
                            {policy.leave_type?.name}
                          </h3>
                          <p className="text-sm text-gray-600">
                            Default: {policy.default_days} days
                            {policy.allow_carryover && ` • Carry-over: ${policy.max_carryover_days} days`}
                            {policy.min_notice_days > 0 && ` • Notice: ${policy.min_notice_days} days`}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        {isSaved && (
                          <span className="text-sm text-green-600 flex items-center gap-2">
                            <Check className="w-4 h-4" />
                            Saved
                          </span>
                        )}
                        {isExpanded ? (
                          <ChevronUp className="w-5 h-5 text-gray-400" />
                        ) : (
                          <ChevronDown className="w-5 h-5 text-gray-400" />
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Expanded Content */}
                  {isExpanded && (
                    <div className="border-t bg-gray-50 p-6">
                      <div className="space-y-6">
                        {/* Entitlement Settings */}
                        <div>
                          <h4 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                            <Settings className="w-4 h-4" />
                            Entitlement Settings
                          </h4>
                          <div className="grid md:grid-cols-3 gap-4">
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-2">
                                Default Days *
                              </label>
                              <input
                                type="number"
                                min="0"
                                value={policy.default_days}
                                onChange={(e) =>
                                  updatePolicy(policy.leave_type_id, {
                                    default_days: parseInt(e.target.value),
                                  })
                                }
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-2">
                                Minimum Days
                              </label>
                              <input
                                type="number"
                                min="1"
                                value={policy.min_days}
                                onChange={(e) =>
                                  updatePolicy(policy.leave_type_id, {
                                    min_days: parseInt(e.target.value),
                                  })
                                }
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-2">
                                Maximum Days
                              </label>
                              <input
                                type="number"
                                min="0"
                                placeholder="No limit"
                                value={policy.max_days || ''}
                                onChange={(e) =>
                                  updatePolicy(policy.leave_type_id, {
                                    max_days: e.target.value ? parseInt(e.target.value) : null,
                                  })
                                }
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                              />
                            </div>
                          </div>
                        </div>

                        {/* Accrual Settings */}
                        <div>
                          <h4 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                            <Clock className="w-4 h-4" />
                            Accrual Settings
                          </h4>
                          <div className="grid md:grid-cols-2 gap-4">
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-2">
                                Accrual Type
                              </label>
                              <select
                                value={policy.accrual_type}
                                onChange={(e) =>
                                  updatePolicy(policy.leave_type_id, {
                                    accrual_type: e.target.value,
                                  })
                                }
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                              >
                                {ACCRUAL_TYPES.map(type => (
                                  <option key={type.value} value={type.value}>
                                    {type.label}
                                  </option>
                                ))}
                              </select>
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-2">
                                Accrual Rate (days per period)
                              </label>
                              <input
                                type="number"
                                min="0"
                                step="0.1"
                                placeholder="Optional"
                                value={policy.accrual_rate || ''}
                                onChange={(e) =>
                                  updatePolicy(policy.leave_type_id, {
                                    accrual_rate: e.target.value ? parseFloat(e.target.value) : null,
                                  })
                                }
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                              />
                            </div>
                          </div>
                        </div>

                        {/* Carry-over Settings */}
                        <div>
                          <h4 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                            <Calendar className="w-4 h-4" />
                            Carry-over Rules
                          </h4>
                          <div className="space-y-4">
                            <div className="flex items-center justify-between p-3 bg-white rounded-lg border">
                              <span className="text-sm font-medium text-gray-700">
                                Allow Carry-over
                              </span>
                              <button
                                onClick={() =>
                                  updatePolicy(policy.leave_type_id, {
                                    allow_carryover: !policy.allow_carryover,
                                  })
                                }
                                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                                  policy.allow_carryover ? 'bg-primary' : 'bg-gray-200'
                                }`}
                              >
                                <span
                                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                                    policy.allow_carryover ? 'translate-x-6' : 'translate-x-1'
                                  }`}
                                />
                              </button>
                            </div>

                            {policy.allow_carryover && (
                              <div className="grid md:grid-cols-2 gap-4">
                                <div>
                                  <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Maximum Carry-over Days
                                  </label>
                                  <input
                                    type="number"
                                    min="0"
                                    value={policy.max_carryover_days}
                                    onChange={(e) =>
                                      updatePolicy(policy.leave_type_id, {
                                        max_carryover_days: parseInt(e.target.value),
                                      })
                                    }
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                                  />
                                </div>
                                <div>
                                  <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Carry-over Expiry (months)
                                  </label>
                                  <input
                                    type="number"
                                    min="1"
                                    value={policy.carryover_expiry_months}
                                    onChange={(e) =>
                                      updatePolicy(policy.leave_type_id, {
                                        carryover_expiry_months: parseInt(e.target.value),
                                      })
                                    }
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                                  />
                                </div>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Request Settings */}
                        <div>
                          <h4 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                            <FileText className="w-4 h-4" />
                            Request Settings
                          </h4>
                          <div className="grid md:grid-cols-2 gap-4 mb-4">
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-2">
                                Minimum Notice Days
                              </label>
                              <input
                                type="number"
                                min="0"
                                value={policy.min_notice_days}
                                onChange={(e) =>
                                  updatePolicy(policy.leave_type_id, {
                                    min_notice_days: parseInt(e.target.value),
                                  })
                                }
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-2">
                                Max Consecutive Days
                              </label>
                              <input
                                type="number"
                                min="0"
                                placeholder="No limit"
                                value={policy.max_consecutive_days || ''}
                                onChange={(e) =>
                                  updatePolicy(policy.leave_type_id, {
                                    max_consecutive_days: e.target.value ? parseInt(e.target.value) : null,
                                  })
                                }
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                              />
                            </div>
                          </div>

                          <div className="grid md:grid-cols-2 gap-3">
                            <div className="flex items-center justify-between p-3 bg-white rounded-lg border">
                              <span className="text-sm font-medium text-gray-700">
                                Requires Approval
                              </span>
                              <button
                                onClick={() =>
                                  updatePolicy(policy.leave_type_id, {
                                    requires_approval: !policy.requires_approval,
                                  })
                                }
                                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                                  policy.requires_approval ? 'bg-primary' : 'bg-gray-200'
                                }`}
                              >
                                <span
                                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                                    policy.requires_approval ? 'translate-x-6' : 'translate-x-1'
                                  }`}
                                />
                              </button>
                            </div>

                            <div className="flex items-center justify-between p-3 bg-white rounded-lg border">
                              <span className="text-sm font-medium text-gray-700">
                                Requires Documentation
                              </span>
                              <button
                                onClick={() =>
                                  updatePolicy(policy.leave_type_id, {
                                    requires_documentation: !policy.requires_documentation,
                                  })
                                }
                                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                                  policy.requires_documentation ? 'bg-primary' : 'bg-gray-200'
                                }`}
                              >
                                <span
                                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                                    policy.requires_documentation ? 'translate-x-6' : 'translate-x-1'
                                  }`}
                                />
                              </button>
                            </div>
                          </div>
                        </div>

                        {/* Other Settings */}
                        <div>
                          <h4 className="font-semibold text-gray-900 mb-4">
                            Other Settings
                          </h4>
                          <div className="grid md:grid-cols-2 gap-3">
                            <div className="flex items-center justify-between p-3 bg-white rounded-lg border">
                              <span className="text-sm font-medium text-gray-700">
                                Allow Negative Balance
                              </span>
                              <button
                                onClick={() =>
                                  updatePolicy(policy.leave_type_id, {
                                    allow_negative_balance: !policy.allow_negative_balance,
                                  })
                                }
                                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                                  policy.allow_negative_balance ? 'bg-primary' : 'bg-gray-200'
                                }`}
                              >
                                <span
                                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                                    policy.allow_negative_balance ? 'translate-x-6' : 'translate-x-1'
                                  }`}
                                />
                              </button>
                            </div>

                            <div className="flex items-center justify-between p-3 bg-white rounded-lg border">
                              <span className="text-sm font-medium text-gray-700">
                                Allow Half Days
                              </span>
                              <button
                                onClick={() =>
                                  updatePolicy(policy.leave_type_id, {
                                    allow_half_days: !policy.allow_half_days,
                                  })
                                }
                                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                                  policy.allow_half_days ? 'bg-primary' : 'bg-gray-200'
                                }`}
                              >
                                <span
                                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                                    policy.allow_half_days ? 'translate-x-6' : 'translate-x-1'
                                  }`}
                                />
                              </button>
                            </div>

                            <div className="flex items-center justify-between p-3 bg-white rounded-lg border">
                              <span className="text-sm font-medium text-gray-700">
                                Exclude Weekends
                              </span>
                              <button
                                onClick={() =>
                                  updatePolicy(policy.leave_type_id, {
                                    exclude_weekends: !policy.exclude_weekends,
                                  })
                                }
                                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                                  policy.exclude_weekends ? 'bg-primary' : 'bg-gray-200'
                                }`}
                              >
                                <span
                                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                                    policy.exclude_weekends ? 'translate-x-6' : 'translate-x-1'
                                  }`}
                                />
                              </button>
                            </div>

                            <div className="flex items-center justify-between p-3 bg-white rounded-lg border">
                              <span className="text-sm font-medium text-gray-700">
                                Exclude Public Holidays
                              </span>
                              <button
                                onClick={() =>
                                  updatePolicy(policy.leave_type_id, {
                                    exclude_public_holidays: !policy.exclude_public_holidays,
                                  })
                                }
                                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                                  policy.exclude_public_holidays ? 'bg-primary' : 'bg-gray-200'
                                }`}
                              >
                                <span
                                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                                    policy.exclude_public_holidays ? 'translate-x-6' : 'translate-x-1'
                                  }`}
                                />
                              </button>
                            </div>
                          </div>
                        </div>

                        {/* Save Button */}
                        <div className="flex justify-end pt-4 border-t">
                          <Button
                            onClick={() => savePolicy(policy)}
                            disabled={isSaving}
                          >
                            <Save className="w-4 h-4 mr-2" />
                            {isSaving ? 'Saving...' : 'Save Policy'}
                          </Button>
                        </div>
                      </div>
                    </div>
                  )}
                </Card>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
