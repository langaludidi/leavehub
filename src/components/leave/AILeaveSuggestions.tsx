'use client';

import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Sparkles,
  AlertTriangle,
  CheckCircle,
  Calendar,
  Users,
  TrendingUp,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { format } from 'date-fns';

interface AISuggestion {
  startDate: string;
  endDate: string;
  reason: string;
  benefits: string[];
}

interface Conflict {
  severity: 'low' | 'medium' | 'high';
  description: string;
  affectedEmployees: string[];
}

interface ConflictAnalysis {
  hasConflicts: boolean;
  severity: 'none' | 'low' | 'medium' | 'high' | 'critical';
  summary: string;
  conflicts: Conflict[];
  overallRecommendation: string;
}

interface AILeaveSuggestionsProps {
  startDate: string;
  endDate: string;
  leaveType: string;
  userId: string;
  onApplySuggestion?: (startDate: string, endDate: string) => void;
}

export default function AILeaveSuggestions({
  startDate,
  endDate,
  leaveType,
  userId,
  onApplySuggestion,
}: AILeaveSuggestionsProps) {
  const [loading, setLoading] = useState(false);
  const [suggestions, setSuggestions] = useState<AISuggestion[]>([]);
  const [conflictAnalysis, setConflictAnalysis] = useState<ConflictAnalysis | null>(null);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Reset when dates change
    setSuggestions([]);
    setConflictAnalysis(null);
    setShowSuggestions(false);
  }, [startDate, endDate, leaveType]);

  async function analyzeLeave() {
    if (!startDate || !endDate || !leaveType) {
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Run both analyses in parallel
      const [plannerResponse, conflictResponse] = await Promise.all([
        fetch('/api/ai/leave-planner', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            startDate,
            endDate,
            leaveType,
            userId,
            department: 'Engineering', // TODO: Get from user profile
          }),
        }),
        fetch('/api/ai/conflict-detection', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            startDate,
            endDate,
            userId,
            department: 'Engineering', // TODO: Get from user profile
          }),
        }),
      ]);

      const plannerData = await plannerResponse.json();
      const conflictData = await conflictResponse.json();

      if (plannerData.suggestions) {
        setSuggestions(plannerData.suggestions.suggestions || []);
      }

      if (conflictData.analysis) {
        setConflictAnalysis(conflictData.analysis);
      }

      setShowSuggestions(true);
    } catch (err) {
      console.error('Error analyzing leave:', err);
      setError('AI analysis is currently unavailable');
    } finally {
      setLoading(false);
    }
  }

  function getSeverityColor(severity: string) {
    switch (severity) {
      case 'critical':
      case 'high':
        return 'border-red-300 bg-red-50 text-red-900';
      case 'medium':
        return 'border-yellow-300 bg-yellow-50 text-yellow-900';
      case 'low':
        return 'border-blue-300 bg-blue-50 text-blue-900';
      default:
        return 'border-green-300 bg-green-50 text-green-900';
    }
  }

  function getSeverityIcon(severity: string) {
    switch (severity) {
      case 'critical':
      case 'high':
        return <AlertTriangle className="w-5 h-5 text-red-600" />;
      case 'medium':
        return <AlertTriangle className="w-5 h-5 text-yellow-600" />;
      case 'low':
        return <CheckCircle className="w-5 h-5 text-blue-600" />;
      default:
        return <CheckCircle className="w-5 h-5 text-green-600" />;
    }
  }

  if (!startDate || !endDate || !leaveType) {
    return null;
  }

  return (
    <div className="space-y-4">
      {/* Analyze Button */}
      {!showSuggestions && !loading && (
        <Button
          type="button"
          variant="outline"
          onClick={analyzeLeave}
          className="w-full border-primary/30 hover:bg-primary/5"
        >
          <Sparkles className="w-4 h-4 mr-2" />
          Get AI Suggestions
        </Button>
      )}

      {/* Loading State */}
      {loading && (
        <Card className="p-6 border-primary/30">
          <div className="flex items-center gap-3">
            <div className="w-6 h-6 border-3 border-primary border-t-transparent rounded-full animate-spin"></div>
            <div>
              <p className="font-medium text-gray-900">Analyzing your leave request...</p>
              <p className="text-sm text-gray-600">Checking team availability and optimal dates</p>
            </div>
          </div>
        </Card>
      )}

      {/* Error State */}
      {error && (
        <Card className="p-4 border-gray-300 bg-gray-50">
          <p className="text-sm text-gray-600">{error}</p>
        </Card>
      )}

      {/* Conflict Analysis */}
      {conflictAnalysis && showSuggestions && (
        <Card className={`p-5 border-2 ${getSeverityColor(conflictAnalysis.severity)}`}>
          <div className="flex items-start gap-3 mb-3">
            {getSeverityIcon(conflictAnalysis.severity)}
            <div className="flex-1">
              <h4 className="font-semibold mb-1">Team Coverage Analysis</h4>
              <p className="text-sm">{conflictAnalysis.summary}</p>
            </div>
          </div>

          {conflictAnalysis.conflicts && conflictAnalysis.conflicts.length > 0 && (
            <div className="mt-4 space-y-2">
              {conflictAnalysis.conflicts.map((conflict, idx) => (
                <div key={idx} className="p-3 bg-white/60 rounded border border-current/20">
                  <div className="flex items-start gap-2">
                    <Users className="w-4 h-4 mt-0.5 flex-shrink-0" />
                    <div className="text-sm">
                      <p className="font-medium">{conflict.description}</p>
                      {conflict.affectedEmployees && conflict.affectedEmployees.length > 0 && (
                        <p className="text-xs mt-1 opacity-80">
                          Also away: {conflict.affectedEmployees.join(', ')}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {conflictAnalysis.overallRecommendation && (
            <div className="mt-4 p-3 bg-white/60 rounded border border-current/20">
              <p className="text-sm font-medium">💡 {conflictAnalysis.overallRecommendation}</p>
            </div>
          )}
        </Card>
      )}

      {/* AI Suggestions */}
      {suggestions && suggestions.length > 0 && showSuggestions && (
        <Card className="p-5 border-2 border-blue-300 bg-blue-50">
          <div className="flex items-center gap-2 mb-4">
            <Sparkles className="w-5 h-5 text-blue-600" />
            <h4 className="font-semibold text-blue-900">AI-Suggested Alternatives</h4>
          </div>

          <div className="space-y-3">
            {suggestions.map((suggestion, idx) => (
              <div
                key={idx}
                className="p-4 bg-white rounded-lg border border-blue-200 hover:border-blue-400 transition-colors"
              >
                <div className="flex items-start justify-between gap-3 mb-2">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-blue-600" />
                    <span className="font-medium text-gray-900">
                      {format(new Date(suggestion.startDate), 'd MMM yyyy')} -{' '}
                      {format(new Date(suggestion.endDate), 'd MMM yyyy')}
                    </span>
                  </div>
                  {onApplySuggestion && (
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      onClick={() => onApplySuggestion(suggestion.startDate, suggestion.endDate)}
                      className="text-xs"
                    >
                      Apply
                    </Button>
                  )}
                </div>

                <p className="text-sm text-gray-700 mb-2">{suggestion.reason}</p>

                {suggestion.benefits && suggestion.benefits.length > 0 && (
                  <div className="space-y-1">
                    {suggestion.benefits.map((benefit, bidx) => (
                      <div key={bidx} className="flex items-start gap-2 text-xs text-gray-600">
                        <TrendingUp className="w-3 h-3 text-green-600 flex-shrink-0 mt-0.5" />
                        <span>{benefit}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Re-analyze Button */}
      {showSuggestions && !loading && (
        <Button
          type="button"
          variant="ghost"
          onClick={analyzeLeave}
          className="w-full text-sm"
        >
          <Sparkles className="w-4 h-4 mr-2" />
          Re-analyze
        </Button>
      )}
    </div>
  );
}
