'use client';
import { useRouter } from 'next/navigation';
import React, { useState, useEffect, useRef } from 'react';
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
import { ScanBarcodeModal } from '../../../../components/ScanBarcode';

const formatCurrency = (amount: number) => {
    if (isNaN(amount) || amount === null) return '0.00';
    return new Intl.NumberFormat('en-IN', {
        style: 'decimal',
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    }).format(amount);
};
// Normalize various party shapes (API, local draft, AddParty) into the UI Party shape
const normalizePartyForUI = (p: any): Party | null => {
    if (!p) return null;
    // If already in expected shape (from AddParty), return as-is (but ensure fields exist)
    const id = p.id || p._id || (typeof p === 'string' ? p : undefined);
    const name = p.name || p.partyName || '';
    const balance = typeof p.balance !== 'undefined' ? p.balance : (p.openingBalance || 0);
    const phone = p.phone || p.mobileNumber || p.mobile || '';
    const address = p.address || p.billingAddress || p.address || p.shippingAddress || '';
    return { id: String(id || ''), name, balance, phone, address } as Party;
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
    numericStock?: number | null;
    unit?: string | null;
    productId?: string | null;
    discountPercentStr: string; // The user-inputted discount percentage
    discountAmountStr: string; // The calculated discount amount
    lastDiscountInput: 'percent' | 'flat'; // Which discount input was last used
    taxPercentStr: string; // The selected tax percentage
    taxAmountStr: string; // The calculated tax amount
}

const GST_OPTIONS = ['0', '0.1', '0.25', '3', '5', '6', '12', '18', '28'];
interface Charge {

    id: number;
    name: string;
    amount: string;
}

