import Link from 'next/link';
import { Facebook, Twitter, Linkedin, Instagram } from 'lucide-react';
import NewsletterSignup from './NewsletterSignup';

export default function MarketingFooter() {
  const footerNavigation = {
    product: {
      title: 'Product',
      links: [
        { name: 'Features', href: '/features' },
        { name: 'Pricing', href: '/pricing' },
        { name: 'Solutions', href: '/solutions' },
        { name: 'Security', href: '/security' },
        { name: 'Integrations', href: '/integrations' },
      ]
    },
    solutions: {
      title: 'Solutions',
      links: [
        { name: 'Leave Planning', href: '/solutions/leave-planning' },
        { name: 'Analytics', href: '/solutions/analytics' },
        { name: 'Workflow Automation', href: '/solutions/workflow-automation' },
        { name: 'Small Business', href: '/solutions/small-business' },
        { name: 'Enterprise', href: '/solutions/enterprise' },
      ]
    },
    resources: {
      title: 'Resources',
      links: [
        { name: 'BCEA Guide', href: '/bcea-guide' },
        { name: 'Help Center', href: '/help' },
        { name: 'Status Page', href: '/status' },
        { name: 'Blog', href: '/blog' },
        { name: 'API Documentation', href: '/docs' },
      ]
    },
    company: {
      title: 'Company',
      links: [
        { name: 'About Us', href: '/about' },
        { name: 'Contact', href: '/contact' },
        { name: 'Careers', href: '/careers' },
        { name: 'Partners', href: '/partners' },
        { name: 'Press Kit', href: '/press' },
      ]
    },
    legal: {
      title: 'Legal',
      links: [
        { name: 'Privacy Policy', href: '/privacy' },
        { name: 'Terms of Service', href: '/terms' },
        { name: 'Cookie Policy', href: '/cookies' },
        { name: 'POPIA Compliance', href: '/popia' },
        { name: 'Data Processing', href: '/data-processing' },
      ]
    }
  };

  const socialLinks = [
    { name: 'Facebook', icon: Facebook, href: '#' },
    { name: 'Twitter', icon: Twitter, href: '#' },
    { name: 'LinkedIn', icon: Linkedin, href: '#' },
    { name: 'Instagram', icon: Instagram, href: '#' },
  ];

  return (
    <footer className="bg-gray-900 text-gray-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Main Footer Content */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-8 mb-12">
          {/* Company Info */}
          <div className="col-span-2 md:col-span-3 lg:col-span-2">
            <Link href="/" className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 bg-teal-700 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg">L</span>
              </div>
              <span className="text-xl font-bold text-white">LeaveHub</span>
            </Link>
            <p className="text-gray-400 mb-4 max-w-sm">
              South Africa's smart leave management system. Simplify leave planning,
              ensure BCEA compliance, and empower your workforce with AI-powered insights.
            </p>
            <div className="flex items-center gap-4">
              {socialLinks.map((social) => {
                const Icon = social.icon;
                return (
                  <a
                    key={social.name}
                    href={social.href}
                    className="w-10 h-10 bg-gray-800 rounded-lg flex items-center justify-center hover:bg-teal-800 transition-colors"
                    aria-label={social.name}
                  >
                    <Icon className="w-5 h-5" />
                  </a>
                );
              })}
            </div>
          </div>

          {/* Navigation Columns */}
          {Object.entries(footerNavigation).map(([key, section]) => (
            <div key={key}>
              <h3 className="font-semibold text-white mb-4">{section.title}</h3>
              <ul className="space-y-2">
                {section.links.map((link) => (
                  <li key={link.name}>
                    <Link
                      href={link.href}
                      className="text-gray-400 hover:text-teal-400 transition-colors text-sm"
                    >
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Newsletter Signup */}
        <div className="border-t border-gray-800 pt-8 mb-8">
          <NewsletterSignup />
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-gray-800 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-gray-400 text-sm">
            © {new Date().getFullYear()} LeaveHub. All rights reserved. Made in South Africa.
          </p>
          <div className="flex items-center gap-6 text-sm">
            <Link href="/privacy" className="text-gray-400 hover:text-teal-400 transition-colors">
              Privacy
            </Link>
            <Link href="/terms" className="text-gray-400 hover:text-teal-400 transition-colors">
              Terms
            </Link>
            <Link href="/popia" className="text-gray-400 hover:text-teal-400 transition-colors">
              POPIA
            </Link>
            <Link href="/status" className="text-gray-400 hover:text-teal-400 transition-colors">
              Status
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
