






'use client';

import { useEffect, useState } from 'react';
import StatsCards from '@/components/Dashboard/StatsCards';
import SalesChart from '@/components/Dashboard/SalesChart';
import StockOverview from '@/components/Dashboard//StockOverview';
import LowStockAlerts from '@/components/Dashboard//LowStockAlerts';
import UpgradeBanner from '@/components/Dashboard/UpgradeBanner';
import RecentActivity from '@/components/Dashboard/RecentActivity';

// Type Definitions
interface SalesData {
  month: string;
  sales: number;
  purchases: number;
}

interface Product {
  _id: string;
  name: string;
  sku: string;
  category: string;
  currentStock: number;
  lowStockAlert: number;
}

interface CategoryData {
  name: string;
  value: number;
  color: string;
}

interface LowStockItem {
  sku: string;
  name: string;
  minOrder: number;
  currentQty: number;
  alert: boolean;
}


interface ApiInvoice {
  invoiceDate: string;
  totalAmount: number;
}

interface SalesData {
  month: string;
  sales: number;
  purchases: number;
}

function groupByMonth(sales: ApiInvoice[], purchases: ApiInvoice[]): SalesData[] {
  const monthMap: Record<string, { sales: number; purchases: number }> = {};

  sales.forEach(inv => {
    const month = new Date(inv.invoiceDate).toLocaleString("default", { month: "short" });
    if (!monthMap[month]) monthMap[month] = { sales: 0, purchases: 0 };
    monthMap[month].sales += inv.totalAmount;
  });

  purchases.forEach(inv => {
    const month = new Date(inv.invoiceDate).toLocaleString("default", { month: "short" });
    if (!monthMap[month]) monthMap[month] = { sales: 0, purchases: 0 };
    monthMap[month].purchases += inv.totalAmount;
  });

  const monthOrder = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
  return monthOrder
    .filter(m => monthMap[m]) // only keep months with data
    .map(m => ({
      month: m,
      sales: monthMap[m].sales,
      purchases: monthMap[m].purchases
    }));
}



