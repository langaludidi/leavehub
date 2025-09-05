import React, { useState, useEffect } from 'react'
import { leavePolicies, LeavePolicy } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'
import { LoadingSpinner } from './ui/LoadingSpinner'

interface PolicyFormData {
  name: string
  type: string
  description: string
  days_allowed: number
  carryover_days: number
  approval_required: boolean
  notice_period_days: number
  color: string
  icon: string
}

const POLICY_TYPES = [
  { value: 'annual', label: 'Annual Leave', icon: 'sun', color: '#10b981', description: 'BCEA Section 20: Minimum 21 consecutive days or 15 working days per cycle', daysAllowed: 21, carryOver: true, requiresApproval: true, noticeRequired: 21 },
  { value: 'sick', label: 'Sick Leave', icon: 'heart-pulse', color: '#f59e0b', description: 'BCEA Section 22: 6 weeks worth of sick days over 36-month cycle', daysAllowed: 30, carryOver: false, requiresApproval: false, noticeRequired: 0 },
  { value: 'maternity', label: 'Maternity Leave', icon: 'baby', color: '#ec4899', description: 'BCEA Section 25: At least 4 consecutive months maternity leave', daysAllowed: 120, carryOver: false, requiresApproval: true, noticeRequired: 30 },
  { value: 'paternity', label: 'Paternity Leave', icon: 'baby', color: '#8b5cf6', description: 'BCEA Section 25A: At least 10 consecutive days paternity leave', daysAllowed: 10, carryOver: false, requiresApproval: true, noticeRequired: 30 },
  { value: 'adoption', label: 'Adoption Leave', icon: 'users', color: '#06b6d4', description: 'BCEA Section 25B: Up to 10 consecutive weeks adoption leave', daysAllowed: 70, carryOver: false, requiresApproval: true, noticeRequired: 30 },
  { value: 'family_responsibility', label: 'Family Responsibility Leave', icon: 'users', color: '#f97316', description: 'BCEA Section 27: 3 days per cycle for child birth, illness, or family death', daysAllowed: 3, carryOver: false, requiresApproval: false, noticeRequired: 0 },
  { value: 'study', label: 'Study Leave', icon: 'book-open', color: '#7c3aed', description: 'Educational leave for courses, examinations, or thesis submission', daysAllowed: 0, carryOver: false, requiresApproval: true, noticeRequired: 30 },
  { value: 'compassionate', label: 'Compassionate Leave', icon: 'heart', color: '#6b7280', description: 'Bereavement or compassionate circumstances beyond family responsibility', daysAllowed: 5, carryOver: false, requiresApproval: true, noticeRequired: 0 },
  { value: 'unpaid', label: 'Unpaid Leave', icon: 'settings', color: '#9ca3af', description: 'General unpaid leave for personal circumstances', daysAllowed: 0, carryOver: false, requiresApproval: true, noticeRequired: 21 },
]

const POLICY_COLORS = [
  '#3B82F6', '#EF4444', '#10B981', '#F59E0B', '#8B5CF6', '#EC4899', '#6B7280', '#4F46E5'
]

