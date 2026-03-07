'use client';

import React from 'react';

interface LogoProps {
    className?: string;
    showText?: boolean;
    showIcon?: boolean;
    showTagline?: boolean;
    size?: 'sm' | 'md' | 'lg' | 'xl';
    text?: string;
    tagline?: string;
    useImageLogo?: boolean;
}

export default function Logo({
    className = '',
    showText = true,
    showIcon = true,
    showTagline = true,
    size = 'md',
    text = 'Stocksewa',
    tagline = 'Inventory Management & POS',
    useImageLogo = false
}: LogoProps) {
    const sizes = {
        sm: { icon: 24, font: '0.875rem', sub: '0.625rem', gap: 8 },
        md: { icon: 32, font: '1.125rem', sub: '0.6875rem', gap: 10 },
        lg: { icon: 44, font: '1.5rem', sub: '0.75rem', gap: 14 },
        xl: { icon: 56, font: '1.875rem', sub: '0.875rem', gap: 16 },
    };

    const currentSize = sizes[size];

    return (
        <div className={`flex items-center ${className}`} style={{ gap: (showIcon && showText) ? currentSize.gap : 0 }}>
            {/* Logo Image or SVG Icon */}
            {showIcon && (
                useImageLogo ? (
                    <div style={{
                        position: 'relative',
                        width: currentSize.icon,
                        height: currentSize.icon,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        borderRadius: size === 'xl' ? 20 : 12,
                        background: 'var(--logo-plate-bg)',
                        border: '1px solid var(--logo-plate-border)',
                        boxShadow: '0 10px 25px -5px rgba(79, 142, 247, 0.2), inset 0 0 10px rgba(79, 142, 247, 0.05)',
                        padding: size === 'sm' ? 2 : 3,
                        flexShrink: 0,
                    }}>
                        <div style={{ position: 'absolute', inset: -3, background: 'var(--brand-primary)', opacity: 0.12, filter: 'blur(10px)', borderRadius: size === 'xl' ? 24 : 14, zIndex: -1 }}></div>
                        <img src="/images/removedbg{logo}.png" alt="Logo" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: size === 'xl' ? 17 : 9 }} />
                    </div>
                ) : (
                    <svg
                        width={currentSize.icon}
                        height={currentSize.icon}
                        viewBox="0 0 40 40"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                        className="flex-shrink-0"
                    >
                        <rect width="40" height="40" rx="10" fill="url(#logo-gradient)" fillOpacity="0.1" />
                        <path
                            d="M12 10C10.8954 10 10 10.8954 10 12V20C10 21.1046 10.8954 22 12 22H20C21.1046 22 22 21.1046 22 20V12C22 10.8954 21.1046 10 20 10H12Z"
                            fill="url(#logo-gradient)"
                        />
                        <path
                            d="M18 18C16.8954 18 16 18.8954 16 20V28C16 29.1046 16.8954 30 18 30H26C27.1046 30 28 29.1046 28 28V20C28 18.8954 27.1046 18 26 18H18Z"
                            fill="url(#logo-gradient)"
                            fillOpacity="0.8"
                        />
                        <circle cx="28" cy="12" r="3" fill="#10b981" />
                        <defs>
                            <linearGradient id="logo-gradient" x1="10" y1="10" x2="28" y2="30" gradientUnits="userSpaceOnUse">
                                <stop stopColor="#41d886" />
                                <stop offset="1" stopColor="#10b981" />
                            </linearGradient>
                        </defs>
                    </svg>
                )
            )}

            {showText && (
                <div className="flex flex-col leading-tight">
                    <span
                        translate="no"
                        style={{
                            fontSize: currentSize.font,
                            fontWeight: 700,
                            color: 'var(--text-primary)',
                            letterSpacing: '-0.01em',
                        }}
                    >
                        {text}
                    </span>
                    {showTagline && (
                        <span
                            style={{
                                fontSize: currentSize.sub,
                                fontWeight: 500,
                                color: 'var(--text-secondary)',
                                textTransform: 'uppercase',
                                letterSpacing: '0.05em',
                                opacity: 0.9
                            }}
                        >
                            {tagline}
                        </span>
                    )}
                </div>
            )}
        </div>
    );
}
