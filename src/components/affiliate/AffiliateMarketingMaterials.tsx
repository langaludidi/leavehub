import React, { useState } from 'react'
import { useTheme } from '../../contexts/ThemeContext'

interface MarketingMaterial {
  id: string
  title: string
  type: 'banner' | 'email_template' | 'social_post' | 'landing_page' | 'video'
  description: string
  imageUrl?: string
  content: string
  downloadUrl?: string
  dimensions?: string
  fileSize?: string
  createdAt: string
}

const mockMaterials: MarketingMaterial[] = [
  {
    id: '1',
    title: 'LeaveHub Hero Banner - Large',
    type: 'banner',
    description: 'Perfect for website headers and blog posts',
    imageUrl: 'https://via.placeholder.com/728x90/3B82F6/FFFFFF?text=LeaveHub+Banner+728x90',
    content: 'Professional leave management banner with call-to-action',
    downloadUrl: '/assets/banners/leaveHub-728x90.png',
    dimensions: '728x90',
    fileSize: '45KB',
    createdAt: '2025-08-15'
  },
  {
    id: '2',
    title: 'Social Media Post Template',
    type: 'social_post',
    description: 'Ready-to-use social media content for LinkedIn and Twitter',
    content: `🚀 Transform your company's leave management with LeaveHub! 

✅ Streamlined approval workflows
✅ Real-time analytics & reporting  
✅ Employee self-service portal
✅ Compliance tracking

Start your free trial today! [Your Referral Link]

#HR #LeaveManagement #SaaS #Productivity`,
    createdAt: '2025-08-14'
  },
  {
    id: '3',
    title: 'Email Introduction Template',
    type: 'email_template',
    description: 'Professional email template for introducing LeaveHub to your network',
    content: `Subject: Finally, a leave management system that actually works

Hi [Name],

I wanted to share something that's been a game-changer for managing employee leave requests - LeaveHub.

After trying multiple solutions, LeaveHub stands out because:

• Automated approval workflows that actually work
• Real-time visibility into team capacity
• Seamless integration with existing HR systems
• Dedicated South African support

They're offering a free trial, and I thought you might find it valuable for [Company Name].

You can check it out here: [Your Referral Link]

Let me know what you think!

Best regards,
[Your Name]`,
    createdAt: '2025-08-13'
  },
  {
    id: '4',
    title: 'Square Social Banner',
    type: 'banner',
    description: 'Perfect for Instagram and Facebook posts',
    imageUrl: 'https://via.placeholder.com/400x400/10B981/FFFFFF?text=LeaveHub+Square',
    content: 'Square format banner for social media platforms',
    downloadUrl: '/assets/banners/leavehub-square-400x400.png',
    dimensions: '400x400',
    fileSize: '32KB',
    createdAt: '2025-08-12'
  },
  {
    id: '5',
    title: 'Blog Post Outline',
    type: 'landing_page',
    description: 'Complete blog post template about modern leave management',
    content: `# The Complete Guide to Modern Leave Management in 2025

## Introduction
- The challenges of traditional leave management
- Why digital solutions are essential

## Key Features to Look For
1. Automated approval workflows
2. Real-time reporting and analytics
3. Employee self-service capabilities
4. Integration capabilities
5. Compliance tracking

## How LeaveHub Solves These Challenges
[Insert your personal experience and success stories]

## Getting Started
Ready to transform your leave management? Start with LeaveHub's free trial: [Your Referral Link]

## Conclusion
Modern businesses need modern solutions. LeaveHub provides the tools your HR team needs to succeed.`,
    createdAt: '2025-08-11'
  }
]

