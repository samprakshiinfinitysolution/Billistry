// import Product, { IProduct } from "@/models/Product";
// import { UserPayload } from "@/lib/middleware/auth";

// // ✅ GET all products
// export const getProducts = async (user: UserPayload): Promise<IProduct[]> => {
//   return Product.find({ business: user.id, isActive: true }).sort({ createdAt: -1 });
// };

// // ✅ GET single product by ID
// export const getProductById = async (id: string, user: UserPayload): Promise<IProduct | null> => {
//   const product = await Product.findById(id);
//   if (!product || !product.isActive || product.business.toString() !== user.id) return null;
//   return product;
// };

// // ✅ CREATE new product
// export const createProduct = async (body: Partial<IProduct>, user: UserPayload): Promise<IProduct> => {
//   if (!body.name || !body.sellingPrice) {
//     throw new Error("Product name and selling price are required");
//   }

//   const product = await Product.create({
//     name: body.name,
//     sku: body.sku || "",
//     barcode: body.barcode || "",
//     category: body.category || "",
//     description: body.description || "",
//     purchasePrice: body.purchasePrice || 0,
//     sellingPrice: body.sellingPrice,
//     taxPercent: body.taxPercent || 0,
//     hsnCode: body.hsnCode || "",
//     openingStock: body.openingStock || 0,
//     currentStock: body.openingStock || 0, // initialize currentStock with openingStock
//     lowStockAlert: body.lowStockAlert || 0,
//     unit: body.unit || "pcs",
//     business: user.id,
//     createdBy: user.id,
//     updatedBy: user.id,
//   });

//   return product;
// };

// // ✅ UPDATE product
// export const updateProduct = async (
//   id: string,
//   updateData: Partial<IProduct>,
//   user: UserPayload
// ): Promise<IProduct | null> => {
//   const product = await Product.findById(id);
//   if (!product || !product.isActive || product.business.toString() !== user.id) return null;

//   // Prevent changing business directly
//   if ("business" in updateData) delete updateData.business;

//   // Validate fields if provided
//   if ("name" in updateData && !updateData.name) throw new Error("Product name is required");
//   if ("sellingPrice" in updateData && !updateData.sellingPrice) {
//     throw new Error("Selling price is required");
//   }

//   Object.assign(product, updateData, { updatedBy: user.id });
//   await product.save();
//   return product;
// };

// // ✅ DELETE (soft) product
// export const deleteProduct = async (id: string, user: UserPayload): Promise<IProduct | null> => {
//   const product = await Product.findById(id);
//   if (!product || !product.isActive || product.business.toString() !== user.id) return null;

//   product.isActive = false; // soft delete
//   product.updatedBy = user.id;
//   await product.save();
//   return product;
// };

// import Product, { IProduct } from "@/models/Product";
// import { UserPayload } from "@/lib/middleware/auth";

// // ✅ GET all products
// export const getProducts = async (user: UserPayload): Promise<IProduct[]> => {
//   return Product.find({ business: user.businessId, isDeleted: false }).sort({ createdAt: -1 });
// };

// // ✅ GET single product by ID
// export const getProductById = async (id: string, user: UserPayload): Promise<IProduct | null> => {
//   const product = await Product.findById(id);
//   if (!product || product.isDeleted || product.business.toString() !== user.businessId) return null;
//   return product;
// };

// // ✅ CREATE new product
// export const createProduct = async (body: Partial<IProduct>, user: UserPayload): Promise<IProduct> => {
//   if (!body.name || !body.sellingPrice) {
//     throw new Error("Product name and selling price are required");
//   }

//   const product = await Product.create({
//     name: body.name,
//     sku: body.sku || "",
//     barcode: body.barcode || "",
//     category: body.category || "",
//     description: body.description || "",
//     purchasePrice: body.purchasePrice || 0,
//     sellingPrice: body.sellingPrice,
//     taxPercent: body.taxPercent || 0,
//     hsnCode: body.hsnCode || "",
//     openingStock: body.openingStock || 0,
//     currentStock: body.openingStock || 0, // initialize currentStock with openingStock
//     lowStockAlert: body.lowStockAlert || 0,
//     unit: body.unit || "pcs",
//     business: user.businessId,   // ✅ use businessId
//     createdBy: user.userId,          // ✅ keep actual user
//     updatedBy: user.userId,
//     isDeleted: false,
//   });

