// 'use client';

// import React, { useEffect, useState, useRef } from 'react';

// interface Party {
//   _id: string;
//   name: string;
//   phone?: string;
//   email?: string;
//   address?: string;
// }

// interface Item {
//   _id: string;
//   name: string;
//   description?: string;
//   rate: number; // base price per unit
//   cgstRate?: number;
//   sgstRate?: number;
//   igstRate?: number;
// }

// interface SelectedItem {
//   itemId: string;
//   quantity: number;
//   rate: number; // editable
//   cgstRate: number; // editable
//   sgstRate: number; // editable
//   igstRate: number; // editable
// }

// export default function CreateInvoice() {
//   // Data states
//   const [customers, setCustomers] = useState<Party[]>([]);
//   const [suppliers, setSuppliers] = useState<Party[]>([]);
//   const [items, setItems] = useState<Item[]>([]);

//   // Form states
//   const [type, setType] = useState<'sale' | 'purchase'>('sale');
//   const [partyId, setPartyId] = useState('');
//   const [selectedItems, setSelectedItems] = useState<SelectedItem[]>([
//     { itemId: '', quantity: 1, rate: 0, cgstRate: 0, sgstRate: 0, igstRate: 0 },
//   ]);
//   const [paymentStatus, setPaymentStatus] = useState('unpaid');
//   const [remarks, setRemarks] = useState('');
//   const [invoiceNo, setInvoiceNo] = useState('');
//   const [invoiceDate, setInvoiceDate] = useState(new Date().toISOString().slice(0, 10));
//   const [showPreview, setShowPreview] = useState(false);
//   const previewRef = useRef<HTMLDivElement>(null);

//   // Fetch customers, suppliers, items
//   useEffect(() => {
//     async function fetchData() {
//       try {
//         const [custRes, suppRes, itemsRes] = await Promise.all([
//           fetch('/api/customers'),
//           fetch('/api/suppliers'),
//           fetch('/api/items'),
//         ]);
//         if (!custRes.ok || !suppRes.ok || !itemsRes.ok)
//           throw new Error('Failed to load data');

//         const custData = await custRes.json();
//         const suppData = await suppRes.json();
//         const itemsData = await itemsRes.json();

//         setCustomers(custData);
//         setSuppliers(suppData);
//         setItems(itemsData);
//       } catch (error) {
//         console.error('Error loading dynamic data:', error);
//         alert('Failed to load customers, suppliers or items');
//       }
//     }
//     fetchData();
//   }, []);

//   // Reset party and items when type changes
//   useEffect(() => {
//     setPartyId('');
//     setSelectedItems([{ itemId: '', quantity: 1, rate: 0, cgstRate: 0, sgstRate: 0, igstRate: 0 }]);
//   }, [type]);

//   // Find selected party info
//   const selectedParty =
//     type === 'sale'
//       ? customers.find(c => c._id === partyId) ?? null
//       : suppliers.find(s => s._id === partyId) ?? null;

//   // On item select change - autofill rate & GST from item master
//   const handleItemChange = (index: number, itemId: string) => {
//     const item = items.find(i => i._id === itemId);
//     setSelectedItems(prev => {
//       const copy = [...prev];
//       copy[index].itemId = itemId;
//       if (item) {
//         copy[index].rate = item.rate ?? 0;
//         copy[index].cgstRate = item.cgstRate ?? 0;
//         copy[index].sgstRate = item.sgstRate ?? 0;
//         copy[index].igstRate = item.igstRate ?? 0;
//       } else {
//         copy[index].rate = 0;
//         copy[index].cgstRate = 0;
//         copy[index].sgstRate = 0;
//         copy[index].igstRate = 0;
//       }
//       return copy;
//     });
//   };

//   // Update selected item fields
//   const updateSelectedItem = (
//     index: number,
//     field: keyof SelectedItem,
//     value: string | number,
//   ) => {
//     setSelectedItems(prev => {
//       const copy = [...prev];
//       copy[index][field] =
//         field === 'quantity' || field === 'rate' || field.includes('Rate')
//           ? Number(value)
//           : (value as string);
//       return copy;
//     });
//   };

//   // Add new empty item row
//   const addNewItem = () => {
//     setSelectedItems(prev => [
//       ...prev,
//       { itemId: '', quantity: 1, rate: 0, cgstRate: 0, sgstRate: 0, igstRate: 0 },
//     ]);
//   };

//   // Remove item row
//   const removeItem = (index: number) => {
//     setSelectedItems(prev => prev.filter((_, i) => i !== index));
//   };

