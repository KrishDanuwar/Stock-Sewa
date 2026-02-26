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

import { ClerkProvider } from '@clerk/nextjs';
import { ThemeProvider } from '@/components/ThemeProvider';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <ClerkProvider publishableKey={process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY}>
      <html lang="en">
        <body className={inter.className}>
          <ThemeProvider>
            {children}
            <Toaster
              position="top-right"
              toastOptions={{
                style: {
                  background: 'var(--bg-secondary)',
                  border: '1px solid var(--glass-border)',
                  color: 'var(--text-primary)',
                  backdropFilter: 'var(--glass-blur)',
                },
              }}
            />
          </ThemeProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}
