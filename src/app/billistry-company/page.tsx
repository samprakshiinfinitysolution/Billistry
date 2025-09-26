'use client';

import { useEffect, useState } from "react";
import { FaUsers, FaBuilding, FaBoxOpen, FaDollarSign } from "react-icons/fa";

export default function CompanyDashboard() {
  const [stats, setStats] = useState({
    totalUsers: 0,
    activeBusinesses: 0,
    totalProducts: 0,
    revenue: 0,
  });

  useEffect(() => {
    // TODO: Replace with real API calls
    setStats({
      totalUsers: 245,
      activeBusinesses: 87,
      totalProducts: 2430,
      revenue: 124500,
    });
  }, []);

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
        <h1 className="text-3xl font-bold text-gray-800">Company Dashboard</h1>
        <p className="mt-2 sm:mt-0 text-gray-600">
          Overview of your business, users, and products
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        <div className="bg-white shadow rounded-lg p-5 flex items-center space-x-4">
          <div className="text-blue-600 text-3xl">
            <FaUsers />
          </div>
          <div>
            <div className="text-sm text-gray-500">Total Users</div>
            <div className="text-2xl font-bold text-gray-800">{stats.totalUsers}</div>
          </div>
        </div>

        <div className="bg-white shadow rounded-lg p-5 flex items-center space-x-4">
          <div className="text-green-600 text-3xl">
            <FaBuilding />
          </div>
          <div>
            <div className="text-sm text-gray-500">Active Businesses</div>
            <div className="text-2xl font-bold text-gray-800">{stats.activeBusinesses}</div>
          </div>
        </div>

        <div className="bg-white shadow rounded-lg p-5 flex items-center space-x-4">
          <div className="text-purple-600 text-3xl">
            <FaBoxOpen />
          </div>
          <div>
            <div className="text-sm text-gray-500">Products</div>
            <div className="text-2xl font-bold text-gray-800">{stats.totalProducts}</div>
          </div>
        </div>

        <div className="bg-white shadow rounded-lg p-5 flex items-center space-x-4">
          <div className="text-yellow-600 text-3xl">
            <FaDollarSign />
          </div>
          <div>
            <div className="text-sm text-gray-500">Revenue</div>
            <div className="text-2xl font-bold text-gray-800">${stats.revenue.toLocaleString()}</div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <button className="bg-blue-600 text-white rounded-lg p-4 shadow hover:bg-blue-700 transition">
          Add User
        </button>
        <button className="bg-green-600 text-white rounded-lg p-4 shadow hover:bg-green-700 transition">
          Add Business
        </button>
        <button className="bg-purple-600 text-white rounded-lg p-4 shadow hover:bg-purple-700 transition">
          Add Product
        </button>
        <button className="bg-yellow-600 text-white rounded-lg p-4 shadow hover:bg-yellow-700 transition">
          View Reports
        </button>
      </div>
    </div>
  );
}
