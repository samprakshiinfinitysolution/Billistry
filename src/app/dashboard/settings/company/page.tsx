


'use client';

import React, { useState, useEffect, useRef } from 'react';
import FormSkeleton from '@/components/ui/FormSkeleton';
import Image from 'next/image';
import * as ShadcnSelect from '@/components/ui/select';
import { UploadCloud, ChevronDown, Plus, X, MessageSquare, CalendarX, Tally3, Search } from 'lucide-react';
import { useRouter } from 'next/navigation';

// --- 1. REUSABLE UI COMPONENTS (DEFINED ONCE) ---

// --- ImageUpload Component ---
interface ImageUploadProps {
  label: string; previewUrl: string | null; onFileSelect: (file: File) => void; onClear: () => void; error?: string;
}
const MAX_FILE_SIZE_MB = 5;
const ACCEPTED_IMAGE_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
const ImageUpload = ({ label, previewUrl, onFileSelect, onClear, error }: ImageUploadProps) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    if (!ACCEPTED_IMAGE_TYPES.includes(file.type)) { alert('Invalid file type. Please select a PNG, JPG, or WEBP image.'); return; }
    if (file.size > MAX_FILE_SIZE_MB * 1024 * 1024) { alert(`File is too large. Maximum size is ${MAX_FILE_SIZE_MB}MB.`); return; }
    onFileSelect(file);
  };
  return (
    <div>
      <label className="block text-sm font-medium text-gray-600 mb-1">{label}</label>
      <div className="w-full h-32 flex flex-col justify-center items-center bg-gray-50 border-2 border-dashed border-gray-300 rounded-lg text-center p-2 relative">
        <input type="file" ref={fileInputRef} onChange={handleFileChange} accept={ACCEPTED_IMAGE_TYPES.join(',')} className="hidden" />
                {previewUrl ? (
                    <>
                        <Image src={previewUrl} alt="Preview" fill className="object-contain rounded" />
                        <button type="button" onClick={onClear} className="absolute top-1 right-1 bg-white rounded-full p-1 shadow-md text-gray-600 hover:text-red-500 cursor-pointer"><X size={16} /></button>
                    </>
                ) : (
                    <button type="button" onClick={() => fileInputRef.current?.click()} className="w-full h-full cursor-pointer">
                        <div className="flex flex-col items-center justify-center h-full text-gray-500">
                            <UploadCloud className="text-gray-400" size={32} /><p className="text-sm font-semibold text-blue-600 mt-2">{label === 'Signature' ? 'Add Signature' : 'Upload Logo'}</p><p className="text-xs text-gray-400">PNG/JPG, max 5MB.</p>
                        </div>
                    </button>
                )}
      </div>
      {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
    </div>
  );
};

