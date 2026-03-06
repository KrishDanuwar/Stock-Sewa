// Deployment trigger: Reverting to df3a006
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { Toaster } from 'sonner';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Stock Sewa – Inventory & POS for Nepal',
  description: 'Multi-tenant inventory management and point-of-sale system designed for Nepali shopkeepers.',
  manifest: '/manifest.json',
};

import { ClerkProvider, ClerkLoaded, ClerkLoading } from '@clerk/nextjs';
import { ThemeProvider } from '@/components/ThemeProvider';

const CLERK_PUBLISHABLE_KEY = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY || 'pk_test_aG9wZWZ1bC1zdGFsbGlvbi05OC5jbGVyay5hY2NvdW50cy5kZXYk';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <ClerkProvider publishableKey={CLERK_PUBLISHABLE_KEY}>
      <html lang="en">
        <body className={inter.className}>
          <ThemeProvider>
            <ClerkLoading>
              <div className="fixed inset-0 flex items-center justify-center" style={{ background: 'var(--bg-base)' }}>
                <div className="w-12 h-12 border-4 border-[var(--glass-border)] border-t-[var(--brand-primary)] rounded-full animate-spin"></div>
              </div>
            </ClerkLoading>
            <ClerkLoaded>
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
              <script
                dangerouslySetInnerHTML={{
                  __html: `
                    if ('serviceWorker' in navigator) {
                      window.addEventListener('load', function() {
                        navigator.serviceWorker.register('/sw.js').then(function(registration) {
                          console.log('SW registered');
                        }, function(err) {
                          console.log('SW registration failed: ', err);
                        });
                      });
                    }
                  `,
                }}
              />
            </ClerkLoaded>
          </ThemeProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}
