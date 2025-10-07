


// "use client";

// import React, { useEffect, useState, useMemo } from "react";
// import { Button } from "@/components/ui/button";
// import { Input } from "@/components/ui/input";
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
// import axios from "axios";
// import { format } from "date-fns";

// interface Sale {
//   _id: string;
//   invoiceNo: string;
//   invoiceAmount: number;
//   items: {
//     item: { _id: string; name: string };
//     quantity: number;
//     rate: number;
//   }[];
// }

// interface ReturnItem {
//   item: string;
//   quantity: number;
//   rate: number;
//   condition: "good" | "bad"; // good = refundable, bad = not
// }

// export default function ReturnPage() {
//   const [sales, setSales] = useState<Sale[]>([]);
//   const [selectedSaleId, setSelectedSaleId] = useState<string>("");
//   const [returnItems, setReturnItems] = useState<ReturnItem[]>([]);
//   const [open, setOpen] = useState(false);

//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState<string | null>(null);

//   // Fetch sales list
//   useEffect(() => {
//     fetchSales();
//   }, []);

//   const fetchSales = async () => {
//     try {
//       const res = await axios.get("/api/sale", { withCredentials: true });
//       setSales(res.data.data || []);
//     } catch (err: any) {
//       setError(err.response?.data?.message || "Failed to fetch sales");
//     }
//   };

//   // Select invoice → prepare return items
//   const handleSelectSale = (saleId: string) => {
//     setSelectedSaleId(saleId);
//     const sale = sales.find((s) => s._id === saleId);
//     if (sale) {
//       setReturnItems(
//         sale.items.map((it) => ({
//           item: it.item._id,
//           quantity: 0, // nothing returned by default
//           rate: it.rate,
//           condition: "good",
//         }))
//       );
//     }
//   };

//   // Handle quantity update
//   const handleQuantityChange = (index: number, value: number) => {
//     const updated = [...returnItems];
//     const sale = sales.find((s) => s._id === selectedSaleId);
//     const soldQty = sale?.items.find((i) => i.item._id === updated[index].item)?.quantity || 0;
//     updated[index].quantity = Math.min(Math.max(0, value), soldQty);
//     setReturnItems(updated);
//   };

//   // Handle condition toggle
//   const handleConditionChange = (index: number, condition: "good" | "bad") => {
//     const updated = [...returnItems];
//     updated[index].condition = condition;
//     setReturnItems(updated);
//   };

//   // Calculate refundable total (only good items)
//   const refundTotal = useMemo(() => {
//     return returnItems.reduce((sum, it) => {
//       if (it.condition === "good") {
//         return sum + (it.rate * it.quantity || 0);
//       }
//       return sum;
//     }, 0);
//   }, [returnItems]);

//   // Save return
//   const handleSaveReturn = async () => {
//     if (!selectedSaleId) {
//       setError("Please select an invoice first");
//       return;
//     }
//     if (returnItems.every((i) => i.quantity === 0)) {
//       setError("Select at least one item to return");
//       return;
//     }

//     setLoading(true);
//     setError(null);

//     try {
//       await axios.post("/api/return", {
//         saleId: selectedSaleId,
//         items: returnItems.filter((i) => i.quantity > 0),
//         refundAmount: refundTotal,
//         date: format(new Date(), "yyyy-MM-dd"),
//       });
//       alert("Return saved successfully");
//       setOpen(false);
//       setSelectedSaleId("");
//       setReturnItems([]);
//     } catch (err: any) {
//       console.error(err);
//       setError(err.response?.data?.message || "Failed to save return");
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <div className="p-4">
//       {error && <div className="bg-red-100 text-red-700 p-2 mb-4 rounded">{error}</div>}

//       <div className="flex justify-between items-center mb-4">
//         <h1 className="text-xl font-bold">Returns</h1>
//         <Button onClick={() => setOpen(true)}>+ New Return</Button>
//       </div>

//       <Dialog open={open} onOpenChange={setOpen}>
//         <DialogContent className="max-w-lg">
//           <DialogHeader>
//             <DialogTitle>Create Return</DialogTitle>
//           </DialogHeader>