// --- MultiSelectDropdown Component ---
const Pill = ({ text, onRemove }: { text: string; onRemove: () => void }) => ( <div className="bg-gray-100 text-gray-800 text-sm font-medium px-3 py-1 rounded-md flex items-center gap-2"><span>{text}</span><button type="button" onClick={onRemove} className="text-gray-500 hover:text-gray-800 focus:outline-none cursor-pointer"><X size={14} /></button></div> );
interface MultiSelectDropdownProps { label: string; options: string[]; selectedItems: string[]; onChange: (selected: string[]) => void; placeholder?: string; }
const MultiSelectDropdown = ({ label, options, selectedItems, onChange, placeholder = 'Select...' }: MultiSelectDropdownProps) => {
  const [isOpen, setIsOpen] = useState(false); const dropdownRef = useRef<HTMLDivElement>(null);
  useEffect(() => { const handleClickOutside = (event: MouseEvent) => { if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) setIsOpen(false); }; document.addEventListener('mousedown', handleClickOutside); return () => document.removeEventListener('mousedown', handleClickOutside); }, []);
  const availableOptions = options.filter(opt => !selectedItems.includes(opt));
  const handleSelect = (option: string) => { onChange([...selectedItems, option]); setIsOpen(false); };
  const handleRemove = (itemToRemove: string) => { onChange(selectedItems.filter(item => item !== itemToRemove)); };
    return ( <div className="relative" ref={dropdownRef}><label className="block text-sm font-medium text-gray-600 mb-1">{label}</label><div className="block w-full p-2 bg-white border border-gray-300 rounded-md shadow-sm min-h-[42px] cursor-pointer" onClick={() => setIsOpen(!isOpen)}><div className="flex flex-wrap gap-2 items-center">{selectedItems.map(item => <Pill key={item} text={item} onRemove={() => handleRemove(item)} />)}{selectedItems.length === 0 && <span className="text-gray-400 px-1">{placeholder}</span>}<ChevronDown className="absolute right-3 top-1/2 -translate-y-[-5px] h-5 w-5 text-gray-400" /></div></div>{isOpen && availableOptions.length > 0 && ( <ul className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-y-auto">{availableOptions.map(option => (<li key={option} onClick={() => handleSelect(option)} className="px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 cursor-pointer">{option}</li>))}</ul>)}</div>);
};

// --- SearchableDropdown (Combobox) Component ---
interface SearchableDropdownPropsModal { label: string; options: string[]; selected: string; onSelect: (value: string) => void; placeholder?: string; required?: boolean; }
const SearchableDropdown = ({ label, options, selected, onSelect, placeholder = "Type to search", required = false }: SearchableDropdownPropsModal) => {
  const [isOpen, setIsOpen] = useState(false); const [searchTerm, setSearchTerm] = useState(""); const dropdownRef = useRef<HTMLDivElement>(null);
  useEffect(() => { const handleClickOutside = (event: MouseEvent) => { if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) { setIsOpen(false); } }; document.addEventListener('mousedown', handleClickOutside); return () => document.removeEventListener('mousedown', handleClickOutside); }, []);
  const filteredOptions = searchTerm ? options.filter(option => option.toLowerCase().includes(searchTerm.toLowerCase())) : options;
  const handleSelect = (option: string) => { onSelect(option); setSearchTerm(""); setIsOpen(false); };
  const displayValue = selected || searchTerm;
  return ( <div className="relative" ref={dropdownRef}><label className="block text-sm font-medium text-gray-700 mb-1">{label} {required && <span className="text-red-500">*</span>}</label><div className="relative" onClick={() => setIsOpen(prev => !prev)}><Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 pointer-events-none" /><input type="text" value={displayValue} onChange={(e) => { setSearchTerm(e.target.value); if (selected) onSelect(""); if (!isOpen) setIsOpen(true); }} onFocus={() => setIsOpen(true)} placeholder={placeholder} className="w-full pl-10 pr-10 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 cursor-pointer" /><ChevronDown className={`absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} /></div>{isOpen && ( <ul className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-y-auto">{filteredOptions.length > 0 ? ( filteredOptions.map(option => ( <li key={option} onClick={() => handleSelect(option)} className="px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 cursor-pointer">{option}</li>))) : ( <li className="px-4 py-2 text-sm text-gray-500">No results found</li>)}</ul>)}</div>);
};

