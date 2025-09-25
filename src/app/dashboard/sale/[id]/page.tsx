





// "use client";

// import React, { useEffect, useMemo, useRef, useState } from "react";
// import { useParams, useRouter } from "next/navigation";
// import axios from "axios";
// import { format } from "date-fns";
// import jsPDF from "jspdf";
// import autoTable from "jspdf-autotable";
// import * as XLSX from "xlsx";
// import { useReactToPrint } from "react-to-print";

// // --- Types (match your existing API shapes) ---
// interface Customer {
//   _id?: string;
//   name: string;
//   mobile?: string;
//   address?: string;
//   state?: string;
// }
// interface Item {
//   _id: string;
//   name: string;
//   purchasePrice: number;
//   gstRate?: number; // percent
//   hsn?: string;
// }
// interface SaleLine {
//   item: Item;
//   quantity: number;
//   rate: number;
//   gstApplied?: boolean;
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

// // --- Helpers ---
// const inr = (n: number) =>
//   n.toLocaleString("en-IN", {
//     minimumFractionDigits: 2,
//     maximumFractionDigits: 2,
//   });

// function amountInWords(num: number) {
//   const a = [
//     "",
//     "One",
//     "Two",
//     "Three",
//     "Four",
//     "Five",
//     "Six",
//     "Seven",
//     "Eight",
//     "Nine",
//     "Ten",
//     "Eleven",
//     "Twelve",
//     "Thirteen",
//     "Fourteen",
//     "Fifteen",
//     "Sixteen",
//     "Seventeen",
//     "Eighteen",
//     "Nineteen",
//   ];
//   const b = [
//     "",
//     "",
//     "Twenty",
//     "Thirty",
//     "Forty",
//     "Fifty",
//     "Sixty",
//     "Seventy",
//     "Eighty",
//     "Ninety",
//   ];
//   const n = Math.floor(num);
//   if (n === 0) return "Zero Rupees";
//   const toWords = (s: number): string => {
//     if (s < 20) return a[s];
//     if (s < 100)
//       return `${b[Math.floor(s / 10)]}${s % 10 ? " " + a[s % 10] : ""}`;
//     if (s < 1000)
//       return `${a[Math.floor(s / 100)]} Hundred${
//         s % 100 ? " " + toWords(s % 100) : ""
//       }`;
//     if (s < 100000)
//       return `${toWords(Math.floor(s / 1000))} Thousand${
//         s % 1000 ? " " + toWords(s % 1000) : ""
//       }`;
//     if (s < 10000000)
//       return `${toWords(Math.floor(s / 100000))} Lakh${
//         s % 100000 ? " " + toWords(s % 100000) : ""
//       }`;
//     return `${toWords(Math.floor(s / 10000000))} Crore${
//       s % 10000000 ? " " + toWords(s % 10000000) : ""
//     }`;
//   };
//   const rupees = toWords(n) + " Rupees";
//   const paise = Math.round((num - n) * 100);
//   return paise ? `${rupees} and ${toWords(paise)} Paise` : rupees;
// }

// export default function ViewInvoicePage() {
//   const params = useParams() as { id?: string };
//   const router = useRouter();
//   const saleId = params?.id;

//   const [company, setCompany] = useState({
//     name: "Your Company Name",
//     address: "Street, City, State - PIN",
//     gstin: "22AAAAA0000A1Z5",
//     pan: "AAAAA0000A",
//     phone: "99999 99999",
//     email: "info@yourcompany.com",
//     bank: {
//       name: "HDFC Bank",
//       accountName: "Your Company Name",
//       accountNo: "1234567890",
//       ifsc: "HDFC0000000",
//       upi: "yourname@upi",
//     },
//     state: "Karnataka",
//   });

//   const [sale, setSale] = useState<Sale | null>(null);
//   const [loading, setLoading] = useState(true);
//   const [saving, setSaving] = useState(false);
//   const [error, setError] = useState<string | null>(null);
//   const [intraState, setIntraState] = useState(true);
//   const [notes, setNotes] = useState("Thank you for your business!");
//   const [signature, setSignature] = useState("Authorised Signatory");

