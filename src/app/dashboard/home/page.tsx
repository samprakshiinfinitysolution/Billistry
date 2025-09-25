// 'use client';

// import { useEffect, useState } from 'react';
// import axios from 'axios';
// import { Line } from 'react-chartjs-2';
// import {
//   Chart as ChartJS,
//   CategoryScale,
//   LinearScale,
//   PointElement,
//   LineElement,
//   Title,
//   Tooltip,
//   Legend,
// } from 'chart.js';

// ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

// export default function DashboardPage() {
//   const [totals, setTotals] = useState({
//     sales: 0,
//     purchases: 0,
//     expenses: 0,
//     customers: 0,
//     suppliers: 0,
//     items: 0,
//   });

//   const [salesData, setSalesData] = useState([]);
//   const [purchaseData, setPurchaseData] = useState([]);
//   const [filter, setFilter] = useState<'day' | 'month' | 'custom'>('month');
//   const [customRange, setCustomRange] = useState({ start: '', end: '' });

//   useEffect(() => {
//     fetchDashboardData();
//   }, [filter, customRange]);

//   const fetchDashboardData = async () => {
//     try {
//       let params: any = { filter };

//       if (filter === 'custom' && customRange.start && customRange.end) {
//         params.startDate = customRange.start;
//         params.endDate = customRange.end;
//       }

//       const res = await axios.get('/api/dashboard', { params });

//       setTotals(res.data.totals);
//       setSalesData(res.data.trends.sales);
//       setPurchaseData(res.data.trends.purchases);
//     } catch (error) {
//       console.error('Error fetching dashboard data:', error);
//     }
//   };

//   const salesChart = {
//     labels: salesData.map((d: any) => d.date),
//     datasets: [
//       {
//         label: 'Sales',
//         data: salesData.map((d: any) => d.total),
//         borderColor: 'rgb(34,197,94)',
//         backgroundColor: 'rgba(34,197,94,0.5)',
//       },
//     ],
//   };

//   const purchaseChart = {
//     labels: purchaseData.map((d: any) => d.date),
//     datasets: [
//       {
//         label: 'Purchases',
//         data: purchaseData.map((d: any) => d.total),
//         borderColor: 'rgb(59,130,246)',
//         backgroundColor: 'rgba(59,130,246,0.5)',
//       },
//     ],
//   };

//   return (
//     <div className="p-6 space-y-6">
//       <h1 className="text-2xl font-bold">📊 Business Dashboard</h1>

//       {/* Filters */}
//       <div className="flex gap-2 items-center">
//         <button onClick={() => setFilter('day')} className={`px-3 py-1 rounded ${filter === 'day' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}>Today</button>
//         <button onClick={() => setFilter('month')} className={`px-3 py-1 rounded ${filter === 'month' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}>This Month</button>
//         <button onClick={() => setFilter('custom')} className={`px-3 py-1 rounded ${filter === 'custom' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}>Custom</button>
//         {filter === 'custom' && (
//           <div className="flex gap-2">
//             <input type="date" value={customRange.start} onChange={(e) => setCustomRange({ ...customRange, start: e.target.value })} className="border p-1 rounded" />
//             <input type="date" value={customRange.end} onChange={(e) => setCustomRange({ ...customRange, end: e.target.value })} className="border p-1 rounded" />
//           </div>
//         )}
//       </div>

//       {/* Stats Cards */}
//       <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
//         <StatCard title="Total Sales" value={`₹ ${totals.sales.toFixed(2)}`} color="bg-green-100 text-green-700" />
//         <StatCard title="Total Purchases" value={`₹ ${totals.purchases.toFixed(2)}`} color="bg-blue-100 text-blue-700" />
//         <StatCard title="Total Expenses" value={`₹ ${totals.expenses.toFixed(2)}`} color="bg-red-100 text-red-700" />
//         <StatCard title="Total Customers" value={totals.customers} color="bg-purple-100 text-purple-700" />
//         <StatCard title="Total Suppliers" value={totals.suppliers} color="bg-yellow-100 text-yellow-700" />
//         <StatCard title="Total Items" value={totals.items} color="bg-gray-100 text-gray-700" />
//       </div>

//       {/* Graphs */}
//       <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
//         <div className="bg-white p-4 rounded shadow">
//           <h2 className="text-lg font-semibold mb-2">Sales Trend</h2>
//           <Line data={salesChart} />
//         </div>
//         <div className="bg-white p-4 rounded shadow">
//           <h2 className="text-lg font-semibold mb-2">Purchase Trend</h2>
//           <Line data={purchaseChart} />
//         </div>
//       </div>
//     </div>
//   );
// }

// function StatCard({ title, value, color }: { title: string; value: string | number; color: string }) {
//   return (
//     <div className={`p-4 rounded shadow ${color}`}>
//       <h3 className="text-sm">{title}</h3>
//       <p className="text-2xl font-bold">{value}</p>
//     </div>
//   );
// }

"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { format, startOfMonth, endOfMonth } from "date-fns";
import useAuthGuard from "@/hooks/useAuthGuard";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

