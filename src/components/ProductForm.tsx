// File: src/components/ProductForm.tsx
'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function ProductForm() {
  const [form, setForm] = useState({
    name: '',
    quantity: '',
    price: '',
    category: '',
    lowStockAlert: '5',
  })

  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    const res = await fetch('/api/products', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: form.name,
        quantity: Number(form.quantity),
        price: Number(form.price),
        category: form.category,
        lowStockAlert: Number(form.lowStockAlert),
      }),
    })

    if (res.ok) {
      router.push('/products')
    } else {
      const data = await res.json()
      setError(data.message || 'Error adding product')
    }

    setLoading(false)
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-xl mx-auto bg-white p-6 rounded shadow space-y-4">
      <h2 className="text-2xl font-bold">Add Product</h2>

      {error && <div className="text-red-600 text-sm">{error}</div>}

      <input
        name="name"
        placeholder="Product Name"
        value={form.name}
        onChange={handleChange}
        required
        className="w-full border px-4 py-2 rounded"
      />
      <input
        name="quantity"
        type="number"
        placeholder="Quantity"
        value={form.quantity}
        onChange={handleChange}
        required
        className="w-full border px-4 py-2 rounded"
      />
      <input
        name="price"
        type="number"
        placeholder="Price"
        value={form.price}
        onChange={handleChange}
        required
        className="w-full border px-4 py-2 rounded"
      />
      <input
        name="category"
        placeholder="Category"
        value={form.category}
        onChange={handleChange}
        className="w-full border px-4 py-2 rounded"
      />
      <input
        name="lowStockAlert"
        type="number"
        placeholder="Low Stock Alert Threshold"
        value={form.lowStockAlert}
        onChange={handleChange}
        className="w-full border px-4 py-2 rounded"
      />

      <button
        type="submit"
        className="bg-pink-600 text-white px-4 py-2 rounded w-full font-semibold hover:bg-pink-700"
        disabled={loading}
      >
        {loading ? 'Adding...' : 'Add Product'}
      </button>
    </form>
  )
}
