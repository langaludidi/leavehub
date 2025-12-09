import Link from 'next/link';
import { Shield, Lock, Eye, FileText, Users, AlertCircle } from 'lucide-react';
import { Card } from '@/components/ui/card';
import MarketingNav from '@/components/MarketingNav';
import MarketingFooter from '@/components/MarketingFooter';

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <MarketingNav />

      {/* Header */}
      <div className="bg-teal-600 text-white py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3 mb-4">
            <Shield className="w-8 h-8" />
            <h1 className="text-4xl font-bold">Privacy Policy</h1>
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
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Introduction</h2>
          <p className="text-gray-700 leading-relaxed mb-4">
            LeaveHub (Pty) Ltd ("we," "us," or "our") is committed to protecting your privacy and
            ensuring the security of your personal information. This Privacy Policy explains how we
            collect, use, disclose, and safeguard your information when you use our leave management
            platform at leavehub.co.za.
          </p>
          <p className="text-gray-700 leading-relaxed">
            We are fully compliant with South Africa's Protection of Personal Information Act (POPIA)
            and are committed to protecting your rights as a data subject.
          </p>
        </Card>

        {/* Information We Collect */}
        <section className="mb-12">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-teal-100 rounded-lg flex items-center justify-center">
              <FileText className="w-5 h-5 text-teal-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900">1. Information We Collect</h2>
          </div>

          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">1.1 Personal Information</h3>
              <p className="text-gray-700 mb-2">
                When you use LeaveHub, we collect the following personal information:
              </p>
              <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
                <li>Full name and employee ID</li>
                <li>Email address and phone number</li>
                <li>Job title and department</li>
                <li>Manager and reporting structure</li>
                <li>Employment start date</li>
              </ul>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">1.2 Leave Data</h3>
              <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
                <li>Leave requests and approval history</li>
                <li>Leave balances and accruals</li>
                <li>Leave type and duration</li>
                <li>Supporting documents (medical certificates, etc.)</li>
                <li>Leave calendar and schedules</li>
              </ul>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">1.3 Usage Data</h3>
              <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
                <li>IP address and device information</li>
                <li>Browser type and version</li>
                <li>Pages visited and time spent on pages</li>
                <li>Clickstream data and usage patterns</li>
                <li>Cookies and similar tracking technologies</li>
              </ul>
            </div>
          </div>
        </section>

        {/* How We Use Your Information */}
        <section className="mb-12">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-teal-100 rounded-lg flex items-center justify-center">
              <Users className="w-5 h-5 text-teal-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900">2. How We Use Your Information</h2>
          </div>

          <p className="text-gray-700 mb-4">
            We use the information we collect for the following purposes:
          </p>

          <div className="space-y-3 text-gray-700">
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 bg-teal-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-teal-600 text-xs">✓</span>
              </div>
              <span><strong>Leave Management:</strong> Process and manage leave requests, approvals, and balances</span>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 bg-teal-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-teal-600 text-xs">✓</span>
              </div>
              <span><strong>Notifications:</strong> Send email and in-app notifications about leave requests and updates</span>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 bg-teal-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-teal-600 text-xs">✓</span>
              </div>
              <span><strong>Analytics:</strong> Generate reports and analytics for workforce planning</span>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 bg-teal-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-teal-600 text-xs">✓</span>
              </div>
              <span><strong>Service Improvement:</strong> Improve our platform features and user experience</span>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 bg-teal-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-teal-600 text-xs">✓</span>
              </div>
              <span><strong>Compliance:</strong> Comply with BCEA requirements and legal obligations</span>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 bg-teal-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-teal-600 text-xs">✓</span>
              </div>
              <span><strong>Security:</strong> Detect and prevent fraud, security threats, and unauthorized access</span>
            </div>
          </div>
        </section>

        {/* Data Security */}
        <section className="mb-12">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-teal-100 rounded-lg flex items-center justify-center">
              <Lock className="w-5 h-5 text-teal-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900">3. Data Security</h2>
          </div>

          <p className="text-gray-700 mb-4">
            We implement appropriate technical and organizational security measures to protect your
            personal information against unauthorized access, alteration, disclosure, or destruction.
          </p>

          <div className="grid md:grid-cols-2 gap-4">
            <Card className="p-4 border-gray-200">
              <h4 className="font-semibold text-gray-900 mb-2">Encryption</h4>
              <p className="text-sm text-gray-600">
                All data in transit is encrypted using TLS 1.3. Data at rest is encrypted using
                AES-256 encryption.
              </p>
            </Card>
            <Card className="p-4 border-gray-200">
              <h4 className="font-semibold text-gray-900 mb-2">Access Controls</h4>
              <p className="text-sm text-gray-600">
                Strict role-based access controls ensure only authorized personnel can access
                sensitive data.
              </p>
            </Card>
            <Card className="p-4 border-gray-200">
              <h4 className="font-semibold text-gray-900 mb-2">Secure Infrastructure</h4>
              <p className="text-sm text-gray-600">
                Our platform is hosted on secure cloud infrastructure with regular security audits
                and monitoring.
              </p>
            </Card>
            <Card className="p-4 border-gray-200">
              <h4 className="font-semibold text-gray-900 mb-2">Regular Backups</h4>
              <p className="text-sm text-gray-600">
                Automated daily backups ensure your data is protected against loss or corruption.
              </p>
            </Card>
          </div>
        </section>

        {/* Data Sharing */}
        <section className="mb-12">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-teal-100 rounded-lg flex items-center justify-center">
              <Eye className="w-5 h-5 text-teal-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900">4. Data Sharing and Disclosure</h2>
          </div>

          <p className="text-gray-700 mb-4">
            We do not sell, trade, or rent your personal information to third parties. We may share
            your information only in the following circumstances:
          </p>

          <div className="space-y-4">
            <div>
              <h4 className="font-semibold text-gray-900 mb-2">4.1 Within Your Organization</h4>
              <p className="text-gray-700">
                Leave information is shared with authorized managers and HR personnel within your
                organization as necessary for leave management.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-gray-900 mb-2">4.2 Service Providers</h4>
              <p className="text-gray-700">
                We work with trusted third-party service providers who assist us in operating our
                platform (hosting, email delivery, analytics). These providers are bound by strict
                confidentiality agreements.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-gray-900 mb-2">4.3 Legal Requirements</h4>
              <p className="text-gray-700">
                We may disclose your information if required by law, court order, or government
                regulation, or to protect our legal rights.
              </p>
            </div>
          </div>
        </section>

        {/* Your Rights (POPIA) */}
        <section className="mb-12">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-teal-100 rounded-lg flex items-center justify-center">
              <Shield className="w-5 h-5 text-teal-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900">5. Your Rights (POPIA Compliance)</h2>
          </div>

          <p className="text-gray-700 mb-4">
            Under South Africa's Protection of Personal Information Act (POPIA), you have the
            following rights regarding your personal data:
          </p>

          <div className="space-y-3">
            <Card className="p-4 border-l-4 border-l-teal-500">
              <h4 className="font-semibold text-gray-900 mb-2">Right to Access</h4>
              <p className="text-sm text-gray-700">
                You have the right to request access to your personal information we hold.
              </p>
            </Card>

            <Card className="p-4 border-l-4 border-l-teal-500">
              <h4 className="font-semibold text-gray-900 mb-2">Right to Correction</h4>
              <p className="text-sm text-gray-700">
                You can request correction of inaccurate or incomplete personal information.
              </p>
            </Card>

            <Card className="p-4 border-l-4 border-l-teal-500">
              <h4 className="font-semibold text-gray-900 mb-2">Right to Deletion</h4>
              <p className="text-sm text-gray-700">
                You can request deletion of your personal information, subject to legal and
                contractual retention requirements.
              </p>
            </Card>

            <Card className="p-4 border-l-4 border-l-teal-500">
              <h4 className="font-semibold text-gray-900 mb-2">Right to Object</h4>
              <p className="text-sm text-gray-700">
                You can object to the processing of your personal information for certain purposes.
              </p>
            </Card>

            <Card className="p-4 border-l-4 border-l-teal-500">
              <h4 className="font-semibold text-gray-900 mb-2">Right to Data Portability</h4>
              <p className="text-sm text-gray-700">
                You can request a copy of your personal information in a structured, machine-readable
                format.
              </p>
            </Card>
          </div>

          <p className="text-gray-700 mt-4">
            To exercise any of these rights, please contact us at{' '}
            <a href="mailto:privacy@leavehub.co.za" className="text-teal-600 hover:text-teal-700 font-medium">
              privacy@leavehub.co.za
            </a>
          </p>
        </section>

        {/* Data Retention */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">6. Data Retention</h2>
          <p className="text-gray-700 mb-4">
            We retain your personal information for as long as necessary to fulfill the purposes
            outlined in this Privacy Policy, unless a longer retention period is required or permitted
            by law.
          </p>
          <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
            <li>Active employee data: Retained for the duration of employment</li>
            <li>Leave records: Retained for 3 years after employment ends (BCEA requirement)</li>
            <li>Financial records: Retained for 5 years (tax law requirement)</li>
            <li>Usage data: Retained for 12 months</li>
          </ul>
        </section>

        {/* Cookies */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">7. Cookies and Tracking</h2>
          <p className="text-gray-700 mb-4">
            We use cookies and similar tracking technologies to improve your experience on our
            platform. For detailed information about our use of cookies, please see our{' '}
            <Link href="/cookies" className="text-teal-600 hover:text-teal-700 font-medium">
              Cookie Policy
            </Link>
            .
          </p>
        </section>

        {/* Changes to Policy */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">8. Changes to This Privacy Policy</h2>
          <p className="text-gray-700">
            We may update this Privacy Policy from time to time. We will notify you of any material
            changes by posting the new Privacy Policy on this page and updating the "Last Updated"
            date. We encourage you to review this Privacy Policy periodically.
          </p>
        </section>

        {/* Contact */}
        <Card className="p-8 bg-teal-50 border-teal-200">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-teal-100 rounded-lg flex items-center justify-center">
              <AlertCircle className="w-5 h-5 text-teal-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900">9. Contact Us</h2>
          </div>

          <p className="text-gray-700 mb-6">
            If you have any questions, concerns, or requests regarding this Privacy Policy or our
            data practices, please contact us:
          </p>

          <div className="space-y-3 text-gray-700">
            <div>
              <strong>Data Protection Officer:</strong> LeaveHub (Pty) Ltd
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

          <div className="mt-6 pt-6 border-t border-teal-200">
            <p className="text-sm text-gray-600">
              If you are not satisfied with our response, you have the right to lodge a complaint
              with the Information Regulator of South Africa:
            </p>
            <div className="mt-3 text-sm text-gray-700">
              <div><strong>Information Regulator (South Africa)</strong></div>
              <div>Email: inforeg@justice.gov.za</div>
              <div>Website: www.justice.gov.za/inforeg</div>
            </div>
          </div>
        </Card>

        {/* Related Links */}
        <div className="mt-12 flex flex-wrap gap-4 justify-center">
          <Link href="/terms">
            <span className="text-teal-600 hover:text-teal-700 font-medium">Terms of Service</span>
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
