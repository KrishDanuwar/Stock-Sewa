'use client';

import { SignUp } from "@clerk/nextjs";

export default function SignupPage() {
    return (
        <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden" style={{ background: 'var(--bg-base)' }}>
            {/* Premium Animated Background */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none">
                <div className="orb orb-1" />
                <div className="orb orb-2" />
                <div className="orb orb-3" />
            </div>

            <div className="relative z-10 w-full max-w-[480px] animate-fade-in-up">
                {/* Brand Identity */}
                <div className="flex flex-col items-center mb-8">
                    <div className="login-logo-container">
                        <img src="/logo.jpg" alt="Stock Sewa Logo" className="login-logo" />
                    </div>
                    <div className="text-center">
                        <h1 translate="no" className="brand-title">Stock Sewa</h1>
                        <p className="brand-tagline">Start your premium shop journey</p>
                    </div>
                </div>

                {/* Clerk SignUp Component */}
                <div className="clerk-wrapper">
                    <SignUp
                        appearance={{
                            elements: {
                                rootBox: "mx-auto",
                                card: "glass-card-no-padding overflow-hidden",
                                headerTitle: "hidden",
                                headerSubtitle: "hidden",
                                socialButtonsBlockButton: "glass-button login-social-btn",
                                formButtonPrimary: "glass-button glass-button-primary w-full py-3",
                                footerActionLink: "text-brand-primary font-semibold hover:underline",
                                identityPreviewText: "text-text-primary",
                                identityPreviewEditButtonIcon: "text-brand-primary",
                                formFieldInput: "glass-input",
                                formFieldLabel: "glass-label",
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
                .login-logo-container {
                    width: 70px;
                    height: 70px;
                    border-radius: 18px;
                    background: white;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    margin-bottom: 20px;
                    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.12);
                    padding: 10px;
                }
                .login-logo {
                    width: 100%;
                    height: 100%;
                    object-fit: contain;
                }
                .brand-title {
                    font-size: 1.6rem;
                    font-weight: 800;
                    color: var(--text-primary);
                    letter-spacing: -0.03em;
                }
                .brand-tagline {
                    font-size: 0.8125rem;
                    color: var(--text-secondary);
                    font-weight: 500;
                    margin-top: 2px;
                }
                .login-footer {
                    margin-top: 40px;
                    text-align: center;
                    font-size: 0.8125rem;
                    color: var(--text-muted);
                }
            `}</style>
        </div>
    );
}
