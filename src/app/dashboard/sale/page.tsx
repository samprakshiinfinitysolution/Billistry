// "use client";

// import React, { useEffect, useMemo, useState } from "react";
// import { Button } from "@/components/ui/button";
// import { Input } from "@/components/ui/input";
// import { useRouter } from "next/navigation";
// import {
//   Select,
//   SelectTrigger,
//   SelectContent,
//   SelectItem,
//   SelectValue,
// } from "@/components/ui/select";
// import {
//   Dialog,
//   DialogContent,
//   DialogHeader,
//   DialogTitle,
//   DialogFooter,
// } from "@/components/ui/dialog";
// import {
//   Table,
//   TableHeader,
//   TableRow,
//   TableHead,
//   TableBody,
//   TableCell,
// } from "@/components/ui/table";
// import { Plus, Pencil, Trash2, Download, FileText } from "lucide-react";
// import axios from "axios";
// import {
//   format,
//   isToday,
//   isThisMonth,
//   parseISO,
//   isWithinInterval,
//   startOfDay,
//   endOfDay,
// } from "date-fns";
// import jsPDF from "jspdf";
// import autoTable from "jspdf-autotable";
// import * as XLSX from "xlsx";

// interface Customer {
//   _id: string;
//   name: string;
//   phone?: string;
//   email?: string;
// }

// interface Item {
//   _id: string;
//   name: string;
//   sku?: string;
//   purchasePrice: number;
//   gstRate?: number; // percent
// }

// interface SaleItemForm {
//   item: string; // item _id
//   quantity: number;
//   rate: number;
//   gstApplied: boolean;
// }

// interface SaleLine {
//   item: Item;
//   quantity: number;
//   rate: number;
//   total: number;
// }

// interface Sale {
//   _id: string;
//   invoiceNo: string;
//   billTo: Customer;
//   date: string; // ISO
//   items: SaleLine[];
//   paymentStatus: "unpaid" | "cash" | "online";
//   invoiceAmount: number;
// }

// type FilterType = "all" | "today" | "month" | "custom";

// export default function SalePage() {
//   const router = useRouter();
//   // ---- Data ----
//   const [sales, setSales] = useState<Sale[]>([]);
//   const [customers, setCustomers] = useState<Customer[]>([]);
//   const [items, setItems] = useState<Item[]>([]);

//   // ---- UI / state ----
//   const [open, setOpen] = useState(false);
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState<string | null>(null);
//   const [editingSaleId, setEditingSaleId] = useState<string | null>(null);

//   // Form
//   const [form, setForm] = useState({
//     billTo: "",
//     date: format(new Date(), "yyyy-MM-dd"),
//     items: [] as SaleItemForm[],
//     paymentStatus: "unpaid" as "unpaid" | "cash" | "online",
//   });

//   // Search & filters
//   const [search, setSearch] = useState("");
//   const [filterType, setFilterType] = useState<FilterType>("all");
//   const [customFrom, setCustomFrom] = useState("");
//   const [customTo, setCustomTo] = useState("");

//   // ---- Effects ----
//   useEffect(() => {
//     fetchSales();
//     fetchCustomers();
//     fetchItems();
//   }, []);

//   const fetchSales = async () => {
//   try {
//     const res = await axios.get("/api/sale", { withCredentials: true });
//     setSales(res.data.data || []); // ✅ pick the array
//   } catch (err: any) {
//     console.error(err);
//     setError(err.response?.data?.message || "Failed to fetch sales");
//   }
// };


//   const fetchCustomers = async () => {
//     try {
//       const res = await axios.get("/api/customers" ,{ withCredentials: true });
//       // setCustomers(res.data);
//       setCustomers(Array.isArray(res.data) ? res.data : res.data.customers || []);
//     } catch (err) {
//       console.error(err);
//     }
//   };

//   const fetchItems = async () => {
//   try {
//     const res = await fetch("/api/product", { credentials: "include" });
//     const data = await res.json();

//     if (res.ok && data.success) {
//       setItems(data.products as Item[]); // ✅ now matches your state
//     } else {
//       console.error(data.error || "Failed to load items");
//     }
//   } catch (err) {
//     console.error("Error fetching items:", err);
//   }
// };


//   // ---- Helpers ----
//   const handleAddItem = () => {
//     setForm((prev) => ({
//       ...prev,
//       items: [
//         ...prev.items,
//         { item: "", quantity: 1, rate: 0, gstApplied: false },
//       ],
//     }));
//   };

//   const handleRemoveItem = (index: number) => {
//     const updated = [...form.items];
//     updated.splice(index, 1);
//     setForm({ ...form, items: updated });
//   };

//   const handleItemChange = (
//     index: number,
//     key: keyof SaleItemForm,
//     value: any
//   ) => {
//     const updated = [...form.items];
//     updated[index][key] = value;

//     // If item changed, auto-fill rate and gstApplied from master item
//     if (key === "item") {
//       const selected = items.find((i) => i._id === value);
//       if (selected) {
//         updated[index].rate = selected.purchasePrice ?? 0;
//         // default GST to true if item has gstRate
//         updated[index].gstApplied = !!selected.gstRate;
//       }
//     }

//     // Ensure min constraints
//     if (key === "quantity") {
//       updated[index].quantity = Math.max(1, Number(value) || 1);
//     }
//     if (key === "rate") {
//       updated[index].rate = Math.max(0, Number(value) || 0);
//     }

//     setForm({ ...form, items: updated });
//   };

