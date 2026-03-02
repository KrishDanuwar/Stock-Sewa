'use client';

import { useState } from 'react';
import { toast } from 'sonner';
import { Plus, Trash2, Truck, Package, X, Search, FileText, ChevronDown, ChevronUp } from 'lucide-react';
import { addSupplier, updateSupplier, deleteSupplier, createPurchase } from '@/lib/actions/suppliers';

type Supplier = {
    id: string; name: string; phone: string | null; email: string | null;
    address: string | null; pan_number: string | null;
};

type PurchaseItem = {
    id: string; product_name: string; quantity: number; unit_price: number; cost_price: number;
};

type Purchase = {
    id: string; purchase_date: string | null; total_amount: number; notes: string | null;
    created_at: string;
    suppliers: { id: string; name: string }[] | { id: string; name: string } | null;
    purchase_items: PurchaseItem[];
};

type Product = {
    id: string; name: string; price: number; cost_price?: number;
    stock_quantity: number;
};

interface Props {
    suppliers: Supplier[];
    purchases: Purchase[];
    products: Product[];
}

export default function SuppliersClient({ suppliers, purchases, products }: Props) {
    const [tab, setTab] = useState<'suppliers' | 'purchases'>('suppliers');
    const [search, setSearch] = useState('');

    // Supplier modal
    const [showSupplierModal, setShowSupplierModal] = useState(false);
    const [editSupplier, setEditSupplier] = useState<Supplier | null>(null);
    const [saving, setSaving] = useState(false);

    // Purchase modal
    const [showPurchaseModal, setShowPurchaseModal] = useState(false);
    const [purchaseSupplier, setPurchaseSupplier] = useState('');
    const [purchaseDate, setPurchaseDate] = useState(new Date().toISOString().split('T')[0]);
    const [purchaseNotes, setPurchaseNotes] = useState('');
    const [purchaseItems, setPurchaseItems] = useState<{ product_id: string; product_name: string; quantity: string; unit_price: string; cost_price: string }[]>([]);
    const [creatingPurchase, setCreatingPurchase] = useState(false);

    // Expanded purchase rows
    const [expandedPurchase, setExpandedPurchase] = useState<string | null>(null);

    // ---- Supplier CRUD ----
    async function handleSaveSupplier(e: React.FormEvent) {
        e.preventDefault();
        setSaving(true);
        const form = e.target as HTMLFormElement;
        const formData = new FormData(form);

        const result = editSupplier
            ? await updateSupplier(editSupplier.id, formData)
            : await addSupplier(formData);

        if (result?.error) {
            toast.error(result.error);
        } else {
            toast.success(editSupplier ? 'Supplier updated!' : 'Supplier added!');
            setShowSupplierModal(false);
            setEditSupplier(null);
        }
        setSaving(false);
    }

    async function handleDeleteSupplier(id: string, name: string) {
        if (!confirm(`Delete supplier "${name}"? Associated purchases will keep their records.`)) return;
        const result = await deleteSupplier(id);
        if (result?.error) toast.error(result.error);
        else toast.success('Supplier deleted');
    }

    // ---- Purchase Creation ----
    function addPurchaseItem() {
        setPurchaseItems(prev => [...prev, { product_id: '', product_name: '', quantity: '1', unit_price: '0', cost_price: '0' }]);
    }

    function removePurchaseItem(idx: number) {
        setPurchaseItems(prev => prev.filter((_, i) => i !== idx));
    }

    function updatePurchaseItem(idx: number, field: string, value: string) {
        setPurchaseItems(prev => prev.map((item, i) => {
            if (i !== idx) return item;
            const updated = { ...item, [field]: value };
            // Auto-fill name/price when product selected
            if (field === 'product_id') {
                const product = products.find(p => p.id === value);
                if (product) {
                    updated.product_name = product.name;
                    updated.unit_price = String(product.price);
                    updated.cost_price = String(product.cost_price || 0);
                }
            }
            return updated;
        }));
    }

    async function handleCreatePurchase(e: React.FormEvent) {
        e.preventDefault();
        if (purchaseItems.length === 0) return toast.error('Add at least one item');

        const invalidItems = purchaseItems.filter(i => !i.product_id || !Number(i.quantity));
        if (invalidItems.length) return toast.error('Complete all item fields');

        setCreatingPurchase(true);
        const result = await createPurchase({
            supplier_id: purchaseSupplier,
            purchase_date: purchaseDate,
            notes: purchaseNotes,
            items: purchaseItems.map(i => ({
                product_id: i.product_id,
                product_name: i.product_name,
                quantity: Number(i.quantity),
                unit_price: Number(i.unit_price),
                cost_price: Number(i.cost_price),
            })),
        });

        if (result?.error) {
            toast.error(result.error);
        } else {
            toast.success('Purchase recorded & stock updated!');
            setShowPurchaseModal(false);
            setPurchaseItems([]);
            setPurchaseSupplier('');
            setPurchaseNotes('');
        }
        setCreatingPurchase(false);
    }

    const purchaseTotal = purchaseItems.reduce((s, i) => s + (Number(i.quantity) || 0) * (Number(i.cost_price) || 0), 0);

    const filteredSuppliers = suppliers.filter(s =>
        s.name.toLowerCase().includes(search.toLowerCase()) ||
        (s.phone || '').includes(search) ||
        (s.pan_number || '').includes(search)
    );

    return (
        <>
            {/* Header */}
            <div className="page-header" style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
                <div>
                    <h1 className="page-title">Suppliers</h1>
                    <p className="page-subtitle">Manage suppliers & purchase history</p>
                </div>
                <div style={{ display: 'flex', gap: 8 }}>
                    <button onClick={() => { setShowPurchaseModal(true); addPurchaseItem(); }} className="glass-button glass-button-primary">
                        <Package size={16} /> New Purchase
                    </button>
                    <button onClick={() => { setEditSupplier(null); setShowSupplierModal(true); }} className="glass-button">
                        <Plus size={16} /> Add Supplier
                    </button>
                </div>
            </div>

            {/* Tabs */}
            <div style={{ display: 'flex', gap: 0, marginBottom: 16, borderBottom: '1px solid var(--glass-border)' }}>
                {(['suppliers', 'purchases'] as const).map(t => (
                    <button
                        key={t}
                        onClick={() => setTab(t)}
                        style={{
                            padding: '10px 24px',
                            fontSize: '0.875rem',
                            fontWeight: tab === t ? 700 : 500,
                            color: tab === t ? 'var(--brand-primary)' : 'var(--text-secondary)',
                            background: 'transparent',
                            border: 'none',
                            borderBottom: tab === t ? '2px solid var(--brand-primary)' : '2px solid transparent',
                            cursor: 'pointer',
                            textTransform: 'capitalize',
                        }}
                    >
                        {t === 'suppliers' ? <><Truck size={14} style={{ marginRight: 6, verticalAlign: 'middle' }} />Suppliers ({suppliers.length})</> :
                            <><FileText size={14} style={{ marginRight: 6, verticalAlign: 'middle' }} />Purchases ({purchases.length})</>}
                    </button>
                ))}
            </div>

            {/* Search */}
            {tab === 'suppliers' && (
                <div style={{ position: 'relative', marginBottom: 16 }}>
                    <Search size={16} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                    <input
                        className="glass-input"
                        style={{ paddingLeft: 36, width: '100%' }}
                        placeholder="Search by name, phone, or PAN..."
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                    />
                </div>
            )}

            {/* ============= SUPPLIERS TAB ============= */}
            {tab === 'suppliers' && (
                <div className="glass-card" style={{ overflow: 'auto' }}>
                    <table className="glass-table">
                        <thead>
                            <tr>
                                <th>Name</th>
                                <th>Phone</th>
                                <th>Email</th>
                                <th>Address</th>
                                <th>PAN</th>
                                <th style={{ textAlign: 'center' }}>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredSuppliers.length === 0 ? (
                                <tr><td colSpan={6} style={{ textAlign: 'center', padding: 32, color: 'var(--text-muted)' }}>No suppliers found</td></tr>
                            ) : filteredSuppliers.map(s => (
                                <tr key={s.id}>
                                    <td style={{ fontWeight: 600 }}>{s.name}</td>
                                    <td>{s.phone || '—'}</td>
                                    <td>{s.email || '—'}</td>
                                    <td>{s.address || '—'}</td>
                                    <td>{s.pan_number || '—'}</td>
                                    <td style={{ textAlign: 'center' }}>
                                        <div style={{ display: 'flex', gap: 6, justifyContent: 'center' }}>
                                            <button onClick={() => { setEditSupplier(s); setShowSupplierModal(true); }} className="action-button action-info" title="Edit">✏️</button>
                                            <button onClick={() => handleDeleteSupplier(s.id, s.name)} className="action-button action-danger" title="Delete"><Trash2 size={14} /></button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {/* ============= PURCHASES TAB ============= */}
            {tab === 'purchases' && (
                <div className="glass-card" style={{ overflow: 'auto' }}>
                    <table className="glass-table">
                        <thead>
                            <tr>
                                <th></th>
                                <th>Date</th>
                                <th>Supplier</th>
                                <th>Items</th>
                                <th style={{ textAlign: 'right' }}>Total</th>
                                <th>Notes</th>
                            </tr>
                        </thead>
                        <tbody>
                            {purchases.length === 0 ? (
                                <tr><td colSpan={6} style={{ textAlign: 'center', padding: 32, color: 'var(--text-muted)' }}>No purchases recorded yet</td></tr>
                            ) : purchases.map(p => {
                                const supplierRaw = p.suppliers as any;
                                const supplierName = Array.isArray(supplierRaw) ? supplierRaw[0]?.name : supplierRaw?.name;
                                const isExpanded = expandedPurchase === p.id;
                                return (
                                    <>
                                        <tr key={p.id} style={{ cursor: 'pointer' }} onClick={() => setExpandedPurchase(isExpanded ? null : p.id)}>
                                            <td style={{ width: 30, textAlign: 'center' }}>
                                                {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                                            </td>
                                            <td>{p.purchase_date || '—'}</td>
                                            <td style={{ fontWeight: 600 }}>{supplierName || 'Unknown'}</td>
                                            <td>{(p.purchase_items as any[])?.length || 0} items</td>
                                            <td style={{ textAlign: 'right', fontWeight: 600 }}>Rs. {Number(p.total_amount).toLocaleString()}</td>
                                            <td style={{ color: 'var(--text-secondary)', fontSize: '0.8rem' }}>{p.notes || '—'}</td>
                                        </tr>
                                        {isExpanded && (
                                            <tr key={`${p.id}-detail`}>
                                                <td colSpan={6} style={{ padding: '0 12px 12px 36px', background: 'rgba(255,255,255,0.02)' }}>
                                                    <table style={{ width: '100%', fontSize: '0.8rem' }}>
                                                        <thead>
                                                            <tr style={{ color: 'var(--text-muted)' }}>
                                                                <th style={{ textAlign: 'left', padding: '4px 8px' }}>Product</th>
                                                                <th style={{ textAlign: 'center', padding: '4px 8px' }}>Qty</th>
                                                                <th style={{ textAlign: 'right', padding: '4px 8px' }}>Cost Price</th>
                                                                <th style={{ textAlign: 'right', padding: '4px 8px' }}>Subtotal</th>
                                                            </tr>
                                                        </thead>
                                                        <tbody>
                                                            {(p.purchase_items as PurchaseItem[]).map(item => (
                                                                <tr key={item.id}>
                                                                    <td style={{ padding: '4px 8px' }}>{item.product_name}</td>
                                                                    <td style={{ textAlign: 'center', padding: '4px 8px' }}>{item.quantity}</td>
                                                                    <td style={{ textAlign: 'right', padding: '4px 8px' }}>Rs. {Number(item.cost_price).toLocaleString()}</td>
                                                                    <td style={{ textAlign: 'right', padding: '4px 8px' }}>Rs. {(item.quantity * Number(item.cost_price)).toLocaleString()}</td>
                                                                </tr>
                                                            ))}
                                                        </tbody>
                                                    </table>
                                                </td>
                                            </tr>
                                        )}
                                    </>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            )}

            {/* ============= ADD/EDIT SUPPLIER MODAL ============= */}
            {showSupplierModal && (
                <div className="modal-overlay" onClick={() => { setShowSupplierModal(false); setEditSupplier(null); }}>
                    <div className="glass-card modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: 480 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                            <h2 style={{ fontSize: '1.1rem', fontWeight: 700 }}>{editSupplier ? 'Edit Supplier' : 'Add Supplier'}</h2>
                            <button onClick={() => { setShowSupplierModal(false); setEditSupplier(null); }} className="action-button"><X size={18} /></button>
                        </div>
                        <form onSubmit={handleSaveSupplier}>
                            <div className="form-group">
                                <label className="form-label">Supplier Name *</label>
                                <input name="name" className="glass-input" required defaultValue={editSupplier?.name || ''} placeholder="e.g. Nepal Trading Co." />
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                                <div className="form-group">
                                    <label className="form-label">Phone</label>
                                    <input name="phone" className="glass-input" defaultValue={editSupplier?.phone || ''} placeholder="98XXXXXXXX" />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Email</label>
                                    <input name="email" className="glass-input" defaultValue={editSupplier?.email || ''} placeholder="supplier@mail.com" />
                                </div>
                            </div>
                            <div className="form-group">
                                <label className="form-label">Address</label>
                                <input name="address" className="glass-input" defaultValue={editSupplier?.address || ''} placeholder="Biratnagar, Nepal" />
                            </div>
                            <div className="form-group">
                                <label className="form-label">PAN Number</label>
                                <input name="pan_number" className="glass-input" defaultValue={editSupplier?.pan_number || ''} placeholder="000000000" />
                            </div>
                            <button type="submit" disabled={saving} className="glass-button glass-button-primary" style={{ width: '100%', justifyContent: 'center', marginTop: 10, padding: 14 }}>
                                {saving ? 'Saving...' : editSupplier ? 'Update Supplier' : 'Add Supplier'}
                            </button>
                        </form>
                    </div>
                </div>
            )}

            {/* ============= NEW PURCHASE MODAL ============= */}
            {showPurchaseModal && (
                <div className="modal-overlay" onClick={() => { setShowPurchaseModal(false); setPurchaseItems([]); }}>
                    <div className="glass-card modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: 640 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                            <h2 style={{ fontSize: '1.1rem', fontWeight: 700 }}>Record New Purchase</h2>
                            <button onClick={() => { setShowPurchaseModal(false); setPurchaseItems([]); }} className="action-button"><X size={18} /></button>
                        </div>
                        <form onSubmit={handleCreatePurchase}>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                                <div className="form-group">
                                    <label className="form-label">Supplier *</label>
                                    <select className="glass-input" value={purchaseSupplier} onChange={e => setPurchaseSupplier(e.target.value)} required>
                                        <option value="">Select Supplier</option>
                                        {suppliers.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                                    </select>
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Purchase Date</label>
                                    <input type="date" className="glass-input" value={purchaseDate} onChange={e => setPurchaseDate(e.target.value)} />
                                </div>
                            </div>
                            <div className="form-group">
                                <label className="form-label">Notes</label>
                                <input className="glass-input" value={purchaseNotes} onChange={e => setPurchaseNotes(e.target.value)} placeholder="Optional notes..." />
                            </div>

                            {/* Purchase Items */}
                            <div style={{ marginTop: 12, marginBottom: 8, fontWeight: 700, fontSize: '0.9rem' }}>Items</div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, maxHeight: 240, overflowY: 'auto' }}>
                                {purchaseItems.map((item, idx) => (
                                    <div key={idx} style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 30px', gap: 8, alignItems: 'end' }}>
                                        <div>
                                            {idx === 0 && <label className="form-label" style={{ fontSize: '0.7rem' }}>Product</label>}
                                            <select className="glass-input" value={item.product_id} onChange={e => updatePurchaseItem(idx, 'product_id', e.target.value)} required>
                                                <option value="">Select Product</option>
                                                {products.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                                            </select>
                                        </div>
                                        <div>
                                            {idx === 0 && <label className="form-label" style={{ fontSize: '0.7rem' }}>Qty</label>}
                                            <input className="glass-input" type="number" min="1" value={item.quantity} onChange={e => updatePurchaseItem(idx, 'quantity', e.target.value)} required />
                                        </div>
                                        <div>
                                            {idx === 0 && <label className="form-label" style={{ fontSize: '0.7rem' }}>Cost Price</label>}
                                            <input className="glass-input" type="number" min="0" step="0.01" value={item.cost_price} onChange={e => updatePurchaseItem(idx, 'cost_price', e.target.value)} />
                                        </div>
                                        <button type="button" onClick={() => removePurchaseItem(idx)} className="action-button action-danger" style={{ height: 36 }}><Trash2 size={14} /></button>
                                    </div>
                                ))}
                            </div>
                            <button type="button" onClick={addPurchaseItem} className="glass-button" style={{ width: '100%', justifyContent: 'center', marginTop: 8, fontSize: '0.8rem' }}>
                                <Plus size={14} /> Add Item
                            </button>

                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 16, padding: '12px 0', borderTop: '1px solid var(--glass-border)' }}>
                                <span style={{ fontWeight: 700, fontSize: '1rem' }}>Total: Rs. {purchaseTotal.toLocaleString()}</span>
                                <button type="submit" disabled={creatingPurchase} className="glass-button glass-button-primary" style={{ padding: '12px 28px' }}>
                                    {creatingPurchase ? 'Recording...' : 'Record Purchase & Restock'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </>
    );
}
