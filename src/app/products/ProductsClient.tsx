'use client';

import { useState } from 'react';
import { createProduct, updateProduct, deleteProduct } from '@/lib/actions/products';
import SearchBar from '@/components/SearchBar';
import Modal from '@/components/Modal';

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
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
                <h1 className="page-header mb-0">Products</h1>
                <div className="flex items-center gap-3 w-full sm:w-auto">
                    <div className="flex-1 sm:flex-initial sm:w-64">
                        <SearchBar placeholder="Search by name or barcode..." />
                    </div>
                    <button onClick={openAdd} className="btn-primary whitespace-nowrap">+ Add Product</button>
                </div>
            </div>

            {products.length === 0 ? (
                <div className="card p-12 text-center">
                    <p className="text-4xl mb-3">📦</p>
                    <p className="text-lg font-medium text-surface-700 mb-1">No products found</p>
                    <p className="text-sm text-surface-500 mb-4">Add your first product to get started</p>
                    <button onClick={openAdd} className="btn-primary">+ Add Product</button>
                </div>
            ) : (
                <div className="table-container">
                    <table className="w-full">
                        <thead>
                            <tr className="border-b border-surface-200 bg-surface-50">
                                <th className="text-left px-6 py-3 text-xs font-medium text-surface-500 uppercase tracking-wider">Product</th>
                                <th className="text-left px-6 py-3 text-xs font-medium text-surface-500 uppercase tracking-wider">Barcode</th>
                                <th className="text-left px-6 py-3 text-xs font-medium text-surface-500 uppercase tracking-wider">Price</th>
                                <th className="text-left px-6 py-3 text-xs font-medium text-surface-500 uppercase tracking-wider">Stock</th>
                                <th className="text-right px-6 py-3 text-xs font-medium text-surface-500 uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-surface-100">
                            {products.map((product) => (
                                <tr key={product.id} className="hover:bg-surface-50 transition-colors animate-fade-in">
                                    <td className="px-6 py-4">
                                        <div>
                                            <p className="text-sm font-medium text-surface-900">{product.name}</p>
                                            {product.description && (
                                                <p className="text-xs text-surface-500 mt-0.5 line-clamp-1">{product.description}</p>
                                            )}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-sm text-surface-600 font-mono">{product.barcode || '—'}</td>
                                    <td className="px-6 py-4 text-sm font-medium text-surface-900">{formatCurrency(product.price)}</td>
                                    <td className="px-6 py-4">
                                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${product.stock_quantity <= 0
                                                ? 'bg-red-100 text-red-800'
                                                : product.stock_quantity <= 10
                                                    ? 'bg-amber-100 text-amber-800'
                                                    : 'bg-emerald-100 text-emerald-800'
                                            }`}>
                                            {product.stock_quantity}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <div className="flex items-center justify-end gap-2">
                                            <button
                                                onClick={() => openEdit(product)}
                                                className="text-xs px-3 py-1.5 rounded-lg bg-primary-50 text-primary-700 hover:bg-primary-100 transition-colors font-medium"
                                            >
                                                Edit
                                            </button>
                                            <button
                                                onClick={() => handleDelete(product.id)}
                                                className="text-xs px-3 py-1.5 rounded-lg bg-red-50 text-red-700 hover:bg-red-100 transition-colors font-medium"
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
                        <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">{error}</div>
                    )}
                    <div>
                        <label className="block text-sm font-medium text-surface-700 mb-1">Name *</label>
                        <input name="name" defaultValue={editProduct?.name} required className="input-field" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-surface-700 mb-1">Description</label>
                        <textarea name="description" defaultValue={editProduct?.description} rows={2} className="input-field" />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="block text-sm font-medium text-surface-700 mb-1">Price *</label>
                            <input name="price" type="number" step="0.01" min="0" defaultValue={editProduct?.price || ''} required className="input-field" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-surface-700 mb-1">Stock Qty *</label>
                            <input name="stock_quantity" type="number" min="0" defaultValue={editProduct?.stock_quantity ?? 0} required className="input-field" />
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-surface-700 mb-1">Barcode</label>
                        <input name="barcode" defaultValue={editProduct?.barcode} className="input-field" placeholder="Optional" />
                    </div>
                    <div className="flex justify-end gap-3 pt-2">
                        <button type="button" onClick={() => { setModalOpen(false); setEditProduct(null); }} className="btn-secondary">
                            Cancel
                        </button>
                        <button type="submit" disabled={loading} className="btn-primary">
                            {loading ? 'Saving...' : editProduct ? 'Update' : 'Add Product'}
                        </button>
                    </div>
                </form>
            </Modal>
        </>
    );
}
