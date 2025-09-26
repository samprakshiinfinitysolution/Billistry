'use client'

import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'

export default function EditProductPage() {
  const { id } = useParams()
  const router = useRouter()

  const [form, setForm] = useState({
    name: '',
    quantity: '',
    price: '',
    category: '',
    lowStockAlert: '',
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const res = await fetch(`/api/products/${id}`)
        const data = await res.json()
        setForm({
          name: data.name,
          quantity: data.quantity,
          price: data.price,
          category: data.category,
          lowStockAlert: data.lowStockAlert,
        })
        setLoading(false)
      } catch {
        setError('Product not found')
        setLoading(false)
      }
    }

    if (id) fetchProduct()
  }, [id])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const res = await fetch(`/api/products/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          quantity: Number(form.quantity),
          price: Number(form.price),
          lowStockAlert: Number(form.lowStockAlert),
        }),
      })
      if (!res.ok) throw new Error('Failed to update product')
      router.push('/products')
    } catch (err: any) {
      setError(err.message || 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  if (loading) return <p className="text-center mt-10">Loading...</p>

  return (
    <div className="max-w-xl mx-auto mt-10 px-4">
      <h1 className="text-2xl font-bold text-pink-600 mb-6 text-center">Edit Product</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        {['name', 'quantity', 'price', 'category', 'lowStockAlert'].map((field) => (
          <div key={field}>
            <label className="block text-sm font-medium text-gray-700 capitalize">
              {field.replace(/([A-Z])/g, ' $1')}
            </label>
            <input
              type="text"
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
          {loading ? 'Saving...' : 'Save Changes'}
        </button>
      </form>
    </div>
  )
}
