'use client';

import { SignUp } from "@clerk/nextjs";

export default function SignupPage() {
    return (
        <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden" style={{ background: 'transparent' }}>
            {/* Premium Animated Background handled by body in globals.css */}


            <div className="relative z-10 w-full max-w-[480px] animate-fade-in-up">
                {/* Brand Identity */}
                <div className="flex flex-col items-center mb-10">
                    <div className="brand-icon-wrapper-premium">
                        <div className="brand-glow"></div>
                        <img src="/logo.jpg" alt="Logo" className="premium-logo-img" />
                    </div>
                    <div className="text-center">
                        <h1 translate="no" className="brand-title">Stock Sewa</h1>
                        <p className="brand-tagline">Start your premium shop journey</p>
                    </div>
                </div>

                {/* Clerk SignUp Component */}
                <div className="clerk-wrapper premium-auth-card">
                    <SignUp
                        routing="path"
                        path="/signup"
                        appearance={{
                            baseTheme: undefined,
                            elements: {
                                rootBox: "mx-auto w-full",
                                card: "bg-transparent shadow-none border-none p-0",
                                headerTitle: "clerk-header-title text-2xl font-extrabold tracking-tight",
                                headerSubtitle: "clerk-header-subtitle font-medium",
                                socialButtonsBlockButton: "glass-button-premium w-full mb-4",
                                socialButtonsBlockButtonText: "clerk-text-primary font-semibold",
                                formButtonPrimary: "premium-submit-btn-auth w-full py-4 mt-2",
                                footerActionLink: "text-brand-primary font-bold hover:brightness-110 transition-colors",
                                identityPreviewText: "clerk-text-primary font-medium",
                                identityPreviewEditButtonIcon: "text-brand-primary",
                                formFieldInput: "premium-input-auth",
                                formFieldLabel: "premium-label-auth",
                                dividerLine: "clerk-divider-line",
                                dividerText: "clerk-divider-text font-bold text-xs uppercase tracking-widest",
                                footerActionText: "clerk-text-muted font-medium",
                            }
                        }}
                        signInUrl="/login"
                    />
                </div>

                <div className="login-footer">
                    <p>Building something great with Stock Sewa.</p>
                </div>
            </div>

            <style jsx>{`
                .orb {
                    position: absolute;
                    border-radius: 50%;
                    filter: blur(80px);
                    opacity: 0.15;
                    animation: float 20s infinite alternate;
                }
                .orb-1 {
                    top: -10%;
                    left: -5%;
                    width: 600px;
                    height: 600px;
                    background: var(--brand-primary);
                }
                .orb-2 {
                    bottom: -15%;
                    right: -5%;
                    width: 700px;
                    height: 700px;
                    background: var(--brand-accent);
                    animation-delay: -5s;
                }
                .orb-3 {
                    top: 20%;
                    right: 15%;
                    width: 400px;
                    height: 400px;
                    background: var(--brand-secondary);
                    animation-delay: -10s;
                }
                @keyframes float {
                    0% { transform: translate(0, 0) scale(1); }
                    100% { transform: translate(50px, 30px) scale(1.1); }
                }
                .brand-icon-wrapper-premium {
                    position: relative;
                    width: 72px;
                    height: 72px;
                    background: var(--bg-card);
                    border: 1px solid var(--glass-border);
                    border-radius: 20px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    margin-bottom: 24px;
                    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
                    padding: 8px;
                }
                .brand-glow {
                    position: absolute;
                    inset: -4px;
                    background: var(--brand-primary);
                    opacity: 0.15;
                    filter: blur(10px);
                    border-radius: 24px;
                }
                .premium-logo-img {
                    width: 100%;
                    height: 100%;
                    object-fit: contain;
                    position: relative;
                    z-index: 1;
                }
                .brand-title {
                    font-size: 2rem;
                    font-weight: 800;
                    color: var(--text-primary);
                    letter-spacing: -0.02em;
                }
                .brand-tagline {
                    font-size: 0.875rem;
                    color: var(--text-secondary);
                    margin-top: 4px;
                }
                .premium-auth-card {
                    background: var(--glass-bg);
                    backdrop-filter: var(--glass-blur);
                    border: 1px solid var(--glass-border);
                    border-radius: 28px;
                    padding: 32px;
                    box-shadow: var(--glass-shadow);
                }
                :global(.premium-input-auth) {
                    background: var(--glass-input-bg) !important;
                    border: 1px solid var(--glass-border) !important;
                    border-radius: 12px !important;
                    color: var(--text-primary) !important;
                    padding: 12px 16px !important;
                    transition: all 0.3s !important;
                }
                :global(.premium-input-auth:focus) {
                    border-color: var(--brand-primary) !important;
                    background: var(--glass-bg) !important;
                    box-shadow: 0 0 0 1px var(--brand-primary) !important;
                }
                :global(.premium-label-auth) {
                    color: var(--text-muted) !important;
                    font-weight: 600 !important;
                    font-size: 0.8125rem !important;
                    margin-bottom: 6px !important;
                    text-transform: uppercase !important;
                    letter-spacing: 0.05em !important;
                }
                :global(.premium-submit-btn-auth) {
                    background: var(--brand-primary) !important;
                    border-radius: 12px !important;
                    font-weight: 700 !important;
                    letter-spacing: 0.02em !important;
                    transition: all 0.3s !important;
                }
                :global(.premium-submit-btn-auth:hover) {
                    filter: brightness(1.1) !important;
                    transform: translateY(-1px) !important;
                    box-shadow: 0 8px 20px rgba(79, 142, 247, 0.3) !important;
                }
                :global(.glass-button-premium) {
                    background: var(--glass-bg) !important;
                    border: 1px solid var(--glass-border) !important;
                    border-radius: 12px !important;
                    transition: all 0.3s !important;
                }
                :global(.glass-button-premium:hover) {
                    background: var(--bg-card-hover) !important;
                    border-color: var(--brand-primary) !important;
                }
                .login-footer {
                    margin-top: 32px;
                    text-align: center;
                    font-size: 0.8125rem;
                    color: var(--text-muted);
                }
                .clerk-wrapper :global(.cl-internal-1dauvqw), 
                .clerk-wrapper :global(.cl-internal-b3fm6y) {
                    display: none;
                }
                .clerk-wrapper :global(.clerk-header-title) { color: var(--text-primary) !important; }
                .clerk-wrapper :global(.clerk-header-subtitle) { color: var(--text-muted) !important; }
                .clerk-wrapper :global(.clerk-text-primary) { color: var(--text-primary) !important; }
                .clerk-wrapper :global(.clerk-text-muted) { color: var(--text-muted) !important; }
                .clerk-wrapper :global(.clerk-divider-line) { background-color: var(--glass-border) !important; }
                .clerk-wrapper :global(.clerk-divider-text) { color: var(--text-muted) !important; }
            `}</style>
        </div>
    );
}
