import Link from 'next/link';
import { Sparkles, Calendar, Users, TrendingUp, Shield, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import MarketingNav from '@/components/MarketingNav';
import MarketingFooter from '@/components/MarketingFooter';

export default function LeavePlanningPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <MarketingNav />

      {/* Hero Section */}
      <section className="bg-teal-700 text-white py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              {/* Badge */}
              <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full mb-6">
                <Sparkles className="w-4 h-4" />
                <span className="text-sm font-medium">AI-Powered Planning</span>
              </div>

              <div className="flex items-center gap-4 mb-6">
                <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center">
                  <div className="w-10 h-10 bg-teal-500 rounded-full flex items-center justify-center">
                    <Users className="w-5 h-5 text-white" />
                  </div>
                </div>
              </div>

              <h1 className="text-5xl md:text-6xl font-bold mb-6 leading-tight">
                Smart <span className="text-teal-100">Leave Planning</span> Assistant
              </h1>

              <p className="text-xl text-white/90 mb-8 leading-relaxed">
                Get AI-powered recommendations for optimal leave timing with minimal team impact.
                Plan smarter, not harder.
              </p>

              <div className="flex flex-col sm:flex-row gap-4">
                <Link href="/sign-up">
                  <Button size="lg" className="bg-white text-teal-600 hover:bg-gray-50 px-8">
                    Get Started Free
                  </Button>
                </Link>
                <Link href="/dashboard/ai-planner">
                  <Button
                    size="lg"
                    variant="outline"
                    className="border-2 border-white text-white hover:bg-white/10 px-8"
                  >
                    Try Demo
                  </Button>
                </Link>
              </div>
            </div>

            <div className="relative">
              <div className="bg-white rounded-xl p-8 shadow-2xl">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 bg-teal-100 rounded-full flex items-center justify-center">
                    <Users className="w-5 h-5 text-teal-600" />
                  </div>
                  <div>
                    <div className="text-sm text-gray-500">Live Dashboard</div>
                    <div className="text-teal-600 font-semibold">AI Leave Assistant</div>
                  </div>
                </div>

                <div className="space-y-4 mb-6">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Leave Request Submitted</span>
                    <span className="text-teal-600">→</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Auto-Processing</span>
                    <div className="w-3 h-3 bg-teal-500 rounded-full animate-pulse"></div>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Compliance Check</span>
                    <span className="text-gray-400">→</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Decision Made</span>
                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4 pt-4 border-t">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-teal-600">127</div>
                    <div className="text-xs text-gray-600">Processed Today</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-teal-600">2.1min</div>
                    <div className="text-xs text-gray-600">Avg Processing</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-teal-600">98%</div>
                    <div className="text-xs text-gray-600">Success Rate</div>
                  </div>
                </div>
              </div>

              {/* Demo Banner */}
              <div className="mt-4 bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-start gap-2">
                  <div className="text-blue-600 text-sm">⚠️</div>
                  <div>
                    <div className="text-sm font-medium text-blue-900">You're viewing a demo version.</div>
                    <Link href="/sign-in" className="text-sm text-blue-600 underline">
                      Sign in
                    </Link>
                    <span className="text-sm text-gray-600">
                      {' '}to access your personalized leave planning assistant with real data.
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {/* Leave Balance Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-16">
          {[
            { number: '13', label: 'Annual Leave', color: 'teal' },
            { number: '28', label: 'Sick Leave', color: 'teal' },
            { number: '3', label: 'Family Leave', color: 'teal' },
            { number: '120', label: 'Maternity', color: 'teal' },
          ].map((item, idx) => (
            <Card key={idx} className="p-6 text-center">
              <div className="text-3xl font-bold text-teal-600 mb-2">{item.number}</div>
              <div className="text-sm text-gray-600">{item.label}</div>
            </Card>
          ))}
        </div>

        {/* Features */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-gray-900 text-center mb-12">
            How AI Leave Planning Works
          </h2>

          <div className="grid md:grid-cols-3 gap-8">
            <Card className="p-8 border border-gray-200">
              <div className="w-12 h-12 bg-teal-100 rounded-lg flex items-center justify-center mb-4">
                <Calendar className="w-6 h-6 text-teal-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">
                Conflict Detection
              </h3>
              <p className="text-gray-600">
                AI automatically detects scheduling conflicts with team members and suggests alternative dates
                for minimal disruption.
              </p>
            </Card>

            <Card className="p-8 border border-gray-200">
              <div className="w-12 h-12 bg-teal-100 rounded-lg flex items-center justify-center mb-4">
                <TrendingUp className="w-6 h-6 text-teal-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">
                Optimal Timing
              </h3>
              <p className="text-gray-600">
                Get recommendations for the best times to take leave based on workload patterns, public
                holidays, and team capacity.
              </p>
            </Card>

            <Card className="p-8 border border-gray-200">
              <div className="w-12 h-12 bg-teal-100 rounded-lg flex items-center justify-center mb-4">
                <Shield className="w-6 h-6 text-teal-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">
                Balance Warnings
              </h3>
              <p className="text-gray-600">
                Receive alerts when your leave balance is running low or when you're approaching BCEA
                compliance thresholds.
              </p>
            </Card>
          </div>
        </div>

        {/* Benefits */}
        <div className="bg-white rounded-2xl p-12 border border-gray-200 mb-16">
          <h2 className="text-3xl font-bold text-gray-900 text-center mb-12">
            Why Use AI-Powered Leave Planning?
          </h2>

          <div className="grid md:grid-cols-2 gap-8">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 bg-teal-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <Zap className="w-5 h-5 text-teal-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Save 75% Planning Time
                </h3>
                <p className="text-gray-600">
                  AI analyzes hundreds of factors instantly, replacing hours of manual scheduling work.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="w-10 h-10 bg-teal-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <Users className="w-5 h-5 text-teal-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Reduce Team Conflicts
                </h3>
                <p className="text-gray-600">
                  Avoid scheduling overlaps and ensure adequate coverage with intelligent recommendations.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="w-10 h-10 bg-teal-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <Shield className="w-5 h-5 text-teal-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Maintain BCEA Compliance
                </h3>
                <p className="text-gray-600">
                  AI ensures all leave requests meet BCEA requirements automatically.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="w-10 h-10 bg-teal-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <TrendingUp className="w-5 h-5 text-teal-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Improve Employee Experience
                </h3>
                <p className="text-gray-600">
                  Employees get instant feedback and alternatives, reducing back-and-forth.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* CTA */}
        <div className="bg-gradient-to-r from-teal-600 to-teal-700 rounded-2xl p-12 text-center text-white">
          <h2 className="text-3xl font-bold mb-4">
            Try AI Leave Planning Today
          </h2>
          <p className="text-xl text-teal-50 mb-8 max-w-2xl mx-auto">
            Experience smarter leave management with our AI-powered planning assistant
          </p>
          <Link href="/sign-up">
            <Button size="lg" className="bg-white text-teal-600 hover:bg-gray-50 px-8">
              Start Free Trial
            </Button>
          </Link>
        </div>
      </div>

      <MarketingFooter />
    </div>
  );
}
