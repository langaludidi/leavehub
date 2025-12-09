'use client';

import { useState } from 'react';
import DashboardHeader from '@/components/DashboardHeader';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Sparkles, Calendar, Users, AlertTriangle, CheckCircle, Lightbulb } from 'lucide-react';

interface AISuggestion {
  startDate: string;
  endDate: string;
  reason: string;
  benefits: string[];
}

interface AIResponse {
  assessment: {
    isOptimal: boolean;
    reason: string;
  };
  conflicts: Array<{
    severity: 'low' | 'medium' | 'high';
    description: string;
    affectedEmployees: string[];
  }>;
  suggestions: AISuggestion[];
  balanceWarning: string | null;
}

export default function AILeavePlannerPage() {
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [leaveType, setLeaveType] = useState('annual');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<AIResponse | null>(null);
  const [error, setError] = useState('');

  const handleAnalyze = async () => {
    if (!startDate || !endDate) {
      setError('Please select both start and end dates');
      return;
    }

    setLoading(true);
    setError('');
    setResult(null);

    try {
      const response = await fetch('/api/ai/leave-planner', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          startDate,
          endDate,
          leaveType,
          userId: 'demo-user-123',
          department: 'Engineering',
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to get AI suggestions');
      }

      const data = await response.json();
      setResult(data.suggestions);
    } catch (err) {
      console.error('AI planner error:', err);
      setError('Failed to analyze leave dates. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'high': return 'text-red-600 bg-red-50 border-red-200';
      case 'medium': return 'text-orange-600 bg-orange-50 border-orange-200';
      case 'low': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <DashboardHeader />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <Sparkles className="w-8 h-8 text-purple-600" />
            <h1 className="text-3xl font-bold text-gray-900">AI Leave Planner</h1>
          </div>
          <p className="text-gray-600">
            Get intelligent suggestions for optimal leave dates based on team schedules, public holidays, and your leave balance.
          </p>
        </div>

        {/* Input Form */}
        <Card className="p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Plan Your Leave</h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Start Date
              </label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                End Date
              </label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Leave Type
              </label>
              <select
                value={leaveType}
                onChange={(e) => setLeaveType(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
              >
                <option value="annual">Annual Leave</option>
                <option value="sick">Sick Leave</option>
                <option value="family">Family Responsibility</option>
                <option value="maternity">Maternity Leave</option>
                <option value="study">Study Leave</option>
              </select>
            </div>
          </div>

          <Button
            onClick={handleAnalyze}
            disabled={loading}
            className="w-full bg-purple-600 hover:bg-purple-700 text-white"
          >
            {loading ? (
              <>
                <Sparkles className="w-4 h-4 mr-2 animate-spin" />
                Analyzing with AI...
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 mr-2" />
                Get AI Suggestions
              </>
            )}
          </Button>

          {error && (
            <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
              {error}
            </div>
          )}
        </Card>

        {/* Results */}
        {result && (
          <div className="space-y-6">
            {/* Assessment */}
            <Card className="p-6">
              <div className="flex items-start gap-3">
                {result.assessment.isOptimal ? (
                  <CheckCircle className="w-6 h-6 text-green-600 flex-shrink-0 mt-1" />
                ) : (
                  <AlertTriangle className="w-6 h-6 text-orange-600 flex-shrink-0 mt-1" />
                )}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-1">
                    {result.assessment.isOptimal ? 'Great Choice!' : 'Consider Alternatives'}
                  </h3>
                  <p className="text-gray-600">{result.assessment.reason}</p>
                </div>
              </div>
            </Card>

            {/* Balance Warning */}
            {result.balanceWarning && (
              <Card className="p-6 bg-yellow-50 border-yellow-200">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="w-6 h-6 text-yellow-600 flex-shrink-0 mt-1" />
                  <div>
                    <h3 className="text-lg font-semibold text-yellow-900 mb-1">
                      Balance Alert
                    </h3>
                    <p className="text-yellow-700">{result.balanceWarning}</p>
                  </div>
                </div>
              </Card>
            )}

            {/* Conflicts */}
            {result.conflicts && result.conflicts.length > 0 && (
              <Card className="p-6">
                <div className="flex items-center gap-2 mb-4">
                  <Users className="w-6 h-6 text-blue-600" />
                  <h3 className="text-lg font-semibold text-gray-900">Team Conflicts</h3>
                </div>
                <div className="space-y-3">
                  {result.conflicts.map((conflict, index) => (
                    <div
                      key={index}
                      className={`p-4 rounded-lg border ${getSeverityColor(conflict.severity)}`}
                    >
                      <div className="flex items-start justify-between mb-2">
                        <span className="text-sm font-medium uppercase">
                          {conflict.severity} Priority
                        </span>
                      </div>
                      <p className="text-sm mb-2">{conflict.description}</p>
                      {conflict.affectedEmployees.length > 0 && (
                        <div className="text-sm">
                          <span className="font-medium">Affected: </span>
                          {conflict.affectedEmployees.join(', ')}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </Card>
            )}

            {/* Suggestions */}
            {result.suggestions && result.suggestions.length > 0 && (
              <Card className="p-6">
                <div className="flex items-center gap-2 mb-4">
                  <Lightbulb className="w-6 h-6 text-purple-600" />
                  <h3 className="text-lg font-semibold text-gray-900">Alternative Suggestions</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {result.suggestions.map((suggestion, index) => (
                    <div
                      key={index}
                      className="p-4 border border-gray-200 rounded-lg hover:border-purple-300 hover:shadow-md transition-all"
                    >
                      <div className="flex items-center gap-2 mb-3">
                        <Calendar className="w-5 h-5 text-purple-600" />
                        <span className="font-medium text-gray-900">Option {index + 1}</span>
                      </div>
                      <div className="text-sm text-gray-600 mb-2">
                        <div className="font-medium">
                          {new Date(suggestion.startDate).toLocaleDateString('en-ZA', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric'
                          })}
                        </div>
                        <div>to</div>
                        <div className="font-medium">
                          {new Date(suggestion.endDate).toLocaleDateString('en-ZA', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric'
                          })}
                        </div>
                      </div>
                      <p className="text-sm text-gray-700 mb-3">{suggestion.reason}</p>
                      <div className="space-y-1">
                        {suggestion.benefits.map((benefit, bidx) => (
                          <div key={bidx} className="flex items-start gap-2 text-xs text-green-700">
                            <CheckCircle className="w-3 h-3 flex-shrink-0 mt-0.5" />
                            <span>{benefit}</span>
                          </div>
                        ))}
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full mt-3"
                        onClick={() => {
                          setStartDate(suggestion.startDate);
                          setEndDate(suggestion.endDate);
                        }}
                      >
                        Use These Dates
                      </Button>
                    </div>
                  ))}
                </div>
              </Card>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
