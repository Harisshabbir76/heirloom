'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import '../../../../styles/Dashboard.css';
import '../../../../styles/ContentDashboard.css';
import { useRouter } from 'next/navigation';
import { hasDashboardAccess } from '../../../../lib/dashboardAuth';
import DashboardSidebar from '../../../../components/DashboardSidebar';
import { getDefaultProductPrice } from '../../../../lib/productPricing';

export default function Dashboard() {
    const router = useRouter();
    const [products, setProducts] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [isAuthorized, setIsAuthorized] = useState<boolean | null>(null);
    const [deleteModal, setDeleteModal] = useState<{ show: boolean; productId: string | null; productName: string }>({ 
        show: false, 
        productId: null, 
        productName: '' 
    });

    useEffect(() => {
        const authorizeAndFetchProducts = async () => {
            const { allowed, error } = await hasDashboardAccess();
            console.log('[Dashboard] Auth check result:', { allowed, error });
            if (!allowed) {
                console.warn('[Dashboard] Access denied, redirecting to /login. Reason:', error);
                router.replace('/login');
                setIsAuthorized(false);
                setLoading(false);
                return;
            }

            setIsAuthorized(true);
            try {
                const base = process.env.NEXT_PUBLIC_API_URL || '';
                const normalizedBase = base.replace(/\/+$/u, '').replace(/\/api$/u, '');

                const response = await fetch(`${normalizedBase}/api/products`, {
                    credentials: 'include',
                });
                const data = await response.json();
                if (data.success) {
                    setProducts(data.data);
                }
            } catch (error) {
                console.error('Error fetching products:', error);
            } finally {
                setLoading(false);
            }
        };

        authorizeAndFetchProducts();
    }, [router]);

    const confirmDeleteProduct = (productId: string, productName: string) => {
        setDeleteModal({ show: true, productId, productName });
    };

    const cancelDelete = () => {
        setDeleteModal({ show: false, productId: null, productName: '' });
    };

    const confirmDelete = async () => {
        const productId = deleteModal.productId;
        if (!productId) return;
        
        setDeleteModal({ show: false, productId: null, productName: '' });

        try {
            const base = process.env.NEXT_PUBLIC_API_URL || '';
            const normalizedBase = base.replace(/\/+$/u, '').replace(/\/api$/u, '');
            const response = await fetch(`${normalizedBase}/api/products/${productId}`, {
                method: 'DELETE',
                credentials: 'include',
            });
            const data = await response.json();
            if (data.success) {
                setProducts((current) => current.filter((product) => product._id !== productId));
            } else {
                alert('Failed to delete product.');
            }
        } catch {
            alert('Failed to delete product.');
        }
    };

    if (isAuthorized === false) {
        return <div className="dashboard-container" />;
    }

    if (isAuthorized === null) {
        return <div className="dashboard-container" />;
    }

    return (
        <div className="dashboard-container">
            <DashboardSidebar />
            <header className="dashboard-header">
                <h1 className="dashboard-title">INVENTORY DASHBOARD</h1>
                <Link href="/heirloom/admin/panel/dashboard/add-product" className="add-btn">
                    + Add Product
                </Link>
            </header>

            <div className="dashboard-stats">
                <div className="stat-card">
                    <div className="stat-label">Total Products</div>
                    <div className="stat-value">{products.length}</div>
                </div>
                <div className="stat-card">
                    <div className="stat-label">Inventory Value</div>
                    <div className="stat-value">
                        AED {products.reduce((acc: number, item: any) => acc + getDefaultProductPrice(item), 0).toLocaleString()}
                    </div>
                </div>
            </div>

            <section className="product-list-section">
                <h2 className="section-title">PRODUCT INVENTORY</h2>
                {loading ? (
                    <div className="no-products">Loading products…</div>
                ) : products.length === 0 ? (
                    <div className="no-products">No products found in the database.</div>
                ) : (
                    <div className="products-table-wrapper">
                        {(() => {
                            // Extract all unique priced variant option names across all products
                            const allVariantOptions = new Set<string>();
                            products.forEach((product: any) => {
                                (product.variantGroups || []).forEach((group: any) => {
                                    if (group.hasVariantPrice) {
                                        (group.options || []).forEach((option: any) => {
                                            if (option.name) allVariantOptions.add(option.name.toUpperCase());
                                        });
                                    }
                                });
                            });
                            const variantOptionArray = Array.from(allVariantOptions).sort();

                            return (
                                <table className="products-table">
                                    <thead>
                                        <tr>
                                            <th>Product</th>
                                            {variantOptionArray.map((optionName) => (
                                                <th key={optionName}>{optionName}</th>
                                            ))}
                                            <th>Action</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {products.map((product: any) => {
                                            // Build a map of option name -> price for this product
                                            const optionPriceMap = new Map<string, number>();
                                            (product.variantGroups || []).forEach((group: any) => {
                                                if (group.hasVariantPrice) {
                                                    (group.options || []).forEach((option: any) => {
                                                        if (option.name && option.price != null) {
                                                            optionPriceMap.set(option.name.toUpperCase(), Number(option.price));
                                                        }
                                                    });
                                                }
                                            });

                                            return (
                                                <tr key={product._id}>
                                                    <td className="product-cell">
                                                        <img
                                                            src={product.images && product.images[0]?.url}
                                                            alt={product.name}
                                                            className="product-thumbnail"
                                                        />
                                                        {product.name}
                                                    </td>
                                                    {variantOptionArray.map((optionName) => {
                                                        const price = optionPriceMap.get(optionName);
                                                        return (
                                                            <td key={`${product._id}-${optionName}`}>
                                                                {price !== undefined ? `AED ${price}` : '-'}
                                                            </td>
                                                        );
                                                    })}
                                                    <td>
                                                        <div className="table-actions">
                                                            <Link
                                                                href={`/heirloom/admin/panel/dashboard/edit-product/${product._id}`}
                                                                className="edit-link"
                                                            >
                                                                Edit
                                                            </Link>
                                                            <button
                                                                type="button"
                                                                className="delete-link"
                                                                onClick={() => confirmDeleteProduct(product._id, product.name)}
                                                            >
                                                                Delete
                                                            </button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            );
                        })()}
                    </div>
                )}
            </section>
            
            {/* Delete Confirmation Modal */}
            {deleteModal.show && (
                <div className="modal-overlay" onClick={cancelDelete}>
                    <div className="modal-container" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-icon modal-icon-warning">
                            ?
                        </div>
                        <h3 className="modal-title">
                            Confirm Delete
                        </h3>
                        <p className="modal-message">
                            Are you sure you want to delete the product "{deleteModal.productName}"? This action cannot be undone.
                        </p>
                        <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', marginTop: '20px' }}>
                            <button
                                className="modal-button modal-button-cancel"
                                onClick={cancelDelete}
                                style={{ background: '#888' }}
                            >
                                Cancel
                            </button>
                            <button
                                className="modal-button modal-button-confirm"
                                onClick={confirmDelete}
                                style={{ background: '#d9383a' }}
                            >
                                Delete
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}