//   const calcTotal = useMemo(() => {
//     const total = form.items.reduce((acc, it) => {
//       const itemData = items.find((i) => i._id === it.item);
//       if (!itemData) return acc;
//       let amount = (Number(it.rate) || 0) * (Number(it.quantity) || 0);
//       if (it.gstApplied && itemData.gstRate) {
//         amount += (amount * itemData.gstRate) / 100;
//       }
//       return acc + amount;
//     }, 0);
//     return total;
//   }, [form.items, items]);

//   // ---- Open forms ----
//   const openAddForm = () => {
//     setEditingSaleId(null);
//     setForm({
//       billTo: "",
//       date: format(new Date(), "yyyy-MM-dd"),
//       items: [],
//       paymentStatus: "unpaid",
//     });
//     setOpen(true);
//   };

//   const openEditForm = (sale: Sale) => {
//     setEditingSaleId(sale._id);
//     setForm({
//       billTo: sale.billTo?._id || "",
//       date: format(new Date(sale.date), "yyyy-MM-dd"),
//       items: sale.items.map((it) => ({
//         item: it.item._id,
//         quantity: it.quantity,
//         rate: it.rate,
//         // assume GST if item has gstRate; user can toggle
//         gstApplied: !!it.item.gstRate,
//       })),
//       paymentStatus: sale.paymentStatus,
//     });
//     setOpen(true);
//   };

//   // ---- CRUD ----
//   const handleSave = async () => {
//     setLoading(true);
//     setError(null);

//     try {
//       const payload = {
//         ...form,
//         invoiceAmount: calcTotal,
//       };

//       if (editingSaleId) {
//         await axios.put(`/api/sale/${editingSaleId}`, payload);
//         alert("Sale updated successfully");
//       } else {
//         const res = await axios.post("/api/sale", payload);
//         alert("Sale created successfully");
//       }

//       setOpen(false);
//       fetchSales();
//     } catch (err: any) {
//       console.error(err);
//       const msg = err.response?.data?.message || "Error saving sale";
//       setError(msg);
//       alert(msg);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleDelete = async (id: string) => {
//     if (!confirm("Are you sure you want to delete this sale?")) return;

//     try {
//       await axios.delete(`/api/sale/${id}`);
//       alert("Sale deleted successfully");
//       fetchSales();
//     } catch (err: any) {
//       console.error(err);
//       alert(err.response?.data?.message || "Failed to delete sale");
//     }
//   };

//   // ---- Filtering & Search ----
//   const filteredSales = useMemo(() => {
//     const q = search.trim().toLowerCase();

//     const bySearch = (s: Sale) => {
//       if (!q) return true;
//       const byName = s.billTo?.name?.toLowerCase().includes(q);
//       const byInvoice = s.invoiceNo?.toLowerCase().includes(q);
//       return !!(byName || byInvoice);
//     };

//     const byDate = (s: Sale) => {
//       const d =
//         typeof s.date === "string" ? parseISO(s.date) : new Date(s.date);
//       if (filterType === "today") return isToday(d);
//       if (filterType === "month") return isThisMonth(d);
//       if (filterType === "custom" && customFrom && customTo) {
//         const start = startOfDay(parseISO(customFrom));
//         const end = endOfDay(parseISO(customTo));
//         if (end < start) return false;
//         return isWithinInterval(d, { start, end });
//       }
//       return true; // 'all'
//     };

//     return sales.filter((s) => bySearch(s) && byDate(s));
//   }, [sales, search, filterType, customFrom, customTo]);

//   // ---- Export: PDF ----
//   const exportPDF = () => {
//     const doc = new jsPDF();
//     const title = "Sales Report";
//     doc.setFontSize(16);
//     doc.text(title, 14, 12);

//     // Optional: show active filter period
//     let subtitle = "All";
//     if (filterType === "today")
//       subtitle = `Today (${format(new Date(), "dd/MM/yyyy")})`;
//     if (filterType === "month")
//       subtitle = `This Month (${format(new Date(), "MMMM yyyy")})`;
//     if (filterType === "custom" && customFrom && customTo) {
//       subtitle = `Custom: ${format(
//         parseISO(customFrom),
//         "dd/MM/yyyy"
//       )} - ${format(parseISO(customTo), "dd/MM/yyyy")}`;
//     }
//     doc.setFontSize(10);
//     doc.text(subtitle, 14, 18);

//     autoTable(doc, {
//       startY: 24,
//       head: [["Invoice No", "Customer", "Date", "Items", "Amount", "Status"]],
//       body: filteredSales.map((s) => [
//         s.invoiceNo,
//         s.billTo?.name || "",
//         format(new Date(s.date), "dd/MM/yyyy"),
//         s.items
//           .map((it) => `${it.item?.name || ""} (x${it.quantity})`)
//           .join(", "),
//         `₹${(s.invoiceAmount || 0).toFixed(2)}`,
//         s.paymentStatus,
//       ]),
//       styles: { fontSize: 9 },
//       headStyles: { halign: "left" },
//       bodyStyles: { valign: "top" },
//       columnStyles: {
//         2: { cellWidth: 24 },
//         3: { cellWidth: 70 },
//         4: { halign: "right" },
//       },
//       foot: [
//         [
//           { content: "Grand Total", colSpan: 4 },
//           {
//             content:
//               "₹" +
//               filteredSales
//                 .reduce((sum, s) => sum + (Number(s.invoiceAmount) || 0), 0)
//                 .toFixed(2),
//             styles: { halign: "right" },
//           },
//           "",
//         ],
//       ],
//       footStyles: { fontStyle: "bold" },
//     });

//     doc.save("sales_report.pdf");
//   };

