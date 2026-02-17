export default function AuthLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="min-h-screen bg-brand-background flex flex-col items-center justify-center p-4">
            <div className="w-full max-w-md">
                <div className="flex flex-col items-center mb-10">
                    <div className="w-16 h-16 bg-brand-primary rounded-2xl flex items-center justify-center text-brand-dark font-poppins font-bold text-2xl shadow-2xl shadow-brand-primary/20 mb-6">
                        GK
                    </div>
                    <h1 className="text-3xl font-poppins font-bold text-surface-primary tracking-tight">G.K Paints POS</h1>
                    <p className="text-surface-muted text-sm mt-2 font-medium">Your Trusted Inventory Partner</p>
                </div>
                {children}
            </div>
        </div>
    );
}
