// "use client";

// import React, { useEffect, useState } from "react";
// import { format } from "date-fns";
// import { saveAs } from "file-saver";
// import jsPDF from "jspdf";
// import autoTable from "jspdf-autotable";

// import { Input } from "@/components/ui/input";
// import {
//   Select,
//   SelectContent,
//   SelectItem,
//   SelectTrigger,
//   SelectValue,
// } from "@/components/ui/select";
// import { Button } from "@/components/ui/button";
// import { Label } from "@/components/ui/label";
// import {
//   Table,
//   TableBody,
//   TableCell,
//   TableHead,
//   TableHeader,
//   TableRow,
// } from "@/components/ui/table";

// type Transaction = {
//   _id: string;
//   customerId: string;
//   amount: number;
//   date: string;
//   paymentMode: string;
//   note: string;
// };

// export default function TransactionReportPage() {
//   const [transactions, setTransactions] = useState<Transaction[]>([]);
//   const [filtered, setFiltered] = useState<Transaction[]>([]);
//   const [from, setFrom] = useState("");
//   const [to, setTo] = useState("");
//   const [type, setType] = useState("all");

//   useEffect(() => {
//     fetchTransactions();
//   }, []);

//   useEffect(() => {
//     filterTransactions();
//   }, [from, to, type, transactions]);

//   const fetchTransactions = async () => {
//     try {
//       const res = await fetch("/api/transactions");
//       const result = await res.json();

//       // ✅ Validate and set only if array
//       if (Array.isArray(result)) {
//         setTransactions(result);
//         setFiltered(result);
//       } else if (Array.isArray(result?.data)) {
//         setTransactions(result.data);
//         setFiltered(result.data);
//       } else {
//         console.error("Unexpected response:", result);
//         setTransactions([]);
//         setFiltered([]);
//       }
//     } catch (err) {
//       console.error("Error fetching transactions:", err);
//     }
//   };

//   const filterTransactions = () => {
//     let data = [...transactions];

//     if (from) {
//       data = data.filter((tx) => new Date(tx.date) >= new Date(from));
//     }

//     if (to) {
//       data = data.filter((tx) => new Date(tx.date) <= new Date(to));
//     }

//     if (type === "daily") {
//       const today = format(new Date(), "yyyy-MM-dd");
//       data = data.filter((tx) => tx.date.startsWith(today));
//     } else if (type === "monthly") {
//       const month = format(new Date(), "yyyy-MM");
//       data = data.filter((tx) => tx.date.startsWith(month));
//     }

//     setFiltered(data);
//   };

//   const handleExportCSV = () => {
//     const csvHeader = "Date,Amount,Payment Mode,Note\n";
//     const csvRows = filtered.map(
//       (tx) =>
//         `${format(new Date(tx.date), "yyyy-MM-dd HH:mm")},${tx.amount},${tx.paymentMode},${tx.note}`
//     );
//     const blob = new Blob([csvHeader + csvRows.join("\n")], {
//       type: "text/csv",
//     });
//     saveAs(blob, "transactions.csv");
//   };

//   const handleExportPDF = () => {
//     const doc = new jsPDF();
//     doc.text("Transaction Report", 14, 10);
//     autoTable(doc, {
//       head: [["Date", "Amount", "Payment Mode", "Note"]],
//       body: filtered.map((tx) => [
//         format(new Date(tx.date), "yyyy-MM-dd HH:mm"),
//         `₹${tx.amount}`,
//         tx.paymentMode,
//         tx.note,
//       ]),
//     });
//     doc.save("transactions.pdf");
//   };

//   return (
//     <div className="p-6">
//       <h2 className="text-xl font-bold mb-6">Transaction Report</h2>

//       <div className="flex flex-wrap gap-4 mb-6 items-end">
//         <div>
//           <Label className="mb-1 text-sm">From</Label>
//           <Input
//             type="date"
//             value={from}
//             onChange={(e) => setFrom(e.target.value)}
//           />
//         </div>

//         <div>
//           <Label className="mb-1 text-sm">To</Label>
//           <Input
//             type="date"
//             value={to}
//             onChange={(e) => setTo(e.target.value)}
//           />
//         </div>

