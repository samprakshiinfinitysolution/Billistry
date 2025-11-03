'use client';
import { useEffect, useState } from 'react';
import axios from 'axios';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';

import autoTable from 'jspdf-autotable';
import TableSkeleton from '@/components/ui/TableSkeleton';
import useAuthGuard from '@/hooks/useAuthGuard';

interface SaleItem {
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

const SaleReportPage = () => {
    const { user } = useAuthGuard();
  const [sales, setSales] = useState<SaleItem[]>([]);
  const [totalAmount, setTotalAmount] = useState<number>(0);
  const [totalSales, setTotalSales] = useState<number>(0);

  const [filter, setFilter] = useState<'today' | 'week' | 'month' | 'custom'>('today');
  const [paymentStatus, setPaymentStatus] = useState<'cash' | 'online' | 'unpaid' | ''>('');
  const [startDate, setStartDate] = useState<Date | null>(new Date());
  const [endDate, setEndDate] = useState<Date | null>(new Date());
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch sale report
  const fetchReport = async () => {
    try {
      setLoading(true);
      setError(null);

      const params: any = {};
      if (filter !== 'custom') {
        params.saleType = filter;
      } else {
        if (startDate) params.start = startDate.toISOString();
        if (endDate) params.end = endDate.toISOString();
      }
      if (paymentStatus) params.payment = paymentStatus;

      const { data } = await axios.get('/api/reports/bills/sale', {
        withCredentials: true,
        params,
      });

      setSales(data.sales);
      setTotalAmount(data.totalAmount); // ✅ use backend totalAmount
      setTotalSales(data.totalSales);   // ✅ backend count
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
    const worksheet = sales.map((sale) => ({
      'Invoice No': sale.invoiceNo,
      Customer: sale.billTo?.name,
      'Payment Status': sale.paymentStatus,
      Amount: sale.invoiceAmount,
      Date: new Date(sale.date).toLocaleDateString(),
      Items: sale.items.map(i => `${i.item.name} x ${i.quantity} = ₹${i.total}`).join('; ')
    }));

    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.json_to_sheet(worksheet);
    XLSX.utils.book_append_sheet(wb, ws, 'SalesReport');
    XLSX.writeFile(wb, `SaleReport_${new Date().toLocaleDateString()}.xlsx`);
  };


const downloadSalePDF = () => {
  const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
  doc.setFontSize(14);
  doc.text("Sale Report", 14, 15);

  const tableColumn = [
    "Invoice No",
    "Customer",
    "Payment Status",
    "Amount",
    "Date",
    "Items",
  ];

  const tableRows: any[] = [];
  let totalAmount = 0;
  let totalItems = 0;

  sales.forEach((sale) => {
    totalAmount += sale.invoiceAmount || 0;
    totalItems += sale.items.reduce((acc, i) => acc + i.quantity, 0);

    const row = [
      sale.invoiceNo,
      sale.billTo?.name || "-",
      sale.paymentStatus || "-",
      currencyFormat(sale.invoiceAmount),
      new Date(sale.date).toLocaleDateString(),
      // ✅ Items line by line
      sale.items
        .map((i) => `${i.item.name} x ${i.quantity} = ₹${i.total}`)
        .join("\n"),
    ];
    tableRows.push(row);
  });

  autoTable(doc, {
    head: [tableColumn],
    body: tableRows,
    startY: 25,
    styles: { fontSize: 9, cellWidth: "wrap" },
    columnStyles: {
      5: { cellWidth: 60, overflow: "linebreak" }, // Items column
    },
    theme: "grid",
  });

  // ✅ Totals below table
  const finalY = (doc as any).lastAutoTable.finalY + 10;
  doc.setFontSize(12);
  doc.text(`Total Items: ${totalItems}`, 14, finalY);
  doc.text(`Total Amount: ${currencyFormat(totalAmount)}`, 120, finalY);

  doc.save(`SaleReport_${new Date().toLocaleDateString()}.pdf`);
};


  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Sale Report</h1>

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
          onClick={downloadSalePDF}
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
          <p className="text-gray-500">Total Sales</p>
          <p className="text-xl font-bold">{totalSales}</p>
        </div>
        <div className="p-4 bg-gray-100 rounded">
          <p className="text-gray-500">Total Amount</p>
          <p className="text-xl font-bold">{currencyFormat(totalAmount)}</p>
        </div>
      </div>
   

      {/* Sale Table */}
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
                <th className="border px-4 py-2">Customer</th>
                <th className="border px-4 py-2">Items</th>
                <th className="border px-4 py-2">Amount</th>
                <th className="border px-4 py-2">Payment Status</th>
                <th className="border px-4 py-2">Date</th>
              </tr>
            </thead>
            <tbody>
              {sales.length === 0 ? (
                <tr>
                  <td colSpan={6} className="border px-4 py-2 text-center">
                    No sales found.
                  </td>
                </tr>
              ) : (
                sales.map((sale) => (
                  <tr key={sale._id}>
                    <td className="border px-4 py-2">{sale.invoiceNo}</td>
                    <td className="border px-4 py-2">{sale.billTo?.name}</td>
                    <td className="border px-4 py-2">
                      {sale.items.map((i) => (
                        <div key={i.item._id}>
                          {i.item.name} x {i.quantity} = ₹ {i.total}
                        </div>
                      ))}
                    </td>
                    <td className="border px-4 py-2">{currencyFormat(sale.invoiceAmount)}</td>
                    <td className="border px-4 py-2">{sale.paymentStatus}</td>
                    <td className="border px-4 py-2">{new Date(sale.date).toLocaleDateString()}</td>
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

export default SaleReportPage;
