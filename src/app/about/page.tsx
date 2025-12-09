import Link from 'next/link';
import { ArrowLeft, Target } from 'lucide-react';
import { Button } from '@/components/ui/button';
import MarketingNav from '@/components/MarketingNav';
import MarketingFooter from '@/components/MarketingFooter';

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <MarketingNav />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back Button */}
        <Link href="/" className="inline-flex items-center text-teal-600 hover:text-teal-700 mb-8">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Link>

        {/* Badge */}
        <div className="flex justify-end mb-4">
          <div className="inline-flex items-center gap-2 bg-teal-50 text-teal-700 px-4 py-2 rounded-full border border-teal-200">
            <span className="text-sm font-medium">🇿🇦 South African Company</span>
          </div>
        </div>

        {/* Header */}
        <div className="text-center max-w-4xl mx-auto mb-16">
          <div className="flex justify-center mb-6">
            <div className="w-20 h-20 bg-teal-100 rounded-full flex items-center justify-center">
              <Target className="w-10 h-10 text-teal-600" />
            </div>
          </div>

          <h1 className="text-5xl font-bold text-gray-900 mb-6">
            About LeaveHub
          </h1>

          <p className="text-xl text-gray-600 leading-relaxed">
            We're on a mission to transform how South African businesses manage
            leave, making compliance simple and employee experiences delightful.
          </p>
        </div>

        {/* Mission Section */}
        <div className="bg-gradient-to-br from-teal-50 to-blue-50 rounded-2xl p-12 mb-16 border border-teal-100">
          <h2 className="text-3xl font-bold text-gray-900 text-center mb-6">
            Our Mission
          </h2>

          <p className="text-lg text-gray-700 text-center max-w-4xl mx-auto leading-relaxed">
            To empower South African businesses with intelligent leave management that ensures BCEA
            compliance, reduces administrative burden, and creates positive workplace experiences. We
            believe that when leave management is simple and fair, businesses thrive and employees flourish.
          </p>
        </div>

        {/* Values Grid */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-gray-900 text-center mb-12">
            Our Values
          </h2>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white p-8 rounded-xl border border-gray-200 hover:shadow-lg transition-shadow">
              <div className="w-12 h-12 bg-teal-100 rounded-lg flex items-center justify-center mb-4">
                <span className="text-2xl">🎯</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">
                Compliance First
              </h3>
              <p className="text-gray-600">
                We prioritize BCEA compliance in everything we build, protecting South African businesses
                from penalties and ensuring fair treatment of employees.
              </p>
            </div>

            <div className="bg-white p-8 rounded-xl border border-gray-200 hover:shadow-lg transition-shadow">
              <div className="w-12 h-12 bg-teal-100 rounded-lg flex items-center justify-center mb-4">
                <span className="text-2xl">💡</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">
                Simple & Intuitive
              </h3>
              <p className="text-gray-600">
                Leave management shouldn't be complicated. We design for simplicity, making it easy for
                everyone from small businesses to enterprises.
              </p>
            </div>

            <div className="bg-white p-8 rounded-xl border border-gray-200 hover:shadow-lg transition-shadow">
              <div className="w-12 h-12 bg-teal-100 rounded-lg flex items-center justify-center mb-4">
                <span className="text-2xl">🤝</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">
                Customer Success
              </h3>
              <p className="text-gray-600">
                Your success is our success. We're committed to providing exceptional support and
                continuously improving based on your feedback.
              </p>
            </div>
          </div>
        </div>

        {/* Why South Africa */}
        <div className="bg-white p-12 rounded-2xl border border-gray-200 mb-16">
          <h2 className="text-3xl font-bold text-gray-900 text-center mb-6">
            Built for South Africa
          </h2>

          <p className="text-lg text-gray-700 text-center max-w-3xl mx-auto mb-8 leading-relaxed">
            LeaveHub is proudly South African, built by a team that understands the unique challenges of
            managing leave in accordance with the Basic Conditions of Employment Act (BCEA) and South
            African labour law.
          </p>

          <div className="grid md:grid-cols-2 gap-6 max-w-3xl mx-auto">
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 bg-teal-100 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                <span className="text-teal-600 text-sm">✓</span>
              </div>
              <p className="text-gray-700">
                BCEA-compliant leave calculations and accrual rules
              </p>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-6 h-6 bg-teal-100 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                <span className="text-teal-600 text-sm">✓</span>
              </div>
              <p className="text-gray-700">
                South African public holiday calendar built-in
              </p>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-6 h-6 bg-teal-100 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                <span className="text-teal-600 text-sm">✓</span>
              </div>
              <p className="text-gray-700">
                Local support team in your timezone
              </p>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-6 h-6 bg-teal-100 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                <span className="text-teal-600 text-sm">✓</span>
              </div>
              <p className="text-gray-700">
                Pricing in South African Rand
              </p>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="bg-gradient-to-r from-teal-600 to-teal-700 rounded-2xl p-12 text-center text-white">
          <h2 className="text-3xl font-bold mb-4">
            Ready to Transform Your Leave Management?
          </h2>
          <p className="text-xl text-teal-50 mb-8 max-w-2xl mx-auto">
            Join hundreds of South African businesses using LeaveHub
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/sign-up">
              <Button size="lg" className="bg-white text-teal-600 hover:bg-gray-50 px-8">
                Start Free Trial
              </Button>
            </Link>
            <Link href="/contact">
              <Button
                size="lg"
                variant="outline"
                className="border-2 border-white text-white hover:bg-white/10 px-8"
              >
                Contact Sales
              </Button>
            </Link>
          </div>
        </div>
      </div>

      <MarketingFooter />
    </div>
  );
}
