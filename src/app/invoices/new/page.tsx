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
    quantity: number;
    price: number;
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
    const [paidAmount, setPaidAmount] = useState(0);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [status, setStatus] = useState<'paid' | 'partial' | 'unpaid'>('unpaid');
    const [productSearch, setProductSearch] = useState('');
    const [isWalkIn, setIsWalkIn] = useState(false);

    const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

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

    const updateItemQty = (index: number, qty: number) => {
        const updated = [...items];
        updated[index].quantity = Math.max(1, Math.min(qty, updated[index].max_qty));
        setItems(updated);
    };

    const updateItemPrice = (index: number, price: number) => {
        const updated = [...items];
        updated[index].price = Math.max(0, price);
        setItems(updated);
    };

    const remaining = Math.max(0, total - paidAmount);

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

        setLoading(true);
        setError('');

        try {
            const result = await createInvoice({
                customer_id: isWalkIn ? null : selectedCustomer,
                items: items.map((i) => ({
                    product_id: i.product_id,
                    quantity: i.quantity,
                    price: i.price,
                })),
                paid_amount: paidAmount,
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
                    <button onClick={() => router.back()} className="p-3 rounded-2xl bg-brand-card border border-brand-border text-surface-muted hover:text-brand-primary hover:border-brand-primary transition-all active:scale-95">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                        </svg>
                    </button>
                    <div>
                        <h1 className="text-3xl font-poppins font-bold text-surface-primary tracking-tight">Create Invoice</h1>
                        <p className="text-surface-muted text-sm font-medium">Drafting a new transaction for StockSewa</p>
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
                    <div className="card p-6">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                            <h2 className="text-xs font-black text-brand-primary uppercase tracking-[0.2em]">Billing Details</h2>
                            <label className="flex items-center gap-3 cursor-pointer group bg-brand-background px-4 py-2 rounded-xl border border-brand-border hover:border-brand-primary/30 transition-all">
                                <input
                                    type="checkbox"
                                    checked={isWalkIn}
                                    onChange={(e) => setIsWalkIn(e.target.checked)}
                                    className="w-5 h-5 rounded-lg border-brand-border bg-brand-dark text-brand-primary focus:ring-brand-primary/20"
                                />
                                <span className="text-sm font-bold text-surface-secondary group-hover:text-surface-primary transition-colors">Walk-in / Cash Sale</span>
                            </label>
                        </div>

                        {!isWalkIn && (
                            <select
                                value={selectedCustomer}
                                onChange={(e) => setSelectedCustomer(e.target.value)}
                                className="input-field animate-fade-in"
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
                            <div className="p-4 bg-brand-primary/5 rounded-2xl border border-brand-primary/10 animate-fade-in flex items-center gap-4">
                                <div className="w-10 h-10 bg-brand-primary/10 rounded-xl flex items-center justify-center text-xl shadow-inner">
                                    🛍️
                                </div>
                                <p className="text-sm text-surface-secondary font-medium">
                                    Recording as a <strong className="text-brand-primary">Walk-in Customer</strong>. Name will not be required for this transaction.
                                </p>
                            </div>
                        )}
                    </div>

                    {/* Product Search & Add */}
                    <div className="card p-6">
                        <h2 className="text-xs font-black text-brand-primary uppercase tracking-[0.2em] mb-4">Stock Selection</h2>
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
                                className="input-field pl-12 py-3.5"
                            />
                        </div>
                        {productSearch && filteredProducts.length > 0 && (
                            <div className="mt-4 border border-brand-border rounded-2xl max-h-64 overflow-y-auto divide-y divide-brand-border bg-brand-dark shadow-2xl">
                                {filteredProducts.slice(0, 10).map((product) => (
                                    <button
                                        key={product.id}
                                        onClick={() => addItem(product)}
                                        className="w-full flex items-center justify-between px-5 py-4 hover:bg-brand-primary/5 transition-all text-left group/item"
                                    >
                                        <div>
                                            <p className="text-sm font-bold text-surface-primary group-hover/item:text-brand-primary transition-colors">{product.name}</p>
                                            <div className="flex items-center gap-3 mt-1">
                                                <span className="text-[10px] text-surface-muted font-mono uppercase tracking-widest bg-brand-card px-1.5 py-0.5 rounded border border-brand-border">
                                                    {product.barcode || 'NO-BARCODE'}
                                                </span>
                                                <span className={`text-[10px] font-bold uppercase ${product.stock_quantity <= 5 ? 'text-status-danger' : 'text-brand-secondary'}`}>
                                                    Stock: {product.stock_quantity}
                                                </span>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <span className="text-sm font-black text-brand-primary">{formatCurrency(product.price)}</span>
                                            <div className="text-[10px] text-surface-muted font-bold mt-0.5 group-hover/item:text-surface-secondary opacity-0 group-hover/item:opacity-100 transition-all">
                                                Click to add
                                            </div>
                                        </div>
                                    </button>
                                ))}
                            </div>
                        )}
                        {productSearch && filteredProducts.length === 0 && (
                            <div className="mt-4 p-8 bg-brand-dark rounded-2xl border border-brand-border text-center">
                                <span className="text-3xl mb-3 block">🔍</span>
                                <p className="text-sm text-surface-muted font-medium">No inventory matches your search</p>
                            </div>
                        )}
                    </div>

                    {/* Line Items */}
                    {items.length > 0 && (
                        <div className="card overflow-hidden">
                            <div className="px-6 py-4 bg-brand-teal/10 border-b border-brand-border flex items-center justify-between">
                                <h2 className="text-xs font-black text-brand-primary uppercase tracking-[0.2em]">Item List</h2>
                                <span className="text-[10px] font-bold text-surface-muted">{items.length} Product(s)</span>
                            </div>
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead>
                                        <tr className="border-b border-brand-border bg-brand-dark/30">
                                            <th className="text-left px-6 py-3 text-[10px] font-black text-surface-muted uppercase tracking-wider">Product Description</th>
                                            <th className="text-center px-6 py-3 text-[10px] font-black text-surface-muted uppercase tracking-wider w-28">Quantity</th>
                                            <th className="text-center px-6 py-3 text-[10px] font-black text-surface-muted uppercase tracking-wider w-36">Rate</th>
                                            <th className="text-right px-6 py-3 text-[10px] font-black text-surface-muted uppercase tracking-wider">Line Total</th>
                                            <th className="w-14"></th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-brand-border/50">
                                        {items.map((item, idx) => (
                                            <tr key={idx} className="animate-fade-in hover:bg-brand-teal/5 transition-colors group">
                                                <td className="px-6 py-4">
                                                    <div className="text-sm font-bold text-surface-primary">{item.product_name}</div>
                                                    <div className="text-[10px] text-surface-muted font-mono mt-0.5">VAT EXCLUSIVE</div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center justify-center">
                                                        <input
                                                            type="number"
                                                            min={1}
                                                            max={item.max_qty}
                                                            value={item.quantity}
                                                            onChange={(e) => updateItemQty(idx, parseInt(e.target.value) || 1)}
                                                            className="input-field w-16 px-1 h-9 bg-brand-background text-sm text-center border-brand-border focus:border-brand-primary"
                                                        />
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center justify-center">
                                                        <input
                                                            type="number"
                                                            min={0}
                                                            step="0.01"
                                                            value={item.price}
                                                            onChange={(e) => updateItemPrice(idx, parseFloat(e.target.value) || 0)}
                                                            className="input-field w-24 px-2 h-9 bg-brand-background text-sm text-center border-brand-border focus:border-brand-primary font-bold text-brand-primary"
                                                        />
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 text-right text-sm font-black text-surface-primary">
                                                    {formatCurrency(item.price * item.quantity)}
                                                </td>
                                                <td className="px-4 py-4 text-center">
                                                    <button
                                                        onClick={() => removeItem(idx)}
                                                        className="p-2 rounded-xl bg-brand-dark border border-brand-border text-status-danger hover:bg-status-danger hover:text-white transition-all shadow-sm active:scale-95"
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
                        <div className="card p-6 sticky top-24 border-brand-primary/20 shadow-brand-primary/5">
                            <h2 className="text-xs font-black text-brand-primary uppercase tracking-[0.2em] mb-6">Order Summary</h2>

                            <div className="space-y-5">
                                <div className="flex items-center justify-between">
                                    <span className="text-sm font-bold text-surface-secondary">Grand Total</span>
                                    <span className="text-3xl font-poppins font-black text-brand-primary">{formatCurrency(total)}</span>
                                </div>

                                <div className="pt-6 border-t border-brand-border">
                                    <label className="block text-xs font-black text-surface-muted uppercase tracking-widest mb-4">Payment Status</label>
                                    <div className="flex flex-col gap-2">
                                        {(['unpaid', 'partial', 'paid'] as const).map((s) => {
                                            const isDisabled = isWalkIn && (s === 'unpaid' || s === 'partial');
                                            const isSelected = status === s;
                                            return (
                                                <button
                                                    key={s}
                                                    type="button"
                                                    onClick={() => !isDisabled && handleStatusChange(s)}
                                                    disabled={isDisabled}
                                                    className={`py-3 px-4 rounded-2xl text-xs font-black border-2 transition-all capitalize flex items-center justify-between ${isSelected
                                                        ? 'bg-brand-primary/10 border-brand-primary text-brand-primary shadow-lg shadow-brand-primary/5'
                                                        : isDisabled
                                                            ? 'bg-brand-dark/50 border-brand-border text-surface-muted/30 cursor-not-allowed'
                                                            : 'bg-brand-dark border-brand-border text-surface-muted hover:border-brand-primary/30 hover:text-surface-secondary'
                                                        }`}
                                                >
                                                    <span>{s}</span>
                                                    {isSelected && <div className="w-2 h-2 rounded-full bg-brand-primary animate-pulse" />}
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>

                                {status === 'partial' && (
                                    <div className="pt-2 animate-slide-down">
                                        <label className="block text-xs font-black text-surface-muted uppercase tracking-widest mb-3">Amount Received (Rs.)</label>
                                        <div className="relative">
                                            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-surface-muted font-bold">Rs.</span>
                                            <input
                                                type="number"
                                                min={0}
                                                max={total}
                                                step="0.01"
                                                value={paidAmount}
                                                onChange={(e) => setPaidAmount(Math.min(total, Math.max(0, parseFloat(e.target.value) || 0)))}
                                                className="input-field pl-12 font-black text-xl text-brand-primary"
                                                placeholder="0.00"
                                            />
                                        </div>
                                    </div>
                                )}

                                <div className="flex items-center justify-between py-4 px-5 bg-brand-background rounded-2xl border border-brand-border mt-6">
                                    <span className="text-[10px] font-black text-surface-muted uppercase tracking-widest">Balance Due</span>
                                    <span className={`text-lg font-black ${remaining > 0 ? 'text-status-danger' : 'text-brand-secondary'}`}>
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
                        <div className="card p-10 border-dashed border-brand-border bg-transparent flex flex-col items-center justify-center text-center">
                            <div className="w-20 h-20 bg-brand-card rounded-3xl flex items-center justify-center text-4xl mb-6 shadow-xl border border-brand-border">
                                🛒
                            </div>
                            <h3 className="text-lg font-bold text-surface-primary mb-2">Cart is Empty</h3>
                            <p className="text-sm text-surface-muted max-w-[200px]">Add products from the left to start billing.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