//         <div>
//           <Label className="mb-1 text-sm">Type</Label>
//           <Select value={type} onValueChange={setType}>
//             <SelectTrigger>
//               <SelectValue placeholder="Select type" />
//             </SelectTrigger>
//             <SelectContent>
//               <SelectItem value="all">All</SelectItem>
//               <SelectItem value="daily">Daily</SelectItem>
//               <SelectItem value="monthly">Monthly</SelectItem>
//             </SelectContent>
//           </Select>
//         </div>

//         <Button variant="outline" onClick={handleExportCSV}>
//           Export CSV
//         </Button>
//         <Button variant="default" onClick={handleExportPDF}>
//           Export PDF
//         </Button>
//       </div>

//       <Table>
//         <TableHeader>
//           <TableRow>
//             <TableHead>Date</TableHead>
//             <TableHead>Amount</TableHead>
//             <TableHead>Payment Mode</TableHead>
//             <TableHead>Note</TableHead>
//           </TableRow>
//         </TableHeader>
//         <TableBody>
//           {filtered.length === 0 ? (
//             <TableRow>
//               <TableCell colSpan={4} className="text-center text-muted-foreground">
//                 No transactions found.
//               </TableCell>
//             </TableRow>
//           ) : (
//             filtered.map((tx) => (
//               <TableRow key={tx._id}>
//                 <TableCell>
//                   {format(new Date(tx.date), "yyyy-MM-dd HH:mm")}
//                 </TableCell>
//                 <TableCell>₹{tx.amount}</TableCell>
//                 <TableCell>{tx.paymentMode}</TableCell>
//                 <TableCell>{tx.note}</TableCell>
//               </TableRow>
//             ))
//           )}
//         </TableBody>
//       </Table>
//     </div>
//   );
// }





// "use client";

// import React, { useEffect, useState } from "react";
// import { format, isAfter, isBefore, isSameDay } from "date-fns";
// import { saveAs } from "file-saver";
// import jsPDF from "jspdf";
// import autoTable from "jspdf-autotable";
// import { toast } from "sonner";

// import { Input } from "@/components/ui/input";
// import {
//   Select,
//   SelectContent,
//   SelectItem,
//   SelectTrigger,
//   SelectValue,
// } from "@/components/ui/select";
// import { Button } from "@/components/ui/button";
// import { Label } from "@/components/ui/label";
// import {
//   Table,
//   TableBody,
//   TableCell,
//   TableHead,
//   TableHeader,
//   TableRow,
// } from "@/components/ui/table";

// type Transaction = {
//   _id: string;
//   customerId: string;
//   amount: number;
//   date: string;
//   paymentMode: string;
//   note: string;
// };

// export default function TransactionReportPage() {
//   const [transactions, setTransactions] = useState<Transaction[]>([]);
//   const [filtered, setFiltered] = useState<Transaction[]>([]);
//   const [from, setFrom] = useState("");
//   const [to, setTo] = useState("");
//   const [type, setType] = useState("all");

//   useEffect(() => {
//     fetchTransactions();
//   }, []);

//   useEffect(() => {
//     filterTransactions();
//   }, [from, to, type, transactions]);

//   const fetchTransactions = async () => {
//     try {
//       const res = await fetch("/api/transactions");
//       const result = await res.json();

//       if (Array.isArray(result)) {
//         setTransactions(result);
//         setFiltered(result);
//       } else if (Array.isArray(result?.data)) {
//         setTransactions(result.data);
//         setFiltered(result.data);
//       } else {
//         toast.error("Unexpected response from server.");
//         setTransactions([]);
//         setFiltered([]);
//       }
//     } catch (err) {
//       console.error("Fetch error:", err);
//       toast.error("Failed to load transactions.");
//     }
//   };

//   const filterTransactions = () => {
//     let data = [...transactions];

//     if (from) {
//       data = data.filter((tx) => isAfter(new Date(tx.date), new Date(from)) || isSameDay(new Date(tx.date), new Date(from)));
//     }

//     if (to) {
//       data = data.filter((tx) => isBefore(new Date(tx.date), new Date(to)) || isSameDay(new Date(tx.date), new Date(to)));
//     }

//     if (type === "daily") {
//       const today = format(new Date(), "yyyy-MM-dd");
//       data = data.filter((tx) => tx.date.startsWith(today));
//     } else if (type === "monthly") {
//       const month = format(new Date(), "yyyy-MM");
//       data = data.filter((tx) => tx.date.startsWith(month));
//     }

