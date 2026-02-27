'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { addAdminEmail, removeAdminEmail } from '@/lib/actions/admin-management';
import { toast } from 'sonner';
import { ShieldCheck, UserPlus, Trash2, Mail, Lock, AlertCircle, Info, CheckCircle2, ArrowLeft, History, Users } from 'lucide-react';

type AdminEntry = { id: string; email: string; created_at: string };

export default function AdminManagementClient({ initialAdmins }: { initialAdmins: AdminEntry[] }) {
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    async function handleAdd(e: React.FormEvent) {
        e.preventDefault();
        if (!email) return;
        setLoading(true);
        const result = await addAdminEmail(email);
        if (result.error) {
            toast.error(result.error);
        } else {
            toast.success('Admin authorized successfully');
            setEmail('');
            router.refresh();
        }
        setLoading(false);
    }

    async function handleRemove(id: string, adminEmail: string) {
        if (adminEmail === 'junsangsingh@gmail.com') {
            return toast.error('Primary system owner cannot be revoked');
        }
        if (!confirm(`Are you sure you want to revoke admin access for ${adminEmail}?`)) return;

        setLoading(true);
        const result = await removeAdminEmail(id);
        if (result.error) {
            toast.error(result.error);
        } else {
            toast.success('Access revoked successfully');
            router.refresh();
        }
        setLoading(false);
    }

    return (
        <div className="animate-fade-in-up">
            {/* Standard Page Header */}
            <div className="page-header" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24, gap: 16 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <button
                        onClick={() => router.back()}
                        className="glass-button"
                        style={{ padding: '8px 12px', minWidth: 'auto' }}
                        title="Go Back"
                    >
                        <ArrowLeft size={16} />
                    </button>
                    <div>
                        <h1 className="page-title">Admin Management</h1>
                        <p className="page-subtitle">Configure system-wide administrative access</p>
                    </div>
                </div>
                <div className="flex gap-2">
                    <span className="badge badge-info" style={{ height: 'fit-content', padding: '6px 12px' }}>
                        <Users size={12} /> {initialAdmins.length + 1} MASTERS
                    </span>
                </div>
            </div>

            {/* Standard Stats Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 20, marginBottom: 32 }}>
                {/* Authorization Card */}
                <div className="glass-card" style={{ padding: 24 }}>
                    <div className="flex items-center gap-2 mb-6 text-brand-primary">
                        <UserPlus size={18} />
                        <h2 className="text-sm font-bold uppercase tracking-widest">Authorize Master</h2>
                    </div>

                    <form onSubmit={handleAdd} className="flex flex-col gap-4">
                        <div className="form-group">
                            <label className="form-label">Gmail Account</label>
                            <div className="relative">
                                <input
                                    type="email"
                                    required
                                    className="glass-input !pl-10"
                                    placeholder="user@gmail.com"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                />
                                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted" size={16} />
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="glass-button glass-button-primary w-full shadow-lg"
                            style={{ justifyContent: 'center', padding: '12px' }}
                        >
                            {loading ? (
                                <div className="flex items-center gap-2">
                                    <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                                    <span>Syncing...</span>
                                </div>
                            ) : (
                                <span className="flex items-center gap-2">
                                    Authorize Access <ShieldCheck size={16} />
                                </span>
                            )}
                        </button>
                    </form>

                    <div className="mt-6 p-4 rounded-xl bg-brand-warning/10 border border-brand-warning/20 flex gap-3">
                        <AlertCircle className="text-brand-warning shrink-0" size={18} />
                        <p className="text-[10px] text-brand-warning leading-relaxed font-bold uppercase">
                            Warning: Admins have full access to organization subscriptions and global settings. Only authorize trusted accounts.
                        </p>
                    </div>
                </div>

                {/* Info Card */}
                <div className="glass-card flex flex-col justify-between" style={{ padding: 24 }}>
                    <div className="flex items-center gap-2 mb-4 text-brand-primary">
                        <Info size={18} />
                        <h2 className="text-sm font-bold uppercase tracking-widest">System Protocol</h2>
                    </div>
                    <p className="text-sm text-secondary leading-relaxed mb-6">
                        Site administrators operate at the infrastructure level. Their permissions override organization-specific restrictions to allow for global support and maintenance.
                    </p>
                    <div className="pt-4 border-t border-white/5 flex items-center justify-between text-[11px] font-black text-muted uppercase tracking-widest">
                        <span className="flex items-center gap-1"><History size={12} /> Audit Enabled</span>
                        <span className="text-brand-success flex items-center gap-1"><CheckCircle2 size={12} /> Secure</span>
                    </div>
                </div>
            </div>

            {/* Admin List Table */}
            <div className="glass-card" style={{ padding: 0, overflow: 'hidden' }}>
                <div className="p-6 border-b border-white/5 flex items-center justify-between bg-white/[0.02]">
                    <div className="flex items-center gap-3">
                        <ShieldCheck size={20} className="text-brand-primary" />
                        <h2 className="text-sm font-bold uppercase tracking-widest">Active Administrators</h2>
                    </div>
                    <div className="flex items-center gap-2 text-[10px] text-muted font-black uppercase tracking-widest">
                        <div className="w-2 h-2 rounded-full bg-brand-primary animate-pulse" /> Live Schema Sync
                    </div>
                </div>

                <table className="glass-table">
                    <thead>
                        <tr>
                            <th style={{ paddingLeft: 24 }}>Admin Profile</th>
                            <th style={{ textAlign: 'center' }}>Permission</th>
                            <th style={{ textAlign: 'right', paddingRight: 24 }}>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {/* Primary Admin */}
                        <tr>
                            <td style={{ paddingLeft: 24 }}>
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-xl bg-brand-primary/10 flex items-center justify-center text-brand-primary text-xs font-black border border-brand-primary/20">
                                        JS
                                    </div>
                                    <div className="flex flex-col">
                                        <span className="text-sm font-bold text-primary flex items-center gap-2">
                                            junsangsingh@gmail.com
                                            <CheckCircle2 size={14} className="text-brand-primary" />
                                        </span>
                                        <span className="text-[10px] text-muted font-bold uppercase tracking-widest">Primary System Owner</span>
                                    </div>
                                </div>
                            </td>
                            <td style={{ textAlign: 'center' }}>
                                <span className="badge badge-success">PERMANENT</span>
                            </td>
                            <td style={{ textAlign: 'right', paddingRight: 24 }}>
                                <Lock size={16} className="text-muted opacity-30 inline" />
                            </td>
                        </tr>

                        {initialAdmins.filter(a => a.email !== 'junsangsingh@gmail.com').map((admin) => (
                            <tr key={admin.id}>
                                <td style={{ paddingLeft: 24 }}>
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-muted text-xs font-black border border-white/10 uppercase">
                                            {admin.email.substring(0, 2)}
                                        </div>
                                        <div className="flex flex-col">
                                            <span className="text-sm font-bold text-primary">{admin.email}</span>
                                            <span className="text-[10px] text-muted font-bold uppercase tracking-widest">Authorized Site Admin</span>
                                        </div>
                                    </div>
                                </td>
                                <td style={{ textAlign: 'center' }}>
                                    <span className="badge badge-info">AUTHORIZED</span>
                                </td>
                                <td style={{ textAlign: 'right', paddingRight: 24 }}>
                                    <button
                                        onClick={() => handleRemove(admin.id, admin.email)}
                                        className="glass-button"
                                        style={{ padding: '6px', minWidth: 'auto', border: '1px solid rgba(239, 68, 68, 0.2)', color: 'var(--brand-danger)' }}
                                        title="Revoke Access"
                                    >
                                        <Trash2 size={14} />
                                    </button>
                                </td>
                            </tr>
                        ))}

                        {initialAdmins.filter(a => a.email !== 'junsangsingh@gmail.com').length === 0 && (
                            <tr>
                                <td colSpan={3} className="text-center" style={{ padding: '60px 0' }}>
                                    <div className="flex flex-col items-center gap-2 opacity-30">
                                        <Lock size={32} />
                                        <p className="text-[10px] font-bold uppercase tracking-widest">No Secondary Administrators</p>
                                    </div>
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>

                <div className="p-6 bg-white/[0.01] border-t border-white/5 flex items-center justify-between text-[10px] font-black text-muted/30 uppercase tracking-[0.4em]">
                    <div>Encrypted Endpoint</div>
                    <div>v2.5.0-master</div>
                </div>
            </div>

            <style jsx>{`
                .form-group {
                    display: flex;
                    flex-direction: column;
                    gap: 8px;
                }
            `}</style>
        </div>
    );
}
