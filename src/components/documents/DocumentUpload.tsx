'use client';

import { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, File, X, CheckCircle, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

const DOCUMENT_CATEGORIES = [
  { value: 'medical_certificate', label: 'Medical Certificate' },
  { value: 'supporting_document', label: 'Supporting Document' },
  { value: 'contract', label: 'Contract/Agreement' },
  { value: 'identification', label: 'Identification' },
  { value: 'other', label: 'Other' },
];

export default function DocumentUpload() {
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [category, setCategory] = useState('medical_certificate');
  const [description, setDescription] = useState('');
  const [uploading, setUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  const onDrop = useCallback((acceptedFiles: File[]) => {
    setSelectedFiles(prev => [...prev, ...acceptedFiles]);
    setUploadStatus('idle');
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.png', '.jpg', '.jpeg', '.gif'],
      'application/pdf': ['.pdf'],
      'application/msword': ['.doc'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
    },
    maxSize: 10 * 1024 * 1024, // 10MB
  });

  const removeFile = (index: number) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleUpload = async () => {
    if (selectedFiles.length === 0) {
      setErrorMessage('Please select at least one file');
      setUploadStatus('error');
      return;
    }

    setUploading(true);
    setUploadStatus('idle');
    setErrorMessage('');

    try {
      // Upload each file
      const uploadPromises = selectedFiles.map(async (file) => {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('category', category);
        formData.append('description', description);

        const response = await fetch('/api/documents/upload', {
          method: 'POST',
          body: formData,
        });

        if (!response.ok) {
          throw new Error(`Failed to upload ${file.name}`);
        }

        return response.json();
      });

      await Promise.all(uploadPromises);

      // Success
      setUploadStatus('success');
      setSelectedFiles([]);
      setDescription('');

      // Refresh the document list
      window.location.reload();
    } catch (error) {
      console.error('Upload error:', error);
      setUploadStatus('error');
      setErrorMessage(error instanceof Error ? error.message : 'Upload failed');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Dropzone */}
      <div
        {...getRootProps()}
        className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
          isDragActive
            ? 'border-teal-500 bg-teal-50'
            : 'border-gray-300 hover:border-teal-400 hover:bg-gray-50'
        }`}
      >
        <input {...getInputProps()} />
        <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
        {isDragActive ? (
          <p className="text-teal-600 font-medium">Drop files here...</p>
        ) : (
          <>
            <p className="text-gray-700 font-medium mb-2">
              Drag and drop files here, or click to select
            </p>
            <p className="text-sm text-gray-500">
              Supported: PDF, DOC, DOCX, Images (max 10MB per file)
            </p>
          </>
        )}
      </div>

      {/* Selected Files */}
      {selectedFiles.length > 0 && (
        <div className="space-y-2">
          <h3 className="font-medium text-gray-900">Selected Files ({selectedFiles.length})</h3>
          {selectedFiles.map((file, index) => (
            <div
              key={index}
              className="flex items-center justify-between bg-gray-50 p-3 rounded-lg"
            >
              <div className="flex items-center gap-3">
                <File className="w-5 h-5 text-gray-500" />
                <div>
                  <p className="text-sm font-medium text-gray-900">{file.name}</p>
                  <p className="text-xs text-gray-500">
                    {(file.size / 1024).toFixed(2)} KB
                  </p>
                </div>
              </div>
              <button
                onClick={() => removeFile(index)}
                className="text-red-500 hover:text-red-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Category and Description */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Document Category
          </label>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
          >
            {DOCUMENT_CATEGORIES.map((cat) => (
              <option key={cat.value} value={cat.value}>
                {cat.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Description (Optional)
          </label>
          <input
            type="text"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="e.g., Sick leave for Dec 15-17"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
          />
        </div>
      </div>

      {/* Upload Status */}
      {uploadStatus === 'success' && (
        <div className="flex items-center gap-2 text-green-600 bg-green-50 p-3 rounded-lg">
          <CheckCircle className="w-5 h-5" />
          <span className="font-medium">Documents uploaded successfully!</span>
        </div>
      )}

      {uploadStatus === 'error' && (
        <div className="flex items-center gap-2 text-red-600 bg-red-50 p-3 rounded-lg">
          <AlertCircle className="w-5 h-5" />
          <span className="font-medium">{errorMessage || 'Upload failed'}</span>
        </div>
      )}

      {/* Upload Button */}
      <Button
        onClick={handleUpload}
        disabled={uploading || selectedFiles.length === 0}
        className="w-full bg-teal-700 hover:bg-teal-800 text-white"
      >
        {uploading ? (
          <>
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
            Uploading...
          </>
        ) : (
          `Upload ${selectedFiles.length} ${selectedFiles.length === 1 ? 'Document' : 'Documents'}`
        )}
      </Button>
    </div>
  );
}