//   // ref for printing
//   const contentRef = useRef<HTMLDivElement | null>(null);
//   const handlePrint = useReactToPrint({
//     content: () => contentRef.current,
//     documentTitle: sale ? `invoice_${sale.invoiceNo}` : "invoice",
//   });

//   useEffect(() => {
//     const load = async () => {
//       if (!saleId) {
//         setError("Missing sale id");
//         setLoading(false);
//         return;
//       }
//       try {
//         const res = await axios.get(`/api/sale/${saleId}`);
//         // accept either res.data or res.data.data
//         const s = (res.data && (res.data.data || res.data)) as Sale;
//         if (!s) {
//           setError("Invoice not found");
//         } else {
//           const items = (s.items || []).map((ln) => ({
//             ...ln,
//             gstApplied: ln.gstApplied ?? true,
//           }));
//           setSale({ ...s, items });
//           const customerState = s.billTo?.state || company.state;
//           setIntraState(
//             (customerState || "").toLowerCase() === (company.state || "").toLowerCase()
//           );
//         }
//       } catch (e: any) {
//         setError(e?.response?.data?.message || "Failed to load invoice");
//       } finally {
//         setLoading(false);
//       }
//     };
//     load();
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, [saleId]);

//   const updateBillTo = (fields: Partial<Customer>) =>
//     setSale((prev) => (prev ? { ...prev, billTo: { ...prev.billTo, ...fields } } : prev));

//   const addItem = () =>
//     setSale((prev) =>
//       prev
//         ? {
//             ...prev,
//             items: [
//               ...prev.items,
//               {
//                 item: {
//                   _id: "custom-" + Date.now().toString(),
//                   name: "New Item",
//                   purchasePrice: 0,
//                   gstRate: 0,
//                   hsn: "",
//                 },
//                 quantity: 1,
//                 rate: 0,
//                 gstApplied: true,
//               },
//             ],
//           }
//         : prev
//     );

//   const removeItem = (idx: number) =>
//     setSale((prev) => (prev ? { ...prev, items: prev.items.filter((_, i) => i !== idx) } : prev));

//   const updateItem = (idx: number, fields: Partial<SaleLine> & { item?: Partial<Item> }) =>
//     setSale((prev) => {
//       if (!prev) return prev;
//       const items = prev.items.slice();
//       const current = items[idx];
//       items[idx] = {
//         ...current,
//         ...fields,
//         item: { ...current.item, ...(fields.item || {}) },
//       };
//       return { ...prev, items };
//     });

//   const updateMeta = (fields: Partial<Sale>) => setSale((p) => (p ? { ...p, ...fields } : p));

//   // const totals = useMemo(() => {
//   //   if (!sale) return { subTotal: 0, gst: 0, cgst: 0, sgst: 0, igst: 0, grandTotal: 0 };

//   //   let subTotal = 0;
//   //   let gst = 0;

//   //   for (const ln of sale.items) {
//   //     const qty = Number(ln.quantity) || 0;
//   //     const rate = Number(ln.rate) || 0;
//   //     const lineTaxable = qty * rate;
//   //     subTotal += lineTaxable;

//   //     const rateGST = ln.gstApplied ? Number(ln.item?.gstRate || 0) : 0;
//   //     gst += (lineTaxable * rateGST) / 100;
//   //   }

//   //   const cgst = intraState ? gst / 2 : 0;
//   //   const sgst = intraState ? gst / 2 : 0;
//   //   const igst = intraState ? 0 : gst;
//   //   const grandTotal = subTotal + gst;

//   //   return { subTotal, gst, cgst, sgst, igst, grandTotal };
//   // }, [sale, intraState]);

// const totals = useMemo(() => {
//   if (!sale) return { subTotal: 0, cgst: 0, sgst: 0, igst: 0, grandTotal: 0 };

//   let subTotal = 0;
//   for (const ln of sale.items) {
//     const qty = Number(ln.quantity) || 0;
//     const rate = Number(ln.rate) || 0;
//     subTotal += qty * rate;
//   }