//   // ---- Export: Excel ----
//   const exportExcel = () => {
//     const rows = filteredSales.map((s) => ({
//       InvoiceNo: s.invoiceNo,
//       Customer: s.billTo?.name || "",
//       Date: format(new Date(s.date), "dd/MM/yyyy"),
//       Items: s.items
//         .map((it) => `${it.item?.name || ""} (x${it.quantity})`)
//         .join(", "),
//       Amount: Number(s.invoiceAmount || 0),
//       Status: s.paymentStatus,
//     }));

//     const ws = XLSX.utils.json_to_sheet(rows);
//     // Add a footer total row
//     const total = filteredSales.reduce(
//       (sum, s) => sum + (Number(s.invoiceAmount) || 0),
//       0
//     );
//     XLSX.utils.sheet_add_aoa(ws, [["", "", "", "Grand Total", total]], {
//       origin: -1,
//     });

//     const wb = XLSX.utils.book_new();
//     XLSX.utils.book_append_sheet(wb, ws, "Sales");
//     XLSX.writeFile(wb, "sales_report.xlsx");
//   };

//   return (
//     <div className="p-4">
//       {/* Error Banner */}
//       {error && (
//         <div className="bg-red-100 text-red-700 p-2 rounded mb-4">{error}</div>
//       )}

//       {/* Header */}
//       <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-2">
//         <h1 className="text-xl font-bold">Sales</h1>
//         <Button onClick={openAddForm}>
//           <Plus className="w-4 h-4 mr-2" /> Add Sale
//         </Button>
//       </div>

//       {/* Search + Filters + Export */}
//       <div className="flex flex-wrap gap-2 mb-4 items-center">
//         <Input
//           placeholder="Search customer or invoice..."
//           value={search}
//           onChange={(e) => setSearch(e.target.value)}
//           className="w-64"
//         />
//         <Select
//           value={filterType}
//           onValueChange={(v: FilterType) => setFilterType(v)}
//         >
//           <SelectTrigger className="w-40">
//             <SelectValue placeholder="Filter" />
//           </SelectTrigger>
//           <SelectContent>
//             <SelectItem value="all">All</SelectItem>
//             <SelectItem value="today">Today</SelectItem>
//             <SelectItem value="month">This Month</SelectItem>
//             <SelectItem value="custom">Custom Range</SelectItem>
//           </SelectContent>
//         </Select>
//         {filterType === "custom" && (
//           <>
//             <Input
//               type="date"
//               value={customFrom}
//               onChange={(e) => setCustomFrom(e.target.value)}
//             />
//             <Input
//               type="date"
//               value={customTo}
//               onChange={(e) => setCustomTo(e.target.value)}
//             />
//           </>
//         )}
//         <Button variant="outline" onClick={exportPDF}>
//           <Download className="w-4 h-4 mr-2" />
//           PDF
//         </Button>
//         <Button variant="outline" onClick={exportExcel}>
//           <Download className="w-4 h-4 mr-2" />
//           Excel
//         </Button>
//       </div>

//       {/* Scrollable Table with Fixed Header */}
//       <div className="w-full border rounded overflow-x-auto">
//         <div className="max-h-[500px] overflow-y-auto">
//           <Table className="min-w-full border-collapse">
//             <TableHeader>
//               <TableRow>
//                 <TableHead className="sticky top-0 bg-white z-20 shadow px-4 py-2">
//                   Invoice No
//                 </TableHead>
//                 <TableHead className="sticky top-0 bg-white z-20 shadow px-4 py-2">
//                   Customer
//                 </TableHead>
//                 <TableHead className="sticky top-0 bg-white z-20 shadow px-4 py-2">
//                   Date
//                 </TableHead>
//                 <TableHead className="sticky top-0 bg-white z-20 shadow px-4 py-2">
//                   Items
//                 </TableHead>
//                 <TableHead className="sticky top-0 bg-white z-20 shadow px-4 py-2">
//                   Payment Status
//                 </TableHead>
//                 <TableHead className="sticky top-0 bg-white z-20 shadow px-4 py-2">
//                   Amount
//                 </TableHead>
//                 <TableHead className="sticky top-0 bg-white z-20 shadow px-4 py-2">
//                   Actions
//                 </TableHead>
//               </TableRow>
//             </TableHeader>
//             <TableBody>
//               {filteredSales.map((sale) => (
//                 <TableRow key={sale._id}>
//                   <TableCell className="px-4 py-2">{sale.invoiceNo}</TableCell>
//                   <TableCell className="px-4 py-2">
//                     {sale.billTo?.name}
//                   </TableCell>
//                   <TableCell className="px-4 py-2">
//                     {format(new Date(sale.date), "dd/MM/yyyy")}
//                   </TableCell>
//                   <TableCell className="px-4 py-2">
//                     {sale.items
//                       .map(
//                         (it: any) =>
//                           `${it.item?.name || "Unknown"} (x${it.quantity})`
//                       )
//                       .join(", ")}
//                   </TableCell>
//                   <TableCell className="px-4 py-2">
//                     {sale.paymentStatus}
//                   </TableCell>
//                   <TableCell className="px-4 py-2">
//                     ₹{(sale.invoiceAmount || 0).toFixed(2)}
//                   </TableCell>
//                   <TableCell className="flex gap-2 px-4 py-2">
//                     {/* <Button
//                       size="sm"
//                       variant="outline"
//                       onClick={() => {
//                         setForm({
//                           billTo: sale.billTo?._id,
//                           date: sale.date.split("T")[0],
//                           items: sale.items.map((it: any) => ({
//                             item: it.item?._id,
//                             quantity: it.quantity,
//                             rate: it.rate,
//                             gstApplied: it.gstApplied,
//                           })),
//                           paymentStatus: sale.paymentStatus,
//                         });
//                         setEditingSaleId(sale._id);
//                       }}
//                     >
//                       <Pencil className="w-4 h-4" />
//                     </Button> */}
//                     <Button
//                       size="sm"
//                       variant="outline"
//                       onClick={() => openEditForm(sale)}
//                     >
//                       <Pencil className="w-4 h-4" />
//                     </Button>
//                     <Button
//                       size="sm"
//                       variant="destructive"
//                       onClick={() => handleDelete(sale._id)}
//                     >
//                       <Trash2 className="w-4 h-4" />
//                     </Button>
//                     <Button
//                       size="sm"
//                       variant="outline"
//                       onClick={() => router.push(`/dashboard/sale/${sale._id}`)}
//                     >
//                       <FileText className="w-4 h-4 mr-2" />
//                       Invoice
//                     </Button>
//                   </TableCell>
//                 </TableRow>
//               ))}
//               {filteredSales.length === 0 && (
//                 <TableRow>
//                   <TableCell colSpan={7} className="text-center py-4">
//                     No sales found.
//                   </TableCell>
//                 </TableRow>
//               )}
//             </TableBody>
//           </Table>
//         </div>
//       </div>

