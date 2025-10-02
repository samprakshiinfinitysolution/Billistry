

// "use client";

// import React, { useState, useEffect, useMemo } from "react";

// interface Item {
//   _id: string;
//   name: string;
//   unit: string;
//   quantity: number;
//   purchasePrice: number;
//   salePrice: number;
//   lowStockAlert: number;
// }

// const unitOptions = ["pcs", "kg", "litre", "meter", "box"];

// export default function ItemsPage() {
//   const [items, setItems] = useState<Item[]>([]);
//   const [newItem, setNewItem] = useState<Partial<Item>>({});
//   const [editingItemId, setEditingItemId] = useState<string | null>(null);
//   const [searchTerm, setSearchTerm] = useState("");
//   const [sortKey, setSortKey] = useState<keyof Item>("name");
//   const [sortAsc, setSortAsc] = useState(true);
//   const [currentPage, setCurrentPage] = useState(1);
//   const itemsPerPage = 5;

//   // ✅ Fetch Items
//   const fetchItems = async () => {
//     try {
//       const res = await fetch("/api/items");
//       const data = await res.json();
//       if (Array.isArray(data)) {
//         setItems(data);
//       } else {
//         console.error("Unexpected response:", data);
//       }
//     } catch (error) {
//       console.error("Error fetching items:", error);
//     }
//   };

//   useEffect(() => {
//     fetchItems();
//   }, []);

//   // ✅ Add or Update Item
//   const handleAddOrUpdateItem = async () => {
//     const requiredFields = [
//       "name",
//       "unit",
//       "quantity",
//       "purchasePrice",
//       "salePrice",
//       "lowStockAlert",
//     ];

//     const isValid = requiredFields.every((field) =>
//       Boolean((newItem as any)[field])
//     );

//     if (!isValid) {
//       alert("Please fill all fields.");
//       return;
//     }

//     const url = editingItemId ? `/api/items/${editingItemId}` : "/api/items";
//     const method = editingItemId ? "PUT" : "POST";

//     try {
//       await fetch(url, {
//         method,
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify(newItem),
//       });

//       setNewItem({});
//       setEditingItemId(null);
//       fetchItems();
//     } catch (error) {
//       console.error("Failed to save item:", error);
//     }
//   };

//   // ✅ Delete
//   const handleDeleteItem = async (id: string) => {
//     try {
//       await fetch(`/api/items/${id}`, { method: "DELETE" });
//       fetchItems();
//     } catch (error) {
//       console.error("Delete failed:", error);
//     }
//   };

//   // ✅ Edit
//   const handleEdit = (item: Item) => {
//     setNewItem(item);
//     setEditingItemId(item._id);
//   };

//   // ✅ Stock Adjustment (PATCH)
//   const handleStockChange = async (
//     id: string,
//     type: "increase" | "decrease"
//   ) => {
//     try {
//       await fetch(`/api/items/${id}`, {
//         method: "PATCH",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({ type }),
//       });
//       fetchItems();
//     } catch (error) {
//       console.error("Stock update failed:", error);
//     }
//   };

//   const totalStockValue = items.reduce(
//     (acc, item) => acc + item.purchasePrice * item.quantity,
//     0
//   );

//   const lowStockItems = items.filter(
//     (item) => item.quantity <= item.lowStockAlert
//   );

//   const filteredItems = useMemo(() => {
//     return items
//       .filter((item) =>
//         item.name.toLowerCase().includes(searchTerm.toLowerCase())
//       )
//       .sort((a, b) => {
//         const aVal = a[sortKey];
//         const bVal = b[sortKey];
//         if (aVal < bVal) return sortAsc ? -1 : 1;
//         if (aVal > bVal) return sortAsc ? 1 : -1;
//         return 0;
//       });
//   }, [items, searchTerm, sortKey, sortAsc]);

//   const paginatedItems = useMemo(() => {
//     const start = (currentPage - 1) * itemsPerPage;
//     return filteredItems.slice(start, start + itemsPerPage);
//   }, [filteredItems, currentPage]);

//   return (
//     <div className="p-6">
//       <h1 className="text-2xl font-bold mb-4">Items Management</h1>

//       {/* Form */}
//       <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 mb-6">
//         <input
//           type="text"
//           placeholder="Item Name"
//           value={newItem.name || ""}
//           onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
//           className="border p-2 rounded"
//         />
//         <select
//           value={newItem.unit || ""}
//           onChange={(e) => setNewItem({ ...newItem, unit: e.target.value })}
//           className="border p-2 rounded"
//         >
//           <option value="">Unit</option>
//           {unitOptions.map((unit) => (
//             <option key={unit} value={unit}>
//               {unit}
//             </option>
//           ))}
//         </select>
//         <input
//           type="number"
//           min="0"
//           placeholder="Quantity"
//           value={newItem.quantity !== undefined ? newItem.quantity : ""}
//           onChange={(e) =>
//             setNewItem({
//               ...newItem,
//               quantity:
//                 e.target.value === "" ? undefined : Number(e.target.value),
//             })
//           }
//           className="border p-2 rounded"
//         />

//         <input
//           type="number"
//           min="0"
//           placeholder="Purchase Price"
//           value={
//             newItem.purchasePrice !== undefined ? newItem.purchasePrice : ""
//           }
//           onChange={(e) =>
//             setNewItem({
//               ...newItem,
//               purchasePrice:
//                 e.target.value === "" ? undefined : Number(e.target.value),
//             })
//           }
//           className="border p-2 rounded"
//         />

