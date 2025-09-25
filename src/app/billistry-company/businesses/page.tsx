'use client';

import { useEffect, useState } from "react";
import { FaEye, FaEdit, FaBan } from "react-icons/fa";

interface Business {
  _id: string;
  name: string;
  owner: string;
  email?: string;
  phone?: string;
  isActive: boolean;
  subscriptionPlan: string;
  subscriptionExpiry: string;
}

export default function BusinessManagement() {
  const [businesses, setBusinesses] = useState<Business[]>([]);

  // Dummy data for demonstration
  useEffect(() => {
    setBusinesses([
      { _id: "1", name: "Alpha Store", owner: "Alice", email: "alpha@store.com", phone: "1234567890", isActive: true, subscriptionPlan: "Premium", subscriptionExpiry: "2025-12-31" },
      { _id: "2", name: "Beta Mart", owner: "Bob", email: "beta@mart.com", phone: "0987654321", isActive: false, subscriptionPlan: "Basic", subscriptionExpiry: "2025-08-31" },
      { _id: "3", name: "Gamma Shop", owner: "Charlie", email: "gamma@shop.com", phone: "1122334455", isActive: true, subscriptionPlan: "Pro", subscriptionExpiry: "2025-11-30" },
    ]);
  }, []);

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
        <h1 className="text-3xl font-bold text-gray-800">Business Management</h1>
        <button className="mt-2 sm:mt-0 bg-green-600 text-white px-4 py-2 rounded shadow hover:bg-green-700 flex items-center gap-2 transition">
          Add New Business
        </button>
      </div>

      {/* Businesses Table */}
      <div className="overflow-x-auto bg-white shadow rounded-lg">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-100">
            <tr>
              <th className="px-6 py-3 text-left text-sm font-medium text-gray-600">Name</th>
              <th className="px-6 py-3 text-left text-sm font-medium text-gray-600">Owner</th>
              <th className="px-6 py-3 text-left text-sm font-medium text-gray-600">Email</th>
              <th className="px-6 py-3 text-left text-sm font-medium text-gray-600">Phone</th>
              <th className="px-6 py-3 text-left text-sm font-medium text-gray-600">Status</th>
              <th className="px-6 py-3 text-left text-sm font-medium text-gray-600">Subscription</th>
              <th className="px-6 py-3 text-center text-sm font-medium text-gray-600">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {businesses.map((business) => (
              <tr key={business._id}>
                <td className="px-6 py-4">{business.name}</td>
                <td className="px-6 py-4">{business.owner}</td>
                <td className="px-6 py-4">{business.email || "-"}</td>
                <td className="px-6 py-4">{business.phone || "-"}</td>
                <td className="px-6 py-4">
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-semibold ${
                      business.isActive ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                    }`}
                  >
                    {business.isActive ? "Active" : "Inactive"}
                  </span>
                </td>
                <td className="px-6 py-4">
                  {business.subscriptionPlan} ({business.subscriptionExpiry})
                </td>
                <td className="px-6 py-4 text-center space-x-2">
                  <button className="text-gray-800 hover:underline flex items-center gap-1">
                    <FaEye /> View
                  </button>
                  <button className="text-blue-600 hover:underline flex items-center gap-1">
                    <FaEdit /> Edit
                  </button>
                  <button className="text-red-600 hover:underline flex items-center gap-1">
                    <FaBan /> Cancel Subscription
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
