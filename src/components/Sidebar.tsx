import { SignOutButton } from '@clerk/nextjs';
import { getOrgContext } from '@/lib/org-context';
import { createAdminClient } from '@/lib/supabase/server';
import Link from 'next/link';
import {
    LayoutDashboard,
    Package,
    Users,
    FileText,
    ShoppingCart,
    BarChart2,
    LogOut,
    Settings,
} from 'lucide-react';

const navItems = [
    { href: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { href: '/dashboard/products', icon: Package, label: 'Products' },
    { href: '/dashboard/customers', icon: Users, label: 'Customers' },
    { href: '/dashboard/pos', icon: ShoppingCart, label: 'POS' },
    { href: '/dashboard/invoices', icon: FileText, label: 'Bills' },
    { href: '/dashboard/reports', icon: BarChart2, label: 'Reports' },
    { href: '/dashboard/settings', icon: Settings, label: 'Settings' },
];

export default async function Sidebar() {
    const { organizationName, organizationId } = await getOrgContext();
    const supabase = await createAdminClient();

    // Fetch logo
    const { data: org } = await supabase
        .from('organizations')
        .select('logo_url')
        .eq('id', organizationId)
        .single();

    return (
        <aside
            className="glass-sidebar"
            style={{
                width: 'var(--sidebar-width)',
                position: 'fixed',
                top: 0,
                left: 0,
                height: '100vh',
                display: 'flex',
                flexDirection: 'column',
                zIndex: 50,
            }}
        >
            {/* Brand */}
            <div style={{ padding: '28px 20px', borderBottom: '1px solid var(--glass-border)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                    <div style={{
                        width: 44,
                        height: 44,
                        borderRadius: 12,
                        background: 'white',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0,
                        overflow: 'hidden',
                        padding: org?.logo_url ? 0 : 6,
                        boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                        border: '1px solid var(--glass-border)'
                    }}>
                        {org?.logo_url ? (
                            <img src={org.logo_url} alt="Logo" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        ) : (
                            <img src="/logo.jpg" alt="Logo" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                        )}
                    </div>
                    <div>
                        <div translate="no" style={{
                            fontSize: '1.125rem',
                            fontWeight: 800,
                            color: 'var(--text-primary)',
                            lineHeight: 1.2
                        }}>
                            {org?.logo_url ? organizationName : 'Stock Sewa'}
                        </div>
                        {org?.logo_url && (
                            <div style={{
                                fontSize: '0.6875rem',
                                color: 'var(--text-secondary)',
                                fontWeight: 600,
                                textTransform: 'uppercase',
                                letterSpacing: '0.05em',
                                opacity: 0.7
                            }}>
                                Powered by Stock Sewa
                            </div>
                        )}
                        {!org?.logo_url && (
                            <div style={{ fontSize: '0.6875rem', color: 'var(--text-secondary)' }}>
                                {organizationName}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Navigation */}
            <nav style={{ flex: 1, padding: '16px 12px', overflowY: 'auto' }}>
                <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 4 }}>
                    {navItems.map(({ href, icon: Icon, label }) => (
                        <li key={href}>
                            <Link
                                href={href}
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 12,
                                    padding: '10px 12px',
                                    borderRadius: 10,
                                    color: 'var(--text-secondary)',
                                    textDecoration: 'none',
                                    fontSize: '0.875rem',
                                    fontWeight: 500,
                                    transition: 'all 0.2s ease',
                                }}
                                className="nav-link"
                            >
                                <Icon size={18} />
                                <span>{label}</span>
                            </Link>
                        </li>
                    ))}
                </ul>
            </nav>

            {/* Sign Out */}
            <div style={{ padding: '16px 12px', borderTop: '1px solid var(--glass-border)' }}>
                <SignOutButton>
                    <button
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 12,
                            width: '100%',
                            padding: '10px 12px',
                            borderRadius: 10,
                            background: 'transparent',
                            border: 'none',
                            color: 'var(--text-secondary)',
                            cursor: 'pointer',
                            fontSize: '0.875rem',
                            fontWeight: 500,
                            transition: 'all 0.2s ease',
                        }}
                    >
                        <LogOut size={18} />
                        Sign Out
                    </button>
                </SignOutButton>
            </div>
        </aside>
    );
}
