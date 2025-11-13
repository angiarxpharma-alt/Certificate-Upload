'use client';

import { useEffect, useState } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Users, FileText, Calendar, AlertCircle, ArrowRight } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';

const CERTIFICATE_TYPES = {
  drugLicense: 'Drug License Certificate',
  gst: 'GST Certificate',
  agreement: 'Agreement Certificate',
  other: 'Other Document',
};

// Main certificates to track (excluding 'other')
const MAIN_CERTIFICATE_TYPES = ['drugLicense', 'gst', 'agreement'];

export default function Dashboard() {
  const router = useRouter();
  const [stats, setStats] = useState({
    totalClients: 0,
    totalCertificates: 0,
    totalPendingCertificates: 0,
    clientsWithPending: 0,
  });
  const [pendingClients, setPendingClients] = useState([]);
  const [loading, setLoading] = useState(true);

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
    const fetchStats = async () => {
      try {
        const clientsSnapshot = await getDocs(collection(db, 'clients'));
        let totalCerts = 0;
        let totalPending = 0;
        let clientsWithPendingCount = 0;
        const pendingClientsList = [];
        const clientsData = [];

        clientsSnapshot.forEach((doc) => {
          const client = { id: doc.id, ...doc.data() };
          clientsData.push(client);

          // Count total certificates
          if (client.certificates) {
            Object.values(client.certificates).forEach((certs) => {
              if (Array.isArray(certs)) {
                totalCerts += certs.length;
              }
            });
          }

          // Count pending certificates
          const pending = getPendingCertificates(client);
          if (pending.length > 0) {
            totalPending += pending.length;
            clientsWithPendingCount++;
            pendingClientsList.push({
              id: client.id,
              name: client.clientName,
              pending: pending,
              pendingCount: pending.length,
            });
          }
        });

        setStats({
          totalClients: clientsData.length,
          totalCertificates: totalCerts,
          totalPendingCertificates: totalPending,
          clientsWithPending: clientsWithPendingCount,
        });
        setPendingClients(pendingClientsList);
      } catch (error) {
        console.error('Error fetching stats:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  const statCards = [
    {
      title: 'Total Clients',
      value: stats.totalClients,
      icon: Users,
      color: 'bg-blue-500',
    },
    {
      title: 'Total Certificates',
      value: stats.totalCertificates,
      icon: FileText,
      color: 'bg-green-500',
    },
    {
      title: 'Pending Certificates',
      value: stats.totalPendingCertificates,
      icon: AlertCircle,
      color: 'bg-orange-500',
      subtitle: `${stats.clientsWithPending} client(s) with pending`,
    },
    {
      title: 'Clients with Pending',
      value: stats.clientsWithPending,
      icon: Users,
      color: 'bg-red-500',
    },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="w-full">
      <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-6 sm:mb-8 ml-0 sm:ml-0">Dashboard</h1>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-6 sm:mb-8">
        {statCards.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <motion.div
              key={stat.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-white rounded-lg shadow-md p-4 sm:p-6 border border-gray-200"
            >
              <div className="flex items-center justify-between">
                <div className="flex-1 min-w-0">
                  <p className="text-gray-600 text-xs sm:text-sm font-medium mb-1 truncate">{stat.title}</p>
                  <p className="text-2xl sm:text-3xl font-bold text-gray-800">{stat.value}</p>
                  {stat.subtitle && (
                    <p className="text-xs text-gray-500 mt-1 line-clamp-1">{stat.subtitle}</p>
                  )}
                </div>
                <div className={`${stat.color} p-3 sm:p-4 rounded-lg flex-shrink-0 ml-2`}>
                  <Icon className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Pending Certificates Section */}
      {pendingClients.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white rounded-lg shadow-md p-4 sm:p-6 border border-gray-200"
        >
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 sm:mb-6 gap-3">
            <div className="flex items-center space-x-2">
              <AlertCircle className="w-4 h-4 sm:w-5 sm:h-5 text-orange-600 flex-shrink-0" />
              <h2 className="text-lg sm:text-xl font-bold text-gray-800">
                Clients with Pending Certificates
              </h2>
            </div>
            <button
              onClick={() => router.push('/dashboard/clients')}
              className="text-primary-600 hover:text-primary-700 text-sm font-medium flex items-center space-x-1 self-start sm:self-auto"
            >
              <span>View All</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          <div className="space-y-3 sm:space-y-4">
            {pendingClients.map((client) => (
              <div
                key={client.id}
                className="p-3 sm:p-4 bg-orange-50 border border-orange-200 rounded-lg hover:bg-orange-100 transition cursor-pointer"
                onClick={() => router.push(`/dashboard/clients/${client.id}/edit`)}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-gray-800 mb-2 text-sm sm:text-base truncate">{client.name}</h3>
                    <div className="flex items-center space-x-2 mb-2 flex-wrap">
                      <span className="bg-orange-200 text-orange-800 px-2 py-1 rounded-full text-xs font-medium">
                        {client.pendingCount} Pending
                      </span>
                    </div>
                    <ul className="list-disc list-inside space-y-1">
                      {client.pending.map((cert) => (
                        <li key={cert.id} className="text-xs sm:text-sm text-orange-700">
                          {cert.label}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 text-orange-600 flex-shrink-0 mt-1" />
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {pendingClients.length === 0 && !loading && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white rounded-lg shadow-md p-4 sm:p-6 border border-gray-200"
        >
          <div className="text-center py-6 sm:py-8">
            <div className="bg-green-100 w-12 h-12 sm:w-16 sm:h-16 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4">
              <FileText className="w-6 h-6 sm:w-8 sm:h-8 text-green-600" />
            </div>
            <h3 className="text-base sm:text-lg font-semibold text-gray-800 mb-2">
              All Certificates Up to Date!
            </h3>
            <p className="text-gray-600 text-xs sm:text-sm px-4">
              No pending certificates found. All clients have their required certificates uploaded.
            </p>
          </div>
        </motion.div>
      )}
    </div>
  );
}

