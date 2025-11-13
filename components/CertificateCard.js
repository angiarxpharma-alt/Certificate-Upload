'use client';

import { useState } from 'react';
import { FileText, Image, File, Download, Eye, Trash2, Calendar } from 'lucide-react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';

export default function CertificateCard({ certificate, onDelete, certificateType }) {
  const [showPreview, setShowPreview] = useState(false);

  const getFileIcon = (fileType) => {
    if (fileType?.includes('pdf')) return FileText;
    if (fileType?.includes('image')) return Image;
    return File;
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const handleDownload = () => {
    if (certificate.url) {
      const link = document.createElement('a');
      link.href = certificate.url;
      link.download = certificate.name;
      link.target = '_blank';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      toast.success('Download started');
    }
  };

  const handlePreview = () => {
    if (certificate.url) {
      window.open(certificate.url, '_blank');
    }
  };

  const Icon = getFileIcon(certificate.type);

  return (
    <>
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white border border-gray-200 rounded-lg p-3 sm:p-4 hover:shadow-md transition"
      >
        <div className="flex items-start justify-between gap-2 sm:gap-3">
          <div className="flex items-start space-x-2 sm:space-x-3 flex-1 min-w-0">
            <div className="bg-primary-50 p-1.5 sm:p-2 rounded-lg flex-shrink-0">
              <Icon className="w-4 h-4 sm:w-5 sm:h-5 text-primary-600" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs sm:text-sm font-medium text-gray-800 truncate">
                {certificate.name}
              </p>
              <div className="flex items-center space-x-1 sm:space-x-2 mt-1">
                <Calendar className="w-3 h-3 text-gray-400 flex-shrink-0" />
                <p className="text-xs text-gray-500">
                  {formatDate(certificate.uploadDate)}
                </p>
              </div>
              <p className="text-xs text-gray-500 mt-1 truncate">
                {certificate.type || 'Unknown type'}
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-1 sm:space-x-2 flex-shrink-0">
            <button
              onClick={handlePreview}
              className="p-1.5 sm:p-2 text-primary-600 hover:bg-primary-50 rounded-lg transition"
              title="Preview"
            >
              <Eye className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </button>
            <button
              onClick={handleDownload}
              className="p-1.5 sm:p-2 text-green-600 hover:bg-green-50 rounded-lg transition"
              title="Download"
            >
              <Download className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </button>
            {onDelete && (
              <button
                onClick={() => onDelete(certificate.id, certificateType)}
                className="p-1.5 sm:p-2 text-red-600 hover:bg-red-50 rounded-lg transition"
                title="Delete"
              >
                <Trash2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              </button>
            )}
          </div>
        </div>
      </motion.div>
    </>
  );
}

