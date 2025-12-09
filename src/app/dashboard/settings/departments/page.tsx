'use client';

import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Users,
  Plus,
  Edit2,
  Trash2,
  X,
  Building2,
  User,
  Mail,
  AlertCircle,
} from 'lucide-react';
import DashboardHeader from '@/components/DashboardHeader';

interface Manager {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
}

interface Department {
  id: string;
  company_id: string;
  name: string;
  description: string | null;
  manager_id: string | null;
  manager?: Manager | null;
  created_at?: string;
  updated_at?: string;
}

export default function DepartmentsPage() {
  const userId = 'demo-user-123';
  const companyId = '12345678-1234-1234-1234-123456789012'; // Demo company ID

  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingDepartment, setEditingDepartment] = useState<Department | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    managerId: '',
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchDepartments();
  }, [companyId]);

  async function fetchDepartments() {
    setLoading(true);
    try {
      const response = await fetch(`/api/settings/departments?companyId=${companyId}`);
      const data = await response.json();

      if (data.departments) {
        setDepartments(data.departments);
      }
    } catch (error) {
      console.error('Error fetching departments:', error);
    } finally {
      setLoading(false);
    }
  }

  async function saveDepartment() {
    setSaving(true);
    try {
      if (editingDepartment) {
        // Update existing department
        const response = await fetch('/api/settings/departments', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            departmentId: editingDepartment.id,
            name: formData.name,
            description: formData.description,
            managerId: formData.managerId || null,
          }),
        });

        if (response.ok) {
          await fetchDepartments();
          closeModal();
        }
      } else {
        // Create new department
        const response = await fetch('/api/settings/departments', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            companyId,
            name: formData.name,
            description: formData.description,
            managerId: formData.managerId || null,
          }),
        });

        if (response.ok) {
          await fetchDepartments();
          closeModal();
        }
      }
    } catch (error) {
      console.error('Error saving department:', error);
    } finally {
      setSaving(false);
    }
  }

  async function deleteDepartment(departmentId: string) {
    if (!confirm('Are you sure you want to delete this department? Employees in this department will need to be reassigned.')) {
      return;
    }

    try {
      const response = await fetch(
        `/api/settings/departments?departmentId=${departmentId}`,
        { method: 'DELETE' }
      );

      if (response.ok) {
        await fetchDepartments();
      }
    } catch (error) {
      console.error('Error deleting department:', error);
    }
  }

  function openAddModal() {
    setFormData({ name: '', description: '', managerId: '' });
    setEditingDepartment(null);
    setShowAddModal(true);
  }

  function openEditModal(department: Department) {
    setFormData({
      name: department.name,
      description: department.description || '',
      managerId: department.manager_id || '',
    });
    setEditingDepartment(department);
    setShowAddModal(true);
  }

  function closeModal() {
    setShowAddModal(false);
    setEditingDepartment(null);
    setFormData({ name: '', description: '', managerId: '' });
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <DashboardHeader userId={userId} userName="Demo User" />
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-center py-12">
            <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
            <p className="ml-3 text-gray-600">Loading departments...</p>
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
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Departments
            </h1>
            <p className="text-gray-600">
              Manage company departments and assign managers
            </p>
          </div>
          <Button onClick={openAddModal}>
            <Plus className="w-4 h-4 mr-2" />
            Add Department
          </Button>
        </div>

        {/* Info Card */}
        <Card className="p-4 mb-6 bg-blue-50 border-blue-200">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5" />
            <div>
              <h3 className="font-semibold text-blue-900 mb-1">
                Department Organization
              </h3>
              <p className="text-sm text-blue-800">
                Departments help organize your company structure. You can assign managers to departments
                and group employees by department for better leave management and reporting.
              </p>
            </div>
          </div>
        </Card>

        {/* Stats */}
        <div className="grid md:grid-cols-3 gap-6 mb-6">
          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                <Building2 className="w-6 h-6 text-primary" />
              </div>
              <span className="text-2xl font-bold text-primary">
                {departments.length}
              </span>
            </div>
            <h3 className="font-semibold mb-1">Total Departments</h3>
            <p className="text-sm text-gray-600">Active departments</p>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <User className="w-6 h-6 text-green-600" />
              </div>
              <span className="text-2xl font-bold text-green-600">
                {departments.filter(d => d.manager_id).length}
              </span>
            </div>
            <h3 className="font-semibold mb-1">With Managers</h3>
            <p className="text-sm text-gray-600">Departments assigned</p>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                <AlertCircle className="w-6 h-6 text-orange-600" />
              </div>
              <span className="text-2xl font-bold text-orange-600">
                {departments.filter(d => !d.manager_id).length}
              </span>
            </div>
            <h3 className="font-semibold mb-1">Unassigned</h3>
            <p className="text-sm text-gray-600">No manager assigned</p>
          </Card>
        </div>

        {/* Departments List */}
        {departments.length === 0 ? (
          <Card className="p-12 text-center">
            <Building2 className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              No departments found
            </h3>
            <p className="text-gray-600 mb-4">
              Create departments to organize your company structure
            </p>
            <Button onClick={openAddModal}>
              <Plus className="w-4 h-4 mr-2" />
              Add First Department
            </Button>
          </Card>
        ) : (
          <div className="grid md:grid-cols-2 gap-6">
            {departments.map((department) => (
              <Card key={department.id} className="p-6 hover:shadow-lg transition-shadow">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-start gap-3">
                    <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Building2 className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-1">
                        {department.name}
                      </h3>
                      {department.description && (
                        <p className="text-sm text-gray-600">
                          {department.description}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => openEditModal(department)}
                    >
                      <Edit2 className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => deleteDepartment(department.id)}
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>

                {/* Manager Info */}
                <div className="border-t pt-4 mt-4">
                  <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
                    <User className="w-4 h-4" />
                    <span className="font-medium">Manager</span>
                  </div>
                  {department.manager ? (
                    <div className="ml-6">
                      <p className="font-medium text-gray-900">
                        {department.manager.first_name} {department.manager.last_name}
                      </p>
                      <div className="flex items-center gap-2 text-sm text-gray-600 mt-1">
                        <Mail className="w-3 h-3" />
                        {department.manager.email}
                      </div>
                    </div>
                  ) : (
                    <p className="text-sm text-gray-500 ml-6 italic">
                      No manager assigned
                    </p>
                  )}
                </div>
              </Card>
            ))}
          </div>
        )}
      </main>

      {/* Add/Edit Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <Card className="w-full max-w-md mx-4">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold">
                  {editingDepartment ? 'Edit Department' : 'Add Department'}
                </h2>
                <button
                  onClick={closeModal}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Department Name *
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    placeholder="e.g., Engineering, Sales, HR"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) =>
                      setFormData({ ...formData, description: e.target.value })
                    }
                    placeholder="Brief description of the department"
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Manager
                  </label>
                  <select
                    value={formData.managerId}
                    onChange={(e) =>
                      setFormData({ ...formData, managerId: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                  >
                    <option value="">No manager assigned</option>
                    {/* In a real app, you would fetch and list available managers here */}
                    <option value="demo-manager-1">Demo Manager 1</option>
                    <option value="demo-manager-2">Demo Manager 2</option>
                  </select>
                  <p className="text-xs text-gray-500 mt-1">
                    Assign a manager to this department
                  </p>
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                  <div className="flex items-start gap-2">
                    <AlertCircle className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                    <p className="text-xs text-blue-800">
                      Employees can be assigned to departments from their profile settings.
                      Department managers can approve leave requests for their team members.
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3 mt-6">
                <Button
                  variant="outline"
                  onClick={closeModal}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  onClick={saveDepartment}
                  disabled={!formData.name || saving}
                  className="flex-1"
                >
                  {saving ? 'Saving...' : editingDepartment ? 'Update' : 'Add Department'}
                </Button>
              </div>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
