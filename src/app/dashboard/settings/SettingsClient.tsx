'use client';

import { useState } from 'react';
import { updateOrganizationLogo, updateOrganizationDetails, removeOrganizationLogo } from '@/lib/actions/organizations';
import { deleteAccount } from '@/lib/actions/user';
import { toast } from 'sonner';
import { Building2, Upload, Camera, Save, Trash2, Mail, Sun, Moon, Palette, UserCircle, CreditCard } from 'lucide-react';
import { useTheme } from '@/components/ThemeProvider';
import Link from 'next/link';

type Organization = {
    id: string;
    name: string;
    logo_url: string | null;
    pan_vat: string | null;
    address: string | null;
    phone: string | null;
    subscription_plan?: string;
    subscription_status?: string;
    trial_ends_at?: string | null;
    subscription_ends_at?: string | null;
};

export default function SettingsClient({
    organization,
    userEmail,
    subscriptionPlan,
    subscriptionStatus,
    trialEndsAt,
    subscriptionEndsAt
}: {
    organization: Organization | null,
    userEmail: string,
    subscriptionPlan?: string,
    subscriptionStatus?: string,
    trialEndsAt?: string | null,
    subscriptionEndsAt?: string | null
}) {
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [logoPreview, setLogoPreview] = useState<string | null>(organization?.logo_url || null);
    const { theme, toggleTheme } = useTheme();

    // Deletion State
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [deleteConfirmString, setDeleteConfirmString] = useState('');

    // Form State
    const [orgName, setOrgName] = useState(organization?.name || '');
    const [panVat, setPanVat] = useState(organization?.pan_vat || '');
    const [address, setAddress] = useState(organization?.address || '');
    const [phone, setPhone] = useState(organization?.phone || '');

    const compressImage = (file: File, maxWidth: number, maxHeight: number, quality: number): Promise<Blob> => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = (event) => {
                const img = new Image();
                img.src = event.target?.result as string;
                img.onload = () => {
                    const canvas = document.createElement('canvas');
                    let width = img.width;
                    let height = img.height;

                    if (width > height) {
                        if (width > maxWidth) {
                            height *= maxWidth / width;
                            width = maxWidth;
                        }
                    } else {
                        if (height > maxHeight) {
                            width *= maxHeight / height;
                            height = maxHeight;
                        }
                    }

                    canvas.width = width;
                    canvas.height = height;
                    const ctx = canvas.getContext('2d');
                    ctx?.drawImage(img, 0, 0, width, height);
                    canvas.toBlob((blob) => {
                        if (blob) resolve(blob);
                        else reject(new Error('Canvas toBlob failed'));
                    }, 'image/jpeg', quality);
                };
                img.onerror = () => reject(new Error('Image load failed'));
            };
            reader.onerror = () => reject(new Error('FileReader failed'));
        });
    };

    async function handleLogoChange(e: React.ChangeEvent<HTMLInputElement>) {
        const file = e.target.files?.[0];
        if (!file) return;

        setLoading(true);
        try {
            const compressedBlob = await compressImage(file, 512, 512, 0.7);
            const previewUrl = URL.createObjectURL(compressedBlob);
            setLogoPreview(previewUrl);

            const formData = new FormData();
            formData.append('logo', compressedBlob, 'logo.jpg');

            const result = await updateOrganizationLogo(formData);
            if (result.success) {
                toast.success('Logo updated successfully!');
            } else {
                toast.error(result.error || 'Failed to update logo');
                setLogoPreview(organization?.logo_url || null);
            }
        } catch (error) {
            toast.error('Error processing image');
            console.error(error);
        } finally {
            setLoading(false);
        }
    }

    async function handleRemoveLogo() {
        if (!confirm('Are you sure you want to remove the logo?')) return;

        setLoading(true);
        try {
            const result = await removeOrganizationLogo();
            if (result.success) {
                setLogoPreview(null);
                toast.success('Logo removed successfully');
            } else {
                toast.error(result.error || 'Failed to remove logo');
            }
        } catch (error) {
            toast.error('Error removing logo');
            console.error(error);
        } finally {
            setLoading(false);
        }
    }

    async function handleSaveDetails() {
        if (!orgName) return toast.error('Organization name is required');

        setSaving(true);
        const formData = new FormData();
        formData.append('name', orgName);
        formData.append('pan_vat', panVat);
        formData.append('address', address);
        formData.append('phone', phone);

        const result = await updateOrganizationDetails(formData);
        if (result.success) {
            toast.success('Organization details updated!');
        } else {
            toast.error(result.error || 'Failed to update details');
        }
        setSaving(false);
    }

    async function handleFinalDeletion() {
        if (deleteConfirmString !== 'DELETE MY DATA') return;

        setLoading(true);
        try {
            const result = await deleteAccount(deleteConfirmString);
            if (result.success) {
                toast.success('Your account and all data have been permanently deleted.');
                // Clerk user deletion will automatically invalidate the session
                window.location.href = '/login';
            } else {
                toast.error(result.error || 'Failed to delete account');
            }
        } catch (error) {
            toast.error('A critical error occurred');
            console.error(error);
        } finally {
            setLoading(false);
            setShowDeleteModal(false);
            setDeleteConfirmString('');
        }
    }

    return (
        <div className="animate-fade-in-up">
            <div className="page-header">
                <div>
                    <h1 className="page-title">Settings</h1>
                    <p className="page-subtitle">Manage your organization branding and system preferences</p>
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 24, maxWidth: 1000 }}>
                {/* Organization Profile */}
                <div className="glass-card" style={{ padding: 32 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
                        <Building2 size={24} color="var(--brand-primary)" />
                        <h2 style={{ fontSize: '1.25rem', fontWeight: 600 }}>Business Branding</h2>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>
                        {/* Logo Section */}
                        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 24 }}>
                            <div style={{ position: 'relative' }}>
                                <div style={{ width: 120, height: 120, borderRadius: 20, background: 'rgba(255,255,255,0.05)', border: '2px dashed var(--glass-border)', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
                                    {logoPreview ? (
                                        <img src={logoPreview} alt="Logo" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                    ) : (
                                        <Building2 size={40} color="var(--text-muted)" />
                                    )}
                                </div>
                                <label style={{ position: 'absolute', bottom: -10, right: -10, width: 36, height: 36, borderRadius: '50%', background: 'var(--brand-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', boxShadow: '0 4px 12px rgba(0,0,0,0.2)' }}>
                                    <Camera size={18} color="white" />
                                    <input type="file" accept="image/*" onChange={handleLogoChange} style={{ display: 'none' }} disabled={loading} />
                                </label>
                            </div>
                            <div style={{ flex: 1 }}>
                                <h3 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: 4 }}>Shop Logo</h3>
                                <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', marginBottom: 16 }}>
                                    Appears on dashboard, sidebar, and printed invoices.
                                </p>
                                <div style={{ display: 'flex', gap: 12 }}>
                                    <label className="glass-button" style={{ cursor: 'pointer', fontSize: '0.8125rem' }}>
                                        <Upload size={14} /> {loading ? 'Uploading...' : 'Upload New'}
                                        <input type="file" accept="image/*" onChange={handleLogoChange} style={{ display: 'none' }} disabled={loading} />
                                    </label>
                                    {logoPreview && (
                                        <button
                                            className="glass-button"
                                            onClick={handleRemoveLogo}
                                            disabled={loading}
                                            style={{ color: 'var(--brand-danger)', borderColor: 'rgba(239, 68, 68, 0.2)' }}
                                        >
                                            <Trash2 size={14} /> Remove
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>

                        <hr style={{ border: 'none', borderTop: '1px solid var(--glass-border)' }} />

                        {/* Details Section */}
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 20 }}>
                            <div className="form-group">
                                <label className="glass-label">Organization Name</label>
                                <input className="glass-input" value={orgName} onChange={(e) => setOrgName(e.target.value)} />
                            </div>
                            <div className="form-group">
                                <label className="glass-label">PAN/VAT Number</label>
                                <input className="glass-input" value={panVat} onChange={(e) => setPanVat(e.target.value)} placeholder="Enter PAN or VAT" />
                            </div>
                            <div className="form-group">
                                <label className="glass-label">Address</label>
                                <input className="glass-input" value={address} onChange={(e) => setAddress(e.target.value)} placeholder="Shop Address" />
                            </div>
                            <div className="form-group">
                                <label className="glass-label">Phone</label>
                                <input className="glass-input" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="Phone Number" />
                            </div>
                        </div>

                        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                            <button
                                className="glass-button glass-button-primary"
                                onClick={handleSaveDetails}
                                disabled={saving}
                            >
                                <Save size={16} /> {saving ? 'Saving...' : 'Save Changes'}
                            </button>
                        </div>
                    </div>
                </div>

                {/* Billing & Subscriptions */}
                <div className="glass-card" style={{ padding: 32, border: '1px solid var(--brand-primary)', background: 'rgba(79, 142, 247, 0.05)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                            <CreditCard size={24} color="var(--brand-primary)" />
                            <h2 style={{ fontSize: '1.25rem', fontWeight: 600 }}>Billing & Subscriptions</h2>
                        </div>
                        <div style={{
                            padding: '4px 12px',
                            borderRadius: '20px',
                            fontSize: '0.75rem',
                            fontWeight: 700,
                            textTransform: 'uppercase',
                            background: (subscriptionStatus || organization?.subscription_status) === 'active' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                            color: (subscriptionStatus || organization?.subscription_status) === 'active' ? 'var(--brand-success)' : 'var(--brand-danger)',
                            border: `1px solid ${(subscriptionStatus || organization?.subscription_status) === 'active' ? 'rgba(16, 185, 129, 0.2)' : 'rgba(239, 68, 68, 0.2)'}`
                        }}>
                            {subscriptionStatus || organization?.subscription_status || 'Inactive'}
                        </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 32 }}>
                        <div style={{ flex: 1 }}>
                            <h3 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: 8 }}>Current Plan</h3>
                            <p style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: 4 }}>
                                {(subscriptionPlan || organization?.subscription_plan) === 'trial' ? '3-Day Free Trial' : (subscriptionPlan || organization?.subscription_plan) || 'No Active Plan'}
                            </p>
                            {((subscriptionPlan || organization?.subscription_plan) === 'trial') && (trialEndsAt || organization?.trial_ends_at) && (
                                <p style={{ fontSize: '0.875rem', color: 'var(--brand-primary)', fontWeight: 500 }}>
                                    Ends on: {new Date(trialEndsAt || organization!.trial_ends_at!).toLocaleDateString()}
                                </p>
                            )}
                        </div>

                        <div style={{ borderLeft: '1px solid var(--glass-border)', paddingLeft: 32 }}>
                            <h3 style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 12 }}>Need to upgrade or renew?</h3>
                            <Link href="/trial-expired">
                                <button className="glass-button glass-button-primary" style={{ width: '100%', justifyContent: 'center' }}>
                                    View Pricing Plans
                                </button>
                            </Link>
                        </div>
                    </div>
                </div>

                {/* Appearance & System */}
                <div className="glass-card" style={{ padding: 32 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
                        <Palette size={24} color="var(--brand-primary)" />
                        <h2 style={{ fontSize: '1.25rem', fontWeight: 600 }}>System Aesthetics</h2>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <div>
                            <h3 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: 4 }}>Visual Theme</h3>
                            <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>
                                Optimize the interface for your environment.
                            </p>
                        </div>

                        <button
                            onClick={toggleTheme}
                            className="glass-button"
                            style={{
                                padding: '12px 24px',
                                background: theme === 'light' ? 'rgba(79, 142, 247, 0.1)' : 'rgba(255, 255, 255, 0.05)',
                                borderColor: theme === 'light' ? 'var(--brand-primary)' : 'var(--glass-border)'
                            }}
                        >
                            {theme === 'dark' ? (
                                <>
                                    <Sun size={18} color="#fbbf24" /> <span>Switch to Light Mode</span>
                                </>
                            ) : (
                                <>
                                    <Moon size={18} color="var(--brand-primary)" /> <span>Switch to Dark Mode</span>
                                </>
                            )}
                        </button>
                    </div>
                </div>

                {/* Account Section - Managed by Clerk */}
                <div className="glass-card" style={{ padding: 32, border: '1px solid var(--brand-primary)', background: 'rgba(79, 142, 247, 0.03)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
                        <UserCircle size={24} color="var(--brand-primary)" />
                        <h2 style={{ fontSize: '1.25rem', fontWeight: 600 }}>User Management</h2>
                    </div>
                    <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: 24 }}>
                        Your account security and personal details (email, password) are securely managed by **Clerk Auth**.
                    </p>
                    <div className="cl-settings-wrapper" style={{ display: 'flex', justifyContent: 'flex-start' }}>
                        {/* We don't embed the whole UserProfile here as it might be too large, 
                            instead we can use the UserButton elsewhere or link to a dedicated profile page.
                            For now, we'll just show the email for reference. */}
                        <div style={{ background: 'rgba(255,255,255,0.05)', padding: '12px 20px', borderRadius: 12, border: '1px solid var(--glass-border)', display: 'flex', alignItems: 'center', gap: 12 }}>
                            <Mail size={16} color="var(--text-muted)" />
                            <span style={{ fontSize: '0.9375rem', fontWeight: 500 }}>{userEmail}</span>
                        </div>
                    </div>
                </div>

                {/* Customer Support */}
                <div className="glass-card" style={{ padding: 32, border: '1px solid rgba(16, 185, 129, 0.2)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
                        <div style={{ width: 40, height: 40, borderRadius: 10, background: 'rgba(16, 185, 129, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <Mail size={20} color="var(--brand-success)" />
                        </div>
                        <h2 style={{ fontSize: '1.25rem', fontWeight: 600 }}>Technical Support</h2>
                    </div>
                    <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: 24 }}>
                        Need help or want to request a feature? Contact us directly.
                    </p>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 16 }}>
                        <a href="https://wa.me/9779703360369" target="_blank" rel="noopener noreferrer" className="glass-button" style={{ justifyContent: 'center', color: 'var(--brand-success)', borderColor: 'rgba(16, 185, 129, 0.2)' }}>
                            WhatsApp Support
                        </a>
                        <a href="mailto:junsangsingh@gmail.com" className="glass-button" style={{ justifyContent: 'center' }}>
                            Email Address
                        </a>
                    </div>
                </div>

                {/* Account Deletion - Danger Zone */}
                <div className="glass-card" style={{ padding: 32, border: '1px solid rgba(239, 68, 68, 0.2)', background: 'rgba(239, 68, 68, 0.02)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
                        <div style={{ width: 40, height: 40, borderRadius: 10, background: 'rgba(239, 68, 68, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <Trash2 size={20} color="var(--brand-danger)" />
                        </div>
                        <h2 style={{ fontSize: '1.25rem', fontWeight: 600, color: 'var(--brand-danger)' }}>Danger Zone</h2>
                    </div>
                    <div style={{ backgroundColor: 'rgba(239, 68, 68, 0.05)', border: '1px dashed rgba(239, 68, 68, 0.3)', borderRadius: '16px', padding: '24px' }}>
                        <h3 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: 8, color: 'var(--text-primary)' }}>Delete Organization & Account</h3>
                        <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', lineHeight: '1.6', marginBottom: 20 }}>
                            This action is **permanent**. Deleting your account will erase:
                            <br />• All invoices and sales history
                            <br />• All product and inventory data
                            <br />• All customer records
                            <br />• Your business profile and settings
                        </p>
                        <button
                            className="glass-button"
                            style={{ background: 'var(--brand-danger)', color: 'white', border: 'none', fontWeight: 600, padding: '12px 24px' }}
                            onClick={() => setShowDeleteModal(true)}
                        >
                            <Trash2 size={16} /> Delete All My Data
                        </button>
                    </div>
                </div>
            </div>

            {/* Deletion Confirmation Modal */}
            {showDeleteModal && (
                <div className="modal-overlay" style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(8px)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
                    <div className="glass-card animate-scale-in" style={{ maxWidth: 450, padding: 32, textAlign: 'center' }}>
                        <div style={{ width: 64, height: 64, background: 'rgba(239, 68, 68, 0.1)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px' }}>
                            <Trash2 size={32} color="var(--brand-danger)" />
                        </div>
                        <h2 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: 12 }}>Are you absolutely sure?</h2>
                        <p style={{ color: 'var(--text-secondary)', fontSize: '0.9375rem', marginBottom: 24 }}>
                            Once you delete your account, there is no going back. All your data will be wiped instantly from our servers.
                        </p>

                        <div className="form-group text-left" style={{ marginBottom: 24 }}>
                            <label className="glass-label" style={{ marginBottom: 8, color: 'var(--text-primary)' }}>
                                Type <span style={{ color: 'var(--brand-danger)', fontWeight: 700 }}>DELETE MY DATA</span> to confirm
                            </label>
                            <input
                                className="glass-input"
                                placeholder="Type the confirmation text here"
                                value={deleteConfirmString}
                                onChange={(e) => setDeleteConfirmString(e.target.value)}
                                style={{ textAlign: 'center', letterSpacing: '0.1em', fontWeight: 600 }}
                            />
                        </div>

                        <div style={{ display: 'flex', gap: 12 }}>
                            <button
                                className="glass-button"
                                style={{ flex: 1, justifyContent: 'center' }}
                                onClick={() => { setShowDeleteModal(false); setDeleteConfirmString(''); }}
                            >
                                Cancel
                            </button>
                            <button
                                className="glass-button"
                                disabled={deleteConfirmString !== 'DELETE MY DATA' || loading}
                                onClick={handleFinalDeletion}
                                style={{
                                    flex: 1,
                                    justifyContent: 'center',
                                    background: deleteConfirmString === 'DELETE MY DATA' ? 'var(--brand-danger)' : 'rgba(239, 68, 68, 0.1)',
                                    color: deleteConfirmString === 'DELETE MY DATA' ? 'white' : 'rgba(239, 68, 68, 0.4)',
                                    border: 'none',
                                    fontWeight: 700
                                }}
                            >
                                {loading ? 'Deleting...' : 'Permanently Delete'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
