

export const DEFAULT_PERMISSIONS = {
  superadmin: {
    business: { create: true, read: true, update: true, delete: true },
    staff: { create: true, read: true, update: true, delete: true },
    parties: { create: true, read: true, update: false, delete: true },
    products: { create: true, purchaseprice: true, update: true, delete: true },
    sales: { create: true, read: true, update: true, delete: true },
    purchases: { create: true, read: true, update: true, delete: true },
    salesReturn: { create: true, read: true, update: true, delete: true },
    purchasesReturn: { create: true, read: true, update: true, delete: true },
    expenses: { create: true, read: true, update: true, delete: true },
    cashbook: { create: true, read: true, update: true, delete: true },
    reports: { create: true, read: true, update: true, delete: true },
    subscription: { manage: true },
    visibility: { viewAmounts: true, viewProfit: true, viewSensitiveReports: true }
  },

  shopkeeper: {
    business: { create: true, read: true, update: true, delete: false },
    staff: { create: true, read: true, update: true, delete: true },
    parties: { create: true, read: true, update: true, delete: true },
    products: { create: true, purchaseprice: true, update: true, delete: true },
    sales: { create: true, read: true, update: true, delete: true },
    salesReturn: { create: true, read: true, update: true, delete: true },
    purchasesReturn: { create: true, read: true, update: true, delete: true },
    purchases: { create: true, read: true, update: true, delete: true },
    expenses: { create: true, read: true, update: true, delete: true },
    cashbook: { create: true, read: true, update: true, delete: true },
    reports: { create: true, read: true, update: true, delete: true },
    subscription: { manage: false },
    visibility: { viewAmounts: true, viewProfit: true, viewSensitiveReports: true }
  },

  staff: {
    // business: { create: false, read: false, update: false, delete: false },
    // staff: { create: false, read: false, update: false, delete: false },
    parties: { create: false, read: true, update: false, delete: false },
    products: { create: false, purchaseprice: true, update: false, delete: false },
    sales: { create: true, read: true, update: false, delete: false },
    purchases: { create: false, read: false, update: false, delete: false },
    salesReturn: { create: true, read: true, update: false, delete: false },
    purchasesReturn: { create: false, read: false, update: false, delete: false },
    expenses: { create: false, read: false, update: false, delete: false },
    cashbook: { create: false, read: false, update: false, delete: false },
    reports: { create: false, read: false, update: false, delete: false },
    subscription: { manage: false },
    visibility: { viewAmounts: false, viewProfit: false, viewSensitiveReports: false }
  }
};
