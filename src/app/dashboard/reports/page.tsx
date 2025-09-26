// // // src/app/dashboard/reports/page.tsx
// // "use client";

// // import { useEffect, useMemo, useState } from "react";
// // import jsPDF from "jspdf";
// // import autoTable from "jspdf-autotable";
// // import Link from "next/link";

// // type PartyType = "Customer" | "Supplier" | "All";
// // type Row = {
// //   _id: string;
// //   partyType: "Customer" | "Supplier";
// //   name: string;
// //   phone: string;
// //   totalGot: number;
// //   totalGave: number;
// //   balance: number;
// //   status: "You Will Get" | "You Will Give" | "Settled";
// // };

// // type Report = {
// //   youWillGet: number;
// //   youWillGive: number;
// //   net: number;
// //   count: number;
// //   details: Row[];
// // };

// // export default function ReportsPage() {
// //   const [startDate, setStartDate] = useState<string>("");
// //   const [endDate, setEndDate] = useState<string>("");
// //   const [partyType, setPartyType] = useState<PartyType>("All");
// //   const [loading, setLoading] = useState(false);
// //   const [report, setReport] = useState<Report | null>(null);

// //   const fetchReport = async () => {
// //     setLoading(true);
// //     const params = new URLSearchParams();
// //     if (startDate) params.set("startDate", startDate);
// //     if (endDate) params.set("endDate", endDate);
// //     if (partyType) params.set("partyType", partyType);

// //     const res = await fetch(`/api/reports/party-balances?${params.toString()}`);
// //     const data = await res.json();
// //     setReport(data);
// //     setLoading(false);
// //   };

// //   useEffect(() => {
// //     fetchReport();
// //     // eslint-disable-next-line react-hooks/exhaustive-deps
// //   }, []);

// //   const exportCSV = () => {
// //     if (!report) return;
// //     const header = [
// //       "Type",
// //       "Name",
// //       "Phone",
// //       "Total Got",
// //       "Total Gave",
// //       "Balance",
// //       "Status",
// //     ];
// //     const rows = report.details.map((d) => [
// //       d.partyType,
// //       d.name,
// //       d.phone,
// //       d.totalGot,
// //       d.totalGave,
// //       d.balance,
// //       d.status,
// //     ]);

// //     const blob = new Blob(
// //       [header.join(",") + "\n" + rows.map((r) => r.join(",")).join("\n")],
// //       { type: "text/csv;charset=utf-8" }
// //     );

// //     const url = URL.createObjectURL(blob);
// //     const a = document.createElement("a");
// //     a.href = url;
// //     a.download = "party-balance-report.csv";
// //     a.click();
// //     URL.revokeObjectURL(url);
// //   };

// //   const exportPDF = () => {
// //     if (!report) return;

// //     const doc = new jsPDF();
// //     doc.text("Party Balance Report", 14, 14);
// //     const sub = [
// //       startDate ? `From: ${startDate}` : "",
// //       endDate ? `To: ${endDate}` : "",
// //       partyType !== "All" ? `Type: ${partyType}` : "",
// //     ]
// //       .filter(Boolean)
// //       .join("   ");
// //     if (sub) doc.text(sub, 14, 22);

// //     autoTable(doc, {
// //       startY: 28,
// //       head: [["Type", "Name", "Phone", "Total Got", "Total Gave", "Balance", "Status"]],
// //       body: report.details.map((d) => [
// //         d.partyType,
// //         d.name,
// //         d.phone,
// //         d.totalGot.toFixed(2),
// //         d.totalGave.toFixed(2),
// //         d.balance.toFixed(2),
// //         d.status,
// //       ]),
// //       styles: { fontSize: 9 },
// //     });

// //     // Totals section
// //     const y = (doc as any).lastAutoTable.finalY + 8;
// //     doc.text(
// //       `You Will Get: ₹${report.youWillGet.toFixed(2)}    You Will Give: ₹${report.youWillGive.toFixed(
// //         2
// //       )}    Net: ₹${report.net.toFixed(2)}`,
// //       14,
// //       y
// //     );

// //     doc.save("party-balance-report.pdf");
// //   };

// //   const totals = useMemo(() => {
// //     if (!report) return { get: 0, give: 0, net: 0, count: 0 };
// //     return {
// //       get: report.youWillGet,
// //       give: report.youWillGive,
// //       net: report.net,
// //       count: report.count,
// //     };
// //   }, [report]);

// //   return (
// //     <div className="p-6 max-w-6xl mx-auto">
// //       <h1 className="text-2xl font-bold mb-4">Reports — Party Balances</h1>

