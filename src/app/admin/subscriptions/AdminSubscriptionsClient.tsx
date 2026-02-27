'use client';

import { useState, useMemo } from 'react';
import { activateSubscription, rejectSubscription } from '@/lib/actions/subscriptions';
import { toast } from 'sonner';
import { CheckCircle, XCircle, Shield, Search, RefreshCw, Filter, History, ChevronDown } from 'lucide-react';
import { PLANS } from '@/config/plans';

interface Org {
    id: string;
    name: string;
    subscription_plan: string;
    subscription_status: string;
    last_transaction_id: string | null;
    trial_ends_at: string | null;
    subscription_ends_at: string | null;
    created_at: string;
}

export default function AdminSubscriptionsClient({ initialOrgs }: { initialOrgs: Org[] }) {
    const [orgs, setOrgs] = useState(initialOrgs);
    const [loadingId, setLoadingId] = useState<string | null>(null);
    const [actionType, setActionType] = useState<'activate' | 'reject' | null>(null);
    const [search, setSearch] = useState('');
    const [showOnlyPending, setShowOnlyPending] = useState(true);
    const [selectedPlans, setSelectedPlans] = useState<Record<string, string>>({});

    const handleActivate = async (id: string, plan: string) => {
        if (!confirm(`Verify and ACTIVATE ${plan} plan for this shop?`)) return;

        setLoadingId(id);
        setActionType('activate');
        const result = await activateSubscription(id, plan as 'monthly' | 'yearly');
        if (result.success) {
            toast.success('Subscription activated successfully!');
            setOrgs(prev => prev.map(o => o.id === id ? { ...o, subscription_status: 'active', last_transaction_id: null } : o));
        } else {
            toast.error(result.error || 'Activation failed');
        }
        setLoadingId(null);
        setActionType(null);
    };

    const handleReject = async (id: string) => {
        if (!confirm('Reject this payment request? This will clear the transaction ID.')) return;

        setLoadingId(id);
        setActionType('reject');
        const result = await rejectSubscription(id);
        if (result.success) {
            toast.success('Request rejected');
            setOrgs(prev => prev.map(o => o.id === id ? { ...o, subscription_status: 'inactive', last_transaction_id: null } : o));
        } else {
            toast.error(result.error || 'Rejection failed');
        }
        setLoadingId(null);
        setActionType(null);
    };

    const displayOrgs = useMemo(() => {
        let filtered = orgs.filter(o =>
            o.name.toLowerCase().includes(search.toLowerCase()) ||
            o.last_transaction_id?.toLowerCase().includes(search.toLowerCase())
        );

        if (showOnlyPending) {
            filtered = filtered.filter(o => o.last_transaction_id && o.subscription_status !== 'active');
        }

        // Sort: Pending requests first, then by creation date
        return filtered.sort((a, b) => {
            const aPending = a.last_transaction_id && a.subscription_status !== 'active';
            const bPending = b.last_transaction_id && b.subscription_status !== 'active';
            if (aPending && !bPending) return -1;
            if (!aPending && bPending) return 1;
            return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
        });
    }, [orgs, search, showOnlyPending]);

    return (
        <div className="animate-fade-in-up">
            <header className="page-header" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div>
                    <h1 className="page-title">Subscription Control Center</h1>
                    <p className="page-subtitle">Verify payment transaction IDs and manage user plans</p>
                </div>
                <div className="badge badge-info h-10 px-4 gap-2 shadow-sm">
                    <Shield size={16} />
                    <span className="font-bold tracking-tight">Authorized Admin Access</span>
                </div>
            </header>

            <div className="glass-card mb-8" style={{ padding: '20px 24px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
                    <div style={{ position: 'relative', flex: 1, maxWidth: 400 }}>
                        <Search style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)' }} size={18} className="text-muted" />
                        <input
                            className="glass-input"
                            placeholder="Find shop or transaction ID..."
                            style={{ paddingLeft: 48 }}
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>

                    <button
                        className={`glass-button ${showOnlyPending ? 'glass-button-primary' : ''}`}
                        onClick={() => setShowOnlyPending(!showOnlyPending)}
                        style={{ height: 42 }}
                    >
                        <Filter size={16} />
                        {showOnlyPending ? 'Viewing Pending Submissions' : 'Viewing All Organizations'}
                    </button>

                    <div className="ml-auto text-[10px] font-bold text-muted uppercase tracking-widest bg-white/5 px-4 py-2 rounded-full border border-white/5">
                        {displayOrgs.length} Records Found
                    </div>
                </div>
            </div>

            <div className="glass-card overflow-hidden" style={{ minHeight: 400 }}>
                <table className="glass-table">
                    <thead>
                        <tr>
                            <th style={{ width: '25%' }}>Organization</th>
                            <th style={{ width: '15%' }}>Plan Detail</th>
                            <th style={{ width: '25%' }}>Transaction Identification</th>
                            <th style={{ width: '15%' }}>Status / Expiry</th>
                            <th style={{ width: '20%', textAlign: 'right' }}>Management Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {displayOrgs.length > 0 ? displayOrgs.map((org: Org) => {
                            const isPending = org.last_transaction_id && org.subscription_status !== 'active';

                            return (
                                <tr key={org.id} style={{
                                    background: isPending ? 'rgba(79, 142, 247, 0.03)' : 'transparent',
                                }}>
                                    <td>
                                        <div className="font-bold text-primary">{org.name}</div>
                                        <div className="text-[10px] text-muted font-mono uppercase tracking-tighter mt-0.5">{org.id}</div>
                                    </td>
                                    <td>
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                                            <div className="relative group">
                                                <select
                                                    className="appearance-none bg-white/5 border border-white/10 rounded px-3 py-1.5 pr-8 text-[10px] font-extrabold uppercase tracking-widest text-primary focus:outline-none focus:border-brand-primary transition-colors cursor-pointer w-full"
                                                    value={selectedPlans[org.id] || org.subscription_plan || 'monthly'}
                                                    onChange={(e) => setSelectedPlans(prev => ({ ...prev, [org.id]: e.target.value }))}
                                                >
                                                    {Object.values(PLANS).filter(p => p.id !== 'trial').map(p => (
                                                        <option key={p.id} value={p.id} className="bg-bg-secondary">{p.name}</option>
                                                    ))}
                                                </select>
                                                <ChevronDown size={12} className="absolute right-2 top-1/2 -translate-y-1/2 text-muted pointer-events-none" />
                                            </div>
                                            {org.subscription_plan && (
                                                <span className="text-[9px] text-brand-primary/60 font-medium uppercase tracking-tighter">
                                                    Requested: {org.subscription_plan}
                                                </span>
                                            )}
                                        </div>
                                    </td>
                                    <td>
                                        {org.last_transaction_id ? (
                                            <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                                    <code className="bg-brand-primary/10 border border-brand-primary/20 px-3 py-1.5 rounded-lg text-brand-primary font-black tracking-widest text-[11px] shadow-[0_0_15px_rgba(79,142,247,0.15)]">
                                                        {org.last_transaction_id}
                                                    </code>
                                                </div>
                                                <span className="text-[9px] font-black text-brand-primary/60 uppercase tracking-widest ml-1 animate-pulse">Waiting for Verification</span>
                                            </div>
                                        ) : (
                                            <span className="text-muted text-[10px] italic font-medium uppercase tracking-widest opacity-40">No Pending Submission</span>
                                        )}
                                    </td>
                                    <td>
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                                                <div className={`h-1.5 w-1.5 rounded-full ${org.subscription_status === 'active' ? 'bg-emerald-500 shadow-[0_0_8px_var(--brand-success)]' : 'bg-brand-warning animate-pulse'}`} />
                                                <span className={`text-[10px] font-black uppercase tracking-tight ${org.subscription_status === 'active' ? 'text-emerald-400' : 'text-brand-warning'}`}>
                                                    {org.subscription_status}
                                                </span>
                                            </div>
                                            <span className="text-[10px] text-muted font-bold">
                                                {org.subscription_ends_at
                                                    ? `Exp: ${new Date(org.subscription_ends_at).toLocaleDateString()}`
                                                    : org.trial_ends_at
                                                        ? `Trial ends: ${new Date(org.trial_ends_at).toLocaleDateString()}`
                                                        : 'N/A'
                                                }
                                            </span>
                                        </div>
                                    </td>
                                    <td style={{ textAlign: 'right' }}>
                                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
                                            <button
                                                className={`glass-button ${isPending ? 'glass-button-primary' : ''} h-9 px-4 text-[10px] font-black tracking-tighter`}
                                                onClick={() => handleActivate(org.id, selectedPlans[org.id] || org.subscription_plan || 'monthly')}
                                                disabled={loadingId === org.id}
                                            >
                                                {loadingId === org.id && actionType === 'activate' ? <RefreshCw className="animate-spin" size={12} /> : <CheckCircle size={12} />}
                                                VERIFY & ACTIVATE
                                            </button>

                                            {isPending && (
                                                <button
                                                    className="glass-button h-9 px-4 text-[10px] font-black tracking-tighter"
                                                    style={{ color: 'var(--brand-danger)', borderColor: 'rgba(239, 68, 68, 0.2)' }}
                                                    onClick={() => handleReject(org.id)}
                                                    disabled={loadingId === org.id}
                                                >
                                                    {loadingId === org.id && actionType === 'reject' ? <RefreshCw className="animate-spin" size={12} /> : <XCircle size={12} />}
                                                    REJECT
                                                </button>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            );
                        }) : (
                            <tr>
                                <td colSpan={5} style={{ textAlign: 'center', padding: '100px 0' }}>
                                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16 }}>
                                        <div className="w-16 h-16 rounded-2xl bg-white/5 flex items-center justify-center text-muted border border-white/5">
                                            <History size={32} />
                                        </div>
                                        <div>
                                            <p className="font-bold text-primary">No submissions found</p>
                                            <p className="text-xs text-muted mt-1">Check search filters or view all organizations.</p>
                                        </div>
                                    </div>
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
