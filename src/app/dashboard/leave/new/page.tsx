'use client';

import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calendar, ArrowLeft, AlertCircle, FileText, CheckCircle, XCircle } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { FileUpload } from '@/components/ui/file-upload';
import {
  calculateWorkingDays,
  getHolidaysInRange,
  type PublicHoliday
} from '@/lib/utils/south-african-holidays';
import {
  validateLeaveRequest,
  type LeaveCode,
  type LeaveRequestData,
  type DocumentRequirement,
  type LeaveTypeValidation
} from '@/lib/utils/leave-types-logic';

export default function NewLeaveRequestPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    leaveType: '',
    startDate: '',
    endDate: '',
    reason: '',
  });
  const [workingDays, setWorkingDays] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [validation, setValidation] = useState<LeaveTypeValidation | null>(null);
  const [documentRequirements, setDocumentRequirements] = useState<DocumentRequirement[]>([]);
  const [holidaysInRange, setHolidaysInRange] = useState<PublicHoliday[]>([]);

  // All leave types with their BCEA entitlements
  const leaveTypes = [
    { id: '1', name: 'Annual Leave', code: 'ANN' as LeaveCode, color: '#0D9488', available: 15, description: '21 days per year' },
    { id: '2', name: 'Sick Leave', code: 'SICK' as LeaveCode, color: '#EF4444', available: 8, description: '30 days per 3-year cycle' },
    { id: '3', name: 'Family Responsibility Leave', code: 'FAM' as LeaveCode, color: '#F59E0B', available: 2, description: '3 days per year' },
    { id: '4', name: 'Maternity Leave', code: 'MAT' as LeaveCode, color: '#EC4899', available: 0, description: '4 months (120 days)' },
    { id: '5', name: 'Paternity Leave', code: 'PAT' as LeaveCode, color: '#8B5CF6', available: 0, description: '10 consecutive days' },
    { id: '6', name: 'Adoption Leave', code: 'ADOP' as LeaveCode, color: '#06B6D4', available: 0, description: '10 consecutive weeks' },
    { id: '7', name: 'Commissioning Parental Leave (Surrogacy)', code: 'SURR' as LeaveCode, color: '#14B8A6', available: 0, description: '10 consecutive weeks' },
    { id: '8', name: 'Study Leave', code: 'STUDY' as LeaveCode, color: '#6366F1', available: 0, description: 'As per company policy' },
    { id: '9', name: 'Unpaid Leave', code: 'UNPAID' as LeaveCode, color: '#64748B', available: 0, description: 'By agreement' },
  ];

  const handleDateChange = (field: 'startDate' | 'endDate', value: string) => {
    const newFormData = { ...formData, [field]: value };
    setFormData(newFormData);

    if (newFormData.startDate && newFormData.endDate) {
      const startDate = new Date(newFormData.startDate);
      const endDate = new Date(newFormData.endDate);

      // Calculate working days excluding weekends and SA public holidays
      const days = calculateWorkingDays(startDate, endDate);
      setWorkingDays(days);

      // Get holidays in the selected range
      const holidays = getHolidaysInRange(startDate, endDate);
      setHolidaysInRange(holidays);
    }
  };

  // Validate leave request whenever form data changes
  useEffect(() => {
    if (formData.leaveType && formData.startDate && formData.endDate && workingDays > 0) {
      const selectedLeaveType = leaveTypes.find(lt => lt.id === formData.leaveType);

      if (selectedLeaveType) {
        const requestData: LeaveRequestData = {
          leaveTypeCode: selectedLeaveType.code,
          startDate: new Date(formData.startDate),
          endDate: new Date(formData.endDate),
          workingDays: workingDays,
          reason: formData.reason,
          userId: 'demo-user-123',
          employeeHireDate: new Date('2024-01-01'), // Demo hire date
        };

        const validationResult = validateLeaveRequest(requestData);
        setValidation(validationResult);
        setDocumentRequirements(validationResult.documentRequirements);
      }
    } else {
      setValidation(null);
      setDocumentRequirements([]);
    }
  }, [formData, workingDays]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Create FormData for file upload
      const submitFormData = new FormData();

      const selectedLeaveType = leaveTypes.find(lt => lt.id === formData.leaveType);

      // Add text fields
      submitFormData.append('userId', 'demo-user-123'); // TODO: Get from auth
      submitFormData.append('leaveTypeId', selectedLeaveType?.id || '');
      submitFormData.append('startDate', formData.startDate);
      submitFormData.append('endDate', formData.endDate);
      submitFormData.append('reason', formData.reason);
      submitFormData.append('workingDays', workingDays.toString());

      // Add files
      uploadedFiles.forEach((file) => {
        submitFormData.append('documents', file);
      });

      // Submit to API
      const response = await fetch('/api/leave-requests', {
        method: 'POST',
        body: submitFormData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to submit leave request');
      }

      // Redirect to success page with request ID
      router.push(`/dashboard/leave/success?id=${data.leaveRequest.id}`);

    } catch (error) {
      console.error('Error submitting leave request:', error);
      alert(error instanceof Error ? error.message : 'Failed to submit leave request. Please try again.');
      setIsSubmitting(false);
    }
  };

  const selectedLeaveType = leaveTypes.find(lt => lt.id === formData.leaveType);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top Navigation */}
      <nav className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex items-center gap-3">
              <Link href="/dashboard">
                <Button variant="ghost" size="sm">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back
                </Button>
              </Link>
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <Calendar className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold text-gray-900">New Leave Request</span>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Card className="p-8">
          <h1 className="text-2xl font-bold mb-6">Submit Leave Request</h1>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Leave Type Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Leave Type <span className="text-red-500">*</span>
              </label>
              <select
                required
                value={formData.leaveType}
                onChange={(e) => setFormData({ ...formData, leaveType: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              >
                <option value="">Select leave type...</option>
                {leaveTypes.map((type) => (
                  <option key={type.id} value={type.id}>
                    {type.name} - {type.description}
                    {type.available > 0 ? ` (${type.available} days available)` : ''}
                  </option>
                ))}
              </select>
            </div>

            {/* Date Range */}
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Start Date <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  required
                  value={formData.startDate}
                  onChange={(e) => handleDateChange('startDate', e.target.value)}
                  min={new Date().toISOString().split('T')[0]}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  End Date <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  required
                  value={formData.endDate}
                  onChange={(e) => handleDateChange('endDate', e.target.value)}
                  min={formData.startDate || new Date().toISOString().split('T')[0]}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                />
              </div>
            </div>

            {/* Working Days Display */}
            {workingDays > 0 && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5" />
                  <div className="w-full">
                    <p className="font-semibold text-blue-900">
                      {workingDays} working day{workingDays !== 1 ? 's' : ''}
                    </p>
                    <p className="text-sm text-blue-700">
                      Excludes weekends and South African public holidays.
                    </p>

                    {/* Show holidays in range */}
                    {holidaysInRange.length > 0 && (
                      <div className="mt-2">
                        <p className="text-xs font-medium text-blue-800 mb-1">
                          Public holidays in your leave period:
                        </p>
                        <ul className="text-xs text-blue-700 space-y-0.5">
                          {holidaysInRange.map((holiday, idx) => (
                            <li key={idx}>
                              • {holiday.name} - {new Date(holiday.observedDate || holiday.date).toLocaleDateString('en-ZA', { day: 'numeric', month: 'short' })}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {selectedLeaveType && workingDays > selectedLeaveType.available && (
                      <p className="text-sm text-red-600 mt-2 font-medium">
                        ⚠️ Warning: You only have {selectedLeaveType.available} days available
                      </p>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Validation Errors */}
            {validation && validation.errors.length > 0 && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <XCircle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
                  <div className="w-full">
                    <p className="font-semibold text-red-900 mb-2">
                      Cannot submit - Please fix these errors:
                    </p>
                    <ul className="text-sm text-red-700 space-y-1">
                      {validation.errors.map((error, idx) => (
                        <li key={idx}>• {error}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            )}

            {/* Validation Warnings */}
            {validation && validation.warnings.length > 0 && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-yellow-600 mt-0.5 flex-shrink-0" />
                  <div className="w-full">
                    <p className="font-semibold text-yellow-900 mb-2">
                      Important notices:
                    </p>
                    <ul className="text-sm text-yellow-700 space-y-1">
                      {validation.warnings.map((warning, idx) => (
                        <li key={idx}>• {warning}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            )}

            {/* BCEA Violations */}
            {validation && validation.bceaviolations.length > 0 && (
              <div className="bg-red-50 border border-red-300 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <XCircle className="w-5 h-5 text-red-700 mt-0.5 flex-shrink-0" />
                  <div className="w-full">
                    <p className="font-semibold text-red-900 mb-2">
                      BCEA Compliance Issues:
                    </p>
                    <ul className="text-sm text-red-800 space-y-1">
                      {validation.bceaviolations.map((violation, idx) => (
                        <li key={idx}>• {violation}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            )}

            {/* Document Requirements */}
            {documentRequirements.length > 0 && (
              <div className={`border rounded-lg p-4 ${
                documentRequirements.some(req => req.required)
                  ? 'bg-orange-50 border-orange-200'
                  : 'bg-gray-50 border-gray-200'
              }`}>
                <div className="flex items-start gap-3">
                  <FileText className={`w-5 h-5 mt-0.5 flex-shrink-0 ${
                    documentRequirements.some(req => req.required)
                      ? 'text-orange-600'
                      : 'text-gray-600'
                  }`} />
                  <div className="w-full">
                    <p className={`font-semibold mb-2 ${
                      documentRequirements.some(req => req.required)
                        ? 'text-orange-900'
                        : 'text-gray-900'
                    }`}>
                      {documentRequirements.some(req => req.required)
                        ? 'Supporting Documents Required'
                        : 'Document Information'}
                    </p>
                    <ul className={`text-sm space-y-2 ${
                      documentRequirements.some(req => req.required)
                        ? 'text-orange-700'
                        : 'text-gray-700'
                    }`}>
                      {documentRequirements.map((req, idx) => (
                        <li key={idx} className="flex items-start gap-2">
                          {req.required ? (
                            <span className="font-bold text-orange-600">•</span>
                          ) : (
                            <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                          )}
                          <div>
                            <p className="font-medium">{req.description}</p>
                            {req.deadline && (
                              <p className="text-xs mt-0.5">Deadline: {req.deadline}</p>
                            )}
                            {req.bceasection && (
                              <p className="text-xs mt-0.5 italic">{req.bceasection}</p>
                            )}
                          </div>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            )}

            {/* File Upload (only show if documents are required) */}
            {documentRequirements.some(req => req.required) && (
              <FileUpload
                label="Upload Supporting Documents"
                description="Drag and drop files here or click to browse"
                accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                maxSize={10}
                maxFiles={5}
                required={documentRequirements.some(req => req.required)}
                onFilesChange={setUploadedFiles}
              />
            )}

            {/* Reason */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Reason <span className="text-red-500">*</span>
              </label>
              <textarea
                required
                value={formData.reason}
                onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                rows={4}
                placeholder="Please provide a reason for your leave request..."
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent resize-none"
              />
              <p className="text-sm text-gray-500 mt-1">
                {formData.reason.length}/500 characters
              </p>
            </div>

            {/* Submit Buttons */}
            <div className="flex gap-3 pt-4">
              <Button
                type="submit"
                disabled={
                  isSubmitting ||
                  !formData.leaveType ||
                  !formData.startDate ||
                  !formData.endDate ||
                  !formData.reason ||
                  (validation && validation.errors.length > 0) ||
                  (documentRequirements.some(req => req.required) && uploadedFiles.length === 0)
                }
                className="bg-primary hover:bg-primary/90 flex-1"
              >
                {isSubmitting ? 'Submitting...' : 'Submit Request'}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => router.push('/dashboard')}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
            </div>
          </form>
        </Card>

        {/* Help Card */}
        <Card className="p-6 mt-6 bg-gray-50">
          <h3 className="font-semibold mb-3">📋 BCEA Compliance & Leave Types</h3>
          <div className="text-sm text-gray-600 space-y-3">
            <div>
              <p className="font-medium text-gray-900 mb-1">Statutory Leave (BCEA)</p>
              <ul className="space-y-1 ml-2">
                <li>• <strong>Annual Leave:</strong> 21 days per year (Section 20)</li>
                <li>• <strong>Sick Leave:</strong> 30 days per 3-year cycle (Section 22)</li>
                <li>• <strong>Family Responsibility:</strong> 3 days per year for birth, illness, or death of immediate family (Section 27)</li>
                <li>• <strong>Maternity Leave:</strong> 4 consecutive months unpaid (Section 25)</li>
                <li>• <strong>Paternity Leave:</strong> 10 consecutive days (Section 25A)</li>
                <li>• <strong>Adoption Leave:</strong> 10 consecutive weeks for children under 2 years (Section 25C)</li>
              </ul>
            </div>
            <div>
              <p className="font-medium text-gray-900 mb-1">Additional Leave Types</p>
              <ul className="space-y-1 ml-2">
                <li>• <strong>Commissioning Parental Leave:</strong> 10 weeks for registered surrogacy agreements</li>
                <li>• <strong>Study Leave:</strong> As per company policy for exam purposes</li>
                <li>• <strong>Unpaid Leave:</strong> By mutual agreement with employer</li>
              </ul>
            </div>
            <div>
              <p className="font-medium text-gray-900 mb-1">Documentation Requirements</p>
              <ul className="space-y-1 ml-2">
                <li>• Medical certificates must show HPCSA registration number</li>
                <li>• Sick leave: Certificate required if absent 2+ consecutive days OR 3+ occasions in 8 weeks</li>
                <li>• All supporting documents must be submitted within specified deadlines</li>
              </ul>
            </div>
          </div>
        </Card>
      </main>
    </div>
  );
}
