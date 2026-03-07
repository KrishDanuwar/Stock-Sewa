import { SignOutButton } from '@clerk/nextjs';
import { getOrgContext } from '@/lib/org-context';
import SidebarNav from './SidebarNav';
import { LogOut } from 'lucide-react';

export default async function Sidebar() {
    const { organizationId } = await getOrgContext();

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
            <div style={{ padding: '28px 24px', borderBottom: '1px solid var(--glass-border)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div style={{
                        position: 'relative', width: 42, height: 42, display: 'flex', alignItems: 'center', justifyContent: 'center',
                        background: 'linear-gradient(135deg, #fff 0%, #f0f7ff 100%)',
                        borderRadius: 12, border: '1px solid rgba(79, 142, 247, 0.3)',
                        boxShadow: '0 8px 20px -6px rgba(79, 142, 247, 0.3), inset 0 0 12px rgba(79, 142, 247, 0.05)',
                        padding: 3, flexShrink: 0
                    }}>
                        <div style={{ position: 'absolute', inset: -2, background: 'var(--brand-primary)', opacity: 0.15, filter: 'blur(8px)', borderRadius: 14, zIndex: -1 }}></div>
                        <img src="/images/removedbg{logo}.png" alt="Stock Sewa" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: 9 }} />
                    </div>
                    <span style={{
                        fontSize: '1.125rem', fontWeight: 700,
                        color: 'var(--text-primary)', letterSpacing: '-0.01em'
                    }}>Stock Sewa</span>
                </div>
            </div>

            {/* Navigation */}
            <SidebarNav />

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
