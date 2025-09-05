import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react'

interface Document {
  id: string
  title: string
  description: string
  fileName: string
  fileSize: string
  fileType: string
  category: 'policy' | 'handbook' | 'form' | 'announcement' | 'training' | 'other'
  uploadedBy: string
  uploadedAt: string
  updatedAt: string
  isRequired: boolean
  tags: string[]
  downloadCount: number
  url?: string // For demo purposes
}

interface DocumentContextType {
  documents: Document[]
  categories: string[]
  loading: boolean
  error: string | null
  addDocument: (document: Omit<Document, 'id' | 'uploadedAt' | 'updatedAt' | 'downloadCount'>) => Promise<void>
  updateDocument: (id: string, updates: Partial<Document>) => Promise<void>
  deleteDocument: (id: string) => Promise<void>
  downloadDocument: (id: string) => Promise<void>
  getDocumentsByCategory: (category: string) => Document[]
  searchDocuments: (query: string) => Document[]
  getRequiredDocuments: () => Document[]
}

const DocumentContext = createContext<DocumentContextType | undefined>(undefined)

// Default documents for demo
const defaultDocuments: Document[] = [
  {
    id: '1',
    title: 'Employee Handbook 2024',
    description: 'Comprehensive guide to company policies, procedures, and benefits.',
    fileName: 'employee-handbook-2024.pdf',
    fileSize: '2.4 MB',
    fileType: 'PDF',
    category: 'handbook',
    uploadedBy: 'HR Department',
    uploadedAt: '2024-01-15T10:00:00Z',
    updatedAt: '2024-01-15T10:00:00Z',
    isRequired: true,
    tags: ['onboarding', 'policies', 'benefits'],
    downloadCount: 156,
    url: '#'
  },
  {
    id: '2',
    title: 'Leave Request Form',
    description: 'Official form for requesting time off. Required for all leave applications.',
    fileName: 'leave-request-form.pdf',
    fileSize: '234 KB',
    fileType: 'PDF',
    category: 'form',
    uploadedBy: 'HR Department',
    uploadedAt: '2024-01-10T14:30:00Z',
    updatedAt: '2024-01-10T14:30:00Z',
    isRequired: true,
    tags: ['leave', 'form', 'required'],
    downloadCount: 89,
    url: '#'
  },
  {
    id: '3',
    title: 'Remote Work Policy',
    description: 'Guidelines and requirements for remote work arrangements.',
    fileName: 'remote-work-policy.pdf',
    fileSize: '1.1 MB',
    fileType: 'PDF',
    category: 'policy',
    uploadedBy: 'Management',
    uploadedAt: '2024-02-01T09:15:00Z',
    updatedAt: '2024-02-01T09:15:00Z',
    isRequired: false,
    tags: ['remote', 'policy', 'flexibility'],
    downloadCount: 234,
    url: '#'
  },
  {
    id: '4',
    title: 'Health & Safety Guidelines',
    description: 'Important health and safety procedures for all employees.',
    fileName: 'health-safety-guidelines.pdf',
    fileSize: '1.8 MB',
    fileType: 'PDF',
    category: 'policy',
    uploadedBy: 'Safety Team',
    uploadedAt: '2024-01-20T11:45:00Z',
    updatedAt: '2024-01-20T11:45:00Z',
    isRequired: true,
    tags: ['health', 'safety', 'compliance'],
    downloadCount: 167,
    url: '#'
  },
  {
    id: '5',
    title: 'Benefits Overview 2024',
    description: 'Complete overview of employee benefits, insurance, and retirement plans.',
    fileName: 'benefits-overview-2024.pdf',
    fileSize: '3.2 MB',
    fileType: 'PDF',
    category: 'handbook',
    uploadedBy: 'Benefits Team',
    uploadedAt: '2024-01-05T16:20:00Z',
    updatedAt: '2024-01-05T16:20:00Z',
    isRequired: false,
    tags: ['benefits', 'insurance', 'retirement'],
    downloadCount: 198,
    url: '#'
  },
  {
    id: '6',
    title: 'Code of Conduct',
    description: 'Professional standards and ethical guidelines for all team members.',
    fileName: 'code-of-conduct.pdf',
    fileSize: '856 KB',
    fileType: 'PDF',
    category: 'policy',
    uploadedBy: 'Legal Department',
    uploadedAt: '2024-01-08T13:10:00Z',
    updatedAt: '2024-01-08T13:10:00Z',
    isRequired: true,
    tags: ['ethics', 'conduct', 'standards'],
    downloadCount: 203,
    url: '#'
  }
]

