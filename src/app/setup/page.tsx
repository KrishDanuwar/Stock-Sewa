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
            {/* Immersive Animated Background */}
            <div className="bg-mesh">
                <div className="orb orb-1"></div>
                <div className="orb orb-2"></div>
                <div className="orb orb-3"></div>
            </div>

            <div className="setup-wrapper animate-reveal">
                <div className="premium-glass-card">
                    <div className="card-shine"></div>

                    {/* Header Section */}
                    <div className="setup-header">
                        <div className="brand-icon-wrapper">
                            <div className="brand-glow"></div>
                            <Store size={32} className="brand-icon" />
                        </div>
                        <h1 className="setup-title">Welcome to Stock Sewa</h1>
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
                                    'Preparing your workspace...'
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
                    background: #020617;
                    position: relative;
                    overflow: hidden;
                    font-family: var(--font-inter, 'Inter', sans-serif);
                }

                /* Immersive Background */
                .bg-mesh {
                    position: fixed;
                    inset: 0;
                    z-index: 0;
                    filter: blur(80px);
                    opacity: 0.6;
                }

                .orb {
                    position: absolute;
                    border-radius: 50%;
                    animation: float 20s infinite alternate ease-in-out;
                }

                .orb-1 {
                    top: -10%;
                    left: -10%;
                    width: 60vw;
                    height: 60vw;
                    background: radial-gradient(circle, var(--brand-primary) 0%, transparent 70%);
                }

                .orb-2 {
                    bottom: -10%;
                    right: -10%;
                    width: 50vw;
                    height: 50vw;
                    background: radial-gradient(circle, var(--brand-secondary) 0%, transparent 70%);
                    animation-delay: -5s;
                }

                .orb-3 {
                    top: 40%;
                    left: 30%;
                    width: 40vw;
                    height: 40vw;
                    background: radial-gradient(circle, var(--brand-accent) 0%, transparent 70%);
                    animation-delay: -10s;
                }

                @keyframes float {
                    0% { transform: translate(0, 0) scale(1); }
                    100% { transform: translate(100px, 50px) scale(1.1); }
                }

                .setup-wrapper {
                    width: 100%;
                    max-width: 480px;
                    position: relative;
                    z-index: 10;
                }

                /* Premium Glass Card */
                .premium-glass-card {
                    background: rgba(15, 23, 42, 0.6);
                    backdrop-filter: blur(24px) saturate(180%);
                    -webkit-backdrop-filter: blur(24px) saturate(180%);
                    border: 1px solid rgba(255, 255, 255, 0.08);
                    border-radius: 32px;
                    padding: 48px;
                    box-shadow: 
                        0 20px 50px rgba(0, 0, 0, 0.3),
                        0 0 0 1px rgba(255, 255, 255, 0.05) inset;
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
                    font-size: 2rem;
                    font-weight: 800;
                    letter-spacing: -0.02em;
                    color: #fff;
                    margin-bottom: 12px;
                }

                .setup-subtitle {
                    font-size: 0.9375rem;
                    color: #94a3b8;
                    line-height: 1.6;
                }

                /* Form */
                .setup-form {
                    display: flex;
                    flex-direction: column;
                    gap: 28px;
                }

                .premium-label {
                    display: block;
                    font-size: 0.8125rem;
                    font-weight: 600;
                    color: #64748b;
                    text-transform: uppercase;
                    letter-spacing: 0.05em;
                    margin-bottom: 10px;
                    margin-left: 4px;
                }

                .input-affix-wrapper {
                    position: relative;
                    background: rgba(0, 0, 0, 0.2);
                    border: 1px solid rgba(255, 255, 255, 0.1);
                    border-radius: 16px;
                    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
                }

                .input-affix-wrapper:focus-within {
                    background: rgba(0, 0, 0, 0.3);
                    border-color: rgba(79, 142, 247, 0.5);
                    transform: translateY(-1px);
                    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.2);
                }

                .input-icon {
                    position: absolute;
                    left: 16px;
                    top: 50%;
                    transform: translateY(-50%);
                    color: #475569;
                    transition: color 0.3s;
                }

                .input-affix-wrapper:focus-within .input-icon {
                    color: var(--brand-primary);
                }

                .premium-input {
                    width: 100%;
                    background: transparent;
                    border: none;
                    padding: 16px 16px 16px 48px;
                    font-size: 1rem;
                    color: #f8fafc;
                    outline: none;
                }

                .premium-input::placeholder {
                    color: #475569;
                }

                /* Submit Button */
                .premium-submit-btn {
                    position: relative;
                    background: var(--brand-primary);
                    border: none;
                    border-radius: 16px;
                    padding: 16px 24px;
                    color: #fff;
                    font-size: 1rem;
                    font-weight: 700;
                    cursor: pointer;
                    overflow: hidden;
                    transition: all 0.3s;
                    display: flex;
                    align-items: center;
                    justify-content: center;
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

                /* Footer */
                .setup-footer {
                    margin-top: 40px;
                    padding-top: 24px;
                    border-t: 1px solid rgba(255, 255, 255, 0.05);
                    text-align: center;
                }

                .premium-signout-btn {
                    background: transparent;
                    border: 1px solid rgba(255, 255, 255, 0.05);
                    padding: 10px 20px;
                    border-radius: 12px;
                    color: #64748b;
                    font-size: 0.8125rem;
                    font-weight: 500;
                    cursor: pointer;
                    display: inline-flex;
                    align-items: center;
                    gap: 8px;
                    transition: all 0.2s;
                }

                .premium-signout-btn:hover {
                    background: rgba(255, 255, 255, 0.03);
                    color: #94a3b8;
                    border-color: rgba(255, 255, 255, 0.1);
                }

                .copyright-text {
                    text-align: center;
                    margin-top: 32px;
                    font-size: 0.75rem;
                    color: #475569;
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
