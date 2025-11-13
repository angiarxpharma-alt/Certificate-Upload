'use client';

import { useState, useRef } from 'react';
import { Upload, X, FileText, Image, File } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const ACCEPTED_TYPES = {
  'application/pdf': ['.pdf'],
  'image/*': ['.jpg', '.jpeg', '.png', '.gif'],
  'application/msword': ['.doc'],
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
};

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

export default function FileUpload({ onUpload, certificateType, existingFiles = {} }) {
  const [files, setFiles] = useState([]);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef(null);

  const getFileIcon = (fileType) => {
    if (fileType.includes('pdf')) return FileText;
    if (fileType.includes('image')) return Image;
    return File;
  };

  const validateFile = (file) => {
    if (file.size > MAX_FILE_SIZE) {
      return { valid: false, error: 'File size must be less than 10MB' };
    }
    
    const fileType = file.type;
    const isValidType = Object.keys(ACCEPTED_TYPES).some(type => {
      if (type === 'image/*') {
        return fileType.startsWith('image/');
      }
      return fileType === type;
    });

    if (!isValidType) {
      return { valid: false, error: 'Invalid file type. Please upload PDF, Image, or DOC files.' };
    }

    return { valid: true };
  };

  const handleFiles = (selectedFiles) => {
    const fileArray = Array.from(selectedFiles);
    const validFiles = [];

    fileArray.forEach((file) => {
      const validation = validateFile(file);
      if (validation.valid) {
        validFiles.push({
          file,
          id: Date.now() + Math.random(),
          name: file.name,
          type: file.type,
          size: file.size,
          progress: 0,
        });
      } else {
        alert(validation.error);
      }
    });

    setFiles((prev) => [...prev, ...validFiles]);
    
    // Auto-upload files
    validFiles.forEach((fileObj) => {
      uploadFile(fileObj);
    });
  };

  const uploadFile = async (fileObj) => {
    if (onUpload) {
      await onUpload(fileObj, (progress) => {
        setFiles((prev) =>
          prev.map((f) =>
            f.id === fileObj.id ? { ...f, progress } : f
          )
        );
      }, certificateType);
    }
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFiles(e.dataTransfer.files);
    }
  };

  const removeFile = (fileId) => {
    setFiles((prev) => prev.filter((f) => f.id !== fileId));
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  return (
    <div className="space-y-3 sm:space-y-4">
      <div
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        className={`border-2 border-dashed rounded-lg p-4 sm:p-6 lg:p-8 text-center transition ${
          dragActive
            ? 'border-primary-500 bg-primary-50'
            : 'border-gray-300 hover:border-primary-400'
        }`}
      >
        <Upload className="w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 mx-auto text-gray-400 mb-3 sm:mb-4" />
        <p className="text-sm sm:text-base text-gray-600 mb-2">
          Drag and drop files here, or{' '}
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="text-primary-600 hover:text-primary-700 font-medium"
          >
            browse
          </button>
        </p>
        <p className="text-xs sm:text-sm text-gray-500">
          PDF, Image, or DOC files (Max 10MB)
        </p>
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept=".pdf,.jpg,.jpeg,.png,.gif,.doc,.docx"
          onChange={(e) => {
            if (e.target.files) {
              handleFiles(e.target.files);
            }
          }}
          className="hidden"
        />
      </div>

      <AnimatePresence>
        {files.length > 0 && (
          <div className="space-y-2">
            {files.map((fileObj) => {
              const Icon = getFileIcon(fileObj.type);
              return (
                <motion.div
                  key={fileObj.id}
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="bg-white border border-gray-200 rounded-lg p-3 sm:p-4 flex items-center justify-between gap-2 sm:gap-3"
                >
                  <div className="flex items-center space-x-2 sm:space-x-3 flex-1 min-w-0">
                    <Icon className="w-4 h-4 sm:w-5 sm:h-5 text-primary-600 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs sm:text-sm font-medium text-gray-800 truncate">
                        {fileObj.name}
                      </p>
                      <p className="text-xs text-gray-500">
                        {formatFileSize(fileObj.size)}
                      </p>
                      {fileObj.progress < 100 && (
                        <div className="mt-2 w-full bg-gray-200 rounded-full h-1.5 sm:h-2">
                          <div
                            className="bg-primary-600 h-1.5 sm:h-2 rounded-full transition-all"
                            style={{ width: `${fileObj.progress}%` }}
                          />
                        </div>
                      )}
                      {fileObj.progress === 100 && (
                        <p className="text-xs text-green-600 mt-1">Uploaded</p>
                      )}
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => removeFile(fileObj.id)}
                    className="text-red-500 hover:text-red-700 flex-shrink-0 p-1"
                  >
                    <X className="w-4 h-4 sm:w-5 sm:h-5" />
                  </button>
                </motion.div>
              );
            })}
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

