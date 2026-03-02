'use client';

import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { addAdminEmail, removeAdminEmail } from '@/lib/actions/admin-management';
import { activateSubscription, rejectSubscription } from '@/lib/actions/subscriptions';
import { toast } from 'sonner';
import {
    ShieldCheck, UserPlus, Trash2, Mail, Lock, CheckCircle2,
    ArrowLeft, Users, X, CreditCard, Search, Filter, RefreshCw,
    XCircle, ChevronDown, Zap, Crown, AlertTriangle
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

export default function AdminDashboardClient({
    initialAdmins,
    initialOrgs
}: {
    initialAdmins: AdminEntry[];
    initialOrgs: Org[];
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

    const tabs = [
        { id: 'subscriptions' as const, label: 'Subscriptions', icon: CreditCard },
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
                    <div style={{ overflowX: 'auto' }}>
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
                                    const planOptions = Object.values(PLANS).filter(p => p.id !== 'trial').map(p => ({ id: p.id, name: p.name }));

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
                                                    value={selectedPlans[org.id] || (org.subscription_plan === 'trial' ? 'monthly' : org.subscription_plan) || 'monthly'}
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
                    <div className="glass-card" style={{ padding: 0, overflow: 'hidden' }}>
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
                                                    junsangsingh@gmail.com <CheckCircle2 size={14} color="var(--brand-primary)" />
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

                                {initialAdmins.filter(a => a.email !== 'junsangsingh@gmail.com').map(admin => (
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
