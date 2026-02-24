'use client';

import { useState } from 'react';
import { createInvoice, type CartItem } from '@/lib/actions/invoices';
import { toast } from 'sonner';
import { Plus, Minus, Trash2, ShoppingCart, Search, Receipt, CheckCircle } from 'lucide-react';

type Product = { id: string; name: string; price: number; stock_quantity: number; unit: string; };
type Customer = { id: string; name: string; pan_number: string | null; };

export default function POSClient({ products, customers }: { products: Product[]; customers: Customer[]; }) {
    const [cart, setCart] = useState<CartItem[]>([]);
    const [invoiceType, setInvoiceType] = useState<'normal' | 'pan' | 'vat'>('normal');
    const [paymentMethod, setPaymentMethod] = useState('cash');
    const [customerId, setCustomerId] = useState('');
    const [search, setSearch] = useState('');
    const [loading, setLoading] = useState(false);
    const [lastInvoice, setLastInvoice] = useState<{ number: string; total: number } | null>(null);

    const filtered = products.filter(p => p.name.toLowerCase().includes(search.toLowerCase()));

    const addToCart = (p: Product) => {
        setCart(prev => {
            const exists = prev.find(i => i.product_id === p.id);
            if (exists) return prev.map(i => i.product_id === p.id ? { ...i, quantity: Math.min(i.quantity + 1, p.stock_quantity) } : i);
            return [...prev, { product_id: p.id, product_name: p.name, quantity: 1, unit_price: p.price }];
        });
    };

    const updateQty = (id: string, delta: number) => {
        setCart(prev => prev.map(i => i.product_id === id ? { ...i, quantity: Math.max(1, i.quantity + delta) } : i).filter(i => i.quantity > 0));
    };

    const removeFromCart = (id: string) => setCart(prev => prev.filter(i => i.product_id !== id));

    const subtotal = cart.reduce((s, i) => s + i.unit_price * i.quantity, 0);
    const tax = invoiceType === 'vat' ? subtotal * 0.13 : 0;
    const total = subtotal + tax;

    const handleCheckout = async () => {
        if (cart.length === 0) { toast.error('Cart is empty'); return; }
        if ((invoiceType === 'pan' || invoiceType === 'vat') && !customerId) {
            toast.error('Please select a customer for PAN/VAT invoice'); return;
        }
        setLoading(true);
        const result = await createInvoice({
            customer_id: customerId || undefined,
            invoice_type: invoiceType,
            payment_method: paymentMethod,
            items: cart,
        });
        if (result?.error) { toast.error(result.error); }
        else {
            toast.success('Invoice created!');
            setLastInvoice({ number: result.invoice.invoice_number, total });
            setCart([]);
            setCustomerId('');
        }
        setLoading(false);
    };

    return (
        <div className="animate-fade-in-up" style={{ display: 'grid', gridTemplateColumns: '1fr 380px', gap: 20, height: 'calc(100vh - 64px)' }}>

            {/* Left: Products */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16, overflow: 'hidden' }}>
                <div className="page-header" style={{ marginBottom: 0 }}>
                    <h1 className="page-title">POS — बिक्री</h1>
                    <p className="page-subtitle">Point of Sale</p>
                </div>
                <div style={{ position: 'relative' }}>
                    <Search size={15} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                    <input className="glass-input" style={{ paddingLeft: 36 }} placeholder="Search products..." value={search} onChange={e => setSearch(e.target.value)} />
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(175px, 1fr))', gap: 12, overflowY: 'auto', paddingBottom: 8 }}>
                    {filtered.map(p => (
                        <button key={p.id} onClick={() => addToCart(p)} disabled={p.stock_quantity === 0}
                            className="glass-card"
                            style={{ padding: 16, textAlign: 'left', cursor: p.stock_quantity === 0 ? 'not-allowed' : 'pointer', border: 'none', opacity: p.stock_quantity === 0 ? 0.5 : 1, transition: 'all 0.2s' }}>
                            <div style={{ fontSize: '0.9375rem', fontWeight: 600, marginBottom: 6 }}>{p.name}</div>
                            <div style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--brand-primary)', marginBottom: 4 }}>NPR {p.price.toLocaleString()}</div>
                            <div style={{ fontSize: '0.75rem', color: p.stock_quantity <= 5 ? 'var(--brand-warning)' : 'var(--text-secondary)' }}>
                                Stock: {p.stock_quantity} {p.unit}
                            </div>
                        </button>
                    ))}
                </div>
            </div>

            {/* Right: Cart */}
            <div className="glass-card" style={{ padding: 20, display: 'flex', flexDirection: 'column', gap: 16, overflow: 'hidden' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <ShoppingCart size={20} color="var(--brand-primary)" />
                    <span style={{ fontWeight: 700, fontSize: '1rem' }}>Cart</span>
                    {cart.length > 0 && <span className="badge badge-info" style={{ marginLeft: 'auto' }}>{cart.length} items</span>}
                </div>

                {lastInvoice && (
                    <div style={{ padding: 12, borderRadius: 10, background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.25)', display: 'flex', alignItems: 'center', gap: 10 }}>
                        <CheckCircle size={18} color="var(--brand-success)" />
                        <div>
                            <div style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--brand-success)' }}>{lastInvoice.number}</div>
                            <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>NPR {lastInvoice.total.toLocaleString()} collected</div>
                        </div>
                    </div>
                )}

                {/* Cart Items */}
                <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {cart.length === 0 ? (
                        <div style={{ textAlign: 'center', padding: '32px 0', color: 'var(--text-muted)' }}>
                            <ShoppingCart size={36} style={{ margin: '0 auto 10px', opacity: 0.3 }} />
                            <p style={{ fontSize: '0.875rem' }}>Click products to add</p>
                        </div>
                    ) : cart.map(item => (
                        <div key={item.product_id} style={{ padding: '10px 12px', borderRadius: 10, background: 'rgba(255,255,255,0.04)', border: '1px solid var(--glass-border)' }}>
                            <div style={{ fontWeight: 500, fontSize: '0.875rem', marginBottom: 8 }}>{item.product_name}</div>
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                    <button onClick={() => updateQty(item.product_id, -1)} style={{ width: 26, height: 26, borderRadius: 6, background: 'var(--glass-bg)', border: '1px solid var(--glass-border)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-primary)' }}><Minus size={12} /></button>
                                    <span style={{ fontSize: '0.875rem', minWidth: 24, textAlign: 'center' }}>{item.quantity}</span>
                                    <button onClick={() => updateQty(item.product_id, 1)} style={{ width: 26, height: 26, borderRadius: 6, background: 'var(--glass-bg)', border: '1px solid var(--glass-border)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-primary)' }}><Plus size={12} /></button>
                                </div>
                                <span style={{ fontWeight: 600, fontSize: '0.875rem' }}>NPR {(item.unit_price * item.quantity).toLocaleString()}</span>
                                <button onClick={() => removeFromCart(item.product_id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--brand-danger)', padding: 4 }}><Trash2 size={14} /></button>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Invoice Options */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10, borderTop: '1px solid var(--glass-border)', paddingTop: 14 }}>
                    <div>
                        <label style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', display: 'block', marginBottom: 6 }}>Invoice Type</label>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 6 }}>
                            {(['normal', 'pan', 'vat'] as const).map(t => (
                                <button key={t} onClick={() => setInvoiceType(t)}
                                    style={{
                                        padding: '7px 0', borderRadius: 8, border: '1px solid', fontSize: '0.8125rem', fontWeight: 500, cursor: 'pointer', transition: 'all 0.2s',
                                        borderColor: invoiceType === t ? 'var(--brand-primary)' : 'var(--glass-border)',
                                        background: invoiceType === t ? 'rgba(79,142,247,0.15)' : 'transparent',
                                        color: invoiceType === t ? 'var(--brand-primary)' : 'var(--text-secondary)'
                                    }}>
                                    {t.toUpperCase()}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div>
                        <label style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', display: 'block', marginBottom: 6 }}>Payment</label>
                        <select value={paymentMethod} onChange={e => setPaymentMethod(e.target.value)} className="glass-input" style={{ cursor: 'pointer' }}>
                            <option value="cash">Cash</option>
                            <option value="esewa">eSewa</option>
                            <option value="khalti">Khalti</option>
                            <option value="ime_pay">IME Pay</option>
                            <option value="bank_transfer">Bank Transfer</option>
                            <option value="credit">Credit</option>
                        </select>
                    </div>

                    {(invoiceType === 'pan' || invoiceType === 'vat') && (
                        <div>
                            <label style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', display: 'block', marginBottom: 6 }}>Customer</label>
                            <select value={customerId} onChange={e => setCustomerId(e.target.value)} className="glass-input" style={{ cursor: 'pointer' }}>
                                <option value="">Select customer...</option>
                                {customers.map(c => <option key={c.id} value={c.id}>{c.name}{c.pan_number ? ` (${c.pan_number})` : ''}</option>)}
                            </select>
                        </div>
                    )}

                    {/* Totals */}
                    <div style={{ borderTop: '1px solid var(--glass-border)', paddingTop: 12, display: 'flex', flexDirection: 'column', gap: 6 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                            <span>Subtotal</span><span>NPR {subtotal.toLocaleString()}</span>
                        </div>
                        {invoiceType === 'vat' && (
                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem', color: 'var(--brand-warning)' }}>
                                <span>VAT (13%)</span><span>NPR {tax.toFixed(2)}</span>
                            </div>
                        )}
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1.125rem', fontWeight: 700, marginTop: 4 }}>
                            <span>Total</span><span style={{ color: 'var(--brand-primary)' }}>NPR {total.toFixed(2)}</span>
                        </div>
                    </div>

                    <button onClick={handleCheckout} disabled={loading || cart.length === 0} className="glass-button glass-button-primary" style={{ justifyContent: 'center', padding: 14, fontSize: '1rem' }}>
                        {loading ? 'Processing...' : <><Receipt size={18} /> Complete Sale</>}
                    </button>
                </div>
            </div>
        </div>
    );
}