const CreateSalesInvoicePage = () => {
    const router = useRouter();
    const [invoiceNumber, setInvoiceNumber] = useState(1);
    // Server-assigned formatted invoice string, e.g. INV-00016
    const [invoiceNo, setInvoiceNo] = useState<string>('');
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
    const [editId, setEditId] = useState<string | null>(null);
    const [saving, setSaving] = useState(false);
    const [savedMessage, setSavedMessage] = useState('');
    const [isAddingParty, setIsAddingParty] = useState(false);
    const [partySearchTerm, setPartySearchTerm] = useState('');
    // Business settings (fetched from API)
    const [businessName, setBusinessName] = useState<string>('Business Name');
    const [signatureUrl, setSignatureUrl] = useState<string | null>(null);
    const [productsCache, setProductsCache] = useState<any[]>([]);
    const [paymentMode, setPaymentMode] = useState<'unpaid' | 'cash' | 'upi' | 'card' | 'netbanking' | 'bank_transfer' | 'cheque' | 'online'>('unpaid');
    // drafts UI removed
    
    // --- CALCULATIONS ---
    const subtotal = items.reduce((acc, item) => acc + (item.qty || 0) * (item.price || 0), 0);
    const totalItemDiscount = items.reduce((acc, item) => acc + (parseFloat(item.discountAmountStr) || 0), 0);
    const subtotalAfterItemDiscounts = subtotal - totalItemDiscount;
    const totalTax = items.reduce((acc, item) => acc + (parseFloat(item.taxAmountStr) || 0), 0);
    const itemsGrandTotal = subtotalAfterItemDiscounts + totalTax;
    const totalAdditionalCharges = additionalCharges.reduce((acc, charge) => acc + (parseFloat(charge.amount) || 0), 0);
    const taxableAmount = subtotalAfterItemDiscounts;

    // Compute GST breakdown grouped by tax percent across items
    // We'll compute for each taxPercent: { taxable: number, tax: number }
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

    // Convert gstMap to sorted array by numeric tax percent ascending
    const gstBreakdown = Object.keys(gstMap).map(k => ({ percent: Number(k), taxable: gstMap[k].taxable, tax: gstMap[k].tax })).sort((a, b) => a.percent - b.percent);

    const overallDiscountAmount = parseFloat(discountFlatStr) || 0;
    const discountBase = discountOption === 'before-tax' ? subtotalAfterItemDiscounts : (subtotalAfterItemDiscounts + totalTax);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {};

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    // Fetch product list into cache so invoice editor always shows live currentStock
    useEffect(() => {
        let mounted = true;
        const fetchProducts = async () => {
            try {
                const res = await fetch('/api/product', { credentials: 'include' });
                if (!res.ok) return;
                const body = await res.json().catch(() => ({}));
                const products = Array.isArray(body.products) ? body.products : [];
                if (mounted) setProductsCache(products);
            } catch (e) {
                // ignore
            }
        };
        fetchProducts();
        const onUpd = () => fetchProducts();
        try { window.addEventListener('productsUpdated', onUpd as any); } catch (e) {}
        return () => { mounted = false; try { window.removeEventListener('productsUpdated', onUpd as any); } catch (e) {} };
    }, []);

    useEffect(() => {
        // Only update flat amount when the last user input was percent.
        // Prevent running when lastDiscountInput is null or 'flat' to avoid mutual-effect loops.
        if (lastDiscountInput === 'percent') {
            const percent = parseFloat(discountPercentStr) || 0;
            const newFlat = (discountBase * percent) / 100;
            setDiscountFlatStr(newFlat > 0 ? newFlat.toFixed(2) : '');
        }
    }, [discountPercentStr, discountBase, lastDiscountInput]);

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
            // include additional charges and manual adjustment in the displayed Total Amount
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
    const handleAddItemFromModal = (itemToAdd: ItemData, quantity: number) => {
        const taxPercent = itemToAdd.taxPercent || 0;
        const price = itemToAdd.salesPrice || 0;
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
            numericStock: (itemToAdd as any).numericStock ?? null,
            unit: itemToAdd.unit || null,
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
        setSelectedParty(normalizePartyForUI(party) as any);
        setIsAddingParty(false);
        setPartySearchTerm('');
    };

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
                } else {
                    if (body?.name) setBusinessName(body.name);
                    if (body?.signatureUrl) setSignatureUrl(body.signatureUrl);
                }
            } catch (err) {
                console.debug('Failed to fetch business settings', err);
            }
        };
        fetchSettings();
        return () => { cancelled = true; };
    }, []);

    // --- Edit mode: fetch existing NewSale when editId present in URL ---
    useEffect(() => {
        try {
            const params = new URLSearchParams(window.location.search);
            const editId = params.get('editId');
            if (!editId) return;
            setEditId(editId);

            // fetch the existing NewSale
            fetch(`/api/new_sale/${editId}`, { credentials: 'include' })
                .then(async (res) => {
                    if (!res.ok) throw new Error('Failed to fetch sale');
                    return res.json();
                })
                .then((data) => {
                    // API returns { success: true, data: doc } — normalize
                    const doc = data?.data || data;
                    // populate core fields if available
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
                        // map items into InvoiceItem shape conservatively
                        const mapped = doc.items.map((it: any, idx: number) => ({
                            id: idx,
                            name: it.name || it.itemName || '',
                            hsn: it.hsn || '',
                            qty: it.qty || it.quantity || 1,
                            originalQty: it.qty || it.quantity || 1, // persist original qty so UI can compute deltas while editing
                            price: it.price || it.rate || 0,
                            discountPercentStr: it.discountPercentStr || '',
                            discountAmountStr: it.discountAmountStr || '',
                            lastDiscountInput: it.lastDiscountInput || 'percent',
                            taxPercentStr: it.taxPercentStr || it.taxPercent || '',
                            taxAmountStr: it.taxAmountStr || '',
                            // productId and numericStock will be filled below when we fetch current products
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
                                // fallback to original mapping if product fetch fails
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
                    if (typeof doc.discountPercentStr !== 'undefined') setDiscountPercentStr(String(doc.discountPercentStr || ''));
                    if (typeof doc.discountFlatStr !== 'undefined') setDiscountFlatStr(String(doc.discountFlatStr || ''));
                    // If discount fields exist on the loaded doc, show the discount editor
                    if ((doc.discountPercentStr && String(doc.discountPercentStr).trim() !== '') || (doc.discountFlatStr && String(doc.discountFlatStr).trim() !== '') || doc.discountOption) {
                        setShowDiscountInput(true);
                    }
                    if (typeof doc.totalAmount !== 'undefined') setTotalAmountStr(String(doc.totalAmount));
                    // Populate terms and notes if present on saved doc
                    if (typeof doc.terms !== 'undefined' && doc.terms !== null) setTerms(String(doc.terms || ''));
                    if (doc.notes && String(doc.notes).trim() !== '') { setNotes(doc.notes); setShowNotesInput(true); }
                    if (doc.selectedParty) {
                        // normalize various shapes into the UI Party shape (phone/address)
                        const uiParty = normalizePartyForUI(doc.selectedParty);
                        if (uiParty) setSelectedParty(uiParty as any);
                    }
                    if (doc.amountReceived !== undefined) setAmountReceivedStr(String(doc.amountReceived));
                    if (doc.paymentStatus) setPaymentMode(doc.paymentStatus as any);
                    if (doc.balanceAmount !== undefined) {
                        // mark fully paid if balance is zero
                        setIsFullyPaid(Number(doc.balanceAmount) === 0);
                    }
                    // Populate rounding and manual adjustment states if present
                    if (typeof doc.autoRoundOff !== 'undefined') setAutoRoundOff(Boolean(doc.autoRoundOff));
                    if (doc.adjustmentType) setAdjustmentType(doc.adjustmentType === 'subtract' ? 'subtract' : 'add');
                    if (typeof doc.manualAdjustment !== 'undefined') {
                        const m = Number(doc.manualAdjustment) || 0;
                        setCommittedAdjustment(m);
                        setManualAdjustmentStr(m ? String(m) : '');
                    }
                })
                .catch((err) => console.error('Failed to load sale for edit:', err));
        } catch (e) {
            // ignore
        }
    }, []);

    // --- Preview next invoiceNo for NEW invoices (do not create DB record) ---
    useEffect(() => {
        try {
            const params = new URLSearchParams(window.location.search);
            const editId = params.get('editId');
            // Only fetch preview when creating a new invoice (no editId) and when invoiceNo isn't already present
            if (editId) return;
            if (invoiceNo) return; // don't overwrite an existing value or a draft

            // Fetch preview from API that reads the counter but doesn't increment it
            fetch('/api/new_sale/preview', { credentials: 'include' })
                .then(async (res) => {
                    if (!res.ok) return null;
                    return res.json();
                })
                .then((data) => {
                    const preview = data?.data;
                    if (preview && preview.invoiceNo) {
                        // Set as preview so user can see expected invoice number, but it's not reserved until save
                        setInvoiceNo(preview.invoiceNo);
                        setInvoiceNumber(preview.invoiceNumber || invoiceNumber);
                    }
                })
                .catch(() => {
                    // ignore preview errors — fallback to empty invoice input
                });
        } catch (e) {
            // ignore
        }
    }, []);

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
                            <Button variant="ghost" size="icon" className="text-gray-600 hover:bg-gray-100 rounded-md p-2" onClick={() => router.push('/dashboard/sale/sales-data')}>
                                <ArrowLeft className="h-5 w-5" />
                            </Button>
                            <h1 className="text-xl font-semibold text-gray-800">{editId ? 'Update Sales Invoice' : 'Create Sales Invoice'}</h1>
                        </div>

                        <div className="flex items-center gap-2">
                            <Button variant="outline" className="bg-white border-gray-300 text-gray-700 hover:bg-gray-100 px-3 py-2">
                                <Settings className="h-4 w-4 mr-2" /> Settings
                            </Button>

                            {/* Drafts feature removed */}

                            <Button
                                className="bg-indigo-600 text-white font-semibold hover:bg-indigo-700 px-4 py-2"
                                onClick={async () => {
                                        try {
                                            setSaving(true);
                                            // Consider invoice paid if user checked fully-paid OR the entered amountReceived covers the final amount.
                                            const numericAmountReceived = parseFloat(amountReceivedStr) || 0;
                                            const isPaid = isFullyPaid || numericAmountReceived >= finalAmountForBalance;
                                            const paymentStatusToSend = isPaid ? paymentMode : 'unpaid';

                                            // Normalize selectedParty to id string for API
                                            let selectedPartyToSend: any = undefined;
                                            if (selectedParty) {
                                                if ((selectedParty as any).id) selectedPartyToSend = (selectedParty as any).id;
                                                else if ((selectedParty as any)._id) selectedPartyToSend = (selectedParty as any)._id;
                                                else selectedPartyToSend = selectedParty as any;
                                            }

                                                                    const invoiceData: any = {
                                                                        // For new invoices, invoiceNumber is assigned by server and will be removed before POST
                                                                        invoiceNumber,
                                                invoiceDate,
                                                dueDate,
                                                paymentTerms,
                                                selectedParty: selectedPartyToSend,
                                                items,
                                                additionalCharges,
                                                // persist overall discount UI state
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

                                            // If creating a new invoice, don't send client-side invoiceNumber — server will assign invoiceNo
                                            if (!editId) {
                                                try { delete invoiceData.invoiceNumber; } catch (e) {}
                                            }

                                            // If editId is set, call PUT to update existing NewSale
                                            let res;
                                            if (editId) {
                                                console.debug('Updating invoice', editId, invoiceData);
                                                res = await fetch(`/api/new_sale/${editId}`, {
                                                    method: 'PUT',
                                                    credentials: 'include',
                                                    headers: { 'Content-Type': 'application/json' },
                                                    body: JSON.stringify(invoiceData),
                                                });
                                            } else {
                                                // mark that assignment is in progress (placeholder)
                                                const hadInvoiceNo = Boolean(invoiceNo);
                                                if (!hadInvoiceNo) setInvoiceNo('Assigning…');
                                                console.debug('Posting new invoice to /api/new_sale:', invoiceData);
                                                res = await fetch('/api/new_sale', {
                                                    method: 'POST',
                                                    credentials: 'include',
                                                    headers: { 'Content-Type': 'application/json' },
                                                    body: JSON.stringify(invoiceData),
                                                });
                                            }

                                            if (!res.ok) {
                                                // If the POST failed, clear temporary placeholder if we set it
                                                const hadInvoiceNo = invoiceNo === 'Assigning…';
                                                if (hadInvoiceNo) setInvoiceNo('');
                                                const errBody = await res.json().catch(() => ({}));
                                                console.error('Server responded with error', errBody);
                                                const msg = errBody?.error || errBody?.message || 'Failed to save to server';
                                                setSavedMessage(msg);
                                                setTimeout(() => setSavedMessage(''), 5000);
                                            } else {
                                                const data = await res.json().catch(() => ({}));
                                                setSavedMessage(data?.message || 'Saved to server');
                                                setTimeout(() => setSavedMessage(''), 3000);
                                                // If it was a new POST, and server returned id, set editId so further saves update
                                                if (!editId && data?.data?._id) setEditId(data.data._id);
                                                // Set server-assigned invoiceNo in UI if returned
                                                const returnedInvoiceNo = data?.data?.invoiceNo || data?.invoiceNo || '';
                                                if (returnedInvoiceNo) setInvoiceNo(returnedInvoiceNo);
                                                // Notify other UI that product stocks may have changed
                                                try { window.dispatchEvent(new Event('productsUpdated')); } catch (e) {}
                                            }
                                        } catch (err) {
                                            console.error('Failed to save to server', err);
                                            setSavedMessage('Failed to save');
                                            // clear temporary assigning label if present
                                            try { if (!editId) setInvoiceNo(''); } catch (e) {}
                                            setTimeout(() => setSavedMessage(''), 3000);
                                        } finally {
                                            setSaving(false);
                                        }
                                }}
                            >
                                {saving ? 'Saving…' : 'Save Sales Invoice'}
                            </Button>

                            {savedMessage && <div className="text-sm text-green-600 ml-2">{savedMessage}</div>}
                        </div>
                    </div>
                </div>

                {/* Drafts UI removed */}
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
                            partyType="Customer" />
                        <div className="flex flex-col items-end gap-4">
                             <div className="flex flex-col sm:flex-row gap-4">
                                 <div className="w-full sm:w-64">
                                     <label htmlFor="invoiceNo" className="text-sm font-medium text-gray-700 mb-1 block text-right">Sales Invoice No:</label>
                                     {/* Invoice number is assigned by the server on create and cannot be edited here */}
                                     <Input id="invoiceNo" type="text" value={invoiceNo || (editId ? (invoiceNumber ? String(invoiceNumber) : '') : 'Will be assigned on save')} readOnly className="text-right bg-gray-100 cursor-not-allowed"/>
                                 </div>
                                 <div className="w-full sm:w-64">
                                    <label htmlFor="invoiceDate" className="text-sm font-medium text-gray-700 mb-1 block text-right">Sales Invoice Date:</label>
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
                                    <th className="px-2 py-2 text-left text-xs font-medium text-black w-28">TAX</th>
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
                                                                                            // prefer item's unit, then product.unit from cache, then default to 'pcs'
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
                        <div className="w-28 px-2 py-2 text-right text-xs font-medium text-black">₹ {formatCurrency(totalTax)}</div>
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
                           {/* <Button variant="link" className="text-blue-600 p-0 hover:underline"><Plus className="mr-1 h-4 w-4" /> Add New Account</Button> */}
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
                            {gstBreakdown.length > 0 && (
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
                                                    // update committedAdjustment live unless auto round-off is enabled
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
                                <div className="flex items-center gap-1 w-56 bg-gray-100 rounded-md border border-gray-200 p-1">
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
                                        className="flex-grow bg-transparent border-none text-right focus-visible:ring-0 h-7 p-0 "
                                    />
                    <select value={paymentMode} onChange={(e) => setPaymentMode(e.target.value as any) } className="h-7 rounded-md border-none bg-white px-2 text-sm text-gray-700 focus:outline-none">
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
                            <div className="ml-auto mt-4 h-25 w-45 border bg-white flex items-center justify-center overflow-hidden">
                                {signatureUrl ? (
                                    // show signature image if present
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
    );
};

export default CreateSalesInvoicePage;