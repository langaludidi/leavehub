import React, { useState } from 'react'
import { AppShell } from '../layout/AppShell'

interface Employee {
  id: string
  employeeNumber: string
  firstName: string
  lastName: string
  email: string
  contactNumber: string
  department: string
  branch: string
  position: string
  status: 'active' | 'inactive' | 'on-leave'
  startDate: string
  manager: string
  leaveBalance: number
}

const mockEmployees: Employee[] = [
  {
    id: '1',
    employeeNumber: 'EMP001',
    firstName: 'John',
    lastName: 'Smith',
    email: 'john.smith@company.com',
    contactNumber: '+27 82 123 4567',
    department: 'Engineering',
    branch: 'Head Office',
    position: 'Senior Developer',
    status: 'active',
    startDate: '2022-01-15',
    manager: 'Sarah Johnson',
    leaveBalance: 18.5
  },
  {
    id: '2',
    employeeNumber: 'EMP002',
    firstName: 'Mary',
    lastName: 'Davis',
    email: 'mary.davis@company.com',
    contactNumber: '+27 83 987 6543',
    department: 'Marketing',
    branch: 'Head Office',
    position: 'Marketing Manager',
    status: 'on-leave',
    startDate: '2021-06-10',
    manager: 'Michael Brown',
    leaveBalance: 5.5
  },
  {
    id: '3',
    employeeNumber: 'EMP003',
    firstName: 'David',
    lastName: 'Wilson',
    email: 'david.wilson@company.com',
    contactNumber: '+27 84 555 1234',
    department: 'Sales',
    branch: 'Johannesburg Branch',
    position: 'Sales Representative',
    status: 'active',
    startDate: '2023-03-20',
    manager: 'Lisa Anderson',
    leaveBalance: 22
  }
]