//           {/* Select Invoice */}
//           <Select value={selectedSaleId} onValueChange={handleSelectSale}>
//             <SelectTrigger>
//               <SelectValue placeholder="Select Invoice" />
//             </SelectTrigger>
//             <SelectContent>
//               {sales.map((s) => (
//                 <SelectItem key={s._id} value={s._id}>
//                   {s.invoiceNo} – ₹{s.invoiceAmount}
//                 </SelectItem>
//               ))}
//             </SelectContent>
//           </Select>

//           {/* Items */}
//           {returnItems.length > 0 && (
//             <div className="mt-4 space-y-2">
//               {returnItems.map((it, idx) => {
//                 const sale = sales.find((s) => s._id === selectedSaleId);
//                 const itemData = sale?.items.find((i) => i.item._id === it.item);
//                 return (
//                   <div
//                     key={idx}
//                     className="flex justify-between items-center gap-2 border p-2 rounded"
//                   >
//                     <span className="flex-1">{itemData?.item.name}</span>

//                     <Input
//                       type="number"
//                       min={0}
//                       max={itemData?.quantity || 0}
//                       value={it.quantity}
//                       onChange={(e) => handleQuantityChange(idx, Number(e.target.value))}
//                       className="w-20"
//                     />

//                     <Select
//                       value={it.condition}
//                       onValueChange={(val) => handleConditionChange(idx, val as "good" | "bad")}
//                     >
//                       <SelectTrigger className="w-28">
//                         <SelectValue placeholder="Condition" />
//                       </SelectTrigger>
//                       <SelectContent>
//                         <SelectItem value="good">Good</SelectItem>
//                         <SelectItem value="bad">Bad</SelectItem>
//                       </SelectContent>
//                     </Select>

//                     <span className="w-24 text-right">
//                       {it.condition === "good"
//                         ? `₹${(it.rate * it.quantity).toFixed(2)}`
//                         : "No Refund"}
//                     </span>
//                   </div>
//                 );
//               })}
//             </div>
//           )}

//           {/* Refund Total */}
//           {returnItems.length > 0 && (
//             <div className="text-right font-semibold mt-3">
//               Refundable Total: ₹{refundTotal.toFixed(2)}
//             </div>
//           )}

//           <DialogFooter>
//             <Button variant="outline" onClick={() => setOpen(false)}>
//               Cancel
//             </Button>
//             <Button
//               onClick={handleSaveReturn}
//               disabled={loading || !selectedSaleId || returnItems.every((i) => i.quantity === 0)}
//             >
//               {loading ? "Saving..." : "Save Return"}
//             </Button>
//           </DialogFooter>
//         </DialogContent>
//       </Dialog>
//     </div>
//   );
// }




// "use client";

// import React, { useEffect, useState, useMemo } from "react";
// import { Button } from "@/components/ui/button";
// import { Input } from "@/components/ui/input";
// import { Textarea } from "@/components/ui/textarea";
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
// import { Card, CardContent } from "@/components/ui/card";
// import axios from "axios";
// import { format } from "date-fns";
// import { toast } from "sonner"; // ✅ for better notifications

// interface Sale {
//   _id: string;
//   invoiceNo: string;
//   invoiceAmount: number;
//   date?: string;
//   customerName?: string;
//   items: {
//     item: { _id: string; name: string };
//     quantity: number;
//     rate: number;
//   }[];
// }

// interface ReturnItem {
//   item: string;
//   quantity: number;
//   rate: number;
//   condition: "good" | "bad"; // good = refundable
// }

// export default function ReturnPage() {
//   const [sales, setSales] = useState<Sale[]>([]);
//   const [selectedSaleId, setSelectedSaleId] = useState<string>("");

//   const [returnItems, setReturnItems] = useState<ReturnItem[]>([]);
//   const [open, setOpen] = useState(false);

//   const [reason, setReason] = useState("");
//   const [refundMode, setRefundMode] = useState<"cash" | "bank" | "wallet" | "other" | "">("");

//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState<string | null>(null);

//   // Fetch sales list
//   useEffect(() => {
//     fetchSales();
//   }, []);

//   const fetchSales = async () => {
//     try {
//       const res = await axios.get("/api/sale", { withCredentials: true });
//       setSales(res.data.data || []);
//     } catch (err: any) {
//       setError(err.response?.data?.message || "Failed to fetch sales");
//     }
//   };