//   return product;
// };

// // ✅ UPDATE product
// export const updateProduct = async (
//   id: string,
//   updateData: Partial<IProduct>,
//   user: UserPayload
// ): Promise<IProduct | null> => {
//   const product = await Product.findById(id);
//   if (!product || product.isDeleted || product.business.toString() !== user.businessId) return null;

//   // Prevent malicious overwrite
//   if ("business" in updateData) delete updateData.business;

//   // Validate fields if provided
//   if ("name" in updateData && !updateData.name) throw new Error("Product name is required");
//   if ("sellingPrice" in updateData && !updateData.sellingPrice) {
//     throw new Error("Selling price is required");
//   }

//   Object.assign(product, updateData, { updatedBy: user.userId });
//   await product.save();
//   return product;
// };

// // ✅ DELETE (soft)
// export const deleteProduct = async (id: string, user: UserPayload): Promise<IProduct | null> => {
//   const product = await Product.findById(id);
//   if (!product || product.isDeleted || product.business.toString() !== user.businessId) return null;

//   product.isDeleted = true; // ✅ soft delete with isDeleted
//   product.updatedBy = user.userId;
//   await product.save();
//   return product;
// };





// src/controllers/productController.ts
import Product, { IProduct } from "@/models/Product";
import { UserPayload } from "@/lib/middleware/auth";

// ✅ GET all products
export const getProducts = async (user: UserPayload): Promise<IProduct[]> => {
  return Product.find({ business: user.businessId, isActive: true }).sort({ createdAt: -1 });
};

// ✅ GET single product by ID
export const getProductById = async (id: string, user: UserPayload): Promise<IProduct | null> => {
  const product = await Product.findById(id);
  if (!product || !product.isActive || product.business.toString() !== user.businessId.toString()) {
    return null;
  }
  return product;
};

// ✅ CREATE new product
export const createProduct = async (body: Partial<IProduct>, user: UserPayload): Promise<IProduct> => {
  if (!body.name || !body.sellingPrice) {
    throw new Error("Product name and selling price are required");
  }

  const product = await Product.create({
    name: body.name,
    sku: body.sku || "",
    barcode: body.barcode || "",
    category: body.category || "",
    description: body.description || "",
    purchasePrice: body.purchasePrice || 0,
    sellingPrice: body.sellingPrice,
    taxPercent: body.taxPercent || 0,
    hsnCode: body.hsnCode || "",
    openingStock: body.openingStock || 0,
    currentStock: body.openingStock || 0, // initialize currentStock with openingStock
    lowStockAlert: body.lowStockAlert || 0,
    unit: body.unit || "pcs",
    business: user.businessId,   // ✅ use businessId
    createdBy: user.userId,          // ✅ keep actual user
    updatedBy: user.userId,
    isActive: true,
  });

  return product;
};

// ✅ UPDATE product
export const updateProduct = async (
  id: string,
  updateData: Partial<IProduct>,
  user: UserPayload
): Promise<IProduct | null> => {
  const product = await Product.findById(id);
  if (!product || !product.isActive || product.business.toString() !== user.businessId.toString()) {
    return null;
  }

  // Prevent changing business directly
  if ("business" in updateData) delete updateData.business;

  // Validate fields if provided
  if ("name" in updateData && !updateData.name) {
    throw new Error("Product name is required");
  }
  if ("sellingPrice" in updateData && !updateData.sellingPrice) {
    throw new Error("Selling price is required");
  }

  Object.assign(product, updateData, { updatedBy: user.userId });
  await product.save();
  return product;
};

// ✅ DELETE (soft) product
export const deleteProduct = async (id: string, user: UserPayload): Promise<IProduct | null> => {
  const product = await Product.findById(id);
  if (!product || !product.isActive || product.business.toString() !== user.businessId.toString()) {
    return null;
  }

  product.isActive = false; // soft delete
  product.updatedBy = user.userId;
  await product.save();
  return product;
};