export function EmployeeManagement({ userRole = 'admin' }: { userRole?: 'admin' | 'superadmin' }) {
  const [employees, setEmployees] = useState<Employee[]>(mockEmployees)
  const [searchTerm, setSearchTerm] = useState('')
  const [departmentFilter, setDepartmentFilter] = useState('all')
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null)
  const [showAddForm, setShowAddForm] = useState(false)
  const [showEditForm, setShowEditForm] = useState(false)
  const [showEmployeeDetail, setShowEmployeeDetail] = useState(false)
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null)

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800'
      case 'inactive': return 'bg-gray-100 text-gray-800'
      case 'on-leave': return 'bg-yellow-100 text-yellow-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const filteredEmployees = employees.filter(emp => {
    const matchesSearch = `${emp.firstName} ${emp.lastName} ${emp.email}`.toLowerCase()
      .includes(searchTerm.toLowerCase())
    const matchesDepartment = departmentFilter === 'all' || emp.department === departmentFilter
    return matchesSearch && matchesDepartment
  })

  const departments = [...new Set(employees.map(emp => emp.department))]

  return (
    <AppShell userRole={userRole}>
      <div className="space-y-8 p-6">
        <div className="flex flex-col space-y-4 lg:flex-row lg:items-center lg:justify-between lg:space-y-0">
          <div>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl heading-premium text-gray-900 font-bold">Employee Management</h1>
            <p className="text-sm sm:text-base lg:text-lg text-premium text-gray-600 mt-1 sm:mt-2">Manage employees, departments, and organizational structure</p>
          </div>
        </div>

        {/* Action Controls Card */}
        <div className="card-premium shadow-lg p-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
            <div className="flex items-center space-x-3">
              <svg className="w-6 h-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Employee Actions</h3>
                <p className="text-sm text-gray-600">Export data or add new employees</p>
              </div>
            </div>
            <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-3">
              <button 
                onClick={() => handleExportEmployees('csv')}
                className="btn-premium bg-green-600 text-white px-4 py-3 rounded-xl hover:bg-green-700 shadow-lg flex items-center justify-center space-x-2 transform hover:scale-105 transition-all duration-200 text-sm font-medium"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3M3 17V7a2 2 0 012-2h6l2 2h6a2 2 0 012 2v10a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
                </svg>
                <span>Export CSV</span>
              </button>
              <button 
                onClick={() => handleExportEmployees('pdf')}
                className="btn-premium bg-red-600 text-white px-4 py-3 rounded-xl hover:bg-red-700 shadow-lg flex items-center justify-center space-x-2 transform hover:scale-105 transition-all duration-200 text-sm font-medium"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                </svg>
                <span>Export PDF</span>
              </button>
              <button 
                onClick={() => setShowAddForm(true)}
                className="btn-premium bg-indigo-600 text-white px-4 py-3 rounded-xl hover:bg-indigo-700 shadow-lg flex items-center justify-center space-x-2 transform hover:scale-105 transition-all duration-200 text-sm font-medium"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                <span>Add Employee</span>
              </button>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          <div className="card-premium shadow-lg p-6">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-blue-500 rounded-xl flex items-center justify-center">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <div>
                <div className="text-2xl heading-premium text-gray-900">{employees.length}</div>
                <div className="text-premium text-gray-600">Total Employees</div>
              </div>
            </div>
          </div>

          <div className="card-premium shadow-lg p-6">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-green-500 rounded-xl flex items-center justify-center">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <div className="text-2xl heading-premium text-gray-900">
                  {employees.filter(emp => emp.status === 'active').length}
                </div>
                <div className="text-premium text-gray-600">Active</div>
              </div>
            </div>
          </div>

          <div className="card-premium shadow-lg p-6">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-yellow-500 rounded-xl flex items-center justify-center">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <div className="text-2xl heading-premium text-gray-900">
                  {employees.filter(emp => emp.status === 'on-leave').length}
                </div>
                <div className="text-premium text-gray-600">On Leave</div>
              </div>
            </div>
          </div>

          <div className="card-premium shadow-lg p-6">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-indigo-500 rounded-xl flex items-center justify-center">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
              </div>
              <div>
                <div className="text-2xl heading-premium text-gray-900">{departments.length}</div>
                <div className="text-premium text-gray-600">Departments</div>
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="card-premium shadow-xl p-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <input
                type="text"
                placeholder="Search employees..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>
            <div className="sm:w-48">
              <select
                value={departmentFilter}
                onChange={(e) => setDepartmentFilter(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              >
                <option value="all">All Departments</option>
                {departments.map(dept => (
                  <option key={dept} value={dept}>{dept}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Employee List */}
        <div className="card-premium shadow-xl">
          <div className="px-8 py-6 border-b border-gray-100">
            <h2 className="text-xl heading-premium text-gray-900">Employee Directory</h2>
            <p className="text-premium text-gray-600 text-sm mt-1">
              Showing {filteredEmployees.length} of {employees.length} employees
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6">
            {filteredEmployees.map(employee => (
              <div key={employee.id} className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6 hover:shadow-xl transition-all duration-300 transform hover:scale-[1.02]">
                {/* Employee Header */}
                <div className="flex items-center space-x-4 mb-6">
                  <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center flex-shrink-0">
                    <span className="text-white font-bold text-lg">
                      {employee.firstName[0]}{employee.lastName[0]}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-xl font-bold text-gray-900 truncate">
                      {employee.firstName} {employee.lastName}
                    </h3>
                    <p className="text-sm text-gray-600 mb-1">{employee.position}</p>
                    <div className="flex items-center">
                      <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(employee.status)}`}>
                        {employee.status}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Employee Details */}
                <div className="space-y-4 mb-6">
                  <div className="grid grid-cols-1 gap-3">
                    <div className="bg-gray-50 rounded-xl p-3">
                      <div className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">Email</div>
                      <div className="text-sm text-gray-900 truncate">{employee.email}</div>
                    </div>
                    <div className="bg-gray-50 rounded-xl p-3">
                      <div className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">Contact</div>
                      <div className="text-sm text-gray-900">{employee.contactNumber}</div>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="bg-gray-50 rounded-xl p-3">
                        <div className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">Department</div>
                        <div className="text-sm text-gray-900 truncate">{employee.department}</div>
                      </div>
                      <div className="bg-gray-50 rounded-xl p-3">
                        <div className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">Branch</div>
                        <div className="text-sm text-gray-900 truncate">{employee.branch}</div>
                      </div>
                    </div>
                    <div className="bg-gray-50 rounded-xl p-3">
                      <div className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">Leave Balance</div>
                      <div className="text-sm font-semibold text-gray-900">{employee.leaveBalance} days</div>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                  <button 
                    onClick={() => handleViewEmployee(employee)}
                    className="flex items-center space-x-2 bg-indigo-100 text-indigo-700 hover:bg-indigo-200 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 transform hover:scale-105"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                    <span>View</span>
                  </button>
                  <div className="flex items-center space-x-2">
                    <button 
                      onClick={() => handleEditEmployee(employee)}
                      className="bg-green-100 text-green-700 hover:bg-green-200 p-2 rounded-xl transition-all duration-200 transform hover:scale-105"
                      title="Edit Employee"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                    </button>
                    <button 
                      onClick={() => handleRemoveEmployee(employee)}
                      className="bg-red-100 text-red-700 hover:bg-red-200 p-2 rounded-xl transition-all duration-200 transform hover:scale-105"
                      title="Remove Employee"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Employee Detail Modal */}
        {showEmployeeDetail && selectedEmployee && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-8">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl heading-premium text-gray-900 font-bold">
                    {selectedEmployee.firstName} {selectedEmployee.lastName}
                  </h2>
                  <button 
                    onClick={() => setShowEmployeeDetail(false)}
                    className="text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  <div className="card-premium p-6">
                    <h3 className="text-lg font-bold text-gray-900 mb-4">Employee Information</h3>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Name:</span>
                        <span className="font-semibold">{selectedEmployee.firstName} {selectedEmployee.lastName}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Email:</span>
                        <span className="font-semibold">{selectedEmployee.email}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Department:</span>
                        <span className="font-semibold">{selectedEmployee.department}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Position:</span>
                        <span className="font-semibold">{selectedEmployee.position}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Manager:</span>
                        <span className="font-semibold">{selectedEmployee.manager}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Start Date:</span>
                        <span className="font-semibold">{new Date(selectedEmployee.startDate).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="card-premium p-6">
                    <h3 className="text-lg font-bold text-gray-900 mb-4">Leave Information</h3>
                    <div className="space-y-4">
                      <div>
                        <div className="flex justify-between mb-2">
                          <span className="text-gray-600">Leave Balance:</span>
                          <span className="font-semibold text-2xl text-green-600">{selectedEmployee.leaveBalance} days</span>
                        </div>
                      </div>
                      <div>
                        <div className="flex justify-between mb-2">
                          <span className="text-gray-600">Status:</span>
                          <span className={`px-3 py-1 text-sm font-semibold rounded-full ${getStatusColor(selectedEmployee.status)}`}>
                            {selectedEmployee.status}
                          </span>
                        </div>
                      </div>
                      <div className="pt-4">
                        <h4 className="font-semibold text-gray-900 mb-2">Recent Leave History</h4>
                        <div className="text-sm text-gray-600">
                          <div className="flex justify-between py-1">
                            <span>Annual Leave:</span>
                            <span>Dec 20-24, 2024</span>
                          </div>
                          <div className="flex justify-between py-1">
                            <span>Sick Leave:</span>
                            <span>Nov 15, 2024</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="flex justify-end space-x-4">
                  <button 
                    onClick={() => setShowEmployeeDetail(false)}
                    className="px-6 py-3 border border-gray-300 rounded-xl text-gray-700 hover:bg-gray-50 transition-all duration-200"
                  >
                    Close
                  </button>
                  <button 
                    onClick={() => handleEditEmployee(selectedEmployee)}
                    className="px-6 py-3 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-all duration-200 transform hover:scale-105"
                  >
                    Edit Employee
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Add Employee Modal */}
        {showAddForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-3xl p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-2xl heading-premium text-gray-900 font-bold">Add New Employee</h3>
                <button 
                  onClick={() => setShowAddForm(false)}
                  className="text-gray-400 hover:text-gray-600 transition-colors p-2 hover:bg-gray-100 rounded-xl"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <form className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Employee Number</label>
                    <input type="text" placeholder="EMP004" className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent" />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">First Name</label>
                    <input type="text" placeholder="John" className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent" />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Last Name</label>
                    <input type="text" placeholder="Smith" className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent" />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Email</label>
                    <input type="email" placeholder="john.smith@company.com" className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent" />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Contact Number</label>
                    <input type="tel" placeholder="+27 82 123 4567" className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent" />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Department</label>
                    <select className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent">
                      <option value="Engineering">Engineering</option>
                      <option value="Marketing">Marketing</option>
                      <option value="Sales">Sales</option>
                      <option value="HR">Human Resources</option>
                      <option value="Finance">Finance</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Branch</label>
                    <select className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent">
                      <option value="Head Office">Head Office</option>
                      <option value="Johannesburg Branch">Johannesburg Branch</option>
                      <option value="Durban Office">Durban Office</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Position</label>
                    <input type="text" placeholder="Software Developer" className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent" />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Manager</label>
                    <input type="text" placeholder="Sarah Johnson" className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent" />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Start Date</label>
                    <input type="date" className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent" />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Leave Balance (Days)</label>
                    <input type="number" placeholder="25" className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent" />
                  </div>
                </div>

                <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
                  <button 
                    type="button"
                    onClick={() => setShowAddForm(false)}
                    className="px-6 py-3 text-gray-700 bg-gray-100 rounded-xl hover:bg-gray-200 transition-all duration-200"
                  >
                    Cancel
                  </button>
                  <button 
                    type="button"
                    onClick={() => {
                      // Create new employee (for demo purposes)
                      const newEmployee: Employee = {
                        id: (employees.length + 1).toString(),
                        employeeNumber: `EMP${String(employees.length + 1).padStart(3, '0')}`,
                        firstName: 'New',
                        lastName: 'Employee',
                        email: 'new.employee@company.com',
                        contactNumber: '+27 82 000 0000',
                        department: 'Engineering',
                        branch: 'Head Office',
                        position: 'Software Developer',
                        status: 'active',
                        startDate: new Date().toISOString().split('T')[0],
                        manager: 'TBD',
                        leaveBalance: 25
                      }
                      setEmployees([...employees, newEmployee])
                      setShowAddForm(false)
                      alert('✅ New employee added successfully!')
                    }}
                    className="px-6 py-3 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-all duration-200 transform hover:scale-105"
                  >
                    Add Employee
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Edit Employee Modal */}
        {showEditForm && editingEmployee && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-3xl p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-2xl heading-premium text-gray-900 font-bold">Edit Employee</h3>
                <button 
                  onClick={() => setShowEditForm(false)}
                  className="text-gray-400 hover:text-gray-600 transition-colors p-2 hover:bg-gray-100 rounded-xl"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <form className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Employee Number</label>
                    <input type="text" defaultValue={editingEmployee.employeeNumber} className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent" />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">First Name</label>
                    <input type="text" defaultValue={editingEmployee.firstName} className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent" />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Last Name</label>
                    <input type="text" defaultValue={editingEmployee.lastName} className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent" />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Email</label>
                    <input type="email" defaultValue={editingEmployee.email} className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent" />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Contact Number</label>
                    <input type="tel" defaultValue={editingEmployee.contactNumber} className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent" />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Department</label>
                    <select defaultValue={editingEmployee.department} className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent">
                      <option value="Engineering">Engineering</option>
                      <option value="Marketing">Marketing</option>
                      <option value="Sales">Sales</option>
                      <option value="HR">Human Resources</option>
                      <option value="Finance">Finance</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Branch</label>
                    <select defaultValue={editingEmployee.branch} className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent">
                      <option value="Head Office">Head Office</option>
                      <option value="Johannesburg Branch">Johannesburg Branch</option>
                      <option value="Durban Office">Durban Office</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Position</label>
                    <input type="text" defaultValue={editingEmployee.position} className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent" />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Manager</label>
                    <input type="text" defaultValue={editingEmployee.manager} className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent" />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Status</label>
                    <select defaultValue={editingEmployee.status} className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent">
                      <option value="active">Active</option>
                      <option value="inactive">Inactive</option>
                      <option value="on-leave">On Leave</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Leave Balance (Days)</label>
                    <input type="number" defaultValue={editingEmployee.leaveBalance} className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent" />
                  </div>
                </div>

                <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
                  <button 
                    type="button"
                    onClick={() => setShowEditForm(false)}
                    className="px-6 py-3 text-gray-700 bg-gray-100 rounded-xl hover:bg-gray-200 transition-all duration-200"
                  >
                    Cancel
                  </button>
                  <button 
                    type="button"
                    onClick={() => {
                      // Update employee (for demo purposes)
                      setEmployees(employees.map(emp => 
                        emp.id === editingEmployee.id 
                          ? { ...emp, firstName: editingEmployee.firstName + ' (Updated)' }
                          : emp
                      ))
                      setShowEditForm(false)
                      alert('✅ Employee updated successfully!')
                    }}
                    className="px-6 py-3 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-all duration-200 transform hover:scale-105"
                  >
                    Save Changes
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </AppShell>
  )
  
  // Helper functions
  function handleViewEmployee(employee: Employee) {
    setSelectedEmployee(employee)
    setShowEmployeeDetail(true)
  }
  
  function handleEditEmployee(employee: Employee) {
    setEditingEmployee(employee)
    setShowEditForm(true)
  }
  
  function handleRemoveEmployee(employee: Employee) {
    const confirmed = confirm(`⚠️ Are you sure you want to remove ${employee.firstName} ${employee.lastName} from the system?\\n\\nThis action cannot be undone.`)
    if (confirmed) {
      alert(`✅ ${employee.firstName} ${employee.lastName} has been removed from the system.`)
    }
  }
  
  function handleExportEmployees(format: 'csv' | 'pdf') {
    const data = filteredEmployees.map(emp => ({
      'Employee Number': emp.employeeNumber,
      'First Name': emp.firstName,
      'Last Name': emp.lastName,
      'Email': emp.email,
      'Contact Number': emp.contactNumber,
      'Department': emp.department,
      'Branch': emp.branch,
      'Position': emp.position,
      'Status': emp.status,
      'Start Date': emp.startDate,
      'Manager': emp.manager,
      'Leave Balance': emp.leaveBalance
    }))
    
    if (format === 'csv') {
      const headers = Object.keys(data[0] || {})
      const csvContent = [
        headers.join(','),
        ...data.map(row => headers.map(header => {
          const value = row[header as keyof typeof row]
          // Escape values that contain commas or quotes
          return typeof value === 'string' && (value.includes(',') || value.includes('"')) 
            ? `"${value.replace(/"/g, '""')}"` 
            : value
        }).join(','))
      ].join('\n')
      
      const blob = new Blob([csvContent], { type: 'text/csv' })
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `employees-${new Date().toISOString().split('T')[0]}.csv`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)
      
      alert(`✅ Successfully exported ${data.length} employees to CSV!`)
    } else if (format === 'pdf') {
      // Create a structured text report for PDF-like output
      let pdfContent = 'LEAVEHUB - EMPLOYEE REPORT\n'
      pdfContent += '===============================\n\n'
      pdfContent += `Generated: ${new Date().toLocaleString()}\n`
      pdfContent += `Total Employees: ${data.length}\n\n`
      
      data.forEach((emp, index) => {
        pdfContent += `${index + 1}. ${emp['First Name']} ${emp['Last Name']} (${emp['Employee Number']})\n`
        pdfContent += `   Employee Number: ${emp['Employee Number']}\n`
        pdfContent += `   Email: ${emp['Email']}\n`
        pdfContent += `   Department: ${emp['Department']}\n`
        pdfContent += `   Position: ${emp['Position']}\n`
        pdfContent += `   Status: ${emp['Status']}\n`
        pdfContent += `   Start Date: ${emp['Start Date']}\n`
        pdfContent += `   Manager: ${emp['Manager']}\n`
        pdfContent += `   Leave Balance: ${emp['Leave Balance']} days\n`
        pdfContent += `   ${'─'.repeat(50)}\n\n`
      })
      
      pdfContent += '\n' + '='.repeat(60) + '\n'
      pdfContent += 'LeaveHub\n'
      pdfContent += 'Leave Management System\n'
      pdfContent += 'www.leavehub.co.za\n'
      pdfContent += '='.repeat(60) + '\n'
      
      const blob = new Blob([pdfContent], { type: 'text/plain' })
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `employees-report-${new Date().toISOString().split('T')[0]}.txt`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)
      
      alert(`✅ Successfully exported ${data.length} employees to text report!`)
    }
  }
}