//         <input
//           type="number"
//           min="0"
//           placeholder="Sale Price"
//           value={newItem.salePrice !== undefined ? newItem.salePrice : ""}
//           onChange={(e) =>
//             setNewItem({
//               ...newItem,
//               salePrice:
//                 e.target.value === "" ? undefined : Number(e.target.value),
//             })
//           }
//           className="border p-2 rounded"
//         />

//         <input
//           type="number"
//           placeholder="Low Stock Alert"
//           min="0"
//           value={
//             newItem.lowStockAlert !== undefined ? newItem.lowStockAlert : ""
//           }
//           onChange={(e) =>
//             setNewItem({
//               ...newItem,
//               lowStockAlert:
//                 e.target.value === "" ? undefined : Number(e.target.value),
//             })
//           }
//           className="border p-2 rounded"
//         />

//         <button
//           onClick={handleAddOrUpdateItem}
//           className="col-span-2 bg-blue-500 text-white px-4 py-2 rounded"
//         >
//           {editingItemId ? "Update Item" : "Add Item"}
//         </button>
//       </div>

//       {/* Search + Sort */}
//       <div className="flex flex-wrap items-center justify-between mb-4 gap-2">
//         <input
//           type="text"
//           placeholder="Search..."
//           className="border p-2 rounded w-60"
//           value={searchTerm}
//           onChange={(e) => setSearchTerm(e.target.value)}
//         />
//         <select
//           value={sortKey}
//           onChange={(e) => setSortKey(e.target.value as keyof Item)}
//           className="border p-2 rounded"
//         >
//           <option value="name">Sort by Name</option>
//           <option value="quantity">Sort by Stock</option>
//           <option value="purchasePrice">Sort by Price</option>
//         </select>
//         <button
//           onClick={() => setSortAsc(!sortAsc)}
//           className="px-3 py-1.5 rounded border text-sm font-medium text-blue-600 border-blue-300 hover:bg-blue-50"
//         >
//           {sortAsc ? "Asc" : "Desc"}
//         </button>
//       </div>

//       {/* Table */}
//       <table className="w-full bg-white border shadow-sm text-sm">
//         <thead>
//           <tr className="bg-gray-100">
//             <th className="p-2 border">Name</th>
//             <th className="p-2 border">Unit</th>
//             <th className="p-2 border">Qty</th>
//             <th className="p-2 border">Purchase</th>
//             <th className="p-2 border">Sale</th>
//             <th className="p-2 border">Low Alert</th>
//             <th className="p-2 border">Actions</th>
//           </tr>
//         </thead>
//         <tbody>
//           {paginatedItems.map((item) => (
//             <tr
//               key={item._id}
//               className={item.quantity <= item.lowStockAlert ? "bg-red-50" : ""}
//             >
//               <td className="p-2 border">{item.name}</td>
//               <td className="p-2 border">{item.unit}</td>
//               <td className="p-2 border">{item.quantity}</td>
//               <td className="p-2 border">₹{item.purchasePrice}</td>
//               <td className="p-2 border">₹{item.salePrice}</td>
//               <td className="p-2 border">{item.lowStockAlert}</td>
//               <td className="p-2 border flex space-x-1 justify-center">
//                 <button
//                   onClick={() => handleStockChange(item._id, "increase")}
//                   className="px-2 py-1 bg-green-500 text-white rounded"
//                 >
//                   +
//                 </button>
//                 <button
//                   onClick={() => handleStockChange(item._id, "decrease")}
//                   className="px-2 py-1 bg-yellow-500 text-white rounded"
//                 >
//                   -
//                 </button>
//                 <button
//                   onClick={() => handleEdit(item)}
//                   className="px-2 py-1 bg-blue-500 text-white rounded"
//                 >
//                   Edit
//                 </button>
//                 <button
//                   onClick={() => handleDeleteItem(item._id)}
//                   className="px-2 py-1 bg-red-500 text-white rounded"
//                 >
//                   Delete
//                 </button>
//               </td>
//             </tr>
//           ))}
//         </tbody>
//       </table>

//       {/* Pagination */}
//       <div className="flex justify-between items-center mt-4">
//         <p>Total Stock Value: ₹{totalStockValue.toFixed(2)}</p>
//         <div className="space-x-2">
//           {Array.from(
//             { length: Math.ceil(filteredItems.length / itemsPerPage) },
//             (_, i) => (
//               <button
//                 key={i}
//                 onClick={() => setCurrentPage(i + 1)}
//                 className={`px-3 py-1 rounded ${
//                   currentPage === i + 1
//                     ? "bg-blue-500 text-white"
//                     : "bg-gray-200"
//                 }`}
//               >
//                 {i + 1}
//               </button>
//             )
//           )}
//         </div>
//       </div>

//       {/* Low Stock Alert */}
//       {lowStockItems.length > 0 && (
//         <div className="mt-4 p-3 bg-red-100 text-red-700 rounded">
//           ⚠️ Low stock alert: {lowStockItems.length} item(s) below threshold.
//         </div>
//       )}
//     </div>
//   );
// }





// "use client";

// import {
//   Input,
//   Button,
//   Label,
//   Select,
//   SelectTrigger,
//   SelectContent,
//   SelectItem,
//   SelectValue,
//   Card,
//   CardHeader,
//   CardTitle,
//   CardContent,
// } from "@/components/ui/"; // Make sure each of these components exists

// import React, { useState, useEffect, useMemo } from "react";

// interface Item {
//   _id: string;
//   name: string;
//   unit: string;
//   mrp: number;
//   openingStock: number;
//   purchasePrice: number;
//   salePrice: number;
//   lowStockAlert: number;
// }

// const unitOptions = ["pcs", "kg", "litre", "meter", "box"];

