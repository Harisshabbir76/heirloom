'use client';

import React, { useEffect, useMemo, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { getCartItems, clearCart } from '../components/cart/cartStore';
import type { CartItem } from '../components/cart/cartTypes';
import '../../app/styles/checkout/Checkout.css';

function formatMoney(amount: number, currency?: string) {
  const cur = currency ?? 'AED';
  return `${cur} ${amount.toFixed(2)}`;
}

function computeShipping(subtotal: number) {
  if (subtotal <= 0) return 0;
  return 20; // Default standard shipping
}

type OrderSummaryData = {
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
};

function OrderPageContent() {
  const searchParams = useSearchParams();
  const [items, setItems] = useState<CartItem[]>([]);
  const [subtotal, setSubtotal] = useState(0);
  const [currency, setCurrency] = useState<string | undefined>(undefined);
  const [placingOrder, setPlacingOrder] = useState(false);
  const [orderData, setOrderData] = useState<OrderSummaryData | null>(null);
  const [billingSame, setBillingSame] = useState(true);

  const formRef = React.useRef<HTMLFormElement>(null);

  const handleGPayClick = () => {
    if (formRef.current) {
      if (!formRef.current.checkValidity()) {
        formRef.current.reportValidity();
        return;
      }
      formRef.current.requestSubmit();
    }
  };

  useEffect(() => {
    const sync = () => {
      const nextItems = getCartItems();
      const nextSubtotal = nextItems.reduce((sum, i) => sum + i.unitPrice * i.quantity, 0);
      setItems(nextItems);
      setSubtotal(nextSubtotal);
      setCurrency(nextItems[0]?.currency);
    };

    sync();

    window.addEventListener('heirloom_cart_updated', sync);
    return () => window.removeEventListener('heirloom_cart_updated', sync);
  }, []);

  const shipping = useMemo(() => computeShipping(subtotal), [subtotal]);
  const total = useMemo(() => subtotal + shipping, [subtotal, shipping]);

  useEffect(() => {
    const sessionId = searchParams.get('session_id');
    if (searchParams.get('payment') !== 'success' || !sessionId) return;

    const verifyPayment = async () => {
      const apiBase = process.env.NEXT_PUBLIC_API_URL || '';
      const normalizedBase = apiBase.replace(/\/+$/u, '').replace(/\/api$/u, '');
      const response = await fetch(`${normalizedBase}/api/orders/checkout-session/${sessionId}`);
      const data = await response.json();
      if (data.success && data.data.paymentStatus === 'paid') {
        setOrderData({
          items: data.data.items,
          subtotal: data.data.subtotal,
          shipping: data.data.shipping,
          total: data.data.total,
          currency: data.data.currency,
          contact: data.data.contact,
        });
        clearCart();
      }
    };

    verifyPayment();
  }, [searchParams]);

  async function handlePlaceOrder(e: React.FormEvent) {
    e.preventDefault();
    if (items.length === 0 || placingOrder) return;

    setPlacingOrder(true);
    try {
      const formData = new FormData(e.currentTarget as HTMLFormElement);
      const email = formData.get('contact') as string || '';
      const firstName = formData.get('firstName') as string || '';
      const lastName = formData.get('lastName') as string || '';
      const address = formData.get('address') as string || '';
      const apartment = formData.get('apartment') as string || '';
      const city = formData.get('city') as string || '';
      const emirate = formData.get('emirate') as string || '';
      const contact = { firstName, lastName, address, apartment, city, emirate, email };

      const apiBase = process.env.NEXT_PUBLIC_API_URL || '';
      const normalizedBase = apiBase.replace(/\/+$/u, '').replace(/\/api$/u, '');

      // Generate a unique client-side UUID as the operation_id (with safe browser fallback)
      const operation_id = (typeof self !== 'undefined' && self.crypto && typeof self.crypto.randomUUID === 'function')
        ? self.crypto.randomUUID()
        : 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
            const r = Math.random() * 16 | 0;
            const v = c === 'x' ? r : (r & 0x3 | 0x8);
            return v.toString(16);
          });

      const response = await fetch(`${normalizedBase}/api/checkout/create-intent`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items,
          subtotal,
          shipping,
          total,
          currency: currency ?? 'AED',
          contact,
          operation_id,
        }),
      });

      const data = await response.json().catch(() => null);
      if (!response.ok) {
        throw new Error(data?.message || 'Unable to start payment');
      }

      // Execute browser redirect directly to Ziina hosted checkout
      if (data.redirect_url) {
        window.location.href = data.redirect_url;
      } else {
        throw new Error('Redirect URL not returned by payment gateway.');
      }
    } catch (err: any) {
      alert(err.message || 'An error occurred during checkout.');
    } finally {
      setPlacingOrder(false);
    }
  }

  const isEmpty = items.length === 0;

  if (orderData) {
    return (
      <main className="checkout-page checkout-page--success">
        <div className="checkout-success-container">
          <div className="checkout-success-header">
            <h1 className="checkout-success__title">Thank You For Your Order!</h1>
            <p className="checkout-success__body">
              Your order has been securely processed. You will receive an email confirmation shortly at <strong>{orderData.contact.email}</strong>.
            </p>
          </div>

          <div className="checkout-success-details">
            <div className="success-section">
              <h2>Customer Information</h2>
              <div className="success-info-grid">
                <div>
                  <strong>Shipping Address</strong>
                  <p>
                    {orderData.contact.firstName} {orderData.contact.lastName}<br />
                    {orderData.contact.address}<br />
                    {orderData.contact.apartment && <>{orderData.contact.apartment}<br /></>}
                    {orderData.contact.city}, {orderData.contact.emirate}<br />
                    United Arab Emirates
                  </p>
                </div>
              </div>
            </div>

            <div className="success-section">
              <h2>Order Summary</h2>
              <div className="success-items">
                {orderData.items.map((item) => (
                  <div key={item.id} className="checkout-item">
                    <div className="checkout-item__image-wrap">
                      <div className="checkout-item__image">
                        {item.imageUrl ? <img src={item.imageUrl} alt={item.productName} /> : null}
                      </div>
                      <span className="checkout-item__badge">{item.quantity}</span>
                    </div>
                    <div className="checkout-item__main">
                      <div className="checkout-item__name">{item.productName}</div>
                      {item.variantSelections.length > 0 ? (
                        <div className="checkout-item__variants">
                          {item.variantSelections.map((v) => (
                            <span key={`${item.id}-${v.groupName}`}>
                              {v.optionName}
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
                  <span className="summary-val">{formatMoney(orderData.subtotal, orderData.currency)}</span>
                </div>
                <div className="summary-row">
                  <span>Standard Shipping</span>
                  <span className="summary-val">{formatMoney(orderData.shipping, orderData.currency)}</span>
                </div>
                <div className="summary-divider" />
                <div className="summary-row summary-row--total">
                  <span className="total-label">Total Paid</span>
                  <span className="total-val">
                    <span className="total-currency">{orderData.currency}</span>
                    {orderData.total.toFixed(2)}
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

  return (
    <main className="checkout-page">
      <div className="checkout-header-mobile">
        <h1>Heirloom By SK</h1>
      </div>

      <div className="checkout-grid">
        <section className="checkout-form-section" aria-label="Checkout form">
          <div className="checkout-form-inner">
            <h1 className="checkout-desktop-title">Heirloom By SK</h1>

            <div className="express-checkout">
              <p className="express-checkout__title">Express checkout</p>
              <button
                onClick={handleGPayClick}
                className="express-btn gpay"
                type="button"
                disabled={isEmpty || placingOrder}
              >
                <img src="https://upload.wikimedia.org/wikipedia/commons/f/f2/Google_Pay_Logo.svg" alt="Google Pay" height="20" />
              </button>
            </div>

            <div className="checkout-divider">
              <span>OR</span>
            </div>

            <form ref={formRef} onSubmit={handlePlaceOrder} className="checkout-form">
              <div className="checkout-section">
                <div className="checkout-section__header">
                  <h2>Contact</h2>
                  <a href="/login" className="checkout-link">Sign in</a>
                </div>
                <div className="form-group">
                  <input required type="text" name="contact" placeholder="Email or mobile phone number" />
                </div>
              </div>

              <div className="checkout-section">
                <div className="checkout-section__header">
                  <h2>Delivery</h2>
                </div>
                <div className="form-group">
                  <select required name="country">
                    <option value="UAE">United Arab Emirates</option>
                  </select>
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <input type="text" name="firstName" placeholder="First name (optional)" />
                  </div>
                  <div className="form-group">
                    <input required type="text" name="lastName" placeholder="Last name" />
                  </div>
                </div>
                <div className="form-group">
                  <input required type="text" name="address" placeholder="Address" />
                </div>
                <div className="form-group">
                  <input type="text" name="apartment" placeholder="Apartment, suite, etc. (optional)" />
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <input required type="text" name="city" placeholder="City" />
                  </div>
                  <div className="form-group">
                    <select required name="emirate">
                      <option value="">Emirate</option>
                      <option value="Abu Dhabi">Abu Dhabi</option>
                      <option value="Dubai">Dubai</option>
                      <option value="Sharjah">Sharjah</option>
                      <option value="Ajman">Ajman</option>
                      <option value="Umm Al Quwain">Umm Al Quwain</option>
                      <option value="Ras Al Khaimah">Ras Al Khaimah</option>
                      <option value="Fujairah">Fujairah</option>
                    </select>
                  </div>
                </div>
                <label className="checkbox-label">
                  <input type="checkbox" name="saveInfo" />
                  <span>Save this information for next time</span>
                </label>
              </div>

              <div className="checkout-section">
                <div className="checkout-section__header">
                  <h2>Payment</h2>
                </div>
                <p className="checkout-subtitle">All transactions are secure and encrypted.</p>

                <div className="payment-box">
                  <div className="payment-box__header">
                    <span className="payment-box__title">Credit card</span>
                    <div className="payment-icons">
                      <img src="https://cdn.shopify.com/s/assets/payment_icons/visa-319d545c6fd255c9aad5eeaad21fd6f7f7b4fdbdb1a35ce83b89cca12a187f00.svg" alt="Visa" />
                      <img src="https://upload.wikimedia.org/wikipedia/commons/2/2a/Mastercard-logo.svg" alt="Mastercard" />
                      <img src="https://upload.wikimedia.org/wikipedia/commons/f/fa/American_Express_logo_%282018%29.svg" alt="Amex" />
                    </div>
                  </div>
                  <div className="payment-box__body">
                    <div className="form-group">
                      <input required type="text" name="cardNumber" placeholder="Card number" />
                      <svg className="input-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                        <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                      </svg>
                    </div>
                    <div className="form-row">
                      <div className="form-group">
                        <input required type="text" name="expDate" placeholder="Expiration date (MM / YY)" />
                      </div>
                      <div className="form-group">
                        <input required type="text" name="securityCode" placeholder="Security code" />
                        <svg className="input-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <circle cx="12" cy="12" r="10"></circle>
                          <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"></path>
                          <line x1="12" y1="17" x2="12.01" y2="17"></line>
                        </svg>
                      </div>
                    </div>
                    <div className="form-group">
                      <input required type="text" name="nameOnCard" placeholder="Name on card" />
                    </div>
                  </div>
                </div>

                <label className="checkbox-label" style={{ marginTop: '16px', marginBottom: billingSame ? '0' : '16px' }}>
                  <input
                    type="checkbox"
                    name="billingSame"
                    checked={billingSame}
                    onChange={(e) => setBillingSame(e.target.checked)}
                  />
                  <span>Use shipping address as billing address</span>
                </label>

                {!billingSame && (
                  <div className="billing-address-section">
                    <h3 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '16px', color: '#350008' }}>Billing address</h3>
                    <div className="form-group">
                      <select required name="billingCountry">
                        <option value="UAE">United Arab Emirates</option>
                      </select>
                    </div>
                    <div className="form-row">
                      <div className="form-group">
                        <input type="text" name="billingFirstName" placeholder="First name (optional)" />
                      </div>
                      <div className="form-group">
                        <input required type="text" name="billingLastName" placeholder="Last name" />
                      </div>
                    </div>
                    <div className="form-group">
                      <input required type="text" name="billingAddress" placeholder="Address" />
                    </div>
                    <div className="form-group">
                      <input type="text" name="billingApartment" placeholder="Apartment, suite, etc. (optional)" />
                    </div>
                    <div className="form-row">
                      <div className="form-group">
                        <input required type="text" name="billingCity" placeholder="City" />
                      </div>
                      <div className="form-group">
                        <select required name="billingEmirate">
                          <option value="">Emirate</option>
                          <option value="Abu Dhabi">Abu Dhabi</option>
                          <option value="Dubai">Dubai</option>
                          <option value="Sharjah">Sharjah</option>
                          <option value="Ajman">Ajman</option>
                          <option value="Umm Al Quwain">Umm Al Quwain</option>
                          <option value="Ras Al Khaimah">Ras Al Khaimah</option>
                          <option value="Fujairah">Fujairah</option>
                        </select>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <button
                type="submit"
                className="place-order-btn"
                disabled={isEmpty || placingOrder}
              >
                {isEmpty ? 'Add items to checkout' : placingOrder ? 'Processing...' : 'Pay now'}
              </button>

              
            </form>
          </div>
        </section>

        <aside className="checkout-summary-section" aria-label="Checkout summary">
          <div className="checkout-summary-inner">
            {isEmpty ? (
              <div className="checkout-empty">Your bag is empty.</div>
            ) : (
              <div className="checkout-item-list">
                {items.map((item) => (
                  <div key={item.id} className="checkout-item">
                    <div className="checkout-item__image-wrap">
                      <div className="checkout-item__image">
                        {item.imageUrl ? <img src={item.imageUrl} alt={item.productName} /> : null}
                      </div>
                      <span className="checkout-item__badge">{item.quantity}</span>
                    </div>
                    <div className="checkout-item__main">
                      <div className="checkout-item__name">{item.productName}</div>
                      {item.variantSelections.length > 0 ? (
                        <div className="checkout-item__variants">
                          {item.variantSelections.map((v) => (
                            <span key={`${item.id}-${v.groupName}`}>
                              {v.optionName}
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
            )}

            <div className="checkout-calculations">
              <div className="summary-row">
                <span>Subtotal</span>
                <span className="summary-val">{formatMoney(subtotal, currency)}</span>
              </div>
              <div className="summary-row">
                <span>Standard Shipping</span>
                <span className="summary-val">{formatMoney(shipping, currency)}</span>
              </div>

              <div className="summary-divider" />

              <div className="summary-row summary-row--total">
                <span className="total-label">Total</span>
                <span className="total-val">
                  <span className="total-currency">{currency ?? 'AED'}</span>
                  {total.toFixed(2)}
                </span>
              </div>
            </div>
          </div>
        </aside>
      </div>
    </main>
  );
}

export default function OrderPage() {
  return (
    <Suspense fallback={<div className="checkout-loading">Loading checkout...</div>}>
      <OrderPageContent />
    </Suspense>
  );
}
