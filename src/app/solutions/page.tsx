import Link from 'next/link';
import { Sparkles, BarChart3, Zap, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import MarketingNav from '@/components/MarketingNav';
import MarketingFooter from '@/components/MarketingFooter';

export default function SolutionsPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <MarketingNav />

      {/* Hero Section */}
      <section className="bg-gradient-to-br from-teal-700 to-teal-800 text-white py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto">
            <h1 className="text-5xl md:text-6xl font-bold mb-6">
              Leave Management Solutions
            </h1>
            <p className="text-xl text-teal-50 mb-8 leading-relaxed">
              Powerful tools designed for South African businesses. From AI-powered planning
              to advanced analytics and workflow automation.
            </p>
            <Link href="/sign-up">
              <Button size="lg" className="bg-white text-teal-700 hover:bg-gray-50 px-8">
                Get Started Free
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        {/* Solutions Grid */}
        <div className="grid md:grid-cols-3 gap-8 mb-20">
          {/* AI Leave Planning */}
          <Card className="p-8 hover:shadow-xl transition-shadow border-2 hover:border-teal-200">
            <div className="w-16 h-16 bg-teal-100 rounded-xl flex items-center justify-center mb-6">
              <Sparkles className="w-8 h-8 text-teal-700" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-4">
              AI Leave Planning
            </h3>
            <p className="text-gray-600 mb-6 leading-relaxed">
              Get intelligent recommendations for optimal leave timing. AI automatically detects
              conflicts, suggests alternatives, and ensures adequate team coverage.
            </p>

            <div className="space-y-3 mb-6">
              <div className="flex items-start gap-2">
                <div className="w-5 h-5 bg-teal-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-teal-700 text-xs">✓</span>
                </div>
                <span className="text-sm text-gray-700">Smart conflict detection</span>
              </div>
              <div className="flex items-start gap-2">
                <div className="w-5 h-5 bg-teal-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-teal-700 text-xs">✓</span>
                </div>
                <span className="text-sm text-gray-700">Optimal timing suggestions</span>
              </div>
              <div className="flex items-start gap-2">
                <div className="w-5 h-5 bg-teal-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-teal-700 text-xs">✓</span>
                </div>
                <span className="text-sm text-gray-700">BCEA compliance checks</span>
              </div>
            </div>

            <Link href="/solutions/leave-planning">
              <Button variant="outline" className="w-full border-teal-700 text-teal-700 hover:bg-teal-50">
                Learn More <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
          </Card>

          {/* Analytics & Reporting */}
          <Card className="p-8 hover:shadow-xl transition-shadow border-2 hover:border-teal-200">
            <div className="w-16 h-16 bg-teal-100 rounded-xl flex items-center justify-center mb-6">
              <BarChart3 className="w-8 h-8 text-teal-700" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-4">
              Analytics & Reporting
            </h3>
            <p className="text-gray-600 mb-6 leading-relaxed">
              Make data-driven decisions with comprehensive leave analytics. Track trends,
              monitor compliance, and optimize workforce planning.
            </p>

            <div className="space-y-3 mb-6">
              <div className="flex items-start gap-2">
                <div className="w-5 h-5 bg-teal-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-teal-700 text-xs">✓</span>
                </div>
                <span className="text-sm text-gray-700">Real-time dashboards</span>
              </div>
              <div className="flex items-start gap-2">
                <div className="w-5 h-5 bg-teal-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-teal-700 text-xs">✓</span>
                </div>
                <span className="text-sm text-gray-700">Custom report builder</span>
              </div>
              <div className="flex items-start gap-2">
                <div className="w-5 h-5 bg-teal-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-teal-700 text-xs">✓</span>
                </div>
                <span className="text-sm text-gray-700">Export to Excel/PDF</span>
              </div>
            </div>

            <Link href="/solutions/analytics">
              <Button variant="outline" className="w-full border-teal-700 text-teal-700 hover:bg-teal-50">
                Learn More <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
          </Card>

          {/* Workflow Automation */}
          <Card className="p-8 hover:shadow-xl transition-shadow border-2 hover:border-teal-200">
            <div className="w-16 h-16 bg-teal-100 rounded-xl flex items-center justify-center mb-6">
              <Zap className="w-8 h-8 text-teal-700" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-4">
              Workflow Automation
            </h3>
            <p className="text-gray-600 mb-6 leading-relaxed">
              Streamline your leave processes with powerful automation. Reduce manual work,
              eliminate errors, and speed up approvals.
            </p>

            <div className="space-y-3 mb-6">
              <div className="flex items-start gap-2">
                <div className="w-5 h-5 bg-teal-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-teal-700 text-xs">✓</span>
                </div>
                <span className="text-sm text-gray-700">Auto-routing & notifications</span>
              </div>
              <div className="flex items-start gap-2">
                <div className="w-5 h-5 bg-teal-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-teal-700 text-xs">✓</span>
                </div>
                <span className="text-sm text-gray-700">Approval delegation</span>
              </div>
              <div className="flex items-start gap-2">
                <div className="w-5 h-5 bg-teal-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-teal-700 text-xs">✓</span>
                </div>
                <span className="text-sm text-gray-700">Escalation rules</span>
              </div>
            </div>

            <Link href="/solutions/workflow-automation">
              <Button variant="outline" className="w-full border-teal-700 text-teal-700 hover:bg-teal-50">
                Learn More <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
          </Card>
        </div>

        {/* Why Choose LeaveHub */}
        <div className="bg-white rounded-2xl p-12 border border-gray-200 mb-16">
          <h2 className="text-3xl font-bold text-gray-900 text-center mb-12">
            Why South African Businesses Choose LeaveHub
          </h2>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="text-4xl font-bold text-teal-700 mb-2">100%</div>
              <div className="text-sm text-gray-600">BCEA Compliant</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-teal-700 mb-2">75%</div>
              <div className="text-sm text-gray-600">Time Savings</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-teal-700 mb-2">90%</div>
              <div className="text-sm text-gray-600">Error Reduction</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-teal-700 mb-2">24/7</div>
              <div className="text-sm text-gray-600">Support Available</div>
            </div>
          </div>
        </div>

        {/* CTA */}
        <div className="bg-gradient-to-r from-teal-700 to-teal-800 rounded-2xl p-12 text-center text-white">
          <h2 className="text-3xl font-bold mb-4">
            Ready to Transform Your Leave Management?
          </h2>
          <p className="text-xl text-teal-50 mb-8 max-w-2xl mx-auto">
            Join hundreds of South African businesses using LeaveHub to streamline their operations
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/sign-up">
              <Button size="lg" className="bg-white text-teal-700 hover:bg-gray-50 px-8">
                Start Free Trial
              </Button>
            </Link>
            <Link href="/pricing">
              <Button size="lg" variant="outline" className="border-2 border-white text-white hover:bg-white/10 px-8">
                View Pricing
              </Button>
            </Link>
          </div>
        </div>
      </div>

      <MarketingFooter />
    </div>
  );
}
