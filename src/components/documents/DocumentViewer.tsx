import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../../lib/supabase';
import { 
  DocumentIcon,
  EyeIcon,
  ArrowDownTrayIcon,
  CheckCircleIcon,
  XCircleIcon,
  ExclamationCircleIcon,
  TrashIcon
} from '@heroicons/react/24/outline';
import { format } from 'date-fns';

interface SupportingDocument {
  id: string;
  file_name: string;
  original_file_name: string;
  file_size: number;
  file_type: string;
  storage_path: string;
  document_type: string;
  is_required: boolean;
  is_override: boolean;
  override_reason: string | null;
  verified_by: string | null;
  verified_at: string | null;
  verification_notes: string | null;
  created_at: string;
  uploader?: {
    email: string;
  };
  verifier?: {
    email: string;
  };
}

interface DocumentViewerProps {
  leaveRequestId: string;
  canVerify?: boolean;
  canDelete?: boolean;
  className?: string;
}

const DOCUMENT_TYPE_LABELS = {
  medical_certificate: 'Medical Certificate',
  study_proof: 'Study Proof/Enrollment', 
  travel_document: 'Travel Document',
  death_certificate: 'Death Certificate',
  other: 'Other Document'
};

async function fetchDocuments(leaveRequestId: string): Promise<SupportingDocument[]> {
  const { data, error } = await supabase
    .from('supporting_documents')
    .select(`
      *,
      uploader:user_profiles!supporting_documents_uploaded_by_fkey(
        user:auth.users(email)
      ),
      verifier:user_profiles!supporting_documents_verified_by_fkey(
        user:auth.users(email)
      )
    `)
    .eq('leave_request_id', leaveRequestId)
    .order('created_at', { ascending: false });

  if (error) throw error;

  return (data || []).map(doc => ({
    ...doc,
    uploader: doc.uploader?.user || null,
    verifier: doc.verifier?.user || null
  }));
}

async function getDocumentUrl(storagePath: string): Promise<string> {
  const { data, error } = await supabase.storage
    .from('documents')
    .createSignedUrl(storagePath, 3600); // 1 hour expiry

  if (error) throw error;
  return data.signedUrl;
}

