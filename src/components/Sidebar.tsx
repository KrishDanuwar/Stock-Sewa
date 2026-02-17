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
                className={`fixed top-0 left-0 h-screen bg-white border-r border-surface-200 z-40 transition-all duration-300 ease-in-out w-64 lg:translate-x-0 ${isOpen ? 'translate-x-0' : '-translate-x-full'
                    }`}
            >
                <div className="flex flex-col h-full">
                    {/* Brand */}
                    <div className="p-6 border-b border-surface-100">
                        <Link href="/" className="flex items-center gap-3 group">
                            <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-md p-1.5 border border-surface-100 group-hover:shadow-lg transition-all duration-300 overflow-hidden">
                                <Image
                                    src="/logo.png"
                                    alt="Logo"
                                    width={40}
                                    height={40}
                                    className="w-full h-full object-contain"
                                />
                            </div>
                            <div className="flex flex-col">
                                <span className="font-bold text-surface-900 tracking-tight leading-none group-hover:text-primary-600 transition-colors">MeroStock</span>
                                <span className="text-[10px] text-primary-600 font-bold uppercase tracking-widest mt-1">SaaS Pro</span>
                            </div>
                        </Link>
                    </div>

                    {/* Org Switcher / Info */}
                    <div className="px-4 py-3 border-b border-surface-50 bg-surface-50/50">
                        <div className="flex items-center gap-3 px-3 py-2 rounded-lg bg-white border border-surface-200 shadow-sm">
                            <div className="w-8 h-8 rounded-lg bg-primary-50 text-primary-600 flex items-center justify-center">
                                <Building2 size={16} />
                            </div>
                            <div className="flex flex-col min-w-0">
                                <span className="text-xs font-bold text-surface-900 truncate">
                                    {organizationName || 'My Organization'}
                                </span>
                                <span className="text-[10px] text-surface-500 truncate uppercase tracking-tighter">
                                    Free Plan
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Quick Action */}
                    <div className="px-4 py-4">
                        <Link
                            href="/invoices/new"
                            className="flex items-center justify-center gap-2 w-full py-2.5 bg-primary-600 text-white rounded-xl shadow-md hover:bg-primary-700 transition-colors text-sm font-semibold"
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
                                        ? 'bg-primary-50 text-primary-700 font-semibold'
                                        : 'text-surface-600 hover:bg-surface-50 hover:text-surface-900'
                                        }`}
                                >
                                    <Icon
                                        size={20}
                                        className={isActive ? 'text-primary-600' : 'text-surface-400 group-hover:text-surface-600'}
                                    />
                                    <span className="text-sm">{item.name}</span>
                                </Link>
                            );
                        })}
                    </nav>

                    {/* User Profile & Logout */}
                    <div className="p-4 border-t border-surface-100 bg-surface-50/30">
                        <div className="flex items-center justify-between gap-2 px-2 py-1">
                            <div className="flex flex-col min-w-0">
                                <span className="text-xs font-semibold text-surface-900 truncate">
                                    {userEmail?.split('@')[0] || 'User'}
                                </span>
                                <span className="text-[10px] text-surface-400 truncate tracking-tight">
                                    {userEmail || 'user@example.com'}
                                </span>
                            </div>
                            <button
                                onClick={() => signOut()}
                                className="p-2 text-surface-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                title="Logout"
                            >
                                <LogOut size={18} />
                            </button>
                        </div>
                    </div>
                </div>
            </aside>
        </>
    );
}
