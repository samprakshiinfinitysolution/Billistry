'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Plus, Settings, CalendarIcon, Trash2, QrCode, X, ArrowLeft } from 'lucide-react';

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

interface Charge {
    id: number;
    name: string;
    amount: string;
}

const CreateSalesInvoicePage = () => {
    const [invoiceNumber, setInvoiceNumber] = useState(1);
    const [invoiceDate, setInvoiceDate] = useState(new Date().toISOString().split('T')[0]);
    const [items, setItems] = useState<InvoiceItem[]>([]);
    const [terms, setTerms] = useState('1. Goods once sold will not be taken back or exchanged\n2. All disputes are subject to [ENTER_YOUR_CITY_NAME] jurisdiction only');
    const [additionalCharges, setAdditionalCharges] = useState<Charge[]>([]);    
    // --- New Discount States ---
    const [showDiscountInput, setShowDiscountInput] = useState(false);
    const [discountOption, setDiscountOption] = useState<'before-tax' | 'after-tax'>('before-tax');
    const [discountPercentStr, setDiscountPercentStr] = useState('');
    const [discountFlatStr, setDiscountFlatStr] = useState('');
    const [lastDiscountInput, setLastDiscountInput] = useState<'percent' | 'flat' | null>(null);
    const [autoRoundOff, setAutoRoundOff] = useState(false);
    const [amountReceivedStr, setAmountReceivedStr] = useState('');
    const [isFullyPaid, setIsFullyPaid] = useState(false);
    const amountReceivedBeforePaid = useRef(0); // To store the value before marking as fully paid

    // --- FINALIZED STATE LOGIC ---
    const [manualAdjustmentStr, setManualAdjustmentStr] = useState(''); // Temp state for typing in adjustment input
    const [committedAdjustment, setCommittedAdjustment] = useState(0); // The "saved" adjustment value after blur
    const [adjustmentType, setAdjustmentType] = useState<'add' | 'subtract'>('add');

    // --- FINALIZED CALCULATION LOGIC ---
    const [totalAmountStr, setTotalAmountStr] = useState(''); // State for the user-editable "Total Amount" input
    const [totalAmountManuallySet, setTotalAmountManuallySet] = useState(false); // Flag to track manual edits
    
    // --- CALCULATIONS ---
    const subtotal = items.reduce((acc, item) => acc + (item.qty || 0) * (item.price || 0), 0);
    const totalItemDiscount = items.reduce((acc, item) => {
        const itemTotal = (item.qty || 0) * (item.price || 0);
        return acc + (itemTotal * ((item.discount || 0) / 100));
    }, 0);
    const subtotalAfterItemDiscounts = subtotal - totalItemDiscount;
    const totalTax = items.reduce((acc, item) => {
        const itemTotal = (item.qty || 0) * (item.price || 0);
        const itemDiscount = itemTotal * ((item.discount || 0) / 100);
        const taxableAmountForItem = itemTotal - itemDiscount;
        return acc + (taxableAmountForItem * ((item.tax || 0) / 100));
    }, 0);
    const itemsGrandTotal = subtotalAfterItemDiscounts + totalTax;
    const totalAdditionalCharges = additionalCharges.reduce((acc, charge) => acc + (parseFloat(charge.amount) || 0), 0);
    const taxableAmount = subtotalAfterItemDiscounts;

    const overallDiscountAmount = parseFloat(discountFlatStr) || 0;
    const discountBase = discountOption === 'before-tax' ? subtotalAfterItemDiscounts : (subtotalAfterItemDiscounts + totalTax);

    useEffect(() => {
        if (lastDiscountInput !== 'flat') {
            const percent = parseFloat(discountPercentStr) || 0;
            const newFlat = (discountBase * percent) / 100;
            setDiscountFlatStr(newFlat > 0 ? newFlat.toFixed(2) : '');
        }
    }, [discountPercentStr, discountBase, lastDiscountInput]);

    useEffect(() => {
        if (lastDiscountInput !== 'percent') {
            const flat = parseFloat(discountFlatStr) || 0;
            if (discountBase > 0) {
                const newPercent = (flat / discountBase) * 100;
                setDiscountPercentStr(newPercent > 0 ? newPercent.toFixed(2) : '');
            } else {
                setDiscountPercentStr('');
            }
        }
    }, [discountFlatStr, discountBase, lastDiscountInput]);

    const baseTotal = discountOption === 'before-tax'
        ? (taxableAmount - overallDiscountAmount) + totalTax
        : (taxableAmount + totalTax) - overallDiscountAmount;

    // This effect syncs the base total to the input field, but only if the user hasn't typed in it.
    useEffect(() => {
        if (!totalAmountManuallySet) {
            setTotalAmountStr(baseTotal > 0 ? baseTotal.toFixed(2) : '');
        }
    }, [baseTotal, totalAmountManuallySet]);

    // This is the total that will be used for the final balance calculation.
    // It starts with the value in the input field (or the base total if empty), then applies the manual adjustment and rounding.
    const totalFromInput = parseFloat(totalAmountStr) || 0;
    const adjustmentValue = adjustmentType === 'add' ? committedAdjustment : -committedAdjustment;
    const totalBeforeRounding = totalFromInput + adjustmentValue + totalAdditionalCharges;
    const finalAmountForBalance = autoRoundOff ? Math.round(totalBeforeRounding) : totalBeforeRounding;
    
    const amountReceived = parseFloat(amountReceivedStr) || 0;
    const balanceAmount = finalAmountForBalance - amountReceived;

    // This effect handles keeping the "fully paid" amount synced if the total changes.
    useEffect(() => {
        if (isFullyPaid) {
            setAmountReceivedStr(finalAmountForBalance.toFixed(2));
        }
    }, [isFullyPaid, finalAmountForBalance]);

    const handleFullyPaidChange = (checked: boolean) => {
        setIsFullyPaid(checked);
        if (checked) {
            amountReceivedBeforePaid.current = parseFloat(amountReceivedStr) || 0;
        } else {
            setAmountReceivedStr(amountReceivedBeforePaid.current.toFixed(2));
        }
    };

    // --- HANDLERS ---
    const handleAddItem = () => {
        const newItem: InvoiceItem = { id: Date.now(), name: '', hsn: '', qty: 1, price: 0, discount: 0, tax: 0 };
        setItems([...items, newItem]);
    };

    const handleRemoveItem = (id: number) => {
        setItems(items.filter(item => item.id !== id));
    };

    const handleItemChange = (id: number, field: keyof InvoiceItem, value: string) => {
        const isNumericField = ['qty', 'price', 'discount', 'tax'].includes(field);
        setItems(items.map(item =>
            item.id === id ? { ...item, [field]: isNumericField ? parseFloat(value) || 0 : value } : item
        ));
    };
    
    const handleAddCharge = () => {
        setAdditionalCharges([...additionalCharges, { id: Date.now(), name: '', amount: '' }]);
    };

    const handleChargeChange = (id: number, field: 'name' | 'amount', value: string) => {
        setAdditionalCharges(additionalCharges.map(charge =>
            charge.id === id ? { ...charge, [field]: value } : charge
        ));
    };

    const handleRemoveCharge = (id: number) => {
        setAdditionalCharges(additionalCharges.filter(charge => charge.id !== id));
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
                            <h1 className="text-xl font-semibold text-gray-800">Create Purchase Invoice</h1>
                        </div>
                        <div className="flex items-center gap-2">
                            <Button variant="outline" className="bg-white border-gray-300 text-gray-700 hover:bg-gray-100 px-3 py-2">
                                <Settings className="h-4 w-4 mr-2" /> Settings
                            </Button>
                            <Button className="bg-indigo-600 text-white font-semibold hover:bg-indigo-700 px-4 py-2">
                                Save Purchase Invoice
                            </Button>
                        </div>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
                <div className="bg-white p-6 rounded-lg shadow-sm">
                    {/* Top Section: Billing and Invoice Details */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                        <div>
                           <label className="text-sm font-medium text-gray-700 mb-1 block">Bill From</label>
                            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 flex justify-center items-center h-full min-h-[150px]">
                                <Button variant="outline" className="text-blue-600 border-none hover:bg-blue-50" onClick={() => alert('Add Party Clicked')}>
                                    <Plus className="mr-2 h-4 w-4" /> Add Party
                                </Button>
                            </div>
                        </div>
                        <div className="flex flex-col items-end gap-4">
                             <div className="w-full sm:w-64">
                                 <label htmlFor="invoiceNo" className="text-sm font-medium text-gray-700 mb-1 block text-right">Purchase Invoice No:</label>
                                 <Input id="invoiceNo" type="number" value={invoiceNumber} onChange={e => setInvoiceNumber(parseInt(e.target.value))} className="text-right"/>
                             </div>
                             <div className="w-full sm:w-64">
                                <label htmlFor="invoiceDate" className="text-sm font-medium text-gray-700 mb-1 block text-right">Purchase Invoice Date:</label>
                                <div className="relative">
                                     <Input id="invoiceDate" type="date" value={invoiceDate} onChange={e => setInvoiceDate(e.target.value)} className="text-right" />
                                     <CalendarIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
                                </div>
                             </div>
                             <div className="w-full sm:w-64 border-2 border-dashed border-gray-300 rounded-lg flex justify-center py-3">
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
                                    <tr key={item.id} className="border-b">
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
                                <tr>
                                    <td colSpan={9} className="p-2">
                                        <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 flex justify-between items-center">
                                            <Button variant="outline" className="text-blue-600 border-none hover:bg-transparent" onClick={handleAddItem}>
                                                <Plus className="mr-2 h-4 w-4" /> Add Item
                                            </Button>
                                            <div className="flex items-center gap-4">
                                                <Button variant="outline" className="text-gray-700 border-none hover:bg-gray-50 px-3 py-1.5 rounded-lg">
                                                    <QrCode className="mr-2 h-4 w-4" /> Scan Barcode
                                                </Button>
                                                <Button onClick={handleAddItem} className="bg-gray-700 text-white rounded-full p-2 hover:bg-gray-800">
                                                    <Plus className="h-5 w-5"/>
                                                </Button>
                                            </div>
                                        </div>
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                    <div className="flex w-full min-w-[900px] bg-gray-100 border-b border-x">
                        <div className="flex-1 px-2 py-2 text-right text-xs font-medium text-black">SUBTOTAL</div>
                        <div className="w-28 px-2 py-2 text-right text-xs font-medium text-black">₹ {formatCurrency(totalItemDiscount)}</div>
                        <div className="w-28 px-2 py-2 text-right text-xs font-medium text-black">₹ {formatCurrency(totalTax)}</div>
                        <div className="w-32 px-2 py-2 text-right text-xs font-medium text-black">₹ {formatCurrency(itemsGrandTotal)}</div>
                        <div className="w-12"></div>
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

                        {/* Right side - FINAL CORRECTED LOGIC */}
                        <div className="space-y-4 mt-6 md:mt-0">
                            <div className="space-y-2">
                                {additionalCharges.map((charge) => (
                                    <div key={charge.id} className="flex items-center gap-2">
                                        <Input
                                            type="text"
                                            placeholder="Enter Charge Ex: transport charge"
                                            value={charge.name}
                                            onChange={(e) => handleChargeChange(charge.id, 'name', e.target.value)}
                                            className="flex-grow"
                                        />
                                        <div className="relative w-40">
                                            <span className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-500 text-sm">₹</span>
                                            <Input
                                                type="number"
                                                placeholder="0.00"
                                                value={charge.amount}
                                                onChange={(e) => handleChargeChange(charge.id, 'amount', e.target.value)}
                                                className="w-full pl-6 pr-2 text-right"
                                            />
                                        </div>
                                        <select className="h-9 rounded-md border border-gray-300 bg-white px-2 text-sm text-gray-700 focus:outline-none focus-visible:ring-1 focus-visible:ring-blue-500">
                                            <option>No Tax Applicable</option>
                                        </select>
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="icon"
                                            className="h-9 w-9 p-1 text-gray-500 hover:text-red-500 rounded-full flex-shrink-0"
                                            onClick={() => handleRemoveCharge(charge.id)}
                                        >
                                            <X className="h-4 w-4" />
                                        </Button>
                                    </div>
                                ))}
                                <Button variant="link" className="text-blue-600 p-0 hover:underline" onClick={handleAddCharge}>
                                    <Plus className="mr-1 h-4 w-4" /> Add Another Charge
                                </Button>
                            </div>
                            <div className="flex justify-between items-center text-sm">
                                <span className="text-gray-500">Taxable Amount</span>
                                <span className="font-medium text-gray-800">₹ {formatCurrency(taxableAmount)}</span>
                            </div>
                            <div className="flex justify-between items-center text-sm">
                                {!showDiscountInput ? (
                                    <>
                                        <Button variant="link" className="text-blue-600 p-0 hover:underline" onClick={() => setShowDiscountInput(true)}>
                                            <Plus className="mr-1 h-4 w-4" /> Add Discount
                                        </Button>
                                        <span className="font-medium text-gray-800">- ₹ {formatCurrency(overallDiscountAmount)}</span>
                                    </>
                                ) : (
                                    <div className="w-full flex items-center gap-2">
                                        <select 
                                            id="discount-option" 
                                            value={discountOption} 
                                            onChange={(e) => setDiscountOption(e.target.value as 'before-tax' | 'after-tax')}
                                            className="h-9 rounded-md border border-gray-300 bg-white px-2 text-sm text-gray-700 focus:outline-none focus-visible:ring-1 focus-visible:ring-blue-500"
                                        >
                                            <option value="before-tax">Discount Before Tax</option>
                                            <option value="after-tax">Discount After Tax</option>
                                        </select>
                                        <div className="flex items-center border border-gray-300 rounded-md h-9 flex-grow overflow-hidden bg-white">
                                            <div className="relative flex-1">
                                                <Input 
                                                    type="number" 
                                                    id="discount-amount-percent"
                                                    placeholder="0.00"
                                                    value={discountPercentStr}
                                                    onChange={(e) => { setDiscountPercentStr(e.target.value); setLastDiscountInput('percent'); }}
                                                    className="pr-7 text-right border-none focus-visible:ring-0 h-full w-full"
                                                />
                                                <span className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none">%</span>
                                            </div>
                                            <span className="px-1 text-gray-300 bg-gray-50 h-full flex items-center border-x">/</span>
                                            <div className="relative flex-1">
                                                <span className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none">₹</span>
                                                <Input 
                                                    type="number" 
                                                    id="discount-amount-rupees"
                                                    placeholder="0.00"
                                                    value={discountFlatStr}
                                                    onChange={(e) => { setDiscountFlatStr(e.target.value); setLastDiscountInput('flat'); }}
                                                    className="pl-6 text-right border-none focus-visible:ring-0 h-full w-full"
                                                />
                                            </div>
                                        </div>
                                        <Button
                                            variant="ghost" size="icon"
                                            className="h-9 w-9 p-1 text-gray-500 hover:text-red-500 rounded-full flex-shrink-0"
                                            onClick={() => { setShowDiscountInput(false); setDiscountPercentStr(''); setDiscountFlatStr(''); setLastDiscountInput(null); }}
                                        >
                                            <X className="h-4 w-4" />
                                        </Button>
                                    </div>
                                )}
                            </div>
                            <div className="flex justify-between items-center text-sm">
                                <label htmlFor="autoRoundOff" className="flex items-center gap-2 text-gray-600 cursor-pointer">
                                    <Checkbox id="autoRoundOff" checked={autoRoundOff} onChange={(e) => setAutoRoundOff(e.target.checked)} /> Auto Round Off
                                </label>
                                
                                {!autoRoundOff ? (
                                    <div className="flex items-center border rounded-md overflow-hidden bg-white">
                                        <select 
                                            className="h-9 border-r bg-gray-50 px-2 text-xs text-gray-700 focus:outline-none"
                                            value={adjustmentType}
                                            onChange={(e) => setAdjustmentType(e.target.value as 'add' | 'subtract')}
                                        >
                                            <option value="add">+ Add</option>
                                            <option value="subtract">- Reduce</option>
                                        </select>
                                        <div className="relative">
                                            <span className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-500 text-sm">₹</span>
                                            <Input 
                                                type="number"
                                                placeholder="0" 
                                                value={manualAdjustmentStr}
                                                onChange={(e) => setManualAdjustmentStr(e.target.value)}
                                                onBlur={(e) => setCommittedAdjustment(parseFloat(e.target.value) || 0)}
                                                className="w-20 h-9 border-none pl-6 pr-2 text-right focus-visible:ring-0"
                                            />
                                        </div>
                                    </div>
                                ) : (
                                    <span className="font-medium text-gray-800">₹ {formatCurrency(finalAmountForBalance - totalBeforeRounding)}</span>
                                )}
                            </div>
                            
                            <hr className="my-2"/>

                            <div className="flex justify-between items-center">
                                <span className="font-bold text-base text-gray-800">Total Amount</span>
                                <div className="relative w-48">
                                    <Input 
                                        type="number"
                                        placeholder="0.00"
                                        value={totalAmountStr}
                                        onChange={(e) => {
                                            const value = e.target.value;
                                            setTotalAmountStr(value);
                                            // If user types, it's a manual override. If they clear it, calculations take over again.
                                            setTotalAmountManuallySet(value !== ''); 
                                        }}
                                        className="bg-gray-100 text-gray-800 font-semibold text-right pr-4 py-2 rounded-lg"
                                    />
                                </div>
                            </div>
                            
                            <div className="flex justify-end items-center gap-2 mt-1">
                                <label htmlFor="fullyPaid" className="text-sm text-gray-500 cursor-pointer">Mark as fully paid</label>
                                <Checkbox id="fullyPaid" checked={isFullyPaid} onChange={(e) => handleFullyPaidChange(e.target.checked)}/>
                            </div>

                            <div className="flex justify-between items-center text-sm">
                                <span className="text-gray-500">Amount Paid</span>
                                <div className="flex items-center gap-1 w-48 bg-gray-100 rounded-md border border-gray-200 p-1">
                                    <span className="pl-2 text-gray-500 text-sm">₹</span>
                                    <Input 
                                        id="amountReceived" 
                                        type="number" 
                                        placeholder="0.00"
                                        value={amountReceivedStr} 
                                        onChange={(e) => {
                                            setAmountReceivedStr(e.target.value);
                                            if (isFullyPaid) {
                                                setIsFullyPaid(false);
                                            }
                                        }}
                                        className="flex-grow bg-transparent border-none text-right focus-visible:ring-0 h-7 p-0"
                                    />
                                    <select className="h-7 rounded-md border-none bg-white px-2 text-sm text-gray-700 focus:outline-none">
                                            <option>Cash</option>
                                            <option>Bank</option>
                                    </select>
                                </div>
                            </div>

                            <div className="flex justify-between items-center mt-2 font-semibold">
                                <span className="text-red-600">Remaining Amount</span>
                                <span className="text-green-600">₹ {formatCurrency(balanceAmount)}</span>
                            </div>
                        </div>
                    </div>

                    {/* Footer Signature */}
                    <div className="mt-24 flex justify-end">
                        <div className="w-64 text-center">
                            <div className="border-b border-gray-400 pb-2 mb-2">
                            </div>
                            <p className="text-sm text-gray-600">Authorized signatory for <span className="font-semibold">Business Name</span></p>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default CreateSalesInvoicePage;