import type { Metadata } from 'next';
import './globals.css';
import Sidebar from '@/components/Sidebar';

export const metadata: Metadata = {
    title: 'MeroStock — Inventory & Billing',
    description: 'Production-ready inventory management and billing system',
};

export default function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <html lang="en">
            <body className="antialiased">
                <Sidebar />
                <main className="lg:ml-[260px] min-h-screen">
                    <div className="p-4 lg:p-8 pt-16 lg:pt-8 max-w-7xl mx-auto">
                        {children}
                    </div>
                </main>
            </body>
        </html>
    );
}
