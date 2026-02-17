'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
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
    const [productSearch, setProductSearch] = useState('');

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

    const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const remaining = Math.max(0, total - paidAmount);

    const handleSubmit = async () => {
        if (!selectedCustomer) {
            setError('Please select a customer');
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
                customer_id: selectedCustomer,
                items: items.map((i) => ({
                    product_id: i.product_id,
                    quantity: i.quantity,
                    price: i.price,
                })),
                paid_amount: paidAmount,
            });

            if (result.success) {
                router.push(`/invoices/${result.id}`);
            }
        } catch (err: any) {
            setError(err.message || 'Failed to create invoice');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto animate-fade-in">
            <div className="flex items-center gap-3 mb-6">
                <button onClick={() => router.back()} className="p-2 rounded-lg hover:bg-surface-100 transition-colors">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                </button>
                <h1 className="page-header mb-0">New Invoice</h1>
            </div>

            {error && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700 mb-4">{error}</div>
            )}

            <div className="space-y-6">
                {/* Customer Selection */}
                <div className="card p-5">
                    <h2 className="text-sm font-semibold text-surface-700 uppercase tracking-wider mb-3">Customer</h2>
                    <select
                        value={selectedCustomer}
                        onChange={(e) => setSelectedCustomer(e.target.value)}
                        className="input-field"
                    >
                        <option value="">Select a customer...</option>
                        {customers.map((c) => (
                            <option key={c.id} value={c.id}>
                                {c.name} {c.phone ? `(${c.phone})` : ''}
                            </option>
                        ))}
                    </select>
                </div>

                {/* Product Search & Add */}
                <div className="card p-5">
                    <h2 className="text-sm font-semibold text-surface-700 uppercase tracking-wider mb-3">Add Products</h2>
                    <input
                        type="text"
                        value={productSearch}
                        onChange={(e) => setProductSearch(e.target.value)}
                        placeholder="Search products by name or barcode..."
                        className="input-field mb-3"
                    />
                    {productSearch && filteredProducts.length > 0 && (
                        <div className="border border-surface-200 rounded-lg max-h-48 overflow-y-auto divide-y divide-surface-100">
                            {filteredProducts.slice(0, 10).map((product) => (
                                <button
                                    key={product.id}
                                    onClick={() => addItem(product)}
                                    className="w-full flex items-center justify-between px-4 py-2.5 hover:bg-surface-50 transition-colors text-left"
                                >
                                    <div>
                                        <p className="text-sm font-medium text-surface-900">{product.name}</p>
                                        <p className="text-xs text-surface-500">
                                            {product.barcode && `${product.barcode} · `}Stock: {product.stock_quantity}
                                        </p>
                                    </div>
                                    <span className="text-sm font-medium text-primary-600">{formatCurrency(product.price)}</span>
                                </button>
                            ))}
                        </div>
                    )}
                    {productSearch && filteredProducts.length === 0 && (
                        <p className="text-sm text-surface-400 text-center py-3">No products found</p>
                    )}
                </div>

                {/* Line Items */}
                {items.length > 0 && (
                    <div className="card overflow-hidden">
                        <div className="px-5 py-3 bg-surface-50 border-b border-surface-200">
                            <h2 className="text-sm font-semibold text-surface-700 uppercase tracking-wider">Invoice Items</h2>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="border-b border-surface-100">
                                        <th className="text-left px-5 py-2.5 text-xs font-medium text-surface-500 uppercase">Product</th>
                                        <th className="text-center px-5 py-2.5 text-xs font-medium text-surface-500 uppercase w-28">Qty</th>
                                        <th className="text-center px-5 py-2.5 text-xs font-medium text-surface-500 uppercase w-36">Price</th>
                                        <th className="text-right px-5 py-2.5 text-xs font-medium text-surface-500 uppercase">Subtotal</th>
                                        <th className="w-12"></th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-surface-100">
                                    {items.map((item, idx) => (
                                        <tr key={idx} className="animate-fade-in">
                                            <td className="px-5 py-3 text-sm font-medium text-surface-900">{item.product_name}</td>
                                            <td className="px-5 py-3 text-center">
                                                <input
                                                    type="number"
                                                    min={1}
                                                    max={item.max_qty}
                                                    value={item.quantity}
                                                    onChange={(e) => updateItemQty(idx, parseInt(e.target.value) || 1)}
                                                    className="input-field w-20 text-center mx-auto"
                                                />
                                            </td>
                                            <td className="px-5 py-3 text-center">
                                                <input
                                                    type="number"
                                                    min={0}
                                                    step="0.01"
                                                    value={item.price}
                                                    onChange={(e) => updateItemPrice(idx, parseFloat(e.target.value) || 0)}
                                                    className="input-field w-28 text-center mx-auto"
                                                />
                                            </td>
                                            <td className="px-5 py-3 text-right text-sm font-medium text-surface-900">
                                                {formatCurrency(item.price * item.quantity)}
                                            </td>
                                            <td className="px-3 py-3">
                                                <button
                                                    onClick={() => removeItem(idx)}
                                                    className="p-1 rounded hover:bg-red-50 text-red-500 transition-colors"
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

                {/* Payment & Summary */}
                {items.length > 0 && (
                    <div className="card p-5">
                        <div className="space-y-3">
                            <div className="flex items-center justify-between text-sm">
                                <span className="text-surface-600">Total Amount</span>
                                <span className="text-xl font-bold text-surface-900">{formatCurrency(total)}</span>
                            </div>
                            <div className="pt-3 border-t border-surface-200">
                                <label className="block text-sm font-medium text-surface-700 mb-1">Payment Amount</label>
                                <input
                                    type="number"
                                    min={0}
                                    max={total}
                                    step="0.01"
                                    value={paidAmount}
                                    onChange={(e) => setPaidAmount(Math.min(total, Math.max(0, parseFloat(e.target.value) || 0)))}
                                    className="input-field"
                                    placeholder="0.00"
                                />
                            </div>
                            <div className="flex items-center justify-between text-sm pt-2">
                                <span className="text-surface-600">Remaining</span>
                                <span className={`text-lg font-bold ${remaining > 0 ? 'text-red-600' : 'text-emerald-600'}`}>
                                    {formatCurrency(remaining)}
                                </span>
                            </div>
                            <div className="flex items-center justify-between text-sm">
                                <span className="text-surface-600">Status</span>
                                <span className={`badge-${remaining <= 0 ? 'paid' : paidAmount > 0 ? 'partial' : 'unpaid'}`}>
                                    {remaining <= 0 ? 'Paid' : paidAmount > 0 ? 'Partial' : 'Unpaid'}
                                </span>
                            </div>
                        </div>

                        <button
                            onClick={handleSubmit}
                            disabled={loading}
                            className="btn-primary w-full mt-6"
                        >
                            {loading ? 'Creating Invoice...' : 'Create Invoice'}
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
