import Link from 'next/link';
import { HelpCircle, BookOpen, MessageSquare, Search, FileText, Users, Calendar, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import MarketingNav from '@/components/MarketingNav';
import MarketingFooter from '@/components/MarketingFooter';

export default function HelpPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <MarketingNav />

      {/* Hero Section */}
      <section className="bg-teal-700 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto">
            <HelpCircle className="w-16 h-16 mx-auto mb-6" />
            <h1 className="text-5xl font-bold mb-6">How Can We Help?</h1>
            <p className="text-xl text-teal-50 mb-8">
              Find answers, guides, and support for LeaveHub
            </p>

            {/* Search Bar */}
            <div className="relative max-w-2xl mx-auto">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search for help articles..."
                className="w-full pl-12 pr-4 py-4 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
            </div>
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {/* Quick Links */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          <Link href="/dashboard/help">
            <Card className="p-6 text-center hover:shadow-lg transition-shadow cursor-pointer border-2 hover:border-teal-200">
              <div className="w-12 h-12 bg-teal-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                <BookOpen className="w-6 h-6 text-teal-700" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Knowledge Base</h3>
              <p className="text-sm text-gray-600">Browse 26 help articles</p>
            </Card>
          </Link>

          <Link href="/contact">
            <Card className="p-6 text-center hover:shadow-lg transition-shadow cursor-pointer border-2 hover:border-teal-200">
              <div className="w-12 h-12 bg-teal-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                <MessageSquare className="w-6 h-6 text-teal-700" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Contact Support</h3>
              <p className="text-sm text-gray-600">Get help from our team</p>
            </Card>
          </Link>

          <Link href="/bcea-guide">
            <Card className="p-6 text-center hover:shadow-lg transition-shadow cursor-pointer border-2 hover:border-teal-200">
              <div className="w-12 h-12 bg-teal-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                <FileText className="w-6 h-6 text-teal-700" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">BCEA Guide</h3>
              <p className="text-sm text-gray-600">Labour law compliance</p>
            </Card>
          </Link>

          <Link href="/status">
            <Card className="p-6 text-center hover:shadow-lg transition-shadow cursor-pointer border-2 hover:border-teal-200">
              <div className="w-12 h-12 bg-teal-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                <HelpCircle className="w-6 h-6 text-teal-700" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">System Status</h3>
              <p className="text-sm text-gray-600">Check service health</p>
            </Card>
          </Link>
        </div>

        {/* Popular Topics */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-gray-900 text-center mb-12">
            Popular Help Topics
          </h2>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <Card className="p-6">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 bg-teal-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Users className="w-5 h-5 text-teal-700" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-3">Getting Started</h3>
                  <ul className="space-y-2">
                    <li>
                      <Link href="/dashboard/help" className="text-sm text-teal-700 hover:text-teal-800">
                        How to set up your account
                      </Link>
                    </li>
                    <li>
                      <Link href="/dashboard/help" className="text-sm text-teal-700 hover:text-teal-800">
                        Adding employees
                      </Link>
                    </li>
                    <li>
                      <Link href="/dashboard/help" className="text-sm text-teal-700 hover:text-teal-800">
                        Setting up leave policies
                      </Link>
                    </li>
                  </ul>
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 bg-teal-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Calendar className="w-5 h-5 text-teal-700" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-3">Leave Management</h3>
                  <ul className="space-y-2">
                    <li>
                      <Link href="/dashboard/help" className="text-sm text-teal-700 hover:text-teal-800">
                        Submitting leave requests
                      </Link>
                    </li>
                    <li>
                      <Link href="/dashboard/help" className="text-sm text-teal-700 hover:text-teal-800">
                        Approving leave
                      </Link>
                    </li>
                    <li>
                      <Link href="/dashboard/help" className="text-sm text-teal-700 hover:text-teal-800">
                        Managing leave balances
                      </Link>
                    </li>
                  </ul>
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 bg-teal-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Settings className="w-5 h-5 text-teal-700" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-3">Settings & Configuration</h3>
                  <ul className="space-y-2">
                    <li>
                      <Link href="/dashboard/help" className="text-sm text-teal-700 hover:text-teal-800">
                        Company settings
                      </Link>
                    </li>
                    <li>
                      <Link href="/dashboard/help" className="text-sm text-teal-700 hover:text-teal-800">
                        Configuring public holidays
                      </Link>
                    </li>
                    <li>
                      <Link href="/dashboard/help" className="text-sm text-teal-700 hover:text-teal-800">
                        Email notifications
                      </Link>
                    </li>
                  </ul>
                </div>
              </div>
            </Card>
          </div>
        </div>

        {/* Support Options */}
        <div className="bg-white rounded-2xl p-12 border border-gray-200 mb-16">
          <h2 className="text-3xl font-bold text-gray-900 text-center mb-12">
            Additional Support Options
          </h2>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-teal-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <MessageSquare className="w-8 h-8 text-teal-700" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Email Support</h3>
              <p className="text-gray-600 mb-4">
                Get help via email 24/7. Average response time: 2 hours
              </p>
              <a href="mailto:support@leavehub.co.za" className="text-teal-700 hover:text-teal-800 font-medium">
                support@leavehub.co.za
              </a>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-teal-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <HelpCircle className="w-8 h-8 text-teal-700" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Phone Support</h3>
              <p className="text-gray-600 mb-4">
                Speak with our support team Monday-Friday, 8AM-6PM SAST
              </p>
              <a href="tel:+27211234567" className="text-teal-700 hover:text-teal-800 font-medium">
                +27 21 123 4567
              </a>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-teal-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <BookOpen className="w-8 h-8 text-teal-700" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Documentation</h3>
              <p className="text-gray-600 mb-4">
                Browse our comprehensive help center with 26 detailed articles
              </p>
              <Link href="/dashboard/help" className="text-teal-700 hover:text-teal-800 font-medium">
                Visit Help Center
              </Link>
            </div>
          </div>
        </div>

        {/* CTA */}
        <div className="bg-gradient-to-r from-teal-700 to-teal-800 rounded-2xl p-12 text-center text-white">
          <h2 className="text-3xl font-bold mb-4">
            Still Have Questions?
          </h2>
          <p className="text-xl text-teal-50 mb-8 max-w-2xl mx-auto">
            Our support team is here to help. Get in touch and we'll respond within 2 hours.
          </p>
          <Link href="/contact">
            <Button size="lg" className="bg-white text-teal-700 hover:bg-gray-50 px-8">
              Contact Support
            </Button>
          </Link>
        </div>
      </div>

      <MarketingFooter />
    </div>
  );
}
