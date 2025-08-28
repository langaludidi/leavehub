import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../../lib/supabase';
import { useToast } from '../../components/Toast';
import { useUserRole } from '../../components/RequireRole';

interface Employee {
  id: string;
  user_id: string;
  org_id: string;
  role: 'employee' | 'manager' | 'admin';
  department?: string;
  manager_id?: string;
  active: boolean;
  created_at: string;
  profiles?: {
    full_name?: string;
    email: string;
    avatar_url?: string;
  };
  manager_profile?: {
    full_name?: string;
    email: string;
  };
}

interface InviteForm {
  email: string;
  role: 'employee' | 'manager' | 'admin';
  department: string;
  manager_id?: string;
}

export default function AdminEmployees() {
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [inviteForm, setInviteForm] = useState<InviteForm>({
    email: '',
    role: 'employee',
    department: '',
    manager_id: undefined
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');

  const toast = useToast();
  const queryClient = useQueryClient();
  const { data: userRole } = useUserRole();

  // Fetch employees
  const { data: employees, isLoading } = useQuery({
    queryKey: ['admin-employees', userRole?.orgId],
    queryFn: async (): Promise<Employee[]> => {
      if (!userRole?.orgId) return [];

      const { data, error } = await supabase
        .from('org_members')
        .select(`
          *,
          profiles (
            full_name,
            email,
            avatar_url
          ),
          manager_profile:profiles!org_members_manager_id_fkey (
            full_name,
            email
          )
        `)
        .eq('org_id', userRole.orgId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as Employee[];
    },
    enabled: !!userRole?.orgId
  });

  // Invite new employee
  const inviteMutation = useMutation({
    mutationFn: async (inviteData: InviteForm) => {
      if (!userRole?.orgId) throw new Error('No organization');

      // First, check if user already exists
      const { data: existingProfile } = await supabase
        .from('profiles')
        .select('id')
        .eq('email', inviteData.email)
        .single();

      let userId = existingProfile?.id;

      if (!existingProfile) {
        // Create a placeholder profile (user will complete signup later)
        const { data: newProfile, error: profileError } = await supabase
          .from('profiles')
          .insert({
            email: inviteData.email,
            full_name: inviteData.email.split('@')[0] // Temporary name
          })
          .select()
          .single();

        if (profileError) throw profileError;
        userId = newProfile.id;
      }

      // Add to organization
      const { error } = await supabase
        .from('org_members')
        .insert({
          user_id: userId,
          org_id: userRole.orgId,
          role: inviteData.role,
          department: inviteData.department || null,
          manager_id: inviteData.manager_id || null,
          active: true
        });

      if (error) throw error;

      // Send invitation email (optional)
      try {
        await supabase.functions.invoke('send-invite', {
          body: {
            email: inviteData.email,
            orgId: userRole.orgId,
            role: inviteData.role,
            invitedBy: userRole.userId
          }
        });
      } catch (emailError) {
        console.warn('Failed to send invitation email:', emailError);
      }

      return { email: inviteData.email };
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['admin-employees'] });
      toast(`Invitation sent to ${data.email}`, 'success');
      setShowInviteModal(false);
      setInviteForm({ email: '', role: 'employee', department: '', manager_id: undefined });
    },
    onError: (error) => {
      console.error('Invitation failed:', error);
      toast('Failed to send invitation. Please try again.', 'error');
    }
  });

  // Update employee
  const updateEmployeeMutation = useMutation({
    mutationFn: async ({ 
      employeeId, 
      updates 
    }: { 
      employeeId: string, 
      updates: Partial<Pick<Employee, 'role' | 'department' | 'manager_id' | 'active'>>
    }) => {
      const { error } = await supabase
        .from('org_members')
        .update(updates)
        .eq('id', employeeId);

      if (error) throw error;
      return updates;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-employees'] });
      toast('Employee updated successfully', 'success');
    },
    onError: (error) => {
      console.error('Update failed:', error);
      toast('Failed to update employee', 'error');
    }
  });

  // Remove employee
  const removeEmployeeMutation = useMutation({
    mutationFn: async (employeeId: string) => {
      const { error } = await supabase
        .from('org_members')
        .update({ active: false })
        .eq('id', employeeId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-employees'] });
      toast('Employee deactivated successfully', 'success');
    },
    onError: (error) => {
      console.error('Deactivation failed:', error);
      toast('Failed to deactivate employee', 'error');
    }
  });

  const handleInvite = () => {
    if (!inviteForm.email) {
      toast('Please enter an email address', 'error');
      return;
    }
    inviteMutation.mutate(inviteForm);
  };

  const filteredEmployees = employees?.filter(emp => {
    const matchesSearch = !searchTerm || 
      emp.profiles?.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      emp.profiles?.email?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesRole = roleFilter === 'all' || emp.role === roleFilter;
    
    return matchesSearch && matchesRole;
  }) || [];

  const managers = employees?.filter(emp => emp.role === 'manager' || emp.role === 'admin') || [];

  if (isLoading) {
    return (
      <div className="container py-8">
        <div className="card">
          <div className="card-body text-center py-12">
            <div className="animate-spin h-8 w-8 mx-auto mb-4">
              <svg className="w-8 h-8 text-teal-600" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 714 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
              </svg>
            </div>
            <p className="text-gray-600 dark:text-gray-400">Loading employees...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container py-8 animate-fade-in">
      <div className="mb-8">
        <h1 className="text-4xl font-bold gradient-text mb-4">Employee Management</h1>
        <p className="text-xl text-gray-600 dark:text-gray-300">
          Manage your team members, roles, and permissions
        </p>
      </div>

      {/* Header Actions */}
      <div className="card mb-6">
        <div className="card-body">
          <div className="flex flex-col md:flex-row gap-4 justify-between items-center">
            <div className="flex flex-col md:flex-row gap-4 flex-1">
              <input
                type="text"
                placeholder="Search employees..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="input max-w-sm"
              />
              <select
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
                className="select max-w-40"
              >
                <option value="all">All Roles</option>
                <option value="admin">Admin</option>
                <option value="manager">Manager</option>
                <option value="employee">Employee</option>
              </select>
            </div>
            <button
              onClick={() => setShowInviteModal(true)}
              className="btn-primary"
            >
              👤 Invite Employee
            </button>
          </div>
        </div>
      </div>

      {/* Employee List */}
      <div className="card">
        <div className="card-header">
          <div className="card-title">Team Members ({filteredEmployees.length})</div>
          <div className="card-subtle mt-1">Manage roles and permissions</div>
        </div>
        <div className="card-body">
          {filteredEmployees.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">👥</div>
              <h3 className="text-xl font-semibold text-gray-700 dark:text-gray-300 mb-2">No employees found</h3>
              <p className="text-gray-600 dark:text-gray-400">
                {searchTerm || roleFilter !== 'all' 
                  ? 'Try adjusting your search filters' 
                  : 'Start by inviting your first team member'
                }
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="table w-full">
                <thead>
                  <tr>
                    <th className="text-left">Employee</th>
                    <th className="text-left">Role</th>
                    <th className="text-left">Department</th>
                    <th className="text-left">Manager</th>
                    <th className="text-left">Status</th>
                    <th className="text-left">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredEmployees.map((employee) => (
                    <tr key={employee.id} className="border-b border-gray-200 dark:border-gray-700">
                      <td className="py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-teal-100 dark:bg-teal-900/20 rounded-full flex items-center justify-center">
                            <span className="text-teal-600 dark:text-teal-400 font-medium text-sm">
                              {employee.profiles?.full_name?.charAt(0) || employee.profiles?.email?.charAt(0) || '?'}
                            </span>
                          </div>
                          <div>
                            <div className="font-medium text-gray-900 dark:text-gray-100">
                              {employee.profiles?.full_name || 'Pending Setup'}
                            </div>
                            <div className="text-sm text-gray-500 dark:text-gray-400">
                              {employee.profiles?.email}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="py-4">
                        <select
                          value={employee.role}
                          onChange={(e) => updateEmployeeMutation.mutate({
                            employeeId: employee.id,
                            updates: { role: e.target.value as 'employee' | 'manager' | 'admin' }
                          })}
                          className="select text-sm"
                        >
                          <option value="employee">Employee</option>
                          <option value="manager">Manager</option>
                          <option value="admin">Admin</option>
                        </select>
                      </td>
                      <td className="py-4">
                        <input
                          type="text"
                          value={employee.department || ''}
                          placeholder="Department"
                          onBlur={(e) => {
                            if (e.target.value !== employee.department) {
                              updateEmployeeMutation.mutate({
                                employeeId: employee.id,
                                updates: { department: e.target.value || null }
                              });
                            }
                          }}
                          className="input text-sm max-w-32"
                        />
                      </td>
                      <td className="py-4">
                        <select
                          value={employee.manager_id || ''}
                          onChange={(e) => updateEmployeeMutation.mutate({
                            employeeId: employee.id,
                            updates: { manager_id: e.target.value || null }
                          })}
                          className="select text-sm max-w-40"
                        >
                          <option value="">No Manager</option>
                          {managers
                            .filter(m => m.user_id !== employee.user_id)
                            .map((manager) => (
                            <option key={manager.user_id} value={manager.user_id}>
                              {manager.profiles?.full_name || manager.profiles?.email}
                            </option>
                          ))}
                        </select>
                      </td>
                      <td className="py-4">
                        <span className={[
                          "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium",
                          employee.active 
                            ? "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300"
                            : "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300"
                        ].join(' ')}>
                          {employee.active ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="py-4">
                        <div className="flex gap-2">
                          {employee.active ? (
                            <button
                              onClick={() => {
                                if (confirm('Are you sure you want to deactivate this employee?')) {
                                  removeEmployeeMutation.mutate(employee.id);
                                }
                              }}
                              className="text-red-600 hover:text-red-800 text-sm"
                            >
                              Deactivate
                            </button>
                          ) : (
                            <button
                              onClick={() => updateEmployeeMutation.mutate({
                                employeeId: employee.id,
                                updates: { active: true }
                              })}
                              className="text-green-600 hover:text-green-800 text-sm"
                            >
                              Reactivate
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Invite Modal */}
      {showInviteModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg max-w-md w-full">
            <div className="p-6">
              <h2 className="text-xl font-semibold mb-4">Invite New Employee</h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Email Address</label>
                  <input
                    type="email"
                    value={inviteForm.email}
                    onChange={(e) => setInviteForm(prev => ({ ...prev, email: e.target.value }))}
                    placeholder="employee@company.com"
                    className="input w-full"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Role</label>
                  <select
                    value={inviteForm.role}
                    onChange={(e) => setInviteForm(prev => ({ 
                      ...prev, 
                      role: e.target.value as 'employee' | 'manager' | 'admin' 
                    }))}
                    className="select w-full"
                  >
                    <option value="employee">Employee</option>
                    <option value="manager">Manager</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Department (Optional)</label>
                  <input
                    type="text"
                    value={inviteForm.department}
                    onChange={(e) => setInviteForm(prev => ({ ...prev, department: e.target.value }))}
                    placeholder="Engineering, Marketing, etc."
                    className="input w-full"
                  />
                </div>

                {inviteForm.role === 'employee' && managers.length > 0 && (
                  <div>
                    <label className="block text-sm font-medium mb-2">Manager (Optional)</label>
                    <select
                      value={inviteForm.manager_id || ''}
                      onChange={(e) => setInviteForm(prev => ({ 
                        ...prev, 
                        manager_id: e.target.value || undefined 
                      }))}
                      className="select w-full"
                    >
                      <option value="">No Manager</option>
                      {managers.map((manager) => (
                        <option key={manager.user_id} value={manager.user_id}>
                          {manager.profiles?.full_name || manager.profiles?.email}
                        </option>
                      ))}
                    </select>
                  </div>
                )}
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => setShowInviteModal(false)}
                  className="btn-secondary flex-1"
                >
                  Cancel
                </button>
                <button
                  onClick={handleInvite}
                  disabled={inviteMutation.isPending}
                  className="btn-primary flex-1"
                >
                  {inviteMutation.isPending ? 'Sending...' : 'Send Invite'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}