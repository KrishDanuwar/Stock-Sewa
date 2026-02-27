'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { addAdminEmail, removeAdminEmail } from '@/lib/actions/admin-management';
import { toast } from 'sonner';
import { ShieldCheck, UserPlus, Trash2, Mail, Lock, AlertCircle, Info, CheckCircle2, ArrowLeft, History, Users, ShieldAlert, X } from 'lucide-react';

type AdminEntry = { id: string; email: string; created_at: string };

export default function AdminManagementClient({ initialAdmins }: { initialAdmins: AdminEntry[] }) {
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [showAddModal, setShowAddModal] = useState(false);
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
            setShowAddModal(false);
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

    const totalAdmins = initialAdmins.length + 1;

    return (
        <div className="animate-fade-in-up">
            {/* Standard Page Header */}
            <div className="page-header" style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 24 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                    <button
                        onClick={() => router.back()}
                        className="glass-button h-10 w-10 !p-0"
                        title="Go Back"
                    >
                        <ArrowLeft size={18} />
                    </button>
                    <div>
                        <h1 className="page-title">Access Control</h1>
                        <p className="page-subtitle">Manage high-level system administrators</p>
                    </div>
                </div>
                <button
                    onClick={() => setShowAddModal(true)}
                    className="glass-button glass-button-primary shadow-[0_0_20px_rgba(79,142,247,0.2)]"
                >
                    <UserPlus size={16} /> Authorize Admin
                </button>
            </div>

            {/* Standard Stats Overview Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 20, marginBottom: 32 }}>
                <div className="glass-card flex items-center gap-4" style={{ padding: '24px' }}>
                    <div className="w-12 h-12 rounded-xl bg-brand-primary/10 flex items-center justify-center text-brand-primary border border-brand-primary/10">
                        <Users size={24} />
                    </div>
                    <div>
                        <div className="text-[10px] font-black text-muted uppercase tracking-widest">Total Masters</div>
                        <div className="text-2xl font-black text-primary">{totalAdmins}</div>
                    </div>
                </div>
                <div className="glass-card flex items-center gap-4" style={{ padding: '24px', borderLeft: '4px solid var(--brand-success)' }}>
                    <div className="w-12 h-12 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-500 border border-emerald-500/10">
                        <ShieldCheck size={24} />
                    </div>
                    <div>
                        <div className="text-[10px] font-black text-muted uppercase tracking-widest">System Security</div>
                        <div className="text-2xl font-black text-emerald-500">ENFORCED</div>
                    </div>
                </div>
                <div className="glass-card flex items-center gap-4" style={{ padding: '24px' }}>
                    <div className="w-12 h-12 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-500 border border-amber-500/10">
                        <Lock size={24} />
                    </div>
                    <div>
                        <div className="text-[10px] font-black text-muted uppercase tracking-widest">Global Protocol</div>
                        <div className="text-lg font-black text-primary">v2.5 MASTER</div>
                    </div>
                </div>
            </div>

            {/* Unified Admin Table */}
            <div className="glass-card" style={{ padding: 0, overflow: 'hidden' }}>
                <div className="p-6 border-b border-white/5 flex items-center justify-between bg-white/[0.02]">
                    <div className="flex items-center gap-3">
                        <ShieldCheck size={20} className="text-brand-primary" />
                        <h2 className="text-sm font-bold uppercase tracking-widest">Authorized Administrators</h2>
                    </div>
                    <div className="flex items-center gap-2 text-[10px] text-muted font-black uppercase tracking-widest">
                        <span className="flex items-center gap-1.5"><History size={12} /> Live Trace Active</span>
                    </div>
                </div>

                <table className="glass-table">
                    <thead>
                        <tr>
                            <th style={{ paddingLeft: 24, width: '40%' }}>Administrator Detail</th>
                            <th style={{ textAlign: 'center', width: '30%' }}>Authorization Level</th>
                            <th style={{ textAlign: 'center', width: '20%' }}>Added Date</th>
                            <th style={{ textAlign: 'right', paddingRight: 24, width: '10%' }}>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {/* Primary Admin */}
                        <tr>
                            <td style={{ paddingLeft: 24 }}>
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 rounded-xl bg-brand-primary/10 flex items-center justify-center text-brand-primary text-xs font-black border border-brand-primary/20">
                                        JS
                                    </div>
                                    <div className="flex flex-col">
                                        <span className="text-sm font-black text-primary flex items-center gap-2">
                                            junsangsingh@gmail.com
                                            <CheckCircle2 size={14} className="text-brand-primary" />
                                        </span>
                                        <span className="text-[10px] text-muted font-bold uppercase tracking-widest">Primary System Owner</span>
                                    </div>
                                </div>
                            </td>
                            <td style={{ textAlign: 'center' }}>
                                <span className="badge badge-success">PERMANENT ROOT</span>
                            </td>
                            <td style={{ textAlign: 'center' }}>
                                <span className="text-xs font-bold text-muted uppercase tracking-tighter">System Default</span>
                            </td>
                            <td style={{ textAlign: 'right', paddingRight: 24 }}>
                                <div className="flex justify-end">
                                    <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-muted opacity-20 border border-white/10">
                                        <Lock size={14} />
                                    </div>
                                </div>
                            </td>
                        </tr>

                        {initialAdmins.filter(a => a.email !== 'junsangsingh@gmail.com').map((admin) => (
                            <tr key={admin.id}>
                                <td style={{ paddingLeft: 24 }}>
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-muted text-xs font-black border border-white/10 uppercase">
                                            {admin.email.substring(0, 2)}
                                        </div>
                                        <div className="flex flex-col">
                                            <span className="text-sm font-black text-primary">{admin.email}</span>
                                            <span className="text-[10px] text-muted font-bold uppercase tracking-widest">Authorized Site Admin</span>
                                        </div>
                                    </div>
                                </td>
                                <td style={{ textAlign: 'center' }}>
                                    <span className="badge badge-info">AUTHORIZED MASTER</span>
                                </td>
                                <td style={{ textAlign: 'center' }}>
                                    <span className="text-xs font-black text-muted uppercase tracking-tighter">
                                        {new Date(admin.created_at).toLocaleDateString()}
                                    </span>
                                </td>
                                <td style={{ textAlign: 'right', paddingRight: 24 }}>
                                    <button
                                        onClick={() => handleRemove(admin.id, admin.email)}
                                        className="glass-button h-8 w-8 !p-0"
                                        style={{ color: 'var(--brand-danger)', borderColor: 'rgba(239, 68, 68, 0.1)' }}
                                        title="Revoke Access"
                                    >
                                        <Trash2 size={14} />
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>

                <div className="p-6 bg-white/[0.01] border-t border-white/5 flex items-center justify-between text-[10px] font-black text-muted/30 uppercase tracking-[0.4em]">
                    <div className="flex items-center gap-2"><Lock size={12} /> SECURE MASTER ENDPOINT</div>
                    <div>v2.5.0-SS-CONTROL</div>
                </div>
            </div>

            {/* Grant Authorization Modal */}
            {showAddModal && (
                <div className="glass-modal">
                    <div className="glass-card glass-modal-card animate-fade-in-up" style={{ width: '100%', maxWidth: 440, padding: 32, position: 'relative' }}>
                        <button
                            onClick={() => setShowAddModal(false)}
                            style={{ position: 'absolute', top: 16, right: 16, background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)' }}
                        >
                            <X size={20} />
                        </button>

                        <div className="w-16 h-16 rounded-2xl bg-brand-primary/10 flex items-center justify-center text-brand-primary border border-brand-primary/10 mx-auto mb-6">
                            <ShieldAlert size={32} />
                        </div>

                        <h2 className="text-xl font-black text-center mb-1">Grant Access</h2>
                        <p className="text-xs text-muted text-center mb-8 uppercase tracking-widest font-black">
                            Authorize New System Master
                        </p>

                        <form onSubmit={handleAdd} className="flex flex-col gap-6">
                            <div className="form-group">
                                <label className="glass-label mb-2 block">Gmail Address</label>
                                <div className="relative">
                                    <input
                                        type="email"
                                        required
                                        className="glass-input !pl-12 h-14 text-sm font-bold"
                                        placeholder="administrator@gmail.com"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        autoFocus
                                    />
                                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-muted" size={18} />
                                </div>
                            </div>

                            <div className="p-4 rounded-xl bg-amber-500/5 border border-amber-500/10 flex gap-3">
                                <AlertCircle className="text-amber-500 shrink-0" size={18} />
                                <p className="text-[9px] text-amber-500/80 leading-relaxed font-black uppercase">
                                    Masters can access all organization data, manage business plans, and revoke other admins.
                                </p>
                            </div>

                            <div style={{ display: 'flex', gap: 12, marginTop: 8 }}>
                                <button
                                    type="button"
                                    className="glass-button flex-1 h-12"
                                    onClick={() => setShowAddModal(false)}
                                    disabled={loading}
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="glass-button glass-button-primary flex-1 h-12 shadow-[0_8px_20px_rgba(79,142,247,0.3)]"
                                    disabled={loading}
                                >
                                    {loading ? 'Authorizing...' : 'Grant Access'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

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
