'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
    ShieldAlert, ArrowLeft, Search, Calendar, User,
    ChevronLeft, ChevronRight, Eye, X, Filter, Download
} from 'lucide-react';
import { format } from 'date-fns';

interface AuditLog {
    id: string;
    event_type: string;
    user_id: string;
    user_email: string;
    metadata: any;
    timestamp: string;
}

export default function AuditLogsClient({
    initialLogs,
    totalLogs,
    error
}: {
    initialLogs: AuditLog[];
    totalLogs: number;
    error?: string;
}) {
    const router = useRouter();
    const [search, setSearch] = useState('');
    const [selectedLog, setSelectedLog] = useState<AuditLog | null>(null);

    const filteredLogs = initialLogs.filter(log =>
        log.event_type.toLowerCase().includes(search.toLowerCase()) ||
        log.user_email.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="admin-container" style={{ padding: '24px', maxWidth: '1400px', margin: '0 auto' }}>
            {/* Header */}
            <header style={{ marginBottom: 32, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div>
                    <button
                        onClick={() => router.push('/admin')}
                        className="glass-button"
                        style={{ padding: '8px 12px', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}
                    >
                        <ArrowLeft size={16} /> Back to Dashboard
                    </button>
                    <h1 className="glass-title" style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        <ShieldAlert className="text-brand-primary" /> Security Audit Logs
                    </h1>
                    <p className="glass-text-muted">Monitor sensitive security events across the system</p>
                </div>

                <div style={{ display: 'flex', gap: 12 }}>
                    <div className="glass-input-wrapper" style={{ width: 300 }}>
                        <Search size={16} className="glass-input-icon" />
                        <input
                            type="text"
                            placeholder="Search events or emails..."
                            className="glass-input"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>
                </div>
            </header>

            {error && (
                <div className="glass-card" style={{ padding: 20, borderColor: 'var(--brand-danger-dim)', background: 'var(--brand-danger-super-dim)', marginBottom: 24 }}>
                    <p style={{ color: 'var(--brand-danger)', display: 'flex', alignItems: 'center', gap: 8 }}>
                        <X size={18} /> {error}
                    </p>
                </div>
            )}

            {/* Logs Table */}
            <div className="glass-card" style={{ overflow: 'hidden' }}>
                <div style={{ overflowX: 'auto' }}>
                    <table className="glass-table">
                        <thead>
                            <tr>
                                <th>Timestamp</th>
                                <th>Event Type</th>
                                <th>User</th>
                                <th>Metadata</th>
                                <th style={{ textAlign: 'right' }}>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredLogs.length === 0 ? (
                                <tr>
                                    <td colSpan={5} style={{ textAlign: 'center', padding: '48px 24px', color: 'var(--text-muted)' }}>
                                        No audit logs found.
                                    </td>
                                </tr>
                            ) : (
                                filteredLogs.map((log) => (
                                    <tr key={log.id}>
                                        <td style={{ whiteSpace: 'nowrap', fontSize: '0.8125rem' }}>
                                            {format(new Date(log.timestamp), 'MMM dd, HH:mm:ss')}
                                        </td>
                                        <td>
                                            <span
                                                className="glass-badge"
                                                style={{
                                                    background: log.event_type.includes('delete') ? 'rgba(239, 68, 68, 0.1)' : 'rgba(79, 142, 247, 0.1)',
                                                    color: log.event_type.includes('delete') ? 'var(--brand-danger)' : 'var(--brand-primary)'
                                                }}
                                            >
                                                {log.event_type}
                                            </span>
                                        </td>
                                        <td style={{ fontSize: '0.8125rem', fontWeight: 500 }}>
                                            {log.user_email}
                                        </td>
                                        <td style={{ maxWidth: 300, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                                            {JSON.stringify(log.metadata)}
                                        </td>
                                        <td style={{ textAlign: 'right' }}>
                                            <button
                                                onClick={() => setSelectedLog(log)}
                                                className="glass-action-btn"
                                                title="View Details"
                                            >
                                                <Eye size={16} />
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination (Simplified for now) */}
                <div style={{ padding: '16px 24px', borderTop: '1px solid var(--glass-border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <p className="glass-text-muted" style={{ fontSize: '0.8125rem' }}>
                        Showing {filteredLogs.length} of {totalLogs} logs
                    </p>
                    <div style={{ display: 'flex', gap: 8 }}>
                        <button className="glass-button" disabled style={{ padding: 8 }}><ChevronLeft size={16} /></button>
                        <button className="glass-button" disabled style={{ padding: 8 }}><ChevronRight size={16} /></button>
                    </div>
                </div>
            </div>

            {/* Log Detail Modal */}
            {selectedLog && (
                <div className="glass-modal-overlay">
                    <div className="glass-modal-content" style={{ maxWidth: 600 }}>
                        <div className="glass-modal-header">
                            <h3 style={{ margin: 0 }}>Event Details</h3>
                            <button onClick={() => setSelectedLog(null)} className="glass-close-btn"><X size={20} /></button>
                        </div>
                        <div className="glass-modal-body" style={{ padding: 24 }}>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, marginBottom: 24 }}>
                                <div>
                                    <label className="glass-label">Event</label>
                                    <p style={{ margin: '4px 0', fontWeight: 600 }}>{selectedLog.event_type}</p>
                                </div>
                                <div>
                                    <label className="glass-label">Time</label>
                                    <p style={{ margin: '4px 0', fontWeight: 600 }}>{format(new Date(selectedLog.timestamp), 'PPPP p')}</p>
                                </div>
                                <div>
                                    <label className="glass-label">User Email</label>
                                    <p style={{ margin: '4px 0', fontWeight: 600 }}>{selectedLog.user_email}</p>
                                </div>
                                <div>
                                    <label className="glass-label">User ID</label>
                                    <p style={{ margin: '4px 0', fontWeight: 600, fontSize: '0.75rem' }}>{selectedLog.user_id}</p>
                                </div>
                            </div>

                            <label className="glass-label">Metadata</label>
                            <pre
                                style={{
                                    background: 'rgba(0,0,0,0.03)',
                                    padding: 16,
                                    borderRadius: 12,
                                    fontSize: '0.8125rem',
                                    marginTop: 8,
                                    overflowX: 'auto'
                                }}
                            >
                                {JSON.stringify(selectedLog.metadata, null, 2)}
                            </pre>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
