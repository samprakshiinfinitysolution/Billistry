'use client';

import toast from 'react-hot-toast';
import React, { useState, useEffect, useRef } from 'react';
import { X, Search, ChevronDown } from 'lucide-react';

// --- Sub-component: A reusable Searchable Dropdown (Combobox) ---
interface SearchableDropdownProps {
  label: string;
  options: string[];
  selected: string;
  onSelect: (value: string) => void;
  placeholder?: string;
  required?: boolean;
}

const SearchableDropdown = ({ label, options, selected, onSelect, placeholder = "Type to search", required = false }: SearchableDropdownProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const filteredOptions = searchTerm
    ? options.filter(option => option.toLowerCase().includes(searchTerm.toLowerCase()))
    : options;

  const handleSelect = (option: string) => {
    onSelect(option);
    setSearchTerm(""); // Clear search term after selection
    setIsOpen(false);
  };
  
  const displayValue = selected || searchTerm;

  return (
    <div className="relative" ref={dropdownRef}>
      <label className="block text-sm font-medium text-gray-700 mb-1">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <div className="relative" onClick={() => setIsOpen(prev => !prev)}>
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 pointer-events-none" />
        <input
          type="text"
          value={displayValue}
          onChange={(e) => {
            setSearchTerm(e.target.value);
            if (selected) onSelect(""); // Clear selection if user starts typing
            if (!isOpen) setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
          placeholder={placeholder}
          className="w-full pl-10 pr-10 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 cursor-pointer"
        />
        <ChevronDown className={`absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </div>
      {isOpen && (
        <ul className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-y-auto">
          {filteredOptions.length > 0 ? (
            filteredOptions.map(option => (
              <li key={option} onClick={() => handleSelect(option)} className="px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 cursor-pointer">
                {option}
              </li>
            ))
          ) : (
            <li className="px-4 py-2 text-sm text-gray-500">No results found</li>
          )}
        </ul>
      )}
    </div>
  );
};


// --- Main Reusable Create Business Modal Component ---
interface CreateBusinessModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: FormDataType) => Promise<void>;
}

export interface FormDataType {
  businessName: string;
  businessType: string;
  industryType: string;
  incorporationType: string;
}

// --- Mock Data for Dropdowns ---
const BUSINESS_TYPE_OPTIONS = ['Retailer', 'Wholesaler', 'Distributor', 'Manufacturer', 'Services'];
const INDUSTRY_OPTIONS = [ 'Accounting', 'Agriculture', 'Automobile', 'Construction', 'Education', 'Electronics', 'Engineering', 'FMCG', 'Fitness', 'Garments/Clothing', 'Hospitality', 'IT', 'Jewellery', 'Real Estate', 'Restaurants', 'Salon', 'Transport' ];
const INCORPORATION_OPTIONS = ['Sole Proprietorship', 'Partnership', 'Limited Liability Partnership (LLP)', 'Private Limited Company', 'Public Limited Company', 'Other'];

export const CreateBusinessModal = ({ isOpen, onClose, onSubmit }: CreateBusinessModalProps) => {
  const [formData, setFormData] = useState<FormDataType>({ businessName: "", businessType: "", industryType: "", incorporationType: "" });
  const [errors, setErrors] = useState<{ businessName?: string; incorporationType?: string }>({});
  const [isSaving, setIsSaving] = useState(false);
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Reset form when modal is opened
    if (isOpen) {
      setFormData({ businessName: "", businessType: "", industryType: "", incorporationType: "" });
      setErrors({});
      setIsSaving(false);
    }
    // Handle Escape key press
    const handleEsc = (event: KeyboardEvent) => { if (event.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [isOpen, onClose]);

  const validate = () => {
    const newErrors: { businessName?: string; incorporationType?: string } = {};
    if (!formData.businessName || formData.businessName.length < 3 || formData.businessName.length > 60) {
      newErrors.businessName = "Business name must be 3-60 characters.";
    }
    if (!formData.incorporationType) {
        newErrors.incorporationType = "Incorporation type is required.";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setIsSaving(true);
    try {
      await onSubmit(formData);
      onClose();
    } catch (error) {
      console.error("Failed to create business:", error);
      toast.error("Failed to create business. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex justify-center items-center p-4 transition-opacity">
      <div
        ref={modalRef}
        className="bg-white rounded-lg shadow-xl w-full max-w-lg animate-fade-in-up"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center p-4 border-b">
          <h2 className="text-xl font-semibold text-gray-800">Create Business</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><X size={24} /></button>
        </div>

        <div className="p-6 space-y-6">
          <div className="text-center">
            <img src="https://i.imgur.com/3xR2u9p.png" alt="Manage multiple businesses" className="mx-auto mb-3" style={{ maxWidth: '300px' }}/>
            <p className="text-sm text-gray-600">Have more than 1 business?</p>
            <p className="text-sm text-blue-600">Easily manage all your businesses on myBillBook</p>
          </div>
          
          <form id="create-business-form" onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="businessName" className="block text-sm font-medium text-gray-700 mb-1">Business Name <span className="text-red-500">*</span></label>
              <input
                id="businessName" type="text" value={formData.businessName}
                onChange={(e) => setFormData({ ...formData, businessName: e.target.value })}
                placeholder="Enter business name"
                className={`w-full px-3 py-2 border ${errors.businessName ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500`}
              />
              {errors.businessName && <p className="text-sm text-red-500 mt-1">{errors.businessName}</p>}
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Business Type</label>
                <div className="relative">
                    <select value={formData.businessType} onChange={(e) => setFormData({ ...formData, businessType: e.target.value })}
                        className="w-full appearance-none px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                    >
                        <option value="" disabled>Select</option>
                        {BUSINESS_TYPE_OPTIONS.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 pointer-events-none" />
                </div>
            </div>

            <SearchableDropdown
              label="Industry Type"
              options={INDUSTRY_OPTIONS}
              selected={formData.industryType}
              onSelect={(value) => setFormData({ ...formData, industryType: value })}
            />

            <SearchableDropdown
              label="Incorporation Type"
              options={INCORPORATION_OPTIONS}
              selected={formData.incorporationType}
              onSelect={(value) => setFormData({ ...formData, incorporationType: value })}
              required
            />
             {errors.incorporationType && <p className="text-sm text-red-500 -mt-2">{errors.incorporationType}</p>}
          </form>
        </div>

        <div className="flex justify-end items-center p-4 border-t bg-gray-50 rounded-b-lg">
          <button type="button" onClick={onClose} className="px-6 py-2 text-sm font-semibold text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-100 mr-3">Cancel</button>
          <button form="create-business-form" type="submit" disabled={isSaving} className="px-6 py-2 text-sm font-semibold text-white bg-indigo-600 rounded-md hover:bg-indigo-700 disabled:bg-indigo-400 disabled:cursor-not-allowed">
            {isSaving ? 'Saving...' : 'Save'}
          </button>
        </div>
      </div>
    </div>
  );
};