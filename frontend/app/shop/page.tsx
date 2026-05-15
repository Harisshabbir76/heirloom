'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import '../styles/Shop.css';

export default function ShopPage() {
    const [products, setProducts] = useState<any[]>([]);
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
        <div className="shop-container">
            <header className="shop-header">
                <h1 className="shop-title">The Collection</h1>
                <p className="shop-subtitle">
                    Discover our carefully curated pieces, each designed to hold your most treasured memories 
                    and tell a story that lasts forever.
                </p>
            </header>

            {loading ? (
                <div style={{ textAlign: 'center', padding: '100px', color: '#777' }}>
                    Curating our collection...
                </div>
            ) : products.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '100px', color: '#777' }}>
                    Our collection is currently being updated. Please check back soon.
                </div>
            ) : (
                <div className="products-grid">
                    {products.map((product) => (
                        <Link 
                            key={product._id} 
                            href={`/shop/${product._id}`} 
                            className="shop-product-card"
                        >
                            <div className="shop-image-wrapper">
                                <img 
                                    src={product.images?.[0]?.url || '/placeholder-product.png'} 
                                    alt={product.name} 
                                />
                            </div>
                            <h3 className="shop-product-name">{product.name}</h3>
                            <p className="shop-product-price">AED {product.basePrice}</p>
                        </Link>
                    ))}
                </div>
            )}
        </div>
    );
}
