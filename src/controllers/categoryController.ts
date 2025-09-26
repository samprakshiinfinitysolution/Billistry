import Category, { ICategory } from "@/models/Category";
import { UserPayload } from "@/lib/middleware/auth";
import mongoose from "mongoose";

// ✅ GET all categories for a business
export const getCategories = async (user: UserPayload): Promise<ICategory[]> => {
  return Category.find({ business: user.businessId, isActive: true }).sort({ createdAt: -1 });
};

// ✅ GET single category by ID
export const getCategoryById = async (id: string, user: UserPayload): Promise<ICategory | null> => {
  const category = await Category.findById(id);
  if (!category || !category.isActive || category.business.toString() !== user.businessId) {
    return null;
  }
  return category;
};



// ✅ CREATE new category (single or multiple)
export const createCategory = async (
  data: Partial<ICategory> | Partial<ICategory>[],
  user: UserPayload
): Promise<ICategory | ICategory[]> => {
  if (Array.isArray(data)) {
    // Import mongoose at the top if not already imported
  

    data.forEach(c => {
      c.business = new mongoose.Types.ObjectId(user.businessId);
      c.createdBy = new mongoose.Types.ObjectId(user.userId);
      c.updatedBy = new mongoose.Types.ObjectId(user.userId);
    });
    return Category.insertMany(data, { ordered: false });
  } else {
    const category = new Category({
      ...data,
      business: user.businessId,
      createdBy: user.userId,
      updatedBy: user.userId,
    });
    return category.save();
  }
};



// ✅ UPDATE category
export const updateCategory = async (
  id: string,
  updateData: Partial<ICategory>,
  user: UserPayload
): Promise<ICategory | null> => {
  const category = await Category.findById(id);
  if (!category || !category.isActive || category.business.toString() !== user.businessId) {
    return null;
  }

  if ("business" in updateData) delete updateData.business; // Prevent changing business
  Object.assign(category, updateData, { updatedBy: user.userId });
  await category.save();
  return category;
};



// ✅ DELETE category (soft delete)
export const deleteCategory = async (
  id: string,
  user: UserPayload
): Promise<ICategory | null> => {
  const category = await Category.findById(id);
  if (!category || !category.isActive || category.business.toString() !== user.businessId) {
    return null;
  }

  category.isActive = false;
  category.updatedBy = user.userId;
  await category.save();
  return category;
};



// ✅ SEARCH categories by name (business-specific)
export const searchCategory = async (
  businessId: string,
  search?: string
): Promise<ICategory[]> => {
  const query: Record<string, unknown> = { business: businessId, isActive: true };
  if (search) {
    query.category_name = { $regex: search, $options: "i" };
  }
  return Category.find(query).limit(50);
};
