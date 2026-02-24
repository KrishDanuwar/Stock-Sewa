import { useState } from 'react';
import { signUp } from '@/lib/actions/auth';
import { toast } from 'sonner';
import Link from 'next/link';
import { UserPlus, Eye, EyeOff, Package, User, Mail, Lock, Building2 } from 'lucide-react';

export default function SignupPage() {
    const [loading, setLoading] = useState(false);
    const [showPw, setShowPw] = useState(false);

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        setLoading(true);
        const fd = new FormData(e.currentTarget);
        if (fd.get('password') !== fd.get('confirm_password')) {
            toast.error('Passwords do not match');
            setLoading(false);
            return;
        }
        const result = await signUp(fd);
        if (result?.error) {
            toast.error(result.error);
        }
        setLoading(false);
    }

    return (
        <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden" style={{ background: 'var(--bg-base)' }}>
            {/* Dynamic Background Elements */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none">
                <div style={{ position: 'absolute', top: '-15%', right: '-10%', width: '500px', height: '500px', background: 'radial-gradient(circle, rgba(124,58,237,0.2) 0%, transparent 70%)', borderRadius: '50%' }} />
                <div style={{ position: 'absolute', bottom: '-20%', left: '-10%', width: '600px', height: '600px', background: 'radial-gradient(circle, rgba(6,182,212,0.12) 0%, transparent 70%)', borderRadius: '50%' }} />
            </div>

            <div className="glass-card animate-fade-in-up w-full max-w-xl p-10 relative z-10" style={{ boxShadow: 'var(--glass-shadow)' }}>
                {/* Brand Identity */}
                <div className="flex flex-col items-center mb-10">
                    <div style={{
                        width: 64,
                        height: 64,
                        borderRadius: 18,
                        background: 'linear-gradient(135deg, var(--brand-primary), var(--brand-secondary))',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        marginBottom: 16,
                        boxShadow: '0 8px 20px rgba(79, 142, 247, 0.3)'
                    }}>
                        <Package size={32} color="white" />
                    </div>
                    <div className="text-center">
                        <h1 style={{ fontSize: '1.875rem', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.03em' }}>
                            Stock Sewa
                        </h1>
                        <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', fontWeight: 500, marginTop: 4 }}>
                            Create your shop account
                        </p>
                    </div>
                </div>

                <form onSubmit={handleSubmit} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
                    <div className="form-group" style={{ gridColumn: 'span 2' }}>
                        <label style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: 8 }}>Shop / Business Name</label>
                        <div style={{ position: 'relative' }}>
                            <Building2 size={18} color="var(--text-muted)" style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)' }} />
                            <input name="org_name" type="text" required className="glass-input" placeholder="e.g. Acme Emporium" style={{ paddingLeft: 48 }} />
                        </div>
                    </div>

                    <div className="form-group">
                        <label style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: 8 }}>Username</label>
                        <div style={{ position: 'relative' }}>
                            <User size={18} color="var(--text-muted)" style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)' }} />
                            <input name="username" type="text" required className="glass-input" placeholder="e.g. acme_user" style={{ paddingLeft: 48 }} />
                        </div>
                    </div>

                    <div className="form-group">
                        <label style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: 8 }}>Email</label>
                        <div style={{ position: 'relative' }}>
                            <Mail size={18} color="var(--text-muted)" style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)' }} />
                            <input name="email" type="email" required className="glass-input" placeholder="name@company.com" style={{ paddingLeft: 48 }} />
                        </div>
                    </div>

                    <div className="form-group">
                        <label style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: 8 }}>Password</label>
                        <div style={{ position: 'relative' }}>
                            <Lock size={18} color="var(--text-muted)" style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)' }} />
                            <input name="password" type={showPw ? 'text' : 'password'} required minLength={6} className="glass-input" placeholder="Min. 6 characters" style={{ paddingLeft: 48, paddingRight: 48 }} />
                            <button type="button" onClick={() => setShowPw(!showPw)} style={{ position: 'absolute', right: 16, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', display: 'flex' }}>
                                {showPw ? <EyeOff size={18} /> : <Eye size={18} />}
                            </button>
                        </div>
                    </div>

                    <div className="form-group">
                        <label style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: 8 }}>Confirm Password</label>
                        <div style={{ position: 'relative' }}>
                            <Lock size={18} color="var(--text-muted)" style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)' }} />
                            <input name="confirm_password" type="password" required className="glass-input" placeholder="Re-enter password" style={{ paddingLeft: 48 }} />
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="glass-button glass-button-primary"
                        style={{
                            gridColumn: 'span 2',
                            justifyContent: 'center',
                            padding: '14px 24px',
                            fontSize: '1rem',
                            fontWeight: 600,
                            marginTop: 24,
                            borderRadius: 12
                        }}
                    >
                        {loading ? 'Setting up shop...' : <><UserPlus size={20} /> Create Account</>}
                    </button>
                </form>

                <div style={{ marginTop: 32, textAlign: 'center' }}>
                    <span style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                        Already have an account?
                    </span>
                    {' '}
                    <Link href="/login" style={{ color: 'var(--brand-primary)', fontWeight: 600, textDecoration: 'none', paddingLeft: 4 }}>
                        Sign in
                    </Link>
                </div>
            </div>
        </div>
    );
}
