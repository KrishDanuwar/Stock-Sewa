'use client';

import React, { useState } from 'react';
import { CheckCircle, XCircle, Loader2 } from 'lucide-react';
import { activateSubscription } from '@/lib/actions/subscriptions';
import { toast } from 'sonner';

interface SubscriptionActionButtonsProps {
    orgId: string;
    orgName: string;
    plan: 'monthly' | 'yearly';
    status: string;
}

export function SubscriptionActionButtons({ orgId, orgName, plan, status }: SubscriptionActionButtonsProps) {
    const [loading, setLoading] = useState(false);

    async function handleActivate() {
        if (!confirm(`Activate ${plan} subscription for ${orgName}?`)) return;

        setLoading(true);
        try {
            const result = await activateSubscription(orgId, plan);
            if (result.success) {
                toast.success(`Successfully activated ${plan} for ${orgName}`);
            } else {
                toast.error(result.error || 'Failed to activate');
            }
        } catch (error) {
            toast.error('An error occurred during activation');
            console.error(error);
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="flex items-center gap-2">
            <button
                onClick={handleActivate}
                disabled={loading || status === 'active'}
                className={`glass-button glass-button-primary h-8 px-3 text-[10px] font-bold ${loading ? 'opacity-50' : ''}`}
            >
                {loading ? (
                    <Loader2 className="w-3 h-3 animate-spin" />
                ) : (
                    <>
                        <CheckCircle className="w-3 h-3 mr-1" />
                        ACTIVATE
                    </>
                )}
            </button>
            <button
                disabled={loading}
                className="glass-button h-8 px-3 text-[10px] font-bold text-red-400 border-red-500/20 hover:bg-red-500/10"
            >
                <XCircle className="w-3 h-3 mr-1" />
                REJECT
            </button>
        </div>
    );
}
