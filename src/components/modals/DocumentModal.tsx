import React, { useState, useRef } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import { LoadingSpinner, ModalLoading } from '../ui/LoadingSpinner'

interface Document {
  id: string
  name: string
  type: string
  size: string
  uploadedAt: string
  uploadedBy: string
  category: 'policy' | 'handbook' | 'form' | 'template' | 'other'
  url?: string
}

interface AdminFile {
  id: string
  fileName: string
  originalName: string
  version: string
  dateOfDocument?: string
  dateUploaded: string
  uploadedBy: string
  fileSize: string
  fileType: string
  description?: string
  distributionType: 'all' | 'department' | 'branch' | 'specific'
  departments: string[]
  branches: string[]
  specificEmployees: string[]
  downloadCount: number
  status: 'active' | 'inactive'
}

interface DocumentModalProps {
  isOpen: boolean
  onClose: () => void
  documents?: Document[]
  adminFiles?: AdminFile[]
}

const sampleDocuments: Document[] = [
  {
    id: '1',
    name: 'Employee Handbook 2025',
    type: 'PDF',
    size: '2.4 MB',
    uploadedAt: '2025-01-15',
    uploadedBy: 'HR Department',
    category: 'handbook'
  },
  {
    id: '2',
    name: 'Leave Policy Guidelines',
    type: 'PDF',
    size: '1.8 MB',
    uploadedAt: '2025-01-10',
    uploadedBy: 'HR Department',
    category: 'policy'
  },
  {
    id: '3',
    name: 'Leave Request Form',
    type: 'DOCX',
    size: '245 KB',
    uploadedAt: '2025-01-05',
    uploadedBy: 'Admin User',
    category: 'form'
  },
  {
    id: '4',
    name: 'Remote Work Agreement Template',
    type: 'PDF',
    size: '892 KB',
    uploadedAt: '2024-12-20',
    uploadedBy: 'Legal Team',
    category: 'template'
  }
]