//   // Calculate totals
//   const totals = selectedItems.reduce(
//     (acc, si) => {
//       const qty = si.quantity ?? 0;
//       const base = qty * (si.rate ?? 0);
//       const cgst = ((si.cgstRate ?? 0) / 100) * base;
//       const sgst = ((si.sgstRate ?? 0) / 100) * base;
//       const igst = ((si.igstRate ?? 0) / 100) * base;
//       const total = base + cgst + sgst + igst;

//       acc.subTotal += base;
//       acc.cgstTotal += cgst;
//       acc.sgstTotal += sgst;
//       acc.igstTotal += igst;
//       acc.grandTotal += total;
//       return acc;
//     },
//     { subTotal: 0, cgstTotal: 0, sgstTotal: 0, igstTotal: 0, grandTotal: 0 },
//   );

//   // Submit handler
//   const onSubmit = async (e: React.FormEvent) => {
//     e.preventDefault();
//     setShowPreview(false);

//     if (!partyId) {
//       alert('Please select a customer or supplier');
//       return;
//     }
//     if (selectedItems.some(si => !si.itemId)) {
//       alert('Please select all items');
//       return;
//     }
//     if (!invoiceNo) {
//       alert('Please enter invoice number');
//       return;
//     }

//     const payload = {
//       invoiceNo,
//       type,
//       partyId,
//       items: selectedItems.map(si => ({
//         item: si.itemId,
//         quantity: si.quantity,
//         rate: si.rate,
//         cgstRate: si.cgstRate,
//         sgstRate: si.sgstRate,
//         igstRate: si.igstRate,
//       })),
//       paymentStatus,
//       remarks,
//       invoiceDate,
//     };

//     try {
//       const res = await fetch('/api/invoices', {
//         method: 'POST',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify(payload),
//       });
//       if (!res.ok) {
//         const text = await res.text();
//         throw new Error(text || 'Failed to create invoice');
//       }
//       alert('Invoice created successfully!');
//       // Optionally reset form here
//     } catch (err: any) {
//       alert('Error: ' + (err.message ?? err));
//     }
//   };

//   // Print preview
//   const handlePrint = () => {
//     if (!previewRef.current) return;
//     const content = previewRef.current.innerHTML;
//     const printWin = window.open('', '_blank', 'width=800,height=600');
//     if (!printWin) return;
//     printWin.document.write(`
//       <html>
//         <head>
//           <title>Invoice</title>
//           <style>
//             body { font-family: Arial, sans-serif; padding: 20px; }
//             table { width: 100%; border-collapse: collapse; margin-top: 1em;}
//             th, td { border: 1px solid #ccc; padding: 8px; text-align: left;}
//             th { background: #eee;}
//           </style>
//         </head>
//         <body>${content}</body>
//       </html>`);
//     printWin.document.close();
//     printWin.focus();
//     printWin.print();
//     printWin.close();
//   };

//   return (
//     <div style={{ display: 'flex', gap: 40, padding: 20, flexWrap: 'wrap' }}>
//       <form
//         onSubmit={onSubmit}
//         style={{
//           flex: '1 1 400px',
//           border: '1px solid #ccc',
//           borderRadius: 8,
//           padding: 20,
//           minWidth: 320,
//         }}
//       >
//         <h2>Create Invoice</h2>

//         <label>
//           Invoice Number
//           <input
//             type="text"
//             placeholder="Invoice Number"
//             value={invoiceNo}
//             onChange={e => setInvoiceNo(e.target.value)}
//             required
//             style={{ width: '100%', marginBottom: 10, padding: 8 }}
//           />
//         </label>

//         <label>
//           Invoice Date
//           <input
//             type="date"
//             value={invoiceDate}
//             onChange={e => setInvoiceDate(e.target.value)}
//             required
//             style={{ width: '100%', marginBottom: 10, padding: 8 }}
//           />
//         </label>

//         <label>
//           Invoice Type
//           <select
//             value={type}
//             onChange={e => setType(e.target.value as 'sale' | 'purchase')}
//             style={{ width: '100%', marginBottom: 10, padding: 8 }}
//           >
//             <option value="sale">Sale</option>
//             <option value="purchase">Purchase</option>
//           </select>
//         </label>

//         <label>
//           {type === 'sale' ? 'Customer' : 'Supplier'}
//           <select
//             value={partyId}
//             onChange={e => setPartyId(e.target.value)}
//             required
//             style={{ width: '100%', marginBottom: 10, padding: 8 }}
//           >
//             <option value="">
//               Select {type === 'sale' ? 'Customer' : 'Supplier'}
//             </option>
//             {(type === 'sale' ? customers : suppliers).map(party => (
//               <option key={party._id} value={party._id}>
//                 {party.name}
//               </option>
//             ))}
//           </select>
//         </label>

