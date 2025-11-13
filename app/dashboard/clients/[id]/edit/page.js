'use client';

import { useState, useEffect } from 'react';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { db, storage } from '@/lib/firebase';
import { ref, uploadBytesResumable, getDownloadURL, deleteObject } from 'firebase/storage';
import { useRouter, useParams } from 'next/navigation';
import toast from 'react-hot-toast';
import FileUpload from '@/components/FileUpload';
import CertificateCard from '@/components/CertificateCard';
import { motion } from 'framer-motion';

const CERTIFICATE_TYPES = [
  { id: 'drugLicense', label: 'Drug License Certificate', required: false },
  { id: 'gst', label: 'GST Certificate', required: false },
  { id: 'agreement', label: 'Agreement Certificate', required: false },
  { id: 'other', label: 'Other Document', required: false },
];

export default function EditClientPage() {
  const router = useRouter();
  const params = useParams();
  const clientId = params.id;
  const [formData, setFormData] = useState({
    clientName: '',
    contactPerson: '',
    email: '',
    phone: '',
  });
  const [certificates, setCertificates] = useState({});
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    fetchClient();
  }, [clientId]);

  const fetchClient = async () => {
    try {
      const clientDoc = await getDoc(doc(db, 'clients', clientId));
      
      if (clientDoc.exists()) {
        const client = { id: clientDoc.id, ...clientDoc.data() };
        setFormData({
          clientName: client.clientName || '',
          contactPerson: client.contactPerson || '',
          email: client.email || '',
          phone: client.phone || '',
        });
        setCertificates(client.certificates || {});
      } else {
        toast.error('Client not found');
        router.push('/dashboard/clients');
      }
    } catch (error) {
      console.error('Error fetching client:', error);
      toast.error('Failed to fetch client data');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const autoSaveCertificates = async (updatedCertificates) => {
    try {
      await updateDoc(doc(db, 'clients', clientId), {
        certificates: updatedCertificates,
        updatedAt: new Date().toISOString(),
      });
    } catch (error) {
      console.error('Error auto-saving certificates:', error);
      // Don't show error toast for auto-save to avoid annoying the user
    }
  };

  const handleFileUpload = async (fileObj, onProgress, certificateType) => {
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

            setCertificates((prev) => {
              const updatedCertificates = {
                ...prev,
                [certificateType]: [...(prev[certificateType] || []), fileData],
              };
              
              // Auto-save immediately after upload
              autoSaveCertificates(updatedCertificates);
              
              return updatedCertificates;
            });

            toast.success('File uploaded and saved successfully');
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
    setUpdating(true);

    try {
      await updateDoc(doc(db, 'clients', clientId), {
        ...formData,
        certificates: certificates,
        updatedAt: new Date().toISOString(),
      });
      
      toast.success('Client updated successfully!');
      router.push('/dashboard/clients');
    } catch (error) {
      console.error('Error updating client:', error);
      toast.error('Failed to update client');
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="w-full">
      <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-6 sm:mb-8">Edit Client</h1>

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
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-3 sm:mb-4 gap-2">
            <h2 className="text-lg sm:text-xl font-semibold text-gray-800">
              Manage Certificates
            </h2>
            <p className="text-xs sm:text-sm text-gray-500 italic">
              Documents are saved automatically when uploaded
            </p>
          </div>

          <div className="space-y-6 sm:space-y-8">
            {CERTIFICATE_TYPES.map((certType) => (
              <div key={certType.id}>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {certType.label}
                </label>
                {certificates[certType.id] && certificates[certType.id].length > 0 && (
                  <div className="mb-3 sm:mb-4">
                    <p className="text-xs sm:text-sm font-medium text-gray-700 mb-2">
                      Existing Certificates ({certificates[certType.id].length})
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                      {certificates[certType.id].map((cert) => (
                        <CertificateCard
                          key={cert.id}
                          certificate={cert}
                          certificateType={certType.id}
                          onDelete={async (certId, certType) => {
                            // Find certificate before deletion
                            const certToDelete = certificates[certType]?.find(c => c.id === certId);
                            
                            // Delete file from storage
                            if (certToDelete?.storagePath) {
                              try {
                                const fileRef = ref(storage, certToDelete.storagePath);
                                await deleteObject(fileRef);
                              } catch (error) {
                                console.error('Error deleting file:', error);
                                toast.error('Failed to delete file from storage');
                                return;
                              }
                            }
                            
                            // Update state
                            const updatedCertificates = {
                              ...certificates,
                              [certType]: certificates[certType].filter(
                                (c) => c.id !== certId
                              ),
                            };
                            if (updatedCertificates[certType].length === 0) {
                              delete updatedCertificates[certType];
                            }
                            setCertificates(updatedCertificates);
                            
                            // Auto-save after deletion
                            autoSaveCertificates(updatedCertificates);
                            
                            toast.success('Certificate deleted');
                          }}
                        />
                      ))}
                    </div>
                  </div>
                )}
                <FileUpload
                  certificateType={certType.id}
                  existingFiles={certificates[certType.id] || []}
                  onUpload={(fileObj, onProgress, uploadedCertType) => {
                    handleFileUpload(fileObj, onProgress, uploadedCertType || certType.id);
                  }}
                />
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
            disabled={updating}
            className="w-full sm:w-auto px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition text-sm sm:text-base"
          >
            {updating ? 'Updating...' : 'Update Client'}
          </button>
        </div>
      </motion.form>
    </div>
  );
}