//       {/* Add/Edit Sale Dialog */}
//       <Dialog open={open} onOpenChange={setOpen}>
//         <DialogContent className="max-w-lg w-full">
//           <DialogHeader>
//             <DialogTitle>
//               {editingSaleId ? "Edit Sale" : "Add Sale"}
//             </DialogTitle>
//           </DialogHeader>

//           <div className="space-y-3">
//             {/* Customer */}
//             <Select
//               value={form.billTo}
//               onValueChange={(v) => setForm({ ...form, billTo: v })}
//             >
//               <SelectTrigger>
//                 <SelectValue placeholder="Select Customer" />
//               </SelectTrigger>
//               <SelectContent>
//                 {customers.map((c) => (
//                   <SelectItem key={c._id} value={c._id}>
//                    {c.name} ({c.phone || c.email || "N/A"})
//                   </SelectItem>
//                 ))}
//               </SelectContent>
//             </Select>

//             {/* Date */}
//             <Input
//               type="date"
//               value={form.date}
//               onChange={(e) => setForm({ ...form, date: e.target.value })}
//             />

//             {/* Items */}
//             {form.items.map((it, idx) => (
//               <div key={idx} className="flex flex-wrap gap-2 items-center">
//                 <Select
//                   value={it.item}
//                   onValueChange={(v) => handleItemChange(idx, "item", v)}
//                 >
//                   <SelectTrigger className="w-1/3 min-w-[140px]">
//                     <SelectValue placeholder="Item" />
//                   </SelectTrigger>
//                   <SelectContent>
//                     {items.map((i) => (
//                       <SelectItem key={i._id} value={i._id}>
//                     {`${i.name}${i.sku ? ` (SKU: ${i.sku})` : ""}`}
//                       </SelectItem>
//                     ))}
//                   </SelectContent>
//                 </Select>

//                 <Input
//                   type="number"
//                   value={it.quantity}
//                   min={1}
//                   onChange={(e) =>
//                     handleItemChange(idx, "quantity", Number(e.target.value))
//                   }
//                   className="w-20"
//                 />
//                 <Input
//                   type="number"
//                   value={it.rate}
//                   min={0}
//                   onChange={(e) =>
//                     handleItemChange(idx, "rate", Number(e.target.value))
//                   }
//                   className="w-24"
//                 />
//                 <label className="flex items-center gap-1">
//                   <input
//                     type="checkbox"
//                     checked={it.gstApplied}
//                     onChange={(e) =>
//                       handleItemChange(idx, "gstApplied", e.target.checked)
//                     }
//                   />
//                   GST
//                 </label>

//                 <Button
//                   size="sm"
//                   variant="destructive"
//                   onClick={() => handleRemoveItem(idx)}
//                   title="Remove item"
//                 >
//                   🗑
//                 </Button>
//               </div>
//             ))}

//             <Button variant="outline" onClick={handleAddItem}>
//               + Add Item
//             </Button>

//             {/* Payment Status */}
//             <Select
//               value={form.paymentStatus}
//               onValueChange={(v) =>
//                 setForm({
//                   ...form,
//                   paymentStatus: v as "unpaid" | "cash" | "online",
//                 })
//               }
//             >
//               <SelectTrigger>
//                 <SelectValue placeholder="Payment Status" />
//               </SelectTrigger>
//               <SelectContent>
//                 <SelectItem value="unpaid">Unpaid</SelectItem>
//                 <SelectItem value="cash">Cash</SelectItem>
//                 <SelectItem value="online">Online</SelectItem>
//               </SelectContent>
//             </Select>

//             {/* Total */}
//             <div className="text-right font-semibold">
//               Total: ₹{calcTotal.toFixed(2)}
//             </div>
//           </div>

//           <DialogFooter>
//             <Button
//               variant="outline"
//               onClick={() => setOpen(false)}
//               disabled={loading}
//             >
//               Cancel
//             </Button>
//             <Button
//               onClick={handleSave}
//               disabled={loading || !form.billTo || form.items.length === 0}
//             >
//               {loading ? "Saving..." : "Save"}
//             </Button>
//           </DialogFooter>
//         </DialogContent>
//       </Dialog>
//     </div>
//   );
// }




"use client";

import React, { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useRouter } from "next/navigation";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from "@/components/ui/table";
import { Plus, Pencil, Trash2, Download, FileText } from "lucide-react";
import axios from "axios";
import {
  format,
  isToday,
  isThisMonth,
  parseISO,
  isWithinInterval,
  startOfDay,
  endOfDay,
} from "date-fns";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import * as XLSX from "xlsx";

