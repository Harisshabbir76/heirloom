import React from 'react';
import Link from 'next/link';
import type { Product } from '../shop/[id]/page';
import '../styles/ProductRecommended.css';

type ProductRecommendedProps = {
    products: Product[];
};

const ProductRecommended: React.FC<ProductRecommendedProps> = ({ products }) => {
    const visibleProducts = products.slice(0, 1);

    return (
        <section className="product-recommended">
            <div className="product-recommended__inner">
                <div className="product-recommended__heading">
                    <h2>EXPLORE MORE</h2>
                    <p>Our Jewelry Boxes</p>
                </div>

                <div className="product-recommended__grid">
                    {visibleProducts.map((product) => {
                        const imageUrl = product.images?.[0]?.url;

                        return (
                            <Link
                                className="product-recommended__card"
                                href={`/shop/${product._id}`}
                                key={product._id}
                            >
                                <div className="product-recommended__image">
                                    {imageUrl ? (
                                        <img src={imageUrl} alt={product.name} />
                                    ) : (
                                        <span>HEIRLOOM BY SK</span>
                                    )}
                                    <div className="product-recommended__overlay">
                                        VIEW PRODUCT
                                    </div>
                                </div>
                                <h3>{product.name}</h3>
                                <p>{product.basePrice} {product.currency ?? 'AED'}</p>
                            </Link>
                        );
                    })}
                </div>
            </div>
        </section>
    );
};

export default ProductRecommended;
