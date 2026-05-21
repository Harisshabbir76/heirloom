'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import '../../../../../styles/AddProduct.css';
import '../../../../../styles/Dashboard.css';
import { hasDashboardAccess } from '../../../../../lib/dashboardAuth';
import DashboardSidebar from '../../../../../components/DashboardSidebar';

interface VariantOption {
    name: string;
    image?: File;
    previewUrl?: string;
    dimensions: {
        length: string;
        width: string;
        height: string;
        description: string;
    };
    price?: string;
}

interface VariantGroup {
    name: string;
    options: VariantOption[];
    hasVariantPrice?: boolean;
}

export default function AddProduct() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [isAuthorized, setIsAuthorized] = useState<boolean | null>(null);

    useEffect(() => {
        hasDashboardAccess().then((allowed) => {
            if (!allowed) router.replace('/404');
            setIsAuthorized(allowed);
        });
    }, [router]);

    const [formData, setFormData] = useState({
        name: '',
        description: '',
        basePrice: '',
        stock: '',
    });
    const [productImages, setProductImages] = useState<File[]>([]);
    const [productPreviews, setProductPreviews] = useState<string[]>([]);
    const [variantGroups, setVariantGroups] = useState<VariantGroup[]>([]);

    if (isAuthorized === false || isAuthorized === null) {
        return <div className="add-product-container" />;
    }

    const handleProductChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleProductImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            const files = Array.from(e.target.files);
            setProductImages(prev => [...prev, ...files]);
            setProductPreviews(prev => [...prev, ...files.map(f => URL.createObjectURL(f))]);
        }
    };

    const removeProductImage = (index: number) => {
        setProductImages(prev => prev.filter((_, i) => i !== index));
        setProductPreviews(prev => prev.filter((_, i) => i !== index));
    };

    const removeVariantImage = (gIdx: number, oIdx: number) => {
        const newGroups = [...variantGroups];
        newGroups[gIdx].options[oIdx].image = undefined;
        newGroups[gIdx].options[oIdx].previewUrl = undefined;
        setVariantGroups(newGroups);
    };

    const addVariantGroup = () => {
        setVariantGroups(prev => [...prev, { name: '', options: [] }]);
    };

    const addOptionToGroup = (gIdx: number) => {
        const newGroups = [...variantGroups];
        newGroups[gIdx].options.push({
            name: '',
            dimensions: { length: '', width: '', height: '', description: '' },
            price: '',
        });
        setVariantGroups(newGroups);
    };

    const handleGroupNameChange = (gIdx: number, name: string) => {
        const newGroups = [...variantGroups];
        newGroups[gIdx].name = name;
        setVariantGroups(newGroups);
    };

    const pricingEnabled = variantGroups.some((group) => group.hasVariantPrice);

    const handleOptionChange = (gIdx: number, oIdx: number, field: string, value: string) => {
        const newGroups = [...variantGroups];
        if (field.includes('.')) {
            const [parent, child] = field.split('.');
            (newGroups[gIdx].options[oIdx] as any)[parent][child] = value;
        } else {
            if (field === 'price') {
                (newGroups[gIdx].options[oIdx] as any).price = value;
            } else {
                (newGroups[gIdx].options[oIdx] as any)[field] = value;
            }
        }
        setVariantGroups(newGroups);
    };

    const toggleVariantPricing = (gIdx: number) => {
        const newGroups = variantGroups.map((group, idx) => ({
            ...group,
            hasVariantPrice: idx === gIdx ? !group.hasVariantPrice : false,
        }));
        setVariantGroups(newGroups);
    };

    const pricedGroupIndex = variantGroups.findIndex((group) => group.hasVariantPrice);

    const handleOptionImageChange = (gIdx: number, oIdx: number, e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files?.[0]) {
            const file = e.target.files[0];
            const newGroups = [...variantGroups];
            newGroups[gIdx].options[oIdx].image = file;
            newGroups[gIdx].options[oIdx].previewUrl = URL.createObjectURL(file);
            setVariantGroups(newGroups);
        }
    };

    const removeGroup = (gIdx: number) => {
        setVariantGroups(prev => prev.filter((_, i) => i !== gIdx));
    };

    const removeOption = (gIdx: number, oIdx: number) => {
        const newGroups = [...variantGroups];
        newGroups[gIdx].options = newGroups[gIdx].options.filter((_, i) => i !== oIdx);
        setVariantGroups(newGroups);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        for (const group of variantGroups) {
            if (!group.name.trim()) {
                alert('Please provide a name for all variant groups (e.g., "Size" or "Design")');
                setLoading(false);
                return;
            }
            if (group.options.length === 0) {
                alert(`Please add at least one option to the "${group.name}" group`);
                setLoading(false);
                return;
            }
            for (const option of group.options) {
                if (!option.name.trim()) {
                    alert(`Please provide a name for all options in the "${group.name}" group`);
                    setLoading(false);
                    return;
                }
                if (group.hasVariantPrice && (option.price === undefined || option.price === null || option.price === '')) {
                    alert(`Please set a price for all options in the priced variant group "${group.name}"`);
                    setLoading(false);
                    return;
                }
                if (group.hasVariantPrice && option.price !== undefined && option.price !== null && option.price !== '' && Number.isNaN(Number(option.price))) {
                    alert(`Please use a valid number for option pricing in "${group.name}"`);
                    setLoading(false);
                    return;
                }
            }
        }

        const data = new FormData();
        data.append('name', formData.name);
        data.append('description', formData.description);
        data.append('basePrice', formData.basePrice);
        if (formData.stock) data.append('stock', formData.stock);
        productImages.forEach(file => data.append('images', file));

        const groupsToSubmit = variantGroups.map((group) => ({
            name: group.name,
            hasVariantPrice: Boolean(group.hasVariantPrice),
            options: group.options.map(({ image, previewUrl, ...rest }) => ({
                ...rest,
                price: group.hasVariantPrice ? rest.price : undefined,
            })),
        }));
        data.append('variantGroups', JSON.stringify(groupsToSubmit));

        variantGroups.forEach((group, gIdx) => {
            group.options.forEach((option, oIdx) => {
                if (option.image) data.append(`variantImage_${gIdx}_${oIdx}`, option.image);
            });
        });

        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/products`, {
                method: 'POST',
                body: data,
            });
            const result = await response.json();
            if (result.success) {
                alert('Product added successfully!');
                router.push('/heirloom/admin/panel/dashboard');
            } else {
                alert('Server Error: ' + (result.message || 'Unknown error occurred'));
            }
        } catch (error) {
            console.error('Submit Error:', error);
            alert('Failed to add product');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="add-product-container">
            <DashboardSidebar />

            <Link href="/heirloom/admin/panel/dashboard" className="back-link">← Back to Dashboard</Link>

            <div className="form-card">
                <h1 className="dashboard-title" style={{ marginBottom: '32px' }}>Add New Product</h1>

                <form onSubmit={handleSubmit} className="form-grid">
                    {/* Name */}
                    <div className="form-group full-width">
                        <label>Product Name</label>
                        <input type="text" name="name" value={formData.name} onChange={handleProductChange} required />
                    </div>

                    {/* Price + Stock */}
                    <div className="form-group">
                        <label>Price (AED){pricingEnabled ? ' (optional when variant pricing enabled)' : ''}</label>
                        <input
                            type="number"
                            name="basePrice"
                            value={formData.basePrice}
                            onChange={handleProductChange}
                            required={!pricingEnabled}
                        />
                    </div>
                    <div className="form-group">
                        <label>Stock (Optional)</label>
                        <input type="number" name="stock" value={formData.stock} onChange={handleProductChange} />
                    </div>

                    {/* Product Images */}
                    <div className="form-group full-width">
                        <label>Product Images</label>
                        <div className="file-input-wrapper">
                            <input
                                type="file"
                                accept="image/*"
                                multiple
                                onChange={handleProductImageChange}
                                style={{ position: 'absolute', opacity: 0, inset: 0, cursor: 'pointer' }}
                            />
                            <p style={{ margin: 0, color: 'var(--text-light)', fontSize: '14px' }}>
                                Click to upload gallery images
                            </p>
                        </div>
                        {productPreviews.length > 0 && (
                            <div className="preview-grid">
                                {productPreviews.map((url, i) => (
                                    <div key={i} className="preview-item" onClick={() => removeProductImage(i)}>
                                        <img src={url} alt={`Preview ${i + 1}`} />
                                        <div className="remove-img-overlay"><span>×</span></div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Description */}
                    <div className="form-group full-width">
                        <label>Description</label>
                        <textarea name="description" value={formData.description} onChange={handleProductChange} rows={4} required />
                    </div>

                    {/* Variant Groups */}
                    <div className="variant-section">
                        <div className="variant-section-header">
                            <h3>Variant Groups</h3>
                            <button type="button" onClick={addVariantGroup} className="add-btn" style={{ fontSize: '12px', padding: '10px 18px' }}>
                                + Add Group
                            </button>
                        </div>

                        {variantGroups.map((group, gIdx) => (
                            <div key={gIdx} className="variant-card" style={{ border: '2px solid #eee' }}>
                                <div className="variant-header">
                                    <input
                                        type="text"
                                        placeholder='Group name (e.g. Size, Color)'
                                        value={group.name}
                                        onChange={(e) => handleGroupNameChange(gIdx, e.target.value)}
                                        style={{
                                            fontWeight: 700,
                                            fontSize: '16px',
                                            border: 'none',
                                            borderBottom: '2px solid var(--secondary-luxury)',
                                            outline: 'none',
                                            padding: '4px 0',
                                            width: '100%',
                                            background: 'transparent',
                                            fontFamily: 'inherit',
                                        }}
                                    />
                                    <button type="button" onClick={() => removeGroup(gIdx)} className="remove-btn">
                                        Remove Group
                                    </button>
                                </div>

                                <div style={{ paddingLeft: '12px', marginBottom: '14px' }}>
                                    <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }}>
                                        <input
                                            type="checkbox"
                                            checked={Boolean(group.hasVariantPrice)}
                                            disabled={pricedGroupIndex !== -1 && pricedGroupIndex !== gIdx}
                                            onChange={() => toggleVariantPricing(gIdx)}
                                        />
                                        <span style={{ fontSize: '14px', color: '#333' }}>
                                            Enable variant pricing for this group
                                        </span>
                                    </label>
                                </div>

                                <div style={{ paddingLeft: '12px' }}>
                                    {group.options.map((option, oIdx) => (
                                        <div key={oIdx} className="variant-card" style={{ background: '#fafafa', marginBottom: '10px' }}>
                                            <div className="variant-header">
                                                <span style={{ fontSize: '13px', color: 'var(--text-light)', fontWeight: 600, letterSpacing: '0.5px', textTransform: 'uppercase' }}>
                                                    Option {oIdx + 1}
                                                </span>
                                                <button type="button" onClick={() => removeOption(gIdx, oIdx)} className="remove-btn" style={{ background: '#eee', color: '#888' }}>×</button>
                                            </div>
                                            <div className="form-grid">
                                                <div className="form-group">
                                                    <label>Option Name</label>
                                                    <input
                                                        type="text"
                                                        value={option.name}
                                                        onChange={(e) => handleOptionChange(gIdx, oIdx, 'name', e.target.value)}
                                                        required
                                                    />
                                                </div>
                                                <div className="form-group">
                                                    <label>Option Image</label>
                                                    <input type="file" onChange={(e) => handleOptionImageChange(gIdx, oIdx, e)} />
                                                    {option.previewUrl && (
                                                        <div
                                                            className="preview-item"
                                                            style={{ marginTop: '10px', height: '60px', width: '60px' }}
                                                            onClick={() => removeVariantImage(gIdx, oIdx)}
                                                        >
                                                            <img src={option.previewUrl} alt="Variant" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                                            <div className="remove-img-overlay"><span>×</span></div>
                                                        </div>
                                                    )}
                                                </div>
                                                {group.hasVariantPrice && (
                                                    <div className="form-group">
                                                        <label>Option Price (AED)</label>
                                                        <input
                                                            type="number"
                                                            step="0.01"
                                                            value={option.price ?? ''}
                                                            onChange={(e) => handleOptionChange(gIdx, oIdx, 'price', e.target.value)}
                                                            required
                                                        />
                                                    </div>
                                                )}
                                                <div className="form-group full-width">
                                                    <label>Dimensions (L × W × H)</label>
                                                    <div className="dimension-grid">
                                                        <input placeholder="Length" value={option.dimensions.length} onChange={(e) => handleOptionChange(gIdx, oIdx, 'dimensions.length', e.target.value)} />
                                                        <input placeholder="Width" value={option.dimensions.width} onChange={(e) => handleOptionChange(gIdx, oIdx, 'dimensions.width', e.target.value)} />
                                                        <input placeholder="Height" value={option.dimensions.height} onChange={(e) => handleOptionChange(gIdx, oIdx, 'dimensions.height', e.target.value)} />
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                    <button type="button" onClick={() => addOptionToGroup(gIdx)} className="add-variant-btn">
                                        + Add Option to {group.name || 'Group'}
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>

                    <button type="submit" className="submit-btn" disabled={loading}>
                        {loading ? 'Saving...' : 'Save Product'}
                    </button>
                </form>
            </div>
        </div>
    );
}