export default function Dashboard() {
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [lowStockItems, setLowStockItems] = useState<any[]>([]);
   const [categoryData, setCategoryData] = useState<CategoryData[]>([]);
    const [chartData, setChartData] = useState<SalesData[]>([]);


  useEffect(() => {
    async function fetchData() {
      try {
        const res = await fetch("/api/product"); // replace with your endpoint
        const data = await res.json();

        if (data.success) {
          const mapped = data.products.map((p: Product) => ({
            sku: p.sku,
            name: p.name,
            minOrder: p.lowStockAlert,
            currentQty: p.currentStock,
            alert: p.lowStockAlert > 0 && p.currentStock <= p.lowStockAlert,
          }));

          // filter only alerts
          setLowStockItems(mapped.filter((i: any) => i.alert));
        }
      } catch (err) {
        console.error("Failed to load products", err);
      }
    }

    fetchData();
  }, []);




    useEffect(() => {
    async function fetchData() {
      const [salesRes, purchasesRes] = await Promise.all([
        fetch("/api/new_sale"),
        fetch("/api/new_purchase")
      ]);

      const salesJson = await salesRes.json();
      const purchasesJson = await purchasesRes.json();

      const merged = groupByMonth(salesJson.data, purchasesJson.data);
      setChartData(merged);
    }

    fetchData();
  }, []);

  

  // const salesTrendData: SalesData[] = [
  //   { month: 'Jan', sales: 1700, purchases: 1800 },
  //   { month: 'Feb', sales: 1500, purchases: 1300 },
  //   { month: 'Mar', sales: 1900, purchases: 1000 },
  //   { month: 'Apr', sales: 1900, purchases: 1800 },
  //   { month: 'May', sales: 1400, purchases: 1900 },
  //   { month: 'Jun', sales: 1600, purchases: 1400 },
  //   { month: 'Jul', sales: 1900, purchases: 1600 },
  //   { month: 'Aug', sales: 2100, purchases: 2000 },
  //   { month: 'Sep', sales: 2200, purchases: 2100 }
  // ];





//   const categoryData: CategoryData[] = [
//     { name: 'Electronics', value: 45, color: '#3b82f6' },
//     { name: 'Home Goods', value: 40, color: '#f59e0b' },
//     { name: 'Available', value: 15, color: '#10b981' }
//   ];

useEffect(() => {
    async function fetchData() {
      try {
        const res = await fetch("/api/product"); // replace with your real endpoint
        const data = await res.json();

        if (data.success) {
          const products: Product[] = data.products;

          // Group by category
          const categoryMap: Record<string, number> = {};
          products.forEach((p) => {
            const cat = p.category && p.category.trim() !== "" ? p.category : "Uncategorized";
            categoryMap[cat] = (categoryMap[cat] || 0) + p.currentStock;
          });

          // Assign colors dynamically (fallback if more categories than colors)
         const colors = [
  "#3b82f6","#f59e0b","#10b981","#ef4444","#8b5cf6",
  "#14b8a6","#eab308","#6366f1","#84cc16","#f97316",
  "#06b6d4","#db2777","#0ea5e9","#a855f7","#22c55e",
  "#d946ef","#16a34a","#f43f5e","#0d9488","#ca8a04",
  "#0284c7","#facc15","#9333ea","#f87171","#059669",
  "#7c3aed","#65a30d","#ea580c","#0891b2","#be123c",
  "#2563eb","#fbbf24","#34d399","#f472b6","#4f46e5",
  "#ec4899","#22d3ee","#84cc16","#f87171","#a16207",
  "#38bdf8","#c084fc","#e879f9","#fb923c","#0ea5e9",
  "#2dd4bf","#fde047","#16a34a","#f43f5e","#6d28d9",
  "#f59e0b","#14b8a6","#e11d48","#22c55e","#a21caf",
  "#dc2626","#059669","#0284c7","#eab308","#2563eb",
  "#9333ea","#0891b2","#d97706","#0f766e","#65a30d",
  "#7c3aed","#ea580c","#fcd34d","#22d3ee","#b91c1c",
  "#581c87","#15803d","#facc15","#1d4ed8","#db2777",
  "#16a34a","#fbbf24","#4ade80","#fb7185","#312e81",
  "#6366f1","#a3e635","#f97316","#0369a1","#c026d3",
  "#facc15","#9d174d","#0d9488","#713f12","#f43f5e",
  "#4338ca","#fef08a","#f472b6","#0ea5e9","#854d0e",
  "#ef4444","#22d3ee","#65a30d","#e879f9","#15803d"
];
          const mapped: CategoryData[] = Object.entries(categoryMap).map(
            ([name, value], idx) => ({
              name,
              value,
              color: colors[idx % colors.length],
            })
          );

          setCategoryData(mapped);
        }
      } catch (err) {
        console.error("Failed to load category data", err);
      }
    }

    fetchData();
  }, []);





//   const lowStockItems: LowStockItem[] = [
//     { sku: 'ITEM005', name: 'Smartwatch Pro', minOrder: 50, currentQty: 15, alert: true },
//     { sku: 'ITEM012', name: 'Premium Hoodie', minOrder: 30, currentQty: 10, alert: true },
//     { sku: 'ITEM012', name: 'Premium Hoodie', minOrder: 20, currentQty: 45, alert: false },
//     { sku: 'ITEM009', name: 'USB-C Hub', minOrder: 25, currentQty: 50, alert: false },
//     { sku: 'ITEM005', name: 'Wireless Mouse', minOrder: 40, currentQty: 35, alert: false }
//   ];

  const recentActivities: string[] = [
    'Sales Order #3987 processed',
    'New shipment received - WH-A',
    'User "Alex" updated product data',
    'Low stock alert: Smartwatch Pro'
  ];

  return (
    <div className="min-h-screen bg-gray-100">
      <main className="p-6 max-w-7xl mx-auto">
        <StatsCards />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <SalesChart data={chartData} />
          <StockOverview data={categoryData} />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <LowStockAlerts data={lowStockItems} />
          <div className="space-y-6">
            <UpgradeBanner />
            <RecentActivity data={recentActivities} />
          </div>
        </div>
      </main>
    </div>
  );
}