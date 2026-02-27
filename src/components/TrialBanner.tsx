import React from 'react';
import { Clock, ArrowUpCircle } from 'lucide-react';
import Link from 'next/link';

interface TrialBannerProps {
    daysRemaining: number;
}

export function TrialBanner({ daysRemaining }: TrialBannerProps) {
    if (daysRemaining <= 0) return null;

    return (
        <div className="bg-indigo-600/10 border-b border-indigo-500/20 px-4 py-2 relative overflow-hidden group">
            {/* Subtle flow animation */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-indigo-500/10 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000 ease-in-out" />

            <div className="max-w-7xl mx-auto flex items-center justify-between text-sm">
                <div className="flex items-center gap-3">
                    <div className="flex items-center justify-center w-8 h-8 rounded-full bg-indigo-500/20 text-indigo-400">
                        <Clock className="w-4 h-4" />
                    </div>
                    <p className="text-indigo-100 font-medium">
                        Your free trial expires in
                        <span className="text-white font-bold ml-1">{daysRemaining} {daysRemaining === 1 ? 'day' : 'days'}</span>.
                    </p>
                </div>

                <Link href="/dashboard/settings?tab=billing" className="glass-button glass-button-primary h-8 px-4 text-[10px] font-bold gap-2">
                    <ArrowUpCircle className="w-3 h-3" />
                    UPGRADE NOW
                </Link>
            </div>
        </div>
    );
}
