'use client';

import { useState } from 'react';
import { createProduct, updateProduct, deleteProduct } from '@/lib/actions/products';
import SearchBar from '@/components/SearchBar';
import Modal from '@/components/Modal';
import BarcodePrint from '@/components/BarcodePrint';
import { Wand2, Printer, Plus } from 'lucide-react';
import { printProductLabel } from '@/utils/print-utils';

interface Product {
    id: string;
    name: string;
    description: string;
    price: number;
    stock_quantity: number;
    barcode: string;
    created_at: string;
}

interface ProductsClientProps {
    initialProducts: Product[];
}

function formatCurrency(amount: number) {
    return `Rs. ${amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`;
}

export default function ProductsClient({ initialProducts }: ProductsClientProps) {
    const [products, setProducts] = useState<Product[]>(initialProducts);
    const [modalOpen, setModalOpen] = useState(false);
    const [editProduct, setEditProduct] = useState<Product | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [generatingBarcode, setGeneratingBarcode] = useState(false);

    const generateRandomBarcode = () => {
        // Generate a 12 digit number + 1 checksum or simplified 13 digit
        const rand = Math.floor(100000000000 + Math.random() * 900000000000).toString();
        return rand; // Simplified for internal use, usually EAN13 needs checksum
    };

    const handleGenerateBarcode = (e: React.MouseEvent) => {
        e.preventDefault();
        setGeneratingBarcode(true);
        const code = generateRandomBarcode();
        const input = document.querySelector('input[name="barcode"]') as HTMLInputElement;
        if (input) input.value = code;
        setTimeout(() => setGeneratingBarcode(false), 500);
    };

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const formData = new FormData(e.currentTarget);
            if (editProduct) {
                await updateProduct(editProduct.id, formData);
            } else {
                await createProduct(formData);
            }
            setModalOpen(false);
            setEditProduct(null);
            // Refresh page data
            window.location.reload();
        } catch (err: any) {
            setError(err.message || 'Something went wrong');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this product?')) return;
        try {
            await deleteProduct(id);
            setProducts(products.filter((p) => p.id !== id));
        } catch (err: any) {
            alert(err.message || 'Failed to delete product');
        }
    };

    const openEdit = (product: Product) => {
        setEditProduct(product);
        setModalOpen(true);
    };

    const openAdd = () => {
        setEditProduct(null);
        setModalOpen(true);
    };

    return (
        <>
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 mb-10">
                <div>
                    <h1 className="text-3xl font-poppins font-bold text-surface-primary tracking-tight">Stock Inventory</h1>
                    <p className="text-surface-muted text-sm font-medium">Manage and track your product catalog</p>
                </div>
                <div className="flex items-center gap-3 w-full md:w-auto">
                    <div className="flex-1 md:w-80">
                        <SearchBar placeholder="Search by name, barcode, or SKU..." />
                    </div>
                    <button onClick={openAdd} className="btn-primary flex items-center gap-2 whitespace-nowrap active:scale-95 px-6">
                        <Plus size={18} />
                        Add Product
                    </button>
                </div>
            </div>

            {products.length === 0 ? (
                <div className="card p-20 text-center border-2 border-dashed border-gray-200 bg-white">
                    <div className="w-24 h-24 bg-gray-50 rounded-[2.5rem] flex items-center justify-center text-5xl mx-auto mb-8 shadow-inner ring-1 ring-gray-100">
                        📦
                    </div>
                    <h3 className="text-2xl font-poppins font-black text-surface-primary mb-3">Inventory Empty</h3>
                    <p className="text-sm text-surface-muted mb-10 max-w-sm mx-auto font-medium leading-relaxed">Build your professional catalog by adding your first product to G.K Paints.</p>
                    <button onClick={openAdd} className="btn-primary px-10 py-4 text-xs font-black uppercase tracking-widest shadow-2xl shadow-brand-primary/20">Add First Product</button>
                </div>
            ) : (
                <div className="table-container shadow-xl shadow-gray-200/50">
                    <table className="w-full">
                        <thead>
                            <tr className="bg-gray-50 border-b border-brand-border">
                                <th className="text-left px-8 py-5 text-[10px] font-black text-surface-muted uppercase tracking-[0.2em]">Product Info</th>
                                <th className="text-left px-8 py-5 text-[10px] font-black text-surface-muted uppercase tracking-[0.2em]">Stock Code</th>
                                <th className="text-left px-8 py-5 text-[10px] font-black text-surface-muted uppercase tracking-[0.2em]">Unit Price</th>
                                <th className="text-left px-8 py-5 text-[10px] font-black text-surface-muted uppercase tracking-[0.2em]">Available</th>
                                <th className="text-right px-8 py-5 text-[10px] font-black text-surface-muted uppercase tracking-[0.2em]">Control</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {products.map((product) => (
                                <tr key={product.id} className="hover:bg-gray-50/50 transition-all duration-300 animate-fade-in group">
                                    <td className="px-8 py-5">
                                        <div className="flex flex-col">
                                            <p className="text-sm font-black text-surface-primary group-hover:text-brand-primary transition-colors">{product.name}</p>
                                            {product.description && (
                                                <p className="text-[10px] text-surface-muted mt-1 font-medium line-clamp-1 italic">{product.description}</p>
                                            )}
                                        </div>
                                    </td>
                                    <td className="px-8 py-5">
                                        <span className="text-[10px] font-mono font-black text-surface-muted bg-gray-50 px-2.5 py-1.5 rounded-lg border border-gray-100 shadow-sm">
                                            {product.barcode || 'NO-CODE'}
                                        </span>
                                    </td>
                                    <td className="px-8 py-5 text-sm font-black text-brand-primary">{formatCurrency(product.price)}</td>
                                    <td className="px-6 py-4">
                                        <span className={product.stock_quantity <= 0 ? 'badge-unpaid text-[10px]' :
                                            product.stock_quantity <= 10 ? 'badge-partial text-[10px]' :
                                                'badge-paid text-[10px]'
                                        }>
                                            {product.stock_quantity} left
                                        </span>
                                    </td>
                                    <td className="px-8 py-5 text-right">
                                        <div className="flex items-center justify-end gap-2.5 opacity-0 group-hover:opacity-100 transition-all translate-x-4 group-hover:translate-x-0 duration-500">
                                            <button
                                                onClick={() => {
                                                    printProductLabel(product.name, product.barcode, product.price);
                                                }}
                                                className="w-9 h-9 rounded-xl bg-white border border-brand-border text-surface-muted hover:text-brand-primary hover:border-brand-primary transition-all flex items-center justify-center shadow-sm active:scale-90"
                                                title="Print Label"
                                            >
                                                <Printer size={16} />
                                            </button>
                                            <button
                                                onClick={() => openEdit(product)}
                                                className="text-[10px] px-3 py-1.5 rounded-lg bg-brand-primary/10 text-brand-primary border border-brand-primary/20 hover:bg-brand-primary hover:text-brand-dark transition-all font-black uppercase tracking-widest active:scale-95 shadow-sm"
                                            >
                                                Edit
                                            </button>
                                            <button
                                                onClick={() => handleDelete(product.id)}
                                                className="text-[10px] px-3 py-1.5 rounded-lg bg-status-danger/10 text-status-danger border border-status-danger/20 hover:bg-status-danger hover:text-white transition-all font-black uppercase tracking-widest active:scale-95 shadow-sm"
                                            >
                                                Delete
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Add/Edit Modal */}
            <Modal
                isOpen={modalOpen}
                onClose={() => { setModalOpen(false); setEditProduct(null); setError(''); }}
                title={editProduct ? 'Edit Product' : 'Add Product'}
            >
                <form onSubmit={handleSubmit} className="space-y-4">
                    {error && (
                        <div className="p-4 bg-status-danger/10 border border-status-danger/20 rounded-2xl text-sm text-status-danger font-bold flex items-center gap-3">
                            <span className="text-lg">⚠️</span> {error}
                        </div>
                    )}
                    <div>
                        <label className="block text-xs font-black text-surface-muted uppercase tracking-widest mb-2">Name *</label>
                        <input name="name" defaultValue={editProduct?.name} required className="input-field py-3" placeholder="e.g. Premium Silk Scarf" />
                    </div>
                    <div>
                        <label className="block text-xs font-black text-surface-muted uppercase tracking-widest mb-2">Description</label>
                        <textarea name="description" defaultValue={editProduct?.description} rows={2} className="input-field" placeholder="Optional product details..." />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-black text-surface-muted uppercase tracking-widest mb-2">Price *</label>
                            <input name="price" type="number" step="0.01" min="0" defaultValue={editProduct?.price || ''} required className="input-field font-black text-brand-primary" placeholder="0.00" />
                        </div>
                        <div>
                            <label className="block text-xs font-black text-surface-muted uppercase tracking-widest mb-2">Stock Qty *</label>
                            <input name="stock_quantity" type="number" min="0" defaultValue={editProduct?.stock_quantity ?? 0} required className="input-field font-bold" />
                        </div>
                    </div>
                    <div>
                        <label className="block text-xs font-black text-surface-muted uppercase tracking-widest mb-2">Barcode / SKU</label>
                        <div className="flex gap-2">
                            <input name="barcode" defaultValue={editProduct?.barcode} className="input-field flex-1 font-mono uppercase" placeholder="Scan or Enter Code" />
                            <button
                                type="button"
                                onClick={handleGenerateBarcode}
                                className="w-12 h-12 rounded-2xl bg-brand-background border border-brand-border text-brand-primary hover:border-brand-primary transition-all flex items-center justify-center active:scale-90"
                                title="Auto-generate Barcode"
                                disabled={generatingBarcode}
                            >
                                <Wand2 size={18} className={generatingBarcode ? 'animate-spin' : ''} />
                            </button>
                        </div>
                        {editProduct?.barcode && (
                            <div className="mt-6 pt-6 border-t border-brand-border">
                                <label className="block text-[10px] font-black text-surface-muted uppercase tracking-widest mb-4">Print Preview</label>
                                <div className="bg-white p-4 rounded-2xl flex justify-center shadow-inner">
                                    <BarcodePrint value={editProduct.barcode} name={editProduct.name} price={editProduct.price} />
                                </div>
                            </div>
                        )}
                    </div>
                    <div className="flex justify-end gap-3 pt-6 border-t border-brand-border mt-8">
                        <button type="button" onClick={() => { setModalOpen(false); setEditProduct(null); }} className="btn-secondary px-6">
                            Cancel
                        </button>
                        <button type="submit" disabled={loading} className="btn-primary px-8 active:scale-95">
                            {loading ? 'Saving...' : editProduct ? 'Update Product' : 'Register Product'}
                        </button>
                    </div>
                </form>
            </Modal>
        </>
    );
}
