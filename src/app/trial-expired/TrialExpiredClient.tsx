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
            name: 'Basic Pro',
            price: '999',
            period: 'per month',
            description: 'Essential toolkit for growing shops.',
            features: ['Unlimited Digital Invoices', 'Real-time Inventory Tracking', 'Monthly Performance Reports', 'Customer Profile Management'],
            popular: false,
        },
        {
            id: 'yearly' as const,
            name: 'Business Elite',
            price: '9,588',
            period: 'per year',
            description: 'Best value for established enterprises.',
            features: ['Everything in Basic Pro', '20% Annual Savings Included', 'Priority 24/7 Support', 'Advanced Excel Export Audit'],
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
                toast.success('Transaction submitted! Our team will verify and activate your account shortly.');
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
        <div className="max-w-6xl w-full z-10 space-y-24 animate-fade-in-up">
            {/* Header Section */}
            <header className="text-center space-y-6">
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-brand-primary/10 border border-brand-primary/20 text-sm font-bold text-brand-primary mb-2 shadow-[0_0_20px_rgba(79,142,247,0.15)] animate-pulse">
                    <Sparkles size={16} />
                    Trial Period Concluded
                </div>
                <h1 className="text-5xl md:text-7xl font-black tracking-tight leading-tight text-white">
                    Scale Your Business <br />
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-primary via-brand-secondary to-brand-accent">
                        Without Limits
                    </span>
                </h1>
                <p className="text-text-secondary text-lg md:text-xl max-w-2xl mx-auto leading-relaxed">
                    Don't let your momentum stop here. Reactivate your dashboard and keep your business running smoothly with Stock Sewa.
                </p>
            </header>

            {/* Pricing Section */}
            <div className="grid md:grid-cols-2 gap-8 relative">
                {/* Decorative background for grid */}
                <div className="absolute inset-0 bg-brand-primary/5 blur-[100px] -z-10 rounded-full" />

                {plans.map((plan) => (
                    <div
                        key={plan.id}
                        onClick={() => setSelectedPlan(plan.id)}
                        className={`group relative glass-card p-10 cursor-pointer transition-all duration-500 hover:scale-[1.02] ${selectedPlan === plan.id
                                ? 'border-brand-primary ring-2 ring-brand-primary/20 bg-white/10'
                                : 'border-white/10 hover:border-white/20'
                            }`}
                    >
                        {plan.popular && (
                            <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-gradient-to-r from-brand-primary to-brand-secondary text-white text-[10px] font-black uppercase tracking-[0.2em] px-4 py-1.5 rounded-full shadow-lg shadow-brand-primary/30 z-20">
                                Most Popular
                            </div>
                        )}

                        <div className="flex justify-between items-start mb-8">
                            <div>
                                <h3 className="text-2xl font-bold text-white mb-2 group-hover:text-brand-primary transition-colors">{plan.name}</h3>
                                <p className="text-text-muted text-sm font-medium">{plan.description}</p>
                            </div>
                            <div className={`p-3 rounded-xl transition-all duration-300 ${selectedPlan === plan.id ? 'bg-brand-primary/20 text-brand-primary' : 'bg-white/5 text-text-muted'
                                }`}>
                                {plan.id === 'yearly' ? <Zap size={24} /> : <Rocket size={24} />}
                            </div>
                        </div>

                        <div className="mb-8">
                            <div className="flex items-baseline gap-2">
                                <span className="text-5xl font-black text-white">Rs. {plan.price}</span>
                                <span className="text-text-muted font-bold text-sm uppercase tracking-widest">{plan.period}</span>
                            </div>
                        </div>

                        <ul className="space-y-4 mb-10">
                            {plan.features.map((feature) => (
                                <li key={feature} className="flex items-center gap-3 text-text-secondary group-hover:text-white transition-colors duration-300">
                                    <div className="flex-shrink-0 w-6 h-6 rounded-full bg-brand-success/10 flex items-center justify-center border border-brand-success/20">
                                        <Check size={14} className="text-brand-success" />
                                    </div>
                                    <span className="text-sm font-medium">{feature}</span>
                                </li>
                            ))}
                        </ul>

                        <div className={`w-full py-4 rounded-xl text-center font-bold tracking-wide transition-all duration-300 border ${selectedPlan === plan.id
                                ? 'bg-brand-primary text-white border-transparent shadow-[0_10px_30px_rgba(79,142,247,0.3)]'
                                : 'bg-white/5 text-text-secondary border-white/10 group-hover:bg-white/10'
                            }`}>
                            {selectedPlan === plan.id ? 'Plan Selected' : 'Choose This Plan'}
                        </div>
                    </div>
                ))}
            </div>

            {/* Payment Section */}
            <div className="relative">
                <div className="glass-card p-12 overflow-hidden border-brand-primary/30">
                    {/* Background decoration for section */}
                    <div className="absolute top-0 right-0 w-64 h-64 bg-brand-primary/10 blur-[100px] -z-10" />
                    <div className="absolute bottom-0 left-0 w-64 h-64 bg-brand-secondary/10 blur-[100px] -z-10" />

                    <div className="flex flex-col lg:flex-row gap-16 items-center">
                        <div className="flex-1 space-y-8">
                            <div className="space-y-4">
                                <div className="p-3 bg-brand-primary/10 rounded-xl w-fit text-brand-primary">
                                    <CreditCard size={28} />
                                </div>
                                <h2 className="text-3xl font-black text-white">Secure Manual Activation</h2>
                                <p className="text-text-secondary leading-relaxed">
                                    Finalize your subscription in three simple steps:
                                    <br />1. Scan the QR code. 2. Make the payment. 3. Submit your Transaction ID below.
                                </p>
                            </div>

                            <div className="space-y-6">
                                <div className="space-y-3">
                                    <label className="text-xs font-black uppercase tracking-[0.2em] text-text-muted flex items-center gap-2">
                                        <ShieldCheck size={14} className="text-brand-success" />
                                        Transaction ID / TID
                                    </label>
                                    <div className="relative group">
                                        <input
                                            type="text"
                                            value={transactionId}
                                            onChange={(e) => setTransactionId(e.target.value)}
                                            placeholder="Example: ASE8921JHK"
                                            className="glass-input h-16 px-6 text-xl font-bold border-white/10 focus:border-brand-primary bg-white/[0.03] transition-all"
                                        />
                                        <div className="absolute right-4 top-1/2 -translate-y-1/2 text-brand-primary opacity-0 group-focus-within:opacity-100 transition-opacity">
                                            <Send size={20} />
                                        </div>
                                    </div>
                                </div>
                                <button
                                    onClick={handleSubmit}
                                    disabled={loading || !transactionId}
                                    className="glass-button glass-button-primary w-full h-16 text-lg font-black uppercase tracking-widest justify-center shadow-2xl hover:scale-[1.01]"
                                >
                                    {loading ? (
                                        <div className="flex items-center gap-3">
                                            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                            Verifying...
                                        </div>
                                    ) : (
                                        'Activate Subscriptions'
                                    )}
                                </button>
                                <p className="text-center text-[10px] text-text-muted font-bold tracking-[0.1em] uppercase">
                                    Activations are typically processed within 30-120 minutes.
                                </p>
                            </div>
                        </div>

                        <div className="w-full lg:w-[400px] space-y-6">
                            <div className="relative group">
                                {/* Glowing outer ring */}
                                <div className="absolute inset-0 bg-brand-primary/20 blur-[40px] rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-700" />

                                <div className="relative p-10 bg-white/5 rounded-3xl border border-white/10 backdrop-blur-xl flex flex-col items-center">
                                    <div className="w-full aspect-square bg-white rounded-2xl mb-8 flex items-center justify-center p-3 shadow-inner relative overflow-hidden group-hover:scale-[1.02] transition-transform duration-500">
                                        <div className="absolute inset-0 bg-gradient-to-br from-transparent via-brand-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

                                        {/* Mock QR Code UI */}
                                        <div className="w-full h-full bg-neutral-50 rounded flex flex-col items-center justify-center text-neutral-400 text-center gap-4">
                                            <div className="relative">
                                                <div className="w-40 h-40 border-[4px] border-neutral-200 border-dashed rounded-2xl flex items-center justify-center">
                                                    <div className="w-32 h-32 bg-neutral-100 rounded-lg flex items-center justify-center p-4">
                                                        <div className="grid grid-cols-2 gap-1 w-full h-full opacity-40">
                                                            <div className="bg-neutral-600 rounded-sm"></div>
                                                            <div className="bg-neutral-400 rounded-sm"></div>
                                                            <div className="bg-neutral-300 rounded-sm"></div>
                                                            <div className="bg-neutral-600 rounded-sm"></div>
                                                        </div>
                                                    </div>
                                                </div>
                                                {/* Scanning Effect Overlay */}
                                                <div className="absolute top-0 left-0 w-full h-1 bg-brand-primary shadow-[0_0_15px_rgba(79,142,247,0.8)] animate-[scan_3s_ease-in-out_infinite]" />
                                            </div>
                                            <div className="space-y-1">
                                                <p className="font-black text-neutral-800 tracking-tighter uppercase text-sm">Scan to Pay</p>
                                                <div className="h-1 w-8 bg-brand-primary mx-auto rounded-full" />
                                            </div>
                                        </div>
                                    </div>

                                    <div className="text-center space-y-2">
                                        <div className="flex items-center gap-2 text-white font-bold text-lg">
                                            <span className="text-text-muted font-medium text-sm">Account:</span>
                                            Krish Danuwar
                                        </div>
                                        <div className="flex items-center gap-2 text-brand-primary font-black text-sm tracking-widest uppercase">
                                            <span className="text-text-muted font-medium text-xs normal-case tracking-normal">eSewa ID:</span>
                                            9821818131
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Support Footer */}
            <footer className="text-center space-y-10 py-10">
                <div className="h-px w-full bg-gradient-to-r from-transparent via-white/10 to-transparent" />
                <div className="space-y-4">
                    <p className="text-text-secondary font-medium italic text-lg opacity-70">
                        "Reliable support for reliable businesses."
                    </p>
                    <div className="flex flex-col sm:flex-row gap-6 justify-center">
                        <a
                            href="https://wa.me/9779821818131"
                            target="_blank"
                            className="glass-button h-14 px-8 rounded-2xl border-brand-success/30 text-brand-success bg-brand-success/5 hover:bg-brand-success/10 hover:border-brand-success/50 transition-all font-bold gap-3 group"
                        >
                            <MessageCircle className="h-5 w-5 group-hover:scale-125 transition-transform" />
                            Direct WhatsApp Support
                        </a>
                    </div>
                </div>
            </footer>

            <style jsx>{`
                @keyframes scan {
                    0%, 100% { top: 0%; opacity: 0; }
                    10%, 90% { opacity: 1; }
                    50% { top: 100%; }
                }
            `}</style>
        </div>
    );
}
