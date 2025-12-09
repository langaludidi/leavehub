'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Mail, Phone, MessageSquare, HelpCircle, MapPin, Clock, Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import MarketingNav from '@/components/MarketingNav';
import MarketingFooter from '@/components/MarketingFooter';

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    company: '',
    inquiryType: 'general',
    message: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle form submission
    alert('Thank you for your message. We will get back to you soon!');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <MarketingNav />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold text-gray-900 mb-4">Contact Us</h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            We're here to help! Get in touch with our team for support, sales inquiries,
            or any questions about LeaveHub.
          </p>
        </div>

        {/* Contact Methods */}
        <div className="grid md:grid-cols-3 gap-6 mb-16">
          <Card className="p-6 text-center hover:shadow-lg transition-shadow">
            <div className="w-14 h-14 bg-teal-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Mail className="w-7 h-7 text-teal-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Email Support</h3>
            <p className="text-sm text-gray-600 mb-3">Get help with any questions or issues</p>
            <a href="mailto:support@leavehub.co.za" className="text-teal-600 hover:text-teal-700 font-medium">
              support@leavehub.co.za
            </a>
            <p className="text-xs text-gray-500 mt-2">24/7 - Average response: 2 hours</p>
          </Card>

          <Card className="p-6 text-center hover:shadow-lg transition-shadow">
            <div className="w-14 h-14 bg-teal-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Phone className="w-7 h-7 text-teal-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Phone Support</h3>
            <p className="text-sm text-gray-600 mb-3">Speak directly with our support team</p>
            <a href="tel:+27211234567" className="text-teal-600 hover:text-teal-700 font-medium">
              +27 21 123 4567
            </a>
            <p className="text-xs text-gray-500 mt-2">Mon-Fri: 8:00 AM - 6:00 PM SAST</p>
          </Card>

          <Card className="p-6 text-center hover:shadow-lg transition-shadow">
            <div className="w-14 h-14 bg-teal-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <MessageSquare className="w-7 h-7 text-teal-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Live Chat</h3>
            <p className="text-sm text-gray-600 mb-3">Real-time assistance for urgent matters</p>
            <button className="text-teal-600 hover:text-teal-700 font-medium">
              Available in-app
            </button>
            <p className="text-xs text-gray-500 mt-2">Mon-Fri: 9:00 AM - 5:00 PM SAST</p>
          </Card>
        </div>

        <div className="grid lg:grid-cols-2 gap-12 mb-16">
          {/* Contact Form */}
          <div>
            <h2 className="text-3xl font-bold text-gray-900 mb-6">Send us a Message</h2>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Full Name *
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                  placeholder="Your name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email Address *
                </label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                  placeholder="your@email.com"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Company Name
                </label>
                <input
                  type="text"
                  value={formData.company}
                  onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                  placeholder="Your company"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Select inquiry type
                </label>
                <select
                  value={formData.inquiryType}
                  onChange={(e) => setFormData({ ...formData, inquiryType: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                >
                  <option value="general">General Inquiry</option>
                  <option value="sales">Sales & Pricing</option>
                  <option value="support">Technical Support</option>
                  <option value="partnership">Partnership Opportunity</option>
                  <option value="feedback">Feedback</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tell us how we can help you... *
                </label>
                <textarea
                  required
                  rows={6}
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                  placeholder="Your message..."
                />
              </div>

              <Button type="submit" size="lg" className="w-full bg-teal-700 hover:bg-teal-800">
                <Send className="w-5 h-5 mr-2" />
                Send Message
              </Button>
            </form>
          </div>

          {/* Contact Info */}
          <div>
            <h2 className="text-3xl font-bold text-gray-900 mb-6">Our Office</h2>

            <Card className="p-6 mb-6">
              <div className="flex items-start gap-4 mb-4">
                <MapPin className="w-6 h-6 text-teal-600 flex-shrink-0 mt-1" />
                <div>
                  <div className="font-semibold text-gray-900 mb-1">LeaveHub (Pty) Ltd</div>
                  <div className="text-gray-600">
                    123 Business District<br />
                    Cape Town, 8001<br />
                    South Africa
                  </div>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <Clock className="w-6 h-6 text-teal-600 flex-shrink-0 mt-1" />
                <div>
                  <div className="font-semibold text-gray-900 mb-1">Office Hours</div>
                  <div className="text-gray-600">Monday - Friday: 8:00 AM - 6:00 PM SAST</div>
                </div>
              </div>
            </Card>

            <h3 className="text-xl font-semibold text-gray-900 mb-4">Direct Contact</h3>

            <div className="space-y-4 mb-8">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 bg-teal-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Mail className="w-5 h-5 text-teal-600" />
                </div>
                <div>
                  <div className="font-semibold text-gray-900">Sales</div>
                  <div className="text-sm text-gray-600">Product demos, pricing, and new customer inquiries</div>
                  <a href="mailto:sales@leavehub.co.za" className="text-sm text-teal-600 hover:text-teal-700">
                    sales@leavehub.co.za
                  </a>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-10 h-10 bg-teal-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <HelpCircle className="w-5 h-5 text-teal-600" />
                </div>
                <div>
                  <div className="font-semibold text-gray-900">Support</div>
                  <div className="text-sm text-gray-600">Technical assistance and customer support</div>
                  <a href="mailto:support@leavehub.co.za" className="text-sm text-teal-600 hover:text-teal-700">
                    support@leavehub.co.za
                  </a>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-10 h-10 bg-teal-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <MessageSquare className="w-5 h-5 text-teal-600" />
                </div>
                <div>
                  <div className="font-semibold text-gray-900">Partnerships</div>
                  <div className="text-sm text-gray-600">Integration partnerships and business development</div>
                  <a href="mailto:partnerships@leavehub.co.za" className="text-sm text-teal-600 hover:text-teal-700">
                    partnerships@leavehub.co.za
                  </a>
                </div>
              </div>
            </div>

            <Card className="p-6 bg-teal-50 border-teal-200">
              <h4 className="font-semibold text-gray-900 mb-2">Looking for Quick Answers?</h4>
              <p className="text-sm text-gray-700 mb-4">
                Check out our comprehensive help center for instant solutions to common questions.
              </p>
              <Link href="/dashboard/help">
                <Button variant="outline" className="border-teal-600 text-teal-600 hover:bg-teal-100">
                  Visit Help Center
                </Button>
              </Link>
            </Card>

            <Card className="p-6 bg-red-50 border-red-200 mt-6">
              <h4 className="font-semibold text-gray-900 mb-2">Emergency Support</h4>
              <p className="text-sm text-gray-700 mb-2">
                For critical system outages or urgent security issues that require immediate attention:
              </p>
              <div className="space-y-1">
                <a href="mailto:emergency@leavehub.co.za" className="block text-sm text-red-600 hover:text-red-700 font-medium">
                  emergency@leavehub.co.za
                </a>
                <a href="tel:+27211234567" className="block text-sm text-red-600 hover:text-red-700 font-medium">
                  +27 21 123 4567
                </a>
              </div>
              <p className="text-xs text-gray-600 mt-2">
                Emergency support is available 24/7 for paying customers
              </p>
            </Card>
          </div>
        </div>
      </div>

      <MarketingFooter />
    </div>
  );
}
