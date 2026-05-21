'use client';

import React, { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import '../../../styles/AddProduct.css';
import '../../../styles/Dashboard.css';
import { hasDashboardAccess } from '../../../lib/dashboardAuth';
import DashboardSidebar from '../../../components/DashboardSidebar';

interface VariantOption {
    name: string;
    image?: File | ExistingImage | null;
    previewUrl?: string;
    dimensions: {
        length: string;
        width: string;
        height: string;
        description: string;
    };
}

interface ExistingImage {
    url: string;
    cloudinaryId?: string;
}

interface VariantGroup {
    name: string;
    options: VariantOption[];
}

export default function EditProduct({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [isAuthorized, setIsAuthorized] = useState<boolean | null>(null);

    const [formData, setFormData] = useState({ name: '', description: '', basePrice: '', stock: '' });
    const [existingImages, setExistingImages] = useState<ExistingImage[]>([]);
    const [newProductImages, setNewProductImages] = useState<File[]>([]);
    const [newProductPreviews, setNewProductPreviews] = useState<string[]>([]);
    const [mainNewImageIndex, setMainNewImageIndex] = useState<number | null>(null);
    const [variantGroups, setVariantGroups] = useState<VariantGroup[]>([]);

    useEffect(() => {
        hasDashboardAccess().then((allowed) => {
            if (!allowed) router.replace('/404');
            setIsAuthorized(allowed);
        });
    }, [router]);

    useEffect(() => {
        if (isAuthorized !== true) return;
        const fetchProduct = async () => {
            try {
                const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/products/${id}`);
                const data = await response.json();
                if (data.success) {
                    const p = data.data;
                    setFormData({
                        name: p.name,
                        description: p.description,
                        basePrice: p.basePrice.toString(),
                        stock: p.stock ? p.stock.toString() : '',
                    });
                    setExistingImages(p.images || []);
                    setVariantGroups(p.variantGroups || []);
                }
            } catch (error) {
                console.error('Error fetching product:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchProduct();
    }, [id, isAuthorized]);

    if (isAuthorized === false || isAuthorized === null) {
        return <div className="add-product-container" />;
    }

    if (loading) {
        return (
            <div className="add-product-container">
                <DashboardSidebar />
                <p style={{ color: 'var(--text-light)', marginTop: '40px' }}>Loading product data…</p>
            </div>
        );
    }

    /* ── Handlers ────────────────────────────────────────── */

    const handleProductChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleNewImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            const files = Array.from(e.target.files);
            setNewProductImages(prev => [...prev, ...files]);
            setNewProductPreviews(prev => [...prev, ...files.map(f => URL.createObjectURL(f))]);
        }
    };

    const removeExistingImage = (idx: number) => {
        setExistingImages(prev => prev.filter((_, i) => i !== idx));
    };

    const removeNewImage = (idx: number) => {
        setNewProductImages(prev => prev.filter((_, i) => i !== idx));
        setNewProductPreviews(prev => prev.filter((_, i) => i !== idx));
        setMainNewImageIndex(prev => {
            if (prev === null || prev === idx) return null;
            return prev > idx ? prev - 1 : prev;
        });
    };

    const makeExistingImageMain = (idx: number) => {
        setExistingImages(prev => {
            const selected = prev[idx];
            if (!selected) return prev;
            return [selected, ...prev.filter((_, i) => i !== idx)];
        });
        setMainNewImageIndex(null);
    };

    const addVariantGroup = () => {
        setVariantGroups(prev => [...prev, { name: '', options: [] }]);
    };

    const addOptionToGroup = (gIdx: number) => {
        const newGroups = [...variantGroups];
        newGroups[gIdx].options.push({ name: '', dimensions: { length: '', width: '', height: '', description: '' } });
        setVariantGroups(newGroups);
    };

    const removeOption = (gIdx: number, oIdx: number) => {
        const newGroups = [...variantGroups];
        newGroups[gIdx].options = newGroups[gIdx].options.filter((_, i) => i !== oIdx);
        setVariantGroups(newGroups);
    };

    const removeGroup = (gIdx: number) => {
        setVariantGroups(prev => prev.filter((_, i) => i !== gIdx));
    };

    const handleOptionImageChange = (gIdx: number, oIdx: number, e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files?.[0]) {
            const file = e.target.files[0];
            const newGroups = [...variantGroups];
            newGroups[gIdx].options[oIdx].image = file;
            newGroups[gIdx].options[oIdx].previewUrl = URL.createObjectURL(file);
            setVariantGroups(newGroups);
        }
    };

    const removeVariantImage = (gIdx: number, oIdx: number) => {
        const newGroups = [...variantGroups];
        newGroups[gIdx].options[oIdx].image = null;
        newGroups[gIdx].options[oIdx].previewUrl = undefined;
        setVariantGroups(newGroups);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);

        const data = new FormData();
        data.append('name', formData.name);
        data.append('description', formData.description);
        data.append('basePrice', formData.basePrice);
        data.append('stock', formData.stock);
        data.append('existingImages', JSON.stringify(existingImages));
        if (mainNewImageIndex !== null) data.append('mainNewImageIndex', String(mainNewImageIndex));

        newProductImages.forEach(file => data.append('images', file));

        const groupsToSubmit = variantGroups.map((group) => ({
            name: group.name,
            options: group.options.map((opt) => ({
                name: opt.name,
                dimensions: opt.dimensions,
                image: opt.image instanceof File ? undefined : opt.image,
            })),
        }));
        data.append('variantGroups', JSON.stringify(groupsToSubmit));

        variantGroups.forEach((group, gIdx) => {
            group.options.forEach((option, oIdx) => {
                if (option.image instanceof File) data.append(`variantImage_${gIdx}_${oIdx}`, option.image);
            });
        });

        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/products/${id}`, {
                method: 'PUT',
                body: data,
            });
            const result = await response.json();
            if (result.success) {
                alert('Product updated successfully!');
                router.push('/dashboard');
            } else {
                alert('Error: ' + result.message);
            }
        } catch (error) {
            console.error('Update Error:', error);
            alert('Failed to update product');
        } finally {
            setSaving(false);
        }
    };

    /* ── Render ──────────────────────────────────────────── */

    return (
        <div className="add-product-container">
            <DashboardSidebar />

            <Link href="/dashboard" className="back-link">← Back to Dashboard</Link>

            <div className="form-card">
                <h1 className="dashboard-title" style={{ marginBottom: '32px' }}>Edit Product</h1>

                <form onSubmit={handleSubmit} className="form-grid">

                    {/* ── Basic fields ── */}
                    <div className="form-group full-width">
                        <label>Product Name</label>
                        <input type="text" name="name" value={formData.name} onChange={handleProductChange} required />
                    </div>
                    <div className="form-group">
                        <label>Price (AED)</label>
                        <input type="number" name="basePrice" value={formData.basePrice} onChange={handleProductChange} required />
                    </div>
                    <div className="form-group">
                        <label>Stock</label>
                        <input type="number" name="stock" value={formData.stock} onChange={handleProductChange} />
                    </div>

                    {/* ── Existing images ── */}
                    {existingImages.length > 0 && (
                        <div className="form-group full-width">
                            <label>Current Images — click "Set Main" to reorder</label>
                            <div className="preview-grid">
                                {existingImages.map((img, i) => (
                                    <div key={i} className="img-card">
                                        <img src={img.url} alt={`Product image ${i + 1}`} />
                                        <button
                                            type="button"
                                            className="img-card__remove"
                                            onClick={() => removeExistingImage(i)}
                                            title="Remove image"
                                        >
                                            ×
                                        </button>
                                        <button
                                            type="button"
                                            className={`img-card__set-main ${i === 0 && mainNewImageIndex === null ? 'is-main' : ''}`}
                                            onClick={() => makeExistingImageMain(i)}
                                        >
                                            {i === 0 && mainNewImageIndex === null ? 'Main Image' : 'Set Main'}
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* ── New images ── */}
                    <div className="form-group full-width">
                        <label>Upload New Images</label>
                        <div className="file-input-wrapper">
                            <input
                                type="file"
                                multiple
                                accept="image/*"
                                onChange={handleNewImageChange}
                                style={{ position: 'absolute', opacity: 0, inset: 0, cursor: 'pointer' }}
                            />
                            <p style={{ margin: 0, color: 'var(--text-light)', fontSize: '14px' }}>
                                Click to add more photos
                            </p>
                        </div>
                        {newProductPreviews.length > 0 && (
                            <div className="preview-grid" style={{ marginTop: '12px' }}>
                                {newProductPreviews.map((url, i) => (
                                    <div key={i} className="img-card">
                                        <img src={url} alt={`New image ${i + 1}`} />
                                        <button
                                            type="button"
                                            className="img-card__remove"
                                            onClick={() => removeNewImage(i)}
                                            title="Remove image"
                                        >
                                            ×
                                        </button>
                                        <button
                                            type="button"
                                            className={`img-card__set-main ${mainNewImageIndex === i ? 'is-main' : ''}`}
                                            onClick={() => setMainNewImageIndex(i)}
                                        >
                                            {mainNewImageIndex === i ? 'Main Image' : 'Set Main'}
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* ── Description ── */}
                    <div className="form-group full-width">
                        <label>Description</label>
                        <textarea name="description" value={formData.description} onChange={handleProductChange} rows={5} required />
                    </div>

                    {/* ── Variant groups ── */}
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
                                        className="variant-group-name-input"
                                        value={group.name}
                                        onChange={(e) => {
                                            const ng = [...variantGroups];
                                            ng[gIdx].name = e.target.value;
                                            setVariantGroups(ng);
                                        }}
                                        placeholder="Group name (e.g. Size, Color)"
                                    />
                                    <button type="button" onClick={() => removeGroup(gIdx)} className="remove-btn">
                                        Remove Group
                                    </button>
                                </div>

                                <div style={{ paddingLeft: '12px' }}>
                                    {group.options.map((opt, oIdx) => (
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
                                                        value={opt.name}
                                                        onChange={(e) => {
                                                            const ng = [...variantGroups];
                                                            ng[gIdx].options[oIdx].name = e.target.value;
                                                            setVariantGroups(ng);
                                                        }}
                                                    />
                                                </div>
                                                <div className="form-group">
                                                    <label>Image</label>
                                                    <input type="file" onChange={(e) => handleOptionImageChange(gIdx, oIdx, e)} />
                                                    {(opt.previewUrl || (opt.image && (opt.image as ExistingImage).url)) && (
                                                        <div style={{ position: 'relative', width: '60px', height: '60px', marginTop: '10px' }}>
                                                            <img
                                                                src={opt.previewUrl || (opt.image as ExistingImage).url}
                                                                alt="Variant"
                                                                style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: 4 }}
                                                            />
                                                            <button
                                                                type="button"
                                                                className="img-card__remove"
                                                                onClick={() => removeVariantImage(gIdx, oIdx)}
                                                                title="Remove image"
                                                            >
                                                                ×
                                                            </button>
                                                        </div>
                                                    )}
                                                </div>
                                                <div className="form-group full-width">
                                                    <label>Dimensions (L × W × H)</label>
                                                    <div className="dimension-grid">
                                                        <input
                                                            placeholder="Length"
                                                            value={opt.dimensions.length}
                                                            onChange={(e) => {
                                                                const ng = [...variantGroups];
                                                                ng[gIdx].options[oIdx].dimensions.length = e.target.value;
                                                                setVariantGroups(ng);
                                                            }}
                                                        />
                                                        <input
                                                            placeholder="Width"
                                                            value={opt.dimensions.width}
                                                            onChange={(e) => {
                                                                const ng = [...variantGroups];
                                                                ng[gIdx].options[oIdx].dimensions.width = e.target.value;
                                                                setVariantGroups(ng);
                                                            }}
                                                        />
                                                        <input
                                                            placeholder="Height"
                                                            value={opt.dimensions.height}
                                                            onChange={(e) => {
                                                                const ng = [...variantGroups];
                                                                ng[gIdx].options[oIdx].dimensions.height = e.target.value;
                                                                setVariantGroups(ng);
                                                            }}
                                                        />
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

                    <button type="submit" className="submit-btn" disabled={saving}>
                        {saving ? 'Updating…' : 'Update Product'}
                    </button>
                </form>
            </div>
        </div>
    );
}