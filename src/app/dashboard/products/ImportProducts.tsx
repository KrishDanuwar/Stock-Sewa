'use client';

import { useState } from 'react';
import Papa from 'papaparse';
import { toast } from 'sonner';
import { Upload, X, FileCheck, AlertCircle, Download } from 'lucide-react';
import { importProductsBatch } from '@/lib/actions/products';

export default function ImportProducts({ onComplete }: { onComplete: () => void }) {
    const [file, setFile] = useState<File | null>(null);
    const [loading, setLoading] = useState(false);
    const [preview, setPreview] = useState<any[]>([]);

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const f = e.target.files?.[0];
        if (f) {
            setFile(f);
            Papa.parse(f, {
                header: true,
                skipEmptyLines: true,
                complete: (results) => {
                    setPreview(results.data.slice(0, 5));
                }
            });
        }
    };

    const handleImport = async () => {
        if (!file) return;
        setLoading(true);

        Papa.parse(file, {
            header: true,
            skipEmptyLines: true,
            complete: async (results) => {
                const products = results.data.map((row: any) => ({
                    name: row.name,
                    price: parseFloat(row.price),
                    cost_price: parseFloat(row.cost_price || '0'),
                    stock_quantity: parseInt(row.stock_quantity || '0'),
                    unit: row.unit || 'pcs',
                    category: row.category || '',
                    barcode: row.barcode || '',
                    mfg_date: row.mfg_date || null,
                    expiry_date: row.expiry_date || null,
                    batch_number: row.batch_number || null,
                }));

                const res = await importProductsBatch(products);
                if (res.success) {
                    toast.success(`Successfully imported ${res.count} products!`);
                    onComplete();
                } else {
                    toast.error(res.error || 'Failed to import');
                }
                setLoading(false);
            }
        });
    };

    const downloadTemplate = () => {
        const template = "name,price,cost_price,stock_quantity,unit,category,barcode,mfg_date,expiry_date,batch_number\nSample Product,500,400,20,pcs,Stationery,12345678,2024-01-01,2025-01-01,BN-001";
        const blob = new Blob([template], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'inventory_template.csv';
        a.click();
    };

    return (
        <div className="glass-card" style={{ padding: 24, marginTop: 20 }}>
            <h3 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
                <Upload size={18} /> Bulk Import Products
            </h3>

            <div style={{ display: 'flex', gap: 12, marginBottom: 20 }}>
                <button onClick={downloadTemplate} className="glass-button" style={{ fontSize: '0.8125rem' }}>
                    <Download size={14} /> Download Template
                </button>
                <div style={{ position: 'relative' }}>
                    <input
                        type="file"
                        accept=".csv"
                        onChange={handleFileUpload}
                        style={{ position: 'absolute', opacity: 0, width: '100%', height: '100%', cursor: 'pointer' }}
                    />
                    <button className="glass-button glass-button-primary" style={{ fontSize: '0.8125rem' }}>
                        {file ? file.name : 'Select CSV File'}
                    </button>
                </div>
            </div>

            {preview.length > 0 && (
                <div style={{ marginBottom: 20 }}>
                    <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', marginBottom: 8 }}>Preview (First 5 rows):</p>
                    <div style={{ overflowX: 'auto', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8 }}>
                        <table style={{ width: '100%', fontSize: '0.75rem', borderCollapse: 'collapse' }}>
                            <thead style={{ background: 'rgba(255,255,255,0.05)' }}>
                                <tr>
                                    <th style={{ padding: '8px 12px', textAlign: 'left' }}>Name</th>
                                    <th style={{ padding: '8px 12px', textAlign: 'left' }}>Price</th>
                                    <th style={{ padding: '8px 12px', textAlign: 'left' }}>Stock</th>
                                </tr>
                            </thead>
                            <tbody>
                                {preview.map((row, i) => (
                                    <tr key={i} style={{ borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                                        <td style={{ padding: '8px 12px' }}>{row.name}</td>
                                        <td style={{ padding: '8px 12px' }}>{row.price}</td>
                                        <td style={{ padding: '8px 12px' }}>{row.stock_quantity}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12 }}>
                {file && (
                    <button
                        onClick={handleImport}
                        disabled={loading}
                        className="glass-button glass-button-primary"
                        style={{ padding: '10px 20px' }}
                    >
                        {loading ? 'Importing...' : `Import ${file.name}`}
                    </button>
                )}
            </div>

            <div style={{ marginTop: 16, padding: 12, borderRadius: 8, background: 'rgba(245, 158, 11, 0.1)', border: '1px solid rgba(245, 158, 11, 0.2)', display: 'flex', gap: 10 }}>
                <AlertCircle size={16} style={{ color: '#fbbf24', flexShrink: 0 }} />
                <p style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.7)', lineHeight: 1.5 }}>
                    Ensure your CSV follows the template. Dates should be in YYYY-MM-DD format. Barcode will be auto-generated if left empty.
                </p>
            </div>
        </div>
    );
}
