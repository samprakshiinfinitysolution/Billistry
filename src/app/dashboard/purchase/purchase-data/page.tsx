'use client';

import axios from 'axios';
import Link from 'next/link';
import React, { useState, useRef, useEffect, useMemo } from 'react';
<<<<<<< HEAD
import { useRouter } from 'next/navigation';
=======
>>>>>>> ce21ec2fdc56a92ea043161788371f59da47de6b
import {
    BadgeIndianRupee,
    CalendarIcon,
    ChevronDown,
    ClipboardList,
    FileBarChart,
    ClipboardX,
    Search,
    ChevronLeft,
    ChevronRight,
    MoreVertical,
    Edit,
    Trash2,
} from 'lucide-react';

// Mock UI components
const Button = ({ children, ...props }: React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: string, size?: string }) => (
    <button
        {...props}
        className={`inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none ring-offset-background ${props.className}`}
    >
        {children}
    </button>
);

const Card = ({ children, ...props }: React.HTMLAttributes<HTMLDivElement>) => <div {...props}>{children}</div>;
const CardHeader = ({ children, ...props }: React.HTMLAttributes<HTMLDivElement>) => <div {...props}>{children}</div>;
const CardTitle = ({ children, ...props }: React.HTMLAttributes<HTMLHeadingElement>) => <h3 {...props}>{children}</h3>;
const CardContent = ({ children, ...props }: React.HTMLAttributes<HTMLDivElement>) => <div {...props}>{children}</div>;
const Input = (props: React.InputHTMLAttributes<HTMLInputElement>) => <input {...props} />;
const Table = ({ children, ...props }: React.HTMLAttributes<HTMLTableElement>) => <table className="w-full" {...props}>{children}</table>;
const TableHeader = ({ children, ...props }: React.HTMLAttributes<HTMLTableSectionElement>) => <thead {...props}>{children}</thead>;
const TableRow = ({ children, ...props }: React.HTMLAttributes<HTMLTableRowElement>) => <tr {...props}>{children}</tr>;
const TableHead = ({ children, ...props }: React.HTMLAttributes<HTMLTableCellElement>) => <th {...props}>{children}</th>;
const TableBody = ({ children, ...props }: React.HTMLAttributes<HTMLTableSectionElement>) => <tbody {...props}>{children}</tbody>;
<<<<<<< HEAD
const TableCell = ({ children, ...props }: any) => <td {...props}>{children}</td>;
=======
const TableCell = ({ children, ...props }: React.HTMLAttributes<HTMLTableCellElement>) => <td {...props}>{children}</td>;
>>>>>>> ce21ec2fdc56a92ea043161788371f59da47de6b
const DropdownMenu = ({ children, ...props }: React.HTMLAttributes<HTMLDivElement>) => <div className="relative inline-block text-left" {...props}>{children}</div>;
const DropdownMenuTrigger = ({ children }: { children: React.ReactNode }) => <div>{children}</div>;
const DropdownMenuContent = ({ children }: { children: React.ReactNode }) => <div className="origin-top-left absolute left-0 mt-2 w-80 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 focus:outline-none z-20 max-h-80 overflow-y-auto">{children}</div>;
const DropdownMenuItem = ({ children, className = '', ...props }: React.AnchorHTMLAttributes<HTMLAnchorElement>) => <a href="#" className={`block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 ${className}`} {...props}>{children}</a>;

