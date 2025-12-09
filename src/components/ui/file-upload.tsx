'use client';

import { useState, useRef, ChangeEvent } from 'react';
import { Upload, X, File, FileText, AlertCircle } from 'lucide-react';
import { Button } from './button';

interface FileUploadProps {
  label?: string;
  description?: string;
  accept?: string;
  maxSize?: number; // in MB
  maxFiles?: number;
  required?: boolean;
  onFilesChange?: (files: File[]) => void;
  error?: string;
}

interface UploadedFile {
  file: File;
  preview?: string;
  id: string;
}

export function FileUpload({
  label = 'Upload File',
  description = 'Click to browse or drag and drop',
  accept = '.pdf,.jpg,.jpeg,.png,.doc,.docx',
  maxSize = 10, // 10MB default
  maxFiles = 5,
  required = false,
  onFilesChange,
  error,
}: FileUploadProps) {
  const [files, setFiles] = useState<UploadedFile[]>([]);
  const [dragActive, setDragActive] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFiles = (newFiles: FileList | null) => {
    if (!newFiles) return;

    setUploadError(null);

    // Check total file count
    if (files.length + newFiles.length > maxFiles) {
      setUploadError(`Maximum ${maxFiles} files allowed`);
      return;
    }

    const validFiles: UploadedFile[] = [];

    Array.from(newFiles).forEach((file) => {
      // Check file size
      if (file.size > maxSize * 1024 * 1024) {
        setUploadError(`File "${file.name}" exceeds ${maxSize}MB limit`);
        return;
      }

      // Create preview for images
      let preview: string | undefined;
      if (file.type.startsWith('image/')) {
        preview = URL.createObjectURL(file);
      }

      validFiles.push({
        file,
        preview,
        id: `${file.name}-${Date.now()}`,
      });
    });

    const updatedFiles = [...files, ...validFiles];
    setFiles(updatedFiles);

    // Notify parent component
    if (onFilesChange) {
      onFilesChange(updatedFiles.map((f) => f.file));
    }
  };

  const removeFile = (id: string) => {
    const updatedFiles = files.filter((f) => f.id !== id);
    setFiles(updatedFiles);

    // Notify parent component
    if (onFilesChange) {
      onFilesChange(updatedFiles.map((f) => f.file));
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFiles(e.dataTransfer.files);
    }
  };

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      handleFiles(e.target.files);
    }
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  const getFileIcon = (file: File) => {
    if (file.type.includes('pdf')) {
      return <FileText className="w-5 h-5 text-red-500" />;
    } else if (file.type.includes('image')) {
      return <File className="w-5 h-5 text-blue-500" />;
    } else if (file.type.includes('word') || file.type.includes('document')) {
      return <FileText className="w-5 h-5 text-blue-600" />;
    }
    return <File className="w-5 h-5 text-gray-500" />;
  };

  return (
    <div className="space-y-3">
      <label className="block text-sm font-medium text-gray-700">
        {label} {required && <span className="text-red-500">*</span>}
      </label>

      {/* Upload Area */}
      <div
        className={`relative border-2 border-dashed rounded-lg p-6 transition-colors cursor-pointer ${
          dragActive
            ? 'border-primary bg-primary/5'
            : error || uploadError
            ? 'border-red-300 bg-red-50'
            : 'border-gray-300 hover:border-gray-400 bg-white'
        }`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        onClick={handleClick}
      >
        <input
          ref={fileInputRef}
          type="file"
          className="hidden"
          accept={accept}
          multiple={maxFiles > 1}
          onChange={handleChange}
          required={required && files.length === 0}
        />

        <div className="flex flex-col items-center justify-center text-center">
          <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mb-3">
            <Upload className={`w-6 h-6 ${dragActive ? 'text-primary' : 'text-gray-400'}`} />
          </div>
          <p className="text-sm font-medium text-gray-700 mb-1">{description}</p>
          <p className="text-xs text-gray-500">
            {accept.split(',').map(ext => ext.trim().replace('.', '').toUpperCase()).join(', ')} • Max {maxSize}MB per file
          </p>
          {maxFiles > 1 && (
            <p className="text-xs text-gray-500 mt-1">
              Up to {maxFiles} files allowed
            </p>
          )}
        </div>
      </div>

      {/* Error Messages */}
      {(error || uploadError) && (
        <div className="flex items-start gap-2 p-3 bg-red-50 border border-red-200 rounded-lg">
          <AlertCircle className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" />
          <p className="text-sm text-red-700">{error || uploadError}</p>
        </div>
      )}

      {/* Uploaded Files List */}
      {files.length > 0 && (
        <div className="space-y-2">
          <p className="text-sm font-medium text-gray-700">
            Uploaded Files ({files.length}/{maxFiles})
          </p>
          {files.map((uploadedFile) => (
            <div
              key={uploadedFile.id}
              className="flex items-center gap-3 p-3 bg-gray-50 border border-gray-200 rounded-lg group hover:bg-gray-100 transition-colors"
            >
              {/* File Icon or Preview */}
              <div className="flex-shrink-0">
                {uploadedFile.preview ? (
                  <img
                    src={uploadedFile.preview}
                    alt={uploadedFile.file.name}
                    className="w-10 h-10 object-cover rounded"
                  />
                ) : (
                  getFileIcon(uploadedFile.file)
                )}
              </div>

              {/* File Info */}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">
                  {uploadedFile.file.name}
                </p>
                <p className="text-xs text-gray-500">
                  {formatFileSize(uploadedFile.file.size)}
                </p>
              </div>

              {/* Remove Button */}
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  removeFile(uploadedFile.id);
                }}
                className="opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <X className="w-4 h-4 text-gray-500" />
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
