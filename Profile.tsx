import { useQuery } from "@tanstack/react-query";
import { supabase } from "../lib/supabase";

async function fetchProfile() {
  const { data: u } = await supabase.auth.getUser();
  const id = u.user?.id;
  if (!id) return null;

  const { data } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  return data ?? { id, email: u.user?.email, full_name: "" };
}

export default function Profile() {
  const { data: profile, isLoading } = useQuery({
    queryKey: ["profile"],
    queryFn: fetchProfile
  });

  if (isLoading) {
    return (
      <div className="container py-8">
        <div className="max-w-2xl mx-auto">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/3"></div>
            <div className="h-64 bg-gray-200 dark:bg-gray-700 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container py-8">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="page-header">
          <h1 className="page-title">My Profile</h1>
          <p className="page-subtitle">Manage your personal information and preferences</p>
        </div>

        {/* Profile Form */}
        <div className="card">
          <div className="card-header">
            <div className="card-title">Personal Information</div>
            <div className="card-subtitle">Update your profile details</div>
          </div>
          <div className="card-body">
            <form className="space-y-6">
              <div className="form-group">
                <label htmlFor="full_name" className="label">Full Name</label>
                <input
                  type="text"
                  id="full_name"
                  className="input"
                  defaultValue={profile?.full_name || ""}
                  placeholder="Enter your full name"
                />
                <div className="help">This is how your name will appear to other users</div>
              </div>

              <div className="form-group">
                <label htmlFor="email" className="label">Email Address</label>
                <input
                  type="email"
                  id="email"
                  className="input"
                  defaultValue={profile?.email || ""}
                  placeholder="Enter your email"
                />
                <div className="help">This is your login email address</div>
              </div>

              <div className="form-group">
                <label htmlFor="phone" className="label">Phone Number</label>
                <input
                  type="tel"
                  id="phone"
                  className="input"
                  defaultValue={profile?.phone || ""}
                  placeholder="Enter your phone number"
                />
              </div>

              <div className="form-group">
                <label htmlFor="department" className="label">Department</label>
                <select id="department" className="input">
                  <option value="">Select Department</option>
                  <option value="engineering">Engineering</option>
                  <option value="marketing">Marketing</option>
                  <option value="sales">Sales</option>
                  <option value="hr">Human Resources</option>
                  <option value="finance">Finance</option>
                  <option value="operations">Operations</option>
                </select>
              </div>

              <div className="flex gap-4">
                <button type="submit" className="btn-primary">
                  Save Changes
                </button>
                <button type="button" className="btn-secondary">
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Account Settings */}
        <div className="card">
          <div className="card-header">
            <div className="card-title">Account Settings</div>
            <div className="card-subtitle">Manage your account security</div>
          </div>
          <div className="card-body">
            <div className="space-y-4">
              <button className="btn-secondary w-full text-left">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-semibold">Change Password</div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">Update your account password</div>
                  </div>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </button>

              <button className="btn-secondary w-full text-left">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-semibold">Two-Factor Authentication</div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">Add extra security to your account</div>
                  </div>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}