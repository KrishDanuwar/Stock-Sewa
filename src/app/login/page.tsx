'use client';

import { SignIn } from "@clerk/nextjs";


export default function LoginPage() {
    return (
        <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden" style={{ background: 'var(--bg-base)' }}>
            {/* Premium Animated Background */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none">
                <div className="orb orb-1" />
                <div className="orb orb-2" />
                <div className="orb orb-3" />
            </div>

            <div className="relative z-10 w-full max-w-[440px] animate-fade-in-up">
                {/* Brand Identity */}
                <div className="flex flex-col items-center mb-8">
                    <div className="login-logo-container">
                        <img src="/logo.jpg" alt="Stock Sewa Logo" className="login-logo" />
                    </div>
                    <div className="text-center">
                        <h1 translate="no" className="brand-title">Stock Sewa</h1>
                        <p className="brand-tagline">Premium Inventory & POS System</p>
                    </div>
                </div>

                {/* Clerk SignIn Component with custom styling override in globals.css */}
                <div className="clerk-wrapper">
                    <SignIn
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
                        signUpUrl="/signup"
                    />
                </div>

                {/* Aesthetic Support Links */}
                <div className="login-footer">
                    <p>Need assistance?</p>
                    <div className="flex justify-center gap-6 mt-2">
                        <a href="https://wa.me/9779703360369" target="_blank" rel="noopener noreferrer" className="support-link support-whatsapp">
                            WhatsApp
                        </a>
                        <a href="mailto:junsangsingh@gmail.com" className="support-link support-email">
                            Email
                        </a>
                    </div>
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
                    width: 80px;
                    height: 80px;
                    border-radius: 20px;
                    background: white;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    margin-bottom: 20px;
                    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.12);
                    padding: 12px;
                    animation: pulse 4s infinite;
                }
                @keyframes pulse {
                    0%, 100% { transform: scale(1); box-shadow: 0 10px 30px rgba(0, 0, 0, 0.12); }
                    50% { transform: scale(1.03); box-shadow: 0 15px 40px rgba(0, 0, 0, 0.18); }
                }
                .login-logo {
                    width: 100%;
                    height: 100%;
                    object-fit: contain;
                }
                .brand-title {
                    font-size: 1.75rem;
                    font-weight: 800;
                    color: var(--text-primary);
                    letter-spacing: -0.03em;
                }
                .brand-tagline {
                    font-size: 0.875rem;
                    color: var(--text-secondary);
                    font-weight: 500;
                    margin-top: 4px;
                }
                .clerk-wrapper :global(.cl-internal-1dauvqw) {
                    display: none;
                }
                .login-footer {
                    margin-top: 40px;
                    text-align: center;
                    font-size: 0.8125rem;
                    color: var(--text-muted);
                }
                .support-link {
                    font-weight: 600;
                    text-decoration: none;
                    transition: all 0.2s;
                }
                .support-whatsapp:hover { color: var(--brand-success); text-shadow: 0 0 10px rgba(16, 185, 129, 0.3); }
                .support-email:hover { color: var(--brand-primary); text-shadow: 0 0 10px rgba(59, 130, 246, 0.3); }
            `}</style>
        </div>
    );
}
