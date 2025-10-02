// "use client";

// import React, { useState, useEffect } from "react";
// import jsPDF from "jspdf";
// import autoTable from "jspdf-autotable";
// import { format } from "date-fns";
// import { DateRangePicker } from "react-date-range";
// import "react-date-range/dist/styles.css";
// import "react-date-range/dist/theme/default.css";
// import { Button } from "@/components/ui/button";
// import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

// interface Customer {
//   _id: string;
//   name: string;
//   transactions: {
//     date: string;
//     amount: number;
//   }[];
// }

// const CustomerListPage = () => {
//   const [customers, setCustomers] = useState<Customer[]>([]);
//   const [filteredData, setFilteredData] = useState<Customer[]>([]);
//   const [dateRange, setDateRange] = useState<any>({
//     startDate: new Date(),
//     endDate: new Date(),
//     key: "selection",
//   });

//   useEffect(() => {
//     // Simulate API call
//     const data: Customer[] = [
//       {
//         _id: "1",
//         name: "Rahul Sharma",
//         transactions: [
//           { date: "2025-08-01", amount: 500 }, // you'll get
//           { date: "2025-08-02", amount: -200 }, // you'll give
//         ],
//       },
//       {
//         _id: "2",
//         name: "Anjali Gupta",
//         transactions: [
//           { date: "2025-08-03", amount: -300 },
//           { date: "2025-08-05", amount: 1000 },
//         ],
//       },
//     ];
//     setCustomers(data);
//     setFilteredData(data);
//   }, []);

//   // Apply date filter
//   useEffect(() => {
//     const { startDate, endDate } = dateRange;
//     const filtered = customers.map((c) => ({
//       ...c,
//       transactions: c.transactions.filter((t) => {
//         const d = new Date(t.date);
//         return d >= startDate && d <= endDate;
//       }),
//     }));
//     setFilteredData(filtered);
//   }, [dateRange, customers]);

//   // Totals
//   const calculateTotals = () => {
//     let totalGet = 0;
//     let totalGive = 0;

//     filteredData.forEach((c) => {
//       c.transactions.forEach((t) => {
//         if (t.amount > 0) totalGet += t.amount;
//         else totalGive += Math.abs(t.amount);
//       });
//     });

//     return { totalGet, totalGive, net: totalGet - totalGive };
//   };

//   const { totalGet, totalGive, net } = calculateTotals();

//   // PDF download
//   const downloadPDF = () => {
//     const doc = new jsPDF();
//     doc.setFontSize(16);
//     doc.text("Customer Balance Report", 14, 15);
//     doc.setFontSize(12);
//     doc.text(
//       `Date Range: ${format(dateRange.startDate, "dd/MM/yyyy")} - ${format(
//         dateRange.endDate,
//         "dd/MM/yyyy"
//       )}`,
//       14,
//       25
//     );

//     const rows: any[] = [];
//     filteredData.forEach((c) => {
//       let get = 0,
//         give = 0;
//       c.transactions.forEach((t) => {
//         if (t.amount > 0) get += t.amount;
//         else give += Math.abs(t.amount);
//       });
//       rows.push([c.name, get.toFixed(2), give.toFixed(2)]);
//     });

//     rows.push(["Grand Total", totalGet.toFixed(2), totalGive.toFixed(2)]);

//     autoTable(doc, {
//       head: [["Customer", "You'll Get", "You'll Give"]],
//       body: rows,
//       startY: 35,
//     });

//     doc.text(`Net Balance: ${net.toFixed(2)}`, 14, doc.lastAutoTable.finalY + 10);

//     doc.save("customer-report.pdf");
//   };

//   return (
//     <div className="p-6 space-y-6">
//       <Card>
//         <CardHeader>
//           <CardTitle>Filter by Date</CardTitle>
//         </CardHeader>
//         <CardContent>
//           <DateRangePicker
//             ranges={[dateRange]}
//             onChange={(ranges) => setDateRange(ranges.selection)}
//           />
//         </CardContent>
//       </Card>

