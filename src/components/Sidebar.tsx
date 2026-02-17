'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState, useEffect } from 'react';
import {
    LayoutDashboard,
    Package,
    Users,
    FileText,
    CreditCard,
    History,
    Settings,
    Menu,
    X,
    Plus,
    LogOut,
    Building2
} from 'lucide-react';
import { signOut } from '@/lib/actions/auth';
import Image from 'next/image';

const NAV_ITEMS = [
    { name: 'Dashboard', href: '/', icon: LayoutDashboard },
    { name: 'Products', href: '/products', icon: Package },
    { name: 'Customers', href: '/customers', icon: Users },
    { name: 'Invoices', href: '/invoices', icon: FileText },
    { name: 'Payments', href: '/payments', icon: CreditCard },
    { name: 'Stock Movements', href: '/stock', icon: History },
    { name: 'Billing', href: '/billing', icon: Settings },
];

export function Sidebar({
    userEmail,
    organizationName
}: {
    userEmail?: string;
    organizationName?: string;
}) {
    const pathname = usePathname();
    const [isOpen, setIsOpen] = useState(false);

    // Close sidebar on navigation (mobile)
    useEffect(() => {
        setIsOpen(false);
    }, [pathname]);

    return (
        <>
            {/* Mobile Toggle */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="fixed top-4 left-4 z-50 p-2 bg-white rounded-lg shadow-md lg:hidden"
            >
                {isOpen ? <X size={20} /> : <Menu size={20} />}
            </button>

            {/* Backdrop */}
            {isOpen && (
                <div
                    className="fixed inset-0 bg-surface-900/20 backdrop-blur-sm z-40 lg:hidden"
                    onClick={() => setIsOpen(false)}
                />
            )}

            {/* Sidebar Container */}
            <aside
                className={`fixed top-0 left-0 h-screen bg-brand-dark border-r border-brand-border z-40 transition-all duration-300 ease-in-out w-64 lg:translate-x-0 ${isOpen ? 'translate-x-0' : '-translate-x-full'
                    }`}
            >
                <div className="flex flex-col h-full">
                    {/* Brand */}
                    <div className="p-6 border-b border-brand-border bg-brand-background">
                        <Link href="/" className="flex items-center gap-3 group">
                            <div className="w-10 h-10 bg-brand-primary rounded-xl flex items-center justify-center shadow-lg p-1.5 group-hover:scale-105 transition-all duration-300 overflow-hidden">
                                <Image
                                    src="/logo.png"
                                    alt="Logo"
                                    width={40}
                                    height={40}
                                    className="w-full h-full object-contain brightness-0"
                                />
                            </div>
                            <div className="flex flex-col">
                                <span className="font-poppins font-bold text-surface-primary text-lg tracking-tight leading-none group-hover:text-brand-primary transition-colors">StockSewa</span>
                                <span className="text-[10px] text-brand-primary font-bold uppercase tracking-widest mt-1">Premium Partner</span>
                            </div>
                        </Link>
                    </div>

                    {/* Org Info */}
                    <div className="px-4 py-3 border-b border-brand-border bg-brand-teal/20">
                        <div className="flex items-center gap-3 px-3 py-2 rounded-lg bg-brand-card/50 border border-brand-border shadow-sm">
                            <div className="w-8 h-8 rounded-lg bg-brand-primary/10 text-brand-primary flex items-center justify-center">
                                <Building2 size={16} />
                            </div>
                            <div className="flex flex-col min-w-0">
                                <span className="text-xs font-bold text-surface-primary truncate">
                                    {organizationName || 'My Organization'}
                                </span>
                                <span className="text-[10px] text-surface-muted truncate uppercase tracking-tighter">
                                    Active Account
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Quick Action */}
                    <div className="px-4 py-4">
                        <Link
                            href="/invoices/new"
                            className="btn-primary w-full text-sm font-bold active:scale-95"
                        >
                            <Plus size={18} />
                            New Invoice
                        </Link>
                    </div>

                    {/* Navigation */}
                    <nav className="flex-grow overflow-y-auto px-4 py-2 space-y-1 custom-scrollbar">
                        {NAV_ITEMS.map((item) => {
                            const isActive = pathname === item.href;
                            const Icon = item.icon;
                            return (
                                <Link
                                    key={item.name}
                                    href={item.href}
                                    className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 group ${isActive
                                        ? 'bg-brand-primary/10 text-brand-primary font-bold'
                                        : 'text-surface-secondary hover:bg-brand-teal/20 hover:text-surface-primary'
                                        }`}
                                >
                                    <Icon
                                        size={20}
                                        className={isActive ? 'text-brand-primary' : 'text-surface-muted group-hover:text-surface-secondary'}
                                    />
                                    <span className="text-sm">{item.name}</span>
                                </Link>
                            );
                        })}
                    </nav>

                    {/* Bottom Info */}
                    <div className="p-4 border-t border-brand-border bg-brand-background">
                        <div className="flex items-center justify-center gap-2 px-2 py-1">
                            <span className="text-[10px] text-surface-muted truncate tracking-tight font-bold uppercase">
                                Secure Cloud Channel
                            </span>
                        </div>
                    </div>
                </div>
            </aside>
        </>
    );
}