// export default function ItemsPage() {
//   const [items, setItems] = useState<Item[]>([]);
//   const [newItem, setNewItem] = useState<Partial<Item>>({});
//   const [editingItemId, setEditingItemId] = useState<string | null>(null);
//   const [searchTerm, setSearchTerm] = useState("");
//   const [sortKey, setSortKey] = useState<keyof Item>("name");
//   const [sortAsc, setSortAsc] = useState(true);
//   const [currentPage, setCurrentPage] = useState(1);
//   const itemsPerPage = 5;

//   useEffect(() => {
//     fetchItems();
//   }, []);

//   const fetchItems = async () => {
//     try {
//       const res = await fetch("/api/items");
//       const data = await res.json();
//       if (Array.isArray(data)) setItems(data);
//     } catch (err) {
//       console.error("Fetch failed:", err);
//     }
//   };

//   const handleAddOrUpdateItem = async () => {
//     const requiredFields = [
//       "name",
//       "unit",
//       "mrp",
//       "openingStock",
//       "purchasePrice",
//       "salePrice",
//       "lowStockAlert",
//     ];

//     const isValid = requiredFields.every((field) =>
//       Boolean((newItem as any)[field])
//     );
//     if (!isValid) return alert("Please fill all fields.");

//     const method = editingItemId ? "PUT" : "POST";
//     const url = editingItemId ? `/api/items/${editingItemId}` : "/api/items";

//     try {
//       await fetch(url, {
//         method,
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify(newItem),
//       });
//       setNewItem({});
//       setEditingItemId(null);
//       fetchItems();
//     } catch (err) {
//       console.error("Save failed:", err);
//     }
//   };

//   const handleDeleteItem = async (id: string) => {
//     try {
//       await fetch(`/api/items/${id}`, { method: "DELETE" });
//       fetchItems();
//     } catch (err) {
//       console.error("Delete failed:", err);
//     }
//   };

//   const handleEdit = (item: Item) => {
//     setNewItem(item);
//     setEditingItemId(item._id);
//   };

//   const handleStockChange = async (id: string, type: "increase" | "decrease") => {
//     try {
//       await fetch(`/api/items/${id}`, {
//         method: "PATCH",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({ type }),
//       });
//       fetchItems();
//     } catch (err) {
//       console.error("Stock update failed:", err);
//     }
//   };

//   const filteredItems = useMemo(() => {
//     return items
//       .filter((i) => i.name.toLowerCase().includes(searchTerm.toLowerCase()))
//       .sort((a, b) => {
//         const aVal = a[sortKey];
//         const bVal = b[sortKey];
//         if (aVal < bVal) return sortAsc ? -1 : 1;
//         if (aVal > bVal) return sortAsc ? 1 : -1;
//         return 0;
//       });
//   }, [items, searchTerm, sortKey, sortAsc]);

//   const paginatedItems = useMemo(() => {
//     const start = (currentPage - 1) * itemsPerPage;
//     return filteredItems.slice(start, start + itemsPerPage);
//   }, [filteredItems, currentPage]);

//   const lowStockItems = items.filter((i) => i.openingStock <= i.lowStockAlert);
//   const totalStockValue = items.reduce(
//     (sum, item) => sum + item.purchasePrice * item.openingStock,
//     0
//   );

//   return (
//     <div className="p-6 space-y-6">
//       <h1 className="text-3xl font-bold">📦 Inventory Management</h1>

//       <Card>
//         <CardHeader>
//           <CardTitle>{editingItemId ? "Edit Item" : "Add New Item"}</CardTitle>
//         </CardHeader>
//         <CardContent>
//           <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
//             <Input
//               placeholder="Name"
//               value={newItem.name || ""}
//               onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
//             />
//  <Select
//               value={newItem.unit || ""}
//               onValueChange={(val) => setNewItem({ ...newItem, unit: val })}
//             >
//               <SelectTrigger>
//                 <SelectValue placeholder="Unit" />
//               </SelectTrigger>
//               <SelectContent>
//                 {unitOptions.map((unit) => (
//                   <SelectItem key={unit} value={unit}>
//                     {unit}
//                   </SelectItem>
//                 ))}
//               </SelectContent>
//             </Select> 


           


//             <Input
//               type="number"
//               placeholder="Opening Stock"
//               value={newItem.openingStock ?? ""}
//               onChange={(e) =>
//                 setNewItem({ ...newItem, openingStock: Number(e.target.value) })
//               }
//             />
//             <Input
//               type="number"
//               placeholder="Purchase Price"
//               value={newItem.purchasePrice ?? ""}
//               onChange={(e) =>
//                 setNewItem({ ...newItem, purchasePrice: Number(e.target.value) })
//               }
//             />
//             <Input
//               type="number"
//               placeholder="Sale Price"
//               value={newItem.salePrice ?? ""}
//               onChange={(e) =>
//                 setNewItem({ ...newItem, salePrice: Number(e.target.value) })
//               }
//             />
//                <Input
//               type="number"
//               placeholder="MRP"
//               value={newItem.mrp ?? ""}
//               onChange={(e) =>
//                 setNewItem({ ...newItem, mrp: Number(e.target.value) })
//               }
//             />
//             <Input
//               type="number"
//               placeholder="Low Stock Alert"
//               value={newItem.lowStockAlert ?? ""}
//               onChange={(e) =>
//                 setNewItem({
//                   ...newItem,
//                   lowStockAlert: Number(e.target.value),
//                 })
//               }
//             />

//             <Button onClick={handleAddOrUpdateItem} className="col-span-2">
//               {editingItemId ? "Update" : "Add Item"}
//             </Button>
//           </div>
//         </CardContent>
//       </Card>

