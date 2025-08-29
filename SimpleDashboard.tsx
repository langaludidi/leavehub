import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "../lib/supabase";

async function fetchUserProfile() {
  const { data: u } = await supabase.auth.getUser();
  const id = u.user?.id; 
  if (!id) return null;
  
  const { data } = await supabase
    .from("profiles")
    .select("full_name,email")
    .eq("id", id)
    .maybeSingle();
  
  return data ?? { email: u.user?.email };
}

export default function SimpleDashboard() {
  const { data: userProfile } = useQuery({
    queryKey: ["user-profile"],
    queryFn: fetchUserProfile
  });

  return (
    <div className="container py-8 animate-fade-in">
      {/* Welcome Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold gradient-text mb-2">
          Welcome to LeaveHub! 👋
        </h1>
        <p className="text-xl text-gray-600 dark:text-gray-300">
          {userProfile?.full_name || userProfile?.email || 'User'} • {new Date().toLocaleDateString('en-US', { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
          })}
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Quick Actions */}
          <div className="card">
            <div className="card-header">
              <div className="card-title">Quick Actions</div>
              <div className="card-subtle mt-1">Get started with these common tasks</div>
            </div>
            <div className="card-body">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Link to="/employee/request" className="btn-primary text-center py-6">
                  <div className="text-3xl mb-2">📋</div>
                  <div className="font-semibold">Request Leave</div>
                </Link>
                <Link to="/employee/history" className="btn-secondary text-center py-6">
                  <div className="text-3xl mb-2">📊</div>
                  <div className="font-semibold">View History</div>
                </Link>
              </div>
            </div>
          </div>

          {/* Getting Started */}
          <div className="card">
            <div className="card-header">
              <div className="card-title">Getting Started</div>
              <div className="card-subtle mt-1">Complete your setup</div>
            </div>
            <div className="card-body">
              <div className="space-y-4">
                <div className="flex items-center gap-4 p-4 bg-teal-50 dark:bg-teal-900/20 rounded-lg">
                  <div className="text-2xl">✅</div>
                  <div>
                    <div className="font-semibold">Account Created</div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">You're logged in and ready to go!</div>
                  </div>
                </div>
                
                <div className="flex items-center gap-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <div className="text-2xl">👥</div>
                  <div>
                    <div className="font-semibold">Join Your Organization</div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">Ask your admin to invite you to your company's LeaveHub</div>
                  </div>
                </div>
                
                <div className="flex items-center gap-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <div className="text-2xl">⚙️</div>
                  <div>
                    <div className="font-semibold">Set Up Organization</div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      <Link to="/onboarding/organization" className="text-teal-600 hover:underline">
                        Complete organization setup
                      </Link> to get started
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="lg:col-span-1 space-y-6">
          
          {/* Status Card */}
          <div className="card bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border-blue-200 dark:border-blue-800/30">
            <div className="card-body text-center">
              <div className="text-3xl mb-2">🚀</div>
              <div className="text-lg font-bold text-blue-600 dark:text-blue-400 mb-2">
                Setup Required
              </div>
              <div className="text-sm text-blue-700 dark:text-blue-300">
                Complete your organization setup to unlock all features
              </div>
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
                <div className="text-sm text-gray-600 dark:text-gray-400">Access employee features</div>
              </Link>
              
              <Link to="/onboarding/organization" className="block p-2 hover:bg-gray-50 dark:hover:bg-gray-800 rounded transition">
                <div className="font-medium">Organization Setup</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Configure your organization</div>
              </Link>
            </div>
          </div>

          {/* Help */}
          <div className="card bg-gradient-to-r from-purple-50 to-violet-50 dark:from-purple-900/20 dark:to-violet-900/20 border-purple-200 dark:border-purple-800/30">
            <div className="card-body">
              <div className="text-lg font-semibold text-purple-800 dark:text-purple-200 mb-2">
                💡 Need Help?
              </div>
              <p className="text-sm text-purple-700 dark:text-purple-300 mb-3">
                LeaveHub makes managing time off simple and efficient for your entire team.
              </p>
              <button className="text-sm text-purple-600 hover:text-purple-700 font-medium">
                View Documentation →
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}