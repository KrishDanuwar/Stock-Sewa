'use client';

import { useState } from 'react';
import { createInvoice, type CartItem } from '@/lib/actions/invoices';
import { toast } from 'sonner';
import { Plus, Minus, Trash2, ShoppingCart, Search, Receipt, CheckCircle, Printer } from 'lucide-react';
import { printInvoicePDF } from '@/lib/utils/invoiceGenerator';

type Product = { id: string; name: string; price: number; stock_quantity: number; unit: string; };
type Customer = { id: string; name: string; pan_number: string | null; tax_type?: 'pan' | 'vat'; };
type Organization = { name: string; pan_vat: string | null; address: string | null; phone: string | null; preferred_language: string | null; } | null;

export default function POSClient({
    products = [],
    customers = [],
    organization
}: {
    products?: Product[];
    customers?: Customer[];
    organization?: Organization;
}) {
    const productsList = products || [];
    const customersList = customers || [];

    const [cart, setCart] = useState<CartItem[]>([]);
    const [invoiceType, setInvoiceType] = useState<'normal' | 'pan' | 'vat'>('normal');
    const [paymentMethod, setPaymentMethod] = useState('cash');
    const [customerId, setCustomerId] = useState('');
    const [search, setSearch] = useState('');
    const [loading, setLoading] = useState(false);
    const [lastInvoice, setLastInvoice] = useState<{ number: string; total: number; data?: any } | null>(null);
    const [customerMode, setCustomerMode] = useState<'walkin' | 'registered'>('walkin');
    const [customerSearch, setCustomerSearch] = useState('');
    const [amountPaid, setAmountPaid] = useState<number>(0);
    const [manualCustomerName, setManualCustomerName] = useState('');
    const [manualCustomerPan, setManualCustomerPan] = useState('');
    const [errorOccurred, setErrorOccurred] = useState(false);

    const filteredProducts = productsList.filter(p =>
        (p?.name || '').toLowerCase().includes(search.toLowerCase())
    );
    const filteredCustomers = customersList.filter(c =>
        (c?.name || '').toLowerCase().includes(customerSearch.toLowerCase()) ||
        (c?.pan_number ?? '').includes(customerSearch)
    );

    const selectedCustomer = customersList.find(c => c.id === customerId);

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

    // Derived payment status
    const getPaymentStatus = (): 'paid' | 'unpaid' | 'partial' => {
        if (amountPaid >= total) return 'paid';
        if (amountPaid <= 0) return 'unpaid';
        return 'partial';
    };

    const handleCheckout = async () => {
        try {
            if (cart.length === 0) { toast.error('Cart is empty'); return; }

            const effectiveCustomerId = customerMode === 'registered' ? customerId : undefined;

            if ((invoiceType === 'pan' || invoiceType === 'vat')) {
                if (customerMode === 'registered' && !effectiveCustomerId) {
                    toast.error('Please select a customer for PAN/VAT invoice'); return;
                }
            }

            if (getPaymentStatus() !== 'paid' && !effectiveCustomerId) {
                toast.error('Customer is required for credit/unpaid sales'); return;
            }

            setLoading(true);
            const result = await createInvoice({
                customer_id: effectiveCustomerId,
                invoice_type: invoiceType,
                payment_method: paymentMethod,
                payment_status: getPaymentStatus(),
                amount_paid: amountPaid,
                customer_name_manual: customerMode === 'walkin' ? manualCustomerName : undefined,
                customer_pan_manual: customerMode === 'walkin' ? manualCustomerPan : undefined,
                items: cart,
            });

            if (result?.error || !result?.invoice) {
                toast.error(result?.error || 'Could not complete sale');
                setLoading(false);
                return;
            }

            toast.success('Invoice created!');

            try {
                const invData = {
                    organization: organization || { name: 'Stock Sewa', pan_vat: null, address: null, phone: null, preferred_language: 'en' },
                    invoice_number: result.invoice.invoice_number,
                    invoice_type: invoiceType,
                    date_ad: new Date().toISOString().split('T')[0],
                    date_bs: result.invoice.date_bs || '',
                    customer_name: customerMode === 'registered' ? selectedCustomer?.name : (manualCustomerName || 'Walk-in Customer'),
                    customer_pan: customerMode === 'registered' ? selectedCustomer?.pan_number || undefined : manualCustomerPan || undefined,
                    customer_tax_type: customerMode === 'registered' ? selectedCustomer?.tax_type as any : (manualCustomerPan ? (invoiceType as any) : undefined),
                    subtotal,
                    tax_amount: tax,
                    total_amount: total,
                    payment_mode: paymentMethod.charAt(0).toUpperCase() + paymentMethod.slice(1),
                    items: cart.map(i => ({
                        product_name: i.product_name,
                        quantity: i.quantity,
                        unit_price: i.unit_price
                    }))
                };

                setLastInvoice({ number: result.invoice.invoice_number, total, data: invData });
                printInvoicePDF(invData);
            } catch (err) {
                console.error('Error generating/printing invoice:', err);
                toast.error('Sale completed, but invoice preview failed');
            }

            setCart([]);
            setCustomerId('');
            setCustomerMode('walkin');
            setAmountPaid(0);
            setManualCustomerName('');
            setManualCustomerPan('');
        } catch (error) {
            console.error('POS Checkout Critical Error:', error);
            toast.error('A critical error occurred. Please refresh the page.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="animate-fade-in-up" style={{ display: 'grid', gridTemplateColumns: '1fr 380px', gap: 20, height: 'calc(100vh - 64px)' }}>

            {/* Left: Products */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16, overflow: 'hidden' }}>
                <div className="page-header" style={{ marginBottom: 0 }}>
                    <h1 className="page-title">{organization?.preferred_language === 'np' ? 'POS — बिक्री' : 'POS — Sales'}</h1>
                    <p className="page-subtitle">{organization?.preferred_language === 'np' ? 'बिक्री केन्द्र' : 'Point of Sale'}</p>
                </div>
                <div style={{ position: 'relative' }}>
                    <Search size={15} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                    <input className="glass-input" style={{ paddingLeft: 36 }} placeholder="Search products..." value={search} onChange={e => setSearch(e.target.value)} />
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(175px, 1fr))', gap: 12, overflowY: 'auto', paddingBottom: 8 }}>
                    {filteredProducts.map(p => (
                        <button key={p.id} onClick={() => addToCart(p)} disabled={p.stock_quantity === 0}
                            className="glass-card"
                            style={{ padding: 16, textAlign: 'left', cursor: p.stock_quantity === 0 ? 'not-allowed' : 'pointer', border: 'none', opacity: p.stock_quantity === 0 ? 0.5 : 1, transition: 'all 0.2s' }}>
                            <div style={{ fontSize: '0.9375rem', fontWeight: 600, marginBottom: 6 }}>{p.name}</div>
                            <div style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--brand-primary)', marginBottom: 4 }}>
                                {organization?.preferred_language === 'np' ? 'रु' : 'Rs.'} {p.price.toLocaleString()}
                            </div>
                            <div style={{ fontSize: '0.75rem', color: p.stock_quantity <= 5 ? 'var(--brand-warning)' : 'var(--text-secondary)' }}>
                                {organization?.preferred_language === 'np' ? 'स्टक' : 'Stock'}: {p.stock_quantity} {p.unit}
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
                    <div className="animate-fade-in" style={{ padding: 12, borderRadius: 10, background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.25)', display: 'flex', flexDirection: 'column', gap: 10 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                            <CheckCircle size={18} color="var(--brand-success)" />
                            <div>
                                <div style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--brand-success)' }}>{lastInvoice.number} {organization?.preferred_language === 'np' ? 'सिर्जना भयो' : 'created'}</div>
                                <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                                    {organization?.preferred_language === 'np' ? 'रु' : 'Rs.'} {lastInvoice.total.toLocaleString()} {organization?.preferred_language === 'np' ? 'संकलन गरियो' : 'collected'}
                                </div>
                            </div>
                        </div>
                        <button
                            onClick={() => lastInvoice.data && printInvoicePDF(lastInvoice.data)}
                            className="glass-button"
                            style={{ padding: '6px 12px', fontSize: '0.75rem', width: '100%', justifyContent: 'center' }}
                        >
                            <Printer size={14} /> {organization?.preferred_language === 'np' ? 'बिल पुन: प्रिन्ट गर्नुहोस्' : 'Re-print Bill'}
                        </button>
                    </div>
                )}

                {/* Cart Items */}
                <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {cart.length === 0 ? (
                        <div style={{ textAlign: 'center', padding: '32px 0', color: 'var(--text-muted)' }}>
                            <ShoppingCart size={36} style={{ margin: '0 auto 10px', opacity: 0.3 }} />
                            <p style={{ fontSize: '0.875rem' }}>{organization?.preferred_language === 'np' ? 'थप्नको लागि उत्पादनहरू क्लिक गर्नुहोस्' : 'Click products to add'}</p>
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
                                <span style={{ fontWeight: 600, fontSize: '0.875rem' }}>
                                    {organization?.preferred_language === 'np' ? 'रु' : 'Rs.'} {(item.unit_price * item.quantity).toLocaleString()}
                                </span>
                                <button onClick={() => removeFromCart(item.product_id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--brand-danger)', padding: 4 }}><Trash2 size={14} /></button>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Invoice Options */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10, borderTop: '1px solid var(--glass-border)', paddingTop: 14 }}>
                    <div>
                        <label style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', display: 'block', marginBottom: 6 }}>
                            {organization?.preferred_language === 'np' ? 'बीजक प्रकार' : 'Invoice Type'}
                        </label>
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

                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                        <div style={{ display: 'flex', gap: 12, fontSize: '0.8125rem' }}>
                            <label style={{ display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer' }}>
                                <input type="radio" checked={customerMode === 'walkin'} onChange={() => { setCustomerMode('walkin'); setCustomerId(''); }} />
                                {organization?.preferred_language === 'np' ? 'वाक-इन ग्राहक' : 'Walk-in'}
                            </label>
                            <label style={{ display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer' }}>
                                <input type="radio" checked={customerMode === 'registered'} onChange={() => setCustomerMode('registered')} />
                                {organization?.preferred_language === 'np' ? 'पुरानो ग्राहक' : 'Existing Customer'}
                            </label>
                        </div>

                        {customerMode === 'registered' && (
                            <div style={{ position: 'relative' }}>
                                <Search size={14} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', opacity: 0.5 }} />
                                <input
                                    className="glass-input"
                                    style={{ paddingLeft: 30, fontSize: '0.8125rem' }}
                                    placeholder={organization?.preferred_language === 'np' ? 'नाम/प्यान द्वारा ग्राहक खोज्नुहोस्...' : 'Search customer by name/PAN...'}
                                    value={customerSearch}
                                    onChange={e => setCustomerSearch(e.target.value)}
                                />
                                {customerSearch && !selectedCustomer && (
                                    <div className="glass-card shadow-xl" style={{ position: 'absolute', bottom: '100%', left: 0, right: 0, zIndex: 50, maxHeight: 200, overflowY: 'auto', marginBottom: 8, padding: 4 }}>
                                        {filteredCustomers.length === 0 ? (
                                            <div style={{ padding: '8px 12px', fontSize: '0.75rem', opacity: 0.5 }}>No customers found</div>
                                        ) : filteredCustomers.map(c => (
                                            <button key={c.id} onClick={() => { setCustomerId(c.id); setCustomerSearch(''); }}
                                                style={{ display: 'block', width: '100%', padding: '8px 12px', textAlign: 'left', border: 'none', background: 'transparent', color: 'var(--text-primary)', fontSize: '0.8125rem', cursor: 'pointer', borderRadius: 6 }}
                                                className="hover:bg-white/10"
                                            >
                                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                    <span>{c.name}</span>
                                                    {c.pan_number && <span className={`badge ${c.tax_type === 'vat' ? 'badge-success' : 'badge-info'}`} style={{ fontSize: '0.625rem' }}>{c.tax_type?.toUpperCase() || 'PAN'}: {c.pan_number}</span>}
                                                </div>
                                            </button>
                                        ))}
                                    </div>
                                )}
                                {selectedCustomer && (
                                    <div style={{ marginTop: 6, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '6px 10px', background: 'rgba(79,142,247,0.1)', borderRadius: 8, border: '1px solid rgba(79,142,247,0.2)' }}>
                                        <div style={{ display: 'flex', flexDirection: 'column' }}>
                                            <span style={{ fontSize: '0.8125rem', fontWeight: 600 }}>{selectedCustomer.name}</span>
                                            {selectedCustomer.pan_number && (
                                                <span style={{ fontSize: '0.6875rem', opacity: 0.7 }}>
                                                    {selectedCustomer.tax_type?.toUpperCase() || 'PAN'}: {selectedCustomer.pan_number}
                                                </span>
                                            )}
                                        </div>
                                        <button onClick={() => setCustomerId('')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--brand-danger)' }}><Trash2 size={12} /></button>
                                    </div>
                                )}
                            </div>
                        )}

                        {customerMode === 'walkin' && (invoiceType === 'pan' || invoiceType === 'vat') && (
                            <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                                <input
                                    className="glass-input"
                                    style={{ fontSize: '0.8125rem' }}
                                    placeholder={organization?.preferred_language === 'np' ? 'ग्राहकको नाम...' : 'Customer Name (required)...'}
                                    value={manualCustomerName}
                                    onChange={e => setManualCustomerName(e.target.value)}
                                />
                                <input
                                    className="glass-input"
                                    style={{ fontSize: '0.8125rem' }}
                                    placeholder="Customer PAN/VAT # (optional)..."
                                    value={manualCustomerPan}
                                    onChange={e => setManualCustomerPan(e.target.value)}
                                />
                            </div>
                        )}
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: 10 }}>
                        <div>
                            <label style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', display: 'block', marginBottom: 6 }}>
                                {organization?.preferred_language === 'np' ? 'भुक्तानी विधि' : 'Payment Method'}
                            </label>
                            <select value={paymentMethod} onChange={e => setPaymentMethod(e.target.value)} className="glass-input" style={{ cursor: 'pointer' }}>
                                <option value="cash">Cash</option>
                                <option value="esewa">eSewa</option>
                                <option value="khalti">Khalti</option>
                                <option value="ime_pay">IME Pay</option>
                                <option value="bank_transfer">Bank Transfer</option>
                                <option value="credit">Credit / Unpaid</option>
                            </select>
                        </div>
                        <div>
                            <label style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', display: 'block', marginBottom: 6 }}>
                                {organization?.preferred_language === 'np' ? 'भुक्तान गरिएको रु' : 'Amount Paid Rs.'}
                            </label>
                            <input
                                type="number"
                                min="0"
                                className="glass-input"
                                value={amountPaid}
                                onChange={e => setAmountPaid(parseFloat(e.target.value) || 0)}
                                onFocus={(e) => { if (amountPaid === 0) setAmountPaid(total); }}
                            />
                        </div>
                    </div>

                    {/* Totals & Status */}
                    <div style={{ borderTop: '1px solid var(--glass-border)', paddingTop: 12, display: 'flex', flexDirection: 'column', gap: 6 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                            <span>{organization?.preferred_language === 'np' ? 'कुल रकम' : 'Total Amount'}</span>
                            <span>{organization?.preferred_language === 'np' ? 'रु' : 'Rs.'} {total.toLocaleString()}</span>
                        </div>

                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem' }}>
                            <span style={{ color: 'var(--text-secondary)' }}>Status</span>
                            <span className={`badge ${getPaymentStatus() === 'paid' ? 'badge-success' :
                                getPaymentStatus() === 'partial' ? 'badge-warning' : 'badge-danger'
                                }`}>
                                {getPaymentStatus().toUpperCase()}
                            </span>
                        </div>

                        {getPaymentStatus() !== 'paid' && (
                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem', color: 'var(--brand-danger)', fontWeight: 600 }}>
                                <span>Due Amount</span><span>रु {(total - amountPaid).toLocaleString()}</span>
                            </div>
                        )}

                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1.125rem', fontWeight: 700, marginTop: 4, color: 'var(--brand-primary)' }}>
                            <span>{organization?.preferred_language === 'np' ? 'भुक्तान गरियो' : 'Paid'}</span>
                            <span>{organization?.preferred_language === 'np' ? 'रु' : 'Rs.'} {amountPaid.toLocaleString()}</span>
                        </div>
                    </div>

                    <button onClick={handleCheckout} disabled={loading || cart.length === 0} className="glass-button glass-button-primary" style={{ justifyContent: 'center', padding: 14, fontSize: '1rem' }}>
                        {loading ? (organization?.preferred_language === 'np' ? 'प्रक्रिया चल्दैछ...' : 'Processing...') : <><Receipt size={18} /> {organization?.preferred_language === 'np' ? 'बिक्री पूरा गर्नुहोस्' : 'Complete Sale'}</>}
                    </button>
                </div>
            </div>
        </div>
    );
}
