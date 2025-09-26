// // File: src/pages/ProductsPage.jsx
// 'use client'
// import { useEffect, useState } from 'react';
// import axios from 'axios';
// import jsPDF from 'jspdf';
// import autoTable from 'jspdf-autotable';
// import Barcode from 'react-barcode';
// import { Html5Qrcode } from 'html5-qrcode';

// export default function ProductsPage() {
//   const [products, setProducts] = useState([]);
//   const [form, setForm] = useState({ name: '', sku: '', category: '', quantity: '', price: '', image: null });
//   const [editingId, setEditingId] = useState(null);
//   const [search, setSearch] = useState('');
//   const [filterCategory, setFilterCategory] = useState('');
//   const [currentPage, setCurrentPage] = useState(1);
//   const [autoSKU, setAutoSKU] = useState(true);
//   const itemsPerPage = 5;

//   const fetchProducts = async () => {
//     const res = await axios.get('http://localhost:4000/api/products');
//     setProducts(res.data);
//   };

//   useEffect(() => {
//     fetchProducts();
//     if (autoSKU) {
//       setForm((prev) => ({ ...prev, sku: `SKU-${Date.now()}` }));
//     }
//   }, []);

//   const handleChange = (e) => {
//     if (e.target.name === 'image') {
//       setForm({ ...form, image: e.target.files[0] });
//     } else {
//       setForm({ ...form, [e.target.name]: e.target.value });
//     }
//   };

//   const handleScan = () => {
//     const scanner = new Html5Qrcode("scanner");
//     scanner.start(
//       { facingMode: "environment" },
//       { fps: 10, qrbox: 250 },
//       async (decodedText) => {
//         scanner.stop();
//         document.getElementById("scanner").innerHTML = '';
//         setAutoSKU(false);
//         setForm((prev) => ({ ...prev, sku: decodedText }));
//         try {
//           const res = await axios.get(`http://localhost:4000/api/products/sku/${decodedText}`);
//           if (res.data) {
//             setForm({
//               name: res.data.name,
//               sku: res.data.sku,
//               category: res.data.category,
//               quantity: res.data.quantity,
//               price: res.data.price,
//               image: null,
//             });
//             setEditingId(res.data._id);
//           }
//         } catch (err) {
//           console.log("Product not found. Proceed with new entry.");
//         }
//       },
//       (err) => console.warn("Scan error:", err)
//     );
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     const formData = new FormData();
//     for (let key in form) formData.append(key, form[key]);

//     if (editingId) {
//       await axios.put(`http://localhost:4000/api/products/${editingId}`, formData);
//     } else {
//       await axios.post('http://localhost:4000/api/products', formData);
//     }
//     fetchProducts();
//     setForm({ name: '', sku: autoSKU ? `SKU-${Date.now()}` : '', category: '', quantity: '', price: '', image: null });
//     setEditingId(null);
//   };

//   const handleEdit = (product) => {
//     setEditingId(product._id);
//     setAutoSKU(false);
//     setForm({ ...product, image: null });
//   };

//   const handleDelete = async (id) => {
//     await axios.delete(`http://localhost:4000/api/products/${id}`);
//     fetchProducts();
//   };

//   const exportPDF = () => {
//     const doc = new jsPDF();
//     autoTable(doc, {
//       head: [['Name', 'SKU', 'Category', 'Qty', 'Price']],
//       body: filteredProducts.map(p => [p.name, p.sku, p.category, p.quantity, p.price])
//     });
//     doc.save('products.pdf');
//   };

//   const filteredProducts = products.filter(p =>
//     (!filterCategory || p.category === filterCategory) &&
//     (p.name.toLowerCase().includes(search.toLowerCase()) || p.sku.toLowerCase().includes(search.toLowerCase()))
//   );

//   const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);
//   const paginatedProducts = filteredProducts.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

//   return (
//     <div className="p-6 max-w-6xl mx-auto">
//       <h1 className="text-2xl font-bold mb-4">Product Management</h1>

//       <form onSubmit={handleSubmit} className="space-y-4 border p-4 rounded bg-gray-50">
//         <input name="name" value={form.name} onChange={handleChange} placeholder="Name" className="w-full p-2 border rounded" required />

//         <div className="border p-2 rounded bg-white">
//           <label className="font-semibold">Scan Barcode to Fill SKU:</label>
//           <button type="button" onClick={handleScan} className="bg-indigo-600 text-white px-3 py-1 rounded ml-2">Start Scanner</button>
//           <div id="scanner" className="mt-2" />
//         </div>

