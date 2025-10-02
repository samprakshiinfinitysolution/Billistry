import { Product } from "@/types/product";

export const calculateSubtotal = (product: Product) => {
  const purchasePrice = Number(product.purchasePrice ?? 0);
  const openingStock = Number(product.openingStock ?? 0);
  const gstPercent = Number(product.taxPercent ?? 0);

  if (product.purchasePriceWithTax) {
    // If price includes GST, subtract GST first
    const priceWithoutGST = purchasePrice - (purchasePrice * gstPercent / 100)
    return priceWithoutGST * openingStock;
  } else {
    // Normal calculation
    return purchasePrice * openingStock;
  }
};
