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
    Building2
} from 'lucide-react';
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
                className={`fixed top-0 left-0 h-screen bg-white border-r border-brand-border z-40 transition-all duration-300 ease-in-out w-64 lg:translate-x-0 ${isOpen ? 'translate-x-0' : '-translate-x-full'
                    }`}
            >
                <div className="flex flex-col h-full">
                    {/* Brand */}
                    <div className="p-8 border-b border-brand-border">
                        <Link href="/" className="flex items-center gap-4 group">
                            <div className="w-12 h-12 bg-gray-50 rounded-2xl flex items-center justify-center shadow-inner p-1 group-hover:scale-105 transition-all duration-300 relative overflow-hidden ring-1 ring-gray-100">
                                <Image
                                    src="/logo.png"
                                    alt="Stock Sewa Logo"
                                    width={40}
                                    height={40}
                                    className="object-contain"
                                    priority
                                />
                            </div>
                            <div className="flex flex-col">
                                <span className="font-poppins font-black text-surface-primary text-xl tracking-tighter leading-none group-hover:text-brand-primary transition-colors">Stock Sewa</span>
                                <span className="text-[10px] text-brand-primary font-black uppercase tracking-[0.2em] mt-1.5">Enterprise</span>
                            </div>
                        </Link>
                    </div>

                    {/* Org Info */}
                    <div className="px-5 py-5 border-b border-brand-border bg-gray-50/50">
                        <div className="flex items-center gap-3 px-4 py-3 rounded-2xl bg-white border border-brand-border shadow-sm">
                            <div className="w-9 h-9 rounded-xl bg-brand-primary/10 text-brand-primary flex items-center justify-center border border-brand-primary/10">
                                <Building2 size={18} />
                            </div>
                            <div className="flex flex-col min-w-0">
                                <span className="text-xs font-black text-surface-primary truncate">
                                    {organizationName || 'My Organization'}
                                </span>
                                <span className="text-[9px] text-surface-muted truncate uppercase font-bold tracking-wider">
                                    Verified Account
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Quick Action */}
                    <div className="px-5 py-6">
                        <Link
                            href="/invoices/new"
                            className="btn-primary w-full text-[11px] font-black uppercase tracking-widest active:scale-95 shadow-xl shadow-brand-primary/10 py-3.5"
                        >
                            <Plus size={16} strokeWidth={3} />
                            New Invoice
                        </Link>
                    </div>

                    {/* Navigation */}
                    <nav className="flex-grow overflow-y-auto px-4 py-2 space-y-1.5 custom-scrollbar">
                        {NAV_ITEMS.map((item) => {
                            const isActive = pathname === item.href;
                            const Icon = item.icon;
                            return (
                                <Link
                                    key={item.name}
                                    href={item.href}
                                    className={`flex items-center gap-4 px-4 py-3 rounded-2xl transition-all duration-300 group ${isActive
                                        ? 'bg-brand-primary text-white font-black shadow-lg shadow-brand-primary/20'
                                        : 'text-surface-secondary hover:bg-gray-100 hover:text-surface-primary'
                                        }`}
                                >
                                    <Icon
                                        size={20}
                                        strokeWidth={isActive ? 3 : 2}
                                        className={isActive ? 'text-white' : 'text-surface-muted group-hover:text-surface-primary transition-colors'}
                                    />
                                    <span className={`text-xs ${isActive ? 'tracking-wide' : 'font-medium'}`}>{item.name}</span>
                                </Link>
                            );
                        })}
                    </nav>

                    {/* Bottom Info */}
                    <div className="p-6 border-t border-brand-border bg-gray-50">
                        <div className="flex items-center justify-center gap-3">
                            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                            <span className="text-[10px] text-surface-muted font-black uppercase tracking-[0.2em]">
                                System Operational
                            </span>
                        </div>
                    </div>
                </div>
            </aside>
        </>
    );
}
