

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
} from "lucide-react";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from '@/components/ui/select';
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
  billingAddress: string;
  shippingAddress: string;
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
  const [isBankModalOpen, setIsBankModalOpen] = useState(false);
  const [showDeleteConfirmBank, setShowDeleteConfirmBank] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

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

    fetchParty();
  }, [partyId]);

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    // Live/mobile validation while typing
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

  const confirmDeleteBank = () => {
    setFormData((prev) => ({ ...prev, bankDetails: null }));
    setShowDeleteConfirmBank(false);
    toast.success("Bank details removed");
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
      {/* Header: match other pages (sticky white header with shadow) */}
      <header className="bg-white shadow-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <Button variant="ghost" size="icon" onClick={() => router.back()}>
                <ArrowLeft className="w-5 h-5 text-gray-600" />
              </Button>
              <div>
                <h1 className="text-lg sm:text-xl font-semibold text-gray-800">Edit Party</h1>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Button variant="ghost" className="px-3 py-2" onClick={() => {/* placeholder for settings */}}>
                <Settings className="w-5 h-5 text-gray-600" />
              </Button> 
              <Button variant="ghost" className="px-3 py-2" onClick={() => {/* placeholder for help */}}>
                <HelpCircle className="w-5 h-5 text-gray-600" />
              </Button>
              
              <Button variant="outline" className="px-3 py-2" onClick={() => router.push('/dashboard/parties')}>
                Cancel
              </Button>
              <Button onClick={handleUpdate} disabled={isSubmitting} className="px-4 py-2">
                {isSubmitting ? 'Saving...' : 'Save'}
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto">
        <div className="p-6 max-w-7xl mx-auto">
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>General Details</CardTitle>
                </CardHeader>
                <CardContent>
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
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Address</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <TextAreaField
                      label="Billing Address"
                      name="billingAddress"
                      value={formData.billingAddress}
                      onChange={handleInputChange}
                      placeholder="Enter billing address"
                    />
                    <div>
                      <div className="flex justify-between items-center mb-1">
                        <label
                          htmlFor="shippingAddress"
                          className="block text-sm font-medium text-gray-700"
                        >
                          Shipping Address
                        </label>
                        <div className="flex items-center">
                          <input
                            id="sameAsBilling"
                            name="sameAsBilling"
                            type="checkbox"
                            checked={sameAsBilling}
                            onChange={(e) => setSameAsBilling(e.target.checked)}
                            className="h-4 w-4 text-blue-600 border-gray-300 rounded"
                          />
                          <label
                            htmlFor="sameAsBilling"
                            className="ml-2 block text-sm text-gray-700"
                          >
                            Same as billing
                          </label>
                        </div>
                      </div>
                      <textarea
                        id="shippingAddress"
                        name="shippingAddress"
                        value={
                          sameAsBilling
                            ? formData.billingAddress
                            : formData.shippingAddress
                        }
                        onChange={handleInputChange}
                        placeholder="Enter shipping address"
                        rows={3}
                        disabled={sameAsBilling}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-sm"
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Party Bank Account</CardTitle>
                </CardHeader>
                <CardContent>
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
                            onClick={() => setShowDeleteConfirmBank(true)}
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
                        className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-blue-600 rounded-md hover:bg-blue-50"
                      >
                        <Plus className="w-4 h-4" /> Add Bank Account
                      </button>
                    </div>
                  )}
                </CardContent>
              </Card>
          </div>
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

      {/* Delete confirmation for bank details (overlay) */}
      {showDeleteConfirmBank && (
        <div className={`fixed inset-0 bg-black/40 z-50 flex justify-center items-center p-4`} onClick={() => setShowDeleteConfirmBank(false)}>
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
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
        <div className="flex justify-between items-center p-4 border-b">
          <h3 className="text-lg font-semibold text-gray-800">
            Edit Bank Account
          </h3>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-800 text-2xl font-bold"
          >
            &times;
          </button>
        </div>
        <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
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
        <div className="flex justify-end gap-4 p-4 border-t">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
}
