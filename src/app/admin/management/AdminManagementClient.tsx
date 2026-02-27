'use client';

import { useState } from 'react';
import { addAdminEmail, removeAdminEmail } from '@/lib/actions/admin-management';
import { toast } from 'sonner';
import { ShieldCheck, UserPlus, Trash2, Mail, Lock, AlertCircle } from 'lucide-react';

type AdminEntry = { id: string; email: string; created_at: string };

export default function AdminManagementClient({ initialAdmins }: { initialAdmins: AdminEntry[] }) {
    const [admins, setAdmins] = useState(initialAdmins);
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);

    async function handleAdd(e: React.FormEvent) {
        e.preventDefault();
        if (!email) return;
        setLoading(true);
        const result = await addAdminEmail(email);
        if (result.error) {
            toast.error(result.error);
        } else {
            toast.success('Admin added successfully');
            setEmail('');
            // Refresh would happen via revalidatePath, but we can also update local state for speed
            window.location.reload();
        }
        setLoading(false);
    }

    async function handleRemove(id: string, adminEmail: string) {
        if (adminEmail === 'junsangsingh@gmail.com') {
            return toast.error('Primary admin cannot be removed');
        }
        if (!confirm(`Revoke admin access for ${adminEmail}?`)) return;

        setLoading(true);
        const result = await removeAdminEmail(id);
        if (result.error) {
            toast.error(result.error);
        } else {
            toast.success('Access revoked');
            window.location.reload();
        }
        setLoading(false);
    }

    return (
        <div className="animate-fade-in-up">
            <div className="page-header mb-8">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-brand-primary/10 flex items-center justify-center text-brand-primary border border-brand-primary/10">
                        <Lock size={20} />
                    </div>
                    <div>
                        <h1 className="page-title">Admin Access Control</h1>
                        <p className="page-subtitle">Manage who can access the system settings and subscriptions</p>
                    </div>
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.5fr', gap: 32, alignItems: 'start' }}>
                {/* Add Form */}
                <div className="glass-card" style={{ padding: 32 }}>
                    <div className="flex items-center gap-2 mb-6 text-brand-primary">
                        <UserPlus size={18} />
                        <h2 className="text-sm font-black uppercase tracking-widest">Add New Admin</h2>
                    </div>
                    <form onSubmit={handleAdd} className="flex flex-col gap-4">
                        <div className="form-group">
                            <label className="glass-label mb-2 block text-[10px] uppercase font-bold text-muted">Gmail Address</label>
                            <div className="relative">
                                <input
                                    type="email"
                                    required
                                    className="glass-input !pl-10"
                                    placeholder="example@gmail.com"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                />
                                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted" size={16} />
                            </div>
                        </div>
                        <button
                            type="submit"
                            disabled={loading}
                            className="glass-button glass-button-primary w-full h-12 shadow-[0_8px_20px_rgba(79,142,247,0.2)]"
                        >
                            {loading ? 'Authorizing...' : 'Authorize Email'}
                        </button>
                    </form>

                    <div className="mt-8 p-4 rounded-xl bg-amber-500/5 border border-amber-500/10 flex gap-3">
                        <AlertCircle className="text-amber-500 shrink-0" size={18} />
                        <p className="text-[10px] text-amber-500/80 leading-relaxed font-bold uppercase">
                            Warning: Admins have full access to organization data, subscription plans, and user management. Only authorize trusted accounts.
                        </p>
                    </div>
                </div>

                {/* List */}
                <div className="glass-card" style={{ padding: 0, overflow: 'hidden' }}>
                    <div className="p-6 border-b border-white/5 flex items-center justify-between bg-white/5">
                        <div className="flex items-center gap-2">
                            <ShieldCheck size={18} className="text-emerald-500" />
                            <h2 className="text-xs font-black uppercase tracking-widest">Authorized Administrators</h2>
                        </div>
                        <span className="badge badge-info">{admins.length} active</span>
                    </div>

                    <table className="glass-table">
                        <thead>
                            <tr>
                                <th>Admin User</th>
                                <th>Status</th>
                                <th style={{ textAlign: 'right' }}>Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {/* Primary Admin Hardcoded and logic-protected */}
                            <tr>
                                <td>
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-full bg-brand-primary/10 flex items-center justify-center text-brand-primary text-[10px] font-black">
                                            JS
                                        </div>
                                        <div className="flex flex-col">
                                            <span className="text-xs font-black">junsangsingh@gmail.com</span>
                                            <span className="text-[9px] text-muted font-bold uppercase tracking-tighter">System Owner</span>
                                        </div>
                                    </div>
                                </td>
                                <td><span className="badge badge-success">Permanent</span></td>
                                <td style={{ textAlign: 'right' }}>
                                    <Lock size={14} className="text-muted inline opacity-30" />
                                </td>
                            </tr>

                            {admins.filter(a => a.email !== 'junsangsingh@gmail.com').map(admin => (
                                <tr key={admin.id}>
                                    <td>
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-muted text-[10px] font-black uppercase">
                                                {admin.email.substring(0, 2)}
                                            </div>
                                            <div className="flex flex-col">
                                                <span className="text-xs font-black">{admin.email}</span>
                                                <span className="text-[9px] text-muted font-bold uppercase tracking-tighter">Added on {new Date(admin.created_at).toLocaleDateString()}</span>
                                            </div>
                                        </div>
                                    </td>
                                    <td><span className="badge badge-info text-[9px]">Authorized</span></td>
                                    <td style={{ textAlign: 'right' }}>
                                        <button
                                            onClick={() => handleRemove(admin.id, admin.email)}
                                            className="glass-button h-8 w-8 !p-0 border-red-500/10 hover:bg-red-500/10 text-red-500"
                                            title="Revoke Access"
                                        >
                                            <Trash2 size={14} />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