//   // System-calculated GST (backup)
//   let systemCGST = intraState ? subTotal * 0.09 : 0;
//   let systemSGST = intraState ? subTotal * 0.09 : 0;
//   let systemIGST = intraState ? 0 : subTotal * 0.18;

//   // ✅ Allow manual override
//   const cgst = sale.cgst ?? systemCGST;
//   const sgst = sale.sgst ?? systemSGST;
//   const igst = sale.igst ?? systemIGST;

//   // ✅ Discount
//   let discountAmount = 0;
//   if (sale.discountType === "percent") {
//     discountAmount = (subTotal * (Number(sale.discountValue) || 0)) / 100;
//   } else {
//     discountAmount = Number(sale.discountValue) || 0;
//   }

//   // ✅ Additional Tax
//   const additionalTax = Number(sale.additionalTax || 0);

//   // ✅ Grand Total
//   const grandTotal = subTotal + cgst + sgst + igst - discountAmount + additionalTax;

//   return { subTotal, cgst, sgst, igst, discountAmount, additionalTax, grandTotal };
// }, [sale, intraState]);



//   const saveInvoice = async () => {
//     if (!sale) return;
//     setSaving(true);
//     try {
//       const payload = {
//         ...sale,
//         invoiceAmount: totals.grandTotal,
//         notes,
//         signature,
//         taxMode: intraState ? "intra" : "inter",
//       };
//       await axios.put(`/api/sale/${sale._id}`, payload);
//       alert("Invoice saved");
//       // reload
//       const res = await axios.get(`/api/sale/${saleId}`);
//       const s = (res.data && (res.data.data || res.data)) as Sale;
//       if (s) {
//         const items = (s.items || []).map((ln) => ({ ...ln, gstApplied: ln.gstApplied ?? true }));
//         setSale({ ...s, items });
//       }
//     } catch (e: any) {
//       alert(e?.response?.data?.message || "Failed to save invoice");
//     } finally {
//       setSaving(false);
//     }
//   };

//   const exportExcel = () => {
//     if (!sale) return;
//     const rows = sale.items.map((ln, i) => {
//       const qty = Number(ln.quantity) || 0;
//       const rate = Number(ln.rate) || 0;
//       const taxable = qty * rate;
//       const gstRate = ln.gstApplied ? Number(ln.item?.gstRate || 0) : 0;
//       const gstAmt = (taxable * gstRate) / 100;
//       return {
//         "#": i + 1,
//         Item: ln.item?.name || "",
//         HSN: ln.item?.hsn || "",
//         Qty: qty,
//         Rate: rate,
//         "Taxable Value": taxable,
//         "GST %": gstRate,
//         "GST Amount": gstAmt,
//       };
//     });

//     rows.push(
//       { "#": "", Item: "", HSN: "", Qty: "", Rate: "", "Taxable Value": "Sub Total", "GST %": "", "GST Amount": totals.subTotal },
//       intraState
//         ? { "#": "", Item: "", HSN: "", Qty: "", Rate: "", "Taxable Value": "CGST", "GST %": "", "GST Amount": totals.cgst }
//         : { "#": "", Item: "", HSN: "", Qty: "", Rate: "", "Taxable Value": "IGST", "GST %": "", "GST Amount": totals.igst },
//       intraState
//         ? { "#": "", Item: "", HSN: "", Qty: "", Rate: "", "Taxable Value": "SGST", "GST %": "", "GST Amount": totals.sgst }
//         : { "#": "", Item: "", HSN: "", Qty: "", Rate: "", "Taxable Value": "", "GST %": "", "GST Amount": "" },
//       { "#": "", Item: "", HSN: "", Qty: "", Rate: "", "Taxable Value": "Grand Total", "GST %": "", "GST Amount": totals.grandTotal }
//     );

//     const ws = XLSX.utils.json_to_sheet(rows);
//     const wb = XLSX.utils.book_new();
//     XLSX.utils.book_append_sheet(wb, ws, `Invoice_${sale.invoiceNo}`);
//     XLSX.writeFile(wb, `invoice_${sale.invoiceNo}.xlsx`);
//   };

