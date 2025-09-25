// types/Product.ts
export type Product = {
  _id: string;
  name: string;
  sku: string;
  hsnCode: string;
  taxPercent: number;
  category: string;
  openingStock: string | number | null;
  unit: string;
  lowStockAlert: number;
  purchasePrice: number | null;
  sellingPrice: number | null;
};