export function LeavePoliciesManager() {
  const { organization } = useAuth()
  const [policies, setPolicies] = useState<LeavePolicy[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingPolicy, setEditingPolicy] = useState<LeavePolicy | null>(null)
  const [formData, setFormData] = useState<PolicyFormData>({
    name: '',
    type: 'annual',
    description: '',
    days_allowed: 0,
    carryover_days: 0,
    approval_required: true,
    notice_period_days: 0,
    color: '#3B82F6',
    icon: 'sun'
  })

  useEffect(() => {
    if (organization) {
      loadPolicies()
    }
  }, [organization])

  const loadPolicies = async () => {
    try {
      setLoading(true)
      const { data } = await leavePolicies.getAll(organization!.id)
      if (data) setPolicies(data)
    } catch (error) {
      console.error('Error loading policies:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!organization) return

    try {
      if (editingPolicy) {
        await leavePolicies.update(editingPolicy.id, formData)
      } else {
        await leavePolicies.create({
          ...formData,
          org_id: organization.id,
          active: true
        })
      }
      
      await loadPolicies()
      resetForm()
    } catch (error) {
      console.error('Error saving policy:', error)
    }
  }

  const resetForm = () => {
    setShowForm(false)
    setEditingPolicy(null)
    setFormData({
      name: '',
      type: 'annual',
      description: '',
      days_allowed: 0,
      carryover_days: 0,
      approval_required: true,
      notice_period_days: 0,
      color: '#3B82F6',
      icon: 'sun'
    })
  }

  const startEdit = (policy: LeavePolicy) => {
    setEditingPolicy(policy)
    setFormData({
      name: policy.name,
      type: policy.type,
      description: policy.description || '',
      days_allowed: policy.days_allowed,
      carryover_days: policy.carryover_days,
      approval_required: policy.approval_required,
      notice_period_days: policy.notice_period_days,
      color: policy.color,
      icon: policy.icon
    })
    setShowForm(true)
  }

  const handleTypeChange = (type: string) => {
    const policyType = POLICY_TYPES.find(t => t.value === type)
    if (policyType) {
      setFormData(prev => ({
        ...prev,
        type,
        color: policyType.color,
        icon: policyType.icon,
        name: prev.name || policyType.label,
        description: policyType.description,
        days_allowed: policyType.daysAllowed,
        carryover_days: policyType.carryOver ? 15 : 0, // BCEA allows up to 6 months carryover for annual leave
        approval_required: policyType.requiresApproval,
        notice_period_days: policyType.noticeRequired
      }))
    }
  }

  const handleDeletePolicy = async (policyId: string) => {
    if (!confirm('Are you sure you want to delete this policy? This action cannot be undone.')) {
      return
    }
    
    try {
      // In a real app, this would call the API
      // await leavePolicies.delete(policyId)
      
      // For now, remove from local state
      setPolicies(prev => prev.filter(policy => policy.id !== policyId))
    } catch (error) {
      console.error('Error deleting policy:', error)
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Leave Policies</h2>
          <p className="text-gray-600">Configure leave types and their rules</p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700"
        >
          Add Policy
        </button>
      </div>

      {/* Policies Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {policies.map((policy) => (
          <div key={policy.id} className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100 overflow-hidden">
            {/* Header with colored accent */}
            <div className="h-2" style={{ backgroundColor: policy.color }}></div>
            
            <div className="p-6">
              {/* Title and Status Section */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-4">
                  <div 
                    className="w-12 h-12 rounded-xl flex items-center justify-center text-white text-lg shadow-md"
                    style={{ backgroundColor: policy.color }}
                  >
                    {policy.icon === 'sun' && '🏖️'}
                    {policy.icon === 'heart-pulse' && '🤒'}
                    {policy.icon === 'baby' && '👶'}
                    {policy.icon === 'users' && '👪'}
                    {policy.icon === 'book-open' && '📚'}
                    {policy.icon === 'heart' && '🕊️'}
                    {policy.icon === 'settings' && '🏃‍♂️'}
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-gray-900 mb-1">{policy.name}</h3>
                    <span className="px-2 py-1 text-xs font-medium bg-green-100 text-green-700 rounded-full">
                      ACTIVE
                    </span>
                  </div>
                </div>
                
                <div className="flex space-x-2">
                  <button
                    onClick={() => startEdit(policy)}
                    className="px-4 py-2 text-sm font-medium text-indigo-700 bg-indigo-50 hover:bg-indigo-100 rounded-lg border border-indigo-200 transition-all duration-200 hover:shadow-md"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDeletePolicy(policy.id)}
                    className="px-4 py-2 text-sm font-medium text-red-700 bg-red-50 hover:bg-red-100 rounded-lg border border-red-200 transition-all duration-200 hover:shadow-md"
                  >
                    Delete
                  </button>
                </div>
              </div>

              {/* Description Section */}
              {policy.description && (
                <div className="mb-6 p-4 bg-gray-50 rounded-lg border border-gray-100">
                  <p className="text-sm text-gray-700 leading-relaxed">{policy.description}</p>
                </div>
              )}

              {/* Policy Details Grid */}
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-blue-900">Days per Year</span>
                    <span className="text-xl font-bold text-blue-700">{policy.days_allowed}</span>
                  </div>
                </div>
                
                {policy.carryover_days > 0 && (
                  <div className="bg-green-50 p-4 rounded-lg border border-green-100">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-green-900">Carryover</span>
                      <span className="text-xl font-bold text-green-700">{policy.carryover_days}</span>
                    </div>
                  </div>
                )}
                
                {policy.notice_period_days > 0 && (
                  <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-100">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-yellow-900">Notice Days</span>
                      <span className="text-xl font-bold text-yellow-700">{policy.notice_period_days}</span>
                    </div>
                  </div>
                )}
                
                <div className={`p-4 rounded-lg border ${policy.approval_required ? 'bg-orange-50 border-orange-100' : 'bg-green-50 border-green-100'}`}>
                  <div className="flex items-center justify-between">
                    <span className={`text-sm font-medium ${policy.approval_required ? 'text-orange-900' : 'text-green-900'}`}>
                      Approval Required
                    </span>
                    <span className={`text-lg font-bold ${policy.approval_required ? 'text-orange-700' : 'text-green-700'}`}>
                      {policy.approval_required ? 'Yes' : 'No'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-90vh overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">
                {editingPolicy ? 'Edit Leave Policy' : 'Create New Leave Policy'}
              </h3>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Policy Type</label>
                  <select
                    value={formData.type}
                    onChange={(e) => handleTypeChange(e.target.value)}
                    className="w-full border border-gray-300 rounded-md px-3 py-2"
                    required
                  >
                    {POLICY_TYPES.map((type) => (
                      <option key={type.value} value={type.value}>{type.label}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Policy Name</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    className="w-full border border-gray-300 rounded-md px-3 py-2"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  rows={3}
                  className="w-full border border-gray-300 rounded-md px-3 py-2"
                  placeholder="Optional description for this leave policy"
                />
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Days Allowed per Year</label>
                  <div className="relative">
                    <input
                      type="number"
                      value={formData.days_allowed}
                      onChange={(e) => setFormData(prev => ({ ...prev, days_allowed: parseInt(e.target.value) || 0 }))}
                      min="0"
                      className="w-full border border-gray-300 rounded-md px-3 py-2 pr-16"
                      required
                    />
                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                      <span className="text-gray-500 text-sm">days</span>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Carryover Days</label>
                  <div className="relative">
                    <input
                      type="number"
                      value={formData.carryover_days}
                      onChange={(e) => setFormData(prev => ({ ...prev, carryover_days: parseInt(e.target.value) || 0 }))}
                      min="0"
                      className="w-full border border-gray-300 rounded-md px-3 py-2 pr-16"
                    />
                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                      <span className="text-gray-500 text-sm">days</span>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Notice Period</label>
                  <div className="relative">
                    <input
                      type="number"
                      value={formData.notice_period_days}
                      onChange={(e) => setFormData(prev => ({ ...prev, notice_period_days: parseInt(e.target.value) || 0 }))}
                      min="0"
                      className="w-full border border-gray-300 rounded-md px-3 py-2 pr-16"
                    />
                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                      <span className="text-gray-500 text-sm">days</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Color</label>
                  <div className="flex space-x-2">
                    {POLICY_COLORS.map((color) => (
                      <button
                        key={color}
                        type="button"
                        onClick={() => setFormData(prev => ({ ...prev, color }))}
                        className={`w-8 h-8 rounded-full border-2 ${formData.color === color ? 'border-gray-400' : 'border-gray-200'}`}
                        style={{ backgroundColor: color }}
                      />
                    ))}
                  </div>
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="approval_required"
                    checked={formData.approval_required}
                    onChange={(e) => setFormData(prev => ({ ...prev, approval_required: e.target.checked }))}
                    className="h-4 w-4 text-indigo-600 rounded border-gray-300"
                  />
                  <label htmlFor="approval_required" className="ml-2 text-sm text-gray-700">
                    Requires Approval
                  </label>
                </div>
              </div>

              <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
                <button
                  type="button"
                  onClick={resetForm}
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
                >
                  {editingPolicy ? 'Update Policy' : 'Create Policy'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}