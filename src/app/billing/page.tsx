import { getOrgContext } from '@/lib/org-context';
import BillingClient from './BillingClient';
import { Building2 } from 'lucide-react';
import Link from 'next/link';

export default async function BillingPage() {
    const ctx = getOrgContext();

    if (!ctx) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] p-8 text-center">
                <div className="w-16 h-16 bg-blue-50 text-blue-500 rounded-2xl flex items-center justify-center mb-4">
                    <Building2 size={32} />
                </div>
                <h2 className="text-xl font-bold text-surface-900 mb-2">Account Setup Incomplete</h2>
                <p className="text-surface-500 max-w-md mx-auto mb-6">
                    It look like your organization setup wasn&apos;t completed correctly. This usually happens if there was a database error during registration.
                </p>
                <div className="flex gap-4">
                    <Link href="/auth/register" className="btn-primary">
                        Try Registering Again
                    </Link>
                    <Link href="/auth/login" className="btn-secondary">
                        Back to Login
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <BillingClient
            subscriptionStatus={ctx.subscriptionStatus}
            organizationName={ctx.organizationName}
        />
    );
}