//       <div className="flex items-center justify-between gap-4 flex-wrap">
//         <Input
//           className="max-w-xs"
//           placeholder="Search items..."
//           value={searchTerm}
//           onChange={(e) => setSearchTerm(e.target.value)}
//         />
//         <div className="flex gap-2">
//           <Select
//             value={sortKey}
//             onValueChange={(val) => setSortKey(val as keyof Item)}
//           >
//             <SelectTrigger>
//               <SelectValue placeholder="Sort by" />
//             </SelectTrigger>
//             <SelectContent>
//               <SelectItem value="name">Name</SelectItem>
//               <SelectItem value="openingStock">Opening Stock</SelectItem>
//               <SelectItem value="purchasePrice">Purchase Price</SelectItem>
//             </SelectContent>
//           </Select>
//           <Button variant="outline" onClick={() => setSortAsc(!sortAsc)}>
//             {sortAsc ? "↑ Asc" : "↓ Desc"}
//           </Button>
//         </div>
//       </div>

//       {/* Table */}
//       <div className="overflow-auto rounded border">
//         <table className="min-w-full text-sm">
//           <thead className="bg-gray-100">
//             <tr>
//               {["Name", "Unit", "Opening Stock","MRP", "Purchase", "Sale", "Low", "Actions"].map(
//                 (h, i) => (
//                   <th key={i} className="p-2 text-left border">
//                     {h}
//                   </th>
//                 )
//               )}
//             </tr>
//           </thead>
//           <tbody>
//             {paginatedItems.map((item) => (
//               <tr
//                 key={item._id}
//                 className={item.openingStock <= item.lowStockAlert ? "bg-red-50" : ""}
//               >
//                 <td className="p-2 border">{item.name}</td>
//                 <td className="p-2 border">{item.unit}</td>
//                 <td className="p-2 border">{item.openingStock}</td>
//                 <td className="p-2 border">₹{item.mrp}</td>
//                 <td className="p-2 border">₹{item.purchasePrice}</td>
//                 <td className="p-2 border">₹{item.salePrice}</td>
//                 <td className="p-2 border">{item.lowStockAlert}</td>
//                 <td className="p-2 border space-x-1">
//                   <Button size="sm" onClick={() => handleStockChange(item._id, "increase")}>+</Button>
//                   <Button size="sm" onClick={() => handleStockChange(item._id, "decrease")}>-</Button>
//                   <Button size="sm" onClick={() => handleEdit(item)}>Edit</Button>
//                   <Button size="sm" variant="destructive" onClick={() => handleDeleteItem(item._id)}>Delete</Button>
//                 </td>
//               </tr>
//             ))}
//           </tbody>
//         </table>
//       </div>

//       {/* Pagination */}
//       <div className="flex justify-between items-center pt-4">
//         <p>Total Stock Value: ₹{totalStockValue.toFixed(2)}</p>
//         <div className="space-x-1">
//           {Array.from({ length: Math.ceil(filteredItems.length / itemsPerPage) }).map(
//             (_, i) => (
//               <Button
//                 key={i}
//                 variant={currentPage === i + 1 ? "default" : "outline"}
//                 size="sm"
//                 onClick={() => setCurrentPage(i + 1)}
//               >
//                 {i + 1}
//               </Button>
//             )
//           )}
//         </div>
//       </div>

//       {/* Low Stock Notice */}
//       {lowStockItems.length > 0 && (
//         <div className="bg-red-100 text-red-800 p-3 rounded mt-4">
//           ⚠️ {lowStockItems.length} item(s) are below low-stock threshold.
//         </div>
//       )}
//     </div>
//   );
// }










// 








<<<<<<< HEAD
// "use client";
=======
<<<<<<< HEAD
// "use client";

// import {
//   Input,
//   Button,
//   Label,
//   Select,
//   SelectTrigger,
//   SelectContent,
//   SelectItem,
//   SelectValue,
//   Card,
//   CardHeader,
//   CardTitle,
//   CardContent,
// } from "@/components/ui"; // adjust path if needed

// import React, { useState, useEffect, useMemo } from "react";

// interface Item {
//   _id: string;
//   name: string;
//   photo?: string;
//   unit: string;
//   purchasePrice: number;
//   mrp: number;
//   openingStock: number;
//   lowStockAlert: number;
//   hsnCode?: string;
//   gstRate?: number;
//   createdAt: string;
//   updatedAt: string;
// }

// const unitOptions = ["pcs", "kg", "litre", "meter", "box"];

// export default function ItemsPage() {
//   const [items, setItems] = useState<Item[]>([]);
//   const [newItem, setNewItem] = useState<Partial<Item>>({});
//   const [editingItemId, setEditingItemId] = useState<string | null>(null);
//   const [searchTerm, setSearchTerm] = useState("");
//   const [sortKey, setSortKey] = useState<keyof Item>("name");
//   const [sortAsc, setSortAsc] = useState(true);
//   const [currentPage, setCurrentPage] = useState(1);
//   const [loading, setLoading] = useState(false);
//   const itemsPerPage = 5;

//   useEffect(() => {
//     fetchItems();
//   }, []);

//   const fetchItems = async () => {
//     setLoading(true);
//     try {
//       const res = await fetch("/api/items");
//       if (!res.ok) throw new Error("Failed to fetch items");
//       const data = await res.json();
//       if (Array.isArray(data)) setItems(data);
//     } catch (err) {
//       console.error("Fetch failed:", err);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleAddOrUpdateItem = async () => {
//     const requiredFields: (keyof Item)[] = [
//       "name",
//       "unit",
//       "mrp",
//       "openingStock",
//       "purchasePrice",
//       "lowStockAlert",
//     ];

