'use client';

import { useActionState, useEffect } from 'react';
import { SignOutButton } from "@clerk/nextjs";
import { repairOrganization } from '@/lib/actions/repair';
import { LogOut, Building2, Store } from 'lucide-react';
import { toast } from 'sonner';

export default function SetupPage() {
    const [state, formAction, isPending] = useActionState(repairOrganization, null);

    useEffect(() => {
        if (state?.error) {
            toast.error(state.error);
        }
    }, [state]);

    return (
        <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden" style={{ background: 'var(--bg-base)' }}>
            {/* Background Orbs */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none">
                <div style={{ position: 'absolute', top: '10%', left: '10%', width: '400px', height: '400px', background: 'var(--brand-primary)', opacity: 0.1, filter: 'blur(100px)' }} />
                <div style={{ position: 'absolute', bottom: '10%', right: '10%', width: '500px', height: '500px', background: 'var(--brand-secondary)', opacity: 0.1, filter: 'blur(100px)' }} />
            </div>

            <div className="glass-card animate-fade-in-up w-full max-w-[480px] p-10 relative z-10 text-center">
                <div className="brand-logo-small mx-auto mb-6">
                    <Store size={32} color="var(--brand-primary)" />
                </div>

                <h1 style={{ fontSize: '1.75rem', fontWeight: 800, marginBottom: 12, color: 'var(--text-primary)' }}>Welcome to Stock Sewa</h1>
                <p style={{ color: 'var(--text-secondary)', marginBottom: 32, fontSize: '0.9375rem' }}>
                    Final step! Let&apos;s name your organization to get started.
                </p>

                <form action={formAction} className="flex flex-col gap-5">
                    <div className="form-group text-left">
                        <label className="glass-label">Business / Shop Name</label>
                        <div style={{ position: 'relative' }}>
                            <Building2 size={16} color="var(--text-muted)" style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)' }} />
                            <input
                                name="org_name"
                                required
                                className="glass-input"
                                placeholder="Enter your business name"
                                style={{ paddingLeft: 42 }}
                                autoFocus
                            />
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={isPending}
                        className="glass-button glass-button-primary"
                        style={{ width: '100%', justifyContent: 'center', padding: '14px 24px', fontWeight: 700, fontSize: '1rem', marginTop: 10 }}
                    >
                        {isPending ? 'Setting up...' : 'Create My Organization'}
                    </button>

                    {state?.error && (
                        <div className="error-box mt-2">
                            {state.error}
                        </div>
                    )}
                </form>

                <div className="mt-8 pt-8 border-t border-glass-border">
                    <SignOutButton>
                        <button className="text-muted-btn">
                            <LogOut size={16} /> Sign Out
                        </button>
                    </SignOutButton>
                </div>
            </div>

            <style jsx>{`
                .brand-logo-small {
                    width: 64px;
                    height: 64px;
                    background: rgba(79, 142, 247, 0.1);
                    border: 1px solid rgba(79, 142, 247, 0.2);
                    border-radius: 16px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }
                .error-box {
                    background: rgba(239, 68, 68, 0.1);
                    border: 1px solid rgba(239, 68, 68, 0.2);
                    border-radius: 10px;
                    padding: 12px;
                    font-size: 0.8125rem;
                    color: var(--brand-danger);
                    text-align: left;
                }
                .text-muted-btn {
                    background: none;
                    border: none;
                    cursor: pointer;
                    color: var(--text-muted);
                    font-size: 0.875rem;
                    font-weight: 500;
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    margin: 0 auto;
                    transition: color 0.2s;
                }
                .text-muted-btn:hover {
                    color: var(--text-primary);
                }
            `}</style>
        </div>
    );
}
