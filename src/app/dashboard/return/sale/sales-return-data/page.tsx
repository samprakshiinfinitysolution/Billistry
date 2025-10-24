'use client';

import Link from 'next/link';
import axios from 'axios';
import React, { useState, useRef, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
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
import useAuthGuard from '@/hooks/useAuthGuard';
import { toast } from 'react-hot-toast';

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
const TableCell = ({ children, ...props }: React.HTMLAttributes<HTMLTableCellElement>) => <td {...props}>{children}</td>;
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

    if (title === "Paid" || title === "Refunded") {
        titleColor = "text-green-600";
        iconColor = "text-green-600";
    } else if (title === "Unpaid") {
        titleColor = "text-red-600";
        iconColor = "text-red-600";
    } else { // "Total Returns"
        titleColor = isSelected ? "text-violet-800 dark:text-violet-300" : "";
        iconColor = isSelected ? "text-violet-600 dark:text-violet-400" : "";
    }

    return (
        <Card className={`rounded-lg shadow-sm relative ${cardBg} group`}>
            <button onClick={onPress} className="absolute inset-0 z-10 focus:outline-none rounded-lg" aria-label={`View ${title}`}>
                {/* This button is for accessibility and interaction, but is visually transparent */}
            </button>
            <CardHeader className="p-3">
                <CardTitle className={`flex items-center text-sm font-semibold ${titleColor}`}>
                    <div className={`mr-3 ${iconColor}`}>{icon}</div>
                    {title}
                </CardTitle>
            </CardHeader>
            <CardContent className="p-3 pt-0">
                <div className="text-2xl font-bold text-gray-900 dark:text-gray-50">₹ {amount}</div>
            </CardContent>
        </Card>
    );
};


