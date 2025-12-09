import Link from 'next/link';
import { Zap, CheckCircle, Bell, GitBranch, Clock, Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import MarketingNav from '@/components/MarketingNav';
import MarketingFooter from '@/components/MarketingFooter';

export default function WorkflowAutomationPage() {
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
                <Zap className="w-4 h-4" />
                <span className="text-sm font-medium">Workflow Automation</span>
              </div>

              <div className="flex items-center gap-4 mb-6">
                <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center">
                  <div className="w-10 h-10 bg-teal-500 rounded-full flex items-center justify-center">
                    <Zap className="w-5 h-5 text-white" />
                  </div>
                </div>
              </div>

              <h1 className="text-5xl md:text-6xl font-bold mb-6 leading-tight">
                Leave Management
                <br />
                <span className="text-teal-100">Workflow Tools</span>
              </h1>

              <p className="text-xl text-white/90 mb-8 leading-relaxed">
                Streamline your leave management with workflow tools that help organize approvals,
                notifications, and basic automation for your South African business.
              </p>

              <div className="flex flex-col sm:flex-row gap-4">
                <Link href="/sign-up">
                  <Button size="lg" className="bg-white text-teal-600 hover:bg-gray-50 px-8">
                    Try LeaveHub
                  </Button>
                </Link>
                <Link href="/features">
                  <Button
                    size="lg"
                    variant="outline"
                    className="border-2 border-white text-white hover:bg-white/10 px-8"
                  >
                    View Features
                  </Button>
                </Link>
              </div>
            </div>

            <div className="relative">
              <div className="bg-white rounded-xl p-8 shadow-2xl">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 bg-teal-100 rounded-full flex items-center justify-center">
                    <Zap className="w-5 h-5 text-teal-600" />
                  </div>
                  <div>
                    <div className="text-sm text-gray-500">Live Automation</div>
                    <div className="text-teal-600 font-semibold">Workflow Dashboard</div>
                  </div>
                </div>

                {/* Workflow Steps */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 bg-teal-50 rounded-lg border border-teal-200">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-teal-500 rounded-full flex items-center justify-center">
                        <CheckCircle className="w-5 h-5 text-white" />
                      </div>
                      <span className="text-sm font-medium text-gray-900">Leave Request Submitted</span>
                    </div>
                    <span className="text-teal-600">→</span>
                  </div>

                  <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg border border-blue-200">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center animate-pulse">
                        <div className="w-3 h-3 bg-white rounded-full"></div>
                      </div>
                      <span className="text-sm font-medium text-gray-900">Auto-Processing</span>
                    </div>
                    <div className="w-3 h-3 bg-blue-500 rounded-full animate-pulse"></div>
                  </div>

                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
                        <CheckCircle className="w-5 h-5 text-gray-500" />
                      </div>
                      <span className="text-sm font-medium text-gray-500">Compliance Check</span>
                    </div>
                    <span className="text-gray-400">→</span>
                  </div>

                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
                        <CheckCircle className="w-5 h-5 text-gray-500" />
                      </div>
                      <span className="text-sm font-medium text-gray-500">Decision Made</span>
                    </div>
                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-3 gap-4 mt-6 pt-6 border-t">
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
            </div>
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {/* Features */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-gray-900 text-center mb-12">
            Workflow Automation Features
          </h2>

          <div className="grid md:grid-cols-3 gap-8">
            <Card className="p-8 border border-gray-200">
              <div className="w-12 h-12 bg-teal-100 rounded-lg flex items-center justify-center mb-4">
                <GitBranch className="w-6 h-6 text-teal-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">
                Smart Routing
              </h3>
              <p className="text-gray-600">
                Automatically route leave requests to the right approvers based on department,
                employee level, and leave type.
              </p>
            </Card>

            <Card className="p-8 border border-gray-200">
              <div className="w-12 h-12 bg-teal-100 rounded-lg flex items-center justify-center mb-4">
                <Bell className="w-6 h-6 text-teal-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">
                Auto-Notifications
              </h3>
              <p className="text-gray-600">
                Send automated email and in-app notifications to employees and managers at key
                stages of the approval process.
              </p>
            </Card>

            <Card className="p-8 border border-gray-200">
              <div className="w-12 h-12 bg-teal-100 rounded-lg flex items-center justify-center mb-4">
                <CheckCircle className="w-6 h-6 text-teal-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">
                Compliance Checks
              </h3>
              <p className="text-gray-600">
                Automatically validate leave requests against BCEA requirements, balances, and
                company policies before approval.
              </p>
            </Card>

            <Card className="p-8 border border-gray-200">
              <div className="w-12 h-12 bg-teal-100 rounded-lg flex items-center justify-center mb-4">
                <Clock className="w-6 h-6 text-teal-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">
                Escalation Rules
              </h3>
              <p className="text-gray-600">
                Set up automatic escalation when requests aren't approved within specified timeframes
                to prevent delays.
              </p>
            </Card>

            <Card className="p-8 border border-gray-200">
              <div className="w-12 h-12 bg-teal-100 rounded-lg flex items-center justify-center mb-4">
                <Shield className="w-6 h-6 text-teal-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">
                Approval Delegation
              </h3>
              <p className="text-gray-600">
                Allow managers to delegate approval authority when they're on leave or out of office
                to keep workflows moving.
              </p>
            </Card>

            <Card className="p-8 border border-gray-200">
              <div className="w-12 h-12 bg-teal-100 rounded-lg flex items-center justify-center mb-4">
                <Zap className="w-6 h-6 text-teal-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">
                Bulk Actions
              </h3>
              <p className="text-gray-600">
                Process multiple leave requests at once with bulk approve or reject actions for
                efficient management.
              </p>
            </Card>
          </div>
        </div>

        {/* Benefits */}
        <div className="bg-white rounded-2xl p-12 border border-gray-200 mb-16">
          <h2 className="text-3xl font-bold text-gray-900 text-center mb-12">
            Why Automate Your Leave Workflows?
          </h2>

          <div className="grid md:grid-cols-2 gap-8">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 bg-teal-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <Clock className="w-5 h-5 text-teal-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Save 75% Processing Time
                </h3>
                <p className="text-gray-600">
                  Reduce manual processing time from hours to minutes with automated workflows and
                  intelligent routing.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="w-10 h-10 bg-teal-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <CheckCircle className="w-5 h-5 text-teal-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Reduce Errors by 90%
                </h3>
                <p className="text-gray-600">
                  Eliminate human error in leave calculations, balance checks, and BCEA compliance
                  validation.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="w-10 h-10 bg-teal-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <Bell className="w-5 h-5 text-teal-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Improve Communication
                </h3>
                <p className="text-gray-600">
                  Keep everyone informed with automatic notifications at every stage of the leave
                  approval process.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="w-10 h-10 bg-teal-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <Shield className="w-5 h-5 text-teal-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Ensure Compliance
                </h3>
                <p className="text-gray-600">
                  Built-in BCEA compliance checks ensure every leave request meets South African
                  labour law requirements.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Automation Tools */}
        <div className="bg-gradient-to-br from-teal-50 to-blue-50 rounded-2xl p-12 mb-16 border border-teal-100">
          <h2 className="text-3xl font-bold text-gray-900 text-center mb-8">
            Automation Tools Included
          </h2>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { icon: '🔄', title: 'Auto-Approval Rules', desc: 'Set criteria for automatic approval' },
              { icon: '📧', title: 'Email Templates', desc: 'Customizable notification templates' },
              { icon: '📊', title: 'Workflow Analytics', desc: 'Track process efficiency' },
              { icon: '🔔', title: 'Reminders', desc: 'Automatic deadline reminders' },
              { icon: '📝', title: 'Audit Logs', desc: 'Complete approval history' },
              { icon: '🔗', title: 'Integrations', desc: 'Connect with other tools' },
            ].map((tool, idx) => (
              <div key={idx} className="bg-white p-6 rounded-xl border border-gray-200">
                <div className="text-3xl mb-3">{tool.icon}</div>
                <h3 className="font-semibold text-gray-900 mb-1">{tool.title}</h3>
                <p className="text-sm text-gray-600">{tool.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div className="bg-gradient-to-r from-teal-600 to-teal-700 rounded-2xl p-12 text-center text-white">
          <h2 className="text-3xl font-bold mb-4">
            Automate Your Leave Management Today
          </h2>
          <p className="text-xl text-teal-50 mb-8 max-w-2xl mx-auto">
            Save time, reduce errors, and improve employee experience with smart workflow automation
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
