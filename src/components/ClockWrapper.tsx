'use client';

import dynamic from 'next/dynamic';

const LiveClock = dynamic(() => import('./LiveClock'), {
    ssr: false
});

export default function ClockWrapper({ fallbackDate }: { fallbackDate: string }) {
    return <LiveClock fallbackDate={fallbackDate} />;
}
