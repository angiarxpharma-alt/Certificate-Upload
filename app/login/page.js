'use client';

import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import Image from 'next/image';

// Fixed Admin Credentials
const ADMIN_EMAIL = 'admin@angia.com';
const ADMIN_PASSWORD = 'Angia@2024';

export default function LoginPage() {
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    
    const success = await login(ADMIN_EMAIL, ADMIN_PASSWORD);
    if (success) {
      router.push('/dashboard');
    }
    
    setIsLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 to-primary-100 p-4 sm:p-6 lg:p-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="bg-white p-6 sm:p-8 rounded-lg shadow-xl w-full max-w-md"
      >
        <div className="text-center mb-6 sm:mb-8">
          <div className="mb-4 flex justify-center">
            <div className="relative w-20 h-20 sm:w-24 sm:h-24 md:w-28 md:h-28">
              <Image
                src="/1.png"
                alt="Logo"
                fill
                className="object-contain"
                priority
                sizes="(max-width: 640px) 80px, (max-width: 768px) 96px, 112px"
              />
            </div>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-primary-700 mb-2">
            Pharma Certificate Manager
          </h1>
          <p className="text-sm sm:text-base text-gray-600">Admin Login</p>
          <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg text-left">
            <p className="text-xs text-blue-700 font-medium mb-1">Admin Credentials:</p>
            <p className="text-xs text-blue-600 break-all">Email: <span className="font-mono">{ADMIN_EMAIL}</span></p>
            <p className="text-xs text-blue-600">Password: <span className="font-mono">••••••••</span></p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
              Email
            </label>
            <input
              id="email"
              type="email"
              value={ADMIN_EMAIL}
              readOnly
              className="w-full px-3 sm:px-4 py-2 text-sm sm:text-base border border-gray-300 rounded-lg bg-gray-50 cursor-not-allowed outline-none"
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
              Password
            </label>
            <input
              id="password"
              type="password"
              value={ADMIN_PASSWORD}
              readOnly
              className="w-full px-3 sm:px-4 py-2 text-sm sm:text-base border border-gray-300 rounded-lg bg-gray-50 cursor-not-allowed outline-none"
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-primary-600 text-white py-2.5 sm:py-3 px-4 rounded-lg font-medium hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition text-sm sm:text-base"
          >
            {isLoading ? 'Logging in...' : 'Login'}
          </button>
        </form>
      </motion.div>
    </div>
  );
}