//     const isValid = requiredFields.every(
//       (field) => newItem[field] !== undefined && newItem[field] !== ""
//     );
//     if (!isValid) {
//       alert("Please fill all required fields.");
//       return;
//     }

//     const method = editingItemId ? "PUT" : "POST";
//     const url = editingItemId ? `/api/items/${editingItemId}` : "/api/items";

//     try {
//       const res = await fetch(url, {
//         method,
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify(newItem),
//       });
//       if (!res.ok) throw new Error("Save failed");
//       setNewItem({});
//       setEditingItemId(null);
//       fetchItems();
//     } catch (err) {
//       console.error("Save failed:", err);
//     }
//   };

//   const handleDeleteItem = async (id: string) => {
//     if (!confirm("Are you sure you want to delete this item?")) return;
//     try {
//       const res = await fetch(`/api/items/${id}`, { method: "DELETE" });
//       if (!res.ok) throw new Error("Delete failed");
//       fetchItems();
//     } catch (err) {
//       console.error("Delete failed:", err);
//     }
//   };

//   const handleEdit = (item: Item) => {
//     setNewItem(item);
//     setEditingItemId(item._id);
//   };

//   const handleStockChange = async (
//     id: string,
//     type: "increase" | "decrease"
//   ) => {
//     try {
//       const res = await fetch(`/api/items/${id}`, {
//         method: "PATCH",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({ type }),
//       });
//       if (!res.ok) throw new Error("Stock update failed");
//       fetchItems();
//     } catch (err) {
//       console.error("Stock update failed:", err);
//     }
//   };

//   const filteredItems = useMemo(() => {
//     return items
//       .filter((i) => i.name.toLowerCase().includes(searchTerm.toLowerCase()))
//       .sort((a, b) => {
//         const aVal = a[sortKey];
//         const bVal = b[sortKey];
//         if (aVal < bVal) return sortAsc ? -1 : 1;
//         if (aVal > bVal) return sortAsc ? 1 : -1;
//         return 0;
//       });
//   }, [items, searchTerm, sortKey, sortAsc]);

//   const paginatedItems = useMemo(() => {
//     const start = (currentPage - 1) * itemsPerPage;
//     return filteredItems.slice(start, start + itemsPerPage);
//   }, [filteredItems, currentPage]);

//   const lowStockItems = items.filter(
//     (i) => i.openingStock <= i.lowStockAlert
//   );
//   const totalStockValue = items.reduce(
//     (sum, item) => sum + item.purchasePrice * item.openingStock,
//     0
//   );

//   return (
//     <div className="p-6 space-y-6">
//       <h1 className="text-3xl font-bold">📦 Inventory Management</h1>

//       {/* Form */}
//       <Card>
//         <CardHeader>
//           <CardTitle>{editingItemId ? "Edit Item" : "Add New Item"}</CardTitle>
//         </CardHeader>
//         <CardContent>
//           <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
//             <Input
//               placeholder="Name"
//               value={newItem.name || ""}
//               onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
//             />
//             <Input
//               placeholder="Photo URL"
//               value={newItem.photo || ""}
//               onChange={(e) => setNewItem({ ...newItem, photo: e.target.value })}
//             />
//             <Select
//               value={newItem.unit || ""}
//               onValueChange={(val) => setNewItem({ ...newItem, unit: val })}
//             >
//               <SelectTrigger>
//                 <SelectValue placeholder="Unit" />
//               </SelectTrigger>
//               <SelectContent>
//                 {unitOptions.map((unit) => (
//                   <SelectItem key={unit} value={unit}>
//                     {unit}
//                   </SelectItem>
//                 ))}
//               </SelectContent>
//             </Select>
//             <Input
//               type="number"
//               placeholder="Opening Stock"
//               value={newItem.openingStock ?? ""}
//               onChange={(e) =>
//                 setNewItem({
//                   ...newItem,
//                   openingStock: Number(e.target.value),
//                 })
//               }
//             />
//             <Input
//               type="number"
//               placeholder="Purchase Price"
//               value={newItem.purchasePrice ?? ""}
//               onChange={(e) =>
//                 setNewItem({
//                   ...newItem,
//                   purchasePrice: Number(e.target.value),
//                 })
//               }
//             />
//             <Input
//               type="number"
//               placeholder="MRP"
//               value={newItem.mrp ?? ""}
//               onChange={(e) =>
//                 setNewItem({ ...newItem, mrp: Number(e.target.value) })
//               }
//             />
//             <Input
//               type="number"
//               placeholder="Low Stock Alert"
//               value={newItem.lowStockAlert ?? ""}
//               onChange={(e) =>
//                 setNewItem({
//                   ...newItem,
//                   lowStockAlert: Number(e.target.value),
//                 })
//               }
//             />
//             <Input
//               placeholder="HSN Code"
//               value={newItem.hsnCode || ""}
//               onChange={(e) =>
//                 setNewItem({ ...newItem, hsnCode: e.target.value })
//               }
//             />
//             <Input
//               type="number"
//               placeholder="GST Rate (%)"
//               value={newItem.gstRate ?? ""}
//               onChange={(e) =>
//                 setNewItem({
//                   ...newItem,
//                   gstRate: Number(e.target.value),
//                 })
//               }
//             />
//             <Button onClick={handleAddOrUpdateItem} className="col-span-2">
//               {editingItemId ? "Update" : "Add Item"}
//             </Button>
//           </div>
//         </CardContent>
//       </Card>