// NEW: Advanced, Self-contained Calendar Component
const Calendar = ({ onSelectDate }: { onSelectDate: (date: Date) => void }) => {
    const [currentDate, setCurrentDate] = useState(new Date());

    const changeMonth = (e: React.ChangeEvent<HTMLSelectElement>) => {
        setCurrentDate(new Date(currentDate.getFullYear(), parseInt(e.target.value), 1));
    };

    const changeYear = (e: React.ChangeEvent<HTMLSelectElement>) => {
        setCurrentDate(new Date(parseInt(e.target.value), currentDate.getMonth(), 1));
    };

    const prevMonth = () => {
        setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
    };

    const nextMonth = () => {
        setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
    };

    const startOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
    const endOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
    const startDay = startOfMonth.getDay();
    const daysInMonth = endOfMonth.getDate();

    const days = Array.from({ length: startDay }, (_, i) => <div key={`empty-${i}`}></div>);
    for (let day = 1; day <= daysInMonth; day++) {
        const fullDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
        days.push(
            <div key={day} className="flex items-center justify-center">
                <button
                    onClick={() => onSelectDate(fullDate)}
                    className="w-full aspect-square rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 flex items-center justify-center"
                >
                    {day}
                </button>
            </div>
        );
    }

    const years = Array.from({ length: 21 }, (_, i) => currentDate.getFullYear() - 10 + i);
    const months = Array.from({ length: 12 }, (_, i) => new Date(0, i).toLocaleString('default', { month: 'long' }));

    return (
        <div className="bg-white dark:bg-gray-800 border rounded-lg shadow-lg p-3 w-64">
            <div className="flex justify-between items-center mb-3">
                <button onClick={prevMonth} className="p-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700"><ChevronLeft className="w-5 h-5" /></button>
                <div className="flex gap-2">
                    <select value={currentDate.getMonth()} onChange={changeMonth} className="p-1 border rounded-md text-sm bg-white dark:bg-gray-700 dark:border-gray-600">
                        {months.map((month, index) => <option key={month} value={index}>{month}</option>)}
                    </select>
                    <select value={currentDate.getFullYear()} onChange={changeYear} className="p-1 border rounded-md text-sm bg-white dark:bg-gray-700 dark:border-gray-600">
                        {years.map(year => <option key={year} value={year}>{year}</option>)}
                    </select>
                </div>
                <button onClick={nextMonth} className="p-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700"><ChevronRight className="w-5 h-5" /></button>
            </div>
            <div className="grid grid-cols-7 text-center text-xs text-gray-500 mb-2">
                <div>Su</div><div>Mo</div><div>Tu</div><div>We</div><div>Th</div><div>Fr</div><div>Sa</div>
            </div>
            <div className="grid grid-cols-7 gap-1 text-sm">
                {days}
            </div>
        </div>
    );
};

interface Purchase {
    _id: string;
<<<<<<< HEAD
    invoiceNo?: string;
    invoiceNumber?: number;
    date?: string | Date; // mapped from invoiceDate or createdAt
    dueDate?: string | Date;
    invoiceAmount?: number; // mapped from totalAmount
    totalAmount?: number;
    paymentStatus?: 'unpaid' | 'cash' | 'online' | string;
    billTo?: { name?: string } | string; // mapped from selectedParty
    isDeleted?: boolean;
=======
    invoiceNo: string;
    billTo: {
        name: string;
    };
    invoiceAmount: number;
    paymentStatus: 'unpaid' | 'cash' | 'online';
    date: string;
    dueDate?: string;
>>>>>>> ce21ec2fdc56a92ea043161788371f59da47de6b
}


interface StatCardProps {
    title: string;
    amount: string;
    icon: React.ReactNode;
    onPress: () => void;
    isSelected?: boolean;
}

const StatCard = ({ title, amount, icon, onPress, isSelected }: StatCardProps) => {
    const cardBg = isSelected
        ? "bg-violet-100/60 border border-violet-200 dark:bg-violet-900/20 dark:border-violet-800"
        : "bg-white border border-gray-200 dark:bg-gray-800 dark:border-gray-700";

    let titleColor = "";
    let iconColor = "";

    if (title === "Paid") {
        titleColor = "text-green-600";
        iconColor = "text-green-600";
    } else if (title === "Unpaid") {
        titleColor = "text-red-600";
        iconColor = "text-red-600";
    } else { // "Total Purchases"
        titleColor = isSelected ? "text-violet-800 dark:text-violet-300" : "";
        iconColor = isSelected ? "text-violet-600 dark:text-violet-400" : "";
    }

    return (
        <Card className={`rounded-lg shadow-sm relative ${cardBg} group`}>
            <button onClick={onPress} className="absolute inset-0 z-10 focus:outline-none rounded-lg" aria-label={`View ${title}`}>
                {/* This button is for accessibility and interaction, but is visually transparent */}
            </button>
            <CardHeader className="p-4">
                <CardTitle className={`flex items-center text-sm font-semibold ${titleColor}`}>
                    <div className={`mr-3 ${iconColor}`}>{icon}</div>
                    {title}
                </CardTitle>
            </CardHeader>
            <CardContent className="p-4 pt-0">
                <div className="text-3xl font-bold text-gray-900 dark:text-gray-50">₹ {amount}</div>
            </CardContent>
        </Card>
    );
};