// --- Other General UI Components ---
const ToggleSwitch = ({ enabled, onChange }: { enabled: boolean; onChange: (enabled: boolean) => void }) => ( <button type="button" onClick={() => onChange(!enabled)} className={`relative inline-flex items-center h-6 rounded-full w-11 transition-colors duration-200 ease-in-out focus:outline-none cursor-pointer ${enabled ? 'bg-indigo-600' : 'bg-gray-300'}`}><span className={`inline-block w-4 h-4 transform bg-white rounded-full transition-transform duration-200 ease-in-out ${enabled ? 'translate-x-6' : 'translate-x-1'}`} /></button>);
const FormField = ({ label, required, className, children, error }: { label: string; required?: boolean; className?: string; error?: string; children: React.ReactNode; }) => ( <div className={className}><label htmlFor={label} className="block text-sm font-medium text-gray-600 mb-1">{label} {required && <span className="text-red-500">*</span>}</label>{children}{error && <p className="mt-1 text-xs text-red-500">{error}</p>}</div>);const Input = ({
  hasError,
  ...props
}: React.InputHTMLAttributes<HTMLInputElement> & { hasError?: boolean }) => (
  <input
    {...props}
    className={`block w-full px-3 py-2 bg-white border ${
      hasError ? "border-red-500" : "border-gray-300"
    } rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm`}
  />
);
const Select = ({ children, ...props }: React.SelectHTMLAttributes<HTMLSelectElement>) => ( <div className="relative"><select {...props} className="appearance-none block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm cursor-pointer">{children}</select><ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 pointer-events-none" /></div>);


// --- 2. CREATE BUSINESS MODAL COMPONENT ---
interface CreateBusinessModalProps { isOpen: boolean; onClose: () => void; onSubmit: (data: FormDataType) => Promise<void>; }
interface FormDataType { name: string; businessType: string; industryType: string; incorporationType: string; }
const MODAL_BUSINESS_TYPE_OPTIONS = ['Retailer', 'Wholesaler', 'Distributor', 'Manufacturer', 'Services'];
const MODAL_INDUSTRY_OPTIONS = [ 'Accounting', 'Agriculture', 'Automobile', 'Construction', 'Education', 'Electronics', 'Engineering', 'FMCG', 'Fitness', 'Garments/Clothing', 'Hospitality', 'IT', 'Jewellery', 'Real Estate', 'Restaurants', 'Salon', 'Transport' ];
const MODAL_INCORPORATION_OPTIONS = ['Sole Proprietorship', 'Partnership', 'Limited Liability Partnership (LLP)', 'Private Limited Company', 'Public Limited Company', 'Other'];

const CreateBusinessModal = ({ isOpen, onClose, onSubmit }: CreateBusinessModalProps) => {
  const [formData, setFormData] = useState<FormDataType>({ name: "", businessType: "", industryType: "", incorporationType: "" });
  const [errors, setErrors] = useState<{ name?: string; incorporationType?: string }>({});
  const [isSaving, setIsSaving] = useState(false); const modalRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (isOpen) { setFormData({ name: "", businessType: "", industryType: "", incorporationType: "" }); setErrors({}); setIsSaving(false); }
    const handleEsc = (event: KeyboardEvent) => { if (event.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handleEsc); return () => window.removeEventListener('keydown', handleEsc);
  }, [isOpen, onClose]);
  const validate = () => { const newErrors: { name?: string; incorporationType?: string } = {}; if (!formData.name || formData.name.length < 3 || formData.name.length > 60) { newErrors.name = "Business name must be 3-60 characters."; } if (!formData.incorporationType) { newErrors.incorporationType = "Incorporation type is required."; } setErrors(newErrors); return Object.keys(newErrors).length === 0; };
  const handleSubmit = async (e: React.FormEvent) => { e.preventDefault(); if (!validate()) return; setIsSaving(true); try { await onSubmit(formData); onClose(); } catch (error) { console.error("Failed to create business:", error); alert("Failed to create business. Please try again."); } finally { setIsSaving(false); } };
    if (!isOpen) return null;
    return ( <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex justify-center items-center p-4 transition-opacity"><div ref={modalRef} className="bg-white rounded-lg shadow-xl w-full max-w-lg animate-fade-in-up" onClick={(e) => e.stopPropagation()}><div className="flex justify-between items-center p-4 border-b"><h2 className="text-xl font-semibold text-gray-800">Create Business</h2><button onClick={onClose} className="text-gray-400 hover:text-gray-600 cursor-pointer"><X size={24} /></button></div><div className="p-6 space-y-6"><div className="text-center"><Image src="https://i.imgur.com/3xR2u9p.png" alt="Manage multiple businesses" className="mx-auto mb-3" style={{ maxWidth: '300px' }}/><p className="text-sm text-gray-600">Have more than 1 business?</p><p className="text-sm text-blue-600">Easily manage all your businesses on myBillBook</p></div><form id="create-business-form" onSubmit={handleSubmit} className="space-y-4"><div><label htmlFor="businessName" className="block text-sm font-medium text-gray-700 mb-1">Business Name <span className="text-red-500">*</span></label><input id="businessName" type="text" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} placeholder="Enter business name" className={`w-full px-3 py-2 border ${errors.name ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500`} />{errors.name && <p className="text-sm text-red-500 mt-1">{errors.name}</p>}</div><div><label className="block text-sm font-medium text-gray-700 mb-1">Business Type</label><div className="relative"><select value={formData.businessType} onChange={(e) => setFormData({ ...formData, businessType: e.target.value })} className="w-full appearance-none px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 cursor-pointer"><option value="" disabled>Select</option>{MODAL_BUSINESS_TYPE_OPTIONS.map(opt => <option key={opt} value={opt}>{opt}</option>)}</select><ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 pointer-events-none" /></div></div><SearchableDropdown label="Industry Type" options={MODAL_INDUSTRY_OPTIONS} selected={formData.industryType} onSelect={(value) => setFormData({ ...formData, industryType: value })} /><SearchableDropdown label="Incorporation Type" options={MODAL_INCORPORATION_OPTIONS} selected={formData.incorporationType} onSelect={(value) => setFormData({ ...formData, incorporationType: value })} required />{errors.incorporationType && <p className="text-sm text-red-500 -mt-2">{errors.incorporationType}</p>}</form></div><div className="flex justify-end items-center p-4 border-t bg-gray-50 rounded-b-lg"><button type="button" onClick={onClose} className="px-6 py-2 text-sm font-semibold text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-100 mr-3 cursor-pointer">Cancel</button><button form="create-business-form" type="submit" disabled={isSaving} className="px-6 py-2 text-sm font-semibold text-white bg-indigo-600 rounded-md hover:bg-indigo-700 cursor-pointer disabled:bg-indigo-400 disabled:cursor-not-allowed">{isSaving ? 'Saving...' : 'Save'}</button></div></div></div>);
};


// --- 3. MAIN PAGE CONFIGURATION & DATA ---

const INDUSTRY_OPTIONS = [ 'Accounting and Financial Services', 'Agriculture', 'Automobile', 'Battery', 'Broadband/ cable/ internet', 'Building Material and Construction', 'Cleaning and Pest Control', 'Consulting', 'Dairy (Milk)', 'Doctor / Clinic / Hospital', 'Education-Schooling/Coaching', 'Electrical works', 'Electronics', 'Engineering', 'Event planning and management', 'FMCG', 'Fitness - Gym and Spa', 'Footwear', 'Fruits and Vegetables', 'Furniture', 'Garment/Clothing', 'General Store(Kirana)', 'Gift Shop', 'Hardware', 'Home services', 'Hotels and Hospitality', 'Information Technology', 'Interiors', 'Jewellery', 'Liquor', 'Machinery', 'Meat', 'Medical Devices', 'Medicine(Pharma)', 'Mobile and accessories', 'Oil And Gas', 'Opticals', 'Other services', 'Others', 'Packaging', 'Paints', 'Photography', 'Plywood', 'Printing', 'Real estate - Rentals and Lease', 'Restaurants/ Cafe/ Catering', 'Safety Equipments', 'Salon', 'Scrap', 'Service Centres', 'Sports Equipments', 'Stationery', 'Tailoring/ Boutique', 'Textiles', 'Tiles/Sanitary Ware', 'Tours and Travel', 'Transport and Logistics', 'Utensils' ];
const BUSINESS_TYPE_OPTIONS = ['Retailer', 'Wholesaler', 'Distributor', 'Manufacturer', 'Services'];
const REGISTRATION_TYPE_OPTIONS = ['Sole Proprietorship', 'Partnership', 'Limited Liability Partnership (LLP)', 'Private Limited Company', 'Public Limited Company', 'Business Not Registered', 'Other'];

interface BusinessSettings {
    name: string; address: string; phone: string; email: string; gstNumber: string; currency: string; timezone: string;
    state: string; city: string; pincode: string; panNumber: string; website: string;
    businessTypes: string[]; industryTypes: string[]; registrationType: string;
    enableEInvoicing: boolean; enableTds: boolean; enableTcs: boolean;
    logoUrl?: string; signatureUrl?: string;
}
interface FormErrors { name?: string; email?: string; panNumber?: string; }

const initialSettings: BusinessSettings = {
    name: '', phone: '', email: '', address: '', state: '', pincode: '', city: '', gstNumber: '',
    currency: 'INR', timezone: 'Asia/Kolkata', panNumber: '', website: '',
    enableEInvoicing: false, enableTds: false, enableTcs: false,
    businessTypes: [], industryTypes: [], registrationType: '',
};


const INDIAN_STATES = [
    "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh", "Goa", "Gujarat", "Haryana",
    "Himachal Pradesh", "Jharkhand", "Karnataka", "Kerala", "Madhya Pradesh", "Maharashtra", "Manipur",
    "Meghalaya", "Mizoram", "Nagaland", "Odisha", "Punjab", "Rajasthan", "Sikkim", "Tamil Nadu",
    "Telangana", "Tripura", "Uttar Pradesh", "Uttarakhand", "West Bengal", "Andaman and Nicobar Islands",
    "Chandigarh", "Dadra and Nagar Haveli and Daman and Diu", "Delhi", "Jammu and Kashmir", "Ladakh",
    "Lakshadweep", "Puducherry"
];


// --- 4. MAIN PAGE COMPONENT ---

const BusinessSettingsPage = () => {
    const router = useRouter();
    const [formData, setFormData] = useState<BusinessSettings>(initialSettings);
    const [initialData, setInitialData] = useState<BusinessSettings>(initialSettings);
    const [isGstRegistered, setIsGstRegistered] = useState<'yes' | 'no'>('no');
    const [isLoading, setIsLoading] = useState(true);
    const [isDirty, setIsDirty] = useState(false);
    const [errors, setErrors] = useState<FormErrors>({});
    const [isSaving, setIsSaving] = useState(false);
    const [logoFile, setLogoFile] = useState<File | null>(null);
    const [logoPreview, setLogoPreview] = useState<string | null>(null);
    const [signatureFile, setSignatureFile] = useState<File | null>(null);
    const [signaturePreview, setSignaturePreview] = useState<string | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    // --- NEW --- State to track images marked for deletion
    const [imagesToDelete, setImagesToDelete] = useState<{ logo?: boolean; signature?: boolean }>({});

    useEffect(() => {
        const fetchBusinessData = async () => {
            setIsLoading(true);
            try {
                const response = await fetch('/api/business/settings');
                const result = await response.json();
                if (response.ok && result.success && result.data) {
                    const data = result.data;
                    setFormData(data);
                    setInitialData(data);
                    setIsGstRegistered(data.gstNumber ? 'yes' : 'no');
                }
            } catch (error) {
                console.error("Failed to fetch business settings:", error);
                alert("Could not load your business settings.");
            } finally {
                setIsLoading(false);
            }
        };
        fetchBusinessData();
    }, []);

    // --- CORRECT, ROBUST useEffect for Logo Preview ---
    useEffect(() => {
        // Hide preview if image is marked for deletion
        if (imagesToDelete.logo) {
            setLogoPreview(null);
            return;
        }
        let objectUrl: string | null = null;
        if (logoFile) {
            objectUrl = URL.createObjectURL(logoFile);
            setLogoPreview(objectUrl);
        } else {
            setLogoPreview(initialData.logoUrl || null);
        }
        return () => { if (objectUrl) URL.revokeObjectURL(objectUrl); };
    }, [logoFile, initialData.logoUrl, imagesToDelete.logo]);

    // --- CORRECT, ROBUST useEffect for Signature Preview ---
    useEffect(() => {
        if (imagesToDelete.signature) {
            setSignaturePreview(null);
            return;
        }
        let objectUrl: string | null = null;
        if (signatureFile) {
            objectUrl = URL.createObjectURL(signatureFile);
            setSignaturePreview(objectUrl);
        } else {
            setSignaturePreview(initialData.signatureUrl || null);
        }
        return () => { if (objectUrl) URL.revokeObjectURL(objectUrl); };
    }, [signatureFile, initialData.signatureUrl, imagesToDelete.signature]);
    
    // --- CORRECT, ROBUST useEffect to track if the form is "dirty" ---
    useEffect(() => { 
        const hasDataChanged = JSON.stringify(formData) !== JSON.stringify(initialData); 
        const hasFilesChanged = logoFile !== null || signatureFile !== null; 
        const hasImagesMarkedForDeletion = !!imagesToDelete.logo || !!imagesToDelete.signature;
        setIsDirty(hasDataChanged || hasFilesChanged || hasImagesMarkedForDeletion); 
    }, [formData, initialData, logoFile, signatureFile, imagesToDelete]);

    const handleCreateBusiness = async (data: FormDataType) => {
        const response = await fetch('/api/business/settings', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data),
        });
        const result = await response.json();
        if (!response.ok || !result.success) {
            throw new Error(result.message || "Failed to create business on the server.");
        }
        alert(`Business "${result.business.name}" created successfully!`);
        router.refresh(); 
    };

    const handleLogoClear = () => {
        if (logoFile) {
            setLogoFile(null); // If clearing a new file, just remove it from state
        } else if (initialData.logoUrl) {
            // If clearing an existing file, mark it for deletion
            setImagesToDelete(prev => ({ ...prev, logo: true }));
        }
    };

    const handleSignatureClear = () => {
        if (signatureFile) {
            setSignatureFile(null);
        } else if (initialData.signatureUrl) {
            setImagesToDelete(prev => ({ ...prev, signature: true }));
        }
    };
    
    const handleInputChange = (field: keyof BusinessSettings, value: any) => { setFormData(prev => ({ ...prev, [field]: value })); if (errors[field as keyof FormErrors]) { setErrors(prev => ({ ...prev, [field as keyof FormErrors]: undefined })); }};
    const handleGstRadioChange = (value: 'yes' | 'no') => { setIsGstRegistered(value); if (value === 'no') { handleInputChange('gstNumber', ''); }};
    const isValidPAN = (pan: string) => /^[A-Z]{5}[0-9]{4}[A-Z]$/.test(pan);

    const validateForm = (): boolean => { const newErrors: FormErrors = {}; if (!formData.name.trim()) newErrors.name = 'Business Name is required.'; if (formData.email && !/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = 'Please enter a valid email address.'; if (formData.panNumber && formData.panNumber.length > 0 && !isValidPAN(formData.panNumber)) newErrors.panNumber = 'PAN must be in format AAAAA9999A.'; setErrors(newErrors); return Object.keys(newErrors).length === 0; };
    const handleCancel = () => { 
        setFormData(initialData); 
        setIsGstRegistered(initialData.gstNumber ? 'yes' : 'no'); 
        setLogoFile(null); 
        setSignatureFile(null); 
        setErrors({}); 
        setImagesToDelete({}); // Also reset deletion flags
    };
    
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!validateForm()) return;
        setIsSaving(true);
        const submissionData = new FormData();
        Object.entries(formData).forEach(([key, value]) => { if (Array.isArray(value)) { value.forEach(item => submissionData.append(`${key}[]`, item)); } else if (value !== null && value !== undefined) { submissionData.append(key, value.toString()); }});
        if (logoFile) submissionData.append('logo', logoFile);
        if (signatureFile) submissionData.append('signature', signatureFile);

        // --- NEW --- Append deletion flags to the submission data
        if (imagesToDelete.logo) submissionData.append('deleteLogo', 'true');
        if (imagesToDelete.signature) submissionData.append('deleteSignature', 'true');

        try {
            const response = await fetch('/api/business/settings', { method: 'POST', body: submissionData });
            const result = await response.json();
            if (!response.ok || !result.success) { throw new Error(result.message || 'Failed to save settings.'); }
            alert('Settings saved successfully!');
            const savedData = result.data;
            setFormData(savedData); 
            setInitialData(savedData); 
            setLogoFile(null); 
            setSignatureFile(null);
            setImagesToDelete({}); // Reset deletion flags after a successful save
            setIsGstRegistered(savedData.gstNumber ? 'yes' : 'no');
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
            alert(`Failed to save settings: ${errorMessage}`);
            console.error("API Error:", error);
        } finally {
            setIsSaving(false);
        }
    };

    if (isLoading) {
        return <FormSkeleton />;
    }

    return (
        <div className="bg-gray-50 min-h-screen">
            <CreateBusinessModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onSubmit={handleCreateBusiness} />
            <form onSubmit={handleSubmit} noValidate>
                <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                    <header className="sticky top-0 bg-gray-50/80 backdrop-blur-sm z-10 py-4 mb-6">
                        <div className="flex justify-between items-center">
                             <div><h1 className="text-2xl font-bold text-gray-900">Business Settings</h1><p className="text-sm text-gray-500">Edit Your Company Settings And Information</p></div>
                            <div className="flex items-center gap-3">
                                {/* <button  onClick={() => setIsModalOpen(true)} type="button" className="px-4 py-2 text-sm font-semibold text-white bg-orange-500 rounded-md hover:bg-orange-600">Create new business</button> */}
                                <button type="button" className="hidden lg:flex items-center gap-2 px-4 py-2 text-sm font-semibold text-blue-600 bg-blue-100 rounded-md hover:bg-blue-200 cursor-pointer"><MessageSquare size={16} /> Chat Support</button>
                                {/* <button type="button" className="hidden md:flex items-center gap-2 px-4 py-2 text-sm font-semibold text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-100 cursor-pointer"><CalendarX size={16} /> Close Financial Year</button> */}
                                <button type="button" onClick={handleCancel} className="px-4 py-2 text-sm font-semibold text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-100 cursor-pointer">Cancel</button>
                                <button type="submit" disabled={!isDirty || isSaving} className="px-4 py-2 text-sm font-semibold text-white bg-indigo-600 rounded-md hover:bg-indigo-700 cursor-pointer disabled:bg-indigo-400 disabled:cursor-not-allowed">{isSaving ? 'Saving...' : 'Save Changes'}</button>
                            </div>
                        </div>
                    </header>
                    <main className="space-y-8">
                        <div className="bg-white p-8 rounded-lg shadow-sm border border-gray-200">
                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                                <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="md:col-span-2 flex items-start gap-6">
                                        <ImageUpload label="Upload Logo" previewUrl={logoPreview} onFileSelect={setLogoFile} onClear={handleLogoClear} />
                                        <FormField label="Business Name" required className="flex-grow" error={errors.name}>
                                            <Input id="Business Name" value={formData.name} onChange={(e) => handleInputChange('name', e.target.value)} hasError={!!errors.name} />
                                        </FormField>
                                    </div>
                                    <FormField label="Company Phone Number"><Input value={formData.phone} onChange={(e) => handleInputChange('phone', e.target.value)} /></FormField>
                                    <FormField label="Company E-Mail" error={errors.email}><Input type="email" value={formData.email} onChange={(e) => handleInputChange('email', e.target.value)} placeholder="Enter company e-mail" hasError={!!errors.email}/></FormField>
                                    <div className="md:col-span-2">
                                        <FormField label="Billing Address"><textarea rows={3} value={formData.address} onChange={(e) => handleInputChange('address', e.target.value)} placeholder="Enter Billing Address" className="block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"/></FormField>
                                    </div>
                                    <FormField label="State">
                                        <ShadcnSelect.Select value={formData.state} onValueChange={(val) => handleInputChange('state', val)}>
                                            <ShadcnSelect.SelectTrigger className="w-full">
                                                <ShadcnSelect.SelectValue placeholder="Select State" />
                                            </ShadcnSelect.SelectTrigger>
                                            <ShadcnSelect.SelectContent>
                                                <ShadcnSelect.SelectGroup>
                                                    {INDIAN_STATES.sort().map(stateName => (
                                                        <ShadcnSelect.SelectItem key={stateName} value={stateName}>
                                                            <span>{stateName}</span>
                                                        </ShadcnSelect.SelectItem>
                                                    ))}
                                                </ShadcnSelect.SelectGroup>
                                            </ShadcnSelect.SelectContent>
                                        </ShadcnSelect.Select>
                                    </FormField>
                                    <FormField label="Pincode"><Input value={formData.pincode} onChange={(e) => handleInputChange('pincode', e.target.value)} placeholder="Enter Pincode" /></FormField>
                                    <FormField label="City" className="md:col-span-2"><Input value={formData.city} onChange={(e) => handleInputChange('city', e.target.value)} placeholder="Enter City" /></FormField>
                                    <div className="md:col-span-2">
                                        <label className="block text-sm font-medium text-gray-600 mb-2">Are you GST Registered?</label>
                                        <div className="flex items-center gap-6">
                                            <label className="flex items-center gap-2 cursor-pointer"><input type="radio" name="gst-registered" value="yes" checked={isGstRegistered === 'yes'} onChange={() => handleGstRadioChange('yes')} className="h-4 w-4 text-indigo-600 border-gray-300 focus:ring-indigo-500"/> Yes</label>
                                            <label className="flex items-center gap-2 cursor-pointer"><input type="radio" name="gst-registered" value="no" checked={isGstRegistered === 'no'} onChange={() => handleGstRadioChange('no')} className="h-4 w-4 text-indigo-600 border-gray-300 focus:ring-indigo-500"/> No</label>
                                        </div>
                                    </div>
                                    {isGstRegistered === 'yes' && (
                                        <FormField label="GST Number" className="md:col-span-2">
                                            <Input value={formData.gstNumber} onChange={(e) => handleInputChange('gstNumber', e.target.value)} placeholder="Enter your GST Number" />
                                        </FormField>
                                    )}
                                    <div className="md:col-span-2 bg-blue-50/50 p-4 rounded-lg flex justify-between items-center">
                                        <div className="flex items-center gap-2"><span className="font-semibold text-indigo-700">Enable e-invoicing</span><span className="bg-blue-200 text-blue-800 text-xs font-bold px-2 py-0.5 rounded-md">New</span></div>
                                        <ToggleSwitch enabled={formData.enableEInvoicing} onChange={(val) => handleInputChange('enableEInvoicing', val)} />
                                    </div>
                                    <FormField label="PAN Number" className="md:col-span-2">
                                        <Input
                                            value={formData.panNumber}
                                            onChange={(e) => {
                                                // Allow only letters and digits, uppercase, max length 10
                                                const raw = e.target.value.toUpperCase();
                                                const filtered = raw.replace(/[^A-Z0-9]/g, '').slice(0, 10);
                                                handleInputChange('panNumber', filtered);
                                                // Live validate and set error if obviously invalid length/format
                                                if (filtered.length === 10 && !isValidPAN(filtered)) {
                                                    setErrors(prev => ({ ...prev, panNumber: 'PAN must be in format AAAAA9999A.' }));
                                                } else {
                                                    setErrors(prev => ({ ...prev, panNumber: undefined }));
                                                }
                                            }}
                                            placeholder="Format: AAAAA9999A"
                                            maxLength={10}
                                        />
                                        {errors.panNumber && <p className="mt-1 text-xs text-red-500">{errors.panNumber}</p>}
                                    </FormField>
                                    <div className="md:col-span-2 flex items-center justify-between"><span className="text-sm font-medium text-gray-600">Enable TDS</span><ToggleSwitch enabled={formData.enableTds} onChange={(val) => handleInputChange('enableTds', val)} /></div>
                                    <div className="md:col-span-2 flex items-center justify-between"><span className="text-sm font-medium text-gray-600">Enable TCS</span><ToggleSwitch enabled={formData.enableTcs} onChange={(val) => handleInputChange('enableTcs', val)} /></div>
                                </div>
                                <div className="space-y-6">
                                    <MultiSelectDropdown label="Business Type" options={BUSINESS_TYPE_OPTIONS} selectedItems={formData.businessTypes} onChange={(val) => handleInputChange('businessTypes', val)} />
                                    <MultiSelectDropdown label="Industry Type" options={INDUSTRY_OPTIONS} selectedItems={formData.industryTypes} onChange={(val) => handleInputChange('industryTypes', val)} />
                                    <FormField label="Business Registration Type">
                                        <Select 
                                            value={formData.registrationType} 
                                            onChange={(e) => handleInputChange('registrationType', e.target.value)}
                                        >
                                            <option value="" disabled>Select a type</option>
                                            {REGISTRATION_TYPE_OPTIONS.map(type => (
                                                <option key={type} value={type}>
                                                    {type}
                                                </option>
                                            ))}
                                        </Select>
                                    </FormField>
                                    <div>
                                        <ImageUpload label="Signature" previewUrl={signaturePreview} onFileSelect={setSignatureFile} onClear={handleSignatureClear} />
                                        <p className="text-xs text-gray-500 mt-2"><span className="font-semibold">Note:</span> Terms & Conditions and Signature added below will be shown on your Invoices</p>
                                    </div>
                                    <div className="border border-gray-200 rounded-lg p-4 space-y-3">
                                        <h4 className="font-semibold text-gray-800">Add Business Details</h4>
                                        <p className="text-xs text-gray-500">Add additional business information such as MSME number, Website etc.</p>
                                        <FormField label="Website URL">
                                            <Input placeholder="https://www.example.com" value={formData.website} onChange={e => handleInputChange('website', e.target.value)} />
                                        </FormField>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="bg-white p-8 rounded-lg shadow-sm border border-gray-200">
                            <h3 className="text-lg font-semibold text-gray-900 mb-4">Company Settings</h3>
                            <div className="border border-gray-200 rounded-lg p-4 flex items-center gap-4 max-w-md">
                                <Tally3 className="text-blue-600" size={32} />
                                <div>
                                    <div className="flex items-center gap-2"><h4 className="font-semibold text-gray-800">Data Export to Tally</h4><span className="bg-blue-200 text-blue-800 text-xs font-bold px-2 py-0.5 rounded-md">New</span></div>
                                    <p className="text-sm text-gray-500">Transfer vouchers, items and parties to Tally</p>
                                </div>
                            </div>
                        </div>
                        {/* <div className="bg-white p-8 rounded-lg shadow-sm border border-gray-200">
                            <button type="button" className="font-semibold text-gray-800 hover:text-indigo-600">Add New Business</button>
                        </div> */}
                    </main>
                </div>
            </form>
        </div>
    );
};

export default BusinessSettingsPage;