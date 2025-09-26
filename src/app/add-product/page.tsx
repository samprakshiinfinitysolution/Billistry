'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function AddProductPage() {
  const router = useRouter()
  const [form, setForm] = useState({
    name: '',
    quantity: '',
    price: '',
    category: '',
    lowStockAlert: '',
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const res = await fetch('/api/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          quantity: Number(form.quantity),
          price: Number(form.price),
          lowStockAlert: Number(form.lowStockAlert),
        }),
      })

      if (!res.ok) throw new Error('Failed to add product')

      router.push('/products') // Go to product list after success
    } catch (err: any) {
      setError(err.message || 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-xl mx-auto mt-10 px-4">
      <h1 className="text-2xl font-bold text-pink-600 mb-6 text-center">Add New Product</h1>
      <form onSubmit={handleSubmit} className="space-y-4 bg-white shadow p-6 rounded-lg">
        {['name', 'quantity', 'price', 'category', 'lowStockAlert'].map((field) => (
          <div key={field}>
            <label className="block text-sm font-medium text-gray-700 capitalize">
              {field.replace(/([A-Z])/g, ' $1')}
            </label>
            <input
              type={field === 'quantity' || field === 'price' || field === 'lowStockAlert' ? 'number' : 'text'}
              name={field}
              value={form[field as keyof typeof form]}
              onChange={handleChange}
              required
              className="mt-1 block w-full px-4 py-2 border rounded-md shadow-sm focus:ring-pink-500 focus:border-pink-500 border-gray-300"
            />
          </div>
        ))}

        {error && <p className="text-sm text-red-600">{error}</p>}

        <button
          type="submit"
          disabled={loading}
          className="w-full py-2 px-4 bg-pink-600 hover:bg-pink-700 text-white font-semibold rounded-md shadow"
        >
          {loading ? 'Adding...' : 'Add Product'}
        </button>
      </form>
    </div>
  )
}
