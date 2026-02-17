'use client';

import { useState } from 'react';
import { CreditCard, Zap, CheckCircle2, Phone, Building2 } from 'lucide-react';

const PLANS = [
    {
        name: 'Basic',
        price: 'Rs. 2,900',
        features: ['Up to 500 Products', 'Standard Support', 'Basic Analytics'],
    },
    {
        name: 'Pro',
        price: 'Rs. 7,900',
        features: ['Unlimited Products', 'Priority Support', 'Advanced PDF Reports', 'Custom Branding'],
        popular: true,
    },
];

export default function BillingClient({
    subscriptionStatus,
    organizationName
}: {
    subscriptionStatus: string;
    organizationName: string;
}) {
    const [notified, setNotified] = useState(false);

    const handleNotifyPayment = () => {
        setNotified(true);
        // Simulate notification to admin
        setTimeout(() => setNotified(false), 5000);
    };

    return (
        <div className="p-6 md:p-10 space-y-10 animate-fade-in max-w-7xl mx-auto">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h1 className="text-3xl font-poppins font-black text-surface-primary tracking-tight">Billing & Activation</h1>
                    <p className="text-surface-muted mt-2 font-medium">Manage institutional access for <span className="text-brand-primary font-bold">{organizationName}</span></p>
                </div>
                <div className={`px-6 py-2.5 rounded-2xl text-xs font-black uppercase tracking-widest flex items-center gap-2 border ${subscriptionStatus === 'active' || subscriptionStatus === 'trialing'
                    ? 'bg-brand-primary/10 text-brand-primary border-brand-primary/20 shadow-lg shadow-brand-primary/5'
                    : 'bg-status-danger/10 text-status-danger border-status-danger/20 shadow-lg shadow-status-danger/5'
                    }`}>
                    <CheckCircle2 size={14} strokeWidth={3} />
                    Status: {subscriptionStatus}
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
                {/* Plans */}
                <div className="lg:col-span-8 grid grid-cols-1 md:grid-cols-2 gap-8">
                    {PLANS.map((plan) => (
                        <div
                            key={plan.name}
                            className={`card p-10 flex flex-col relative overflow-hidden h-full group transition-all duration-500 hover:border-brand-primary/40 ${plan.popular ? 'border-brand-primary shadow-2xl shadow-brand-primary/5 bg-brand-teal/5' : ''}`}
                        >
                            {plan.popular && (
                                <div className="absolute top-0 right-0 bg-brand-primary text-brand-dark text-[10px] font-black px-4 py-1.5 rounded-bl-2xl uppercase tracking-[0.2em] shadow-lg">
                                    Recommended
                                </div>
                            )}

                            <div className="mb-8">
                                <h3 className="text-xs font-black text-surface-muted uppercase tracking-[0.3em] mb-4">{plan.name} Access</h3>
                                <div className="flex items-baseline gap-2">
                                    <span className="text-4xl font-poppins font-black text-surface-primary tracking-tight group-hover:text-brand-primary transition-colors">{plan.price}</span>
                                    <span className="text-surface-muted font-bold text-sm">/ yr</span>
                                </div>
                            </div>

                            <ul className="space-y-5 mb-10 flex-grow">
                                {plan.features.map((feature) => (
                                    <li key={feature} className="flex items-start gap-4 text-sm text-surface-secondary font-medium">
                                        <div className="mt-0.5 p-0.5 bg-brand-primary/10 text-brand-primary rounded-full border border-brand-primary/20">
                                            <CheckCircle2 size={12} strokeWidth={3} />
                                        </div>
                                        {feature}
                                    </li>
                                ))}
                            </ul>

                            <button
                                onClick={handleNotifyPayment}
                                disabled={subscriptionStatus === 'active'}
                                className={`w-full py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all duration-300 flex items-center justify-center gap-3 active:scale-[0.98] ${plan.popular
                                    ? 'bg-brand-primary text-brand-dark hover:bg-brand-teal shadow-xl'
                                    : 'bg-brand-background text-surface-primary border border-brand-border hover:border-brand-primary hover:text-brand-primary'
                                    }`}
                            >
                                {subscriptionStatus === 'active' ? (
                                    <>
                                        <CheckCircle2 size={14} />
                                        Plan Active
                                    </>
                                ) : notified ? (
                                    'Request Sent'
                                ) : (
                                    <>
                                        <Zap size={14} />
                                        Choose {plan.name}
                                    </>
                                )}
                            </button>
                        </div>
                    ))}
                </div>

                {/* Local Payment Instructions */}
                <div className="lg:col-span-4 space-y-6">
                    <div className="card p-8 border-brand-primary/20 bg-brand-teal/5 relative overflow-hidden">
                        <div className="absolute top-0 right-0 opacity-5 -mr-8 -mt-8">
                            <Zap size={150} />
                        </div>

                        <h3 className="text-xs font-black text-brand-primary uppercase tracking-[0.3em] mb-8 flex items-center gap-3 relative z-10">
                            <div className="w-8 h-8 rounded-xl bg-brand-primary/20 flex items-center justify-center">
                                <Zap size={16} />
                            </div>
                            Manual Activation
                        </h3>

                        <p className="text-sm text-surface-secondary leading-relaxed mb-8 relative z-10 font-medium">
                            StockSewa is powered by local payments. Use these options for instant manual activation by our team.
                        </p>

                        <div className="space-y-4 relative z-10">
                            {[
                                { label: 'eSewa ID', value: '98XXXXXXXX', name: 'StockSewa Official' },
                                { label: 'Khalti ID', value: '98XXXXXXXX', name: 'StockSewa Official' },
                                { label: 'Bank Transfer', value: 'XXXX-XXXX-XXXX', name: 'Global IME (StockSewa Pvt Ltd)' }
                            ].map((method) => (
                                <div key={method.label} className="p-5 bg-brand-background/60 backdrop-blur rounded-2xl border border-brand-border hover:border-brand-primary/30 transition-all group">
                                    <p className="text-[10px] font-black text-surface-muted uppercase tracking-[0.2em] mb-2">{method.label}</p>
                                    <p className="font-poppins font-black text-surface-primary tracking-wide text-lg group-hover:text-brand-primary transition-colors">{method.value}</p>
                                    <p className="text-[10px] text-surface-muted font-bold mt-1 uppercase opacity-80">{method.name}</p>
                                </div>
                            ))}
                        </div>

                        <div className="mt-10 pt-8 border-t border-brand-border flex items-center gap-4">
                            <div className="w-12 h-12 bg-brand-primary/10 rounded-2xl flex items-center justify-center text-brand-primary border border-brand-primary/20">
                                <Phone size={20} />
                            </div>
                            <div>
                                <h4 className="text-[10px] font-black text-surface-muted uppercase tracking-widest mb-1">Human Support</h4>
                                <p className="text-sm font-black text-surface-primary">+977 98XXXXXXXX</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="card p-8 bg-brand-teal/5 border-dashed border-2 bg-transparent flex flex-col sm:flex-row items-center gap-6 text-center sm:text-left transition-all hover:border-brand-primary/40">
                <div className="p-4 bg-brand-background rounded-3xl shadow-2xl border border-brand-border text-brand-primary">
                    <Building2 size={32} />
                </div>
                <div>
                    <h4 className="font-poppins font-black text-surface-primary uppercase tracking-widest text-sm">Enterprise Growth?</h4>
                    <p className="text-sm text-surface-muted mt-2 font-medium">Contact us for custom branch hierarchies, hardware bundles, and hardware onboarding (Printers & POS).</p>
                </div>
            </div>
        </div>
    );
}
