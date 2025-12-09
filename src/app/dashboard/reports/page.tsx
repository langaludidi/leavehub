'use client';

import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell,
} from 'recharts';
import {
  TrendingUp,
  Users,
  Calendar,
  Download,
  Filter,
  BarChart3,
  PieChart as PieChartIcon,
  FileText,
} from 'lucide-react';

interface AnalyticsData {
  summary: {
    totalDaysUsed: number;
    totalRequests: number;
    approvedRequests: number;
    pendingRequests: number;
    approvalRate: number;
    totalEntitled: number;
    totalUsed: number;
    totalAvailable: number;
  };
  usageByStatus: {
    approved: number;
    pending: number;
    rejected: number;
  };
  leaveByType: Array<{
    name: string;
    code: string;
    color: string;
    days: number;
    count: number;
  }>;
  leaveByDepartment: Array<{
    department: string;
    days: number;
    count: number;
  }>;
  monthlyTrends: Array<{
    month: string;
    days: number;
    requests: number;
  }>;
  employeeUtilization: Array<{
    name: string;
    department: string;
    entitled: number;
    used: number;
    available: number;
    utilizationRate: number;
  }>;
  period: {
    startDate: string;
    endDate: string;
  };
}

export default function ReportsPage() {
  const userId = 'demo-user-123';
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [startDate, setStartDate] = useState('2025-01-01');
  const [endDate, setEndDate] = useState('2025-12-31');

  useEffect(() => {
    fetchAnalytics();
  }, [startDate, endDate]);

  async function fetchAnalytics() {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        userId,
        startDate,
        endDate,
      });

      const response = await fetch(`/api/reports/analytics?${params}`);
      const data = await response.json();

      if (response.ok) {
        setAnalytics(data);
      }
    } catch (error) {
      console.error('Error fetching analytics:', error);
    } finally {
      setLoading(false);
    }
  }

  function exportToCSV() {
    if (!analytics) return;

    const csvData = [
      ['LeaveHub Analytics Report'],
      ['Period', `${analytics.period.startDate} to ${analytics.period.endDate}`],
      [''],
      ['Summary'],
      ['Total Days Used', analytics.summary.totalDaysUsed],
      ['Total Requests', analytics.summary.totalRequests],
      ['Approval Rate', `${analytics.summary.approvalRate}%`],
      [''],
      ['Leave by Type'],
      ['Type', 'Days', 'Count'],
      ...analytics.leaveByType.map(item => [item.name, item.days, item.count]),
      [''],
      ['Leave by Department'],
      ['Department', 'Days', 'Count'],
      ...analytics.leaveByDepartment.map(item => [item.department, item.days, item.count]),
    ];

    const csv = csvData.map(row => row.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `leavehub-report-${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-center py-12">
            <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
            <p className="ml-3 text-gray-600">Loading analytics...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!analytics) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-7xl mx-auto">
          <Card className="p-12 text-center">
            <BarChart3 className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              No data available
            </h3>
            <p className="text-gray-600">
              Unable to load analytics data. Please try again.
            </p>
          </Card>
        </div>
      </div>
    );
  }

  const statusData = [
    { name: 'Approved', value: analytics.usageByStatus.approved, color: '#10B981' },
    { name: 'Pending', value: analytics.usageByStatus.pending, color: '#F59E0B' },
    { name: 'Rejected', value: analytics.usageByStatus.rejected, color: '#EF4444' },
  ];

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Reports & Analytics
            </h1>
            <p className="text-gray-600">
              Comprehensive leave management insights and reporting
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="outline" onClick={exportToCSV}>
              <Download className="w-4 h-4 mr-2" />
              Export CSV
            </Button>
            <Button variant="outline">
              <FileText className="w-4 h-4 mr-2" />
              Export PDF
            </Button>
          </div>
        </div>

        {/* Date Range Filters */}
        <Card className="p-4 mb-6">
          <div className="flex items-center gap-4">
            <Filter className="w-4 h-4 text-gray-600" />
            <div className="flex items-center gap-2">
              <label className="text-sm font-medium text-gray-700">From:</label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="px-3 py-1.5 border border-gray-300 rounded-md text-sm"
              />
            </div>
            <div className="flex items-center gap-2">
              <label className="text-sm font-medium text-gray-700">To:</label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="px-3 py-1.5 border border-gray-300 rounded-md text-sm"
              />
            </div>
            <Button size="sm" onClick={fetchAnalytics}>
              Apply
            </Button>
          </div>
        </Card>

        {/* Summary Cards */}
        <div className="grid md:grid-cols-4 gap-6 mb-6">
          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                <Calendar className="w-6 h-6 text-primary" />
              </div>
              <span className="text-2xl font-bold text-primary">
                {analytics.summary.totalDaysUsed}
              </span>
            </div>
            <h3 className="font-semibold mb-1">Days Used</h3>
            <p className="text-sm text-gray-600">Total approved leave days</p>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <FileText className="w-6 h-6 text-blue-600" />
              </div>
              <span className="text-2xl font-bold text-blue-600">
                {analytics.summary.totalRequests}
              </span>
            </div>
            <h3 className="font-semibold mb-1">Total Requests</h3>
            <p className="text-sm text-gray-600">All leave requests</p>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-green-600" />
              </div>
              <span className="text-2xl font-bold text-green-600">
                {analytics.summary.approvalRate}%
              </span>
            </div>
            <h3 className="font-semibold mb-1">Approval Rate</h3>
            <p className="text-sm text-gray-600">Approved vs total</p>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-amber-100 rounded-lg flex items-center justify-center">
                <Users className="w-6 h-6 text-amber-600" />
              </div>
              <span className="text-2xl font-bold text-amber-600">
                {analytics.summary.totalAvailable}
              </span>
            </div>
            <h3 className="font-semibold mb-1">Days Available</h3>
            <p className="text-sm text-gray-600">Remaining leave balance</p>
          </Card>
        </div>

        {/* Tabs for Different Reports */}
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="bg-white p-1 rounded-lg shadow-sm">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="types">Leave Types</TabsTrigger>
            <TabsTrigger value="departments">Departments</TabsTrigger>
            <TabsTrigger value="trends">Trends</TabsTrigger>
            <TabsTrigger value="employees">Employees</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <Card className="p-6">
                <h3 className="text-lg font-semibold mb-4">Leave Status Distribution</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={statusData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={(entry) => `${entry.name}: ${entry.value}`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {statusData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </Card>

              <Card className="p-6">
                <h3 className="text-lg font-semibold mb-4">Monthly Leave Trends</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={analytics.monthlyTrends}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="days" stroke="#0D9488" strokeWidth={2} name="Days" />
                    <Line type="monotone" dataKey="requests" stroke="#3B82F6" strokeWidth={2} name="Requests" />
                  </LineChart>
                </ResponsiveContainer>
              </Card>
            </div>
          </TabsContent>

          {/* Leave Types Tab */}
          <TabsContent value="types">
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">Leave by Type</h3>
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={analytics.leaveByType}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="days" name="Days" fill="#0D9488" />
                  <Bar dataKey="count" name="Requests" fill="#3B82F6" />
                </BarChart>
              </ResponsiveContainer>

              <div className="mt-6 space-y-3">
                {analytics.leaveByType.map((item, index) => (
                  <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div
                        className="w-4 h-4 rounded"
                        style={{ backgroundColor: item.color }}
                      ></div>
                      <div>
                        <p className="font-medium text-gray-900">{item.name}</p>
                        <p className="text-sm text-gray-600">{item.code}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-gray-900">{item.days} days</p>
                      <p className="text-sm text-gray-600">{item.count} requests</p>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </TabsContent>

          {/* Departments Tab */}
          <TabsContent value="departments">
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">Leave by Department</h3>
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={analytics.leaveByDepartment} layout="horizontal">
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" />
                  <YAxis dataKey="department" type="category" width={120} />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="days" name="Days" fill="#0D9488" />
                </BarChart>
              </ResponsiveContainer>
            </Card>
          </TabsContent>

          {/* Trends Tab */}
          <TabsContent value="trends">
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">Leave Trends Over Time</h3>
              <ResponsiveContainer width="100%" height={400}>
                <LineChart data={analytics.monthlyTrends}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis yAxisId="left" />
                  <YAxis yAxisId="right" orientation="right" />
                  <Tooltip />
                  <Legend />
                  <Line
                    yAxisId="left"
                    type="monotone"
                    dataKey="days"
                    stroke="#0D9488"
                    strokeWidth={3}
                    name="Days"
                  />
                  <Line
                    yAxisId="right"
                    type="monotone"
                    dataKey="requests"
                    stroke="#3B82F6"
                    strokeWidth={3}
                    name="Requests"
                  />
                </LineChart>
              </ResponsiveContainer>
            </Card>
          </TabsContent>

          {/* Employees Tab */}
          <TabsContent value="employees">
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">Employee Utilization</h3>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">Employee</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">Department</th>
                      <th className="text-right py-3 px-4 font-semibold text-gray-700">Entitled</th>
                      <th className="text-right py-3 px-4 font-semibold text-gray-700">Used</th>
                      <th className="text-right py-3 px-4 font-semibold text-gray-700">Available</th>
                      <th className="text-right py-3 px-4 font-semibold text-gray-700">Utilization</th>
                    </tr>
                  </thead>
                  <tbody>
                    {analytics.employeeUtilization.map((employee, index) => (
                      <tr key={index} className="border-b border-gray-100 hover:bg-gray-50">
                        <td className="py-3 px-4">{employee.name}</td>
                        <td className="py-3 px-4 text-gray-600">{employee.department}</td>
                        <td className="py-3 px-4 text-right">{employee.entitled}</td>
                        <td className="py-3 px-4 text-right">{employee.used}</td>
                        <td className="py-3 px-4 text-right">{employee.available}</td>
                        <td className="py-3 px-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <div className="w-24 bg-gray-200 rounded-full h-2">
                              <div
                                className="bg-primary h-2 rounded-full"
                                style={{ width: `${employee.utilizationRate}%` }}
                              ></div>
                            </div>
                            <span className="font-medium">{employee.utilizationRate}%</span>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
