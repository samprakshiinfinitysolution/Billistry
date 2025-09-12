// // src/app/ledger/[partyType]/[id]/page.tsx
// "use client";

// import { useEffect, useState } from "react";
// import { useParams } from "next/navigation";

// interface Transaction {
//   _id: string;
//   amount: number;
//   type: "You Gave" | "You Got";
//   description?: string;
//   date: string;
// }

// export default function LedgerPage() {
//   const { partyType, id } = useParams<{ partyType: string; id: string }>();
//   const [party, setParty] = useState<any>(null);
//   const [transactions, setTransactions] = useState<Transaction[]>([]);

//   useEffect(() => {
//     if (partyType && id) {
//       fetch(`/api/ledger/${partyType}/${id}`)
//         .then((res) => res.json())
//         .then((data) => {
//           setParty(data.party);
//           setTransactions(data.transactions);
//         });
//     }
//   }, [partyType, id]);

//   if (!party) return <p className="p-4">Loading...</p>;

//   return (
//     <div className="p-4">
//       <h1 className="text-2xl font-bold">
//         Ledger - {partyType} {party.name}
//       </h1>

//       <table className="w-full mt-4 border">
//         <thead>
//           <tr className="bg-gray-200">
//             <th className="p-2 border">Date</th>
//             <th className="p-2 border">Description</th>
//             <th className="p-2 border">Type</th>
//             <th className="p-2 border">Amount</th>
//           </tr>
//         </thead>
//         <tbody>
//           {transactions.map((t) => (
//             <tr key={t._id}>
//               <td className="p-2 border">
//                 {new Date(t.date).toLocaleDateString()}
//               </td>
//               <td className="p-2 border">{t.description || "-"}</td>
//               <td
//                 className={`p-2 border ${
//                   t.type === "You Got" ? "text-green-600" : "text-red-600"
//                 }`}
//               >
//                 {t.type}
//               </td>
//               <td className="p-2 border">₹ {t.amount}</td>
//             </tr>
//           ))}
//         </tbody>
//       </table>
//     </div>
//   );
// }



// src/app/ledger/[partyType]/[id]/page.tsx
// "use client";

// import { useEffect, useState, useMemo } from "react";
// import { useParams } from "next/navigation";

// interface Transaction {
//   _id: string;
//   amount: number;
//   type: "You Gave" | "You Got";
//   description?: string;
//   date: string;
// }

// export default function LedgerPage() {
//   const { partyType, id } = useParams<{ partyType: string; id: string }>();
//   const [party, setParty] = useState<any>(null);
//   const [transactions, setTransactions] = useState<Transaction[]>([]);

//   // Fetch ledger data
//   useEffect(() => {
//     if (partyType && id) {
//       fetch(`/api/ledger/${partyType}/${id}`)
//         .then((res) => res.json())
//         .then((data) => {
//           setParty(data.party);
//           setTransactions(data.transactions);
//         });
//     }
//   }, [partyType, id]);

//   // Calculate balance
//   const { totalGave, totalGot, balance } = useMemo(() => {
//     let gave = 0;
//     let got = 0;
//     transactions.forEach((t) => {
//       if (t.type === "You Gave") gave += t.amount;
//       else got += t.amount;
//     });
//     return { totalGave: gave, totalGot: got, balance: got - gave };
//   }, [transactions]);

//   if (!party) return <p className="p-4">Loading...</p>;

//   return (
//     <div className="p-4 space-y-6">
//       {/* Header */}
//       <h1 className="text-2xl font-bold">
//         Ledger - {partyType} {party.name}
//       </h1>

//       {/* Summary bar */}
//       <div className="grid grid-cols-3 gap-4">
//         <div className="bg-red-100 p-3 rounded-lg text-center">
//           <p className="text-sm font-medium">You Will Give</p>
//           <p className="text-xl font-bold text-red-600">₹ {totalGave}</p>
//         </div>
//         <div className="bg-green-100 p-3 rounded-lg text-center">
//           <p className="text-sm font-medium">You Will Get</p>
//           <p className="text-xl font-bold text-green-600">₹ {totalGot}</p>
//         </div>
//         <div className="bg-gray-100 p-3 rounded-lg text-center">
//           <p className="text-sm font-medium">Settled Up</p>
//           <p className="text-xl font-bold">
//             {balance === 0 ? "₹ 0" : balance > 0 ? `₹ ${balance}` : `₹ ${-balance}`}
//           </p>
//         </div>
//       </div>

