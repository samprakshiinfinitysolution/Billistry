"use client";

import { useState } from "react";

interface Props {
  onAdd: () => void;
}

export default function TransactionForm({ onAdd }: Props) {
  const [form, setForm] = useState({
    partyType: "Customer",
    partyId: "",
    amount: "",
    type: "You Got",
    description: "",
  });

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    await fetch("/api/transactions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    onAdd();
  };

  return (
    <form onSubmit={submit} className="space-y-3 border p-4 rounded">
      <select
        value={form.partyType}
        onChange={(e) => setForm({ ...form, partyType: e.target.value })}
        className="border p-2 w-full"
      >
        <option value="Customer">Customer</option>
        <option value="Supplier">Supplier</option>
      </select>
      <input
        placeholder="Party ID"
        className="border p-2 w-full"
        value={form.partyId}
        onChange={(e) => setForm({ ...form, partyId: e.target.value })}
      />
      <input
        placeholder="Amount"
        className="border p-2 w-full"
        value={form.amount}
        onChange={(e) => setForm({ ...form, amount: e.target.value })}
      />
      <select
        value={form.type}
        onChange={(e) => setForm({ ...form, type: e.target.value })}
        className="border p-2 w-full"
      >
        <option value="You Got">You Got</option>
        <option value="You Gave">You Gave</option>
      </select>
      <input
        placeholder="Description"
        className="border p-2 w-full"
        value={form.description}
        onChange={(e) => setForm({ ...form, description: e.target.value })}
      />
      <button type="submit" className="bg-blue-500 text-white p-2 w-full">
        Add Transaction
      </button>
    </form>
  );
}