export function AffiliateMarketingMaterials() {
  const { actualTheme } = useTheme()
  const [materials] = useState<MarketingMaterial[]>(mockMaterials)
  const [selectedType, setSelectedType] = useState<string>('all')
  const [searchQuery, setSearchQuery] = useState('')

  const filteredMaterials = materials.filter(material => {
    const matchesType = selectedType === 'all' || material.type === selectedType
    const matchesSearch = material.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         material.description.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesType && matchesSearch
  })

  const handleDownload = (material: MarketingMaterial) => {
    if (material.downloadUrl) {
      // Create a download link
      const link = document.createElement('a')
      link.href = material.downloadUrl
      link.download = material.title
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    } else {
      // Copy content to clipboard for text materials
      navigator.clipboard.writeText(material.content)
      alert('Content copied to clipboard!')
    }
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'banner':
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
        )
      case 'email_template':
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
          </svg>
        )
      case 'social_post':
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
          </svg>
        )
      case 'landing_page':
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        )
      default:
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707L16.414 6.5A1 1 0 0015.707 6.5H7a2 2 0 00-2 2v11a2 2 0 002 2z" />
          </svg>
        )
    }
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className={`text-3xl font-bold mb-2 ${
          actualTheme === 'dark' ? 'text-gray-100' : 'text-gray-900'
        }`}>
          Marketing Materials
        </h1>
        <p className={`${
          actualTheme === 'dark' ? 'text-gray-300' : 'text-gray-600'
        }`}>
          Ready-to-use marketing materials to promote LeaveHub
        </p>
      </div>

      {/* Filters */}
      <div className="mb-6 flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <input
            type="text"
            placeholder="Search materials..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
              actualTheme === 'dark'
                ? 'bg-gray-700 border-gray-600 text-gray-100 placeholder-gray-400'
                : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
            }`}
          />
        </div>
        <select
          value={selectedType}
          onChange={(e) => setSelectedType(e.target.value)}
          className={`px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
            actualTheme === 'dark'
              ? 'bg-gray-700 border-gray-600 text-gray-100'
              : 'bg-white border-gray-300 text-gray-900'
          }`}
        >
          <option value="all">All Types</option>
          <option value="banner">Banners</option>
          <option value="email_template">Email Templates</option>
          <option value="social_post">Social Posts</option>
          <option value="landing_page">Content Templates</option>
        </select>
      </div>

      {/* Materials Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredMaterials.map((material) => (
          <div
            key={material.id}
            className={`rounded-xl shadow-lg overflow-hidden transition-transform hover:scale-105 ${
              actualTheme === 'dark' ? 'bg-gray-800 border border-gray-700' : 'bg-white border border-gray-200'
            }`}
          >
            {/* Image Preview */}
            {material.imageUrl && (
              <div className="aspect-video bg-gray-100 dark:bg-gray-700">
                <img
                  src={material.imageUrl}
                  alt={material.title}
                  className="w-full h-full object-cover"
                />
              </div>
            )}

            {/* Content */}
            <div className="p-6">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center space-x-2">
                  <div className={`p-2 rounded-lg ${
                    actualTheme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'
                  }`}>
                    <div className={`${
                      actualTheme === 'dark' ? 'text-gray-300' : 'text-gray-600'
                    }`}>
                      {getTypeIcon(material.type)}
                    </div>
                  </div>
                  <div>
                    <h3 className={`font-semibold ${
                      actualTheme === 'dark' ? 'text-gray-100' : 'text-gray-900'
                    }`}>
                      {material.title}
                    </h3>
                    <p className={`text-sm ${
                      actualTheme === 'dark' ? 'text-gray-400' : 'text-gray-500'
                    }`}>
                      {material.type.replace('_', ' ').toUpperCase()}
                    </p>
                  </div>
                </div>
              </div>

              <p className={`text-sm mb-4 ${
                actualTheme === 'dark' ? 'text-gray-300' : 'text-gray-600'
              }`}>
                {material.description}
              </p>

              {/* Details */}
              <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400 mb-4">
                <span>{new Date(material.createdAt).toLocaleDateString()}</span>
                {material.dimensions && (
                  <span>{material.dimensions} • {material.fileSize}</span>
                )}
              </div>

              {/* Content Preview */}
              {material.type !== 'banner' && (
                <div className={`p-3 rounded-lg mb-4 text-xs max-h-20 overflow-hidden ${
                  actualTheme === 'dark' ? 'bg-gray-700' : 'bg-gray-50'
                }`}>
                  <p className={`${
                    actualTheme === 'dark' ? 'text-gray-300' : 'text-gray-600'
                  }`}>
                    {material.content.substring(0, 120)}...
                  </p>
                </div>
              )}

              {/* Actions */}
              <div className="flex space-x-2">
                <button
                  onClick={() => handleDownload(material)}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                >
                  {material.downloadUrl ? 'Download' : 'Copy'}
                </button>
                <button
                  onClick={() => {
                    // Preview functionality
                    alert('Preview functionality would open a modal with full content')
                  }}
                  className={`px-4 py-2 rounded-lg text-sm font-medium border transition-colors ${
                    actualTheme === 'dark'
                      ? 'border-gray-600 text-gray-300 hover:bg-gray-700'
                      : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  Preview
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* No Results */}
      {filteredMaterials.length === 0 && (
        <div className="text-center py-12">
          <svg className={`mx-auto h-12 w-12 mb-4 ${
            actualTheme === 'dark' ? 'text-gray-600' : 'text-gray-400'
          }`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <h3 className={`text-lg font-medium mb-2 ${
            actualTheme === 'dark' ? 'text-gray-300' : 'text-gray-900'
          }`}>
            No materials found
          </h3>
          <p className={`${
            actualTheme === 'dark' ? 'text-gray-500' : 'text-gray-500'
          }`}>
            Try adjusting your search or filter criteria
          </p>
        </div>
      )}
    </div>
  )
}