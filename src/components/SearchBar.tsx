'use client';

import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { useCallback, useState, useEffect } from 'react';

interface SearchBarProps {
    placeholder?: string;
}

export default function SearchBar({ placeholder = 'Search...' }: SearchBarProps) {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const [value, setValue] = useState(searchParams.get('search') || '');

    useEffect(() => {
        setValue(searchParams.get('search') || '');
    }, [searchParams]);

    const updateSearch = useCallback(
        (term: string) => {
            const params = new URLSearchParams(searchParams.toString());
            if (term) {
                params.set('search', term);
            } else {
                params.delete('search');
            }
            router.push(`${pathname}?${params.toString()}`);
        },
        [pathname, router, searchParams]
    );

    useEffect(() => {
        const timer = setTimeout(() => {
            updateSearch(value);
        }, 300);

        return () => clearTimeout(timer);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [value]);

    return (
        <div className="relative group">
            <svg
                className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-muted group-focus-within:text-brand-primary transition-colors"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
            >
                <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2.5}
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
            </svg>
            <input
                type="text"
                value={value}
                onChange={(e) => setValue(e.target.value)}
                placeholder={placeholder}
                className="input-field pl-11 py-2.5 bg-white border-brand-border text-surface-primary focus:border-brand-primary/50 transition-all font-medium shadow-sm"
            />
        </div>
    );
}
