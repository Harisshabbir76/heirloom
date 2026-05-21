'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import '../styles/Dashboard.css';
import { useRouter } from 'next/navigation';
import { hasDashboardAccess } from '../lib/dashboardAuth';
import DashboardSidebar from '../components/DashboardSidebar';

export default function Dashboard() {
    const router = useRouter();
    const [products, setProducts] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [isAuthorized, setIsAuthorized] = useState<boolean | null>(null);

    useEffect(() => {
        const authorizeAndFetchProducts = async () => {
            const allowed = await hasDashboardAccess();
            if (!allowed) {
                router.replace('/404');
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
                <Link href="/dashboard/add-product" className="add-btn">
                    + Add Product
                </Link>
            </header>

            <div className="dashboard-stats">
                <div className="stat-card">
                    <div className="stat-label">Total Products</div>
                    <div className="stat-value">{products.length}</div>
                </div>
                <div className="stat-card">
                    <div className="stat-label">Total Stock</div>
                    <div className="stat-value">
                        {products.reduce((acc: number, item: any) => acc + (Number(item.stock) || 0), 0)}
                    </div>
                </div>
                <div className="stat-card">
                    <div className="stat-label">Inventory Value</div>
                    <div className="stat-value">
                        AED {products.reduce((acc: number, item: any) => acc + (item.basePrice || 0), 0).toLocaleString()}
                    </div>
                </div>
            </div>

            <section className="product-list-section">
                <h2 className="section-title">Product Inventory</h2>
                {loading ? (
                    <div className="no-products">Loading products...</div>
                ) : products.length === 0 ? (
                    <div className="no-products">No products found in the database.</div>
                ) : (
                    <div className="products-table-wrapper">
                        <table className="products-table">
                            <thead>
                                <tr>
                                    <th>Product</th>
                                    <th>Variants</th>
                                    <th>Base Price</th>
                                    <th>Stock</th>
                                    <th>Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {products.map((product: any) => (
                                    <tr key={product._id}>
                                        <td className="product-cell">
                                            <img 
                                                src={product.images && product.images[0]?.url} 
                                                alt={product.name} 
                                                className="product-thumbnail"
                                            />
                                            {product.name}
                                        </td>
                                        <td>{product.variantGroups?.length || 0} variants</td>
                                        <td>AED {product.basePrice}</td>
                                        <td>{product.stock ?? 0}</td>
                                        <td>
                                            <Link 
                                                href={`/dashboard/edit-product/${product._id}`}
                                                className="edit-link"
                                            >
                                                Edit
                                            </Link>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </section>
        </div>
    );
}