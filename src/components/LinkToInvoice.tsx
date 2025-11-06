'use client';
import React, { useState, useEffect, useRef } from 'react';
import { Search, ClipboardX } from 'lucide-react';

// Interfaces and Types
export interface Invoice {
    id?: string;
    date: string;
    invoiceNo: string;
    invoiceNumber?: number;
    amount: number;
    partyId?: string;
}

// Mock Data
export const mockSalesInvoices: Invoice[] = [
    { date: '2024-05-20', invoiceNo: 'INV-001', amount: 1500.00 },
    { date: '2024-05-18', invoiceNo: 'INV-002', amount: 250.50 },
    { date: '2024-05-15', invoiceNo: 'INV-003', amount: 780.75 },
];

export const mockPurchaseInvoices: Invoice[] = [
    { date: '2024-05-20', invoiceNo: 'PUR-001', amount: 1500.00 },
    { date: '2024-05-18', invoiceNo: 'PUR-002', amount: 250.50 },
    { date: '2024-05-15', invoiceNo: 'PUR-003', amount: 780.75 },
];

// Helper Components
const Input = React.forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>((props, ref) => (
    <input
        {...props}
        ref={ref}
        className={`flex h-9 w-full rounded-md border border-gray-300 bg-transparent px-3 py-1 text-sm shadow-sm transition-colors placeholder:text-gray-400 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-blue-500 ${props.className}`}
    />
));
Input.displayName = "Input";

// Helper Function
const formatCurrency = (amount: number) => {
    if (isNaN(amount) || amount === null) return '0.00';
    return new Intl.NumberFormat('en-IN', {
        style: 'decimal',
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    }).format(amount);
};

// Component Props
interface LinkToInvoiceProps {
    invoiceList: Invoice[];
    searchTerm: string;
    onSearchTermChange?: (term: string) => void;
    onSelectInvoice?: (invoice: Invoice) => void;
}

export const LinkToInvoice = ({ invoiceList, searchTerm, onSearchTermChange, onSelectInvoice }: LinkToInvoiceProps) => {
    const [showSearchedInvoices, setShowSearchedInvoices] = useState(false);
    const invoiceSearchRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (invoiceSearchRef.current && !invoiceSearchRef.current.contains(event.target as Node)) {
                setShowSearchedInvoices(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    const handleSelectInvoice = (invoice: Invoice) => {
        if (onSelectInvoice) onSelectInvoice(invoice);
        else if (onSearchTermChange) onSearchTermChange(invoice.invoiceNo || String(invoice.invoiceNumber || invoice.id || ''));
        setShowSearchedInvoices(false);
    };

    const filteredInvoices = invoiceList.filter(invoice => {
        const invNo = (invoice.invoiceNo || String(invoice.invoiceNumber || '')).toLowerCase();
        const term = (searchTerm || '').toLowerCase();
        return invNo.includes(term) || invoice.date.includes(searchTerm) || String(invoice.amount).includes(searchTerm) || (invoice.id && invoice.id.includes(searchTerm));
    });

    return (
        <div className="w-full sm:w-[calc(32rem+1rem)] border rounded-lg p-4 bg-gray-50 space-y-3">
            <div className="flex justify-between items-center">
                <label className="text-sm font-medium text-gray-700">Link to Invoice :</label>
                <span className="bg-red-100 text-red-700 text-xs font-semibold px-2.5 py-0.5 rounded-full">New</span>
            </div>
            <div className="relative" ref={invoiceSearchRef}>
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 z-10" />
                <Input
                    placeholder="Search invoices"
                    className="pl-10 bg-white"
                    value={searchTerm}
                    onChange={(e) => onSearchTermChange && onSearchTermChange(e.target.value)}
                    onFocus={() => setShowSearchedInvoices(true)}
                />
                {showSearchedInvoices && (
                    <div className="absolute top-full mt-1 w-full bg-white border rounded-md shadow-lg z-20 max-h-60 overflow-y-auto">
                        <table className="w-full text-sm">
                            <thead className="sticky top-0 bg-gray-100">
                                <tr>
                                    <th className="p-2 text-left font-medium text-gray-600 w-1/3">Date</th>
                                    <th className="p-2 text-left font-medium text-gray-600 w-1/3">Invoice No.</th>
                                    <th className="p-2 text-right font-medium text-gray-600 w-1/3">Amount (₹)</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredInvoices.length > 0 ? (
                                    filteredInvoices.map((invoice, index) => (
                                        <tr key={index} className="hover:bg-gray-50 cursor-pointer" onClick={() => handleSelectInvoice(invoice)}>
                                            <td className="p-2">{invoice.date}</td>
                                            <td className="p-2">{invoice.invoiceNo || (invoice.invoiceNumber ? String(invoice.invoiceNumber) : invoice.id)}</td>
                                            <td className="p-2 text-right">{formatCurrency(invoice.amount)}</td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan={3} className="text-center py-4">
                                            <div className="flex flex-col items-center gap-2 text-gray-500">
                                                <ClipboardX className="h-8 w-8" />
                                                <span>No invoices found.</span>
                                            </div>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
};