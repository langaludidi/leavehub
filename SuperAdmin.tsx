import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';

interface Organization {
  id: string;
  name: string;
  plan: 'free' | 'starter' | 'professional' | 'enterprise';
  status: 'trial' | 'active' | 'inactive';
  employees: number;
  mrr: number;
  last_activity: string;
}

export default function SuperAdmin() {
  const [selectedTab, setSelectedTab] = useState('overview');

  // Mock data with updated pricing structure
  const mockOrganizations: Organization[] = [
    {
      id: '1',
      name: 'TechCorp Solutions',
      plan: 'professional', // 75 employees × R30 = R2,250 MRR
      status: 'active',
      employees: 75,
      mrr: 2250,
      last_activity: '2024-08-27'
    },
    {
      id: '2', 
      name: 'Creative Agency',
      plan: 'professional', // 45 employees × R30 = R1,350 MRR
      status: 'active',
      employees: 45,
      mrr: 1350,
      last_activity: '2024-08-26'
    },
    {
      id: '3',
      name: 'StartupCo',
      plan: 'starter', // 8 employees × R20 = R160 MRR
      status: 'trial',
      employees: 8,
      mrr: 160,
      last_activity: '2024-08-25'
    },
    {
      id: '4',
      name: 'Small Business',
      plan: 'free', // 3 employees = R0 MRR
      status: 'active',
      employees: 3,
      mrr: 0,
      last_activity: '2024-08-24'
    },
    {
      id: '5',
      name: 'Enterprise Corp',
      plan: 'enterprise', // 150 employees × R45 = R6,750 MRR
      status: 'active', 
      employees: 150,
      mrr: 6750,
      last_activity: '2024-08-27'
    }
  ];

  const { data: stats, isLoading } = useQuery({
    queryKey: ['super-admin-stats'],
    queryFn: async () => {
      // Calculate totals from mock data
      const totalMRR = mockOrganizations.reduce((sum, org) => sum + org.mrr, 0);
      const activeOrgs = mockOrganizations.filter(org => org.status === 'active').length;
      const trialOrgs = mockOrganizations.filter(org => org.status === 'trial').length;
      const totalEmployees = mockOrganizations.reduce((sum, org) => sum + org.employees, 0);

      return {
        totalMRR,
        activeOrgs,
        trialOrgs,
        totalEmployees
      };
    }
  });

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-ZA', {
      style: 'currency',
      currency: 'ZAR',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const getPlanColor = (plan: string) => {
    switch (plan) {
      case 'free': return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300';
      case 'starter': return 'bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-300';
      case 'professional': return 'bg-teal-100 text-teal-800 dark:bg-teal-900/20 dark:text-teal-300';
      case 'enterprise': return 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-300';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300';
      case 'trial': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300';
      case 'inactive': return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const totalMRR = stats?.totalMRR || 0;
  const activeOrgs = stats?.activeOrgs || 0;
  const trialOrgs = stats?.trialOrgs || 0;
  const totalEmployees = stats?.totalEmployees || 0;

  if (isLoading) {
    return (
      <div className="container py-8">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-64"></div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-32 bg-gray-200 dark:bg-gray-700 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container py-8 animate-fade-in">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold gradient-text mb-4">LeaveHub Super Admin</h1>
        <p className="text-xl text-gray-600 dark:text-gray-300">
          Monitor all organizations subscribed to LeaveHub
        </p>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="card bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border-green-200 dark:border-green-800/30">
          <div className="card-body text-center">
            <div className="text-3xl font-bold text-green-600 dark:text-green-400 mb-2">
              {formatCurrency(totalMRR)}
            </div>
            <div className="text-sm text-green-700 dark:text-green-300">Monthly Recurring Revenue</div>
          </div>
        </div>

        <div className="card bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border-blue-200 dark:border-blue-800/30">
          <div className="card-body text-center">
            <div className="text-3xl font-bold text-blue-600 dark:text-blue-400 mb-2">
              {activeOrgs}
            </div>
            <div className="text-sm text-blue-700 dark:text-blue-300">Active Organizations</div>
          </div>
        </div>

        <div className="card bg-gradient-to-r from-orange-50 to-red-50 dark:from-orange-900/20 dark:to-red-900/20 border-orange-200 dark:border-orange-800/30">
          <div className="card-body text-center">
            <div className="text-3xl font-bold text-orange-600 dark:text-orange-400 mb-2">
              {trialOrgs}
            </div>
            <div className="text-sm text-orange-700 dark:text-orange-300">Trial Organizations</div>
          </div>
        </div>

        <div className="card bg-gradient-to-r from-purple-50 to-violet-50 dark:from-purple-900/20 dark:to-violet-900/20 border-purple-200 dark:border-purple-800/30">
          <div className="card-body text-center">
            <div className="text-3xl font-bold text-purple-600 dark:text-purple-400 mb-2">
              {totalEmployees.toLocaleString()}
            </div>
            <div className="text-sm text-purple-700 dark:text-purple-300">Total Employees Served</div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="mb-6">
        <div className="border-b border-gray-200 dark:border-gray-700">
          <nav className="-mb-px flex space-x-8">
            {[
              { id: 'overview', label: 'Overview', icon: '📊' },
              { id: 'organizations', label: 'Organizations', icon: '🏢' },
              { id: 'billing', label: 'Billing & Revenue', icon: '💰' },
              { id: 'support', label: 'Support', icon: '🎧' }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setSelectedTab(tab.id)}
                className={`
                  flex items-center gap-2 py-2 px-1 border-b-2 font-medium text-sm transition-colors
                  ${selectedTab === tab.id
                    ? 'border-teal-500 text-teal-600 dark:text-teal-400'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
                  }
                `}
              >
                <span>{tab.icon}</span>
                {tab.label}
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Organizations Table */}
      {selectedTab === 'organizations' && (
        <div className="card">
          <div className="card-header">
            <div className="card-title">All Organizations</div>
            <div className="card-subtitle">Complete list of LeaveHub subscribers</div>
          </div>
          <div className="card-body">
            <div className="overflow-x-auto">
              <table className="table">
                <thead>
                  <tr>
                    <th>Organization</th>
                    <th>Plan</th>
                    <th>Status</th>
                    <th>Employees</th>
                    <th>MRR</th>
                    <th>Last Activity</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {mockOrganizations.map((org) => (
                    <tr key={org.id} className="border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800/50">
                      <td>
                        <div>
                          <div className="font-medium text-gray-900 dark:text-gray-100">
                            {org.name}
                          </div>
                        </div>
                      </td>
                      <td>
                        <span className={`status-indicator ${getPlanColor(org.plan)}`}>
                          {org.plan}
                        </span>
                      </td>
                      <td>
                        <span className={`status-indicator ${getStatusColor(org.status)}`}>
                          {org.status}
                        </span>
                      </td>
                      <td>
                        <div className="font-medium">{org.employees.toLocaleString()}</div>
                      </td>
                      <td>
                        <div className="font-medium">{formatCurrency(org.mrr)}</div>
                      </td>
                      <td>
                        <div className="text-sm">{formatDate(org.last_activity)}</div>
                      </td>
                      <td>
                        <div className="flex gap-2">
                          <button className="btn-ghost btn-sm">View</button>
                          <button className="btn-secondary btn-sm">Edit</button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Overview Dashboard */}
      {selectedTab === 'overview' && (
        <div className="space-y-6">
          {/* Pricing Structure */}
          <div className="card">
            <div className="card-header">
              <div className="card-title">LeaveHub Pricing Structure</div>
            </div>
            <div className="card-body">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="text-center p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
                  <div className="font-bold text-green-800 dark:text-green-300">FREE</div>
                  <div className="text-sm text-green-600 dark:text-green-400">Up to 3 employees</div>
                  <div className="text-xl font-bold text-green-800 dark:text-green-300 mt-2">R0</div>
                </div>
                
                <div className="text-center p-4 bg-orange-50 dark:bg-orange-900/20 rounded-lg border border-orange-200 dark:border-orange-800">
                  <div className="font-bold text-orange-800 dark:text-orange-300">STARTER</div>
                  <div className="text-sm text-orange-600 dark:text-orange-400">Up to 10 employees</div>
                  <div className="text-xl font-bold text-orange-800 dark:text-orange-300 mt-2">R20<span className="text-sm">/emp</span></div>
                </div>
                
                <div className="text-center p-4 bg-teal-50 dark:bg-teal-900/20 rounded-lg border border-teal-200 dark:border-teal-800">
                  <div className="font-bold text-teal-800 dark:text-teal-300">PROFESSIONAL</div>
                  <div className="text-sm text-teal-600 dark:text-teal-400">11-100 employees</div>
                  <div className="text-xl font-bold text-teal-800 dark:text-teal-300 mt-2">R30<span className="text-sm">/emp</span></div>
                </div>
                
                <div className="text-center p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg border border-purple-200 dark:border-purple-800">
                  <div className="font-bold text-purple-800 dark:text-purple-300">ENTERPRISE</div>
                  <div className="text-sm text-purple-600 dark:text-purple-400">100+ employees</div>
                  <div className="text-xl font-bold text-purple-800 dark:text-purple-300 mt-2">R45<span className="text-sm">/emp</span></div>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Revenue Chart Placeholder */}
            <div className="card">
              <div className="card-header">
                <div className="card-title">Revenue Trend</div>
              </div>
              <div className="card-body">
                <div className="h-64 bg-gradient-to-r from-teal-50 to-blue-50 dark:from-teal-900/20 dark:to-blue-900/20 rounded-lg flex items-center justify-center">
                  <div className="text-center">
                    <div className="text-6xl mb-4">📈</div>
                    <div className="text-lg font-semibold text-gray-700 dark:text-gray-300">Revenue Analytics</div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">Chart integration ready</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Recent Activity */}
            <div className="card">
              <div className="card-header">
                <div className="card-title">Recent Activity</div>
              </div>
              <div className="card-body">
                <div className="space-y-4">
                  <div className="flex items-center gap-4 p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                    <div className="text-2xl">🏢</div>
                    <div className="flex-1">
                      <div className="font-medium">New Organization: StartupCo</div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">Started trial • 2 hours ago</div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-4 p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                    <div className="text-2xl">💳</div>
                    <div className="flex-1">
                      <div className="font-medium">Payment: TechCorp Solutions</div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">R2,250 • 1 day ago</div>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                    <div className="text-2xl">⬆️</div>
                    <div className="flex-1">
                      <div className="font-medium">Plan Upgrade: Creative Agency</div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">Starter → Professional • 3 days ago</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Quick Actions */}
      <div className="mt-8">
        <h2 className="text-2xl font-bold mb-6">Super Admin Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="card hover:shadow-lg transition-all duration-300 group border border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600">
            <div className="card-body">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-12 h-12 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-500 opacity-90 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-xl">
                  🎛️
                </div>
                <div>
                  <div className="text-lg font-semibold group-hover:text-teal-600 dark:group-hover:text-teal-400 transition-colors">
                    System Settings
                  </div>
                  <div className="text-gray-600 dark:text-gray-400 text-sm mt-1">
                    Configure global platform settings
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="card hover:shadow-lg transition-all duration-300 group border border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600">
            <div className="card-body">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-12 h-12 rounded-lg bg-gradient-to-br from-green-500 to-emerald-500 opacity-90 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-xl">
                  📊
                </div>
                <div>
                  <div className="text-lg font-semibold group-hover:text-teal-600 dark:group-hover:text-teal-400 transition-colors">
                    Analytics
                  </div>
                  <div className="text-gray-600 dark:text-gray-400 text-sm mt-1">
                    Deep dive into platform analytics
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="card hover:shadow-lg transition-all duration-300 group border border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600">
            <div className="card-body">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-12 h-12 rounded-lg bg-gradient-to-br from-purple-500 to-violet-500 opacity-90 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-xl">
                  🎧
                </div>
                <div>
                  <div className="text-lg font-semibold group-hover:text-teal-600 dark:group-hover:text-teal-400 transition-colors">
                    Support Center
                  </div>
                  <div className="text-gray-600 dark:text-gray-400 text-sm mt-1">
                    Manage customer support tickets
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}