'use client';

import React, { useEffect, useState } from 'react';
import '../../../../../styles/Dashboard.css';
import '../../../../../styles/ContentDashboard.css';
import { useRouter } from 'next/navigation';
import { hasDashboardAccess } from '../../../../../lib/dashboardAuth';
import DashboardSidebar from '../../../../../components/DashboardSidebar';

interface Coupon {
  _id: string;
  code: string;
  discountType: 'percentage' | 'fixed';
  discountValue: number;
  productIds: string[];
  appliesToAllProducts: boolean;
  validUntil: string | null;
  isLifetime: boolean;
  isActive: boolean;
  createdAt: string;
}

interface Product {
  _id: string;
  name: string;
}

export default function CouponsPage() {
  const router = useRouter();
  const [isAuthorized, setIsAuthorized] = useState<boolean | null>(null);
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingCoupon, setEditingCoupon] = useState<Coupon | null>(null);

  const [code, setCode] = useState('');
  const [discountType, setDiscountType] = useState<'percentage' | 'fixed'>('percentage');
  const [discountValue, setDiscountValue] = useState('');
  const [appliesToAllProducts, setAppliesToAllProducts] = useState(false);
  const [selectedProductIds, setSelectedProductIds] = useState<string[]>([]);
  const [isLifetime, setIsLifetime] = useState(false);
  const [validUntil, setValidUntil] = useState('');
  const [isActive, setIsActive] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const authorizeAndFetch = async () => {
      const allowed = await hasDashboardAccess();
      if (!allowed) {
        router.replace('/login');
        setIsAuthorized(false);
        setLoading(false);
        return;
      }
      setIsAuthorized(true);
      await Promise.all([fetchCoupons(), fetchProducts()]);
      setLoading(false);
    };
    authorizeAndFetch();
  }, [router]);

  const getBase = () => {
    const base = process.env.NEXT_PUBLIC_API_URL || '';
    return base.replace(/\/+$/u, '').replace(/\/api$/u, '');
  };

  const fetchCoupons = async () => {
    try {
      const response = await fetch(`${getBase()}/api/coupons`);
      const data = await response.json();
      if (data.success) setCoupons(data.data);
    } catch (error) {
      console.error('Error fetching coupons:', error);
    }
  };

  const fetchProducts = async () => {
    try {
      const response = await fetch(`${getBase()}/api/products`);
      const data = await response.json();
      if (data.success) setProducts(data.data);
    } catch (error) {
      console.error('Error fetching products:', error);
    }
  };

  const resetForm = () => {
    setCode('');
    setDiscountType('percentage');
    setDiscountValue('');
    setAppliesToAllProducts(false);
    setSelectedProductIds([]);
    setIsLifetime(false);
    setValidUntil('');
    setIsActive(true);
  };

  const openCreateModal = () => {
    setEditingCoupon(null);
    resetForm();
    setShowModal(true);
  };

  const openEditModal = (coupon: Coupon) => {
    setEditingCoupon(coupon);
    setCode(coupon.code);
    setDiscountType(coupon.discountType);
    setDiscountValue(coupon.discountValue.toString());
    setAppliesToAllProducts(coupon.appliesToAllProducts);
    setSelectedProductIds(coupon.productIds.map((id: any) => id.toString()));
    setIsLifetime(coupon.isLifetime);
    setValidUntil(coupon.validUntil ? coupon.validUntil.split('T')[0] : '');
    setIsActive(coupon.isActive);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingCoupon(null);
  };

  const handleProductToggle = (productId: string) => {
    setSelectedProductIds((prev) =>
      prev.includes(productId)
        ? prev.filter((id) => id !== productId)
        : [...prev, productId]
    );
  };

  const handleSaveCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    if (saving) return;
    setSaving(true);
    try {
      const payload = {
        code,
        discountType,
        discountValue: Number(discountValue),
        productIds: selectedProductIds,
        appliesToAllProducts,
        isLifetime,
        validUntil: validUntil || null,
        isActive,
      };

      const url = editingCoupon
        ? `${getBase()}/api/coupons/${editingCoupon._id}`
        : `${getBase()}/api/coupons`;

      const response = await fetch(url, {
        method: editingCoupon ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await response.json();
      if (data.success) {
        await fetchCoupons();
        closeModal();
      } else {
        alert(data.message || 'Failed to save coupon');
      }
    } catch {
      alert('Failed to save coupon');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteCoupon = async (couponId: string) => {
    if (!confirm('Are you sure you want to delete this coupon?')) return;
    try {
      const response = await fetch(`${getBase()}/api/coupons/${couponId}`, {
        method: 'DELETE',
      });
      const data = await response.json();
      if (data.success) {
        setCoupons((prev) => prev.filter((c) => c._id !== couponId));
      } else {
        alert('Failed to delete coupon');
      }
    } catch {
      alert('Failed to delete coupon');
    }
  };

  const toggleCouponActive = async (coupon: Coupon) => {
    try {
      const response = await fetch(`${getBase()}/api/coupons/${coupon._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...coupon, isActive: !coupon.isActive }),
      });
      const data = await response.json();
      if (data.success) {
        setCoupons((prev) =>
          prev.map((c) => (c._id === coupon._id ? { ...c, isActive: !c.isActive } : c))
        );
      }
    } catch {
      alert('Failed to update coupon status');
    }
  };

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return '—';
    return new Date(dateStr).toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  };

  if (isAuthorized === false || isAuthorized === null) {
    return <div className="dashboard-container" />;
  }

  return (
    <div className="dashboard-container">
      <DashboardSidebar />

      <header className="dashboard-header">
        <h1 className="dashboard-title">Coupons</h1>
        <button className="add-btn" onClick={openCreateModal}>
          + New Coupon
        </button>
      </header>

      <section className="product-list-section">
        <h2 className="section-title">All Coupons</h2>

        {loading ? (
          <div className="no-products">Loading...</div>
        ) : coupons.length === 0 ? (
          <div className="no-products">No coupons yet. Create your first one.</div>
        ) : (
          <div className="products-table-wrapper">
            <table className="products-table">
              <thead>
                <tr>
                  <th>Code</th>
                  <th>Discount</th>
                  <th>Applies To</th>
                  <th>Valid Until</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {coupons.map((coupon) => (
                  <tr key={coupon._id}>
                    <td>
                      <span className="coupon-code">{coupon.code}</span>
                    </td>
                    <td className="coupon-discount">
                      {coupon.discountType === 'percentage'
                        ? `${coupon.discountValue}%`
                        : `AED ${coupon.discountValue}`}
                    </td>
                    <td>{coupon.appliesToAllProducts ? 'All Products' : 'Selected'}</td>
                    <td>{coupon.isLifetime ? 'Lifetime' : formatDate(coupon.validUntil)}</td>
                    <td>
                      <button
                        className={`coupon-status ${coupon.isActive ? 'is-active' : 'is-inactive'}`}
                        onClick={() => toggleCouponActive(coupon)}
                        title="Toggle status"
                      >
                        {coupon.isActive ? 'Active' : 'Inactive'}
                      </button>
                    </td>
                    <td>
                      <div className="table-actions">
                        <button className="edit-link" onClick={() => openEditModal(coupon)}>
                          Edit
                        </button>
                        <button
                          className="delete-link"
                          onClick={() => handleDeleteCoupon(coupon._id)}
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {showModal && (
        <div className="coupon-modal-overlay" onClick={closeModal}>
          <div className="coupon-modal" onClick={(e) => e.stopPropagation()}>
            <div className="coupon-modal__head">
              <h3 className="coupon-modal__title">
                {editingCoupon ? 'Edit Coupon' : 'New Coupon'}
              </h3>
              <button className="coupon-modal__close" onClick={closeModal} aria-label="Close">
                ×
              </button>
            </div>

            <form onSubmit={handleSaveCoupon} className="coupon-form">
              {/* Code */}
              <div className="coupon-field">
                <label className="coupon-label">Coupon Code</label>
                <input
                  type="text"
                  value={code}
                  onChange={(e) => setCode(e.target.value.toUpperCase())}
                  placeholder="e.g. SUMMER20"
                  required
                  className="coupon-input"
                />
              </div>

              {/* Discount Type + Value side by side */}
              <div className="coupon-row">
                <div className="coupon-field">
                  <label className="coupon-label">Type</label>
                  <div className="coupon-toggle">
                    <button
                      type="button"
                      className={`coupon-toggle__btn ${discountType === 'percentage' ? 'is-selected' : ''}`}
                      onClick={() => setDiscountType('percentage')}
                    >
                      Percentage
                    </button>
                    <button
                      type="button"
                      className={`coupon-toggle__btn ${discountType === 'fixed' ? 'is-selected' : ''}`}
                      onClick={() => setDiscountType('fixed')}
                    >
                      Fixed (AED)
                    </button>
                  </div>
                </div>

                <div className="coupon-field">
                  <label className="coupon-label">
                    Value {discountType === 'percentage' ? '(%)' : '(AED)'}
                  </label>
                  <input
                    type="number"
                    value={discountValue}
                    onChange={(e) => setDiscountValue(e.target.value)}
                    placeholder={discountType === 'percentage' ? '20' : '50'}
                    required
                    min="0"
                    max={discountType === 'percentage' ? '100' : undefined}
                    className="coupon-input"
                  />
                </div>
              </div>

              {/* Apply To */}
              <div className="coupon-field">
                <label className="coupon-label">Apply To</label>
                <div className="coupon-toggle">
                  <button
                    type="button"
                    className={`coupon-toggle__btn ${appliesToAllProducts ? 'is-selected' : ''}`}
                    onClick={() => {
                      setAppliesToAllProducts(true);
                      setSelectedProductIds([]);
                    }}
                  >
                    All Products
                  </button>
                  <button
                    type="button"
                    className={`coupon-toggle__btn ${!appliesToAllProducts ? 'is-selected' : ''}`}
                    onClick={() => setAppliesToAllProducts(false)}
                  >
                    Specific
                  </button>
                </div>

                {!appliesToAllProducts && (
                  <div className="coupon-product-list">
                    {products.length === 0 ? (
                      <p className="coupon-empty">No products available</p>
                    ) : (
                      products.map((product) => (
                        <label key={product._id} className="coupon-product-item">
                          <input
                            type="checkbox"
                            checked={selectedProductIds.includes(product._id)}
                            onChange={() => handleProductToggle(product._id)}
                          />
                          <span>{product.name}</span>
                        </label>
                      ))
                    )}
                  </div>
                )}
              </div>

              {/* Validity */}
              <div className="coupon-field">
                <label className="coupon-label">Validity</label>
                <div className="coupon-toggle">
                  <button
                    type="button"
                    className={`coupon-toggle__btn ${isLifetime ? 'is-selected' : ''}`}
                    onClick={() => {
                      setIsLifetime(true);
                      setValidUntil('');
                    }}
                  >
                    Lifetime
                  </button>
                  <button
                    type="button"
                    className={`coupon-toggle__btn ${!isLifetime ? 'is-selected' : ''}`}
                    onClick={() => setIsLifetime(false)}
                  >
                    Set Expiry
                  </button>
                </div>
                {!isLifetime && (
                  <input
                    type="date"
                    value={validUntil}
                    onChange={(e) => setValidUntil(e.target.value)}
                    required={!isLifetime}
                    className="coupon-input"
                    style={{ marginTop: '10px' }}
                  />
                )}
              </div>

              {/* Active toggle — edit only */}
              {editingCoupon && (
                <div className="coupon-field">
                  <label className="coupon-checkbox-row">
                    <input
                      type="checkbox"
                      checked={isActive}
                      onChange={(e) => setIsActive(e.target.checked)}
                    />
                    <span className="coupon-label" style={{ margin: 0 }}>
                      Active
                    </span>
                  </label>
                </div>
              )}

              <div className="coupon-modal__actions">
                <button
                  type="button"
                  className="coupon-btn coupon-btn--ghost"
                  onClick={closeModal}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="coupon-btn coupon-btn--primary"
                  disabled={saving}
                >
                  {saving ? 'Saving…' : editingCoupon ? 'Update' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}