//       {/* Quick action buttons */}
//       <div className="flex gap-4">
//         <button
//           className="flex-1 bg-red-500 hover:bg-red-600 text-white py-2 rounded-lg"
//           onClick={() => alert("Add You Gave transaction")}
//         >
//           You Gave ₹
//         </button>
//         <button
//           className="flex-1 bg-green-500 hover:bg-green-600 text-white py-2 rounded-lg"
//           onClick={() => alert("Add You Got transaction")}
//         >
//           You Got ₹
//         </button>
//       </div>

//       {/* Transaction Table */}
//       <table className="w-full border">
//         <thead>
//           <tr className="bg-gray-200">
//             <th className="p-2 border">Date</th>
//             <th className="p-2 border">Description</th>
//             <th className="p-2 border">Type</th>
//             <th className="p-2 border">Amount</th>
//           </tr>
//         </thead>
//         <tbody>
//           {transactions.map((t) => (
//             <tr key={t._id}>
//               <td className="p-2 border">{new Date(t.date).toLocaleDateString()}</td>
//               <td className="p-2 border">{t.description || "-"}</td>
//               <td
//                 className={`p-2 border ${
//                   t.type === "You Got" ? "text-green-600" : "text-red-600"
//                 }`}
//               >
//                 {t.type}
//               </td>
//               <td className="p-2 border">₹ {t.amount}</td>
//             </tr>
//           ))}
//         </tbody>
//       </table>
//     </div>
//   );
// }



// "use client";

// import { useEffect, useState, useMemo } from "react";
// import { useParams } from "next/navigation";

// interface Transaction {
//   _id: string;
//   amount: number;
//   type: "You Gave" | "You Got";
//   description?: string;
//   date: string;
// }

// export default function LedgerPage() {
//   const { partyType, id } = useParams<{ partyType: string; id: string }>();
//   const [party, setParty] = useState<any>(null);
//   const [transactions, setTransactions] = useState<Transaction[]>([]);
//   const [showModal, setShowModal] = useState(false);
//   const [txnType, setTxnType] = useState<"You Gave" | "You Got">("You Gave");
//   const [amount, setAmount] = useState("");
//   const [description, setDescription] = useState("");

//   // Fetch ledger data
//   useEffect(() => {
//     if (partyType && id) {
//       fetch(`/api/ledger/${partyType}/${id}`)
//         .then((res) => res.json())
//         .then((data) => {
//           setParty(data.party);
//           setTransactions(data.transactions);
//         });
//     }
//   }, [partyType, id]);

//   // Calculate balance
//   const { totalGave, totalGot, balance } = useMemo(() => {
//     let gave = 0;
//     let got = 0;
//     transactions.forEach((t) => {
//       if (t.type === "You Gave") gave += t.amount;
//       else got += t.amount;
//     });
//     return { totalGave: gave, totalGot: got, balance: got - gave };
//   }, [transactions]);

//   // Handle new transaction
//   const addTransaction = async () => {
//     if (!amount) return;
//     const res = await fetch("/api/transaction", {
//       method: "POST",
//       headers: { "Content-Type": "application/json" },
//       body: JSON.stringify({
//         partyType,
//         partyId: id,
//         type: txnType,
//         amount: Number(amount),
//         description,
//       }),
//     });
//     const data = await res.json();
//     if (data.success) {
//       setTransactions((prev) => [...prev, data.transaction]);
//       setShowModal(false);
//       setAmount("");
//       setDescription("");
//     }
//   };

//   if (!party) return <p className="p-4">Loading...</p>;

//   return (
//     <div className="p-4 space-y-6">
//       {/* Header */}
//       <h1 className="text-2xl font-bold">
//         Ledger - {partyType} {party.name}
//       </h1>

