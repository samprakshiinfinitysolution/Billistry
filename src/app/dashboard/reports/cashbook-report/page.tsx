"use client";

import { useEffect, useState } from "react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

export default function CashbookReportPage() {
  const [data, setData] = useState([]);
  const [totalIN, setTotalIN] = useState(0);
  const [totalOUT, setTotalOUT] = useState(0);
  const [balance, setBalance] = useState(0);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const fetchReport = async () => {
    const query = new URLSearchParams();
    if (startDate) query.append("startDate", startDate);
    if (endDate) query.append("endDate", endDate);

    const res = await fetch(`/api/reports/cashbook-report?${query.toString()}`);
    const json = await res.json();
    if (json.success) {
      setData(json.data);
      setTotalIN(json.totalIN);
      setTotalOUT(json.totalOUT);
      setBalance(json.balance);
    }
  };

  const downloadPDF = () => {
  const doc = new jsPDF();

  // Title & Date Range
  doc.setFontSize(16);
  doc.text("Cashbook Report", 14, 10);
  doc.setFontSize(12);
  doc.text(`Date: ${startDate || "-"} to ${endDate || "-"}`, 14, 18);

  // Table Data
  const tableData = data.map((item: any) => [
    new Date(item.createdAt).toLocaleDateString(),
    item.type,
    `\u20B9${item.amount.toFixed(2)}`, // Correct rupee symbol
    item.mode,
    item.description || ""
  ]);

  // Draw Table
  autoTable(doc, {
    head: [["Date", "Type", "Amount", "Mode", "Description"]],
    body: tableData,
    startY: 25,
    theme: "grid",
    styles: { font: "helvetica", fontSize: 10 },
    headStyles: { fillColor: [22, 160, 133] }, // Teal header
  });

  // Totals Section
  const finalY = (doc as any).lastAutoTable.finalY || 25;
  doc.setFontSize(12);
  doc.text(`Total IN: \u20B9${totalIN.toFixed(2)}`, 14, finalY + 10);
  doc.text(`Total OUT: \u20B9${totalOUT.toFixed(2)}`, 14, finalY + 16);
  doc.text(`Balance: \u20B9${balance.toFixed(2)}`, 14, finalY + 22);

  // Save File
  doc.save("cashbook-report.pdf");
};
  useEffect(() => {
    fetchReport();
  }, []);

  return (
    <div className="p-4 max-w-7xl mx-auto">
      <h1 className="text-2xl font-bold mb-6 text-center">Cashbook Report</h1>

      {/* Filters */}
      <div className="flex flex-wrap gap-2 mb-6 justify-center">
        <input
          type="date"
          value={startDate}
          onChange={(e) => setStartDate(e.target.value)}
          className="border p-2 rounded w-full sm:w-auto"
        />
        <input
          type="date"
          value={endDate}
          onChange={(e) => setEndDate(e.target.value)}
          className="border p-2 rounded w-full sm:w-auto"
        />
        <button
          onClick={fetchReport}
          className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded w-full sm:w-auto"
        >
          Filter
        </button>
        <button
          onClick={downloadPDF}
          className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded w-full sm:w-auto"
        >
          Download PDF
        </button>
      </div>
       {/* Totals */}
      <div className="mt-6 mb-6 grid grid-cols-1 sm:grid-cols-3 gap-4 text-center">
        <div className="bg-green-100 p-4 rounded shadow">
          <p className="font-bold text-green-800">Total IN</p>
          <p className="text-lg font-semibold">₹{totalIN}</p>
        </div>
        <div className="bg-red-100 p-4 rounded shadow">
          <p className="font-bold text-red-800">Total OUT</p>
          <p className="text-lg font-semibold">₹{totalOUT}</p>
        </div>
        <div
          className={`p-4 rounded shadow ${
            balance >= 0 ? "bg-blue-100" : "bg-yellow-100"
          }`}
        >
          <p className="font-bold text-gray-800">Balance</p>
          <p className="text-lg font-semibold">₹{balance}</p>
        </div>
      </div>

      {/* Scrollable Table */}
      <div className="overflow-x-auto shadow-lg rounded-lg border">
  <table className="w-full border-collapse min-w-[600px] text-sm">
          <thead className="bg-gray-200 sticky top-0 z-10">
            <tr>
              <th className="border p-2">Date</th>
              <th className="border p-2">Type</th>
              <th className="border p-2">Amount</th>
              <th className="border p-2">Mode</th>
              <th className="border p-2">Description</th>
            </tr>
          </thead>
          <tbody>
            {data.length > 0 ? (
              data.map((row: any) => (
                <tr key={row._id} className="hover:bg-gray-50">
                  <td className="border p-2 text-sm">
                    {new Date(row.createdAt).toLocaleDateString()}
                  </td>
                  <td
                    className={`border p-2 text-sm font-medium ${
                      row.type === "IN" ? "text-green-600" : "text-red-600"
                    }`}
                  >
                    {row.type}
                  </td>
                  <td className="border p-2 text-sm">₹{row.amount}</td>
                  <td className="border p-2 text-sm">{row.mode}</td>
                  <td className="border p-2 text-sm">{row.description || "-"}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={5} className="text-center p-4 text-gray-500">
                  No records found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      
    </div>
  );
}
