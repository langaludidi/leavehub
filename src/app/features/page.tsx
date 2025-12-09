import Link from 'next/link';
import { Sparkles, Calendar, Users, Shield, BarChart3, Zap, CheckCircle, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import MarketingNav from '@/components/MarketingNav';
import MarketingFooter from '@/components/MarketingFooter';

export default function FeaturesPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <MarketingNav />

      {/* Hero */}
      <section className="bg-teal-700 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full mb-6">
            <span className="text-sm font-medium">Complete Feature Set</span>
          </div>

          <h1 className="text-5xl md:text-6xl font-bold mb-6">
            Everything you need for modern
            <br />
            leave management
          </h1>

          <p className="text-xl text-white/90 max-w-3xl mx-auto mb-8">
            From smart AI-powered requests to comprehensive compliance automation,
            LeaveHub provides all the tools your South African business needs.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/sign-up">
              <Button size="lg" className="bg-white text-teal-600 hover:bg-gray-50 px-8">
                Start Free Trial
              </Button>
            </Link>
            <Link href="/pricing">
              <Button
                size="lg"
                variant="outline"
                className="border-2 border-white text-white hover:bg-white/10 px-8"
              >
                View Pricing
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {/* Core Features */}
        <div className="mb-20">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Core Features</h2>
            <p className="text-xl text-gray-600">
              The foundation of intelligent leave management, designed specifically for South African businesses
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            <Card className="p-8 border border-gray-200">
              <div className="w-14 h-14 bg-teal-100 rounded-xl flex items-center justify-center mb-6">
                <Sparkles className="w-7 h-7 text-teal-600" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Smart Leave Requests</h3>
              <p className="text-gray-600 mb-6">
                AI-powered form completion with automatic balance checking and conflict detection
              </p>
              <ul className="space-y-3">
                {['Auto-complete forms', 'Real-time validation', 'Smart conflict detection', 'Balance forecasting'].map((item, idx) => (
                  <li key={idx} className="flex items-center gap-3">
                    <CheckCircle className="w-5 h-5 text-teal-600 flex-shrink-0" />
                    <span className="text-gray-700">{item}</span>
                  </li>
                ))}
              </ul>
            </Card>

            <Card className="p-8 border border-gray-200">
              <div className="w-14 h-14 bg-teal-100 rounded-xl flex items-center justify-center mb-6">
                <Shield className="w-7 h-7 text-teal-600" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">BCEA Compliance Engine</h3>
              <p className="text-gray-600 mb-6">
                Built-in South African labour law compliance with automatic updates
              </p>
              <ul className="space-y-3">
                {['21 annual leave days', '30 sick leave days', '3 family responsibility days', 'Public holiday management'].map((item, idx) => (
                  <li key={idx} className="flex items-center gap-3">
                    <CheckCircle className="w-5 h-5 text-teal-600 flex-shrink-0" />
                    <span className="text-gray-700">{item}</span>
                  </li>
                ))}
              </ul>
            </Card>

            <Card className="p-8 border border-gray-200">
              <div className="w-14 h-14 bg-teal-100 rounded-xl flex items-center justify-center mb-6">
                <Users className="w-7 h-7 text-teal-600" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Role-Based Dashboards</h3>
              <p className="text-gray-600 mb-6">
                5 specialized user experiences optimized for each organizational role
              </p>
              <ul className="space-y-3">
                {['Employee portal', 'Manager dashboard', 'HR admin panel', 'Executive insights', 'Super admin controls'].map((item, idx) => (
                  <li key={idx} className="flex items-center gap-3">
                    <CheckCircle className="w-5 h-5 text-teal-600 flex-shrink-0" />
                    <span className="text-gray-700">{item}</span>
                  </li>
                ))}
              </ul>
            </Card>

            <Card className="p-8 border border-gray-200">
              <div className="w-14 h-14 bg-teal-100 rounded-xl flex items-center justify-center mb-6">
                <BarChart3 className="w-7 h-7 text-teal-600" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Intelligent Analytics</h3>
              <p className="text-gray-600 mb-6">
                Real-time insights and reporting to optimize leave management
              </p>
              <ul className="space-y-3">
                {['Live dashboards', 'Trend analysis', 'Compliance monitoring', 'Custom reports'].map((item, idx) => (
                  <li key={idx} className="flex items-center gap-3">
                    <CheckCircle className="w-5 h-5 text-teal-600 flex-shrink-0" />
                    <span className="text-gray-700">{item}</span>
                  </li>
                ))}
              </ul>
            </Card>
          </div>
        </div>

        {/* Advanced Capabilities */}
        <div className="mb-20">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Advanced Capabilities</h2>
            <p className="text-xl text-gray-600">
              Powerful tools that scale with your business and provide deep insights
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <Card className="p-8 border border-gray-200 hover:shadow-lg transition-shadow">
              <div className="aspect-video bg-gradient-to-br from-teal-50 to-blue-50 rounded-lg mb-6 flex items-center justify-center">
                <Calendar className="w-16 h-16 text-teal-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Leave Planning Assistant</h3>
              <p className="text-gray-600 mb-4">
                Visual calendar with team heatmaps and intelligent planning suggestions
              </p>
              <Link href="/solutions/leave-planning" className="inline-flex items-center text-teal-600 hover:text-teal-700 font-medium">
                Learn More <ArrowRight className="w-4 h-4 ml-2" />
              </Link>
            </Card>

            <Card className="p-8 border border-gray-200 hover:shadow-lg transition-shadow">
              <div className="aspect-video bg-gradient-to-br from-teal-50 to-blue-50 rounded-lg mb-6 flex items-center justify-center">
                <BarChart3 className="w-16 h-16 text-teal-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Advanced Analytics</h3>
              <p className="text-gray-600 mb-4">
                Comprehensive reporting and insights for data-driven decisions
              </p>
              <Link href="/solutions/analytics" className="inline-flex items-center text-teal-600 hover:text-teal-700 font-medium">
                Learn More <ArrowRight className="w-4 h-4 ml-2" />
              </Link>
            </Card>

            <Card className="p-8 border border-gray-200 hover:shadow-lg transition-shadow">
              <div className="aspect-video bg-gradient-to-br from-teal-50 to-blue-50 rounded-lg mb-6 flex items-center justify-center">
                <Zap className="w-16 h-16 text-teal-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Workflow Automation</h3>
              <p className="text-gray-600 mb-4">
                Customizable approval workflows and automated processes
              </p>
              <Link href="/solutions/workflow-automation" className="inline-flex items-center text-teal-600 hover:text-teal-700 font-medium">
                Learn More <ArrowRight className="w-4 h-4 ml-2" />
              </Link>
            </Card>
          </div>
        </div>

        {/* BCEA Compliance */}
        <div className="bg-white rounded-2xl p-12 border border-gray-200 mb-20">
          <div className="flex items-start gap-6 mb-8">
            <div className="text-5xl">🇿🇦</div>
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-4">South African Compliance</h2>
              <h3 className="text-2xl font-semibold text-gray-900 mb-4">Built-in BCEA Compliance</h3>
              <p className="text-lg text-gray-700 mb-6">
                Never worry about labour law violations again. Our compliance engine automatically handles
                all BCEA requirements and stays updated with the latest regulations.
              </p>
            </div>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {[
              'BCEA 2024 compliance updates',
              'Sectoral determination support',
              'Public holiday management',
              'Overtime calculation',
              'POPIA data protection',
              'Audit trail maintenance',
              'DOL inspection readiness',
              'Multi-language support',
            ].map((item, idx) => (
              <div key={idx} className="flex items-start gap-2">
                <CheckCircle className="w-5 h-5 text-teal-600 flex-shrink-0 mt-0.5" />
                <span className="text-gray-700">{item}</span>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-3 gap-6 p-6 bg-teal-50 rounded-xl border border-teal-200">
            <div className="text-center">
              <div className="text-3xl font-bold text-teal-600 mb-1">100%</div>
              <div className="text-sm text-gray-600">BCEA Requirements</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-teal-600 mb-1">100%</div>
              <div className="text-sm text-gray-600">Data Protection</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-teal-600 mb-1">100%</div>
              <div className="text-sm text-gray-600">Audit Readiness</div>
            </div>
          </div>

          <p className="text-center text-sm text-gray-600 mt-4">
            Fully compliant with all BCEA 2024 updates
          </p>
        </div>

        {/* CTA */}
        <div className="bg-gradient-to-r from-teal-600 to-teal-700 rounded-2xl p-12 text-center text-white">
          <h2 className="text-3xl font-bold mb-4">
            Ready to experience the future of leave management?
          </h2>
          <p className="text-xl text-teal-50 mb-8 max-w-2xl mx-auto">
            Join hundreds of South African companies who have already transformed their HR processes with LeaveHub.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/sign-up">
              <Button size="lg" className="bg-white text-teal-600 hover:bg-gray-50 px-8">
                Start Free 14-Day Trial
              </Button>
            </Link>
            <Link href="/pricing">
              <Button
                size="lg"
                variant="outline"
                className="border-2 border-white text-white hover:bg-white/10 px-8"
              >
                View All Plans
              </Button>
            </Link>
          </div>
        </div>
      </div>

      <MarketingFooter />
    </div>
  );
}
