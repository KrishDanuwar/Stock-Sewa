'use client';

import { useActionState, useEffect } from 'react';
import Link from 'next/link';
import { signOut } from '@/lib/actions/auth';
import { repairOrganization } from '@/lib/actions/repair';
import { RefreshCw, LogOut } from 'lucide-react';
import { toast } from 'sonner';

export default function SetupPage() {
    const [state, formAction, isPending] = useActionState(repairOrganization, null);

    useEffect(() => {
        if (state?.error) {
            toast.error(state.error);
        }
    }, [state]);

    return (
        <div className="flex min-h-screen items-center justify-center p-4">
            <div className="glass-card max-w-md w-full p-8 text-center animate-fade-in-up">
                <div className="w-16 h-16 bg-amber-500/20 rounded-2xl flex items-center justify-center mx-auto mb-6">
                    <RefreshCw size={32} className={`text-amber-500 ${isPending ? 'animate-spin' : 'animate-spin-slow'}`} />
                </div>

                <h1 className="text-2xl font-bold mb-4 text-white">Organization Not Found</h1>
                <p className="text-gray-400 mb-8 font-medium">
                    It looks like your user account was created, but the organization setup failed.
                    This happens when database triggers aren't ready during registration.
                </p>

                <div className="flex flex-col gap-4">
                    {state?.error && (
                        <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 mb-2 text-left">
                            <p className="text-sm text-red-500 font-bold mb-1">
                                Repair Failed:
                            </p>
                            <p className="text-xs text-red-200/80 leading-relaxed font-mono">
                                {state.error}
                            </p>
                        </div>
                    )}

                    <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-4 mb-2 text-left">
                        <p className="text-sm text-amber-500 font-bold mb-1">
                            Recommended Action:
                        </p>
                        <p className="text-xs text-amber-200/80 leading-relaxed italic">
                            Click "Repair Automatically" to manually initialize your organization
                            and profile records.
                        </p>
                    </div>

                    <form action={formAction}>
                        <button
                            type="submit"
                            disabled={isPending}
                            className="glass-button glass-button-primary w-full justify-center py-4 font-bold shadow-xl shadow-blue-500/25 text-base"
                        >
                            {isPending ? (
                                <><RefreshCw size={20} className="animate-spin" /> Repairing and Synchronizing...</>
                            ) : (
                                <><RefreshCw size={20} /> Repair My Account Automatically</>
                            )}
                        </button>
                    </form>

                    <div style={{ display: 'flex', alignItems: 'center', gap: 12, margin: '12px 0' }}>
                        <div style={{ flex: 1, height: 1, background: 'rgba(255,255,255,0.06)' }} />
                        <span style={{ fontSize: '0.625rem', color: 'rgba(255,255,255,0.4)', fontWeight: 600 }}>OR</span>
                        <div style={{ flex: 1, height: 1, background: 'rgba(255,255,255,0.06)' }} />
                    </div>

                    <form action={signOut}>
                        <button type="submit" className="glass-button w-full justify-center py-3 text-gray-400 border-gray-800/50 hover:bg-white/5">
                            <LogOut size={18} /> Sign Out and Try Again
                        </button>
                    </form>

                    <Link href="/dashboard" className="text-blue-500/70 hover:text-blue-400 text-xs mt-2 underline underline-offset-4">
                        Refresh and Attempt Dashboard Entry
                    </Link>
                </div>
            </div>
        </div>
    );
}
