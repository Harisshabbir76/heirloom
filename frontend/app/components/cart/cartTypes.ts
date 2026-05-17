export type CartVariantSelection = {
  groupName: string;
  optionName: string;
};

export type CartItem = {
  id: string; // unique per product+variant selection
  productId: string;
  productName: string;
  imageUrl?: string;
  unitPrice: number;
  quantity: number;
  currency?: string;
  variantSelections: CartVariantSelection[];
};

