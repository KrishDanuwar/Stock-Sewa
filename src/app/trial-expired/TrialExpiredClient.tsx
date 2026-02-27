'use client';

import React, { useState } from 'react';
import { Check, CreditCard, MessageCircle, Rocket, Sparkles, Send, ShieldCheck, Zap } from 'lucide-react';
import { submitTransactionId } from '@/lib/actions/subscriptions';
import { toast } from 'sonner';

interface TrialExpiredClientProps {
    email: string;
}

export default function TrialExpiredClient({ email }: TrialExpiredClientProps) {
    const [selectedPlan, setSelectedPlan] = useState<'monthly' | 'yearly'>('yearly');
    const [transactionId, setTransactionId] = useState('');
    const [loading, setLoading] = useState(false);

    const plans = [
        {
            id: 'monthly' as const,
            name: 'Basic Monthly',
            price: '999',
            period: 'per month',
            description: 'Essential toolkit for growing shops.',
            features: ['Unlimited Invoices', 'Inventory Tracking', 'Basic Reports', 'Customer Database'],
            icon: Rocket,
        },
        {
            id: 'yearly' as const,
            name: 'Premium Yearly',
            price: '9,588',
            period: 'per year',
            description: 'Best value for established enterprises.',
            features: ['Everything in Basic', '20% Annual Savings', 'Priority Support', 'Advanced Data Export'],
            icon: Zap,
            popular: true,
        },
    ];

    const handleSubmit = async () => {
        if (!transactionId.trim()) {
            toast.error('Please enter a Transaction ID first.');
            return;
        }

        setLoading(true);
        try {
            const result = await submitTransactionId(transactionId, selectedPlan);
            if (result.success) {
                toast.success('Transaction submitted! Our team will activate your account shortly.');
                setTransactionId('');
            } else {
                toast.error(result.error || 'Failed to submit transaction.');
            }
        } catch (error) {
            toast.error('An unexpected error occurred.');
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="animate-fade-in-up" style={{ width: '100%', maxWidth: '1000px', margin: '0 auto', paddingBottom: '100px' }}>
            {/* Header */}
            <header style={{ textAlign: 'center', marginBottom: '64px' }}>
                <div className="badge badge-info" style={{ marginBottom: '16px', padding: '6px 16px', fontSize: '0.8125rem' }}>
                    <Sparkles size={14} style={{ marginRight: '6px' }} />
                    Trial Period Concluded
                </div>
                <h1 style={{ fontSize: 'clamp(2.5rem, 8vw, 4rem)', fontWeight: 900, letterSpacing: '-0.04em', lineHeight: 1.1, marginBottom: '20px' }}>
                    Scale Your Business <br />
                    <span style={{ color: 'var(--brand-primary)', textShadow: '0 0 30px rgba(79, 142, 247, 0.2)' }}>Without Limits</span>
                </h1>
                <p style={{ color: 'var(--text-secondary)', fontSize: '1.125rem', maxWidth: '600px', margin: '0 auto', lineHeight: 1.6 }}>
                    Reactivate your dashboard and keep your momentum going with Stock Sewa's professional toolkit.
                </p>
            </header>

            {/* Pricing Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '24px', marginBottom: '64px' }}>
                {plans.map((plan) => (
                    <div
                        key={plan.id}
                        onClick={() => setSelectedPlan(plan.id)}
                        className="glass-card"
                        style={{
                            padding: '40px',
                            cursor: 'pointer',
                            position: 'relative',
                            border: selectedPlan === plan.id ? '2px solid var(--brand-primary)' : '1px solid var(--glass-border)',
                            transform: selectedPlan === plan.id ? 'scale(1.02)' : 'none',
                            transition: 'all 0.4s cubic-bezier(0.23, 1, 0.32, 1)',
                            background: selectedPlan === plan.id ? 'rgba(79, 142, 247, 0.05)' : 'var(--glass-bg)'
                        }}
                    >
                        {plan.popular && (
                            <div style={{
                                position: 'absolute', top: '-12px', left: '50%', transform: 'translateX(-50%)',
                                background: 'var(--brand-primary)', color: 'white', fontSize: '0.625rem', fontWeight: 800,
                                padding: '4px 12px', borderRadius: '100px', textTransform: 'uppercase', letterSpacing: '0.1em'
                            }}>
                                Best Value
                            </div>
                        )}

                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
                            <div>
                                <h3 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: '4px' }}>{plan.name}</h3>
                                <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>{plan.description}</p>
                            </div>
                            <div style={{ padding: '12px', borderRadius: '12px', background: selectedPlan === plan.id ? 'rgba(79, 142, 247, 0.1)' : 'rgba(255,255,255,0.05)', color: selectedPlan === plan.id ? 'var(--brand-primary)' : 'var(--text-muted)' }}>
                                <plan.icon size={24} />
                            </div>
                        </div>

                        <div style={{ marginBottom: '32px' }}>
                            <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px' }}>
                                <span style={{ fontSize: '3rem', fontWeight: 900 }}>Rs. {plan.price}</span>
                                <span style={{ color: 'var(--text-muted)', fontSize: '0.8125rem', fontWeight: 600, textTransform: 'uppercase' }}>{plan.period}</span>
                            </div>
                        </div>

                        <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 40px 0', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                            {plan.features.map((feature) => (
                                <li key={feature} style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '0.9375rem', color: 'var(--text-secondary)' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '20px', height: '20px', borderRadius: '50%', background: 'rgba(16, 185, 129, 0.1)', border: '1px solid rgba(16, 185, 129, 0.2)' }}>
                                        <Check size={12} color="var(--brand-success)" />
                                    </div>
                                    {feature}
                                </li>
                            ))}
                        </ul>

                        <button
                            className={`glass-button ${selectedPlan === plan.id ? 'glass-button-primary' : ''}`}
                            style={{ width: '100%', justifyContent: 'center', height: '52px', fontSize: '1rem' }}
                        >
                            {selectedPlan === plan.id ? 'Current Selection' : 'Choose This Plan'}
                        </button>
                    </div>
                ))}
            </div>

            {/* Payment Verification */}
            <div className="glass-card" style={{ padding: '48px', overflow: 'hidden', position: 'relative' }}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '48px', alignItems: 'center' }}>
                    <div style={{ flex: 1 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
                            <div style={{ padding: '12px', borderRadius: '12px', background: 'rgba(79, 142, 247, 0.1)', color: 'var(--brand-primary)' }}>
                                <CreditCard size={24} />
                            </div>
                            <h2 style={{ fontSize: '1.75rem', fontWeight: 800 }}>Manual Payment Activation</h2>
                        </div>

                        <p style={{ color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: '32px' }}>
                            1. Scan the QR code to make payment.<br />
                            2. Note down your Transaction ID.<br />
                            3. Enter it below for instant verification.
                        </p>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                <label className="glass-label" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    <ShieldCheck size={14} color="var(--brand-success)" />
                                    Transaction ID (TID)
                                </label>
                                <input
                                    className="glass-input"
                                    style={{ height: '56px', fontSize: '1.125rem', fontWeight: 700, letterSpacing: '0.05em' }}
                                    placeholder="e.g. ABC-123-XYZ"
                                    value={transactionId}
                                    onChange={(e) => setTransactionId(e.target.value)}
                                />
                            </div>

                            <button
                                className="glass-button glass-button-primary"
                                style={{ height: '56px', fontSize: '1.125rem', fontWeight: 800, justifyContent: 'center' }}
                                onClick={handleSubmit}
                                disabled={loading || !transactionId}
                            >
                                {loading ? 'Validating...' : 'Submit ID for Verification'}
                            </button>

                            <p style={{ textAlign: 'center', fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>
                                Activations are handled by our team within 1-2 business hours.
                            </p>
                        </div>
                    </div>

                    <div style={{ flex: '0 0 340px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                        <div className="glass-card" style={{ padding: '24px', background: 'white', borderRadius: '24px', boxShadow: '0 20px 40px rgba(0,0,0,0.2)', position: 'relative' }}>
                            {/* Scanning Animation */}
                            <div style={{
                                position: 'absolute', top: '24px', left: '24px', right: '24px', height: '2px',
                                background: 'var(--brand-primary)', boxShadow: '0 0 15px var(--brand-primary)',
                                animation: 'qrScan 4s infinite linear', zIndex: 10
                            }} />

                            <div style={{ width: '220px', height: '220px', background: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px', borderRadius: '16px', overflow: 'hidden' }}>
                                <div style={{ width: '100%', height: '100%', position: 'relative' }}>
                                    <div style={{ width: '100%', height: '100%', background: '#f8fafc', borderRadius: '12px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                                        <div style={{
                                            width: '180px', height: '180px',
                                            background: 'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' viewBox=\'0 0 100 100\'%3E%3Crect width=\'100\' height=\'100\' fill=\'white\'/%3E%3Cpath d=\'M20 20h20v20H20zM60 20h20v20H60zM20 60h20v20H20zM40 40h20v20H40zM30 30h5v5h-5zM70 30h5v5h-5zM30 70h5v5h-5z\' fill=\'black\'/%3E%3C/svg%3E") no-repeat center',
                                            backgroundSize: 'contain'
                                        }} />
                                        <p style={{ fontSize: '0.625rem', fontWeight: 800, marginTop: '8px', color: '#10b981' }}>eSewa Verified QR</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div style={{ marginTop: '24px', textAlign: 'center' }}>
                            <p style={{ fontWeight: 700, fontSize: '0.9375rem' }}>Krish Singh Danuwar</p>
                            <p style={{ color: 'var(--brand-primary)', fontWeight: 800, fontSize: '0.875rem' }}>eSewa ID: 9703360369</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Footer */}
            <footer style={{ marginTop: '80px', textAlign: 'center' }}>
                <p style={{ color: 'var(--text-muted)', marginBottom: '24px', fontSize: '0.9375rem' }}>
                    Need immediate assistance? We're here to help.
                </p>
                <div style={{ display: 'flex', justifyContent: 'center' }}>
                    <a
                        href="https://wa.me/9779703360369"
                        target="_blank"
                        rel="noreferrer"
                        className="glass-button"
                        style={{ padding: '12px 32px', borderRadius: '14px', borderColor: 'rgba(16, 185, 129, 0.3)', color: 'var(--brand-success)' }}
                    >
                        <MessageCircle size={18} />
                        WhatsApp Support
                    </a>
                </div>
            </footer>

            <style jsx>{`
                @keyframes qrScan {
                    0% { top: 24px; opacity: 0; }
                    5% { opacity: 1; }
                    95% { opacity: 1; }
                    100% { top: 244px; opacity: 0; }
                }
            `}</style>
        </div>
    );
}
