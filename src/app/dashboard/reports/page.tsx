

"use client";

import Link from "next/link";
import React, { useState, useMemo } from 'react';
import { ChartBar, FileText, Box, Search, Filter } from "lucide-react";

const reportSections = [
  // {
  //   title: "Customer Reports",
  //   links: [
  //     { name: "Customer Transaction Report", href: "/dashboard/reports/customers/transaction" },
  //     { name: "Customer List", href: "/dashboard/reports/customers/list" },
  //   ],
  // },
  // {
  //   title: "Supplier Reports",
  //   links: [
  //     { name: "Supplier Transaction Report", href: "/dashboard/reports/suppliers/transaction" },
  //     { name: "Supplier List", href: "/dashboard/reports/suppliers/list" },
  //   ],
  // },
  {
    title: "Bills Reports",
    links: [
      { name: "Sales Summary", href: "/dashboard/reports/sales/SalesSummary" },
      { name: "Purchase Summary", href: "/dashboard/reports/purchase/PurchaseSummary" },
      { name: "Stock Summary", href: "/dashboard/reports/inventory/stock-summary" },
      { name: "Low Stock Summary", href: "/dashboard/reports/inventory/low-stock" },
      { name: "Sales Return", href: "/dashboard/reports/sales/SalesReturn" },
      { name: "Purchase Return", href: "/dashboard/reports/purchase/PurchaseReturn" },
      { name: "Expense Report", href: "/dashboard/reports/expense" },
      { name: "Parties Report", href: "/dashboard/reports/parties-report" },
      { name: "Cashbook Report", href: "/dashboard/reports/cashbook-report" },

      // { name: "Cashbook Report", href: "/dashboard/reports/bills/cashbook" },
    ],
  },
  // {
  //   title: "Inventory Reports",
  //   links: [
  //     { name: "Stock Summary", href: "/dashboard/reports/inventory/stock-summary" },
  //     { name: "Low Stock Summary", href: "/dashboard/reports/inventory/low-stock" },
  //     { name: "Profit & Loss Report", href: "/dashboard/reports/inventory/profit-loss" },
  //   ],
  // },
  // {
  //   title: "Daywise Reports",
  //   links: [
  //     { name: "Sales Daywise Report", href: "/dashboard/reports/daywise/sales" },
  //     { name: "Purchase Daywise Report", href: "/dashboard/reports/daywise/purchase" },
  //   ],
  // },
];

export default function ReportsPage() {
  const [query, setQuery] = useState('');

  const allLinks = reportSections.flatMap(s => s.links.map(l => ({...l, section: s.title})));

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return allLinks.filter(l => !q || l.name.toLowerCase().includes(q));
  }, [query, allLinks]);

  // Stat cards similar to sales page
  const statItems = [
    { title: 'Total Reports', amount: String(allLinks.length), color: 'bg-blue-50', icon: <ChartBar className="w-5 h-5 text-blue-600" /> },
    { title: 'Export Types', amount: 'PDF • XLSX • CSV', color: 'bg-green-50', icon: <FileText className="w-5 h-5 text-green-600" /> },
  ];

  return (
    <div className="flex flex-col h-screen bg-gray-50 dark:bg-gray-900 p-4">
      <header className="flex items-center justify-between pb-4 border-b">
        <h1 className="text-xl font-bold text-gray-800">Reports</h1>

        {/* header actions removed per request */}
      </header>

  <main className="flex-1 pt-4 space-y-4 flex flex-col overflow-hidden">

  <section className="mb-6">
  <div className="w-full -mx-4 px-4 grid grid-cols-1 md:grid-cols-2 gap-6">
          {statItems.map((s) => (
            <div key={s.title} className="bg-gradient-to-br from-white to-gray-50 border rounded-xl p-6 shadow-md flex items-center justify-between">
              <div>
                <div className="text-sm text-gray-500">{s.title}</div>
                <div className="mt-1 text-2xl font-bold text-gray-900">{s.amount}</div>
              </div>
              <div className="p-3 rounded-lg bg-white shadow-sm">
                <div className="w-10 h-10 flex items-center justify-center">{s.icon}</div>
              </div>
            </div>
          ))}
        </div>
  </section>

  {/* Filters (moved below header to match Products layout) */}
  <div className="flex items-center justify-between mt-4 mb-6 w-full -mx-4 px-4">
    <div className="flex items-center gap-2">
          <div className="flex items-center bg-white border rounded-lg px-3 py-2 shadow-sm">
            <Search className="w-4 h-4 text-gray-400 mr-2" />
            <input aria-label="Search reports" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search reports" className="outline-none text-sm w-56" />
          </div>
          {/* Data range removed: each report page has its own filters, so global range is unnecessary */}
        </div>
  </div>
      
  <section>
    <div className="w-full -mx-4 px-4">
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((link) => (
            <Link key={link.href} href={link.href} className="block">
              <article className="group bg-white rounded-xl border hover:border-gray-200 shadow-sm transition-transform transform hover:-translate-y-1 hover:shadow-md p-4 flex items-center justify-between gap-4 min-h-[78px] cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-100">
                  <div className="flex items-center gap-4 min-w-0">
                    <div className="p-2.5 rounded-lg bg-blue-50 text-blue-600 inline-flex shrink-0">
                    {link.name.toLowerCase().includes('sales') || link.name.toLowerCase().includes('purchase') ? (
                      <FileText className="w-5 h-5" />
                    ) : link.name.toLowerCase().includes('stock') || link.name.toLowerCase().includes('inventory') ? (
                      <Box className="w-5 h-5" />
                    ) : (
                      <ChartBar className="w-5 h-5" />
                    )}
                  </div>
                    <div className="min-w-0">
                      <h3 className="text-base font-semibold text-gray-900 truncate">{link.name}</h3>
                      <p className="text-sm text-gray-500 mt-0.5 truncate">{link.section}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    <span className="text-xs text-gray-600 px-2 py-0.5 border rounded-md">PDF • CSV</span>
                    <div className="text-gray-400">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </div>
                  </div>
              </article>
            </Link>
          ))}
        </div>
        </div>
      </section>
      </main>
    </div>
  );
}
