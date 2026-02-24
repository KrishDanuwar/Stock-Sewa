import { signOut } from '@/lib/actions/auth';
import { getOrgContext } from '@/lib/org-context';
import { createClient } from '@/lib/supabase/server';
import Link from 'next/link';
import {
    LayoutDashboard,
    Package,
    Users,
    FileText,
    ShoppingCart,
    BarChart2,
    LogOut,
    Package2,
    Settings,
} from 'lucide-react';

const navItems = [
    { href: '/dashboard', icon: LayoutDashboard, label: 'Dashboard', labelNp: 'ड्यासबोर्ड' },
    { href: '/dashboard/products', icon: Package, label: 'Products', labelNp: 'उत्पादन' },
    { href: '/dashboard/customers', icon: Users, label: 'Customers', labelNp: 'ग्राहक' },
    { href: '/dashboard/pos', icon: ShoppingCart, label: 'POS', labelNp: 'बिक्री' },
    { href: '/dashboard/invoices', icon: FileText, label: 'Invoices', labelNp: 'बीजक' },
    { href: '/dashboard/reports', icon: BarChart2, label: 'Reports', labelNp: 'रिपोर्ट' },
    { href: '/dashboard/settings', icon: Settings, label: 'Settings', labelNp: 'सेटिङ' },
];

export default async function Sidebar() {
    const { organizationName, organizationId, language } = await getOrgContext();
    const supabase = await createClient();

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
            <div style={{ padding: '24px 20px', borderBottom: '1px solid var(--glass-border)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div style={{ width: 36, height: 36, borderRadius: 10, background: 'linear-gradient(135deg, var(--brand-primary), var(--brand-secondary))', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, overflow: 'hidden' }}>
                        {org?.logo_url ? (
                            <img src={org.logo_url} alt="Logo" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        ) : (
                            <Package2 size={18} color="white" />
                        )}
                    </div>
                    <div>
                        <div style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)' }}>Stock Sewa</div>
                        <div style={{ fontSize: '0.6875rem', color: 'var(--text-secondary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 150 }}>
                            {organizationName}
                        </div>
                    </div>
                </div>
            </div>

            {/* Navigation */}
            <nav style={{ flex: 1, padding: '16px 12px', overflowY: 'auto' }}>
                <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 4 }}>
                    {navItems.map(({ href, icon: Icon, label, labelNp }) => (
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
                                <span>{language === 'np' ? labelNp : label}</span>
                                {language === 'np' && (
                                    <span style={{ marginLeft: 'auto', fontSize: '0.625rem', color: 'var(--text-muted)' }}>{label}</span>
                                )}
                            </Link>
                        </li>
                    ))}
                </ul>
            </nav>

            {/* Sign Out */}
            <div style={{ padding: '16px 12px', borderTop: '1px solid var(--glass-border)' }}>
                <form action={signOut}>
                    <button
                        type="submit"
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
                        {language === 'np' ? 'बाहिर निस्कनुहोस् (Sign Out)' : 'Sign Out'}
                    </button>
                </form>
            </div>
        </aside>
    );
}