//   const exportPDF = () => {
//     if (!sale) return;
//     const doc = new jsPDF({ unit: "pt", format: "a4" });

//     const marginX = 40;
//     let y = 40;

//     doc.setFontSize(16);
//     doc.text(company.name || "", marginX, y);
//     doc.setFontSize(10);
//     y += 14;
//     doc.text(company.address || "", marginX, y);
//     y += 12;
//     doc.text(`GSTIN: ${company.gstin || "-"}   PAN: ${company.pan || "-"}`, marginX, y);
//     y += 12;
//     doc.text(`Phone: ${company.phone || "-"}   Email: ${company.email || "-"}`, marginX, y);

//     y += 20;
//     doc.setFontSize(14);
//     doc.text("Tax Invoice", marginX, y);
//     doc.setFontSize(10);
//     y += 16;
//     doc.text(`Invoice No: ${sale.invoiceNo}`, marginX, y);
//     y += 12;
//     doc.text(`Date: ${format(new Date(sale.date), "dd/MM/yyyy")}`, marginX, y);

//     y += 18;
//     doc.setFontSize(12);
//     doc.text("Bill To", marginX, y);
//     doc.setFontSize(10);
//     y += 14;
//     doc.text(`${sale.billTo?.name || ""}`, marginX, y);
//     y += 12;
//     if (sale.billTo?.mobile) doc.text(`Mobile: ${sale.billTo.mobile}`, marginX, y);
//     if (sale.billTo?.mobile) y += 12;
//     if (sale.billTo?.address) {
//       const lines = doc.splitTextToSize(sale.billTo.address, 250);
//       lines.forEach((l: string) => {
//         doc.text(l, marginX, y);
//         y += 12;
//       });
//     }

//     const body = sale.items.map((ln, i) => {
//       const qty = Number(ln.quantity) || 0;
//       const rate = Number(ln.rate) || 0;
//       const taxable = qty * rate;
//       const gstRate = ln.gstApplied ? Number(ln.item?.gstRate || 0) : 0;
//       const gstAmt = (taxable * gstRate) / 100;
//       return [String(i + 1), ln.item?.name || "", ln.item?.hsn || "", qty, inr(rate), inr(taxable), `${gstRate}%`, inr(gstAmt)];
//     });

//     autoTable(doc, {
//       startY: y + 6,
//       head: [["#", "Item", "HSN", "Qty", "Rate", "Taxable", "GST %", "GST Amt"]],
//       body,
//       styles: { fontSize: 9, cellPadding: 4, halign: "left", valign: "middle" },
//       headStyles: { fillColor: [235, 235, 235] },
//       columnStyles: {
//         0: { cellWidth: 24, halign: "center" },
//         2: { cellWidth: 60 },
//         3: { halign: "right" },
//         4: { halign: "right" },
//         5: { halign: "right" },
//         7: { halign: "right" },
//       },
//       margin: { left: marginX, right: marginX },
//     });

//     const afterTableY = (doc as any).lastAutoTable?.finalY || y + 40;

//     const totalsX = 330;
//     let y2 = afterTableY + 12;
//     doc.setFontSize(10);
//     doc.text(`Sub Total: ₹ ${inr(totals.subTotal)}`, totalsX, y2);
//     y2 += 12;
//     if (intraState) {
//       doc.text(`CGST: ₹ ${inr(totals.cgst)}`, totalsX, y2);
//       y2 += 12;
//       doc.text(`SGST: ₹ ${inr(totals.sgst)}`, totalsX, y2);
//       y2 += 12;
//     } else {
//       doc.text(`IGST: ₹ ${inr(totals.igst)}`, totalsX, y2);
//       y2 += 12;
//     }
//     doc.setFont(undefined, "bold");
//     doc.text(`Grand Total: ₹ ${inr(totals.grandTotal)}`, totalsX, y2);
//     doc.setFont(undefined, "normal");

//     y2 += 18;
//     doc.setFontSize(10);
//     doc.text(`Amount in words: ${amountInWords(totals.grandTotal)}`, marginX, y2, { maxWidth: 500 });