export function DocumentModal({ isOpen, onClose, documents = sampleDocuments, adminFiles = [] }: DocumentModalProps) {
  const { user, member } = useAuth()
  const [loading, setLoading] = useState(false)
  const [uploadLoading, setUploadLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [searchQuery, setSearchQuery] = useState('')
  const fileInputRef = useRef<HTMLInputElement>(null)

  const isAdmin = member?.role === 'admin' || member?.role === 'owner'

  // Convert admin files to document format
  const convertedAdminFiles: Document[] = adminFiles
    .filter(file => file.status === 'active')
    .map(file => ({
      id: file.id,
      name: file.fileName,
      type: file.fileType || file.originalName.split('.').pop()?.toUpperCase() || 'FILE',
      size: file.fileSize,
      uploadedAt: file.dateUploaded,
      uploadedBy: file.uploadedBy,
      category: 'other' as const,
      url: undefined // Would be provided by backend in real implementation
    }))

  // Combine sample documents with admin files
  const allDocuments = [...documents, ...convertedAdminFiles]

  const categories = [
    { value: 'all', label: 'All Documents' },
    { value: 'policy', label: 'Policies' },
    { value: 'handbook', label: 'Handbooks' },
    { value: 'form', label: 'Forms' },
    { value: 'template', label: 'Templates' },
    { value: 'other', label: 'Other' }
  ]

  const filteredDocuments = allDocuments.filter(doc => {
    const matchesCategory = selectedCategory === 'all' || doc.category === selectedCategory
    const matchesSearch = searchQuery === '' || 
      doc.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doc.uploadedBy.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesCategory && matchesSearch
  })

  const handleDownload = async (doc: Document) => {
    setError('')
    setSuccess('')
    
    try {
      console.log(`Downloading ${doc.name}...`)
      
      // Simulate download process
      setLoading(true)
      await new Promise(resolve => setTimeout(resolve, 1500))
      
      // In a real app, you would fetch the file from your backend
      // For demo purposes, we'll simulate the download
      const link = document.createElement('a')
      link.href = doc.url || '#'
      link.download = doc.name
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      
      setSuccess(`${doc.name} downloaded successfully!`)
      setTimeout(() => setSuccess(''), 3000)
    } catch (err: any) {
      setError(`Failed to download ${doc.name}. Please try again.`)
    } finally {
      setLoading(false)
    }
  }

  const handleUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files
    if (!files || !files.length) return

    const file = files[0]
    setError('')
    setSuccess('')
    setUploadLoading(true)

    try {
      // Validate file
      if (file.size > 10 * 1024 * 1024) { // 10MB limit
        throw new Error('File size must be less than 10MB')
      }

      const allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'text/plain']
      if (!allowedTypes.includes(file.type)) {
        throw new Error('Only PDF, DOC, DOCX, and TXT files are allowed')
      }

      console.log(`Uploading ${file.name}...`)
      
      // Simulate upload process
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      // In a real app, you would upload to your backend
      const newDocument: Document = {
        id: Date.now().toString(),
        name: file.name,
        type: file.name.split('.').pop()?.toUpperCase() || 'FILE',
        size: `${(file.size / 1024 / 1024).toFixed(1)} MB`,
        uploadedAt: new Date().toISOString().split('T')[0],
        uploadedBy: user?.user_metadata?.full_name || user?.email || 'Current User',
        category: 'other'
      }

      // Add to documents list (in a real app, this would trigger a refetch)
      documents.unshift(newDocument)
      
      setSuccess(`${file.name} uploaded successfully!`)
      setTimeout(() => setSuccess(''), 3000)
      
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    } catch (err: any) {
      setError(err.message || 'Failed to upload file. Please try again.')
    } finally {
      setUploadLoading(false)
    }
  }

  const getFileIcon = (type: string) => {
    switch (type.toLowerCase()) {
      case 'pdf':
        return (
          <svg className="w-8 h-8 text-red-500" fill="currentColor" viewBox="0 0 24 24">
            <path d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M18,20H6V4H13V9H18V20Z" />
          </svg>
        )
      case 'doc':
      case 'docx':
        return (
          <svg className="w-8 h-8 text-blue-500" fill="currentColor" viewBox="0 0 24 24">
            <path d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M18,20H6V4H13V9H18V20Z" />
          </svg>
        )
      default:
        return (
          <svg className="w-8 h-8 text-gray-500" fill="currentColor" viewBox="0 0 24 24">
            <path d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M18,20H6V4H13V9H18V20Z" />
          </svg>
        )
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-6xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Company Documents</h2>
            <p className="text-gray-600 mt-1">Access important company documents and resources</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Controls */}
        <div className="p-6 border-b border-gray-200 bg-gray-50">
          <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
            <div className="flex flex-col sm:flex-row gap-4 flex-1">
              {/* Search */}
              <div className="relative flex-1 max-w-md">
                <input
                  type="text"
                  placeholder="Search documents..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                />
                <svg className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>

              {/* Category Filter */}
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              >
                {categories.map(category => (
                  <option key={category.value} value={category.value}>{category.label}</option>
                ))}
              </select>
            </div>

            {/* Upload Button - Admin Only */}
            {isAdmin && (
              <div>
                <input
                  ref={fileInputRef}
                  type="file"
                  onChange={handleUpload}
                  accept=".pdf,.doc,.docx,.txt"
                  className="hidden"
                />
                <button
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploadLoading}
                  className="flex items-center space-x-2 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 disabled:opacity-50 transition-colors"
                >
                  {uploadLoading ? (
                    <LoadingSpinner size="sm" />
                  ) : (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                    </svg>
                  )}
                  <span>Upload Document</span>
                </button>
              </div>
            )}
          </div>

          {/* Status Messages */}
          {error && (
            <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}
          {success && (
            <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
              <p className="text-sm text-green-600">{success}</p>
            </div>
          )}
        </div>

        {/* Documents List */}
        <div className="p-6 overflow-y-auto max-h-96">
          {loading && <ModalLoading text="Preparing download..." />}
          
          {!loading && filteredDocuments.length === 0 && (
            <div className="text-center py-12">
              <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <h3 className="mt-4 text-lg font-medium text-gray-900">No documents found</h3>
              <p className="mt-2 text-gray-600">
                {searchQuery ? 'Try adjusting your search terms.' : 'No documents available in this category.'}
              </p>
            </div>
          )}

          {!loading && filteredDocuments.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredDocuments.map(document => (
                <div key={document.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                  <div className="flex items-start space-x-4">
                    {getFileIcon(document.type)}
                    <div className="flex-1 min-w-0">
                      <h3 className="text-sm font-semibold text-gray-900 truncate">{document.name}</h3>
                      <div className="mt-1 text-xs text-gray-500 space-y-1">
                        <p>Type: {document.type} " Size: {document.size}</p>
                        <p>Uploaded: {new Date(document.uploadedAt).toLocaleDateString()}</p>
                        <p>By: {document.uploadedBy}</p>
                        <span className={`inline-block px-2 py-1 rounded text-xs font-medium ${
                          document.category === 'policy' ? 'bg-red-100 text-red-700' :
                          document.category === 'handbook' ? 'bg-blue-100 text-blue-700' :
                          document.category === 'form' ? 'bg-green-100 text-green-700' :
                          document.category === 'template' ? 'bg-purple-100 text-purple-700' :
                          'bg-gray-100 text-gray-700'
                        }`}>
                          {document.category}
                        </span>
                      </div>
                    </div>
                    <button
                      onClick={() => handleDownload(document)}
                      disabled={loading}
                      className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-lg disabled:opacity-50 transition-colors"
                      title="Download document"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}