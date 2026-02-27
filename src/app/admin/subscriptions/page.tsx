import React from 'react';
import { createAdminClient } from '@/lib/supabase/server';
import { ShieldCheck } from 'lucide-react';
import { redirect } from 'next/navigation';
import { auth, currentUser } from '@clerk/nextjs/server';
import { SubscriptionActionButtons } from '@/components/SubscriptionActionButtons';

export default async function AdminSubscriptionsPage() {
    const { userId } = await auth();
    const user = await currentUser();

    // Protection: Only junsangsingh@gmail.com can access this
    const ADMIN_EMAILS = ['junsangsingh@gmail.com'];

    const userEmail = user?.emailAddresses[0]?.emailAddress || '';
    if (!user || !ADMIN_EMAILS.includes(userEmail)) {
        console.warn(`Unauthorized admin access attempt by: ${userEmail}`);
        redirect('/dashboard');
    }

    const supabase = await createAdminClient();

    const { data: organizations, error } = await supabase
        .from('organizations')
        .select('*')
        .order('created_at', { ascending: false });

    if (error) {
        return <div className="p-10 text-red-500">Error loading subscriptions: {error.message}</div>;
    }

    return (
        <div className="min-h-screen bg-neutral-950 text-white p-8">
            <header className="max-w-7xl mx-auto mb-10 border-b border-neutral-800 pb-8 flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold flex items-center gap-3">
                        <ShieldCheck className="text-indigo-400" />
                        Subscription Control Center
                    </h1>
                    <p className="text-neutral-400 mt-1">Manage manual payment verifications and plan activations.</p>
                </div>
                <div className="flex items-center gap-4">
                    <div className="px-4 py-2 rounded-lg bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-sm font-medium">
                        Admin: {userEmail}
                    </div>
                </div>
            </header>

            <main className="max-w-7xl mx-auto">
                <div className="glass-card overflow-hidden" style={{ padding: 0 }}>
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-white/5 border-b border-white/10">
                                <th className="p-4 text-xs font-bold uppercase tracking-widest text-neutral-500">Organization</th>
                                <th className="p-4 text-xs font-bold uppercase tracking-widest text-neutral-500">Plan / Status</th>
                                <th className="p-4 text-xs font-bold uppercase tracking-widest text-neutral-500">Expiry</th>
                                <th className="p-4 text-xs font-bold uppercase tracking-widest text-neutral-500">Transaction ID</th>
                                <th className="p-4 text-xs font-bold uppercase tracking-widest text-neutral-500">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {organizations?.map((org) => (
                                <tr key={org.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                                    <td className="p-4">
                                        <div className="font-semibold">{org.name}</div>
                                        <div className="text-[10px] text-neutral-500 font-mono">{org.id}</div>
                                    </td>
                                    <td className="p-4">
                                        <div className="flex items-center gap-2">
                                            <span className="capitalize px-2 py-0.5 rounded bg-white/10 text-[10px] font-bold">
                                                {org.subscription_plan}
                                            </span>
                                            <div className={`h-1.5 w-1.5 rounded-full ${org.subscription_status === 'active' ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]' : 'bg-red-500'}`} />
                                            <span className="text-[10px] text-neutral-400 uppercase font-bold tracking-tight">{org.subscription_status}</span>
                                        </div>
                                    </td>
                                    <td className="p-4 text-xs text-neutral-300">
                                        {org.subscription_ends_at
                                            ? new Date(org.subscription_ends_at).toLocaleDateString()
                                            : org.trial_ends_at
                                                ? <span className="text-indigo-400">Trial till {new Date(org.trial_ends_at).toLocaleDateString()}</span>
                                                : 'N/A'
                                        }
                                    </td>
                                    <td className="p-4">
                                        {org.last_transaction_id ? (
                                            <span className="font-mono text-indigo-400 text-[10px] bg-indigo-500/10 border border-indigo-500/20 px-2 py-1 rounded">
                                                {org.last_transaction_id}
                                            </span>
                                        ) : (
                                            <span className="text-neutral-600 text-[10px] italic">No submission</span>
                                        )}
                                    </td>
                                    <td className="p-4">
                                        <SubscriptionActionButtons
                                            orgId={org.id}
                                            orgName={org.name}
                                            plan={org.subscription_plan as any || 'monthly'}
                                            status={org.subscription_status}
                                        />
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </main>
        </div>
    );
}
