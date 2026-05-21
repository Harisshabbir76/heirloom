'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import '../../styles/checkout/Checkout.css';

export default function CancelPage() {
  const router = useRouter();
  const [countdown, setCountdown] = useState(5);

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          router.push('/checkout');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [router]);

  return (
    <main className="checkout-page checkout-page--success">
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes shrink {
          from { width: 100%; }
          to { width: 0%; }
        }
        .progress-bar-container {
          width: 100%;
          height: 2px;
          background: rgba(53, 0, 8, 0.05);
          margin-top: 24px;
          border-radius: 2px;
          overflow: hidden;
        }
        .progress-bar-fill {
          height: 100%;
          background: #350008;
          animation: shrink 5s linear forwards;
        }
      `}} />
      <div className="checkout-success-container" style={{ textAlign: 'center', padding: '60px 40px', maxWidth: '650px' }}>
        <div style={{ fontSize: '48px', color: '#8c6b12', marginBottom: '16px' }}>⊖</div>
        <h1 className="checkout-success__title" style={{ color: '#350008' }}>Transaction Canceled</h1>
        <p className="checkout-success__body" style={{ maxWidth: '450px', margin: '0 auto', lineHeight: '1.6' }}>
          Your payment session has been canceled. No charges were made, and your checkout details and cart remain intact.
        </p>
        
        <p style={{ fontSize: '13px', color: 'rgba(53, 0, 8, 0.5)', marginTop: '32px' }}>
          Redirecting you back to checkout in <strong>{countdown}</strong> seconds...
        </p>

        <div className="progress-bar-container">
          <div className="progress-bar-fill"></div>
        </div>

        <button 
          className="place-order-btn" 
          style={{ marginTop: '32px', maxWidth: '240px', marginLeft: 'auto', marginRight: 'auto' }} 
          onClick={() => router.push('/checkout')}
        >
          Return to Checkout
        </button>
      </div>
    </main>
  );
}
