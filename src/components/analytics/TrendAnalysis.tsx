import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '../../lib/supabase';
import { format, subMonths, startOfMonth, endOfMonth } from 'date-fns';

interface TrendAnalysisProps {
  orgId: string;
  months?: number;
}

interface TrendData {
  month: string;
  requests: number;
  approved: number;
  denied: number;
  pending: number;
  totalDays: number;
  approvalRate: number;
  averageDays: number;
  leaveTypes: Record<string, number>;
}

async function fetchTrendData(orgId: string, months: number = 12): Promise<TrendData[]> {
  const endDate = new Date();
  const startDate = subMonths(endDate, months - 1);
  
  // Get all leave requests in the time range
  const { data: requests, error } = await supabase
    .from('leave_requests')
    .select(`
      id,
      start_date,
      end_date,
      leave_type,
      status,
      total_days,
      created_at,
      user_id
    `)
    .gte('created_at', startOfMonth(startDate).toISOString())
    .lte('created_at', endOfMonth(endDate).toISOString())
    .order('created_at');

  if (error) throw error;

  // Group by month
  const monthlyData = new Map<string, TrendData>();
  
  // Initialize all months
  for (let i = 0; i < months; i++) {
    const monthDate = subMonths(endDate, months - 1 - i);
    const monthKey = format(monthDate, 'yyyy-MM');
    monthlyData.set(monthKey, {
      month: format(monthDate, 'MMM yyyy'),
      requests: 0,
      approved: 0,
      denied: 0,
      pending: 0,
      totalDays: 0,
      approvalRate: 0,
      averageDays: 0,
      leaveTypes: {}
    });
  }

  // Populate with actual data
  requests?.forEach(request => {
    const monthKey = format(new Date(request.created_at), 'yyyy-MM');
    const data = monthlyData.get(monthKey);
    
    if (data) {
      data.requests++;
      
      switch (request.status) {
        case 'approved':
          data.approved++;
          data.totalDays += request.total_days || 0;
          break;
        case 'denied':
          data.denied++;
          break;
        case 'pending':
          data.pending++;
          break;
      }

      // Track leave types for approved requests
      if (request.status === 'approved' && request.leave_type) {
        data.leaveTypes[request.leave_type] = (data.leaveTypes[request.leave_type] || 0) + (request.total_days || 0);
      }
    }
  });

  // Calculate derived metrics
  monthlyData.forEach(data => {
    data.approvalRate = data.requests > 0 ? (data.approved / data.requests) * 100 : 0;
    data.averageDays = data.approved > 0 ? data.totalDays / data.approved : 0;
  });

  return Array.from(monthlyData.values());
}

