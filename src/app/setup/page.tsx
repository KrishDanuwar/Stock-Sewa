import Link from 'next/link';
import { signOut } from '@/lib/actions/auth';
import { repairOrganization } from '@/lib/actions/repair';
import { RefreshCw, LogOut } from 'lucide-react';

export default function SetupPage() {
    return (
        <div className="flex min-h-screen items-center justify-center p-4">
            <div className="glass-card max-w-md w-full p-8 text-center animate-fade-in-up">
                <div className="w-16 h-16 bg-amber-500/20 rounded-2xl flex items-center justify-center mx-auto mb-6">
                    <RefreshCw size={32} className="text-amber-500 animate-spin-slow" />
                </div>

                <h1 className="text-2xl font-bold mb-4 text-white">Organization Not Found</h1>
                <p className="text-gray-400 mb-8">
                    It looks like your user account was created, but the organization setup failed.
                    This usually happens if the database triggers were not ready during your first signup.
                </p>

                <div className="flex flex-col gap-4">
                    <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-4 mb-2">
                        <p className="text-sm text-amber-500 font-semibold mb-1">
                            Recommended Action:
                        </p>
                        <p className="text-xs text-amber-200/70">
                            Click below to automatically repair your account. We will create your
                            missing organization profile instantly.
                        </p>
                    </div>

                    <form action={repairOrganization}>
                        <button type="submit" className="glass-button glass-button-primary w-full justify-center py-3 font-semibold shadow-lg shadow-blue-500/20">
                            <RefreshCw size={18} /> Repair My Account Automatically
                        </button>
                    </form>

                    <div style={{ display: 'flex', alignItems: 'center', gap: 12, margin: '8px 0' }}>
                        <div style={{ flex: 1, height: 1, background: 'var(--glass-border)' }} />
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>OR</span>
                        <div style={{ flex: 1, height: 1, background: 'var(--glass-border)' }} />
                    </div>

                    <form action={signOut}>
                        <button type="submit" className="glass-button w-full justify-center py-3 text-gray-400 border-gray-800">
                            <LogOut size={18} /> Sign Out and Try Again
                        </button>
                    </form>

                    <Link href="/dashboard" className="text-blue-400 hover:text-blue-300 text-sm mt-2">
                        Back to Dashboard
                    </Link>
                </div>
            </div>
        </div>
    );
}
