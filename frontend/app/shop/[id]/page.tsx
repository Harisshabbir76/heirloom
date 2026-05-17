'use client';

import React, { use, useEffect, useState } from 'react';
import ProductDetailTop from '../../components/ProductDetailTop';
import ProductRecommended from '../../components/ProductRecommended';
import ProductFaqs from '../../components/ProductFaqs';
import StoryMemories from '../../components/StoryMemories';

export type ProductImage = {
    url: string;
    cloudinaryId?: string;
};

export type ProductVariantOption = {
    name: string;
    image?: ProductImage;
    dimensions?: {
        length?: string;
        width?: string;
        height?: string;
        description?: string;
    };
    price?: number;
};

export type ProductVariantGroup = {
    name: string;
    options: ProductVariantOption[];
};

export type Product = {
    _id: string;
    name: string;
    description: string;
    basePrice: number;
    currency?: string;
    images?: ProductImage[];
    variantGroups?: ProductVariantGroup[];
};

type ApiResponse<T> = {
    success: boolean;
    data: T;
};

export default function ProductDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    const [product, setProduct] = useState<Product | null>(null);
    const [recommendedProducts, setRecommendedProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchProducts = async () => {
            try {
                const [productResponse, productsResponse] = await Promise.all([
                    fetch(`${process.env.NEXT_PUBLIC_API_URL}/products/${id}`),
                    fetch(`${process.env.NEXT_PUBLIC_API_URL}/products`),
                ]);

                const productData = (await productResponse.json()) as ApiResponse<Product>;
                const productsData = (await productsResponse.json()) as ApiResponse<Product[]>;

                if (productData.success) {
                    setProduct(productData.data);
                }

                if (productsData.success) {
                    setRecommendedProducts(
                        productsData.data.filter((item) => item._id !== id).slice(0, 3)
                    );
                }
            } catch (error) {
                console.error('Error fetching product detail:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchProducts();
    }, [id]);

    if (loading) {
        return <main className="product-detail-page-status">Loading piece...</main>;
    }

    if (!product) {
        return <main className="product-detail-page-status">Product not found.</main>;
    }

    return (
        <main>
            <ProductDetailTop product={product} />
            <ProductRecommended products={recommendedProducts} />
            <ProductFaqs />
            <StoryMemories />
        </main>
    );
}
