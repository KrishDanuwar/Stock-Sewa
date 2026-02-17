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
        <div className="p-4 md:p-8 space-y-8 animate-fade-in">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-surface-900 tracking-tight">Billing & Activation</h1>
                    <p className="text-surface-500 mt-1">Manage your access for {organizationName}</p>
                </div>
                <div className={`px-4 py-2 rounded-full text-sm font-semibold flex items-center gap-2 ${subscriptionStatus === 'active' || subscriptionStatus === 'trialing'
                    ? 'bg-green-100 text-green-700'
                    : 'bg-red-100 text-red-700'
                    }`}>
                    <CheckCircle2 size={16} />
                    Status: {subscriptionStatus.charAt(0).toUpperCase() + subscriptionStatus.slice(1)}
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
                {/* Plans */}
                <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6">
                    {PLANS.map((plan) => (
                        <div
                            key={plan.name}
                            className={`card p-8 flex flex-col relative overflow-hidden h-full ${plan.popular ? 'border-primary-500 ring-1 ring-primary-500' : ''}`}
                        >
                            {plan.popular && (
                                <div className="absolute top-0 right-0 bg-primary-500 text-white text-[10px] font-bold px-3 py-1 rounded-bl-lg uppercase tracking-widest">
                                    Popular
                                </div>
                            )}

                            <div className="mb-6">
                                <h3 className="text-lg font-bold text-surface-900 mb-2">{plan.name}</h3>
                                <div className="flex items-baseline gap-1">
                                    <span className="text-3xl font-bold text-surface-900">{plan.price}</span>
                                    <span className="text-surface-500">/year</span>
                                </div>
                            </div>

                            <ul className="space-y-4 mb-8 flex-grow">
                                {plan.features.map((feature) => (
                                    <li key={feature} className="flex items-center gap-3 text-sm text-surface-600">
                                        <div className="p-0.5 bg-primary-100 text-primary-600 rounded-full">
                                            <CheckCircle2 size={14} />
                                        </div>
                                        {feature}
                                    </li>
                                ))}
                            </ul>

                            <button
                                onClick={handleNotifyPayment}
                                disabled={subscriptionStatus === 'active'}
                                className={`w-full py-3 rounded-xl font-semibold transition-all duration-200 flex items-center justify-center gap-2 ${plan.popular
                                    ? 'bg-primary-600 text-white hover:bg-primary-700 shadow-md'
                                    : 'bg-surface-100 text-surface-900 hover:bg-surface-200'
                                    }`}
                            >
                                {subscriptionStatus === 'active' ? 'Plan Active' : notified ? 'Request Sent!' : 'Choose Plan'}
                            </button>
                        </div>
                    ))}
                </div>

                {/* Local Payment Instructions */}
                <div className="space-y-4">
                    <div className="card p-6 border-l-4 border-l-primary-500 bg-primary-50 md:sticky md:top-8">
                        <h3 className="text-lg font-bold text-primary-900 mb-4 flex items-center gap-2">
                            <Zap size={20} />
                            How to Activate
                        </h3>
                        <p className="text-sm text-primary-800 mb-6">
                            Since we are locally based in Nepal, please use its following options for payment. Your account will be activated within 1-2 hours.
                        </p>

                        <div className="space-y-4">
                            <div className="p-4 bg-white rounded-xl shadow-sm border border-primary-100">
                                <p className="text-[10px] font-bold text-surface-400 uppercase tracking-widest mb-1">eSewa ID</p>
                                <p className="font-bold text-surface-900">98XXXXXXXX</p>
                                <p className="text-xs text-surface-500">MeroStock Official</p>
                            </div>
                            <div className="p-4 bg-white rounded-xl shadow-sm border border-primary-100">
                                <p className="text-[10px] font-bold text-surface-400 uppercase tracking-widest mb-1">Khalti ID</p>
                                <p className="font-bold text-surface-900">98XXXXXXXX</p>
                                <p className="text-xs text-surface-500">MeroStock Official</p>
                            </div>
                            <div className="p-4 bg-white rounded-xl shadow-sm border border-primary-100">
                                <p className="text-[10px] font-bold text-surface-400 uppercase tracking-widest mb-1">Bank Transfer</p>
                                <p className="font-bold text-surface-900">XXXX-XXXX-XXXX</p>
                                <p className="text-xs text-surface-500">Global IME Bank (MeroStock Pvt Ltd)</p>
                            </div>
                        </div>

                        <div className="mt-8 pt-6 border-t border-primary-100">
                            <h4 className="text-sm font-bold text-primary-900 mb-2 flex items-center gap-2">
                                <Phone size={16} />
                                Support
                            </h4>
                            <p className="text-xs text-primary-700">Call/WhatsApp: +977 98XXXXXXXX</p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="card p-6 bg-surface-50 border-dashed border-2 flex items-center gap-4 max-w-6xl mx-auto">
                <div className="p-3 bg-white rounded-xl shadow-sm">
                    <Building2 className="text-surface-400" />
                </div>
                <div>
                    <h4 className="font-bold text-surface-900 text-sm">Growing your business?</h4>
                    <p className="text-xs text-surface-500 mt-1">Contact us for custom multi-branch solutions and hardware bundle offers (Thermal Printers & Scanners).</p>
                </div>
            </div>
        </div>
    );
}
