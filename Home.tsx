import { Link } from "react-router-dom";

export default function Home() {
  return (
    <div className="container py-8 animate-fade-in">
      {/* Welcome Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold gradient-text mb-2">
          Welcome to LeaveHub! 👋
        </h1>
        <p className="text-xl text-gray-600 dark:text-gray-300">
          Manage your team's time off with ease • {new Date().toLocaleDateString('en-US', { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
          })}
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-3 space-y-6">
          
          {/* Quick Actions */}
          <div className="card">
            <div className="card-header">
              <div className="card-title">Quick Actions</div>
              <div className="card-subtle mt-1">Get started with common tasks</div>
            </div>
            <div className="card-body">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Link to="/employee/request" className="btn-primary text-center py-6">
                  <div className="text-3xl mb-2">📋</div>
                  <div className="font-semibold">Request Leave</div>
                </Link>
                <Link to="/employee/history" className="btn-secondary text-center py-6">
                  <div className="text-3xl mb-2">📊</div>
                  <div className="font-semibold">View History</div>
                </Link>
                <Link to="/approvals" className="btn-secondary text-center py-6">
                  <div className="text-3xl mb-2">✅</div>
                  <div className="font-semibold">Approvals</div>
                </Link>
              </div>
            </div>
          </div>

          {/* Team Stats */}
          <div className="card">
            <div className="card-header">
              <div className="card-title">Team Overview</div>
              <div className="card-subtle mt-1">Quick stats</div>
            </div>
            <div className="card-body">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Stat label="Total Employees" value="—" color="blue" />
                <Stat label="Pending Approvals" value="—" color="yellow" />
                <Stat label="Active Leave" value="—" color="green" />
                <Stat label="This Month" value="—" color="purple" />
              </div>
            </div>
          </div>

          {/* Admin Tools */}
          <div className="card">
            <div className="card-header">
              <div className="card-title">Admin Tools</div>
              <div className="card-subtle mt-1">Manage your organization</div>
            </div>
            <div className="card-body">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Link to="/admin/employees" className="admin-tool">
                  <div className="text-2xl mb-2">👥</div>
                  <div className="font-semibold">Manage Users</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    Add, remove, and update team members
                  </div>
                </Link>
                
                <Link to="/admin/billing" className="admin-tool">
                  <div className="text-2xl mb-2">💳</div>
                  <div className="font-semibold">Billing</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    Manage subscription and usage
                  </div>
                </Link>
                
                <Link to="/admin" className="admin-tool">
                  <div className="text-2xl mb-2">⚙️</div>
                  <div className="font-semibold">Admin Portal</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    Access admin dashboard
                  </div>
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="lg:col-span-1 space-y-6">
          
          {/* Personal Stats */}
          <div className="card bg-gradient-to-r from-teal-50 to-cyan-50 dark:from-teal-900/20 dark:to-cyan-900/20 border-teal-200 dark:border-teal-800/30">
            <div className="card-body text-center">
              <div className="text-3xl mb-2">🏖️</div>
              <div className="text-2xl font-bold text-teal-600 dark:text-teal-400 mb-1">
                21
              </div>
              <div className="text-sm text-teal-700 dark:text-teal-300">Days Remaining</div>
            </div>
          </div>

          {/* Quick Links */}
          <div className="card">
            <div className="card-header">
              <div className="card-title">Quick Links</div>
            </div>
            <div className="card-body space-y-3">
              <Link to="/employee" className="block p-2 hover:bg-gray-50 dark:hover:bg-gray-800 rounded transition">
                <div className="font-medium">Employee Dashboard</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">View balances and history</div>
              </Link>
              
              <Link to="/approvals" className="block p-2 hover:bg-gray-50 dark:hover:bg-gray-800 rounded transition">
                <div className="font-medium">Approval Inbox</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Review pending requests</div>
              </Link>
              
              <Link to="/admin" className="block p-2 hover:bg-gray-50 dark:hover:bg-gray-800 rounded transition">
                <div className="font-medium">Admin Portal</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Manage organization</div>
              </Link>
            </div>
          </div>

          {/* Tips */}
          <div className="card bg-gradient-to-r from-purple-50 to-violet-50 dark:from-purple-900/20 dark:to-violet-900/20 border-purple-200 dark:border-purple-800/30">
            <div className="card-body">
              <div className="text-lg font-semibold text-purple-800 dark:text-purple-200 mb-2">
                💡 Pro Tip
              </div>
              <p className="text-sm text-purple-700 dark:text-purple-300">
                Plan your leave in advance and submit requests early. Your team will appreciate the heads up!
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function Stat({ label, value, color }: { label: string; value: string; color: string }) {
  const colorClasses = {
    blue: 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-800',
    green: 'bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 border-green-200 dark:border-green-800',
    yellow: 'bg-yellow-50 dark:bg-yellow-900/20 text-yellow-600 dark:text-yellow-400 border-yellow-200 dark:border-yellow-800',
    purple: 'bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400 border-purple-200 dark:border-purple-800',
  };

  return (
    <div className={`rounded-lg border p-4 text-center ${colorClasses[color as keyof typeof colorClasses]}`}>
      <div className="text-2xl font-bold mb-1">{value}</div>
      <div className="text-sm opacity-90">{label}</div>
    </div>
  );
}