//       {/* Filters */}
//       <div className="flex items-center justify-between gap-4 flex-wrap">
//         <Input
//           className="max-w-xs"
//           placeholder="Search items..."
//           value={searchTerm}
//           onChange={(e) => setSearchTerm(e.target.value)}
//         />
//         <div className="flex gap-2">
//           <Select
//             value={sortKey}
//             onValueChange={(val) => setSortKey(val as keyof Item)}
//           >
//             <SelectTrigger>
//               <SelectValue placeholder="Sort by" />
//             </SelectTrigger>
//             <SelectContent>
//               <SelectItem value="name">Name</SelectItem>
//               <SelectItem value="openingStock">Opening Stock</SelectItem>
//               <SelectItem value="purchasePrice">Purchase Price</SelectItem>
//             </SelectContent>
//           </Select>
//           <Button variant="outline" onClick={() => setSortAsc(!sortAsc)}>
//             {sortAsc ? "↑ Asc" : "↓ Desc"}
//           </Button>
//         </div>
//       </div>

//       {/* Table */}
//       {loading ? (
//         <div className="text-center py-10">Loading...</div>
//       ) : (
//         <div className="overflow-auto rounded border">
//           <table className="min-w-full text-sm">
//             <thead className="bg-gray-100">
//               <tr>
//                 {[
//                   "Photo",
//                   "Name",
//                   "Unit",
//                   "Opening Stock",
//                   "MRP",
//                   "Purchase",
//                   "Low",
//                   "HSN",
//                   "GST%",
//                   "Actions",
//                 ].map((h, i) => (
//                   <th key={i} className="p-2 text-left border">
//                     {h}
//                   </th>
//                 ))}
//               </tr>
//             </thead>
//             <tbody>
//               {paginatedItems.map((item) => (
//                 <tr
//                   key={item._id}
//                   className={
//                     item.openingStock <= item.lowStockAlert ? "bg-red-50" : ""
//                   }
//                 >
//                   <td className="p-2 border">
//                     {item.photo ? (
//                       <img
//                         src={item.photo}
//                         alt={item.name}
//                         className="w-10 h-10 object-cover rounded"
//                       />
//                     ) : (
//                       "-"
//                     )}
//                   </td>
//                   <td className="p-2 border">{item.name}</td>
//                   <td className="p-2 border">{item.unit}</td>
//                   <td className="p-2 border">{item.openingStock}</td>
//                   <td className="p-2 border">₹{item.mrp}</td>
//                   <td className="p-2 border">₹{item.purchasePrice}</td>
//                   <td className="p-2 border">{item.lowStockAlert}</td>
//                   <td className="p-2 border">{item.hsnCode || "-"}</td>
//                   <td className="p-2 border">{item.gstRate ?? "-"}</td>
//                   <td className="p-2 border space-x-1">
//                     <Button
//                       size="sm"
//                       onClick={() => handleStockChange(item._id, "increase")}
//                     >
//                       +
//                     </Button>
//                     <Button
//                       size="sm"
//                       onClick={() => handleStockChange(item._id, "decrease")}
//                     >
//                       -
//                     </Button>
//                     <Button size="sm" onClick={() => handleEdit(item)}>
//                       Edit
//                     </Button>
//                     <Button
//                       size="sm"
//                       variant="destructive"
//                       onClick={() => handleDeleteItem(item._id)}
//                     >
//                       Delete
//                     </Button>
//                   </td>
//                 </tr>
//               ))}
//             </tbody>
//           </table>
//         </div>
//       )}

//       {/* Pagination */}
//       <div className="flex justify-between items-center pt-4">
//         <p>Total Stock Value: ₹{totalStockValue.toFixed(2)}</p>
//         <div className="space-x-1">
//           {Array.from({
//             length: Math.ceil(filteredItems.length / itemsPerPage),
//           }).map((_, i) => (
//             <Button
//               key={i}
//               variant={currentPage === i + 1 ? "default" : "outline"}
//               size="sm"
//               onClick={() => setCurrentPage(i + 1)}
//             >
//               {i + 1}
//             </Button>
//           ))}
//         </div>
//       </div>

//       {/* Low Stock Notice */}
//       {lowStockItems.length > 0 && (
//         <div className="bg-red-100 text-red-800 p-3 rounded mt-4">
//           ⚠️ {lowStockItems.length} item(s) are below low-stock threshold.
//         </div>
//       )}
//     </div>
//   );
// }
=======
"use client";
>>>>>>> 3cfecf3c8e12ea107b03bcb7f8949aaf453d14ed

// import {
//   Input,
//   Button,
//   Label,
//   Select,
//   SelectTrigger,
//   SelectContent,
//   SelectItem,
//   SelectValue,
//   Card,
//   CardHeader,
//   CardTitle,
//   CardContent,
// } from "@/components/ui"; // adjust path if needed

// import React, { useState, useEffect, useMemo } from "react";

// interface Item {
//   _id: string;
//   name: string;
//   photo?: string;
//   unit: string;
//   purchasePrice: number;
//   mrp: number;
//   openingStock: number;
//   lowStockAlert: number;
//   hsnCode?: string;
//   gstRate?: number;
//   createdAt: string;
//   updatedAt: string;
// }

// const unitOptions = ["pcs", "kg", "litre", "meter", "box"];

// export default function ItemsPage() {
//   const [items, setItems] = useState<Item[]>([]);
//   const [newItem, setNewItem] = useState<Partial<Item>>({});
//   const [editingItemId, setEditingItemId] = useState<string | null>(null);
//   const [searchTerm, setSearchTerm] = useState("");
//   const [sortKey, setSortKey] = useState<keyof Item>("name");
//   const [sortAsc, setSortAsc] = useState(true);
//   const [currentPage, setCurrentPage] = useState(1);
//   const [loading, setLoading] = useState(false);
//   const itemsPerPage = 5;

