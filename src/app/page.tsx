import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Calendar, Clock, Users, CheckCircle, X, AlertTriangle, Mail, Shield, BarChart3, Sparkles, User, Lock } from "lucide-react";
import MarketingNav from "@/components/MarketingNav";
import MarketingFooter from "@/components/MarketingFooter";

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-50">
      <MarketingNav />
      {/* Hero Section */}
      <section className="bg-teal-600 text-white py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-4xl mx-auto">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full mb-8">
              <span className="text-sm font-medium">
                🇿🇦 Built for South African Businesses
              </span>
            </div>

            {/* Logo */}
            <div className="flex justify-center mb-8">
              <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center">
                <div className="w-12 h-12 bg-teal-500 rounded-full flex items-center justify-center">
                  <Users className="w-6 h-6 text-white" />
                </div>
              </div>
            </div>

            {/* Heading */}
            <h1 className="text-5xl md:text-6xl font-bold mb-6 leading-tight">
              Leave Management for
              <br />
              South African Businesses
            </h1>

            {/* Subheading */}
            <p className="text-xl text-white/90 mb-8 max-w-3xl mx-auto leading-relaxed">
              Role-based access. BCEA compliance support. Essential reporting. Simplify
              leave management for your business with an easy-to-use platform.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Link href="/dashboard">
                <Button
                  size="lg"
                  className="bg-white text-teal-600 hover:bg-gray-50 px-8"
                >
                  Try Demo →
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

            {/* Trust Indicators */}
            <div className="flex flex-wrap justify-center gap-6 mt-12 text-sm text-white/90">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4" />
                <span>Demo accounts available</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4" />
                <span>Easy to use</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4" />
                <span>BCEA compliant</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Problems Section */}
      <section className="py-20 px-4 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Still Managing Leave With Spreadsheets?
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Many South African businesses still rely on manual processes for leave management,
              creating unnecessary complexity and compliance risks.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="p-6 border-2 border-red-100 bg-red-50/50">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                  <X className="w-5 h-5 text-red-600" />
                </div>
                <AlertTriangle className="w-5 h-5 text-red-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Manual balance calculations prone to errors</h3>
              <p className="text-sm text-gray-600">Spreadsheets can't handle complex BCEA calculations</p>
            </Card>

            <Card className="p-6 border-2 border-red-100 bg-red-50/50">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                  <X className="w-5 h-5 text-red-600" />
                </div>
                <Mail className="w-5 h-5 text-red-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Email chains for approvals create delays</h3>
              <p className="text-sm text-gray-600">Lost requests and unclear approval status</p>
            </Card>

            <Card className="p-6 border-2 border-red-100 bg-red-50/50">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                  <X className="w-5 h-5 text-red-600" />
                </div>
                <Shield className="w-5 h-5 text-red-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">BCEA compliance risks and audit nightmares</h3>
              <p className="text-sm text-gray-600">Manual processes lead to costly violations</p>
            </Card>

            <Card className="p-6 border-2 border-red-100 bg-red-50/50">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                  <X className="w-5 h-5 text-red-600" />
                </div>
                <Clock className="w-5 h-5 text-red-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Time-consuming manual processes</h3>
              <p className="text-sm text-gray-600">Manual tracking wastes hours every week</p>
            </Card>
          </div>
        </div>
      </section>

      {/* Solution Section */}
      <section className="py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Meet LeaveHub: Leave Management That Actually Works
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Purpose-built for South African businesses with intelligent automation, role-based experiences,
              and built-in compliance.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="p-6 border-2 border-teal-200 hover:shadow-lg transition-shadow">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-teal-100 rounded-lg flex items-center justify-center">
                  <Sparkles className="w-5 h-5 text-teal-600" />
                </div>
                <span className="text-xs font-medium text-teal-600 bg-teal-50 px-2 py-1 rounded-full">Easy to use</span>
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Quick Leave Requests</h3>
              <p className="text-sm text-gray-600">Simple forms with balance checking and approval workflows</p>
            </Card>

            <Card className="p-6 border-2 border-teal-200 hover:shadow-lg transition-shadow">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-teal-100 rounded-lg flex items-center justify-center">
                  <Shield className="w-5 h-5 text-teal-600" />
                </div>
                <span className="text-xs font-medium text-teal-600 bg-teal-50 px-2 py-1 rounded-full">SA compliant</span>
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">BCEA Compliance Support</h3>
              <p className="text-sm text-gray-600">Built-in South African labor law guidelines and calculations</p>
            </Card>

            <Card className="p-6 border-2 border-teal-200 hover:shadow-lg transition-shadow">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-teal-100 rounded-lg flex items-center justify-center">
                  <Users className="w-5 h-5 text-teal-600" />
                </div>
                <span className="text-xs font-medium text-teal-600 bg-teal-50 px-2 py-1 rounded-full">3 user types</span>
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Role-Based Access</h3>
              <p className="text-sm text-gray-600">Different interfaces for employees, managers, and administrators</p>
            </Card>

            <Card className="p-6 border-2 border-teal-200 hover:shadow-lg transition-shadow">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-teal-100 rounded-lg flex items-center justify-center">
                  <BarChart3 className="w-5 h-5 text-teal-600" />
                </div>
                <span className="text-xs font-medium text-teal-600 bg-teal-50 px-2 py-1 rounded-full">Core insights</span>
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Basic Reporting</h3>
              <p className="text-sm text-gray-600">Essential leave reports and balance tracking</p>
            </Card>
          </div>
        </div>
      </section>

      {/* Try Today Section */}
      <section className="py-20 px-4 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Try LeaveHub Today</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Experience how LeaveHub simplifies leave management for South African businesses
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            <Card className="p-8 border-2 border-teal-200">
              <h3 className="text-2xl font-bold text-gray-900 mb-3">Try the Demo</h3>
              <p className="text-gray-600 mb-6">
                Explore LeaveHub with pre-loaded demo data. See how it works for employees, managers,
                and administrators.
              </p>
              <Link href="/dashboard">
                <Button size="lg" className="w-full bg-teal-600 hover:bg-teal-700">
                  Access Demo
                </Button>
              </Link>
            </Card>

            <Card className="p-8 border-2 border-gray-200">
              <h3 className="text-2xl font-bold text-gray-900 mb-3">Learn More</h3>
              <p className="text-gray-600 mb-6">
                Explore our features, pricing, and see how LeaveHub can work for your business.
              </p>
              <div className="flex gap-3">
                <Link href="/features" className="flex-1">
                  <Button size="lg" variant="outline" className="w-full">
                    View Features
                  </Button>
                </Link>
                <Link href="/pricing" className="flex-1">
                  <Button size="lg" variant="outline" className="w-full">
                    See Pricing
                  </Button>
                </Link>
              </div>
            </Card>
          </div>
        </div>
      </section>

      {/* Demo Accounts Section */}
      <section className="py-20 px-4 bg-gradient-to-br from-teal-50 to-blue-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">🚀 Try LeaveHub Instantly</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              No signup required! Test different user roles with our interactive demo accounts
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6 mb-8">
            <Card className="p-6 hover:shadow-lg transition-shadow">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                <User className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Employee Demo</h3>
              <p className="text-sm text-gray-600 mb-4">Submit leave requests and track balances</p>
              <Link href="/dashboard">
                <Button size="sm" className="w-full bg-blue-600 hover:bg-blue-700 mb-3">
                  Try Employee Dashboard
                </Button>
              </Link>
              <div className="space-y-1 text-xs text-gray-600">
                <div>📧 employee@demo.com</div>
                <div>🔑 demo123</div>
              </div>
            </Card>

            <Card className="p-6 hover:shadow-lg transition-shadow border-2 border-teal-200">
              <div className="w-12 h-12 bg-teal-100 rounded-lg flex items-center justify-center mb-4">
                <Users className="w-6 h-6 text-teal-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Manager Demo</h3>
              <p className="text-sm text-gray-600 mb-4">Approve requests and manage team</p>
              <Link href="/dashboard/manager">
                <Button size="sm" className="w-full bg-teal-600 hover:bg-teal-700 mb-3">
                  Try Manager Dashboard
                </Button>
              </Link>
              <div className="space-y-1 text-xs text-gray-600">
                <div>📧 manager@demo.com</div>
                <div>🔑 demo123</div>
              </div>
            </Card>

            <Card className="p-6 hover:shadow-lg transition-shadow">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
                <Lock className="w-6 h-6 text-purple-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Administrator Demo</h3>
              <p className="text-sm text-gray-600 mb-4">Full system access and analytics</p>
              <Link href="/dashboard">
                <Button size="sm" className="w-full bg-purple-600 hover:bg-purple-700 mb-3">
                  Try Administrator Dashboard
                </Button>
              </Link>
              <div className="space-y-1 text-xs text-gray-600">
                <div>📧 admin@demo.com</div>
                <div>🔑 demo123</div>
              </div>
            </Card>
          </div>

          <div className="text-center p-4 bg-white rounded-lg border-2 border-teal-200 max-w-2xl mx-auto">
            <p className="text-sm text-gray-600">
              💡 Click any demo button above to instantly access that role's dashboard
            </p>
            <p className="text-xs text-gray-500 mt-1">Demo accounts with sample data</p>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-20 px-4 bg-white">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">Ready to Try LeaveHub?</h2>
          <p className="text-xl text-gray-600 mb-8">
            Try LeaveHub for your South African business - a simple, compliant leave management solution.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-6">
            <Link href="/dashboard">
              <Button size="lg" className="bg-teal-600 hover:bg-teal-700 px-8">
                Try Demo
              </Button>
            </Link>
            <Link href="/features">
              <Button size="lg" variant="outline" className="px-8">
                View Features
              </Button>
            </Link>
          </div>
          <div className="flex items-center justify-center gap-6 text-sm text-gray-600">
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-teal-600" />
              <span>Demo accounts available</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-teal-600" />
              <span>South African compliance</span>
            </div>
          </div>
        </div>
      </section>

      <MarketingFooter />
    </div>
  );
}
