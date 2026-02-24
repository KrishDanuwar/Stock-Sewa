'use client';

import { useState } from 'react';
import { signUp } from '@/lib/actions/auth';
import { toast } from 'sonner';
import Link from 'next/link';
import { UserPlus, Eye, EyeOff, Package } from 'lucide-react';

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
        <div className="min-h-screen flex items-center justify-center p-4" style={{ background: 'var(--bg-base)' }}>
            {/* Background blobs */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none">
                <div style={{ position: 'absolute', top: '-15%', right: '-10%', width: '500px', height: '500px', background: 'radial-gradient(circle, rgba(124,58,237,0.2) 0%, transparent 70%)', borderRadius: '50%' }} />
                <div style={{ position: 'absolute', bottom: '-20%', left: '-10%', width: '600px', height: '600px', background: 'radial-gradient(circle, rgba(6,182,212,0.12) 0%, transparent 70%)', borderRadius: '50%' }} />
            </div>

            <div className="glass-card animate-fade-in-up w-full max-w-md p-8" style={{ position: 'relative', zIndex: 1 }}>
                {/* Logo */}
                <div className="flex items-center gap-3 mb-8">
                    <div style={{ width: 44, height: 44, borderRadius: 12, background: 'linear-gradient(135deg, var(--brand-primary), var(--brand-secondary))', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Package size={22} color="white" />
                    </div>
                    <div>
                        <div style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-primary)' }}>Stock Sewa</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>स्टक सेवा</div>
                    </div>
                </div>

                <h1 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: 6 }}>Create your account</h1>
                <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: 28 }}>
                    Start managing your shop inventory today
                </p>

                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                    <div>
                        <label style={{ fontSize: '0.8125rem', fontWeight: 500, color: 'var(--text-secondary)', display: 'block', marginBottom: 6 }}>Shop / Business Name</label>
                        <input name="org_name" type="text" required className="glass-input" placeholder="e.g. Sharma Pasal" />
                    </div>
                    <div>
                        <label style={{ fontSize: '0.8125rem', fontWeight: 500, color: 'var(--text-secondary)', display: 'block', marginBottom: 6 }}>Username</label>
                        <input name="username" type="text" required className="glass-input" placeholder="e.g. ramsharma" />
                    </div>
                    <div>
                        <label style={{ fontSize: '0.8125rem', fontWeight: 500, color: 'var(--text-secondary)', display: 'block', marginBottom: 6 }}>Email</label>
                        <input name="email" type="email" required className="glass-input" placeholder="shop@example.com" />
                    </div>
                    <div>
                        <label style={{ fontSize: '0.8125rem', fontWeight: 500, color: 'var(--text-secondary)', display: 'block', marginBottom: 6 }}>Password</label>
                        <div style={{ position: 'relative' }}>
                            <input name="password" type={showPw ? 'text' : 'password'} required minLength={6} className="glass-input" placeholder="Min. 6 characters" style={{ paddingRight: 40 }} />
                            <button type="button" onClick={() => setShowPw(!showPw)} style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)' }}>
                                {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                            </button>
                        </div>
                    </div>
                    <div>
                        <label style={{ fontSize: '0.8125rem', fontWeight: 500, color: 'var(--text-secondary)', display: 'block', marginBottom: 6 }}>Confirm Password</label>
                        <input name="confirm_password" type="password" required className="glass-input" placeholder="Re-enter password" />
                    </div>

                    <button type="submit" disabled={loading} className="glass-button glass-button-primary" style={{ width: '100%', justifyContent: 'center', padding: '12px 20px', fontSize: '0.9375rem', marginTop: 8 }}>
                        {loading ? 'Creating account...' : <><UserPlus size={16} /> Create Account</>}
                    </button>
                </form>

                <p style={{ textAlign: 'center', fontSize: '0.8125rem', color: 'var(--text-secondary)', marginTop: 24 }}>
                    Already have an account?{' '}
                    <Link href="/login" style={{ color: 'var(--brand-primary)', fontWeight: 500, textDecoration: 'none' }}>
                        Sign in
                    </Link>
                </p>
            </div>
        </div>
    );
}
