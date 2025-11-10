"use client";

import React, { useState, useRef, useEffect } from 'react';
import { Search, Settings, FileText, Calendar as CalendarIcon, ChevronDown } from 'lucide-react';

export default function PaymentInPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDateRange, setSelectedDateRange] = useState('Last 365 Days');
  const [isDateDropdownOpen, setIsDateDropdownOpen] = useState(false);
  const [hoveredDateRange, setHoveredDateRange] = useState<string | null>(null);
  const datePickerRef = useRef<HTMLDivElement | null>(null);

  const dateRangeOptions = ['Today', 'Yesterday', 'This Week', 'Last Week', 'Last 7 Days', 'This Month', 'Previous Month', 'Last 30 Days', 'This Quarter', 'Previous Quarter', 'Current Fiscal Year', 'Previous Fiscal Year', 'Last 365 Days', 'Custom Date Range'];

  const getFormattedDate = (date: Date) => {
    const day = String(date.getDate()).padStart(2, '0');
    const month = date.toLocaleString('en-US', { month: 'short' });
    const year = date.getFullYear();
    return `${day} ${month} ${year}`;
  };

  const getFormattedDateRange = (key: string) => {
    const today = new Date();
    let startDate: Date;
    let endDate: Date;
    switch (key) {
      case 'Today': return `${getFormattedDate(today)} to ${getFormattedDate(today)}`;
      case 'Yesterday': startDate = new Date(today); startDate.setDate(today.getDate() - 1); return `${getFormattedDate(startDate)} to ${getFormattedDate(startDate)}`;
      case 'This Week': startDate = new Date(today); startDate.setDate(today.getDate() - today.getDay()); return `${getFormattedDate(startDate)} to ${getFormattedDate(today)}`;
      case 'Last Week': endDate = new Date(today); endDate.setDate(today.getDate() - today.getDay() - 1); startDate = new Date(endDate); startDate.setDate(endDate.getDate() - 6); return `${getFormattedDate(startDate)} to ${getFormattedDate(endDate)}`;
      case 'Last 7 Days': startDate = new Date(today); startDate.setDate(today.getDate() - 6); return `${getFormattedDate(startDate)} to ${getFormattedDate(today)}`;
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

  useEffect(() => {
    const onDoc = (e: MouseEvent) => {
      if (datePickerRef.current && !datePickerRef.current.contains(e.target as Node)) {
        setIsDateDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', onDoc);
    return () => document.removeEventListener('mousedown', onDoc);
  }, []);

  const handleDateButtonClick = () => setIsDateDropdownOpen((s) => !s);

  return (
    <div className="flex flex-col h-screen bg-gray-50 dark:bg-gray-900 p-4">
      <header className="flex items-center justify-between pb-3 border-b">
        <h1 className="text-xl font-bold text-gray-800">Payment In</h1>
        <div className="flex items-center gap-2">
          <button className="p-2 rounded-md bg-white border border-gray-300 hover:bg-gray-50 cursor-pointer" aria-label="Settings">
            <Settings className="w-4 h-4 text-gray-600" />
          </button>
        </div>
      </header>

      <main className="flex-1 pt-4 overflow-auto">
        <div className="bg-white rounded-md p-4 shadow-sm">
          <div className="mb-4">
            <div className="flex items-center justify-between">
              <nav className="flex items-center gap-4">
                <button className="text-sm text-purple-600 font-medium border-b-2 border-purple-600 pb-2">Payment Received</button>
              </nav>

              <div className="flex items-center gap-3">
                <button className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 cursor-pointer">Create Payment In</button>
              </div>
            </div>

            {/* Search and date selector in a single row before the data table */}
            <div className="mt-3 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div className="flex items-center gap-3 w-full sm:w-[520px]">
                <div className="relative flex-1">
                  <input value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} placeholder="Search payments or parties" className="w-full border rounded-md px-3 py-2 pl-10 text-sm" />
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                </div>

                <div className="relative" ref={datePickerRef}>
                  <button onClick={handleDateButtonClick} className="bg-white border border-gray-300 text-gray-700 hover:bg-gray-100 px-3 py-1.5 w-64 rounded-md text-sm flex items-center justify-between cursor-pointer">
                    <div className="flex items-center">
                      <CalendarIcon className="w-4 h-4 mr-2 text-gray-600" />
                      <span className="truncate">{selectedDateRange}</span>
                    </div>
                    <ChevronDown className={`w-4 h-4 transition-transform ${isDateDropdownOpen ? 'rotate-180' : ''}`} />
                  </button>

                  {isDateDropdownOpen && (
                    <div className="origin-top-left absolute left-0 mt-2 w-80 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 focus:outline-none z-20 max-h-80 overflow-y-auto">
                      {dateRangeOptions.map(option => (
                        <button
                          key={option}
                          onMouseEnter={() => setHoveredDateRange(option)}
                          onMouseLeave={() => setHoveredDateRange(null)}
                          onClick={() => { setSelectedDateRange(option); setIsDateDropdownOpen(false); }}
                          className="w-full text-left px-4 py-2 text-sm hover:bg-gray-50 flex justify-between items-center"
                        >
                          <span>{option}</span>
                          {hoveredDateRange === option && (
                            <span className="text-gray-500 text-xs ml-4">{getFormattedDateRange(option)}</span>
                          )}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* placeholder for any right-side controls on the same row if needed */}
              <div className="flex items-center gap-2">
                {/* kept empty intentionally */}
              </div>
            </div>
          </div>

          <div className="border rounded-md overflow-hidden">
            <div className="grid grid-cols-4 gap-4 bg-gray-50 text-sm text-gray-600 px-4 py-3">
              <div className="font-medium">Date</div>
              <div className="font-medium">Payment Number</div>
              <div className="font-medium">Party Name</div>
              <div className="font-medium">Amount</div>
            </div>

            <div className="h-64 flex items-center justify-center">
              <div className="text-center text-gray-400">
                <div className="flex items-center justify-center mb-3">
                  <FileText className="w-12 h-12" />
                </div>
                <div className="text-sm">No Transactions Matching the current filter</div>
              </div>
            </div>
          </div>

        </div>
      </main>
    </div>
  );
}
