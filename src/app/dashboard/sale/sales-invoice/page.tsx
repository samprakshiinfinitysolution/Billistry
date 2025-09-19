'use client';

import React, { useState, useEffect } from 'react';
import { Plus, Settings, CalendarIcon, Trash2, QrCode, X, ArrowLeft, ChevronDown } from 'lucide-react';

// Helper function to format numbers as currency
const formatCurrency = (amount: number) => {
    if (isNaN(amount)) amount = 0;
    return new Intl.NumberFormat('en-IN', {
        style: 'decimal',
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    }).format(amount);
};

// Mock UI components
const Button = ({ children, ...props }: React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: string, size?: string }) => (
    <button
        {...props}
        className={`inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none disabled:opacity-50 disabled:pointer-events-none ${props.className}`}
    >
        {children}
    </button>
);

const Input = React.forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>((props, ref) => (
    <input
        {...props}
        ref={ref}
        className={`flex h-9 w-full rounded-md border border-gray-300 bg-transparent px-3 py-1 text-sm shadow-sm transition-colors placeholder:text-gray-400 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-blue-500 ${props.className}`}
    />
));
Input.displayName = "Input";

const Textarea = React.forwardRef<HTMLTextAreaElement, React.TextareaHTMLAttributes<HTMLTextAreaElement>>((props, ref) => (
    <textarea
        {...props}
        ref={ref}
        className={`flex min-h-[80px] w-full rounded-md border bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-gray-400 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-blue-500 ${props.className}`}
    />
));
Textarea.displayName = "Textarea";


const Checkbox = React.forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>((props, ref) => (
    <input
        type="checkbox"
        {...props}
        ref={ref}
        className={`h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 ${props.className}`}
    />
));
Checkbox.displayName = "Checkbox";


// Represents a single item in the invoice table
interface InvoiceItem {
    id: number;
    name: string;
    hsn: string;
    qty: number;
    price: number;
    discount: number; // percentage
    tax: number; // percentage
}