//         <div>
//           <label className="flex items-center space-x-2">
//             <input
//               type="checkbox"
//               checked={autoSKU}
//               onChange={(e) => {
//                 const auto = e.target.checked;
//                 setAutoSKU(auto);
//                 if (auto) {
//                   const generated = `SKU-${Date.now()}`;
//                   setForm((prev) => ({ ...prev, sku: generated }));
//                 } else {
//                   setForm((prev) => ({ ...prev, sku: '' }));
//                 }
//               }}
//             />
//             <span>Auto-generate SKU</span>
//           </label>

//           <input
//             name="sku"
//             value={form.sku}
//             onChange={handleChange}
//             placeholder="SKU"
//             className="w-full p-2 border rounded mt-2"
//             disabled={autoSKU}
//             required
//           />
//         </div>

//         <input name="category" value={form.category} onChange={handleChange} placeholder="Category" className="w-full p-2 border rounded" required />
//         <input name="quantity" type="number" value={form.quantity} onChange={handleChange} placeholder="Quantity" className="w-full p-2 border rounded" required />
//         <input name="price" type="number" value={form.price} onChange={handleChange} placeholder="Price" className="w-full p-2 border rounded" required />
//         <input name="image" type="file" onChange={handleChange} className="w-full p-2 border rounded" />
//         <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded">
//           {editingId ? 'Update Product' : 'Add Product'}
//         </button>
//       </form>

//       <div className="flex justify-between items-center mt-8">
//         <div className="space-x-2">
//           <input
//             type="text"
//             placeholder="Search by name or SKU"
//             value={search}
//             onChange={(e) => setSearch(e.target.value)}
//             className="border p-2 rounded"
//           />
//           <select value={filterCategory} onChange={(e) => setFilterCategory(e.target.value)} className="border p-2 rounded">
//             <option value="">All Categories</option>
//             {[...new Set(products.map(p => p.category))].map(c => (
//               <option key={c} value={c}>{c}</option>
//             ))}
//           </select>
//         </div>
//         <button onClick={exportPDF} className="bg-green-700 text-white px-4 py-2 rounded">Export PDF</button>
//       </div>

//       <div className="mt-4">
//         <table className="w-full border text-left">
//           <thead>
//             <tr className="bg-gray-200">
//               <th className="p-2">Name</th>
//               <th className="p-2">SKU</th>
//               <th className="p-2">Category</th>
//               <th className="p-2">Qty</th>
//               <th className="p-2">Price</th>
//               <th className="p-2">Barcode</th>
//               <th className="p-2">Image</th>
//               <th className="p-2">Actions</th>
//             </tr>
//           </thead>
//           <tbody>
//             {paginatedProducts.map((p) => (
//               <tr key={p._id} className={p.quantity <= (p.lowStockThreshold || 5) ? 'bg-yellow-100' : ''}>
//                 <td className="p-2">{p.name}</td>
//                 <td className="p-2">{p.sku}</td>
//                 <td className="p-2">{p.category}</td>
//                 <td className="p-2">{p.quantity}</td>
//                 <td className="p-2">₹{p.price}</td>
//                 <td className="p-2">
//                   <Barcode value={p.sku} height={40} width={1} displayValue={false} />
//                 </td>
//                 <td className="p-2">
//                   {p.image && <img src={`http://localhost:4000${p.image}`} alt={p.name} className="w-12 h-12 object-cover" />}
//                 </td>
//                 <td className="p-2 space-x-2">
//                   <button onClick={() => handleEdit(p)} className="bg-green-600 text-white px-2 py-1 rounded">Edit</button>
//                   <button onClick={() => handleDelete(p._id)} className="bg-red-600 text-white px-2 py-1 rounded">Delete</button>
//                 </td>
//               </tr>
//             ))}
//           </tbody>
//         </table>

//         <div className="flex justify-center mt-4 space-x-2">
//           {Array.from({ length: totalPages }, (_, i) => (
//             <button
//               key={i}
//               onClick={() => setCurrentPage(i + 1)}
//               className={`px-3 py-1 rounded ${currentPage === i + 1 ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}
//             >
//               {i + 1}
//             </button>
//           ))}
//         </div>
//       </div>
//     </div>
//   );
// }
