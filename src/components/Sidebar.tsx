import { SignOutButton } from '@clerk/nextjs';
import { getOrgContext } from '@/lib/org-context';
import SidebarNav from './SidebarNav';
import Logo from './Logo';
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
                <Logo size="md" useImageLogo={true} text="Stock Sewa" showTagline={false} />
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