const CreateSalesInvoicePage = () => {
    const [invoiceNumber, setInvoiceNumber] = useState(1);
    const [invoiceDate, setInvoiceDate] = useState(new Date().toISOString().split('T')[0]);
    const [items, setItems] = useState<InvoiceItem[]>([]);
    const [terms, setTerms] = useState('1. Goods once sold will not be taken back or exchanged\n2. All disputes are subject to [ENTER_YOUR_CITY_NAME] jurisdiction only');
    const [additionalCharges, setAdditionalCharges] = useState(0);
    const [overallDiscount, setOverallDiscount] = useState(0);
    const [autoRoundOff, setAutoRoundOff] = useState(false);
    const [amountReceived, setAmountReceived] = useState(0);
    const [isFullyPaid, setIsFullyPaid] = useState(false);

    // --- CALCULATIONS ---
    const subtotal = items.reduce((acc, item) => acc + (item.qty || 0) * (item.price || 0), 0);
    const totalItemDiscount = items.reduce((acc, item) => {
        const itemTotal = (item.qty || 0) * (item.price || 0);
        return acc + (itemTotal * ((item.discount || 0) / 100));
    }, 0);
    const totalTax = items.reduce((acc, item) => {
        const itemTotal = (item.qty || 0) * (item.price || 0);
        const itemDiscount = itemTotal * ((item.discount || 0) / 100);
        const taxableAmount = itemTotal - itemDiscount;
        return acc + (taxableAmount * ((item.tax || 0) / 100));
    }, 0);

    const taxableAmount = subtotal + additionalCharges;
    const totalAmount = taxableAmount - overallDiscount + totalTax;
    const finalAmount = autoRoundOff ? Math.round(totalAmount) : totalAmount;
    const balanceAmount = finalAmount - amountReceived;

    useEffect(() => {
        if (isFullyPaid) {
            setAmountReceived(finalAmount);
        }
    }, [isFullyPaid, finalAmount]);

    // --- HANDLERS ---
    const handleAddItem = () => {
        const newItem: InvoiceItem = { id: Date.now(), name: '', hsn: '', qty: 1, price: 0, discount: 0, tax: 0 };
        setItems([...items, newItem]);
    };

    const handleRemoveItem = (id: number) => {
        setItems(items.filter(item => item.id !== id));
    };

    const handleItemChange = (id: number, field: keyof InvoiceItem, value: string) => {
        setItems(items.map(item =>
            item.id === id ? { ...item, [field]: parseFloat(value) || 0 } : item
        ));
    };
    
    const calculateItemAmount = (item: InvoiceItem): number => {
        const itemTotal = (item.qty || 0) * (item.price || 0);
        const itemDiscount = itemTotal * ((item.discount || 0) / 100);
        const taxable = itemTotal - itemDiscount;
        const taxAmount = taxable * ((item.tax || 0) / 100);
        return taxable + taxAmount;
    };


    return (
        <div className="bg-gray-50 min-h-screen">
            {/* Header */}
            <header className="bg-white shadow-sm sticky top-0 z-10">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
                    <div className="flex justify-between items-center">
                        <div className="flex items-center gap-4">
                            <Button variant="ghost" size="icon" className="text-gray-600 hover:bg-gray-100 rounded-full p-2">
                                <ArrowLeft className="h-5 w-5" />
                            </Button>
                            <h1 className="text-xl font-semibold text-gray-800">Create Sales Invoice</h1>
                        </div>
                        <div className="flex items-center gap-2">
                            <Button variant="outline" className="bg-white border-gray-300 text-gray-700 hover:bg-gray-100 px-3 py-2">
                                <Settings className="h-4 w-4 mr-2" /> Settings
                            </Button>
                            <Button className="bg-indigo-100 text-indigo-700 font-semibold hover:bg-indigo-200 px-4 py-2">
                                Save Sales Invoice
                            </Button>
                        </div>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
                <div className="bg-white p-6 rounded-lg shadow-sm">
                    {/* Top Section: Billing and Invoice Details */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                        <div className="md:col-span-1">
                            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 flex justify-center items-center h-full">
                                <Button variant="outline" className="text-blue-600 border-none hover:bg-blue-50" onClick={() => alert('Add Party Clicked')}>
                                    <Plus className="mr-2 h-4 w-4" /> Add Party
                                </Button>
                            </div>
                        </div>
                        <div className="md:col-span-2 flex flex-col items-end gap-4">
                             <div className="w-full sm:w-64">
                                 <Input id="invoiceNo" type="number" value={invoiceNumber} onChange={e => setInvoiceNumber(parseInt(e.target.value))} />
                             </div>
                             <div className="w-full sm:w-64">
                                <div className="relative">
                                     <Input id="invoiceDate" type="date" value={invoiceDate} onChange={e => setInvoiceDate(e.target.value)} />
                                     <CalendarIcon className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
                                </div>
                             </div>
                             <div className="w-full sm:w-64 flex justify-end">
                                 <Button variant="outline" className="text-blue-600 border-none hover:bg-blue-50" onClick={() => alert('Add Due Date Clicked')}>
                                    <Plus className="mr-2 h-4 w-4" /> Add Due Date
                                 </Button>
                             </div>
                        </div>
                    </div>

                    {/* Items Table Section */}
                    <div className="overflow-x-auto">
                        <table className="w-full min-w-[900px]">
                            <thead className="border-b bg-gray-100">
                                <tr>
                                    <th className="px-2 py-2 text-left text-xs font-medium text-black w-10">NO</th>
                                    <th className="px-2 py-2 text-left text-xs font-medium text-black flex-1">ITEMS/SERVICES</th>
                                    <th className="px-2 py-2 text-left text-xs font-medium text-black w-28">HSN/SAC</th>
                                    <th className="px-2 py-2 text-left text-xs font-medium text-black w-20">QTY</th>
                                    <th className="px-2 py-2 text-left text-xs font-medium text-black w-32">PRICE/ITEM (₹)</th>
                                    <th className="px-2 py-2 text-left text-xs font-medium text-black w-28">DISCOUNT</th>
                                    <th className="px-2 py-2 text-left text-xs font-medium text-black w-28">TAX</th>
                                    <th className="px-2 py-2 text-right text-xs font-medium text-black w-32">AMOUNT (₹)</th>
                                    <th className="w-12"></th>
                                </tr>
                            </thead>
                            <tbody>
                                {items.map((item, index) => (
                                    <tr key={item.id}>
                                        <td className="px-2 py-2 text-sm text-gray-500">{index + 1}</td>
                                        <td className="px-2 py-2"><Input type="text" placeholder="Item Name" onChange={e => handleItemChange(item.id, 'name', e.target.value)} /></td>
                                        <td className="px-2 py-2"><Input type="text" placeholder="HSN" onChange={e => handleItemChange(item.id, 'hsn', e.target.value)} /></td>
                                        <td className="px-2 py-2"><Input type="number" placeholder="1" onChange={e => handleItemChange(item.id, 'qty', e.target.value)} /></td>
                                        <td className="px-2 py-2"><Input type="number" placeholder="0.00" onChange={e => handleItemChange(item.id, 'price', e.target.value)} /></td>
                                        <td className="px-2 py-2"><Input type="number" placeholder="%" onChange={e => handleItemChange(item.id, 'discount', e.target.value)} /></td>
                                        <td className="px-2 py-2"><Input type="number" placeholder="%" onChange={e => handleItemChange(item.id, 'tax', e.target.value)} /></td>
                                        <td className="px-2 py-2 text-sm text-gray-800 text-right">{formatCurrency(calculateItemAmount(item))}</td>
                                        <td className="px-2 py-2 text-center">
                                            <Button variant="ghost" size="icon" onClick={() => handleRemoveItem(item.id)} className="text-gray-400 hover:text-red-500 rounded-full p-1">
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                            <tfoot className="border-b bg-gray-100">
                                <tr>
                                    <td colSpan={5} className="px-2 py-2 text-right text-xs font-medium text-black">SUBTOTAL</td>
                                    <td className="px-2 py-2 text-right text-xs font-medium text-black">₹ {formatCurrency(totalItemDiscount)}</td>
                                    <td className="px-2 py-2 text-right text-xs font-medium text-black">₹ {formatCurrency(totalTax)}</td>
                                    <td className="px-2 py-2 text-right text-xs font-medium text-black">₹ {formatCurrency(subtotal - totalItemDiscount + totalTax)}</td>
                                    <td></td>
                                </tr>
                            </tfoot>
                        </table>
                    </div>

                    <div className="flex items-start mt-2">
                        <div className="flex-grow border-2 border-dashed border-gray-300 rounded-lg p-4 flex justify-between items-center mr-4">
                            <Button variant="outline" className="text-blue-600 border-none hover:bg-transparent" onClick={handleAddItem}>
                                <Plus className="mr-2 h-4 w-4" /> Add Item
                            </Button>
                            <Button variant="outline" className="text-gray-700 border-gray-300 hover:bg-gray-50 px-3 py-1.5 rounded-lg">
                                <QrCode className="mr-2 h-4 w-4" /> Scan Barcode
                            </Button>
                        </div>
                        <Button onClick={handleAddItem} className="bg-gray-700 text-white rounded-full p-2 hover:bg-gray-800">
                             <Plus className="h-5 w-5"/>
                        </Button>
                    </div>

                    <hr className="my-6" />

                    {/* Bottom Section: Notes, Terms and Calculations */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-16">
                         {/* Left side */}
                        <div className="space-y-4">
                           <Button variant="link" className="text-blue-600 p-0 hover:underline"><Plus className="mr-1 h-4 w-4" /> Add Notes</Button>
                           <div className="relative">
                               <label className="text-sm font-medium text-gray-500 mb-1 block">Terms and Conditions</label>
                               <div className="bg-gray-100 p-3 rounded-md">
                                  <Textarea value={terms} onChange={(e) => setTerms(e.target.value)} rows={3} className="bg-transparent border-none focus-visible:ring-0 p-0"/>
                               </div>
                               <Button variant="ghost" size="icon" className="absolute top-7 right-2 text-gray-400 hover:text-gray-600" onClick={() => setTerms('')}>
                                    <X className="h-4 w-4" />
                               </Button>
                           </div>
                           <Button variant="link" className="text-blue-600 p-0 hover:underline"><Plus className="mr-1 h-4 w-4" /> Add New Account</Button>
                        </div>

                        {/* Right side */}
                        <div className="space-y-2 mt-6 md:mt-0">
                             <div className="flex justify-between items-center text-sm">
                                 <Button variant="link" className="text-blue-600 p-0 hover:underline"><Plus className="mr-1 h-4 w-4" /> Add Additional Charges</Button>
                                 <span className="text-gray-700">₹ {formatCurrency(additionalCharges)}</span>
                             </div>
                             <div className="flex justify-between items-center text-sm">
                                 <span className="text-gray-500">Taxable Amount</span>
                                 <span className="text-gray-700">₹ {formatCurrency(taxableAmount)}</span>
                             </div>
                              <div className="flex justify-between items-center text-sm">
                                 <Button variant="link" className="text-blue-600 p-0 hover:underline"><Plus className="mr-1 h-4 w-4" /> Add Discount</Button>
                                 <span className="text-gray-700">- ₹ {formatCurrency(overallDiscount)}</span>
                             </div>
                             <div className="flex justify-between items-center text-sm">
                                <label htmlFor="autoRoundOff" className="flex items-center gap-2 text-gray-600 cursor-pointer">
                                    <Checkbox id="autoRoundOff" checked={autoRoundOff} onChange={(e) => setAutoRoundOff(e.target.checked)} /> Auto Round Off
                                </label>
                                <div className="flex items-center gap-2">
                                     <Button variant="link" className="text-blue-600 p-0 text-xs"> + Add</Button>
                                     <span className="text-gray-700">₹ {formatCurrency(finalAmount - totalAmount)}</span>
                                </div>
                             </div>
                             
                             <hr className="my-2"/>
 
                              <div className="flex justify-between items-center font-bold text-base">
                                 <span>Total Amount</span>
                                 <Button className="bg-gray-100 text-gray-500 px-4 py-2 rounded-lg">Enter Payment amount</Button>
                              </div>
                              
                              <div className="flex justify-between items-center text-sm mt-4">
                                <span className="text-gray-500">Amount Received</span>
                                <div className="flex items-center gap-1 w-48">
                                    <div className="relative flex-grow">
                                        <span className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-500 text-sm">₹</span>
                                        <Input id="amountReceived" type="number" value={amountReceived} onChange={(e) => setAmountReceived(parseFloat(e.target.value) || 0)} className="pl-6 text-right"/>
                                    </div>
                                    <select className="h-9 rounded-md border border-gray-300 bg-white px-2 text-sm text-gray-700">
                                         <option>Cash</option>
                                         <option>Bank</option>
                                    </select>
                                </div>
                              </div>
                              <div className="flex justify-end items-center gap-2 mt-1">
                                    <label htmlFor="fullyPaid" className="text-sm text-gray-500 cursor-pointer">Mark as fully paid</label>
                                    <Checkbox id="fullyPaid" checked={isFullyPaid} onChange={(e) => setIsFullyPaid(e.target.checked)}/>
                              </div>

                              <div className="flex justify-between items-center mt-2 font-semibold">
                                 <span className="text-green-600">Balance Amount</span>
                                 <span className="text-green-600">₹ {formatCurrency(balanceAmount)}</span>
                              </div>
                        </div>
                    </div>

                    {/* Footer Signature */}
<div className="mt-24 flex justify-end">
    <div className="w-64">
        <div className="h-24 w-48 rounded border border-gray-300 ml-auto">
            {/* This space is intentionally left blank for a written signature */}
        </div>
        <div className="mt-2 text-right">
            <p className="text-sm text-gray-600">Authorized signatory for <span className="font-semibold">Business Name</span></p>
        </div>
    </div>
</div>
                </div>
            </main>
        </div>
    );
};

export default CreateSalesInvoicePage;