//   // Select invoice → prepare return items
//   const handleSelectSale = (saleId: string) => {
//     setSelectedSaleId(saleId);
//     const sale = sales.find((s) => s._id === saleId);
//     if (sale) {
//       setReturnItems(
//         sale.items.map((it) => ({
//           item: it.item._id,
//           quantity: 0,
//           rate: it.rate,
//           condition: "good",
//         }))
//       );
//     }
//   };

//   // Handle quantity update
//   const handleQuantityChange = (index: number, value: number) => {
//     const updated = [...returnItems];
//     const sale = sales.find((s) => s._id === selectedSaleId);
//     const soldQty = sale?.items.find((i) => i.item._id === updated[index].item)?.quantity || 0;
//     updated[index].quantity = Math.min(Math.max(0, value), soldQty);
//     setReturnItems(updated);
//   };

//   // Handle condition toggle
//   const handleConditionChange = (index: number, condition: "good" | "bad") => {
//     const updated = [...returnItems];
//     updated[index].condition = condition;
//     setReturnItems(updated);
//   };

//   // Refund calculation
//   const refundTotal = useMemo(() => {
//     return returnItems.reduce((sum, it) => {
//       if (it.condition === "good") {
//         return sum + (it.rate * it.quantity || 0);
//       }
//       return sum;
//     }, 0);
//   }, [returnItems]);

//   // Save return
//   const handleSaveReturn = async () => {
//     if (!selectedSaleId) return toast.error("Please select an invoice first");
//     if (returnItems.every((i) => i.quantity === 0)) return toast.error("Select at least one item to return");
//     if (!refundMode) return toast.error("Select refund mode");

//     setLoading(true);

//     try {
//       await axios.post("/api/sale-returns", {
//         saleId: selectedSaleId,
//         items: returnItems.filter((i) => i.quantity > 0),
//         refundAmount: refundTotal,
//         reason,
//         refundMode,
//         date: format(new Date(), "yyyy-MM-dd"),
//       });
//       toast.success("Return saved successfully ✅");
//       setOpen(false);
//       setSelectedSaleId("");
//       setReturnItems([]);
//       setReason("");
//       setRefundMode("");
//     } catch (err: any) {
//       console.error(err);
//       toast.error(err.response?.data?.message || "Failed to save return");
//     } finally {
//       setLoading(false);
//     }
//   };

//   const selectedSale = sales.find((s) => s._id === selectedSaleId);

//   return (
//     <div className="p-4">
//       {error && <div className="bg-red-100 text-red-700 p-2 mb-4 rounded">{error}</div>}

//       <div className="flex justify-between items-center mb-4">
//         <h1 className="text-xl font-bold">Returns</h1>
//         <Button onClick={() => setOpen(true)}>+ New Return</Button>
//       </div>

//       <Dialog open={open} onOpenChange={setOpen}>
//         <DialogContent className="max-w-2xl">
//           <DialogHeader>
//             <DialogTitle>Create Return</DialogTitle>
//           </DialogHeader>

//           {/* Invoice Select */}
//           <Select value={selectedSaleId} onValueChange={handleSelectSale}>
//             <SelectTrigger>
//               <SelectValue placeholder="Select Invoice" />
//             </SelectTrigger>
//             <SelectContent>
//               {sales.map((s) => (
//                 <SelectItem key={s._id} value={s._id}>
//                   {s.invoiceNo} – ₹{s.invoiceAmount}
//                 </SelectItem>
//               ))}
//             </SelectContent>
//           </Select>

//           {/* Invoice Info */}
//           {selectedSale && (
//             <Card className="mt-3">
//               <CardContent className="text-sm text-gray-600 p-2">
//                 <div>Invoice Date: {selectedSale.date ? format(new Date(selectedSale.date), "dd MMM yyyy") : "N/A"}</div>
//                 <div>Customer: {selectedSale.customerName || "N/A"}</div>
//                 <div>Invoice Amount: ₹{selectedSale.invoiceAmount}</div>
//               </CardContent>
//             </Card>
//           )}

//           {/* Items */}
//           {returnItems.length > 0 && (
//             <div className="mt-4 space-y-2">
//               {returnItems.map((it, idx) => {
//                 const saleItem = selectedSale?.items.find((i) => i.item._id === it.item);
//                 return (
//                   <div
//                     key={idx}
//                     className="flex justify-between items-center gap-2 border p-2 rounded"
//                   >
//                     <span className="flex-1">{saleItem?.item.name}</span>

