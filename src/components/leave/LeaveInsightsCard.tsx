'use client';

import { useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Sparkles, TrendingUp, AlertCircle, CheckCircle, Info, RefreshCw } from 'lucide-react';

interface Insight {
  type: 'positive' | 'warning' | 'neutral' | 'recommendation';
  title: string;
  description: string;
  action?: string;
}

interface HealthScore {
  score: number;
  label: 'excellent' | 'good' | 'fair' | 'concerning';
  reasoning: string;
}

interface LeaveInsights {
  insights: Insight[];
  summary: string;
  recommendations: string[];
  healthScore: HealthScore;
}

interface LeaveInsightsCardProps {
  userId: string;
}

export default function LeaveInsightsCard({ userId }: LeaveInsightsCardProps) {
  const [insights, setInsights] = useState<LeaveInsights | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchInsights();
  }, [userId]);

  async function fetchInsights() {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/ai/leave-insights', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          year: new Date().getFullYear(),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch insights');
      }

      if (data.insights) {
        setInsights(data.insights);
      }
    } catch (err) {
      console.error('Error fetching leave insights:', err);
      setError(err instanceof Error ? err.message : 'Failed to load insights');
    } finally {
      setLoading(false);
    }
  }

  function getInsightIcon(type: string) {
    switch (type) {
      case 'positive':
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'warning':
        return <AlertCircle className="w-5 h-5 text-yellow-600" />;
      case 'recommendation':
        return <Sparkles className="w-5 h-5 text-blue-600" />;
      default:
        return <Info className="w-5 h-5 text-gray-600" />;
    }
  }

  function getHealthScoreColor(label: string) {
    switch (label) {
      case 'excellent':
        return 'bg-green-100 text-green-800 border-green-300';
      case 'good':
        return 'bg-blue-100 text-blue-800 border-blue-300';
      case 'fair':
        return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'concerning':
        return 'bg-red-100 text-red-800 border-red-300';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  }

  if (error && !insights) {
    return (
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-primary" />
            <h3 className="font-semibold text-gray-900">AI Leave Insights</h3>
          </div>
        </div>
        <p className="text-sm text-gray-600 mb-4">
          AI-powered insights are currently unavailable. This feature requires the ANTHROPIC_API_KEY to be configured.
        </p>
      </Card>
    );
  }

  if (loading && !insights) {
    return (
      <Card className="p-6">
        <div className="flex items-center gap-3 mb-4">
          <Sparkles className="w-5 h-5 text-primary" />
          <h3 className="font-semibold text-gray-900">AI Leave Insights</h3>
        </div>
        <div className="flex items-center justify-center py-8">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
          <p className="ml-3 text-gray-600">Analyzing your leave patterns...</p>
        </div>
      </Card>
    );
  }

  if (!insights) {
    return null;
  }

  return (
    <Card className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-primary" />
          <h3 className="font-semibold text-gray-900">AI Leave Insights</h3>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={fetchInsights}
          disabled={loading}
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
        </Button>
      </div>

      {/* Health Score */}
      {insights.healthScore && (
        <div className={`p-4 rounded-lg border-2 mb-6 ${getHealthScoreColor(insights.healthScore.label)}`}>
          <div className="flex items-center justify-between mb-2">
            <span className="font-semibold">Leave Health Score</span>
            <span className="text-2xl font-bold">{insights.healthScore.score}/100</span>
          </div>
          <p className="text-sm">{insights.healthScore.reasoning}</p>
        </div>
      )}

      {/* Summary */}
      {insights.summary && (
        <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex items-start gap-3">
            <TrendingUp className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-blue-900">{insights.summary}</p>
          </div>
        </div>
      )}

      {/* Insights List */}
      <div className="space-y-4 mb-6">
        {insights.insights?.slice(0, 4).map((insight, index) => (
          <div
            key={index}
            className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg border border-gray-200"
          >
            {getInsightIcon(insight.type)}
            <div className="flex-1">
              <h4 className="font-medium text-gray-900 text-sm mb-1">{insight.title}</h4>
              <p className="text-sm text-gray-600">{insight.description}</p>
              {insight.action && (
                <p className="text-sm text-primary font-medium mt-2">→ {insight.action}</p>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Recommendations */}
      {insights.recommendations && insights.recommendations.length > 0 && (
        <div>
          <h4 className="font-medium text-gray-900 mb-3 flex items-center gap-2">
            <Sparkles className="w-4 h-4" />
            Recommendations
          </h4>
          <ul className="space-y-2">
            {insights.recommendations.map((rec, index) => (
              <li key={index} className="flex items-start gap-2 text-sm text-gray-700">
                <span className="text-primary mt-1">•</span>
                <span>{rec}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </Card>
  );
}
