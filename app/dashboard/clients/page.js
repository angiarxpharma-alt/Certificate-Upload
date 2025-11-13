'use client';

import { useEffect, useState } from 'react';
import { collection, getDocs, doc, deleteDoc, updateDoc } from 'firebase/firestore';
import { db, storage } from '@/lib/firebase';
import { ref, deleteObject } from 'firebase/storage';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { Search, Plus, Edit, Trash2, Mail, Phone, User, AlertCircle, Filter } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import CertificateCard from '@/components/CertificateCard';

const CERTIFICATE_TYPES = {
  drugLicense: 'Drug License Certificate',
  gst: 'GST Certificate',
  agreement: 'Agreement Certificate',
  other: 'Other Document',
};

// Main certificates to track (excluding 'other')
const MAIN_CERTIFICATE_TYPES = ['drugLicense', 'gst', 'agreement'];

export default function ClientsPage() {
  const router = useRouter();
  const [clients, setClients] = useState([]);
  const [filteredClients, setFilteredClients] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [expandedClient, setExpandedClient] = useState(null);
  const [showPendingOnly, setShowPendingOnly] = useState(false);

  useEffect(() => {
    fetchClients();
  }, []);

  // Function to get pending certificates for a client
  const getPendingCertificates = (client) => {
    const clientCerts = client.certificates || {};
    const pending = [];
    
    MAIN_CERTIFICATE_TYPES.forEach((certType) => {
      if (!clientCerts[certType] || clientCerts[certType].length === 0) {
        pending.push({
          id: certType,
          label: CERTIFICATE_TYPES[certType],
        });
      }
    });
    
    return pending;
  };

  useEffect(() => {
    let filtered = clients;
    
    // Apply search filter
    if (searchQuery.trim() !== '') {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter((client) =>
        client.clientName.toLowerCase().includes(query) ||
        client.contactPerson.toLowerCase().includes(query) ||
        client.email.toLowerCase().includes(query)
      );
    }
    
    // Apply pending filter
    if (showPendingOnly) {
      filtered = filtered.filter((client) => {
        const pending = getPendingCertificates(client);
        return pending.length > 0;
      });
    }
    
    setFilteredClients(filtered);
  }, [searchQuery, clients, showPendingOnly]);

  const fetchClients = async () => {
    try {
      const clientsSnapshot = await getDocs(collection(db, 'clients'));
      const clientsData = clientsSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      
      setClients(clientsData);
      setFilteredClients(clientsData);
    } catch (error) {
      console.error('Error fetching clients:', error);
      toast.error('Failed to fetch clients');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteClient = async (clientId) => {
    if (!confirm('Are you sure you want to delete this client and all their certificates?')) {
      return;
    }

    try {
      const client = clients.find((c) => c.id === clientId);
      
      // Delete all certificate files from storage
      if (client && client.certificates) {
        const deletePromises = [];
        Object.values(client.certificates).forEach((certArray) => {
          if (Array.isArray(certArray)) {
            certArray.forEach((cert) => {
              if (cert.storagePath) {
                const fileRef = ref(storage, cert.storagePath);
                deletePromises.push(deleteObject(fileRef).catch((error) => {
                  console.error('Error deleting file:', error);
                }));
              }
            });
          }
        });
        await Promise.all(deletePromises);
      }

      // Delete client document from Firestore
      await deleteDoc(doc(db, 'clients', clientId));
      
      toast.success('Client deleted successfully');
      fetchClients();
    } catch (error) {
      console.error('Error deleting client:', error);
      toast.error('Failed to delete client');
    }
  };

  const handleDeleteCertificate = async (clientId, certificateId, certificateType) => {
    if (!confirm('Are you sure you want to delete this certificate?')) {
      return;
    }

    try {
      const client = clients.find((c) => c.id === clientId);
      if (!client || !client.certificates || !client.certificates[certificateType]) {
        return;
      }

      const certificate = client.certificates[certificateType].find((c) => c.id === certificateId);
      
      // Delete file from storage
      if (certificate && certificate.storagePath) {
        try {
          const fileRef = ref(storage, certificate.storagePath);
          await deleteObject(fileRef);
        } catch (error) {
          console.error('Error deleting file from storage:', error);
          // Continue with Firestore update even if storage deletion fails
        }
      }

      // Update Firestore document
      const updatedCertificates = {
        ...client.certificates,
        [certificateType]: client.certificates[certificateType].filter(
          (c) => c.id !== certificateId
        ),
      };

      // Remove empty arrays
      if (updatedCertificates[certificateType].length === 0) {
        delete updatedCertificates[certificateType];
      }

      await updateDoc(doc(db, 'clients', clientId), {
        certificates: updatedCertificates,
        updatedAt: new Date().toISOString(),
      });

      toast.success('Certificate deleted successfully');
      fetchClients();
    } catch (error) {
      console.error('Error deleting certificate:', error);
      toast.error('Failed to delete certificate');
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
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 sm:mb-8 gap-4">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">View Clients</h1>
        <button
          onClick={() => router.push('/dashboard/add-client')}
          className="flex items-center justify-center space-x-2 bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition text-sm sm:text-base w-full sm:w-auto"
        >
          <Plus className="w-4 h-4 sm:w-5 sm:h-5" />
          <span>Add Client</span>
        </button>
      </div>

      <div className="bg-white rounded-lg shadow-md p-4 sm:p-6 mb-4 sm:mb-6 border border-gray-200">
        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 sm:w-5 sm:h-5" />
            <input
              type="text"
              placeholder="Search clients..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 sm:pl-10 pr-4 py-2 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
            />
          </div>
          <button
            onClick={() => setShowPendingOnly(!showPendingOnly)}
            className={`flex items-center justify-center space-x-2 px-4 py-2 rounded-lg border transition text-sm sm:text-base ${
              showPendingOnly
                ? 'bg-orange-50 border-orange-300 text-orange-700'
                : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
            }`}
          >
            <Filter className="w-4 h-4" />
            <span className="whitespace-nowrap">Show Pending Only</span>
          </button>
        </div>
      </div>

      {filteredClients.length === 0 ? (
        <div className="bg-white rounded-lg shadow-md p-8 sm:p-12 text-center border border-gray-200">
          <p className="text-gray-600 text-base sm:text-lg">
            {searchQuery ? 'No clients found matching your search.' : 'No clients added yet.'}
          </p>
          {!searchQuery && (
            <button
              onClick={() => router.push('/dashboard/add-client')}
              className="mt-4 text-primary-600 hover:text-primary-700 font-medium text-sm sm:text-base"
            >
              Add your first client →
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-3 sm:space-y-4">
          <AnimatePresence>
            {filteredClients.map((client) => (
              <motion.div
                key={client.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden"
              >
                <div className="p-4 sm:p-6">
                  <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
                        <h2 className="text-xl sm:text-2xl font-bold text-gray-800 truncate">
                          {client.clientName}
                        </h2>
                        {(() => {
                          const pending = getPendingCertificates(client);
                          if (pending.length > 0) {
                            return (
                              <span className="flex items-center space-x-1 bg-orange-100 text-orange-700 px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm font-medium self-start">
                                <AlertCircle className="w-3 h-3 sm:w-4 sm:h-4" />
                                <span>{pending.length} Pending</span>
                              </span>
                            );
                          }
                          return null;
                        })()}
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 mb-4">
                        <div className="flex items-center space-x-2 text-gray-600 min-w-0">
                          <User className="w-4 h-4 flex-shrink-0" />
                          <span className="text-xs sm:text-sm truncate">{client.contactPerson}</span>
                        </div>
                        <div className="flex items-center space-x-2 text-gray-600 min-w-0">
                          <Mail className="w-4 h-4 flex-shrink-0" />
                          <span className="text-xs sm:text-sm truncate break-all">{client.email}</span>
                        </div>
                        <div className="flex items-center space-x-2 text-gray-600 min-w-0">
                          <Phone className="w-4 h-4 flex-shrink-0" />
                          <span className="text-xs sm:text-sm truncate">{client.phone}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2 sm:ml-4 self-start sm:self-auto">
                      <button
                        onClick={() => router.push(`/dashboard/clients/${client.id}/edit`)}
                        className="p-2 text-primary-600 hover:bg-primary-50 rounded-lg transition"
                        title="Edit Client"
                      >
                        <Edit className="w-4 h-4 sm:w-5 sm:h-5" />
                      </button>
                      <button
                        onClick={() => handleDeleteClient(client.id)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition"
                        title="Delete Client"
                      >
                        <Trash2 className="w-4 h-4 sm:w-5 sm:h-5" />
                      </button>
                    </div>
                  </div>

                  {/* Pending Certificates Section */}
                  {(() => {
                    const pending = getPendingCertificates(client);
                    if (pending.length > 0) {
                      return (
                        <div className="mt-3 sm:mt-4 p-3 sm:p-4 bg-orange-50 border border-orange-200 rounded-lg">
                          <div className="flex items-center space-x-2 mb-2">
                            <AlertCircle className="w-3 h-3 sm:w-4 sm:h-4 text-orange-600 flex-shrink-0" />
                            <h3 className="text-xs sm:text-sm font-semibold text-orange-800">
                              Pending Certificates ({pending.length})
                            </h3>
                          </div>
                          <ul className="list-disc list-inside space-y-1">
                            {pending.map((cert) => (
                              <li key={cert.id} className="text-xs sm:text-sm text-orange-700">
                                {cert.label}
                              </li>
                            ))}
                          </ul>
                          <button
                            onClick={() => router.push(`/dashboard/clients/${client.id}/edit`)}
                            className="mt-3 text-xs sm:text-sm text-orange-700 hover:text-orange-800 font-medium underline"
                          >
                            Upload Missing Certificates →
                          </button>
                        </div>
                      );
                    }
                    return null;
                  })()}

                  <button
                    onClick={() =>
                      setExpandedClient(
                        expandedClient === client.id ? null : client.id
                      )
                    }
                    className="text-primary-600 hover:text-primary-700 text-xs sm:text-sm font-medium mt-3 sm:mt-4"
                  >
                    {expandedClient === client.id
                      ? 'Hide Certificates'
                      : `View Certificates (${Object.values(client.certificates || {}).reduce(
                          (acc, certs) => acc + (Array.isArray(certs) ? certs.length : 0),
                          0
                        )})`}
                  </button>

                  {expandedClient === client.id && client.certificates && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="mt-4 sm:mt-6 pt-4 sm:pt-6 border-t border-gray-200"
                    >
                      <h3 className="text-base sm:text-lg font-semibold text-gray-800 mb-3 sm:mb-4">
                        Certificates
                      </h3>
                      <div className="space-y-4 sm:space-y-6">
                        {Object.entries(client.certificates).map(([certType, certs]) => (
                          <div key={certType}>
                            <h4 className="text-xs sm:text-sm font-medium text-gray-700 mb-2 sm:mb-3">
                              {CERTIFICATE_TYPES[certType] || certType}
                            </h4>
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                              {Array.isArray(certs) &&
                                certs.map((cert) => (
                                  <CertificateCard
                                    key={cert.id}
                                    certificate={cert}
                                    certificateType={certType}
                                    onDelete={(certId, certType) =>
                                      handleDeleteCertificate(client.id, certId, certType)
                                    }
                                  />
                                ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}