// //       {/* Filters */}
// //       <div className="grid md:grid-cols-5 gap-3 items-end">
// //         <div className="flex flex-col">
// //           <label className="text-sm text-gray-600">Start Date</label>
// //           <input
// //             type="date"
// //             value={startDate}
// //             onChange={(e) => setStartDate(e.target.value)}
// //             className="border rounded p-2"
// //           />
// //         </div>
// //         <div className="flex flex-col">
// //           <label className="text-sm text-gray-600">End Date</label>
// //           <input
// //             type="date"
// //             value={endDate}
// //             onChange={(e) => setEndDate(e.target.value)}
// //             className="border rounded p-2"
// //           />
// //         </div>
// //         <div className="flex flex-col">
// //           <label className="text-sm text-gray-600">Party Type</label>
// //           <select
// //             value={partyType}
// //             onChange={(e) => setPartyType(e.target.value as PartyType)}
// //             className="border rounded p-2"
// //           >
// //             <option value="All">All</option>
// //             <option value="Customer">Customer</option>
// //             <option value="Supplier">Supplier</option>
// //           </select>
// //         </div>
// //         <button
// //           onClick={fetchReport}
// //           disabled={loading}
// //           className="bg-black text-white rounded p-2"
// //         >
// //           {loading ? "Loading..." : "Apply Filters"}
// //         </button>
// //         <div className="flex gap-2">
// //           <button onClick={exportCSV} className="border rounded p-2 w-full">
// //             Export CSV
// //           </button>
// //           <button onClick={exportPDF} className="bg-blue-600 text-white rounded p-2 w-full">
// //             Export PDF
// //           </button>
// //         </div>
// //       </div>

// //       {/* Totals */}
// //       <div className="grid md:grid-cols-3 gap-4 mt-6">
// //         <div className="border rounded p-4">
// //           <div className="text-gray-600 text-sm">You Will Get</div>
// //           <div className="text-2xl font-semibold text-green-600">₹{totals.get.toLocaleString()}</div>
// //         </div>
// //         <div className="border rounded p-4">
// //           <div className="text-gray-600 text-sm">You Will Give</div>
// //           <div className="text-2xl font-semibold text-red-600">₹{totals.give.toLocaleString()}</div>
// //         </div>
// //         <div className="border rounded p-4">
// //           <div className="text-gray-600 text-sm">Net</div>
// //           <div className="text-2xl font-semibold">₹{totals.net.toLocaleString()}</div>
// //         </div>
// //       </div>

// //       {/* Table */}
// //       <div className="mt-6 overflow-x-auto">
// //         <table className="w-full text-sm">
// //           <thead>
// //             <tr className="text-left border-b">
// //               <th className="py-2">Type</th>
// //               <th className="py-2">Name</th>
// //               <th className="py-2">Phone</th>
// //               <th className="py-2">Total Got</th>
// //               <th className="py-2">Total Gave</th>
// //               <th className="py-2">Balance</th>
// //               <th className="py-2">Status</th>
// //               <th className="py-2">Ledger</th>
// //             </tr>
// //           </thead>
// //           <tbody>
// //             {report?.details.length ? (
// //               report.details.map((d) => (
// //                 <tr key={`${d.partyType}-${d._id}`} className="border-b">
// //                   <td className="py-2">{d.partyType}</td>
// //                   <td className="py-2">{d.name}</td>
// //                   <td className="py-2">{d.phone || "-"}</td>
// //                   <td className="py-2">₹{d.totalGot.toLocaleString()}</td>
// //                   <td className="py-2">₹{d.totalGave.toLocaleString()}</td>
// //                   <td className={`py-2 ${d.balance >= 0 ? "text-green-700" : "text-red-700"}`}>
// //                     ₹{d.balance.toLocaleString()}
// //                   </td>
// //                   <td className="py-2">{d.status}</td>
// //                   <td className="py-2">
// //                     <Link
// //                       className="text-blue-600 underline"
// //                       href={`/dashboard/ledger/${d.partyType}/${d._id}`}
// //                     >
// //                       View
// //                     </Link>
// //                   </td>
// //                 </tr>
// //               ))
// //             ) : (
// //               <tr>
// //                 <td className="py-6 text-center text-gray-500" colSpan={8}>
// //                   No data
// //                 </td>
// //               </tr>
// //             )}
// //           </tbody>
// //         </table>
// //       </div>
// //     </div>
// //   );
// // }






"use client";

import Link from "next/link";

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
      { name: "Sales Report", href: "/dashboard/reports/bills/sale" },
      { name: "Purchase Report", href: "/dashboard/reports/bills/purchase" },
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
  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-6">Reports Dashboard</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {reportSections.map((section) => (
          <div
            key={section.title}
            className="border rounded-xl shadow-sm p-6 hover:shadow-md transition"
          >
            <h2 className="text-lg font-semibold mb-4">{section.title}</h2>
            <ul className="space-y-2">
              {section.links.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="text-blue-600 hover:underline"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
}






