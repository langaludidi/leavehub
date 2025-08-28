import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '../../lib/supabase';
import { format, addMonths, subMonths, startOfMonth, endOfMonth } from 'date-fns';

interface PredictiveInsightsProps {
  orgId: string;
}

interface ForecastData {
  month: string;
  predicted: number;
  confidence: number;
  factors: string[];
}

interface SeasonalPattern {
  month: number;
  averageRequests: number;
  trend: 'high' | 'medium' | 'low';
}

interface RiskAlert {
  type: 'capacity' | 'trend' | 'seasonal';
  severity: 'high' | 'medium' | 'low';
  message: string;
  recommendation: string;
  affectedDepartments?: string[];
}

async function fetchPredictiveData(orgId: string) {
  // Get historical data for the last 24 months
  const startDate = subMonths(new Date(), 24);
  const endDate = new Date();

  const { data: requests } = await supabase
    .from('leave_requests')
    .select(`
      id,
      created_at,
      start_date,
      leave_type,
      status,
      total_days,
      user_id
    `)
    .gte('created_at', startOfMonth(startDate).toISOString())
    .lte('created_at', endOfMonth(endDate).toISOString())
    .eq('status', 'approved');

  const { data: members } = await supabase
    .from('org_members')
    .select('user_id, department')
    .eq('org_id', orgId)
    .eq('active', true);

  if (!requests || !members) {
    throw new Error('Failed to fetch data');
  }

  // Group data by month
  const monthlyData = new Map<string, { requests: number; days: number }>();
  
  requests.forEach(request => {
    const monthKey = format(new Date(request.created_at), 'yyyy-MM');
    const existing = monthlyData.get(monthKey) || { requests: 0, days: 0 };
    monthlyData.set(monthKey, {
      requests: existing.requests + 1,
      days: existing.days + (request.total_days || 0)
    });
  });

  // Calculate seasonal patterns (by calendar month)
  const seasonalData = Array(12).fill(0).map(() => ({ total: 0, count: 0 }));
  
  Array.from(monthlyData.entries()).forEach(([monthKey, data]) => {
    const monthIndex = new Date(monthKey + '-01').getMonth();
    seasonalData[monthIndex].total += data.requests;
    seasonalData[monthIndex].count += 1;
  });

  const seasonalPatterns: SeasonalPattern[] = seasonalData.map((data, index) => {
    const average = data.count > 0 ? data.total / data.count : 0;
    let trend: 'high' | 'medium' | 'low' = 'medium';
    
    if (average > 8) trend = 'high';
    else if (average < 4) trend = 'low';
    
    return {
      month: index,
      averageRequests: Math.round(average * 10) / 10,
      trend
    };
  });

  // Generate forecast for next 6 months
  const forecast: ForecastData[] = [];
  const currentMonth = new Date();
  
  for (let i = 1; i <= 6; i++) {
    const futureMonth = addMonths(currentMonth, i);
    const monthIndex = futureMonth.getMonth();
    const seasonalPattern = seasonalPatterns[monthIndex];
    
    // Simple forecasting based on seasonal patterns and recent trends
    const recentMonths = Array.from(monthlyData.entries())
      .slice(-6)
      .map(([_, data]) => data.requests);
    
    const recentAverage = recentMonths.reduce((sum, val) => sum + val, 0) / recentMonths.length;
    const seasonalAdjustment = seasonalPattern.averageRequests / 
      (seasonalPatterns.reduce((sum, p) => sum + p.averageRequests, 0) / 12);
    
    const predicted = Math.round(recentAverage * seasonalAdjustment);
    const confidence = Math.min(95, Math.max(60, 85 - (i * 3))); // Confidence decreases over time
    
    const factors = [];
    if (seasonalPattern.trend === 'high') factors.push('High seasonal demand');
    if (seasonalPattern.trend === 'low') factors.push('Low seasonal demand');
    if (i <= 2) factors.push('Recent trend analysis');
    
    forecast.push({
      month: format(futureMonth, 'MMM yyyy'),
      predicted,
      confidence,
      factors
    });
  }

  // Generate risk alerts
  const riskAlerts: RiskAlert[] = [];

  // Check for upcoming high-demand periods
  const highDemandMonths = forecast.filter(f => f.predicted > recentMonths[recentMonths.length - 1] * 1.5);
  if (highDemandMonths.length > 0) {
    riskAlerts.push({
      type: 'seasonal',
      severity: 'medium',
      message: `Expected ${highDemandMonths.length} high-demand month(s) ahead`,
      recommendation: 'Consider implementing leave blackout periods or requiring advance notice'
    });
  }

  // Check for capacity issues
  const totalEmployees = members.length;
  const highRiskMonths = forecast.filter(f => f.predicted > totalEmployees * 0.3);
  if (highRiskMonths.length > 0) {
    riskAlerts.push({
      type: 'capacity',
      severity: 'high',
      message: `Risk of understaffing in ${highRiskMonths.length} upcoming month(s)`,
      recommendation: 'Plan for temporary staff or limit concurrent leave approvals'
    });
  }

  // Check for unusual trends
  const trendAnalysis = recentMonths.slice(-3).every((val, idx, arr) => 
    idx === 0 || val > arr[idx - 1]
  );
  
  if (trendAnalysis) {
    riskAlerts.push({
      type: 'trend',
      severity: 'medium',
      message: 'Leave requests have been consistently increasing',
      recommendation: 'Monitor closely and consider policy adjustments if trend continues'
    });
  }

  return {
    forecast,
    seasonalPatterns,
    riskAlerts,
    totalEmployees
  };
}

