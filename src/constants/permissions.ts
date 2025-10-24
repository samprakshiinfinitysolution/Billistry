

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
