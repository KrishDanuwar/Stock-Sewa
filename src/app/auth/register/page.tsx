'use client';

import { useState } from 'react';
import { signup } from '@/lib/actions/auth';
import Link from 'next/link';

export default function RegisterPage() {
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    async function handleSubmit(formData: FormData) {
        setLoading(true);
        setError(null);
        const result = await signup(formData);
        if (result?.error) {
            setError(result.error);
            setLoading(false);
        }
    }

    return (
        <div className="card p-8 animate-fade-in">
            <h2 className="text-xl font-bold text-surface-900 mb-6">Create your organization</h2>

            <form action={handleSubmit} className="space-y-4">
                {error && (
                    <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700 animate-slide-in">
                        {error}
                    </div>
                )}

                <div>
                    <label className="block text-sm font-medium text-surface-700 mb-1">Organization Name</label>
                    <input
                        name="orgName"
                        type="text"
                        required
                        className="input-field"
                        placeholder="Acme Corp"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-surface-700 mb-1">Owner Email</label>
                    <input
                        name="email"
                        type="email"
                        required
                        className="input-field"
                        placeholder="name@company.com"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-surface-700 mb-1">Create Password</label>
                    <input
                        name="password"
                        type="password"
                        required
                        className="input-field"
                        placeholder="At least 8 characters"
                        minLength={8}
                    />
                </div>

                <button
                    type="submit"
                    disabled={loading}
                    className="btn-primary w-full mt-2"
                >
                    {loading ? 'Creating Account...' : 'Get Started'}
                </button>
            </form>

            <div className="mt-6 pt-6 border-t border-surface-200 text-center">
                <p className="text-sm text-surface-500">
                    Already have an account?{' '}
                    <Link href="/auth/login" className="text-primary-600 font-medium hover:underline">
                        Login here
                    </Link>
                </p>
            </div>
        </div>
    );
}