async function downloadDocument(document: SupportingDocument): Promise<void> {
  // Log document access
  await supabase.rpc('log_document_access', {
    p_document_id: document.id,
    p_access_type: 'download',
    p_access_reason: 'User download'
  });

  const url = await getDocumentUrl(document.storage_path);
  
  // Create temporary link and trigger download
  const link = document.createElement('a');
  link.href = url;
  link.download = document.original_file_name;
  link.target = '_blank';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

async function verifyDocument(documentId: string, notes?: string): Promise<void> {
  const { error } = await supabase.rpc('verify_document', {
    p_document_id: documentId,
    p_verification_notes: notes
  });

  if (error) throw error;
}

async function deleteDocument(documentId: string, storagePath: string): Promise<void> {
  // Delete from storage first
  const { error: storageError } = await supabase.storage
    .from('documents')
    .remove([storagePath]);

  if (storageError) {
    console.warn('Failed to delete from storage:', storageError);
    // Continue with database deletion even if storage fails
  }

  // Delete from database
  const { error: dbError } = await supabase
    .from('supporting_documents')
    .delete()
    .eq('id', documentId);

  if (dbError) throw dbError;
}

function DocumentCard({ 
  document, 
  canVerify, 
  canDelete, 
  onVerify, 
  onDelete 
}: { 
  document: SupportingDocument;
  canVerify: boolean;
  canDelete: boolean;
  onVerify: (id: string, notes?: string) => void;
  onDelete: (id: string, storagePath: string) => void;
}) {
  const [showVerificationForm, setShowVerificationForm] = useState(false);
  const [verificationNotes, setVerificationNotes] = useState('');
  const [isViewing, setIsViewing] = useState(false);
  const [documentUrl, setDocumentUrl] = useState<string | null>(null);

  const handleView = async () => {
    try {
      setIsViewing(true);
      
      // Log document access
      await supabase.rpc('log_document_access', {
        p_document_id: document.id,
        p_access_type: 'view',
        p_access_reason: 'Document preview'
      });

      const url = await getDocumentUrl(document.storage_path);
      setDocumentUrl(url);
      
      // Open in new tab/window
      window.open(url, '_blank');
    } catch (error) {
      console.error('Failed to view document:', error);
    } finally {
      setIsViewing(false);
    }
  };

  const handleVerify = (e: React.FormEvent) => {
    e.preventDefault();
    onVerify(document.id, verificationNotes);
    setShowVerificationForm(false);
    setVerificationNotes('');
  };

  const formatFileSize = (bytes: number) => {
    const sizes = ['B', 'KB', 'MB', 'GB'];
    if (bytes === 0) return '0 B';
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return `${(bytes / Math.pow(1024, i)).toFixed(1)} ${sizes[i]}`;
  };

  const getFileTypeIcon = (fileType: string) => {
    if (fileType.startsWith('image/')) {
      return '🖼️';
    } else if (fileType === 'application/pdf') {
      return '📄';
    } else if (fileType.includes('word')) {
      return '📝';
    }
    return '📎';
  };

  return (
    <div className="card border-l-4" style={{
      borderLeftColor: document.is_override ? '#f59e0b' : 
                      document.verified_at ? '#10b981' : '#6b7280'
    }}>
      <div className="card-body">
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-3 flex-1">
            <div className="text-2xl">
              {document.is_override ? '⚠️' : getFileTypeIcon(document.file_type)}
            </div>
            
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <h4 className="font-medium">
                  {DOCUMENT_TYPE_LABELS[document.document_type as keyof typeof DOCUMENT_TYPE_LABELS]}
                </h4>
                {document.is_required && (
                  <span className="px-2 py-1 text-xs bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300 rounded">
                    Required
                  </span>
                )}
              </div>
              
              {document.is_override ? (
                <div className="space-y-1">
                  <p className="text-sm text-orange-600 dark:text-orange-400 font-medium">
                    Administrative Override
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Reason: {document.override_reason}
                  </p>
                </div>
              ) : (
                <div className="space-y-1">
                  <p className="text-sm font-medium">{document.original_file_name}</p>
                  <div className="text-xs text-gray-500 space-y-1">
                    <div>{formatFileSize(document.file_size)} • {format(new Date(document.created_at), 'MMM d, yyyy')}</div>
                    <div>Uploaded by: {document.uploader?.email || 'Unknown'}</div>
                  </div>
                </div>
              )}
              
              {/* Verification Status */}
              <div className="mt-2">
                {document.verified_at ? (
                  <div className="flex items-center gap-1 text-sm text-green-600 dark:text-green-400">
                    <CheckCircleIcon className="w-4 h-4" />
                    <span>Verified by {document.verifier?.email}</span>
                    <span className="text-gray-400">• {format(new Date(document.verified_at), 'MMM d, yyyy')}</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-1 text-sm text-gray-500">
                    <ExclamationCircleIcon className="w-4 h-4" />
                    <span>Pending verification</span>
                  </div>
                )}
                
                {document.verification_notes && (
                  <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                    Note: {document.verification_notes}
                  </p>
                )}
              </div>
            </div>
          </div>
          
          {/* Actions */}
          <div className="flex items-center gap-2">
            {!document.is_override && (
              <>
                <button
                  onClick={handleView}
                  disabled={isViewing}
                  className="p-2 text-blue-600 hover:text-blue-700 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded transition-colors"
                  title="View document"
                >
                  <EyeIcon className="w-4 h-4" />
                </button>
                
                <button
                  onClick={() => downloadDocument(document)}
                  className="p-2 text-green-600 hover:text-green-700 hover:bg-green-50 dark:hover:bg-green-900/20 rounded transition-colors"
                  title="Download document"
                >
                  <ArrowDownTrayIcon className="w-4 h-4" />
                </button>
              </>
            )}
            
            {canVerify && !document.verified_at && (
              <button
                onClick={() => setShowVerificationForm(true)}
                className="p-2 text-teal-600 hover:text-teal-700 hover:bg-teal-50 dark:hover:bg-teal-900/20 rounded transition-colors"
                title="Verify document"
              >
                <CheckCircleIcon className="w-4 h-4" />
              </button>
            )}
            
            {canDelete && (
              <button
                onClick={() => onDelete(document.id, document.storage_path)}
                className="p-2 text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-colors"
                title="Delete document"
              >
                <TrashIcon className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
        
        {/* Verification Form */}
        {showVerificationForm && (
          <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
            <form onSubmit={handleVerify} className="space-y-3">
              <div>
                <label className="label text-sm">Verification Notes (Optional)</label>
                <textarea
                  value={verificationNotes}
                  onChange={(e) => setVerificationNotes(e.target.value)}
                  className="textarea text-sm"
                  rows={2}
                  placeholder="Add any notes about this document verification..."
                />
              </div>
              <div className="flex gap-2">
                <button type="submit" className="btn-primary text-sm">
                  Verify Document
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowVerificationForm(false);
                    setVerificationNotes('');
                  }}
                  className="btn-secondary text-sm"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}

export default function DocumentViewer({
  leaveRequestId,
  canVerify = false,
  canDelete = false,
  className = ''
}: DocumentViewerProps) {
  const queryClient = useQueryClient();

  const { data: documents, isLoading } = useQuery({
    queryKey: ['leave-request-documents', leaveRequestId],
    queryFn: () => fetchDocuments(leaveRequestId)
  });

  const verifyMutation = useMutation({
    mutationFn: ({ documentId, notes }: { documentId: string; notes?: string }) =>
      verifyDocument(documentId, notes),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['leave-request-documents', leaveRequestId] });
    }
  });

  const deleteMutation = useMutation({
    mutationFn: ({ documentId, storagePath }: { documentId: string; storagePath: string }) =>
      deleteDocument(documentId, storagePath),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['leave-request-documents', leaveRequestId] });
    }
  });

  const handleVerify = (documentId: string, notes?: string) => {
    verifyMutation.mutate({ documentId, notes });
  };

  const handleDelete = (documentId: string, storagePath: string) => {
    if (confirm('Are you sure you want to delete this document? This action cannot be undone.')) {
      deleteMutation.mutate({ documentId, storagePath });
    }
  };

  if (isLoading) {
    return (
      <div className={`space-y-3 ${className}`}>
        {[1, 2].map(i => (
          <div key={i} className="animate-pulse">
            <div className="h-24 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
          </div>
        ))}
      </div>
    );
  }

  if (!documents || documents.length === 0) {
    return (
      <div className={`text-center py-8 text-gray-500 ${className}`}>
        <DocumentIcon className="w-12 h-12 mx-auto mb-2 opacity-50" />
        <p>No supporting documents uploaded</p>
        <p className="text-sm">Documents will appear here once uploaded</p>
      </div>
    );
  }

  return (
    <div className={`space-y-4 ${className}`}>
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Supporting Documents ({documents.length})</h3>
        <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
            <span>Verified</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
            <span>Override</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 bg-gray-400 rounded-full"></div>
            <span>Pending</span>
          </div>
        </div>
      </div>
      
      {documents.map((document) => (
        <DocumentCard
          key={document.id}
          document={document}
          canVerify={canVerify}
          canDelete={canDelete}
          onVerify={handleVerify}
          onDelete={handleDelete}
        />
      ))}
    </div>
  );
}