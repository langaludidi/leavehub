'use client';

import { useEffect, useState } from 'react';
import { FileText, Download, Trash2, Calendar, Tag } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { format } from 'date-fns';

interface Document {
  id: string;
  filename: string;
  category: string;
  description: string | null;
  file_size: number;
  file_path: string;
  created_at: string;
}

const CATEGORY_LABELS: Record<string, string> = {
  medical_certificate: 'Medical Certificate',
  supporting_document: 'Supporting Document',
  contract: 'Contract/Agreement',
  identification: 'Identification',
  other: 'Other',
};

const CATEGORY_COLORS: Record<string, string> = {
  medical_certificate: 'bg-red-100 text-red-700',
  supporting_document: 'bg-blue-100 text-blue-700',
  contract: 'bg-purple-100 text-purple-700',
  identification: 'bg-green-100 text-green-700',
  other: 'bg-gray-100 text-gray-700',
};

export default function DocumentList() {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    fetchDocuments();
  }, []);

  const fetchDocuments = async () => {
    try {
      const response = await fetch('/api/documents');
      if (!response.ok) {
        throw new Error('Failed to fetch documents');
      }
      const data = await response.json();
      setDocuments(data.documents || []);
    } catch (err) {
      console.error('Error fetching documents:', err);
      setError('Failed to load documents');
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async (document: Document) => {
    try {
      const response = await fetch(`/api/documents/${document.id}/download`);
      if (!response.ok) {
        throw new Error('Download failed');
      }
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = document.filename;
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Download error:', err);
      alert('Failed to download document');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this document?')) {
      return;
    }

    setDeletingId(id);
    try {
      const response = await fetch(`/api/documents/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Delete failed');
      }

      setDocuments(prev => prev.filter(doc => doc.id !== id));
    } catch (err) {
      console.error('Delete error:', err);
      alert('Failed to delete document');
    } finally {
      setDeletingId(null);
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(2)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="w-8 h-8 border-4 border-teal-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-red-600">{error}</p>
        <Button onClick={fetchDocuments} className="mt-4">
          Try Again
        </Button>
      </div>
    );
  }

  if (documents.length === 0) {
    return (
      <div className="text-center py-12">
        <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
        <p className="text-gray-500 text-lg mb-2">No documents uploaded yet</p>
        <p className="text-gray-400 text-sm">
          Upload your first document using the form above
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {documents.map((doc) => (
        <div
          key={doc.id}
          className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
        >
          <div className="flex items-start justify-between">
            <div className="flex items-start gap-4 flex-1">
              <div className="bg-teal-100 p-3 rounded-lg">
                <FileText className="w-6 h-6 text-teal-600" />
              </div>

              <div className="flex-1">
                <h3 className="font-semibold text-gray-900 mb-1">{doc.filename}</h3>

                {doc.description && (
                  <p className="text-sm text-gray-600 mb-2">{doc.description}</p>
                )}

                <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500">
                  <div className="flex items-center gap-1">
                    <Tag className="w-4 h-4" />
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${
                        CATEGORY_COLORS[doc.category] || CATEGORY_COLORS.other
                      }`}
                    >
                      {CATEGORY_LABELS[doc.category] || doc.category}
                    </span>
                  </div>

                  <div className="flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    <span>{format(new Date(doc.created_at), 'MMM dd, yyyy')}</span>
                  </div>

                  <span>{formatFileSize(doc.file_size)}</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 ml-4">
              <Button
                onClick={() => handleDownload(doc)}
                variant="outline"
                size="sm"
                className="text-teal-600 hover:text-teal-700"
              >
                <Download className="w-4 h-4" />
              </Button>

              <Button
                onClick={() => handleDelete(doc.id)}
                variant="outline"
                size="sm"
                disabled={deletingId === doc.id}
                className="text-red-600 hover:text-red-700"
              >
                {deletingId === doc.id ? (
                  <div className="w-4 h-4 border-2 border-red-600 border-t-transparent rounded-full animate-spin" />
                ) : (
                  <Trash2 className="w-4 h-4" />
                )}
              </Button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
