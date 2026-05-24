'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { CartItem } from './cartTypes';
import {
  getCartItems,
  removeCartItem,
  setCartItemQuantity,
} from './cartStore';
import { findCartStockIssue } from './stockValidation';
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
  const [checkingStock, setCheckingStock] = useState(false);
  const [stockModalMessage, setStockModalMessage] = useState<string | null>(null);

  useEffect(() => {
    const handler = () => {
      // Intentionally update state only from the event callback.
      const nextItems = getCartItems();
      const nextTotalQty = nextItems.reduce((s, i) => s + i.quantity, 0);
      const nextSubtotal = nextItems.reduce((s, i) => s + (i.unitPrice + (i.giftWrap ? 50 : 0)) * i.quantity, 0);

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

  const handleCheckout = async () => {
    if (items.length === 0 || checkingStock) return;

    setCheckingStock(true);
    const stockIssue = await findCartStockIssue(items);
    setCheckingStock(false);

    if (stockIssue) {
      setStockModalMessage(stockIssue.message);
      return;
    }

    window.location.href = '/checkout';
  };

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

                  {item.variantSelections.length > 0 || item.giftWrap ? (
                    <div className="heirloom-cart-sidebar__item-variant">
                      {item.variantSelections.map((v) => (
                        <span key={`${item.id}-${v.groupName}`}>{v.groupName}: {v.optionName}</span>
                      ))}
                      {item.giftWrap && (
                        <span>Gift Wrapping: Yes (+50 AED)</span>
                      )}
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
                    {formatMoney((item.unitPrice + (item.giftWrap ? 50 : 0)) * item.quantity, item.currency)}
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
            onClick={handleCheckout}
            disabled={items.length === 0 || checkingStock}
          >
            {checkingStock ? 'CHECKING STOCK...' : 'ADD TO CHECKOUT'}
          </button>
        </div>
      </aside>
      {stockModalMessage && (
        <div className="cart-stock-modal__overlay" onClick={() => setStockModalMessage(null)}>
          <div className="cart-stock-modal__container" onClick={(e) => e.stopPropagation()}>
            <div className="cart-stock-modal__icon">!</div>
            <h3 className="cart-stock-modal__title">Out of Stock</h3>
            <p className="cart-stock-modal__message">{stockModalMessage}</p>
            <button className="cart-stock-modal__button" type="button" onClick={() => setStockModalMessage(null)}>
              OK
            </button>
          </div>
        </div>
      )}
    </>
  );
}