//     y2 += 20;
//     doc.setFontSize(11);
//     doc.text("Bank Details:", marginX, y2);
//     doc.setFontSize(10);
//     y2 += 12;
//     doc.text(`${company.bank.accountName} • ${company.bank.name} • A/C: ${company.bank.accountNo} • IFSC: ${company.bank.ifsc}`, marginX, y2);
//     y2 += 12;
//     if (company.bank.upi) doc.text(`UPI: ${company.bank.upi}`, marginX, y2);

//     y2 += 18;
//     if (notes) {
//       doc.setFontSize(10);
//       doc.text("Notes:", marginX, y2);
//       y2 += 12;
//       const nlines = doc.splitTextToSize(notes, 500);
//       nlines.forEach((l: string) => {
//         doc.text(l, marginX, y2);
//         y2 += 12;
//       });
//     }

//     const signY = y2 + 30;
//     doc.text("For " + (company.name || ""), 400, signY);
//     doc.text("(Authorised Signatory)", 400, signY + 40);

//     doc.save(`invoice_${sale.invoiceNo}.pdf`);
//   };

//   if (loading) {
//     return <div className="p-6">Loading invoice…</div>;
//   }
//   if (error || !sale) {
//     return (
//       <div className="p-6 text-red-600">
//         {error || "Invoice not found"}
//         <div className="mt-4">
//           <button className="px-3 py-2 border rounded" onClick={() => router.push("/dashboard/sale")}>
//             Back to Sales
//           </button>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className="p-6 print:p-0">
//       <div className="flex flex-wrap gap-2 mb-4 print:hidden">
//         <button className="px-3 py-2 border rounded" onClick={() => router.push("/dashboard/sale")}>← Back</button>
//         <button className="px-3 py-2 border rounded" onClick={saveInvoice} disabled={saving}>{saving ? "Saving…" : "Save"}</button>
//         <button className="px-3 py-2 border rounded" onClick={handlePrint}>Print</button>
//         <button className="px-3 py-2 border rounded" onClick={exportPDF}>Download PDF</button>
//         <button className="px-3 py-2 border rounded" onClick={exportExcel}>Export Excel</button>
//         <label className="flex items-center gap-2 ml-4">
//           <input type="checkbox" checked={intraState} onChange={(e) => setIntraState(e.target.checked)} />
//           Intra-state (CGST+SGST)
//         </label>
//       </div>

//       <div ref={contentRef} className="bg-white shadow rounded-lg p-6 print:shadow-none print:rounded-none print:p-4">
//         {/* header, bill to, items, totals... (kept same as your posted markup) */}

//         {/* Header */}
//         <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 border-b pb-4">
//           <div>
//             <input className="text-2xl font-bold outline-none" value={company.name} onChange={(e) => setCompany({ ...company, name: e.target.value })} />
//             <textarea className="block text-sm text-gray-700 mt-1 outline-none w-full resize-y" value={company.address} onChange={(e) => setCompany({ ...company, address: e.target.value })} />
//             <div className="text-sm text-gray-700 mt-1 space-x-3">
//               <input className="outline-none w-36" value={company.gstin} onChange={(e) => setCompany({ ...company, gstin: e.target.value })} />
//               <input className="outline-none w-28" value={company.pan} onChange={(e) => setCompany({ ...company, pan: e.target.value })} />
//             </div>
//             <div className="text-sm text-gray-700 mt-1 space-x-3">
//               <input className="outline-none w-36" value={company.phone} onChange={(e) => setCompany({ ...company, phone: e.target.value })} placeholder="Phone" />
//               <input className="outline-none w-56" value={company.email} onChange={(e) => setCompany({ ...company, email: e.target.value })} placeholder="Email" />
//               <input className="outline-none w-40" value={company.state} onChange={(e) => setCompany({ ...company, state: e.target.value })} placeholder="Company State" />
//             </div>
//           </div>

