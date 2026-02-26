'use client';

import { useState, useEffect } from 'react';
import { Clock } from 'lucide-react';

export default function LiveClock({ fallbackDate }: { fallbackDate: string }) {
    const [time, setTime] = useState<string>('');
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
        const updateTick = () => {
            const now = new Date();
            setTime(now.toLocaleTimeString(undefined, {
                hour: 'numeric',
                minute: '2-digit',
                second: '2-digit',
                hour12: true
            }));
        };
        updateTick();
        const interval = setInterval(updateTick, 1000);
        return () => clearInterval(interval);
    }, []);

    return (
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
            <span>{fallbackDate}</span>
            {mounted && time && (
                <>
                    <span style={{ opacity: 0.3 }}>|</span>
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontVariantNumeric: 'tabular-nums', color: 'var(--brand-primary)' }}>
                        <Clock size={14} />
                        {time}
                    </span>
                </>
            )}
        </span>
    );
}
