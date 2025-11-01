


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
} from "lucide-react";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from '@/components/ui/select';

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
      {label} {required && "*"}
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
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSaveBankDetails = (details: BankDetails) => {
    setFormData((prev) => ({ ...prev, bankDetails: details }));
    setIsBankModalOpen(false);
  };

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};
    if (!formData.partyName) newErrors.partyName = "Party name is required.";
    if (!formData.mobileNumber)
      newErrors.mobileNumber = "Mobile number is required.";
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
          <button aria-label="Settings" className="p-1 rounded-md hover:bg-gray-50 cursor-pointer">
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
              className="px-3 py-1.5 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
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
                  <span className="text-red-500 mr-1">*</span>
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

          {/* Address Section */}
          <section className="mb-8 mt-8">
            <h2 className="text-lg font-semibold text-gray-800 mb-6 border-b pb-4">
              Address
            </h2>
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
                      className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
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
            Add Bank Account
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
        <div className="px-6 py-4 bg-gray-50 border-t flex justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            type="button"
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
