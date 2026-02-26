'use client';

import { useActionState, useEffect } from 'react';
import { SignOutButton } from "@clerk/nextjs";
import { repairOrganization } from '@/lib/actions/repair';
import { LogOut, Building2, Store, Rocket, Sparkles } from 'lucide-react';
import { toast } from 'sonner';

export default function SetupPage() {
    const [state, formAction, isPending] = useActionState(repairOrganization, null);

    useEffect(() => {
        if (state?.error) {
            toast.error(state.error);
        }
    }, [state]);

    return (
        <div className="setup-container">
            {/* The background gradients are now handled purely by CSS on .setup-container, matching the auth pages exactly */}

            <div className="setup-wrapper animate-reveal">
                <div className="premium-glass-card">
                    <div className="card-shine"></div>

                    {/* Header Section */}
                    <div className="setup-header">
                        <div className="brand-icon-wrapper">
                            <div className="brand-glow"></div>
                            <Store size={32} className="brand-icon" />
                        </div>
                        <h1 className="setup-title">Welcome to <span className="whitespace-nowrap">Stock Sewa</span></h1>
                        <p className="setup-subtitle">
                            Ready to take your business to the next level? <br />
                            Let's start by naming your organization.
                        </p>
                    </div>

                    {/* Form Section */}
                    <form action={formAction} className="setup-form">
                        <div className="form-group-premium">
                            <label className="premium-label">Business / Shop Name</label>
                            <div className="input-affix-wrapper">
                                <Building2 size={18} className="input-icon" />
                                <input
                                    name="org_name"
                                    required
                                    className="premium-input"
                                    placeholder="e.g. Acme Electronics"
                                    autoFocus
                                    autoComplete="off"
                                />
                                <div className="input-focus-border"></div>
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={isPending}
                            className={`premium-submit-btn ${isPending ? 'loading' : ''}`}
                        >
                            <span className="btn-content">
                                {isPending ? (
                                    <>
                                        <div className="btn-spinner"></div>
                                        Preparing your workspace...
                                    </>
                                ) : (
                                    <>
                                        Get Started <Rocket size={18} className="btn-icon" />
                                    </>
                                )}
                            </span>
                            <div className="btn-shimmer"></div>
                        </button>

                        {state?.error && (
                            <div className="error-premium animate-shake">
                                <Sparkles size={14} />
                                <span>{state.error}</span>
                            </div>
                        )}
                    </form>

                    {/* Footer Section */}
                    <div className="setup-footer">
                        <SignOutButton>
                            <button className="premium-signout-btn">
                                <LogOut size={14} />
                                <span>Sign out of account</span>
                            </button>
                        </SignOutButton>
                    </div>
                </div>

                <p className="copyright-text">© 2026 Stock Sewa • Premium Inventory Management</p>
            </div>

            <style jsx>{`
                .setup-container {
                    min-height: 100vh;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    padding: 24px;
                    background: transparent; /* Handled by body in globals.css */
                    position: relative;
                    overflow: hidden;
                    font-family: var(--font-inter, 'Inter', sans-serif);
                }

                .setup-wrapper {
                    width: 100%;
                    max-width: 440px; /* Slightly narrower to match Clerk auth card width */
                    position: relative;
                    z-index: 10;
                }

                /* Premium Glass Card */
                .premium-glass-card {
                    background: var(--glass-bg);
                    backdrop-filter: var(--glass-blur);
                    border: 1px solid var(--glass-border);
                    border-radius: 28px;
                    padding: 32px;
                    box-shadow: var(--glass-shadow);
                    position: relative;
                    overflow: hidden;
                }

                .card-shine {
                    position: absolute;
                    top: -100%;
                    left: -100%;
                    width: 300%;
                    height: 300%;
                    background: radial-gradient(circle at center, rgba(255,255,255,0.03) 0%, transparent 50%);
                    pointer-events: none;
                }

                /* Header */
                .setup-header {
                    text-align: center;
                    margin-bottom: 40px;
                }

                .brand-icon-wrapper {
                    position: relative;
                    width: 72px;
                    height: 72px;
                    background: linear-gradient(135deg, rgba(79, 142, 247, 0.2), rgba(79, 142, 247, 0.05));
                    border: 1px solid rgba(79, 142, 247, 0.3);
                    border-radius: 20px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    margin: 0 auto 24px;
                    color: var(--brand-primary);
                }

                .brand-glow {
                    position: absolute;
                    inset: -4px;
                    background: var(--brand-primary);
                    opacity: 0.2;
                    filter: blur(8px);
                    border-radius: 24px;
                }

                .setup-title {
                    font-size: 2.25rem;
                    font-weight: 900;
                    letter-spacing: -0.03em;
                    color: var(--text-primary);
                    margin-bottom: 12px;
                }

                .setup-subtitle {
                    font-size: 1rem;
                    color: var(--text-secondary);
                    line-height: 1.6;
                    font-weight: 500;
                }

                /* Form */
                .setup-form {
                    display: flex;
                    flex-direction: column;
                    gap: 32px;
                }

                .premium-label {
                    display: block;
                    font-size: 0.8125rem;
                    font-weight: 700;
                    color: var(--text-muted);
                    text-transform: uppercase;
                    letter-spacing: 0.1em;
                    margin-bottom: 12px;
                    margin-left: 2px;
                }

                .input-affix-wrapper {
                    position: relative;
                    background: var(--glass-input-bg);
                    border: 1px solid var(--glass-border);
                    border-radius: 18px;
                    transition: all 0.4s cubic-bezier(0.23, 1, 0.32, 1);
                    display: flex;
                    align-items: center;
                    padding: 0 20px;
                }

                .input-affix-wrapper:focus-within {
                    background: var(--glass-bg);
                    border-color: var(--brand-primary);
                    transform: translateY(-2px);
                    box-shadow: 
                        0 10px 30px -10px rgba(0, 0, 0, 0.5),
                        0 0 0 1px rgba(79, 142, 247, 0.2);
                }

                .input-icon {
                    color: var(--text-muted);
                    transition: all 0.3s ease;
                    pointer-events: none;
                    flex-shrink: 0;
                }

                .input-affix-wrapper:focus-within .input-icon {
                    color: var(--brand-primary);
                    transform: scale(1.1);
                }

                .premium-input {
                    flex: 1;
                    background: transparent;
                    border: none;
                    padding: 18px 14px;
                    font-size: 1.0625rem;
                    color: var(--text-primary);
                    outline: none;
                    font-weight: 500;
                }

                .premium-input::placeholder {
                    color: var(--text-muted);
                }

                /* Submit Button */
                .premium-submit-btn {
                    position: relative;
                    background: var(--brand-primary);
                    border: none;
                    border-radius: 18px;
                    padding: 18px 28px;
                    color: #fff;
                    font-size: 1.0625rem;
                    font-weight: 800;
                    cursor: pointer;
                    overflow: hidden;
                    transition: all 0.4s cubic-bezier(0.23, 1, 0.32, 1);
                    box-shadow: 0 8px 16px -4px rgba(79, 142, 247, 0.3);
                }

                .btn-content {
                    position: relative;
                    z-index: 10;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 10px;
                }

                .premium-submit-btn:hover:not(:disabled) {
                    transform: translateY(-2px) scale(1.02);
                    box-shadow: 0 10px 25px rgba(79, 142, 247, 0.4);
                    background: #5a9eff;
                }

                .premium-submit-btn:active:not(:disabled) {
                    transform: translateY(0) scale(0.98);
                }

                .premium-submit-btn:disabled {
                    opacity: 0.7;
                    cursor: wait;
                }

                .btn-shimmer {
                    position: absolute;
                    top: 0;
                    left: -100%;
                    width: 100%;
                    height: 100%;
                    background: linear-gradient(
                        90deg,
                        transparent,
                        rgba(255, 255, 255, 0.2),
                        transparent
                    );
                    animation: shimmer 2.5s infinite;
                }

                @keyframes shimmer {
                    0% { left: -100%; }
                    100% { left: 100%; }
                }

                .btn-icon {
                    margin-left: 8px;
                    transition: transform 0.3s;
                }

                .premium-submit-btn:hover .btn-icon {
                    transform: translateX(4px) translateY(-2px);
                }

                .btn-spinner {
                    width: 20px;
                    height: 20px;
                    border: 2px solid rgba(255, 255, 255, 0.3);
                    border-radius: 50%;
                    border-top-color: white;
                    animation: spin 0.8s linear infinite;
                }

                @keyframes spin {
                    to { transform: rotate(360deg); }
                }

                /* Footer */
                .setup-footer {
                    margin-top: 40px;
                    padding-top: 24px;
                    border-t: 1px solid var(--glass-border);
                    text-align: center;
                }

                .premium-signout-btn {
                    background: transparent;
                    border: 1px solid var(--glass-border);
                    padding: 10px 20px;
                    border-radius: 12px;
                    color: var(--text-muted);
                    font-size: 0.8125rem;
                    font-weight: 500;
                    cursor: pointer;
                    display: inline-flex;
                    align-items: center;
                    gap: 8px;
                    transition: all 0.2s;
                }

                .premium-signout-btn:hover {
                    background: var(--glass-bg);
                    color: var(--text-primary);
                    border-color: var(--brand-primary);
                }

                .copyright-text {
                    text-align: center;
                    margin-top: 32px;
                    font-size: 0.75rem;
                    color: var(--text-muted);
                    letter-spacing: 0.02em;
                }

                .error-premium {
                    background: rgba(239, 68, 68, 0.1);
                    border: 1px solid rgba(239, 68, 68, 0.2);
                    padding: 14px;
                    border-radius: 14px;
                    color: #f87171;
                    font-size: 0.8125rem;
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    margin-top: 8px;
                }

                /* Reveal Animation */
                .animate-reveal {
                    animation: reveal 0.8s cubic-bezier(0.16, 1, 0.3, 1);
                }

                @keyframes reveal {
                    0% { opacity: 0; transform: translateY(20px); }
                    100% { opacity: 1; transform: translateY(0); }
                }

                @media (max-width: 480px) {
                    .premium-glass-card { padding: 32px 24px; }
                    .setup-title { font-size: 1.5rem; }
                }
            `}</style>
        </div>
    );
}
