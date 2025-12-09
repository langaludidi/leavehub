import Link from 'next/link';
import { Cookie, Settings, Eye, Shield, AlertCircle } from 'lucide-react';
import { Card } from '@/components/ui/card';
import MarketingNav from '@/components/MarketingNav';
import MarketingFooter from '@/components/MarketingFooter';

export default function CookiePolicyPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <MarketingNav />

      {/* Header */}
      <div className="bg-teal-700 text-white py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3 mb-4">
            <Cookie className="w-8 h-8" />
            <h1 className="text-4xl font-bold">Cookie Policy</h1>
          </div>
          <p className="text-teal-50 text-lg">
            Effective Date: January 1, 2025
          </p>
          <p className="text-teal-100 mt-2">
            Last Updated: January 1, 2025
          </p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Introduction */}
        <Card className="p-8 mb-8 bg-teal-50 border-teal-200">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">What Are Cookies?</h2>
          <p className="text-gray-700 leading-relaxed mb-4">
            Cookies are small text files that are placed on your device (computer, smartphone, or
            tablet) when you visit our website. They are widely used to make websites work more
            efficiently and provide information to website owners.
          </p>
          <p className="text-gray-700 leading-relaxed">
            This Cookie Policy explains what cookies are, how we use them on LeaveHub, what types of
            cookies we use, and how you can control them.
          </p>
        </Card>

        {/* Why We Use Cookies */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">1. Why We Use Cookies</h2>

          <p className="text-gray-700 mb-6">
            We use cookies for several important reasons:
          </p>

          <div className="grid md:grid-cols-2 gap-4">
            <Card className="p-6 border-gray-200">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 bg-teal-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Shield className="w-5 h-5 text-teal-600" />
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Security & Authentication</h4>
                  <p className="text-sm text-gray-700">
                    Keep you logged in and protect your account from unauthorized access
                  </p>
                </div>
              </div>
            </Card>

            <Card className="p-6 border-gray-200">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 bg-teal-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Settings className="w-5 h-5 text-teal-600" />
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Remember Preferences</h4>
                  <p className="text-sm text-gray-700">
                    Store your settings like language, theme, and display preferences
                  </p>
                </div>
              </div>
            </Card>

            <Card className="p-6 border-gray-200">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 bg-teal-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Eye className="w-5 h-5 text-teal-600" />
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Analytics & Performance</h4>
                  <p className="text-sm text-gray-700">
                    Understand how you use our platform to improve features and user experience
                  </p>
                </div>
              </div>
            </Card>

            <Card className="p-6 border-gray-200">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 bg-teal-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <AlertCircle className="w-5 h-5 text-teal-600" />
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Essential Functionality</h4>
                  <p className="text-sm text-gray-700">
                    Enable core features like form submission and session management
                  </p>
                </div>
              </div>
            </Card>
          </div>
        </section>

        {/* Types of Cookies */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">2. Types of Cookies We Use</h2>

          <div className="space-y-6">
            {/* Essential Cookies */}
            <div>
              <div className="flex items-center gap-3 mb-3">
                <div className="w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center">
                  <span className="text-red-600 font-bold text-sm">!</span>
                </div>
                <h3 className="text-xl font-semibold text-gray-900">2.1 Essential Cookies (Required)</h3>
              </div>
              <Card className="p-6 border-l-4 border-l-red-500">
                <p className="text-gray-700 mb-4">
                  These cookies are strictly necessary for the platform to function and cannot be
                  disabled. Without these cookies, you would not be able to use LeaveHub.
                </p>
                <div className="space-y-2">
                  <div className="flex items-start gap-2">
                    <span className="text-teal-600 font-bold">•</span>
                    <div>
                      <strong className="text-gray-900">Authentication:</strong>
                      <span className="text-gray-700"> Keep you logged in and verify your identity</span>
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="text-teal-600 font-bold">•</span>
                    <div>
                      <strong className="text-gray-900">Security:</strong>
                      <span className="text-gray-700"> Protect against cross-site request forgery (CSRF) attacks</span>
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="text-teal-600 font-bold">•</span>
                    <div>
                      <strong className="text-gray-900">Session Management:</strong>
                      <span className="text-gray-700"> Maintain your session state while using the platform</span>
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="text-teal-600 font-bold">•</span>
                    <div>
                      <strong className="text-gray-900">Load Balancing:</strong>
                      <span className="text-gray-700"> Route your requests to the correct server</span>
                    </div>
                  </div>
                </div>
              </Card>
            </div>

            {/* Functional Cookies */}
            <div>
              <div className="flex items-center gap-3 mb-3">
                <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Settings className="w-4 h-4 text-blue-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900">2.2 Functional Cookies</h3>
              </div>
              <Card className="p-6 border-l-4 border-l-blue-500">
                <p className="text-gray-700 mb-4">
                  These cookies enable enhanced functionality and personalization. They may be set by
                  us or third-party providers.
                </p>
                <div className="space-y-2">
                  <div className="flex items-start gap-2">
                    <span className="text-teal-600 font-bold">•</span>
                    <div>
                      <strong className="text-gray-900">Preferences:</strong>
                      <span className="text-gray-700"> Remember your language, theme, and display settings</span>
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="text-teal-600 font-bold">•</span>
                    <div>
                      <strong className="text-gray-900">UI State:</strong>
                      <span className="text-gray-700"> Save your sidebar collapsed/expanded state and other UI preferences</span>
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="text-teal-600 font-bold">•</span>
                    <div>
                      <strong className="text-gray-900">Notifications:</strong>
                      <span className="text-gray-700"> Remember your notification preferences and dismissed messages</span>
                    </div>
                  </div>
                </div>
              </Card>
            </div>

            {/* Performance Cookies */}
            <div>
              <div className="flex items-center gap-3 mb-3">
                <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                  <Eye className="w-4 h-4 text-purple-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900">2.3 Performance & Analytics Cookies</h3>
              </div>
              <Card className="p-6 border-l-4 border-l-purple-500">
                <p className="text-gray-700 mb-4">
                  These cookies help us understand how visitors interact with our platform by
                  collecting and reporting information anonymously.
                </p>
                <div className="space-y-2">
                  <div className="flex items-start gap-2">
                    <span className="text-teal-600 font-bold">•</span>
                    <div>
                      <strong className="text-gray-900">Usage Analytics:</strong>
                      <span className="text-gray-700"> Track which pages you visit and how long you spend on them</span>
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="text-teal-600 font-bold">•</span>
                    <div>
                      <strong className="text-gray-900">Performance Monitoring:</strong>
                      <span className="text-gray-700"> Identify slow-loading pages and technical issues</span>
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="text-teal-600 font-bold">•</span>
                    <div>
                      <strong className="text-gray-900">Feature Usage:</strong>
                      <span className="text-gray-700"> Understand which features are most popular to prioritize improvements</span>
                    </div>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        </section>

        {/* Third-Party Cookies */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">3. Third-Party Cookies</h2>

          <p className="text-gray-700 mb-6">
            We work with trusted third-party service providers who may set cookies on our behalf.
            These partners help us deliver and improve our Service.
          </p>

          <div className="space-y-4">
            <Card className="p-6 border-gray-200">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-teal-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Shield className="w-6 h-6 text-teal-600" />
                </div>
                <div className="flex-1">
                  <h4 className="font-semibold text-gray-900 mb-2">Clerk (Authentication)</h4>
                  <p className="text-sm text-gray-700 mb-2">
                    Handles user authentication and session management
                  </p>
                  <a
                    href="https://clerk.com/privacy"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-teal-600 hover:text-teal-700"
                  >
                    View Clerk's Privacy Policy →
                  </a>
                </div>
              </div>
            </Card>

            <Card className="p-6 border-gray-200">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-teal-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Eye className="w-6 h-6 text-teal-600" />
                </div>
                <div className="flex-1">
                  <h4 className="font-semibold text-gray-900 mb-2">Google Analytics (Optional)</h4>
                  <p className="text-sm text-gray-700 mb-2">
                    Provides website analytics and usage insights
                  </p>
                  <a
                    href="https://policies.google.com/privacy"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-teal-600 hover:text-teal-700"
                  >
                    View Google's Privacy Policy →
                  </a>
                </div>
              </div>
            </Card>

            <Card className="p-6 border-gray-200">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-teal-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Settings className="w-6 h-6 text-teal-600" />
                </div>
                <div className="flex-1">
                  <h4 className="font-semibold text-gray-900 mb-2">Vercel (Hosting & Performance)</h4>
                  <p className="text-sm text-gray-700 mb-2">
                    Hosts our platform and monitors performance
                  </p>
                  <a
                    href="https://vercel.com/legal/privacy-policy"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-teal-600 hover:text-teal-700"
                  >
                    View Vercel's Privacy Policy →
                  </a>
                </div>
              </div>
            </Card>
          </div>
        </section>

        {/* Managing Cookies */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">4. Managing Your Cookie Preferences</h2>

          <div className="space-y-6">
            <Card className="p-6 bg-blue-50 border-blue-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Browser Settings</h3>
              <p className="text-gray-700 mb-4">
                Most web browsers allow you to control cookies through their settings. You can set
                your browser to refuse cookies or delete certain cookies. Here's how:
              </p>
              <div className="grid md:grid-cols-2 gap-3">
                <a
                  href="https://support.google.com/chrome/answer/95647"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-teal-600 hover:text-teal-700 flex items-center gap-2"
                >
                  <span>→</span> Google Chrome
                </a>
                <a
                  href="https://support.mozilla.org/en-US/kb/enhanced-tracking-protection-firefox-desktop"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-teal-600 hover:text-teal-700 flex items-center gap-2"
                >
                  <span>→</span> Mozilla Firefox
                </a>
                <a
                  href="https://support.apple.com/guide/safari/manage-cookies-sfri11471/mac"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-teal-600 hover:text-teal-700 flex items-center gap-2"
                >
                  <span>→</span> Safari
                </a>
                <a
                  href="https://support.microsoft.com/en-us/microsoft-edge/delete-cookies-in-microsoft-edge-63947406-40ac-c3b8-57b9-2a946a29ae09"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-teal-600 hover:text-teal-700 flex items-center gap-2"
                >
                  <span>→</span> Microsoft Edge
                </a>
              </div>
            </Card>

            <Card className="p-6 bg-amber-50 border-amber-200">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-6 h-6 text-amber-600 flex-shrink-0 mt-1" />
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Important Note</h3>
                  <p className="text-gray-700">
                    Please note that disabling essential cookies will prevent you from using certain
                    features of LeaveHub. The platform requires authentication cookies to function
                    properly. Disabling functional or performance cookies will not affect core
                    functionality but may reduce your user experience.
                  </p>
                </div>
              </div>
            </Card>

            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Opt-Out Options</h3>
              <p className="text-gray-700 mb-4">
                For analytics cookies, you can opt out using these tools:
              </p>
              <ul className="space-y-2">
                <li>
                  <a
                    href="https://tools.google.com/dlpage/gaoptout"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-teal-600 hover:text-teal-700 flex items-center gap-2"
                  >
                    <span>→</span> Google Analytics Opt-out Browser Add-on
                  </a>
                </li>
                <li>
                  <a
                    href="https://www.aboutads.info/choices/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-teal-600 hover:text-teal-700 flex items-center gap-2"
                  >
                    <span>→</span> Digital Advertising Alliance Opt-Out
                  </a>
                </li>
              </ul>
            </div>
          </div>
        </section>

        {/* Cookie Duration */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">5. How Long Do Cookies Last?</h2>

          <div className="space-y-4">
            <Card className="p-6 border-gray-200">
              <h4 className="font-semibold text-gray-900 mb-2">Session Cookies</h4>
              <p className="text-sm text-gray-700">
                These temporary cookies expire when you close your browser. They are used for
                essential functions like maintaining your login session.
              </p>
            </Card>

            <Card className="p-6 border-gray-200">
              <h4 className="font-semibold text-gray-900 mb-2">Persistent Cookies</h4>
              <p className="text-sm text-gray-700">
                These cookies remain on your device for a set period (typically 30 days to 2 years)
                or until you delete them. They are used to remember your preferences and settings.
              </p>
            </Card>
          </div>
        </section>

        {/* Updates */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">6. Updates to This Cookie Policy</h2>
          <p className="text-gray-700">
            We may update this Cookie Policy from time to time to reflect changes in our practices
            or for legal, regulatory, or operational reasons. We will notify you of any material
            changes by posting the updated policy on this page and updating the "Last Updated" date.
            We encourage you to review this Cookie Policy periodically.
          </p>
        </section>

        {/* Contact */}
        <Card className="p-8 bg-teal-50 border-teal-200">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">7. Contact Us</h2>
          <p className="text-gray-700 mb-6">
            If you have any questions about our use of cookies or this Cookie Policy, please contact us:
          </p>

          <div className="space-y-3 text-gray-700">
            <div>
              <strong>LeaveHub (Pty) Ltd</strong>
            </div>
            <div>
              <strong>Email:</strong>{' '}
              <a href="mailto:privacy@leavehub.co.za" className="text-teal-600 hover:text-teal-700">
                privacy@leavehub.co.za
              </a>
            </div>
            <div>
              <strong>Phone:</strong>{' '}
              <a href="tel:+27211234567" className="text-teal-600 hover:text-teal-700">
                +27 21 123 4567
              </a>
            </div>
            <div>
              <strong>Address:</strong> 123 Business District, Cape Town, 8001, South Africa
            </div>
          </div>
        </Card>

        {/* Related Links */}
        <div className="mt-12 flex flex-wrap gap-4 justify-center">
          <Link href="/privacy">
            <span className="text-teal-600 hover:text-teal-700 font-medium">Privacy Policy</span>
          </Link>
          <span className="text-gray-400">•</span>
          <Link href="/terms">
            <span className="text-teal-600 hover:text-teal-700 font-medium">Terms of Service</span>
          </Link>
          <span className="text-gray-400">•</span>
          <Link href="/contact">
            <span className="text-teal-600 hover:text-teal-700 font-medium">Contact Us</span>
          </Link>
        </div>
      </div>

      <MarketingFooter />
    </div>
  );
}
