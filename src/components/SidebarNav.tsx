'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useUser } from '@clerk/nextjs';
import { useState, useEffect } from 'react';
import {
    LayoutDashboard,
    Package,
    Users,
    FileText,
    ShoppingCart,
    BarChart2,
    Truck,
    Settings,
    ShieldCheck,
    Lock,
} from 'lucide-react';
import { isAuthorizedAdmin } from '@/lib/actions/admin-management';

export default function SidebarNav() {
    const pathname = usePathname();
    const { user } = useUser();

    const [isAdmin, setIsAdmin] = useState(false);

    const userEmail = user?.emailAddresses[0]?.emailAddress || '';

    // Check admin status on load
    useEffect(() => {
        async function check() {
            if (userEmail === process.env.NEXT_PUBLIC_SYSTEM_OWNER_EMAIL) {
                setIsAdmin(true);
                return;
            }
            const status = await isAuthorizedAdmin();
            setIsAdmin(status);
        }
        if (userEmail) check();
    }, [userEmail]);

    const navItems = [
        { href: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
        { href: '/dashboard/products', icon: Package, label: 'Products' },
        { href: '/dashboard/customers', icon: Users, label: 'Customers' },
        { href: '/dashboard/pos', icon: ShoppingCart, label: 'POS' },
        { href: '/dashboard/invoices', icon: FileText, label: 'Bills' },
        { href: '/dashboard/reports', icon: BarChart2, label: 'Reports' },
        { href: '/dashboard/suppliers', icon: Truck, label: 'Suppliers' },
        { href: '/dashboard/settings', icon: Settings, label: 'Settings' },
    ];

    // Admin Section
    if (isAdmin) {
        navItems.push({
            href: '/admin',
            icon: ShieldCheck,
            label: 'System Control'
        });
    }

    return (
        <nav style={{ flex: 1, padding: '16px 12px', overflowY: 'auto' }}>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 4 }}>
                {navItems.map(({ href, icon: Icon, label }) => {
                    const isActive = pathname === href || pathname.startsWith(`${href}/`);

                    return (
                        <li key={href}>
                            <Link
                                href={href}
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 12,
                                    padding: '10px 12px',
                                    borderRadius: 10,
                                    color: isActive ? 'var(--text-primary)' : 'var(--text-secondary)',
                                    textDecoration: 'none',
                                    fontSize: '0.875rem',
                                    fontWeight: isActive ? 600 : 500,
                                    background: isActive ? 'rgba(255, 255, 255, 0.08)' : 'transparent',
                                    border: isActive ? '1px solid var(--glass-border)' : '1px solid transparent',
                                    boxShadow: isActive ? '0 4px 12px rgba(0, 0, 0, 0.05)' : 'none',
                                    transition: 'all 0.2s ease',
                                }}
                                className="nav-link"
                            >
                                <Icon size={18} color={isActive ? 'var(--brand-primary)' : 'currentColor'} />
                                <span>{label}</span>
                                {label === 'Subscriptions' && (
                                    <div className="ml-auto flex h-2 w-2 rounded-full bg-brand-primary animate-pulse shadow-[0_0_8px_var(--brand-primary)]" />
                                )}
                            </Link>
                        </li>
                    );
                })}
            </ul>
        </nav>
    );
}