//     setFiltered(data);
//   };

//   const handleExportCSV = () => {
//     const csvHeader = "Date,Amount,Payment Mode,Note\n";
//     const csvRows = filtered.map(
//       (tx) =>
//         `${format(new Date(tx.date), "yyyy-MM-dd HH:mm")},${tx.amount},${tx.paymentMode},${tx.note}`
//     );
//     const blob = new Blob([csvHeader + csvRows.join("\n")], {
//       type: "text/csv",
//     });
//     saveAs(blob, "transactions.csv");
//     toast.success("CSV file exported!");
//   };

//   const handleExportPDF = () => {
//     const doc = new jsPDF();
//     doc.text("Transaction Report", 14, 10);
//     autoTable(doc, {
//       head: [["Date", "Amount", "Payment Mode", "Note"]],
//       body: filtered.map((tx) => [
//         format(new Date(tx.date), "yyyy-MM-dd HH:mm"),
//         `₹${tx.amount}`,
//         tx.paymentMode,
//         tx.note,
//       ]),
//     });
//     doc.save("transactions.pdf");
//     toast.success("PDF file downloaded!");
//   };

//   return (
//     <div className="p-6">
//       <h2 className="text-xl font-bold mb-6 text-gray-800">Transaction Report</h2>

//       <div className="flex flex-wrap gap-4 mb-6 items-end">
//         <div>
//           <Label className="mb-1 text-sm">From</Label>
//           <Input type="date" value={from} onChange={(e) => setFrom(e.target.value)} />
//         </div>

//         <div>
//           <Label className="mb-1 text-sm">To</Label>
//           <Input type="date" value={to} onChange={(e) => setTo(e.target.value)} />
//         </div>

//         <div>
//           <Label className="mb-1 text-sm">Type</Label>
//           <Select value={type} onValueChange={setType}>
//             <SelectTrigger>
//               <SelectValue placeholder="Select type" />
//             </SelectTrigger>
//             <SelectContent>
//               <SelectItem value="all">All</SelectItem>
//               <SelectItem value="daily">Daily</SelectItem>
//               <SelectItem value="monthly">Monthly</SelectItem>
//             </SelectContent>
//           </Select>
//         </div>

//         <div className="flex gap-2 mt-2 md:mt-0">
//           <Button variant="outline" onClick={handleExportCSV}>
//             Export CSV
//           </Button>
//           <Button variant="default" onClick={handleExportPDF}>
//             Export PDF
//           </Button>
//         </div>
//       </div>

//       <Table>
//         <TableHeader>
//           <TableRow>
//             <TableHead>Date</TableHead>
//             <TableHead>Amount</TableHead>
//             <TableHead>Payment Mode</TableHead>
//             <TableHead>Note</TableHead>
//           </TableRow>
//         </TableHeader>
//         <TableBody>
//           {filtered.length === 0 ? (
//             <TableRow>
//               <TableCell colSpan={4} className="text-center text-muted-foreground py-6">
//                 No transactions found.
//               </TableCell>
//             </TableRow>
//           ) : (
//             filtered.map((tx) => (
//               <TableRow key={tx._id}>
//                 <TableCell>{format(new Date(tx.date), "yyyy-MM-dd HH:mm")}</TableCell>
//                 <TableCell>₹{tx.amount.toLocaleString()}</TableCell>
//                 <TableCell>{tx.paymentMode}</TableCell>
//                 <TableCell>{tx.note || "-"}</TableCell>
//               </TableRow>
//             ))
//           )}
//         </TableBody>
//       </Table>
//     </div>
//   );
// }




"use client";

import { useEffect, useState } from "react";
import TransactionList from "@/components/TransactionList";
import TransactionForm from "@/components/TransactionForm";

export default function TransactionsPage() {
  const [transactions, setTransactions] = useState([]);

  const fetchTransactions = async () => {
    const res = await fetch("/api/transactions");
    const data = await res.json();
    setTransactions(data);
  };

  useEffect(() => {
    fetchTransactions();
  }, []);

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Transactions</h1>
      <TransactionForm onAdd={fetchTransactions} />
      <TransactionList transactions={transactions} onDelete={fetchTransactions} />
    </div>
  );
}
