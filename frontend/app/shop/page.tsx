'use client';

import React, { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import '../styles/Shop.css';
import ProductFaqs from '../components/ProductFaqs';
import StoryMemoriesshop from '../components/StoryMemoriesshop';
import { getDefaultProductPrice } from '../lib/productPricing';
import type { Product } from './[id]/page';

export default function ShopPage() {
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [carouselIndex, setCarouselIndex] = useState(0);

    useEffect(() => {
        const fetchProducts = async () => {
            try {
                const response = await fetch(
                    `${process.env.NEXT_PUBLIC_API_URL}/products`
                );
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

    useEffect(() => {
        setCarouselIndex(0);
    }, [products.length]);

    const visibleProducts = useMemo(() => {
        if (products.length <= 3) return products;

        return Array.from({ length: 3 }, (_, index) => (
            products[(carouselIndex + index) % products.length]
        ));
    }, [carouselIndex, products]);

    const showCarousel = products.length > 3;

    const showPreviousProducts = () => {
        setCarouselIndex((current) => (current - 1 + products.length) % products.length);
    };

    const showNextProducts = () => {
        setCarouselIndex((current) => (current + 1) % products.length);
    };

    const renderProduct = (product: Product) => (
        <Link
            key={product._id}
            href={`/shop/${product._id}`}
            className="shop-product-card"
        >
            <div className="shop-image-wrapper">
                <img
                    src={
                        product.images?.[0]?.url ||
                        '/placeholder-product.png'
                    }
                    alt={product.name}
                />
            </div>

            <h3 className="shop-product-name">
                {product.name}
            </h3>

            <p className="shop-product-price">
                {getDefaultProductPrice(product)} AED
            </p>
        </Link>
    );

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
                ) : showCarousel ? (
                    <div className="shop-carousel" aria-label="Product carousel">
                        <button
                            type="button"
                            className="shop-carousel__button"
                            onClick={showPreviousProducts}
                            aria-label="Show previous products"
                        >
                            &lt;
                        </button>

                        <div className="products-grid products-grid--three products-grid--carousel">
                            {visibleProducts.map(renderProduct)}
                        </div>

                        <button
                            type="button"
                            className="shop-carousel__button"
                            onClick={showNextProducts}
                            aria-label="Show next products"
                        >
                            &gt;
                        </button>
                    </div>
                ) : (
                    <div className={`products-grid ${products.length === 3 ? 'products-grid--three' : ''}`}>
                        {products.map(renderProduct)}
                    </div>
                )}
            </div>

            <ProductFaqs placement="shop" />
            <StoryMemoriesshop />
        </div>
    );
}