//         <h3>Items</h3>
//         {selectedItems.map((si, idx) => (
//           <div
//             key={idx}
//             style={{
//               border: '1px solid #ddd',
//               padding: 12,
//               marginBottom: 12,
//               borderRadius: 6,
//             }}
//           >
//             <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
//               <select
//                 value={si.itemId}
//                 onChange={e => handleItemChange(idx, e.target.value)}
//                 required
//                 style={{ flex: 2, padding: 8, minWidth: 120 }}
//               >
//                 <option value="">Select Item</option>
//                 {items.map(i => (
//                   <option key={i._id} value={i._id}>
//                     {i.name} (₹{(i.rate ?? 0).toFixed(2)})
//                   </option>
//                 ))}
//               </select>

//               <input
//                 type="number"
//                 min={1}
//                 value={si.quantity}
//                 onChange={e => updateSelectedItem(idx, 'quantity', e.target.value)}
//                 required
//                 style={{ flex: 1, minWidth: 80, padding: 8 }}
//                 placeholder="Qty"
//               />

//               <input
//                 type="number"
//                 min={0}
//                 step={0.01}
//                 value={si.rate}
//                 onChange={e => updateSelectedItem(idx, 'rate', e.target.value)}
//                 required
//                 style={{ flex: 1, minWidth: 80, padding: 8 }}
//                 placeholder="Rate"
//               />

//               <input
//                 type="number"
//                 min={0}
//                 max={100}
//                 step={0.01}
//                 value={si.cgstRate}
//                 onChange={e => updateSelectedItem(idx, 'cgstRate', e.target.value)}
//                 style={{ flex: 1, minWidth: 80, padding: 8 }}
//                 placeholder="CGST %"
//               />

//               <input
//                 type="number"
//                 min={0}
//                 max={100}
//                 step={0.01}
//                 value={si.sgstRate}
//                 onChange={e => updateSelectedItem(idx, 'sgstRate', e.target.value)}
//                 style={{ flex: 1, minWidth: 80, padding: 8 }}
//                 placeholder="SGST %"
//               />

//               <input
//                 type="number"
//                 min={0}
//                 max={100}
//                 step={0.01}
//                 value={si.igstRate}
//                 onChange={e => updateSelectedItem(idx, 'igstRate', e.target.value)}
//                 style={{ flex: 1, minWidth: 80, padding: 8 }}
//                 placeholder="IGST %"
//               />

//               <button
//                 type="button"
//                 onClick={() => removeItem(idx)}
//                 style={{
//                   background: 'red',
//                   color: '#fff',
//                   border: 'none',
//                   padding: '0 10px',
//                   borderRadius: 4,
//                   cursor: 'pointer',
//                   height: 34,
//                 }}
//                 title="Remove item"
//               >
//                 &times;
//               </button>
//             </div>
//           </div>
//         ))}

//         <button
//           type="button"
//           onClick={addNewItem}
//           style={{
//             background: '#0070f3',
//             color: '#fff',
//             border: 'none',
//             padding: '10px 15px',
//             borderRadius: 5,
//             cursor: 'pointer',
//             marginBottom: 15,
//           }}
//         >
//           + Add Item
//         </button>

//         <label>
//           Payment Status
//           <input
//             type="text"
//             placeholder="unpaid, paid, etc."
//             value={paymentStatus}
//             onChange={e => setPaymentStatus(e.target.value)}
//             style={{ width: '100%', marginBottom: 10, padding: 8 }}
//           />
//         </label>

//         <label>
//           Remarks
//           <textarea
//             value={remarks}
//             onChange={e => setRemarks(e.target.value)}
//             rows={3}
//             placeholder="Remarks"
//             style={{ width: '100%', marginBottom: 10, padding: 8 }}
//           />
//         </label>

//         <div style={{ display: 'flex', gap: 10 }}>
//           <button
//             type="button"
//             onClick={() => setShowPreview(true)}
//             style={{
//               flex: 1,
//               background: '#333',
//               color: '#fff',
//               border: 'none',
//               padding: '10px',
//               borderRadius: 5,
//               cursor: 'pointer',
//             }}
//           >
//             Preview Invoice
//           </button>

