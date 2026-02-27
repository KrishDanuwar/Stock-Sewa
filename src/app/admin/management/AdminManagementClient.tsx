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
        <div className="animate-fade-in-up max-w-[1400px] mx-auto px-4 sm:px-6">
            <div className="page-header mb-10 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6 pb-8 border-b border-white/5">
                <div className="flex items-center gap-5">
                    <button
                        onClick={() => router.back()}
                        className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-muted hover:text-brand-primary hover:bg-brand-primary/10 hover:border-brand-primary/20 transition-all active:scale-90 group shadow-lg"
                        title="Go Back"
                    >
                        <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
                    </button>
                    <div className="flex items-center gap-4 border-l border-white/10 pl-5">
                        <div className="w-14 h-14 rounded-2xl bg-brand-primary/10 flex items-center justify-center text-brand-primary border border-brand-primary/20 shadow-[0_8px_30px_rgba(79,142,247,0.15)] ring-4 ring-brand-primary/5">
                            <ShieldCheck size={32} />
                        </div>
                        <div>
                            <h1 className="page-title !text-4xl !tracking-tighter">Site Control Center</h1>
                            <p className="page-subtitle !text-sm flex items-center gap-2 font-black uppercase tracking-widest opacity-60">
                                <Lock size={14} className="text-brand-primary" /> Master Access Management
                            </p>
                        </div>
                    </div>
                </div>

                <div className="flex bg-white/5 p-1 rounded-2xl border border-white/10 shadow-inner">
                    <div className="px-6 py-3 flex flex-col items-center border-r border-white/5">
                        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-muted mb-1">Total Masters</span>
                        <div className="text-xl font-black text-brand-primary flex items-center gap-2">
                            <Users size={16} /> <span>{initialAdmins.length + 1}</span>
                        </div>
                    </div>
                    <div className="px-6 py-3 flex flex-col items-center">
                        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-muted mb-1">Security Status</span>
                        <span className="text-[11px] font-black bg-emerald-500/10 text-emerald-500 px-3 py-1 rounded-full border border-emerald-500/20 shadow-[0_4px_12px_rgba(16,185,129,0.1)]">Enforced</span>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-12 gap-10">
                {/* Authorization Card */}
                <div className="xl:col-span-4 space-y-6">
                    <div className="glass-card relative overflow-hidden ring-1 ring-white/10 shadow-2xl" style={{ padding: 40 }}>
                        {/* Dynamic background accents */}
                        <div className="absolute -top-32 -right-32 w-64 h-64 bg-brand-primary/10 rounded-full blur-[100px] pointer-events-none animate-pulse" />
                        <div className="absolute -bottom-32 -left-32 w-64 h-64 bg-brand-primary/5 rounded-full blur-[100px] pointer-events-none" />

                        <div className="flex items-center gap-3 mb-10 pb-6 border-b border-white/5">
                            <div className="w-10 h-10 rounded-xl bg-brand-primary/10 flex items-center justify-center text-brand-primary border border-brand-primary/20">
                                <UserPlus size={20} />
                            </div>
                            <h2 className="text-sm font-black uppercase tracking-[0.25em] text-primary">Grant Authorization</h2>
                        </div>

                        <form onSubmit={handleAdd} className="space-y-8">
                            <div className="form-group relative group">
                                <label className="glass-label mb-4 block text-[11px] uppercase font-black text-muted tracking-[0.15em] pl-1">New Administrator Email</label>
                                <div className="relative group/input">
                                    <input
                                        type="email"
                                        required
                                        className="glass-input !pl-12 h-16 !bg-white/5 focus:!bg-white/[0.08] transition-all border-white/10 !rounded-2xl text-[15px] font-semibold tracking-tight focus:ring-4 focus:ring-brand-primary/10"
                                        placeholder="Enter registered Gmail..."
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                    />
                                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-muted group-focus-within/input:text-brand-primary transition-colors group-hover/input:scale-110" size={20} />
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className="glass-button glass-button-primary w-full h-16 !rounded-2xl !text-[13px] font-black uppercase tracking-[0.2em] shadow-[0_20px_40px_-10px_rgba(79,142,247,0.4)] hover:shadow-[0_25px_50px_-10px_rgba(79,142,247,0.5)] active:scale-[0.97] transition-all duration-300"
                            >
                                {loading ? (
                                    <div className="flex items-center gap-3">
                                        <div className="w-5 h-5 border-3 border-white/30 border-t-white rounded-full animate-spin" />
                                        <span>Syncing Data...</span>
                                    </div>
                                ) : (
                                    <span className="flex items-center gap-2 justify-center">
                                        Authorize User <ArrowLeft size={18} className="rotate-[135deg] opacity-60" />
                                    </span>
                                )}
                            </button>
                        </form>

                        <div className="mt-12 p-6 rounded-[24px] bg-amber-500/[0.03] border border-amber-500/10 flex gap-4 backdrop-blur-sm">
                            <div className="w-10 h-10 rounded-full bg-amber-500/10 flex items-center justify-center shrink-0">
                                <AlertCircle className="text-amber-500" size={20} />
                            </div>
                            <div className="space-y-1">
                                <p className="text-[11px] text-amber-500 font-black uppercase tracking-widest">Master Warning</p>
                                <p className="text-[10px] text-amber-500/60 leading-relaxed font-bold">Authorized admins can fully manage business plans, delete organizations, and modify global system configurations. Check emails twice.</p>
                            </div>
                        </div>
                    </div>

                    <div className="glass-card !bg-brand-primary/[0.02] border border-brand-primary/10 shadow-inner" style={{ padding: 24 }}>
                        <div className="flex items-start gap-4">
                            <div className="w-8 h-8 rounded-full bg-brand-primary/10 flex items-center justify-center shrink-0 text-brand-primary">
                                <Info size={16} />
                            </div>
                            <p className="text-[11px] text-secondary leading-relaxed font-bold text-justify uppercase tracking-tighter opacity-80">
                                Site administrators are independent from organization roles. They have authority over technical subscriptions and global shop management.
                            </p>
                        </div>
                    </div>
                </div>

                {/* List Card */}
                <div className="xl:col-span-8">
                    <div className="glass-card !p-0 overflow-hidden ring-1 ring-white/10 shadow-2xl rounded-[32px]">
                        <div className="p-10 border-b border-white/5 flex flex-col sm:flex-row sm:items-center justify-between gap-6 bg-white/[0.02] backdrop-blur-md">
                            <div className="flex items-center gap-4">
                                <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 flex items-center justify-center text-emerald-500 border border-emerald-500/20 shadow-[0_8px_25px_rgba(16,185,129,0.1)]">
                                    <Users size={24} />
                                </div>
                                <div>
                                    <h2 className="text-lg font-black uppercase tracking-[0.2em] text-primary">Master Access List</h2>
                                    <p className="text-[10px] text-muted font-black uppercase tracking-widest flex items-center gap-2">
                                        <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_var(--brand-success)]" /> Synchronized with Global Schema
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-center bg-white/5 px-4 py-2 rounded-xl border border-white/10 font-black text-[11px] tracking-widest text-muted">
                                <span className="text-brand-primary mr-2 uppercase">Secure</span> END-TO-END ENCRYPTED
                            </div>
                        </div>

                        <div className="overflow-x-auto">
                            <table className="glass-table !mb-0 border-separate border-spacing-0">
                                <thead>
                                    <tr className="bg-white/[0.03]">
                                        <th className="!py-7 !pl-10 text-[10px] uppercase font-black tracking-[0.2em] text-muted">Identity Profile</th>
                                        <th className="!py-7 text-[10px] uppercase font-black tracking-[0.2em] text-muted text-center">Authorization Level</th>
                                        <th className="!py-7 !pr-10 text-[10px] uppercase font-black tracking-[0.2em] text-muted text-right">Revoke Access</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-white/5">
                                    {/* Primary Admin */}
                                    <tr className="group hover:bg-brand-primary/[0.02] transition-all duration-300">
                                        <td className="!py-8 !pl-10">
                                            <div className="flex items-center gap-5">
                                                <div className="w-14 h-14 rounded-2xl bg-brand-primary/20 flex items-center justify-center text-brand-primary text-lg font-black border border-brand-primary/30 shadow-[0_8px_20px_rgba(79,142,247,0.2)] group-hover:scale-110 transition-transform group-hover:shadow-[0_12px_30px_rgba(79,142,247,0.3)]">
                                                    JS
                                                </div>
                                                <div className="flex flex-col gap-1">
                                                    <span className="text-[15px] font-black tracking-tighter flex items-center gap-2 text-primary">
                                                        junsangsingh@gmail.com
                                                        <CheckCircle2 size={16} className="text-brand-primary animate-pulse" />
                                                    </span>
                                                    <div className="flex items-center gap-2">
                                                        <span className="text-[9px] text-brand-primary font-black uppercase tracking-widest px-2 py-0.5 rounded bg-brand-primary/10 border border-brand-primary/20">System Root</span>
                                                        <span className="text-[9px] text-muted font-bold uppercase tracking-tight">Master Site Owner</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="!py-8 text-center">
                                            <span className="inline-flex items-center px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-[0.2em] bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 shadow-sm ring-4 ring-emerald-500/5">
                                                Permanent
                                            </span>
                                        </td>
                                        <td className="!py-8 !pr-10 text-right">
                                            <div className="flex justify-end pr-3">
                                                <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-muted opacity-20 border border-white/10">
                                                    <Lock size={16} />
                                                </div>
                                            </div>
                                        </td>
                                    </tr>

                                    {initialAdmins.filter(a => a.email !== 'junsangsingh@gmail.com').map((admin, idx) => (
                                        <tr key={admin.id} className="group hover:bg-white/[0.03] transition-all duration-300">
                                            <td className="!py-8 !pl-10">
                                                <div className="flex items-center gap-5">
                                                    <div className="w-14 h-14 rounded-2xl bg-white/5 flex items-center justify-center text-muted text-lg font-black border border-white/10 group-hover:scale-110 transition-transform group-hover:border-brand-primary/30 group-hover:text-brand-primary group-hover:bg-brand-primary/5">
                                                        {admin.email.substring(0, 2).toUpperCase()}
                                                    </div>
                                                    <div className="flex flex-col gap-1">
                                                        <span className="text-[15px] font-black tracking-tighter text-primary">{admin.email}</span>
                                                        <span className="text-[9px] text-muted font-black uppercase tracking-widest flex items-center gap-2">
                                                            <div className="w-1.5 h-1.5 rounded-full bg-brand-primary/50" /> Site Administrator Account
                                                        </span>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="!py-8 text-center">
                                                <span className="inline-flex items-center px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-[0.2em] bg-brand-primary/10 text-brand-primary border border-brand-primary/20 shadow-sm ring-4 ring-brand-primary/5">
                                                    Authorized
                                                </span>
                                            </td>
                                            <td className="!py-8 !pr-10 text-right">
                                                <button
                                                    onClick={() => handleRemove(admin.id, admin.email)}
                                                    className="w-11 h-11 !rounded-2xl border border-white/10 bg-white/5 hover:border-red-500/30 hover:bg-red-500/10 text-muted hover:text-red-500 active:scale-90 shadow-none hover:shadow-xl transition-all flex items-center justify-center mx-auto hover:mr-0 group/del"
                                                    disabled={loading}
                                                >
                                                    <Trash2 size={18} className="group-hover/del:scale-110 transition-transform" />
                                                </button>
                                            </td>
                                        </tr>
                                    ))}

                                    {initialAdmins.filter(a => a.email !== 'junsangsingh@gmail.com').length === 0 && (
                                        <tr>
                                            <td colSpan={3} className="!py-20 text-center">
                                                <div className="flex flex-col items-center gap-4 opacity-30">
                                                    <Lock size={48} className="text-muted" />
                                                    <p className="text-xs font-black uppercase tracking-widest">No Secondary Administrators Authorized</p>
                                                </div>
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>

                        <div className="p-10 bg-white/[0.02] border-t border-white/5 flex items-center justify-between">
                            <div className="flex items-center gap-2 text-muted uppercase font-black text-[10px] tracking-[0.3em] opacity-40">
                                <History size={14} /> Audit Trace Active
                            </div>
                            <div className="text-[9px] font-black text-muted/30 uppercase tracking-[0.4em]">
                                Stock Sewa Admin Protocol v2.5.0
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
