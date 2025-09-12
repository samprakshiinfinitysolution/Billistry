// 'use client'

// import { useState } from 'react'
// import { BarChart, Bar, XAxis, Tooltip, ResponsiveContainer } from 'recharts'
// import { ChevronDown } from 'lucide-react'

// type Product = {
//   name: string
//   sku: string
//   category: string
//   stock: number
//   value: number
// }

// const dummyData: Product[] = [
//   {
//     name: 'Eco-Friendly Cleaning Spray',
//     sku: 'EC1234',
//     category: 'Cleaning Supplies',
//     stock: 150,
//     value: 750,
//   },
//   {
//     name: 'Organic Hand Soap',
//     sku: 'OH5678',
//     category: 'Personal Care',
//     stock: 200,
//     value: 400,
//   },
//   {
//     name: 'Bamboo Toothbrushes',
//     sku: 'BT9012',
//     category: 'Personal Care',
//     stock: 100,
//     value: 250,
//   },
//   {
//     name: 'Recycled Paper Towels',
//     sku: 'RP3456',
//     category: 'Cleaning Supplies',
//     stock: 120,
//     value: 360,
//   },
//   {
//     name: 'Reusable Water Bottles',
//     sku: 'RW7890',
//     category: 'Accessories',
//     stock: 180,
//     value: 900,
//   },
// ]

// export default function ReportsPage() {
//   const [activeTab, setActiveTab] = useState('Inventory Reports')

//   const stockByCategory = dummyData.reduce<Record<string, number>>((acc, item) => {
//     acc[item.category] = (acc[item.category] || 0) + item.stock
//     return acc
//   }, {})

//   const barData = Object.entries(stockByCategory).map(([name, stock]) => ({
//     name,
//     stock,
//   }))

//   return (
//     <div className="max-w-7xl mx-auto px-6 py-10 space-y-8">
//       <h1 className="text-2xl font-bold">Reports</h1>
//       <p className="text-gray-500">Generate and view reports on sales, inventory, and low stock levels.</p>

//       {/* Tabs */}
//       <div className="flex space-x-4 border-b">
//         {['Sales Reports', 'Inventory Reports', 'Low Stock Reports'].map((tab) => (
//           <button
//             key={tab}
//             className={`pb-2 font-medium ${activeTab === tab ? 'border-b-2 border-black text-black' : 'text-gray-400'}`}
//             onClick={() => setActiveTab(tab)}
//           >
//             {tab}
//           </button>
//         ))}
//       </div>

//       {/* Filters */}
//       <div className="flex space-x-4">
//         <div className="w-1/2">
//           <label className="text-sm text-gray-600 block mb-1">Select Date Range</label>
//           <input
//             type="text"
//             placeholder="Select"
//             className="w-full border px-4 py-2 rounded-md"
//           />
//         </div>
//         <div className="w-1/2 relative">
//           <label className="text-sm text-gray-600 block mb-1">Category</label>
//           <button className="w-full border px-4 py-2 rounded-md flex justify-between items-center text-left">
//             Select <ChevronDown size={16} />
//           </button>
//         </div>
//       </div>

//       {/* Table */}
//       <div className="overflow-x-auto border rounded-lg">
//         <table className="min-w-full text-sm text-left">
//           <thead className="bg-gray-100 text-gray-600">
//             <tr>
//               <th className="px-4 py-3">Product Name</th>
//               <th className="px-4 py-3">SKU</th>
//               <th className="px-4 py-3">Category</th>
//               <th className="px-4 py-3">Current Stock</th>
//               <th className="px-4 py-3">Value</th>
//             </tr>
//           </thead>
//           <tbody>
//             {dummyData.map((product) => (
//               <tr key={product.sku} className="border-t">
//                 <td className="px-4 py-2">{product.name}</td>
//                 <td className="px-4 py-2 text-blue-600">{product.sku}</td>
//                 <td className="px-4 py-2 text-blue-600">{product.category}</td>
//                 <td className="px-4 py-2">{product.stock}</td>
//                 <td className="px-4 py-2">${product.value}</td>
//               </tr>
//             ))}
//           </tbody>
//         </table>
//       </div>

//       {/* Chart */}
//       <div className="border rounded-lg p-6">
//         <h3 className="text-md font-medium mb-4">Stock Levels by Category</h3>
//         <ResponsiveContainer width="100%" height={200}>
//           <BarChart data={barData}>
//             <XAxis dataKey="name" />
//             <Tooltip />
//             <Bar dataKey="stock" fill="#cbd5e1" radius={[6, 6, 0, 0]} />
//           </BarChart>
//         </ResponsiveContainer>
//       </div>

//       {/* Export Buttons */}
//       <div className="flex space-x-4">
//         <button className="bg-gray-200 px-6 py-2 rounded-md hover:bg-gray-300">Export as CSV</button>
//         <button className="bg-blue-700 text-white px-6 py-2 rounded-md hover:bg-blue-800">Export as PDF</button>
//       </div>
//     </div>
//   )
// }



'use client';

import { useState } from 'react';
import { format } from 'date-fns';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

export default function ReportsPage() {
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [reportType, setReportType] = useState<string>("sales");

  const reportData = [
    { name: "Item A", quantity: 10, total: 1000 },
    { name: "Item B", quantity: 5, total: 500 },
  ];

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold">Reports</h1>

      <div className="flex gap-4 flex-wrap">
        <Card className="w-fit">
          <CardContent className="p-4">
            <Calendar
              mode="single"
              selected={date}
              onSelect={setDate}
              className="rounded-md border"
            />
          </CardContent>
        </Card>

        <Select value={reportType} onValueChange={setReportType}>
          <SelectTrigger className="w-[200px] mt-4">
            <SelectValue placeholder="Select report type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="sales">Sales</SelectItem>
            <SelectItem value="purchase">Purchase</SelectItem>
            <SelectItem value="stock">Stock</SelectItem>
          </SelectContent>
        </Select>

        <Button className="mt-4">Download Report</Button>
      </div>

      <Card>
        <CardContent className="p-4">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Item Name</TableHead>
                <TableHead>Quantity</TableHead>
                <TableHead>Total</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {reportData.map((item, i) => (
                <TableRow key={i}>
                  <TableCell>{item.name}</TableCell>
                  <TableCell>{item.quantity}</TableCell>
                  <TableCell>₹{item.total}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
