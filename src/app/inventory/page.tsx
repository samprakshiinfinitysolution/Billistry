<<<<<<< HEAD
// File: app/inventory/page.tsx
'use client'

import { useState } from 'react'
import { Search, Filter } from 'lucide-react'
import TopHeader from '@/components/TopHeader'

const dummyInventory = [
  { name: 'Eco-Friendly Bamboo Toothbrush', sku: 'TB-001', category: 'Personal Care', quantity: 250, status: 'In Stock' },
  { name: 'Organic Cotton T-Shirt', sku: 'TS-010', category: 'Apparel', quantity: 100, status: 'In Stock' },
  { name: 'Recycled Paper Notebook', sku: 'NB-045', category: 'Stationery', quantity: 50, status: 'Low Stock' },
  { name: 'Stainless Steel Water Bottle', sku: 'WB-100', category: 'Fitness', quantity: 0, status: 'Out of Stock' },
  { name: 'Reusable Shopping Bag', sku: 'BG-005', category: 'Home Goods', quantity: 20, status: 'Out of Stock' },
  { name: 'Natural Soy Candle', sku: 'CD-066', category: 'Home Goods', quantity: 160, status: 'In Stock' },
  { name: 'Bamboo Cutting Board', sku: 'CB-007', category: 'Kitchenware', quantity: 75, status: 'In Stock' },
  { name: 'Organic Baby Onesie', sku: 'BO-060', category: 'Apparel', quantity: 10, status: 'Out of Stock' },
]

