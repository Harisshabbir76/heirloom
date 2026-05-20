'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import '../styles/Shop.css';
import ProductFaqs from '../components/ProductFaqs';
import StoryMemoriesshop from '../components/StoryMemoriesshop';

type ShopProduct = {
    _id: string;
    name: string;
    basePrice: number;
    images?: {
        url: string;
    }[];
};

export default function ShopPage() {
    const [products, setProducts] = useState<ShopProduct[]>([]);
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
        <div>
            <div className="shop-container">
                <header className="shop-header">
                    <h1 className="shop-title">SHOP</h1>
                    <p className="shop-subtitle">
                        Where timeless pieces are chosen, gifted, and remembered.
                    </p>
                </header>

                {loading ? (
                    <div className="shop-state">
                        Curating our collection...
                    </div>
                ) : products.length === 0 ? (
                    <div className="shop-state">
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
                                <p className="shop-product-price">{product.basePrice} AED</p>
                            </Link>
                        ))}
                    </div>
                )}
            </div>
            <ProductFaqs />
            <StoryMemoriesshop />
        </div>
    );
}