//           <button
//             type="submit"
//             style={{
//               flex: 1,
//               background: '#0070f3',
//               color: '#fff',
//               border: 'none',
//               padding: '10px',
//               borderRadius: 5,
//               cursor: 'pointer',
//             }}
//           >
//             Create Invoice
//           </button>
//         </div>
//       </form>

//       {showPreview && (
//         <div
//           ref={previewRef}
//           style={{
//             flex: '1 1 400px',
//             border: '1px solid #ccc',
//             borderRadius: 8,
//             padding: 20,
//             maxHeight: '90vh',
//             overflowY: 'auto',
//             minWidth: 320,
//           }}
//         >
//           <h2>Invoice Preview</h2>

//           <p>
//             <strong>Invoice No:</strong> {invoiceNo || 'N/A'}
//           </p>

//           <p>
//             <strong>Date:</strong> {invoiceDate ? new Date(invoiceDate).toLocaleDateString() : 'N/A'}
//           </p>

//           <p>
//             <strong>Type:</strong> {type.toUpperCase()}
//           </p>

//           <p>
//             <strong>{type === 'sale' ? 'Customer' : 'Supplier'}:</strong> {selectedParty?.name || 'N/A'}
//           </p>

//           <p>
//             <strong>Phone:</strong> {selectedParty?.phone || 'N/A'}
//           </p>

//           <p>
//             <strong>Email:</strong> {selectedParty?.email || 'N/A'}
//           </p>

//           <h3>Items</h3>
//           <table style={{ width: '100%', borderCollapse: 'collapse' }}>
//             <thead>
//               <tr style={{ backgroundColor: '#f0f0f0' }}>
//                 <th style={{ border: '1px solid #ddd', padding: 8 }}>Name</th>
//                 <th style={{ border: '1px solid #ddd', padding: 8 }}>Qty</th>
//                 <th style={{ border: '1px solid #ddd', padding: 8 }}>Rate</th>
//                 <th style={{ border: '1px solid #ddd', padding: 8 }}>CGST %</th>
//                 <th style={{ border: '1px solid #ddd', padding: 8 }}>SGST %</th>
//                 <th style={{ border: '1px solid #ddd', padding: 8 }}>IGST %</th>
//                 <th style={{ border: '1px solid #ddd', padding: 8 }}>Total</th>
//               </tr>
//             </thead>
//             <tbody>
//               {selectedItems.map((si, idx) => {
//                 const item = items.find(i => i._id === si.itemId);
//                 const qty = si.quantity ?? 0;
//                 const base = qty * (si.rate ?? 0);
//                 const cgst = ((si.cgstRate ?? 0) / 100) * base;
//                 const sgst = ((si.sgstRate ?? 0) / 100) * base;
//                 const igst = ((si.igstRate ?? 0) / 100) * base;
//                 const total = base + cgst + sgst + igst;

//                 return (
//                   <tr key={idx}>
//                     <td style={{ border: '1px solid #ddd', padding: 8 }}>{item?.name || 'N/A'}</td>
//                     <td style={{ border: '1px solid #ddd', padding: 8 }}>{qty}</td>
//                     <td style={{ border: '1px solid #ddd', padding: 8 }}>₹{base.toFixed(2)}</td>
//                     <td style={{ border: '1px solid #ddd', padding: 8 }}>{si.cgstRate.toFixed(2)}%</td>
//                     <td style={{ border: '1px solid #ddd', padding: 8 }}>{si.sgstRate.toFixed(2)}%</td>
//                     <td style={{ border: '1px solid #ddd', padding: 8 }}>{si.igstRate.toFixed(2)}%</td>
//                     <td style={{ border: '1px solid #ddd', padding: 8 }}>₹{total.toFixed(2)}</td>
//                   </tr>
//                 );
//               })}
//             </tbody>
//           </table>

//           <h4 style={{ marginTop: 20 }}>Totals</h4>
//           <p>Sub Total: ₹{totals.subTotal.toFixed(2)}</p>
//           <p>CGST Total: ₹{totals.cgstTotal.toFixed(2)}</p>
//           <p>SGST Total: ₹{totals.sgstTotal.toFixed(2)}</p>
//           <p>IGST Total: ₹{totals.igstTotal.toFixed(2)}</p>
//           <p>
//             <strong>Grand Total: ₹{totals.grandTotal.toFixed(2)}</strong>
//           </p>

//           <p>
//             <strong>Payment Status:</strong> {paymentStatus}
//           </p>

//           <p>
//             <strong>Remarks:</strong> {remarks || 'N/A'}
//           </p>

