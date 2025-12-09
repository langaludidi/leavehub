import Link from 'next/link';
import { BookOpen, Calendar, Heart, Baby, GraduationCap, AlertTriangle } from 'lucide-react';
import { Card } from '@/components/ui/card';
import MarketingNav from '@/components/MarketingNav';
import MarketingFooter from '@/components/MarketingFooter';

export default function BCEAGuidePage() {
  const stats = [
    {
      number: '21',
      label: 'Annual Leave Days',
      detail: 'Minimum consecutive days per year',
    },
    {
      number: '30/36',
      label: 'Sick Leave Cycle',
      detail: 'Days per 36-month cycle',
    },
    {
      number: '3',
      label: 'Family Leave',
      detail: 'Days per annual cycle',
    },
    {
      number: '12',
      label: 'Public Holidays',
      detail: 'Official South African holidays',
    },
    {
      number: '3 years',
      label: 'Record Retention',
      detail: 'Minimum document storage',
    },
    {
      number: 'R500k',
      label: 'Maximum Fine',
      detail: 'For serious BCEA violations',
    },
  ];

  const leaveTypes = [
    {
      icon: Calendar,
      title: 'Annual Leave',
      description: 'Employees are entitled to 21 consecutive days of annual leave per annual cycle, or 1 day for every 17 days worked.',
      requirements: [
        'At least 21 consecutive days per year',
        'Leave may only be taken by agreement',
        'Leave must be granted within 6 months of becoming entitled',
        'Payment must be made before leave is taken',
      ],
    },
    {
      icon: Heart,
      title: 'Sick Leave',
      description: 'Employees are entitled to paid sick leave equal to the number of days they would normally work in 6 weeks during a 36-month cycle.',
      requirements: [
        '30 days paid sick leave per 3-year cycle (for 5-day week)',
        'Medical certificate required after 2 consecutive days',
        'Sick leave accrues from first day of employment',
        'Unused sick leave does not carry over',
      ],
    },
    {
      icon: Baby,
      title: 'Maternity Leave',
      description: 'Female employees are entitled to at least 4 consecutive months of maternity leave.',
      requirements: [
        'Minimum 4 consecutive months',
        'May commence 4 weeks before expected birth',
        'At least 6 weeks must be after birth',
        'UIF benefits available for qualifying employees',
      ],
    },
    {
      icon: Heart,
      title: 'Family Responsibility Leave',
      description: 'Employees working more than 4 days a week are entitled to 3 days family responsibility leave per annual cycle.',
      requirements: [
        '3 days per year (after 4 months service)',
        'Only for specific family events',
        'Includes birth, illness, or death of family member',
        'Cannot be accumulated year-to-year',
      ],
    },
    {
      icon: GraduationCap,
      title: 'Study Leave',
      description: 'Not a statutory requirement under BCEA, but many employers offer study leave as part of skills development.',
      requirements: [
        'Not mandated by BCEA',
        'Typically governed by company policy',
        'May be linked to Skills Development Act',
        'Often requires pre-approval and results',
      ],
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <MarketingNav />

      {/* Hero Section */}
      <section className="bg-teal-700 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-4xl mx-auto">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full mb-8">
              <span className="text-sm font-medium">
                🇿🇦 Official BCEA Compliance Guide 2024
              </span>
            </div>

            <h1 className="text-5xl md:text-6xl font-bold mb-6 leading-tight">
              Complete <span className="text-teal-100">BCEA Compliance</span> Guide
            </h1>

            <p className="text-xl text-white/90 leading-relaxed max-w-3xl mx-auto">
              Master South African labour law with our comprehensive guide to the Basic
              Conditions of Employment Act. Stay compliant, avoid penalties, and protect
              your business with expert guidance updated for 2024 requirements.
            </p>
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6 mb-16">
          {stats.map((stat, idx) => (
            <Card key={idx} className="p-6 text-center bg-teal-50 border-teal-200">
              <div className="text-3xl font-bold text-teal-600 mb-2">{stat.number}</div>
              <div className="font-semibold text-gray-900 mb-1">{stat.label}</div>
              <div className="text-xs text-gray-600">{stat.detail}</div>
            </Card>
          ))}
        </div>

        {/* Introduction */}
        <div className="bg-white rounded-2xl p-12 mb-16 border border-gray-200">
          <div className="flex items-start gap-4 mb-6">
            <div className="w-12 h-12 bg-teal-100 rounded-lg flex items-center justify-center flex-shrink-0">
              <BookOpen className="w-6 h-6 text-teal-600" />
            </div>
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                What is the BCEA?
              </h2>
              <p className="text-lg text-gray-700 leading-relaxed mb-4">
                The Basic Conditions of Employment Act (BCEA), Act 75 of 1997, is South Africa's primary
                labour law regulating working conditions. It sets minimum standards for employment,
                including leave entitlements, working hours, and termination procedures.
              </p>
              <p className="text-lg text-gray-700 leading-relaxed">
                All employers in South Africa must comply with the BCEA, and failure to do so can result
                in significant fines, penalties, and legal action. LeaveHub is built to ensure your
                business stays BCEA-compliant automatically.
              </p>
            </div>
          </div>
        </div>

        {/* Leave Types */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-gray-900 text-center mb-12">
            BCEA Leave Entitlements
          </h2>

          <div className="space-y-6">
            {leaveTypes.map((type, idx) => {
              const Icon = type.icon;
              return (
                <Card key={idx} className="p-8 border border-gray-200 hover:shadow-lg transition-shadow">
                  <div className="flex items-start gap-6">
                    <div className="w-14 h-14 bg-teal-100 rounded-xl flex items-center justify-center flex-shrink-0">
                      <Icon className="w-7 h-7 text-teal-600" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-2xl font-bold text-gray-900 mb-3">{type.title}</h3>
                      <p className="text-gray-700 mb-4 leading-relaxed">{type.description}</p>
                      <div className="grid md:grid-cols-2 gap-3">
                        {type.requirements.map((req, ridx) => (
                          <div key={ridx} className="flex items-start gap-2">
                            <div className="w-5 h-5 bg-teal-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                              <span className="text-teal-600 text-xs">✓</span>
                            </div>
                            <span className="text-sm text-gray-700">{req}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        </div>

        {/* Compliance Warning */}
        <div className="bg-amber-50 border-2 border-amber-200 rounded-2xl p-8 mb-16">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 bg-amber-100 rounded-lg flex items-center justify-center flex-shrink-0">
              <AlertTriangle className="w-6 h-6 text-amber-600" />
            </div>
            <div>
              <h3 className="text-2xl font-bold text-gray-900 mb-3">
                Penalties for Non-Compliance
              </h3>
              <p className="text-gray-700 mb-4 leading-relaxed">
                Failure to comply with BCEA requirements can result in serious consequences:
              </p>
              <ul className="space-y-2">
                <li className="flex items-start gap-2">
                  <span className="text-amber-600 font-bold">•</span>
                  <span className="text-gray-700">
                    Fines of up to R500,000 for serious violations
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-amber-600 font-bold">•</span>
                  <span className="text-gray-700">
                    Legal action and CCMA disputes from employees
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-amber-600 font-bold">•</span>
                  <span className="text-gray-700">
                    Reputational damage and loss of business licenses
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-amber-600 font-bold">•</span>
                  <span className="text-gray-700">
                    Back-payment of leave and compensation to employees
                  </span>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="bg-gradient-to-r from-teal-600 to-teal-700 rounded-2xl p-12 text-center text-white">
          <h2 className="text-3xl font-bold mb-4">
            Stay BCEA Compliant with LeaveHub
          </h2>
          <p className="text-xl text-teal-50 mb-8 max-w-2xl mx-auto">
            Automate compliance, reduce risk, and focus on growing your business
          </p>
          <Link href="/sign-up">
            <button className="px-8 py-3 bg-white text-teal-600 rounded-lg font-semibold hover:bg-gray-50 transition-colors">
              Start Free Trial
            </button>
          </Link>
        </div>
      </div>

      <MarketingFooter />
    </div>
  );
}
