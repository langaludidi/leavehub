import React, { useState } from 'react'
import { AppShell } from '../layout/AppShell'

interface LeavePolicy {
  id: string
  name: string
  description: string
  daysAllowed: number
  carryOver: boolean
  requiresApproval: boolean
  status: 'active' | 'inactive'
}

const mockPolicies: LeavePolicy[] = [
  {
    id: '1',
    name: 'Annual Leave',
    description: 'BCEA Section 20: Minimum 21 consecutive days or 15 working days per annual leave cycle. Can carry over up to 6 months into next cycle.',
    daysAllowed: 21,
    carryOver: true,
    requiresApproval: true,
    status: 'active'
  },
  {
    id: '2',
    name: 'Sick Leave',
    description: 'BCEA Section 22: During every sick leave cycle of 36 months, employee entitled to 6 weeks worth of sick leave. Medical certificate required for absence exceeding 2 consecutive days.',
    daysAllowed: 30,
    carryOver: false,
    requiresApproval: false,
    status: 'active'
  },
  {
    id: '3',
    name: 'Maternity Leave',
    description: 'BCEA Section 25: At least four consecutive months maternity leave. Not paid by employer (UIF may provide benefits).',
    daysAllowed: 120,
    carryOver: false,
    requiresApproval: true,
    status: 'active'
  },
  {
    id: '4',
    name: 'Paternity Leave',
    description: 'BCEA Section 25A: At least 10 consecutive days paternity leave for new fathers.',
    daysAllowed: 10,
    carryOver: false,
    requiresApproval: true,
    status: 'active'
  },
  {
    id: '5',
    name: 'Family Responsibility Leave',
    description: 'BCEA Section 27: 3 days per leave cycle when employee\'s child is born, child is sick, or in event of death of certain family members.',
    daysAllowed: 3,
    carryOver: false,
    requiresApproval: false,
    status: 'active'
  },
  {
    id: '6',
    name: 'Adoption Leave',
    description: 'BCEA Section 25B: Up to 10 consecutive weeks adoption leave for adoptive parents.',
    daysAllowed: 70,
    carryOver: false,
    requiresApproval: true,
    status: 'active'
  }
]

