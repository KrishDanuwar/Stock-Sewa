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
        <div className="card p-8 animate-fade-in">
            <h2 className="text-xl font-bold text-surface-900 mb-6">Login to your account</h2>

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
