'use client';

import { useState } from 'react';
import { collection, addDoc } from 'firebase/firestore';
import { db, storage } from '@/lib/firebase';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import FileUpload from '@/components/FileUpload';
import { motion } from 'framer-motion';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';

const CERTIFICATE_TYPES = [
  { id: 'drugLicense', label: 'Drug License Certificate', required: false },
  { id: 'gst', label: 'GST Certificate', required: false },
  { id: 'agreement', label: 'Agreement Certificate', required: false },
  { id: 'other', label: 'Other Document', required: false },
];

export default function AddClientPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    clientName: '',
    contactPerson: '',
    email: '',
    phone: '',
  });
  const [certificates, setCertificates] = useState({});
  const [uploading, setUploading] = useState(false);

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleFileUpload = async (fileObj, onProgress, certType) => {
    const certificateType = certType || 'other';

    try {
      const storagePath = `certificates/${Date.now()}_${fileObj.name}`;
      const storageRef = ref(storage, storagePath);
      const uploadTask = uploadBytesResumable(storageRef, fileObj.file);

      uploadTask.on(
        'state_changed',
        (snapshot) => {
          const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          onProgress(Math.round(progress));
        },
        (error) => {
          console.error('Error uploading file:', error);
          let errorMessage = 'Upload failed';
          if (error.code === 'storage/unauthorized') {
            errorMessage = 'Storage not authorized. Please check Firebase Storage rules.';
          } else if (error.code === 'storage/canceled') {
            errorMessage = 'Upload canceled';
          } else if (error.message?.includes('CORS')) {
            errorMessage = 'Storage CORS error. Please enable Firebase Storage in Console.';
          }
          toast.error(errorMessage);
          onProgress(0);
        },
        async () => {
          try {
            const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
            const fileData = {
              id: fileObj.id,
              name: fileObj.name,
              type: fileObj.type,
              size: fileObj.size,
              url: downloadURL,
              storagePath: storagePath,
              uploadDate: new Date().toISOString(),
            };

            setCertificates((prev) => ({
              ...prev,
              [certificateType]: [...(prev[certificateType] || []), fileData],
            }));

            toast.success('File uploaded successfully');
          } catch (error) {
            console.error('Error getting download URL:', error);
            toast.error('Failed to get file URL');
          }
        }
      );
    } catch (error) {
      console.error('Error uploading file:', error);
      toast.error('Upload failed');
      onProgress(0);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setUploading(true);

    try {
      // Certificates are optional - no validation needed
      const clientData = {
        ...formData,
        certificates: certificates,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      const docRef = await addDoc(collection(db, 'clients'), clientData);
      toast.success('Client added successfully!');
      router.push('/dashboard/clients');
    } catch (error) {
      console.error('Error adding client:', error);
      toast.error('Failed to add client');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="w-full">
      <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-6 sm:mb-8">Add New Client</h1>

      <motion.form
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        onSubmit={handleSubmit}
        className="bg-white rounded-lg shadow-md p-4 sm:p-6 lg:p-8 border border-gray-200 space-y-4 sm:space-y-6"
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Client Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="clientName"
              value={formData.clientName}
              onChange={handleInputChange}
              required
              className="w-full px-3 sm:px-4 py-2 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Contact Person <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="contactPerson"
              value={formData.contactPerson}
              onChange={handleInputChange}
              required
              className="w-full px-3 sm:px-4 py-2 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Email <span className="text-red-500">*</span>
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              required
              className="w-full px-3 sm:px-4 py-2 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Phone Number <span className="text-red-500">*</span>
            </label>
            <input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleInputChange}
              required
              className="w-full px-3 sm:px-4 py-2 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
            />
          </div>
        </div>

        <div className="border-t border-gray-200 pt-4 sm:pt-6">
          <h2 className="text-lg sm:text-xl font-semibold text-gray-800 mb-3 sm:mb-4">
            Upload Certificates
          </h2>

          <div className="space-y-6 sm:space-y-8">
            {CERTIFICATE_TYPES.map((certType) => (
              <div key={certType.id}>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {certType.label}
                  {certType.required && <span className="text-red-500 ml-1">*</span>}
                </label>
                <FileUpload
                  certificateType={certType.id}
                  onUpload={(fileObj, onProgress, uploadedCertType) => {
                    handleFileUpload(fileObj, onProgress, uploadedCertType || certType.id);
                  }}
                />
                {certificates[certType.id] && certificates[certType.id].length > 0 && (
                  <p className="text-xs sm:text-sm text-green-600 mt-2">
                    {certificates[certType.id].length} file(s) uploaded
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="flex flex-col sm:flex-row justify-end gap-3 sm:gap-4 pt-4 sm:pt-6 border-t border-gray-200">
          <button
            type="button"
            onClick={() => router.push('/dashboard/clients')}
            className="w-full sm:w-auto px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition text-sm sm:text-base"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={uploading}
            className="w-full sm:w-auto px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition text-sm sm:text-base"
          >
            {uploading ? 'Adding Client...' : 'Add Client'}
          </button>
        </div>
      </motion.form>
    </div>
  );
}

