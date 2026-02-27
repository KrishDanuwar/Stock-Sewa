'use client';

import { useState, useMemo, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { addAdminEmail, removeAdminEmail } from '@/lib/actions/admin-management';
import { activateSubscription, rejectSubscription } from '@/lib/actions/subscriptions';
import { toast } from 'sonner';
import {
    ShieldCheck, UserPlus, Trash2, Mail, Lock, AlertCircle, Info,
    CheckCircle2, ArrowLeft, History, Users, ShieldAlert, X,
    CreditCard, Search, Filter, RefreshCw, XCircle, ChevronDown, Activity,
    Zap, Gem, Crown, Check, AlertTriangle
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

// --- Custom Glass Dropdown Component ---
const GlassDropdown = ({ value, options, onChange, label }: { value: string, options: { id: string, name: string }[], onChange: (val: string) => void, label?: string }) => {
    const [isOpen, setIsOpen] = useState(false);
    const selected = options.find(o => o.id === value) || options[0] || { id: 'none', name: 'Select Plan' };

    return (
        <div className="relative">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="glass-input !h-14 flex items-center justify-between gap-3 !px-5 hover:border-brand-primary/50 transition-all cursor-pointer group !rounded-none min-w-[200px]"
                style={{ background: 'var(--glass-input-bg)' }}
            >
                <div className="flex flex-col items-start gap-1 py-1">
                    {label && <span className="text-[9px] font-bold text-muted uppercase tracking-[0.1em] leading-none opacity-60 truncate w-full">{label}</span>}
                    <span className="text-[12px] font-bold text-primary uppercase tracking-wider truncate">{selected.name}</span>
                </div>
                <ChevronDown size={14} className={`text-muted transition-transform shrink-0 group-hover:text-brand-primary ${isOpen ? 'rotate-180' : ''}`} />
            </button>

            {isOpen && (
                <>
                    <div className="fixed inset-0 z-[60]" onClick={() => setIsOpen(false)} />
                    <div className="absolute top-[64px] left-0 right-0 z-[70] glass-card !bg-[#0a0f1d]/95 backdrop-blur-2xl border border-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.5)] p-1.5 animate-fade-in-up !rounded-none min-w-[200px]">
                        {options.map((opt) => (
                            <button
                                key={opt.id}
                                onClick={() => { onChange(opt.id); setIsOpen(false); }}
                                className={`w-full text-left px-5 py-4 rounded-none text-[11px] font-bold uppercase tracking-[0.2em] transition-all mb-1 last:mb-0 border-l-4 ${value === opt.id ? 'bg-brand-primary/10 border-brand-primary text-primary' : 'border-transparent text-muted/60 hover:bg-white/[0.03] hover:text-primary hover:border-white/20'}`}
                            >
                                {opt.name}
                            </button>
                        ))}
                    </div>
                </>
            )}
        </div>
    );
};

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
            router.refresh();
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
            {/* --- Premium Header --- */}
            <div className="page-header" style={{ marginBottom: 40 }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
                        <button
                            onClick={() => router.back()}
                            className="glass-button h-12 w-12 !p-0 !rounded-none shadow-xl hover:scale-110 active:scale-95 transition-all"
                        >
                            <ArrowLeft size={22} />
                        </button>
                        <div>
                            <div className="flex items-center gap-3">
                                <h1 className="page-title !text-3xl font-bold">System Control</h1>
                                <span className="bg-brand-primary/10 text-brand-primary text-[10px] font-bold px-2.5 py-1 rounded-lg border border-brand-primary/20 uppercase tracking-widest">Master</span>
                            </div>
                            <p className="page-subtitle !text-[13px] font-medium text-muted/80 mt-1">
                                Core Infrastructure Protocol v2.5.0
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* --- Premium Stats Architecture --- */}
            <div className="grid-stats">
                <div className="glass-card !rounded-none relative overflow-hidden group border-white/5 hover:border-brand-primary/30 transition-all duration-300" style={{ padding: '24px' }}>
                    <div className="flex items-center gap-5">
                        <div className="w-14 h-14 rounded-none bg-brand-primary/10 flex items-center justify-center text-brand-primary border border-brand-primary/20">
                            <Zap size={28} />
                        </div>
                        <div>
                            <div className="text-[12px] font-semibold text-muted uppercase tracking-wider mb-1">Pending Syncs</div>
                            <div className={`text-2xl font-bold ${pendingCount > 0 ? 'text-brand-warning' : 'text-primary'}`}>
                                {pendingCount.toString().padStart(2, '0')}
                            </div>
                        </div>
                    </div>
                </div>

                <div className="glass-card !rounded-none relative overflow-hidden group border-white/5 hover:border-purple-500/30 transition-all duration-300" style={{ padding: '24px' }}>
                    <div className="flex items-center gap-5">
                        <div className="w-14 h-14 rounded-none bg-purple-500/10 flex items-center justify-center text-purple-500 border border-purple-500/20">
                            <Crown size={28} />
                        </div>
                        <div>
                            <div className="text-[12px] font-semibold text-muted uppercase tracking-wider mb-1">Active Masters</div>
                            <div className="text-2xl font-bold text-primary">
                                {totalMasters.toString().padStart(2, '0')}
                            </div>
                        </div>
                    </div>
                </div>

                <div className="glass-card !rounded-none relative overflow-hidden group border-white/5 hover:border-emerald-500/30 transition-all duration-300" style={{ padding: '24px' }}>
                    <div className="flex items-center gap-5">
                        <div className="w-14 h-14 rounded-none bg-emerald-500/10 flex items-center justify-center text-emerald-500 border border-emerald-500/20">
                            <ShieldCheck size={28} />
                        </div>
                        <div>
                            <div className="text-[12px] font-semibold text-muted uppercase tracking-wider mb-1">Security Grid</div>
                            <div className="text-xl font-bold text-emerald-500 uppercase tracking-tight">
                                ROOT-LEVEL
                            </div>
                        </div>
                    </div>
                </div>
            </div>



            {/* --- Main High-Octane Content --- */}
            <div className="glass-card min-h-[600px] border-t-0 p-0 overflow-hidden flex" style={{ padding: 0 }}>
                {/* --- Vertical Navigation Rail --- */}
                <div className="w-[300px] bg-white/[0.015] border-r border-white/5 flex flex-col">
                    <div className="px-8 py-10 border-b border-white/5">
                        <div className="text-[10px] font-bold text-muted uppercase tracking-[0.4em]">System Modules</div>
                    </div>
                    <div className="flex flex-col py-4">
                        <button
                            onClick={() => setActiveTab('subscriptions')}
                            className={`group flex flex-col gap-1.5 px-8 py-7 transition-all duration-300 text-left border-l-4 ${activeTab === 'subscriptions' ? 'bg-brand-primary/[0.08] border-brand-primary text-primary shadow-[inset_10px_0_30px_rgba(79,142,247,0.03)]' : 'border-transparent text-muted hover:text-primary hover:bg-white/[0.02]'}`}
                        >
                            <div className="flex items-center gap-5">
                                <CreditCard size={18} className={activeTab === 'subscriptions' ? 'text-brand-primary scale-110 transition-transform' : 'text-muted group-hover:text-primary'} />
                                <span className={`text-[13px] font-bold uppercase tracking-[0.1em] ${activeTab === 'subscriptions' ? 'text-primary' : ''}`}>Financials</span>
                            </div>
                            <span className={`text-[10px] uppercase tracking-widest ml-[36px] font-bold opacity-30 ${activeTab === 'subscriptions' ? 'text-brand-primary opacity-80' : ''}`}>Sync Protocols</span>
                        </button>
                        <button
                            onClick={() => setActiveTab('masters')}
                            className={`group flex flex-col gap-1.5 px-8 py-7 transition-all duration-300 text-left border-l-4 ${activeTab === 'masters' ? 'bg-brand-primary/[0.08] border-brand-primary text-primary shadow-[inset_10px_0_30px_rgba(79,142,247,0.03)]' : 'border-transparent text-muted hover:text-primary hover:bg-white/[0.02]'}`}
                        >
                            <div className="flex items-center gap-5">
                                <Lock size={18} className={activeTab === 'masters' ? 'text-brand-primary scale-110 transition-transform' : 'text-muted group-hover:text-primary'} />
                                <span className={`text-[13px] font-bold uppercase tracking-[0.1em] ${activeTab === 'masters' ? 'text-primary' : ''}`}>Security</span>
                            </div>
                            <span className={`text-[10px] uppercase tracking-widest ml-[34px] font-bold opacity-30 ${activeTab === 'masters' ? 'text-brand-primary opacity-80' : ''}`}>Access Control</span>
                        </button>
                    </div>

                    <div className="mt-auto p-10 border-t border-white/5 bg-white/[0.01]">
                        <div className="flex flex-col gap-5">
                            <div className="flex items-center gap-4">
                                <ShieldAlert size={16} className="text-brand-primary/60" />
                                <span className="text-[11px] font-bold text-muted uppercase tracking-[0.2em]">Genesis Active</span>
                            </div>
                            <p className="text-[11px] text-muted/40 leading-relaxed uppercase tracking-[0.2em] font-bold">
                                Root access authorized. <br />
                                System integrity verified.
                            </p>
                        </div>
                    </div>
                </div>

                {/* --- Content Area --- */}
                <div className="flex-1 flex flex-col min-w-0">
                    {activeTab === 'subscriptions' ? (
                        <>
                            <div className="p-8 border-b border-white/5 flex items-center justify-between bg-white/[0.01]">
                                <div className="flex flex-col gap-1.5">
                                    <h2 className="text-xl font-bold uppercase tracking-[0.15em] text-primary">Financial Protocols</h2>
                                    <p className="text-[11px] text-muted uppercase tracking-[0.2em] font-bold opacity-40">Manual Subscription Synchronization</p>
                                </div>
                            </div>

                            <div className="p-8 border-b border-white/5 bg-white/[0.005]">
                                <div className="flex items-center gap-6">
                                    <div className="relative flex-1 max-w-md group">
                                        <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-muted group-focus-within:text-brand-primary transition-colors" size={18} />
                                        <input
                                            className="glass-input !pl-14 !h-14 !text-sm !font-semibold !rounded-none border-white/5 focus:border-brand-primary/50"
                                            placeholder="Find shop or transaction ID..."
                                            value={subSearch}
                                            onChange={(e) => setSubSearch(e.target.value)}
                                        />
                                    </div>
                                    <button
                                        onClick={() => setShowOnlyPending(!showOnlyPending)}
                                        className={`glass-button h-14 px-8 !rounded-none !text-[10px] font-black tracking-[0.2em] transition-all ${showOnlyPending ? 'glass-button-primary' : 'bg-white/5 text-muted hover:text-primary'}`}
                                    >
                                        <Filter size={16} /> {showOnlyPending ? 'PENDING SYNC' : 'ALL ENTRIES'}
                                    </button>
                                </div>
                            </div>

                            <table className="glass-table !table-fixed">
                                <thead>
                                    <tr>
                                        <th style={{ paddingLeft: 32, width: '30%' }}>Organization / Shop</th>
                                        <th style={{ width: '25%' }}>Transaction ID</th>
                                        <th style={{ width: '15%' }}>Status Details</th>
                                        <th style={{ textAlign: 'right', paddingRight: 32, width: '30%' }}>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredOrgs.length > 0 ? filteredOrgs.map(org => {
                                        const isPending = org.last_transaction_id && org.subscription_status !== 'active';
                                        const planOptions = Object.values(PLANS).filter(p => p.id !== 'trial').map(p => ({ id: p.id, name: p.name.toUpperCase() }));

                                        return (
                                            <tr key={org.id} className="group transition-all hover:bg-white/[0.02]">
                                                <td style={{ paddingLeft: 32 }}>
                                                    <div className="flex flex-col gap-1 py-4 group-hover:translate-x-1 transition-transform">
                                                        <span className="text-[14px] font-bold text-primary tracking-tight">{org.name}</span>
                                                        <span className="text-[10px] text-muted/60 font-mono">{org.id}</span>
                                                    </div>
                                                </td>
                                                <td>
                                                    {org.last_transaction_id ? (
                                                        <div className="flex flex-col gap-1.5 py-4">
                                                            <code className="bg-brand-primary/5 border border-brand-primary/10 px-3 py-1.5 rounded-lg text-brand-primary/90 font-bold tracking-wider text-[11px] w-fit shadow-sm">
                                                                {org.last_transaction_id}
                                                            </code>
                                                            <div className="flex items-center gap-2">
                                                                <div className="h-1.5 w-1.5 rounded-full bg-amber-500" />
                                                                <span className="text-[10px] text-amber-500/80 font-bold uppercase tracking-wider leading-none">Manual Verification Required</span>
                                                            </div>
                                                        </div>
                                                    ) : <span className="text-[10px] text-muted/20 font-bold uppercase tracking-widest">—</span>}
                                                </td>
                                                <td>
                                                    <div className="flex flex-col gap-1 py-4">
                                                        <div className="flex items-center gap-2">
                                                            <div className={`h-2 w-2 rounded-full ${org.subscription_status === 'active' ? 'bg-brand-success shadow-[0_0_10px_var(--brand-success)]' : 'bg-brand-warning shadow-[0_0_10px_#f59e0b]'}`} />
                                                            <span className={`text-[11px] font-bold uppercase tracking-wider ${org.subscription_status === 'active' ? 'text-emerald-400' : 'text-brand-warning'}`}>
                                                                {org.subscription_status}
                                                            </span>
                                                        </div>
                                                        <span className="text-[10px] text-muted font-semibold uppercase tracking-tight opacity-70">
                                                            {org.subscription_ends_at ? `Exp: ${new Date(org.subscription_ends_at).toLocaleDateString()}` : org.trial_ends_at ? `Trial: ${new Date(org.trial_ends_at).toLocaleDateString()}` : 'Indefinite'}
                                                        </span>
                                                    </div>
                                                </td>
                                                <td style={{ textAlign: 'right', paddingRight: 32 }}>
                                                    <div className="flex justify-end items-center gap-4 py-3">
                                                        <div className="w-48">
                                                            <GlassDropdown
                                                                label="Activation Tier"
                                                                value={selectedPlans[org.id] || (org.subscription_plan === 'trial' ? 'monthly' : org.subscription_plan) || 'monthly'}
                                                                options={planOptions}
                                                                onChange={(val) => setSelectedPlans(prev => ({ ...prev, [org.id]: val }))}
                                                            />
                                                        </div>
                                                        <div className="flex gap-2">
                                                            <button
                                                                onClick={() => handleActivate(org.id, selectedPlans[org.id] || org.subscription_plan || 'monthly')}
                                                                className={`glass-button !h-10 !px-5 !rounded-none !text-[10px] font-bold tracking-wider transition-all ${isPending ? 'glass-button-primary shadow-md hover:shadow-lg' : 'hover:bg-brand-primary/10'}`}
                                                                disabled={loadingId === org.id}
                                                            >
                                                                {loadingId === org.id && actionType === 'activate' ? <RefreshCw className="animate-spin" size={14} /> : <CheckCircle2 size={16} />}
                                                                ACTIVATE
                                                            </button>
                                                            {isPending && (
                                                                <button
                                                                    onClick={() => handleReject(org.id)}
                                                                    className="glass-button !h-10 !px-5 !rounded-none !text-[10px] font-bold tracking-wider border-red-500/10 text-red-500 hover:bg-red-500/10"
                                                                    disabled={loadingId === org.id}
                                                                >
                                                                    {loadingId === org.id && actionType === 'reject' ? <RefreshCw className="animate-spin" size={14} /> : <XCircle size={16} />}
                                                                    REJECT
                                                                </button>
                                                            )}
                                                        </div>
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    }) : (
                                        <tr>
                                            <td colSpan={4} className="py-32 text-center bg-white/[0.005]">
                                                <div className="flex flex-col items-center gap-4 opacity-10">
                                                    <Activity size={48} className="text-brand-primary" />
                                                    <p className="text-sm font-bold uppercase tracking-[0.4em]">No Data Flow</p>
                                                </div>
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </>
                    ) : (
                        <>
                            <div className="p-8 border-b border-white/5 flex items-center justify-between bg-white/[0.01]">
                                <div className="flex flex-col gap-1.5">
                                    <h2 className="text-xl font-bold uppercase tracking-[0.15em] text-primary">Security Protocols</h2>
                                    <p className="text-[11px] text-muted/40 uppercase tracking-widest font-bold">Infrastructure Master Access Management</p>
                                </div>
                                <button
                                    onClick={() => setShowAddModal(true)}
                                    className="glass-button glass-button-primary !h-12 !px-8 shadow-lg hover:shadow-xl transition-all !text-[11px] font-bold uppercase tracking-widest !rounded-none"
                                >
                                    <UserPlus size={16} /> Authorize Master
                                </button>
                            </div>

                            <table className="glass-table">
                                <thead>
                                    <tr>
                                        <th style={{ paddingLeft: 32, width: '40%' }}>Administrator / Master</th>
                                        <th style={{ textAlign: 'center', width: '25%' }}>Access Level</th>
                                        <th style={{ textAlign: 'center', width: '25%' }}>Authorized On</th>
                                        <th style={{ textAlign: 'right', paddingRight: 32, width: '10%' }}>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {/* Root Admin – The Legend */}
                                    <tr className="bg-brand-primary/[0.03] border-l-4 border-brand-primary">
                                        <td style={{ paddingLeft: 28 }}>
                                            <div className="flex items-center gap-5 py-5 group">
                                                <div className="w-12 h-12 rounded-2xl bg-brand-primary flex items-center justify-center text-white text-sm font-bold shadow-lg border border-white/10">
                                                    JS
                                                </div>
                                                <div className="flex flex-col">
                                                    <span className="text-base font-bold text-primary flex items-center gap-2 group-hover:translate-x-1 transition-transform">
                                                        junsangsingh@gmail.com <CheckCircle2 size={16} className="text-brand-primary" />
                                                    </span>
                                                    <span className="text-[10px] text-brand-primary font-bold uppercase tracking-wider">System Owner</span>
                                                </div>
                                            </div>
                                        </td>
                                        <td style={{ textAlign: 'center' }}>
                                            <span className="bg-brand-primary/10 text-brand-primary text-[10px] font-bold px-3 py-1.5 rounded-lg border border-brand-primary/20 uppercase tracking-widest shadow-sm">
                                                ROOT ADMIN
                                            </span>
                                        </td>
                                        <td style={{ textAlign: 'center' }}>
                                            <div className="flex flex-col items-center">
                                                <span className="text-[11px] font-bold text-primary uppercase tracking-tight">System Launch</span>
                                                <span className="text-[10px] text-muted font-medium uppercase tracking-wider opacity-60">FEB 2026</span>
                                            </div>
                                        </td>
                                        <td style={{ textAlign: 'right', paddingRight: 32 }}>
                                            <div className="flex justify-end pr-4 opacity-40"><Lock size={20} /></div>
                                        </td>
                                    </tr>

                                    {initialAdmins.filter(a => a.email !== 'junsangsingh@gmail.com').map(admin => (
                                        <tr key={admin.id} className="hover:bg-white/[0.02] transition-colors group">
                                            <td style={{ paddingLeft: 32 }}>
                                                <div className="flex items-center gap-5 py-5">
                                                    <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center text-muted text-sm font-bold border border-white/10 group-hover:border-brand-primary/40 transition-all uppercase">
                                                        {admin.email.substring(0, 2)}
                                                    </div>
                                                    <div className="flex flex-col">
                                                        <span className="text-base font-bold text-primary tracking-tight">{admin.email}</span>
                                                        <span className="text-[10px] text-muted font-bold uppercase tracking-widest">Authorized Master</span>
                                                    </div>
                                                </div>
                                            </td>
                                            <td style={{ textAlign: 'center' }}>
                                                <span className="badge badge-info !px-3 !py-1.5 !rounded-lg !text-[10px] font-bold uppercase tracking-wider">AUTHORIZED</span>
                                            </td>
                                            <td style={{ textAlign: 'center' }}>
                                                <span className="text-[11px] font-bold text-muted uppercase tracking-wider">
                                                    {new Date(admin.created_at).toLocaleDateString()}
                                                </span>
                                            </td>
                                            <td style={{ textAlign: 'right', paddingRight: 32 }}>
                                                <button
                                                    onClick={() => handleRemoveMaster(admin.id, admin.email)}
                                                    className="glass-button h-12 w-12 !p-0 !rounded-2xl !border-red-500/10 text-red-500 hover:bg-red-500/10 hover:scale-110 active:scale-95 transition-all"
                                                    disabled={masterLoading}
                                                >
                                                    <Trash2 size={20} />
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </>
                    )}
                </div>
            </div>

            {/* Grant Authorization Modal – Ultra Premium */}
            {showAddModal && (
                <div className="glass-modal !p-0 items-center">
                    <div className="glass-card glass-modal-card animate-scale-in !bg-bg-base overflow-hidden !rounded-none" style={{ width: '100%', maxWidth: 500, border: '1px solid rgba(79,142,247,0.2)' }}>
                        <div className="h-2 w-full bg-gradient-to-r from-brand-primary via-brand-secondary to-brand-accent animate-shimmer" style={{ backgroundSize: '200% 100%' }} />

                        <div className="p-10 relative">
                            <button onClick={() => setShowAddModal(false)} className="absolute top-6 right-6 text-muted hover:text-primary transition-all">
                                <X size={24} />
                            </button>

                            <div className="w-20 h-20 rounded-3xl bg-brand-primary/10 flex items-center justify-center text-brand-primary border border-brand-primary/10 mx-auto mb-8 shadow-sm">
                                <ShieldAlert size={40} />
                            </div>

                            <h2 className="text-2xl font-bold text-center mb-1">Grant Master Access</h2>
                            <p className="text-[11px] text-muted text-center mb-10 uppercase tracking-widest font-bold">New Infrastructure Administrator</p>

                            <form onSubmit={handleAddMaster} className="flex flex-col gap-8">
                                <div className="space-y-3">
                                    <label className="text-[11px] font-bold text-primary uppercase tracking-wider block ml-1">Email Identifier</label>
                                    <div className="relative group">
                                        <input
                                            type="email"
                                            required
                                            className="glass-input !pl-16 h-16 text-lg font-bold !rounded-none bg-white/[0.02] relative z-10"
                                            placeholder="admin@example.com"
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            autoFocus
                                        />
                                        <Mail className="absolute left-6 top-1/2 -translate-y-1/2 text-muted group-focus-within:text-brand-primary transition-all z-20" size={22} />
                                    </div>
                                </div>

                                <div className="p-5 rounded-none bg-brand-warning/[0.03] border border-brand-warning/10 flex gap-4">
                                    <AlertTriangle className="text-brand-warning shrink-0" size={20} />
                                    <p className="text-[10px] text-brand-warning/80 leading-relaxed font-bold uppercase tracking-wider">
                                        Warning: Authorized Masters gain control over organizational settings, billing, and system security protocols.
                                    </p>
                                </div>

                                <div className="flex gap-4 mt-2">
                                    <button type="button" onClick={() => setShowAddModal(false)} className="glass-button flex-1 h-14 font-bold uppercase text-[11px] tracking-widest !rounded-none">Abort</button>
                                    <button type="submit" className="glass-button glass-button-primary flex-1 h-14 font-bold uppercase text-[11px] tracking-widest shadow-lg !rounded-none" disabled={masterLoading}>
                                        {masterLoading ? (
                                            <div className="flex items-center gap-3">
                                                <RefreshCw className="animate-spin" size={16} />
                                                <span>Authorizing...</span>
                                            </div>
                                        ) : 'Authorize Access'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}

            <style jsx>{`
            .shadow-glow {
                filter: drop-shadow(0 0 8px var(--brand-primary));
            }
            @keyframes scaleIn {
                from { opacity: 0; transform: scale(0.95); }
                to { opacity: 1; transform: scale(1); }
            }
            .animate-scale-in {
                animation: scaleIn 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards;
            }
        `}</style>
        </div>
    );
}
