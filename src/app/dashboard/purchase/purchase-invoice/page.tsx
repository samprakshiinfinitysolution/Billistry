'use client';
import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, Settings, CalendarIcon, Trash2, QrCode, X, ArrowLeft, Search, ArrowUp } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { AddItemModal, ItemData } from "../../../../components/AddItem";
import { AddParty, Party } from "../../../../components/AddParty";
import { ScanBarcodeModal } from "../../../../components/ScanBarcode";
import InvoiceSettingsModal from '../../../../components/InvoiceSettingsModal';
import FormSkeleton from '@/components/ui/FormSkeleton';

const formatCurrency = (amount: number) => {
    if (isNaN(amount) || amount === null) return '0.00';
    return new Intl.NumberFormat('en-IN', {
        style: 'decimal',
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    }).format(amount);
};
// Helper Button and Input from main component
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
    originalQty?: number;
    price: number;
    discountPercentStr: string; // The user-inputted discount percentage
    discountAmountStr: string; // The calculated discount amount
    lastDiscountInput: 'percent' | 'flat'; // Which discount input was last used
    taxPercentStr: string; // The selected tax percentage
    taxAmountStr: string; // The calculated tax amount
    // Optional numeric stock and unit provided when item comes from AddItem modal
    numericStock?: number | null;
    unit?: string | null;
    productId?: string | null;
}

const GST_OPTIONS = ['0', '0.1', '0.25', '3', '5', '6', '12', '18', '28'];
interface Charge {

    id: number;
    name: string;
    amount: string;
}

