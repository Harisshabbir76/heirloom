import type { CartItem } from './cartTypes';

export type CartStockIssue = {
  item: CartItem;
  message: string;
};

function getProductsApiBase() {
  const apiBase = process.env.NEXT_PUBLIC_API_URL || '';
  const normalizedBase = apiBase.replace(/\/+$/u, '').replace(/\/api$/u, '');
  return `${normalizedBase}/api/products`;
}

export async function findCartStockIssue(items: CartItem[]): Promise<CartStockIssue | null> {
  for (const item of items) {
    try {
      const response = await fetch(`${getProductsApiBase()}/${item.productId}`, {
        cache: 'no-store',
      });
      const data = await response.json().catch(() => null);
      const product = data?.data;
      const stock = typeof product?.stock === 'number' ? product.stock : null;

      if (!response.ok || !data?.success || !product || stock === null || stock <= 0) {
        return {
          item,
          message: `${item.productName} is out of stock. Please remove it from your cart to proceed.`,
        };
      }

      if (item.quantity > stock) {
        return {
          item,
          message: `${item.productName} only has ${stock} in stock. Please update your cart to proceed.`,
        };
      }
    } catch {
      return {
        item,
        message: `We could not confirm stock for ${item.productName}. Please try again before checkout.`,
      };
    }
  }

  return null;
}
