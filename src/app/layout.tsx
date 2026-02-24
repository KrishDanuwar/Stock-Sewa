// Deployment trigger: Reverting to df3a006
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { Toaster } from 'sonner';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Stock Sewa – Inventory & POS for Nepal',
  description: 'Multi-tenant inventory management and point-of-sale system designed for Nepali shopkeepers.',
};

import { ThemeProvider } from '@/components/ThemeProvider';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <ThemeProvider>
          {children}
          <Toaster
            position="top-right"
            toastOptions={{
              style: {
                background: 'rgba(15, 22, 41, 0.95)',
                border: '1px solid rgba(255,255,255,0.12)',
                color: '#f1f5f9',
                backdropFilter: 'blur(20px)',
              },
            }}
          />
        </ThemeProvider>
      </body>
    </html>
  );
}
