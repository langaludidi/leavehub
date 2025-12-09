'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Menu, X, ChevronDown } from 'lucide-react';

export default function MarketingNav() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);

  const navigation = {
    product: {
      title: 'Product',
      items: [
        { name: 'Features', href: '/features', description: 'Explore all features' },
        { name: 'Pricing', href: '/pricing', description: 'Find the right plan' },
        { name: 'Solutions', href: '/solutions', description: 'Industry solutions' },
      ]
    },
    solutions: {
      title: 'Solutions',
      items: [
        { name: 'Leave Planning', href: '/solutions/leave-planning', description: 'Smart leave scheduling' },
        { name: 'Analytics', href: '/solutions/analytics', description: 'Data-driven insights' },
        { name: 'Workflow Automation', href: '/solutions/workflow-automation', description: 'Automate processes' },
      ]
    },
    resources: {
      title: 'Resources',
      items: [
        { name: 'BCEA Guide', href: '/bcea-guide', description: 'South African labor law' },
        { name: 'Help Center', href: '/help', description: 'Get support' },
        { name: 'Status Page', href: '/status', description: 'System status' },
      ]
    },
    company: {
      title: 'Company',
      items: [
        { name: 'About Us', href: '/about', description: 'Our story' },
        { name: 'Contact', href: '/contact', description: 'Get in touch' },
      ]
    }
  };

  return (
    <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center">
            <Link href="/" className="flex items-center gap-2">
              <Image
                src="/logo-main.svg"
                alt="LeaveHub"
                width={180}
                height={40}
                className="h-10 w-auto"
                priority
              />
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center gap-1">
            {Object.entries(navigation).map(([key, section]) => (
              <div
                key={key}
                className="relative group"
              >
                <button
                  className="flex items-center gap-1 px-3 py-2 text-sm font-medium text-gray-700 hover:text-teal-600 transition-colors"
                  onMouseEnter={() => setOpenDropdown(key)}
                >
                  {section.title}
                  <ChevronDown className="w-4 h-4" />
                </button>

                {/* Dropdown Menu */}
                {openDropdown === key && (
                  <div
                    className="absolute left-0 top-full pt-2 z-50"
                    onMouseLeave={() => setOpenDropdown(null)}
                  >
                    <div className="w-64 bg-white rounded-lg shadow-lg border border-gray-200 py-2">
                      {section.items.map((item) => (
                        <Link
                          key={item.name}
                          href={item.href}
                          className="block px-4 py-3 hover:bg-gray-50 transition-colors"
                          onClick={() => setOpenDropdown(null)}
                        >
                          <div className="font-medium text-gray-900">{item.name}</div>
                          <div className="text-sm text-gray-500">{item.description}</div>
                        </Link>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* CTA Buttons */}
          <div className="hidden lg:flex items-center gap-3">
            <Link href="/sign-in">
              <Button variant="ghost" size="sm">
                Sign In
              </Button>
            </Link>
            <Link href="/sign-up">
              <Button size="sm" className="bg-teal-700 hover:bg-teal-800">
                Get Started
              </Button>
            </Link>
          </div>

          {/* Mobile menu button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-2 rounded-lg hover:bg-gray-100"
          >
            {mobileMenuOpen ? (
              <X className="w-6 h-6 text-gray-700" />
            ) : (
              <Menu className="w-6 h-6 text-gray-700" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-gray-200 bg-white">
          <div className="px-4 py-4 space-y-4">
            {Object.entries(navigation).map(([key, section]) => (
              <div key={key} className="space-y-2">
                <div className="font-semibold text-gray-900 text-sm uppercase tracking-wide">
                  {section.title}
                </div>
                {section.items.map((item) => (
                  <Link
                    key={item.name}
                    href={item.href}
                    className="block pl-4 py-2 text-gray-700 hover:text-teal-600 transition-colors"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    {item.name}
                  </Link>
                ))}
              </div>
            ))}

            <div className="pt-4 space-y-2">
              <Link href="/sign-in" className="block w-full">
                <Button variant="outline" size="sm" className="w-full">
                  Sign In
                </Button>
              </Link>
              <Link href="/sign-up" className="block w-full">
                <Button size="sm" className="w-full bg-teal-700 hover:bg-teal-800">
                  Get Started
                </Button>
              </Link>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}