export default function PredictiveInsights({ orgId }: PredictiveInsightsProps) {
  const { data, isLoading } = useQuery({
    queryKey: ['predictive-insights', orgId],
    queryFn: () => fetchPredictiveData(orgId),
    enabled: !!orgId
  });

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'high': return 'bg-red-50 border-red-200 text-red-700 dark:bg-red-900/20 dark:border-red-800 dark:text-red-300';
      case 'medium': return 'bg-yellow-50 border-yellow-200 text-yellow-700 dark:bg-yellow-900/20 dark:border-yellow-800 dark:text-yellow-300';
      case 'low': return 'bg-blue-50 border-blue-200 text-blue-700 dark:bg-blue-900/20 dark:border-blue-800 dark:text-blue-300';
      default: return 'bg-gray-50 border-gray-200 text-gray-700 dark:bg-gray-900/20 dark:border-gray-800 dark:text-gray-300';
    }
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'high': return '🚨';
      case 'medium': return '⚠️';
      case 'low': return 'ℹ️';
      default: return '📊';
    }
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 85) return 'text-green-600 dark:text-green-400';
    if (confidence >= 70) return 'text-yellow-600 dark:text-yellow-400';
    return 'text-red-600 dark:text-red-400';
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="skeleton h-32 rounded-lg"></div>
        <div className="skeleton h-64 rounded-lg"></div>
        <div className="skeleton h-48 rounded-lg"></div>
      </div>
    );
  }

  if (!data) return null;

  return (
    <div className="space-y-6">
      {/* Risk Alerts */}
      {data.riskAlerts.length > 0 && (
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">Risk Alerts</h3>
            <p className="card-subtle">Potential issues requiring attention</p>
          </div>
          <div className="card-body">
            <div className="space-y-4">
              {data.riskAlerts.map((alert, index) => (
                <div
                  key={index}
                  className={[
                    'p-4 rounded-lg border',
                    getSeverityColor(alert.severity)
                  ].join(' ')}
                >
                  <div className="flex items-start gap-3">
                    <div className="text-2xl">{getSeverityIcon(alert.severity)}</div>
                    <div className="flex-1">
                      <div className="font-semibold mb-1">{alert.message}</div>
                      <div className="text-sm mb-2">{alert.recommendation}</div>
                      {alert.affectedDepartments && (
                        <div className="text-xs">
                          Affected: {alert.affectedDepartments.join(', ')}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 6-Month Forecast */}
      <div className="card">
        <div className="card-header">
          <h3 className="card-title">6-Month Forecast</h3>
          <p className="card-subtle">Predicted leave request volume</p>
        </div>
        <div className="card-body">
          <div className="space-y-4">
            {data.forecast.map((item, index) => {
              const maxPredicted = Math.max(...data.forecast.map(f => f.predicted));
              const barWidth = maxPredicted > 0 ? (item.predicted / maxPredicted) * 100 : 0;
              
              return (
                <div key={index} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="font-medium">{item.month}</span>
                      <span className={[
                        'ml-2 text-sm font-medium',
                        getConfidenceColor(item.confidence)
                      ].join(' ')}>
                        {item.confidence}% confidence
                      </span>
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-teal-600 dark:text-teal-400">
                        {item.predicted} requests
                      </div>
                    </div>
                  </div>
                  
                  <div className="relative h-4 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                    <div 
                      className="absolute left-0 top-0 h-full bg-gradient-to-r from-teal-400 to-teal-600 rounded-full transition-all duration-300"
                      style={{ width: `${barWidth}%` }}
                    />
                  </div>
                  
                  {item.factors.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {item.factors.map((factor, factorIndex) => (
                        <span
                          key={factorIndex}
                          className="px-2 py-1 text-xs bg-gray-100 dark:bg-gray-800 rounded-full"
                        >
                          {factor}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Seasonal Patterns */}
      <div className="card">
        <div className="card-header">
          <h3 className="card-title">Seasonal Patterns</h3>
          <p className="card-subtle">Historical demand by month</p>
        </div>
        <div className="card-body">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {data.seasonalPatterns.map((pattern, index) => {
              const monthName = format(new Date(2024, index, 1), 'MMM');
              const trendColor = {
                high: 'bg-red-100 text-red-700 dark:bg-red-900/20 dark:text-red-300',
                medium: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/20 dark:text-yellow-300',
                low: 'bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-300'
              };
              
              return (
                <div
                  key={index}
                  className={[
                    'p-3 rounded-lg text-center border',
                    trendColor[pattern.trend]
                  ].join(' ')}
                >
                  <div className="font-medium">{monthName}</div>
                  <div className="text-2xl font-bold">
                    {pattern.averageRequests}
                  </div>
                  <div className="text-xs capitalize">{pattern.trend} demand</div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Recommendations */}
      <div className="card bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border-blue-200 dark:border-blue-800/30">
        <div className="card-body">
          <div className="flex items-start gap-3">
            <span className="text-2xl">🎯</span>
            <div>
              <h4 className="font-semibold text-blue-900 dark:text-blue-100 mb-3">
                Strategic Recommendations
              </h4>
              <div className="space-y-2 text-sm text-blue-800 dark:text-blue-200">
                <p>
                  <strong>Capacity Planning:</strong> With {data.totalEmployees} employees, 
                  monitor months with &gt;{Math.round(data.totalEmployees * 0.2)} predicted requests
                </p>
                
                <p>
                  <strong>Policy Adjustments:</strong> Consider implementing advance notice requirements 
                  during high-demand months (typically summer and winter holiday periods)
                </p>
                
                <p>
                  <strong>Staffing Strategy:</strong> Plan temporary coverage or cross-training 
                  programs for departments with seasonal leave patterns
                </p>
                
                <p>
                  <strong>Budget Planning:</strong> Account for increased overtime costs 
                  during predicted high-leave periods
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}