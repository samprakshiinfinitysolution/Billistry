

"use client";

import toast from "react-hot-toast";
import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import {
  HelpCircle,
  Settings,
  ArrowLeft,
  Edit2,
  Trash2,
  Plus,
  Building,
  X,
} from "lucide-react";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import FormSkeleton from '@/components/ui/FormSkeleton';

// --- Types ---
interface BankDetails {
  accountNumber: string;
  ifsc: string;
  bankName: string;
  accountHolderName: string;
  upiId: string;
}

interface PartyFormData {
  partyName: string;
  mobileNumber: string;
  email: string;
  gstin: string;
  panNumber: string;
  partyType: "Customer" | "Supplier";
  billingAddress: string; // kept for backwards compatibility
  shippingAddress: string; // kept for backwards compatibility
  addresses?: Array<{
    id: string;
    billingAddress: string;
    shippingAddress: string;
    isPrimary?: boolean;
  }>;
  bankDetails: BankDetails | null;
  openingBalance?: string | number | null;
  openingBalanceType?: string | null;
}

type FormErrors = Partial<Record<keyof PartyFormData, string>>;

// --- Initial States ---
const initialFormState: PartyFormData = {
  partyName: "",
  mobileNumber: "",
  email: "",
  gstin: "",
  panNumber: "",
  partyType: "Customer",
  billingAddress: "",
  shippingAddress: "",
  addresses: [],
  bankDetails: null,
  openingBalance: '',
  openingBalanceType: 'To Collect',
};

