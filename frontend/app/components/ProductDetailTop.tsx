'use client';

import React, { useMemo, useState } from 'react';
import type { Product, ProductVariantOption } from '../shop/[id]/page';
import '../styles/ProductDetailTop.css';

type ProductDetailTopProps = {
    product: Product;
};

const isImageGroup = (name: string) => {
    const normalized = name.toLowerCase();
    return normalized.includes('velvet fabric color') || normalized.includes('design color');
};

const formatDimensions = (option?: ProductVariantOption) => {
    if (!option?.dimensions) return '';
    const { length, width, height, description } = option.dimensions;
    if (description) return description;
    if (length || width || height) {
        return [
            length ? `${length} (L)` : '',
            width ? `${width} (W)` : '',
            height ? `${height} (H)` : '',
        ]
            .filter(Boolean)
            .join(' X ');
    }
    return '';
};

const ProductDetailTop: React.FC<ProductDetailTopProps> = ({ product }) => {
    const galleryImages = useMemo(
        () => (product.images ?? []).filter((image) => image.url),
        [product]
    );

    const [mainImage, setMainImage] = useState(galleryImages[0]?.url ?? '');
    const [selectedOptions, setSelectedOptions] = useState<Record<string, ProductVariantOption>>(
        () => {
            const initialSelections: Record<string, ProductVariantOption> = {};
            product.variantGroups?.forEach((group) => {
                if (group.options[0]) {
                    initialSelections[group.name] = group.options[0];
                }
            });
            return initialSelections;
        }
    );
    const [quantity, setQuantity] = useState(1);
    const [giftWrap, setGiftWrap] = useState(false);

    const sizeGroup = product.variantGroups?.find((group) =>
        group.name.toLowerCase().includes('size')
    );
    const selectedSize = sizeGroup ? selectedOptions[sizeGroup.name] : undefined;
    const sizeText = formatDimensions(selectedSize);

    const selectOption = (groupName: string, option: ProductVariantOption) => {
        setSelectedOptions((current) => ({ ...current, [groupName]: option }));
    };

    const handleAddToCart = () => {
        const variantSelections = product.variantGroups
            ?.map((group) => {
                if (selectedOptions[group.name]) {
                    return {
                        groupName: group.name,
                        optionName: selectedOptions[group.name].name,
                    };
                }
                return null;
            })
            .filter(Boolean) as { groupName: string; optionName: string }[];

        const imageUrl = mainImage || galleryImages[0]?.url || undefined;

        // Lazy import to avoid affecting bundle for users who never open a product.
        // eslint-disable-next-line @typescript-eslint/no-floating-promises
        import('./cart/cartStore').then(({ addToCart }) => {
            addToCart({
                productId: product._id,
                productName: product.name,
                imageUrl,
                unitPrice: product.basePrice,
                currency: product.currency ?? 'AED',
                quantity,
                variantSelections,
            });
        });
    };

    return (
        <section className="product-detail-top">
            <div className="product-detail-top__inner">
                {/* ── Gallery ── */}
                <div className="product-detail-top__gallery">
                    <div className="product-detail-top__main-image">
                        {mainImage ? (
                            <img src={mainImage} alt={product.name} />
                        ) : (
                            <div className="product-detail-top__image-fallback">HEIRLOOM BY SK</div>
                        )}
                    </div>

                    {galleryImages.length > 1 && (
                        <div className="product-detail-top__thumbnails">
                            {galleryImages.slice(0, 5).map((image) => (
                                <button
                                    className={`product-detail-top__thumb ${
                                        mainImage === image.url ? 'is-active' : ''
                                    }`}
                                    key={image.url}
                                    type="button"
                                    onClick={() => setMainImage(image.url)}
                                    aria-label={`View ${product.name} image`}
                                >
                                    <img src={image.url} alt="" />
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                {/* ── Info ── */}
                <div className="product-detail-top__info">
                    <h1>{product.name}</h1>

                    <p className="product-detail-top__price">
                        {product.basePrice} {product.currency ?? 'AED'}
                    </p>

                    {product.description && (
                        <p className="product-detail-top__description">{product.description}</p>
                    )}

                    {sizeText && (
                        <p className="product-detail-top__size">SIZE: {sizeText}</p>
                    )}

                    {product.variantGroups?.map((group) => (
                        <div className="product-detail-top__variant" key={group.name}>
                            {!group.name.toLowerCase().includes('size') && (
                                <p className="product-detail-top__variant-label">
                                    {isImageGroup(group.name) ? 'Velvet fabric color' : group.name}
                                    {isImageGroup(group.name) && selectedOptions[group.name]?.name
                                        ? `: ${selectedOptions[group.name].name}`
                                        : ''}
                                </p>
                            )}

                            {isImageGroup(group.name) ? (
                                <div className="product-detail-top__swatches">
                                    {group.options.map((option) => (
                                        <button
                                            className={`product-detail-top__swatch ${
                                                selectedOptions[group.name]?.name === option.name
                                                    ? 'is-active'
                                                    : ''
                                            }`}
                                            key={option.name}
                                            type="button"
                                            onClick={() => selectOption(group.name, option)}
                                            title={option.name}
                                            aria-label={option.name}
                                        >
                                            {option.image?.url ? (
                                                <img src={option.image.url} alt="" />
                                            ) : (
                                                <span>{option.name.slice(0, 1)}</span>
                                            )}
                                        </button>
                                    ))}
                                </div>
                            ) : !group.name.toLowerCase().includes('size') ? (
                                <div className="product-detail-top__buttons">
                                    {group.options.map((option) => (
                                        <button
                                            className={
                                                selectedOptions[group.name]?.name === option.name
                                                    ? 'is-active'
                                                    : ''
                                            }
                                            key={option.name}
                                            type="button"
                                            onClick={() => selectOption(group.name, option)}
                                        >
                                            {option.name}
                                        </button>
                                    ))}
                                </div>
                            ) : (
                                /* Size group: render buttons but still show formatted dimension above */
                                <div className="product-detail-top__buttons">
                                    {group.options.map((option) => (
                                        <button
                                            className={
                                                selectedOptions[group.name]?.name === option.name
                                                    ? 'is-active'
                                                    : ''
                                            }
                                            key={option.name}
                                            type="button"
                                            onClick={() => selectOption(group.name, option)}
                                        >
                                            {option.name}
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                    ))}

                    <p className="product-detail-top__note">
                        NOTE: AN ADDITIONAL CHARGE OF AED 85 APPLIES AT CHECKOUT FOR INTERIOR COLOR
                        CHANGES.
                    </p>

                    <label className="product-detail-top__gift">
                        <input
                            type="checkbox"
                            checked={giftWrap}
                            onChange={(event) => setGiftWrap(event.target.checked)}
                        />
                        <span>ADD A GIFT WRAPPING PAPER (ADDITIONAL 50 AED UPON CHECKOUT)</span>
                    </label>

                    <div className="product-detail-top__cart-row">
                        <div className="product-detail-top__quantity">
                            <p>QUANTITY</p>
                            <div>
                                <button
                                    type="button"
                                    aria-label="Decrease quantity"
                                    onClick={() => setQuantity((v) => Math.max(1, v - 1))}
                                >
                                    −
                                </button>
                                <span>{quantity}</span>
                                <button
                                    type="button"
                                    aria-label="Increase quantity"
                                    onClick={() => setQuantity((v) => v + 1)}
                                >
                                    +
                                </button>
                            </div>
                        </div>

                        <button
                            className="product-detail-top__add"
                            type="button"
                            onClick={handleAddToCart}
                        >
                            ADD TO BAG
                        </button>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default ProductDetailTop;