'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import '../styles/Dashboard.css';

export default function Dashboard() {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchProducts = async () => {
            try {
                const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/products`);
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

        fetchProducts();
    }, []);

    return (
        <div className="dashboard-container">
            <header className="dashboard-header">
                <h1 className="dashboard-title">Inventory Dashboard</h1>
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
                        {products.reduce((acc: number, item: any) => acc + (item.stock || 0), 0) || 'N/A'}
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
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead>
                            <tr style={{ textAlign: 'left', borderBottom: '1px solid #eee' }}>
                                <th style={{ padding: '15px 0' }}>Product</th>
                                <th>Variants</th>
                                <th>Base Price</th>
                                <th>Stock</th>
                                <th>Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {products.map((product: any) => (
                                <tr key={product._id} style={{ borderBottom: '1px solid #f9f9f9' }}>
                                    <td style={{ padding: '15px 0', display: 'flex', alignItems: 'center', gap: '15px' }}>
                                        <img 
                                            src={product.images && product.images[0]?.url} 
                                            alt={product.name} 
                                            style={{ width: '40px', height: '40px', objectFit: 'cover', borderRadius: '4px' }}
                                        />
                                        {product.name}
                                    </td>
                                    <td>{product.variantGroups?.length || 0} variants</td>
                                    <td>AED {product.basePrice}</td>
                                    <td>{product.stock ?? 'N/A'}</td>
                                    <td>
                                        <Link 
                                            href={`/dashboard/edit-product/${product._id}`}
                                            style={{ 
                                                fontSize: '12px', 
                                                color: '#c5a059', 
                                                textDecoration: 'none',
                                                border: '1px solid #c5a059',
                                                padding: '4px 10px',
                                                borderRadius: '4px'
                                            }}
                                        >
                                            Edit
                                        </Link>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </section>
        </div>
    );
}
