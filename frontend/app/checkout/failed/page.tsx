'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import '../../../styles/checkout/Checkout.css';

export default function FailedPage() {
  const router = useRouter();

  return (
    <main className="checkout-page checkout-page--success">
      <div className="checkout-success-container" style={{ textAlign: 'center', padding: '60px 40px', maxWidth: '650px' }}>
        <div style={{ fontSize: '48px', color: '#d9383a', marginBottom: '16px' }}>⚠</div>
        <h1 className="checkout-success__title" style={{ color: '#350008' }}>Payment Failed</h1>
        <p className="checkout-success__body" style={{ maxWidth: '480px', margin: '0 auto', lineHeight: '1.6' }}>
          We could not process your transaction with the payment gateway. This can happen due to insufficient funds, an expired card, or security filters from your bank.
        </p>

        <div style={{ margin: '32px 0', borderTop: '1px solid rgba(53, 0, 8, 0.1)', paddingTop: '24px' }}>
          <p style={{ fontSize: '15px', color: '#350008', fontWeight: 500, marginBottom: '8px' }}>
            What would you like to do?
          </p>
          <ul style={{ listStyleType: 'none', padding: 0, margin: 0, fontSize: '14px', color: 'rgba(53, 0, 8, 0.7)', lineHeight: '1.8' }}>
            <li>• Double-check your card details and try again.</li>
            <li>• Use an alternative debit/credit card.</li>
            <li>• Contact your bank to approve online payments to Ziina.</li>
          </ul>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', width: '100%', maxWidth: '280px', margin: '0 auto' }}>
          <button 
            className="place-order-btn" 
            style={{ margin: 0 }} 
            onClick={() => router.push('/checkout')}
          >
            Retry with Another Card
          </button>
          
          <button 
            className="place-order-btn" 
            style={{ 
              margin: 0, 
              background: 'transparent', 
              color: '#350008', 
              border: '1px solid rgba(53, 0, 8, 0.2)' 
            }} 
            onClick={() => window.location.href = '/contact-us'}
          >
            Contact Support
          </button>
        </div>
      </div>
    </main>
  );
}