//       {/* Summary bar */}
//       <div className="grid grid-cols-3 gap-4">
//         <div className="bg-red-100 p-3 rounded-lg text-center">
//           <p className="text-sm font-medium">You Will Give</p>
//           <p className="text-xl font-bold text-red-600">₹ {totalGave}</p>
//         </div>
//         <div className="bg-green-100 p-3 rounded-lg text-center">
//           <p className="text-sm font-medium">You Will Get</p>
//           <p className="text-xl font-bold text-green-600">₹ {totalGot}</p>
//         </div>
//         <div className="bg-gray-100 p-3 rounded-lg text-center">
//           <p className="text-sm font-medium">Settled Up</p>
//           <p className="text-xl font-bold">
//             {balance === 0
//               ? "₹ 0"
//               : balance > 0
//               ? `₹ ${balance}`
//               : `₹ ${-balance}`}
//           </p>
//         </div>
//       </div>

//       {/* Quick action buttons */}
//       <div className="flex gap-4">
//         <button
//           className="flex-1 bg-red-500 hover:bg-red-600 text-white py-2 rounded-lg"
//           onClick={() => {
//             setTxnType("You Gave");
//             setShowModal(true);
//           }}
//         >
//           You Gave ₹
//         </button>
//         <button
//           className="flex-1 bg-green-500 hover:bg-green-600 text-white py-2 rounded-lg"
//           onClick={() => {
//             setTxnType("You Got");
//             setShowModal(true);
//           }}
//         >
//           You Got ₹
//         </button>
//       </div>

//       {/* Transaction Table */}
//       <table className="w-full border">
//         <thead>
//           <tr className="bg-gray-200">
//             <th className="p-2 border">Date</th>
//             <th className="p-2 border">Description</th>
//             <th className="p-2 border">Type</th>
//             <th className="p-2 border">Amount</th>
//           </tr>
//         </thead>
//         <tbody>
//           {transactions.map((t) => (
//             <tr key={t._id}>
//               <td className="p-2 border">
//                 {new Date(t.date).toLocaleDateString()}
//               </td>
//               <td className="p-2 border">{t.description || "-"}</td>
//               <td
//                 className={`p-2 border ${
//                   t.type === "You Got" ? "text-green-600" : "text-red-600"
//                 }`}
//               >
//                 {t.type}
//               </td>
//               <td className="p-2 border">₹ {t.amount}</td>
//             </tr>
//           ))}
//         </tbody>
//       </table>

//       {/* Modal */}
//       {showModal && (
//         <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
//           <div className="bg-white p-6 rounded-lg shadow-lg w-80">
//             <h2 className="text-lg font-bold mb-4">{txnType}</h2>
//             <input
//               type="number"
//               placeholder="Amount"
//               value={amount}
//               onChange={(e) => setAmount(e.target.value)}
//               className="border w-full p-2 mb-3 rounded"
//             />
//             <input
//               type="text"
//               placeholder="Description"
//               value={description}
//               onChange={(e) => setDescription(e.target.value)}
//               className="border w-full p-2 mb-3 rounded"
//             />
//             <div className="flex gap-2">
//               <button
//                 onClick={addTransaction}
//                 className="flex-1 bg-blue-500 hover:bg-blue-600 text-white py-2 rounded"
//               >
//                 Save
//               </button>
//               <button
//                 onClick={() => setShowModal(false)}
//                 className="flex-1 bg-gray-300 hover:bg-gray-400 py-2 rounded"
//               >
//                 Cancel
//               </button>
//             </div>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// }











// "use client";

// import { useEffect, useState, useMemo } from "react";
// import { useParams } from "next/navigation";

// interface Transaction {
//   _id: string;
//   amount: number;
//   type: "You Gave" | "You Got";
//   description?: string;
//   date: string;
// }

// export default function LedgerPage() {
//   const { partyType, id } = useParams<{ partyType: string; id: string }>();
//   const [party, setParty] = useState<any>(null);
//   const [transactions, setTransactions] = useState<Transaction[]>([]);
//   const [showModal, setShowModal] = useState(false);
//   const [txnType, setTxnType] = useState<"You Gave" | "You Got">("You Gave");
//   const [amount, setAmount] = useState("");
//   const [description, setDescription] = useState("");

