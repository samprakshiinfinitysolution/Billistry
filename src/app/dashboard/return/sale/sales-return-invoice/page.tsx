'use client';
import React, { useState, useEffect, useRef } from 'react';
import toast from 'react-hot-toast';
import { useRouter, useSearchParams } from 'next/navigation';
import { Plus, Settings, CalendarIcon, Trash2, QrCode, X, ArrowLeft, Search, ClipboardX, ArrowUp } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { AddItemModal, ItemData } from "../../../../../components/AddItem";
import { AddParty, Party } from "../../../../../components/AddParty";
import { LinkToInvoice, Invoice } from '../../../../../components/LinkToInvoice';
import { ScanBarcodeModal } from '../../../../../components/ScanBarcode';
import InvoiceSettingsModal from '../../../../../components/InvoiceSettingsModal';
import FormSkeleton from '@/components/ui/FormSkeleton';
import { apiService } from '@/services/apiService';

const formatCurrency = (amount: number) => {
    if (isNaN(amount) || amount === null) return '0.00';
    return new Intl.NumberFormat('en-IN', {
        style: 'decimal',
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    }).format(amount);
};
// Normalize party shape returned from API to the UI Party shape expected by AddParty
const normalizePartyForUI = (p: any) => {
    if (!p) return null;
    const id = p._id || p.id || (typeof p === 'string' ? p : undefined);
    const name = p.partyName || p.name || '';
    const balance = typeof p.balance !== 'undefined' ? p.balance : (p.openingBalance || 0);
    const phone = p.mobileNumber || p.phone || p.mobile || '';
    const address = p.billingAddress || p.address || p.shippingAddress || '';
    return { id: String(id || ''), name, balance, phone, address };
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
        className={`flex h-8 w-full rounded-md border border-gray-200 bg-transparent px-2 text-sm transition-colors placeholder:text-gray-400 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-blue-500 ${props.className}`}
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
        className={`h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer ${props.className}`}
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
    numericStock?: number | null;
    unit?: string | null;
    productId?: string | null;
    originalQty?: number;
    discountPercentStr: string; // The user-inputted discount percentage
    discountAmountStr: string; // The calculated discount amount
    lastDiscountInput: 'percent' | 'flat'; // Which discount input was last used
    taxPercentStr: string; // The selected tax percentage
    taxAmountStr: string; // The calculated tax amount
}

const GST_OPTIONS = ['0', '0.1', '0.25', '3', '5', '6', '12', '18', '28', '40'];
interface Charge {
    id: number;
    name: string;
    amount: string;
    taxType?: string;
}

