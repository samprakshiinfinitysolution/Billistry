"use client"

import { useState } from "react"
import { Download, FileText, Plus, Search } from "lucide-react"
import jsPDF from "jspdf"
import autoTable from "jspdf-autotable"
import * as XLSX from "xlsx"

const dummyInvoices = [
  { id: "INV001", customer: "Rajesh Sharma", date: "2025-07-01", status: "Paid", total: 4500 },
  { id: "INV002", customer: "Priya Mehta", date: "2025-07-02", status: "Pending", total: 2890 },
  { id: "INV003", customer: "Kunal Verma", date: "2025-07-03", status: "Cancelled", total: 1200 },
  { id: "INV004", customer: "Aarti Gupta", date: "2025-07-04", status: "Paid", total: 999 },
]

export default function InvoicePage() {
  const [search, setSearch] = useState("")
  const [showModal, setShowModal] = useState(false)
  const filtered = dummyInvoices.filter(
    (inv) =>
      inv.customer.toLowerCase().includes(search.toLowerCase()) ||
      inv.id.toLowerCase().includes(search.toLowerCase())
  )

  const exportPDF = () => {
    const doc = new jsPDF()
    doc.text("Invoices", 14, 10)
    autoTable(doc, {
      startY: 20,
      head: [["Invoice ID", "Customer", "Date", "Status", "Total"]],
      body: filtered.map((inv) => [inv.id, inv.customer, inv.date, inv.status, `₹${inv.total}`]),
    })
    doc.save("invoices.pdf")
  }

  const exportExcel = () => {
    const worksheet = XLSX.utils.json_to_sheet(filtered)
    const workbook = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(workbook, worksheet, "Invoices")
    XLSX.writeFile(workbook, "invoices.xlsx")
  }

  return (
    <section className="p-6 md:p-10 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
          <FileText className="text-pink-500" /> Invoices
        </h2>
        <div className="flex gap-2 flex-wrap">
          <button onClick={exportPDF} className="flex items-center gap-2 border border-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-100">
            <Download size={18} /> Export PDF
          </button>
          <button onClick={exportExcel} className="flex items-center gap-2 border border-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-100">
            <Download size={18} /> Export Excel
          </button>
          <button onClick={() => setShowModal(true)} className="flex items-center gap-2 bg-gradient-to-r from-pink-500 to-fuchsia-500 text-white px-4 py-2 rounded-lg shadow hover:from-pink-600 hover:to-fuchsia-600">
            <Plus size={18} /> New Invoice
          </button>
        </div>
      </div>

      <div className="mt-6 relative max-w-md">
        <input
          type="text"
          placeholder="Search by customer or ID..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-pink-400 shadow-sm"
        />
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
      </div>

      <div className="mt-6 overflow-x-auto">
        <table className="min-w-full border rounded-xl overflow-hidden shadow text-sm md:text-base">
          <thead className="bg-gray-100 text-gray-600 text-left">
            <tr>
              <th className="px-6 py-3">Invoice ID</th>
              <th className="px-6 py-3">Customer</th>
              <th className="px-6 py-3">Date</th>
              <th className="px-6 py-3">Status</th>
              <th className="px-6 py-3">Total</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length > 0 ? (
              filtered.map((inv) => (
                <tr key={inv.id} className="border-t hover:bg-gray-50">
                  <td className="px-6 py-4 font-medium text-gray-800">{inv.id}</td>
                  <td className="px-6 py-4">{inv.customer}</td>
                  <td className="px-6 py-4">{inv.date}</td>
                  <td className="px-6 py-4">
                    <span
                      className={`inline-block px-3 py-1 text-xs md:text-sm rounded-full font-semibold ${
                        inv.status === "Paid"
                          ? "bg-green-100 text-green-600"
                          : inv.status === "Pending"
                          ? "bg-yellow-100 text-yellow-600"
                          : "bg-red-100 text-red-600"
                      }`}
                    >
                      {inv.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 font-semibold">₹{inv.total.toLocaleString()}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={5} className="text-center px-6 py-6 text-gray-500">
                  No invoices found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Add Invoice Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-xl shadow-lg max-w-md w-full">
            <h3 className="text-lg font-bold mb-4">Add New Invoice</h3>
            <p className="text-sm text-gray-500 mb-4">(This is a placeholder modal. Integrate your form here.)</p>
            <div className="flex justify-end gap-2">
              <button onClick={() => setShowModal(false)} className="px-4 py-2 rounded-lg bg-gray-200 hover:bg-gray-300 text-gray-700">
                Cancel
              </button>
              <button onClick={() => setShowModal(false)} className="px-4 py-2 rounded-lg bg-pink-500 text-white hover:bg-pink-600">
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  )
}