const SalesReturnDataPage = () => {
    const { user } = useAuthGuard();
    const router = useRouter();
    const [selectedCard, setSelectedCard] = useState('Total Returns');
    const [returnsList, setReturnsList] = useState<any[]>([]);
    const [isLoadingReturns, setIsLoadingReturns] = useState(false);

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-IN', { style: 'decimal', minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(amount || 0);
    };

    const totals = useMemo(() => {
        const totalReturns = returnsList.reduce((s, r) => s + Number(r.totalAmount || 0), 0);
        const unpaid = returnsList.reduce((s, r) => s + Number(r.balanceAmount || 0), 0);
        const refunded = returnsList.reduce((s, r) => {
            const balance = Number(r.balanceAmount || 0);
            if (balance === 0) return s + Number(r.amountRefunded || r.totalAmount || 0);
            return s;
        }, 0);
        return { totalReturns, unpaid, refunded };
    }, [returnsList]);
    const [selectedDateRange, setSelectedDateRange] = useState('Last 365 Days');
    const [hoveredDateRange, setHoveredDateRange] = useState<string | null>(null);
    const [isDateDropdownOpen, setIsDateDropdownOpen] = useState(false);
    const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);
    const [customDate, setCustomDate] = useState<Date | null>(null);
    const datePickerRef = useRef<HTMLDivElement>(null);
    const dropdownRefs = useRef<{ [key: string]: HTMLTableCellElement | null }>({});
    const [openDropdownId, setOpenDropdownId] = useState<string | null>(null);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [deletingId, setDeletingId] = useState<string | null>(null);

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
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (openDropdownId && dropdownRefs.current[openDropdownId] && !dropdownRefs.current[openDropdownId]!.contains(event.target as Node)) {
                setOpenDropdownId(null);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [openDropdownId]);

    const handleDeleteClick = (id: string) => {
        setDeletingId(id);
        setShowDeleteConfirm(true);
        setOpenDropdownId(null);
    };

    const confirmDelete = async () => {
        if (!deletingId) return;
        try {
            await axios.delete(`/api/new_sale_return/${deletingId}`, { withCredentials: true });
            setReturnsList(prev => prev.filter(r => r._id !== deletingId));
        } catch (err: any) {
            alert(err?.response?.data?.error || err?.message || 'Failed to delete');
        } finally {
            setShowDeleteConfirm(false);
            setDeletingId(null);
        }
    };

    // Fetch sales returns for the business
    useEffect(() => {
        let mounted = true;
        const fetchReturns = async () => {
            setIsLoadingReturns(true);
            try {
                const res = await fetch('/api/new_sale_return', { credentials: 'include' });
                const body = await res.json().catch(() => null);
                if (mounted && body && body.success && Array.isArray(body.data)) {
                    setReturnsList(body.data);
                }
            } catch (e) {
                console.error('Failed to fetch sales returns', e);
            } finally {
                if (mounted) setIsLoadingReturns(false);
            }
        };
        fetchReturns();
        return () => { mounted = false; };
    }, []);

    // UI state for search and card filtering
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCardLocal, setSelectedCardLocal] = useState(selectedCard);

    const filteredReturns = useMemo(() => {
        const getStartDate = (range: string): Date | null => {
            const today = new Date();
            today.setHours(0,0,0,0);
            switch (range) {
                case 'Today': return today;
                case 'Yesterday': const yesterday = new Date(today); yesterday.setDate(today.getDate() - 1); return yesterday;
                case 'This Week': const thisWeek = new Date(today); thisWeek.setDate(today.getDate() - today.getDay()); return thisWeek;
                case 'Last Week': const lastWeekEnd = new Date(today); lastWeekEnd.setDate(today.getDate() - today.getDay() - 1); const lastWeekStart = new Date(lastWeekEnd); lastWeekStart.setDate(lastWeekEnd.getDate() - 6); return lastWeekStart;
                case 'Last 7 days': const last7 = new Date(today); last7.setDate(today.getDate() - 6); return last7;
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

        let items = returnsList.slice();

        // date filtering
        if (selectedDateRange === 'Custom Date Range' && customDate) {
            items = items.filter(r => {
                const d = r.returnDate ? new Date(r.returnDate) : (r.savedAt ? new Date(r.savedAt) : new Date(r.createdAt));
                return d.toDateString() === customDate.toDateString();
            });
        } else if (selectedDateRange !== 'All Time') {
            const start = getStartDate(selectedDateRange);
            if (start) items = items.filter(r => {
                const d = r.returnDate ? new Date(r.returnDate) : (r.savedAt ? new Date(r.savedAt) : new Date(r.createdAt));
                return d >= start;
            });
        }

        // card filter
        items = items.filter(r => {
            if (selectedCardLocal === 'Total Returns') return true;
            const balance = Number(r.balanceAmount || 0);
            if (selectedCardLocal === 'Paid') return balance === 0;
            if (selectedCardLocal === 'Unpaid') return balance !== 0;
            return true;
        });

        // search
        if (searchTerm && searchTerm.trim() !== '') {
            const term = searchTerm.toLowerCase();
            items = items.filter(r => {
                const no = (r.returnInvoiceNo || r.returnInvoiceNumber || '').toString().toLowerCase();
                const party = (r.selectedParty?.name || r.selectedParty?.partyName || '').toString().toLowerCase();
                const amt = String(r.totalAmount || r.amountRefunded || '');
                return no.includes(term) || party.includes(term) || amt.includes(term);
            });
        }

        return items;
    }, [returnsList, selectedDateRange, customDate, selectedCardLocal, searchTerm]);

    const handleDateButtonClick = () => {
        if (isDatePickerOpen) {
            setIsDatePickerOpen(false);
        } else {
            setIsDateDropdownOpen(!isDateDropdownOpen);
        }
    };

    return (
    <div className="flex flex-col h-screen bg-gray-50 dark:bg-gray-900 p-4">
            <header className="flex items-center justify-between pb-4 border-b">
        <h1 className="text-xl font-bold text-gray-800 dark:text-gray-100">Sales Returns</h1>
                <div className="flex items-center gap-2">
                    <DropdownMenu>
                        <DropdownMenuTrigger>
                            <Link href="/dashboard/reports/sales/SalesReturn">
                            <Button variant="outline" className="bg-white border border-gray-300 text-gray-700 hover:bg-gray-100 px-3 py-1.5">
                                <FileBarChart className="h-4 w-4 mr-2" />
                                Reports
                                <ChevronDown className="h-4 w-4 ml-2" />
                            </Button>
                            </Link>
                        </DropdownMenuTrigger>
                    </DropdownMenu>
                </div>
            </header>
            <main className="flex-1 pt-4 space-y-4 flex flex-col overflow-hidden">
                <div className="grid gap-6 md:grid-cols-3">
                    <StatCard title="Total Returns" amount={formatCurrency(totals.totalReturns)} icon={<ClipboardList className="h-5 w-5" />} onPress={() => setSelectedCardLocal('Total Returns')} isSelected={selectedCardLocal === 'Total Returns'} />
                    <StatCard title="Refunded" amount={formatCurrency(totals.refunded)} icon={<BadgeIndianRupee className="h-5 w-5" />} onPress={() => setSelectedCardLocal('Paid')} isSelected={selectedCardLocal === 'Paid'} />
                    <StatCard title="Unpaid" amount={formatCurrency(totals.unpaid)} icon={<BadgeIndianRupee className="h-5 w-5" />} onPress={() => setSelectedCardLocal('Unpaid')} isSelected={selectedCardLocal === 'Unpaid'} />
                </div>

                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                            <Input placeholder="Search..." className="pl-10 pr-4 py-1.5 border rounded-md w-64 bg-white" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
                        </div>

                        <div ref={datePickerRef} className="relative">
                            <Button
                                variant="outline"
                                className="bg-white border border-gray-300 text-gray-700 hover:bg-gray-100 px-3 py-1.5 w-64"
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
                                    <Button variant="outline" className="bg-white border border-gray-300 text-gray-700 hover:bg-gray-100 px-3 py-1.5">
                                        Bulk Actions
                                        <ChevronDown className="h-4 w-4 ml-2" />
                                    </Button>
                                </DropdownMenuTrigger>
                            </DropdownMenu>
                        <Link href="/dashboard/return/sale/sales-return-invoice">
                            <Button className="bg-blue-600 text-white hover:bg-blue-700 px-3 py-1.5">
                                Create Sales Return
                            </Button>
                        </Link>
                    </div>
                </div>

                <div className="border rounded-lg bg-white dark:bg-gray-800 dark:border-gray-700 shadow-sm flex-1 overflow-y-auto">
                    <Table>
                        <TableHeader>
                            <TableRow className="border-b dark:border-gray-700 sticky top-0 bg-white dark:bg-gray-800 z-10">
                                <TableHead className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</TableHead>
                                <TableHead className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Return No.</TableHead>
                                <TableHead className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Party Name</TableHead>
                                <TableHead className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Due In</TableHead>
                                <TableHead className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</TableHead>
                                <TableHead className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</TableHead>
                                <TableHead className="px-3 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {isLoadingReturns ? (
                                <TableRow>
                                    <td colSpan={7} className="text-center py-20">
                                        <div>Loading...</div>
                                    </td>
                                </TableRow>
                            ) : returnsList.length === 0 ? (
                                <TableRow>
                                    <td colSpan={7} className="text-center py-20">
                                        <div className="flex flex-col items-center gap-4">
                                            <ClipboardX className="h-16 w-16 text-gray-300 dark:text-gray-600" strokeWidth={1} />
                                            <p className="text-gray-500 dark:text-gray-400">No Transactions Matching the current filter</p>
                                        </div>
                                    </td>
                                </TableRow>
                            ) : (
                                filteredReturns.map((r) => {
                                    const date = r.returnDate ? new Date(r.returnDate) : (r.savedAt ? new Date(r.savedAt) : new Date(r.createdAt));
                                    const today = new Date();
                                    // compute days difference (due in)
                                    const diffMs = Math.floor((date.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
                                    const dueIn = diffMs >= 0 ? `${diffMs} days` : `Overdue ${Math.abs(diffMs)} days`;

                                    // status logic for sale returns: use amountRefunded and balanceAmount
                                    const total = Number(r.totalAmount || 0);
                                    const refunded = Number(r.amountRefunded || 0);
                                    const balance = Number(r.balanceAmount || 0);
                                    let status = 'Unpaid';
                                    if (balance === 0) status = 'Refunded';
                                    else if (refunded > 0) status = 'Partially Refunded';

                                    const statusColor = status === 'Refunded' ? 'text-green-700 bg-green-100' : status === 'Partially Refunded' ? 'text-yellow-700 bg-yellow-100' : 'text-red-700 bg-red-100';

                                    const idOrNo = r._id || r.returnInvoiceNo || r.returnInvoiceNumber;
                                        return (
                                        <TableRow key={r._id} className="border-b hover:bg-gray-50 cursor-pointer text-sm" onClick={() => router.push(`/dashboard/return/sale/sales-return-invoice/${encodeURIComponent(String(r._id))}`)}>
                                            <td className="px-3 py-2">{date.toLocaleDateString()}</td>
                                            <td className="px-3 py-2">{r.returnInvoiceNumber ? `#${r.returnInvoiceNumber}` : (r.returnInvoiceNo || 'N/A')}</td>
                                            <td className="px-3 py-2">{r.selectedParty?.name || r.selectedParty?.partyName || ''}</td>
                                            <td className="px-3 py-2">{dueIn}</td>
                                            <td className="px-3 py-2">₹ {total.toFixed(2)}</td>
                                            <td className="px-3 py-2"><span className={`px-2 py-1 rounded text-xs font-medium ${statusColor}`}>{status}</span></td>
                                            <td ref={(el) => { dropdownRefs.current[r._id] = el; }} className="px-3 py-2 text-right relative">
                                                <Button variant="ghost" size="icon" className="h-8 w-8 rounded-md hover:bg-gray-200 dark:hover:bg-gray-700" onClick={(e) => { e.stopPropagation(); setOpenDropdownId(openDropdownId === r._id ? null : r._id); }}>
                                                    <MoreVertical className="h-4 w-4" />
                                                </Button>
                                                {openDropdownId === r._id && (
                                                    <div className="absolute right-0 mt-2 w-40 bg-white border rounded-md shadow-lg z-10">
                                                        <button className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center" onClick={(e) => {
                                                            e.stopPropagation();
                                                            if (user?.permissions?.salesReturn?.update) {
                                                                setOpenDropdownId(null);
                                                                router.push(`/dashboard/return/sale/sales-return-invoice?editId=${r._id}`);
                                                            } else {
                                                                toast.error("You don't have permission to edit sales returns.");
                                                            }
                                                        }}><Edit className="h-4 w-4 mr-2"/> Edit</button>
                                                        <button className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100 flex items-center" onClick={(e) => {
                                                            e.stopPropagation();
                                                            if (user?.permissions?.salesReturn?.delete) {
                                                                handleDeleteClick(r._id);
                                                            } else {
                                                                toast.error("You don't have permission to delete sales returns.");
                                                            }
                                                        }}><Trash2 className="h-4 w-4 mr-2"/> Delete</button>
                                                    </div>
                                                )}
                                            </td>
                                        </TableRow>
                                    );
                                })
                            )}
                        </TableBody>
                    </Table>
                </div>
                {showDeleteConfirm && (
                    <div className={`fixed inset-0 bg-black/40 z-50 flex justify-center items-center p-4`} onClick={() => setShowDeleteConfirm(false)}>
                        <div className="relative bg-white rounded-lg shadow-xl p-6 w-full max-w-md" onClick={(e) => e.stopPropagation()}>
                            <h2 className="text-lg font-semibold text-gray-900">Are you sure you want to delete this Sales Return?</h2>
                            <div className="mt-6 flex justify-end gap-3">
                                <Button variant="outline" className="bg-white border-gray-300 text-gray-700 hover:bg-gray-50 px-4 py-2" onClick={() => setShowDeleteConfirm(false)}>Cancel</Button>
                                <Button className="bg-red-600 text-white hover:bg-red-700 px-4 py-2" onClick={confirmDelete}>Yes, Delete</Button>
                            </div>
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
};

export default SalesReturnDataPage;