const CreateSalesReturnInvoicePage = () => {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [invoiceNumber, setInvoiceNumber] = useState(1);
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
    const [returnInvoiceNo, setReturnInvoiceNo] = useState<string>('');
    const [returnInvoiceNumber, setReturnInvoiceNumber] = useState<number>(1);

    // --- FINALIZED STATE LOGIC ---
    const [manualAdjustmentStr, setManualAdjustmentStr] = useState(''); // Temp state for typing in adjustment input
    const [committedAdjustment, setCommittedAdjustment] = useState(0); // The "saved" adjustment value after blur
    const [adjustmentType, setAdjustmentType] = useState<'add' | 'subtract'>('add');

    // --- FINALIZED CALCULATION LOGIC ---
    const [totalAmountStr, setTotalAmountStr] = useState(''); // State for the user-editable "Total Amount" input
    const [totalAmountManuallySet, setTotalAmountManuallySet] = useState(false); // Flag to track manual edits

    const [isAddItemModalOpen, setIsAddItemModalOpen] = useState(false);
    const [isScanBarcodeModalOpen, setIsScanBarcodeModalOpen] = useState(false);
    const [productsCache, setProductsCache] = useState<any[]>([]);
    const [businessName, setBusinessName] = useState<string>('Business Name');
    const [signatureUrl, setSignatureUrl] = useState<string | null>(null);
    const [gstNumber, setGstNumber] = useState<string | null>(null);

    // Invoice settings (persisted to localStorage)
    const [invoiceSettings, setInvoiceSettings] = useState<{ showTax: boolean; showGST: boolean }>({ showTax: true, showGST: true });
    const [isSettingsOpen, setIsSettingsOpen] = useState(false);
    const [saving, setSaving] = useState(false);
    const [editId, setEditId] = useState<string | null>(null);
    const [isFetching, setIsFetching] = useState(false);
    
    // --- Invoice Linking State ---
    const [searchInvoiceTerm, setSearchInvoiceTerm] = useState('');
    const [fetchedInvoices, setFetchedInvoices] = useState<Invoice[]>([]);
    // When the user links an original invoice, lock the return form to prevent edits
    const [isLinked, setIsLinked] = useState(false);

    // If the user clears the LinkToInvoice input, unlock the form (allow creating a standalone return)
    useEffect(() => {
        // when LinkToInvoice is cleared, unset linked mode and remove any invoice-populated data
        if (!searchInvoiceTerm) {
            if (isLinked) {
                // clear fields that come from a linked invoice
                setItems([]);
                setAdditionalCharges([]);
                setNotes('');
                setShowNotesInput(false);
                setDiscountPercentStr('');
                setDiscountFlatStr('');
                setLastDiscountInput(null);
                setAmountReceivedStr('');
                setIsFullyPaid(false);
                setPaymentMode('unpaid');
                setCommittedAdjustment(0);
                setManualAdjustmentStr('');
                // reset invoiceDate to today for a new standalone return
                setInvoiceDate(new Date().toISOString().split('T')[0]);
            }
            setIsLinked(false);
        }
    }, [searchInvoiceTerm]);

    useEffect(() => {
        const fetchInvoices = async () => {
            try {
                const res = await fetch('/api/new_sale');
                const data = await res.json();
                    if (data && data.success && Array.isArray(data.data)) {
                    const mapped: Invoice[] = data.data.map((d: any) => ({
                        id: d._id,
                        date: d.invoiceDate ? (new Date(d.invoiceDate)).toISOString().split('T')[0] : (d.savedAt ? new Date(d.savedAt).toISOString().split('T')[0] : ''),
                        invoiceNo: d.invoiceNo || d.invoiceNoFormatted || (d.invoiceNumber ? `INV-${String(d.invoiceNumber).padStart(5, '0')}` : '') || '',
                        invoiceNumber: d.invoiceNumber,
                        amount: Number(d.totalAmount || d.totalAmount || 0),
                        // store the party id (if any) so UI can filter invoices by selected party
                        partyId: d.selectedParty?._id || d.selectedParty?.id || (d.selectedParty || undefined),
                    }));
                    setFetchedInvoices(mapped);
                } else {
                    console.warn('Failed to fetch sales invoices', data);
                }
            } catch (e) {
                console.error('Error fetching sales invoices', e);
            }
        };
        const eid = searchParams.get('editId');
        if (eid) setEditId(eid);
        fetchInvoices();
        // Preview next return invoice number for new returns
        try {
            const editId = searchParams.get('editId');
            if (!editId) {
                fetch('/api/new_sale_return/preview', { credentials: 'include' })
                    .then(async (res) => res.ok ? res.json() : null)
                    .then(data => {
                        const preview = data?.data;
                        if (preview && preview.invoiceNo) {
                            setReturnInvoiceNo(preview.invoiceNo);
                            setReturnInvoiceNumber(preview.invoiceNumber || returnInvoiceNumber);
                        }
                    }).catch(() => {});
            }
        } catch (e) {}
    }, []);

    // If ?partyId= is provided, preselect that party for the return
    useEffect(() => {
        const pid = searchParams.get('partyId');
        if (!pid) return;
        let mounted = true;
        (async () => {
            try {
                const res = await apiService.getPartyById(pid);
                if (!mounted) return;
                if (res && res.party) {
                    const uiParty = normalizePartyForUI(res.party);
                    if (uiParty) setSelectedParty(uiParty as any);
                }
            } catch (e) {
                // ignore
            }
        })();
        return () => { mounted = false; };
    }, [searchParams]);

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
                    if (body.data.gstin) setGstNumber(body.data.gstin);
                } else {
                    if (body?.name) setBusinessName(body.name);
                    if (body?.signatureUrl) setSignatureUrl(body.signatureUrl);
                    if (body?.gstNumber) setGstNumber(body.gstNumber);
                    if (body?.gstin) setGstNumber(body.gstin);
                }
            } catch (err) {
                console.debug('Failed to fetch business settings', err);
            }
        };
        fetchSettings();
        return () => { cancelled = true; };
    }, []);

    // Load invoiceSettings from localStorage on mount
    useEffect(() => {
        try {
            const raw = window.localStorage.getItem('invoiceSettings');
            if (raw) {
                const parsed = JSON.parse(raw);
                setInvoiceSettings(prev => ({ ...prev, ...parsed }));
            }
        } catch (e) {}
    }, []);

    // If we have an editId in query params, fetch the existing sales return and populate form
    useEffect(() => {
        try {
            const editId = searchParams.get('editId');
            if (!editId) return;
            setIsFetching(true);
            (async () => {
                try {
                    const res = await fetch(`/api/new_sale_return/${editId}`, { credentials: 'include' });
                    if (!res.ok) {
                        const text = await res.text().catch(() => null);
                        console.error('Failed to fetch sales return for edit', editId, 'status', res.status, 'body:', text);
                        return;
                    }
                    const body = await res.json().catch(() => ({}));
                    const d = body?.data;
                    if (!d) return;

                    // Basic fields
                    setReturnInvoiceNo(d.invoiceNo || d.returnInvoiceNo || '');
                    setInvoiceNumber(d.invoiceNumber || invoiceNumber);
                    setInvoiceDate(d.returnDate || d.invoiceDate || (d.savedAt ? new Date(d.savedAt).toISOString().split('T')[0] : invoiceDate));
                    setNotes(d.notes || '');
                    if (d.notes && String(d.notes).trim() !== '') { setShowNotesInput(true); }
                    if (typeof d.terms !== 'undefined' && d.terms !== null) setTerms(String(d.terms || ''));

                    // Additional charges
                    setAdditionalCharges(Array.isArray(d.additionalCharges) ? d.additionalCharges.map((c: any, i: number) => ({ id: c.id ?? i, name: c.name || '', amount: String(c.amount || '') })) : []);

                    // Items
                    if (Array.isArray(d.items)) {
                        nextItemId.current = 0;
                        const loadedItems = d.items.map((it: any) => ({
                            id: nextItemId.current++,
                            name: it.name || '',
                            hsn: it.hsn || it.hsnCode || '',
                            qty: Number(it.qty || 0),
                            price: Number(it.price || 0),
                            discountPercentStr: it.discountPercentStr || it.discountPercent || '',
                            discountAmountStr: it.discountAmountStr || it.discountAmount || '',
                            lastDiscountInput: (it.lastDiscountInput === 'flat' ? 'flat' : 'percent'),
                            taxPercentStr: it.taxPercentStr || it.taxPercent || '0',
                            taxAmountStr: it.taxAmountStr || it.taxAmount || '',
                        }));
                        setItems(loadedItems);
                    }

                    // Selected party
                    if (d.selectedParty) {
                        const sp = d.selectedParty;
                        setSelectedParty({
                            id: sp._id || sp.id,
                            name: sp.partyName || sp.name || '',
                            balance: sp.balance || 0,
                            phone: sp.mobileNumber || sp.mobile || '',
                            address: sp.billingAddress || sp.address || ''
                        });
                    }

                    // Discount & payment fields
                    if (typeof d.discountPercentStr !== 'undefined') setDiscountPercentStr(String(d.discountPercentStr || ''));
                    if (typeof d.discountFlatStr !== 'undefined') setDiscountFlatStr(String(d.discountFlatStr || ''));
                    if (d.discountOption) setDiscountOption(d.discountOption);
                    if ((d.discountPercentStr && String(d.discountPercentStr).trim() !== '') || (d.discountFlatStr && String(d.discountFlatStr).trim() !== '') || d.discountOption) {
                        setShowDiscountInput(true);
                    }
                    if (d.amountReceived !== undefined) setAmountReceivedStr(String(d.amountReceived));
                    if (d.paymentStatus) setPaymentMode(d.paymentStatus as any);
                    if (d.balanceAmount !== undefined) {
                        setIsFullyPaid(Number(d.balanceAmount) === 0);
                    }
                    if (typeof d.autoRoundOff !== 'undefined') setAutoRoundOff(Boolean(d.autoRoundOff));
                    if (d.adjustmentType) setAdjustmentType(d.adjustmentType === 'subtract' ? 'subtract' : 'add');
                    if (typeof d.manualAdjustment !== 'undefined') {
                        const m = Number(d.manualAdjustment) || 0;
                        setCommittedAdjustment(m);
                        setManualAdjustmentStr(m ? String(m) : '');
                    }
                    // If this return was linked to an original sale, try to show that invoice in the LinkToInvoice input
                    try {
                        const orig = d.originalSale || d.original_sale || d.originalSaleId;
                        if (orig) {
                            // prefer the already-fetched invoice list
                            const found = fetchedInvoices.find(f => f.id === orig || String(f.invoiceNumber) === String(orig) || f.invoiceNo === orig);
                            if (found) {
                                setSearchInvoiceTerm(found.invoiceNo || (found.invoiceNumber ? String(found.invoiceNumber) : ''));
                                setIsLinked(true);
                            } else {
                                // fallback: fetch the original sale to extract its invoice number
                                try {
                                    const r = await fetch(`/api/new_sale/${orig}`);
                                    if (r.ok) {
                                        const jb = await r.json().catch(() => null);
                                        const sd = jb?.data;
                                        if (sd) {
                                            setSearchInvoiceTerm(sd.invoiceNo || (sd.invoiceNumber ? String(sd.invoiceNumber) : ''));
                                            setIsLinked(true);
                                        }
                                    }
                                } catch(e) {}
                            }
                        }
                    } catch(e) {}
                    setIsFetching(false);
                } catch (err) {
                    console.error('Error loading sales return for edit', err);
                    setIsFetching(false);
                }
            })();
        } catch (e) {}
    }, [searchParams]);

    const handleSelectInvoice = async (invoice: Invoice) => {
        if (!invoice?.id) return;
        // show selected invoice number in LinkToInvoice input
        try { setSearchInvoiceTerm(invoice.invoiceNo || (invoice.invoiceNumber ? String(invoice.invoiceNumber) : '')); } catch(e) {}
        try {
            const res = await fetch(`/api/new_sale/${invoice.id}`);
            const data = await res.json();
            if (data && data.success && data.data) {
                const d = data.data as any;
                // populate form fields
                setInvoiceNumber(d.invoiceNumber || invoiceNumber);
                setInvoiceDate(d.invoiceDate ? (new Date(d.invoiceDate)).toISOString().split('T')[0] : invoiceDate);
                setNotes(d.notes || '');
                if (d.notes && String(d.notes).trim() !== '') { setShowNotesInput(true); }
                if (typeof d.terms !== 'undefined' && d.terms !== null) setTerms(String(d.terms || ''));
                setAdditionalCharges(Array.isArray(d.additionalCharges) ? d.additionalCharges.map((c: any, i: number) => ({ id: c.id ?? i, name: c.name || '', amount: String(c.amount || '') })) : []);
                // items
                if (Array.isArray(d.items)) {
                    nextItemId.current = 0;
                    const loadedItems = d.items.map((it: any, idx: number) => ({
                        id: nextItemId.current++,
                        name: it.name || '',
                        hsn: it.hsn || it.hsnCode || '',
                        qty: Number(it.qty || 0),
                        price: Number(it.price || 0),
                        discountPercentStr: it.discountPercentStr || '',
                        discountAmountStr: it.discountAmountStr || '',
                        lastDiscountInput: (it.lastDiscountInput === 'flat' ? 'flat' : 'percent'),
                        taxPercentStr: it.taxPercentStr || '0',
                        taxAmountStr: it.taxAmountStr || '',
                    }));
                    setItems(loadedItems);
                }
                // lock the form when a full invoice has been selected and populated
                setIsLinked(true);
                // selected party if present (normalize to Party shape)
                if (d.selectedParty) {
                    const sp = d.selectedParty;
                    setSelectedParty({
                        id: sp._id || sp.id,
                        name: sp.partyName || sp.name || '',
                        balance: sp.balance || 0,
                        phone: sp.mobileNumber || sp.mobile || '',
                        address: sp.billingAddress || sp.address || ''
                    });
                }
                // discount and payment fields
                if (typeof d.discountPercentStr !== 'undefined') setDiscountPercentStr(String(d.discountPercentStr || ''));
                if (typeof d.discountFlatStr !== 'undefined') setDiscountFlatStr(String(d.discountFlatStr || ''));
                if (d.discountOption) setDiscountOption(d.discountOption);
                if ((d.discountPercentStr && String(d.discountPercentStr).trim() !== '') || (d.discountFlatStr && String(d.discountFlatStr).trim() !== '') || d.discountOption) {
                    setShowDiscountInput(true);
                }
                if (d.amountReceived !== undefined) setAmountReceivedStr(String(d.amountReceived));
                if (d.paymentStatus) setPaymentMode(d.paymentStatus as any);
                if (d.balanceAmount !== undefined) {
                    setIsFullyPaid(Number(d.balanceAmount) === 0);
                }
                // Populate rounding and manual adjustment values from selected invoice so return form mirrors original
                if (typeof d.autoRoundOff !== 'undefined') setAutoRoundOff(Boolean(d.autoRoundOff));
                if (d.adjustmentType) setAdjustmentType(d.adjustmentType === 'subtract' ? 'subtract' : 'add');
                if (typeof d.manualAdjustment !== 'undefined') {
                    const m = Number(d.manualAdjustment) || 0;
                    setCommittedAdjustment(m);
                    setManualAdjustmentStr(m ? String(m) : '');
                }
            } else {
                console.warn('Failed to fetch invoice details', data);
            }
        } catch (e) {
            console.error('Error fetching invoice details', e);
        }
    };

    const [selectedParty, setSelectedParty] = useState<Party | null>(null);
    const [isAddingParty, setIsAddingParty] = useState(false);
    const [partySearchTerm, setPartySearchTerm] = useState('');


    // --- CALCULATIONS ---
    const subtotal = items.reduce((acc, item) => acc + (item.qty || 0) * (item.price || 0), 0);
    const totalItemDiscount = items.reduce((acc, item) => acc + (parseFloat(item.discountAmountStr) || 0), 0);
    const subtotalAfterItemDiscounts = subtotal - totalItemDiscount;
    const totalTax = items.reduce((acc, item) => acc + (parseFloat(item.taxAmountStr) || 0), 0);
    const itemsGrandTotal = subtotalAfterItemDiscounts + totalTax;
    const totalAdditionalCharges = additionalCharges.reduce((acc, charge) => acc + (parseFloat(charge.amount) || 0), 0);
    const taxableAmount = subtotalAfterItemDiscounts;

    // Compute GST breakdown grouped by tax percent (used for display)
    const gstMap = items.reduce((acc: Record<string, { taxable: number; tax: number }>, item) => {
        const tp = String(item.taxPercentStr || '0');
        const itemTotal = (item.qty || 0) * (item.price || 0);
        const itemDiscount = parseFloat(item.discountAmountStr) || 0;
        const taxable = Math.max(0, itemTotal - itemDiscount);
        const tax = parseFloat(item.taxAmountStr) || 0;
        if (!acc[tp]) acc[tp] = { taxable: 0, tax: 0 };
        acc[tp].taxable += taxable;
        acc[tp].tax += tax;
        return acc;
    }, {} as Record<string, { taxable: number; tax: number }>);
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

    useEffect(() => {
        // Only update flat amount when the last user input was percent.
        if (lastDiscountInput === 'percent') {
            const percent = parseFloat(discountPercentStr) || 0;
            const newFlat = (discountBase * percent) / 100;
            setDiscountFlatStr(newFlat > 0 ? newFlat.toFixed(2) : '');
        }
    }, [discountPercentStr, discountBase, lastDiscountInput]);


    useEffect(() => {
        // Only update percent when the last user input was flat.
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

    // If user marks fully paid and payment mode is still the placeholder 'unpaid',
    // set a sensible default so the select reflects a real payment mode and the
    // save handler sends the correct status.
    function handleFullyPaidChangeWithMode(checked: boolean) {
        setIsFullyPaid(checked);
        if (checked) {
            amountReceivedBeforePaid.current = parseFloat(amountReceivedStr) || 0;
            if ((paymentMode as string) === 'unpaid') {
                setPaymentMode('cash');
            }
        } else {
            setAmountReceivedStr(amountReceivedBeforePaid.current.toFixed(2));
            // when user unchecks fully paid, revert payment mode to unpaid
            setPaymentMode('unpaid');
        }
    }

    // If the user manually sets paymentMode to 'unpaid' while the invoice is marked
    // fully paid, interpret that as the user's intent to unmark fully-paid and
    // restore the previous amount received. This keeps UI state consistent.
    useEffect(() => {
        if (isFullyPaid && (paymentMode as string) === 'unpaid') {
            // Restore prior amount and unset fully paid.
            setAmountReceivedStr(amountReceivedBeforePaid.current.toFixed(2));
            setIsFullyPaid(false);
        }
        // Only trigger when paymentMode changes or isFullyPaid changes
    }, [paymentMode]);

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
            numericStock: (itemToAdd as any).numericStock ?? null,
            unit: itemToAdd.unit || null,
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

    // Fetch product list into cache so return editor can show live currentStock when available
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
                // sanitize percent and DO NOT allow >100 (ignore updates >100)
                if (value === '' || value === '-') {
                    updatedItem.discountPercentStr = '';
                    updatedItem.discountAmountStr = '';
                } else {
                    let percent = parseFloat(value) || 0;
                    if (percent < 0) percent = 0;
                    if (percent > 100) return item; // ignore update
                    const percentStr = Number.isFinite(percent) ? percent.toFixed(2).replace(/\.00$/, '') : String(percent);
                    updatedItem.discountPercentStr = percentStr;
                    updatedItem.discountAmountStr = itemTotal > 0 ? ((itemTotal * percent) / 100).toFixed(2) : '';
                }
            } else { // flat
                // disallow flat amount that exceeds item total (100%). Ignore updates > itemTotal
                if (value === '' || value === '-') {
                    updatedItem.discountAmountStr = '';
                    updatedItem.discountPercentStr = '';
                } else {
                    let amount = parseFloat(value) || 0;
                    if (amount < 0) amount = 0;
                    if (amount > itemTotal) return item;
                    updatedItem.discountAmountStr = String(value);
                    updatedItem.discountPercentStr = itemTotal > 0 ? (Math.min((amount / itemTotal) * 100, 100)).toFixed(2).replace(/\.00$/, '') : '';
                }
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
        setAdditionalCharges([...additionalCharges, { id: Date.now(), name: '', amount: '', taxType: 'no-tax' }]);
    };

    const handleChargeTypeChange = (id: number, value: string) => {
        setAdditionalCharges(additionalCharges.map(charge => charge.id === id ? { ...charge, taxType: value } : charge));
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

    // Centralized save handler reused by both "Save" and "Save & New"
    const handleSave = async (shouldRedirect: boolean) => {
        try {
            // Validation: party and items required
            if (!selectedParty) {
                toast.error('Please select a party before saving the sales return');
                return;
            }
            if (!items || items.length === 0) {
                toast.error('Please add at least one item before saving the sales return');
                return;
            }
            setSaving(true);

            let numericAmountReceived = parseFloat(amountReceivedStr) || 0;
            if (isFullyPaid && numericAmountReceived < finalAmountForBalance) {
                numericAmountReceived = finalAmountForBalance;
            }
            const isPaid = isFullyPaid || numericAmountReceived >= finalAmountForBalance;
            const paymentStatusToSend = isPaid ? paymentMode : 'unpaid';

            let selectedPartyToSend: any = undefined;
            if (selectedParty) {
                if ((selectedParty as any).id) selectedPartyToSend = (selectedParty as any).id;
                else if ((selectedParty as any)._id) selectedPartyToSend = (selectedParty as any)._id;
                else selectedPartyToSend = selectedParty as any;
            }

            const payload: any = {
                originalSale: undefined,
                returnDate: invoiceDate,
                reason: '',
                items,
                additionalCharges,
                terms,
                notes,
                autoRoundOff,
                adjustmentType,
                manualAdjustment: autoRoundOff ? 0 : committedAdjustment,
                totalAmount: finalAmountForBalance,
                amountRefunded: numericAmountReceived,
                balanceAmount: finalAmountForBalance - numericAmountReceived,
                paymentStatus: paymentStatusToSend,
                savedAt: new Date().toISOString(),
            };

            try {
                const match = searchInvoiceTerm && fetchedInvoices.find(f => (f.invoiceNo === searchInvoiceTerm) || (String(f.invoiceNumber) === searchInvoiceTerm));
                if (match) payload.originalSale = match.id;
            } catch (e) {}

            try {
                if (selectedPartyToSend) payload.selectedParty = selectedPartyToSend;
            } catch (e) {}

            let res: Response;
            if (editId) {
                res = await fetch(`/api/new_sale_return/${encodeURIComponent(editId)}`, { method: 'PUT', credentials: 'include', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
            } else {
                res = await fetch('/api/new_sale_return', { method: 'POST', credentials: 'include', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
            }

            if (!res.ok) {
                const err = await res.json().catch(() => ({}));
                console.error('Failed to save sales return', err);
                toast.error('Failed to save sales return.');
            } else {
                const body = await res.json().catch(() => ({}));
                try {
                    const returnedId = body?.data?._id || body?.data?.id || editId;
                    if (returnedId) {
                        try { setEditId(returnedId); } catch (e) {}
                    }
                } catch (e) {}

                // notify other tabs / components that product data may have changed
                try { window.dispatchEvent(new Event('productsUpdated')); } catch (e) {}

                // If caller wants to redirect to the saved invoice, do so
                const returnedId = body?.data?._id || body?._id || editId;
                if (shouldRedirect && returnedId) {
                    router.push(`/dashboard/return/sale/sales-return-invoice/${returnedId}`);
                    return;
                }

                // Save & New flow: clear form but show updated (local) invoice number for next invoice
                if (!shouldRedirect) {
                    const nextNum = body?.nextInvoiceNumber || (returnInvoiceNumber ? returnInvoiceNumber + 1 : (typeof returnInvoiceNumber === 'number' ? returnInvoiceNumber + 1 : 1));

                    if (body?.nextInvoiceFormatted) {
                        setReturnInvoiceNo(body.nextInvoiceFormatted);
                    } else {
                        const returnedInvoiceNo = body?.data?.invoiceNo || body?.invoiceNo || '';
                        const source = returnedInvoiceNo || String(returnInvoiceNo || '');
                        const numericMatch = source.match(/(\d+)$/);
                        if (numericMatch) {
                            const numericPart = numericMatch[1];
                            const prefix = source.slice(0, numericMatch.index || 0);
                            const width = numericPart.length;
                            const padded = String(nextNum).padStart(width, '0');
                            setReturnInvoiceNo(prefix + padded);
                        } else {
                            const prefixFromReturned = (returnedInvoiceNo && returnedInvoiceNo.match(/^[^0-9]*/)?.[0]) || '';
                            const prefixFromCurrent = (returnInvoiceNo && String(returnInvoiceNo).match(/^[^0-9]*/)?.[0]) || '';
                            const prefix = prefixFromReturned || prefixFromCurrent || '';
                            setReturnInvoiceNo(prefix + String(nextNum));
                        }
                    }

                    setEditId(null);
                    setItems([]);
                    setSelectedParty(null);
                    // Clear linked invoice input when starting a new return
                    try { setSearchInvoiceTerm(''); } catch (e) {}
                    try { setIsLinked(false); } catch (e) {}
                    setTerms('1. Goods once sold will not be taken back or exchanged\n2. All disputes are subject to [ENTER_YOUR_CITY_NAME] jurisdiction only');
                    setNotes('');
                    setAdditionalCharges([]);
                    setDiscountFlatStr('');
                    setDiscountPercentStr('');
                    setLastDiscountInput(null);
                    setManualAdjustmentStr('');
                    setCommittedAdjustment(0);
                    setTotalAmountManuallySet(false);
                    setAmountReceivedStr('');
                    setIsFullyPaid(false);
                    setPaymentMode('unpaid');
                    setInvoiceDate(new Date().toISOString().split('T')[0]);
                    setReturnInvoiceNumber(nextNum);
                    toast.success('Sales return saved. Ready for new return.');
                }
            }
        } catch (e) {
            console.error('Save sales return failed', e);
            toast.error('Failed to save sales return.');
        } finally {
            setSaving(false);
        }
    };

    if (isFetching) {
        return <div className="bg-gray-50 min-h-screen"><FormSkeleton /></div>;
    }

    return (
        <div className="bg-gray-50 min-h-screen">
            <InvoiceSettingsModal
                isOpen={isSettingsOpen}
                onClose={() => setIsSettingsOpen(false)}
                settings={invoiceSettings}
                onSave={(s) => setInvoiceSettings(s)}
            />
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
                            <Button variant="ghost" size="icon" className="text-gray-600 cursor-pointer hover:bg-gray-100 rounded-md p-2" onClick={() => router.push('/dashboard/return/sale/sales-return-data')}>
                                <ArrowLeft className="h-5 w-5" />
                            </Button>
                            <h1 className="text-xl font-semibold text-gray-800">{editId ? 'Update Sales Return' : 'Create Sales Return'}</h1>
                        </div>
                        <div className="flex items-center gap-2">
                            <Button variant="outline" className="bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 px-3 py-1.5 rounded-md cursor-pointer" onClick={() => setIsSettingsOpen(true)}>
                                <Settings className="h-4 w-4 mr-2 text-gray-600" /> Settings
                            </Button>

                            <>
                                <Button
                                    className="bg-white border border-indigo-600 text-indigo-600 hover:bg-indigo-50 px-4 py-2 rounded-md cursor-pointer"
                                    onClick={async () => await handleSave(false)}
                                >
                                    {saving ? 'Saving…' : 'Save & New'}
                                </Button>
                                <Button
                                    className="bg-indigo-600 text-white font-semibold hover:bg-indigo-700 px-8 py-2 rounded-md shadow-md cursor-pointer"
                                    onClick={async () => await handleSave(true)}
                                >
                                    {saving ? 'Saving…' : 'Save'}
                                </Button>
                            </>
                        </div>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">

                <div className="bg-white p-6 rounded-lg shadow-sm">
                    {/* Top Section: Billing and Invoice Details */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                        <AddParty
                            selectedParty={selectedParty}
                            onSelectParty={isLinked ? (() => {}) : setSelectedParty}
                            onClearParty={isLinked ? (() => {}) : (() => setSelectedParty(null))}
                            partyType="Customer"
                        />
                        <div className="flex flex-col items-end gap-4">
                             <div className="flex flex-col sm:flex-row gap-4">
                                 <div className="w-full sm:w-64">
                                     <label htmlFor="invoiceNo" className="text-sm font-medium text-gray-700 mb-1 block text-right">Sales Return No:</label>
                                     <div className="flex items-center gap-2 justify-end">
                                         <Input id="invoiceNo" type="text" value={returnInvoiceNo || `SR-${String(invoiceNumber).padStart(5, '0')}`} readOnly aria-readonly={true} tabIndex={-1} className="text-right w-44 cursor-not-allowed bg-gray-100"/>
                                     </div>
                                 </div>
                                 <div className="w-full sm:w-64">
                                    <label htmlFor="invoiceDate" className="text-sm font-medium text-gray-700 mb-1 block text-right">Sales Return Date:</label>
                                    <div className="relative">
                                                      <Input
                                                          id="invoiceDate"
                                                          type="date"
                                                          value={invoiceDate}
                                                          onChange={e => { if (!isLinked) setInvoiceDate(e.target.value); }}
                                                          readOnly={isLinked}
                                                          aria-disabled={isLinked}
                                                          className={`text-right ${isLinked ? 'bg-gray-100 cursor-not-allowed' : ''}`}
                                                      />
                                         {/* <CalendarIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" /> */}
                                    </div>
                                 </div>
                             </div>
                            {/* Pass only invoices belonging to the selected party (if one is selected) */}
                            <LinkToInvoice
                                invoiceList={selectedParty ? fetchedInvoices.filter(inv => inv.partyId && (inv.partyId === (selectedParty as any).id || inv.partyId === (selectedParty as any)._id || inv.partyId === (selectedParty as any))) : fetchedInvoices}
                                searchTerm={searchInvoiceTerm}
                                onSearchTermChange={setSearchInvoiceTerm}
                                onSelectInvoice={handleSelectInvoice}
                            />
                        </div>
                    </div>

                    {/* Items Table Section */}
                    <div className="overflow-x-auto">
                        <table className="w-full min-w-[900px]">
                             <thead className="border-b bg-white sticky top-0 z-0">
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
                                    <tr key={item.id} className={`border-b hover:bg-gray-50 ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}`}>
                                        <td className="px-2 py-2 text-sm text-gray-500">{index + 1}</td>
                                        <td className="px-2 py-2">
                                            <Input
                                                type="text"
                                                placeholder="Item Name"
                                                value={item.name}
                                                readOnly={isLinked}
                                                onChange={e => { if (!isLinked) handleItemChange(item.id, 'name', e.target.value); }}
                                                className={isLinked ? 'bg-gray-100 cursor-not-allowed' : ''}
                                            />
                                        </td>
                                        <td className="px-2 py-2">
                                            <Input
                                                type="text"
                                                placeholder="HSN"
                                                value={item.hsn}
                                                readOnly={isLinked}
                                                onChange={e => { if (!isLinked) handleItemChange(item.id, 'hsn', e.target.value); }}
                                                className={isLinked ? 'bg-gray-100 cursor-not-allowed' : ''}
                                            />
                                        </td>
                                        <td className="px-2 py-2">
                                            <div className="flex flex-col">
                                                <Input
                                                    type="number"
                                                    placeholder="1"
                                                    value={item.qty === 0 ? '' : item.qty}
                                                    readOnly={isLinked}
                                                    onChange={e => { if (!isLinked) handleItemChange(item.id, 'qty', e.target.value); }}
                                                />
                                                {(() => {
                                                    // prefer live currentStock from productsCache when available
                                                    const p = (item as any).productId && productsCache.length ? productsCache.find((pp: any) => String(pp._id) === String((item as any).productId)) : null;
                                                    const liveStock = p ? (typeof p.currentStock !== 'undefined' && p.currentStock !== null ? Number(p.currentStock) : (typeof p.openingStock !== 'undefined' && p.openingStock !== null ? Number(p.openingStock) : null)) : item.numericStock;
                                                    if (typeof liveStock !== 'number') return null;
                                                    const orig = typeof (item as any).originalQty === 'number' ? (item as any).originalQty : 0;
                                                    const delta = (item.qty || 0) - orig;
                                                    const raw = (liveStock || 0) - delta;
                                                    const cls = raw <= 0 ? 'text-red-600' : 'text-gray-500';
                                                    const unitLabel = item.unit || (p && p.unit) || 'pcs';
                                                    if (raw <= 0) return <span className={`text-xs ${cls}`}>{`Out of stock ${unitLabel}`}</span>;
                                                    return <span className={`text-xs ${cls}`}>{`Available: ${raw} ${unitLabel}`}</span>;
                                                })()}
                                            </div>
                                        </td>
                                        <td className="px-2 py-2">
                                            <Input
                                                type="number"
                                                placeholder="0.00"
                                                value={item.price}
                                                readOnly={isLinked}
                                                onChange={e => { if (!isLinked) handleItemChange(item.id, 'price', e.target.value); }}
                                                className={isLinked ? 'bg-gray-100 cursor-not-allowed' : ''}
                                            />
                                        </td>
                                        <td className="px-2 py-2 w-32">
                                            <div className="flex flex-col gap-1">
                                                <div className="relative">
                                                    <span className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-400 text-xs">%</span>
                                                    <Input
                                                        type="number"
                                                        placeholder="0"
                                                        value={item.discountPercentStr}
                                                        readOnly={isLinked}
                                                        onChange={e => { if (!isLinked) handleItemDiscountChange(item.id, 'percent', e.target.value); }}
                                                        className={`pl-6 text-right ${isLinked ? 'bg-gray-100 cursor-not-allowed' : ''}`}
                                                    />
                                                </div>
                                                <div className="relative">
                                                    <span className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-400 text-xs">₹</span>
                                                    <Input
                                                        type="number"
                                                        placeholder="0.00"
                                                        value={item.discountAmountStr}
                                                        readOnly={isLinked}
                                                        onChange={e => { if (!isLinked) handleItemDiscountChange(item.id, 'flat', e.target.value); }}
                                                        className={`pl-6 text-right ${isLinked ? 'bg-gray-100 cursor-not-allowed' : ''}`}
                                                    />
                                                </div>
                                            </div>
                                        </td>
                                        {invoiceSettings.showTax && (
                                        <td className="px-2 py-2 w-32">
                                            <div className="flex flex-col gap-1">
                                                <Select
                                                    value={item.taxPercentStr}
                                                    onValueChange={(value) => { if (!isLinked) handleItemTaxChange(item.id, value); }}
                                                >
                                                    <SelectTrigger className={`h-9 w-full ${isLinked ? 'bg-gray-100 text-gray-400 cursor-not-allowed pointer-events-none' : 'cursor-pointer'}`}>
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
                                        )}
                                        <td className="px-2 py-2 text-sm text-gray-800 text-right">{formatCurrency(calculateItemAmount(item))}</td>
                                        <td className="px-2 py-2 text-center">
                                            {!isLinked && (
                                                <Button variant="ghost" size="icon" onClick={() => handleRemoveItem(item.id)} className="text-gray-400 cursor-pointer hover:text-red-500 rounded-full p-1">
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                                <tr>
                                    <td colSpan={9} className="p-2">
                                        <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 flex justify-between items-center">
                                            <Button
                                                variant="outline"
                                                disabled={isLinked}
                                                onClick={!isLinked ? () => setIsAddItemModalOpen(true) : undefined}
                                                className={`${isLinked ? 'text-gray-400 cursor-not-allowed border-none' : 'text-blue-600 cursor-pointer border-none hover:bg-transparent'}`}
                                            >
                                                <Plus className="mr-2 h-4 w-4" /> Add Item
                                            </Button>
                                            <div className="flex items-center gap-4">
                                                <Button
                                                    variant="outline"
                                                    disabled={isLinked}
                                                    onClick={!isLinked ? () => setIsScanBarcodeModalOpen(true) : undefined}
                                                    className={`${isLinked ? 'text-gray-400 cursor-not-allowed border-none' : 'text-gray-700 cursor-pointer border-none hover:bg-gray-50 px-3 py-1.5 rounded-lg'}`}
                                                >
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
                        {invoiceSettings.showTax && (
                            <div className="w-28 px-2 py-2 text-right text-xs font-medium text-black">₹ {formatCurrency(totalTax)}</div>
                        )}
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
                                        readOnly={isLinked}
                                        onChange={(e) => { if (!isLinked) setNotes(e.target.value); }}
                                        rows={3}
                                        className="bg-gray-100 p-3 rounded-md border-none focus-visible:ring-0 p-0"
                                    />
                                    <Button variant="ghost" size="icon" disabled={isLinked} className={`absolute top-2 right-2 text-gray-400 ${isLinked ? '' : 'cursor-pointer hover:text-gray-600'}`} onClick={!isLinked ? () => setShowNotesInput(false) : undefined}>
                                        <X className="h-4 w-4" />
                                    </Button>
                                </div>
                            ) : (
                            <Button variant="link" disabled={isLinked} className={`${isLinked ? 'text-gray-400 p-0' : 'text-blue-600 cursor-pointer p-0 hover:underline'}`} onClick={!isLinked ? () => setShowNotesInput(true) : undefined}><Plus className="mr-1 h-4 w-4" /> Add Notes</Button>)}
                           {/* <Button variant="link" className="text-blue-600 p-0 hover:underline"><Plus className="mr-1 h-4 w-4" /> Add Notes</Button> */}
                           <div className="relative">
                               <label className="text-sm font-medium text-gray-500 mb-1 block">Terms and Conditions</label>
                               <div className="bg-gray-100 p-3 rounded-md">
                                             <Textarea value={terms} readOnly={isLinked} onChange={(e) => { if (!isLinked) setTerms(e.target.value); }} rows={3} className={`bg-transparent border-none focus-visible:ring-0 p-0 ${isLinked ? 'bg-gray-100 cursor-not-allowed' : ''}`}/>
                                         </div>
                                         <Button variant="ghost" size="icon" disabled={isLinked} className={`absolute top-7 right-2 text-gray-400 ${isLinked ? '' : 'cursor-pointer hover:text-gray-600'}`} onClick={!isLinked ? () => setTerms('') : undefined}>
                                    <X className="h-4 w-4" />
                               </Button>
                           </div>
                        </div>

                        {/* Right side - FINAL CORRECTED LOGIC */}
                        <div className="space-y-4 mt-6 md:mt-0 sticky top-24 self-start">
                            <div className="space-y-2">
                                {additionalCharges.map((charge) => (
                                    <div key={charge.id} className="flex items-center gap-2">
                                            <Input
                                                type="text"
                                                placeholder="Enter Charge Ex: transport charge"
                                                value={charge.name}
                                                readOnly={isLinked}
                                                onChange={(e) => { if (!isLinked) handleChargeChange(charge.id, 'name', e.target.value); }}
                                                className={`flex-grow ${isLinked ? 'bg-gray-100 cursor-not-allowed' : ''}`}
                                            />
                                        <div className="relative w-40">
                                            <span className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-500 text-sm">₹</span>
                                            <Input
                                                type="number"
                                                placeholder="0.00"
                                                value={charge.amount}
                                                readOnly={isLinked}
                                                onChange={(e) => { if (!isLinked) handleChargeChange(charge.id, 'amount', e.target.value); }}
                                                className={`w-full pl-6 pr-2 text-right ${isLinked ? 'bg-gray-100 cursor-not-allowed' : ''}`}
                                            />
                                        </div>
                                        <div className="w-44">
                                            <Select value={charge.taxType || 'no-tax'} onValueChange={(v) => { if (!isLinked) handleChargeTypeChange(charge.id, v); }}>
                                                <SelectTrigger className={`h-9 w-full ${isLinked ? 'bg-gray-100 text-gray-400 cursor-not-allowed pointer-events-none' : 'cursor-pointer'}`} aria-disabled={isLinked}>
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="no-tax">No Tax Applicable</SelectItem>
                                                    <SelectItem value="taxable">Taxable (GST)</SelectItem>
                                                    <SelectItem value="exempt">Tax Exempt</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="icon"
                                            disabled={isLinked}
                                            className={`h-9 w-9 p-1 text-gray-500 ${isLinked ? '' : 'cursor-pointer hover:text-red-500'} rounded-full flex-shrink-0 ${isLinked ? 'cursor-not-allowed' : ''}`}
                                            onClick={!isLinked ? () => handleRemoveCharge(charge.id) : undefined}
                                        >
                                            <X className="h-4 w-4" />
                                        </Button>
                                    </div>
                                ))}
                                <Button
                                    variant="link"
                                    disabled={isLinked}
                                    onClick={!isLinked ? handleAddCharge : undefined}
                                    className={`${isLinked ? 'text-gray-400 cursor-not-allowed p-0' : 'text-blue-600 cursor-pointer p-0 hover:underline'}`}
                                >
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
                                        const halfPercent = g.percent / 2;
                                        const formatPercent = (p: number) => (Number.isInteger(p) ? String(p) : p.toFixed(2));
                                        const sgstLabel = `SGST @ ${formatPercent(halfPercent)}%`;
                                        const cgstLabel = `CGST @ ${formatPercent(halfPercent)}%`;
                                        return (
                                            <React.Fragment key={g.percent}>
                                                <div className="flex justify-between items-center text-sm">
                                                    <span className="text-gray-500">{sgstLabel}</span>
                                                    <span className="font-medium text-gray-800">{formatCurrency(halfTax)}</span>
                                                </div>
                                                <div className="flex justify-between items-center text-sm">
                                                    <span className="text-gray-500">{cgstLabel}</span>
                                                    <span className="font-medium text-gray-800">{formatCurrency(halfTax)}</span>
                                                </div>
                                            </React.Fragment>
                                        );
                                    })}
                                </div>
                            )}
                            <div className="flex justify-between items-center text-sm">
                                {!showDiscountInput ? (
                                    <>
                                        <Button
                                            variant="link"
                                            disabled={isLinked}
                                            onClick={!isLinked ? () => setShowDiscountInput(true) : undefined}
                                            className={`${isLinked ? 'text-gray-400 cursor-not-allowed p-0' : 'text-blue-600 cursor-pointer p-0 hover:underline'}`}
                                        >
                                            <Plus className="mr-1 h-4 w-4" /> Add Discount
                                        </Button>
                                        <span className="font-medium text-gray-800">- ₹ {formatCurrency(overallDiscountAmount)}</span>
                                    </>
                                ) : (
                                    <div className="w-full flex items-start gap-2">
                                        <div className="w-48">
                                            <Select value={discountOption} onValueChange={(v) => setDiscountOption(v as 'before-tax' | 'after-tax')}>
                                                <SelectTrigger className="h-9 w-full cursor-pointer">
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="before-tax">Discount Before Tax</SelectItem>
                                                    <SelectItem value="after-tax">Discount After Tax</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                        <div className="flex-1 grid grid-cols-2 gap-2">
                                            <div className="relative">
                                                <Input
                                                        type="number"
                                                        id="discount-amount-percent"
                                                        placeholder="0.00"
                                                        value={discountPercentStr}
                                                        readOnly={isLinked}
                                                        onChange={(e) => {
                                                            if (isLinked) return;
                                                            const v = e.target.value;
                                                            if (v === '' || v === '-') { setDiscountPercentStr(''); setLastDiscountInput('percent'); return; }
                                                            let n = parseFloat(v);
                                                            if (isNaN(n)) n = 0;
                                                            if (n < 0) n = 0;
                                                            if (n > 100) return; // ignore >100
                                                            const out = Number.isFinite(n) ? (n % 1 === 0 ? String(n) : String(Number(n.toFixed(2)))) : String(n);
                                                            setDiscountPercentStr(out);
                                                            setLastDiscountInput('percent');
                                                        }}
                                                        className={`pr-7 text-right h-9 w-full ${isLinked ? 'bg-gray-100 cursor-not-allowed' : ''}`}
                                                    />
                                                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none">%</span>
                                            </div>
                                            <div className="relative">
                                                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none">₹</span>
                                                <Input
                                                    type="number"
                                                    id="discount-amount-rupees"
                                                    placeholder="0.00"
                                                    value={discountFlatStr}
                                                    readOnly={isLinked}
                                                    onChange={(e) => {
                                                        if (isLinked) return;
                                                        const v = e.target.value;
                                                        if (v === '' || v === '-') { setDiscountFlatStr(''); setLastDiscountInput('flat'); return; }
                                                        let n = parseFloat(v);
                                                        if (isNaN(n)) n = 0;
                                                        if (n < 0) n = 0;
                                                        const cap = Number.isFinite(discountBase) ? discountBase : Infinity;
                                                        if (n > cap) return; // ignore >cap
                                                        setDiscountFlatStr(v);
                                                        setLastDiscountInput('flat');
                                                    }}
                                                    onBlur={() => {
                                                        if (discountFlatStr === '' || discountFlatStr === '-') return;
                                                        let n = parseFloat(discountFlatStr) || 0;
                                                        if (n < 0) n = 0;
                                                        const cap = Number.isFinite(discountBase) ? discountBase : n;
                                                        if (n > cap) n = cap;
                                                        setDiscountFlatStr(n > 0 ? n.toFixed(2) : '');
                                                    }}
                                                    className={`pl-6 text-right h-9 w-full ${isLinked ? 'bg-gray-100 cursor-not-allowed' : ''}`}
                                                />
                                            </div>
                                        </div>
                                        <Button
                                            variant="ghost" size="icon"
                                            disabled={isLinked}
                                            className={`h-9 w-9 p-1 text-gray-500 ${isLinked ? '' : 'hover:text-red-500'} rounded-full flex-shrink-0 ${isLinked ? 'cursor-not-allowed' : 'cursor-pointer'}`}
                                            onClick={!isLinked ? () => { setShowDiscountInput(false); setDiscountPercentStr(''); setDiscountFlatStr(''); setLastDiscountInput(null); } : undefined}
                                        >
                                            <X className="h-4 w-4" />
                                        </Button>
                                    </div>
                                )}
                            </div>
                            <div className="flex justify-between items-center text-sm">
                                <label htmlFor="autoRoundOff" className={`flex items-center gap-2 text-gray-600 ${isLinked ? 'cursor-not-allowed' : 'cursor-pointer'}`}>
                                    <Checkbox
                                        id="autoRoundOff"
                                        checked={autoRoundOff}
                                        disabled={isLinked}
                                        onChange={(e) => {
                                            if (isLinked) return;
                                            const checked = e.target.checked;
                                            setAutoRoundOff(checked);
                                            if (checked) {
                                                setCommittedAdjustment(0);
                                                setManualAdjustmentStr('');
                                                setAdjustmentType('add');
                                            }
                                        }}
                                    /> Auto Round Off
                                </label>
                                
                                {!autoRoundOff ? (
                                    <div className="flex items-center border rounded-md overflow-hidden bg-white">
                                        <Select value={adjustmentType} onValueChange={(v) => { if (!isLinked) setAdjustmentType(v as 'add' | 'subtract'); }}>
                                            <SelectTrigger className={`h-9 border-r bg-gray-50 px-2 text-xs text-gray-700 ${isLinked ? 'cursor-not-allowed pointer-events-none' : 'cursor-pointer'} w-auto`} aria-disabled={isLinked}>
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="add">+ Add</SelectItem>
                                                <SelectItem value="subtract">- Reduce</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        <div className="relative">
                                            <span className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-500 text-sm">₹</span>
                                            <Input 
                                                type="number"
                                                placeholder="0" 
                                                value={manualAdjustmentStr}
                                                readOnly={isLinked}
                                                onChange={(e) => {
                                                    if (isLinked) return;
                                                    const v = e.target.value;
                                                    setManualAdjustmentStr(v);
                                                    if (!autoRoundOff) {
                                                        setCommittedAdjustment(parseFloat(v) || 0);
                                                    } else {
                                                        setCommittedAdjustment(0);
                                                    }
                                                }}
                                                onBlur={(e) => { if (!isLinked) setCommittedAdjustment(parseFloat(e.target.value) || 0); }}
                                                className={`w-20 h-9 border-none pl-6 pr-2 text-right focus-visible:ring-0 ${isLinked ? 'bg-gray-100 cursor-not-allowed' : ''}`}
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
                                        readOnly={isLinked}
                                        onChange={(e) => {
                                            if (isLinked) return;
                                            const value = e.target.value;
                                            setTotalAmountStr(value);
                                            // If user types, it's a manual override. If they clear it, calculations take over again.
                                            setTotalAmountManuallySet(value !== ''); 
                                        }}
                                        className={`bg-gray-100 text-gray-800 font-semibold text-right pr-4 py-2 rounded-lg ${isLinked ? 'cursor-not-allowed' : ''}`}
                                    />
                                </div>
                            </div>
                            
                            <div className="flex justify-end items-center gap-2 mt-1">
                                <label htmlFor="fullyPaid" className={`text-sm text-gray-500 ${isLinked ? 'cursor-not-allowed' : 'cursor-pointer'}`}>Mark as fully paid</label>
                                <Checkbox id="fullyPaid" disabled={isLinked} className={`cursor-pointer ${isLinked ? 'cursor-not-allowed' : ''}`} checked={isFullyPaid} onChange={(e) => { if (!isLinked) handleFullyPaidChangeWithMode(e.target.checked); }} />
                            </div>

                            <div className="flex justify-between items-center text-sm">
                                <span className="text-gray-500">Amount Received</span>
                                <div className="flex items-center gap-1 w-72 bg-gray-100 rounded-md border border-gray-200 p-1">
                                    <span className="pl-2 text-gray-500 text-sm">₹</span>
                                    <Input 
                                        id="amountReceived" 
                                        type="number" 
                                        placeholder="0.00"
                                        value={amountReceivedStr} 
                                        readOnly={isLinked}
                                        onChange={(e) => {
                                            if (isLinked) return;
                                            setAmountReceivedStr(e.target.value);
                                            if (isFullyPaid) {
                                                setIsFullyPaid(false);
                                            }
                                        }}
                                        className={`flex-grow bg-transparent border-none text-right focus-visible:ring-0 h-7 p-0 text-sm font-medium ${isLinked ? 'cursor-not-allowed' : ''}`}
                                    />
                    <Select value={paymentMode} onValueChange={(v) => { if (isFullyPaid && !isLinked) setPaymentMode(v as any); }}>
                        <SelectTrigger
                            className={`h-7 rounded-md border-none px-2 text-sm focus:outline-none ${isFullyPaid && !isLinked ? 'bg-white text-gray-700 cursor-pointer' : 'bg-gray-100 text-gray-400 cursor-not-allowed pointer-events-none'}`}
                            aria-disabled={!(isFullyPaid && !isLinked)}
                            title={!(isFullyPaid && !isLinked) ? 'Enable "Mark as fully paid" and unlink to change payment status' : undefined}
                        >
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="unpaid">Unpaid</SelectItem>
                            <SelectItem value="cash">Cash</SelectItem>
                            <SelectItem value="upi">UPI</SelectItem>
                            <SelectItem value="card">Card</SelectItem>
                            <SelectItem value="netbanking">Netbanking</SelectItem>
                            <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
                            <SelectItem value="cheque">Cheque</SelectItem>
                            <SelectItem value="online">Online</SelectItem>
                        </SelectContent>
                    </Select>
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
                                    {invoiceSettings.showGST && gstNumber && (
                                        <p className="text-xs text-gray-600 mt-1">GSTIN: <span className="font-medium text-gray-800">{gstNumber}</span></p>
                                    )}
                                    <div className="ml-auto mt-4 h-25 w-45 border bg-white flex items-center justify-center overflow-hidden">
                                        {signatureUrl ? (
                                            // eslint-disable-next-line @next/next/no-img-element
                                            <img src={signatureUrl} alt="Signature" className="max-h-24 max-w-full object-contain" />
                                        ) : (
                                            <span className="text-gray-400 text-sm">No signature</span>
                                        )}
                                    </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default CreateSalesReturnInvoicePage;