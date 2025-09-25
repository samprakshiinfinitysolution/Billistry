


// export const DEFAULT_PERMISSIONS = {
//   // ✅ App owner / system-level
//   superadmin: {
//     manageBusiness: true,
//     manageStaff: true,
//     manageProducts: true,
//     manageSales: true,
//     managePurchases: true,
//     manageExpenses: true,
//     viewReports: true,
//     manageSubscription: true,

//     // Visibility
//     viewAmounts: true,
//     viewProfit: true,
//     viewSensitiveReports: true,
//   },

//   // ✅ Shop/business owner
//   shopkeeper: {
//     manageBusiness: true,
//     manageStaff: true,
//     manageProducts: true,
//     manageSales: true,
//     managePurchases: true,
//     manageExpenses: true,
//     viewReports: true,
//     manageSubscription: false, // only superadmin controls billing

//     // Visibility
//     viewAmounts: true,
//     viewProfit: true,
//     viewSensitiveReports: false, // only system admin can see global sensitive data
//   },

//   // ✅ Regular staff (cashier, helper)
//   staff: {
//     manageBusiness: false,
//     manageStaff: false,
//     manageProducts: false,
//     manageSales: true,   // staff can record sales
//     managePurchases: false,
//     manageExpenses: false,
//     viewReports: false,
//     manageSubscription: false,

//     // Visibility
//     viewAmounts: false, // ❌ hide totals/amounts
//     viewProfit: false,  // ❌ hide profit calculations
//     viewSensitiveReports: false, // ❌ no sensitive data
//   },
// };



export const DEFAULT_PERMISSIONS = {
  superadmin: {
    business: { create: true, read: true, update: true, delete: true },
    staff: { create: true, read: true, update: true, delete: true },
    products: { create: true, read: true, update: true, delete: true },
    sales: { create: true, read: true, update: true, delete: true },
    purchases: { create: true, read: true, update: true, delete: true },
    expenses: { create: true, read: true, update: true, delete: true },
    reports: { create: false, read: true, update: false, delete: false },
    subscription: { manage: true },
    visibility: { viewAmounts: true, viewProfit: true, viewSensitiveReports: true }
  },

  shopkeeper: {
    business: { create: true, read: true, update: true, delete: false },
    staff: { create: true, read: true, update: true, delete: true },
    products: { create: true, read: true, update: true, delete: true },
    sales: { create: true, read: true, update: true, delete: true },
    purchases: { create: true, read: true, update: true, delete: true },
    expenses: { create: true, read: true, update: true, delete: true },
    reports: { create: false, read: true, update: false, delete: false },
    subscription: { manage: false },
    visibility: { viewAmounts: true, viewProfit: true, viewSensitiveReports: true }
  },

  staff: {
    business: { create: false, read: false, update: false, delete: false },
    staff: { create: false, read: false, update: false, delete: false },
    products: { create: false, read: true, update: false, delete: false },
    sales: { create: true, read: true, update: false, delete: false },
    purchases: { create: false, read: false, update: false, delete: false },
    expenses: { create: false, read: false, update: false, delete: false },
    reports: { create: false, read: false, update: false, delete: false },
    subscription: { manage: false },
    visibility: { viewAmounts: false, viewProfit: false, viewSensitiveReports: false }
  }
};
