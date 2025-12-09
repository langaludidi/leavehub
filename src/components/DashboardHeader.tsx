'use client';

import { Bell, Menu, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import NotificationBell from './NotificationBell';
import RoleBasedNav from './RoleBasedNav';

interface DashboardHeaderProps {
  userId?: string;
  userName?: string;
}

export default function DashboardHeader({
  userId = 'demo-user-123',
  userName = 'Demo User'
}: DashboardHeaderProps) {
  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo/Brand */}
          <div className="flex items-center gap-8">
            <Link href="/dashboard" className="flex items-center gap-2">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg">L</span>
              </div>
              <span className="text-xl font-bold text-gray-900">LeaveHub</span>
            </Link>

            {/* Role-Based Navigation */}
            <RoleBasedNav />
          </div>

          {/* Right side - Notifications and User */}
          <div className="flex items-center gap-3">
            {/* Notification Bell */}
            <NotificationBell userId={userId} />

            {/* User Menu */}
            <div className="flex items-center gap-2 pl-3 border-l">
              <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                <User className="w-4 h-4 text-white" />
              </div>
              <div className="hidden sm:block">
                <p className="text-sm font-medium text-gray-900">{userName}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
