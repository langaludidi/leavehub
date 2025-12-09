import { Suspense } from 'react';
import DashboardHeader from '@/components/DashboardHeader';
import DocumentUpload from '@/components/documents/DocumentUpload';
import DocumentList from '@/components/documents/DocumentList';
import { Card } from '@/components/ui/card';
import { FileText } from 'lucide-react';

export default function DocumentsPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <DashboardHeader />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <FileText className="w-8 h-8 text-teal-600" />
            <h1 className="text-3xl font-bold text-gray-900">Documents</h1>
          </div>
          <p className="text-gray-600">
            Upload and manage your leave-related documents, medical certificates, and supporting files.
          </p>
        </div>

        {/* Upload Section */}
        <Card className="p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Upload New Document
          </h2>
          <Suspense fallback={<div>Loading upload...</div>}>
            <DocumentUpload />
          </Suspense>
        </Card>

        {/* Documents List */}
        <Card className="p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            My Documents
          </h2>
          <Suspense fallback={<div>Loading documents...</div>}>
            <DocumentList />
          </Suspense>
        </Card>
      </div>
    </div>
  );
}