interface Customer {
  _id: string;
  name: string;
  phone?: string;
  email?: string;
}

interface Item {
  _id: string;
  name: string;
  sku?: string;
  purchasePrice: number;
  gstRate?: number;
}

interface SaleItemForm {
  item: string;
  quantity: number;
  rate: number;
  gstApplied: boolean;
}

interface SaleLine {
  item: Item;
  quantity: number;
  rate: number;
  total: number;
}

interface Sale {
  _id: string;
  invoiceNo: string;
  billTo: Customer;
  date: string;
  items: SaleLine[];
  paymentStatus: "unpaid" | "cash" | "online";
  invoiceAmount: number;
  discountType?: "flat" | "percent";
  discountValue?: number;
  taxRate?: number;
}

type FilterType = "all" | "today" | "month" | "custom";

export default function SalePage() {
  const router = useRouter();

  const [sales, setSales] = useState<Sale[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [items, setItems] = useState<Item[]>([]);

  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [editingSaleId, setEditingSaleId] = useState<string | null>(null);

  const [form, setForm] = useState({
    billTo: "",
    date: format(new Date(), "yyyy-MM-dd"),
    items: [] as SaleItemForm[],
    paymentStatus: "unpaid" as "unpaid" | "cash" | "online",
    discountType: "flat" as "flat" | "percent",
    discountValue: 0,
    taxRate: 0,
  });

  const [search, setSearch] = useState("");
  const [filterType, setFilterType] = useState<FilterType>("all");
  const [customFrom, setCustomFrom] = useState("");
  const [customTo, setCustomTo] = useState("");

  useEffect(() => {
    fetchSales();
    fetchCustomers();
    fetchItems();
  }, []);

  const fetchSales = async () => {
    try {
      const res = await axios.get("/api/sale", { withCredentials: true });
      setSales(res.data.data || []);
    } catch (err: any) {
      console.error(err);
      setError(err.response?.data?.message || "Failed to fetch sales");
    }
  };

  const fetchCustomers = async () => {
    try {
      const res = await axios.get("/api/customers", { withCredentials: true });
      setCustomers(Array.isArray(res.data) ? res.data : res.data.customers || []);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchItems = async () => {
    try {
      const res = await fetch("/api/product", { credentials: "include" });
      const data = await res.json();
      if (res.ok && data.success) {
        setItems(data.products as Item[]);
      } else {
        console.error(data.error || "Failed to load items");
      }
    } catch (err) {
      console.error("Error fetching items:", err);
    }
  };

  const handleAddItem = () => {
    setForm((prev) => ({
      ...prev,
      items: [...prev.items, { item: "", quantity: 1, rate: 0, gstApplied: false }],
    }));
  };

  const handleRemoveItem = (index: number) => {
    const updated = [...form.items];
    updated.splice(index, 1);
    setForm({ ...form, items: updated });
  };

  const handleItemChange = (
    index: number,
    key: keyof SaleItemForm,
    value: any
  ) => {
    const updated = [...form.items];
    updated[index][key] = value;

    if (key === "item") {
      const selected = items.find((i) => i._id === value);
      if (selected) {
        updated[index].rate = selected.purchasePrice ?? 0;
        updated[index].gstApplied = !!selected.gstRate;
      }
    }

    if (key === "quantity") {
      updated[index].quantity = Math.max(1, Number(value) || 1);
    }
    if (key === "rate") {
      updated[index].rate = Math.max(0, Number(value) || 0);
    }

    setForm({ ...form, items: updated });
  };

  const calcTotal = useMemo(() => {
    let subtotal = form.items.reduce((acc, it) => {
      const itemData = items.find((i) => i._id === it.item);
      if (!itemData) return acc;
      let amount = (Number(it.rate) || 0) * (Number(it.quantity) || 0);
      if (it.gstApplied && itemData.gstRate) {
        amount += (amount * itemData.gstRate) / 100;
      }
      return acc + amount;
    }, 0);

    let discountAmount = 0;
    if (form.discountType === "flat") discountAmount = form.discountValue;
    if (form.discountType === "percent")
      discountAmount = (subtotal * form.discountValue) / 100;

    const taxableAmount = subtotal - discountAmount;
    const taxAmount = (taxableAmount * (form.taxRate || 0)) / 100;

    return taxableAmount + taxAmount;
  }, [form.items, items, form.discountType, form.discountValue, form.taxRate]);

  const openAddForm = () => {
    setEditingSaleId(null);
    setForm({
      billTo: "",
      date: format(new Date(), "yyyy-MM-dd"),
      items: [],
      paymentStatus: "unpaid",
      discountType: "flat",
      discountValue: 0,
      taxRate: 0,
    });
    setOpen(true);
  };

  const openEditForm = (sale: Sale) => {
    setEditingSaleId(sale._id);
    setForm({
      billTo: sale.billTo?._id || "",
      date: format(new Date(sale.date), "yyyy-MM-dd"),
      items: sale.items.map((it) => ({
        item: it.item._id,
        quantity: it.quantity,
        rate: it.rate,
        gstApplied: !!it.item.gstRate,
      })),
      paymentStatus: sale.paymentStatus,
      discountType: sale.discountType || "flat",
      discountValue: sale.discountValue || 0,
      taxRate: sale.taxRate || 0,
    });
    setOpen(true);
  };

  const handleSave = async () => {
    setLoading(true);
    setError(null);

    try {
      const payload = {
        ...form,
        invoiceAmount: calcTotal,
      };

      if (editingSaleId) {
        await axios.put(`/api/sale/${editingSaleId}`, payload);
        alert("Sale updated successfully");
      } else {
        await axios.post("/api/sale", payload);
        alert("Sale created successfully");
      }

      setOpen(false);
      fetchSales();
    } catch (err: any) {
      console.error(err);
      const msg = err.response?.data?.message || "Error saving sale";
      setError(msg);
      alert(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this sale?")) return;
    try {
      await axios.delete(`/api/sale/${id}`);
      alert("Sale deleted successfully");
      fetchSales();
    } catch (err: any) {
      console.error(err);
      alert(err.response?.data?.message || "Failed to delete sale");
    }
  };

  const filteredSales = useMemo(() => {
    const q = search.trim().toLowerCase();
    const bySearch = (s: Sale) => {
      if (!q) return true;
      const byName = s.billTo?.name?.toLowerCase().includes(q);
      const byInvoice = s.invoiceNo?.toLowerCase().includes(q);
      return !!(byName || byInvoice);
    };
    const byDate = (s: Sale) => {
      const d = typeof s.date === "string" ? parseISO(s.date) : new Date(s.date);
      if (filterType === "today") return isToday(d);
      if (filterType === "month") return isThisMonth(d);
      if (filterType === "custom" && customFrom && customTo) {
        const start = startOfDay(parseISO(customFrom));
        const end = endOfDay(parseISO(customTo));
        if (end < start) return false;
        return isWithinInterval(d, { start, end });
      }
      return true;
    };
    return sales.filter((s) => bySearch(s) && byDate(s));
  }, [sales, search, filterType, customFrom, customTo]);

  const exportPDF = () => {
    const doc = new jsPDF();
    const title = "Sales Report";
    doc.setFontSize(16);
    doc.text(title, 14, 12);

    let subtitle = "All";
    if (filterType === "today") subtitle = `Today (${format(new Date(), "dd/MM/yyyy")})`;
    if (filterType === "month") subtitle = `This Month (${format(new Date(), "MMMM yyyy")})`;
    if (filterType === "custom" && customFrom && customTo)
      subtitle = `Custom: ${format(parseISO(customFrom), "dd/MM/yyyy")} - ${format(parseISO(customTo), "dd/MM/yyyy")}`;
    doc.setFontSize(10);
    doc.text(subtitle, 14, 18);

    autoTable(doc, {
      startY: 24,
      head: [["Invoice No", "Customer", "Date", "Items", "Discount", "Tax", "Amount", "Status"]],
      body: filteredSales.map((s) => [
        s.invoiceNo,
        s.billTo?.name || "",
        format(new Date(s.date), "dd/MM/yyyy"),
        s.items.map((it) => `${it.item?.name || ""} (x${it.quantity})`).join(", "),
        s.discountType === "percent" ? `${s.discountValue}%` : `₹${s.discountValue || 0}`,
        `${s.taxRate || 0}%`,
        `₹${(s.invoiceAmount || 0).toFixed(2)}`,
        s.paymentStatus,
      ]),
      styles: { fontSize: 9 },
      headStyles: { halign: "left" },
      bodyStyles: { valign: "top" },
      columnStyles: {
        2: { cellWidth: 24 },
        3: { cellWidth: 70 },
        6: { halign: "right" },
      },
      foot: [
        [
          { content: "Grand Total", colSpan: 6 },
          { content: `₹${filteredSales.reduce((sum, s) => sum + (Number(s.invoiceAmount) || 0), 0).toFixed(2)}`, styles: { halign: "right" } },
          "",
        ],
      ],
      footStyles: { fontStyle: "bold" },
    });

    doc.save("sales_report.pdf");
  };

  const exportExcel = () => {
    const rows = filteredSales.map((s) => ({
      InvoiceNo: s.invoiceNo,
      Customer: s.billTo?.name || "",
      Date: format(new Date(s.date), "dd/MM/yyyy"),
      Items: s.items.map((it) => `${it.item?.name || ""} (x${it.quantity})`).join(", "),
      Discount: s.discountType === "percent" ? `${s.discountValue}%` : s.discountValue,
      Tax: s.taxRate,
      Amount: Number(s.invoiceAmount || 0),
      Status: s.paymentStatus,
    }));

    const ws = XLSX.utils.json_to_sheet(rows);
    const total = filteredSales.reduce((sum, s) => sum + (Number(s.invoiceAmount) || 0), 0);
    XLSX.utils.sheet_add_aoa(ws, [["", "", "", "", "", "Grand Total", total]], { origin: -1 });

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Sales");
    XLSX.writeFile(wb, "sales_report.xlsx");
  };

  return (
    <div className="p-4">
      {error && <div className="bg-red-100 text-red-700 p-2 rounded mb-4">{error}</div>}

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-2">
        <h1 className="text-xl font-bold">Sales</h1>
        <Button onClick={openAddForm}>
          <Plus className="w-4 h-4 mr-2" /> Add Sale
        </Button>
      </div>

      <div className="flex flex-wrap gap-2 mb-4 items-center">
        <Input
          placeholder="Search customer or invoice..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-64"
        />
        <Select value={filterType} onValueChange={(v: FilterType) => setFilterType(v)}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Filter" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All</SelectItem>
            <SelectItem value="today">Today</SelectItem>
            <SelectItem value="month">This Month</SelectItem>
            <SelectItem value="custom">Custom Range</SelectItem>
          </SelectContent>
        </Select>
        {filterType === "custom" && (
          <>
            <Input type="date" value={customFrom} onChange={(e) => setCustomFrom(e.target.value)} />
            <Input type="date" value={customTo} onChange={(e) => setCustomTo(e.target.value)} />
          </>
        )}
        <Button variant="outline" onClick={exportPDF}><Download className="w-4 h-4 mr-2" /> PDF</Button>
        <Button variant="outline" onClick={exportExcel}><Download className="w-4 h-4 mr-2" /> Excel</Button>
      </div>

      <div className="w-full border rounded overflow-x-auto">
        <div className="max-h-[500px] overflow-y-auto">
          <Table className="min-w-full border-collapse">
            <TableHeader>
              <TableRow>
                <TableHead className="sticky top-0 bg-white z-20 shadow px-4 py-2">Invoice No</TableHead>
                <TableHead className="sticky top-0 bg-white z-20 shadow px-4 py-2">Customer</TableHead>
                <TableHead className="sticky top-0 bg-white z-20 shadow px-4 py-2">Date</TableHead>
                <TableHead className="sticky top-0 bg-white z-20 shadow px-4 py-2">Items</TableHead>
                <TableHead className="sticky top-0 bg-white z-20 shadow px-4 py-2">Payment Status</TableHead>
                <TableHead className="sticky top-0 bg-white z-20 shadow px-4 py-2">Amount</TableHead>
                <TableHead className="sticky top-0 bg-white z-20 shadow px-4 py-2">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredSales.map((sale) => (
                <TableRow key={sale._id}>
                  <TableCell className="px-4 py-2">{sale.invoiceNo}</TableCell>
                  <TableCell className="px-4 py-2">{sale.billTo?.name}</TableCell>
                  <TableCell className="px-4 py-2">{format(new Date(sale.date), "dd/MM/yyyy")}</TableCell>
                  <TableCell className="px-4 py-2">{sale.items.map((it: any) => `${it.item?.name || "Unknown"} (x${it.quantity})`).join(", ")}</TableCell>
                  <TableCell className="px-4 py-2">{sale.paymentStatus}</TableCell>
                  <TableCell className="px-4 py-2">₹{(sale.invoiceAmount || 0).toFixed(2)}</TableCell>
                  <TableCell className="flex gap-2 px-4 py-2">
                    <Button size="sm" variant="outline" onClick={() => openEditForm(sale)}><Pencil className="w-4 h-4" /></Button>
                    <Button size="sm" variant="destructive" onClick={() => handleDelete(sale._id)}><Trash2 className="w-4 h-4" /></Button>
                    <Button size="sm" variant="outline" onClick={() => router.push(`/dashboard/sale/${sale._id}`)}><FileText className="w-4 h-4 mr-2" />Invoice</Button>
                  </TableCell>
                </TableRow>
              ))}
              {filteredSales.length === 0 && (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-4">No sales found.</TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>

<Dialog open={open} onOpenChange={setOpen}>
  <DialogContent className="sm:max-w-max w-full max-w-lg mx-auto p-6 rounded-2xl shadow-lg flex flex-col  overflow-y-scroll max-h-[80vh] ">
    <DialogHeader>
      <DialogTitle>{editingSaleId ? "Edit Sale" : "Add Sale"}</DialogTitle>
    </DialogHeader>

    <div className="space-y-4">
      {/* Customer */}
      <div>
        <label className="block mb-1 font-medium">Select Customer</label>
        <Select value={form.billTo} onValueChange={(v) => setForm({ ...form, billTo: v })}>
          <SelectTrigger>
            <SelectValue placeholder="Select Customer" />
          </SelectTrigger>
          <SelectContent>
            {customers.map((c) => (
              <SelectItem key={c._id} value={c._id}>
                {c.name} ({c.phone || c.email || "N/A"})
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Date */}
      <div>
        <label className="block mb-1 font-medium">Date</label>
        <Input type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} />
      </div>

      {/* Items */}
      <div>
        {/* <label className="block mb-1 font-medium">Items</label> */}
        <div className="space-y-2">
          {form.items.map((it, idx) => (
            <div key={idx} className="flex flex-wrap gap-2 items-end">
              <div className="flex-1 min-w-[140px]">
                <label className="block mb-1 text-sm">Item</label>
                <Select value={it.item} onValueChange={(v) => handleItemChange(idx, "item", v)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select Item" />
                  </SelectTrigger>
                  <SelectContent>
                    {items.map((i) => (
                      <SelectItem key={i._id} value={i._id}>
                        {`${i.name}${i.sku ? ` (SKU: ${i.sku})` : ""}`}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="w-24">
                <label className="block mb-1 text-sm">Qty</label>
                <Input type="number" value={it.quantity} min={1} onChange={(e) => handleItemChange(idx, "quantity", Number(e.target.value))} />
              </div>

              <div className="w-28">
                <label className="block mb-1 text-sm">Rate</label>
                <Input type="number" value={it.rate} min={0} onChange={(e) => handleItemChange(idx, "rate", Number(e.target.value))} />
              </div>

              <div className="flex items-center gap-1 mt-5">
                <input type="checkbox" checked={it.gstApplied} onChange={(e) => handleItemChange(idx, "gstApplied", e.target.checked)} />
                <span className="text-sm">GST</span>
              </div>

              <Button size="sm" variant="destructive" onClick={() => handleRemoveItem(idx)} className="mt-5">🗑</Button>
            </div>
          ))}
        </div>
        <Button variant="outline" onClick={handleAddItem} className="mt-2 w-full sm:w-auto">+ Add Item</Button>
      </div>

      {/* Discount & Tax */}
      <div className="flex flex-wrap gap-2">
        <div className="flex-1 min-w-[120px]">
          <label className="block mb-1 font-medium">Discount Type</label>
          <Select value={form.discountType} onValueChange={(v) => setForm({ ...form, discountType: v as "flat" | "percent" })}>
            <SelectTrigger>
              <SelectValue placeholder="Select Discount Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="flat">Flat</SelectItem>
              <SelectItem value="percent">Percent</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="w-32">
          <label className="block mb-1 font-medium">Discount Value</label>
          <Input type="number" min={0} value={form.discountValue} onChange={(e) => setForm({ ...form, discountValue: Number(e.target.value) })} />
        </div>

        <div className="w-32">
          <label className="block mb-1 font-medium">Tax Rate (%)</label>
          <Input type="number" min={0} max={100} value={form.taxRate} onChange={(e) => setForm({ ...form, taxRate: Number(e.target.value) })} />
        </div>
      </div>

      {/* Payment Status */}
      <div>
        <label className="block mb-1 font-medium">Payment Status</label>
        <Select value={form.paymentStatus} onValueChange={(v) => setForm({ ...form, paymentStatus: v as "unpaid" | "cash" | "online" })}>
          <SelectTrigger>
            <SelectValue placeholder="Select Payment Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="unpaid">Unpaid</SelectItem>
            <SelectItem value="cash">Cash</SelectItem>
            <SelectItem value="online">Online</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Total */}
      <div className="text-right font-semibold mt-2">Total: ₹{calcTotal.toFixed(2)}</div>
    </div>

    <DialogFooter className="flex flex-wrap gap-2">
      <Button variant="outline" onClick={() => setOpen(false)} disabled={loading}>Cancel</Button>
      <Button onClick={handleSave} disabled={loading || !form.billTo || form.items.length === 0}>
        {loading ? "Saving..." : "Save"}
      </Button>
    </DialogFooter>
  </DialogContent>
</Dialog>



      {/* <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-lg w-full">
          <DialogHeader>
            <DialogTitle>{editingSaleId ? "Edit Sale" : "Add Sale"}</DialogTitle>
          </DialogHeader>

          <div className="space-y-3">
             <label className="block mb-1 font-medium">Select Customer</label>
            <Select value={form.billTo} onValueChange={(v) => setForm({ ...form, billTo: v })}>
              <SelectTrigger>
                <SelectValue placeholder="Select Customer" />
              </SelectTrigger>
              <SelectContent>
                {customers.map((c) => (
<<<<<<< HEAD
                  <SelectItem key={c._id} value={c._id}>
                   {c.name} ({c.phone || c.email || "N/A"})
                  </SelectItem>
=======
                  <SelectItem key={c._id} value={c._id}>{c.name} ({c.phone || c.email || "N/A"})</SelectItem>
>>>>>>> dcc59acd5f59524ac9f5cc4448fa122e42a677b1
                ))}
              </SelectContent>
            </Select>


             <label className="block mb-1 font-medium">Date</label>

            <Input type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} />
            <label className="block mb-1 font-medium">Items</label>

            {form.items.map((it, idx) => (
              <div key={idx} className="flex flex-wrap gap-2 items-center">
                <Select value={it.item} onValueChange={(v) => handleItemChange(idx, "item", v)}>
                  <SelectTrigger className="w-1/3 min-w-[140px]">
                    <SelectValue placeholder="Item" />
                  </SelectTrigger>
                  <SelectContent>
                    {items.map((i) => (
<<<<<<< HEAD
                      <SelectItem key={i._id} value={i._id}>
                    {`${i.name}${i.sku ? ` (SKU: ${i.sku})` : ""}`}
                      </SelectItem>
=======
                      <SelectItem key={i._id} value={i._id}>{`${i.name}${i.sku ? ` (SKU: ${i.sku})` : ""}`}</SelectItem>
>>>>>>> dcc59acd5f59524ac9f5cc4448fa122e42a677b1
                    ))}
                  </SelectContent>
                </Select>
                
                <Input type="number" value={it.quantity} min={1} onChange={(e) => handleItemChange(idx, "quantity", Number(e.target.value))} className="w-20" />
                <Input type="number" value={it.rate} min={0} onChange={(e) => handleItemChange(idx, "rate", Number(e.target.value))} className="w-24" />
                <label className="flex items-center gap-1">
                  <input type="checkbox" checked={it.gstApplied} onChange={(e) => handleItemChange(idx, "gstApplied", e.target.checked)} /> GST
                </label>
                <Button size="sm" variant="destructive" onClick={() => handleRemoveItem(idx)}>🗑</Button>
              </div>
            ))}

            <Button variant="outline" onClick={handleAddItem}>+ Add Item</Button>

            <div className="flex gap-2">
              <Select value={form.discountType} onValueChange={(v) => setForm({ ...form, discountType: v as "flat" | "percent" })}>
                <SelectTrigger>
                  <SelectValue placeholder="Discount Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="flat">Flat</SelectItem>
                  <SelectItem value="percent">Percent</SelectItem>
                </SelectContent>
              </Select>
              <Input type="number" min={0} value={form.discountValue} onChange={(e) => setForm({ ...form, discountValue: Number(e.target.value) })} placeholder="Discount" />
              <Input type="number" min={0} max={100} value={form.taxRate} onChange={(e) => setForm({ ...form, taxRate: Number(e.target.value) })} placeholder="Tax %" />
            </div>

            <Select value={form.paymentStatus} onValueChange={(v) => setForm({ ...form, paymentStatus: v as "unpaid" | "cash" | "online" })}>
              <SelectTrigger>
                <SelectValue placeholder="Payment Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="unpaid">Unpaid</SelectItem>
                <SelectItem value="cash">Cash</SelectItem>
                <SelectItem value="online">Online</SelectItem>
              </SelectContent>
            </Select>

            <div className="text-right font-semibold">Total: ₹{calcTotal.toFixed(2)}</div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)} disabled={loading}>Cancel</Button>
            <Button onClick={handleSave} disabled={loading || !form.billTo || form.items.length === 0}>
              {loading ? "Saving..." : "Save"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog> */}
    </div>
  );
}