//   // Helper: Fetch ledger
//   const fetchLedger = async () => {
//     if (!partyType || !id) return;
//     const res = await fetch(`/api/ledger/${partyType}/${id}`);
//     const data = await res.json();
//     setParty(data.party);
//     setTransactions(data.transactions);
//   };

//   // Initial load
//   useEffect(() => {
//     fetchLedger();
//   }, [partyType, id]);

//   // Calculate totals
//   const { totalGave, totalGot, balance } = useMemo(() => {
//     let gave = 0;
//     let got = 0;
//     transactions.forEach((t) => {
//       if (t.type === "You Gave") gave += t.amount;
//       else got += t.amount;
//     });
//     return { totalGave: gave, totalGot: got, balance: got - gave };
//   }, [transactions]);

//   // Add new transaction
//   const addTransaction = async () => {
//     if (!amount) return;

//     try {
//       const res = await fetch("/api/transaction", { // ✅ plural path
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({
//           partyType,
//           partyId: id,
//           type: txnType,
//           amount: Number(amount),
//           description,
//         }),
//       });

//       if (!res.ok) throw new Error("Failed to save transaction");

//       // ✅ Refresh ledger
//       await fetchLedger();

//       // ✅ Reset form + close modal
//       setAmount("");
//       setDescription("");
//       setShowModal(false);
//     } catch (err) {
//       console.error(err);
//     }
//   };

//   if (!party) return <p className="p-4">Loading...</p>;

//   return (
//     <div className="p-4 space-y-6">
//       {/* Header */}
//       <h1 className="text-2xl font-bold">
//         Ledger - {partyType} {party.name}
//       </h1>

//       {/* Summary bar */}
//       <div className="grid grid-cols-3 gap-4">
//         <div className="bg-red-100 p-3 rounded-lg text-center">
//           <p className="text-sm font-medium">You Will Give</p>
//           <p className="text-xl font-bold text-red-600">₹ {totalGave}</p>
//         </div>
//         <div className="bg-green-100 p-3 rounded-lg text-center">
//           <p className="text-sm font-medium">You Will Get</p>
//           <p className="text-xl font-bold text-green-600">₹ {totalGot}</p>
//         </div>
//         <div className="bg-gray-100 p-3 rounded-lg text-center">
//           <p className="text-sm font-medium">Settled Up</p>
//           <p className="text-xl font-bold">
//             {balance === 0
//               ? "₹ 0"
//               : balance > 0
//               ? `₹ ${balance}`
//               : `₹ ${-balance}`}
//           </p>
//         </div>
//       </div>

//       {/* Quick action buttons */}
//       <div className="flex gap-4">
//         <button
//           className="flex-1 bg-red-500 hover:bg-red-600 text-white py-2 rounded-lg"
//           onClick={() => {
//             setTxnType("You Gave");
//             setShowModal(true);
//           }}
//         >
//           You Gave ₹
//         </button>
//         <button
//           className="flex-1 bg-green-500 hover:bg-green-600 text-white py-2 rounded-lg"
//           onClick={() => {
//             setTxnType("You Got");
//             setShowModal(true);
//           }}
//         >
//           You Got ₹
//         </button>
//       </div>

//       {/* Transaction Table
//       <table className="w-full border">
//         <thead>
//           <tr className="bg-gray-200">
//             <th className="p-2 border">Date</th>
//             <th className="p-2 border">Description</th>
//             <th className="p-2 border">Type</th>
//             <th className="p-2 border">Amount</th>
//           </tr>
//         </thead>
//         <tbody>
//           {transactions.map((t) => (
//             <tr key={t._id}>
//               <td className="p-2 border">
//                 {new Date(t.date).toLocaleDateString()}
//               </td>
//               <td className="p-2 border">{t.description || "-"}</td>
//               <td
//                 className={`p-2 border ${
//                   t.type === "You Got" ? "text-green-600" : "text-red-600"
//                 }`}
//               >
//                 {t.type}
//               </td>
//               <td className="p-2 border">₹ {t.amount}</td>
//             </tr>
//           ))}
//         </tbody>
//       </table> */}
// {/* Scrollable Transaction Table */}
// <div className="max-h-96 overflow-y-auto border rounded-md">
//   <table className="w-full border-collapse">
//     <thead className="sticky top-0 bg-gray-200">
//       <tr>
//         <th className="p-2 border">Date</th>
//         <th className="p-2 border">Description</th>
//         <th className="p-2 border">Type</th>
//         <th className="p-2 border">Amount</th>
//       </tr>
//     </thead>
//     <tbody>
//       {transactions.map((t) => (
//         <tr key={t._id} className="hover:bg-gray-100">
//           <td className="p-2 border">
//             {new Date(t.date).toLocaleDateString()}
//           </td>
//           <td className="p-2 border">{t.description || "-"}</td>
//           <td
//             className={`p-2 border ${
//               t.type === "You Got" ? "text-green-600" : "text-red-600"
//             }`}
//           >
//             {t.type}
//           </td>
//           <td className="p-2 border">₹ {t.amount}</td>
//         </tr>
//       ))}
//     </tbody>
//   </table>
// </div>

//       {/* Modal */}
//       {showModal && (
//         <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
//           <div className="bg-white p-6 rounded-lg shadow-lg w-80">
//             <h2 className="text-lg font-bold mb-4">{txnType}</h2>
//             <input
//               type="number"
//               placeholder="Amount"
//               value={amount}
//               onChange={(e) => setAmount(e.target.value)}
//               className="border w-full p-2 mb-3 rounded"
//             />
//             <input
//               type="text"
//               placeholder="Description"
//               value={description}
//               onChange={(e) => setDescription(e.target.value)}
//               className="border w-full p-2 mb-3 rounded"
//             />
//             <div className="flex gap-2">
//               <button
//                 onClick={addTransaction}
//                 className="flex-1 bg-blue-500 hover:bg-blue-600 text-white py-2 rounded"
//               >
//                 Save
//               </button>
//               <button
//                 onClick={() => setShowModal(false)}
//                 className="flex-1 bg-gray-300 hover:bg-gray-400 py-2 rounded"
//               >
//                 Cancel
//               </button>
//             </div>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// }





"use client";

import { useEffect, useState, useMemo } from "react";
import { useParams } from "next/navigation";

interface Transaction {
  _id: string;
  amount: number;
  type: "You Gave" | "You Got";
  description?: string;
  date: string;
}

export default function LedgerPage() {
  const { partyType, id } = useParams<{ partyType: string; id: string }>();
  const [party, setParty] = useState<any>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [txnType, setTxnType] = useState<"You Gave" | "You Got">("You Gave");
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);

  const fetchLedger = async () => {
    if (!partyType || !id) return;
    const res = await fetch(`/api/ledger/${partyType}/${id}`);
    const data = await res.json();
    setParty(data.party);
    setTransactions(data.transactions);
  };

  useEffect(() => {
    fetchLedger();
  }, [partyType, id]);

  const { totalGave, totalGot, balance } = useMemo(() => {
    let gave = 0;
    let got = 0;
    transactions.forEach((t) => {
      if (t.type === "You Gave") gave += t.amount;
      else got += t.amount;
    });
    return { totalGave: gave, totalGot: got, balance: got - gave };
  }, [transactions]);

  const saveTransaction = async () => {
    if (!amount) return;

    try {
      const method = editingId ? "PUT" : "POST";
      const url = editingId ? `/api/transaction/${editingId}` : "/api/transaction";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          partyType,
          partyId: id,
          type: txnType,
          amount: Number(amount),
          description,
        }),
      });

      if (!res.ok) throw new Error("Failed to save transaction");

      await fetchLedger();
      setAmount("");
      setDescription("");
      setEditingId(null);
      setShowModal(false);
    } catch (err) {
      console.error(err);
    }
  };

  const deleteTransaction = async (txnId: string) => {
    if (!confirm("Are you sure you want to delete this transaction?")) return;

    try {
      const res = await fetch(`/api/transaction/${txnId}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete transaction");
      await fetchLedger();
    } catch (err) {
      console.error(err);
    }
  };

  const startEditing = (txn: Transaction) => {
    setEditingId(txn._id);
    setTxnType(txn.type);
    setAmount(txn.amount.toString());
    setDescription(txn.description || "");
    setShowModal(true);
  };

  if (!party) return <p className="p-4">Loading...</p>;

  return (
    <div className="p-4 space-y-6">
      <h1 className="text-2xl font-bold">
        Ledger - {partyType} {party.name}
      </h1>

      <div className="grid grid-cols-3 gap-4">
        <div className="bg-red-100 p-3 rounded-lg text-center">
          <p className="text-sm font-medium">You Will Give</p>
          <p className="text-xl font-bold text-red-600">₹ {totalGave}</p>
        </div>
        <div className="bg-green-100 p-3 rounded-lg text-center">
          <p className="text-sm font-medium">You Will Get</p>
          <p className="text-xl font-bold text-green-600">₹ {totalGot}</p>
        </div>
        <div className="bg-gray-100 p-3 rounded-lg text-center">
          <p className="text-sm font-medium">Settled Up</p>
          <p className="text-xl font-bold">
            {balance === 0 ? "₹ 0" : balance > 0 ? `₹ ${balance}` : `₹ ${-balance}`}
          </p>
        </div>
      </div>

      <div className="flex gap-4">
        <button
          className="flex-1 bg-red-500 hover:bg-red-600 text-white py-2 rounded-lg"
          onClick={() => {
            setTxnType("You Gave");
            setShowModal(true);
            setEditingId(null);
          }}
        >
          You Gave ₹
        </button>
        <button
          className="flex-1 bg-green-500 hover:bg-green-600 text-white py-2 rounded-lg"
          onClick={() => {
            setTxnType("You Got");
            setShowModal(true);
            setEditingId(null);
          }}
        >
          You Got ₹
        </button>
      </div>

      <div className="max-h-96 overflow-y-auto border rounded-md">
        <table className="w-full border-collapse">
          <thead className="sticky top-0 bg-gray-200">
            <tr>
              <th className="p-2 border">Date</th>
              <th className="p-2 border">Description</th>
              <th className="p-2 border">Type</th>
              <th className="p-2 border">Amount</th>
              <th className="p-2 border">Actions</th>
            </tr>
          </thead>
          <tbody>
            {transactions.map((t) => (
              <tr key={t._id} className="hover:bg-gray-100">
                <td className="p-2 border">{new Date(t.date).toLocaleDateString()}</td>
                <td className="p-2 border">{t.description || "-"}</td>
                <td className={`p-2 border ${t.type === "You Got" ? "text-green-600" : "text-red-600"}`}>{t.type}</td>
                <td className="p-2 border">₹ {t.amount}</td>
                <td className="p-2 border flex gap-2">
                  <button
                    onClick={() => startEditing(t)}
                    className="bg-yellow-400 hover:bg-yellow-500 text-white px-2 py-1 rounded"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => deleteTransaction(t._id)}
                    className="bg-red-500 hover:bg-red-600 text-white px-2 py-1 rounded"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-80">
            <h2 className="text-lg font-bold mb-4">{editingId ? "Edit" : "Add"} Transaction</h2>
            <select
              value={txnType}
              onChange={(e) => setTxnType(e.target.value as any)}
              className="border w-full p-2 mb-3 rounded"
            >
              <option value="You Gave">You Gave</option>
              <option value="You Got">You Got</option>
            </select>
            <input
              type="number"
              placeholder="Amount"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="border w-full p-2 mb-3 rounded"
            />
            <input
              type="text"
              placeholder="Description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="border w-full p-2 mb-3 rounded"
            />
            <div className="flex gap-2">
              <button
                onClick={saveTransaction}
                className="flex-1 bg-blue-500 hover:bg-blue-600 text-white py-2 rounded"
              >
                Save
              </button>
              <button
                onClick={() => {
                  setShowModal(false);
                  setEditingId(null);
                }}
                className="flex-1 bg-gray-300 hover:bg-gray-400 py-2 rounded"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>  
  );
}
