// types/Product.ts
export type Product = {
  _id: string;
  name: string;
  sku: string;
  hsnCode: string;
  taxPercent: string | number;
  category: string;
  openingStock: string | number | null;
  unit: string;
  lowStockAlert: string | number | null ;
  purchasePrice: string | number | null;
  purchasePriceWithGST: string | number | null;
  sellingPrice: string | number | null;
  sellingPriceWithGST: string | number | null;
};

