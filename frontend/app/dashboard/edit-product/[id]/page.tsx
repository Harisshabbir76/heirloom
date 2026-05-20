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
    const [isAuthorized, setIsAuthorized] = useState<boolean | null>(null);

    useEffect(() => {
        hasDashboardAccess().then((allowed) => {
            if (!allowed) {
                router.replace('/404');
            }
            setIsAuthorized(allowed);
        });
    }, [router]);

    const [saving, setSaving] = useState(false);
    
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        basePrice: '',
        stock: '',
    });
    
    const [existingImages, setExistingImages] = useState<ExistingImage[]>([]);
    const [newProductImages, setNewProductImages] = useState<File[]>([]);
    const [newProductPreviews, setNewProductPreviews] = useState<string[]>([]);
    const [mainNewImageIndex, setMainNewImageIndex] = useState<number | null>(null);
    const [variantGroups, setVariantGroups] = useState<VariantGroup[]>([]);

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

    if (isAuthorized === false) {
        return <div className="dashboard-container" />;
    }

    if (isAuthorized === null) {
        return <div className="dashboard-container" />;
    }

    const handleProductChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleNewImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            const files = Array.from(e.target.files);
            setNewProductImages(prev => [...prev, ...files]);
            const newPreviews = files.map(file => URL.createObjectURL(file));
            setNewProductPreviews(prev => [...prev, ...newPreviews]);
        }
    };

    const removeExistingImage = (idx: number) => {
        setExistingImages(prev => prev.filter((_, i) => i !== idx));
    };

    const removeNewImage = (idx: number) => {
        setNewProductImages(prev => prev.filter((_, i) => i !== idx));
        setNewProductPreviews(prev => prev.filter((_, i) => i !== idx));
        setMainNewImageIndex(prev => {
            if (prev === null) return null;
            if (prev === idx) return null;
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
        newGroups[gIdx].options.push({
            name: '',
            dimensions: { length: '', width: '', height: '', description: '' }
        });
        setVariantGroups(newGroups);
    };

    const handleOptionImageChange = (gIdx: number, oIdx: number, e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
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
        if (mainNewImageIndex !== null) {
            data.append('mainNewImageIndex', String(mainNewImageIndex));
        }

        newProductImages.forEach(file => data.append('images', file));

        const groupsToSubmit = variantGroups.map((group) => ({
            name: group.name,
            options: group.options.map((opt) => {
                if (opt.image instanceof File) {
                    return {
                        name: opt.name,
                        dimensions: opt.dimensions,
                        image: undefined,
                    };
                }
                return {
                    name: opt.name,
                    dimensions: opt.dimensions,
                    image: opt.image,
                };
            })
        }));
        data.append('variantGroups', JSON.stringify(groupsToSubmit));

        variantGroups.forEach((group, gIdx) => {
            group.options.forEach((option, oIdx) => {
                if (option.image instanceof File) {
                    data.append(`variantImage_${gIdx}_${oIdx}`, option.image);
                }
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

    if (loading) return <div className="add-product-container">Loading product data...</div>;

    return (
        <div className="add-product-container">
            <DashboardSidebar />
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '12px' }}>
                <Link href="/dashboard" className="back-link">← Back to Dashboard</Link>
            </div>

            <div className="form-card" style={{ maxWidth: '1000px' }}>
                <h1 className="dashboard-title">Edit Product</h1>
                <form onSubmit={handleSubmit} className="form-grid">
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

                    <div className="form-group full-width">
                        <label>Current Images (Click "Set Main" to set main image)</label>
                        <div className="preview-grid">
                            {existingImages.map((img, i) => (
                                <div key={i} className="preview-item" style={{ position: 'relative' }}>
                                    <img src={img.url} />
                                    {/* Explicit X button top-right */}
                                    <button
                                        type="button"
                                        onClick={() => removeExistingImage(i)}
                                        style={{
                                            position: 'absolute',
                                            top: 4,
                                            right: 4,
                                            width: 22,
                                            height: 22,
                                            borderRadius: '50%',
                                            border: 'none',
                                            background: 'rgba(0,0,0,0.65)',
                                            color: '#fff',
                                            fontSize: 13,
                                            lineHeight: '1',
                                            cursor: 'pointer',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            zIndex: 10,
                                            padding: 0,
                                        }}
                                        title="Remove image"
                                    >
                                        ×
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => makeExistingImageMain(i)}
                                        style={{
                                            position: 'absolute',
                                            left: 6,
                                            right: 6,
                                            bottom: 6,
                                            border: 'none',
                                            background: i === 0 && mainNewImageIndex === null ? '#350008' : '#fffdf7',
                                            color: i === 0 && mainNewImageIndex === null ? '#fffdf7' : '#350008',
                                            fontSize: 9,
                                            padding: '4px 0',
                                            cursor: 'pointer',
                                            textTransform: 'uppercase',
                                            zIndex: 9,
                                        }}
                                    >
                                        {i === 0 && mainNewImageIndex === null ? 'Main Image' : 'Set Main'}
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="form-group full-width">
                        <label>Upload New Images</label>
                        <div className="file-input-wrapper">
                            <input type="file" multiple accept="image/*" onChange={handleNewImageChange} style={{ position: 'absolute', opacity: 0, inset: 0 }} />
                            <p>Add more photos</p>
                        </div>
                        <div className="preview-grid">
                            {newProductPreviews.map((url, i) => (
                                <div key={i} className="preview-item" style={{ position: 'relative' }}>
                                    <img src={url} />
                                    {/* Explicit X button top-right */}
                                    <button
                                        type="button"
                                        onClick={() => removeNewImage(i)}
                                        style={{
                                            position: 'absolute',
                                            top: 4,
                                            right: 4,
                                            width: 22,
                                            height: 22,
                                            borderRadius: '50%',
                                            border: 'none',
                                            background: 'rgba(0,0,0,0.65)',
                                            color: '#fff',
                                            fontSize: 13,
                                            lineHeight: '1',
                                            cursor: 'pointer',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            zIndex: 10,
                                            padding: 0,
                                        }}
                                        title="Remove image"
                                    >
                                        ×
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setMainNewImageIndex(i)}
                                        style={{
                                            position: 'absolute',
                                            left: 6,
                                            right: 6,
                                            bottom: 6,
                                            border: 'none',
                                            background: mainNewImageIndex === i ? '#350008' : '#fffdf7',
                                            color: mainNewImageIndex === i ? '#fffdf7' : '#350008',
                                            fontSize: 9,
                                            padding: '4px 0',
                                            cursor: 'pointer',
                                            textTransform: 'uppercase',
                                            zIndex: 9,
                                        }}
                                    >
                                        {mainNewImageIndex === i ? 'Main Image' : 'Set Main'}
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="form-group full-width">
                        <label>Description</label>
                        <textarea name="description" value={formData.description} onChange={handleProductChange} rows={5} required />
                    </div>

                    <div className="variant-section">
                        <h3>Variant Groups</h3>
                        {variantGroups.map((group, gIdx) => (
                            <div key={gIdx} className="variant-card">
                                <input 
                                    value={group.name} 
                                    onChange={(e) => {
                                        const newGroups = [...variantGroups];
                                        newGroups[gIdx].name = e.target.value;
                                        setVariantGroups(newGroups);
                                    }} 
                                    placeholder="Group Name"
                                    style={{ fontWeight: 700, fontSize: '18px', border: 'none', borderBottom: '2px solid #c5a059', outline: 'none', width: '100%', marginBottom: '15px' }}
                                />
                                {group.options.map((opt, oIdx) => (
                                    <div key={oIdx} className="variant-card" style={{ background: '#f9f9f9' }}>
                                        <div className="form-grid">
                                            <div className="form-group">
                                                <label>Option Name</label>
                                                <input value={opt.name} onChange={(e) => {
                                                    const newGroups = [...variantGroups];
                                                    newGroups[gIdx].options[oIdx].name = e.target.value;
                                                    setVariantGroups(newGroups);
                                                }} />
                                            </div>
                                            <div className="form-group">
                                                <label>Image</label>
                                                <input type="file" onChange={(e) => handleOptionImageChange(gIdx, oIdx, e)} />
                                                {(opt.previewUrl || (opt.image && (opt.image as ExistingImage).url)) && (
                                                    <div style={{ position: 'relative', width: '60px', height: '60px', marginTop: '10px' }}>
                                                        <img
                                                            src={opt.previewUrl || (opt.image as ExistingImage).url}
                                                            style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: 4 }}
                                                        />
                                                        <button
                                                            type="button"
                                                            onClick={() => removeVariantImage(gIdx, oIdx)}
                                                            style={{
                                                                position: 'absolute',
                                                                top: 2,
                                                                right: 2,
                                                                width: 18,
                                                                height: 18,
                                                                borderRadius: '50%',
                                                                border: 'none',
                                                                background: 'rgba(0,0,0,0.65)',
                                                                color: '#fff',
                                                                fontSize: 11,
                                                                lineHeight: '1',
                                                                cursor: 'pointer',
                                                                display: 'flex',
                                                                alignItems: 'center',
                                                                justifyContent: 'center',
                                                                zIndex: 10,
                                                                padding: 0,
                                                            }}
                                                            title="Remove image"
                                                        >
                                                            ×
                                                        </button>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                                <button type="button" onClick={() => addOptionToGroup(gIdx)} className="add-variant-btn">+ Add Option</button>
                            </div>
                        ))}
                        <button type="button" onClick={addVariantGroup} className="add-btn" style={{ marginTop: '20px' }}>+ Add Variant Group</button>
                    </div>

                    <button type="submit" className="submit-btn" disabled={saving}>
                        {saving ? 'Updating...' : 'Update Product'}
                    </button>
                </form>
            </div>
        </div>
    );
}