export default function InventoryPage() {
  const [searchTerm, setSearchTerm] = useState('')
  const [filteredData, setFilteredData] = useState(dummyInventory)

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.toLowerCase()
    setSearchTerm(value)
    setFilteredData(
      dummyInventory.filter(item =>
        item.name.toLowerCase().includes(value) ||
        item.sku.toLowerCase().includes(value) ||
        item.category.toLowerCase().includes(value)
      )
    )
  }

  return (
    <>
      {/* <TopHeader /> */}
      <main className="max-w-7xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-6 text-gray-800">Inventory Dashboard</h1>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <SummaryCard title="Total Products" value="1200" />
          <SummaryCard title="In Stock" value="950" />
          <SummaryCard title="Low Stock Alerts" value="150" />
          <SummaryCard title="Out of Stock" value="100" />
        </div>

        {/* Search bar */}
        <div className="relative mb-4">
          <Search className="absolute top-3 left-3 text-gray-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={handleSearch}
            className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg w-full focus:ring-2 focus:ring-pink-500 focus:outline-none"
            placeholder="Search inventory..."
          />
        </div>

        {/* Inventory Table */}
        <div className="overflow-x-auto bg-white shadow rounded-lg">
          <table className="min-w-full text-sm text-left">
            <thead className="bg-gray-100">
              <tr>
                <th className="px-6 py-4">Product Name</th>
                <th className="px-6 py-4">SKU</th>
                <th className="px-6 py-4">Category</th>
                <th className="px-6 py-4">Quantity</th>
                <th className="px-6 py-4">Status</th>
              </tr>
            </thead>
            <tbody>
              {filteredData.map((item, idx) => (
                <tr key={idx} className="border-t">
                  <td className="px-6 py-4 text-gray-800 font-medium">{item.name}</td>
                  <td className="px-6 py-4 text-gray-600">{item.sku}</td>
                  <td className="px-6 py-4 text-gray-600">{item.category}</td>
                  <td className="px-6 py-4 text-gray-600">{item.quantity}</td>
                  <td className="px-6 py-4">
                    <span
                      className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${
                        item.status === 'In Stock'
                          ? 'bg-green-100 text-green-700'
                          : item.status === 'Low Stock'
                          ? 'bg-yellow-100 text-yellow-700'
                          : 'bg-red-100 text-red-700'
                      }`}
                    >
                      {item.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </main>
    </>
  )
}

function SummaryCard({ title, value }: { title: string; value: string }) {
  return (
    <div className="p-5 bg-white shadow rounded-lg text-center">
      <h2 className="text-gray-500 text-sm font-medium mb-1">{title}</h2>
      <p className="text-xl font-semibold text-gray-800">{value}</p>
    </div>
  )
}
=======
// // File: app/inventory/page.tsx
// 'use client'

// import { useState } from 'react'
// import { Search, Filter } from 'lucide-react'
// import TopHeader from '@/components/TopHeader'

// const dummyInventory = [
//   { name: 'Eco-Friendly Bamboo Toothbrush', sku: 'TB-001', category: 'Personal Care', quantity: 250, status: 'In Stock' },
//   { name: 'Organic Cotton T-Shirt', sku: 'TS-010', category: 'Apparel', quantity: 100, status: 'In Stock' },
//   { name: 'Recycled Paper Notebook', sku: 'NB-045', category: 'Stationery', quantity: 50, status: 'Low Stock' },
//   { name: 'Stainless Steel Water Bottle', sku: 'WB-100', category: 'Fitness', quantity: 0, status: 'Out of Stock' },
//   { name: 'Reusable Shopping Bag', sku: 'BG-005', category: 'Home Goods', quantity: 20, status: 'Out of Stock' },
//   { name: 'Natural Soy Candle', sku: 'CD-066', category: 'Home Goods', quantity: 160, status: 'In Stock' },
//   { name: 'Bamboo Cutting Board', sku: 'CB-007', category: 'Kitchenware', quantity: 75, status: 'In Stock' },
//   { name: 'Organic Baby Onesie', sku: 'BO-060', category: 'Apparel', quantity: 10, status: 'Out of Stock' },
// ]

// export default function InventoryPage() {
//   const [searchTerm, setSearchTerm] = useState('')
//   const [filteredData, setFilteredData] = useState(dummyInventory)

//   const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
//     const value = e.target.value.toLowerCase()
//     setSearchTerm(value)
//     setFilteredData(
//       dummyInventory.filter(item =>
//         item.name.toLowerCase().includes(value) ||
//         item.sku.toLowerCase().includes(value) ||
//         item.category.toLowerCase().includes(value)
//       )
//     )
//   }

//   return (
//     <>
//       {/* <TopHeader /> */}
//       <main className="max-w-7xl mx-auto px-4 py-8">
//         <h1 className="text-2xl font-bold mb-6 text-gray-800">Inventory Dashboard</h1>

//         {/* Summary Cards */}
//         <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mb-6">
//           <SummaryCard title="Total Products" value="1200" />
//           <SummaryCard title="In Stock" value="950" />
//           <SummaryCard title="Low Stock Alerts" value="150" />
//           <SummaryCard title="Out of Stock" value="100" />
//         </div>

//         {/* Search bar */}
//         <div className="relative mb-4">
//           <Search className="absolute top-3 left-3 text-gray-400" />
//           <input
//             type="text"
//             value={searchTerm}
//             onChange={handleSearch}
//             className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg w-full focus:ring-2 focus:ring-pink-500 focus:outline-none"
//             placeholder="Search inventory..."
//           />
//         </div>

//         {/* Inventory Table */}
//         <div className="overflow-x-auto bg-white shadow rounded-lg">
//           <table className="min-w-full text-sm text-left">
//             <thead className="bg-gray-100">
//               <tr>
//                 <th className="px-6 py-4">Product Name</th>
//                 <th className="px-6 py-4">SKU</th>
//                 <th className="px-6 py-4">Category</th>
//                 <th className="px-6 py-4">Quantity</th>
//                 <th className="px-6 py-4">Status</th>
//               </tr>
//             </thead>
//             <tbody>
//               {filteredData.map((item, idx) => (
//                 <tr key={idx} className="border-t">
//                   <td className="px-6 py-4 text-gray-800 font-medium">{item.name}</td>
//                   <td className="px-6 py-4 text-gray-600">{item.sku}</td>
//                   <td className="px-6 py-4 text-gray-600">{item.category}</td>
//                   <td className="px-6 py-4 text-gray-600">{item.quantity}</td>
//                   <td className="px-6 py-4">
//                     <span
//                       className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${
//                         item.status === 'In Stock'
//                           ? 'bg-green-100 text-green-700'
//                           : item.status === 'Low Stock'
//                           ? 'bg-yellow-100 text-yellow-700'
//                           : 'bg-red-100 text-red-700'
//                       }`}
//                     >
//                       {item.status}
//                     </span>
//                   </td>
//                 </tr>
//               ))}
//             </tbody>
//           </table>
//         </div>
//       </main>
//     </>
//   )
// }

// function SummaryCard({ title, value }: { title: string; value: string }) {
//   return (
//     <div className="p-5 bg-white shadow rounded-lg text-center">
//       <h2 className="text-gray-500 text-sm font-medium mb-1">{title}</h2>
//       <p className="text-xl font-semibold text-gray-800">{value}</p>
//     </div>
//   )
// }
>>>>>>> ce21ec2fdc56a92ea043161788371f59da47de6b
