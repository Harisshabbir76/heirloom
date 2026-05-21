'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { CartItem } from './cartTypes';
import {
  getCartItems,
  removeCartItem,
  setCartItemQuantity,
} from './cartStore';
import '../../styles/cart/CartSidebar.css';

export type CartSidebarProps = {
  isOpen: boolean;
  onClose: () => void;
};

function formatMoney(amount: number, currency?: string) {
  const cur = currency ?? 'AED';
  return `${amount} ${cur}`;
}

export default function CartSidebar({ isOpen, onClose }: CartSidebarProps) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [totalQty, setTotalQty] = useState(0);
  const [subtotal, setSubtotal] = useState(0);

  useEffect(() => {
    const handler = () => {
      // Intentionally update state only from the event callback.
      const nextItems = getCartItems();
      const nextTotalQty = nextItems.reduce((s, i) => s + i.quantity, 0);
      const nextSubtotal = nextItems.reduce((s, i) => s + i.unitPrice * i.quantity, 0);

      setItems(nextItems);
      setTotalQty(nextTotalQty);
      setSubtotal(nextSubtotal);
    };

    handler();

    window.addEventListener('heirloom_cart_updated', handler);
    return () => window.removeEventListener('heirloom_cart_updated', handler);
  }, []);


  useEffect(() => {
    if (!isOpen) return;

    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };

    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [isOpen, onClose]);

  const totalLabelCurrency = useMemo(() => items[0]?.currency, [items]);

  return (
    <>
      <div
        className={`heirloom-cart-sidebar__overlay ${isOpen ? 'is-open' : ''}`}
        onClick={onClose}
        aria-hidden={!isOpen}
      />
      <aside className={`heirloom-cart-sidebar ${isOpen ? 'is-open' : ''}`} aria-hidden={!isOpen}>
        <div className="heirloom-cart-sidebar__header">
          <div>
            <div className="heirloom-cart-sidebar__title">CART</div>
            <div className="heirloom-cart-sidebar__meta">{totalQty} item{totalQty === 1 ? '' : 's'}</div>
          </div>
          <button className="heirloom-cart-sidebar__close" type="button" onClick={onClose} aria-label="Close">
            ×
          </button>
        </div>

        <div className="heirloom-cart-sidebar__body">
          {items.length === 0 ? (
            <div className="heirloom-cart-sidebar__empty">Your bag is empty.</div>
          ) : (
            items.map((item) => (
              <div className="heirloom-cart-sidebar__item" key={item.id}>
                <div className="heirloom-cart-sidebar__item-image">
                  {item.imageUrl ? <img src={item.imageUrl} alt={item.productName} /> : null}
                </div>

                <div className="heirloom-cart-sidebar__item-main">
                  <div className="heirloom-cart-sidebar__item-name">{item.productName}</div>

                  {item.variantSelections.length > 0 ? (
                    <div className="heirloom-cart-sidebar__item-variant">
                      {item.variantSelections.map((v) => (
                        <span key={`${item.id}-${v.groupName}`}>{v.groupName}: {v.optionName}</span>
                      ))}
                    </div>
                  ) : null}

                  <div className="heirloom-cart-sidebar__item-qtyrow">
                    <div className="heirloom-cart-sidebar__qty-label">QUANTITY</div>
                    <div className="heirloom-cart-sidebar__qty-controls">
                      <button
                        type="button"
                        onClick={() => setCartItemQuantity(item.id, item.quantity - 1)}
                        aria-label="Decrease quantity"
                      >
                        -
                      </button>
                      <span className="heirloom-cart-sidebar__qty-value">{item.quantity}</span>
                      <button
                        type="button"
                        onClick={() => setCartItemQuantity(item.id, item.quantity + 1)}
                        aria-label="Increase quantity"
                      >
                        +
                      </button>
                    </div>
                  </div>

                  <div className="heirloom-cart-sidebar__item-total">
                    {formatMoney(item.unitPrice * item.quantity, item.currency)}
                  </div>

                  <button
                    className="heirloom-cart-sidebar__remove"
                    type="button"
                    onClick={() => removeCartItem(item.id)}
                  >
                    REMOVE
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        <div className="heirloom-cart-sidebar__footer">
          <div className="heirloom-cart-sidebar__subtotal">
            <span>Subtotal</span>
            <span>{formatMoney(subtotal, totalLabelCurrency)}</span>
          </div>
          <button
            type="button"
            className="heirloom-cart-sidebar__checkout"
            onClick={() => {
              window.location.href = '/checkout';
            }}
            disabled={items.length === 0}
          >
            ADD TO CHECKOUT
          </button>
        </div>
      </aside>
    </>
  );
}

