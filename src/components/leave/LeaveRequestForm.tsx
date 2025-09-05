import React, { useState } from 'react'

interface LeaveRequestFormProps {
  onClose: () => void
  onSubmit: (data: LeaveRequestData) => void
}

interface LeaveRequestData {
  leaveType: string
  startDate: string
  endDate: string
  reason: string
  isPartialDay: boolean
  partialDayStart?: string
  partialDayEnd?: string
  attachments: File[]
}

const leaveTypes = [
  { value: 'annual', label: 'Annual Leave', icon: '🏖️', description: 'Vacation and personal time off' },
  { value: 'sick', label: 'Sick Leave', icon: '🤒', description: 'Medical leave for illness or injury' },
  { value: 'maternity', label: 'Maternity Leave', icon: '🍼', description: 'Maternity and parental leave' },
  { value: 'paternity', label: 'Paternity Leave', icon: '👶', description: 'Paternity and partner leave' },
  { value: 'compassionate', label: 'Compassionate Leave', icon: '🕊️', description: 'Bereavement and family emergencies' },
  { value: 'study', label: 'Study Leave', icon: '📚', description: 'Educational and training purposes' },
  { value: 'unpaid', label: 'Unpaid Leave', icon: '📅', description: 'Extended personal leave without pay' },
]