//   useEffect(() => {
//     fetchItems();
//   }, []);

//   const fetchItems = async () => {
//     setLoading(true);
//     try {
//       const res = await fetch("/api/items");
//       if (!res.ok) throw new Error("Failed to fetch items");
//       const data = await res.json();
//       if (Array.isArray(data)) setItems(data);
//     } catch (err) {
//       console.error("Fetch failed:", err);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleAddOrUpdateItem = async () => {
//     const requiredFields: (keyof Item)[] = [
//       "name",
//       "unit",
//       "mrp",
//       "openingStock",
//       "purchasePrice",
//       "lowStockAlert",
//     ];

//     const isValid = requiredFields.every(
//       (field) => newItem[field] !== undefined && newItem[field] !== ""
//     );
//     if (!isValid) {
//       alert("Please fill all required fields.");
//       return;
//     }

//     const method = editingItemId ? "PUT" : "POST";
//     const url = editingItemId ? `/api/items/${editingItemId}` : "/api/items";

//     try {
//       const res = await fetch(url, {
//         method,
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify(newItem),
//       });
//       if (!res.ok) throw new Error("Save failed");
//       setNewItem({});
//       setEditingItemId(null);
//       fetchItems();
//     } catch (err) {
//       console.error("Save failed:", err);
//     }
//   };

//   const handleDeleteItem = async (id: string) => {
//     if (!confirm("Are you sure you want to delete this item?")) return;
//     try {
//       const res = await fetch(`/api/items/${id}`, { method: "DELETE" });
//       if (!res.ok) throw new Error("Delete failed");
//       fetchItems();
//     } catch (err) {
//       console.error("Delete failed:", err);
//     }
//   };

//   const handleEdit = (item: Item) => {
//     setNewItem(item);
//     setEditingItemId(item._id);
//   };

//   const handleStockChange = async (
//     id: string,
//     type: "increase" | "decrease"
//   ) => {
//     try {
//       const res = await fetch(`/api/items/${id}`, {
//         method: "PATCH",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({ type }),
//       });
//       if (!res.ok) throw new Error("Stock update failed");
//       fetchItems();
//     } catch (err) {
//       console.error("Stock update failed:", err);
//     }
//   };

//   const filteredItems = useMemo(() => {
//     return items
//       .filter((i) => i.name.toLowerCase().includes(searchTerm.toLowerCase()))
//       .sort((a, b) => {
//         const aVal = a[sortKey];
//         const bVal = b[sortKey];
//         if (aVal < bVal) return sortAsc ? -1 : 1;
//         if (aVal > bVal) return sortAsc ? 1 : -1;
//         return 0;
//       });
//   }, [items, searchTerm, sortKey, sortAsc]);

//   const paginatedItems = useMemo(() => {
//     const start = (currentPage - 1) * itemsPerPage;
//     return filteredItems.slice(start, start + itemsPerPage);
//   }, [filteredItems, currentPage]);

//   const lowStockItems = items.filter(
//     (i) => i.openingStock <= i.lowStockAlert
//   );
//   const totalStockValue = items.reduce(
//     (sum, item) => sum + item.purchasePrice * item.openingStock,
//     0
//   );

//   return (
//     <div className="p-6 space-y-6">
//       <h1 className="text-3xl font-bold">📦 Inventory Management</h1>

//       {/* Form */}
//       <Card>
//         <CardHeader>
//           <CardTitle>{editingItemId ? "Edit Item" : "Add New Item"}</CardTitle>
//         </CardHeader>
//         <CardContent>
//           <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
//             <Input
//               placeholder="Name"
//               value={newItem.name || ""}
//               onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
//             />
//             <Input
//               placeholder="Photo URL"
//               value={newItem.photo || ""}
//               onChange={(e) => setNewItem({ ...newItem, photo: e.target.value })}
//             />
//             <Select
//               value={newItem.unit || ""}
//               onValueChange={(val) => setNewItem({ ...newItem, unit: val })}
//             >
//               <SelectTrigger>
//                 <SelectValue placeholder="Unit" />
//               </SelectTrigger>
//               <SelectContent>
//                 {unitOptions.map((unit) => (
//                   <SelectItem key={unit} value={unit}>
//                     {unit}
//                   </SelectItem>
//                 ))}
//               </SelectContent>
//             </Select>
//             <Input
//               type="number"
//               placeholder="Opening Stock"
//               value={newItem.openingStock ?? ""}
//               onChange={(e) =>
//                 setNewItem({
//                   ...newItem,
//                   openingStock: Number(e.target.value),
//                 })
//               }
//             />
//             <Input
//               type="number"
//               placeholder="Purchase Price"
//               value={newItem.purchasePrice ?? ""}
//               onChange={(e) =>
//                 setNewItem({
//                   ...newItem,
//                   purchasePrice: Number(e.target.value),
//                 })
//               }
//             />
//             <Input
//               type="number"
//               placeholder="MRP"
//               value={newItem.mrp ?? ""}
//               onChange={(e) =>
//                 setNewItem({ ...newItem, mrp: Number(e.target.value) })
//               }
//             />
//             <Input
//               type="number"
//               placeholder="Low Stock Alert"
//               value={newItem.lowStockAlert ?? ""}
//               onChange={(e) =>
//                 setNewItem({
//                   ...newItem,
//                   lowStockAlert: Number(e.target.value),
//                 })
//               }
//             />
//             <Input
//               placeholder="HSN Code"
//               value={newItem.hsnCode || ""}
//               onChange={(e) =>
//                 setNewItem({ ...newItem, hsnCode: e.target.value })
//               }
//             />
//             <Input
//               type="number"
//               placeholder="GST Rate (%)"
//               value={newItem.gstRate ?? ""}
//               onChange={(e) =>
//                 setNewItem({
//                   ...newItem,
//                   gstRate: Number(e.target.value),
//                 })
//               }
//             />
//             <Button onClick={handleAddOrUpdateItem} className="col-span-2">
//               {editingItemId ? "Update" : "Add Item"}
//             </Button>
//           </div>
//         </CardContent>
//       </Card>

