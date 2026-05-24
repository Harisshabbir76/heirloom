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
    const [isTransitioning, setIsTransitioning] = useState(false);

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

    // Create extended array for smooth infinite loop
    const extendedProducts = useMemo(() => {
        if (products.length <= 3) return products;
        // Triple the array for seamless infinite scroll
        return [...products, ...products, ...products];
    }, [products]);

    const visibleProducts = useMemo(() => {
        if (products.length <= 3) return products;
        
        const startIndex = carouselIndex + products.length;
        return Array.from({ length: 3 }, (_, index) => (
            extendedProducts[startIndex + index]
        ));
    }, [carouselIndex, products, extendedProducts]);

    const showCarousel = products.length > 3;

    const showPreviousProducts = () => {
        if (isTransitioning) return;
        setIsTransitioning(true);
        setCarouselIndex((current) => current - 1);
        
        setTimeout(() => {
            setIsTransitioning(false);
        }, 500);
    };

    const showNextProducts = () => {
        if (isTransitioning) return;
        setIsTransitioning(true);
        setCarouselIndex((current) => current + 1);
        
        setTimeout(() => {
            setIsTransitioning(false);
        }, 500);
    };

    // Reset carousel index when it reaches boundaries for infinite loop
    useEffect(() => {
        if (products.length <= 3) return;
        
        if (carouselIndex <= -products.length) {
            setTimeout(() => {
                setCarouselIndex(0);
            }, 0);
        } else if (carouselIndex >= products.length) {
            setTimeout(() => {
                setCarouselIndex(0);
            }, 0);
        }
    }, [carouselIndex, products.length]);

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
                            className="shop-carousel__button shop-carousel__button--prev"
                            onClick={showPreviousProducts}
                            aria-label="Show previous products"
                            disabled={isTransitioning}
                        >
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M15 18L9 12L15 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            </svg>
                        </button>

                        <div className="products-grid products-grid--three products-grid--carousel">
                            {visibleProducts.map((product, index) => (
                                <div 
                                    key={`${product._id}-${carouselIndex}-${index}`}
                                    className="shop-carousel-item"
                                >
                                    {renderProduct(product)}
                                </div>
                            ))}
                        </div>

                        <button
                            type="button"
                            className="shop-carousel__button shop-carousel__button--next"
                            onClick={showNextProducts}
                            aria-label="Show next products"
                            disabled={isTransitioning}
                        >
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M9 18L15 12L9 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            </svg>
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