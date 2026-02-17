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
                            className={`card p-10 flex flex-col relative overflow-hidden h-full group transition-all duration-500 hover:border-brand-primary/40 bg-white ${plan.popular ? 'border-brand-primary/60 shadow-2xl shadow-brand-primary/10 ring-1 ring-brand-primary/10' : 'shadow-xl shadow-gray-200/50'}`}
                        >
                            {plan.popular && (
                                <div className="absolute top-0 right-0 bg-brand-primary text-white text-[10px] font-black px-5 py-2 rounded-bl-3xl uppercase tracking-[0.2em] shadow-lg">
                                    Highly Recommended
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
                                className={`w-full py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all duration-500 flex items-center justify-center gap-3 active:scale-[0.98] ${plan.popular
                                    ? 'bg-brand-primary text-white hover:bg-brand-primary/90 shadow-2xl shadow-brand-primary/20'
                                    : 'bg-gray-50 text-surface-primary border border-gray-100 hover:border-brand-primary/50 hover:text-brand-primary shadow-sm'
                                    }`}
                            >
                                {subscriptionStatus === 'active' ? (
                                    <>
                                        <CheckCircle2 size={16} strokeWidth={3} />
                                        Access Active
                                    </>
                                ) : notified ? (
                                    'Request Awaited'
                                ) : (
                                    <>
                                        <Zap size={16} strokeWidth={2.5} />
                                        Activate {plan.name}
                                    </>
                                )}
                            </button>
                        </div>
                    ))}
                </div>

                {/* Local Payment Instructions */}
                <div className="lg:col-span-4 space-y-6">
                    <div className="card p-10 border-brand-primary/20 bg-white shadow-2xl shadow-gray-200/50 relative overflow-hidden group">
                        <div className="absolute top-0 right-0 opacity-5 -mr-10 -mt-10 group-hover:rotate-12 transition-transform duration-700">
                            <Zap size={180} />
                        </div>

                        <h3 className="text-xs font-black text-brand-primary uppercase tracking-[0.3em] mb-10 flex items-center gap-4 relative z-10">
                            <div className="w-10 h-10 rounded-2xl bg-brand-primary/10 flex items-center justify-center shadow-inner border border-brand-primary/10">
                                <Zap size={18} />
                            </div>
                            Manual Activation
                        </h3>

                        <p className="text-sm text-surface-secondary leading-relaxed mb-8 relative z-10 font-medium">
                            StockSewa is powered by local payments. Use these options for instant manual activation by our team.
                        </p>

                        <div className="space-y-4 relative z-10">
                            {[
                                { label: 'eSewa ID', value: '98XXXXXXXX', name: 'StockSewa Official', icon: '💎' },
                                { label: 'Khalti ID', value: '98XXXXXXXX', name: 'StockSewa Official', icon: '💜' },
                                { label: 'Bank Transfer', value: 'XXXX-XXXX-XXXX', name: 'Global IME (StockSewa Pvt Ltd)', icon: '🏦' }
                            ].map((method) => (
                                <div key={method.label} className="p-6 bg-gray-50/50 backdrop-blur rounded-[1.5rem] border border-gray-100 hover:border-brand-primary/40 transition-all group/method hover:shadow-lg hover:shadow-gray-100/50">
                                    <div className="flex justify-between items-start mb-3">
                                        <p className="text-[10px] font-black text-surface-muted uppercase tracking-[0.2em]">{method.label}</p>
                                        <span className="text-sm opacity-50 group-hover/method:scale-110 transition-transform">{method.icon}</span>
                                    </div>
                                    <p className="font-poppins font-black text-surface-primary tracking-wide text-xl group-hover/method:text-brand-primary transition-colors">{method.value}</p>
                                    <p className="text-[10px] text-surface-muted font-black mt-2 uppercase opacity-60 tracking-widest">{method.name}</p>
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
