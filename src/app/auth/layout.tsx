export default function AuthLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="min-h-screen bg-surface-50 flex flex-col items-center justify-center p-4">
            <div className="w-full max-w-md">
                <div className="flex flex-col items-center mb-8">
                    <div className="w-12 h-12 bg-gradient-to-br from-primary-500 to-primary-700 rounded-xl flex items-center justify-center text-white font-bold text-xl shadow-lg mb-4">
                        MS
                    </div>
                    <h1 className="text-2xl font-bold text-surface-900 tracking-tight">MeroStock SaaS</h1>
                    <p className="text-surface-500 text-sm mt-1">Scale your business smarter</p>
                </div>
                {children}
            </div>
        </div>
    );
}