export default function DashboardPage() {
  const { user } = useAuthGuard(); // 👈
  const [totals, setTotals] = useState({
    sales: 0,
    purchases: 0,
    expenses: 0,
    customers: 0,
    suppliers: 0,
    items: 0,
  });

  const [salesData, setSalesData] = useState<{ date: string; total: number }[]>(
    []
  );
  const [purchaseData, setPurchaseData] = useState<
    { date: string; total: number }[]
  >([]);
  const [filter, setFilter] = useState<"day" | "month" | "custom" | "all">(
    "month"
  );
  const [customRange, setCustomRange] = useState({ start: "", end: "" });

  useEffect(() => {
    fetchDashboardData();
  }, [filter, customRange]);

  const fetchDashboardData = async () => {
    try {
<<<<<<< HEAD
      const params: any = { filter };
=======
      let params: any = { filter };
>>>>>>> dcc59acd5f59524ac9f5cc4448fa122e42a677b1

      if (filter === "day") {
        params.start = format(new Date(), "yyyy-MM-dd");
        params.end = format(new Date(), "yyyy-MM-dd");
      } else if (filter === "month") {
        params.start = format(startOfMonth(new Date()), "yyyy-MM-dd");
        params.end = format(endOfMonth(new Date()), "yyyy-MM-dd");
      } else if (filter === "custom" && customRange.start && customRange.end) {
        params.start = customRange.start;
        params.end = customRange.end;
      }

      const res = await axios.get("/api/dashboard", { params });

      setTotals(res.data.totals);
      setSalesData(res.data.trends.sales);
      setPurchaseData(res.data.trends.purchases);
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
    }
  };

  const salesChart = {
    labels: salesData.map((d) => d.date),
    datasets: [
      {
        label: "Sales",
        data: salesData.map((d) => d.total),
        borderColor: "rgb(34,197,94)",
        backgroundColor: "rgba(34,197,94,0.5)",
      },
    ],
  };

  const purchaseChart = {
    labels: purchaseData.map((d) => d.date),
    datasets: [
      {
        label: "Purchases",
        data: purchaseData.map((d) => d.total),
        borderColor: "rgb(59,130,246)",
        backgroundColor: "rgba(59,130,246,0.5)",
      },
    ],
  };

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold">📊 Business Dashboard</h1>

      {/* Filters */}
      <div className="flex gap-2 items-center">
        {["day", "month", "all"].map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f as any)}
            className={`px-3 py-1 rounded ${
              filter === f ? "bg-blue-500 text-white" : "bg-gray-200"
            }`}
          >
            {f === "day" ? "Today" : f === "month" ? "This Month" : "All Time"}
          </button>
        ))}
        <button
          onClick={() => setFilter("custom")}
          className={`px-3 py-1 rounded ${
            filter === "custom" ? "bg-blue-500 text-white" : "bg-gray-200"
          }`}
        >
          Custom
        </button>
        {filter === "custom" && (
          <div className="flex gap-2">
            <input
              type="date"
              value={customRange.start}
              onChange={(e) =>
                setCustomRange({ ...customRange, start: e.target.value })
              }
              className="border p-1 rounded"
            />
            <input
              type="date"
              value={customRange.end}
              onChange={(e) =>
                setCustomRange({ ...customRange, end: e.target.value })
              }
              className="border p-1 rounded"
            />
          </div>
        )}
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* <StatCard title="Total Sales" value={`₹ ${totals.sales.toFixed(2)}`} color="bg-green-100 text-green-700" /> */}
        <StatCard
          title="Total Sales"
          value={`₹ ${totals.sales.toFixed(2)}`}
          color="bg-green-100 text-green-700"
          masked={!user?.permissions?.visibility?.viewAmounts} // 👈
        />

        <StatCard
          title="Total Purchases"
          value={`₹ ${totals.purchases.toFixed(2)}`}
          color="bg-blue-100 text-blue-700"
          masked={!user?.permissions?.visibility?.viewAmounts} // 👈
        />
        <StatCard
          title="Total Expenses"
          value={`₹ ${totals.expenses.toFixed(2)}`}
          color="bg-red-100 text-red-700"
          masked={!user?.permissions?.visibility?.viewAmounts} // 👈
        />
        <StatCard
          title="Total Customers"
          value={totals.customers}
          color="bg-purple-100 text-purple-700"
        />
        <StatCard
          title="Total Suppliers"
          value={totals.suppliers}
          color="bg-yellow-100 text-yellow-700"
        />
        <StatCard
          title="Total Items"
          value={totals.items}
          color="bg-gray-100 text-gray-700"
        />
      </div>

      {/* Graphs */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="bg-white p-4 rounded shadow">
          <h2 className="text-lg font-semibold mb-2">Sales Trend</h2>
          <Line data={salesChart} />
        </div>
        <div className="bg-white p-4 rounded shadow">
          <h2 className="text-lg font-semibold mb-2">Purchase Trend</h2>
          <Line data={purchaseChart} />
        </div>
      </div>
    </div>
  );
}

function StatCard({
  title,
  value,
  color,
  masked,

}: {
  title: string;
  value: string | number;
  color: string;
  masked?: boolean;
}) {
  return (
    <div className={`p-4 rounded shadow ${color}`}>
      <h3 className="text-sm">{title}</h3>
      <p className="text-2xl font-bold">
        {masked ? "••••" : value}
      </p>
    </div>
  );
}
