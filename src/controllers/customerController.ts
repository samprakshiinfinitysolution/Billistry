



import Customer, { ICustomer } from "@/models/Customer";
import { UserPayload } from "@/lib/middleware/auth";

// ✅ GET all customers
export const getCustomers = async (user: UserPayload): Promise<ICustomer[]> => {
  return Customer.find({ business: user.businessId, isDeleted: false })
    .sort({ createdAt: -1 });
};

// ✅ GET single customer by ID
export const getCustomerById = async (id: string, user: UserPayload) => {
  const customer = await Customer.findById(id);
  if (!customer || customer.isDeleted || customer.business.toString() !== user.businessId) {
    return null;
  }
  return customer;
};

// ✅ CREATE new customer
export const createCustomer = async (
  body: Partial<ICustomer>,
  user: UserPayload
): Promise<ICustomer> => {
  // Validate mandatory fields
  if (!body.name || !body.phone) {
    throw new Error("Name and phone are required");
  }

    // 👉 Check if phone already exists in same business
  const exists = await Customer.findOne({
    phone: body.phone,
    business: user.businessId,
    isDeleted: false,
  });
  if (exists) {
    throw new Error("Customer with this phone already exists in your business");
  }

  const customer = await Customer.create({
    name: body.name,
    phone: body.phone,
    email: body.email || "",
    address: body.address || "",
    balance: body.openingBalance || 0,
    business: user.businessId,  // ✅ correct scope
    createdBy: user.userId,     // ✅ track creator
    updatedBy: user.userId,
  });

  return customer;
};

// ✅ UPDATE customer
export const updateCustomer = async (
  id: string,
  updateData: Partial<ICustomer>,
  user: UserPayload
) => {
  const customer = await Customer.findById(id);
  if (!customer || customer.isDeleted || customer.business.toString() !== user.businessId) {
    return null;
  }

  // Validate mandatory fields if they exist in update
  if ("name" in updateData && !updateData.name) {
    throw new Error("Name is required");
  }
  if ("phone" in updateData && !updateData.phone) {
    throw new Error("Phone is required");
  }

  Object.assign(customer, updateData, { updatedBy: user.userId });
  await customer.save();
  return customer;
};

// ✅ DELETE (soft) customer
export const deleteCustomer = async (id: string, user: UserPayload) => {
  const customer = await Customer.findById(id);
  if (!customer || customer.isDeleted || customer.business.toString() !== user.businessId) {
    return null;
  }

  customer.isDeleted = true;
  customer.deletedAt = new Date();
  customer.updatedBy = user.userId;
  await customer.save();
  return customer;
};



// import Customer, { ICustomer } from "@/models/Customer";
// import { UserPayload } from "@/lib/middleware/auth";

// async function findCustomerOrFail(id: string, user: UserPayload) {
//   const customer = await Customer.findById(id);
//   if (!customer || customer.isDeleted || customer.business.toString() !== user.businessId) {
//     return null;
//   }
//   return customer;
// }

// // ✅ GET all customers (with pagination)
// export const getCustomers = async (user: UserPayload, page = 1, limit = 20): Promise<ICustomer[]> => {
//   return Customer.find({ business: user.businessId, isDeleted: false })
//     .sort({ createdAt: -1 })
//     .skip((page - 1) * limit)
//     .limit(limit);
// };

// // ✅ GET single
// export const getCustomerById = async (id: string, user: UserPayload) => {
//   return findCustomerOrFail(id, user);
// };

// // ✅ CREATE
// export const createCustomer = async (body: Partial<ICustomer>, user: UserPayload): Promise<ICustomer> => {
//   if (!body.name || !body.phone) throw new Error("Name and phone are required");

//   const existing = await Customer.findOne({ phone: body.phone, business: user.businessId, isDeleted: false });
//   if (existing) throw new Error("Customer with this phone already exists");

//   return Customer.create({
//     ...body,
//     business: user.businessId,
//     createdBy: user.userId,
//     updatedBy: user.userId,
//   });
// };

// // ✅ UPDATE
// export const updateCustomer = async (id: string, updateData: Partial<ICustomer>, user: UserPayload) => {
//   const customer = await findCustomerOrFail(id, user);
//   if (!customer) return null;

//   if ("name" in updateData && !updateData.name) throw new Error("Name is required");
//   if ("phone" in updateData && !updateData.phone) throw new Error("Phone is required");

//   Object.assign(customer, updateData, { updatedBy: user.userId });
//   await customer.save();
//   return customer;
// };

// // ✅ DELETE (soft)
// export const deleteCustomer = async (id: string, user: UserPayload) => {
//   const customer = await findCustomerOrFail(id, user);
//   if (!customer) return null;

//   customer.isDeleted = true;
//   customer.deletedAt = new Date();
//   customer.updatedBy = user.userId;
//   await customer.save();
//   return customer;
// };
