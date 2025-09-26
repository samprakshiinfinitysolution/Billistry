"use client";

import { useEffect, useState } from "react";
import { FaEdit, FaBan, FaTrash } from "react-icons/fa";
import axios from "axios";

interface User {
  _id: string;
  name: string;
  email?: string;
  phone?: string;
  role: string;
  isActive: boolean;
}

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios.get("/api/users")
      .then((res) => setUsers(res.data))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <p className="p-6">Loading users...</p>;

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
        <h1 className="text-3xl font-bold text-gray-800">All Users</h1>
        <button className="mt-2 sm:mt-0 bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 flex items-center gap-2 transition">
          Add New User
        </button>
      </div>

      <div className="overflow-x-auto bg-white shadow rounded-lg">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-100">
            <tr>
              <th className="px-6 py-3 text-left text-sm font-medium text-gray-600">Name</th>
              <th className="px-6 py-3 text-left text-sm font-medium text-gray-600">Email</th>
              <th className="px-6 py-3 text-left text-sm font-medium text-gray-600">Phone</th>
              <th className="px-6 py-3 text-left text-sm font-medium text-gray-600">Role</th>
              <th className="px-6 py-3 text-left text-sm font-medium text-gray-600">Status</th>
              <th className="px-6 py-3 text-center text-sm font-medium text-gray-600">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {users.map((user) => (
              <tr key={user._id}>
                <td className="px-6 py-4">{user.name}</td>
                <td className="px-6 py-4">{user.email || "-"}</td>
                <td className="px-6 py-4">{user.phone || "-"}</td>
                <td className="px-6 py-4 capitalize">{user.role}</td>
                <td className="px-6 py-4">
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-semibold ${
                      user.isActive ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                    }`}
                  >
                    {user.isActive ? "Active" : "Inactive"}
                  </span>
                </td>
                <td className="px-6 py-4 text-center space-x-2">
                  <button className="text-blue-600 hover:underline flex items-center gap-1">
                    <FaEdit /> Edit
                  </button>
                  <button className="text-yellow-600 hover:underline flex items-center gap-1">
                    <FaBan /> {user.isActive ? "Deactivate" : "Activate"}
                  </button>
                  <button className="text-red-600 hover:underline flex items-center gap-1">
                    <FaTrash /> Delete
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