//           <div className="text-sm">
//             <div className="font-semibold text-lg">Tax Invoice</div>
//             <div className="mt-2">
//               <div className="flex items-center gap-2">
//                 <span className="w-28 text-gray-600">Invoice No:</span>
//                 <div className="font-medium">{sale.invoiceNo}</div>
//               </div>
//               <div className="flex items-center gap-2 mt-1">
//                 <span className="w-28 text-gray-600">Invoice Date:</span>
//                 <input type="date" className="border rounded px-2 py-1" value={sale.date ? format(new Date(sale.date), "yyyy-MM-dd") : ""} onChange={(e) => updateMeta({ date: e.target.value })} />
//               </div>
//               <div className="flex items-center gap-2 mt-1">
//                 <span className="w-28 text-gray-600">Payment:</span>
//                 <select className="border rounded px-2 py-1" value={sale.paymentStatus} onChange={(e) => updateMeta({ paymentStatus: e.target.value as Sale["paymentStatus"] })}>
//                   <option value="unpaid">Unpaid</option>
//                   <option value="cash">Cash</option>
//                   <option value="online">Online</option>
//                 </select>
//               </div>
//             </div>
//           </div>
//         </div>

//         {/* Bill To */}
//         <div className="grid md:grid-cols-2 gap-4 mt-4">
//           <div className="border rounded p-3">
//             <div className="font-semibold mb-2">Bill To</div>
//             <input className="w-full border rounded px-2 py-1 mb-2" placeholder="Customer Name" value={sale.billTo?.name || ""} onChange={(e) => updateBillTo({ name: e.target.value })} />
//             <input className="w-full border rounded px-2 py-1 mb-2" placeholder="Mobile" value={sale.billTo?.mobile || ""} onChange={(e) => updateBillTo({ mobile: e.target.value })} />
//             <textarea className="w-full border rounded px-2 py-1 mb-2" placeholder="Billing Address" value={sale.billTo?.address || ""} onChange={(e) => updateBillTo({ address: e.target.value })} />
//             <input className="w-full border rounded px-2 py-1" placeholder="State" value={sale.billTo?.state || ""} onChange={(e) => updateBillTo({ state: e.target.value })} />
//           </div>

//           <div className="border rounded p-3">
//             <div className="font-semibold mb-2">Bank Details (Optional)</div>
//             <div className="grid grid-cols-2 gap-2">
//               <input className="border rounded px-2 py-1" placeholder="Bank Name" value={company.bank.name} onChange={(e) => setCompany({ ...company, bank: { ...company.bank, name: e.target.value } })} />
//               <input className="border rounded px-2 py-1" placeholder="Account Name" value={company.bank.accountName} onChange={(e) => setCompany({ ...company, bank: { ...company.bank, accountName: e.target.value } })} />
//               <input className="border rounded px-2 py-1" placeholder="Account No" value={company.bank.accountNo} onChange={(e) => setCompany({ ...company, bank: { ...company.bank, accountNo: e.target.value } })} />
//               <input className="border rounded px-2 py-1" placeholder="IFSC" value={company.bank.ifsc} onChange={(e) => setCompany({ ...company, bank: { ...company.bank, ifsc: e.target.value } })} />
//               <input className="border rounded px-2 py-1 col-span-2" placeholder="UPI ID" value={company.bank.upi} onChange={(e) => setCompany({ ...company, bank: { ...company.bank, upi: e.target.value } })} />
//             </div>
//           </div>
//         </div>

//         {/* Items & table (keeps your table markup) */}
//         <div className="mt-6">
//           <div className="flex items-center justify-between mb-2">
//             <div className="font-semibold text-lg">Items</div>
//             <button className="px-3 py-1 border rounded" onClick={addItem}>+ Add Item</button>
//           </div>

