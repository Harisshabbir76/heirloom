'use client';

import React, { useEffect, useState } from 'react';
import { getCartTotalQuantity } from './cartStore';
import { useCartSidebarState } from './CartSidebarState';

export default function CartIcon() {
  const { open } = useCartSidebarState();
  const [qty, setQty] = useState(0);

  useEffect(() => {
    const refresh = () => setQty(getCartTotalQuantity());
    refresh();
    window.addEventListener('heirloom_cart_updated', refresh);
    return () => window.removeEventListener('heirloom_cart_updated', refresh);
  }, []);

  return (
    <button
      type="button"
      className="icon-link"
      aria-label="Cart"
      onClick={open}
      style={{ background: 'transparent', border: 'none', padding: 0 }}
    >
      <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="17"
          height="17"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
          <line x1="3" y1="6" x2="21" y2="6" />
          <path d="M16 10a4 4 0 0 1-8 0" />
        </svg>
        {qty > 0 ? (
          <span
            style={{
              position: 'absolute',
              top: -8,
              right: -10,
              minWidth: 16,
              height: 16,
              padding: '0 5px',
              borderRadius: 999,
              background: '#350008',
              color: '#fffdf7',
              fontSize: 10,
              lineHeight: '16px',
              textAlign: 'center',
              fontFamily: 'Hanken Grotesk, sans-serif',
            }}
          >
            {qty}
          </span>
        ) : null}
      </div>
    </button>
  );
}

