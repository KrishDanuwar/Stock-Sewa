'use client';

import { useState } from 'react';
import { login, signup, signInWithGoogle } from '@/lib/actions/auth';
import Link from 'next/link';
import Image from 'next/image';

export default function LoginPage() {
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    async function handleSubmit(formData: FormData) {
        setLoading(true);
        setError(null);
        const result = await login(formData);
        if (result?.error) {
            setError(result.error);
            setLoading(false);
        }
    }

    return (
        <div className="card p-10 animate-fade-in max-w-md w-full">
            <div className="flex flex-col items-center mb-10">
                <div className="w-20 h-20 mb-6 group relative">
                    <div className="absolute -inset-1 bg-gradient-to-r from-brand-primary to-brand-secondary rounded-2xl blur opacity-25 group-hover:opacity-50 transition duration-1000 group-hover:duration-200"></div>
                    <div className="relative w-full h-full bg-white rounded-2xl flex items-center justify-center shadow-xl p-3 border border-surface-100 overflow-hidden">
                        <Image
                            src="/logo.png"
                            alt="G.K Paints Logo"
                            width={80}
                            height={80}
                            className="w-full h-full object-contain"
                            priority
                        />
                    </div>
                </div>
                <h1 className="text-3xl font-black text-surface-900 tracking-tight mb-2">Welcome Back</h1>
                <p className="text-surface-500 font-medium text-center">Manage your inventory with precision</p>
            </div>

            <form action={handleSubmit} className="space-y-4">
                {error && (
                    <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700 animate-slide-in">
                        {error}
                    </div>
                )}

                <div>
                    <label className="block text-sm font-medium text-surface-700 mb-1">Email Address</label>
                    <input
                        name="email"
                        type="email"
                        required
                        className="input-field"
                        placeholder="name@company.com"
                    />
                </div>

                <div>
                    <div className="flex items-center justify-between mb-1">
                        <label className="block text-sm font-medium text-surface-700">Password</label>
                        <Link href="/auth/forgot-password" className="text-xs text-brand-primary hover:text-brand-primary/80">
                            Forgot?
                        </Link>
                    </div>
                    <input
                        name="password"
                        type="password"
                        required
                        className="input-field"
                        placeholder="••••••••"
                    />
                </div>

                <button
                    type="submit"
                    disabled={loading}
                    className="btn-primary w-full mt-2"
                >
                    {loading ? 'Logging in...' : 'Sign In'}
                </button>

                <div className="relative my-6">
                    <div className="absolute inset-0 flex items-center">
                        <div className="w-full border-t border-surface-200"></div>
                    </div>
                    <div className="relative flex justify-center text-sm">
                        <span className="px-2 bg-white text-surface-500 font-medium">Or continue with</span>
                    </div>
                </div>

                <button
                    type="button"
                    onClick={() => signInWithGoogle()}
                    className="w-full flex items-center justify-center gap-3 px-4 py-3 border border-surface-200 rounded-xl hover:bg-surface-50 transition-colors font-semibold text-surface-700"
                >
                    <svg className="w-5 h-5" viewBox="0 0 24 24">
                        <path
                            fill="currentColor"
                            d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                        />
                        <path
                            fill="#34A853"
                            d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                        />
                        <path
                            fill="#FBBC05"
                            d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"
                        />
                        <path
                            fill="#EA4335"
                            d="M12 5.38c1.62 0 3.06.56 4.21 1.66l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                        />
                    </svg>
                    Google Account
                </button>
            </form>

            <div className="mt-6 pt-6 border-t border-surface-200 text-center">
                <p className="text-sm text-surface-500">
                    Don&apos;t have an account?{' '}
                    <Link href="/auth/register" className="text-primary-600 font-medium hover:underline">
                        Create an organization
                    </Link>
                </p>
            </div>
        </div>
    );
}
