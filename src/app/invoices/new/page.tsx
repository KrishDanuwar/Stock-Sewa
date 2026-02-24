'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Plus } from 'lucide-react';
import { createInvoice } from '@/lib/actions/invoices';
import { supabase } from '@/lib/supabase';

interface Product {
    id: string;
    name: string;
    price: number;
    stock_quantity: number;
    barcode: string;
}

interface Customer {
    id: string;
    name: string;
    phone: string;
}

interface LineItem {
    product_id: string;
    product_name: string;
    quantity: number | string;
    price: number | string;
    max_qty: number;
}

function formatCurrency(amount: number) {
    return `Rs. ${amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`;
}

export default function NewInvoicePage() {
    const router = useRouter();
    const [customers, setCustomers] = useState<Customer[]>([]);
    const [products, setProducts] = useState<Product[]>([]);
    const [selectedCustomer, setSelectedCustomer] = useState('');
    const [items, setItems] = useState<LineItem[]>([]);
    const [paidAmount, setPaidAmount] = useState<number | string>(0);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [status, setStatus] = useState<'paid' | 'partial' | 'unpaid'>('unpaid');
    const [productSearch, setProductSearch] = useState('');
    const [isWalkIn, setIsWalkIn] = useState(false);

    const total = items.reduce((sum, item) => sum + (Number(item.price) || 0) * (Number(item.quantity) || 0), 0);

    useEffect(() => {
        if (isWalkIn) {
            setSelectedCustomer('');
            setStatus('paid');
            setPaidAmount(total);
        }
    }, [isWalkIn, total]);

    useEffect(() => {
        const loadData = async () => {
            try {
                const { data: custs } = await supabase.from('customers').select('id, name, phone').order('name');
                const { data: prods } = await supabase
                    .from('products')
                    .select('id, name, price, stock_quantity, barcode')
                    .gt('stock_quantity', 0)
                    .order('name');
                setCustomers(custs || []);
                setProducts(prods || []);
            } catch (e) {
                // Supabase not configured
            }
        };
        loadData();
    }, []);

    const filteredProducts = products.filter(
        (p) =>
            !items.some((i) => i.product_id === p.id) &&
            (p.name.toLowerCase().includes(productSearch.toLowerCase()) ||
                (p.barcode && p.barcode.toLowerCase().includes(productSearch.toLowerCase())))
    );

    const addItem = (product: Product) => {
        setItems([
            ...items,
            {
                product_id: product.id,
                product_name: product.name,
                quantity: 1,
                price: product.price,
                max_qty: product.stock_quantity,
            },
        ]);
        setProductSearch('');
    };

    const removeItem = (index: number) => {
        setItems(items.filter((_, i) => i !== index));
    };

    const updateItemQty = (index: number, val: string) => {
        const updated = [...items];
        if (val === '') {
            updated[index].quantity = '';
        } else {
            const num = parseInt(val);
            updated[index].quantity = isNaN(num) ? '' : Math.max(1, Math.min(num, updated[index].max_qty));
        }
        setItems(updated);
    };

    const updateItemPrice = (index: number, val: string) => {
        const updated = [...items];
        if (val === '') {
            updated[index].price = '';
        } else {
            const num = parseFloat(val);
            updated[index].price = isNaN(num) ? '' : Math.max(0, num);
        }
        setItems(updated);
    };

    const remaining = Math.max(0, total - (Number(paidAmount) || 0));

    const handleStatusChange = (newStatus: 'paid' | 'partial' | 'unpaid') => {
        setStatus(newStatus);
        if (newStatus === 'paid') {
            setPaidAmount(total);
        } else if (newStatus === 'unpaid') {
            setPaidAmount(0);
        }
    };

    const handleSubmit = async () => {
        if (!isWalkIn && !selectedCustomer) {
            setError('Please select a customer or mark as Walk-in');
            return;
        }
        if (items.length === 0) {
            setError('Please add at least one product');
            return;
        }

        // Validate line items
        for (const item of items) {
            if (item.quantity === '' || Number(item.quantity) <= 0) {
                setError(`Please enter a valid quantity for ${item.product_name}`);
                return;
            }
            if (item.price === '' || Number(item.price) < 0) {
                setError(`Please enter a valid price for ${item.product_name}`);
                return;
            }
        }

        setLoading(true);
        setError('');

        try {
            const result = await createInvoice({
                customer_id: isWalkIn ? null : selectedCustomer,
                items: items.map((i) => ({
                    product_id: i.product_id,
                    quantity: Number(i.quantity),
                    price: Number(i.price),
                })),
                paid_amount: Number(paidAmount) || 0,
            });

            if (result.success) {
                router.push(`/invoices/${result.id}`);
            } else if (result.error) {
                setError(result.error);
            }
        } catch (err: any) {
            setError(err.message || 'Failed to create invoice');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-6xl mx-auto animate-fade-in p-4 xl:p-0">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
                <div className="flex items-center gap-4">
                    <button onClick={() => router.back()} className="p-3.5 rounded-2xl bg-white border border-gray-100 text-surface-muted hover:text-brand-primary hover:border-brand-primary transition-all active:scale-90 shadow-sm">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
                        </svg>
                    </button>
                    <div>
                        <h1 className="text-3xl font-poppins font-black text-surface-primary tracking-tight">Generate Invoice</h1>
                        <p className="text-surface-muted text-sm font-black uppercase tracking-widest opacity-60">System Context: G.K Paints POS</p>
                    </div>
                </div>
                {items.length > 0 && (
                    <button
                        onClick={handleSubmit}
                        disabled={loading}
                        className="btn-primary px-10 py-3 hidden md:flex active:scale-95"
                    >
                        {loading ? 'Processing...' : 'Complete Sale'}
                    </button>
                )}
            </div>

            {error && (
                <div className="p-4 bg-status-danger/10 border border-status-danger/20 rounded-2xl text-sm text-status-danger mb-6 flex items-center gap-3 animate-slide-up">
                    <span className="text-xl">⚠️</span>
                    <span className="font-bold">{error}</span>
                </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                <div className="lg:col-span-8 space-y-6">
                    {/* Customer Selection */}
                    <div className="card p-8 shadow-sm">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
                            <h2 className="text-xs font-black text-brand-primary uppercase tracking-[0.3em]">Billing Entity</h2>
                            <label className="flex items-center gap-3 cursor-pointer group bg-gray-50 px-5 py-2.5 rounded-2xl border border-gray-100 hover:border-brand-primary/30 transition-all shadow-inner">
                                <input
                                    type="checkbox"
                                    checked={isWalkIn}
                                    onChange={(e) => setIsWalkIn(e.target.checked)}
                                    className="w-5 h-5 rounded-lg border-gray-200 bg-white text-brand-primary focus:ring-brand-primary/20"
                                />
                                <span className="text-sm font-black text-surface-secondary group-hover:text-surface-primary transition-colors uppercase tracking-widest text-[10px]">Walk-in / Cash Sale</span>
                            </label>
                        </div>

                        {!isWalkIn && (
                            <select
                                value={selectedCustomer}
                                onChange={(e) => setSelectedCustomer(e.target.value)}
                                className="input-field animate-fade-in bg-white"
                            >
                                <option value="">Select a customer...</option>
                                {customers.map((c) => (
                                    <option key={c.id} value={c.id}>
                                        {c.name} {c.phone ? `(${c.phone})` : ''}
                                    </option>
                                ))}
                            </select>
                        )}

                        {isWalkIn && (
                            <div className="p-5 bg-emerald-50 rounded-2xl border border-emerald-100 animate-fade-in flex items-center gap-4">
                                <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center text-2xl shadow-sm border border-emerald-50">
                                    🛍️
                                </div>
                                <p className="text-sm text-emerald-800 font-medium leading-relaxed">
                                    Recording as a <strong className="text-emerald-950 font-black">Walk-in Customer</strong>. No permanent record will be created for this visitor.
                                </p>
                            </div>
                        )}
                    </div>

                    {/* Product Search & Add */}
                    <div className="card p-8 shadow-sm">
                        <h2 className="text-xs font-black text-brand-primary uppercase tracking-[0.3em] mb-6">Inventory Access</h2>
                        <div className="relative group">
                            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-surface-muted group-focus-within:text-brand-primary transition-colors">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                </svg>
                            </div>
                            <input
                                type="text"
                                value={productSearch}
                                onChange={(e) => setProductSearch(e.target.value)}
                                placeholder="Find products by name, barcode, or SKU..."
                                className="input-field pl-12 py-4 shadow-sm bg-white"
                            />
                        </div>
                        {productSearch && filteredProducts.length > 0 && (
                            <div className="mt-4 border border-gray-100 rounded-2xl max-h-72 overflow-y-auto divide-y divide-gray-50 bg-white shadow-2xl relative z-10 ring-1 ring-gray-100">
                                {filteredProducts.slice(0, 10).map((product) => (
                                    <button
                                        key={product.id}
                                        onClick={() => addItem(product)}
                                        className="w-full flex items-center justify-between px-6 py-4 hover:bg-brand-primary/5 transition-all text-left group/item"
                                    >
                                        <div>
                                            <p className="text-sm font-black text-surface-primary group-hover/item:text-brand-primary transition-colors">{product.name}</p>
                                            <div className="flex items-center gap-3 mt-1.5">
                                                <span className="text-[10px] text-surface-muted font-mono font-black uppercase tracking-widest bg-gray-50 px-2 py-0.5 rounded border border-gray-100">
                                                    {product.barcode || 'NO-BARCODE'}
                                                </span>
                                                <span className={`text-[10px] font-black uppercase tracking-tighter ${product.stock_quantity <= 5 ? 'text-status-danger' : 'text-emerald-500'}`}>
                                                    Stock: {product.stock_quantity}
                                                </span>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <span className="text-sm font-black text-brand-primary">{formatCurrency(product.price)}</span>
                                            <div className="text-[10px] text-surface-muted font-black mt-1 group-hover/item:text-brand-primary opacity-0 group-hover/item:opacity-100 transition-all uppercase tracking-widest">
                                                Add Item +
                                            </div>
                                        </div>
                                    </button>
                                ))}
                            </div>
                        )}
                        {productSearch && filteredProducts.length === 0 && (
                            <div className="mt-4 p-10 bg-gray-50 rounded-2xl border border-gray-100 text-center animate-fade-in">
                                <span className="text-4xl mb-4 block">🔍</span>
                                <p className="text-sm text-surface-muted font-bold">No inventory matches your search</p>
                            </div>
                        )}
                    </div>

                    {/* Line Items */}
                    {items.length > 0 && (
                        <div className="card overflow-hidden shadow-sm">
                            <div className="px-8 py-5 bg-gray-50 border-b border-gray-100 flex items-center justify-between">
                                <h2 className="text-xs font-black text-brand-primary uppercase tracking-[0.3em]">Itemized List</h2>
                                <span className="text-[10px] font-black text-surface-muted uppercase tracking-widest">{items.length} Product(s)</span>
                            </div>
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead>
                                        <tr className="border-b border-gray-100 bg-gray-50/50">
                                            <th className="text-left px-8 py-4 text-[10px] font-black text-surface-muted uppercase tracking-[0.2em]">Product Description</th>
                                            <th className="text-center px-8 py-4 text-[10px] font-black text-surface-muted uppercase tracking-[0.2em] w-32">Qty</th>
                                            <th className="text-center px-8 py-4 text-[10px] font-black text-surface-muted uppercase tracking-[0.2em] w-40">Rate</th>
                                            <th className="text-right px-8 py-4 text-[10px] font-black text-surface-muted uppercase tracking-[0.2em]">Total</th>
                                            <th className="w-16"></th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100">
                                        {items.map((item, idx) => (
                                            <tr key={idx} className="animate-fade-in hover:bg-gray-50 transition-colors group">
                                                <td className="px-8 py-5">
                                                    <div className="text-sm font-black text-surface-primary">{item.product_name}</div>
                                                    <div className="text-[10px] text-surface-muted font-black tracking-widest mt-1 opacity-70">VAT EXEMPT</div>
                                                </td>
                                                <td className="px-8 py-5 text-center">
                                                    <input
                                                        type="number"
                                                        min={1}
                                                        max={item.max_qty}
                                                        value={item.quantity}
                                                        onChange={(e) => updateItemQty(idx, e.target.value)}
                                                        className="input-field w-16 px-1 h-10 bg-white text-sm text-center font-bold border-gray-200 focus:border-brand-primary/50 shadow-inner"
                                                    />
                                                </td>
                                                <td className="px-8 py-5 text-center">
                                                    <input
                                                        type="number"
                                                        min={0}
                                                        step="0.01"
                                                        value={item.price}
                                                        onChange={(e) => updateItemPrice(idx, e.target.value)}
                                                        className="input-field w-28 px-2 h-10 bg-white text-sm text-center border-gray-200 focus:border-brand-primary/50 font-black text-brand-primary shadow-inner"
                                                    />
                                                </td>
                                                <td className="px-8 py-5 text-right text-sm font-black text-surface-primary">
                                                    {formatCurrency((Number(item.price) || 0) * (Number(item.quantity) || 0))}
                                                </td>
                                                <td className="px-6 py-5 text-center">
                                                    <button
                                                        onClick={() => removeItem(idx)}
                                                        className="w-9 h-9 rounded-xl bg-white border border-gray-200 text-status-danger hover:bg-status-danger hover:text-white transition-all shadow-sm active:scale-90 flex items-center justify-center"
                                                        title="Remove item"
                                                    >
                                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                                        </svg>
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}

                </div>

                {/* Right Column: Payment & Summary */}
                <div className="lg:col-span-4 space-y-6">
                    {items.length > 0 && (
                        <div className="card p-8 sticky top-24 border-brand-primary/20 bg-white shadow-2xl shadow-gray-200/50 ring-1 ring-brand-primary/5">
                            <h2 className="text-xs font-black text-brand-primary uppercase tracking-[0.3em] mb-8">Financial Summary</h2>

                            <div className="space-y-6">
                                <div className="flex items-center justify-between">
                                    <span className="text-sm font-black text-surface-secondary uppercase tracking-widest text-[10px]">Grand Total</span>
                                    <span className="text-4xl font-poppins font-black text-brand-primary tracking-tighter">{formatCurrency(total)}</span>
                                </div>

                                <div className="pt-8 border-t border-gray-100">
                                    <label className="block text-[10px] font-black text-surface-muted uppercase tracking-[0.3em] mb-5 opacity-70">Settlement Status</label>
                                    <div className="flex flex-col gap-3">
                                        {(['unpaid', 'partial', 'paid'] as const).map((s) => {
                                            const isDisabled = isWalkIn && (s === 'unpaid' || s === 'partial');
                                            const isSelected = status === s;
                                            return (
                                                <button
                                                    key={s}
                                                    type="button"
                                                    onClick={() => !isDisabled && handleStatusChange(s)}
                                                    disabled={isDisabled}
                                                    className={`py-4 px-6 rounded-2xl text-[10px] font-black border-2 transition-all uppercase tracking-widest flex items-center justify-between ${isSelected
                                                        ? 'bg-brand-primary/5 border-brand-primary text-brand-primary shadow-lg shadow-brand-primary/10'
                                                        : isDisabled
                                                            ? 'bg-gray-50 border-gray-100 text-surface-muted/30 cursor-not-allowed opacity-50'
                                                            : 'bg-white border-gray-100 text-surface-muted hover:border-brand-primary/30 hover:text-brand-primary hover:shadow-md'
                                                        }`}
                                                >
                                                    <span>{s}</span>
                                                    {isSelected && <div className="w-2.5 h-2.5 rounded-full bg-brand-primary animate-pulse" />}
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>

                                {status === 'partial' && (
                                    <div className="pt-4 animate-slide-down">
                                        <label className="block text-[10px] font-black text-surface-muted uppercase tracking-[0.3em] mb-4 opacity-70">Payment Received</label>
                                        <div className="relative group">
                                            <span className="absolute left-5 top-1/2 -translate-y-1/2 text-surface-muted font-black text-sm group-focus-within:text-brand-primary transition-colors">Rs.</span>
                                            <input
                                                type="number"
                                                min={0}
                                                max={total}
                                                step="0.01"
                                                value={paidAmount}
                                                onChange={(e) => {
                                                    const val = e.target.value;
                                                    setPaidAmount(val === '' ? '' : Math.min(total, Math.max(0, parseFloat(val))));
                                                }}
                                                className="input-field pl-14 py-4 font-black text-2xl text-brand-primary bg-gray-50/50 border-gray-200 focus:bg-white"
                                                placeholder="0.00"
                                            />
                                        </div>
                                    </div>
                                )}

                                <div className="flex items-center justify-between py-5 px-6 bg-gray-50 rounded-[1.5rem] border border-gray-100 mt-8 shadow-inner">
                                    <span className="text-[10px] font-black text-surface-muted uppercase tracking-[0.3em] opacity-70">Receivable</span>
                                    <span className={`text-xl font-black ${remaining > 0 ? 'text-status-danger' : 'text-emerald-500'}`}>
                                        {formatCurrency(remaining)}
                                    </span>
                                </div>
                            </div>

                            <button
                                onClick={handleSubmit}
                                disabled={loading}
                                className="btn-primary w-full mt-10 py-4 text-lg shadow-2xl active:scale-95 disabled:grayscale"
                            >
                                {loading ? (
                                    <>
                                        <div className="w-5 h-5 border-3 border-brand-dark border-t-transparent rounded-full animate-spin" />
                                        Finalizing...
                                    </>
                                ) : (
                                    <>
                                        <Plus size={20} />
                                        Complete Sale
                                    </>
                                )}
                            </button>

                            <p className="text-[10px] text-center text-surface-muted font-bold uppercase tracking-widest mt-6">
                                Secure Checkout System
                            </p>
                        </div>
                    )}

                    {items.length === 0 && (
                        <div className="card p-16 border-dashed border-2 border-gray-100 bg-white flex flex-col items-center justify-center text-center shadow-2xl shadow-gray-200/40 relative overflow-hidden group">
                            <div className="absolute inset-0 bg-gray-50/50 opacity-0 group-hover:opacity-100 transition-opacity" />
                            <div className="w-24 h-24 bg-gray-50 rounded-[2rem] flex items-center justify-center text-5xl mb-8 shadow-inner border border-gray-100 group-hover:scale-110 transition-transform relative z-10">
                                🛒
                            </div>
                            <h3 className="text-xl font-black text-surface-primary mb-3 relative z-10 uppercase tracking-widest">Cart is Empty</h3>
                            <p className="text-sm text-surface-muted max-w-[240px] leading-relaxed relative z-10 font-medium">Select products from the catalog to build your transaction summary.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
