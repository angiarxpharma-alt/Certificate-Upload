'use client';

import { useState, useEffect } from 'react';
import ProtectedRoute from './ProtectedRoute';
import Sidebar from './Sidebar';
import { Menu } from 'lucide-react';

export default function DashboardLayout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      const mobile = window.innerWidth <= 1024;
      setIsMobile(mobile);
      if (!mobile) {
        setSidebarOpen(false);
      }
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  return (
    <ProtectedRoute>
      <div className="flex min-h-screen bg-gray-50">
        <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
        
        {/* Mobile menu button */}
        {isMobile && (
          <button
            onClick={() => setSidebarOpen(true)}
            className="fixed top-4 left-4 z-30 p-2 bg-white rounded-lg shadow-md border border-gray-200 hover:bg-gray-50 transition lg:hidden"
            aria-label="Open menu"
          >
            <Menu className="w-5 h-5 sm:w-6 sm:h-6 text-gray-700" />
          </button>
        )}
        
        <main className={`flex-1 w-full lg:ml-64 transition-all duration-300 ${isMobile ? 'pt-16 pl-16 pr-4 pb-4' : 'p-4 sm:p-6 lg:p-8'}`}>
          <div className="max-w-full mx-auto w-full">
            {children}
          </div>
        </main>
      </div>
    </ProtectedRoute>
  );
}

