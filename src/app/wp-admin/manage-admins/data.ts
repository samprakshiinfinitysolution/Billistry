export type Admin = {
  id: string;
  name: string;
  store: string;
  email: string;
  phone?: string;
  location?: string;
  status: 'Active' | 'Inactive';
  plan?: 'Premium' | 'Standard' | 'Basic';
  avatar?: string | null;
  signature?: string | null;
  joined: string;
  // optional extended fields used by edit form
  business?: { id?: string; name?: string } | string | null;
  address?: string;
  state?: string;
  city?: string;
  pincode?: string;
  website?: string;
  currency?: string;
  timezone?: string;
  gstNumber?: string;
  businessTypes?: string[];
  industryTypes?: string[];
  registrationType?: string;
  enableEInvoicing?: boolean;
  enableTds?: boolean;
  enableTcs?: boolean;
  role?: string;
  permissions?: any;
  [key: string]: any;
};

let admins: Admin[] = [];

export function getAdmins() {
  return admins;
}

// Refresh admins from server (role=shopkeeper). This keeps the in-memory store but updates it.
export async function refreshAdmins() {
  try {
    const res = await fetch('/api/users?role=shopkeeper');
    if (!res.ok) return admins;
    const json = await res.json();
    // Accept either { users: [...] } or array response
    const list = json?.users || json || [];
    // map server user shape to Admin type (best-effort)
    admins = list.map((u: any, idx: number) => ({
      id: u._id?.toString?.() || u.id || String(idx + 1),
      name: u.name || u.fullName || u.username || 'Unknown',
      // store/business
      store: u.businessName || (u.business && (u.business.name || u.business.toString())) || '—',
      business: u.business ? (typeof u.business === 'object' ? { id: u.business._id || u.business.id, name: u.business.name } : u.business) : (u.businessId || null),
  email: u.companyEmail || u.email || u.contact || '',
  // company phone should come from business.phone or top-level companyPhone
  phone: (u.business && u.business.phone) || u.companyPhone || u.phone || u.contact || '',
  // prefer business-level address fields returned by API
  address: (u.business && u.business.address) || u.billingAddress || u.address || u.location || '',
  // location is a short display; prefer city/state combination
  location: (u.business && ((u.business.city && u.business.state) ? `${u.business.city}, ${u.business.state}` : u.business.city || u.business.state)) || u.location || u.place || u.address || '',
  state: (u.business && u.business.state) || u.state || '',
  city: (u.business && u.business.city) || u.city || '',
  pincode: (u.business && u.business.pincode) || u.pincode || u.zip || '',
  website: (u.business && u.business.website) || u.website || u.site || '',
  currency: u.currency || 'INR',
  timezone: u.timezone || 'Asia/Kolkata',
  gstNumber: (u.business && u.business.gstNumber) || u.gstNumber || u.gstin || '',
  panNumber: (u.business && u.business.panNumber) || u.panNumber || '',
  businessTypes: (u.business && u.business.businessTypes) || u.businessTypes || u.business_type || [],
  industryTypes: (u.business && u.business.industryTypes) || u.industryTypes || u.industry_type || [],
  registrationType: (u.business && u.business.registrationType) || u.registrationType || u.registration || '',
      enableEInvoicing: !!u.enableEInvoicing,
      enableTds: !!u.enableTds,
      enableTcs: !!u.enableTcs,
      status: (u.status || (u.isDeleted ? 'Inactive' : 'Active')) as any,
      plan: (u.plan || u.subscriptionPlan || 'Basic') as any,
      avatar: u.avatar || null,
      signature: u.signature || null,
      role: u.role || 'shopkeeper',
      permissions: u.permissions || null,
      joined: (u.createdAt || u.joined || new Date().toISOString()),
      // preserve original raw object for any other fields the UI may need
      _raw: u,
    }));
    if (typeof window !== 'undefined') window.dispatchEvent(new CustomEvent('adminsUpdated'));
    return admins;
  } catch (err) {
    console.error('refreshAdmins failed', err);
    return admins;
  }
}

export function getAdmin(id: string) {
  return admins.find(a => a.id === id) || null;
}

export function updateAdmin(id: string, patch: Partial<Admin>) {
  admins = admins.map(a => a.id === id ? { ...a, ...patch } : a);
  // notify listeners
  if (typeof window !== 'undefined') window.dispatchEvent(new CustomEvent('adminsUpdated'));
}

export function addAdmin(admin: Admin) {
  admins = [...admins, admin];
  if (typeof window !== 'undefined') window.dispatchEvent(new CustomEvent('adminsUpdated'));
}

export function deleteAdmin(id: string) {
  admins = admins.filter(a => a.id !== id);
  if (typeof window !== 'undefined') window.dispatchEvent(new CustomEvent('adminsUpdated'));
}