// --- Input Components ---
const InputField = ({
  label,
  name,
  type = "text",
  value,
  onChange,
  placeholder,
  required = false,
  error,
}: {
  label: string;
  name: string;
  type?: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
  required?: boolean;
  error?: string;
}) => (
  <div>
    <label
      htmlFor={name}
      className="block text-sm font-medium text-gray-700 mb-1"
    >
      {label} {required && <span className="text-red-600 ml-1">*</span>}
    </label>
    <input
      type={type}
      id={name}
      name={name}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      className={`w-full px-3 py-2 border ${
        error ? "border-red-500" : "border-gray-300"
      } rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-sm`}
    />
    {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
  </div>
);

const TextAreaField = ({
  label,
  name,
  value,
  onChange,
  placeholder,
  rows = 3,
  disabled = false,
}: {
  label: string;
  name: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  placeholder?: string;
  rows?: number;
  disabled?: boolean;
}) => (
  <div>
    <label
      htmlFor={name}
      className="block text-sm font-medium text-gray-700 mb-1"
    >
      {label}
    </label>
    <textarea
      id={name}
      name={name}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      rows={rows}
      disabled={disabled}
      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-sm"
    />
  </div>
);

// --- Page Component (Edit Only) ---
export default function EditPartyPage() {
  const router = useRouter();
  const params = useParams();
  const partyId = params?.id as string;

  const [formData, setFormData] = useState<PartyFormData>(initialFormState);
  const [errors, setErrors] = useState<FormErrors>({});
  const [sameAsBilling, setSameAsBilling] = useState(true);
  const primaryAddress = formData.addresses?.find(a => a.isPrimary) ?? null;
  const [isBankModalOpen, setIsBankModalOpen] = useState(false);
  const [isAddressModalOpen, setIsAddressModalOpen] = useState(false);
  const [showDeleteConfirmBank, setShowDeleteConfirmBank] = useState(false);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [editingAddressId, setEditingAddressId] = useState<string | null>(null);

  const editingAddressObj = editingAddressId ? formData.addresses?.find(a => a.id === editingAddressId) ?? null : null;

  // --- Handlers (mirrored from AddParty) ---
  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target as any;
    setFormData((prev) => ({ ...prev, [name]: value }));

    if (name === "mobileNumber") {
      const digitsOnly = String(value).replace(/\D/g, "");
      setErrors((prev) => {
        const next = { ...prev };
        if (!digitsOnly) {
          next.mobileNumber = "Mobile number is required.";
        } else if (!/^\d{10}$/.test(digitsOnly)) {
          next.mobileNumber = "Enter a valid 10-digit mobile number.";
        } else {
          delete (next as any).mobileNumber;
        }
        return next;
      });
    }
  };

  const handleSaveBankDetails = (details: BankDetails) => {
    setFormData((prev) => ({ ...prev, bankDetails: details }));
    setIsBankModalOpen(false);
  };

  const handleSaveAddress = (billing: string, shipping: string, same: boolean) => {
    setFormData((prev) => ({ ...prev, billingAddress: billing, shippingAddress: same ? billing : shipping }));
    setSameAsBilling(same);
    setIsAddressModalOpen(false);
  };

  // Multiple addresses handlers
  const addAddress = (addr: { id: string; billingAddress: string; shippingAddress: string; isPrimary?: boolean }) => {
    setFormData((prev) => ({ ...prev, addresses: [ ...(prev.addresses || []), addr as any ] }));
    if (!formData.billingAddress) setFormData((prev) => ({ ...prev, billingAddress: addr.billingAddress }));
    if (!formData.shippingAddress) setFormData((prev) => ({ ...prev, shippingAddress: addr.shippingAddress || addr.billingAddress }));
  };

  const updateAddress = (addr: { id: string; billingAddress: string; shippingAddress: string; isPrimary?: boolean }) => {
    setFormData((prev) => ({ ...prev, addresses: (prev.addresses || []).map(a => a.id === addr.id ? { ...a, ...addr } as any : a) }));
    setFormData((prev) => ({ ...prev,
      billingAddress: prev.billingAddress === prev.addresses?.find(a => a.id === addr.id)?.billingAddress ? addr.billingAddress : prev.billingAddress,
      shippingAddress: prev.shippingAddress === prev.addresses?.find(a => a.id === addr.id)?.shippingAddress ? addr.shippingAddress : prev.shippingAddress,
    }));
  };

  const deleteAddress = (id: string) => {
    setFormData((prev) => ({ ...prev, addresses: (prev.addresses || []).filter(a => a.id !== id) }));
  };

  const makePrimary = (id: string) => {
    setFormData((prev) => {
      const next = (prev.addresses || []).map(a => ({ ...a, isPrimary: a.id === id }));
      const primary = next.find(a => a.isPrimary);
      return { ...prev, addresses: next, billingAddress: primary?.billingAddress || prev.billingAddress, shippingAddress: primary?.shippingAddress || prev.shippingAddress } as any;
    });
  };

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};
    if (!formData.partyName) newErrors.partyName = "Party name is required.";
    if (!formData.mobileNumber) {
      newErrors.mobileNumber = "Mobile number is required.";
    } else {
      const digitsOnly = String(formData.mobileNumber).replace(/\D/g, "");
      if (!/^\d{10}$/.test(digitsOnly)) {
        newErrors.mobileNumber = "Enter a valid 10-digit mobile number.";
      }
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const confirmDeleteBank = () => {
    // For edit page we'll simply remove bank details locally; server-side removal can be
    // implemented if required.
    setShowDeleteConfirmBank(false);
    setFormData((prev) => ({ ...prev, bankDetails: null }));
    toast.success("Bank details removed");
  };

  // --- Load existing party ---
  useEffect(() => {
    if (!partyId) return;

    const fetchParty = async () => {
      try {
        setIsLoading(true);
        const res = await fetch(`/api/parties/${partyId}`, {
          method: "GET",
          credentials: "include", // include cookies
          headers: { "Content-Type": "application/json" },
        });
        if (!res.ok) throw new Error("Failed to fetch party");

        const data = await res.json();
        const party = data.party;

        const mapped: PartyFormData = {
          partyName: party.partyName || "",
          mobileNumber: party.mobileNumber || "",
          email: party.email || "",
          gstin: party.gstin || "",
          panNumber: party.panNumber || "",
          partyType: party.partyType === "Supplier" ? "Supplier" : "Customer",
          billingAddress: party.billingAddress || "",
          shippingAddress: party.shippingAddress || "",
          bankDetails: party.bankDetails
            ? {
                accountNumber: party.bankDetails.accountNumber || "",
                ifsc: party.bankDetails.ifsc || "",
                bankName: party.bankDetails.bankName || "",
                accountHolderName: party.bankDetails.accountHolderName || "",
                upiId: party.bankDetails.upiId || "",
              }
            : null,
          openingBalance: party.openingBalance ?? '',
          openingBalanceType: party.openingBalanceType ?? 'To Collect',
        };

        setFormData(mapped);
        setSameAsBilling(mapped.billingAddress === mapped.shippingAddress);
      } catch (err) {
        console.error(err);
        toast.error("Failed to load party data");
      } finally {
        setIsLoading(false);
      }
    };

    // invoke fetch
    fetchParty();

  }, [partyId]);

  const handleUpdate = async () => {
    if (!validateForm() || isSubmitting) return;

    setIsSubmitting(true);
    try {
      const response = await fetch(`/api/parties/${partyId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const result = await response.json();
      if (!response.ok) throw new Error(result.message || "Error occurred");

      toast.success("Party updated successfully!");
      router.push("/dashboard/parties");
    } catch (error: any) {
      console.error(error);
      toast.error(error.message || "Unknown error");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    // show a consistent form skeleton while party data loads
    return <div className="bg-gray-50 min-h-screen"><FormSkeleton /></div>;
  }

  return (
    <div className="flex flex-col h-full bg-gray-100 font-inter">
      {/* Header - match add-party page style */}
      <header className="flex items-center justify-between border-b bg-white">
        <div className="flex items-center gap-3 px-4 py-3">
          <button
            aria-label="Back"
            onClick={() => router.back()}
            className="p-1 rounded-md hover:bg-gray-50 cursor-pointer"
          >
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </button>
          <div>
            <h1 className="text-lg font-semibold text-gray-800">Edit Party</h1>
            <p className="text-xs text-gray-500">Update customer or supplier details</p>
          </div>
        </div>

        <div className="flex items-center gap-2 px-4 py-2">
          <button aria-label="Settings" className="p-1 rounded-md hover:bg-gray-50 cursor-pointer border border-gray-300">
            <Settings className="w-5 h-5 text-gray-600" />
          </button>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => router.push('/dashboard/parties')}
              className="px-3 py-1.5 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleUpdate}
              disabled={isSubmitting}
              className="px-6 py-1.5 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            >
              {isSubmitting ? "Saving..." : "Save"}
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto">
        <div className="mx-auto bg-white p-8 rounded-lg shadow max-w-7xl">
          {/* General Details */}
          <section className="mb-8">
            <h2 className="text-lg font-semibold text-gray-800 mb-6 border-b pb-4">General Details</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
              <InputField
                label="Party Name"
                name="partyName"
                value={formData.partyName}
                onChange={handleInputChange}
                placeholder="Enter name"
                required
                error={errors.partyName}
              />
              <InputField
                label="Mobile Number"
                name="mobileNumber"
                value={formData.mobileNumber}
                onChange={handleInputChange}
                placeholder="Enter mobile number"
                required
                error={errors.mobileNumber}
              />
              <InputField
                label="Email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleInputChange}
                placeholder="Enter email"
              />

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Opening Balance</label>
                <div className="inline-flex w-full items-stretch border border-gray-300 rounded-md overflow-hidden bg-white">
                  <div className="flex-1 relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-600">₹</span>
                    <input
                      type="number"
                      name="openingBalance"
                      value={formData.openingBalance as any ?? ''}
                      onChange={handleInputChange}
                      placeholder="0"
                      className="w-full pl-9 pr-3 h-9 text-sm focus:outline-none"
                    />
                  </div>
                  <div className="border-l border-gray-200 w-36 h-9 flex items-center">
                    <Select
                      value={formData.openingBalanceType || 'To Collect'}
                      onValueChange={(v) => setFormData((prev) => ({ ...prev, openingBalanceType: v }))}
                    >
                      <SelectTrigger id="openingBalanceType" name="openingBalanceType" className="h-9 w-full px-3 text-sm bg-white border-0 rounded-none focus:ring-0 cursor-pointer">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="To Collect">To Collect</SelectItem>
                        <SelectItem value="To Pay">To Pay</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <InputField
                label="GSTIN"
                name="gstin"
                value={formData.gstin}
                onChange={handleInputChange}
                placeholder="ex: 29ABCDE1234F2Z5"
              />
              <InputField
                label="PAN Number"
                name="panNumber"
                value={formData.panNumber}
                onChange={handleInputChange}
                placeholder="Enter PAN number"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="partyType" className="block text-sm font-medium text-gray-700 mb-1">
                  <span className="text-red-600 mr-1">*</span>
                  Party Type
                </label>
                <Select
                  value={formData.partyType}
                  onValueChange={(v) => setFormData((prev) => ({ ...prev, partyType: v as any }))}
                >
                  <SelectTrigger id="partyType" name="partyType" className="w-full cursor-pointer px-3 py-2 border border-gray-300 rounded-md shadow-sm bg-white text-sm">
                    <SelectValue placeholder="Select party type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Customer">Customer</SelectItem>
                    <SelectItem value="Supplier">Supplier</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </section>

          {/* Address Section (supports multiple addresses) */}
          <section className="mb-8 mt-8">
            <div className="flex items-center justify-between mb-6 border-b pb-4">
              <h2 className="text-lg font-semibold text-gray-800">Address</h2>
              <div>
                <button type="button" onClick={() => { setEditingAddressId(null); setIsAddressModalOpen(true); }} className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-blue-700 bg-blue-50 border border-blue-200 rounded-md hover:bg-blue-100 disabled:opacity-50 disabled:cursor-not-allowed min-w-[200px] cursor-pointer">
                  <Plus className="w-4 h-4" /> Add Address
                </button>
              </div>
            </div>

            {formData.addresses && formData.addresses.length > 0 ? (
              <div className="space-y-3">
                {formData.addresses.map((addr, idx) => (
                  <div key={addr.id} className={`group p-4 border rounded-md bg-gray-50 flex items-start justify-between ${addr.isPrimary ? 'border-emerald-300 ring-1 ring-emerald-100' : 'border-gray-200 hover:border-gray-300'}`}>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <p className="font-semibold text-gray-800">Address {idx + 1}</p>
                        <span className="text-xs text-gray-500">#{addr.id}</span>
                      </div>
                      <div className="space-y-2">
                        <div>
                          <p className="text-sm text-gray-700 font-bold">Billing</p>
                          <p className="text-sm text-gray-600 whitespace-pre-line mt-1">{addr.billingAddress}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-700 font-bold">Shipping</p>
                          <p className="text-sm text-gray-600 whitespace-pre-line mt-1">{addr.shippingAddress || addr.billingAddress}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 mt-3 text-sm">
                        {addr.isPrimary ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 text-xs font-semibold bg-emerald-100 text-emerald-800 rounded">Primary</span>
                        ) : (
                          <button onClick={(e) => { e.stopPropagation(); makePrimary(addr.id); }} className="text-xs px-2 py-1 border border-emerald-200 text-emerald-700 rounded-md bg-emerald-50 opacity-0 group-hover:opacity-100 transition cursor-pointer">Make primary</button>
                        )}
                      </div>
                    </div>
                    <div className="flex gap-2 ml-4 items-center">
                      <button onClick={(e) => { e.stopPropagation(); setEditingAddressId(addr.id); setIsAddressModalOpen(true); }} className="p-2 text-gray-500 hover:text-blue-600 cursor-pointer"><Edit2 className="w-4 h-4" /></button>
                      <button onClick={(e) => { e.stopPropagation(); setConfirmDeleteId(addr.id); }} className="p-2 text-gray-500 hover:text-red-600 cursor-pointer"><Trash2 className="w-4 h-4" /></button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center p-8 border border-dashed border-gray-300 rounded-md bg-gray-50">
                <Building className="w-12 h-12 text-gray-400 mb-4" />
                <p className="text-gray-600 mb-4">Add billing & shipping addresses for the party</p>
                <button type="button" onClick={() => { setEditingAddressId(null); setIsAddressModalOpen(true); }} className="flex items-center gap-2 whitespace-nowrap px-4 py-2 text-sm font-medium text-blue-600 rounded-md hover:bg-blue-50 min-w-[200px] cursor-pointer"><Plus className="w-4 h-4" /> Add Address</button>
              </div>
            )}

            <div className="mt-6">
              <h3 className="text-sm font-medium text-gray-700 mb-2">Primary Address</h3>
              {primaryAddress ? (
                <div className="p-4 border border-gray-200 rounded-md bg-white shadow-sm">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 text-xs font-semibold bg-emerald-100 text-emerald-800 rounded">Primary</span>
                      </div>
                      <div className="mt-3 text-sm text-gray-700">
                        <p className="font-medium">Billing</p>
                        <p className="whitespace-pre-line mt-1 text-sm text-gray-600">{primaryAddress.billingAddress}</p>
                        <p className="font-medium mt-3">Shipping</p>
                        <p className="whitespace-pre-line mt-1 text-sm text-gray-600">{primaryAddress.shippingAddress || primaryAddress.billingAddress}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button onClick={() => { setEditingAddressId(primaryAddress.id); setIsAddressModalOpen(true); }} className="p-2 text-gray-500 hover:text-blue-600 cursor-pointer"><Edit2 className="w-4 h-4" /></button>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="p-4 border border-dashed border-gray-300 rounded-md bg-gray-50 text-sm text-gray-600">No primary address selected. Click any address card to make it primary.</div>
              )}
            </div>
          </section>

          {/* Bank Section */}
          <section className="pt-8">
            <h2 className="text-lg font-semibold text-gray-800 mb-6 border-b pb-4">Party Bank Account</h2>
            {formData.bankDetails ? (
              <div className="p-4 border border-gray-200 rounded-md bg-gray-50">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-semibold text-gray-800">{formData.bankDetails.accountHolderName}</p>
                    <p className="text-sm text-gray-600">A/C: {formData.bankDetails.accountNumber}</p>
                    <p className="text-sm text-gray-600">IFSC: {formData.bankDetails.ifsc}</p>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => setIsBankModalOpen(true)} className="p-2 text-gray-500 hover:text-blue-600 cursor-pointer"><Edit2 className="w-4 h-4" /></button>
                    <button onClick={() => setShowDeleteConfirmBank(true)} className="p-2 text-gray-500 hover:text-red-600 cursor-pointer"><Trash2 className="w-4 h-4" /></button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center p-8 border border-dashed border-gray-300 rounded-md bg-gray-50">
                <Building className="w-12 h-12 text-gray-400 mb-4" />
                <p className="text-gray-600 mb-4">Add party bank information to manage transactions</p>
                <button type="button" onClick={() => setIsBankModalOpen(true)} className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-blue-600 rounded-md hover:bg-blue-50"><Plus className="w-4 h-4" /> Add Bank Account</button>
              </div>
            )}
          </section>
        </div>
      </main>

        {/* Mobile sticky action bar */}
        <div className="fixed bottom-4 left-0 right-0 sm:hidden px-4 z-40">
          <div className="max-w-7xl mx-auto flex gap-3">
            <Button variant="outline" className="flex-1" onClick={() => router.push('/dashboard/parties')}>Cancel</Button>
            <Button className="flex-1" onClick={handleUpdate} disabled={isSubmitting}>{isSubmitting ? 'Saving...' : 'Save'}</Button>
          </div>
        </div>

      {/* Bank Modal */}
      {isBankModalOpen && (
        <BankAccountModal
          isOpen={isBankModalOpen}
          onClose={() => setIsBankModalOpen(false)}
          onSave={handleSaveBankDetails}
          initialData={formData.bankDetails}
        />
      )}
      {/* Address Modal */}
      {isAddressModalOpen && (
        <AddressModal
          isOpen={isAddressModalOpen}
          onClose={() => { setIsAddressModalOpen(false); setEditingAddressId(null); }}
          onSave={(addr) => {
            if (editingAddressId) updateAddress(addr); else addAddress(addr);
            setIsAddressModalOpen(false);
            setEditingAddressId(null);
          }}
          initialAddress={editingAddressObj}
        />
      )}

      {confirmDeleteId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 cursor-pointer" onClick={() => setConfirmDeleteId(null)}>
          <div className="absolute inset-0 bg-black/50 cursor-pointer" />
          <div className="relative w-full max-w-md bg-white rounded-lg shadow-xl p-4" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-lg font-semibold text-gray-800 mb-2">Delete address</h3>
            <p className="text-sm text-gray-600 mb-4">Are you sure you want to delete this address? This action cannot be undone.</p>
            <div className="flex justify-end gap-3">
              <button type="button" onClick={() => setConfirmDeleteId(null)} className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50">Cancel</button>
              <button type="button" onClick={() => { if (confirmDeleteId) deleteAddress(confirmDeleteId); setConfirmDeleteId(null); }} className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700">Delete</button>
            </div>
          </div>
        </div>
      )}

      {/* Delete confirmation for bank details (overlay) */}
      {showDeleteConfirmBank && (
        <div className={`fixed inset-0 bg-black/40 z-50 flex justify-center items-center p-4 cursor-pointer`} onClick={() => setShowDeleteConfirmBank(false)}>
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-center p-4 border-b">
              <h3 className="text-lg font-semibold text-gray-800">Confirm Deletion</h3>
              <button className="text-gray-500 hover:text-gray-700" onClick={() => setShowDeleteConfirmBank(false)}>✕</button>
            </div>
            <div className="p-6">
              <p className="text-sm text-gray-600 mb-4">Are you sure you want to remove the saved bank details for this party? This action can be undone by adding the bank account again.</p>
              <div className="flex justify-end gap-3">
                <Button variant="outline" className="bg-white border-gray-300 text-gray-700 hover:bg-gray-50 px-4 py-2" onClick={() => setShowDeleteConfirmBank(false)}>Cancel</Button>
                <Button className="bg-red-600 text-white hover:bg-red-700 px-4 py-2" onClick={confirmDeleteBank}>Yes, Delete</Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// --- Bank Modal Component ---
function BankAccountModal({
  isOpen,
  onClose,
  onSave,
  initialData,
}: {
  isOpen: boolean;
  onClose: () => void;
  onSave: (details: BankDetails) => void;
  initialData: BankDetails | null;
}) {
  const [details, setDetails] = useState<BankDetails>(
    initialData || {
      accountNumber: "",
      ifsc: "",
      bankName: "",
      accountHolderName: "",
      upiId: "",
    }
  );
  const [reAccountNumber, setReAccountNumber] = useState(
    initialData?.accountNumber || ""
  );
  const [error, setError] = useState("");

  useEffect(() => {
    setDetails(
      initialData || {
        accountNumber: "",
        ifsc: "",
        bankName: "",
        accountHolderName: "",
        upiId: "",
      }
    );
    setReAccountNumber(initialData?.accountNumber || "");
  }, [initialData, isOpen]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setDetails((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSave = () => {
    if (details.accountNumber !== reAccountNumber) {
      setError("Account numbers do not match.");
      return;
    }
    setError("");
    onSave(details);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 cursor-pointer" onClick={onClose}>
      <div className="absolute inset-0 bg-black/40 cursor-pointer" />
  <div className="relative w-full max-w-2xl bg-white rounded-2xl shadow-xl overflow-hidden" onClick={(e) => e.stopPropagation()}>
        <div className="flex justify-between items-start px-6 py-5 border-b border-gray-100">
          <div>
            <h3 className="text-2xl font-semibold text-gray-900">{initialData ? 'Edit Bank Account' : 'Add Bank Account'}</h3>
            <p className="text-sm text-gray-500 mt-1">Save bank account details for payments and refunds</p>
          </div>
          <button onClick={onClose} aria-label="Close" className="p-2 rounded-md text-gray-500 hover:bg-gray-100 cursor-pointer">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="px-6 py-6 space-y-4 max-h-[70vh] overflow-y-auto">
          {error && <p className="text-red-500 text-sm">{error}</p>}
          <InputField
            label="Bank Account Number"
            name="accountNumber"
            value={details.accountNumber}
            onChange={handleChange}
            required
          />
          <InputField
            label="Re-Enter Bank Account Number"
            name="reAccountNumber"
            value={reAccountNumber}
            onChange={(e) => setReAccountNumber(e.target.value)}
            required
          />
          <InputField
            label="IFSC Code"
            name="ifsc"
            value={details.ifsc}
            onChange={handleChange}
          />
          <InputField
            label="Bank & Branch Name"
            name="bankName"
            value={details.bankName}
            onChange={handleChange}
          />
          <InputField
            label="Account Holder’s Name"
            name="accountHolderName"
            value={details.accountHolderName}
            onChange={handleChange}
          />
          <InputField
            label="UPI ID"
            name="upiId"
            value={details.upiId}
            onChange={handleChange}
          />
        </div>

        <div className="px-6 py-4 bg-white border-t flex justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-md hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="px-6 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:opacity-50"
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
}

// --- Address Modal Component (add/edit single address) ---
function AddressModal({
  isOpen,
  onClose,
  onSave,
  initialAddress,
}: {
  isOpen: boolean;
  onClose: () => void;
  onSave: (addr: { id: string; billingAddress: string; shippingAddress: string; isPrimary?: boolean }) => void;
  initialAddress?: { id: string; billingAddress: string; shippingAddress: string; isPrimary?: boolean } | null;
}) {
  const [billingAddress, setBillingAddress] = useState(initialAddress?.billingAddress || "");
  const [shippingAddress, setShippingAddress] = useState(initialAddress?.shippingAddress || "");
  const [isPrimaryLocal, setIsPrimaryLocal] = useState<boolean>(initialAddress?.isPrimary || false);
  const [copyToShipping, setCopyToShipping] = useState<boolean>(false);

  useEffect(() => {
    setBillingAddress(initialAddress?.billingAddress || "");
    setShippingAddress(initialAddress?.shippingAddress || "");
    setIsPrimaryLocal(initialAddress?.isPrimary || false);
    setCopyToShipping(false);
  }, [initialAddress, isOpen]);

  useEffect(() => {
    if (copyToShipping) setShippingAddress(billingAddress);
  }, [billingAddress, copyToShipping]);

  const handleSave = () => {
    const id = initialAddress?.id || String(Date.now());
    onSave({ id, billingAddress: billingAddress.trim(), shippingAddress: shippingAddress.trim() || billingAddress.trim(), isPrimary: isPrimaryLocal });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-black/50" />
      <div className="relative w-full max-w-3xl bg-white rounded-2xl shadow-xl overflow-hidden" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100">
          <div>
            <h3 className="text-2xl font-semibold text-gray-900">{initialAddress ? 'Edit Address' : 'Add Address'}</h3>
            <p className="text-sm text-gray-500 mt-1">Add Billing and Shipping addresses for this party</p>
          </div>
          <button onClick={onClose} aria-label="Close" className="p-2 rounded-md text-gray-500 hover:bg-gray-100 cursor-pointer">
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="px-8 py-6 space-y-4 max-h-[70vh] overflow-y-auto">
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">Billing Address</label>
            <textarea value={billingAddress} onChange={(e) => setBillingAddress(e.target.value)} rows={5} className="w-full px-4 py-3 border border-gray-200 rounded-lg shadow-sm text-sm focus:ring-2 focus:ring-blue-200 focus:border-blue-500" />
          </div>
          <div className="flex items-center gap-3">
            <input id="copyToShipping_edit" type="checkbox" checked={copyToShipping} onChange={(e) => setCopyToShipping(e.target.checked)} className="h-4 w-4 cursor-pointer" />
            <label htmlFor="copyToShipping_edit" className="text-sm text-gray-700 cursor-pointer">Shipping same as billing</label>
          </div>
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">Shipping Address</label>
            <textarea value={shippingAddress} onChange={(e) => setShippingAddress(e.target.value)} rows={4} disabled={copyToShipping} className="w-full px-4 py-3 border border-gray-200 rounded-lg shadow-sm text-sm" />
          </div>
        </div>
        <div className="px-6 py-4 bg-white border-t flex justify-end gap-3">
          <button type="button" onClick={onClose} className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-md hover:bg-gray-50 cursor-pointer">Cancel</button>
          <button type="button" onClick={handleSave} disabled={!billingAddress.trim()} className="px-6 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:opacity-50 min-w-[110px] cursor-pointer">Save</button>
        </div>
      </div>
    </div>
  );
}