//       {/* Filters */}
//       <div className="flex items-center justify-between gap-4 flex-wrap">
//         <Input
//           className="max-w-xs"
//           placeholder="Search items..."
//           value={searchTerm}
//           onChange={(e) => setSearchTerm(e.target.value)}
//         />
//         <div className="flex gap-2">
//           <Select
//             value={sortKey}
//             onValueChange={(val) => setSortKey(val as keyof Item)}
//           >
//             <SelectTrigger>
//               <SelectValue placeholder="Sort by" />
//             </SelectTrigger>
//             <SelectContent>
//               <SelectItem value="name">Name</SelectItem>
//               <SelectItem value="openingStock">Opening Stock</SelectItem>
//               <SelectItem value="purchasePrice">Purchase Price</SelectItem>
//             </SelectContent>
//           </Select>
//           <Button variant="outline" onClick={() => setSortAsc(!sortAsc)}>
//             {sortAsc ? "↑ Asc" : "↓ Desc"}
//           </Button>
//         </div>
//       </div>

//       {/* Table */}
//       {loading ? (
//         <div className="text-center py-10">Loading...</div>
//       ) : (
//         <div className="overflow-auto rounded border">
//           <table className="min-w-full text-sm">
//             <thead className="bg-gray-100">
//               <tr>
//                 {[
//                   "Photo",
//                   "Name",
//                   "Unit",
//                   "Opening Stock",
//                   "MRP",
//                   "Purchase",
//                   "Low",
//                   "HSN",
//                   "GST%",
//                   "Actions",
//                 ].map((h, i) => (
//                   <th key={i} className="p-2 text-left border">
//                     {h}
//                   </th>
//                 ))}
//               </tr>
//             </thead>
//             <tbody>
//               {paginatedItems.map((item) => (
//                 <tr
//                   key={item._id}
//                   className={
//                     item.openingStock <= item.lowStockAlert ? "bg-red-50" : ""
//                   }
//                 >
//                   <td className="p-2 border">
//                     {item.photo ? (
//                       <img
//                         src={item.photo}
//                         alt={item.name}
//                         className="w-10 h-10 object-cover rounded"
//                       />
//                     ) : (
//                       "-"
//                     )}
//                   </td>
//                   <td className="p-2 border">{item.name}</td>
//                   <td className="p-2 border">{item.unit}</td>
//                   <td className="p-2 border">{item.openingStock}</td>
//                   <td className="p-2 border">₹{item.mrp}</td>
//                   <td className="p-2 border">₹{item.purchasePrice}</td>
//                   <td className="p-2 border">{item.lowStockAlert}</td>
//                   <td className="p-2 border">{item.hsnCode || "-"}</td>
//                   <td className="p-2 border">{item.gstRate ?? "-"}</td>
//                   <td className="p-2 border space-x-1">
//                     <Button
//                       size="sm"
//                       onClick={() => handleStockChange(item._id, "increase")}
//                     >
//                       +
//                     </Button>
//                     <Button
//                       size="sm"
//                       onClick={() => handleStockChange(item._id, "decrease")}
//                     >
//                       -
//                     </Button>
//                     <Button size="sm" onClick={() => handleEdit(item)}>
//                       Edit
//                     </Button>
//                     <Button
//                       size="sm"
//                       variant="destructive"
//                       onClick={() => handleDeleteItem(item._id)}
//                     >
//                       Delete
//                     </Button>
//                   </td>
//                 </tr>
//               ))}
//             </tbody>
//           </table>
//         </div>
//       )}

//       {/* Pagination */}
//       <div className="flex justify-between items-center pt-4">
//         <p>Total Stock Value: ₹{totalStockValue.toFixed(2)}</p>
//         <div className="space-x-1">
//           {Array.from({
//             length: Math.ceil(filteredItems.length / itemsPerPage),
//           }).map((_, i) => (
//             <Button
//               key={i}
//               variant={currentPage === i + 1 ? "default" : "outline"}
//               size="sm"
//               onClick={() => setCurrentPage(i + 1)}
//             >
//               {i + 1}
//             </Button>
//           ))}
//         </div>
//       </div>

<<<<<<< HEAD
//       {/* Low Stock Notice */}
//       {lowStockItems.length > 0 && (
//         <div className="bg-red-100 text-red-800 p-3 rounded mt-4">
//           ⚠️ {lowStockItems.length} item(s) are below low-stock threshold.
//         </div>
//       )}
//     </div>
//   );
// }
=======
      {/* Low Stock Notice */}
      {lowStockItems.length > 0 && (
        <div className="bg-red-100 text-red-800 p-3 rounded mt-4">
          ⚠️ {lowStockItems.length} item(s) are below low-stock threshold.
        </div>
      )}
    </div>
  );
}
>>>>>>> dcc59acd5f59524ac9f5cc4448fa122e42a677b1
>>>>>>> 3cfecf3c8e12ea107b03bcb7f8949aaf453d14ed
