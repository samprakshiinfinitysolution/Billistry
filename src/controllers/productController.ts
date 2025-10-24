

// src/controllers/productController.ts
import Product, { IProduct } from "@/models/Product";
import { UserPayload } from "@/lib/middleware/auth";

// ✅ GET all products
export const getProducts = async (user: UserPayload): Promise<IProduct[]> => {
  return Product.find({ business: user.businessId, isActive: true }).sort({
    createdAt: -1,
  });
};

// ✅ GET single product by ID
export const getProductById = async (
  id: string,
  user: UserPayload
): Promise<IProduct | null> => {
  const product = await Product.findById(id);
  if (
    !product ||
    !product.isActive ||
    product.business.toString() !== user.businessId.toString()
  ) {
    return null;
  }
  return product;
};

// GET products by business id (admin helper)
export const getProductsByBusiness = async (
  businessId: string
): Promise<IProduct[]> => {
  return Product.find({ business: businessId, isActive: true }).sort({
    createdAt: -1,
  });
};

// Get all products across businesses (paginated). Restricted to superadmin usage.
export const getAllProducts = async (page = 1, limit = 50): Promise<{ products: IProduct[]; total: number; page: number; limit: number }> => {
  const skip = (page - 1) * limit;
  const [products, total] = await Promise.all([
    Product.find({ isActive: true }).sort({ createdAt: -1 }).skip(skip).limit(limit),
    Product.countDocuments({ isActive: true }),
  ]);
  return { products, total, page, limit };
};

// ✅ CREATE new product
export const createProduct = async (
  body: Partial<IProduct>,
  user: UserPayload
): Promise<IProduct> => {
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
    business: user.businessId, // ✅ use businessId
    createdBy: user.userId, // ✅ keep actual user
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
  //update permission check
  const canUpdate =
    user.role === "superadmin" ||
    user.role === "shopkeeper" ||
    (user.role === "staff" && user.permissions?.products?.update);

  if (!canUpdate) {
    throw new Error("Forbidden: You do not have permission to update products");
  }







  const product = await Product.findById(id);
  if (
    !product ||
    !product.isActive ||
    product.business.toString() !== user.businessId.toString()
  ) {
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
export const deleteProduct = async (
  id: string,
  user: UserPayload
): Promise<IProduct | null> => {
  const canDelete =
    user.role === "superadmin" ||
    user.role === "shopkeeper" ||
    (user.role === "staff" && user.permissions?.products?.delete);

  if (!canDelete) {
    throw new Error("Forbidden: You do not have permission to delete products");
  }

  const product = await Product.findById(id);
  if (
    !product ||
    !product.isActive ||
    product.business.toString() !== user.businessId.toString()
  ) {
    return null;
  }

  product.isActive = false; // soft delete
  product.updatedBy = user.userId;
  await product.save();
  return product;
};