//           <div className="overflow-x-auto">
//             <table className="w-full border">
//               <thead className="bg-gray-50">
//                 <tr className="text-left text-sm">
//                   <th className="border px-2 py-2 w-10">#</th>
//                   <th className="border px-2 py-2">Item</th>
//                   <th className="border px-2 py-2">HSN/SAC</th>
//                   <th className="border px-2 py-2 text-right">Qty</th>
//                   <th className="border px-2 py-2 text-right">Price</th>
//                   <th className="border px-2 py-2 text-right">Taxable Rate</th>
//                   <th className="border px-2 py-2 text-right">GST %</th>
//                   <th className="border px-2 py-2 text-center print:hidden">GST?</th>
//                   <th className="border px-2 py-2 w-12 print:hidden">Action</th>
//                 </tr>
//               </thead>
//               <tbody>
//                 {sale.items.map((ln, i) => {
//                   const qty = Number(ln.quantity) || 0;
//                   const rate = Number(ln.rate) || 0;
//                   const taxable = qty * rate;
//                   const gstRate = ln.gstApplied ? Number(ln.item?.gstRate || 0) : 0;
//                   return (
//                     <tr key={i} className="text-sm">
//                       <td className="border px-2 py-2">{i + 1}</td>
//                       <td className="border px-2 py-2">
//                         <input className="w-full outline-none" value={ln.item?.name || ""} onChange={(e) => updateItem(i, { item: { name: e.target.value } })} />
//                       </td>
//                       <td className="border px-2 py-2">
//                         <input className="w-full outline-none" value={ln.item?.hsn || ""} onChange={(e) => updateItem(i, { item: { hsn: e.target.value } })} />
//                       </td>
//                       <td className="border px-2 py-2 text-right">
//                         <input type="number" min={1} className="w-24 text-right outline-none" value={qty} onChange={(e) => updateItem(i, { quantity: Number(e.target.value) })} />
//                       </td>
//                       <td className="border px-2 py-2 text-right">
//                         <input type="number" min={0} className="w-28 text-right outline-none" value={rate} onChange={(e) => updateItem(i, { rate: Number(e.target.value) })} />
//                       </td>
//                       <td className="border px-2 py-2 text-right">{inr(taxable)}</td>
//                       <td className="border px-2 py-2 text-right">
//                         <input type="number" min={0} className="w-20 text-right outline-none" value={ln.item?.gstRate || 0} onChange={(e) => updateItem(i, { item: { gstRate: Number(e.target.value) } })} />
//                       </td>
//                       <td className="border px-2 py-2 text-center print:hidden">
//                         <input type="checkbox" checked={!!ln.gstApplied} onChange={(e) => updateItem(i, { gstApplied: e.target.checked })} />
//                       </td>
//                       <td className="border px-2 py-2 text-center print:hidden">
//                         <button className="px-2 py-1 border rounded text-red-600" onClick={() => removeItem(i)}>Delete</button>
//                       </td>
//                     </tr>
//                   );
//                 })}
//                 {sale.items.length === 0 && (
//                   <tr>
//                     <td className="border px-2 py-4 text-center text-gray-500" colSpan={9}>No items. Click “+ Add Item”.</td>
//                   </tr>
//                 )}
//               </tbody>
//             </table>
//           </div>
//         </div>

//         {/* Totals */}
//         <div className="mt-6 grid md:grid-cols-2 gap-4">
//           <div>
//             <div className="font-semibold mb-2">Notes</div>
//             <textarea className="w-full border rounded px-3 py-2 h-28" value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Any terms or special notes…" />
//           </div>
//           {/* <div className="border rounded p-3">
//             <div className="flex justify-between text-sm"><div>Sub Total</div><div>₹ {inr(totals.subTotal)}</div></div>
//             {intraState ? (
//               <>
//                 <div className="flex justify-between text-sm mt-1"><div>CGST</div><div>₹ {inr(totals.cgst)}</div></div>
//                 <div className="flex justify-between text-sm mt-1"><div>SGST</div><div>₹ {inr(totals.sgst)}</div></div>
//               </>
//             ) : (
//               <div className="flex justify-between text-sm mt-1"><div>IGST</div><div>₹ {inr(totals.igst)}</div></div>
//             )}
//             <div className="flex justify-between mt-2 font-semibold text-lg"><div>Grand Total</div><div>₹ {inr(totals.grandTotal)}</div></div>
//             <div className="text-xs text-gray-600 mt-2">Amount in words: <span className="italic">{amountInWords(totals.grandTotal)}</span></div>
//           </div> */}
//           <div className="border rounded p-3 space-y-2">
//   {/* Subtotal */}
//   <div className="flex justify-between text-sm">
//     <div>Sub Total</div>
//     <div>₹ {inr(totals.subTotal)}</div>
//   </div>