export function AdminSettings({ userRole = 'admin' }: { userRole?: 'admin' | 'superadmin' }) {
  const [activeTab, setActiveTab] = useState('policies')
  const [policies, setPolicies] = useState<LeavePolicy[]>(mockPolicies)
  const [showPolicyModal, setShowPolicyModal] = useState(false)
  const [editingPolicy, setEditingPolicy] = useState<LeavePolicy | null>(null)
  const [showWorkflowModal, setShowWorkflowModal] = useState(false)
  const [policyFormData, setPolicyFormData] = useState({
    name: '',
    description: '',
    daysAllowed: 0,
    carryOver: false,
    requiresApproval: true
  })
  const [workflowSteps, setWorkflowSteps] = useState([
    {
      id: '1',
      name: 'Direct Manager Approval',
      description: 'Employee\'s immediate supervisor reviews and approves the request',
      condition: 'Always required',
      averageTime: '4 hours',
      enabled: true,
      order: 1,
      role: 'direct_manager',
      autoApprove: false,
      escalationTime: '48 hours'
    },
    {
      id: '2',
      name: 'HR Review',
      description: 'HR department reviews extended leave requests for policy compliance',
      condition: 'If > 5 days',
      averageTime: '24 hours',
      enabled: true,
      order: 2,
      role: 'hr',
      autoApprove: false,
      escalationTime: '72 hours'
    }
  ])
  const [reportingStructure, setReportingStructure] = useState([
    { level: 1, title: 'Team Lead', approvalLimit: 3, canSkip: false },
    { level: 2, title: 'Department Manager', approvalLimit: 10, canSkip: true },
    { level: 3, title: 'HR Manager', approvalLimit: 30, canSkip: false },
    { level: 4, title: 'Executive Director', approvalLimit: 999, canSkip: false }
  ])
  const [workflowRules, setWorkflowRules] = useState({
    autoApproveThreshold: 1,
    requireDocumentation: 3,
    blackoutPeriods: [],
    escalationEnabled: true,
    weekendApprovals: false,
    emergencyBypass: true
  })
  const [departments, setDepartments] = useState([
    { id: '1', name: 'Engineering', manager: 'John Smith', employeeCount: 12, branches: ['1', '2'], isMultiBranch: true },
    { id: '2', name: 'Marketing', manager: 'Mary Davis', employeeCount: 8, branches: ['1'], isMultiBranch: false },
    { id: '3', name: 'Sales', manager: 'David Wilson', employeeCount: 15, branches: ['1', '2', '3'], isMultiBranch: true },
    { id: '4', name: 'HR', manager: 'Sarah Johnson', employeeCount: 4, branches: ['1'], isMultiBranch: false }
  ])
  const [branches, setBranches] = useState([
    { id: '1', name: 'Head Office', location: 'Cape Town, Western Cape', employees: 25, departments: ['1', '2', '3', '4'], isMultiDepartment: true },
    { id: '2', name: 'Johannesburg Branch', location: 'Johannesburg, Gauteng', employees: 18, departments: ['1', '3'], isMultiDepartment: true },
    { id: '3', name: 'Durban Office', location: 'Durban, KwaZulu-Natal', employees: 12, departments: ['3'], isMultiDepartment: false }
  ])
  const [showDepartmentModal, setShowDepartmentModal] = useState(false)
  const [showBranchModal, setShowBranchModal] = useState(false)
  const [departmentFormData, setDepartmentFormData] = useState({
    name: '',
    manager: '',
    employeeCount: 0,
    isMultiBranch: false,
    branches: [] as string[]
  })
  const [branchFormData, setBranchFormData] = useState({
    name: '',
    location: '',
    employees: 0,
    isMultiDepartment: false,
    departments: [] as string[]
  })

  const tabs = [
    { id: 'policies', name: 'Leave Policies', icon: '📋' },
    { id: 'approval', name: 'Approval Workflow', icon: '✅' },
    { id: 'notifications', name: 'Notifications', icon: '🔔' },
    { id: 'integrations', name: 'Integrations', icon: '🔗' },
    { id: 'general', name: 'General Settings', icon: '⚙️' }
  ]

  const handleAddPolicy = () => {
    setEditingPolicy(null)
    setPolicyFormData({
      name: '',
      description: '',
      daysAllowed: 0,
      carryOver: false,
      requiresApproval: true
    })
    setShowPolicyModal(true)
  }

  const handleEditPolicy = (policy: LeavePolicy) => {
    setEditingPolicy(policy)
    setPolicyFormData({
      name: policy.name,
      description: policy.description,
      daysAllowed: policy.daysAllowed,
      carryOver: policy.carryOver,
      requiresApproval: policy.requiresApproval
    })
    setShowPolicyModal(true)
  }

  const handleSavePolicy = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (editingPolicy) {
      // Update existing policy
      setPolicies(prev => prev.map(policy => 
        policy.id === editingPolicy.id 
          ? { ...policy, ...policyFormData }
          : policy
      ))
    } else {
      // Add new policy
      const newPolicy: LeavePolicy = {
        id: (policies.length + 1).toString(),
        ...policyFormData,
        status: 'active'
      }
      setPolicies(prev => [...prev, newPolicy])
    }
    
    setShowPolicyModal(false)
    setEditingPolicy(null)
  }

  const handleDeletePolicy = (policyId: string) => {
    if (confirm('Are you sure you want to delete this policy? This action cannot be undone.')) {
      setPolicies(prev => prev.filter(policy => policy.id !== policyId))
    }
  }

  const handleCustomizeWorkflow = () => {
    setShowWorkflowModal(true)
  }

  const handleSaveWorkflow = () => {
    setShowWorkflowModal(false)
    // In a real app, this would save to the backend
    alert('✅ Workflow settings saved successfully!')
  }

  const toggleWorkflowStep = (stepId: string) => {
    setWorkflowSteps(prev => prev.map(step => 
      step.id === stepId ? { ...step, enabled: !step.enabled } : step
    ))
  }

  const addReportingLevel = () => {
    const newLevel = {
      level: reportingStructure.length + 1,
      title: `Level ${reportingStructure.length + 1}`,
      approvalLimit: 5,
      canSkip: false
    }
    setReportingStructure(prev => [...prev, newLevel])
  }

  const removeReportingLevel = (level: number) => {
    setReportingStructure(prev => prev.filter(item => item.level !== level))
  }

  const updateReportingLevel = (level: number, field: string, value: any) => {
    setReportingStructure(prev => prev.map(item => 
      item.level === level ? { ...item, [field]: value } : item
    ))
  }

  const updateWorkflowRule = (field: string, value: any) => {
    setWorkflowRules(prev => ({ ...prev, [field]: value }))
  }

  const handleSaveDepartment = (e: React.FormEvent) => {
    e.preventDefault()
    const newDepartment = {
      id: Date.now().toString(),
      ...departmentFormData
    }
    setDepartments(prev => [...prev, newDepartment])
    setDepartmentFormData({ 
      name: '', 
      manager: '', 
      employeeCount: 0, 
      isMultiBranch: false, 
      branches: [] 
    })
    setShowDepartmentModal(false)
  }

  const handleDeleteDepartment = (deptId: string) => {
    setDepartments(prev => prev.filter(dept => dept.id !== deptId))
  }

  const handleSaveBranch = (e: React.FormEvent) => {
    e.preventDefault()
    const newBranch = {
      id: Date.now().toString(),
      ...branchFormData
    }
    setBranches(prev => [...prev, newBranch])
    setBranchFormData({ 
      name: '', 
      location: '', 
      employees: 0, 
      isMultiDepartment: false, 
      departments: [] 
    })
    setShowBranchModal(false)
  }

  const handleDeleteBranch = (branchId: string) => {
    setBranches(prev => prev.filter(branch => branch.id !== branchId))
  }

  return (
    <AppShell userRole={userRole}>
      <div className="space-y-8 p-6">
        <div className="flex flex-col space-y-4 lg:flex-row lg:items-center lg:justify-between lg:space-y-0 mb-6 sm:mb-8">
          <div className="space-y-1">
            <h1 className="text-2xl sm:text-3xl lg:text-4xl heading-premium text-gray-900 font-bold">Admin Settings</h1>
            <p className="text-sm sm:text-base lg:text-lg text-premium text-gray-600">Configure leave policies, approval workflows, and system settings</p>
          </div>
          <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-4">
            <button className="btn-premium bg-gray-100 text-gray-700 px-4 py-2 sm:px-6 sm:py-3 rounded-xl hover:bg-gray-200 shadow-lg transition-all duration-200 text-sm">
              Reset to Default
            </button>
            <button className="btn-premium bg-indigo-600 text-white px-4 py-2 sm:px-8 sm:py-3 rounded-xl hover:bg-indigo-700 shadow-lg transform hover:scale-105 transition-all duration-200 text-sm">
              Save Changes
            </button>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row lg:space-x-8 space-y-6 lg:space-y-0">
          {/* Settings Navigation */}
          <div className="w-full lg:w-80 space-y-3">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full flex items-center space-x-3 px-4 py-3 lg:px-6 lg:py-4 text-left rounded-xl transition-all duration-200 transform hover:scale-105 ${
                  activeTab === tab.id
                    ? 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-lg'
                    : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900 hover:shadow-md'
                }`}
              >
                <span className="text-xl lg:text-2xl">{tab.icon}</span>
                <span className="text-sm lg:text-base text-premium font-medium">{tab.name}</span>
                {activeTab === tab.id && (
                  <svg className="w-5 h-5 ml-auto" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 111.414-1.414L12.414 9a2 2 0 000 2.828l-3.707 3.707a1 1 0 01-1.414 0z" clipRule="evenodd" />
                  </svg>
                )}
              </button>
            ))}
          </div>

          {/* Settings Content */}
          <div className="flex-1">
            {activeTab === 'policies' && (
              <div className="card-premium shadow-2xl bg-gradient-to-br from-white to-gray-50">
                <div className="px-4 py-4 sm:px-6 sm:py-5 lg:px-8 lg:py-6 border-b border-gray-200 flex flex-col space-y-3 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
                  <div className="space-y-2">
                    <h2 className="text-xl sm:text-2xl heading-premium text-gray-900 font-bold">Leave Policies</h2>
                    <p className="text-sm sm:text-base text-premium text-gray-600">Manage leave types and entitlements for all employees</p>
                  </div>
                  <button 
                    onClick={handleAddPolicy}
                    className="btn-premium bg-gradient-to-r from-green-500 to-emerald-600 text-white px-6 py-3 rounded-xl hover:from-green-600 hover:to-emerald-700 shadow-lg transform hover:scale-105 transition-all duration-200"
                  >
                    <svg className="w-5 h-5 inline mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                    Add Policy
                  </button>
                </div>
                <div className="p-4 sm:p-6 lg:p-8 space-y-6">
                  {policies.map(policy => (
                    <div key={policy.id} className="card-premium shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-[1.01] overflow-hidden border border-gray-200">
                      {/* Header Section */}
                      <div className="p-4 sm:p-6 border-b border-gray-200 bg-gradient-to-r from-blue-50 via-indigo-50 to-purple-50">
                        <div className="flex flex-col space-y-4 sm:flex-row sm:items-start sm:justify-between sm:space-y-0">
                          <div className="flex-1">
                            <div className="flex flex-col space-y-2 sm:flex-row sm:items-center sm:space-y-0 sm:space-x-3 mb-2">
                              <h3 className="text-xl sm:text-2xl heading-premium text-gray-900 font-bold">{policy.name}</h3>
                              <span className={`self-start px-3 py-1 text-xs font-bold rounded-full ${
                                policy.status === 'active' 
                                ? 'bg-green-100 text-green-800 border border-green-200' 
                                : 'bg-gray-100 text-gray-800 border border-gray-200'
                              }`}>
                                {policy.status.toUpperCase()}
                              </span>
                            </div>
                          </div>
                          
                          <div className="flex flex-col space-y-2 sm:flex-row sm:space-y-0 sm:space-x-3">
                            <button 
                              onClick={() => handleEditPolicy(policy)}
                              className="btn-premium bg-indigo-600 text-white hover:bg-indigo-700 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 transform hover:scale-105 shadow-lg flex items-center justify-center space-x-2"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                              </svg>
                              <span>Edit</span>
                            </button>
                            <button 
                              onClick={() => handleDeletePolicy(policy.id)}
                              className="btn-premium bg-red-600 text-white hover:bg-red-700 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 transform hover:scale-105 shadow-lg flex items-center justify-center space-x-2"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                              <span>Delete</span>
                            </button>
                          </div>
                        </div>
                      </div>

                      {/* Content Section */}
                      <div className="p-4 sm:p-6">
                        {/* Description */}
                        <div className="mb-6">
                          <h4 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-2">Policy Description</h4>
                          <p className="text-premium text-gray-700 leading-relaxed bg-gradient-to-r from-gray-50 to-blue-50 p-4 rounded-xl border border-gray-200 shadow-sm">{policy.description}</p>
                        </div>

                        {/* Policy Details Grid */}
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
                          <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                            <div className="text-center">
                              <div className="text-3xl font-bold text-blue-700 mb-1">{policy.daysAllowed}</div>
                              <div className="text-sm font-medium text-blue-600">Days per Year</div>
                            </div>
                          </div>
                          
                          <div className={`border rounded-xl p-4 ${
                            policy.carryOver ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'
                          }`}>
                            <div className="text-center">
                              <div className={`text-2xl font-bold mb-1 ${
                                policy.carryOver ? 'text-green-700' : 'text-red-700'
                              }`}>
                                {policy.carryOver ? 'Yes' : 'No'}
                              </div>
                              <div className={`text-sm font-medium ${
                                policy.carryOver ? 'text-green-600' : 'text-red-600'
                              }`}>
                                Carry Over
                              </div>
                            </div>
                          </div>
                          
                          <div className={`border rounded-xl p-4 ${
                            policy.requiresApproval ? 'bg-orange-50 border-orange-200' : 'bg-green-50 border-green-200'
                          }`}>
                            <div className="text-center">
                              <div className={`text-2xl font-bold mb-1 ${
                                policy.requiresApproval ? 'text-orange-700' : 'text-green-700'
                              }`}>
                                {policy.requiresApproval ? 'Yes' : 'No'}
                              </div>
                              <div className={`text-sm font-medium ${
                                policy.requiresApproval ? 'text-orange-600' : 'text-green-600'
                              }`}>
                                Requires Approval
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'approval' && (
              <div className="card-premium shadow-2xl bg-gradient-to-br from-white to-gray-50">
                <div className="px-4 py-4 sm:px-6 sm:py-5 lg:px-8 lg:py-6 border-b border-gray-200">
                  <div className="space-y-2">
                    <h2 className="text-xl sm:text-2xl heading-premium text-gray-900 font-bold">Approval Workflow</h2>
                    <p className="text-sm sm:text-base text-premium text-gray-600">Configure multi-step approval processes for different leave types</p>
                  </div>
                </div>
                <div className="p-8 space-y-8">
                  <div className="bg-white border border-gray-200 rounded-2xl p-8 shadow-lg">
                    <div className="flex items-center justify-between mb-6">
                      <h3 className="text-xl heading-premium text-gray-900 font-bold">Standard Workflow</h3>
                      <button 
                        onClick={handleCustomizeWorkflow}
                        className="bg-indigo-100 text-indigo-700 hover:bg-indigo-200 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 hover:shadow-md"
                      >
                        <svg className="w-4 h-4 inline mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        Customize
                      </button>
                    </div>
                    <div className="space-y-4">
                      <div className="flex items-center space-x-6 p-6 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-200">
                        <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-full flex items-center justify-center text-lg font-bold shadow-lg">
                          1
                        </div>
                        <div className="flex-1">
                          <h4 className="heading-premium text-gray-900 font-bold text-lg">Direct Manager Approval</h4>
                          <p className="text-premium text-gray-700 mt-1">Employee's immediate supervisor reviews and approves the request</p>
                          <p className="text-sm text-blue-600 font-medium mt-2">⏱️ Average response: 4 hours</p>
                        </div>
                        <div className="text-green-600">
                          <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                          </svg>
                        </div>
                      </div>
                      <div className="flex justify-center">
                        <div className="w-px h-8 bg-gray-300"></div>
                      </div>
                      <div className="flex items-center space-x-6 p-6 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl border border-indigo-200">
                        <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-600 text-white rounded-full flex items-center justify-center text-lg font-bold shadow-lg">
                          2
                        </div>
                        <div className="flex-1">
                          <h4 className="heading-premium text-gray-900 font-bold text-lg">HR Review (if &gt; 5 days)</h4>
                          <p className="text-premium text-gray-700 mt-1">HR department reviews extended leave requests for policy compliance</p>
                          <p className="text-sm text-indigo-600 font-medium mt-2">⏱️ Average response: 24 hours</p>
                        </div>
                        <div className="text-yellow-600">
                          <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                          </svg>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'notifications' && (
              <div className="card-premium shadow-2xl bg-gradient-to-br from-white to-gray-50">
                <div className="px-4 py-4 sm:px-6 sm:py-5 lg:px-8 lg:py-6 border-b border-gray-200">
                  <div className="space-y-2">
                    <h2 className="text-xl sm:text-2xl heading-premium text-gray-900 font-bold">Notification Settings</h2>
                    <p className="text-sm sm:text-base text-premium text-gray-600">Configure email and system notifications for different events</p>
                  </div>
                </div>
                <div className="p-8 space-y-6">
                  <div className="space-y-6">
                    <div className="bg-white flex items-center justify-between p-6 border border-gray-200 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300">
                      <div className="flex items-center space-x-4">
                        <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center">
                          <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                        </div>
                        <div>
                          <h4 className="heading-premium text-gray-900 font-bold">New Leave Request</h4>
                          <p className="text-sm sm:text-base text-premium text-gray-600">Notify managers instantly when employees submit leave requests</p>
                        </div>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" defaultChecked className="sr-only peer" />
                        <div className="w-14 h-7 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-blue-600 shadow-lg"></div>
                      </label>
                    </div>
                    
                    <div className="bg-white flex items-center justify-between p-6 border border-gray-200 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300">
                      <div className="flex items-center space-x-4">
                        <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center">
                          <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                        </div>
                        <div>
                          <h4 className="heading-premium text-gray-900 font-bold">Request Status Updates</h4>
                          <p className="text-sm sm:text-base text-premium text-gray-600">Notify employees immediately when requests are approved or rejected</p>
                        </div>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" defaultChecked className="sr-only peer" />
                        <div className="w-14 h-7 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-blue-600 shadow-lg"></div>
                      </label>
                    </div>

                    <div className="bg-white flex items-center justify-between p-6 border border-gray-200 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300">
                      <div className="flex items-center space-x-4">
                        <div className="w-12 h-12 bg-gradient-to-br from-yellow-500 to-orange-600 rounded-xl flex items-center justify-center">
                          <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-5 5v-5zM4 19l2-7h4l2 7M4 19h16" />
                          </svg>
                        </div>
                        <div>
                          <h4 className="heading-premium text-gray-900 font-bold">Balance Reminders</h4>
                          <p className="text-sm sm:text-base text-premium text-gray-600">Send monthly reminders about leave balance and upcoming expiry</p>
                        </div>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" className="sr-only peer" />
                        <div className="w-14 h-7 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-blue-600 shadow-lg"></div>
                      </label>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'integrations' && (
              <div className="card-premium shadow-2xl bg-gradient-to-br from-white to-gray-50">
                <div className="px-4 py-4 sm:px-6 sm:py-5 lg:px-8 lg:py-6 border-b border-gray-200">
                  <div className="space-y-2">
                    <h2 className="text-xl sm:text-2xl heading-premium text-gray-900 font-bold">Integrations</h2>
                    <p className="text-sm sm:text-base text-premium text-gray-600">Connect with external systems and tools</p>
                  </div>
                </div>
                <div className="p-8 space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-lg hover:shadow-xl transition-all duration-300">
                      <div className="flex items-center space-x-4 mb-4">
                        <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-xl flex items-center justify-center">
                          <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                          </svg>
                        </div>
                        <div>
                          <h3 className="heading-premium text-gray-900 font-bold">Email Integration</h3>
                          <p className="text-sm text-gray-600">SMTP configuration for notifications</p>
                        </div>
                      </div>
                      <div className="space-y-3">
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-600">Status</span>
                          <span className="px-3 py-1 text-xs font-semibold bg-green-100 text-green-800 rounded-full">Connected</span>
                        </div>
                        <button className="w-full bg-indigo-100 text-indigo-700 hover:bg-indigo-200 py-2 px-4 rounded-lg text-sm font-medium transition-all duration-200">
                          Configure SMTP
                        </button>
                      </div>
                    </div>

                    <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-lg hover:shadow-xl transition-all duration-300">
                      <div className="flex items-center space-x-4 mb-4">
                        <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-xl flex items-center justify-center">
                          <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                        </div>
                        <div>
                          <h3 className="heading-premium text-gray-900 font-bold">Calendar Sync</h3>
                          <p className="text-sm text-gray-600">Google Calendar & Outlook integration</p>
                        </div>
                      </div>
                      <div className="space-y-3">
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-600">Status</span>
                          <span className="px-3 py-1 text-xs font-semibold bg-yellow-100 text-yellow-800 rounded-full">Pending</span>
                        </div>
                        <button className="w-full bg-blue-100 text-blue-700 hover:bg-blue-200 py-2 px-4 rounded-lg text-sm font-medium transition-all duration-200">
                          Setup Calendar
                        </button>
                      </div>
                    </div>

                    <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-lg hover:shadow-xl transition-all duration-300">
                      <div className="flex items-center space-x-4 mb-4">
                        <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center">
                          <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                          </svg>
                        </div>
                        <div>
                          <h3 className="heading-premium text-gray-900 font-bold">HR System</h3>
                          <p className="text-sm text-gray-600">Employee data synchronization</p>
                        </div>
                      </div>
                      <div className="space-y-3">
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-600">Status</span>
                          <span className="px-3 py-1 text-xs font-semibold bg-red-100 text-red-800 rounded-full">Disconnected</span>
                        </div>
                        <button className="w-full bg-green-100 text-green-700 hover:bg-green-200 py-2 px-4 rounded-lg text-sm font-medium transition-all duration-200">
                          Connect HR System
                        </button>
                      </div>
                    </div>

                    <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-lg hover:shadow-xl transition-all duration-300">
                      <div className="flex items-center space-x-4 mb-4">
                        <div className="w-12 h-12 bg-gradient-to-br from-red-500 to-pink-600 rounded-xl flex items-center justify-center">
                          <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                          </svg>
                        </div>
                        <div>
                          <h3 className="heading-premium text-gray-900 font-bold">Analytics & Reports</h3>
                          <p className="text-sm text-gray-600">Business intelligence integration</p>
                        </div>
                      </div>
                      <div className="space-y-3">
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-600">Status</span>
                          <span className="px-3 py-1 text-xs font-semibold bg-green-100 text-green-800 rounded-full">Connected</span>
                        </div>
                        <button className="w-full bg-red-100 text-red-700 hover:bg-red-200 py-2 px-4 rounded-lg text-sm font-medium transition-all duration-200">
                          View Reports
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'general' && (
              <div className="card-premium shadow-2xl bg-gradient-to-br from-white to-gray-50">
                <div className="px-4 py-4 sm:px-6 sm:py-5 lg:px-8 lg:py-6 border-b border-gray-200">
                  <div className="space-y-2">
                    <h2 className="text-xl sm:text-2xl heading-premium text-gray-900 font-bold">General Settings</h2>
                    <p className="text-sm sm:text-base text-premium text-gray-600">Configure system-wide settings and preferences</p>
                  </div>
                </div>
                <div className="p-8 space-y-8">
                  <div className="bg-white rounded-2xl p-8 border border-gray-200 shadow-lg">
                    <div className="flex items-center justify-between mb-8">
                      <h3 className="text-2xl heading-premium text-gray-900 font-bold flex items-center">
                        <svg className="w-6 h-6 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                        </svg>
                        Company Information
                      </h3>
                      <div className="text-sm bg-blue-50 border border-blue-200 rounded-lg px-3 py-2">
                        <span className="text-blue-800 font-medium">📄 Used on documents</span>
                      </div>
                    </div>
                    
                    {/* Basic Company Details */}
                    <div className="space-y-8">
                      <div>
                        <h4 className="text-lg font-semibold text-gray-800 mb-4 border-b border-gray-200 pb-2">Company Details</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Company Name <span className="text-red-500">*</span>
                            </label>
                            <input 
                              type="text" 
                              defaultValue="Acme Corporation" 
                              required
                              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-4 focus:ring-indigo-500 focus:ring-opacity-50 focus:border-indigo-500 transition-all duration-200"
                              placeholder="Enter your company name"
                            />
                          </div>
                          
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Trading Name / DBA
                            </label>
                            <input 
                              type="text" 
                              defaultValue="" 
                              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-4 focus:ring-indigo-500 focus:ring-opacity-50 focus:border-indigo-500 transition-all duration-200"
                              placeholder="Doing business as..."
                            />
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Company Registration Number <span className="text-red-500">*</span>
                            </label>
                            <input 
                              type="text" 
                              defaultValue="" 
                              required
                              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-4 focus:ring-indigo-500 focus:ring-opacity-50 focus:border-indigo-500 transition-all duration-200"
                              placeholder="e.g., 2019/123456/07"
                            />
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              VAT Number
                            </label>
                            <input 
                              type="text" 
                              defaultValue="" 
                              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-4 focus:ring-indigo-500 focus:ring-opacity-50 focus:border-indigo-500 transition-all duration-200"
                              placeholder="e.g., 4123456789"
                            />
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Industry / Sector <span className="text-red-500">*</span>
                            </label>
                            <select 
                              required
                              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-4 focus:ring-indigo-500 focus:ring-opacity-50 focus:border-indigo-500 transition-all duration-200"
                            >
                              <option value="">Select industry...</option>
                              <option>Technology & Software</option>
                              <option>Healthcare & Medical</option>
                              <option>Financial Services</option>
                              <option>Manufacturing</option>
                              <option>Retail & Consumer Goods</option>
                              <option>Education</option>
                              <option>Construction & Engineering</option>
                              <option>Professional Services</option>
                              <option>Government & Public Sector</option>
                              <option>Other</option>
                            </select>
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Company Size <span className="text-red-500">*</span>
                            </label>
                            <select 
                              required
                              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-4 focus:ring-indigo-500 focus:ring-opacity-50 focus:border-indigo-500 transition-all duration-200"
                            >
                              <option value="">Select size...</option>
                              <option>1-10 employees</option>
                              <option>11-50 employees</option>
                              <option>51-200 employees</option>
                              <option>201-500 employees</option>
                              <option>501-1000 employees</option>
                              <option>1000+ employees</option>
                            </select>
                          </div>
                        </div>
                      </div>

                      {/* Contact Information */}
                      <div>
                        <h4 className="text-lg font-semibold text-gray-800 mb-4 border-b border-gray-200 pb-2">Contact Information</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Physical Address <span className="text-red-500">*</span>
                            </label>
                            <textarea 
                              required
                              rows={3}
                              defaultValue=""
                              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-4 focus:ring-indigo-500 focus:ring-opacity-50 focus:border-indigo-500 transition-all duration-200"
                              placeholder="Enter complete physical address..."
                            />
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              City <span className="text-red-500">*</span>
                            </label>
                            <input 
                              type="text" 
                              required
                              defaultValue="" 
                              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-4 focus:ring-indigo-500 focus:ring-opacity-50 focus:border-indigo-500 transition-all duration-200"
                              placeholder="e.g., Cape Town"
                            />
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Postal Code <span className="text-red-500">*</span>
                            </label>
                            <input 
                              type="text" 
                              required
                              defaultValue="" 
                              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-4 focus:ring-indigo-500 focus:ring-opacity-50 focus:border-indigo-500 transition-all duration-200"
                              placeholder="e.g., 8001"
                            />
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Province/State <span className="text-red-500">*</span>
                            </label>
                            <select 
                              required
                              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-4 focus:ring-indigo-500 focus:ring-opacity-50 focus:border-indigo-500 transition-all duration-200"
                            >
                              <option value="">Select province...</option>
                              <option>Western Cape</option>
                              <option>Gauteng</option>
                              <option>KwaZulu-Natal</option>
                              <option>Eastern Cape</option>
                              <option>Free State</option>
                              <option>Limpopo</option>
                              <option>Mpumalanga</option>
                              <option>North West</option>
                              <option>Northern Cape</option>
                            </select>
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Country <span className="text-red-500">*</span>
                            </label>
                            <select 
                              required
                              defaultValue="ZA"
                              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-4 focus:ring-indigo-500 focus:ring-opacity-50 focus:border-indigo-500 transition-all duration-200"
                            >
                              <option value="ZA">South Africa</option>
                              <option value="US">United States</option>
                              <option value="GB">United Kingdom</option>
                              <option value="AU">Australia</option>
                              <option value="CA">Canada</option>
                            </select>
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Main Phone Number <span className="text-red-500">*</span>
                            </label>
                            <input 
                              type="tel" 
                              required
                              defaultValue="" 
                              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-4 focus:ring-indigo-500 focus:ring-opacity-50 focus:border-indigo-500 transition-all duration-200"
                              placeholder="e.g., +27 21 123 4567"
                            />
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Company Email <span className="text-red-500">*</span>
                            </label>
                            <input 
                              type="email" 
                              required
                              defaultValue="" 
                              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-4 focus:ring-indigo-500 focus:ring-opacity-50 focus:border-indigo-500 transition-all duration-200"
                              placeholder="e.g., info@company.co.za"
                            />
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Company Website
                            </label>
                            <input 
                              type="url" 
                              defaultValue="" 
                              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-4 focus:ring-indigo-500 focus:ring-opacity-50 focus:border-indigo-500 transition-all duration-200"
                              placeholder="e.g., https://company.co.za"
                            />
                          </div>
                        </div>
                      </div>

                      {/* HR & Operational Settings */}
                      <div>
                        <h4 className="text-lg font-semibold text-gray-800 mb-4 border-b border-gray-200 pb-2">Operational Settings</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Working Hours <span className="text-red-500">*</span>
                            </label>
                            <select 
                              required
                              defaultValue="9-17"
                              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-4 focus:ring-indigo-500 focus:ring-opacity-50 focus:border-indigo-500 transition-all duration-200"
                            >
                              <option value="8-16">8:00 AM - 4:00 PM</option>
                              <option value="8:30-17">8:30 AM - 5:00 PM</option>
                              <option value="9-17">9:00 AM - 5:00 PM</option>
                              <option value="9-17:30">9:00 AM - 5:30 PM</option>
                              <option value="10-18">10:00 AM - 6:00 PM</option>
                              <option value="custom">Custom Hours</option>
                            </select>
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Time Zone <span className="text-red-500">*</span>
                            </label>
                            <select 
                              required
                              defaultValue="Africa/Johannesburg"
                              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-4 focus:ring-indigo-500 focus:ring-opacity-50 focus:border-indigo-500 transition-all duration-200"
                            >
                              <option value="Africa/Johannesburg">UTC+2 (South Africa)</option>
                              <option value="UTC">UTC+0 (GMT)</option>
                              <option value="America/New_York">UTC-5 (EST)</option>
                              <option value="America/Los_Angeles">UTC-8 (PST)</option>
                              <option value="Europe/London">UTC+0 (UK)</option>
                            </select>
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Currency <span className="text-red-500">*</span>
                            </label>
                            <select 
                              required
                              defaultValue="ZAR"
                              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-4 focus:ring-indigo-500 focus:ring-opacity-50 focus:border-indigo-500 transition-all duration-200"
                            >
                              <option value="ZAR">ZAR (South African Rand)</option>
                              <option value="USD">USD (US Dollar)</option>
                              <option value="EUR">EUR (Euro)</option>
                              <option value="GBP">GBP (British Pound)</option>
                              <option value="AUD">AUD (Australian Dollar)</option>
                            </select>
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Financial Year End <span className="text-red-500">*</span>
                            </label>
                            <select 
                              required
                              defaultValue="02-28"
                              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-4 focus:ring-indigo-500 focus:ring-opacity-50 focus:border-indigo-500 transition-all duration-200"
                            >
                              <option value="02-28">28 February</option>
                              <option value="03-31">31 March</option>
                              <option value="06-30">30 June</option>
                              <option value="12-31">31 December</option>
                            </select>
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Leave Year Start <span className="text-red-500">*</span>
                            </label>
                            <select 
                              required
                              defaultValue="01-01"
                              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-4 focus:ring-indigo-500 focus:ring-opacity-50 focus:border-indigo-500 transition-all duration-200"
                            >
                              <option value="01-01">1 January</option>
                              <option value="03-01">1 March</option>
                              <option value="04-01">1 April</option>
                              <option value="07-01">1 July</option>
                            </select>
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Public Holidays
                            </label>
                            <select 
                              defaultValue="ZA"
                              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-4 focus:ring-indigo-500 focus:ring-opacity-50 focus:border-indigo-500 transition-all duration-200"
                            >
                              <option value="ZA">South African Holidays</option>
                              <option value="US">US Holidays</option>
                              <option value="UK">UK Holidays</option>
                              <option value="AU">Australian Holidays</option>
                              <option value="custom">Custom Holidays</option>
                            </select>
                          </div>
                        </div>
                      </div>

                      {/* Legal & HR Contacts */}
                      <div>
                        <h4 className="text-lg font-semibold text-gray-800 mb-4 border-b border-gray-200 pb-2">Key Contacts</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              HR Manager Name <span className="text-red-500">*</span>
                            </label>
                            <input 
                              type="text" 
                              required
                              defaultValue="" 
                              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-4 focus:ring-indigo-500 focus:ring-opacity-50 focus:border-indigo-500 transition-all duration-200"
                              placeholder="Full name of HR Manager"
                            />
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              HR Manager Email <span className="text-red-500">*</span>
                            </label>
                            <input 
                              type="email" 
                              required
                              defaultValue="" 
                              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-4 focus:ring-indigo-500 focus:ring-opacity-50 focus:border-indigo-500 transition-all duration-200"
                              placeholder="hr@company.co.za"
                            />
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              CEO/Managing Director
                            </label>
                            <input 
                              type="text" 
                              defaultValue="" 
                              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-4 focus:ring-indigo-500 focus:ring-opacity-50 focus:border-indigo-500 transition-all duration-200"
                              placeholder="Full name of CEO/MD"
                            />
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Finance Contact Email
                            </label>
                            <input 
                              type="email" 
                              defaultValue="" 
                              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-4 focus:ring-indigo-500 focus:ring-opacity-50 focus:border-indigo-500 transition-all duration-200"
                              placeholder="finance@company.co.za"
                            />
                          </div>
                        </div>
                      </div>

                      {/* Departments Section */}
                      <div>
                        <div className="flex items-center justify-between mb-4">
                          <h4 className="text-lg font-semibold text-gray-800 border-b border-gray-200 pb-2">Departments</h4>
                          <button
                            onClick={() => setShowDepartmentModal(true)}
                            className="bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-green-700 transition-colors duration-200 flex items-center space-x-2"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                            </svg>
                            <span>Add Department</span>
                          </button>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                          {departments.map((dept) => (
                            <div key={dept.id} className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                              <div className="flex items-center justify-between mb-2">
                                <h5 className="font-semibold text-blue-900">{dept.name}</h5>
                                <button 
                                  onClick={() => handleDeleteDepartment(dept.id)}
                                  className="text-red-600 hover:text-red-800 p-1"
                                >
                                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                  </svg>
                                </button>
                              </div>
                              <p className="text-sm text-blue-700">Manager: {dept.manager}</p>
                              <p className="text-sm text-blue-600">{dept.employeeCount} employees</p>
                              {dept.isMultiBranch && (
                                <div className="mt-2">
                                  <p className="text-xs text-blue-500 font-medium">Operates in {dept.branches.length} branches:</p>
                                  <div className="flex flex-wrap gap-1 mt-1">
                                    {dept.branches.map(branchId => {
                                      const branch = branches.find(b => b.id === branchId)
                                      return branch ? (
                                        <span key={branchId} className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                                          {branch.name}
                                        </span>
                                      ) : null
                                    })}
                                  </div>
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Branches Section */}
                      <div>
                        <div className="flex items-center justify-between mb-4">
                          <h4 className="text-lg font-semibold text-gray-800 border-b border-gray-200 pb-2">Branches / Locations</h4>
                          <button
                            onClick={() => setShowBranchModal(true)}
                            className="bg-purple-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-purple-700 transition-colors duration-200 flex items-center space-x-2"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                            </svg>
                            <span>Add Branch</span>
                          </button>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                          {branches.map((branch) => (
                            <div key={branch.id} className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                              <div className="flex items-center justify-between mb-2">
                                <h5 className="font-semibold text-purple-900">{branch.name}</h5>
                                <button 
                                  onClick={() => handleDeleteBranch(branch.id)}
                                  className="text-red-600 hover:text-red-800 p-1"
                                >
                                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                  </svg>
                                </button>
                              </div>
                              <p className="text-sm text-purple-700">{branch.location}</p>
                              <p className="text-sm text-purple-600">{branch.employees} employees</p>
                              {branch.isMultiDepartment && (
                                <div className="mt-2">
                                  <p className="text-xs text-purple-500 font-medium">Has {branch.departments.length} departments:</p>
                                  <div className="flex flex-wrap gap-1 mt-1">
                                    {branch.departments.map(deptId => {
                                      const department = departments.find(d => d.id === deptId)
                                      return department ? (
                                        <span key={deptId} className="text-xs bg-purple-100 text-purple-800 px-2 py-1 rounded-full">
                                          {department.name}
                                        </span>
                                      ) : null
                                    })}
                                  </div>
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="pt-6 border-t border-gray-200">
                        <button 
                          type="button"
                          className="w-full md:w-auto bg-indigo-600 text-white px-8 py-3 rounded-xl hover:bg-indigo-700 shadow-lg transform hover:scale-105 transition-all duration-200 font-medium flex items-center justify-center space-x-2"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                          <span>Save Company Information</span>
                        </button>
                        <p className="text-xs text-gray-500 mt-2">* Required fields. This information will appear on generated reports and documents.</p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-lg">
                    <h3 className="text-xl heading-premium text-gray-900 font-bold mb-6">System Preferences</h3>
                    <div className="space-y-6">
                      <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                        <div>
                          <h4 className="heading-premium text-gray-900 font-bold">Auto-approve Sick Leave</h4>
                          <p className="text-premium text-gray-600 text-sm">Automatically approve sick leave requests under 3 days</p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input type="checkbox" defaultChecked className="sr-only peer" />
                          <div className="w-14 h-7 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-blue-600 shadow-lg"></div>
                        </label>
                      </div>

                      <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                        <div>
                          <h4 className="heading-premium text-gray-900 font-bold">Weekend Notifications</h4>
                          <p className="text-premium text-gray-600 text-sm">Send notifications during weekends and holidays</p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input type="checkbox" className="sr-only peer" />
                          <div className="w-14 h-7 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-blue-600 shadow-lg"></div>
                        </label>
                      </div>

                      <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                        <div>
                          <h4 className="heading-premium text-gray-900 font-bold">Advanced Analytics</h4>
                          <p className="text-premium text-gray-600 text-sm">Enable detailed reporting and data analytics</p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input type="checkbox" defaultChecked className="sr-only peer" />
                          <div className="w-14 h-7 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-blue-600 shadow-lg"></div>
                        </label>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Policy Modal */}
        {showPolicyModal && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
            <div className="relative top-20 mx-auto p-5 border w-11/12 max-w-2xl shadow-lg rounded-md bg-white">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-900">
                  {editingPolicy ? 'Edit Leave Policy' : 'Add New Leave Policy'}
                </h2>
                <button
                  onClick={() => setShowPolicyModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <form onSubmit={handleSavePolicy} className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Policy Name</label>
                  <input
                    type="text"
                    value={policyFormData.name}
                    onChange={(e) => setPolicyFormData(prev => ({ ...prev, name: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    placeholder="e.g., Annual Leave, Sick Leave, etc."
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                  <textarea
                    value={policyFormData.description}
                    onChange={(e) => setPolicyFormData(prev => ({ ...prev, description: e.target.value }))}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    placeholder="Describe this leave policy and its purpose"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Days Allowed Per Year</label>
                  <input
                    type="number"
                    value={policyFormData.daysAllowed}
                    onChange={(e) => setPolicyFormData(prev => ({ ...prev, daysAllowed: parseInt(e.target.value) || 0 }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    min="0"
                    required
                  />
                </div>

                <div className="flex items-center space-x-6">
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="carryOver"
                      checked={policyFormData.carryOver}
                      onChange={(e) => setPolicyFormData(prev => ({ ...prev, carryOver: e.target.checked }))}
                      className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                    />
                    <label htmlFor="carryOver" className="ml-2 text-sm text-gray-700">
                      Allow carry over to next year
                    </label>
                  </div>

                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="requiresApproval"
                      checked={policyFormData.requiresApproval}
                      onChange={(e) => setPolicyFormData(prev => ({ ...prev, requiresApproval: e.target.checked }))}
                      className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                    />
                    <label htmlFor="requiresApproval" className="ml-2 text-sm text-gray-700">
                      Requires approval
                    </label>
                  </div>
                </div>

                <div className="flex justify-end space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowPolicyModal(false)}
                    className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400"
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

        {/* Enhanced Workflow Customization Modal */}
        {showWorkflowModal && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
            <div className="relative top-10 mx-auto p-6 border w-11/12 max-w-6xl shadow-lg rounded-xl bg-white max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h2 className="text-3xl font-bold text-gray-900">Advanced Workflow Configuration</h2>
                  <p className="text-gray-600 mt-1">Configure approval workflows, reporting structure, and company rules</p>
                </div>
                <button
                  onClick={() => setShowWorkflowModal(false)}
                  className="text-gray-400 hover:text-gray-600 p-2"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="space-y-8">
                {/* Workflow Rules Section */}
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-6">
                  <h3 className="text-2xl font-bold text-blue-900 mb-4 flex items-center">
                    <svg className="w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                    </svg>
                    Company Workflow Rules
                  </h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <div className="bg-white p-4 rounded-lg border border-blue-100">
                      <label className="block text-sm font-medium text-gray-700 mb-2">Auto-Approve Threshold (days)</label>
                      <input
                        type="number"
                        value={workflowRules.autoApproveThreshold}
                        onChange={(e) => updateWorkflowRule('autoApproveThreshold', parseInt(e.target.value))}
                        min="0"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                      <p className="text-xs text-gray-500 mt-1">Auto-approve requests ≤ this many days</p>
                    </div>

                    <div className="bg-white p-4 rounded-lg border border-blue-100">
                      <label className="block text-sm font-medium text-gray-700 mb-2">Documentation Required (days)</label>
                      <input
                        type="number"
                        value={workflowRules.requireDocumentation}
                        onChange={(e) => updateWorkflowRule('requireDocumentation', parseInt(e.target.value))}
                        min="1"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                      <p className="text-xs text-gray-500 mt-1">Require documents for requests ≥ this many days</p>
                    </div>

                    <div className="bg-white p-4 rounded-lg border border-blue-100 space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-gray-700">Weekend Approvals</span>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            checked={workflowRules.weekendApprovals}
                            onChange={(e) => updateWorkflowRule('weekendApprovals', e.target.checked)}
                            className="sr-only peer"
                          />
                          <div className="w-11 h-6 bg-gray-200 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                        </label>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-gray-700">Emergency Bypass</span>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            checked={workflowRules.emergencyBypass}
                            onChange={(e) => updateWorkflowRule('emergencyBypass', e.target.checked)}
                            className="sr-only peer"
                          />
                          <div className="w-11 h-6 bg-gray-200 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                        </label>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-gray-700">Auto-Escalation</span>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            checked={workflowRules.escalationEnabled}
                            onChange={(e) => updateWorkflowRule('escalationEnabled', e.target.checked)}
                            className="sr-only peer"
                          />
                          <div className="w-11 h-6 bg-gray-200 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                        </label>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Reporting Structure Section */}
                <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-xl p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-2xl font-bold text-green-900 flex items-center">
                      <svg className="w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                      </svg>
                      Company Reporting Structure
                    </h3>
                    <button
                      onClick={addReportingLevel}
                      className="bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-green-700 transition-colors duration-200 flex items-center space-x-2"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                      </svg>
                      <span>Add Level</span>
                    </button>
                  </div>
                  
                  <div className="space-y-4">
                    {reportingStructure.map((level, index) => (
                      <div key={level.level} className="bg-white border border-green-100 rounded-lg p-4">
                        <div className="flex items-center space-x-4">
                          <div className="w-8 h-8 bg-green-100 text-green-800 rounded-full flex items-center justify-center font-bold text-sm">
                            {level.level}
                          </div>
                          
                          <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                              <label className="block text-xs font-medium text-gray-600 mb-1">Position Title</label>
                              <input
                                type="text"
                                value={level.title}
                                onChange={(e) => updateReportingLevel(level.level, 'title', e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                              />
                            </div>
                            
                            <div>
                              <label className="block text-xs font-medium text-gray-600 mb-1">Approval Limit (days)</label>
                              <input
                                type="number"
                                value={level.approvalLimit}
                                onChange={(e) => updateReportingLevel(level.level, 'approvalLimit', parseInt(e.target.value))}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                              />
                            </div>
                            
                            <div className="flex items-center space-x-4">
                              <div className="flex items-center">
                                <input
                                  type="checkbox"
                                  id={`skip-${level.level}`}
                                  checked={level.canSkip}
                                  onChange={(e) => updateReportingLevel(level.level, 'canSkip', e.target.checked)}
                                  className="w-4 h-4 text-green-600 border-gray-300 rounded focus:ring-green-500"
                                />
                                <label htmlFor={`skip-${level.level}`} className="ml-2 text-xs text-gray-700">
                                  Can Skip Level
                                </label>
                              </div>
                              
                              {reportingStructure.length > 1 && (
                                <button
                                  onClick={() => removeReportingLevel(level.level)}
                                  className="text-red-600 hover:text-red-800 p-1"
                                >
                                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                  </svg>
                                </button>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Approval Steps Section */}
                <div className="bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-200 rounded-xl p-6">
                  <h3 className="text-2xl font-bold text-purple-900 mb-4 flex items-center">
                    <svg className="w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                    </svg>
                    Approval Workflow Steps
                  </h3>

                  <div className="space-y-4">
                    {workflowSteps.map((step, index) => (
                      <div key={step.id} className={`border-2 rounded-xl p-6 transition-all duration-200 ${
                        step.enabled ? 'border-purple-200 bg-white' : 'border-gray-200 bg-gray-50'
                      }`}>
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex items-center space-x-4">
                            <div className={`w-12 h-12 rounded-full flex items-center justify-center text-lg font-bold shadow-md ${
                              step.enabled 
                                ? 'bg-gradient-to-br from-purple-500 to-pink-600 text-white'
                                : 'bg-gray-300 text-gray-500'
                            }`}>
                              {index + 1}
                            </div>
                            <div className="flex-1">
                              <h4 className="text-xl font-bold text-gray-900 mb-2">{step.name}</h4>
                              <p className="text-gray-700 mb-2">{step.description}</p>
                            </div>
                          </div>
                          
                          <div className="flex items-center space-x-3">
                            <span className={`px-3 py-1 text-xs font-semibold rounded-full ${
                              step.enabled ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'
                            }`}>
                              {step.enabled ? 'ENABLED' : 'DISABLED'}
                            </span>
                            <label className="relative inline-flex items-center cursor-pointer">
                              <input
                                type="checkbox"
                                checked={step.enabled}
                                onChange={() => toggleWorkflowStep(step.id)}
                                className="sr-only peer"
                              />
                              <div className="w-14 h-7 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-purple-600 shadow-lg"></div>
                            </label>
                          </div>
                        </div>
                        
                        {step.enabled && (
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t border-purple-100">
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-2">Condition</label>
                              <input
                                type="text"
                                value={step.condition}
                                onChange={(e) => setWorkflowSteps(prev => prev.map(s => 
                                  s.id === step.id ? { ...s, condition: e.target.value } : s
                                ))}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-2">Average Time</label>
                              <input
                                type="text"
                                value={step.averageTime}
                                onChange={(e) => setWorkflowSteps(prev => prev.map(s => 
                                  s.id === step.id ? { ...s, averageTime: e.target.value } : s
                                ))}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-2">Escalation Time</label>
                              <input
                                type="text"
                                value={step.escalationTime}
                                onChange={(e) => setWorkflowSteps(prev => prev.map(s => 
                                  s.id === step.id ? { ...s, escalationTime: e.target.value } : s
                                ))}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                              />
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
                  <button
                    onClick={() => setShowWorkflowModal(false)}
                    className="px-8 py-3 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors duration-200 font-medium"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSaveWorkflow}
                    className="px-8 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors duration-200 font-medium flex items-center space-x-2"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span>Save Configuration</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Department Modal */}
        {showDepartmentModal && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
            <div className="relative top-20 mx-auto p-5 border w-11/12 max-w-md shadow-lg rounded-xl bg-white">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-900">Add New Department</h2>
                <button
                  onClick={() => setShowDepartmentModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <form onSubmit={handleSaveDepartment} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Department Name</label>
                  <input
                    type="text"
                    value={departmentFormData.name}
                    onChange={(e) => setDepartmentFormData(prev => ({ ...prev, name: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="e.g., Engineering, Marketing"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Manager Name</label>
                  <input
                    type="text"
                    value={departmentFormData.manager}
                    onChange={(e) => setDepartmentFormData(prev => ({ ...prev, manager: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="e.g., John Smith"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Number of Employees</label>
                  <input
                    type="number"
                    value={departmentFormData.employeeCount}
                    onChange={(e) => setDepartmentFormData(prev => ({ ...prev, employeeCount: parseInt(e.target.value) || 0 }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    min="0"
                    required
                  />
                </div>

                <div>
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="isMultiBranch"
                      checked={departmentFormData.isMultiBranch}
                      onChange={(e) => setDepartmentFormData(prev => ({ ...prev, isMultiBranch: e.target.checked, branches: e.target.checked ? prev.branches : [] }))}
                      className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <label htmlFor="isMultiBranch" className="ml-2 text-sm text-gray-700">
                      Department operates across multiple branches
                    </label>
                  </div>
                </div>

                {departmentFormData.isMultiBranch && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Select Branches</label>
                    <div className="space-y-2 max-h-32 overflow-y-auto border border-gray-300 rounded-md p-2">
                      {branches.map(branch => (
                        <div key={branch.id} className="flex items-center">
                          <input
                            type="checkbox"
                            id={`branch-${branch.id}`}
                            checked={departmentFormData.branches.includes(branch.id)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setDepartmentFormData(prev => ({ ...prev, branches: [...prev.branches, branch.id] }))
                              } else {
                                setDepartmentFormData(prev => ({ ...prev, branches: prev.branches.filter(id => id !== branch.id) }))
                              }
                            }}
                            className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                          />
                          <label htmlFor={`branch-${branch.id}`} className="ml-2 text-sm text-gray-700">
                            {branch.name} - {branch.location}
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="flex justify-end space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowDepartmentModal(false)}
                    className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
                  >
                    Add Department
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Branch Modal */}
        {showBranchModal && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
            <div className="relative top-20 mx-auto p-5 border w-11/12 max-w-md shadow-lg rounded-xl bg-white">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-900">Add New Branch</h2>
                <button
                  onClick={() => setShowBranchModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <form onSubmit={handleSaveBranch} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Branch Name</label>
                  <input
                    type="text"
                    value={branchFormData.name}
                    onChange={(e) => setBranchFormData(prev => ({ ...prev, name: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                    placeholder="e.g., Head Office, Johannesburg Branch"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Location</label>
                  <input
                    type="text"
                    value={branchFormData.location}
                    onChange={(e) => setBranchFormData(prev => ({ ...prev, location: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                    placeholder="e.g., Cape Town, Western Cape"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Number of Employees</label>
                  <input
                    type="number"
                    value={branchFormData.employees}
                    onChange={(e) => setBranchFormData(prev => ({ ...prev, employees: parseInt(e.target.value) || 0 }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                    min="0"
                    required
                  />
                </div>

                <div>
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="isMultiDepartment"
                      checked={branchFormData.isMultiDepartment}
                      onChange={(e) => setBranchFormData(prev => ({ ...prev, isMultiDepartment: e.target.checked, departments: e.target.checked ? prev.departments : [] }))}
                      className="h-4 w-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
                    />
                    <label htmlFor="isMultiDepartment" className="ml-2 text-sm text-gray-700">
                      Branch houses multiple departments
                    </label>
                  </div>
                </div>

                {branchFormData.isMultiDepartment && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Select Departments</label>
                    <div className="space-y-2 max-h-32 overflow-y-auto border border-gray-300 rounded-md p-2">
                      {departments.map(department => (
                        <div key={department.id} className="flex items-center">
                          <input
                            type="checkbox"
                            id={`department-${department.id}`}
                            checked={branchFormData.departments.includes(department.id)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setBranchFormData(prev => ({ ...prev, departments: [...prev.departments, department.id] }))
                              } else {
                                setBranchFormData(prev => ({ ...prev, departments: prev.departments.filter(id => id !== department.id) }))
                              }
                            }}
                            className="h-4 w-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
                          />
                          <label htmlFor={`department-${department.id}`} className="ml-2 text-sm text-gray-700">
                            {department.name} (Manager: {department.manager})
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="flex justify-end space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowBranchModal(false)}
                    className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700"
                  >
                    Add Branch
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </AppShell>
  )
}