//                     <Input
//                       type="number"
//                       min={0}
//                       max={saleItem?.quantity || 0}
//                       value={it.quantity}
//                       onChange={(e) => handleQuantityChange(idx, Number(e.target.value))}
//                       className="w-20"
//                     />

//                     <Select
//                       value={it.condition}
//                       onValueChange={(val) => handleConditionChange(idx, val as "good" | "bad")}
//                     >
//                       <SelectTrigger className="w-28">
//                         <SelectValue placeholder="Condition" />
//                       </SelectTrigger>
//                       <SelectContent>
//                         <SelectItem value="good">Good</SelectItem>
//                         <SelectItem value="bad">Bad</SelectItem>
//                       </SelectContent>
//                     </Select>

//                     <span className={`w-24 text-right ${it.condition === "bad" ? "text-red-500" : "text-green-600"}`}>
//                       {it.condition === "good"
//                         ? `₹${(it.rate * it.quantity).toFixed(2)}`
//                         : "No Refund"}
//                     </span>
//                   </div>
//                 );
//               })}
//             </div>
//           )}

//           {/* Extra fields */}
//           {returnItems.length > 0 && (
//             <div className="mt-4 space-y-3">
//               <Textarea
//                 placeholder="Reason for return (optional)"
//                 value={reason}
//                 onChange={(e) => setReason(e.target.value)}
//               />

//               <Select value={refundMode} onValueChange={(val) => setRefundMode(val as any)}>
//                 <SelectTrigger>
//                   <SelectValue placeholder="Select Refund Mode" />
//                 </SelectTrigger>
//                 <SelectContent>
//                   <SelectItem value="cash">Cash</SelectItem>
//                   <SelectItem value="bank">Bank Transfer</SelectItem>
//                   <SelectItem value="wallet">Wallet Credit</SelectItem>
//                   <SelectItem value="other">Other</SelectItem>
//                 </SelectContent>
//               </Select>
//             </div>
//           )}

//           {/* Refund Summary */}
//           {returnItems.length > 0 && (
//             <div className="text-right font-semibold mt-3">
//               Refundable Total: ₹{refundTotal.toFixed(2)}
//             </div>
//           )}

//           <DialogFooter>
//             <Button variant="outline" onClick={() => setOpen(false)}>
//               Cancel
//             </Button>
//             <Button
//               onClick={handleSaveReturn}
//               disabled={loading || !selectedSaleId || returnItems.every((i) => i.quantity === 0)}
//             >
//               {loading ? "Saving..." : "Save Return"}
//             </Button>
//           </DialogFooter>
//         </DialogContent>
//       </Dialog>
//     </div>
//   );
// }


// "use client";

// import React, { useEffect, useState, useMemo } from "react";
// import { Button } from "@/components/ui/button";
// import { Input } from "@/components/ui/input";
// import { Textarea } from "@/components/ui/textarea";
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
// import { Card, CardContent } from "@/components/ui/card";
// import axios from "axios";
// import { format } from "date-fns";
// import { toast } from "sonner";

// interface Sale {
//   _id: string;
//   invoiceNo: string;
//   invoiceAmount: number;
//   date?: string;
//   customerName?: string;
//   items: {
//     item: { _id: string; name: string };
//     quantity: number;
//     rate: number;
//   }[];
// }

// interface ReturnItem {
//   item: string;
//   quantity: number;
//   rate: number;
//   condition: "good" | "bad";
// }

// export default function ReturnPage() {
//   const [sales, setSales] = useState<Sale[]>([]);
//   const [selectedSaleId, setSelectedSaleId] = useState<string>("");
//   const [returnItems, setReturnItems] = useState<ReturnItem[]>([]);
//   const [open, setOpen] = useState(false);
//   const [reason, setReason] = useState("");
//   const [refundMode, setRefundMode] = useState<"cash" | "bank" | "wallet" | "other" | "">("");
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState<string | null>(null);

//   // Fetch sales
//   useEffect(() => {
//     fetchSales();
//   }, []);

//   const fetchSales = async () => {
//     try {
//       const res = await axios.get("/api/sale", { withCredentials: true });
//       setSales(res.data.data || []);
//     } catch (err: any) {
//       setError(err.response?.data?.message || "Failed to fetch sales");
//     }
//   };

