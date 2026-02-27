'use client';

import { useState } from 'react';
import { activateSubscription } from '@/lib/actions/subscriptions';
import { toast } from 'sonner';
import { CheckCircle, XCircle, ExternalLink, Shield, Search, RefreshCw } from 'lucide-react';

interface Org {
    id: string;
    name: string;
    subscription_plan: string;
    subscription_status: string;
    last_transaction_id: string | null;
    trial_ends_at: string | null;
    created_at: string;
}

export default function AdminSubscriptionsClient({ initialOrgs }: { initialOrgs: Org[] }) {
    const [orgs, setOrgs] = useState(initialOrgs);
    const [loadingId, setLoadingId] = useState<string | null>(null);
    const [search, setSearch] = useState('');

    const handleActivate = async (id: string, plan: string) => {
        if (!confirm(`Activate ${plan} subscription for this organization?`)) return;

        setLoadingId(id);
        const result = await activateSubscription(id, plan as 'monthly' | 'yearly');
        if (result.success) {
            toast.success('Subscription activated!');
            setOrgs(prev => prev.filter(o => o.id !== id));
        } else {
            toast.error(result.error || 'Failed to activate');
        }
        setLoadingId(null);
    };

    const filteredOrgs = orgs.filter(o =>
        o.name.toLowerCase().includes(search.toLowerCase()) ||
        o.last_transaction_id?.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="p-8 max-w-7xl mx-auto">
            <header style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 40 }}>
                <div>
                    <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-primary)' }}>Admin: Subscriptions</h1>
                    <p style={{ color: 'var(--text-muted)' }}>Verify and activate manual payments</p>
                </div>
                <div style={{ padding: '8px 16px', background: 'rgba(79, 142, 247, 0.1)', borderRadius: 12, color: 'var(--brand-primary)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 8 }}>
                    <Shield size={18} /> Master Admin Access
                </div>
            </header>

            <div className="glass-card" style={{ padding: 24, marginBottom: 32 }}>
                <div style={{ position: 'relative', maxWidth: 400 }}>
                    <Search style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} size={18} />
                    <input
                        className="glass-input"
                        placeholder="Search by shop name or ID..."
                        style={{ paddingLeft: 48 }}
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>
            </div>

            <div className="glass-card" style={{ overflow: 'hidden' }}>
                <table className="glass-table">
                    <thead>
                        <tr>
                            <th>Organization</th>
                            <th>Status / Plan</th>
                            <th>Transaction ID</th>
                            <th>Trial Ended</th>
                            <th style={{ textAlign: 'right' }}>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredOrgs.length > 0 ? filteredOrgs.map((org) => (
                            <tr key={org.id}>
                                <td>
                                    <div style={{ fontWeight: 600 }}>{org.name}</div>
                                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Created {new Date(org.created_at).toLocaleDateString()}</div>
                                </td>
                                <td>
                                    <span className={`badge ${org.subscription_status === 'pending' ? 'badge-warning' : 'badge-danger'}`} style={{ marginRight: 8 }}>
                                        {org.subscription_status.toUpperCase()}
                                    </span>
                                    <span style={{ fontSize: '0.8125rem', fontWeight: 500 }}>{org.subscription_plan}</span>
                                </td>
                                <td>
                                    {org.last_transaction_id ? (
                                        <code style={{ background: 'rgba(255,255,255,0.05)', padding: '4px 8px', borderRadius: 4, color: 'var(--brand-primary)' }}>{org.last_transaction_id}</code>
                                    ) : (
                                        <span style={{ color: 'var(--text-muted)', fontSize: '0.8125rem' }}>N/A</span>
                                    )}
                                </td>
                                <td style={{ fontSize: '0.8125rem' }}>
                                    {org.trial_ends_at ? new Date(org.trial_ends_at).toLocaleDateString() : 'N/A'}
                                </td>
                                <td style={{ textAlign: 'right' }}>
                                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
                                        <button
                                            className="glass-button"
                                            style={{ color: 'var(--brand-success)', borderColor: 'rgba(16, 185, 129, 0.2)' }}
                                            onClick={() => handleActivate(org.id, org.subscription_plan || 'monthly')}
                                            disabled={loadingId === org.id}
                                        >
                                            {loadingId === org.id ? <RefreshCw className="animate-spin" size={14} /> : <CheckCircle size={14} />}
                                            Activate
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        )) : (
                            <tr>
                                <td colSpan={5} style={{ textAlign: 'center', padding: '64px 0', color: 'var(--text-muted)' }}>
                                    No pending or expired organizations found.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
