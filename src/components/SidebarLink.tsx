'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ElementType } from 'react';

export default function SidebarLink({
    href,
    icon: Icon,
    label
}: {
    href: string;
    icon: ElementType;
    label: string;
}) {
    const pathname = usePathname();
    const isActive = pathname === href || pathname.startsWith(`${href}/`);

    return (
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
        </Link>
    );
}
