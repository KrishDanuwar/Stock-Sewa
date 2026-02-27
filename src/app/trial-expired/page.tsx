import React from 'react';
import { getOrgContext } from '@/lib/org-context';
import TrialExpiredClient from './TrialExpiredClient';

export default async function TrialExpiredPage() {
    const org = await getOrgContext();

    return (
        <div className="min-h-screen bg-neutral-950 text-white flex flex-col items-center justify-center p-6 selection:bg-brand-primary/30">
            {/* Background Glows */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-brand-primary/10 blur-[150px] rounded-full" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-brand-secondary/10 blur-[150px] rounded-full" />
                <div className="absolute top-[30%] left-[60%] w-[30%] h-[30%] bg-brand-accent/5 blur-[120px] rounded-full" />
            </div>

            <TrialExpiredClient email={org.email} />
        </div>
    );
}
