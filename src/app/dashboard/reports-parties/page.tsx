// src/app/dashboard/reports/page.tsx
"use client";

import { useEffect, useMemo, useState } from "react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import Link from "next/link";

type PartyType = "Customer" | "Supplier" | "All";
type Row = {
  _id: string;
  partyType: "Customer" | "Supplier";
  name: string;
  phone: string;
  totalGot: number;
  totalGave: number;
  balance: number;
  status: "You Will Get" | "You Will Give" | "Settled";
};

type Report = {
  youWillGet: number;
  youWillGive: number;
  net: number;
  count: number;
  details: Row[];
};

export default function ReportsPage() {
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [partyType, setPartyType] = useState<PartyType>("All");
  const [loading, setLoading] = useState(false);
  const [report, setReport] = useState<Report | null>(null);

  // New search states
  const [searchName, setSearchName] = useState("");
  const [searchPhone, setSearchPhone] = useState("");
  const [searchStatus, setSearchStatus] = useState<"" | "You Will Get" | "You Will Give" | "Settled">("");

  const fetchReport = async () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (startDate) params.set("startDate", startDate);
    if (endDate) params.set("endDate", endDate);
    if (partyType) params.set("partyType", partyType);

    const res = await fetch(`/api/reports/party-balances?${params.toString()}`);
    const data = await res.json();
    setReport(data);
    setLoading(false);
  };

  useEffect(() => {
    fetchReport();

    



  }, []);

  const exportCSV = () => {
    if (!report) return;
    const header = ["Type", "Name", "Phone", "Total Got", "Total Gave", "Balance", "Status"];
    const rows = filteredDetails.map((d) => [
      d.partyType,
      d.name,
      d.phone,
      d.totalGot,
      d.totalGave,
      d.balance,
      d.status,
    ]);
    const blob = new Blob(
      [header.join(",") + "\n" + rows.map((r) => r.join(",")).join("\n")],
      { type: "text/csv;charset=utf-8" }
    );
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "party-balance-report.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  const exportPDF = () => {
    if (!report) return;
    const doc = new jsPDF();
    doc.text("Party Balance Report", 14, 14);
    const sub = [
      startDate ? `From: ${startDate}` : "",
      endDate ? `To: ${endDate}` : "",
      partyType !== "All" ? `Type: ${partyType}` : "",
    ]
      .filter(Boolean)
      .join("   ");
    if (sub) doc.text(sub, 14, 22);
    autoTable(doc, {
      startY: 28,
      head: [["Type", "Name", "Phone", "Total Got", "Total Gave", "Balance", "Status"]],
      body: filteredDetails.map((d) => [
        d.partyType,
        d.name,
        d.phone,
        d.totalGot.toFixed(2),
        d.totalGave.toFixed(2),
        d.balance.toFixed(2),
        d.status,
      ]),
      styles: { fontSize: 9 },
    });
    const y = (doc as any).lastAutoTable.finalY + 8;
    doc.text(
      `You Will Get: ₹${report.youWillGet.toFixed(2)}    You Will Give: ₹${report.youWillGive.toFixed(
        2
      )}    Net: ₹${report.net.toFixed(2)}`,
      14,
      y
    );
    doc.save("party-balance-report.pdf");
  };

  // Filtering the details based on search inputs
  const filteredDetails = useMemo(() => {
    if (!report) return [];
    return report.details.filter((d) => {
      const matchName = searchName
        ? d.name.toLowerCase().includes(searchName.toLowerCase())
        : true;
      const matchPhone = searchPhone
        ? d.phone?.toLowerCase().includes(searchPhone.toLowerCase())
        : true;
      const matchStatus = searchStatus ? d.status === searchStatus : true;
      return matchName && matchPhone && matchStatus;
    });
  }, [report, searchName, searchPhone, searchStatus]);

  const totals = useMemo(() => {
    if (!filteredDetails.length) return { get: 0, give: 0, net: 0, count: 0 };
    let get = 0, give = 0;
    filteredDetails.forEach((d) => {
      if (d.balance > 0) get += d.balance;
      else if (d.balance < 0) give += Math.abs(d.balance);
    });
    return { get, give, net: get - give, count: filteredDetails.length };
  }, [filteredDetails]);

  return (
    <div className="p-4 md:p-6 max-w-7xl mx-auto">
      <h1 className="text-xl md:text-2xl font-bold mb-4">Reports — Party Balances</h1>

      {/* Filters */}
      <div className="grid sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3 items-end">
        <div>
          <label className="text-sm text-gray-600">Start Date</label>
          <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="border rounded p-2 w-full" />
        </div>
        <div>
          <label className="text-sm text-gray-600">End Date</label>
          <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} className="border rounded p-2 w-full" />
        </div>
        <div>
          <label className="text-sm text-gray-600">Party Type</label>
          <select value={partyType} onChange={(e) => setPartyType(e.target.value as PartyType)} className="border rounded p-2 w-full">
            <option value="All">All</option>
            <option value="Customer">Customer</option>
            <option value="Supplier">Supplier</option>
          </select>
        </div>

        {/* New search inputs */}
        <div>
          <label className="text-sm text-gray-600">Search Name</label>
          <input type="text" value={searchName} onChange={(e) => setSearchName(e.target.value)} className="border rounded p-2 w-full" placeholder="Enter name" />
        </div>
        <div>
          <label className="text-sm text-gray-600">Search Phone</label>
          <input type="text" value={searchPhone} onChange={(e) => setSearchPhone(e.target.value)} className="border rounded p-2 w-full" placeholder="Enter phone" />
        </div>
        <div>
          <label className="text-sm text-gray-600">Status</label>
          <select value={searchStatus} onChange={(e) => setSearchStatus(e.target.value as any)} className="border rounded p-2 w-full">
            <option value="">All</option>
            <option value="You Will Get">You Will Get</option>
            <option value="You Will Give">You Will Give</option>
            <option value="Settled">Settled</option>
          </select>
        </div>
      </div>

      {/* Action buttons */}
      <div className="flex flex-col sm:flex-row gap-2 mt-3">
        <button onClick={fetchReport} disabled={loading} className="bg-black text-white rounded p-2">
          {loading ? "Loading..." : "Apply Filters"}
        </button>
        <button onClick={exportCSV} className="border rounded p-2">Export CSV</button>
        <button onClick={exportPDF} className="bg-blue-600 text-white rounded p-2">Export PDF</button>
      </div>

      {/* Totals */}
      <div className="grid md:grid-cols-3 gap-4 mt-6">
        <div className="border rounded p-4">
          <div className="text-gray-600 text-sm">You Will Get</div>
          <div className="text-2xl font-semibold text-green-600">₹{totals.get.toLocaleString()}</div>
        </div>
        <div className="border rounded p-4">
          <div className="text-gray-600 text-sm">You Will Give</div>
          <div className="text-2xl font-semibold text-red-600">₹{totals.give.toLocaleString()}</div>
        </div>
        <div className="border rounded p-4">
          <div className="text-gray-600 text-sm">Net</div>
          <div className="text-2xl font-semibold">₹{totals.net.toLocaleString()}</div>
        </div>
      </div>

      {/* Table */}
      <div className="mt-6 overflow-x-auto max-h-[400px] border rounded">
        <table className="w-full text-sm min-w-[800px]">
          <thead className="sticky top-0 bg-white border-b z-10">
            <tr className="text-left">
              <th className="py-2 px-3">Type</th>
              <th className="py-2 px-3">Name</th>
              <th className="py-2 px-3">Phone</th>
              <th className="py-2 px-3">Total Got</th>
              <th className="py-2 px-3">Total Gave</th>
              <th className="py-2 px-3">Balance</th>
              <th className="py-2 px-3">Status</th>
              <th className="py-2 px-3">Ledger</th>
            </tr>
          </thead>
          <tbody>
            {filteredDetails.length ? (
              filteredDetails.map((d) => (
                <tr key={`${d.partyType}-${d._id}`} className="border-b hover:bg-gray-50">
                  <td className="py-2 px-3">{d.partyType}</td>
                  <td className="py-2 px-3">{d.name}</td>
                  <td className="py-2 px-3">{d.phone || "-"}</td>
                  <td className="py-2 px-3">₹{d.totalGot.toLocaleString()}</td>
                  <td className="py-2 px-3">₹{d.totalGave.toLocaleString()}</td>
                  <td className={`py-2 px-3 ${d.balance >= 0 ? "text-green-700" : "text-red-700"}`}>
                    ₹{d.balance.toLocaleString()}
                  </td>
                  <td className="py-2 px-3">{d.status}</td>
                  <td className="py-2 px-3">
                    <Link className="text-blue-600 underline" href={`/dashboard/ledger/${d.partyType}/${d._id}`}>
                      View
                    </Link>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td className="py-6 text-center text-gray-500" colSpan={8}>
                  No data
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}