//       <Card>
//         <CardHeader>
//           <CardTitle>Customer Balances</CardTitle>
//         </CardHeader>
//         <CardContent>
//           <table className="w-full border text-sm">
//             <thead>
//               <tr className="bg-gray-100">
//                 <th className="border p-2">Customer</th>
//                 <th className="border p-2 text-green-600">You'll Get</th>
//                 <th className="border p-2 text-red-600">You'll Give</th>
//               </tr>
//             </thead>
//             <tbody>
//               {filteredData.map((c) => {
//                 let get = 0,
//                   give = 0;
//                 c.transactions.forEach((t) => {
//                   if (t.amount > 0) get += t.amount;
//                   else give += Math.abs(t.amount);
//                 });
//                 return (
//                   <tr key={c._id}>
//                     <td className="border p-2">{c.name}</td>
//                     <td className="border p-2 text-green-600">{get}</td>
//                     <td className="border p-2 text-red-600">{give}</td>
//                   </tr>
//                 );
//               })}
//               <tr className="font-bold bg-gray-50">
//                 <td className="border p-2">Grand Total</td>
//                 <td className="border p-2 text-green-600">{totalGet}</td>
//                 <td className="border p-2 text-red-600">{totalGive}</td>
//               </tr>
//             </tbody>
//           </table>

//           <div className="mt-4 flex justify-between items-center">
//             <p className="font-semibold">
//               Net Balance:{" "}
//               <span
//                 className={net >= 0 ? "text-green-600" : "text-red-600"}
//               >
//                 {net}
//               </span>
//             </p>
//             <Button onClick={downloadPDF}>Download PDF</Button>
//           </div>
//         </CardContent>
//       </Card>
//     </div>
//   );
// };

// export default CustomerListPage;



"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { DateRangePicker } from "react-date-range";
import "react-date-range/dist/styles.css";
import "react-date-range/dist/theme/default.css";

// Mock real data
const mockData = [
  {
    name: "Ramesh",
    phone: "9876543210",
    youllGet: 2000,
    youllGive: 500,
    date: "2025-08-01",
  },
  {
    name: "Suresh",
    phone: "8765432109",
    youllGet: 1000,
    youllGive: 2500,
    date: "2025-08-10",
  },
  {
    name: "Mahesh",
    phone: "7654321098",
    youllGet: 500,
    youllGive: 700,
    date: "2025-07-25",
  },
];