const categories = ['policy', 'handbook', 'form', 'announcement', 'training', 'other']

interface DocumentProviderProps {
  children: ReactNode
}

export function DocumentProvider({ children }: DocumentProviderProps) {
  const [documents, setDocuments] = useState<Document[]>(() => {
    try {
      const stored = localStorage.getItem('leavehub-documents')
      return stored ? JSON.parse(stored) : defaultDocuments
    } catch {
      return defaultDocuments
    }
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Save to localStorage whenever documents change
  useEffect(() => {
    localStorage.setItem('leavehub-documents', JSON.stringify(documents))
  }, [documents])

  const addDocument = async (document: Omit<Document, 'id' | 'uploadedAt' | 'updatedAt' | 'downloadCount'>) => {
    setLoading(true)
    setError(null)
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      const newDocument: Document = {
        ...document,
        id: Date.now().toString(),
        uploadedAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        downloadCount: 0
      }
      
      setDocuments(prev => [newDocument, ...prev])
    } catch (err) {
      setError('Failed to upload document')
      throw err
    } finally {
      setLoading(false)
    }
  }

  const updateDocument = async (id: string, updates: Partial<Document>) => {
    setLoading(true)
    setError(null)
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500))
      
      setDocuments(prev => prev.map(doc => 
        doc.id === id 
          ? { ...doc, ...updates, updatedAt: new Date().toISOString() }
          : doc
      ))
    } catch (err) {
      setError('Failed to update document')
      throw err
    } finally {
      setLoading(false)
    }
  }

  const deleteDocument = async (id: string) => {
    setLoading(true)
    setError(null)
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500))
      
      setDocuments(prev => prev.filter(doc => doc.id !== id))
    } catch (err) {
      setError('Failed to delete document')
      throw err
    } finally {
      setLoading(false)
    }
  }

  const downloadDocument = async (id: string) => {
    try {
      // Simulate download and increment counter
      setDocuments(prev => prev.map(doc => 
        doc.id === id 
          ? { ...doc, downloadCount: doc.downloadCount + 1 }
          : doc
      ))
      
      // In a real app, this would trigger the actual download
      const doc = documents.find(document => document.id === id)
      if (doc) {
        // Create a temporary link to simulate download
        const link = document.createElement('a')
        link.href = '#'
        link.download = doc.fileName
        link.click()
      }
    } catch (err) {
      setError('Failed to download document')
      throw err
    }
  }

  const getDocumentsByCategory = (category: string) => {
    return documents.filter(doc => doc.category === category)
  }

  const searchDocuments = (query: string) => {
    const lowercaseQuery = query.toLowerCase()
    return documents.filter(doc => 
      doc.title.toLowerCase().includes(lowercaseQuery) ||
      doc.description.toLowerCase().includes(lowercaseQuery) ||
      doc.tags.some(tag => tag.toLowerCase().includes(lowercaseQuery))
    )
  }

  const getRequiredDocuments = () => {
    return documents.filter(doc => doc.isRequired)
  }

  const value: DocumentContextType = {
    documents,
    categories,
    loading,
    error,
    addDocument,
    updateDocument,
    deleteDocument,
    downloadDocument,
    getDocumentsByCategory,
    searchDocuments,
    getRequiredDocuments
  }

  return (
    <DocumentContext.Provider value={value}>
      {children}
    </DocumentContext.Provider>
  )
}

export function useDocuments() {
  const context = useContext(DocumentContext)
  if (context === undefined) {
    throw new Error('useDocuments must be used within a DocumentProvider')
  }
  return context
}