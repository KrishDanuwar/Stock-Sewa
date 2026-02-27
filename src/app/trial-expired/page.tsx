import React from 'react';
import { getOrgContext } from '@/lib/org-context';
import TrialExpiredClient from './TrialExpiredClient';

export default async function TrialExpiredPage() {
    const org = await getOrgContext();

    return (
        <div className="min-h-screen flex flex-col items-center justify-center p-6 selection:bg-brand-primary/30">
            {/* Background Glows (Subtle, complementary to global background) */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-[-5%] left-[-5%] w-[40%] h-[40%] bg-brand-primary/10 blur-[120px] rounded-full" />
                <div className="absolute bottom-[-5%] right-[-5%] w-[40%] h-[40%] bg-brand-secondary/10 blur-[120px] rounded-full" />
            </div>

            <TrialExpiredClient email={org.email} />
        </div>
    );
}
