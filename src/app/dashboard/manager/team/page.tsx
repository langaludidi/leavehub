'use client';

import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Users,
  Calendar,
  Mail,
  Building2,
  ChevronLeft,
  Search,
  TrendingDown,
} from 'lucide-react';
import Link from 'next/link';
import DashboardHeader from '@/components/DashboardHeader';

interface LeaveBalance {
  id: string;
  year: number;
  entitled_days: number;
  used_days: number;
  available_days: number;
  leave_type: {
    id: string;
    name: string;
    code: string;
    color: string;
  };
}

interface TeamMember {
  id: string;
  clerk_user_id: string;
  email: string;
  first_name: string;
  last_name: string;
  role: string;
  department?: {
    id: string;
    name: string;
  };
  leave_balances: LeaveBalance[];
}

export default function TeamMembersPage() {
  const userId = 'demo-user-123';
  const managerId = userId;

  const [members, setMembers] = useState<TeamMember[]>([]);
  const [filteredMembers, setFilteredMembers] = useState<TeamMember[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTeamMembers();
  }, [managerId]);

  useEffect(() => {
    // Filter members based on search query
    if (searchQuery.trim() === '') {
      setFilteredMembers(members);
    } else {
      const query = searchQuery.toLowerCase();
      const filtered = members.filter(
        (member) =>
          member.first_name.toLowerCase().includes(query) ||
          member.last_name.toLowerCase().includes(query) ||
          member.email.toLowerCase().includes(query) ||
          member.department?.name.toLowerCase().includes(query)
      );
      setFilteredMembers(filtered);
    }
  }, [searchQuery, members]);

  async function fetchTeamMembers() {
    setLoading(true);
    try {
      const response = await fetch(`/api/team/members?managerId=${managerId}`);
      const data = await response.json();

      if (data.members) {
        setMembers(data.members);
        setFilteredMembers(data.members);
      }
    } catch (error) {
      console.error('Error fetching team members:', error);
    } finally {
      setLoading(false);
    }
  }

  function getTotalAvailableDays(member: TeamMember): number {
    return member.leave_balances.reduce(
      (sum, balance) => sum + balance.available_days,
      0
    );
  }

  function getTotalUsedDays(member: TeamMember): number {
    return member.leave_balances.reduce((sum, balance) => sum + balance.used_days, 0);
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <DashboardHeader userId={userId} userName="Demo Manager" />
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-center py-12">
            <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
            <p className="ml-3 text-gray-600">Loading team...</p>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <DashboardHeader userId={userId} userName="Demo Manager" />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-6">
          <Link href="/dashboard/manager">
            <Button variant="ghost" size="sm" className="mb-4">
              <ChevronLeft className="w-4 h-4 mr-1" />
              Back to Dashboard
            </Button>
          </Link>

          <h1 className="text-3xl font-bold text-gray-900 mb-2">Team Members</h1>
          <p className="text-gray-600">
            View your team members and their leave balances
          </p>
        </div>

        {/* Search and Stats */}
        <div className="grid md:grid-cols-4 gap-6 mb-6">
          <div className="md:col-span-1">
            <Card className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                  <Users className="w-6 h-6 text-primary" />
                </div>
                <span className="text-3xl font-bold text-primary">
                  {filteredMembers.length}
                </span>
              </div>
              <h3 className="font-semibold mb-1">Team Members</h3>
              <p className="text-sm text-gray-600">
                {searchQuery ? 'Filtered' : 'Total team size'}
              </p>
            </Card>
          </div>

          <div className="md:col-span-3">
            <Card className="p-6">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search by name, email, or department..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
            </Card>
          </div>
        </div>

        {/* Team Members List */}
        {filteredMembers.length === 0 ? (
          <Card className="p-12 text-center">
            <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              {searchQuery ? 'No members found' : 'No team members'}
            </h3>
            <p className="text-gray-600">
              {searchQuery
                ? 'Try adjusting your search criteria'
                : 'Add team members to your department'}
            </p>
          </Card>
        ) : (
          <div className="grid gap-6">
            {filteredMembers.map((member) => (
              <Card key={member.id} className="p-6 hover:shadow-lg transition-shadow">
                <div className="flex items-start justify-between mb-6">
                  <div className="flex items-start gap-4">
                    <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="text-xl font-bold text-primary">
                        {member.first_name.charAt(0)}
                        {member.last_name.charAt(0)}
                      </span>
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold text-gray-900 mb-1">
                        {member.first_name} {member.last_name}
                      </h3>
                      <div className="flex items-center gap-4 text-sm text-gray-600">
                        <div className="flex items-center gap-1">
                          <Mail className="w-4 h-4" />
                          {member.email}
                        </div>
                        {member.department && (
                          <div className="flex items-center gap-1">
                            <Building2 className="w-4 h-4" />
                            {member.department.name}
                          </div>
                        )}
                      </div>
                      <div className="flex items-center gap-2 mt-2">
                        <span className="px-2 py-1 text-xs font-medium bg-gray-100 text-gray-700 rounded">
                          {member.role}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="flex items-center gap-2 mb-1">
                      <TrendingDown className="w-4 h-4 text-gray-500" />
                      <span className="text-sm text-gray-600">Total Available</span>
                    </div>
                    <p className="text-3xl font-bold text-primary">
                      {getTotalAvailableDays(member)}
                    </p>
                    <p className="text-sm text-gray-600">
                      {getTotalUsedDays(member)} used this year
                    </p>
                  </div>
                </div>

                {/* Leave Balances */}
                <div className="border-t pt-4">
                  <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    Leave Balances ({new Date().getFullYear()})
                  </h4>

                  {member.leave_balances.length === 0 ? (
                    <p className="text-sm text-gray-600">No leave balances configured</p>
                  ) : (
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {member.leave_balances.map((balance) => {
                        const percentage =
                          (balance.available_days / balance.entitled_days) * 100;

                        return (
                          <div
                            key={balance.id}
                            className="p-4 border border-gray-200 rounded-lg"
                          >
                            <div className="flex items-center justify-between mb-3">
                              <div className="flex items-center gap-2">
                                <div
                                  className="w-3 h-3 rounded-full"
                                  style={{ backgroundColor: balance.leave_type.color }}
                                ></div>
                                <span className="font-medium text-sm">
                                  {balance.leave_type.name}
                                </span>
                              </div>
                              <span className="text-xs font-medium text-gray-600">
                                {balance.leave_type.code}
                              </span>
                            </div>

                            <div className="mb-3">
                              <div className="flex items-center justify-between mb-1">
                                <span className="text-2xl font-bold text-gray-900">
                                  {balance.available_days}
                                </span>
                                <span className="text-xs text-gray-600">
                                  / {balance.entitled_days} days
                                </span>
                              </div>
                              <div className="w-full bg-gray-200 rounded-full h-2">
                                <div
                                  className="h-2 rounded-full transition-all"
                                  style={{
                                    backgroundColor: balance.leave_type.color,
                                    width: `${Math.min(100, percentage)}%`,
                                  }}
                                ></div>
                              </div>
                            </div>

                            <div className="flex justify-between text-xs text-gray-600">
                              <span>Used: {balance.used_days}</span>
                              <span>Available: {balance.available_days}</span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
