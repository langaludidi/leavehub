import { useEffect, useState } from "react";
import { Link, NavLink } from "react-router-dom";
import {
  Bars3Icon,
  XMarkIcon,
  HomeIcon,
  UserIcon,
  InboxIcon,
  Cog6ToothIcon,
  CalendarIcon,
  ChartBarIcon,
  UsersIcon,
  DocumentTextIcon,
  CreditCardIcon,
  CalendarDaysIcon,
  BellIcon,
  TagIcon,
  ClipboardDocumentListIcon,
  ShieldCheckIcon,
  DocumentCheckIcon,
  EyeIcon
} from "@heroicons/react/24/outline";
import UserMenu from "../UserMenu";
import { useUserRole } from "../RequireRole";

type IconType = typeof HomeIcon;
type NavItem = { 
  to: string; 
  label: string; 
  icon: IconType; 
  end?: boolean; 
  roles?: ("employee" | "manager" | "admin")[];
};

const NAV_ITEMS: NavItem[] = [
  { to: "/", label: "Dashboard", icon: HomeIcon, end: true, roles: ["employee", "manager", "admin"] },
  { to: "/employee", label: "My Leave Apply", icon: UserIcon, roles: ["employee", "manager", "admin"] },
  { to: "/employee/calendar", label: "Calendar", icon: CalendarIcon, roles: ["employee", "manager", "admin"] },
  { to: "/admin/requests", label: "Requests", icon: DocumentTextIcon, roles: ["admin"] },
  { to: "/approvals", label: "Approval", icon: InboxIcon, roles: ["manager", "admin"] },
  { to: "/admin/leave-policies", label: "Entitlement", icon: TagIcon, roles: ["admin"] }
];

export default function AppShell({ children }: { children: React.ReactNode }) {
  const [dark, setDark] = useState(() => {
    // Initialize from localStorage or system preference
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('theme');
      if (stored) return stored === 'dark';
      return window.matchMedia('(prefers-color-scheme: dark)').matches;
    }
    return false;
  });
  const { data: userRole, isLoading: isRoleLoading } = useUserRole();

  useEffect(() => {
    document.documentElement.classList.toggle("dark", dark);
    localStorage.setItem('theme', dark ? 'dark' : 'light');
  }, [dark]);

  // Filter navigation items based on user role
  const filteredNavItems = NAV_ITEMS.filter(item => {
    if (!item.roles) return true; // Show items with no role restriction
    if (!userRole?.role) {
      // Show basic navigation if no role or loading
      return ["Dashboard", "My Leave Apply", "Calendar"].includes(item.label);
    }
    return item.roles.includes(userRole.role);
  });

  return (
    <div className="min-h-screen">
      {/* Top Bar */}
      <header className="sticky top-0 z-50 border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-black">
        <div className="container h-16 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <Link to="/" className="text-xl font-bold heading gradient-text">LeaveHub</Link>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              aria-label="Toggle dark mode"
              className="px-3 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              onClick={() => setDark(d => !d)}
              title={dark ? "Switch to light" : "Switch to dark"}
            >
              <span className="inline-flex items-center justify-center w-4 h-4">
                {dark ? "🌙" : "☀️"}
              </span>
            </button>
            <UserMenu />
          </div>
        </div>
      </header>

      {/* Layout */}
      <div className="flex">
        {/* Sidebar */}
        <aside className="w-64 flex-shrink-0">
          <div className="flex flex-col h-screen bg-white dark:bg-gray-950 border-r border-gray-200 dark:border-gray-800">
            <div className="flex-1 px-6 py-8 overflow-y-auto">
              <nav className="space-y-2">
                {isRoleLoading ? (
                  // Loading state for navigation
                  <div className="space-y-3">
                    {[1, 2, 3].map(i => (
                      <div key={i} className="flex items-center gap-3 px-4 py-3">
                        <div className="w-5 h-5 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
                        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse flex-1"></div>
                      </div>
                    ))}
                  </div>
                ) : (
                  filteredNavItems.map(({ to, label, icon: Icon, end }) => (
                    <NavLink
                      key={to}
                      to={to}
                      end={end}
                      className={({ isActive }) =>
                        [
                          "flex items-center gap-4 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200",
                          "hover:bg-gray-50 dark:hover:bg-gray-800/50 hover:shadow-sm",
                          isActive 
                            ? "bg-gradient-to-r from-teal-50 to-teal-50/50 dark:from-teal-900/30 dark:to-teal-900/10 text-teal-700 dark:text-teal-300 border-r-4 border-teal-500 shadow-sm" 
                            : "text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100"
                        ].join(" ")
                      }
                    >
                      <Icon className="w-5 h-5 transition-colors flex-shrink-0" aria-hidden />
                      <span className="truncate body">{label}</span>
                    </NavLink>
                  ))
                )}
                
                {/* Show role indicator */}
                {userRole?.role && (
                  <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
                    <div className="px-4 py-3 flex items-center justify-center">
                      <span className={[
                        "inline-flex items-center px-3 py-1.5 rounded-full text-xs font-semibold shadow-sm",
                        userRole.role === "admin" ? "bg-gradient-to-r from-red-50 to-red-100 text-red-700 dark:from-red-900/20 dark:to-red-800/20 dark:text-red-300 border border-red-200 dark:border-red-800" :
                        userRole.role === "manager" ? "bg-gradient-to-r from-blue-50 to-blue-100 text-blue-700 dark:from-blue-900/20 dark:to-blue-800/20 dark:text-blue-300 border border-blue-200 dark:border-blue-800" :
                        "bg-gradient-to-r from-emerald-50 to-emerald-100 text-emerald-700 dark:from-emerald-900/20 dark:to-emerald-800/20 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800"
                      ].join(" ")}>
                        {userRole.role.charAt(0).toUpperCase() + userRole.role.slice(1)}
                      </span>
                    </div>
                  </div>
                )}
              </nav>
            </div>
          </div>
        </aside>

        {/* Main */}
        <main className="flex-1 min-w-0 px-6 py-8 md:px-8 lg:px-12 overflow-x-auto">
          <div className="max-w-7xl mx-auto space-y-8">
            {children}
          </div>
        </main>
      </div>

      {/* Footer */}
      <footer className="border-t border-gray-200 dark:border-gray-800 bg-white dark:bg-black">
        <div className="container py-6 text-center text-sm subtle">
          © {new Date().getFullYear()} LeaveHub - Professional Leave Management
        </div>
      </footer>
    </div>
  );
}