//   // Select invoice
//   const handleSelectSale = (saleId: string) => {
//     setSelectedSaleId(saleId);
//     const sale = sales.find((s) => s._id === saleId);
//     if (sale) {
//       setReturnItems(
//         sale.items.map((it) => ({
//           item: it.item._id,
//           quantity: 0,
//           rate: it.rate,
//           condition: "good",
//         }))
//       );
//     }
//   };

//   // Quantity change
//   const handleQuantityChange = (index: number, value: number) => {
//     const updated = [...returnItems];
//     const sale = sales.find((s) => s._id === selectedSaleId);
//     const soldQty = sale?.items.find((i) => i.item._id === updated[index].item)?.quantity || 0;
//     updated[index].quantity = Math.min(Math.max(0, value), soldQty);
//     setReturnItems(updated);
//   };

//   // Condition change
//   const handleConditionChange = (index: number, condition: "good" | "bad") => {
//     const updated = [...returnItems];
//     updated[index].condition = condition;
//     setReturnItems(updated);
//   };

//   // Refund calculation
//   const refundTotal = useMemo(() => {
//     return returnItems.reduce((sum, it) => {
//       if (it.condition === "good") {
//         return sum + (it.rate * it.quantity || 0);
//       }
//       return sum;
//     }, 0);
//   }, [returnItems]);

//   // Save return
//   const handleSaveReturn = async () => {
//     if (!selectedSaleId) return toast.error("Please select an invoice first");
//     if (returnItems.every((i) => i.quantity === 0)) return toast.error("Select at least one item to return");
//     if (!refundMode) return toast.error("Select refund mode");

//     setLoading(true);

//     const selectedSale = sales.find((s) => s._id === selectedSaleId);
//     if (!selectedSale) {
//       toast.error("Selected sale not found");
//       setLoading(false);
//       return;
//     }

//     try {
//       await axios.post("/api/sale-returns", {
//         saleId: selectedSaleId,
//         items: returnItems
//           .filter((i) => i.quantity > 0)
//           .map((i) => ({
//             product: i.item,
//             name: selectedSale.items.find(si => si.item._id === i.item)?.item.name || "",
//             quantity: i.quantity,
//             unitPrice: i.rate,
//             total: i.quantity * i.rate,
//             condition: i.condition,
//           })),
//         refundAmount: refundTotal,
//         reason,
//         refundMode,
//         subtotal: refundTotal,
//         tax: 0,
//         grandTotal: refundTotal,
//         date: format(new Date(), "yyyy-MM-dd"),
//       });

//       toast.success("Return saved successfully ✅");
//       setOpen(false);
//       setSelectedSaleId("");
//       setReturnItems([]);
//       setReason("");
//       setRefundMode("");
//     } catch (err: any) {
//       console.error(err);
//       toast.error(err.response?.data?.message || "Failed to save return");
//     } finally {
//       setLoading(false);
//     }
//   };

//   const selectedSale = sales.find((s) => s._id === selectedSaleId);

//   return (
//     <div className="p-4">
//       {error && <div className="bg-red-100 text-red-700 p-2 mb-4 rounded">{error}</div>}

//       <div className="flex justify-between items-center mb-4">
//         <h1 className="text-xl font-bold">Returns</h1>
//         <Button onClick={() => setOpen(true)}>+ New Return</Button>
//       </div>

//       <Dialog open={open} onOpenChange={setOpen}>
//         <DialogContent className="max-w-2xl">
//           <DialogHeader>
//             <DialogTitle>Create Return</DialogTitle>
//           </DialogHeader>

//           {/* Invoice Select */}
//           <Select value={selectedSaleId} onValueChange={handleSelectSale}>
//             <SelectTrigger>
//               <SelectValue placeholder="Select Invoice" />
//             </SelectTrigger>
//             <SelectContent>
//               {sales.map((s) => (
//                 <SelectItem key={s._id} value={s._id}>
//                   {s.invoiceNo} – ₹{s.invoiceAmount}
//                 </SelectItem>
//               ))}
//             </SelectContent>
//           </Select>