const PurchaseDataPage = () => {
<<<<<<< HEAD
    const router = useRouter();
    const [purchases, setPurchases] = useState<Purchase[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [showArchived, setShowArchived] = useState(false);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [deletingId, setDeletingId] = useState<string | null>(null);
=======
    const [purchases, setPurchases] = useState<Purchase[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
>>>>>>> ce21ec2fdc56a92ea043161788371f59da47de6b
    const [selectedCard, setSelectedCard] = useState('Total Purchases');
    const [selectedDateRange, setSelectedDateRange] = useState('Last 365 Days');
    const [hoveredDateRange, setHoveredDateRange] = useState<string | null>(null);
    const [isDateDropdownOpen, setIsDateDropdownOpen] = useState(false);
    const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);
    const [customDate, setCustomDate] = useState<Date | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [openDropdownId, setOpenDropdownId] = useState<string | null>(null);

    const dropdownRefs = useRef<{ [key: string]: HTMLTableCellElement | null }>({});
    const datePickerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const fetchPurchases = async () => {
            setLoading(true);
            setError(null);
            try {
<<<<<<< HEAD
                const res = await axios.get('/api/new_purchase' + (showArchived ? '?includeDeleted=true' : ''), { withCredentials: true });
                const data = res.data;

                if (data.success) {
                    // Normalize server shape to UI-friendly fields
                    const normalized = (data.data || []).map((d: any) => {
                        const rawNum = (d.invoiceNumber !== undefined && d.invoiceNumber !== null) ? Number(d.invoiceNumber) : undefined;
                        // accept 0 as a valid stored sequence (will render as PUR-00000). We'll still ignore placeholder invoiceNo like PUR-00000
                        const invoiceNum = (typeof rawNum === 'number' && !isNaN(rawNum)) ? rawNum : undefined;
                        const rawInvoiceNo = d.invoiceNo ? String(d.invoiceNo).trim() : undefined;
                        // Ignore placeholder invoice strings like PUR-00000
                        const invoiceNoIsPlaceholder = rawInvoiceNo ? /^PUR-0+$/.test(rawInvoiceNo) : false;
                        const invoiceNoComputed = (!invoiceNoIsPlaceholder && rawInvoiceNo) ? rawInvoiceNo : (typeof invoiceNum === 'number' ? `PUR-${String(invoiceNum).padStart(5, '0')}` : undefined);
                        return {
                            _id: d._id,
                            invoiceNo: invoiceNoComputed,
                            invoiceNumber: invoiceNum,
                            date: d.invoiceDate || d.savedAt || d.createdAt,
                            dueDate: d.dueDate,
                            invoiceAmount: typeof d.totalAmount !== 'undefined' ? d.totalAmount : d.amount || 0,
                            totalAmount: d.totalAmount,
                            paymentStatus: d.paymentStatus || 'unpaid',
                            billTo: d.selectedParty || d.billTo || null,
                            isDeleted: Boolean(d.isDeleted),
                        } as Purchase;
                    });
                    setPurchases(normalized);
=======
                const res = await axios.get('/api/purchase', { withCredentials: true });
                const data = res.data;

                if (data.success) {
                    setPurchases(data.data || []);
>>>>>>> ce21ec2fdc56a92ea043161788371f59da47de6b
                } else {
                    throw new Error(data.error || 'Failed to fetch purchase data.');
                }
            } catch (err: any) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };
        fetchPurchases();
<<<<<<< HEAD
    }, [showArchived]);

    const { totalPurchases, paidAmount, unpaidAmount } = useMemo(() => {
        return purchases.reduce((acc, purchase) => {
            const amt = purchase.totalAmount || 0;
            acc.totalPurchases += amt;
            if (purchase.paymentStatus === 'unpaid') {
                acc.unpaidAmount += amt;
            } else {
                acc.paidAmount += amt;
=======
    }, []);

    const { totalPurchases, paidAmount, unpaidAmount } = useMemo(() => {
        return purchases.reduce((acc, purchase) => {
            acc.totalPurchases += purchase.invoiceAmount;
            if (purchase.paymentStatus === 'unpaid') {
                acc.unpaidAmount += purchase.invoiceAmount;
            } else {
                acc.paidAmount += purchase.invoiceAmount;
>>>>>>> ce21ec2fdc56a92ea043161788371f59da47de6b
            }
            return acc;
        }, { totalPurchases: 0, paidAmount: 0, unpaidAmount: 0 });
    }, [purchases]);

    const filteredPurchases = useMemo(() => {
        const getStartDate = (range: string): Date | null => {
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            switch (range) {
                case 'Today': return today;
                case 'Yesterday': const yesterday = new Date(today); yesterday.setDate(today.getDate() - 1); return yesterday;
                case 'This Week': const thisWeek = new Date(today); thisWeek.setDate(today.getDate() - today.getDay()); return thisWeek;
                case 'Last Week': const lastWeekEnd = new Date(today); lastWeekEnd.setDate(today.getDate() - today.getDay() - 1); const lastWeekStart = new Date(lastWeekEnd); lastWeekStart.setDate(lastWeekEnd.getDate() - 6); return lastWeekStart;
                case 'Last 7 Days': const last7 = new Date(today); last7.setDate(today.getDate() - 6); return last7;
                case 'This Month': return new Date(today.getFullYear(), today.getMonth(), 1);
                case 'Previous Month': return new Date(today.getFullYear(), today.getMonth() - 1, 1);
                case 'Last 30 Days': const last30 = new Date(today); last30.setDate(today.getDate() - 29); return last30;
                case 'This Quarter': const q = Math.floor(today.getMonth() / 3); return new Date(today.getFullYear(), q * 3, 1);
                case 'Previous Quarter': const pq = Math.floor(today.getMonth() / 3) - 1; const pqy = pq < 0 ? today.getFullYear() - 1 : today.getFullYear(); const pqsm = pq < 0 ? 9 : pq * 3; return new Date(pqy, pqsm, 1);
                case 'Current Fiscal Year': const fys = 3; return new Date(today.getMonth() >= fys ? today.getFullYear() : today.getFullYear() - 1, fys, 1);
                case 'Previous Fiscal Year': const pfys = 3; const pcY = today.getFullYear(); const psY = today.getMonth() >= pfys ? pcY : pcY - 1; return new Date(psY - 1, pfys, 1);
                case 'Last 365 Days': const last365 = new Date(today); last365.setDate(today.getDate() - 364); return last365;
                default: return null;
            }
        };

        let dateFilteredPurchases = purchases;

        if (selectedDateRange === 'Custom Date Range' && customDate) {
            dateFilteredPurchases = purchases.filter(purchase => {
<<<<<<< HEAD
                if (!purchase.date) return false;
                const purchaseDate = new Date(purchase.date as any);
=======
                const purchaseDate = new Date(purchase.date);
>>>>>>> ce21ec2fdc56a92ea043161788371f59da47de6b
                return purchaseDate.toDateString() === customDate.toDateString();
            });
        } else if (selectedDateRange !== 'All Time') {
            const startDate = getStartDate(selectedDateRange);
            if (startDate) {
<<<<<<< HEAD
                 dateFilteredPurchases = purchases.filter(purchase => {
                     if (!purchase.date) return false;
                     return new Date(purchase.date as any) >= startDate;
                 });
=======
                 dateFilteredPurchases = purchases.filter(purchase => new Date(purchase.date) >= startDate);
>>>>>>> ce21ec2fdc56a92ea043161788371f59da47de6b
            }
        }

        return dateFilteredPurchases.filter(purchase => {
            const matchesStatus =
                selectedCard === 'Total Purchases' ||
                (selectedCard === 'Paid' && (purchase.paymentStatus === 'cash' || purchase.paymentStatus === 'online')) ||
                (selectedCard === 'Unpaid' && purchase.paymentStatus === 'unpaid');

            if (!matchesStatus) return false;

            const lowercasedTerm = searchTerm.toLowerCase();
            if (lowercasedTerm === '') return true;

<<<<<<< HEAD
            const invoiceNoStr = (purchase.invoiceNo || '').toString().toLowerCase();
            const partyName = (typeof purchase.billTo === 'string') ? purchase.billTo : (purchase.billTo?.name || '');
            const partyNameStr = (partyName || '').toString().toLowerCase();
            const amountStr = typeof purchase.invoiceAmount === 'number' ? String(purchase.invoiceAmount) : String(purchase.totalAmount || '');
            return (
                invoiceNoStr.includes(lowercasedTerm) ||
                partyNameStr.includes(lowercasedTerm) ||
                amountStr.includes(lowercasedTerm)
=======
            return (
                (purchase.invoiceNo).toLowerCase().includes(lowercasedTerm) ||
                (purchase.billTo?.name || '').toLowerCase().includes(lowercasedTerm) ||
                String(purchase.invoiceAmount).includes(lowercasedTerm)
>>>>>>> ce21ec2fdc56a92ea043161788371f59da47de6b
            );
        });
    }, [purchases, selectedCard, searchTerm, selectedDateRange, customDate]);

    const formatDisplayCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-IN').format(amount);
    };

    const getFormattedDate = (date: Date): string => {
        const day = String(date.getDate()).padStart(2, '0');
        const month = date.toLocaleString('en-US', { month: 'short' });
        const year = date.getFullYear();
        return `${day} ${month} ${year}`;
    };

    const getFormattedDateRange = (key: string): string => {
        const today = new Date("2025-09-18T12:00:00Z");
        let startDate: Date;
        let endDate: Date;
        switch (key) {
            case 'Today': return `${getFormattedDate(today)} to ${getFormattedDate(today)}`;
            case 'Yesterday': startDate = new Date(today); startDate.setDate(today.getDate() - 1); return `${getFormattedDate(startDate)} to ${getFormattedDate(startDate)}`;
            case 'This Week': startDate = new Date(today); startDate.setDate(today.getDate() - today.getDay()); return `${getFormattedDate(startDate)} to ${getFormattedDate(today)}`;
            case 'Last Week': endDate = new Date(today); endDate.setDate(today.getDate() - today.getDay() - 1); startDate = new Date(endDate); startDate.setDate(endDate.getDate() - 6); return `${getFormattedDate(startDate)} to ${getFormattedDate(endDate)}`;
            case 'Last 7 days': startDate = new Date(today); startDate.setDate(today.getDate() - 6); return `${getFormattedDate(startDate)} to ${getFormattedDate(today)}`;
            case 'This Month': startDate = new Date(today.getFullYear(), today.getMonth(), 1); return `${getFormattedDate(startDate)} to ${getFormattedDate(today)}`;
            case 'Previous Month': endDate = new Date(today.getFullYear(), today.getMonth(), 0); startDate = new Date(endDate.getFullYear(), endDate.getMonth(), 1); return `${getFormattedDate(startDate)} to ${getFormattedDate(endDate)}`;
            case 'Last 30 Days': startDate = new Date(today); startDate.setDate(today.getDate() - 29); return `${getFormattedDate(startDate)} to ${getFormattedDate(today)}`;
            case 'This Quarter': const q = Math.floor(today.getMonth() / 3); startDate = new Date(today.getFullYear(), q * 3, 1); return `${getFormattedDate(startDate)} to ${getFormattedDate(today)}`;
            case 'Previous Quarter': const pq = Math.floor(today.getMonth() / 3) - 1; const pqy = pq < 0 ? today.getFullYear() - 1 : today.getFullYear(); const pqsm = pq < 0 ? 9 : pq * 3; startDate = new Date(pqy, pqsm, 1); endDate = new Date(pqy, pqsm + 3, 0); return `${getFormattedDate(startDate)} to ${getFormattedDate(endDate)}`;
            case 'Current Fiscal Year': const fys = 3; const cY = today.getFullYear(); const sY = today.getMonth() >= fys ? cY : cY - 1; startDate = new Date(sY, fys, 1); return `${getFormattedDate(startDate)} to ${getFormattedDate(today)}`;
            case 'Previous Fiscal Year': const pfys = 3; const pcY = today.getFullYear(); const psY = today.getMonth() >= pfys ? pcY : pcY - 1; endDate = new Date(psY, pfys, 0); startDate = new Date(psY - 1, pfys, 1); return `${getFormattedDate(startDate)} to ${getFormattedDate(endDate)}`;
            case 'Last 365 Days': startDate = new Date(today); startDate.setDate(today.getDate() - 364); return `${getFormattedDate(startDate)} to ${getFormattedDate(today)}`;
            case 'Custom Date Range': return '';
            default: return '';
        }
    };

    const dateRangeOptions = ['Today', 'Yesterday', 'This Week', 'Last Week', 'Last 7 days', 'This Month', 'Previous Month', 'Last 30 Days', 'This Quarter', 'Previous Quarter', 'Current Fiscal Year', 'Previous Fiscal Year', 'Last 365 Days', 'Custom Date Range'];

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (datePickerRef.current && !datePickerRef.current.contains(event.target as Node)) {
                setIsDateDropdownOpen(false);
                setIsDatePickerOpen(false);
            }
            if (openDropdownId && dropdownRefs.current[openDropdownId] && !dropdownRefs.current[openDropdownId]!.contains(event.target as Node)) {
                setOpenDropdownId(null);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [openDropdownId]);

<<<<<<< HEAD
    const handleDeleteClick = (id: string) => {
        setDeletingId(id);
        setShowDeleteConfirm(true);
        setOpenDropdownId(null);
    };

    const confirmDelete = async () => {
        if (!deletingId) return;
        try {
            await axios.delete(`/api/new_purchase/${deletingId}`, { withCredentials: true });
            setPurchases(prev => prev.filter(p => p._id !== deletingId));
        } catch (err: any) {
            alert(err?.response?.data?.error || err?.message || 'Failed to delete');
        } finally {
            setShowDeleteConfirm(false);
            setDeletingId(null);
        }
    };

    const restorePurchase = async (id: string) => {
        try {
            await axios.put(`/api/new_purchase/${id}`, { isDeleted: false }, { withCredentials: true });
            setPurchases(prev => prev.map(p => p._id === id ? { ...p, isDeleted: false } : p));
            setOpenDropdownId(null);
        } catch (err: any) { alert(err?.response?.data?.error || err?.message || 'Restore failed'); }
    };

=======
>>>>>>> ce21ec2fdc56a92ea043161788371f59da47de6b
    const handleDateButtonClick = () => {
        if (isDatePickerOpen) {
            setIsDatePickerOpen(false);
        } else {
            setIsDateDropdownOpen(!isDateDropdownOpen);
        }
    };

    return (
<<<<<<< HEAD
        <>
        {showDeleteConfirm && (
            <div 
                className={`fixed inset-0 bg-black/40 z-50 flex justify-center items-center p-4 transition-opacity duration-300 ${showDeleteConfirm ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
                onClick={() => setShowDeleteConfirm(false)}
            >
                <div className="relative bg-white rounded-lg shadow-xl p-6 w-full max-w-md" onClick={(e) => e.stopPropagation()}>
                    <h2 className="text-lg font-semibold text-gray-900">Are you sure you want to delete this Purchase Invoice?</h2>
                    <div className="mt-6 flex justify-end gap-3">
                        <Button
                            variant="outline"
                            className="bg-white border-gray-300 text-gray-700 hover:bg-gray-50 px-4 py-2"
                            onClick={() => setShowDeleteConfirm(false)}
                        >
                            Cancel
                        </Button>
                        <Button
                            className="bg-red-600 text-white hover:bg-red-700 px-4 py-2"
                            onClick={confirmDelete}
                        >
                            Yes, Delete
                        </Button>
                    </div>
                </div>
            </div>
        )}

=======
>>>>>>> ce21ec2fdc56a92ea043161788371f59da47de6b
        <div className="flex flex-col h-screen bg-gray-50 dark:bg-gray-900 p-6">
            <header className="flex items-center justify-between pb-4 border-b">
                <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100">Purchase Invoices</h1>
                <div className="flex items-center gap-2">
                    <DropdownMenu>
                        <DropdownMenuTrigger>
                            <Button variant="outline" className="bg-white border border-gray-300 text-gray-700 hover:bg-gray-100 px-4 py-2">
                                <FileBarChart className="h-4 w-4 mr-2" />
                                Reports
                                <ChevronDown className="h-4 w-4 ml-2" />
                            </Button>
                        </DropdownMenuTrigger>
                    </DropdownMenu>
                </div>
            </header>
            <main className="flex-1 py-6 space-y-6">
                <div className="grid gap-6 md:grid-cols-3">
                    <StatCard title="Total Purchases" amount={formatDisplayCurrency(totalPurchases)} icon={<ClipboardList className="h-5 w-5" />} onPress={() => setSelectedCard('Total Purchases')} isSelected={selectedCard === 'Total Purchases'} />
                    <StatCard title="Paid" amount={formatDisplayCurrency(paidAmount)} icon={<BadgeIndianRupee className="h-5 w-5" />} onPress={() => setSelectedCard('Paid')} isSelected={selectedCard === 'Paid'} />
                    <StatCard title="Unpaid" amount={formatDisplayCurrency(unpaidAmount)} icon={<BadgeIndianRupee className="h-5 w-5" />} onPress={() => setSelectedCard('Unpaid')} isSelected={selectedCard === 'Unpaid'} />
                </div>

                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                            <Input placeholder="Search by Invoice No, Party, Amount..." className="pl-10 pr-4 py-2 border rounded-md w-64 bg-white" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
                        </div>

                        <div ref={datePickerRef} className="relative">
                            <Button
                                variant="outline"
                                className="bg-white border border-gray-300 text-gray-700 hover:bg-gray-100 px-4 py-2 w-64"
                                onClick={handleDateButtonClick}
                            >
                                <div className="flex items-center justify-between w-full">
                                    <div className="flex items-center">
                                        <CalendarIcon className="h-4 w-4 mr-2" />
                                        <span>{customDate ? getFormattedDate(customDate) : selectedDateRange}</span>
                                    </div>
                                    <ChevronDown className={`h-4 w-4 transition-transform ${isDateDropdownOpen ? 'rotate-180' : ''}`} />
                                </div>
                            </Button>
                            {isDateDropdownOpen && (
                                <DropdownMenuContent>
                                    {dateRangeOptions.map((option) => (
                                        <DropdownMenuItem
                                            key={option}
                                            onClick={() => {
                                                if (option === 'Custom Date Range') {
                                                    setIsDatePickerOpen(true);
                                                    setIsDateDropdownOpen(false);
                                                } else {
                                                    setSelectedDateRange(option);
                                                    setCustomDate(null);
                                                    setIsDateDropdownOpen(false);
                                                }
                                            }}
                                            onMouseEnter={() => setHoveredDateRange(option)}
                                            onMouseLeave={() => setHoveredDateRange(null)}
                                            className="flex justify-between items-center"
                                        >
                                            <span>{option}</span>
                                            {hoveredDateRange === option && <span className="text-gray-500 text-xs ml-4">{getFormattedDateRange(option)}</span>}
                                        </DropdownMenuItem>
                                    ))}
                                </DropdownMenuContent>
                            )}
                            {isDatePickerOpen && (
                                <div className="absolute top-full mt-2 z-30">
                                    <Calendar onSelectDate={(date) => { setCustomDate(date); setSelectedDateRange('Custom Date Range'); setIsDatePickerOpen(false); }} />
                                </div>
                            )}
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <DropdownMenu>
                            <DropdownMenuTrigger>
                                <Button variant="outline" className="bg-white border border-gray-300 text-gray-700 hover:bg-gray-100 px-4 py-2">
                                    Bulk Actions
                                    <ChevronDown className="h-4 w-4 ml-2" />
                                </Button>
                            </DropdownMenuTrigger>
                        </DropdownMenu>
                        <Link href="/dashboard/purchase/purchase-invoice">
                            <Button className="bg-blue-600 text-white hover:bg-blue-700 px-4 py-2">
                                Create Purchase Invoice
                            </Button>
                        </Link>
                    </div>
                </div>

                <div className="border rounded-lg bg-white dark:bg-gray-800 dark:border-gray-700 shadow-sm">
                    <Table>
                        <TableHeader>
                            <TableRow className="border-b dark:border-gray-700">
                                <TableHead className="p-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</TableHead>
                                <TableHead className="p-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Invoice Number</TableHead>
                                <TableHead className="p-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Party Name</TableHead>
                                <TableHead className="p-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Due In</TableHead>
                                <TableHead className="p-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</TableHead>
                                <TableHead className="p-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</TableHead>
                                <TableHead className="p-4 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>{
                            loading ? (
                                <TableRow><TableCell colSpan={7} className="text-center py-20">Loading...</TableCell></TableRow>
                            ) : error ? (
                                <TableRow><TableCell colSpan={7} className="text-center py-20 text-red-500">{error}</TableCell></TableRow>
                            ) : purchases.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={7} className="text-center py-20">
                                        <div className="flex flex-col items-center gap-4">
                                            <ClipboardX className="h-16 w-16 text-gray-300 dark:text-gray-600" strokeWidth={1} />
                                            <p className="text-gray-500 dark:text-gray-400">No purchase invoices found.</p>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ) : (
                                filteredPurchases.map(purchase => (
                                    <TableRow key={purchase._id} className="border-b dark:border-gray-700">
<<<<<<< HEAD
                                        <TableCell className="p-4">{purchase.date ? new Date(purchase.date as any).toLocaleDateString() : 'N/A'}</TableCell>
                                        <TableCell className="p-4">{purchase.invoiceNo ?? (purchase.invoiceNumber !== undefined && purchase.invoiceNumber !== null ? `PUR-${String(purchase.invoiceNumber).padStart(5,'0')}` : 'N/A')}</TableCell>
                                        <TableCell className="p-4">{(typeof purchase.billTo === 'string') ? purchase.billTo : (purchase.billTo?.name || 'N/A')}</TableCell>
                                        <TableCell className="p-4">{purchase.dueDate ? new Date(purchase.dueDate as any).toLocaleDateString() : 'N/A'}</TableCell>
                                        <TableCell className="p-4">₹{formatDisplayCurrency(purchase.invoiceAmount || purchase.totalAmount || 0)}</TableCell>
=======
                                        <TableCell className="p-4">{new Date(purchase.date).toLocaleDateString()}</TableCell>
                                        <TableCell className="p-4">{purchase.invoiceNo}</TableCell>
                                        <TableCell className="p-4">{purchase.billTo?.name || 'N/A'}</TableCell>
                                        <TableCell className="p-4">{purchase.dueDate ? new Date(purchase.dueDate).toLocaleDateString() : 'N/A'}</TableCell>
                                        <TableCell className="p-4">₹{formatDisplayCurrency(purchase.invoiceAmount)}</TableCell>
>>>>>>> ce21ec2fdc56a92ea043161788371f59da47de6b
                                        <TableCell className="p-4">
                                            <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                                                purchase.paymentStatus === 'unpaid' ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'
                                            }`}>
<<<<<<< HEAD
                                                {(purchase.paymentStatus || 'unpaid').charAt(0).toUpperCase() + (purchase.paymentStatus || 'unpaid').slice(1)}
                                            </span>
                                        </TableCell>
                                        <td ref={el => { dropdownRefs.current[purchase._id] = el as any; }} className="p-4 text-right relative">
=======
                                                {purchase.paymentStatus.charAt(0).toUpperCase() + purchase.paymentStatus.slice(1)}
                                            </span>
                                        </TableCell>
                                        <TableCell ref={el => dropdownRefs.current[purchase._id] = el} className="p-4 text-right relative">
>>>>>>> ce21ec2fdc56a92ea043161788371f59da47de6b
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="h-8 w-8"
                                                onClick={() => setOpenDropdownId(openDropdownId === purchase._id ? null : purchase._id)}
                                            >
                                                <MoreVertical className="h-4 w-4" />
                                            </Button>
                                            {openDropdownId === purchase._id && (
                                                <div className="absolute right-0 mt-2 w-32 bg-white border rounded-md shadow-lg z-10">
<<<<<<< HEAD
                                                        <button
                                                            className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center"
                                                            onClick={() => { setOpenDropdownId(null); router.push(`/dashboard/purchase/purchase-invoice?editId=${purchase._id}`); }}
                                                        >
                                                            <Edit className="h-4 w-4 mr-2" /> Edit
                                                        </button>
                                                        <button
                                                            className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100 flex items-center"
                                                            onClick={() => { handleDeleteClick(purchase._id); }}
                                                        >
                                                            <Trash2 className="h-4 w-4 mr-2" /> Delete
                                                        </button>
                                                </div>
                                            )}
                                        </td>
=======
                                                    <button className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center">
                                                        <Edit className="h-4 w-4 mr-2" /> Edit
                                                    </button>
                                                    <button className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100 flex items-center">
                                                        <Trash2 className="h-4 w-4 mr-2" /> Delete
                                                    </button>
                                                </div>
                                            )}
                                        </TableCell>
>>>>>>> ce21ec2fdc56a92ea043161788371f59da47de6b
                                    </TableRow>
                                ))
                            )
                        }</TableBody>
                    </Table>
                </div>
            </main>
        </div>
<<<<<<< HEAD
        </>
=======
>>>>>>> ce21ec2fdc56a92ea043161788371f59da47de6b
    );
};

export default PurchaseDataPage;