'use client';

import React, { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import '../../../styles/AddProduct.css';
import '../../../styles/Dashboard.css';

interface VariantOption {
    name: string;
    image?: any; 
    previewUrl?: string;
    dimensions: {
        length: string;
        width: string;
        height: string;
        description: string;
    };
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
    
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        basePrice: '',
        stock: '',
    });
    
    const [existingImages, setExistingImages] = useState<any[]>([]);
    const [newProductImages, setNewProductImages] = useState<File[]>([]);
    const [newProductPreviews, setNewProductPreviews] = useState<string[]>([]);
    const [variantGroups, setVariantGroups] = useState<VariantGroup[]>([]);

    useEffect(() => {
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
    }, [id]);

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

        newProductImages.forEach(file => data.append('images', file));

        const groupsToSubmit = variantGroups.map((group) => ({
            name: group.name,
            options: group.options.map((opt) => {
                const { previewUrl, ...rest } = opt;
                if (opt.image instanceof File) {
                    return { ...rest, image: undefined };
                }
                return rest;
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
            <Link href="/dashboard" className="back-link">← Back to Dashboard</Link>
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
                        <label>Current Images (Click to remove)</label>
                        <div className="preview-grid">
                            {existingImages.map((img, i) => (
                                <div key={i} className="preview-item" onClick={() => removeExistingImage(i)}>
                                    <img src={img.url} />
                                    <div className="remove-img-overlay"><span>×</span></div>
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
                                <div key={i} className="preview-item" onClick={() => removeNewImage(i)}>
                                    <img src={url} />
                                    <div className="remove-img-overlay"><span>×</span></div>
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
                                                {(opt.previewUrl || (opt.image && opt.image.url)) && (
                                                    <div className="preview-item" style={{ width: '60px', height: '60px', marginTop: '10px' }} onClick={() => removeVariantImage(gIdx, oIdx)}>
                                                        <img src={opt.previewUrl || opt.image.url} />
                                                        <div className="remove-img-overlay"><span>×</span></div>
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
