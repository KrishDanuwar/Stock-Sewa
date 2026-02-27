'use client';

import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { addAdminEmail, removeAdminEmail } from '@/lib/actions/admin-management';
import { activateSubscription, rejectSubscription } from '@/lib/actions/subscriptions';
import { toast } from 'sonner';
import {
    ShieldCheck, UserPlus, Trash2, Mail, Lock, AlertCircle, Info,
    CheckCircle2, ArrowLeft, History, Users, ShieldAlert, X,
    CreditCard, Search, Filter, RefreshCw, XCircle, ChevronDown, Activity, Settings2
} from 'lucide-react';
import { PLANS } from '@/config/plans';

type AdminEntry = { id: string; email: string; created_at: string };
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

export default function AdminDashboardClient({
    initialAdmins,
    initialOrgs
}: {
    initialAdmins: AdminEntry[],
    initialOrgs: Org[]
}) {
    const router = useRouter();
    const [activeTab, setActiveTab] = useState<'subscriptions' | 'masters'>('subscriptions');

    // --- Subscriptions State ---
    const [orgs, setOrgs] = useState(initialOrgs);
    const [loadingId, setLoadingId] = useState<string | null>(null);
    const [actionType, setActionType] = useState<'activate' | 'reject' | null>(null);
    const [subSearch, setSubSearch] = useState('');
    const [showOnlyPending, setShowOnlyPending] = useState(true);
    const [selectedPlans, setSelectedPlans] = useState<Record<string, string>>({});

    // --- Masters State ---
    const [email, setEmail] = useState('');
    const [masterLoading, setMasterLoading] = useState(false);
    const [showAddModal, setShowAddModal] = useState(false);

    // --- Subscription Handlers ---
    async function handleActivate(id: string, plan: string) {
        if (!confirm(`Verify and ACTIVATE ${plan} plan for this shop?`)) return;
        setLoadingId(id);
        setActionType('activate');
        const result = await activateSubscription(id, plan);
        if (result.success) {
            toast.success('Subscription activated successfully!');
            setOrgs(prev => prev.map(o => o.id === id ? { ...o, subscription_status: 'active', last_transaction_id: null, subscription_plan: plan } : o));
        } else {
            toast.error(result.error || 'Activation failed');
        }
        setLoadingId(null);
        setActionType(null);
    }

    async function handleReject(id: string) {
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
    }

    // --- Master Handlers ---
    async function handleAddMaster(e: React.FormEvent) {
        e.preventDefault();
        if (!email) return;
        setMasterLoading(true);
        const result = await addAdminEmail(email);
        if (result.error) {
            toast.error(result.error);
        } else {
            toast.success('Admin authorized successfully');
            setEmail('');
            setShowAddModal(false);
            router.refresh(); // Refresh to get updated admin list if needed (though we'd likely need to update state if we want instant change)
        }
        setMasterLoading(false);
    }

    async function handleRemoveMaster(id: string, adminEmail: string) {
        if (adminEmail === 'junsangsingh@gmail.com') return toast.error('Primary system owner cannot be revoked');
        if (!confirm(`Revoke admin access for ${adminEmail}?`)) return;
        setMasterLoading(true);
        const result = await removeAdminEmail(id);
        if (result.error) toast.error(result.error);
        else {
            toast.success('Access revoked');
            router.refresh();
        }
        setMasterLoading(false);
    }

    // --- Memoized Filters ---
    const filteredOrgs = useMemo(() => {
        let list = orgs.filter(o =>
            o.name.toLowerCase().includes(subSearch.toLowerCase()) ||
            o.last_transaction_id?.toLowerCase().includes(subSearch.toLowerCase())
        );
        if (showOnlyPending) {
            list = list.filter(o => o.last_transaction_id && o.subscription_status !== 'active');
        }
        return list.sort((a, b) => {
            const aP = a.last_transaction_id && a.subscription_status !== 'active';
            const bP = b.last_transaction_id && b.subscription_status !== 'active';
            if (aP && !bP) return -1;
            if (!aP && bP) return 1;
            return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
        });
    }, [orgs, subSearch, showOnlyPending]);

    const pendingCount = orgs.filter(o => o.last_transaction_id && o.subscription_status !== 'active').length;
    const totalMasters = initialAdmins.length + 1;

    return (
        <div className="animate-fade-in-up">
            {/* Header Section */}
            <div className="page-header" style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 24 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                    <button onClick={() => router.back()} className="glass-button h-10 w-10 !p-0" title="Go Back">
                        <ArrowLeft size={18} />
                    </button>
                    <div>
                        <h1 className="page-title text-3xl">System Dashboard</h1>
                        <p className="page-subtitle">Central control for shop subscriptions and master security</p>
                    </div>
                </div>
                {activeTab === 'masters' && (
                    <button onClick={() => setShowAddModal(true)} className="glass-button glass-button-primary shadow-lg animate-fade-in">
                        <UserPlus size={16} /> Authorize Master
                    </button>
                )}
            </div>

            {/* Stats Bar */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 20, marginBottom: 32 }}>
                <div className="glass-card flex items-center gap-4 transition-all hover:scale-[1.02]" style={{ padding: '24px' }}>
                    <div className="w-12 h-12 rounded-xl bg-brand-primary/10 flex items-center justify-center text-brand-primary border border-brand-primary/10">
                        <Activity size={24} />
                    </div>
                    <div>
                        <div className="text-[10px] font-black text-muted uppercase tracking-widest">Pending Requests</div>
                        <div className={`text-2xl font-black ${pendingCount > 0 ? 'text-amber-500' : 'text-primary'}`}>
                            {pendingCount}
                        </div>
                    </div>
                </div>
                <div className="glass-card flex items-center gap-4 transition-all hover:scale-[1.02]" style={{ padding: '24px' }}>
                    <div className="w-12 h-12 rounded-xl bg-purple-500/10 flex items-center justify-center text-purple-500 border border-purple-500/10">
                        <Users size={24} />
                    </div>
                    <div>
                        <div className="text-[10px] font-black text-muted uppercase tracking-widest">Active Masters</div>
                        <div className="text-2xl font-black text-primary">{totalMasters}</div>
                    </div>
                </div>
                <div className="glass-card flex items-center gap-4 transition-all hover:scale-[1.02]" style={{ padding: '24px', borderLeft: '4px solid var(--brand-success)' }}>
                    <div className="w-12 h-12 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-500 border border-emerald-500/10">
                        <ShieldCheck size={24} />
                    </div>
                    <div>
                        <div className="text-[10px] font-black text-muted uppercase tracking-widest">Security Status</div>
                        <div className="text-2xl font-black text-emerald-500">ROOT LEVEL</div>
                    </div>
                </div>
            </div>

            {/* Premium Tab Switcher */}
            <div className="flex gap-2 mb-6 p-1.5 bg-white/5 w-fit rounded-2xl border border-white/10 glass-card">
                <button
                    onClick={() => setActiveTab('subscriptions')}
                    className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${activeTab === 'subscriptions' ? 'bg-brand-primary text-white shadow-lg' : 'text-muted hover:text-primary hover:bg-white/5'}`}
                >
                    <CreditCard size={14} /> Subscriptions
                </button>
                <button
                    onClick={() => setActiveTab('masters')}
                    className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${activeTab === 'masters' ? 'bg-brand-primary text-white shadow-lg' : 'text-muted hover:text-primary hover:bg-white/5'}`}
                >
                    <Lock size={14} /> Master Access
                </button>
            </div>

            {/* Main Content Area */}
            <div className="glass-card min-h-[500px]" style={{ padding: 0, overflow: 'hidden' }}>
                {activeTab === 'subscriptions' ? (
                    <>
                        <div className="p-6 border-b border-white/5 flex items-center justify-between bg-white/[0.02]">
                            <div className="flex items-center gap-4 flex-1">
                                <div className="relative flex-1 max-w-sm">
                                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted" size={16} />
                                    <input
                                        className="glass-input !pl-12 !h-11"
                                        placeholder="Search shop or transaction..."
                                        value={subSearch}
                                        onChange={(e) => setSubSearch(e.target.value)}
                                    />
                                </div>
                                <button
                                    onClick={() => setShowOnlyPending(!showOnlyPending)}
                                    className={`glass-button h-11 px-6 !text-[10px] font-black ${showOnlyPending ? 'glass-button-primary' : ''}`}
                                >
                                    <Filter size={14} /> {showOnlyPending ? 'PENDING ONLY' : 'SHOW ALL'}
                                </button>
                            </div>
                            <div className="flex items-center gap-2 text-[10px] text-muted font-black uppercase tracking-[0.2em] opacity-40">
                                Global Live Schema Sync
                            </div>
                        </div>

                        <table className="glass-table">
                            <thead>
                                <tr>
                                    <th style={{ paddingLeft: 24 }}>Shop / ID</th>
                                    <th>Verification ID</th>
                                    <th>Status / Expiry</th>
                                    <th style={{ textAlign: 'right', paddingRight: 24 }}>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredOrgs.length > 0 ? filteredOrgs.map(org => {
                                    const isPending = org.last_transaction_id && org.subscription_status !== 'active';
                                    return (
                                        <tr key={org.id} className={`${isPending ? 'bg-brand-primary/5' : ''}`}>
                                            <td style={{ paddingLeft: 24 }}>
                                                <div className="flex flex-col">
                                                    <span className="font-bold text-primary">{org.name}</span>
                                                    <span className="text-[9px] text-muted font-mono">{org.id}</span>
                                                </div>
                                            </td>
                                            <td>
                                                {org.last_transaction_id ? (
                                                    <div className="flex flex-col gap-1">
                                                        <code className="bg-brand-primary/10 border border-brand-primary/20 px-3 py-1.5 rounded-lg text-brand-primary font-black tracking-widest text-[11px] w-fit">
                                                            {org.last_transaction_id}
                                                        </code>
                                                        <span className="text-[8px] text-amber-500 font-black uppercase ml-1">Waiting Verification</span>
                                                    </div>
                                                ) : <span className="text-[10px] text-muted/30 italic">No submissions</span>}
                                            </td>
                                            <td>
                                                <div className="flex flex-col gap-1">
                                                    <div className="flex items-center gap-2">
                                                        <div className={`h-1.5 w-1.5 rounded-full ${org.subscription_status === 'active' ? 'bg-emerald-500' : 'bg-brand-warning animate-pulse'}`} />
                                                        <span className={`text-[10px] font-black uppercase ${org.subscription_status === 'active' ? 'text-emerald-400' : 'text-brand-warning'}`}>
                                                            {org.subscription_status}
                                                        </span>
                                                    </div>
                                                    <span className="text-[10px] text-muted font-bold">
                                                        {org.subscription_ends_at ? `Exp: ${new Date(org.subscription_ends_at).toLocaleDateString()}` : org.trial_ends_at ? `Trial: ${new Date(org.trial_ends_at).toLocaleDateString()}` : 'N/A'}
                                                    </span>
                                                </div>
                                            </td>
                                            <td style={{ textAlign: 'right', paddingRight: 24 }}>
                                                <div className="flex justify-end gap-3">
                                                    <div className="relative group min-w-[120px]">
                                                        <select
                                                            className="appearance-none bg-white/5 border border-white/10 rounded-lg px-3 py-2 pr-8 text-[10px] font-black uppercase tracking-wider text-primary focus:outline-none focus:border-brand-primary transition-all cursor-pointer w-full h-9"
                                                            value={selectedPlans[org.id] || org.subscription_plan || 'monthly'}
                                                            onChange={(e) => setSelectedPlans(prev => ({ ...prev, [org.id]: e.target.value }))}
                                                        >
                                                            {Object.values(PLANS).filter(p => p.id !== 'trial').map(p => (
                                                                <option key={p.id} value={p.id} className="bg-bg-secondary">{p.name}</option>
                                                            ))}
                                                        </select>
                                                        <ChevronDown size={12} className="absolute right-2 top-1/2 -translate-y-1/2 text-muted pointer-events-none" />
                                                    </div>
                                                    <button
                                                        onClick={() => handleActivate(org.id, selectedPlans[org.id] || org.subscription_plan || 'monthly')}
                                                        className={`glass-button !h-9 !px-4 !text-[9px] font-black ${isPending ? 'glass-button-primary' : ''}`}
                                                        disabled={loadingId === org.id}
                                                    >
                                                        {loadingId === org.id && actionType === 'activate' ? <RefreshCw className="animate-spin" size={14} /> : <CheckCircle2 size={14} />}
                                                        ACTIVATE
                                                    </button>
                                                    {isPending && (
                                                        <button
                                                            onClick={() => handleReject(org.id)}
                                                            className="glass-button !h-9 !px-4 !text-[9px] font-black border-red-500/20 text-red-500"
                                                            disabled={loadingId === org.id}
                                                        >
                                                            {loadingId === org.id && actionType === 'reject' ? <RefreshCw className="animate-spin" size={14} /> : <XCircle size={14} />}
                                                            REJECT
                                                        </button>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                }) : (
                                    <tr>
                                        <td colSpan={4} className="py-32 text-center opacity-40">
                                            <Activity size={48} className="mx-auto mb-4" />
                                            <p className="text-sm font-bold uppercase tracking-widest">No matching records</p>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </>
                ) : (
                    <>
                        <div className="p-6 border-b border-white/5 flex items-center justify-between bg-white/[0.02]">
                            <div className="flex items-center gap-3">
                                <ShieldCheck size={20} className="text-brand-primary" />
                                <h2 className="text-sm font-bold uppercase tracking-widest">Master Security Clearance</h2>
                            </div>
                            <div className="flex items-center gap-2 text-[10px] text-muted font-black uppercase tracking-widest opacity-40">
                                Secure Root Authentication
                            </div>
                        </div>

                        <table className="glass-table">
                            <thead>
                                <tr>
                                    <th style={{ paddingLeft: 24 }}>Master Profile</th>
                                    <th style={{ textAlign: 'center' }}>Permission</th>
                                    <th style={{ textAlign: 'center' }}>Added Date</th>
                                    <th style={{ textAlign: 'right', paddingRight: 24 }}>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {/* Root Admin */}
                                <tr className="bg-brand-primary/5">
                                    <td style={{ paddingLeft: 24 }}>
                                        <div className="flex items-center gap-4 py-2">
                                            <div className="w-10 h-10 rounded-xl bg-brand-primary/20 flex items-center justify-center text-brand-primary text-xs font-black border border-brand-primary/20">JS</div>
                                            <div className="flex flex-col">
                                                <span className="font-bold text-primary flex items-center gap-2">
                                                    junsangsingh@gmail.com <CheckCircle2 size={14} className="text-brand-primary" />
                                                </span>
                                                <span className="text-[9px] text-muted font-black uppercase tracking-widest">Primary System Owner</span>
                                            </div>
                                        </div>
                                    </td>
                                    <td style={{ textAlign: 'center' }}><span className="badge badge-success">IMMUTABLE ROOT</span></td>
                                    <td style={{ textAlign: 'center' }}><span className="text-xs font-bold text-muted opacity-50 uppercase">Genesis</span></td>
                                    <td style={{ textAlign: 'right', paddingRight: 24 }}>
                                        <div className="flex justify-end pr-3 opacity-20"><Lock size={16} /></div>
                                    </td>
                                </tr>

                                {initialAdmins.filter(a => a.email !== 'junsangsingh@gmail.com').map(admin => (
                                    <tr key={admin.id}>
                                        <td style={{ paddingLeft: 24 }}>
                                            <div className="flex items-center gap-4 py-2">
                                                <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-muted text-xs font-black border border-white/10 uppercase">
                                                    {admin.email.substring(0, 2)}
                                                </div>
                                                <div className="flex flex-col">
                                                    <span className="font-bold text-primary">{admin.email}</span>
                                                    <span className="text-[9px] text-muted font-black uppercase tracking-widest">Authorized Site Admin</span>
                                                </div>
                                            </div>
                                        </td>
                                        <td style={{ textAlign: 'center' }}><span className="badge badge-info">AUTHORIZED</span></td>
                                        <td style={{ textAlign: 'center' }}>
                                            <span className="text-xs font-black text-muted uppercase">
                                                {new Date(admin.created_at).toLocaleDateString()}
                                            </span>
                                        </td>
                                        <td style={{ textAlign: 'right', paddingRight: 24 }}>
                                            <button
                                                onClick={() => handleRemoveMaster(admin.id, admin.email)}
                                                className="glass-button h-10 w-10 !p-0 !border-red-500/10 text-red-500"
                                                disabled={masterLoading}
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </>
                )}
            </div>

            {/* Grant Authorization Modal */}
            {showAddModal && (
                <div className="glass-modal">
                    <div className="glass-card glass-modal-card animate-scale-in" style={{ width: '100%', maxWidth: 440, padding: 32, position: 'relative' }}>
                        <button onClick={() => setShowAddModal(false)} className="absolute top-6 right-6 text-muted hover:text-primary transition-colors">
                            <X size={24} />
                        </button>

                        <div className="w-20 h-20 rounded-3xl bg-brand-primary/10 flex items-center justify-center text-brand-primary border border-brand-primary/10 mx-auto mb-8 shadow-inner">
                            <ShieldAlert size={40} />
                        </div>

                        <h2 className="text-2xl font-black text-center mb-2">Elevate Permissions</h2>
                        <p className="text-[10px] text-muted text-center mb-10 uppercase tracking-[0.3em] font-black">Authorize New Infrastructure Master</p>

                        <form onSubmit={handleAddMaster} className="flex flex-col gap-6">
                            <div className="space-y-3">
                                <label className="text-[10px] font-black text-muted uppercase tracking-widest block ml-1">Identity Endpoint</label>
                                <div className="relative">
                                    <input
                                        type="email"
                                        required
                                        className="glass-input !pl-14 h-16 text-lg font-bold"
                                        placeholder="user@gmail.com"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        autoFocus
                                    />
                                    <Mail className="absolute left-5 top-1/2 -translate-y-1/2 text-muted" size={20} />
                                </div>
                            </div>

                            <div className="p-5 rounded-2xl bg-amber-500/5 border border-amber-500/10 flex gap-4">
                                <AlertCircle className="text-amber-500 shrink-0" size={22} />
                                <p className="text-[10px] text-amber-500/70 leading-relaxed font-bold uppercase">
                                    Caution: This account will gain full control over all system organizations and subscription billing protocols.
                                </p>
                            </div>

                            <div className="flex gap-4 mt-4">
                                <button type="button" onClick={() => setShowAddModal(false)} className="glass-button flex-1 h-16 font-black uppercase text-xs tracking-widest">Cancel</button>
                                <button type="submit" className="glass-button glass-button-primary flex-1 h-16 font-black uppercase text-xs tracking-widest shadow-xl" disabled={masterLoading}>
                                    {masterLoading ? 'Syncing...' : 'Grant Privilege'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
