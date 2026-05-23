'use client';

import React, { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import '../../../../../../styles/AddProduct.css';
import '../../../../../../styles/Dashboard.css';
import '../../../../../../styles/contact.css';
import { hasDashboardAccess } from '../../../../../../lib/dashboardAuth';
import DashboardSidebar from '../../../../../../components/DashboardSidebar';

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
    price?: string | number;
}

interface ExistingImage {
    url: string;
    cloudinaryId?: string;
}

interface VariantGroup {
    name: string;
    options: VariantOption[];
    hasVariantPrice?: boolean;
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
    const [modal, setModal] = useState<{ show: boolean; message: string; success: boolean }>({ show: false, message: '', success: false });
    const [confirmModal, setConfirmModal] = useState<{ show: boolean; groupIndex: number | null; groupName: string }>({ show: false, groupIndex: null, groupName: '' });

    useEffect(() => {
        const checkAuth = async () => {
            const result = await hasDashboardAccess();
            if (!result.allowed) {
                router.replace('/404');
                setIsAuthorized(false);
            } else {
                setIsAuthorized(true);
            }
        };
        checkAuth();
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
                        basePrice: p.basePrice != null ? String(p.basePrice) : '',
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
                <p className="dashboard-kicker" style={{ marginTop: '40px' }}>Loading product data…</p>
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
        newGroups[gIdx].options.push({
            name: '',
            dimensions: { length: '', width: '', height: '', description: '' },
            price: '',
        });
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

    const removeOption = (gIdx: number, oIdx: number) => {
        const newGroups = [...variantGroups];
        newGroups[gIdx].options = newGroups[gIdx].options.filter((_, i) => i !== oIdx);
        setVariantGroups(newGroups);
    };

    const confirmRemoveGroup = (gIdx: number, groupName: string) => {
        setConfirmModal({ show: true, groupIndex: gIdx, groupName: groupName || 'this group' });
    };

    const handleRemoveGroup = () => {
        if (confirmModal.groupIndex !== null) {
            setVariantGroups(prev => prev.filter((_, i) => i !== confirmModal.groupIndex));
        }
        setConfirmModal({ show: false, groupIndex: null, groupName: '' });
    };

    const cancelRemoveGroup = () => {
        setConfirmModal({ show: false, groupIndex: null, groupName: '' });
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

        for (const group of variantGroups) {
            if (!group.name.trim()) {
                alert('Please provide a name for all variant groups (e.g., "Size" or "Design")');
                setSaving(false);
                return;
            }
            if (group.options.length === 0) {
                alert(`Please add at least one option to the "${group.name}" group`);
                setSaving(false);
                return;
            }
            for (const option of group.options) {
                if (!option.name.trim()) {
                    alert(`Please provide a name for all options in the "${group.name}" group`);
                    setSaving(false);
                    return;
                }
                if (group.hasVariantPrice && (option.price === undefined || option.price === null || option.price === '')) {
                    alert(`Please set a price for all options in the priced variant group "${group.name}"`);
                    setSaving(false);
                    return;
                }
                if (group.hasVariantPrice && option.price !== undefined && option.price !== null && option.price !== '' && Number.isNaN(Number(option.price))) {
                    alert(`Please use a valid number for option pricing in "${group.name}"`);
                    setSaving(false);
                    return;
                }
            }
        }

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
            hasVariantPrice: Boolean(group.hasVariantPrice),
            options: group.options.map((opt) => ({
                name: opt.name,
                dimensions: opt.dimensions,
                image: opt.image instanceof File ? undefined : opt.image,
                price: group.hasVariantPrice ? opt.price : undefined,
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
                setModal({ show: true, message: 'Product updated successfully!', success: true });
                setTimeout(() => {
                    setModal({ show: false, message: '', success: true });
                    router.push('/heirloom/admin/panel/dashboard');
                }, 2500);
            } else {
                setModal({ show: true, message: 'Failed to update product', success: false });
                setTimeout(() => setModal({ show: false, message: '', success: false }), 2500);
            }
        } catch (error) {
            console.error('Update Error:', error);
            setModal({ show: true, message: 'Failed to update product', success: false });
            setTimeout(() => setModal({ show: false, message: '', success: false }), 2500);
        } finally {
            setSaving(false);
        }
    };

    /* ── Render ──────────────────────────────────────────── */

    return (
        <div className="add-product-container">
            <DashboardSidebar />

            <Link href="/heirloom/admin/panel/dashboard" className="back-link">← Back to Dashboard</Link>

            <div className="form-card">
                <h1 className="dashboard-title form-page-title">EDIT PRODUCT</h1>

                <form onSubmit={handleSubmit} className="form-grid">

                    {/* ── Basic fields ── */}
                    <div className="form-group full-width">
                        <label>Product Name</label>
                        <input type="text" name="name" value={formData.name} onChange={handleProductChange} required />
                    </div>
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
                            <p className="dashboard-kicker" style={{ margin: 0 }}>
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
                                    <button 
                                        type="button" 
                                        onClick={() => confirmRemoveGroup(gIdx, group.name)} 
                                        className="remove-btn"
                                    >
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
                                        <span className="dashboard-kicker" style={{ textTransform: 'none', letterSpacing: 0 }}>
                                            Enable variant pricing for this group
                                        </span>
                                    </label>
                                </div>

                                <div style={{ paddingLeft: '12px' }}>
                                    {group.options.map((opt, oIdx) => (
                                        <div key={oIdx} className="variant-card" style={{ background: '#fafafa', marginBottom: '10px' }}>
                                            <div className="variant-header">
                                                <span className="order-card__id">
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
                                                {group.hasVariantPrice && (
                                                    <div className="form-group">
                                                        <label>Option Price (AED)</label>
                                                        <input
                                                            type="number"
                                                            step="0.01"
                                                            value={opt.price ?? ''}
                                                            onChange={(e) => handleOptionChange(gIdx, oIdx, 'price', e.target.value)}
                                                            required
                                                        />
                                                    </div>
                                                )}
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
                
                {/* Success/Error Modal */}
                {modal.show && (
                    <div className="modal-overlay" onClick={() => setModal({ show: false, message: '', success: modal.success })}>
                        <div className="modal-container" onClick={(e) => e.stopPropagation()}>
                            <div className={`modal-icon ${modal.success ? 'modal-icon-success' : 'modal-icon-error'}`}>
                                {modal.success ? '✓' : '✗'}
                            </div>
                            <h3 className="modal-title">
                                {modal.success ? 'Success!' : 'Error!'}
                            </h3>
                            <p className="modal-message">
                                {modal.message}
                            </p>
                            <button
                                className="modal-button"
                                onClick={() => {
                                    setModal({ show: false, message: '', success: modal.success });
                                    if (modal.success) router.push('/heirloom/admin/panel/dashboard');
                                }}
                            >
                                OK
                            </button>
                        </div>
                    </div>
                )}

                {/* Confirmation Modal for removing group */}
                {confirmModal.show && (
                    <div className="modal-overlay" onClick={cancelRemoveGroup}>
                        <div className="modal-container" onClick={(e) => e.stopPropagation()}>
                            <div className="modal-icon modal-icon-warning">
                                ?
                            </div>
                            <h3 className="modal-title">
                                Confirm Removal
                            </h3>
                            <p className="modal-message">
                                Are you sure you want to remove the variant group "{confirmModal.groupName}"? This action cannot be undone.
                            </p>
                            <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', marginTop: '20px' }}>
                                <button
                                    className="modal-button modal-button-cancel"
                                    onClick={cancelRemoveGroup}
                                    style={{ background: '#888' }}
                                >
                                    Cancel
                                </button>
                                <button
                                    className="modal-button modal-button-confirm"
                                    onClick={handleRemoveGroup}
                                    style={{ background: '#d9383a' }}
                                >
                                    Remove
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}