const CreatePurchaseInvoicePage = () => {
    const router = useRouter();
    const [invoiceNumber, setInvoiceNumber] = useState(1);
    const [invoiceNo, setInvoiceNo] = useState<string>(''); // server-assigned formatted string (PUR-00001)
    const nextItemId = useRef(0);
    const [invoiceDate, setInvoiceDate] = useState(new Date().toISOString().split('T')[0]);
    const [items, setItems] = useState<InvoiceItem[]>([]);
    const [terms, setTerms] = useState('1. Goods once sold will not be taken back or exchanged\n2. All disputes are subject to [ENTER_YOUR_CITY_NAME] jurisdiction only');
    const [notes, setNotes] = useState('');
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
    const [paymentMode, setPaymentMode] = useState<'unpaid' | 'cash' | 'upi' | 'card' | 'netbanking' | 'bank_transfer' | 'cheque' | 'online'>('unpaid');
    const amountReceivedBeforePaid = useRef(0); // To store the value before marking as fully paid
    const [showNotesInput, setShowNotesInput] = useState(false);

    // --- FINALIZED STATE LOGIC ---
    const [manualAdjustmentStr, setManualAdjustmentStr] = useState(''); // Temp state for typing in adjustment input
    const [committedAdjustment, setCommittedAdjustment] = useState(0); // The "saved" adjustment value after blur
    const [adjustmentType, setAdjustmentType] = useState<'add' | 'subtract'>('add');

    // --- FINALIZED CALCULATION LOGIC ---
    const [totalAmountStr, setTotalAmountStr] = useState(''); // State for the user-editable "Total Amount" input
    const [totalAmountManuallySet, setTotalAmountManuallySet] = useState(false); // Flag to track manual edits

    // --- Due Date States ---
    const [showDueDateForm, setShowDueDateForm] = useState(false);
    const [paymentTerms, setPaymentTerms] = useState('30');
    const [dueDate, setDueDate] = useState('');
    const [lastDueDateInput, setLastDueDateInput] = useState<'terms' | 'date'>('terms'); // 'terms' is the initial source

    // --- MODAL STATE ---
    const [isAddItemModalOpen, setIsAddItemModalOpen] = useState(false);
    const [isScanBarcodeModalOpen, setIsScanBarcodeModalOpen] = useState(false);

    const [selectedParty, setSelectedParty] = useState<Party | null>(null);
    const [isAddingParty, setIsAddingParty] = useState(false);
    const [partySearchTerm, setPartySearchTerm] = useState('');
    const [editId, setEditId] = useState<string | null>(null);
    const [isFetching, setIsFetching] = useState(false);
    const [saving, setSaving] = useState(false);
    const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
    const [invoiceSettings, setInvoiceSettings] = useState(() => {
        try {
            if (typeof window === 'undefined') return { showTax: true, showGST: false };
            const raw = window.localStorage.getItem('invoiceSettings');
            if (!raw) return { showTax: true, showGST: false };
            return JSON.parse(raw);
        } catch (e) {
            return { showTax: true, showGST: false };
        }
    });
    // Business settings (fetched from API)
    const [businessName, setBusinessName] = useState<string>('Business Name');
    const [signatureUrl, setSignatureUrl] = useState<string | null>(null);
    const [gstNumber, setGstNumber] = useState<string | null>(null);
    const [productsCache, setProductsCache] = useState<any[]>([]);

    
    // --- CALCULATIONS ---
    const subtotal = items.reduce((acc, item) => acc + (item.qty || 0) * (item.price || 0), 0);
    const totalItemDiscount = items.reduce((acc, item) => acc + (parseFloat(item.discountAmountStr) || 0), 0);
    const subtotalAfterItemDiscounts = subtotal - totalItemDiscount;
    const totalAdditionalCharges = additionalCharges.reduce((acc, charge) => acc + (parseFloat(charge.amount) || 0), 0);
    const taxableAmount = subtotalAfterItemDiscounts;

    // Compute GST breakdown grouped by tax percent across items

        // Compute GST breakdown grouped by tax percent across items (sales-like behavior)
        const overallDiscountAmount = parseFloat(discountFlatStr) || 0;
        const gstMap = items.reduce((acc: Record<string, { taxable: number; tax: number }>, item) => {
            const taxPercent = item.taxPercentStr ? String(item.taxPercentStr).trim() : '';
            const itemTotal = (item.qty || 0) * (item.price || 0);
            const itemDiscount = parseFloat(item.discountAmountStr) || 0;
            const taxableForItem = Math.max(0, itemTotal - itemDiscount);
            const taxAmount = parseFloat(item.taxAmountStr) || 0;

            if (!taxPercent || Number(taxPercent) === 0) return acc;
            if (!acc[taxPercent]) acc[taxPercent] = { taxable: 0, tax: 0 };
            acc[taxPercent].taxable += taxableForItem;
            acc[taxPercent].tax += taxAmount;
            return acc;
        }, {} as Record<string, { taxable: number; tax: number }>);

        const gstBreakdown = Object.keys(gstMap).map(k => ({ percent: Number(k), taxable: gstMap[k].taxable, tax: gstMap[k].tax })).sort((a, b) => a.percent - b.percent);
        const totalTax = gstBreakdown.reduce((s, g) => s + g.tax, 0);
        const itemsGrandTotal = subtotalAfterItemDiscounts + totalTax;
        const discountBase = discountOption === 'before-tax' ? subtotalAfterItemDiscounts : (subtotalAfterItemDiscounts + totalTax);

    useEffect(() => {
        // Only update flat amount when the last user input was percent.
        // Prevent running when lastDiscountInput is null or 'flat' to avoid mutual-effect loops.
        if (lastDiscountInput === 'percent') {
            const percent = parseFloat(discountPercentStr) || 0;
            const newFlat = (discountBase * percent) / 100;
            setDiscountFlatStr(newFlat > 0 ? newFlat.toFixed(2) : '');
        }
    }, [discountPercentStr, discountBase, lastDiscountInput]);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {};

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    useEffect(() => {
        let mounted = true;
        const fetchProducts = async () => {
            try {
                const res = await fetch('/api/product', { credentials: 'include' });
                if (!res.ok) return;
                const body = await res.json().catch(() => ({}));
                const products = Array.isArray(body.products) ? body.products : [];
                if (mounted) setProductsCache(products);
            } catch (e) {}
        };
        fetchProducts();
        const onUpd = () => fetchProducts();
        try { window.addEventListener('productsUpdated', onUpd as any); } catch (e) {}
        return () => { mounted = false; try { window.removeEventListener('productsUpdated', onUpd as any); } catch (e) {} };
    }, []);

    // Auto-calculate Due Date or Payment Terms based on which was last edited
    useEffect(() => {
        if (!invoiceDate) return;

        if (lastDueDateInput === 'terms') {
            const days = parseInt(paymentTerms, 10);
            if (!isNaN(days)) {
                const newDueDate = new Date(invoiceDate);
                newDueDate.setDate(newDueDate.getDate() + days);
                const newDueDateString = newDueDate.toISOString().split('T')[0];
                if (dueDate !== newDueDateString) {
                    setDueDate(newDueDateString);
                }
            } else {
                if (dueDate !== '') setDueDate('');
            }
        } else { // lastDueDateInput === 'date'
            if (dueDate) {
                const date1 = new Date(invoiceDate);
                const date2 = new Date(dueDate);
                if (!isNaN(date1.getTime()) && !isNaN(date2.getTime()) && date2 >= date1) {
                    const timeDiff = date2.getTime() - date1.getTime();
                    const dayDiff = Math.round(timeDiff / (1000 * 3600 * 24));
                    if (String(dayDiff) !== paymentTerms) setPaymentTerms(String(dayDiff));
                }
            }
        }
    }, [paymentTerms, dueDate, invoiceDate, lastDueDateInput]);


    useEffect(() => {
        // Only update percent when the last user input was flat.
        // This avoids the two-effects toggling each other when lastDiscountInput is null.
        if (lastDiscountInput === 'flat') {
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

    // This effect syncs the computed total (including manual adjustment and rounding) to the input field,
    // but only if the user hasn't manually overridden the Total Amount input.
    useEffect(() => {
        if (!totalAmountManuallySet) {
            const adjustment = adjustmentType === 'add' ? committedAdjustment : -committedAdjustment;
            const displayedBeforeRounding = baseTotal + totalAdditionalCharges + adjustment;
            const displayedTotal = autoRoundOff ? Math.round(displayedBeforeRounding) : displayedBeforeRounding;
            setTotalAmountStr(displayedTotal > 0 ? displayedTotal.toFixed(2) : '');
        }
    }, [baseTotal, totalAmountManuallySet, totalAdditionalCharges, committedAdjustment, adjustmentType, autoRoundOff]);

    // This is the total that will be used for the final balance calculation.
    // It starts with the value in the input field (or the base total if empty), then applies the manual adjustment and rounding.
    const totalFromInput = parseFloat(totalAmountStr) || 0;
    const adjustmentValue = adjustmentType === 'add' ? committedAdjustment : -committedAdjustment;
    let totalBeforeRounding: number;
    if (totalAmountManuallySet && totalFromInput > 0) {
        totalBeforeRounding = totalFromInput;
    } else {
        totalBeforeRounding = baseTotal + totalAdditionalCharges + adjustmentValue;
    }
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
    const handleAddItemFromModal = (itemToAdd: ItemData, quantity: number) => {
        const taxPercent = itemToAdd.taxPercent || 0;
        const price = itemToAdd.purchasePrice || 0;
        const itemTotal = quantity * price;
        // Assuming 0 discount when adding item initially
        const taxableAmountForItem = itemTotal; 
        const taxAmount = (taxableAmountForItem * taxPercent) / 100;

        const newItem: InvoiceItem = {
            id: nextItemId.current++,
            name: itemToAdd.name,
            productId: itemToAdd.id || null,
            hsn: itemToAdd.hsnCode || '', // Use hsnCode from modal
            qty: quantity,
            price: price,
            discountPercentStr: '',
            discountAmountStr: '',
            lastDiscountInput: 'percent', // Default to percent for new items
            taxPercentStr: String(taxPercent), // Use taxPercent from modal
            taxAmountStr: taxAmount > 0 ? taxAmount.toFixed(2) : '' // Calculate initial tax amount
        };
        setItems(prevItems => [...prevItems, newItem]);
        console.log(`Added ${quantity} of item:`, itemToAdd.name);
    };

    const handleRemoveItem = (id: number) => {
        setItems(items.filter(item => item.id !== id));
    };

    const handleItemChange = (id: number, field: 'name' | 'hsn' | 'qty' | 'price', value: string) => {
        setItems(prevItems => prevItems.map(item => {
            if (item.id !== id) return item;

            const isNumericField = ['qty', 'price'].includes(field);
            const updatedValue = isNumericField ? parseFloat(value) || 0 : value;
            const updatedItem = { ...item, [field]: updatedValue };

            // If qty or price changes, recalculate the dependent discount field
            if (field === 'qty' || field === 'price') {
                const itemTotal = (updatedItem.qty || 0) * (updatedItem.price || 0);
                // Recalculate discount
                if (updatedItem.lastDiscountInput === 'percent') {
                    const percent = parseFloat(updatedItem.discountPercentStr) || 0;
                    updatedItem.discountAmountStr = itemTotal > 0 ? ((itemTotal * percent) / 100).toFixed(2) : '';
                } else { // 'flat'
                    const amount = parseFloat(updatedItem.discountAmountStr) || 0;
                    updatedItem.discountPercentStr = itemTotal > 0 ? ((amount / itemTotal) * 100).toFixed(2) : '';
                }
                // Recalculate tax
                const taxableAmountForItem = itemTotal - (parseFloat(updatedItem.discountAmountStr) || 0);
                const taxPercent = parseFloat(updatedItem.taxPercentStr) || 0;
                updatedItem.taxAmountStr = taxPercent > 0 ? ((taxableAmountForItem * taxPercent) / 100).toFixed(2) : '';
            }
            return updatedItem;
        }));
    };

    const handleItemDiscountChange = (id: number, inputType: 'percent' | 'flat', value: string) => {
        setItems(prevItems => prevItems.map(item => {
            if (item.id !== id) return item;

            const updatedItem = { ...item, lastDiscountInput: inputType };
            const itemTotal = (item.qty || 0) * (item.price || 0);

            if (inputType === 'percent') {
                updatedItem.discountPercentStr = value;
                const percent = parseFloat(value) || 0;
                updatedItem.discountAmountStr = itemTotal > 0 ? ((itemTotal * percent) / 100).toFixed(2) : '';
            } else { // flat
                updatedItem.discountAmountStr = value;
                const amount = parseFloat(value) || 0;
                updatedItem.discountPercentStr = itemTotal > 0 ? ((amount / itemTotal) * 100).toFixed(2) : '';
            }

            // Recalculate tax based on new discount
            const taxableAmountForItem = itemTotal - (parseFloat(updatedItem.discountAmountStr) || 0);
            const taxPercent = parseFloat(updatedItem.taxPercentStr) || 0;
            updatedItem.taxAmountStr = taxPercent > 0 ? ((taxableAmountForItem * taxPercent) / 100).toFixed(2) : '';

            return updatedItem;
        }));
    };
    
    const handleItemTaxChange = (id: number, taxPercentValue: string) => {
        setItems(prevItems => prevItems.map(item => {
            if (item.id !== id) return item;

            const updatedItem = { ...item, taxPercentStr: taxPercentValue };
            
            const itemTotal = (item.qty || 0) * (item.price || 0);
            const itemDiscount = parseFloat(item.discountAmountStr) || 0;
            const taxableAmountForItem = itemTotal - itemDiscount;
            const taxPercent = parseFloat(taxPercentValue) || 0;
            
            updatedItem.taxAmountStr = taxPercent > 0 ? ((taxableAmountForItem * taxPercent) / 100).toFixed(2) : '';

            return updatedItem;
        }));
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
        const itemDiscount = parseFloat(item.discountAmountStr) || 0;
        const taxable = itemTotal - itemDiscount;
        const taxAmount = parseFloat(item.taxAmountStr) || 0;
        return taxable + taxAmount;
    };

    const handleSelectParty = (party: Party) => {
        setSelectedParty(party);
        setIsAddingParty(false);
        setPartySearchTerm('');
    };

    // Load existing NewPurchase in edit mode when ?editId= is present
    useEffect(() => {
        try {
            const params = new URLSearchParams(window.location.search);
            const id = params.get('editId');
            if (!id) return;
            setEditId(id);
            setIsFetching(true);
            fetch(`/api/new_purchase/${id}`, { credentials: 'include' })
                .then(async res => { if (!res.ok) throw new Error('Failed to fetch'); return res.json(); })
                .then(data => {
                    const doc = data?.data || data;
                    if (!doc) return;
                    if (doc.invoiceNumber) setInvoiceNumber(doc.invoiceNumber);
                    if (doc.invoiceNo) setInvoiceNo(doc.invoiceNo);
                    if (doc.invoiceDate) setInvoiceDate(new Date(doc.invoiceDate).toISOString().split('T')[0]);
                    if (doc.dueDate) {
                        try { setDueDate(new Date(doc.dueDate).toISOString().split('T')[0]); } catch (e) { /* ignore */ }
                        // Show the due date form in edit mode when a due date exists and prefer 'date' as the last input source
                        setShowDueDateForm(true);
                        setLastDueDateInput('date');
                    }
                    if (doc.items && Array.isArray(doc.items)) {
                        const mapped = doc.items.map((it: any, idx: number) => ({
                            id: idx,
                            name: it.name || it.itemName || '',
                            hsn: it.hsn || '',
                            qty: it.qty || it.quantity || 1,
                            originalQty: it.qty || it.quantity || 1,
                            price: it.price || it.rate || 0,
                            discountPercentStr: it.discountPercentStr || '',
                            discountAmountStr: it.discountAmountStr || '',
                            lastDiscountInput: it.lastDiscountInput || 'percent',
                            taxPercentStr: it.taxPercentStr || it.taxPercent || '',
                            taxAmountStr: it.taxAmountStr || '',
                            productId: (it.productId || it.product_id) || null,
                            numericStock: null,
                            unit: it.unit || null,
                        }));
                        // Fetch current products to enrich stock/unit info for loaded items
                        (async () => {
                            try {
                                const resP = await fetch('/api/product', { credentials: 'include' });
                                if (!resP.ok) throw new Error('Failed to fetch products');
                                const bodyP = await resP.json().catch(() => ({}));
                                const products = Array.isArray(bodyP.products) ? bodyP.products : [];
                                const mappedAny = mapped as InvoiceItem[];
                                const enriched: InvoiceItem[] = mappedAny.map((mi: InvoiceItem) => {
                                    const p = (products as any[]).find((pp: any) => (mi.productId && String(pp._id) === String(mi.productId)) || String(pp.name || '').trim() === String(mi.name || '').trim());
                                    if (!p) return mi;
                                    return {
                                        ...mi,
                                        productId: String(p._id),
                                        numericStock: (typeof p.currentStock !== 'undefined' && p.currentStock !== null) ? Number(p.currentStock) : ((typeof p.openingStock !== 'undefined' && p.openingStock !== null) ? Number(p.openingStock) : null),
                                        unit: p.unit || mi.unit || null,
                                        originalQty: mi.originalQty ?? (mi.qty || 0),
                                    };
                                });
                                setItems(enriched);
                                try { nextItemId.current = enriched.length; } catch (e) {}
                            } catch (err) {
                                console.warn('Failed to fetch products to enrich invoice items', err);
                                setItems(mapped);
                                try { nextItemId.current = mapped.length; } catch (e) {}
                            }
                        })();
                    }
                    // Populate additional charges if present on the saved doc
                    if (doc.additionalCharges && Array.isArray(doc.additionalCharges)) {
                        const mappedCharges = doc.additionalCharges.map((ch: any, idx: number) => ({
                            id: Date.now() + idx,
                            name: ch.name || ch.title || '',
                            amount: String(typeof ch.amount !== 'undefined' ? ch.amount : (ch.value || ''))
                        }));
                        setAdditionalCharges(mappedCharges);
                    }
                    if (doc.selectedParty) {
                        // normalize into Party shape conservatively and include address if present
                        const sp = typeof doc.selectedParty === 'string' ? { id: doc.selectedParty, name: '' } : doc.selectedParty;
                        const partyObj = {
                            id: sp.id || sp._id || '',
                            name: sp.partyName || sp.name || '',
                            balance: sp.balance || 0,
                            phone: sp.mobileNumber || sp.phone || sp.mobile || '',
                            address: sp.address || sp.billingAddress || sp.shippingAddress || ''
                        } as Party;
                        setSelectedParty(partyObj);
                    }
                    if (doc.discountPercentStr) setDiscountPercentStr(String(doc.discountPercentStr));
                    if (doc.discountFlatStr) setDiscountFlatStr(String(doc.discountFlatStr));
                    // If discount fields or option exist on saved doc, open the discount UI (same behavior as sales)
                    if ((doc.discountPercentStr && String(doc.discountPercentStr).trim() !== '') || (doc.discountFlatStr && String(doc.discountFlatStr).trim() !== '') || doc.discountOption) {
                        setShowDiscountInput(true);
                        if (doc.discountOption) setDiscountOption(doc.discountOption);
                    }
                    // If the saved doc has totalAmount, populate and mark as manually set so input shows value
                    if (typeof doc.totalAmount !== 'undefined') {
                        setTotalAmountStr(String(doc.totalAmount));
                        // do NOT mark as manually set so the UI will continue to auto-sync like sales
                    }
                    // Populate terms and notes from saved doc (open Notes UI if notes exist)
                    if (typeof doc.terms !== 'undefined' && doc.terms !== null) setTerms(String(doc.terms || ''));
                    if (doc.notes && String(doc.notes).trim() !== '') { setNotes(doc.notes); setShowNotesInput(true); }
                    // If a due date was saved, show the due date form
                    if (doc.dueDate) {
                        try { setDueDate(new Date(doc.dueDate).toISOString().split('T')[0]); } catch (e) { /* ignore */ }
                        setShowDueDateForm(true);
                    }
                    if (doc.amountReceived !== undefined) setAmountReceivedStr(String(doc.amountReceived));
                    // paymentStatus in saved doc maps to paymentMode; fall back to 'unpaid'
                    if (doc.paymentStatus) setPaymentMode(doc.paymentStatus as any);
                    if (doc.balanceAmount !== undefined) setIsFullyPaid(Number(doc.balanceAmount) === 0);
                    // Populate rounding and manual adjustment states if present
                    if (typeof doc.autoRoundOff !== 'undefined') setAutoRoundOff(Boolean(doc.autoRoundOff));
                    if (doc.adjustmentType) setAdjustmentType(doc.adjustmentType === 'subtract' ? 'subtract' : 'add');
                    if (typeof doc.manualAdjustment !== 'undefined') {
                        const m = Number(doc.manualAdjustment) || 0;
                        setCommittedAdjustment(m);
                        setManualAdjustmentStr(m ? String(m) : '');
                    }
                    setIsFetching(false);
                })
                .catch(err => { console.error('Failed to load purchase for edit', err); setIsFetching(false); });
        } catch (e) { /* ignore */ }
    }, []);

    // Fetch preview invoiceNo for new invoices (do not reserve)
    useEffect(() => {
        try {
            const params = new URLSearchParams(window.location.search);
            const id = params.get('editId');
            if (id) return; // don't fetch preview when editing
            if (invoiceNo) return; // don't override if already present
            fetch('/api/new_purchase/preview', { credentials: 'include' })
                .then(async res => { if (!res.ok) return null; return res.json(); })
                .then(data => {
                    const preview = data?.data || data;
                    if (preview && preview.invoiceNo) {
                        setInvoiceNo(preview.invoiceNo);
                        setInvoiceNumber(preview.invoiceNumber || invoiceNumber);
                    }
                })
                .catch(() => {});
        } catch (e) {}
    }, []);

    // Fetch business settings (name and signatureUrl)
    useEffect(() => {
        let cancelled = false;
        const fetchSettings = async () => {
            try {
                const res = await fetch('/api/business/settings', { credentials: 'include' });
                if (!res.ok) return;
                const body = await res.json().catch(() => ({}));
                if (cancelled) return;
                if (body?.data) {
                    if (body.data.name) setBusinessName(body.data.name);
                    if (body.data.signatureUrl) setSignatureUrl(body.data.signatureUrl);
                    if (body.data.gstNumber) setGstNumber(body.data.gstNumber);
                } else {
                    if (body?.name) setBusinessName(body.name);
                    if (body?.signatureUrl) setSignatureUrl(body.signatureUrl);
                    if (body?.gstNumber) setGstNumber(body.gstNumber);
                }
            } catch (err) {
                console.debug('Failed to fetch business settings', err);
            }
        };
        fetchSettings();
        return () => { cancelled = true; };
    }, []);

    // Save handler (create or update)
    const handleSave = async () => {
        try {
            setSaving(true);
            let selectedPartyToSend: any = undefined;
            if (selectedParty) {
                if ((selectedParty as any).id) selectedPartyToSend = (selectedParty as any).id;
                else if ((selectedParty as any)._id) selectedPartyToSend = (selectedParty as any)._id;
                else selectedPartyToSend = selectedParty as any;
            }

            // Determine whether invoice is paid and map to paymentStatus (same logic as sales)
            const numericAmountReceived = parseFloat(amountReceivedStr) || 0;
            const isPaid = isFullyPaid || numericAmountReceived >= finalAmountForBalance;
            const paymentStatusToSend = isPaid ? paymentMode : 'unpaid';

            const payload: any = {
                invoiceDate,
                dueDate,
                paymentTerms,
                selectedParty: selectedPartyToSend,
                items,
                additionalCharges,
                discountOption,
                discountPercentStr,
                discountFlatStr,
                terms,
                notes,
                autoRoundOff,
                adjustmentType,
                                manualAdjustment: autoRoundOff ? 0 : committedAdjustment,
                totalAmount: finalAmountForBalance,
                amountReceived: amountReceived,
                balanceAmount,
                paymentStatus: paymentStatusToSend,
                savedAt: new Date().toISOString(),
            };

            let res: Response;
            if (editId) {
                res = await fetch(`/api/new_purchase/${editId}`, { method: 'PUT', credentials: 'include', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
            } else {
                // creating - do not send invoiceNumber (server assigns it)
                try { delete (payload as any).invoiceNumber; } catch (e) {}
                res = await fetch('/api/new_purchase', { method: 'POST', credentials: 'include', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
            }

            if (!res.ok) {
                const errBody = await res.json().catch(() => ({}));
                console.debug('Save failed:', errBody?.error || errBody?.message || 'Failed to save');
            } else {
                const body = await res.json().catch(() => ({}));
                console.debug('Saved to server', body?.message || 'Saved');
                // If created, set editId and invoiceNo from server response
                if (!editId && body?.data?._id) setEditId(body.data._id);
                if (body?.data?.invoiceNo) setInvoiceNo(body.data.invoiceNo);
                // notify other UI that products' currentStock may have changed
                try { window.dispatchEvent(new Event('productsUpdated')); } catch (e) {}
                // redirect to viewer page for this purchase invoice
                try {
                    const returnedId = body?.data?._id || body?._id || editId;
                    if (returnedId) {
                        router.push(`/dashboard/purchase/purchase-invoice/${returnedId}`);
                        return;
                    }
                } catch (e) {}
            }
        } catch (e) {
            console.error('Save failed', e);
            console.debug('Save failed', e);
        } finally { setSaving(false); }
    };

    if (isFetching) {
        return <div className="bg-gray-50 min-h-screen"><FormSkeleton /></div>;
    }

    return (
        <div className="bg-gray-50 min-h-screen">
            <AddItemModal 
                isOpen={isAddItemModalOpen}
                onClose={() => setIsAddItemModalOpen(false)}
                onAddItem={handleAddItemFromModal}
            />
            <ScanBarcodeModal
                isOpen={isScanBarcodeModalOpen}
                onClose={() => setIsScanBarcodeModalOpen(false)}
                onAddItem={handleAddItemFromModal}
            />
            {/* Header */}
            <header className="bg-white shadow-sm sticky top-0 z-10">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
                    <div className="flex justify-between items-center">
                        <div className="flex items-center gap-4">
                            <Button variant="ghost" size="icon" className="text-gray-600 hover:bg-gray-100 rounded-md p-2" onClick={() => router.push('/dashboard/purchase/purchase-data')}>
                                <ArrowLeft className="h-5 w-5" />
                            </Button>
                            <h1 className="text-xl font-semibold text-gray-800">{editId ? 'Update Purchase Invoice' : 'Create Purchase Invoice'}</h1>
                        </div>
                        <div className="flex items-center gap-2">
                            <Button variant="outline" className="bg-white border-gray-300 text-gray-700 hover:bg-gray-100 px-3 py-2" onClick={() => setIsSettingsModalOpen(true)}>
                                <Settings className="h-4 w-4 mr-2" /> Settings
                            </Button>
                            <InvoiceSettingsModal
                                isOpen={isSettingsModalOpen}
                                onClose={() => setIsSettingsModalOpen(false)}
                                settings={invoiceSettings}
                                onSave={(newSettings) => {
                                    setInvoiceSettings(newSettings);
                                    try { window.localStorage.setItem('invoiceSettings', JSON.stringify(newSettings)); } catch (e) {}
                                }}
                            />

                            <Button
                                className="bg-indigo-600 text-white font-semibold hover:bg-indigo-700 px-4 py-2"
                                onClick={handleSave}
                            >
                                {saving ? 'Saving…' : (editId ? 'Save Changes' : 'Save Purchase Invoice')}
                            </Button>

                            
                        </div>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            {/* <main className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8"> */}
            <main className="w-full max-w-full m-0 p-0">

                <div className="bg-white p-6 rounded-lg shadow-sm">
                    {/* Top Section: Billing and Invoice Details */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                        <AddParty
                            selectedParty={selectedParty}
                            onSelectParty={setSelectedParty}
                            onClearParty={() => setSelectedParty(null)}
                            partyType="Supplier"
                        />
                        <div className="flex flex-col items-end gap-4">
                             <div className="flex flex-col sm:flex-row gap-4">
                                 <div className="w-full sm:w-64">
                                     <label htmlFor="invoiceNo" className="text-sm font-medium text-gray-700 mb-1 block text-right">Purchase Invoice No:</label>
                                     {/* Show server-formatted invoiceNo (PUR-00001) when available; otherwise show numeric preview or placeholder */}
                                     <Input id="invoiceNo" type="text" value={invoiceNo || (editId ? (invoiceNumber ? String(invoiceNumber) : '') : 'Will be assigned on save')} readOnly className="text-right bg-gray-100 cursor-not-allowed" />
                                 </div>
                                 <div className="w-full sm:w-64">
                                    <label htmlFor="invoiceDate" className="text-sm font-medium text-gray-700 mb-1 block text-right">Purchase Invoice Date:</label>
                                    <div className="relative">
                                         <Input id="invoiceDate" type="date" value={invoiceDate} onChange={e => setInvoiceDate(e.target.value)} className="text-right" />
                                         {/* <CalendarIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" /> */}
                                    </div>
                                 </div>
                             </div>
                             <div className="w-full sm:w-[calc(32rem+1rem)]">
                                {showDueDateForm ? (
                                    <div className="border bg-gray-50 rounded-lg p-4 relative">
                                        <Button variant="ghost" size="icon" className="absolute top-2 right-2 text-gray-400 hover:text-gray-600" onClick={() => setShowDueDateForm(false)}>
                                            <X className="h-4 w-4" />
                                        </Button>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <label htmlFor="paymentTerms" className="text-sm font-medium text-gray-700 mb-1 block">Payment Terms</label>
                                                <div className="flex items-center">
                                                    <Input id="paymentTerms" type="text" value={paymentTerms} onChange={e => {
                                                        setPaymentTerms(e.target.value);
                                                        setLastDueDateInput('terms');
                                                    }} className="w-24 text-right" />
                                                    <span className="ml-2 text-sm text-gray-600">Days</span>
                                                </div>
                                            </div>
                                            <div>
                                                <label htmlFor="dueDate" className="text-sm font-medium text-gray-700 mb-1 block">Due Date</label>
                                                <Input id="dueDate" type="date" value={dueDate} onChange={e => {
                                                    setDueDate(e.target.value);
                                                    setLastDueDateInput('date');
                                                }} min={invoiceDate} />
                                            </div>
                                        </div>
                                    </div>
                                ) : (
                                    <div 
                                        className="border-2 border-dashed border-gray-300 rounded-lg flex justify-center py-3 cursor-pointer hover:bg-gray-50 transition-colors"
                                        onClick={() => setShowDueDateForm(true)}
                                    >
                                        <Button variant="outline" className="text-blue-600 border-none pointer-events-none">
                                            <Plus className="mr-2 h-4 w-4" /> Add Due Date
                                        </Button>
                                    </div>
                                )}
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
                                    {invoiceSettings.showTax && <th className="px-2 py-2 text-left text-xs font-medium text-black w-28">TAX</th>}
                                    <th className="px-2 py-2 text-right text-xs font-medium text-black w-32">AMOUNT (₹)</th>
                                    <th className="w-12"></th>
                                </tr>
                            </thead>
                            <tbody>
                                {items.map((item, index) => (
                                    <tr key={item.id} className="border-b">
                                        <td className="px-2 py-2 text-sm text-gray-500">{index + 1}</td>
                                        <td className="px-2 py-2"><Input type="text" placeholder="Item Name" value={item.name} onChange={e => handleItemChange(item.id, 'name', e.target.value)} /></td>
                                        <td className="px-2 py-2"><Input type="text" placeholder="HSN" value={item.hsn} onChange={e => handleItemChange(item.id, 'hsn', e.target.value)} /></td>
                                                                                <td className="px-2 py-2">
                                                                                    <div className="flex flex-col">
                                                                                        <Input type="number" placeholder="1" value={item.qty} onChange={e => handleItemChange(item.id, 'qty', e.target.value)} />
                                                                                        {(() => {
                                                                                            // prefer live currentStock from productsCache when available
                                                                                            const p = (item.productId && productsCache.length) ? productsCache.find(pp => String(pp._id) === String(item.productId)) : null;
                                                                                            const liveStock = p ? (typeof p.currentStock !== 'undefined' && p.currentStock !== null ? Number(p.currentStock) : (typeof p.openingStock !== 'undefined' && p.openingStock !== null ? Number(p.openingStock) : null)) : item.numericStock;
                                                                                            if (typeof liveStock !== 'number') return null;
                                                                                            // Compute live available while editing: if the item was part of
                                                                                            // the original invoice, we subtract only the delta (newQty - originalQty)
                                                                                            // from liveStock so the display updates as user changes qty but still
                                                                                            // reflects the DB's current stock.
                                                                                            const orig = typeof item.originalQty === 'number' ? item.originalQty : 0;
                                                                                            const delta = (item.qty || 0) - orig;
                                                                                            const raw = (liveStock || 0) - delta; // how many would remain after applying the edited qty
                                                                                            const cls = raw <= 0 ? 'text-red-600' : 'text-gray-500';
                                                                                            const unitLabel = item.unit || (p && p.unit) || 'pcs';
                                                                                            if (raw <= 0) return <span className={`text-xs ${cls}`}>{`Out of stock ${unitLabel}`}</span>;
                                                                                            return <span className={`text-xs ${cls}`}>{`Available: ${raw} ${unitLabel}`}</span>;
                                                                                        })()}
                                                                                    </div>
                                                                                </td>
                                        <td className="px-2 py-2"><Input type="number" placeholder="0.00" value={item.price} onChange={e => handleItemChange(item.id, 'price', e.target.value)} /></td>
                                        <td className="px-2 py-2 w-32">
                                            <div className="flex flex-col gap-1">
                                                <div className="relative">
                                                    <span className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-400 text-xs">%</span>
                                                    <Input 
                                                        type="number" 
                                                        placeholder="0"
                                                        value={item.discountPercentStr}
                                                        onChange={e => handleItemDiscountChange(item.id, 'percent', e.target.value)}
                                                        className="pl-6 text-right"
                                                    />
                                                </div>
                                                <div className="relative">
                                                    <span className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-400 text-xs">₹</span>
                                                    <Input 
                                                        type="number" 
                                                        placeholder="0.00"
                                                        value={item.discountAmountStr}
                                                        onChange={e => handleItemDiscountChange(item.id, 'flat', e.target.value)}
                                                        className="pl-6 text-right"
                                                    />
                                                </div>
                                            </div>
                                        </td>
                                        {invoiceSettings.showTax ? (
                                            <td className="px-2 py-2 w-32">
                                            <div className="flex flex-col gap-1">
                                                <Select
                                                    value={item.taxPercentStr}
                                                    onValueChange={(value) => handleItemTaxChange(item.id, value)}
                                                >
                                                    <SelectTrigger className="h-9 w-full">
                                                        {/* This will display the short version e.g., "5%" */}
                                                        <span>{item.taxPercentStr}%</span>
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        {/* This will show the full text in the dropdown list */}
                                                        {GST_OPTIONS.map(rate => (<SelectItem key={rate} value={rate}>GST @ {rate}%</SelectItem>))}
                                                    </SelectContent>
                                                </Select>
                                                <div className="relative">
                                                    <span className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-400 text-xs">₹</span>
                                                    <Input 
                                                        type="number" 
                                                        value={item.taxAmountStr}
                                                        readOnly
                                                        className="pl-6 text-right bg-gray-100 cursor-not-allowed"
                                                    />
                                                </div>
                                            </div>
                                            </td>
                                        ) : null}
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
                                            <Button variant="outline" className="text-blue-600 border-none hover:bg-transparent" onClick={() => setIsAddItemModalOpen(true)}>
                                                <Plus className="mr-2 h-4 w-4" /> Add Item
                                            </Button>
                                            <div className="flex items-center gap-4">
                                                <Button variant="outline" className="text-gray-700 border-none hover:bg-gray-50 px-3 py-1.5 rounded-lg" onClick={() => setIsScanBarcodeModalOpen(true)}>
                                                    <QrCode className="mr-2 h-4 w-4" /> Scan Barcode
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
                        {invoiceSettings.showTax && <div className="w-28 px-2 py-2 text-right text-xs font-medium text-black">₹ {formatCurrency(totalTax)}</div>}
                        <div className="w-32 px-2 py-2 text-right text-xs font-medium text-black">₹ {formatCurrency(itemsGrandTotal)}</div>
                        <div className="w-12"></div>
                    </div>


                    <hr className="my-6" />

                    {/* Bottom Section: Notes, Terms and Calculations */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-16">
                         {/* Left side */}
                         <div className="space-y-4">
                            {showNotesInput ? (
                                <div className="relative">
                                    <label className="text-sm font-medium text-gray-500 mb-1 block">Notes</label>
                                    <Textarea
                                        placeholder="Enter your notes"
                                        value={notes}
                                        onChange={(e) => setNotes(e.target.value)}
                                        rows={3}
                                        className="bg-gray-100 p-3 rounded-md border-none focus-visible:ring-0 p-0"
                                    />
                                    <Button variant="ghost" size="icon" className="absolute top-2 right-2 text-gray-400 hover:text-gray-600" onClick={() => setShowNotesInput(false)}>
                                        <X className="h-4 w-4" />
                                    </Button>
                                </div>
                            ) : (
                            <Button variant="link" className="text-blue-600 p-0 hover:underline" onClick={() => setShowNotesInput(true)}><Plus className="mr-1 h-4 w-4" /> Add Notes</Button>)}
                           {/* <Button variant="link" className="text-blue-600 p-0 hover:underline"><Plus className="mr-1 h-4 w-4" /> Add Notes</Button> */}
                           <div className="relative">
                               <label className="text-sm font-medium text-gray-500 mb-1 block">Terms and Conditions</label>
                               <div className="bg-gray-100 p-3 rounded-md">
                                  <Textarea value={terms} onChange={(e) => setTerms(e.target.value)} rows={3} className="bg-transparent border-none focus-visible:ring-0 p-0"/>
                               </div>
                               <Button variant="ghost" size="icon" className="absolute top-7 right-2 text-gray-400 hover:text-gray-600" onClick={() => setTerms('')}>
                                    <X className="h-4 w-4" />
                               </Button>
                           </div>
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
                            {/* GST Breakdown */}
                            {gstBreakdown.length > 0 && invoiceSettings.showTax && (
                                <div className="mt-2 space-y-1 text-sm">
                                    {gstBreakdown.map(g => {
                                        const halfTax = g.tax / 2;
                                        const sgstLabel = `SGST@${(g.percent / 2) % 1 === 0 ? String(g.percent / 2) : (g.percent / 2).toFixed(2)}`;
                                        const cgstLabel = `CGST@${(g.percent / 2) % 1 === 0 ? String(g.percent / 2) : (g.percent / 2).toFixed(2)}`;
                                        return (
                                            <React.Fragment key={g.percent}>
                                                <div className="flex justify-between items-center text-sm">
                                                    <span className="text-gray-500">{sgstLabel}</span>
                                                    <span className="font-medium text-gray-800">₹ {formatCurrency(halfTax)}</span>
                                                </div>
                                                <div className="flex justify-between items-center text-sm">
                                                    <span className="text-gray-500">{cgstLabel}</span>
                                                    <span className="font-medium text-gray-800">₹ {formatCurrency(halfTax)}</span>
                                                </div>
                                            </React.Fragment>
                                        );
                                    })}
                                </div>
                            )}
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
                                    <Checkbox id="autoRoundOff" checked={autoRoundOff} onChange={(e) => {
                                        const checked = e.target.checked;
                                        setAutoRoundOff(checked);
                                        if (checked) {
                                            setCommittedAdjustment(0);
                                            setManualAdjustmentStr('');
                                            setAdjustmentType('add');
                                        }
                                    }} /> Auto Round Off
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
                                                onChange={(e) => {
                                                    const v = e.target.value;
                                                    setManualAdjustmentStr(v);
                                                    if (!autoRoundOff) {
                                                        setCommittedAdjustment(parseFloat(v) || 0);
                                                    } else {
                                                        setCommittedAdjustment(0);
                                                    }
                                                }}
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
                                <span className="text-gray-500">Amount Received</span>
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
                    <select value={paymentMode} onChange={(e) => setPaymentMode(e.target.value as any)} className="h-7 rounded-md border-none bg-white px-2 text-sm text-gray-700 focus:outline-none">
                        <option value="cash">Cash</option>
                        <option value="upi">UPI</option>
                        <option value="card">Card</option>
                        <option value="netbanking">Netbanking</option>
                        <option value="bank_transfer">Bank Transfer</option>
                        <option value="cheque">Cheque</option>
                        <option value="online">Online</option>
                    </select>
                                </div>
                            </div>

                            <div className="flex justify-between items-center mt-2 font-semibold">
                                <span className="text-green-600">Balance Amount</span>
                                <span className="text-green-600">₹ {formatCurrency(balanceAmount)}</span>
                            </div>
                        </div>
                    </div>

                    {/* Footer Signature */}
                    <div className="mt-24 flex justify-end">
                        <div className="w-64 text-right">
                            <div className="border-b border-gray-400 pb-2 mb-2">
                            </div>
                            <p className="text-sm text-gray-600">Authorized signatory for <span className="font-semibold">{businessName}</span></p>
                            {gstNumber && invoiceSettings.showGST && <p className="text-sm text-gray-500 mt-1">GST: <span className="font-medium">{gstNumber}</span></p>}
                            <div className="ml-auto mt-4 h-25 w-45 border bg-white flex items-center justify-center overflow-hidden">
                                {signatureUrl ? (
                                    // eslint-disable-next-line @next/next/no-img-element
                                    <img src={signatureUrl} alt="Signature" className="max-h-20 object-contain" />
                                ) : (
                                    <div className="text-xs text-gray-400">Signature will be shown here</div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    )
    ;
};

export default CreatePurchaseInvoicePage;