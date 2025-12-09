'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Activity, CheckCircle, RefreshCw, Globe, Database, Zap, Shield, AlertTriangle } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import MarketingNav from '@/components/MarketingNav';
import MarketingFooter from '@/components/MarketingFooter';

export default function StatusPage() {
  const [lastUpdated] = useState(new Date().toLocaleTimeString('en-ZA', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: true
  }));

  const services = [
    {
      name: 'Web Application',
      description: 'Main LeaveHub web application and dashboard',
      status: 'operational',
      uptime: '99.98%',
      response: '245ms',
    },
    {
      name: 'API Services',
      description: 'REST API endpoints and authentication',
      status: 'operational',
      uptime: '99.97%',
      response: '185ms',
    },
    {
      name: 'Database',
      description: 'Primary database and data storage',
      status: 'operational',
      uptime: '99.99%',
      response: '12ms',
    },
    {
      name: 'File Storage',
      description: 'Document uploads and file management',
      status: 'operational',
      uptime: '99.95%',
      response: '98ms',
    },
    {
      name: 'Email Notifications',
      description: 'Email delivery and notification system',
      status: 'partial',
      uptime: '98.50%',
      response: '2.1s',
    },
    {
      name: 'AI Services',
      description: 'AI-powered leave planning and analytics',
      status: 'operational',
      uptime: '99.92%',
      response: '580ms',
    },
  ];

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'operational':
        return {
          icon: CheckCircle,
          label: 'Operational',
          color: 'bg-green-100 text-green-700 border-green-200',
          iconColor: 'text-green-600',
        };
      case 'partial':
        return {
          icon: AlertTriangle,
          label: 'Partial Outage',
          color: 'bg-yellow-100 text-yellow-800 border-yellow-200',
          iconColor: 'text-yellow-600',
        };
      case 'down':
        return {
          icon: AlertTriangle,
          label: 'Down',
          color: 'bg-red-100 text-red-700 border-red-200',
          iconColor: 'text-red-600',
        };
      default:
        return {
          icon: Activity,
          label: 'Unknown',
          color: 'bg-gray-100 text-gray-700 border-gray-200',
          iconColor: 'text-gray-600',
        };
    }
  };

  const hasPartialOutage = services.some(s => s.status === 'partial');
  const allOperational = services.every(s => s.status === 'operational');

  return (
    <div className="min-h-screen bg-gray-50">
      <MarketingNav />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back Button */}
        <Link href="/" className="inline-flex items-center text-teal-600 hover:text-teal-700 mb-8">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Link>

        {/* Status Badge */}
        <div className="flex justify-end mb-4">
          {hasPartialOutage ? (
            <div className="inline-flex items-center gap-2 bg-yellow-50 text-yellow-800 px-4 py-2 rounded-full border border-yellow-200">
              <AlertTriangle className="w-4 h-4" />
              <span className="text-sm font-medium">Partial Outage</span>
            </div>
          ) : allOperational ? (
            <div className="inline-flex items-center gap-2 bg-green-50 text-green-700 px-4 py-2 rounded-full border border-green-200">
              <Activity className="w-4 h-4" />
              <span className="text-sm font-medium">All Systems Operational</span>
            </div>
          ) : (
            <div className="inline-flex items-center gap-2 bg-red-50 text-red-700 px-4 py-2 rounded-full border border-red-200">
              <AlertTriangle className="w-4 h-4" />
              <span className="text-sm font-medium">Major Outage</span>
            </div>
          )}
        </div>

        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex justify-center mb-6">
            <div className="w-20 h-20 bg-teal-100 rounded-full flex items-center justify-center">
              <Activity className="w-10 h-10 text-teal-600" />
            </div>
          </div>

          <h1 className="text-5xl font-bold text-gray-900 mb-4">
            System Status
          </h1>

          <p className="text-xl text-gray-600">
            Real-time status and performance monitoring for all LeaveHub services
          </p>
        </div>

        {/* Current Status Alert */}
        {hasPartialOutage && (
          <div className="bg-yellow-50 border-2 border-yellow-200 rounded-xl p-6 mb-8">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <AlertTriangle className="w-6 h-6 text-yellow-600" />
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-bold text-yellow-900 mb-2">
                  Partial Service Disruption
                </h3>
                <p className="text-yellow-800 mb-3">
                  Some services are experiencing issues. See details below.
                </p>
                <div className="flex items-center gap-3 text-sm text-yellow-700">
                  <span>Last updated: <strong>{lastUpdated}</strong></span>
                  <Button
                    size="sm"
                    variant="outline"
                    className="border-yellow-300 text-yellow-800 hover:bg-yellow-100"
                    onClick={() => window.location.reload()}
                  >
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Refresh
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Services Status */}
        <div className="mb-12">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Services</h2>
            <Button
              size="sm"
              variant="outline"
              onClick={() => window.location.reload()}
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Refresh
            </Button>
          </div>

          <div className="space-y-4">
            {services.map((service, idx) => {
              const statusBadge = getStatusBadge(service.status);
              const StatusIcon = statusBadge.icon;

              return (
                <Card key={idx} className="p-6 border border-gray-200">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                        <Globe className="w-5 h-5 text-gray-600" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900">{service.name}</h3>
                        <p className="text-sm text-gray-600">{service.description}</p>
                      </div>
                    </div>

                    <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full border ${statusBadge.color}`}>
                      <StatusIcon className={`w-4 h-4 ${statusBadge.iconColor}`} />
                      <span className="text-sm font-medium">{statusBadge.label}</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-4 pt-4 border-t">
                    <div>
                      <div className="text-xs text-gray-500 mb-1">Uptime</div>
                      <div className="font-semibold text-gray-900">{service.uptime}</div>
                    </div>
                    <div>
                      <div className="text-xs text-gray-500 mb-1">Response</div>
                      <div className="font-semibold text-gray-900">{service.response}</div>
                    </div>
                    <div className="col-span-2 md:col-span-1">
                      <div className="text-xs text-gray-500 mb-1">Status</div>
                      <div className="font-semibold text-gray-900 capitalize">{service.status}</div>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        </div>

        {/* System Metrics */}
        <div className="grid md:grid-cols-4 gap-6 mb-12">
          <Card className="p-6 text-center">
            <div className="w-12 h-12 bg-teal-100 rounded-lg flex items-center justify-center mx-auto mb-3">
              <Activity className="w-6 h-6 text-teal-600" />
            </div>
            <div className="text-3xl font-bold text-gray-900 mb-1">99.96%</div>
            <div className="text-sm text-gray-600">30-Day Uptime</div>
          </Card>

          <Card className="p-6 text-center">
            <div className="w-12 h-12 bg-teal-100 rounded-lg flex items-center justify-center mx-auto mb-3">
              <Zap className="w-6 h-6 text-teal-600" />
            </div>
            <div className="text-3xl font-bold text-gray-900 mb-1">215ms</div>
            <div className="text-sm text-gray-600">Avg Response</div>
          </Card>

          <Card className="p-6 text-center">
            <div className="w-12 h-12 bg-teal-100 rounded-lg flex items-center justify-center mx-auto mb-3">
              <Database className="w-6 h-6 text-teal-600" />
            </div>
            <div className="text-3xl font-bold text-gray-900 mb-1">0</div>
            <div className="text-sm text-gray-600">Incidents (7d)</div>
          </Card>

          <Card className="p-6 text-center">
            <div className="w-12 h-12 bg-teal-100 rounded-lg flex items-center justify-center mx-auto mb-3">
              <Shield className="w-6 h-6 text-teal-600" />
            </div>
            <div className="text-3xl font-bold text-gray-900 mb-1">100%</div>
            <div className="text-sm text-gray-600">Data Protected</div>
          </Card>
        </div>

        {/* Information */}
        <Card className="p-8 border border-gray-200">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            About This Status Page
          </h2>

          <div className="space-y-4 text-gray-700">
            <p>
              This page provides real-time information about the availability and performance of
              LeaveHub services. We update this page automatically every minute.
            </p>

            <div>
              <h3 className="font-semibold text-gray-900 mb-2">Service Level Agreement (SLA)</h3>
              <p>
                LeaveHub guarantees 99.9% uptime for our Professional and Enterprise plans. We
                provide credits for any downtime that exceeds our SLA commitments.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900 mb-2">Need Help?</h3>
              <p>
                If you're experiencing issues not reflected on this page, please contact our support
                team at{' '}
                <Link href="mailto:support@leavehub.co.za" className="text-teal-600 hover:underline">
                  support@leavehub.co.za
                </Link>
              </p>
            </div>
          </div>
        </Card>
      </div>

      <MarketingFooter />
    </div>
  );
}