//   {/* GST Inputs */}
//   {intraState ? (
//     <>
//       <div className="flex justify-between text-sm items-center gap-2">
//         <label className="text-gray-700">CGST</label>
//         <input
//           type="number"
//           min={0}
//           className="w-20 border rounded text-right px-2 py-1"
//           value={sale?.cgst ?? totals.cgst}
//           onChange={(e) => updateMeta({ cgst: Number(e.target.value) })}
//         />
//       </div>
//       <div className="flex justify-between text-sm items-center gap-2">
//         <label className="text-gray-700">SGST</label>
//         <input
//           type="number"
//           min={0}
//           className="w-20 border rounded text-right px-2 py-1"
//           value={sale?.sgst ?? totals.sgst}
//           onChange={(e) => updateMeta({ sgst: Number(e.target.value) })}
//         />
//       </div>
//     </>
//   ) : (
//     <div className="flex justify-between text-sm items-center gap-2">
//       <label className="text-gray-700">IGST</label>
//       <input
//         type="number"
//         min={0}
//         className="w-20 border rounded text-right px-2 py-1"
//         value={sale?.igst ?? totals.igst}
//         onChange={(e) => updateMeta({ igst: Number(e.target.value) })}
//       />
//     </div>
//   )}

//   {/* Discount */}
//   <div className="flex justify-between text-sm items-center gap-2">
//     <label className="text-gray-700">Discount</label>
//     <select
//       className="border rounded px-1 py-1 text-sm"
//       value={sale?.discountType || "flat"}
//       onChange={(e) => updateMeta({ discountType: e.target.value })}
//     >
//       <option value="flat">Flat</option>
//       <option value="percent">%</option>
//     </select>
//     <input
//       type="number"
//       min={0}
//       className="w-20 border rounded text-right px-2 py-1"
//       value={sale?.discountValue || 0}
//       onChange={(e) => updateMeta({ discountValue: Number(e.target.value) })}
//     />
//   </div>

//   {/* Additional Tax */}
//   <div className="flex justify-between text-sm items-center gap-2">
//     <label className="text-gray-700">Additional Tax</label>
//     <input
//       type="number"
//       min={0}
//       className="w-24 border rounded text-right px-2 py-1"
//       value={sale?.additionalTax || 0}
//       onChange={(e) => updateMeta({ additionalTax: Number(e.target.value) })}
//     />
//   </div>

//   {/* Grand Total */}
//   <div className="flex justify-between mt-2 font-semibold text-lg">
//     <div>Grand Total</div>
//     <div>₹ {inr(totals.grandTotal)}</div>
//   </div>

//   {/* Amount in words */}
//   <div className="text-xs text-gray-600 mt-2">
//     Amount in words: <span className="italic">{amountInWords(totals.grandTotal)}</span>
//   </div>
// </div>





//         </div>

//         {/* Signature */}
//         <div className="mt-8 grid md:grid-cols-2 gap-4">
//           <div />
//           <div className="text-right">
//             <div>For <span className="font-semibold">{company.name}</span></div>
//             <div className="h-14" />
//             <input className="border-b outline-none text-sm text-right" value={signature} onChange={(e) => setSignature(e.target.value)} />
//             <div className="text-xs text-gray-600">Authorised Signatory</div>
//           </div>
//         </div>
//       </div>

//       <style jsx global>{`
//         @media print {
//           @page { size: A4; margin: 12mm; }
//           body { background: white; }
//           .print\\:hidden { display: none !important; }
//           .print\\:p-0 { padding: 0 !important; }
//           .print\\:shadow-none { box-shadow: none !important; }
//           .print\\:rounded-none { border-radius: 0 !important; }
//         }
//       `}</style>
//     </div>
//   );
// }

