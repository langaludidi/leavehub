import { useState, useRef } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../../lib/supabase';
import { AuditLogger } from '../../lib/auditLogger';
import { 
  DocumentArrowUpIcon,
  XMarkIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  InformationCircleIcon
} from '@heroicons/react/24/outline';

interface DocumentUploadProps {
  leaveRequestId: string;
  documentType: 'medical_certificate' | 'study_proof' | 'travel_document' | 'death_certificate' | 'other';
  isRequired: boolean;
  allowOverride?: boolean;
  onUploadComplete?: () => void;
  className?: string;
}

interface UploadProgress {
  file: File;
  progress: number;
  status: 'uploading' | 'success' | 'error';
  error?: string;
  documentId?: string;
}

const DOCUMENT_TYPE_LABELS = {
  medical_certificate: 'Medical Certificate',
  study_proof: 'Study Proof/Enrollment',
  travel_document: 'Travel Document',
  death_certificate: 'Death Certificate',
  other: 'Other Document'
};

const ACCEPTED_FILE_TYPES = {
  'image/jpeg': ['.jpg', '.jpeg'],
  'image/png': ['.png'],
  'image/webp': ['.webp'],
  'application/pdf': ['.pdf'],
  'application/msword': ['.doc'],
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx']
};

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

async function uploadDocument(
  file: File,
  leaveRequestId: string,
  documentType: string
): Promise<{ documentId: string; storagePath: string }> {
  const { data: user } = await supabase.auth.getUser();
  if (!user.user) throw new Error('Not authenticated');

  // Get user's organization
  const { data: userProfile } = await supabase
    .from('user_profiles')
    .select('organization_id')
    .eq('user_id', user.user.id)
    .single();

  if (!userProfile?.organization_id) throw new Error('No organization found');

  // Generate unique file path
  const fileExt = file.name.split('.').pop()?.toLowerCase();
  const fileName = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}.${fileExt}`;
  const storagePath = `organizations/${userProfile.organization_id}/documents/${leaveRequestId}/${fileName}`;

  // Upload file to Supabase Storage
  const { error: uploadError } = await supabase.storage
    .from('documents')
    .upload(storagePath, file, {
      cacheControl: '3600',
      upsert: false
    });

  if (uploadError) {
    console.error('Storage upload error:', uploadError);
    throw new Error(`Upload failed: ${uploadError.message}`);
  }

  // Create document record in database
  const { data: documentData, error: dbError } = await supabase
    .from('supporting_documents')
    .insert({
      organization_id: userProfile.organization_id,
      leave_request_id: leaveRequestId,
      uploaded_by: user.user.id,
      file_name: fileName,
      original_file_name: file.name,
      file_size: file.size,
      file_type: file.type,
      storage_path: storagePath,
      document_type: documentType,
      is_required: true,
      is_override: false
    })
    .select()
    .single();

  if (dbError) {
    console.error('Database insert error:', dbError);
    // Clean up uploaded file if database insert fails
    await supabase.storage.from('documents').remove([storagePath]);
    throw new Error(`Database error: ${dbError.message}`);
  }

  // Log the document upload
  await AuditLogger.logEvent({
    entity_type: 'supporting_document',
    entity_id: documentData.id,
    action: 'create',
    new_values: {
      document_type: documentType,
      file_name: file.name,
      file_size: file.size,
      leave_request_id: leaveRequestId
    },
    metadata: {
      upload_method: 'web',
      file_type: file.type
    }
  });

  return {
    documentId: documentData.id,
    storagePath
  };
}

async function createDocumentOverride(
  leaveRequestId: string,
  documentType: string,
  reason: string
): Promise<string> {
  const { data, error } = await supabase.rpc('create_document_override', {
    p_leave_request_id: leaveRequestId,
    p_document_type: documentType,
    p_override_reason: reason
  });

  if (error) {
    console.error('Override creation error:', error);
    throw new Error(`Override failed: ${error.message}`);
  }

  return data;
}

export default function DocumentUpload({
  leaveRequestId,
  documentType,
  isRequired,
  allowOverride = false,
  onUploadComplete,
  className = ''
}: DocumentUploadProps) {
  const [uploadProgress, setUploadProgress] = useState<UploadProgress | null>(null);
  const [showOverrideForm, setShowOverrideForm] = useState(false);
  const [overrideReason, setOverrideReason] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const queryClient = useQueryClient();

  const uploadMutation = useMutation({
    mutationFn: (file: File) => uploadDocument(file, leaveRequestId, documentType),
    onSuccess: () => {
      setUploadProgress(prev => prev ? { ...prev, status: 'success' } : null);
      queryClient.invalidateQueries({ queryKey: ['leave-request-documents', leaveRequestId] });
      onUploadComplete?.();
    },
    onError: (error: Error) => {
      setUploadProgress(prev => prev ? { ...prev, status: 'error', error: error.message } : null);
    }
  });

  const overrideMutation = useMutation({
    mutationFn: ({ reason }: { reason: string }) => createDocumentOverride(leaveRequestId, documentType, reason),
    onSuccess: () => {
      setShowOverrideForm(false);
      setOverrideReason('');
      queryClient.invalidateQueries({ queryKey: ['leave-request-documents', leaveRequestId] });
      onUploadComplete?.();
    }
  });

  const validateFile = (file: File): string | null => {
    if (file.size > MAX_FILE_SIZE) {
      return 'File size must be less than 10MB';
    }

    const acceptedTypes = Object.keys(ACCEPTED_FILE_TYPES);
    if (!acceptedTypes.includes(file.type)) {
      return 'File type not supported. Please upload PDF, Word, or image files.';
    }

    return null;
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const validationError = validateFile(file);
    if (validationError) {
      setUploadProgress({
        file,
        progress: 0,
        status: 'error',
        error: validationError
      });
      return;
    }

    setUploadProgress({
      file,
      progress: 0,
      status: 'uploading'
    });

    uploadMutation.mutate(file);
  };

  const handleOverrideSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!overrideReason.trim()) return;
    
    overrideMutation.mutate({ reason: overrideReason });
  };

  const acceptedExtensions = Object.values(ACCEPTED_FILE_TYPES).flat().join(',');

  return (
    <div className={`space-y-4 ${className}`}>
      <div className="flex items-center justify-between">
        <div>
          <h4 className="font-medium">{DOCUMENT_TYPE_LABELS[documentType]}</h4>
          {isRequired && (
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Required document - must be provided or admin override needed
            </p>
          )}
        </div>
        {isRequired && (
          <span className="px-2 py-1 text-xs bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300 rounded">
            Required
          </span>
        )}
      </div>

      {uploadProgress ? (
        <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              {uploadProgress.status === 'success' ? (
                <CheckCircleIcon className="w-5 h-5 text-green-500" />
              ) : uploadProgress.status === 'error' ? (
                <ExclamationTriangleIcon className="w-5 h-5 text-red-500" />
              ) : (
                <div className="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
              )}
              <span className="text-sm font-medium">{uploadProgress.file.name}</span>
            </div>
            <button
              onClick={() => setUploadProgress(null)}
              className="text-gray-400 hover:text-gray-600"
            >
              <XMarkIcon className="w-4 h-4" />
            </button>
          </div>
          
          <div className="text-xs text-gray-500 mb-2">
            {(uploadProgress.file.size / 1024 / 1024).toFixed(2)} MB
          </div>
          
          {uploadProgress.status === 'uploading' && (
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
              <div 
                className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                style={{ width: '90%' }} // Simulate progress since we don't have real progress
              />
            </div>
          )}
          
          {uploadProgress.status === 'success' && (
            <div className="text-sm text-green-600 dark:text-green-400">
              ✓ Upload completed successfully
            </div>
          )}
          
          {uploadProgress.status === 'error' && (
            <div className="text-sm text-red-600 dark:text-red-400">
              ✗ {uploadProgress.error}
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          <div 
            className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-6 text-center hover:border-gray-400 dark:hover:border-gray-500 transition-colors cursor-pointer"
            onClick={() => fileInputRef.current?.click()}
          >
            <DocumentArrowUpIcon className="w-8 h-8 text-gray-400 mx-auto mb-2" />
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
              Click to upload or drag and drop
            </p>
            <p className="text-xs text-gray-500">
              PDF, Word documents, or images (max 10MB)
            </p>
          </div>
          
          <input
            ref={fileInputRef}
            type="file"
            accept={acceptedExtensions}
            onChange={handleFileSelect}
            className="hidden"
          />
          
          {allowOverride && (
            <div className="pt-2 border-t border-gray-200 dark:border-gray-700">
              {showOverrideForm ? (
                <form onSubmit={handleOverrideSubmit} className="space-y-3">
                  <div>
                    <label className="label text-sm">Administrative Override Reason *</label>
                    <textarea
                      value={overrideReason}
                      onChange={(e) => setOverrideReason(e.target.value)}
                      className="textarea text-sm"
                      rows={3}
                      placeholder="Provide justification for document override (e.g., document unavailable, emergency situation, etc.)"
                      required
                    />
                  </div>
                  <div className="flex gap-2">
                    <button
                      type="submit"
                      disabled={overrideMutation.isPending || !overrideReason.trim()}
                      className="btn-primary text-sm"
                    >
                      {overrideMutation.isPending ? 'Creating Override...' : 'Create Override'}
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setShowOverrideForm(false);
                        setOverrideReason('');
                      }}
                      className="btn-secondary text-sm"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              ) : (
                <button
                  onClick={() => setShowOverrideForm(true)}
                  className="text-sm text-orange-600 hover:text-orange-700 dark:text-orange-400 flex items-center gap-1"
                >
                  <InformationCircleIcon className="w-4 h-4" />
                  Admin Override (Document Unavailable)
                </button>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}