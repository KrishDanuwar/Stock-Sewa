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
    const selected = options.find(o => o.id === value) || options[0];

    return (
        <div className="relative">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="glass-input h-10 flex items-center justify-between gap-2 !px-4 hover:border-brand-primary/50 transition-all cursor-pointer group"
                style={{ background: 'rgba(255,255,255,0.03)' }}
            >
                <div className="flex flex-col items-start">
                    {label && <span className="text-[8px] font-black text-muted uppercase tracking-widest leading-none mb-1">{label}</span>}
                    <span className="text-[10px] font-black text-primary uppercase tracking-wider">{selected.name}</span>
                </div>
                <ChevronDown size={14} className={`text-muted transition-transform group-hover:text-brand-primary ${isOpen ? 'rotate-180' : ''}`} />
            </button>

            {isOpen && (
                <>
                    <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
                    <div className="absolute top-12 left-0 right-0 z-50 glass-card !bg-bg-secondary border border-white/10 shadow-2xl p-1 animate-fade-in-up">
                        {options.map((opt) => (
                            <button
                                key={opt.id}
                                onClick={() => { onChange(opt.id); setIsOpen(false); }}
                                className={`w-full text-left px-4 py-2.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all mb-0.5 last:mb-0 ${value === opt.id ? 'bg-brand-primary text-white' : 'text-muted hover:bg-white/5 hover:text-primary'}`}
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
                            className="glass-button h-12 w-12 !p-0 !rounded-2xl shadow-xl hover:scale-110 active:scale-95 transition-all"
                        >
                            <ArrowLeft size={22} />
                        </button>
                        <div>
                            <div className="flex items-center gap-3">
                                <h1 className="page-title text-4xl !font-[900] tracking-tighter">System</h1>
                                <span className="bg-brand-primary text-white text-[10px] font-black px-2 py-0.5 rounded-md uppercase tracking-[0.2em]">Master</span>
                            </div>
                            <p className="page-subtitle !text-xs font-bold text-muted/60 uppercase tracking-widest mt-1">
                                Infrastructure Protocol v2.5.0
                            </p>
                        </div>
                    </div>
                    {activeTab === 'masters' && (
                        <button
                            onClick={() => setShowAddModal(true)}
                            className="glass-button glass-button-primary !h-12 !px-8 shadow-[0_0_30px_rgba(79,142,247,0.4)] animate-fade-in !text-[11px] font-black uppercase tracking-[0.2em]"
                        >
                            <UserPlus size={16} /> Authorize Master
                        </button>
                    )}
                </div>
            </div>

            {/* --- Premium Stats Architecture --- */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 24, marginBottom: 48 }}>
                <div className="glass-card relative overflow-hidden group hover:border-brand-primary/30 transition-all duration-500" style={{ padding: '32px' }}>
                    <div className="absolute -right-6 -bottom-6 opacity-[0.03] group-hover:scale-110 group-hover:opacity-[0.08] transition-all duration-700">
                        <Activity size={180} />
                    </div>
                    <div className="flex items-center gap-5">
                        <div className="w-16 h-16 rounded-2xl bg-brand-primary/10 flex items-center justify-center text-brand-primary border border-brand-primary/10 shadow-inner">
                            <Zap size={32} />
                        </div>
                        <div>
                            <div className="text-[11px] font-[900] text-muted uppercase tracking-[0.3em] mb-1">Pending Syncs</div>
                            <div className={`text-4xl font-[900] tracking-tighter ${pendingCount > 0 ? 'text-amber-500 underline underline-offset-8 decoration-4' : 'text-primary'}`}>
                                {pendingCount.toString().padStart(2, '0')}
                            </div>
                        </div>
                    </div>
                </div>

                <div className="glass-card relative overflow-hidden group hover:border-purple-500/30 transition-all duration-500" style={{ padding: '32px' }}>
                    <div className="absolute -right-6 -bottom-6 opacity-[0.03] group-hover:scale-110 group-hover:opacity-[0.08] transition-all duration-700">
                        <Users size={180} />
                    </div>
                    <div className="flex items-center gap-5">
                        <div className="w-16 h-16 rounded-2xl bg-purple-500/10 flex items-center justify-center text-purple-500 border border-purple-500/10 shadow-inner">
                            <Crown size={32} />
                        </div>
                        <div>
                            <div className="text-[11px] font-[900] text-muted uppercase tracking-[0.3em] mb-1">Active Masters</div>
                            <div className="text-4xl font-[900] text-primary tracking-tighter">
                                {totalMasters.toString().padStart(2, '0')}
                            </div>
                        </div>
                    </div>
                </div>

                <div className="glass-card relative overflow-hidden group hover:border-emerald-500/30 transition-all duration-500" style={{ padding: '32px', borderLeft: '6px solid var(--brand-success)' }}>
                    <div className="absolute -right-6 -bottom-6 opacity-[0.03] group-hover:scale-110 group-hover:opacity-[0.08] transition-all duration-700">
                        <ShieldCheck size={180} />
                    </div>
                    <div className="flex items-center gap-5">
                        <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 flex items-center justify-center text-emerald-500 border border-emerald-500/10 shadow-inner">
                            <ShieldCheck size={32} />
                        </div>
                        <div>
                            <div className="text-[11px] font-[900] text-muted uppercase tracking-[0.3em] mb-1">Security Grid</div>
                            <div className="text-3xl font-[900] text-emerald-500 tracking-tighter leading-none">
                                ROOT-LEVEL
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* --- Premium Sliding Tab Switcher --- */}
            <div className="flex gap-1.5 mb-8 p-1.5 bg-white/5 w-fit rounded-[20px] border border-white/10 glass-card">
                <button
                    onClick={() => setActiveTab('subscriptions')}
                    className={`flex items-center gap-3 px-8 py-3 rounded-2xl text-[11px] font-[900] uppercase tracking-[0.2em] transition-all duration-300 ${activeTab === 'subscriptions' ? 'bg-brand-primary text-white shadow-[0_8px_20px_rgba(79,142,247,0.3)]' : 'text-muted/60 hover:text-primary hover:bg-white/5'}`}
                >
                    <CreditCard size={16} /> Subscriptions
                </button>
                <button
                    onClick={() => setActiveTab('masters')}
                    className={`flex items-center gap-3 px-8 py-3 rounded-2xl text-[11px] font-[900] uppercase tracking-[0.2em] transition-all duration-300 ${activeTab === 'masters' ? 'bg-brand-primary text-white shadow-[0_8px_20px_rgba(79,142,247,0.3)]' : 'text-muted/60 hover:text-primary hover:bg-white/5'}`}
                >
                    <Lock size={16} /> Master Access
                </button>
            </div>

            {/* --- Main High-Octane Content --- */}
            <div className="glass-card min-h-[500px] border-t-4 border-t-brand-primary/50" style={{ padding: 0, overflow: 'hidden' }}>
                {activeTab === 'subscriptions' ? (
                    <>
                        <div className="p-8 border-b border-white/5 flex items-center justify-between bg-white/[0.02]">
                            <div className="flex items-center gap-6 flex-1">
                                <div className="relative flex-1 max-w-md group">
                                    <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-muted group-focus-within:text-brand-primary transition-colors" size={18} />
                                    <input
                                        className="glass-input !pl-14 !h-14 !text-sm !font-bold !rounded-2xl border-white/5 focus:border-brand-primary/50"
                                        placeholder="Find shop or transmission protocol..."
                                        value={subSearch}
                                        onChange={(e) => setSubSearch(e.target.value)}
                                    />
                                </div>
                                <button
                                    onClick={() => setShowOnlyPending(!showOnlyPending)}
                                    className={`glass-button h-14 px-8 !rounded-2xl !text-[10px] font-black tracking-[0.2em] transition-all ${showOnlyPending ? 'glass-button-primary' : 'bg-white/5 text-muted hover:text-primary'}`}
                                >
                                    <Filter size={16} /> {showOnlyPending ? 'PENDING SYNC' : 'ALL ENTRIES'}
                                </button>
                            </div>
                            <div className="flex items-center gap-3 pl-8 border-l border-white/5">
                                <Activity className="text-brand-primary shadow-glow animate-pulse" size={16} />
                                <span className="text-[10px] font-[900] text-muted/40 uppercase tracking-[0.4em]">Live System Telemetry</span>
                            </div>
                        </div>

                        <table className="glass-table !table-fixed">
                            <thead>
                                <tr>
                                    <th style={{ paddingLeft: 32, width: '30%' }}>Infrastructure Node</th>
                                    <th style={{ width: '25%' }}>Transmission ID</th>
                                    <th style={{ width: '15%' }}>Node Status</th>
                                    <th style={{ textAlign: 'right', paddingRight: 32, width: '30%' }}>Protocol Control</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredOrgs.length > 0 ? filteredOrgs.map(org => {
                                    const isPending = org.last_transaction_id && org.subscription_status !== 'active';
                                    const planOptions = Object.values(PLANS).filter(p => p.id !== 'trial').map(p => ({ id: p.id, name: p.name.toUpperCase() }));

                                    return (
                                        <tr key={org.id} className={`group transition-all ${isPending ? 'bg-brand-primary/[0.04]' : 'hover:bg-white/[0.01]'}`}>
                                            <td style={{ paddingLeft: 32 }}>
                                                <div className="flex flex-col gap-1 py-3 group-hover:translate-x-1 transition-transform">
                                                    <span className="text-[13px] font-[900] text-primary uppercase tracking-tight">{org.name}</span>
                                                    <span className="text-[9px] text-muted/60 font-mono font-bold">{org.id}</span>
                                                </div>
                                            </td>
                                            <td>
                                                {org.last_transaction_id ? (
                                                    <div className="flex flex-col gap-1.5 py-3">
                                                        <code className="bg-brand-primary/10 border border-brand-primary/20 px-4 py-2 rounded-xl text-brand-primary font-black tracking-[0.15em] text-[11px] w-fit shadow-2xl">
                                                            {org.last_transaction_id}
                                                        </code>
                                                        <div className="flex items-center gap-2">
                                                            <div className="h-1 w-1 rounded-full bg-amber-500 animate-ping" />
                                                            <span className="text-[8px] text-amber-500 font-black uppercase tracking-widest leading-none">Awaiting Manual Verification</span>
                                                        </div>
                                                    </div>
                                                ) : <span className="text-[10px] text-muted/20 font-black uppercase tracking-widest italic">— VOID —</span>}
                                            </td>
                                            <td>
                                                <div className="flex flex-col gap-1 py-3">
                                                    <div className="flex items-center gap-2">
                                                        <div className={`h-2 w-2 rounded-full ${org.subscription_status === 'active' ? 'bg-brand-success shadow-[0_0_12px_var(--brand-success)]' : 'bg-brand-warning animate-pulse shadow-[0_0_12px_#f59e0b]'}`} />
                                                        <span className={`text-[10px] font-black uppercase tracking-wider ${org.subscription_status === 'active' ? 'text-emerald-400' : 'text-brand-warning'}`}>
                                                            {org.subscription_status}
                                                        </span>
                                                    </div>
                                                    <span className="text-[10px] text-muted font-[900] uppercase tracking-tighter opacity-70">
                                                        {org.subscription_ends_at ? `Expires ${new Date(org.subscription_ends_at).toLocaleDateString()}` : org.trial_ends_at ? `Trial ${new Date(org.trial_ends_at).toLocaleDateString()}` : 'No Horizon'}
                                                    </span>
                                                </div>
                                            </td>
                                            <td style={{ textAlign: 'right', paddingRight: 32 }}>
                                                <div className="flex justify-end items-center gap-4 py-3">
                                                    <div className="w-40">
                                                        <GlassDropdown
                                                            label="Selected Tier"
                                                            value={selectedPlans[org.id] || org.subscription_plan || 'monthly'}
                                                            options={planOptions}
                                                            onChange={(val) => setSelectedPlans(prev => ({ ...prev, [org.id]: val }))}
                                                        />
                                                    </div>
                                                    <div className="flex gap-2">
                                                        <button
                                                            onClick={() => handleActivate(org.id, selectedPlans[org.id] || org.subscription_plan || 'monthly')}
                                                            className={`glass-button !h-10 !px-5 !rounded-xl !text-[9px] font-black tracking-widest transition-all ${isPending ? 'glass-button-primary scale-105 shadow-xl hover:scale-110 active:scale-95' : 'hover:bg-brand-primary/10'}`}
                                                            disabled={loadingId === org.id}
                                                        >
                                                            {loadingId === org.id && actionType === 'activate' ? <RefreshCw className="animate-spin" size={14} /> : <CheckCircle2 size={16} />}
                                                            ACTIVATE
                                                        </button>
                                                        {isPending && (
                                                            <button
                                                                onClick={() => handleReject(org.id)}
                                                                className="glass-button !h-10 !px-5 !rounded-xl !text-[9px] font-black tracking-widest border-red-500/10 text-red-500 hover:bg-red-500/10 active:scale-95"
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
                                        <td colSpan={4} className="py-48 text-center bg-white/[0.01]">
                                            <div className="flex flex-col items-center gap-4 opacity-10 scale-150 grayscale">
                                                <Activity size={80} />
                                                <p className="text-xl font-black uppercase tracking-[0.5em]">No Data Flow</p>
                                            </div>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </>
                ) : (
                    <>
                        <div className="p-8 border-b border-white/5 flex items-center justify-between bg-white/[0.02]">
                            <div className="flex items-center gap-4">
                                <Lock className="text-brand-primary" size={24} />
                                <h2 className="text-lg font-[900] uppercase tracking-[0.2em] text-primary">Master Control Clearance</h2>
                            </div>
                            <div className="flex items-center gap-3">
                                <History size={16} className="text-muted" />
                                <span className="text-[10px] font-black text-muted/40 uppercase tracking-[0.4em]">Infrastructure Audit Enabled</span>
                            </div>
                        </div>

                        <table className="glass-table">
                            <thead>
                                <tr>
                                    <th style={{ paddingLeft: 32, width: '40%' }}>Master Protocol Info</th>
                                    <th style={{ textAlign: 'center', width: '25%' }}>Privilege Grade</th>
                                    <th style={{ textAlign: 'center', width: '25%' }}>Authorization Date</th>
                                    <th style={{ textAlign: 'right', paddingRight: 32, width: '10%' }}>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {/* Root Admin – The Legend */}
                                <tr className="bg-brand-primary/[0.08] relative">
                                    <td style={{ paddingLeft: 32 }}>
                                        <div className="flex items-center gap-5 py-5 group">
                                            <div className="w-14 h-14 rounded-2xl bg-brand-primary flex items-center justify-center text-white text-sm font-black shadow-[0_0_20px_rgba(79,142,247,0.5)] border-2 border-white/20">
                                                JS
                                            </div>
                                            <div className="flex flex-col">
                                                <span className="text-base font-[950] text-primary flex items-center gap-2 group-hover:translate-x-1 transition-transform">
                                                    junsangsingh@gmail.com <CheckCircle2 size={18} className="text-brand-primary shadow-glow" />
                                                </span>
                                                <span className="text-[10px] text-brand-primary font-black uppercase tracking-[0.2em]">Genesis System Master</span>
                                            </div>
                                        </div>
                                    </td>
                                    <td style={{ textAlign: 'center' }}>
                                        <span className="bg-brand-primary/20 text-brand-primary text-[10px] font-black px-4 py-2 rounded-xl border border-brand-primary/30 uppercase tracking-[0.1em] shadow-inner">
                                            IMMUTABLE ROOT
                                        </span>
                                    </td>
                                    <td style={{ textAlign: 'center' }}>
                                        <div className="flex flex-col items-center">
                                            <span className="text-xs font-black text-primary uppercase tracking-tighter">System Epoch</span>
                                            <span className="text-[9px] text-muted font-bold uppercase tracking-widest opacity-40">2026-02-MASTER</span>
                                        </div>
                                    </td>
                                    <td style={{ textAlign: 'right', paddingRight: 32 }}>
                                        <div className="flex justify-end pr-4 opacity-40 animate-pulse"><Lock size={20} /></div>
                                    </td>
                                </tr>

                                {initialAdmins.filter(a => a.email !== 'junsangsingh@gmail.com').map(admin => (
                                    <tr key={admin.id} className="hover:bg-white/[0.02] transition-colors group">
                                        <td style={{ paddingLeft: 32 }}>
                                            <div className="flex items-center gap-5 py-5">
                                                <div className="w-14 h-14 rounded-2xl bg-white/5 flex items-center justify-center text-muted text-sm font-black border border-white/10 group-hover:border-brand-primary/40 transition-all uppercase">
                                                    {admin.email.substring(0, 2)}
                                                </div>
                                                <div className="flex flex-col">
                                                    <span className="text-base font-[900] text-primary tracking-tight">{admin.email}</span>
                                                    <span className="text-[10px] text-muted font-black uppercase tracking-widest">Authorized Sub-Master</span>
                                                </div>
                                            </div>
                                        </td>
                                        <td style={{ textAlign: 'center' }}>
                                            <span className="badge badge-info !px-4 !py-2 !rounded-xl !text-[10px] font-black uppercase tracking-widest">AUTHORIZED</span>
                                        </td>
                                        <td style={{ textAlign: 'center' }}>
                                            <span className="text-xs font-black text-muted uppercase tracking-widest">
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

            {/* Grant Authorization Modal – Ultra Premium */}
            {showAddModal && (
                <div className="glass-modal !p-0 items-center">
                    <div className="glass-card glass-modal-card animate-scale-in !bg-bg-base overflow-hidden" style={{ width: '100%', maxWidth: 500, border: '1px solid rgba(79,142,247,0.2)' }}>
                        <div className="h-2 w-full bg-gradient-to-r from-brand-primary via-brand-secondary to-brand-accent animate-shimmer" style={{ backgroundSize: '200% 100%' }} />

                        <div className="p-10 relative">
                            <button onClick={() => setShowAddModal(false)} className="absolute top-8 right-8 text-muted hover:text-primary transition-all hover:rotate-90">
                                <X size={28} />
                            </button>

                            <div className="w-24 h-24 rounded-[32px] bg-brand-primary/10 flex items-center justify-center text-brand-primary border border-brand-primary/10 mx-auto mb-10 shadow-[inner_0_0_20px_rgba(79,142,247,0.1)]">
                                <ShieldAlert size={48} className="drop-shadow-[0_0_10px_rgba(79,142,247,0.5)]" />
                            </div>

                            <h2 className="text-3xl font-[1000] text-center mb-2 tracking-tighter">Elevate Rights</h2>
                            <p className="text-[10px] text-muted text-center mb-12 uppercase tracking-[0.4em] font-black">Authorize New Infrastructure Master</p>

                            <form onSubmit={handleAddMaster} className="flex flex-col gap-8">
                                <div className="space-y-4">
                                    <label className="text-[11px] font-[1000] text-primary uppercase tracking-[0.2em] block ml-1">Identity Endpoint</label>
                                    <div className="relative group">
                                        <div className="absolute -inset-1 bg-brand-primary/20 rounded-[22px] blur opacity-0 group-focus-within:opacity-100 transition-all" />
                                        <input
                                            type="email"
                                            required
                                            className="glass-input !pl-16 h-20 text-xl font-[900] !rounded-[20px] bg-white/[0.02] relative z-10"
                                            placeholder="administrator@gmail.com"
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            autoFocus
                                        />
                                        <Mail className="absolute left-6 top-1/2 -translate-y-1/2 text-muted group-focus-within:text-brand-primary transition-all z-20" size={24} />
                                    </div>
                                </div>

                                <div className="p-6 rounded-[24px] bg-amber-500/[0.03] border border-amber-500/10 flex gap-5">
                                    <AlertTriangle className="text-amber-500 shrink-0" size={24} />
                                    <p className="text-[10px] text-amber-500/60 leading-relaxed font-black uppercase tracking-wider">
                                        Caution: Authorized Masters gain immutable access to organizational protocols, billing control, and global security management.
                                    </p>
                                </div>

                                <div className="flex gap-4 mt-2">
                                    <button type="button" onClick={() => setShowAddModal(false)} className="glass-button flex-1 h-16 font-[950] uppercase text-[11px] tracking-[0.2em] !rounded-2xl">Abort</button>
                                    <button type="submit" className="glass-button glass-button-primary flex-1 h-16 font-[950] uppercase text-[11px] tracking-[0.2em] shadow-2xl !rounded-2xl" disabled={masterLoading}>
                                        {masterLoading ? (
                                            <div className="flex items-center gap-3">
                                                <RefreshCw className="animate-spin" size={18} />
                                                <span>Syncing...</span>
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
