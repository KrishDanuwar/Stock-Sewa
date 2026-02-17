'use client';

import { useState } from 'react';
import { login } from '@/lib/actions/auth';
import Link from 'next/link';

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
                    <div className="absolute -inset-1 bg-gradient-to-r from-primary-600 to-emerald-600 rounded-2xl blur opacity-25 group-hover:opacity-50 transition duration-1000 group-hover:duration-200"></div>
                    <div className="relative w-full h-full bg-white rounded-2xl flex items-center justify-center shadow-xl p-3 border border-surface-100">
                        <img src="/logo.png" alt="MeroStock Logo" className="w-full h-full object-contain" />
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
                        <Link href="/auth/forgot-password" className="text-xs text-primary-600 hover:text-primary-700">
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
            </form>

            <div className="mt-6 pt-6 border-t border-surface-200 text-center">
                <p className="text-sm text-surface-500">
                    Don't have an account?{' '}
                    <Link href="/auth/register" className="text-primary-600 font-medium hover:underline">
                        Create an organization
                    </Link>
                </p>
            </div>
        </div>
    );
}
