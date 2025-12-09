import Link from 'next/link';
import { BarChart3, TrendingUp, Users, Calendar, PieChart, Activity } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import MarketingNav from '@/components/MarketingNav';
import MarketingFooter from '@/components/MarketingFooter';

export default function AnalyticsPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <MarketingNav />

      {/* Hero Section */}
      <section className="bg-teal-600 text-white py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              {/* Badge */}
              <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full mb-6">
                <BarChart3 className="w-4 h-4" />
                <span className="text-sm font-medium">Advanced Analytics</span>
              </div>

              <div className="flex items-center gap-4 mb-6">
                <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center">
                  <div className="w-10 h-10 bg-teal-500 rounded-full flex items-center justify-center">
                    <Users className="w-5 h-5 text-white" />
                  </div>
                </div>
              </div>

              <h1 className="text-5xl md:text-6xl font-bold mb-6 leading-tight">
                Leave Management
                <br />
                <span className="text-teal-100">Reports & Analytics</span>
              </h1>

              <p className="text-xl text-white/90 mb-8 leading-relaxed">
                Track and analyze your leave management with basic reporting tools and insights.
                Monitor patterns and compliance for your South African business.
              </p>

              <div className="flex flex-col sm:flex-row gap-4">
                <Link href="/sign-up">
                  <Button size="lg" className="bg-white text-teal-600 hover:bg-gray-50 px-8">
                    Try LeaveHub
                  </Button>
                </Link>
              </div>
            </div>

            <div className="relative">
              <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-xl p-6 shadow-2xl">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 bg-teal-500 rounded-full flex items-center justify-center">
                    <BarChart3 className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <div className="text-sm text-gray-400">Live Dashboard</div>
                    <div className="text-white font-semibold">Analytics Overview</div>
                  </div>
                </div>

                {/* Mock Dashboard */}
                <div className="space-y-4">
                  <div className="bg-gray-800 rounded-lg p-4">
                    <div className="text-xs text-gray-400 mb-2">USAGE: LAST 7 DAYS USING MEDIAN</div>
                    <div className="flex items-end gap-1 h-24">
                      {[40, 60, 45, 70, 85, 65, 55].map((height, idx) => (
                        <div key={idx} className="flex-1 bg-teal-500 rounded-t" style={{ height: `${height}%` }}></div>
                      ))}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-gray-800 rounded-lg p-4">
                      <div className="text-2xl font-bold text-white">8.9%</div>
                      <div className="text-xs text-gray-400">Leave Utilization</div>
                    </div>
                    <div className="bg-gray-800 rounded-lg p-4">
                      <div className="text-2xl font-bold text-white">2.7days</div>
                      <div className="text-xs text-gray-400">Avg Leave Duration</div>
                    </div>
                  </div>

                  <div className="bg-gray-800 rounded-lg p-4">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-xs text-gray-400">Team Coverage</span>
                      <span className="text-white font-semibold">46.6%</span>
                    </div>
                    <div className="w-full bg-gray-700 rounded-full h-2">
                      <div className="bg-teal-500 h-2 rounded-full" style={{ width: '46.6%' }}></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {/* Features */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-gray-900 text-center mb-12">
            Powerful Analytics Features
          </h2>

          <div className="grid md:grid-cols-3 gap-8">
            <Card className="p-8 border border-gray-200">
              <div className="w-12 h-12 bg-teal-100 rounded-lg flex items-center justify-center mb-4">
                <TrendingUp className="w-6 h-6 text-teal-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">
                Leave Trends
              </h3>
              <p className="text-gray-600">
                Track leave patterns over time and identify peak periods, helping you plan for adequate
                staffing and resource allocation.
              </p>
            </Card>

            <Card className="p-8 border border-gray-200">
              <div className="w-12 h-12 bg-teal-100 rounded-lg flex items-center justify-center mb-4">
                <Users className="w-6 h-6 text-teal-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">
                Department Insights
              </h3>
              <p className="text-gray-600">
                Compare leave usage across departments, identify outliers, and ensure fair distribution
                of leave across your organization.
              </p>
            </Card>

            <Card className="p-8 border border-gray-200">
              <div className="w-12 h-12 bg-teal-100 rounded-lg flex items-center justify-center mb-4">
                <PieChart className="w-6 h-6 text-teal-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">
                Balance Reports
              </h3>
              <p className="text-gray-600">
                Monitor leave balances across your workforce, identify employees who haven't taken leave,
                and ensure BCEA compliance.
              </p>
            </Card>

            <Card className="p-8 border border-gray-200">
              <div className="w-12 h-12 bg-teal-100 rounded-lg flex items-center justify-center mb-4">
                <Calendar className="w-6 h-6 text-teal-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">
                Approval Analytics
              </h3>
              <p className="text-gray-600">
                Track approval times, identify bottlenecks, and measure manager responsiveness to
                improve your leave approval process.
              </p>
            </Card>

            <Card className="p-8 border border-gray-200">
              <div className="w-12 h-12 bg-teal-100 rounded-lg flex items-center justify-center mb-4">
                <Activity className="w-6 h-6 text-teal-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">
                Compliance Monitoring
              </h3>
              <p className="text-gray-600">
                Automated reports to ensure BCEA compliance, track sick leave cycles, and monitor
                annual leave accrual accurately.
              </p>
            </Card>

            <Card className="p-8 border border-gray-200">
              <div className="w-12 h-12 bg-teal-100 rounded-lg flex items-center justify-center mb-4">
                <BarChart3 className="w-6 h-6 text-teal-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">
                Custom Reports
              </h3>
              <p className="text-gray-600">
                Build custom reports tailored to your business needs with our flexible reporting
                engine and export to Excel or PDF.
              </p>
            </Card>
          </div>
        </div>

        {/* Benefits */}
        <div className="bg-white rounded-2xl p-12 border border-gray-200 mb-16">
          <h2 className="text-3xl font-bold text-gray-900 text-center mb-12">
            Make Data-Driven Decisions
          </h2>

          <div className="grid md:grid-cols-2 gap-8">
            <div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">
                For HR Teams
              </h3>
              <ul className="space-y-3">
                <li className="flex items-start gap-3">
                  <div className="w-5 h-5 bg-teal-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-teal-600 text-xs">✓</span>
                  </div>
                  <span className="text-gray-700">
                    Identify leave usage patterns and plan workforce capacity
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-5 h-5 bg-teal-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-teal-600 text-xs">✓</span>
                  </div>
                  <span className="text-gray-700">
                    Monitor compliance with BCEA requirements automatically
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-5 h-5 bg-teal-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-teal-600 text-xs">✓</span>
                  </div>
                  <span className="text-gray-700">
                    Generate reports for audits and stakeholder presentations
                  </span>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">
                For Managers
              </h3>
              <ul className="space-y-3">
                <li className="flex items-start gap-3">
                  <div className="w-5 h-5 bg-teal-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-teal-600 text-xs">✓</span>
                  </div>
                  <span className="text-gray-700">
                    View team leave forecasts and plan project timelines
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-5 h-5 bg-teal-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-teal-600 text-xs">✓</span>
                  </div>
                  <span className="text-gray-700">
                    Track team coverage and ensure adequate staffing levels
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-5 h-5 bg-teal-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-teal-600 text-xs">✓</span>
                  </div>
                  <span className="text-gray-700">
                    Identify employees who need to use leave before year-end
                  </span>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* CTA */}
        <div className="bg-gradient-to-r from-teal-600 to-teal-700 rounded-2xl p-12 text-center text-white">
          <h2 className="text-3xl font-bold mb-4">
            Start Making Data-Driven Leave Decisions
          </h2>
          <p className="text-xl text-teal-50 mb-8 max-w-2xl mx-auto">
            Get insights that help you manage your workforce more effectively
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
