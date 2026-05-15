'use client';

import React, { useEffect, useState, use } from 'react';
import { useRouter } from 'next/navigation';
import '../../styles/ProductDetail.css';

export default function ProductDetail({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    const [product, setProduct] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [mainImage, setMainImage] = useState('');
    const [selections, setSelections] = useState<Record<number, any>>({});

    useEffect(() => {
        const fetchProduct = async () => {
            try {
                const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/products/${id}`);
                const data = await response.json();
                if (data.success) {
                    setProduct(data.data);
                    setMainImage(data.data.images?.[0]?.url || '');
                    
                    // Initial selections
                    const initial: Record<number, any> = {};
                    data.data.variantGroups?.forEach((group: any, idx: number) => {
                        initial[idx] = group.options?.[0] || null;
                    });
                    setSelections(initial);
                }
            } catch (error) {
                console.error('Error fetching product:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchProduct();
    }, [id]);

    const handleOptionSelect = (gIdx: number, option: any) => {
        setSelections(prev => ({ ...prev, [gIdx]: option }));
        if (option.image?.url) {
            setMainImage(option.image.url);
        }
    };

    if (loading) return <div className="detail-container">Loading piece...</div>;
    if (!product) return <div className="detail-container">Product not found.</div>;

    return (
        <div className="detail-container">
            <div className="detail-grid">
                {/* Left: Gallery */}
                <div className="image-gallery">
                    <div className="main-image">
                        <img src={mainImage} alt={product.name} />
                    </div>
                    <div className="thumbnail-grid">
                        {product.images?.map((img: any, i: number) => (
                            <div 
                                key={i} 
                                className={`thumbnail ${mainImage === img.url ? 'active' : ''}`}
                                onClick={() => setMainImage(img.url)}
                            >
                                <img src={img.url} alt={`${product.name} ${i}`} />
                            </div>
                        ))}
                    </div>
                </div>

                {/* Right: Info */}
                <div className="info-section">
                    <h1 className="product-name-large">{product.name}</h1>
                    <p className="product-price-large">AED {product.basePrice}</p>
                    
                    <div className="product-description">
                        {product.description}
                    </div>

                    {/* Variant Selectors */}
                    {product.variantGroups?.map((group: any, gIdx: number) => (
                        <div key={gIdx} className="variant-group-detail">
                            <h4 className="variant-group-name">{group.name}</h4>
                            <div className="variant-options-grid">
                                {group.options.map((option: any, oIdx: number) => (
                                    <button 
                                        key={oIdx}
                                        className={`variant-option-btn ${selections[gIdx] === option ? 'active' : ''}`}
                                        onClick={() => handleOptionSelect(gIdx, option)}
                                    >
                                        {option.name}
                                    </button>
                                ))}
                            </div>
                            
                            {/* Selected Option Details (Dimensions) */}
                            {selections[gIdx]?.dimensions && (selections[gIdx].dimensions.length || selections[gIdx].dimensions.description) && (
                                <div className="dimension-info">
                                    <strong>Specifications:</strong>
                                    {selections[gIdx].dimensions.length ? (
                                        <p style={{ margin: '10px 0 0 0' }}>
                                            Dimensions: {selections[gIdx].dimensions.length} x {selections[gIdx].dimensions.width} x {selections[gIdx].dimensions.height} cm
                                        </p>
                                    ) : (
                                        <p style={{ margin: '10px 0 0 0' }}>{selections[gIdx].dimensions.description}</p>
                                    )}
                                </div>
                            )}
                        </div>
                    ))}

                    <button className="add-to-cart-btn">
                        Add to Selection
                    </button>
                </div>
            </div>
        </div>
    );
}