export function LeaveRequestForm({ onClose, onSubmit }: LeaveRequestFormProps) {
  const [formData, setFormData] = useState<LeaveRequestData>({
    leaveType: '',
    startDate: '',
    endDate: '',
    reason: '',
    isPartialDay: false,
    attachments: []
  })

  const [dragActive, setDragActive] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true)
    } else if (e.type === 'dragleave') {
      setDragActive(false)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const files = Array.from(e.dataTransfer.files)
      setFormData(prev => ({ ...prev, attachments: [...prev.attachments, ...files] }))
    }
  }

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files)
      setFormData(prev => ({ ...prev, attachments: [...prev.attachments, ...files] }))
    }
  }

  const removeAttachment = (index: number) => {
    setFormData(prev => ({
      ...prev,
      attachments: prev.attachments.filter((_, i) => i !== index)
    }))
  }

  const calculateLeaveDays = () => {
    if (!formData.startDate || !formData.endDate) return 0
    const start = new Date(formData.startDate)
    const end = new Date(formData.endDate)
    const diffTime = Math.abs(end.getTime() - start.getTime())
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1
    return formData.isPartialDay ? 0.5 : diffDays
  }

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.leaveType) {
      newErrors.leaveType = 'Please select a leave type'
    }

    if (!formData.startDate) {
      newErrors.startDate = 'Start date is required'
    }

    if (!formData.endDate) {
      newErrors.endDate = 'End date is required'
    }

    if (formData.startDate && formData.endDate) {
      const start = new Date(formData.startDate)
      const end = new Date(formData.endDate)
      const today = new Date()
      today.setHours(0, 0, 0, 0)

      if (start < today) {
        newErrors.startDate = 'Start date cannot be in the past'
      }

      if (end < start) {
        newErrors.endDate = 'End date cannot be before start date'
      }

      // Check for reasonable leave duration
      const diffDays = calculateLeaveDays()
      if (diffDays > 365) {
        newErrors.endDate = 'Leave duration cannot exceed 365 days'
      }
    }

    if (!formData.reason || formData.reason.trim().length < 10) {
      newErrors.reason = 'Please provide a reason (minimum 10 characters)'
    }

    if (formData.isPartialDay) {
      if (!formData.partialDayStart) {
        newErrors.partialDayStart = 'Start time is required for partial day leave'
      }
      if (!formData.partialDayEnd) {
        newErrors.partialDayEnd = 'End time is required for partial day leave'
      }
      if (formData.partialDayStart && formData.partialDayEnd && formData.partialDayStart >= formData.partialDayEnd) {
        newErrors.partialDayEnd = 'End time must be after start time'
      }
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) {
      return
    }

    setIsSubmitting(true)
    
    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000))
      onSubmit(formData)
    } catch (error) {
      console.error('Error submitting leave request:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-20 mx-auto p-5 border w-11/12 max-w-4xl shadow-lg rounded-md bg-white">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900">New Leave Request</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">Leave Type</label>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {leaveTypes.map((type) => (
                <div
                  key={type.value}
                  className={`relative cursor-pointer rounded-lg border p-4 hover:border-indigo-500 ${
                    formData.leaveType === type.value
                      ? 'border-indigo-500 bg-indigo-50'
                      : errors.leaveType
                      ? 'border-red-300 hover:border-red-400'
                      : 'border-gray-300'
                  }`}
                  onClick={() => setFormData(prev => ({ ...prev, leaveType: type.value }))}
                >
                  <div className="flex items-start space-x-3">
                    <span className="text-2xl">{type.icon}</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900">{type.label}</p>
                      <p className="text-xs text-gray-500 mt-1">{type.description}</p>
                    </div>
                  </div>
                  <input
                    type="radio"
                    name="leaveType"
                    value={type.value}
                    checked={formData.leaveType === type.value}
                    onChange={() => {}}
                    className="absolute top-4 right-4"
                  />
                </div>
              ))}
            </div>
            {errors.leaveType && (
              <p className="mt-2 text-sm text-red-600 flex items-center">
                <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                {errors.leaveType}
              </p>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Start Date <span className="text-red-500">*</span></label>
              <input
                type="date"
                required
                value={formData.startDate}
                onChange={(e) => setFormData(prev => ({ ...prev, startDate: e.target.value }))}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 ${
                  errors.startDate 
                    ? 'border-red-300 focus:ring-red-500 focus:border-red-500' 
                    : 'border-gray-300 focus:ring-indigo-500 focus:border-indigo-500'
                }`}
              />
              {errors.startDate && (
                <p className="mt-1 text-sm text-red-600 flex items-center">
                  <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  {errors.startDate}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">End Date <span className="text-red-500">*</span></label>
              <input
                type="date"
                required
                value={formData.endDate}
                onChange={(e) => setFormData(prev => ({ ...prev, endDate: e.target.value }))}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 ${
                  errors.endDate 
                    ? 'border-red-300 focus:ring-red-500 focus:border-red-500' 
                    : 'border-gray-300 focus:ring-indigo-500 focus:border-indigo-500'
                }`}
              />
              {errors.endDate && (
                <p className="mt-1 text-sm text-red-600 flex items-center">
                  <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  {errors.endDate}
                </p>
              )}
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <input
              type="checkbox"
              id="partialDay"
              checked={formData.isPartialDay}
              onChange={(e) => setFormData(prev => ({ ...prev, isPartialDay: e.target.checked }))}
              className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
            />
            <label htmlFor="partialDay" className="text-sm font-medium text-gray-700">
              This is a partial day leave
            </label>
          </div>

          {formData.isPartialDay && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-4 bg-gray-50 rounded-lg">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Start Time</label>
                <input
                  type="time"
                  value={formData.partialDayStart || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, partialDayStart: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">End Time</label>
                <input
                  type="time"
                  value={formData.partialDayEnd || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, partialDayEnd: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Reason for Leave <span className="text-red-500">*</span>
              <span className="text-sm text-gray-500 font-normal ml-2">
                ({formData.reason.length}/10 minimum characters)
              </span>
            </label>
            <textarea
              required
              rows={4}
              value={formData.reason}
              onChange={(e) => setFormData(prev => ({ ...prev, reason: e.target.value }))}
              placeholder="Please provide a brief explanation for your leave request..."
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 ${
                errors.reason 
                  ? 'border-red-300 focus:ring-red-500 focus:border-red-500' 
                  : 'border-gray-300 focus:ring-indigo-500 focus:border-indigo-500'
              }`}
            />
            {errors.reason && (
              <p className="mt-1 text-sm text-red-600 flex items-center">
                <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                {errors.reason}
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Attachments (Optional)</label>
            <div
              className={`relative border-2 border-dashed rounded-lg p-6 transition-colors ${
                dragActive
                  ? 'border-indigo-500 bg-indigo-50'
                  : 'border-gray-300 hover:border-gray-400'
              }`}
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
            >
              <div className="text-center">
                <svg className="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48">
                  <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                <div className="mt-4">
                  <label htmlFor="file-upload" className="cursor-pointer">
                    <span className="text-indigo-600 hover:text-indigo-500 font-medium">Upload files</span>
                    <span className="text-gray-500"> or drag and drop</span>
                    <input id="file-upload" name="file-upload" type="file" className="sr-only" multiple onChange={handleFileInput} />
                  </label>
                </div>
                <p className="text-xs text-gray-500 mt-2">PNG, JPG, PDF up to 10MB</p>
              </div>
            </div>

            {formData.attachments.length > 0 && (
              <div className="mt-4 space-y-2">
                {formData.attachments.map((file, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                      </svg>
                      <span className="text-sm text-gray-700">{file.name}</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeAttachment(index)}
                      className="text-red-500 hover:text-red-700"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-center space-x-2">
              <svg className="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="text-sm font-medium text-blue-800">
                Total Leave Days: {calculateLeaveDays()} {calculateLeaveDays() === 1 ? 'day' : 'days'}
              </span>
            </div>
            <p className="text-xs text-blue-700 mt-1">
              Your current leave balance: 18.5 days available
            </p>
          </div>

          <div className="flex justify-end space-x-4 pt-6">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              Cancel
            </button>
            <button
              type="button"
              className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              Save as Draft
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className={`px-6 py-2 rounded-md focus:outline-none focus:ring-2 flex items-center space-x-2 ${
                isSubmitting
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-indigo-600 hover:bg-indigo-700 focus:ring-indigo-500'
              } text-white`}
            >
              {isSubmitting && (
                <svg className="w-4 h-4 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
              )}
              <span>{isSubmitting ? 'Submitting...' : 'Submit Request'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}