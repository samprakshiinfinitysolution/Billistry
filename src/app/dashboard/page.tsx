'use client';

import { useEffect, useState } from "react";

interface Business {
  _id: string;
  name: string;
  owner: string;
  address?: string;
  phone?: string;
  email?: string;
  isActive: boolean;
}

export default function BusinessManager() {
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ id: "", name: "", address: "", phone: "", email: "" });
  const [editing, setEditing] = useState(false);

  // Fetch businesses
  const fetchBusinesses = async () => {
    setLoading(true);
    const res = await fetch("/api/business");
    const data = await res.json();
    if (data.success) setBusinesses(data.businesses);
    setLoading(false);
  };

  useEffect(() => { fetchBusinesses(); }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async () => {
    const method = editing ? "PUT" : "POST";
    const body = editing ? form : { ...form };

    const res = await fetch("/api/business", { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
    const data = await res.json();
    if (data.success) {
      setForm({ id: "", name: "", address: "", phone: "", email: "" });
      setEditing(false);
      fetchBusinesses();
    } else alert(data.error || "Something went wrong");
  };

  const handleEdit = (b: Business) => {
    setForm({ id: b._id, name: b.name, address: b.address || "", phone: b.phone || "", email: b.email || "" });
    setEditing(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this business?")) return;
    const res = await fetch(`/api/business?id=${id}`, { method: "DELETE" });
    const data = await res.json();
    if (data.success) fetchBusinesses();
    else alert(data.error || "Delete failed");
  };

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">Business Manager</h2>

      <div className="mb-6 border p-4 rounded">
        <h3 className="font-semibold mb-2">{editing ? "Edit Business" : "Add Business"}</h3>
        <input name="name" value={form.name} onChange={handleChange} placeholder="Name" className="border p-2 mb-2 w-full" />
        <input name="address" value={form.address} onChange={handleChange} placeholder="Address" className="border p-2 mb-2 w-full" />
        <input name="phone" value={form.phone} onChange={handleChange} placeholder="Phone" className="border p-2 mb-2 w-full" />
        <input name="email" value={form.email} onChange={handleChange} placeholder="Email" className="border p-2 mb-2 w-full" />
        
        <button onClick={handleSubmit} className="bg-blue-500 text-white px-4 py-2 rounded">
          {editing ? "Update" : "Add"}
        </button>
      </div>

      <h3 className="font-semibold mb-2">Your Businesses</h3>
      {loading ? <p>Loading...</p> : (
        <table className="w-full border">
          <thead>
            <tr>
              <th className="border px-2 py-1">Name</th>
              <th className="border px-2 py-1">Address</th>
              <th className="border px-2 py-1">Phone</th>
              <th className="border px-2 py-1">Email</th>
              <th className="border px-2 py-1">Actions</th>
            </tr>
          </thead>
          <tbody>
            {businesses.map(b => (
              <tr key={b._id}>
                <td className="border px-2 py-1">{b.name}</td>
                <td className="border px-2 py-1">{b.address}</td>
                <td className="border px-2 py-1">{b.phone}</td>
                <td className="border px-2 py-1">{b.email}</td>
                <td className="border px-2 py-1 space-x-2">
                  <button onClick={() => handleEdit(b)} className="bg-yellow-400 px-2 py-1 rounded">Edit</button>
                  <button onClick={() => handleDelete(b._id)} className="bg-red-500 text-white px-2 py-1 rounded">Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