//           {/* Invoice Info */}
//           {selectedSale && (
//             <Card className="mt-3">
//               <CardContent className="text-sm text-gray-600 p-2">
//                 <div>Invoice Date: {selectedSale.date ? format(new Date(selectedSale.date), "dd MMM yyyy") : "N/A"}</div>
//                 <div>Customer: {selectedSale.customerName || "N/A"}</div>
//                 <div>Invoice Amount: ₹{selectedSale.invoiceAmount}</div>
//               </CardContent>
//             </Card>
//           )}

//           {/* Items */}
//           {returnItems.length > 0 && (
//             <div className="mt-4 space-y-2">
//               {returnItems.map((it, idx) => {
//                 const saleItem = selectedSale?.items.find((i) => i.item._id === it.item);
//                 return (
//                   <div
//                     key={idx}
//                     className="flex justify-between items-center gap-2 border p-2 rounded"
//                   >
//                     <span className="flex-1">{saleItem?.item.name}</span>

//                     <Input
//                       type="number"
//                       min={0}
//                       max={saleItem?.quantity || 0}
//                       value={it.quantity}
//                       onChange={(e) => handleQuantityChange(idx, Number(e.target.value))}
//                       className="w-20"
//                     />

//                     <Select
//                       value={it.condition}
//                       onValueChange={(val) => handleConditionChange(idx, val as "good" | "bad")}
//                     >
//                       <SelectTrigger className="w-28">
//                         <SelectValue placeholder="Condition" />
//                       </SelectTrigger>
//                       <SelectContent>
//                         <SelectItem value="good">Good</SelectItem>
//                         <SelectItem value="bad">Bad</SelectItem>
//                       </SelectContent>
//                     </Select>

//                     <span className={`w-24 text-right ${it.condition === "bad" ? "text-red-500" : "text-green-600"}`}>
//                       {it.condition === "good"
//                         ? `₹${(it.rate * it.quantity).toFixed(2)}`
//                         : "No Refund"}
//                     </span>
//                   </div>
//                 );
//               })}
//             </div>
//           )}

//           {/* Extra fields */}
//           {returnItems.length > 0 && (
//             <div className="mt-4 space-y-3">
//               <Textarea
//                 placeholder="Reason for return (optional)"
//                 value={reason}
//                 onChange={(e) => setReason(e.target.value)}
//               />

//               <Select value={refundMode} onValueChange={(val) => setRefundMode(val as any)}>
//                 <SelectTrigger>
//                   <SelectValue placeholder="Select Refund Mode" />
//                 </SelectTrigger>
//                 <SelectContent>
//                   <SelectItem value="cash">Cash</SelectItem>
//                   <SelectItem value="bank">Bank Transfer</SelectItem>
//                   <SelectItem value="wallet">Wallet Credit</SelectItem>
//                   <SelectItem value="other">Other</SelectItem>
//                 </SelectContent>
//               </Select>
//             </div>
//           )}

//           {/* Refund Summary */}
//           {returnItems.length > 0 && (
//             <div className="text-right font-semibold mt-3">
//               Refundable Total: ₹{refundTotal.toFixed(2)}
//             </div>
//           )}

//           <DialogFooter>
//             <Button variant="outline" onClick={() => setOpen(false)}>
//               Cancel
//             </Button>
//             <Button
//               onClick={handleSaveReturn}
//               disabled={loading || !selectedSaleId || returnItems.every((i) => i.quantity === 0)}
//             >
//               {loading ? "Saving..." : "Save Return"}
//             </Button>
//           </DialogFooter>
//         </DialogContent>
//       </Dialog>
//     </div>
//   );
// }


"use client";

