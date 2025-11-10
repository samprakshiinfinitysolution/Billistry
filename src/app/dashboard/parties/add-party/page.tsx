


// app/add-party/page.tsx
"use client";
import toast from "react-hot-toast";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  HelpCircle,
  Settings,
  Plus,
  Building,
  ArrowLeft,
  Edit2,
  Trash2,
  Star,
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

// --- Page Component ---
export default function AddPartyPage() {
  const router = useRouter();
  const [formData, setFormData] = useState<PartyFormData>(initialFormState);
  const [errors, setErrors] = useState<FormErrors>({});
  const [sameAsBilling, setSameAsBilling] = useState(true);
  const [isBankModalOpen, setIsBankModalOpen] = useState(false);
  const [isAddressModalOpen, setIsAddressModalOpen] = useState(false);
  const [editingAddressId, setEditingAddressId] = useState<string | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const editingAddressObj = editingAddressId ? formData.addresses?.find(a => a.id === editingAddressId) ?? null : null;
  const [isSubmitting, setIsSubmitting] = useState(false);
  const primaryAddress = formData.addresses?.find(a => a.isPrimary) ?? null;

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    // Live validation for mobile number field
    if (name === "mobileNumber") {
      const digitsOnly = String(value).replace(/\D/g, "");
      setErrors((prev) => {
        const next = { ...prev };
        if (!digitsOnly) {
          next.mobileNumber = "Mobile number is required.";
        } else if (!/^\d{10}$/.test(digitsOnly)) {
          next.mobileNumber = "Enter a valid 10-digit mobile number.";
        } else {
          delete next.mobileNumber;
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
    // Deprecated single-address save kept for backward compatibility
    setFormData((prev) => ({ ...prev, billingAddress: billing, shippingAddress: same ? billing : shipping }));
    setSameAsBilling(same);
    setIsAddressModalOpen(false);
  };

  // Multiple addresses handlers (supports single primary)
  const addAddress = (addr: { id: string; billingAddress: string; shippingAddress: string; isPrimary?: boolean }) => {
    setFormData((prev) => {
      const nextAddresses = [ ...(prev.addresses || []) ];
      if (addr.isPrimary) {
        // clear other primaries
        nextAddresses.forEach(a => a.isPrimary = false);
      }
      nextAddresses.push(addr as any);
      return {
        ...prev,
        addresses: nextAddresses,
        billingAddress: prev.billingAddress || (addr.isPrimary ? addr.billingAddress : prev.billingAddress),
        shippingAddress: prev.shippingAddress || (addr.isPrimary ? addr.shippingAddress : prev.shippingAddress),
      };
    });
  };

  const updateAddress = (addr: { id: string; billingAddress: string; shippingAddress: string; isPrimary?: boolean }) => {
    setFormData((prev) => {
      const nextAddresses = (prev.addresses || []).map(a => a.id === addr.id ? { ...a, ...addr } : a as any);
      if (addr.isPrimary) {
        nextAddresses.forEach(a => { if (a.id !== addr.id) a.isPrimary = false; });
      }
      return {
        ...prev,
        addresses: nextAddresses,
        billingAddress: addr.isPrimary ? addr.billingAddress : prev.billingAddress,
        shippingAddress: addr.isPrimary ? addr.shippingAddress : prev.shippingAddress,
      };
    });
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
      // Basic validation: accept 10 digit numbers only
      const digitsOnly = String(formData.mobileNumber).replace(/\D/g, "");
      if (!/^\d{10}$/.test(digitsOnly)) {
        newErrors.mobileNumber = "Enter a valid 10-digit mobile number.";
      }
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (action: "save" | "saveNew") => {
    if (!validateForm() || isSubmitting) return;

    setIsSubmitting(true);
    setErrors({});
    try {
      const response = await fetch("/api/parties", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "An unexpected error occurred.");
      }

      toast.success("Party created successfully!");

      if (action === "save") {
        const destination =  '/dashboard/parties' ;
        router.push(destination);
      } else {
        setFormData(initialFormState);
        setSameAsBilling(true);
      }
    } catch (error: any) {
      console.error("Failed to save party:", error);
      const errorMessage = error.message || "An unknown error occurred.";
      toast.error(`Error: ${errorMessage}`);
      // Display error message near the most likely field
      if (errorMessage.toLowerCase().includes("mobile")) {
        setErrors({ mobileNumber: errorMessage });
      } else {
        setErrors({ partyName: errorMessage });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-gray-100 font-inter">
      {/* Header - match dashboard style (compact) */}
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
            <h1 className="text-lg font-semibold text-gray-800">Create Party</h1>
            <p className="text-xs text-gray-500">Add a new customer or supplier</p>
          </div>
        </div>

        <div className="flex items-center gap-2 px-4 py-2">
          <button aria-label="Settings" className="p-1 rounded-md hover:bg-gray-50 cursor-pointer border border-gray-300">
            <Settings className="w-5 h-5 text-gray-600" />
          </button>
          {/* <button aria-label="Help" className="p-1 rounded-md hover:bg-gray-50">
            <HelpCircle className="w-5 h-5 text-gray-600" />
          </button> */}

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => handleSubmit("saveNew")}
              disabled={isSubmitting}
              className="px-3 py-1.5 text-sm font-medium text-blue-700 bg-blue-50 border border-blue-200 rounded-md hover:bg-blue-100 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            >
              {isSubmitting ? "Saving..." : "Save & New"}
            </button>
            <button
              type="button"
              onClick={() => handleSubmit("save")}
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
        <div className="mx-auto bg-white p-8 rounded-lg shadow">
          {/* General Details */}
          <section className="mb-8">
            <h2 className="text-lg font-semibold text-gray-800 mb-6 border-b pb-4">
              General Details
            </h2>
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

              {/* Opening Balance: attached control (amount + type) using shadcn Select */}
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

          {/* Address Section (supports multiple addresses) */}
          <section className="mb-8 mt-8">
            <div className="flex items-center justify-between mb-6 border-b pb-4">
              <h2 className="text-lg font-semibold text-gray-800">Address</h2>
              <div>
                <button type="button" onClick={() => setIsAddressModalOpen(true)} className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-blue-700 bg-blue-50 border border-blue-200 rounded-md hover:bg-blue-100 disabled:opacity-50 disabled:cursor-not-allowed min-w-[200px] cursor-pointer">
                  <Plus className="w-4 h-4" /> Add Address
                </button>
              </div>
            </div>

            {/* List of addresses (if any) */}
              {formData.addresses && formData.addresses.length > 0 ? (
                <div className="space-y-3">
                  {formData.addresses.map((addr) => (
                    <div key={addr.id} className={`group p-4 border rounded-md bg-gray-50 flex items-start justify-between ${addr.isPrimary ? 'border-emerald-300 ring-1 ring-emerald-100' : 'border-gray-200 hover:border-gray-300'}`}>
                      <div className="flex-1">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-2">
                            <div>
                              <p className="text-sm text-gray-700 font-bold">Billing</p>
                              <p className="text-sm text-gray-600 whitespace-pre-line mt-1">{addr.billingAddress}</p>
                            </div>
                            <div>
                              <p className="text-sm text-gray-700 font-bold">Shipping</p>
                              <p className="text-sm text-gray-600 whitespace-pre-line mt-1">{addr.shippingAddress || <span className="text-gray-400 italic">Same as billing</span>}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-3 mt-3 text-sm">
                            {addr.isPrimary ? (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 text-xs font-semibold bg-emerald-100 text-emerald-800 rounded">
                                <Star className="w-3 h-3 text-emerald-700" /> Primary
                              </span>
                            ) : (
                              <button
                                onClick={(e) => { e.stopPropagation(); makePrimary(addr.id); }}
                                className="text-xs px-2 py-1 border border-emerald-200 text-emerald-700 rounded-md bg-emerald-50 opacity-0 group-hover:opacity-100 transition cursor-pointer"
                              >
                                Make primary
                              </button>
                            )}
                          </div>
                      </div>
                      <div className="flex gap-2 ml-4 items-center">
                        <button onClick={(e) => { e.stopPropagation(); setEditingAddressId(addr.id); setIsAddressModalOpen(true); }} aria-label="Edit address" title="Edit" className="p-2 text-gray-500 hover:text-blue-600 cursor-pointer"><Edit2 className="w-4 h-4" /></button>
                        <button onClick={(e) => { e.stopPropagation(); setConfirmDeleteId(addr.id); }} aria-label="Delete address" title="Delete" className="p-2 text-gray-500 hover:text-red-600 cursor-pointer"><Trash2 className="w-4 h-4" /></button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center p-8 border border-dashed border-gray-300 rounded-md bg-gray-50">
                  <Building className="w-12 h-12 text-gray-400 mb-4" />
                  <p className="text-gray-600 mb-4">Add billing & shipping addresses for the party</p>
                  <button type="button" onClick={() => setIsAddressModalOpen(true)} className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-blue-600 rounded-md hover:bg-blue-50 min-w-[200px] cursor-pointer"><Plus className="w-4 h-4" /> Add Address</button>
                </div>
              )}

          </section>
            
          </section>

          {/* Bank Section */}
          <section className="pt-8">
            <h2 className="text-lg font-semibold text-gray-800 mb-6 border-b pb-4">
              Party Bank Account
            </h2>
            {formData.bankDetails ? (
              <div className="p-4 border border-gray-200 rounded-md bg-gray-50">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-semibold text-gray-800">
                      {formData.bankDetails.accountHolderName}
                    </p>
                    <p className="text-sm text-gray-600">
                      A/C: {formData.bankDetails.accountNumber}
                    </p>
                    <p className="text-sm text-gray-600">
                      IFSC: {formData.bankDetails.ifsc}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setIsBankModalOpen(true)}
                      className="p-2 text-gray-500 hover:text-blue-600 cursor-pointer"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() =>
                        setFormData((prev) => ({ ...prev, bankDetails: null }))
                      }
                      className="p-2 text-gray-500 hover:text-red-600 cursor-pointer"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center p-8 border border-dashed border-gray-300 rounded-md bg-gray-50">
                <Building className="w-12 h-12 text-gray-400 mb-4" />
                <p className="text-gray-600 mb-4">
                  Add party bank information to manage transactions
                </p>
                <button
                  type="button"
                  onClick={() => setIsBankModalOpen(true)}
                  className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-blue-600 rounded-md hover:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 cursor-pointer"
                >
                  <Plus className="w-4 h-4" /> Add Bank Account
                </button>
              </div>
            )}
          </section>
        </div>
      </main>

      {/* Bank Modal */}
      {isBankModalOpen && (
        <BankAccountModal
          isOpen={isBankModalOpen}
          onClose={() => setIsBankModalOpen(false)}
          onSave={handleSaveBankDetails}
          initialData={formData.bankDetails}
        />
      )}
      {/* Address Modal (for add/edit individual addresses) */}
      {isAddressModalOpen && (
        <AddressModal
          isOpen={isAddressModalOpen}
          onClose={() => { setIsAddressModalOpen(false); setEditingAddressId(null); }}
          onSave={(addr) => {
            if (editingAddressId) {
              updateAddress(addr);
            } else {
              addAddress(addr);
            }
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
            <h3 className="text-2xl font-semibold text-gray-900">Add Bank Account</h3>
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

// --- Address Modal Component ---
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
    const id = initialAddress?.id || (typeof crypto !== 'undefined' && typeof (crypto as any).randomUUID === 'function' ? (crypto as any).randomUUID() : String(Date.now()));
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
        <div className="px-8 py-6 space-y-6 max-h-[70vh] overflow-y-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Billing Address</label>
              <textarea value={billingAddress} onChange={(e) => setBillingAddress(e.target.value)} rows={6} placeholder="Street, city, state, pincode" className="w-full px-4 py-3 border border-gray-200 rounded-lg shadow-sm text-sm focus:ring-2 focus:ring-blue-200 focus:border-blue-500" />
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Shipping Address</label>
              <textarea value={shippingAddress} onChange={(e) => setShippingAddress(e.target.value)} rows={6} placeholder="Leave blank if same as billing" disabled={copyToShipping} className="w-full px-4 py-3 border border-gray-200 rounded-lg shadow-sm text-sm disabled:bg-gray-50 focus:ring-2 focus:ring-blue-200 focus:border-blue-500" />
            </div>
          </div>

          <div className="flex items-center justify-between bg-gray-50 p-4 rounded-lg border border-gray-100">
            <div className="flex items-center gap-3">
              <input id="copyToShipping" type="checkbox" checked={copyToShipping} onChange={(e) => setCopyToShipping(e.target.checked)} className="h-4 w-4 rounded text-blue-600 focus:ring-blue-500 cursor-pointer" />
              <label htmlFor="copyToShipping" className="text-sm text-gray-700 cursor-pointer">Shipping same as billing</label>
            </div>
            <div className="flex items-center gap-3">
              <input id="isPrimary" type="checkbox" checked={isPrimaryLocal} onChange={(e) => setIsPrimaryLocal(e.target.checked)} className="h-4 w-4 rounded text-blue-600 focus:ring-blue-500 cursor-pointer" />
              <label htmlFor="isPrimary" className="text-sm text-gray-700 cursor-pointer">Make this the primary address</label>
            </div>
          </div>
        </div>
        <div className="px-6 py-4 bg-white border-t flex justify-end gap-3">
          <button type="button" onClick={onClose} className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-md hover:bg-gray-50 cursor-pointer">Cancel</button>
          <button type="button" onClick={handleSave} disabled={!billingAddress.trim()} className="px-6 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:opacity-50 min-w-[110px] cursor-pointer">{initialAddress ? 'Update' : 'Save'}</button>
        </div>
      </div>
    </div>
  );
}
