'use client';

import React, { createContext, useContext, useMemo, useState } from 'react';
import CartSidebar from './CartSidebar';

type CartSidebarState = {
  isOpen: boolean;
  open: () => void;
  close: () => void;
};

const CartSidebarStateContext = createContext<CartSidebarState | null>(null);

export function CartSidebarStateProvider({ children }: { children: React.ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);

  const value = useMemo<CartSidebarState>(
    () => ({
      isOpen,
      open: () => setIsOpen(true),
      close: () => setIsOpen(false),
    }),
    [isOpen]
  );

  return (
    <CartSidebarStateContext.Provider value={value}>
      {children}
      <CartSidebar isOpen={isOpen} onClose={() => setIsOpen(false)} />
    </CartSidebarStateContext.Provider>
  );
}

export function useCartSidebarState() {
  const ctx = useContext(CartSidebarStateContext);
  if (!ctx) throw new Error('useCartSidebarState must be used within provider');
  return ctx;
}

