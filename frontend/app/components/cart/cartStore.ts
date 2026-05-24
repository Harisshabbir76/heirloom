import { CartItem } from './cartTypes';

const CART_KEY = 'heirloom_cart_v1';

type CartSnapshot = {
  items: CartItem[];
};

function safeParseCart(raw: string | null): CartSnapshot {
  if (!raw) return { items: [] };
  try {
    const parsed = JSON.parse(raw) as CartSnapshot;
    if (!parsed || !Array.isArray(parsed.items)) return { items: [] };
    return parsed;
  } catch {
    return { items: [] };
  }
}

function readCart(): CartSnapshot {
  if (typeof window === 'undefined') return { items: [] };
  return safeParseCart(window.localStorage.getItem(CART_KEY));
}

function writeCart(snapshot: CartSnapshot) {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(CART_KEY, JSON.stringify(snapshot));
}

function createItemId(productId: string, variantSelections: CartItem['variantSelections'], giftWrap?: boolean) {
  const variantPart = variantSelections
    .slice()
    .sort((a, b) => a.groupName.localeCompare(b.groupName))
    .map((v) => `${v.groupName}:${v.optionName}`)
    .join('|');

  return `${productId}::${variantPart}${giftWrap ? '::giftwrap' : ''}`;
}

export function getCartItems(): CartItem[] {
  return readCart().items;
}

export function getCartTotalQuantity(): number {
  return getCartItems().reduce((sum, item) => sum + item.quantity, 0);
}

export function getCartSubtotal(): number {
  return getCartItems().reduce((sum, item) => sum + (item.unitPrice + (item.giftWrap ? 50 : 0)) * item.quantity, 0);
}

export function addToCart(input: (Omit<CartItem, 'id'> & { stock?: number })): CartItem {
  if (typeof input.stock === 'number' && input.stock <= 0) {
    const snapshot = readCart();
    const id = createItemId(input.productId, input.variantSelections, input.giftWrap);
    return snapshot.items.find((i) => i.id === id)!;
  }

  const snapshot = readCart();
  const id = createItemId(input.productId, input.variantSelections, input.giftWrap);

  const qtyToAdd = Math.max(0, Math.floor(input.quantity));
  if (qtyToAdd <= 0) {
    return snapshot.items.find((i) => i.id === id)!;
  }

  const existing = snapshot.items.find((i) => i.id === id);
  if (existing) {
    existing.quantity = Math.max(0, existing.quantity + qtyToAdd);
  } else {
    snapshot.items.push({ ...input, quantity: qtyToAdd, id });
  }

  writeCart(snapshot);

  // Dispatch event for components to update without extra wiring
  window.dispatchEvent(new Event('heirloom_cart_updated'));

  return snapshot.items.find((i) => i.id === id)!;
}


export function setCartItemQuantity(id: string, quantity: number) {
  const snapshot = readCart();
  const nextQty = Math.max(0, Math.floor(quantity));
  snapshot.items = snapshot.items
    .map((i) => (i.id === id ? { ...i, quantity: nextQty } : i))
    .filter((i) => i.quantity > 0);

  writeCart(snapshot);
  window.dispatchEvent(new Event('heirloom_cart_updated'));
}

export function removeCartItem(id: string) {
  const snapshot = readCart();
  snapshot.items = snapshot.items.filter((i) => i.id !== id);
  writeCart(snapshot);
  window.dispatchEvent(new Event('heirloom_cart_updated'));
}

export function clearCart() {
  writeCart({ items: [] });
  window.dispatchEvent(new Event('heirloom_cart_updated'));
}

