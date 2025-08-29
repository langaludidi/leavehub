import { useQuery } from "@tanstack/react-query";
import { supabase } from "../lib/supabase";

type Role = "employee" | "manager" | "admin";

interface RequireRoleProps {
  role: Role | Role[];
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export default function RequireRole({ role, children, fallback }: RequireRoleProps) {
  const q = useQuery({
    queryKey: ["my-role"],
    queryFn: async () => {
      const { data: u } = await supabase.auth.getUser();
      const uid = u.user?.id;
      if (!uid) return null;
      
      // Try to get role from org_members table
      const { data } = await supabase
        .from("org_members")
        .select("role, org_id")
        .eq("user_id", uid)
        .eq("active", true)
        .maybeSingle();
      
      return data ? { role: data.role as Role, orgId: data.org_id } : null;
    }
  });

  if (q.isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin h-6 w-6 border-2 border-teal-600 border-t-transparent rounded-full"></div>
        <span className="ml-2 text-gray-600">Loading...</span>
      </div>
    );
  }

  if (!q.data) {
    // For development - allow access when no role is found
    console.warn('No user role found - allowing access for development');
    return <>{children}</>;
  }

  const userRole = q.data.role;
  const requiredRoles = Array.isArray(role) ? role : [role];
  
  // Check if user has required role or higher permission level
  const hasPermission = requiredRoles.some(requiredRole => {
    if (requiredRole === "employee") return true; // All roles can access employee areas
    if (requiredRole === "manager") return userRole === "manager" || userRole === "admin";
    if (requiredRole === "admin") return userRole === "admin";
    return false;
  });

  if (!hasPermission) {
    return fallback || (
      <div className="text-center p-8">
        <div className="text-red-600 mb-2">🚫 Access Denied</div>
        <p className="text-gray-600">You need {Array.isArray(role) ? role.join(' or ') : role} permissions to access this area.</p>
      </div>
    );
  }

  return <>{children}</>;
}

// Hook to get current user role
export function useUserRole() {
  return useQuery({
    queryKey: ["my-role"],
    queryFn: async () => {
      const { data: u } = await supabase.auth.getUser();
      const uid = u.user?.id;
      if (!uid) return null;
      
      const { data } = await supabase
        .from("org_members")
        .select("role, org_id")
        .eq("user_id", uid)
        .eq("active", true)
        .maybeSingle();
      
      // For development - return admin role if no org membership found
      return data ? { role: data.role as Role, orgId: data.org_id, userId: uid } : { role: 'admin' as Role, orgId: 'dev', userId: uid };
    }
  });
}
