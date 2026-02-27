'use client';

import { useState } from 'react';
import { submitTransactionId } from '@/lib/actions/subscriptions';
import { toast } from 'sonner';
import { Check, CreditCard, Clock, MessageSquare, ArrowRight, ShieldCheck, Zap } from 'lucide-react';

interface Stats {
    invoices: number;
    products: number;
    customers: number;
}

export default function TrialExpiredClient({ stats, userEmail }: { stats: Stats, userEmail: string }) {
    const [plan, setPlan] = useState<'monthly' | 'yearly'>('monthly');
    const [transactionId, setTransactionId] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [submitted, setSubmitted] = useState(false);

    const handleSubmit = async () => {
        if (!transactionId) return toast.error('Please enter the Transaction ID');

        setSubmitting(true);
        const result = await submitTransactionId(transactionId, plan);
        if (result.success) {
            setSubmitted(true);
            toast.success('Payment details submitted! We will verify it shortly.');
        } else {
            toast.error(result.error || 'Failed to submit. Please try again.');
        }
        setSubmitting(false);
    };

    if (submitted) {
        return (
            <div className="min-h-screen flex items-center justify-center p-6 bg-[var(--bg-primary)]">
                <div className="glass-card animate-scale-in" style={{ maxWidth: 500, padding: 48, textAlign: 'center' }}>
                    <div style={{ width: 80, height: 80, borderRadius: '50%', background: 'rgba(16, 185, 129, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px' }}>
                        <ShieldCheck size={40} color="var(--brand-success)" />
                    </div>
                    <h1 style={{ fontSize: '1.75rem', fontWeight: 800, marginBottom: 16 }}>Verification in Progress</h1>
                    <p style={{ color: 'var(--text-secondary)', lineHeight: '1.6', marginBottom: 32 }}>
                        Thank you for your payment! We have received your Transaction ID: <strong style={{ color: 'var(--brand-primary)' }}>{transactionId}</strong>.
                        Our team is cross-checking it now. You will regain full access as soon as it's verified.
                    </p>
                    <a href="https://wa.me/9779703360369" target="_blank" rel="noopener noreferrer" className="glass-button glass-button-primary" style={{ width: '100%', justifyContent: 'center', padding: '16px' }}>
                        <MessageSquare size={18} /> Chat on WhatsApp for Faster Activation
                    </a>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen p-6 bg-[var(--bg-primary)] animate-fade-in">
            <div style={{ maxWidth: 1100, margin: '0 auto' }}>
                <header style={{ textAlign: 'center', marginBottom: 64 }}>
                    <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '8px 16px', borderRadius: 100, background: 'rgba(239, 68, 68, 0.1)', color: 'var(--brand-danger)', fontSize: '0.8125rem', fontWeight: 700, marginBottom: 24 }}>
                        <Clock size={14} /> TRIAL EXPIRED
                    </div>
                    <h1 style={{ fontSize: '2.5rem', fontWeight: 900, marginBottom: 16 }}>Your Stock Sewa journey has just begun.</h1>
                    <p style={{ fontSize: '1.125rem', color: 'var(--text-secondary)', maxWidth: 600, margin: '0 auto' }}>
                        Your 3-day free trial has ended. To continue managing your business with the most advanced inventory system in Nepal, please choose a plan below.
                    </p>
                </header>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.2fr', gap: 48 }}>
                    {/* Left: Packages & Stats */}
                    <div>
                        <div className="glass-card" style={{ padding: 32, marginBottom: 24 }}>
                            <h2 style={{ fontSize: '1.125rem', fontWeight: 700, marginBottom: 20 }}>During your trial, you've:</h2>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
                                <div style={{ textAlign: 'center' }}>
                                    <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--brand-primary)' }}>{stats.invoices}</div>
                                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Bills Created</div>
                                </div>
                                <div style={{ textAlign: 'center' }}>
                                    <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--brand-secondary)' }}>{stats.products}</div>
                                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Products Added</div>
                                </div>
                                <div style={{ textAlign: 'center' }}>
                                    <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--brand-accent)' }}>{stats.customers}</div>
                                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Customers Listed</div>
                                </div>
                            </div>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                            {/* Monthly */}
                            <div
                                onClick={() => setPlan('monthly')}
                                className={`glass-card plan-selector ${plan === 'monthly' ? 'active' : ''}`}
                                style={{
                                    padding: 24,
                                    cursor: 'pointer',
                                    border: plan === 'monthly' ? '2px solid var(--brand-primary)' : '2px solid transparent',
                                    transition: 'all 0.2s'
                                }}
                            >
                                <div style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: 8 }}>BASIC</div>
                                <div style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: 4 }}>Rs. 999</div>
                                <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Per Month</div>
                            </div>

                            {/* Yearly */}
                            <div
                                onClick={() => setPlan('yearly')}
                                className={`glass-card plan-selector ${plan === 'yearly' ? 'active' : ''}`}
                                style={{
                                    padding: 24,
                                    cursor: 'pointer',
                                    border: plan === 'yearly' ? '2px solid var(--brand-primary)' : '2px solid transparent',
                                    transition: 'all 0.2s',
                                    position: 'relative',
                                    overflow: 'hidden'
                                }}
                            >
                                <div style={{ position: 'absolute', top: 0, right: 0, background: 'var(--brand-primary)', color: 'white', padding: '4px 12px', fontSize: '0.625rem', fontWeight: 900, borderRadius: '0 0 0 12px' }}>BEST VALUE</div>
                                <div style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: 8 }}>YEARLY</div>
                                <div style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: 4 }}>Rs. 9588</div>
                                <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Per Year (save 20%)</div>
                            </div>
                        </div>

                        <div style={{ marginTop: 32, display: 'flex', flexDirection: 'column', gap: 16 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                                <div style={{ padding: 6, borderRadius: '50%', background: 'rgba(16, 185, 129, 0.1)' }}><Check size={14} color="var(--brand-success)" /></div>
                                <span style={{ fontSize: '0.9375rem' }}>Full POS & Bill Printing</span>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                                <div style={{ padding: 6, borderRadius: '50%', background: 'rgba(16, 185, 129, 0.1)' }}><Check size={14} color="var(--brand-success)" /></div>
                                <span style={{ fontSize: '0.9375rem' }}>Detailed Reports & Export</span>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                                <div style={{ padding: 6, borderRadius: '50%', background: 'rgba(16, 185, 129, 0.1)' }}><Check size={14} color="var(--brand-success)" /></div>
                                <span style={{ fontSize: '0.9375rem' }}>Cloud-sync & Secure Backups</span>
                            </div>
                        </div>
                    </div>

                    {/* Right: Payment Method */}
                    <div className="glass-card" style={{ padding: 40, background: 'var(--card-bg)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 32 }}>
                            <CreditCard size={24} color="var(--brand-primary)" />
                            <h2 style={{ fontSize: '1.25rem', fontWeight: 700 }}>Instructions to Activate</h2>
                        </div>

                        <div style={{ display: 'flex', gap: 24, marginBottom: 32 }}>
                            {/* QR Section */}
                            <div style={{ flexShrink: 0 }}>
                                <div style={{ width: 160, height: 160, background: 'white', padding: 8, borderRadius: 16, border: '1px solid var(--glass-border)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    {/* Placeholder for User's actual QR */}
                                    <div style={{ textAlign: 'center', color: '#666' }}>
                                        <Zap size={32} style={{ margin: '0 auto 8px', opacity: 0.5 }} />
                                        <div style={{ fontSize: '0.7rem', fontWeight: 600 }}>USER QR CODE</div>
                                        <div style={{ fontSize: '0.6rem' }}>(eSewa / FonePay)</div>
                                    </div>
                                </div>
                            </div>
                            <div style={{ flex: 1 }}>
                                <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', lineHeight: '1.6' }}>
                                    1. Scan the QR code using your **eSewa**, **Khalti**, or **Mobile Banking** app.
                                    <br /><br />
                                    2. Pay the exact amount for your chosen plan (**Rs. {plan === 'monthly' ? '999' : '9,588'}**).
                                    <br /><br />
                                    3. Enter the **Transaction ID** below to request activation.
                                </p>
                            </div>
                        </div>

                        <div style={{ marginBottom: 32 }}>
                            <label className="glass-label">Transaction ID / Ref ID</label>
                            <input
                                className="glass-input"
                                placeholder="Enter the ID from your phone screen"
                                style={{ height: 56, fontSize: '1.125rem', letterSpacing: '0.05em' }}
                                value={transactionId}
                                onChange={(e) => setTransactionId(e.target.value)}
                            />
                        </div>

                        <button
                            className="glass-button glass-button-primary"
                            style={{ width: '100%', height: 56, fontSize: '1rem', fontWeight: 700, borderRadius: 16 }}
                            onClick={handleSubmit}
                            disabled={submitting}
                        >
                            {submitting ? 'Submitting...' : 'Activate My Account'} <ArrowRight size={18} />
                        </button>

                        <div style={{ marginTop: 24, textAlign: 'center' }}>
                            <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
                                Facing issues? <a href="https://wa.me/9779703360369" style={{ color: 'var(--brand-primary)', fontWeight: 600 }}>Message us on WhatsApp</a>
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            <style jsx>{`
                .plan-selector:hover {
                    background: rgba(var(--brand-primary-rgb, 79, 142, 247), 0.05);
                    transform: translateY(-2px);
                }
                .plan-selector.active {
                    background: rgba(var(--brand-primary-rgb, 79, 142, 247), 0.08);
                }
            `}</style>
        </div>
    );
}