//           <button
//             onClick={handlePrint}
//             style={{
//               marginTop: 20,
//               background: '#0070f3',
//               color: '#fff',
//               border: 'none',
//               padding: '10px 15px',
//               borderRadius: 5,
//               cursor: 'pointer',
//             }}
//           >
//             Print Invoice
//           </button>

//           <button
//             onClick={() => setShowPreview(false)}
//             style={{
//               marginTop: 10,
//               background: 'gray',
//               color: '#fff',
//               border: 'none',
//               padding: '10px 15px',
//               borderRadius: 5,
//               cursor: 'pointer',
//             }}
//           >
//             Close Preview
//           </button>
//         </div>
//       )}
//     </div>
//   );
// }




'use client';

import React, { useEffect, useState, useRef } from 'react';

interface Party {
  _id: string;
  name: string;
  phone?: string;
  email?: string;
  address?: string;
}

interface Item {
  _id: string;
  name: string;
  description?: string;
  rate: number; // base price per unit
}

interface SelectedItem {
  itemId: string;
  quantity: number;
  rate: number;       // Editable rate (default from item)
  cgstRate: number;   // Editable GST rates
  sgstRate: number;
  igstRate: number;
}

export default function CreateInvoice() {
  const [customers, setCustomers] = useState<Party[]>([]);
  const [suppliers, setSuppliers] = useState<Party[]>([]);
  const [items, setItems] = useState<Item[]>([]);

  const [type, setType] = useState<'sale' | 'purchase'>('sale');
  const [partyId, setPartyId] = useState('');
  const [selectedItems, setSelectedItems] = useState<SelectedItem[]>([
    { itemId: '', quantity: 1, rate: 0, cgstRate: 0, sgstRate: 0, igstRate: 0 },
  ]);
  const [paymentStatus, setPaymentStatus] = useState('unpaid');
  const [remarks, setRemarks] = useState('');
  const [invoiceNo, setInvoiceNo] = useState('');
  const [invoiceDate, setInvoiceDate] = useState<string>(
    new Date().toISOString().slice(0, 10),
  );

  const [showPreview, setShowPreview] = useState(false);
  const previewRef = useRef<HTMLDivElement>(null);

  // Fetch customers, suppliers, and items on mount
  useEffect(() => {
    async function fetchData() {
      try {
        const [custRes, suppRes, itemsRes] = await Promise.all([
          fetch('/api/customers'),
          fetch('/api/suppliers'),
          fetch('/api/items'),
        ]);
        if (!custRes.ok || !suppRes.ok || !itemsRes.ok) throw new Error('Failed to load data');

        const custData = await custRes.json();
        const suppData = await suppRes.json();
        const itemsData = await itemsRes.json();

        setCustomers(custData);
        setSuppliers(suppData);
        setItems(itemsData);
      } catch (error) {
        console.error('Error loading dynamic data:', error);
      }
    }
    fetchData();
  }, []);

  // Reset party and items when invoice type changes
  useEffect(() => {
    setPartyId('');
    setSelectedItems([
      { itemId: '', quantity: 1, rate: 0, cgstRate: 0, sgstRate: 0, igstRate: 0 },
    ]);
  }, [type]);

  const selectedParty =
    type === 'sale'
      ? customers.find(c => c._id === partyId) || null
      : suppliers.find(s => s._id === partyId) || null;

  // When item changes, auto-set rate from item data
  const updateSelectedItem = (
    index: number,
    field: keyof SelectedItem,
    value: string | number,
  ) => {
    const newSelected = [...selectedItems];
    if (field === 'quantity' || field === 'rate' || field === 'cgstRate' || field === 'sgstRate' || field === 'igstRate') {
      newSelected[index][field] = Number(value) || 0;
    } else {
      newSelected[index][field] = value as string;
    }

    // If itemId changes, update rate to default rate from item
    if (field === 'itemId') {
      const item = items.find(i => i._id === value);
      if (item) {
        newSelected[index].rate = item.rate ?? 0;
        // Optionally reset GST rates here or keep editable
        // newSelected[index].cgstRate = 0;
        // newSelected[index].sgstRate = 0;
        // newSelected[index].igstRate = 0;
      } else {
        newSelected[index].rate = 0;
      }
    }

    setSelectedItems(newSelected);
  };

  const addNewItem = () => {
    setSelectedItems([
      ...selectedItems,
      { itemId: '', quantity: 1, rate: 0, cgstRate: 0, sgstRate: 0, igstRate: 0 },
    ]);
  };

  // Calculate totals safely with defaults
  const totals = selectedItems.reduce(
    (acc, si) => {
      const rate = si.rate ?? 0;
      const quantity = si.quantity ?? 0;
      const cgst = si.cgstRate ?? 0;
      const sgst = si.sgstRate ?? 0;
      const igst = si.igstRate ?? 0;

      const base = rate * quantity;
      acc.subTotal += base;
      acc.cgstTotal += (cgst / 100) * base;
      acc.sgstTotal += (sgst / 100) * base;
      acc.igstTotal += (igst / 100) * base;
      acc.grandTotal += base + (cgst / 100) * base + (sgst / 100) * base + (igst / 100) * base;

      return acc;
    },
    { subTotal: 0, cgstTotal: 0, sgstTotal: 0, igstTotal: 0, grandTotal: 0 },
  );

  // Submit handler
  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!partyId) {
      alert('Please select a customer or supplier');
      return;
    }
    if (selectedItems.some(si => !si.itemId)) {
      alert('Please select all items');
      return;
    }

    // Prepare payload
    const payload = {
      invoiceNo,
      invoiceDate,
      type,
      partyId,
      items: selectedItems.map(si => ({
        itemId: si.itemId,
        quantity: si.quantity,
        rate: si.rate,
        cgstRate: si.cgstRate,
        sgstRate: si.sgstRate,
        igstRate: si.igstRate,
      })),
      paymentStatus,
      remarks,
    };

    try {
      const res = await fetch('/api/invoices', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error(await res.text());
      alert('Invoice created successfully!');
      setShowPreview(false);
      // Reset form (optional)
      setInvoiceNo('');
      setPartyId('');
      setSelectedItems([{ itemId: '', quantity: 1, rate: 0, cgstRate: 0, sgstRate: 0, igstRate: 0 }]);
      setPaymentStatus('unpaid');
      setRemarks('');
      setInvoiceDate(new Date().toISOString().slice(0, 10));
    } catch (error) {
      alert('Error creating invoice: ' + (error instanceof Error ? error.message : String(error)));
    }
  };

  // Print preview
  const handlePrint = () => {
    if (!previewRef.current) return;
    const printContent = previewRef.current.innerHTML;
    const win = window.open('', '_blank', 'width=800,height=600');
    if (!win) return;
    win.document.write(`
      <html><head><title>Invoice</title>
      <style>
        body { font-family: Arial, sans-serif; padding: 20px; }
        table { width: 100%; border-collapse: collapse; margin-top: 1em;}
        th, td { border: 1px solid #ccc; padding: 8px; text-align: left;}
        th { background: #eee;}
      </style>
      </head><body>${printContent}</body></html>
    `);
    win.document.close();
    win.focus();
    win.print();
    win.close();
  };

  return (
    <div style={{ display: 'flex', gap: 40, padding: 20 }}>
      {/* Form */}
      <form
        onSubmit={onSubmit}
        style={{
          flex: 1,
          maxWidth: 600,
          border: '1px solid #ccc',
          borderRadius: 8,
          padding: 20,
          overflowY: 'auto',
          maxHeight: '90vh',
        }}
      >
        <h2>Create Invoice</h2>

        <label>
          Invoice Number
          <input
            type="text"
            placeholder="Invoice Number"
            value={invoiceNo}
            onChange={e => setInvoiceNo(e.target.value)}
            required
            style={{ width: '100%', marginBottom: 10, padding: 8 }}
          />
        </label>

        <label>
          Invoice Date
          <input
            type="date"
            value={invoiceDate}
            onChange={e => setInvoiceDate(e.target.value)}
            required
            style={{ width: '100%', marginBottom: 10, padding: 8 }}
          />
        </label>

        <label>
          Invoice Type
          <select
            value={type}
            onChange={e => setType(e.target.value as 'sale' | 'purchase')}
            style={{ width: '100%', marginBottom: 10, padding: 8 }}
          >
            <option value="sale">Sale</option>
            <option value="purchase">Purchase</option>
          </select>
        </label>

        <label>
          {type === 'sale' ? 'Customer' : 'Supplier'}
          <select
            value={partyId}
            onChange={e => setPartyId(e.target.value)}
            required
            style={{ width: '100%', marginBottom: 10, padding: 8 }}
          >
            <option value="">Select {type === 'sale' ? 'Customer' : 'Supplier'}</option>
            {(type === 'sale' ? customers : suppliers).map(party => (
              <option key={party._id} value={party._id}>
                {party.name}
              </option>
            ))}
          </select>
        </label>

        <h3>Items</h3>
        {selectedItems.map((si, idx) => (
          <div
            key={idx}
            style={{
              border: '1px solid #ddd',
              padding: 12,
              marginBottom: 12,
              borderRadius: 6,
              display: 'grid',
              gridTemplateColumns: '2fr 1fr 1fr 1fr 1fr 1fr',
              gap: 8,
              alignItems: 'center',
            }}
          >
            <select
              value={si.itemId}
              onChange={e => updateSelectedItem(idx, 'itemId', e.target.value)}
              required
              style={{ padding: 8 }}
            >
              <option value="">Select Item</option>
              {items.map(i => (
                <option key={i._id} value={i._id}>
                  {i.name} (₹{i.rate.toFixed(2)})
                </option>
              ))}
            </select>

            <input
              type="number"
              min={1}
              value={si.quantity}
              onChange={e => updateSelectedItem(idx, 'quantity', Number(e.target.value))}
              required
              style={{ padding: 8 }}
              placeholder="Qty"
            />

            <input
              type="number"
              min={0}
              step={0.01}
              value={si.rate}
              onChange={e => updateSelectedItem(idx, 'rate', Number(e.target.value))}
              required
              style={{ padding: 8 }}
              placeholder="Rate"
            />

            <input
              type="number"
              min={0}
              step={0.01}
              value={si.cgstRate}
              onChange={e => updateSelectedItem(idx, 'cgstRate', Number(e.target.value))}
              style={{ padding: 8 }}
              placeholder="CGST %"
            />

            <input
              type="number"
              min={0}
              step={0.01}
              value={si.sgstRate}
              onChange={e => updateSelectedItem(idx, 'sgstRate', Number(e.target.value))}
              style={{ padding: 8 }}
              placeholder="SGST %"
            />

            <input
              type="number"
              min={0}
              step={0.01}
              value={si.igstRate}
              onChange={e => updateSelectedItem(idx, 'igstRate', Number(e.target.value))}
              style={{ padding: 8 }}
              placeholder="IGST %"
            />
          </div>
        ))}

        <button
          type="button"
          onClick={addNewItem}
          style={{
            background: '#0070f3',
            color: '#fff',
            border: 'none',
            padding: '10px 15px',
            borderRadius: 5,
            cursor: 'pointer',
            marginBottom: 15,
          }}
        >
          + Add Item
        </button>

        <label>
          Payment Status
          <input
            type="text"
            placeholder="unpaid, paid, etc."
            value={paymentStatus}
            onChange={e => setPaymentStatus(e.target.value)}
            style={{ width: '100%', marginBottom: 10, padding: 8 }}
          />
        </label>

        <label>
          Remarks
          <textarea
            value={remarks}
            onChange={e => setRemarks(e.target.value)}
            rows={3}
            placeholder="Remarks"
            style={{ width: '100%', marginBottom: 10, padding: 8 }}
          />
        </label>

        <div style={{ display: 'flex', gap: 10 }}>
          <button
            type="button"
            onClick={() => setShowPreview(true)}
            style={{
              flex: 1,
              background: '#333',
              color: '#fff',
              border: 'none',
              padding: '10px',
              borderRadius: 5,
              cursor: 'pointer',
            }}
          >
            Preview Invoice
          </button>

          <button
            type="submit"
            style={{
              flex: 1,
              background: '#0070f3',
              color: '#fff',
              border: 'none',
              padding: '10px',
              borderRadius: 5,
              cursor: 'pointer',
            }}
          >
            Create Invoice
          </button>
        </div>
      </form>

      {/* Preview Section */}
      {showPreview && (
        <div
          ref={previewRef}
          style={{
            flex: 1,
            border: '1px solid #ccc',
            borderRadius: 8,
            padding: 20,
            maxHeight: '90vh',
            overflowY: 'auto',
          }}
        >
          <h2>Invoice Preview</h2>

          <p>
            <strong>Invoice No:</strong> {invoiceNo || 'N/A'}
          </p>

          <p>
            <strong>Date:</strong> {new Date(invoiceDate).toLocaleDateString() || 'N/A'}
          </p>

          <p>
            <strong>Type:</strong> {type.toUpperCase()}
          </p>

          <p>
            <strong>{type === 'sale' ? 'Customer' : 'Supplier'}:</strong>{' '}
            {selectedParty?.name || 'N/A'}
          </p>

          <p>
            <strong>Phone:</strong> {selectedParty?.phone || 'N/A'}
          </p>

          <p>
            <strong>Email:</strong> {selectedParty?.email || 'N/A'}
          </p>

          <h3>Items</h3>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ backgroundColor: '#f0f0f0' }}>
                <th style={{ border: '1px solid #ddd', padding: 8 }}>Name</th>
                <th style={{ border: '1px solid #ddd', padding: 8 }}>Qty</th>
                <th style={{ border: '1px solid #ddd', padding: 8 }}>Rate</th>
                <th style={{ border: '1px solid #ddd', padding: 8 }}>CGST %</th>
                <th style={{ border: '1px solid #ddd', padding: 8 }}>SGST %</th>
                <th style={{ border: '1px solid #ddd', padding: 8 }}>IGST %</th>
                <th style={{ border: '1px solid #ddd', padding: 8 }}>Total</th>
              </tr>
            </thead>
            <tbody>
              {selectedItems.map((si, idx) => {
                const itemName = items.find(i => i._id === si.itemId)?.name || 'N/A';

                const base = (si.rate ?? 0) * (si.quantity ?? 0);
                const cgstAmt = ((si.cgstRate ?? 0) / 100) * base;
                const sgstAmt = ((si.sgstRate ?? 0) / 100) * base;
                const igstAmt = ((si.igstRate ?? 0) / 100) * base;
                const total = base + cgstAmt + sgstAmt + igstAmt;

                return (
                  <tr key={idx}>
                    <td style={{ border: '1px solid #ddd', padding: 8 }}>{itemName}</td>
                    <td style={{ border: '1px solid #ddd', padding: 8 }}>{si.quantity}</td>
                    <td style={{ border: '1px solid #ddd', padding: 8 }}>
                      {typeof si.rate === 'number' ? si.rate.toFixed(2) : '0.00'}
                    </td>
                    <td style={{ border: '1px solid #ddd', padding: 8 }}>
                      {typeof si.cgstRate === 'number' ? si.cgstRate.toFixed(2) : '0.00'}
                    </td>
                    <td style={{ border: '1px solid #ddd', padding: 8 }}>
                      {typeof si.sgstRate === 'number' ? si.sgstRate.toFixed(2) : '0.00'}
                    </td>
                    <td style={{ border: '1px solid #ddd', padding: 8 }}>
                      {typeof si.igstRate === 'number' ? si.igstRate.toFixed(2) : '0.00'}
                    </td>
                    <td style={{ border: '1px solid #ddd', padding: 8 }}>{total.toFixed(2)}</td>
                  </tr>
                );
              })}
            </tbody>
            <tfoot>
              <tr>
                <td colSpan={6} style={{ textAlign: 'right', fontWeight: 'bold', padding: 8 }}>
                  Subtotal:
                </td>
                <td>{totals.subTotal.toFixed(2)}</td>
              </tr>
              <tr>
                <td colSpan={6} style={{ textAlign: 'right', fontWeight: 'bold', padding: 8 }}>
                  Total CGST:
                </td>
                <td>{totals.cgstTotal.toFixed(2)}</td>
              </tr>
              <tr>
                <td colSpan={6} style={{ textAlign: 'right', fontWeight: 'bold', padding: 8 }}>
                  Total SGST:
                </td>
                <td>{totals.sgstTotal.toFixed(2)}</td>
              </tr>
              <tr>
                <td colSpan={6} style={{ textAlign: 'right', fontWeight: 'bold', padding: 8 }}>
                  Total IGST:
                </td>
                <td>{totals.igstTotal.toFixed(2)}</td>
              </tr>
              <tr>
                <td colSpan={6} style={{ textAlign: 'right', fontWeight: 'bold', padding: 8 }}>
                  Grand Total:
                </td>
                <td>{totals.grandTotal.toFixed(2)}</td>
              </tr>
            </tfoot>
          </table>

          <p>
            <strong>Payment Status:</strong> {paymentStatus}
          </p>

          <p>
            <strong>Remarks:</strong> {remarks || 'None'}
          </p>

          <div style={{ marginTop: 20, display: 'flex', gap: 10 }}>
            <button
              onClick={() => setShowPreview(false)}
              style={{
                padding: '10px 15px',
                backgroundColor: '#666',
                color: '#fff',
                border: 'none',
                borderRadius: 5,
                cursor: 'pointer',
                flex: 1,
              }}
            >
              Close Preview
            </button>

            <button
              onClick={handlePrint}
              style={{
                padding: '10px 15px',
                backgroundColor: '#0070f3',
                color: '#fff',
                border: 'none',
                borderRadius: 5,
                cursor: 'pointer',
                flex: 1,
              }}
            >
              Print Invoice
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
