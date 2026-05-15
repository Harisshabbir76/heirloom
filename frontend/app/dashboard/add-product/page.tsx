'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import '../../styles/AddProduct.css';
import '../../styles/Dashboard.css';

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
}

export default function AddProduct() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        basePrice: '',
        stock: '',
    });
    const [productImages, setProductImages] = useState<File[]>([]);
    const [productPreviews, setProductPreviews] = useState<string[]>([]);
    const [variantGroups, setVariantGroups] = useState<VariantGroup[]>([]);

    const handleProductChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleProductImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            const files = Array.from(e.target.files);
            setProductImages(prev => [...prev, ...files]);
            const newPreviews = files.map(file => URL.createObjectURL(file));
            setProductPreviews(prev => [...prev, ...newPreviews]);
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
        setVariantGroups(prev => [
            ...prev,
            { name: '', options: [] }
        ]);
    };

    const addOptionToGroup = (gIdx: number) => {
        const newGroups = [...variantGroups];
        newGroups[gIdx].options.push({
            name: '',
            dimensions: { length: '', width: '', height: '', description: '' }
        });
        setVariantGroups(newGroups);
    };

    const handleGroupNameChange = (gIdx: number, name: string) => {
        const newGroups = [...variantGroups];
        newGroups[gIdx].name = name;
        setVariantGroups(newGroups);
    };

    const handleOptionChange = (gIdx: number, oIdx: number, field: string, value: any) => {
        const newGroups = [...variantGroups];
        if (field.includes('.')) {
            const [parent, child] = field.split('.');
            (newGroups[gIdx].options[oIdx] as any)[parent][child] = value;
        } else {
            (newGroups[gIdx].options[oIdx] as any)[field] = value;
        }
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

        // Validate Variant Groups
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
            options: group.options.map(({ image, previewUrl, ...rest }) => rest)
        }));
        data.append('variantGroups', JSON.stringify(groupsToSubmit));

        variantGroups.forEach((group, gIdx) => {
            group.options.forEach((option, oIdx) => {
                if (option.image) {
                    data.append(`variantImage_${gIdx}_${oIdx}`, option.image);
                }
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
                router.push('/dashboard');
            } else {
                alert('Server Error: ' + (result.message || 'Unknown error occurred'));
                console.error('Server Error Details:', result);
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
            <Link href="/dashboard" className="back-link">← Back to Dashboard</Link>
            
            <div className="form-card" style={{ maxWidth: '1000px' }}>
                <h1 className="dashboard-title">Add New Product</h1>
                
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
                        <label>Stock (Optional)</label>
                        <input type="number" name="stock" value={formData.stock} onChange={handleProductChange} />
                    </div>

                    <div className="form-group full-width">
                        <label>Product Images</label>
                        <div className="file-input-wrapper">
                            <input type="file" accept="image/*" multiple onChange={handleProductImageChange} style={{ position: 'absolute', opacity: 0, inset: 0 }} />
                            <p>Upload Gallery</p>
                        </div>
                        <div className="preview-grid">
                            {productPreviews.map((url, i) => (
                                <div key={i} className="preview-item" onClick={() => removeProductImage(i)}>
                                    <img src={url} alt="Preview" />
                                    <div className="remove-img-overlay">
                                        <span>×</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="form-group full-width">
                        <label>Description</label>
                        <textarea name="description" value={formData.description} onChange={handleProductChange} rows={4} required />
                    </div>

                    {/* Variant Groups Section */}
                    <div className="variant-section">
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
                            <h3 style={{ margin: 0 }}>Variant Groups</h3>
                            <button type="button" onClick={addVariantGroup} className="add-btn" style={{ fontSize: '12px' }}>
                                + Add Group
                            </button>
                        </div>

                        {variantGroups.map((group, gIdx) => (
                            <div key={gIdx} className="variant-card" style={{ border: '2px solid #eee' }}>
                                <div className="variant-header">
                                    <input 
                                        type="text" 
                                        placeholder="Enter Group Name (e.g. Size or Color)" 
                                        value={group.name} 
                                        onChange={(e) => handleGroupNameChange(gIdx, e.target.value)}
                                        style={{ 
                                            fontWeight: 700, 
                                            fontSize: '18px',
                                            border: 'none', 
                                            borderBottom: '2px solid var(--secondary-luxury)', 
                                            outline: 'none',
                                            padding: '5px 0',
                                            width: '100%',
                                            marginBottom: '10px'
                                        }}
                                    />
                                    <button type="button" onClick={() => removeGroup(gIdx)} className="remove-btn">Remove Group</button>
                                </div>

                                <div style={{ paddingLeft: '20px' }}>
                                    {group.options.map((option, oIdx) => (
                                        <div key={oIdx} className="variant-card" style={{ background: '#fafafa', marginBottom: '10px' }}>
                                            <div className="variant-header">
                                                <span style={{ fontSize: '14px' }}>Option {oIdx + 1}</span>
                                                <button type="button" onClick={() => removeOption(gIdx, oIdx)} className="remove-btn" style={{ background: '#eee' }}>×</button>
                                            </div>
                                            <div className="form-grid">
                                                <div className="form-group">
                                                    <label>Option Name</label>
                                                    <input type="text" value={option.name} onChange={(e) => handleOptionChange(gIdx, oIdx, 'name', e.target.value)} required />
                                                </div>
                                                <div className="form-group">
                                                    <label>Option Image</label>
                                                    <input type="file" onChange={(e) => handleOptionImageChange(gIdx, oIdx, e)} />
                                                    {option.previewUrl && (
                                                        <div className="preview-item" style={{ marginTop: '10px', height: '60px', width: '60px' }} onClick={() => removeVariantImage(gIdx, oIdx)}>
                                                            <img src={option.previewUrl} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                                            <div className="remove-img-overlay">
                                                                <span>×</span>
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                                <div className="form-group full-width">
                                                    <label>Dimensions</label>
                                                    <div className="dimension-grid">
                                                        <input placeholder="L" value={option.dimensions.length} onChange={(e) => handleOptionChange(gIdx, oIdx, 'dimensions.length', e.target.value)} />
                                                        <input placeholder="W" value={option.dimensions.width} onChange={(e) => handleOptionChange(gIdx, oIdx, 'dimensions.width', e.target.value)} />
                                                        <input placeholder="H" value={option.dimensions.height} onChange={(e) => handleOptionChange(gIdx, oIdx, 'dimensions.height', e.target.value)} />
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
                        {loading ? 'Adding...' : 'Save Product'}
                    </button>
                </form>
            </div>
        </div>
    );
}
