import { Inter } from 'next/font/google';
import './globals.css';
import { Sidebar } from '@/components/Sidebar';
import { getOrgContext } from '@/lib/org-context';
import { Toaster } from 'sonner';

const inter = Inter({ subsets: ['latin'] });

export const metadata = {
    title: 'MeroStock — Modern Inventory & Billing',
    description: 'Precision stock management for modern businesses',
};

export default async function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const ctx = await getOrgContext().catch(() => null);

    return (
        <html lang="en">
            <body className={inter.className}>
                {ctx ? (
                    <div className="flex">
                        <Sidebar userEmail={ctx.userEmail} organizationName={ctx.organizationName} />
                        <main className="flex-grow min-h-screen lg:ml-64 bg-surface-50">
                            {children}
                        </main>
                    </div>
                ) : (
                    <>{children}</>
                )}
                <Toaster position="top-right" richColors />
            </body>
        </html>
    );
}
