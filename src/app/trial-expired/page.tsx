import React from 'react';
import { getOrgContext } from '@/lib/org-context';
import { Check, MessageCircle, CreditCard, Clock } from 'lucide-react';
import Link from 'next/link';

export default async function TrialExpiredPage() {
    const org = await getOrgContext();

    // In a real app, you'd fetch actual usage stats here.
    // For now, we'll use placeholders that feel personal.
    const stats = [
        { label: 'Days of Stock Sewa', value: '3', icon: Clock },
        { label: 'Premium Experience', value: 'Unlocked', icon: Check },
    ];

    const plans = [
        {
            name: 'Basic',
            price: '999',
            period: 'per month',
            description: 'Perfect for small shops starting out.',
            features: ['Unlimited Invoices', 'Stock Management', 'Basic Reports', 'Customer Database'],
            buttonText: 'Select Monthly',
            popular: false,
        },
        {
            name: 'Yearly',
            price: '9,588',
            period: 'per year',
            description: 'Best value for growing businesses.',
            features: ['Everything in Basic', '20% Discount included', 'Priority Support', 'Full Export Access'],
            buttonText: 'Select Yearly',
            popular: true,
        },
    ];

    return (
        <div className="min-h-screen bg-neutral-950 text-white flex flex-col items-center justify-center p-6 selection:bg-indigo-500/30">
            {/* Background Glow */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-indigo-600/10 blur-[120px] rounded-full" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-600/10 blur-[120px] rounded-full" />
            </div>

            <div className="max-w-5xl w-full z-10">
                <header className="text-center mb-16 space-y-4">
                    <div className="inline-flex items-center px-4 py-1.5 rounded-full bg-neutral-900 border border-neutral-800 text-sm font-medium text-indigo-400 mb-2">
                        Trial Period Ended
                    </div>
                    <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-b from-white to-neutral-500">
                        Continue your journey with <br /> Stock Sewa
                    </h1>
                    <p className="text-neutral-400 text-lg max-w-2xl mx-auto">
                        Your trial has expired, but your data is safe. Choose a plan below to keep managing your business efficiently.
                    </p>
                </header>

                <div className="grid md:grid-cols-2 gap-8 mb-16">
                    {plans.map((plan) => (
                        <div
                            key={plan.name}
                            className={`relative glass-card overflow-hidden transition-all duration-300 hover:border-indigo-500/50 group ${plan.popular ? 'ring-2 ring-indigo-500/20' : ''}`}
                            style={{ padding: 32 }}
                        >
                            {plan.popular && (
                                <div className="absolute top-0 right-0 bg-indigo-600 text-white text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded-bl-lg">
                                    Recommended
                                </div>
                            )}
                            <div className="mb-6">
                                <h3 className="text-2xl font-bold text-white mb-2">{plan.name}</h3>
                                <p className="text-neutral-400 text-sm">{plan.description}</p>
                            </div>
                            <div className="space-y-6">
                                <div className="flex items-baseline gap-1">
                                    <span className="text-4xl font-bold text-white">Rs. {plan.price}</span>
                                    <span className="text-neutral-500 text-sm">{plan.period}</span>
                                </div>
                                <ul className="space-y-3">
                                    {plan.features.map((feature) => (
                                        <li key={feature} className="flex items-center gap-3 text-sm text-neutral-300">
                                            <div className="h-5 w-5 rounded-full bg-indigo-500/10 flex items-center justify-center border border-indigo-500/20">
                                                <Check className="h-3 w-3 text-indigo-400" />
                                            </div>
                                            {feature}
                                        </li>
                                    ))}
                                </ul>
                                <button className="glass-button glass-button-primary w-full h-12 text-base font-semibold justify-center">
                                    {plan.buttonText}
                                </button>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Manual Payment Section */}
                <div className="glass-card mb-16" style={{ padding: 48 }}>
                    <div className="grid md:grid-cols-2 gap-12 items-center">
                        <div>
                            <h2 className="text-2xl font-bold mb-4 flex items-center gap-3">
                                <CreditCard className="text-indigo-400" />
                                Manual Payment via eSewa / Bank
                            </h2>
                            <p className="text-neutral-400 mb-6 text-sm leading-relaxed">
                                Scan the QR code to make your payment. Once done, enter your Transaction ID below and our team will activate your account within 2 hours.
                            </p>

                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <label className="glass-label">Transaction ID (TID)</label>
                                    <input
                                        type="text"
                                        placeholder="e.g. ABC123XYZ"
                                        className="glass-input h-12 px-4"
                                    />
                                </div>
                                <button className="glass-button glass-button-primary w-full h-12 font-bold uppercase tracking-tight justify-center">
                                    Submit for Verification
                                </button>
                            </div>
                        </div>

                        <div className="flex flex-col items-center justify-center p-8 bg-white/5 rounded-2xl border border-white/10">
                            <div className="w-48 h-48 bg-white rounded-xl mb-4 flex items-center justify-center p-2 shadow-2xl shadow-indigo-500/10">
                                {/* Placeholder for QR Code */}
                                <div className="w-full h-full bg-neutral-200 rounded flex flex-col items-center justify-center text-neutral-400 text-center text-xs p-4">
                                    <div className="w-24 h-24 border-2 border-dashed border-neutral-400 rounded-lg mb-2 flex items-center justify-center text-[8px] font-bold">
                                        QR CODE
                                    </div>
                                    <p className="font-semibold text-neutral-600">Scan to Pay</p>
                                </div>
                            </div>
                            <p className="text-sm text-neutral-400">Account: Krish Danuwar</p>
                            <p className="text-xs text-neutral-500">eSewa ID: 98XXXXXXXX</p>
                        </div>
                    </div>
                </div>

                <footer className="text-center space-y-6">
                    <p className="text-neutral-500 text-sm">
                        Need help? Chat with our support team instantly.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <Link href="https://wa.me/97798XXXXXXXX" target="_blank" className="glass-button border-emerald-500/50 text-emerald-400 hover:bg-emerald-500/10 gap-2 h-11 px-6">
                            <MessageCircle className="h-4 w-4" />
                            Chat on WhatsApp
                        </Link>
                    </div>
                </footer>
            </div>
        </div>
    );
}
