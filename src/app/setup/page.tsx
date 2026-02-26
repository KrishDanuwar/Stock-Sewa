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
        <div style={{ display: 'flex', minHeight: '100vh', alignItems: 'center', justifyContent: 'center', padding: 16, background: 'var(--bg-base)' }}>
            <div className="glass-card animate-fade-in-up" style={{ maxWidth: 448, width: '100%', padding: 32, textAlign: 'center' }}>
                <div style={{ width: 64, height: 64, background: 'rgba(245, 158, 11, 0.15)', borderRadius: 16, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px' }}>
                    <RefreshCw size={32} style={{ color: 'var(--brand-warning)' }} className={isPending ? 'animate-spin' : ''} />
                </div>

                <h1 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: 16, color: 'var(--text-primary)' }}>Organization Not Found</h1>
                <p style={{ color: 'var(--text-secondary)', marginBottom: 32, fontWeight: 500 }}>
                    It looks like your user account was created, but the organization setup failed.
                    This happens when database triggers aren't ready during registration.
                </p>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                    {state?.error && (
                        <div style={{ background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.2)', borderRadius: 12, padding: 16, marginBottom: 8, textAlign: 'left' }}>
                            <p style={{ fontSize: '0.875rem', color: 'var(--brand-danger)', fontWeight: 700, marginBottom: 4 }}>
                                Repair Failed:
                            </p>
                            <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', lineHeight: 1.6, fontFamily: 'monospace' }}>
                                {state.error}
                            </p>
                        </div>
                    )}

                    <div style={{ background: 'rgba(245, 158, 11, 0.1)', border: '1px solid rgba(245, 158, 11, 0.2)', borderRadius: 12, padding: 16, marginBottom: 8, textAlign: 'left' }}>
                        <p style={{ fontSize: '0.875rem', color: 'var(--brand-warning)', fontWeight: 700, marginBottom: 4 }}>
                            Recommended Action:
                        </p>
                        <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', lineHeight: 1.6, fontStyle: 'italic' }}>
                            Click "Repair Automatically" to manually initialize your organization
                            and profile records.
                        </p>
                    </div>

                    <form action={formAction}>
                        <button
                            type="submit"
                            disabled={isPending}
                            className="glass-button glass-button-primary"
                            style={{ width: '100%', justifyContent: 'center', padding: '16px 24px', fontWeight: 700, fontSize: '1rem' }}
                        >
                            {isPending ? (
                                <><RefreshCw size={20} className="animate-spin" /> Repairing and Synchronizing...</>
                            ) : (
                                <><RefreshCw size={20} /> Repair My Account Automatically</>
                            )}
                        </button>
                    </form>

                    <div style={{ display: 'flex', alignItems: 'center', gap: 12, margin: '12px 0' }}>
                        <div style={{ flex: 1, height: 1, background: 'var(--glass-border)' }} />
                        <span style={{ fontSize: '0.625rem', color: 'var(--text-muted)', fontWeight: 600 }}>OR</span>
                        <div style={{ flex: 1, height: 1, background: 'var(--glass-border)' }} />
                    </div>

                    <form action={signOut}>
                        <button type="submit" className="glass-button" style={{ width: '100%', justifyContent: 'center', padding: '12px 24px', color: 'var(--text-secondary)' }}>
                            <LogOut size={18} /> Sign Out and Try Again
                        </button>
                    </form>

                    <Link href="/dashboard" style={{ color: 'var(--brand-primary)', fontSize: '0.75rem', marginTop: 8, textDecoration: 'underline', textUnderlineOffset: 4 }}>
                        Refresh and Attempt Dashboard Entry
                    </Link>
                </div>
            </div>
        </div>
    );
}

