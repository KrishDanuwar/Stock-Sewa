'use client';

import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { SignOutButton } from '@clerk/nextjs';
import { addAdminEmail, removeAdminEmail } from '@/lib/actions/admin-management';
import { activateSubscription, rejectSubscription } from '@/lib/actions/subscriptions';
import { updatePlan, createPlan, deletePlan, toggleFeature, addFeatureToPlan, removeFeatureFromPlan } from '@/lib/actions/plan-management';
import type { PlanWithFeatures, PlanFeature } from '@/lib/actions/plan-management';
import { toast } from 'sonner';
import {
    ShieldCheck, UserPlus, Trash2, Mail, Lock, CheckCircle2, ShieldAlert,
    ArrowLeft, Users, X, CreditCard, Search, Filter, RefreshCw,
    XCircle, ChevronDown, Zap, Crown, AlertTriangle, Settings, Plus, Save, Star, ToggleLeft, ToggleRight,
    LogOut
} from 'lucide-react';

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

// --- Glass Select Dropdown ---
const GlassSelect = ({ value, options, onChange, label }: { value: string; options: { id: string; name: string }[]; onChange: (val: string) => void; label?: string }) => {
    const [isOpen, setIsOpen] = useState(false);
    const selected = options.find(o => o.id === value) || options[0] || { id: 'none', name: 'Select...' };

    return (
        <div style={{ position: 'relative' }}>
            {label && <label className="glass-label" style={{ marginBottom: 6, display: 'block' }}>{label}</label>}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="glass-input"
                style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer', width: '100%', textAlign: 'left', minWidth: 180 }}
            >
                <span style={{ fontWeight: 600, fontSize: '0.8125rem' }}>{selected.name}</span>
                <ChevronDown size={14} style={{ color: 'var(--text-muted)', transition: 'transform 0.2s', transform: isOpen ? 'rotate(180deg)' : 'none' }} />
            </button>

            {isOpen && (
                <>
                    <div style={{ position: 'fixed', inset: 0, zIndex: 60 }} onClick={() => setIsOpen(false)} />
                    <div className="glass-card" style={{ position: 'absolute', top: label ? 72 : 46, left: 0, right: 0, zIndex: 70, padding: 4, boxShadow: '0 20px 50px rgba(0,0,0,0.15)' }}>
                        {options.map((opt) => (
                            <button
                                key={opt.id}
                                onClick={() => { onChange(opt.id); setIsOpen(false); }}
                                style={{
                                    display: 'block', width: '100%', textAlign: 'left', padding: '10px 14px',
                                    borderRadius: 8, border: 'none', cursor: 'pointer', fontSize: '0.8125rem',
                                    fontWeight: value === opt.id ? 700 : 500, transition: 'all 0.15s',
                                    background: value === opt.id ? 'rgba(79, 142, 247, 0.1)' : 'transparent',
                                    color: value === opt.id ? 'var(--brand-primary)' : 'var(--text-primary)',
                                }}
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

// --- Known feature keys ---
const KNOWN_FEATURES = [
    { key: 'canExportCSV', label: 'CSV Export' },
    { key: 'hasPrioritySupport', label: 'Priority Support' },
    { key: 'hasAdvancedReports', label: 'Advanced Reports' },
    { key: 'canManageSuppliers', label: 'Supplier Management' },
];

export default function AdminDashboardClient({
    initialAdmins,
    initialOrgs,
    initialPlans
}: {
    initialAdmins: AdminEntry[];
    initialOrgs: Org[];
    initialPlans: PlanWithFeatures[];
}) {
    const router = useRouter();
    const [activeTab, setActiveTab] = useState<'subscriptions' | 'masters' | 'plans'>('subscriptions');

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

    // --- Plans State ---
    const [plans, setPlans] = useState<PlanWithFeatures[]>(initialPlans);
    const [planLoading, setPlanLoading] = useState<string | null>(null);
    const [editingPrices, setEditingPrices] = useState<Record<string, string>>({});
    const [editingNames, setEditingNames] = useState<Record<string, string>>({});
    const [editingDescriptions, setEditingDescriptions] = useState<Record<string, string>>({});
    const [editingDurations, setEditingDurations] = useState<Record<string, string>>({});
    const [showNewPlanModal, setShowNewPlanModal] = useState(false);
    const [newPlan, setNewPlan] = useState<{
        id: string;
        name: string;
        description: string;
        price: string;
        period: string;
        duration_days: string;
        selectedFeatures: string[];
    }>({
        id: '',
        name: '',
        description: '',
        price: '',
        period: 'month',
        duration_days: '30',
        selectedFeatures: []
    });

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
        if (adminEmail === process.env.NEXT_PUBLIC_SYSTEM_OWNER_EMAIL) return toast.error('Primary system owner cannot be revoked');
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

    // --- Plan Handlers ---
    async function handleSavePlan(plan: PlanWithFeatures) {
        setPlanLoading(plan.id);
        const result = await updatePlan(plan.id, {
            name: editingNames[plan.id] ?? plan.name,
            description: editingDescriptions[plan.id] ?? plan.description ?? '',
            price: Number(editingPrices[plan.id] ?? plan.price),
            duration_days: Number(editingDurations[plan.id] ?? plan.duration_days),
        });
        if (result.success) {
            toast.success(`${plan.name} updated`);
            setPlans(prev => prev.map(p => p.id === plan.id ? {
                ...p,
                name: editingNames[plan.id] ?? p.name,
                description: editingDescriptions[plan.id] ?? p.description,
                price: Number(editingPrices[plan.id] ?? p.price),
                duration_days: Number(editingDurations[plan.id] ?? p.duration_days),
            } : p));
        } else toast.error(result.error || 'Failed to update');
        setPlanLoading(null);
    }

    async function handleToggleFeature(plan: PlanWithFeatures, featureKey: string, featureLabel: string) {
        setPlanLoading(plan.id);
        const existing = plan.features.find(f => f.feature_key === featureKey);
        if (existing) {
            const result = await toggleFeature(existing.id, !existing.enabled);
            if (result.success) {
                setPlans(prev => prev.map(p => p.id === plan.id ? {
                    ...p, features: p.features.map(f => f.id === existing.id ? { ...f, enabled: !f.enabled } : f)
                } : p));
            } else toast.error(result.error || 'Failed');
        } else {
            const result = await addFeatureToPlan(plan.id, featureKey, featureLabel, true);
            if (result.success) { router.refresh(); }
            else toast.error(result.error || 'Failed');
        }
        setPlanLoading(null);
    }

    async function handleTogglePopular(plan: PlanWithFeatures) {
        setPlanLoading(plan.id);
        const result = await updatePlan(plan.id, { is_popular: !plan.is_popular });
        if (result.success) {
            setPlans(prev => prev.map(p => p.id === plan.id ? { ...p, is_popular: !p.is_popular } : p));
        } else toast.error(result.error || 'Failed');
        setPlanLoading(null);
    }

    async function handleDeletePlan(id: string) {
        if (!confirm('Delete this plan? This cannot be undone.')) return;
        setPlanLoading(id);
        const result = await deletePlan(id);
        if (result.success) {
            toast.success('Plan deleted');
            setPlans(prev => prev.filter(p => p.id !== id));
        } else toast.error(result.error || 'Failed');
        setPlanLoading(null);
    }

    async function handleCreatePlan(e: React.FormEvent) {
        e.preventDefault();
        if (!newPlan.id || !newPlan.name) return;
        setPlanLoading('new');
        const planId = newPlan.id.toLowerCase().replace(/\s+/g, '-');
        const result = await createPlan({
            id: planId,
            name: newPlan.name,
            description: newPlan.description,
            price: Number(newPlan.price) || 0,
            period: newPlan.period,
            duration_days: Number(newPlan.duration_days) || 30,
        });
        if (result.success) {
            // Add selected features to the new plan
            for (const featureKey of newPlan.selectedFeatures) {
                const featureLabel = KNOWN_FEATURES.find(kf => kf.key === featureKey)?.label || featureKey;
                await addFeatureToPlan(planId, featureKey, featureLabel, true);
            }

            toast.success('Plan created');
            setShowNewPlanModal(false);
            setNewPlan({ id: '', name: '', description: '', price: '', period: 'month', duration_days: '30', selectedFeatures: [] });
            router.refresh();
        } else toast.error(result.error || 'Failed');
        setPlanLoading(null);
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
    const totalMasters = initialAdmins.length;

    const tabs = [
        { id: 'subscriptions' as const, label: 'Subscriptions', icon: CreditCard },
        { id: 'plans' as const, label: 'Plan Management', icon: Settings },
        { id: 'masters' as const, label: 'Access Control', icon: Lock },
    ];

    return (
        <div className="animate-fade-in-up">
            {/* Header */}
            <div className="page-header" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                    <button onClick={() => router.back()} className="glass-button" style={{ width: 44, height: 44, padding: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <ArrowLeft size={20} />
                    </button>
                    <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                            <h1 className="page-title">System Control</h1>
                            <span className="badge badge-info" style={{ fontSize: '0.625rem', fontWeight: 700 }}>ADMIN</span>
                        </div>
                        <p className="page-subtitle">Manage subscriptions and admin access</p>
                    </div>
                </div>

                <SignOutButton>
                    <button className="glass-button glass-button-danger" style={{ gap: 8 }}>
                        <LogOut size={16} />
                        <span style={{ fontSize: '0.8125rem', fontWeight: 600 }}>Logout</span>
                    </button>
                </SignOutButton>
            </div>

            {/* Stat Cards */}
            <div className="grid-stats" style={{ marginBottom: 24 }}>
                <div className="glass-card" style={{ padding: 20 }}>
                    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 16 }}>
                        <div style={{ fontSize: '0.875rem', fontWeight: 600 }}>Pending Requests</div>
                        <div style={{ width: 36, height: 36, borderRadius: 10, backgroundColor: 'rgba(245, 158, 11, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <Zap size={18} color="var(--brand-warning)" />
                        </div>
                    </div>
                    <div style={{ fontSize: '1.75rem', fontWeight: 700, color: pendingCount > 0 ? 'var(--brand-warning)' : 'var(--text-primary)' }}>
                        {pendingCount}
                    </div>
                </div>

                <div className="glass-card" style={{ padding: 20 }}>
                    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 16 }}>
                        <div style={{ fontSize: '0.875rem', fontWeight: 600 }}>Total Organizations</div>
                        <div style={{ width: 36, height: 36, borderRadius: 10, backgroundColor: 'rgba(79, 142, 247, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <Users size={18} color="var(--brand-primary)" />
                        </div>
                    </div>
                    <div style={{ fontSize: '1.75rem', fontWeight: 700 }}>{orgs.length}</div>
                </div>

                <div className="glass-card" style={{ padding: 20 }}>
                    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 16 }}>
                        <div style={{ fontSize: '0.875rem', fontWeight: 600 }}>Admin Users</div>
                        <div style={{ width: 36, height: 36, borderRadius: 10, backgroundColor: 'rgba(139, 92, 246, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <Crown size={18} color="#8b5cf6" />
                        </div>
                    </div>
                    <div style={{ fontSize: '1.75rem', fontWeight: 700 }}>{totalMasters}</div>
                </div>

                <div className="glass-card" style={{ padding: 20 }}>
                    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 16 }}>
                        <div style={{ fontSize: '0.875rem', fontWeight: 600 }}>Security Status</div>
                        <div style={{ width: 36, height: 36, borderRadius: 10, backgroundColor: 'rgba(16, 185, 129, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <ShieldCheck size={18} color="var(--brand-success)" />
                        </div>
                    </div>
                    <div style={{ fontSize: '1.125rem', fontWeight: 700, color: 'var(--brand-success)' }}>Active</div>
                </div>
            </div>

            {/* Tab Switcher */}
            <div className="glass-card" style={{ padding: 0, marginBottom: 24 }}>
                <div style={{ display: 'flex', borderBottom: '1px solid var(--glass-border)' }}>
                    {tabs.map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            style={{
                                flex: 1, padding: '16px 24px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
                                border: 'none', cursor: 'pointer', fontSize: '0.875rem', fontWeight: 600, transition: 'all 0.2s',
                                background: activeTab === tab.id ? 'rgba(79, 142, 247, 0.08)' : 'transparent',
                                color: activeTab === tab.id ? 'var(--brand-primary)' : 'var(--text-secondary)',
                                borderBottom: activeTab === tab.id ? '2px solid var(--brand-primary)' : '2px solid transparent',
                            }}
                        >
                            <tab.icon size={18} />
                            {tab.label}
                            {tab.id === 'subscriptions' && pendingCount > 0 && (
                                <span style={{
                                    minWidth: 20, height: 20, borderRadius: 10, backgroundColor: 'var(--brand-warning)',
                                    color: 'white', fontSize: '0.6875rem', fontWeight: 700, display: 'flex',
                                    alignItems: 'center', justifyContent: 'center', padding: '0 6px'
                                }}>
                                    {pendingCount}
                                </span>
                            )}
                        </button>
                    ))}
                </div>
            </div>

            {/* Content */}
            {activeTab === 'subscriptions' ? (
                <div className="glass-card" style={{ padding: 0 }}>
                    {/* Search & Filter Bar */}
                    <div style={{ padding: 20, borderBottom: '1px solid var(--glass-border)', display: 'flex', alignItems: 'center', gap: 12 }}>
                        <div style={{ position: 'relative', flex: 1, maxWidth: 400 }}>
                            <Search size={15} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} />
                            <input
                                className="glass-input"
                                style={{ paddingLeft: 36 }}
                                placeholder="Search shop or transaction ID..."
                                value={subSearch}
                                onChange={(e) => setSubSearch(e.target.value)}
                            />
                        </div>
                        <button
                            onClick={() => setShowOnlyPending(!showOnlyPending)}
                            className={`glass-button ${showOnlyPending ? 'glass-button-primary' : ''}`}
                            style={{ fontSize: '0.8125rem' }}
                        >
                            <Filter size={14} /> {showOnlyPending ? 'Pending Only' : 'Show All'}
                        </button>
                    </div>

                    {/* Table */}
                    <div style={{ overflowX: 'auto', paddingBottom: '160px' }}>
                        <table className="glass-table">
                            <thead>
                                <tr>
                                    <th>Organization</th>
                                    <th>Transaction ID</th>
                                    <th>Status</th>
                                    <th>Plan</th>
                                    <th style={{ textAlign: 'right' }}>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredOrgs.length > 0 ? filteredOrgs.map(org => {
                                    const isPending = org.last_transaction_id && org.subscription_status !== 'active';
                                    const planOptions = plans.filter(p => p.id !== 'trial').map(p => ({ id: p.id, name: p.name }));

                                    return (
                                        <tr key={org.id}>
                                            <td>
                                                <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                                                    <span style={{ fontWeight: 600 }}>{org.name}</span>
                                                    <span style={{ fontSize: '0.6875rem', color: 'var(--text-muted)', fontFamily: 'monospace' }}>{org.id.slice(0, 8)}...</span>
                                                </div>
                                            </td>
                                            <td>
                                                {org.last_transaction_id ? (
                                                    <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                                                        <code style={{ padding: '4px 8px', borderRadius: 6, background: 'rgba(79, 142, 247, 0.08)', color: 'var(--brand-primary)', fontSize: '0.75rem', fontWeight: 600, width: 'fit-content' }}>
                                                            {org.last_transaction_id}
                                                        </code>
                                                        <span style={{ fontSize: '0.625rem', color: 'var(--brand-warning)', fontWeight: 600 }}>⏳ Needs verification</span>
                                                    </div>
                                                ) : (
                                                    <span style={{ color: 'var(--text-muted)', fontSize: '0.8125rem' }}>—</span>
                                                )}
                                            </td>
                                            <td>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                                    <div style={{
                                                        width: 8, height: 8, borderRadius: '50%',
                                                        backgroundColor: org.subscription_status === 'active' ? 'var(--brand-success)' : 'var(--brand-warning)',
                                                        boxShadow: org.subscription_status === 'active' ? '0 0 8px var(--brand-success)' : '0 0 8px #f59e0b'
                                                    }} />
                                                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                                                        <span className={`badge ${org.subscription_status === 'active' ? 'badge-success' : 'badge-warning'}`} style={{ fontSize: '0.6875rem' }}>
                                                            {org.subscription_status.toUpperCase()}
                                                        </span>
                                                        <span style={{ fontSize: '0.625rem', color: 'var(--text-muted)', marginTop: 2 }}>
                                                            {org.subscription_ends_at ? `Exp: ${new Date(org.subscription_ends_at).toLocaleDateString()}` :
                                                                org.trial_ends_at ? `Trial: ${new Date(org.trial_ends_at).toLocaleDateString()}` : ''}
                                                        </span>
                                                    </div>
                                                </div>
                                            </td>
                                            <td>
                                                <GlassSelect
                                                    value={selectedPlans[org.id] || (org.subscription_plan === 'trial' ? (planOptions[0]?.id || 'monthly') : org.subscription_plan) || (planOptions[0]?.id || 'monthly')}
                                                    options={planOptions}
                                                    onChange={(val) => setSelectedPlans(prev => ({ ...prev, [org.id]: val }))}
                                                />
                                            </td>
                                            <td style={{ textAlign: 'right' }}>
                                                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
                                                    <button
                                                        onClick={() => handleActivate(org.id, selectedPlans[org.id] || org.subscription_plan || 'monthly')}
                                                        className={`glass-button ${isPending ? 'glass-button-primary' : ''}`}
                                                        style={{ fontSize: '0.75rem', padding: '8px 16px' }}
                                                        disabled={loadingId === org.id}
                                                    >
                                                        {loadingId === org.id && actionType === 'activate' ? <RefreshCw size={14} className="animate-spin" /> : <CheckCircle2 size={14} />}
                                                        Activate
                                                    </button>
                                                    {isPending && (
                                                        <button
                                                            onClick={() => handleReject(org.id)}
                                                            className="glass-button"
                                                            style={{ fontSize: '0.75rem', padding: '8px 16px', color: 'var(--brand-danger)', borderColor: 'rgba(239, 68, 68, 0.2)' }}
                                                            disabled={loadingId === org.id}
                                                        >
                                                            {loadingId === org.id && actionType === 'reject' ? <RefreshCw size={14} className="animate-spin" /> : <XCircle size={14} />}
                                                            Reject
                                                        </button>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                }) : (
                                    <tr>
                                        <td colSpan={5} style={{ textAlign: 'center', padding: '48px 0', color: 'var(--text-muted)' }}>
                                            <CreditCard size={36} style={{ margin: '0 auto 10px', opacity: 0.4 }} />
                                            <p style={{ fontSize: '0.875rem' }}>{showOnlyPending ? 'No pending requests' : 'No organizations found'}</p>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            ) : activeTab === 'plans' ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
                    {/* Plans Header */}
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <div>
                            <h2 style={{ fontSize: '1.125rem', fontWeight: 600, marginBottom: 4 }}>Subscription Plans</h2>
                            <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>Set pricing, features, and visibility for each plan</p>
                        </div>
                        <button onClick={() => setShowNewPlanModal(true)} className="glass-button glass-button-primary" style={{ fontSize: '0.8125rem' }}>
                            <Plus size={16} /> Add Plan
                        </button>
                    </div>

                    {/* Plan Cards Grid */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: 24 }}>
                        {plans.map(plan => {
                            const isLoading = planLoading === plan.id;
                            return (
                                <div key={plan.id} className="glass-card" style={{ padding: 0, overflow: 'hidden', opacity: isLoading ? 0.7 : 1, transition: 'opacity 0.2s', position: 'relative' }}>
                                    {/* Card Header */}
                                    <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--glass-border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: plan.is_popular ? 'rgba(79, 142, 247, 0.06)' : 'transparent' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                            <div style={{ width: 36, height: 36, borderRadius: 10, background: plan.id === 'trial' ? 'rgba(245, 158, 11, 0.15)' : 'rgba(79, 142, 247, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                {plan.id === 'trial' ? <Zap size={18} color="var(--brand-warning)" /> : <Crown size={18} color="var(--brand-primary)" />}
                                            </div>
                                            <div>
                                                <span style={{ fontWeight: 700, fontSize: '0.9375rem' }}>{plan.name}</span>
                                                <span style={{ fontSize: '0.6875rem', color: 'var(--text-muted)', display: 'block' }}>ID: {plan.id}</span>
                                            </div>
                                        </div>
                                        <div style={{ display: 'flex', gap: 6 }}>
                                            <button onClick={() => handleTogglePopular(plan)} title={plan.is_popular ? 'Remove popular badge' : 'Mark as popular'} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4 }}>
                                                <Star size={18} fill={plan.is_popular ? 'var(--brand-warning)' : 'none'} color={plan.is_popular ? 'var(--brand-warning)' : 'var(--text-muted)'} />
                                            </button>
                                            {plan.id !== 'trial' && (
                                                <button onClick={() => handleDeletePlan(plan.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4 }}>
                                                    <Trash2 size={16} color="var(--brand-danger)" />
                                                </button>
                                            )}
                                        </div>
                                    </div>

                                    {/* Editable Fields */}
                                    <div style={{ padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: 16 }}>
                                        <div className="form-group">
                                            <label className="glass-label">Plan Name</label>
                                            <input className="glass-input" defaultValue={plan.name} onChange={e => setEditingNames(p => ({ ...p, [plan.id]: e.target.value }))} />
                                        </div>
                                        <div className="form-group">
                                            <label className="glass-label">Description</label>
                                            <input className="glass-input" defaultValue={plan.description || ''} onChange={e => setEditingDescriptions(p => ({ ...p, [plan.id]: e.target.value }))} />
                                        </div>
                                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                                            <div className="form-group">
                                                <label className="glass-label">Price (Rs.)</label>
                                                <input className="glass-input" type="number" defaultValue={plan.price} onChange={e => setEditingPrices(p => ({ ...p, [plan.id]: e.target.value }))} />
                                            </div>
                                            <div className="form-group">
                                                <label className="glass-label">Duration (days)</label>
                                                <input className="glass-input" type="number" defaultValue={plan.duration_days} onChange={e => setEditingDurations(p => ({ ...p, [plan.id]: e.target.value }))} />
                                            </div>
                                        </div>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                            <span className="badge badge-outline" style={{ fontSize: '0.6875rem' }}>{plan.period}</span>
                                            <span className="badge badge-outline" style={{ fontSize: '0.6875rem' }}>Sort: {plan.sort_order}</span>
                                            {plan.is_popular && <span className="badge badge-warning" style={{ fontSize: '0.6875rem' }}>★ POPULAR</span>}
                                        </div>
                                    </div>

                                    {/* Feature Toggles */}
                                    <div style={{ padding: '16px 24px', borderTop: '1px solid var(--glass-border)', background: 'rgba(0,0,0,0.02)' }}>
                                        <label className="glass-label" style={{ marginBottom: 12, display: 'block' }}>Exclusive Features</label>
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                                            {KNOWN_FEATURES.map(kf => {
                                                const feat = plan.features.find(f => f.feature_key === kf.key);
                                                const isEnabled = feat?.enabled ?? false;
                                                return (
                                                    <button key={kf.key} onClick={() => handleToggleFeature(plan, kf.key, kf.label)} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 12px', borderRadius: 10, border: '1px solid var(--glass-border)', background: isEnabled ? 'rgba(16, 185, 129, 0.06)' : 'transparent', cursor: 'pointer', transition: 'all 0.15s', width: '100%', textAlign: 'left' }}>
                                                        {isEnabled ? <ToggleRight size={20} color="var(--brand-success)" /> : <ToggleLeft size={20} color="var(--text-muted)" />}
                                                        <span style={{ fontSize: '0.8125rem', fontWeight: isEnabled ? 600 : 400, color: isEnabled ? 'var(--text-primary)' : 'var(--text-secondary)' }}>{kf.label}</span>
                                                        {isEnabled && <CheckCircle2 size={14} color="var(--brand-success)" style={{ marginLeft: 'auto' }} />}
                                                    </button>
                                                );
                                            })}
                                        </div>
                                    </div>

                                    {/* Save Button */}
                                    <div style={{ padding: '16px 24px', borderTop: '1px solid var(--glass-border)' }}>
                                        <button onClick={() => handleSavePlan(plan)} className="glass-button glass-button-primary" style={{ width: '100%', justifyContent: 'center', fontSize: '0.8125rem' }} disabled={isLoading}>
                                            {isLoading ? <><RefreshCw size={14} className="animate-spin" /> Saving...</> : <><Save size={14} /> Save Changes</>}
                                        </button>
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    {/* New Plan Modal */}
                    {showNewPlanModal && (
                        <div className="modal-overlay" style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(8px)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
                            <div className="glass-card animate-scale-in" style={{ maxWidth: 480, width: '100%', padding: 32 }}>
                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                                        <div style={{ width: 44, height: 44, borderRadius: 12, background: 'rgba(79, 142, 247, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                            <Plus size={22} color="var(--brand-primary)" />
                                        </div>
                                        <div>
                                            <h2 style={{ fontSize: '1.125rem', fontWeight: 700 }}>Create Plan</h2>
                                            <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Add a new subscription plan</p>
                                        </div>
                                    </div>
                                    <button onClick={() => setShowNewPlanModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', padding: 4 }}>
                                        <X size={20} />
                                    </button>
                                </div>
                                <form onSubmit={handleCreatePlan} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                                        <div className="form-group"><label className="glass-label">Plan ID</label><input className="glass-input" required placeholder="e.g. quarterly" value={newPlan.id} onChange={e => setNewPlan(p => ({ ...p, id: e.target.value }))} /></div>
                                        <div className="form-group"><label className="glass-label">Plan Name</label><input className="glass-input" required placeholder="e.g. Quarterly" value={newPlan.name} onChange={e => setNewPlan(p => ({ ...p, name: e.target.value }))} /></div>
                                    </div>
                                    <div className="form-group"><label className="glass-label">Description</label><input className="glass-input" placeholder="Short description" value={newPlan.description} onChange={e => setNewPlan(p => ({ ...p, description: e.target.value }))} /></div>
                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 }}>
                                        <div className="form-group"><label className="glass-label">Price (Rs.)</label><input className="glass-input" type="number" placeholder="0" value={newPlan.price} onChange={e => setNewPlan(p => ({ ...p, price: e.target.value }))} /></div>
                                        <div className="form-group"><label className="glass-label">Period</label><input className="glass-input" placeholder="month" value={newPlan.period} onChange={e => setNewPlan(p => ({ ...p, period: e.target.value }))} /></div>
                                        <div className="form-group"><label className="glass-label">Days</label><input className="glass-input" type="number" placeholder="30" value={newPlan.duration_days} onChange={e => setNewPlan(p => ({ ...p, duration_days: e.target.value }))} /></div>
                                    </div>

                                    <div style={{ marginTop: 8 }}>
                                        <label className="glass-label" style={{ marginBottom: 12, display: 'block' }}>Include Features</label>
                                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                                            {KNOWN_FEATURES.map(kf => {
                                                const isEnabled = newPlan.selectedFeatures.includes(kf.key);
                                                return (
                                                    <button
                                                        key={kf.key}
                                                        type="button"
                                                        onClick={() => {
                                                            setNewPlan(prev => ({
                                                                ...prev,
                                                                selectedFeatures: isEnabled
                                                                    ? prev.selectedFeatures.filter(k => k !== kf.key)
                                                                    : [...prev.selectedFeatures, kf.key]
                                                            }));
                                                        }}
                                                        style={{
                                                            display: 'flex', alignItems: 'center', gap: 10, padding: '8px 12px',
                                                            borderRadius: 10, border: '1px solid var(--glass-border)',
                                                            background: isEnabled ? 'rgba(16, 185, 129, 0.06)' : 'transparent',
                                                            cursor: 'pointer', transition: 'all 0.15s', textAlign: 'left'
                                                        }}
                                                    >
                                                        {isEnabled ? <ToggleRight size={20} color="var(--brand-success)" /> : <ToggleLeft size={20} color="var(--text-muted)" />}
                                                        <span style={{ fontSize: '0.8125rem', fontWeight: isEnabled ? 600 : 400, color: isEnabled ? 'var(--text-primary)' : 'var(--text-secondary)' }}>{kf.label}</span>
                                                    </button>
                                                );
                                            })}
                                        </div>
                                    </div>

                                    <div style={{ display: 'flex', gap: 12, marginTop: 8 }}>
                                        <button type="button" onClick={() => setShowNewPlanModal(false)} className="glass-button" style={{ flex: 1, justifyContent: 'center' }}>Cancel</button>
                                        <button type="submit" className="glass-button glass-button-primary" style={{ flex: 1, justifyContent: 'center' }} disabled={planLoading === 'new'}>
                                            {planLoading === 'new' ? <><RefreshCw size={14} className="animate-spin" /> Creating...</> : 'Create Plan'}
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    )}
                </div>
            ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
                    {/* Header Row */}
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <div>
                            <h2 style={{ fontSize: '1.125rem', fontWeight: 600, marginBottom: 4 }}>Admin Access</h2>
                            <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>Manage who can access the system control panel</p>
                        </div>
                        <button onClick={() => setShowAddModal(true)} className="glass-button glass-button-primary" style={{ fontSize: '0.8125rem' }}>
                            <UserPlus size={16} /> Add Admin
                        </button>
                    </div>

                    {/* Admin List */}
                    <div className="glass-card" style={{ padding: 0 }}>
                        <table className="glass-table">
                            <thead>
                                <tr>
                                    <th>Administrator</th>
                                    <th style={{ textAlign: 'center' }}>Role</th>
                                    <th style={{ textAlign: 'center' }}>Authorized</th>
                                    <th style={{ textAlign: 'right' }}>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {/* Root Admin */}
                                <tr style={{ background: 'rgba(79, 142, 247, 0.04)' }}>
                                    <td>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                                            <div style={{ width: 40, height: 40, borderRadius: 10, background: 'var(--brand-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: '0.8125rem', fontWeight: 700 }}>
                                                JS
                                            </div>
                                            <div>
                                                <div style={{ fontWeight: 600, display: 'flex', alignItems: 'center', gap: 6 }}>
                                                    {process.env.NEXT_PUBLIC_SYSTEM_OWNER_EMAIL} <CheckCircle2 size={14} color="var(--brand-primary)" />
                                                </div>
                                                <div style={{ fontSize: '0.6875rem', color: 'var(--brand-primary)', fontWeight: 600 }}>System Owner</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td style={{ textAlign: 'center' }}>
                                        <span className="badge badge-info" style={{ fontSize: '0.6875rem' }}>ROOT</span>
                                    </td>
                                    <td style={{ textAlign: 'center', fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>
                                        System Launch
                                    </td>
                                    <td style={{ textAlign: 'right' }}>
                                        <Lock size={16} color="var(--text-muted)" />
                                    </td>
                                </tr>

                                {initialAdmins.filter(a => a.email !== process.env.NEXT_PUBLIC_SYSTEM_OWNER_EMAIL).map(admin => (
                                    <tr key={admin.id}>
                                        <td>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                                                <div style={{ width: 40, height: 40, borderRadius: 10, background: 'rgba(255, 255, 255, 0.05)', border: '1px solid var(--glass-border)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.8125rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-secondary)' }}>
                                                    {admin.email.substring(0, 2)}
                                                </div>
                                                <div>
                                                    <div style={{ fontWeight: 600 }}>{admin.email}</div>
                                                    <div style={{ fontSize: '0.6875rem', color: 'var(--text-muted)' }}>Authorized Admin</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td style={{ textAlign: 'center' }}>
                                            <span className="badge badge-outline" style={{ fontSize: '0.6875rem' }}>ADMIN</span>
                                        </td>
                                        <td style={{ textAlign: 'center', fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>
                                            {new Date(admin.created_at).toLocaleDateString()}
                                        </td>
                                        <td style={{ textAlign: 'right' }}>
                                            <button
                                                onClick={() => handleRemoveMaster(admin.id, admin.email)}
                                                className="glass-button"
                                                style={{ padding: '6px 12px', color: 'var(--brand-danger)', borderColor: 'rgba(239, 68, 68, 0.2)', fontSize: '0.75rem' }}
                                                disabled={masterLoading}
                                            >
                                                <Trash2 size={14} /> Remove
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* Add Admin Modal */}
            {showAddModal && (
                <div className="modal-overlay" style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(8px)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
                    <div className="glass-card animate-scale-in" style={{ maxWidth: 450, width: '100%', padding: 32 }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                                <div style={{ width: 44, height: 44, borderRadius: 12, background: 'rgba(79, 142, 247, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    <UserPlus size={22} color="var(--brand-primary)" />
                                </div>
                                <div>
                                    <h2 style={{ fontSize: '1.125rem', fontWeight: 700 }}>Add Admin</h2>
                                    <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Grant system control access</p>
                                </div>
                            </div>
                            <button onClick={() => setShowAddModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', padding: 4 }}>
                                <X size={20} />
                            </button>
                        </div>

                        <form onSubmit={handleAddMaster} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                            <div className="form-group">
                                <label className="glass-label">Email Address</label>
                                <div style={{ position: 'relative' }}>
                                    <Mail size={16} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                                    <input
                                        type="email"
                                        required
                                        className="glass-input"
                                        style={{ paddingLeft: 40 }}
                                        placeholder="admin@example.com"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        autoFocus
                                    />
                                </div>
                            </div>

                            <div style={{ padding: 16, borderRadius: 12, background: 'rgba(245, 158, 11, 0.06)', border: '1px solid rgba(245, 158, 11, 0.15)', display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                                <AlertTriangle size={18} color="var(--brand-warning)" style={{ flexShrink: 0, marginTop: 2 }} />
                                <p style={{ fontSize: '0.8125rem', color: 'var(--brand-warning)', lineHeight: 1.5 }}>
                                    Admins gain full control over subscriptions, billing, and security settings.
                                </p>
                            </div>

                            <div style={{ display: 'flex', gap: 12 }}>
                                <button type="button" onClick={() => setShowAddModal(false)} className="glass-button" style={{ flex: 1, justifyContent: 'center' }}>
                                    Cancel
                                </button>
                                <button type="submit" className="glass-button glass-button-primary" style={{ flex: 1, justifyContent: 'center' }} disabled={masterLoading}>
                                    {masterLoading ? (
                                        <><RefreshCw size={14} className="animate-spin" /> Authorizing...</>
                                    ) : 'Authorize Access'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
