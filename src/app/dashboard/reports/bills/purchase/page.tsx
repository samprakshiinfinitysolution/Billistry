'use client';
import { useEffect, useState } from 'react';
import axios from 'axios';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import TableSkeleton from '@/components/ui/TableSkeleton';
import * as XLSX from 'xlsx';
import 'jspdf-autotable';
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

interface PurchaseItem {
  _id: string;
  invoiceNo: string;
  billTo: { name: string };
  items: { item: { _id: string; name: string }; quantity: number; rate: number; total: number }[];
  invoiceAmount: number;
  paymentStatus: string;
  date: string;
}

const currencyFormat = (amount: number) =>
  new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(amount);

const PurchaseReportPage = () => {
  const [purchases, setPurchases] = useState<PurchaseItem[]>([]);
  const [totalAmount, setTotalAmount] = useState<number>(0);
  const [totalPurchases, setTotalPurchases] = useState<number>(0);

  const [filter, setFilter] = useState<'today' | 'week' | 'month' | 'custom'>('today');
  const [paymentStatus, setPaymentStatus] = useState<'cash' | 'online' | 'unpaid' | ''>('');
  const [startDate, setStartDate] = useState<Date | null>(new Date());
  const [endDate, setEndDate] = useState<Date | null>(new Date());
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch purchase report
  const fetchReport = async () => {
    try {
      setLoading(true);
      setError(null);

      const params: any = {};
      if (filter !== 'custom') {
        params.purchaseType = filter;
      } else {
        if (startDate) params.start = startDate.toISOString();
        if (endDate) params.end = endDate.toISOString();
      }
      if (paymentStatus) params.payment = paymentStatus;

      const { data } = await axios.get('/api/reports/bills/purchase', {
        withCredentials: true,
        params,
      });

      setPurchases(data.purchases);
      setTotalAmount(data.totalAmount);
      setTotalPurchases(data.totalPurchases);
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Failed to fetch report');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReport();
  }, [filter, startDate, endDate, paymentStatus]);

  // Excel download
  const downloadExcel = () => {
    const worksheet = purchases.map((p) => ({
      'Invoice No': p.invoiceNo,
      Supplier: p.billTo?.name,
      'Payment Status': p.paymentStatus,
      Amount: p.invoiceAmount,
      Date: new Date(p.date).toLocaleDateString(),
      Items: p.items.map(i => `${i.item.name} x ${i.quantity} = ₹${i.total}`).join('; ')
    }));

    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.json_to_sheet(worksheet);
    XLSX.utils.book_append_sheet(wb, ws, 'PurchaseReport');
    XLSX.writeFile(wb, `PurchaseReport_${new Date().toLocaleDateString()}.xlsx`);
  };

//   // PDF download
//   const downloadPDF = () => {
//     const doc = new jsPDF();
//     doc.text('Purchase Report', 14, 15);

//     const tableColumn = ['Invoice No', 'Supplier', 'Payment Status', 'Amount', 'Date', 'Items'];
//     const tableRows: any[] = [];

//     purchases.forEach((p) => {
//       const row = [
//         p.invoiceNo,
//         p.billTo?.name,
//         p.paymentStatus,
//         currencyFormat(p.invoiceAmount),
//         new Date(p.date).toLocaleDateString(),
//         p.items.map(i => `${i.item.name} x ${i.quantity} = ₹${i.total}`).join('; ')
//       ];
//       tableRows.push(row);
//     });

//     (doc as any).autoTable({
//       head: [tableColumn],
//       body: tableRows,
//       startY: 20,
//     });

//     doc.save(`PurchaseReport_${new Date().toLocaleDateString()}.pdf`);
//   };

const downloadPDF = () => {
  const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
  doc.text("Purchase Report", 14, 15);

  const tableColumn = [
    "Invoice No",
    "Supplier",
    "Payment Status",
    "Amount",
    "Date",
    "Items",
  ];
  const tableRows: any[] = [];

  purchases.forEach((p) => {
    const row = [
      p.invoiceNo,
      p.billTo?.name || "-",
      p.paymentStatus || "-",
      currencyFormat(p.invoiceAmount),
      new Date(p.date).toLocaleDateString(),
      p.items
        .map((i) => `${i.item.name} x ${i.quantity} = ₹${i.total}`)
        .join("\n"), // 👈 Each item in new line
    ];
    tableRows.push(row);
  });

  autoTable(doc, {
    head: [tableColumn],
    body: tableRows,
    startY: 20,
    styles: { fontSize: 9, cellWidth: "wrap" },
    columnStyles: {
      5: { cellWidth: 60, overflow: "linebreak" }, // 👈 Items column wider + wraps
    },
  });

  doc.save(`PurchaseReport_${new Date().toLocaleDateString()}.pdf`);
};

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Purchase Report</h1>

      {/* Filters */}
      <div className="flex flex-wrap gap-4 mb-4 items-center">
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value as any)}
          className="border p-2 rounded"
        >
          <option value="today">Today</option>
          <option value="week">This Week</option>
          <option value="month">This Month</option>
          <option value="custom">Custom</option>
        </select>

        {filter === 'custom' && (
          <>
            <DatePicker
              selected={startDate}
              onChange={(date: Date | null) => setStartDate(date)}
              className="border p-2 rounded"
              placeholderText="Start Date"
            />
            <DatePicker
              selected={endDate}
              onChange={(date: Date | null) => setEndDate(date)}
              className="border p-2 rounded"
              placeholderText="End Date"
            />
          </>
        )}

        <select
          value={paymentStatus}
          onChange={(e) => setPaymentStatus(e.target.value as any)}
          className="border p-2 rounded"
        >
          <option value="">All Payments</option>
          <option value="cash">Cash</option>
          <option value="online">Online</option>
          <option value="unpaid">Unpaid</option>
        </select>

        <button
          onClick={fetchReport}
          className="bg-blue-600 text-white px-4 py-2 rounded"
        >
          Refresh
        </button>
        <button
          onClick={downloadExcel}
          className="bg-green-600 text-white px-4 py-2 rounded"
        >
          Download Excel
        </button>
        <button
          onClick={downloadPDF}
          className="bg-red-600 text-white px-4 py-2 rounded"
        >
          Download PDF
        </button>
      </div>

      {/* Error */}
      {error && <p className="text-red-500 mb-4">{error}</p>}

      {/* Summary */}
      <div className="flex gap-6 mb-4">
        <div className="p-4 bg-gray-100 rounded">
          <p className="text-gray-500">Total Purchases</p>
          <p className="text-xl font-bold">{totalPurchases}</p>
        </div>
        <div className="p-4 bg-gray-100 rounded">
          <p className="text-gray-500">Total Amount</p>
          <p className="text-xl font-bold">{currencyFormat(totalAmount)}</p>
        </div>
      </div>

      {/* Table */}
      {loading ? (
        <div className="overflow-x-auto">
          <table className="min-w-full border border-gray-200 text-sm">
            <tbody>
              <tr>
                <td colSpan={5} className="p-0"><TableSkeleton rows={4} /></td>
              </tr>
            </tbody>
          </table>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full border border-gray-200 text-sm">
            <thead className="bg-gray-100">
              <tr>
                <th className="border px-4 py-2">Invoice No</th>
                <th className="border px-4 py-2">Supplier</th>
                <th className="border px-4 py-2">Items</th>
                <th className="border px-4 py-2">Amount</th>
                <th className="border px-4 py-2">Payment Status</th>
                <th className="border px-4 py-2">Date</th>
              </tr>
            </thead>
            <tbody>
              {purchases.length === 0 ? (
                <tr>
                  <td colSpan={6} className="border px-4 py-2 text-center">
                    No purchases found.
                  </td>
                </tr>
              ) : (
                purchases.map((p) => (
                  <tr key={p._id}>
                    <td className="border px-4 py-2">{p.invoiceNo}</td>
                    <td className="border px-4 py-2">{p.billTo?.name}</td>
                    <td className="border px-4 py-2">
                      {p.items.map((i) => (
                        <div key={i.item._id}>
                          {i.item.name} x {i.quantity} = ₹ {i.total}
                        </div>
                      ))}
                    </td>
                    <td className="border px-4 py-2">{currencyFormat(p.invoiceAmount)}</td>
                    <td className="border px-4 py-2">{p.paymentStatus}</td>
                    <td className="border px-4 py-2">{new Date(p.date).toLocaleDateString()}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default PurchaseReportPage;
