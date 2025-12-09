import Link from 'next/link';
import { FileText, Users, CreditCard, AlertTriangle, Scale, Shield, X } from 'lucide-react';
import { Card } from '@/components/ui/card';
import MarketingNav from '@/components/MarketingNav';
import MarketingFooter from '@/components/MarketingFooter';

export default function TermsOfServicePage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <MarketingNav />

      {/* Header */}
      <div className="bg-teal-700 text-white py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3 mb-4">
            <FileText className="w-8 h-8" />
            <h1 className="text-4xl font-bold">Terms of Service</h1>
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
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Welcome to LeaveHub</h2>
          <p className="text-gray-700 leading-relaxed mb-4">
            These Terms of Service ("Terms") govern your access to and use of the LeaveHub platform,
            services, and website (collectively, the "Service") provided by LeaveHub (Pty) Ltd
            ("LeaveHub," "we," "us," or "our").
          </p>
          <p className="text-gray-700 leading-relaxed">
            By accessing or using our Service, you agree to be bound by these Terms. If you do not
            agree to these Terms, please do not use our Service.
          </p>
        </Card>

        {/* 1. Acceptance of Terms */}
        <section className="mb-12">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-teal-100 rounded-lg flex items-center justify-center">
              <FileText className="w-5 h-5 text-teal-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900">1. Acceptance of Terms</h2>
          </div>

          <div className="space-y-4 text-gray-700">
            <p>
              By accessing and using LeaveHub, you acknowledge that you have read, understood, and
              agree to be bound by these Terms of Service and all applicable laws and regulations.
            </p>
            <p>
              These Terms constitute a legally binding agreement between you (and your organization,
              if applicable) and LeaveHub (Pty) Ltd.
            </p>
            <p>
              We reserve the right to modify these Terms at any time. We will notify users of any
              material changes via email or through the Service. Your continued use of the Service
              after such changes constitutes your acceptance of the new Terms.
            </p>
          </div>
        </section>

        {/* 2. User Accounts */}
        <section className="mb-12">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-teal-100 rounded-lg flex items-center justify-center">
              <Users className="w-5 h-5 text-teal-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900">2. User Accounts</h2>
          </div>

          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">2.1 Account Creation</h3>
              <p className="text-gray-700">
                To use LeaveHub, you must create an account. You agree to provide accurate, current,
                and complete information during the registration process and to update such
                information to keep it accurate, current, and complete.
              </p>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">2.2 Account Security</h3>
              <p className="text-gray-700 mb-3">You are responsible for:</p>
              <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
                <li>Maintaining the confidentiality of your account credentials</li>
                <li>All activities that occur under your account</li>
                <li>Notifying us immediately of any unauthorized use or security breach</li>
                <li>Ensuring that you log out from your account at the end of each session</li>
              </ul>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">2.3 Account Termination</h3>
              <p className="text-gray-700">
                We reserve the right to suspend or terminate your account if you violate these Terms
                or engage in any fraudulent, abusive, or illegal activity.
              </p>
            </div>
          </div>
        </section>

        {/* 3. Acceptable Use */}
        <section className="mb-12">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-teal-100 rounded-lg flex items-center justify-center">
              <Shield className="w-5 h-5 text-teal-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900">3. Acceptable Use Policy</h2>
          </div>

          <p className="text-gray-700 mb-4">You agree NOT to use the Service to:</p>

          <div className="space-y-3">
            <Card className="p-4 border-l-4 border-l-red-500 bg-red-50">
              <div className="flex items-start gap-3">
                <X className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-semibold text-gray-900 mb-1">Unlawful Activities</h4>
                  <p className="text-sm text-gray-700">
                    Use the service for any unlawful purpose or in violation of any local, state,
                    national, or international law
                  </p>
                </div>
              </div>
            </Card>

            <Card className="p-4 border-l-4 border-l-red-500 bg-red-50">
              <div className="flex items-start gap-3">
                <X className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-semibold text-gray-900 mb-1">Unauthorized Access</h4>
                  <p className="text-sm text-gray-700">
                    Attempt to gain unauthorized access to our systems, accounts, or networks
                  </p>
                </div>
              </div>
            </Card>

            <Card className="p-4 border-l-4 border-l-red-500 bg-red-50">
              <div className="flex items-start gap-3">
                <X className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-semibold text-gray-900 mb-1">Malicious Code</h4>
                  <p className="text-sm text-gray-700">
                    Upload or distribute viruses, malware, or any other malicious code
                  </p>
                </div>
              </div>
            </Card>

            <Card className="p-4 border-l-4 border-l-red-500 bg-red-50">
              <div className="flex items-start gap-3">
                <X className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-semibold text-gray-900 mb-1">Service Interference</h4>
                  <p className="text-sm text-gray-700">
                    Interfere with or disrupt the Service or servers connected to the Service
                  </p>
                </div>
              </div>
            </Card>

            <Card className="p-4 border-l-4 border-l-red-500 bg-red-50">
              <div className="flex items-start gap-3">
                <X className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-semibold text-gray-900 mb-1">Data Scraping</h4>
                  <p className="text-sm text-gray-700">
                    Use automated systems to extract data from the Service without permission
                  </p>
                </div>
              </div>
            </Card>

            <Card className="p-4 border-l-4 border-l-red-500 bg-red-50">
              <div className="flex items-start gap-3">
                <X className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-semibold text-gray-900 mb-1">Impersonation</h4>
                  <p className="text-sm text-gray-700">
                    Impersonate any person or entity or misrepresent your affiliation
                  </p>
                </div>
              </div>
            </Card>
          </div>
        </section>

        {/* 4. Service Availability */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">4. Service Availability</h2>

          <div className="space-y-4 text-gray-700">
            <p>
              We strive to provide 99.9% uptime for our Service, but we cannot guarantee
              uninterrupted or error-free operation. The Service may be subject to limitations,
              delays, and other problems inherent in the use of the internet and electronic
              communications.
            </p>
            <p>
              We reserve the right to modify, suspend, or discontinue the Service (or any part
              thereof) at any time with reasonable notice to users. We will not be liable for any
              modification, suspension, or discontinuance of the Service.
            </p>
            <p>
              Scheduled maintenance will be announced in advance through the Service or via email.
              For current system status, please visit our{' '}
              <Link href="/status" className="text-teal-600 hover:text-teal-700 font-medium">
                Status Page
              </Link>
              .
            </p>
          </div>
        </section>

        {/* 5. Data Ownership */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">5. Data Ownership and Usage</h2>

          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">5.1 Your Data</h3>
              <p className="text-gray-700">
                You retain all ownership rights to the data and content you submit to LeaveHub ("Your
                Data"). We claim no ownership over any content, files, or data you provide through
                the Service.
              </p>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">5.2 License to Use</h3>
              <p className="text-gray-700">
                By submitting Your Data to the Service, you grant us a limited license to use, store,
                process, and display Your Data solely for the purpose of providing the Service to you
                and as described in our Privacy Policy.
              </p>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">5.3 Data Export</h3>
              <p className="text-gray-700">
                You may export Your Data at any time through the Service's export functionality. Upon
                termination, you will have 60 days to export Your Data before it is permanently
                deleted.
              </p>
            </div>
          </div>
        </section>

        {/* 6. Payment Terms */}
        <section className="mb-12">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-teal-100 rounded-lg flex items-center justify-center">
              <CreditCard className="w-5 h-5 text-teal-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900">6. Payment Terms</h2>
          </div>

          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">6.1 Subscription Fees</h3>
              <p className="text-gray-700">
                Subscription fees are billed in advance on a monthly or annual basis, depending on
                your chosen plan. All fees are stated in South African Rand (ZAR) and are exclusive
                of VAT where applicable.
              </p>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">6.2 Payment Method</h3>
              <p className="text-gray-700">
                You must provide current, complete, and accurate billing information. You authorize
                us to charge your payment method for all fees incurred.
              </p>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">6.3 Refund Policy</h3>
              <p className="text-gray-700">
                Subscription fees are non-refundable except as required by South African consumer
                protection law. If you cancel your subscription, you will retain access to the Service
                until the end of your current billing period.
              </p>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">6.4 Price Changes</h3>
              <p className="text-gray-700">
                We reserve the right to change our pricing with 30 days' advance notice. Price changes
                will not affect your current billing cycle and will take effect at your next renewal.
              </p>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">6.5 Failed Payments</h3>
              <p className="text-gray-700">
                If a payment fails, we will attempt to process the payment again. If payment fails
                multiple times, we may suspend your access to the Service until payment is received.
              </p>
            </div>
          </div>
        </section>

        {/* 7. Termination */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">7. Termination</h2>

          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">7.1 Termination by You</h3>
              <p className="text-gray-700">
                You may terminate your subscription at any time through your account settings or by
                providing 30 days' written notice to support@leavehub.co.za.
              </p>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">7.2 Termination by Us</h3>
              <p className="text-gray-700">
                We may terminate or suspend your access to the Service immediately, without prior
                notice or liability, if you breach these Terms or engage in fraudulent, abusive, or
                illegal activity.
              </p>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">7.3 Effect of Termination</h3>
              <p className="text-gray-700 mb-3">Upon termination:</p>
              <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
                <li>Your right to access and use the Service will immediately cease</li>
                <li>You will have 60 days to export Your Data from the Service</li>
                <li>After 60 days, Your Data will be permanently deleted from our systems</li>
                <li>You remain liable for all fees incurred prior to termination</li>
              </ul>
            </div>
          </div>
        </section>

        {/* 8. Limitation of Liability */}
        <section className="mb-12">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-teal-100 rounded-lg flex items-center justify-center">
              <AlertTriangle className="w-5 h-5 text-teal-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900">8. Limitation of Liability</h2>
          </div>

          <div className="space-y-4 text-gray-700">
            <p>
              TO THE MAXIMUM EXTENT PERMITTED BY APPLICABLE LAW, IN NO EVENT SHALL LEAVEHUB BE LIABLE
              FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES, OR ANY LOSS
              OF PROFITS OR REVENUES, WHETHER INCURRED DIRECTLY OR INDIRECTLY, OR ANY LOSS OF DATA,
              USE, GOODWILL, OR OTHER INTANGIBLE LOSSES RESULTING FROM:
            </p>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li>Your access to or use of (or inability to access or use) the Service</li>
              <li>Any conduct or content of any third party on the Service</li>
              <li>Any content obtained from the Service</li>
              <li>Unauthorized access, use, or alteration of your data or content</li>
            </ul>
            <p>
              OUR TOTAL LIABILITY FOR ANY CLAIMS ARISING FROM OR RELATED TO THE SERVICE SHALL NOT
              EXCEED THE AMOUNT YOU PAID TO US IN THE 12 MONTHS PRECEDING THE CLAIM.
            </p>
          </div>
        </section>

        {/* 9. Indemnification */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">9. Indemnification</h2>
          <p className="text-gray-700">
            You agree to indemnify, defend, and hold harmless LeaveHub and its officers, directors,
            employees, and agents from and against any claims, liabilities, damages, losses, and
            expenses arising out of or in any way connected with your access to or use of the Service,
            your violation of these Terms, or your violation of any rights of another.
          </p>
        </section>

        {/* 10. Governing Law */}
        <section className="mb-12">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-teal-100 rounded-lg flex items-center justify-center">
              <Scale className="w-5 h-5 text-teal-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900">10. Governing Law and Dispute Resolution</h2>
          </div>

          <div className="space-y-4 text-gray-700">
            <p>
              These Terms are governed by and construed in accordance with the laws of the Republic
              of South Africa, without regard to its conflict of law provisions.
            </p>
            <p>
              Any disputes arising from or relating to these Terms or the Service shall be resolved
              exclusively in the courts of Cape Town, South Africa. You consent to the personal
              jurisdiction of such courts.
            </p>
            <p>
              Before filing any formal legal action, we encourage you to contact us at
              legal@leavehub.co.za to seek an amicable resolution.
            </p>
          </div>
        </section>

        {/* 11. General Provisions */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">11. General Provisions</h2>

          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">11.1 Entire Agreement</h3>
              <p className="text-gray-700">
                These Terms, together with our Privacy Policy and any other legal notices published
                on the Service, constitute the entire agreement between you and LeaveHub.
              </p>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">11.2 Severability</h3>
              <p className="text-gray-700">
                If any provision of these Terms is found to be unenforceable, the remaining provisions
                will continue in full force and effect.
              </p>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">11.3 Waiver</h3>
              <p className="text-gray-700">
                No waiver of any term of these Terms shall be deemed a further or continuing waiver
                of such term or any other term.
              </p>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">11.4 Assignment</h3>
              <p className="text-gray-700">
                You may not assign or transfer these Terms without our prior written consent. We may
                assign these Terms without restriction.
              </p>
            </div>
          </div>
        </section>

        {/* Contact */}
        <Card className="p-8 bg-teal-50 border-teal-200">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Contact Us</h2>
          <p className="text-gray-700 mb-6">
            If you have any questions about these Terms of Service, please contact us:
          </p>

          <div className="space-y-3 text-gray-700">
            <div>
              <strong>LeaveHub (Pty) Ltd</strong>
            </div>
            <div>
              <strong>Legal Department</strong>
            </div>
            <div>
              <strong>Email:</strong>{' '}
              <a href="mailto:legal@leavehub.co.za" className="text-teal-600 hover:text-teal-700">
                legal@leavehub.co.za
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
          <Link href="/cookies">
            <span className="text-teal-600 hover:text-teal-700 font-medium">Cookie Policy</span>
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
