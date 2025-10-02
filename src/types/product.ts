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
  purchasePriceWithTax: boolean;
  sellingPrice: string | number | null;
  sellingPriceWithTax: boolean;
  createdAt: Date;
};

