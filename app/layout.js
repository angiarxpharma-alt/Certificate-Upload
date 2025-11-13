import { Inter } from 'next/font/google';
import './globals.css';
import { AuthContextProvider } from '@/contexts/AuthContext';
import { Toaster } from 'react-hot-toast';

const inter = Inter({ subsets: ['latin'] });

export const metadata = {
  title: 'Pharma Certificate Manager',
  description: 'Manage client certificates for pharma manufacturing',
  icons: {
    icon: '/1.png',
    shortcut: '/1.png',
    apple: '/1.png',
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <AuthContextProvider>
          {children}
          <Toaster position="top-right" />
        </AuthContextProvider>
      </body>
    </html>
  );
}

