'use client';

import { useState } from 'react';
import { updateOrganizationLogo, updateOrganizationDetails, removeOrganizationLogo } from '@/lib/actions/organizations';
import { toast } from 'sonner';
import { Building2, Upload, Camera, Save, Trash2, Mail, Sun, Moon, Palette, UserCircle } from 'lucide-react';
import { useTheme } from '@/components/ThemeProvider';

type Organization = {
    id: string;
    name: string;
    logo_url: string | null;
    pan_vat: string | null;
    address: string | null;
    phone: string | null;
};

export default function SettingsClient({ organization, userEmail }: { organization: Organization | null, userEmail: string }) {
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [logoPreview, setLogoPreview] = useState<string | null>(organization?.logo_url || null);
    const { theme, toggleTheme } = useTheme();

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
            </div>
        </div>
    );
}
