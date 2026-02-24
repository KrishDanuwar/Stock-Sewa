import Link from 'next/link';
import { signOut } from '@/lib/actions/auth';

export default function SetupPage() {
    return (
        <div className="flex min-h-screen items-center justify-center p-4">
            <div className="glass-card max-w-md w-full p-8 text-center animate-fade-in-up">
                <h1 className="text-2xl font-bold mb-4 text-white">Organization Not Found</h1>
                <p className="text-gray-400 mb-8">
                    It looks like your user account was created, but the organization setup failed.
                    This usually happens if the database triggers were not ready during your first signup.
                </p>

                <div className="flex flex-col gap-4">
                    <p className="text-sm text-amber-400 font-medium">
                        Recommended Action:
                    </p>
                    <p className="text-sm text-gray-300">
                        Please log out and sign up again. Now that the SQL schema is fixed,
                        your organization will be created automatically.
                    </p>

                    <form action={signOut}>
                        <button type="submit" className="glass-button glass-button-primary w-full justify-center py-3">
                            Sign Out and Try Again
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
