'use client';

import React, { useEffect, useMemo, useRef, useState } from 'react';

import { CartItem } from './cartTypes';
import {
  getCartItems,
  removeCartItem,
  setCartItemQuantity,
} from './cartStore';
import '../../styles/cart/CartSidebar.css';
import '../../styles/cart/CartStockModal.css';


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
  const [stockModal, setStockModal] = useState<{ 
    show: boolean; 
    message: string;
    type: 'auto_remove' | 'checkout_block';
    outOfStockItems?: CartItem[];
  }>({
    show: false,
    message: '',
    type: 'auto_remove',
    outOfStockItems: [],
  });
  const validatedOpenRef = useRef(false);
  const isProcessingCheckout = useRef(false);

  useEffect(() => {
    const handler = () => {
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

  async function getOutOfStockItems(currentItems: CartItem[]): Promise<CartItem[]> {
    const apiBase = process.env.NEXT_PUBLIC_API_URL || '';
    const normalizedBase = apiBase.replace(/\/+$/u, '').replace(/\/api$/u, '');

    const uniqueIds = Array.from(new Set(currentItems.map((it) => it.productId)));
    if (uniqueIds.length === 0) return [];

    try {
      const response = await fetch(`${normalizedBase}/products`, { method: 'GET' });
      if (!response.ok) return [];
      const data = await response.json();
      if (!(data && data.success && Array.isArray(data.data))) return [];

      const stockById = new Map<string, number>();
      (data.data as any[]).forEach((p) => {
        stockById.set(String(p._id), (p.stock ?? 0) as number);
      });

      return currentItems.filter((it) => {
        const stock = stockById.get(String(it.productId));
        return typeof stock === 'number' && stock <= 0;
      });
    } catch {
      return [];
    }
  }

  async function validateCartStockAndClean(currentItems: CartItem[], showModal: boolean = true) {
    const outOfStockItems = await getOutOfStockItems(currentItems);

    if (outOfStockItems.length === 0) return { removed: [], outOfStock: [] };

    // Remove out of stock items from cart
    for (const item of outOfStockItems) {
      removeCartItem(item.id);
    }

    if (showModal) {
      const names = Array.from(new Set(outOfStockItems.map((r) => r.productName))).slice(0, 3);
      setStockModal({
        show: true,
        message: `${names.join(', ')} ${names.length > 1 ? 'are' : 'is'} out of stock. Removed from your bag.`,
        type: 'auto_remove',
        outOfStockItems,
      });
    }

    return { removed: outOfStockItems, outOfStock: outOfStockItems };
  }

  async function handleCheckout() {
    if (isProcessingCheckout.current) return;
    isProcessingCheckout.current = true;

    const current = getCartItems();
    const outOfStockItems = await getOutOfStockItems(current);

    if (outOfStockItems.length > 0) {
      const names = outOfStockItems.map((item) => item.productName);
      let message = '';
      
      if (names.length === 1) {
        message = `${names[0]} is out of stock. Please remove it from your cart to proceed with checkout.`;
      } else {
        message = `${names.join(', ')} are out of stock. Please remove them from your cart to proceed with checkout.`;
      }

      setStockModal({
        show: true,
        message,
        type: 'checkout_block',
        outOfStockItems,
      });
      
      isProcessingCheckout.current = false;
      return;
    }

    // All items are in stock, proceed to checkout
    window.location.href = '/checkout';
  }

  async function handleRemoveOutOfStockAndProceed() {
    if (!stockModal.outOfStockItems) return;
    
    // Remove all out of stock items
    for (const item of stockModal.outOfStockItems) {
      removeCartItem(item.id);
    }
    
    // Close modal
    setStockModal({ show: false, message: '', type: 'auto_remove', outOfStockItems: [] });
    
    // Check if cart still has items
    const remainingItems = getCartItems();
    if (remainingItems.length === 0) {
      // Cart is empty, just close sidebar
      return;
    }
    
    // Proceed to checkout with remaining items
    window.location.href = '/checkout';
  }

  useEffect(() => {
    if (!isOpen) {
      validatedOpenRef.current = false;
      return;
    }

    if (validatedOpenRef.current) return;
    validatedOpenRef.current = true;

    const current = getCartItems();
    setItems(current);
    setTotalQty(current.reduce((s, i) => s + i.quantity, 0));
    setSubtotal(current.reduce((s, i) => s + (i.unitPrice + (i.giftWrap ? 50 : 0)) * i.quantity, 0));

    validateCartStockAndClean(current, true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  return (
    <>
      {stockModal.show ? (
        <div
          className="heirloom-cart-stock-modal__overlay is-open"
          role="dialog"
          aria-modal="true"
          aria-label={stockModal.type === 'checkout_block' ? 'Out of stock - Cannot checkout' : 'Out of stock'}
          onClick={() => {
            if (stockModal.type !== 'checkout_block') {
              setStockModal({ show: false, message: '', type: 'auto_remove', outOfStockItems: [] });
            }
          }}
        >
          <div
            className="heirloom-cart-stock-modal"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="heirloom-cart-stock-modal__title">
              {stockModal.type === 'checkout_block' ? 'Cannot Proceed to Checkout' : 'Out of Stock'}
            </div>
            <div className="heirloom-cart-stock-modal__message">{stockModal.message}</div>
            
            {stockModal.type === 'checkout_block' && stockModal.outOfStockItems && (
              <div className="heirloom-cart-stock-modal__out-of-stock-list">
                <p className="heirloom-cart-stock-modal__list-title">Items to remove:</p>
                <ul>
                  {stockModal.outOfStockItems.map((item, index) => (
                    <li key={`${item.id}-${index}`}>{item.productName}</li>
                  ))}
                </ul>
              </div>
            )}
            
            <div className="heirloom-cart-stock-modal__buttons">
              {stockModal.type === 'checkout_block' ? (
                <>
                  <button
                    type="button"
                    className="heirloom-cart-stock-modal__cancel"
                    onClick={() => setStockModal({ show: false, message: '', type: 'auto_remove', outOfStockItems: [] })}
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    className="heirloom-cart-stock-modal__remove-and-proceed"
                    onClick={handleRemoveOutOfStockAndProceed}
                  >
                    Remove & Proceed
                  </button>
                </>
              ) : (
                <button
                  type="button"
                  className="heirloom-cart-stock-modal__close"
                  onClick={() => setStockModal({ show: false, message: '', type: 'auto_remove', outOfStockItems: [] })}
                >
                  OK
                </button>
              )}
            </div>
          </div>
        </div>
      ) : null}

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
            disabled={items.length === 0}
          >
            ADD TO CHECKOUT
          </button>
        </div>
      </aside>
    </>
  );
}