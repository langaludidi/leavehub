import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "../../lib/supabase";
import { useToast } from "../../components/Toast";

interface Department {
  id: string;
  name: string;
  description?: string;
  manager_id?: string;
  created_at: string;
  active: boolean;
  employee_count?: number;
  manager?: {
    full_name: string;
    email: string;
  };
}

export default function Departments() {
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingDepartment, setEditingDepartment] = useState<Department | null>(null);
  const [newDepartment, setNewDepartment] = useState({
    name: "",
    description: "",
    manager_id: ""
  });

  const toast = useToast();
  const queryClient = useQueryClient();

  // Fetch departments
  const { data: departments = [], isLoading } = useQuery({
    queryKey: ['departments'],
    queryFn: async (): Promise<Department[]> => {
      // For development - return mock data
      return [
        {
          id: "1",
          name: "Engineering",
          description: "Software development and technical teams",
          manager_id: "mgr1",
          created_at: new Date().toISOString(),
          active: true,
          employee_count: 12,
          manager: {
            full_name: "John Smith",
            email: "john.smith@company.com"
          }
        },
        {
          id: "2",
          name: "Human Resources",
          description: "Employee relations and organizational development",
          manager_id: "mgr2",
          created_at: new Date().toISOString(),
          active: true,
          employee_count: 4,
          manager: {
            full_name: "Sarah Johnson",
            email: "sarah.johnson@company.com"
          }
        },
        {
          id: "3",
          name: "Marketing",
          description: "Brand management and customer acquisition",
          manager_id: null,
          created_at: new Date().toISOString(),
          active: true,
          employee_count: 8
        },
        {
          id: "4",
          name: "Sales",
          description: "Revenue generation and client relationships",
          manager_id: "mgr3",
          created_at: new Date().toISOString(),
          active: false,
          employee_count: 6,
          manager: {
            full_name: "Mike Wilson",
            email: "mike.wilson@company.com"
          }
        }
      ];
    }
  });

  // Create department mutation
  const createDepartment = useMutation({
    mutationFn: async (department: typeof newDepartment) => {
      // For development - simulate success
      await new Promise(resolve => setTimeout(resolve, 1000));
      return { ...department, id: Date.now().toString() };
    },
    onSuccess: () => {
      toast?.success("Department created successfully!");
      setShowCreateForm(false);
      setNewDepartment({ name: "", description: "", manager_id: "" });
      queryClient.invalidateQueries({ queryKey: ['departments'] });
    },
    onError: () => {
      toast?.error("Failed to create department");
    }
  });

  // Update department status
  const updateDepartmentStatus = useMutation({
    mutationFn: async ({ id, active }: { id: string, active: boolean }) => {
      // For development - simulate success
      await new Promise(resolve => setTimeout(resolve, 500));
      return { id, active };
    },
    onSuccess: () => {
      toast?.success("Department status updated!");
      queryClient.invalidateQueries({ queryKey: ['departments'] });
    },
    onError: () => {
      toast?.error("Failed to update department status");
    }
  });

  const handleCreateDepartment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDepartment.name.trim()) {
      toast?.error("Department name is required");
      return;
    }
    createDepartment.mutate(newDepartment);
  };

  const toggleDepartmentStatus = (id: string, currentStatus: boolean) => {
    updateDepartmentStatus.mutate({ id, active: !currentStatus });
  };

  if (isLoading) {
    return (
      <div className="container py-8">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-64"></div>
          <div className="grid gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-32 bg-gray-200 dark:bg-gray-700 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container py-8">
      {/* Header */}
      <div className="page-header">
        <h1 className="page-title">Department Management</h1>
        <p className="page-subtitle">Organize your workforce into departments and assign managers</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="card bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border-blue-200 dark:border-blue-800/30">
          <div className="card-body text-center">
            <div className="text-3xl font-bold text-blue-600 dark:text-blue-400 mb-2">
              {departments.filter(d => d.active).length}
            </div>
            <div className="text-sm text-blue-700 dark:text-blue-300">Active Departments</div>
          </div>
        </div>

        <div className="card bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border-green-200 dark:border-green-800/30">
          <div className="card-body text-center">
            <div className="text-3xl font-bold text-green-600 dark:text-green-400 mb-2">
              {departments.reduce((sum, d) => sum + (d.employee_count || 0), 0)}
            </div>
            <div className="text-sm text-green-700 dark:text-green-300">Total Employees</div>
          </div>
        </div>

        <div className="card bg-gradient-to-r from-purple-50 to-violet-50 dark:from-purple-900/20 dark:to-violet-900/20 border-purple-200 dark:border-purple-800/30">
          <div className="card-body text-center">
            <div className="text-3xl font-bold text-purple-600 dark:text-purple-400 mb-2">
              {departments.filter(d => d.manager_id).length}
            </div>
            <div className="text-sm text-purple-700 dark:text-purple-300">With Managers</div>
          </div>
        </div>

        <div className="card bg-gradient-to-r from-orange-50 to-red-50 dark:from-orange-900/20 dark:to-red-900/20 border-orange-200 dark:border-orange-800/30">
          <div className="card-body text-center">
            <div className="text-3xl font-bold text-orange-600 dark:text-orange-400 mb-2">
              {departments.filter(d => !d.manager_id).length}
            </div>
            <div className="text-sm text-orange-700 dark:text-orange-300">Need Managers</div>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex justify-between items-center mb-6">
        <div className="flex gap-4">
          <button
            onClick={() => setShowCreateForm(!showCreateForm)}
            className="btn-primary"
          >
            {showCreateForm ? "Cancel" : "Create Department"}
          </button>
        </div>
      </div>

      {/* Create Form */}
      {showCreateForm && (
        <div className="card mb-6">
          <div className="card-header">
            <div className="card-title">Create New Department</div>
          </div>
          <div className="card-body">
            <form onSubmit={handleCreateDepartment} className="space-y-6">
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="name" className="label">Department Name *</label>
                  <input
                    type="text"
                    id="name"
                    className="input"
                    value={newDepartment.name}
                    onChange={(e) => setNewDepartment({ ...newDepartment, name: e.target.value })}
                    placeholder="e.g., Engineering, Marketing, Sales"
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="manager" className="label">Department Manager</label>
                  <select
                    id="manager"
                    className="input"
                    value={newDepartment.manager_id}
                    onChange={(e) => setNewDepartment({ ...newDepartment, manager_id: e.target.value })}
                  >
                    <option value="">Select Manager (Optional)</option>
                    <option value="mgr1">John Smith</option>
                    <option value="mgr2">Sarah Johnson</option>
                    <option value="mgr3">Mike Wilson</option>
                    <option value="mgr4">Lisa Davis</option>
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="description" className="label">Description</label>
                <textarea
                  id="description"
                  className="input"
                  rows={3}
                  value={newDepartment.description}
                  onChange={(e) => setNewDepartment({ ...newDepartment, description: e.target.value })}
                  placeholder="Brief description of the department's role and responsibilities"
                />
              </div>

              <div className="flex gap-4">
                <button
                  type="submit"
                  className="btn-primary"
                  disabled={createDepartment.isPending}
                >
                  {createDepartment.isPending ? "Creating..." : "Create Department"}
                </button>
                <button
                  type="button"
                  onClick={() => setShowCreateForm(false)}
                  className="btn-secondary"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Departments List */}
      <div className="grid gap-6">
        {departments.map((department) => (
          <div
            key={department.id}
            className={`card ${!department.active ? 'opacity-60' : ''}`}
          >
            <div className="card-body">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                      {department.name}
                    </h3>
                    <span className={`status-indicator ${
                      department.active 
                        ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
                        : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300'
                    }`}>
                      {department.active ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                  
                  {department.description && (
                    <p className="text-gray-600 dark:text-gray-400 mb-4">
                      {department.description}
                    </p>
                  )}

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                    <div>
                      <span className="font-medium text-gray-500 dark:text-gray-400">Manager:</span>
                      <div className="mt-1">
                        {department.manager ? (
                          <div>
                            <div className="font-medium text-gray-900 dark:text-gray-100">
                              {department.manager.full_name}
                            </div>
                            <div className="text-gray-500 dark:text-gray-400">
                              {department.manager.email}
                            </div>
                          </div>
                        ) : (
                          <span className="text-orange-600 dark:text-orange-400 font-medium">
                            No manager assigned
                          </span>
                        )}
                      </div>
                    </div>

                    <div>
                      <span className="font-medium text-gray-500 dark:text-gray-400">Employees:</span>
                      <div className="mt-1 font-medium text-gray-900 dark:text-gray-100">
                        {department.employee_count || 0} members
                      </div>
                    </div>

                    <div>
                      <span className="font-medium text-gray-500 dark:text-gray-400">Created:</span>
                      <div className="mt-1 text-gray-600 dark:text-gray-400">
                        {new Date(department.created_at).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex gap-2 ml-4">
                  <button
                    onClick={() => toggleDepartmentStatus(department.id, department.active)}
                    className={`btn-sm ${
                      department.active 
                        ? 'bg-red-100 text-red-700 hover:bg-red-200 dark:bg-red-900/30 dark:text-red-300'
                        : 'bg-green-100 text-green-700 hover:bg-green-200 dark:bg-green-900/30 dark:text-green-300'
                    }`}
                    disabled={updateDepartmentStatus.isPending}
                  >
                    {department.active ? 'Deactivate' : 'Activate'}
                  </button>
                  
                  <button className="btn-secondary btn-sm">
                    Edit
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}