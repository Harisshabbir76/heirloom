'use client';

import React, { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { clearCart } from '../../components/cart/cartStore';
import type { CartItem, CartVariantSelection } from '../../components/cart/cartTypes';
import '../../styles/checkout/Checkout.css';

function formatMoney(amount: number, currency?: string) {
  const cur = currency ?? 'AED';
  return `${cur} ${amount.toFixed(2)}`;
}

type OrderData = {
  items: CartItem[];
  subtotal: number;
  shipping: number;
  total: number;
  currency: string;
  contact: {
    firstName: string;
    lastName: string;
    address: string;
    apartment: string;
    city: string;
    emirate: string;
    email: string;
  };
  paymentStatus: string;
};

function SuccessPageContent() {
  const searchParams = useSearchParams();
  const paymentIntentId = searchParams.get('payment_intent_id');
  const [order, setOrder] = useState<OrderData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!paymentIntentId) {
      setError('No payment intent ID was found in your redirect URL.');
      setLoading(false);
      return;
    }

    const fetchOrder = async () => {
      try {
        const apiBase = process.env.NEXT_PUBLIC_API_URL || '';
        const normalizedBase = apiBase.replace(/\/+$/u, '').replace(/\/api$/u, '');
        const response = await fetch(`${normalizedBase}/api/checkout/order-by-intent/${paymentIntentId}`);
        
        const data = await response.json();

        if (response.ok && data.success && data.data) {
          setOrder(data.data);
          // Transaction verified successfully - clear local cart state
          clearCart();
        } else {
          setError(data.message || 'We were unable to locate your order record.');
        }
      } catch (err: any) {
        console.error('Error fetching order details:', err);
        setError('A connection issue occurred while verifying your order.');
      } finally {
        setLoading(false);
      }
    };

    fetchOrder();
  }, [paymentIntentId]);

  if (loading) {
    return (
      <main className="checkout-page checkout-page--success">
        <style dangerouslySetInnerHTML={{__html: `
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
          .luxury-spinner {
            width: 40px;
            height: 40px;
            border: 2px solid rgba(53, 0, 8, 0.08);
            border-top-color: #350008;
            border-radius: 50%;
            animation: spin 0.8s cubic-bezier(0.4, 0, 0.2, 1) infinite;
            margin: 0 auto;
          }
        `}} />
        <div className="checkout-success-container" style={{ textAlign: 'center', padding: '80px 40px' }}>
          <div className="luxury-spinner"></div>
          <h2 style={{ fontFamily: 'var(--font-cormorant), serif', fontSize: '26px', color: '#350008', marginTop: '24px', letterSpacing: '0.05em' }}>
            VERIFYING YOUR PAYMENT
          </h2>
          <p style={{ fontSize: '14px', color: 'rgba(53, 0, 8, 0.6)', marginTop: '8px' }}>
            Connecting with Ziina Gateway to verify transaction status...
          </p>
        </div>
      </main>
    );
  }

  if (error || !order) {
    return (
      <main className="checkout-page checkout-page--success">
        <div className="checkout-success-container" style={{ textAlign: 'center', padding: '60px 40px' }}>
          <div style={{ fontSize: '48px', color: '#d9383a', marginBottom: '16px' }}>×</div>
          <h1 className="checkout-success__title" style={{ color: '#350008' }}>Verification Delayed</h1>
          <p className="checkout-success__body" style={{ marginBottom: '32px', maxWidth: '500px', marginLeft: 'auto', marginRight: 'auto' }}>
            {error || 'We could not load your order details at this moment. If your payment was completed, your purchase is secure and we will process it shortly.'}
          </p>
          <button className="place-order-btn" style={{ maxWidth: '240px', margin: '0 auto' }} onClick={() => window.location.href = '/'}>
            Return Home
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="checkout-page checkout-page--success">
      <div className="checkout-success-container">
        <div className="checkout-success-header">
          <div style={{ fontSize: '48px', color: '#350008', marginBottom: '8px' }}>✓</div>
          <h1 className="checkout-success__title">Thank You For Your Order!</h1>
          <p className="checkout-success__body">
            Your order has been securely processed. You will receive an email confirmation shortly at <strong>{order.contact.email}</strong>.
          </p>
        </div>

        <div className="checkout-success-details">
          <div className="success-section">
            <h2>Customer Information</h2>
            <div className="success-info-grid">
              <div>
                <strong>Shipping Address</strong>
                <p>
                  {order.contact.firstName} {order.contact.lastName}<br />
                  {order.contact.address}<br />
                  {order.contact.apartment && <>{order.contact.apartment}<br /></>}
                  {order.contact.city}, {order.contact.emirate}<br />
                  United Arab Emirates
                </p>
              </div>
            </div>
          </div>

          <div className="success-section">
            <h2>Order Summary</h2>
            <div className="success-items">
              {order.items.map((item, idx) => (
                <div key={`${item.productName}-${idx}`} className="checkout-item">
                  <div className="checkout-item__image-wrap">
                    <div className="checkout-item__image">
                      {item.imageUrl ? <img src={item.imageUrl} alt={item.productName} /> : null}
                    </div>
                    <span className="checkout-item__badge">{item.quantity}</span>
                  </div>
                  <div className="checkout-item__main">
                    <div className="checkout-item__name">{item.productName}</div>
                    {item.variantSelections && item.variantSelections.length > 0 ? (
                      <div className="checkout-item__variants">
                        {item.variantSelections.map((v: CartVariantSelection, vIdx: number) => (
                          <span key={`${v.groupName}-${vIdx}`} style={{ marginRight: '8px', color: 'rgba(53, 0, 8, 0.6)' }}>
                            {v.groupName}: {v.optionName}
                          </span>
                        ))}
                      </div>
                    ) : null}
                  </div>
                  <div className="checkout-item__price">
                    {formatMoney(item.unitPrice * item.quantity, item.currency)}
                  </div>
                </div>
              ))}
            </div>

            <div className="success-calculations">
              <div className="summary-row">
                <span>Subtotal</span>
                <span className="summary-val">{formatMoney(order.subtotal, order.currency)}</span>
              </div>
              <div className="summary-row">
                <span>Standard Shipping</span>
                <span className="summary-val">{formatMoney(order.shipping, order.currency)}</span>
              </div>
              <div className="summary-divider" />
              <div className="summary-row summary-row--total">
                <span className="total-label">Total Paid</span>
                <span className="total-val">
                  <span className="total-currency">{order.currency}</span>
                  {order.total.toFixed(2)}
                </span>
              </div>
            </div>
          </div>
        </div>

        <button className="place-order-btn" style={{ marginTop: '32px' }} onClick={() => window.location.href = '/'}>
          Continue Shopping
        </button>
      </div>
    </main>
  );
}

export default function SuccessPage() {
  return (
    <Suspense fallback={
      <main className="checkout-page checkout-page--success">
        <div className="checkout-success-container" style={{ textAlign: 'center', padding: '80px 40px' }}>
          <h2 style={{ fontFamily: 'var(--font-cormorant), serif', fontSize: '26px', color: '#350008' }}>
            LOADING STATUS...
          </h2>
        </div>
      </main>
    }>
      <SuccessPageContent />
    </Suspense>
  );
}