import React, { useEffect, useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
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
import { Card, CardContent } from "@/components/ui/card";
import axios from "axios";
import { format } from "date-fns";
import { toast } from "sonner";

interface Sale {
  _id: string;
  invoiceNo: string;
  invoiceAmount: number;
  date?: string;
  customerName?: string;
  items: {
    item: { _id: string; name: string };
    quantity: number;
    rate: number;
  }[];
}

interface ReturnItem {
  product: string;
  name: string;
  quantity: number;
  unitPrice: number;
  total: number;
  condition: "good" | "bad";
}

interface SaleReturn {
  _id: string;
  saleId: Sale;
  items: ReturnItem[];
  reason?: string;
  refundAmount: number;
  subtotal: number;
  tax: number;
  grandTotal: number;
  refundMode: "cash" | "bank" | "wallet" | "other";
  createdAt: string;
}

export default function ReturnPage() {
  const [sales, setSales] = useState<Sale[]>([]);
  const [returns, setReturns] = useState<SaleReturn[]>([]);
  const [selectedSaleId, setSelectedSaleId] = useState<string>("");
  const [returnItems, setReturnItems] = useState<ReturnItem[]>([]);
  const [open, setOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [reason, setReason] = useState("");
  const [refundMode, setRefundMode] = useState<"cash" | "bank" | "wallet" | "other" | "">("");
  const [loading, setLoading] = useState(false);

  // Fetch sales & returns
  useEffect(() => {
    fetchSales();
    fetchReturns();
  }, []);

  const fetchSales = async () => {
    try {
      const res = await axios.get("/api/sale");
      setSales(res.data.data || []);
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to fetch sales");
    }
  };

  const fetchReturns = async () => {
    try {
      const res = await axios.get("/api/sale-returns");
      setReturns(res.data.data || []);
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to fetch returns");
    }
  };

  // Open new return form
  const openNewReturn = () => {
    setEditId(null);
    setSelectedSaleId("");
    setReturnItems([]);
    setReason("");
    setRefundMode("");
    setOpen(true);
  };

  // Select sale → prepare items
  const handleSelectSale = (saleId: string) => {
    setSelectedSaleId(saleId);
    const sale = sales.find((s) => s._id === saleId);
    if (sale) {
      setReturnItems(
        sale.items.map((it) => ({
          product: it.item._id,
          name: it.item.name,
          quantity: 0,
          unitPrice: it.rate,
          total: 0,
          condition: "good",
        }))
      );
    }
  };

  // Quantity change
  const handleQuantityChange = (index: number, value: number) => {
    const updated = [...returnItems];
    const sale = sales.find((s) => s._id === selectedSaleId);
    const soldQty = sale?.items.find((i) => i.item._id === updated[index].product)?.quantity || 0;
    updated[index].quantity = Math.min(Math.max(0, value), soldQty);
    updated[index].total = updated[index].quantity * updated[index].unitPrice;
    setReturnItems(updated);
  };

  // Condition change
  const handleConditionChange = (index: number, condition: "good" | "bad") => {
    const updated = [...returnItems];
    updated[index].condition = condition;
    setReturnItems(updated);
  };

  // Refund total
  const refundTotal = useMemo(() => {
    return returnItems.reduce((sum, it) => (it.condition === "good" ? sum + it.total : sum), 0);
  }, [returnItems]);

  // Save / update return
  const handleSaveReturn = async () => {
    if (!selectedSaleId) return toast.error("Select an invoice");
    if (!returnItems.some((i) => i.quantity > 0)) return toast.error("Select at least one item");
    if (!refundMode) return toast.error("Select refund mode");
    setLoading(true);

    try {
      const payload = {
        saleId: selectedSaleId,
        items: returnItems.filter((i) => i.quantity > 0),
        refundAmount: refundTotal,
        subtotal: refundTotal,
        tax: 0,
        grandTotal: refundTotal,
        reason,
        refundMode,
      };

      if (editId) {
        await axios.put(`/api/sale-returns/${editId}`, payload);
        toast.success("Return updated successfully");
      } else {
        await axios.post("/api/sale-returns", payload);
        toast.success("Return created successfully");
      }

      fetchReturns();
      setOpen(false);
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Error saving return");
    } finally {
      setLoading(false);
    }
  };

  // // Edit return
  // const handleEditReturn = (ret: SaleReturn) => {
  //   setEditId(ret._id);
  //   setSelectedSaleId(ret.saleId._id);
  //   setReturnItems(ret.items.map((it) => ({ ...it })));
  //   setReason(ret.reason || "");
  //   setRefundMode(ret.refundMode || "cash");
  //   setOpen(true);
  // };
// Edit return
// Edit return
const handleEditReturn = (ret: SaleReturn) => {
  setEditId(ret._id);
  setSelectedSaleId(ret.saleId._id);

  // Map items to match modal's ReturnItem structure
  setReturnItems(
    ret.items.map((it) => ({
      product: it.product,
      name: it.name,
      quantity: it.quantity,
      unitPrice: it.unitPrice,
      total: it.quantity * it.unitPrice, // recalc to avoid errors
      condition: it.condition,
    }))
  );

  // Fill reason and refund mode
  setReason(ret.reason || "");
  setRefundMode(ret.refundMode || "cash"); // default to cash if missing
  setOpen(true); // open modal
};

  // Delete return
  const handleDeleteReturn = async (id: string) => {
    if (!confirm("Are you sure to delete this return?")) return;
    try {
      await axios.delete(`/api/sale-returns/${id}`);
      toast.success("Return deleted");
      fetchReturns();
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to delete return");
    }
  };

  const selectedSale = sales.find((s) => s._id === selectedSaleId);

  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-xl font-bold">Sale Returns</h1>
        <Button onClick={openNewReturn}>+ New Return</Button>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="table-auto w-full border">
          <thead className="bg-gray-100">
            <tr>
              <th className="p-2 border">Invoice No</th>
              <th className="p-2 border">Items</th>
              <th className="p-2 border">Refund Amount</th>
              <th className="p-2 border">Reason</th>
              <th className="p-2 border">Date</th>
              <th className="p-2 border">Actions</th>
            </tr>
          </thead>
          <tbody>
            {returns.map((ret) => (
              <tr key={ret._id}>
                <td className="p-2 border">{ret.saleId.invoiceNo}</td>
                <td className="p-2 border">
                  {ret.items.map((i) => `${i.name} (${i.quantity})`).join(", ")}
                </td>
                <td className="p-2 border">₹{(ret.grandTotal ?? 0).toFixed(2)}</td>
                <td className="p-2 border">{ret.reason || "-"}</td>
                <td className="p-2 border">{format(new Date(ret.createdAt), "dd MMM yyyy")}</td>
                <td className="p-2 border space-x-2">
                  <Button size="sm" onClick={() => handleEditReturn(ret)}>Edit</Button>
                  <Button size="sm" variant="destructive" onClick={() => handleDeleteReturn(ret._id)}>Delete</Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Dialog */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{editId ? "Edit Return" : "New Return"}</DialogTitle>
          </DialogHeader>

          {/* Invoice Select */}
          <Select value={selectedSaleId} onValueChange={handleSelectSale}>
            <SelectTrigger>
              <SelectValue placeholder="Select Invoice" />
            </SelectTrigger>
            <SelectContent>
              {sales.map((s) => (
                <SelectItem key={s._id} value={s._id}>
                  {s.invoiceNo} – ₹{s.invoiceAmount}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Items */}
          {returnItems.length > 0 ? (
            returnItems.map((it, idx) => (
              <div key={idx} className="flex gap-2 mt-2 items-center">
                <span className="flex-1">{it.name}</span>
                <Input
                  type="number"
                  min={0}
                  value={it.quantity}
                  onChange={(e) => handleQuantityChange(idx, Number(e.target.value))}
                  className="w-20"
                />
                <Select value={it.condition} onValueChange={(val) => handleConditionChange(idx, val as "good" | "bad")}>
                  <SelectTrigger className="w-28">
                    <SelectValue placeholder="Condition" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="good">Good</SelectItem>
                    <SelectItem value="bad">Bad</SelectItem>
                  </SelectContent>
                </Select>
                <span className="w-24 text-right">{it.condition === "good" ? `₹${it.total.toFixed(2)}` : "No Refund"}</span>
              </div>
            ))
          ) : (
            <p className="text-gray-500 mt-2">No items available for selected invoice.</p>
          )}

          {/* Extra Fields */}
          <Textarea
            placeholder="Reason for return"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            className="mt-2"
          />

          <Select
            value={refundMode}
            onValueChange={(val) => setRefundMode(val as typeof refundMode)}
          >
            <SelectTrigger className="mt-2">
              <SelectValue placeholder="Select Refund Mode" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="cash">Cash</SelectItem>
              <SelectItem value="bank">Bank Transfer</SelectItem>
              <SelectItem value="wallet">Wallet Credit</SelectItem>
              <SelectItem value="other">Other</SelectItem>
            </SelectContent>
          </Select>

          {/* Refund Summary */}
          <div className="text-right font-semibold mt-3">
            Refundable Total: ₹{refundTotal.toFixed(2)}
          </div>

          <DialogFooter className="flex justify-between mt-2">
            <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
            <Button onClick={handleSaveReturn} disabled={loading}>
              {loading ? "Saving..." : editId ? "Update Return" : "Save Return"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