export default function CustomerListPage() {
  const [filter, setFilter] = useState<"today" | "month" | "custom">("today");
  const [dateRange, setDateRange] = useState<any>({
    startDate: new Date(),
    endDate: new Date(),
    key: "selection",
  });

  // Filter logic
  const filteredData = mockData.filter((row) => {
    const rowDate = new Date(row.date);
    const today = new Date();

    if (filter === "today") {
      return (
        rowDate.toDateString() === today.toDateString()
      );
    }

    if (filter === "month") {
      return (
        rowDate.getMonth() === today.getMonth() &&
        rowDate.getFullYear() === today.getFullYear()
      );
    }

    if (filter === "custom") {
      return (
        rowDate >= dateRange.startDate && rowDate <= dateRange.endDate
      );
    }

    return true;
  });

  // Totals
  const totalGet = filteredData.reduce((sum, row) => sum + row.youllGet, 0);
  const totalGive = filteredData.reduce((sum, row) => sum + row.youllGive, 0);
  const netBalance = totalGive - totalGet;

  // PDF Export
  const downloadPDF = () => {
    const doc = new jsPDF();
    doc.text("Customer Report", 14, 10);
    autoTable(doc, {
      head: [["Name", "Phone", "You'll Get", "You'll Give", "Collection Date"]],
      body: filteredData.map((row) => [
        row.name,
        row.phone,
        row.youllGet,
        row.youllGive,
        format(new Date(row.date), "dd-MM-yyyy"),
      ]),
      foot: [
        [
          "Grand Total",
          "",
          totalGet.toString(),
          totalGive.toString(),
          "",
        ],
      ],
    });
    doc.save("customer-report.pdf");
  };

  return (
    <div className="p-6 space-y-6">
      {/* Summary */}
      <div className="grid grid-cols-3 gap-4 text-center font-bold">
        <div className="p-4 bg-green-100 rounded-lg">
<<<<<<< HEAD
          You&apos;ll Get: ₹{totalGet}
        </div>
        <div className="p-4 bg-red-100 rounded-lg">
          You&apos;ll Give: ₹{totalGive}
=======
<<<<<<< HEAD
          You&apos;ll Get: ₹{totalGet}
        </div>
        <div className="p-4 bg-red-100 rounded-lg">
          You&apos;ll Give: ₹{totalGive}
=======
          You'll Get: ₹{totalGet}
        </div>
        <div className="p-4 bg-red-100 rounded-lg">
          You'll Give: ₹{totalGive}
>>>>>>> dcc59acd5f59524ac9f5cc4448fa122e42a677b1
>>>>>>> 3cfecf3c8e12ea107b03bcb7f8949aaf453d14ed
        </div>
        <div className="p-4 bg-blue-100 rounded-lg">
          Net Balance: ₹{netBalance}
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-2">
        <Button
          variant={filter === "today" ? "default" : "outline"}
          onClick={() => setFilter("today")}
        >
          Today
        </Button>
        <Button
          variant={filter === "month" ? "default" : "outline"}
          onClick={() => setFilter("month")}
        >
          This Month
        </Button>
        <Button
          variant={filter === "custom" ? "default" : "outline"}
          onClick={() => setFilter("custom")}
        >
          Custom Range
        </Button>
      </div>

      {/* Date Picker */}
      {filter === "custom" && (
        <DateRangePicker
          ranges={[dateRange]}
          onChange={(ranges) => setDateRange(ranges.selection)}
        />
      )}

      {/* Table */}
      <div className="overflow-x-auto border rounded-lg">
        <table className="min-w-full border-collapse">
          <thead className="bg-gray-100">
            <tr>
              <th className="border p-2">Name</th>
              <th className="border p-2">Phone</th>
<<<<<<< HEAD
              <th className="border p-2">You&apos;ll Get</th>
              <th className="border p-2">You&apos;ll Give</th>
=======
<<<<<<< HEAD
              <th className="border p-2">You&apos;ll Get</th>
              <th className="border p-2">You&apos;ll Give</th>
=======
              <th className="border p-2">You'll Get</th>
              <th className="border p-2">You'll Give</th>
>>>>>>> dcc59acd5f59524ac9f5cc4448fa122e42a677b1
>>>>>>> 3cfecf3c8e12ea107b03bcb7f8949aaf453d14ed
              <th className="border p-2">Collection Date</th>
            </tr>
          </thead>
          <tbody>
            {filteredData.map((row, i) => (
              <tr key={i} className="text-center">
                <td className="border p-2">{row.name}</td>
                <td className="border p-2">{row.phone}</td>
                <td className="border p-2">₹{row.youllGet}</td>
                <td className="border p-2">₹{row.youllGive}</td>
                <td className="border p-2">
                  {format(new Date(row.date), "dd-MM-yyyy")}
                </td>
              </tr>
            ))}
            {/* Grand Total Row */}
            <tr className="font-bold bg-gray-50">
              <td className="border p-2">Grand Total</td>
              <td className="border p-2"></td>
              <td className="border p-2">₹{totalGet}</td>
              <td className="border p-2">₹{totalGive}</td>
              <td className="border p-2"></td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* PDF Button */}
      <Button onClick={downloadPDF}>Download PDF</Button>
    </div>
  );
}