export default function TrendAnalysis({ orgId, months = 12 }: TrendAnalysisProps) {
  const { data: trendData, isLoading } = useQuery({
    queryKey: ['trend-analysis', orgId, months],
    queryFn: () => fetchTrendData(orgId, months),
    enabled: !!orgId
  });

  const insights = useMemo(() => {
    if (!trendData || trendData.length < 2) return null;

    const latest = trendData[trendData.length - 1];
    const previous = trendData[trendData.length - 2];
    const yearAgo = trendData.length >= 12 ? trendData[trendData.length - 12] : null;

    // Calculate trends
    const requestsTrend = previous ? ((latest.requests - previous.requests) / (previous.requests || 1)) * 100 : 0;
    const daysTrend = previous ? ((latest.totalDays - previous.totalDays) / (previous.totalDays || 1)) * 100 : 0;
    const approvalTrend = previous ? latest.approvalRate - previous.approvalRate : 0;

    // Seasonal patterns
    const averageByMonth = Array(12).fill(0).map(() => ({ total: 0, count: 0 }));
    trendData.forEach(data => {
      const monthIndex = new Date(data.month + ' 1').getMonth();
      averageByMonth[monthIndex].total += data.requests;
      averageByMonth[monthIndex].count += 1;
    });

    const seasonalAverages = averageByMonth.map((data, index) => ({
      month: format(new Date(2024, index, 1), 'MMM'),
      average: data.count > 0 ? data.total / data.count : 0
    }));

    const peakMonths = seasonalAverages
      .sort((a, b) => b.average - a.average)
      .slice(0, 3)
      .map(m => m.month);

    return {
      requestsTrend: Math.round(requestsTrend * 10) / 10,
      daysTrend: Math.round(daysTrend * 10) / 10,
      approvalTrend: Math.round(approvalTrend * 10) / 10,
      peakMonths,
      yearOverYear: yearAgo ? {
        requests: Math.round(((latest.requests - yearAgo.requests) / (yearAgo.requests || 1)) * 100 * 10) / 10,
        days: Math.round(((latest.totalDays - yearAgo.totalDays) / (yearAgo.totalDays || 1)) * 100 * 10) / 10
      } : null
    };
  }, [trendData]);

  const getTrendIcon = (value: number) => {
    if (value > 5) return '📈';
    if (value < -5) return '📉';
    return '➡️';
  };

  const getTrendColor = (value: number, inverse = false) => {
    const isPositive = inverse ? value < 0 : value > 0;
    if (Math.abs(value) <= 5) return 'text-gray-600 dark:text-gray-400';
    return isPositive ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400';
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="skeleton h-64 rounded-lg"></div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="skeleton h-32 rounded-lg"></div>
          <div className="skeleton h-32 rounded-lg"></div>
          <div className="skeleton h-32 rounded-lg"></div>
        </div>
      </div>
    );
  }

  if (!trendData) return null;

  return (
    <div className="space-y-6">
      {/* Trend Insights */}
      {insights && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="card">
            <div className="card-body text-center">
              <div className="text-2xl mb-2">{getTrendIcon(insights.requestsTrend)}</div>
              <div className={[
                'text-2xl font-bold mb-1',
                getTrendColor(insights.requestsTrend)
              ].join(' ')}>
                {insights.requestsTrend > 0 ? '+' : ''}{insights.requestsTrend}%
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                Request Volume vs Last Month
              </div>
            </div>
          </div>

          <div className="card">
            <div className="card-body text-center">
              <div className="text-2xl mb-2">{getTrendIcon(insights.daysTrend)}</div>
              <div className={[
                'text-2xl font-bold mb-1',
                getTrendColor(insights.daysTrend)
              ].join(' ')}>
                {insights.daysTrend > 0 ? '+' : ''}{insights.daysTrend}%
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                Days Taken vs Last Month
              </div>
            </div>
          </div>

          <div className="card">
            <div className="card-body text-center">
              <div className="text-2xl mb-2">
                {insights.approvalTrend > 5 ? '✅' : insights.approvalTrend < -5 ? '❌' : '⚖️'}
              </div>
              <div className={[
                'text-2xl font-bold mb-1',
                getTrendColor(insights.approvalTrend, false)
              ].join(' ')}>
                {insights.approvalTrend > 0 ? '+' : ''}{insights.approvalTrend}%
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                Approval Rate Change
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Monthly Trend Chart */}
      <div className="card">
        <div className="card-header">
          <h3 className="card-title">Request Volume Trends</h3>
          <p className="card-subtle">Monthly leave requests and approval patterns</p>
        </div>
        <div className="card-body">
          <div className="space-y-4">
            {trendData.map((data, index) => {
              const maxRequests = Math.max(...trendData.map(d => d.requests));
              const requestWidth = maxRequests > 0 ? (data.requests / maxRequests) * 100 : 0;
              const approvedWidth = data.requests > 0 ? (data.approved / data.requests) * requestWidth : 0;
              
              return (
                <div key={data.month} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-sm">{data.month}</span>
                    <div className="flex items-center gap-4 text-sm">
                      <span className="text-gray-600 dark:text-gray-400">
                        {data.requests} requests
                      </span>
                      <span className="text-green-600 dark:text-green-400">
                        {data.approvalRate.toFixed(0)}% approved
                      </span>
                    </div>
                  </div>
                  
                  <div className="relative h-6 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                    <div 
                      className="absolute left-0 top-0 h-full bg-gray-400 dark:bg-gray-600 rounded-full transition-all duration-300"
                      style={{ width: `${requestWidth}%` }}
                    />
                    <div 
                      className="absolute left-0 top-0 h-full bg-green-500 rounded-full transition-all duration-300"
                      style={{ width: `${approvedWidth}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Approval Rate Chart */}
      <div className="card">
        <div className="card-header">
          <h3 className="card-title">Approval Rate Trends</h3>
          <p className="card-subtle">Monthly approval rates and average days per request</p>
        </div>
        <div className="card-body">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="space-y-3">
              <h4 className="font-medium">Approval Rates</h4>
              {trendData.slice(-6).map(data => (
                <div key={data.month} className="flex items-center justify-between">
                  <span className="text-sm">{data.month}</span>
                  <div className="flex items-center gap-2">
                    <div className="w-16 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-green-500 rounded-full transition-all duration-300"
                        style={{ width: `${data.approvalRate}%` }}
                      />
                    </div>
                    <span className="text-sm font-medium w-12">
                      {data.approvalRate.toFixed(0)}%
                    </span>
                  </div>
                </div>
              ))}
            </div>

            <div className="space-y-3">
              <h4 className="font-medium">Average Days per Request</h4>
              {trendData.slice(-6).map(data => {
                const maxDays = Math.max(...trendData.map(d => d.averageDays));
                const dayWidth = maxDays > 0 ? (data.averageDays / maxDays) * 100 : 0;
                
                return (
                  <div key={data.month} className="flex items-center justify-between">
                    <span className="text-sm">{data.month}</span>
                    <div className="flex items-center gap-2">
                      <div className="w-16 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-blue-500 rounded-full transition-all duration-300"
                          style={{ width: `${dayWidth}%` }}
                        />
                      </div>
                      <span className="text-sm font-medium w-12">
                        {data.averageDays.toFixed(1)}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Seasonal Insights */}
      {insights && (
        <div className="card bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border-blue-200 dark:border-blue-800/30">
          <div className="card-body">
            <div className="flex items-start gap-3">
              <span className="text-2xl">📊</span>
              <div>
                <h4 className="font-semibold text-blue-900 dark:text-blue-100 mb-3">
                  Key Insights
                </h4>
                <div className="space-y-2 text-sm text-blue-800 dark:text-blue-200">
                  <p>
                    <strong>Peak Months:</strong> {insights.peakMonths.join(', ')} typically see the highest leave volume
                  </p>
                  
                  {insights.yearOverYear && (
                    <p>
                      <strong>Year-over-Year:</strong> 
                      {insights.yearOverYear.requests > 0 ? ' ↗️ ' : insights.yearOverYear.requests < 0 ? ' ↘️ ' : ' → '}
                      Requests are {Math.abs(insights.yearOverYear.requests)}% 
                      {insights.yearOverYear.requests > 0 ? ' higher' : ' lower'} than last year
                    </p>
                  )}
                  
                  <p>
                    <strong>Recent Trend:</strong> 
                    {insights.requestsTrend > 5 ? ' Request volume is increasing' : 
                     insights.requestsTrend < -5 ? ' Request volume is decreasing' : 
                     ' Request volume is stable'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}