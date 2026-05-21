import type { Product, ProductVariantOption } from '../shop/[id]/page';

export function getProductPrice(
    product: Product,
    selectedOptions: Record<string, ProductVariantOption>
): number {
    const priceGroup = product.variantGroups?.find((group) => group.hasVariantPrice);
    if (!priceGroup) {
        return product.basePrice;
    }

    const selectedOption = selectedOptions[priceGroup.name];
    if (selectedOption?.price !== undefined && selectedOption?.price !== null) {
        return Number(selectedOption.price);
    }

    return product.basePrice;
}

export function getDefaultProductPrice(product: Product): number {
    const priceGroup = product.variantGroups?.find((group) => group.hasVariantPrice);
    if (!priceGroup) {
        return product.basePrice;
    }

    const firstOption = priceGroup.options?.[0];
    if (firstOption?.price !== undefined && firstOption?.price !== null) {
        return Number(firstOption.price);
    }

    return product.basePrice;
}

export function getPricingVariantGroup(product: Product) {
    return product.variantGroups?.find((group) => group.hasVariantPrice);
}

export function formatCurrency(amount: number, currency = 'AED') {
    return `${currency} ${amount.toFixed(2)}`;
}
