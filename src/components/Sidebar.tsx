import { SignOutButton } from '@clerk/nextjs';
import { getOrgContext } from '@/lib/org-context';
import SidebarNav from './SidebarNav';
import { LogOut } from 'lucide-react';
import Logo from './Logo';

export default async function Sidebar() {
    const { organizationName, organizationId, logoUrl } = await getOrgContext();

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
            <div style={{ padding: '32px 24px', borderBottom: '1px solid var(--glass-border)' }}>
                {logoUrl ? (
                    <>
                        <div style={{ width: 44, height: 44, borderRadius: 10, background: 'white', overflow: 'hidden', flexShrink: 0, border: '1px solid var(--glass-border)', padding: 2, marginBottom: 16 }}>
                            <img src={logoUrl} alt="Logo" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                        </div>
                        <div style={{
                            fontSize: '0.75rem',
                            fontWeight: 600,
                            color: 'var(--text-muted)',
                            paddingLeft: 2,
                            display: 'flex',
                            alignItems: 'center',
                            gap: 6
                        }}>
                            <span style={{ width: 6, height: 6, borderRadius: '50%', backgroundColor: 'var(--brand-success)' }}></span>
                            {organizationName}
                        </div>
                    </>
                ) : (
                    <>
                        <Logo size="lg" text={organizationName} useImageLogo={true} tagline="Stock Sewa" />
                    </>
                )}
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
