import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../../lib/supabase';
import { PlusIcon, PencilIcon, TrashIcon, EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline';

interface LeaveType {
  id: string;
  organization_id: string;
  name: string;
  code: string;
  description: string;
  color: string;
  icon: string;
  is_active: boolean;
  requires_approval: boolean;
  max_consecutive_days: number | null;
  min_advance_notice_days: number;
  is_paid: boolean;
  carries_over: boolean;
  blackout_periods: any[];
}

interface LeaveTypeFormData {
  name: string;
  code: string;
  description: string;
  color: string;
  icon: string;
  requires_approval: boolean;
  max_consecutive_days: number | null;
  min_advance_notice_days: number;
  is_paid: boolean;
  carries_over: boolean;
}

const DEFAULT_COLORS = [
  '#10b981', '#3b82f6', '#8b5cf6', '#f59e0b', '#ef4444',
  '#ec4899', '#14b8a6', '#f97316', '#84cc16', '#6366f1'
];

const DEFAULT_ICONS = [
  '🏖️', '🤒', '👤', '👶', '🕊️', '🎓', '⚖️', '🏠', '🌍', '💼',
  '🚗', '❤️', '🎭', '📚', '🔧', '🎯', '🌟', '⭐', '🎉', '🎈'
];

async function fetchLeaveTypes(): Promise<LeaveType[]> {
  const { data: user } = await supabase.auth.getUser();
  if (!user.user) throw new Error('Not authenticated');

  // Get user's organization
  const { data: userProfile } = await supabase
    .from('user_profiles')
    .select('organization_id')
    .eq('user_id', user.user.id)
    .single();

  if (!userProfile?.organization_id) throw new Error('No organization found');

  const { data, error } = await supabase
    .from('leave_types')
    .select('*')
    .eq('organization_id', userProfile.organization_id)
    .order('name');

  if (error) throw error;
  return data || [];
}

async function createLeaveType(leaveType: LeaveTypeFormData): Promise<LeaveType> {
  const { data: user } = await supabase.auth.getUser();
  if (!user.user) throw new Error('Not authenticated');

  const { data: userProfile } = await supabase
    .from('user_profiles')
    .select('organization_id')
    .eq('user_id', user.user.id)
    .single();

  const { data, error } = await supabase
    .from('leave_types')
    .insert([{
      ...leaveType,
      organization_id: userProfile.organization_id,
      is_active: true
    }])
    .select()
    .single();

  if (error) throw error;
  return data;
}

async function updateLeaveType(id: string, updates: Partial<LeaveTypeFormData>): Promise<LeaveType> {
  const { data, error } = await supabase
    .from('leave_types')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data;
}

async function toggleLeaveTypeStatus(id: string, isActive: boolean): Promise<void> {
  const { error } = await supabase
    .from('leave_types')
    .update({ is_active: isActive })
    .eq('id', id);

  if (error) throw error;
}

function LeaveTypeForm({ 
  leaveType, 
  onSave, 
  onCancel 
}: { 
  leaveType?: LeaveType; 
  onSave: (data: LeaveTypeFormData) => void; 
  onCancel: () => void; 
}) {
  const [formData, setFormData] = useState<LeaveTypeFormData>({
    name: leaveType?.name || '',
    code: leaveType?.code || '',
    description: leaveType?.description || '',
    color: leaveType?.color || DEFAULT_COLORS[0],
    icon: leaveType?.icon || DEFAULT_ICONS[0],
    requires_approval: leaveType?.requires_approval ?? true,
    max_consecutive_days: leaveType?.max_consecutive_days || null,
    min_advance_notice_days: leaveType?.min_advance_notice_days || 0,
    is_paid: leaveType?.is_paid ?? true,
    carries_over: leaveType?.carries_over ?? false
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-semibold">
            {leaveType ? 'Edit Leave Type' : 'Add New Leave Type'}
          </h3>
          <button
            onClick={onCancel}
            className="text-gray-400 hover:text-gray-600"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="label">Leave Type Name *</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="input"
                placeholder="e.g., Vacation, Sick Leave"
                required
              />
            </div>
            <div>
              <label className="label">Code *</label>
              <input
                type="text"
                value={formData.code}
                onChange={(e) => setFormData({ ...formData, code: e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, '') })}
                className="input"
                placeholder="e.g., vacation, sick"
                pattern="[a-z0-9_]+"
                required
              />
              <p className="text-xs text-gray-500 mt-1">Lowercase letters, numbers, and underscores only</p>
            </div>
          </div>

          <div>
            <label className="label">Description</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="textarea"
              rows={3}
              placeholder="Brief description of this leave type"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="label">Color</label>
              <div className="space-y-2">
                <input
                  type="color"
                  value={formData.color}
                  onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                  className="w-full h-10 rounded border"
                />
                <div className="flex gap-1 flex-wrap">
                  {DEFAULT_COLORS.map(color => (
                    <button
                      key={color}
                      type="button"
                      onClick={() => setFormData({ ...formData, color })}
                      className="w-6 h-6 rounded border-2 border-white shadow"
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>
              </div>
            </div>
            <div>
              <label className="label">Icon</label>
              <div className="space-y-2">
                <input
                  type="text"
                  value={formData.icon}
                  onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
                  className="input"
                  placeholder="🏖️"
                />
                <div className="flex gap-1 flex-wrap">
                  {DEFAULT_ICONS.map(icon => (
                    <button
                      key={icon}
                      type="button"
                      onClick={() => setFormData({ ...formData, icon })}
                      className="w-8 h-8 rounded border hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center justify-center"
                    >
                      {icon}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="label">Min. Advance Notice (Days)</label>
              <input
                type="number"
                value={formData.min_advance_notice_days}
                onChange={(e) => setFormData({ ...formData, min_advance_notice_days: parseInt(e.target.value) || 0 })}
                className="input"
                min="0"
              />
            </div>
            <div>
              <label className="label">Max. Consecutive Days</label>
              <input
                type="number"
                value={formData.max_consecutive_days || ''}
                onChange={(e) => setFormData({ ...formData, max_consecutive_days: e.target.value ? parseInt(e.target.value) : null })}
                className="input"
                min="1"
                placeholder="No limit"
              />
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-center">
              <input
                type="checkbox"
                id="requires_approval"
                checked={formData.requires_approval}
                onChange={(e) => setFormData({ ...formData, requires_approval: e.target.checked })}
                className="mr-2"
              />
              <label htmlFor="requires_approval" className="text-sm font-medium">
                Requires manager approval
              </label>
            </div>
            <div className="flex items-center">
              <input
                type="checkbox"
                id="is_paid"
                checked={formData.is_paid}
                onChange={(e) => setFormData({ ...formData, is_paid: e.target.checked })}
                className="mr-2"
              />
              <label htmlFor="is_paid" className="text-sm font-medium">
                Paid leave
              </label>
            </div>
            <div className="flex items-center">
              <input
                type="checkbox"
                id="carries_over"
                checked={formData.carries_over}
                onChange={(e) => setFormData({ ...formData, carries_over: e.target.checked })}
                className="mr-2"
              />
              <label htmlFor="carries_over" className="text-sm font-medium">
                Unused days carry over to next year
              </label>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t">
            <button type="button" onClick={onCancel} className="btn-secondary">
              Cancel
            </button>
            <button type="submit" className="btn-primary">
              {leaveType ? 'Update' : 'Create'} Leave Type
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function AdminLeaveTypes() {
  const [showForm, setShowForm] = useState(false);
  const [editingLeaveType, setEditingLeaveType] = useState<LeaveType | undefined>();
  const queryClient = useQueryClient();

  const { data: leaveTypes, isLoading } = useQuery({
    queryKey: ['leave-types'],
    queryFn: fetchLeaveTypes
  });

  const createMutation = useMutation({
    mutationFn: createLeaveType,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['leave-types'] });
      setShowForm(false);
    }
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: Partial<LeaveTypeFormData> }) => 
      updateLeaveType(id, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['leave-types'] });
      setShowForm(false);
      setEditingLeaveType(undefined);
    }
  });

  const toggleStatusMutation = useMutation({
    mutationFn: ({ id, isActive }: { id: string; isActive: boolean }) => 
      toggleLeaveTypeStatus(id, isActive),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['leave-types'] });
    }
  });

  const handleSave = (formData: LeaveTypeFormData) => {
    if (editingLeaveType) {
      updateMutation.mutate({ id: editingLeaveType.id, updates: formData });
    } else {
      createMutation.mutate(formData);
    }
  };

  const handleEdit = (leaveType: LeaveType) => {
    setEditingLeaveType(leaveType);
    setShowForm(true);
  };

  const handleToggleStatus = (leaveType: LeaveType) => {
    toggleStatusMutation.mutate({
      id: leaveType.id,
      isActive: !leaveType.is_active
    });
  };

  if (isLoading) {
    return (
      <div className="container py-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/3"></div>
          <div className="h-32 bg-gray-200 rounded"></div>
          <div className="h-32 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="container py-8 animate-fade-in">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold gradient-text">Leave Types</h1>
            <p className="text-gray-600 dark:text-gray-300 mt-2">
              Manage the types of leave available in your organization
            </p>
          </div>
          <button
            onClick={() => {
              setEditingLeaveType(undefined);
              setShowForm(true);
            }}
            className="btn-primary flex items-center gap-2"
          >
            <PlusIcon className="w-4 h-4" />
            Add Leave Type
          </button>
        </div>

        {/* Leave Types Grid */}
        {leaveTypes && leaveTypes.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {leaveTypes.map((leaveType) => (
              <div
                key={leaveType.id}
                className={[
                  'card border-l-4 transition-all duration-200',
                  leaveType.is_active 
                    ? 'border-l-green-400 bg-white dark:bg-gray-800' 
                    : 'border-l-gray-400 bg-gray-50 dark:bg-gray-800/50 opacity-60'
                ].join(' ')}
                style={{
                  borderLeftColor: leaveType.is_active ? leaveType.color : '#9ca3af'
                }}
              >
                <div className="card-body">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div 
                        className="w-10 h-10 rounded-lg flex items-center justify-center text-white text-xl"
                        style={{ backgroundColor: leaveType.color }}
                      >
                        {leaveType.icon}
                      </div>
                      <div>
                        <h3 className="font-semibold text-lg">{leaveType.name}</h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          Code: {leaveType.code}
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-1">
                      <button
                        onClick={() => handleToggleStatus(leaveType)}
                        className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                        title={leaveType.is_active ? 'Deactivate' : 'Activate'}
                      >
                        {leaveType.is_active ? (
                          <EyeIcon className="w-4 h-4 text-green-600" />
                        ) : (
                          <EyeSlashIcon className="w-4 h-4 text-gray-400" />
                        )}
                      </button>
                      <button
                        onClick={() => handleEdit(leaveType)}
                        className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                        title="Edit"
                      >
                        <PencilIcon className="w-4 h-4 text-blue-600" />
                      </button>
                    </div>
                  </div>

                  {leaveType.description && (
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                      {leaveType.description}
                    </p>
                  )}

                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-500">Requires Approval</span>
                      <span className={leaveType.requires_approval ? 'text-green-600' : 'text-gray-400'}>
                        {leaveType.requires_approval ? 'Yes' : 'No'}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-500">Paid Leave</span>
                      <span className={leaveType.is_paid ? 'text-green-600' : 'text-gray-400'}>
                        {leaveType.is_paid ? 'Yes' : 'No'}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-500">Carries Over</span>
                      <span className={leaveType.carries_over ? 'text-green-600' : 'text-gray-400'}>
                        {leaveType.carries_over ? 'Yes' : 'No'}
                      </span>
                    </div>
                    {leaveType.min_advance_notice_days > 0 && (
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-500">Min. Notice</span>
                        <span className="text-gray-600 dark:text-gray-400">
                          {leaveType.min_advance_notice_days} days
                        </span>
                      </div>
                    )}
                    {leaveType.max_consecutive_days && (
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-500">Max. Consecutive</span>
                        <span className="text-gray-600 dark:text-gray-400">
                          {leaveType.max_consecutive_days} days
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="card">
            <div className="card-body text-center py-12">
              <div className="text-4xl mb-4">🏖️</div>
              <h3 className="text-xl font-semibold mb-2">No Leave Types Yet</h3>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                Create your first leave type to get started with leave management.
              </p>
              <button
                onClick={() => setShowForm(true)}
                className="btn-primary"
              >
                Add Your First Leave Type
              </button>
            </div>
          </div>
        )}

        {/* Form Modal */}
        {showForm && (
          <LeaveTypeForm
            leaveType={editingLeaveType}
            onSave={handleSave}
            onCancel={() => {
              setShowForm(false);
              setEditingLeaveType(undefined);
            }}
          />
        )}
      </div>
    </div>
  );
}