



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
  currentStock?: number; // Add currentStock back as an optional property
  openingStock: number;
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
  lowStockAlert: number;
  currentStock: number;
  alert: boolean;
}

interface StatsData {
  salesMTD: number | null;
  purchasesMTD: number | null;
  stockValue: number | null;
  lowStockCount: number | null;
  salesMomChange: number | null;
  purchasesMomChange: number | null;
}


interface ApiInvoice {
  invoiceDate: string;
  totalAmount: number;
}

// Helper to calculate stock value for a single product
const getStockValue = (p: any): number => {
  const purchasePrice = Number(p.purchasePrice ?? p.purchasePriceWithTax ?? 0) || 0;
  const qty = Number(p.currentStock  ?? 0) || 0;
  if (p.purchasePriceWithTax && typeof p.taxPercent !== 'undefined') {
    const gst = Number(p.taxPercent) || 0;
    return (purchasePrice - (purchasePrice * gst / 100)) * qty;
  }
  return purchasePrice * qty;
};

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
  const [statsData, setStatsData] = useState<StatsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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

      // Month-to-date calculation for StatsCards
      const now = new Date();
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      const startOfPrevMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      const endOfPrevMonth = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59, 999);

      const sumAmountBetween = (arr: any[] | undefined, start: Date, end: Date, dateKey = 'invoiceDate') => {
        if (!Array.isArray(arr)) return 0;
        return arr.reduce((acc: number, it: any) => {
          const t = new Date(it[dateKey]);
          if (isNaN(t.getTime())) return acc;
          if (t >= start && t <= end) return acc + (Number(it.totalAmount ?? it.invoiceAmount ?? 0) || 0);
          return acc;
        }, 0);
      };

      const salesData = salesJson?.data || salesJson?.sales;
      const purchasesData = purchasesJson?.data || purchasesJson?.purchases;

      const salesTotal = sumAmountBetween(salesData, startOfMonth, now);
      const purchasesTotal = sumAmountBetween(purchasesData, startOfMonth, now);

      const prevMonthSales = sumAmountBetween(salesData, startOfPrevMonth, endOfPrevMonth);
      const prevMonthPurchases = sumAmountBetween(purchasesData, startOfPrevMonth, endOfPrevMonth);

      const calculateChange = (current: number, previous: number): number | null => {
        if (previous === 0) {
          return current > 0 ? 100 : 0; // Or null if you prefer not to show 100% for new activity
        }
        return ((current - previous) / previous) * 100;
      };

      const salesMomChange = calculateChange(salesTotal, prevMonthSales);
      const purchasesMomChange = calculateChange(purchasesTotal, prevMonthPurchases);

      setStatsData(prev => ({ 
        ...prev, 
        salesMTD: salesTotal, purchasesMTD: purchasesTotal,
        salesMomChange: salesMomChange ?? null, purchasesMomChange: purchasesMomChange ?? null
      } as StatsData));
    }

    fetchData().catch(err => {
      console.error("Failed to load sales/purchase data", err);
      setError("Could not load chart data.");
    });
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
      setLoading(true);
      setError(null);
      try {
        const res = await fetch("/api/product"); // replace with your real endpoint
        if (!res.ok) {
          throw new Error(`Failed to fetch products: ${res.statusText}`);
        }
        const data = await res.json();

        if (data.success) {
          const products: Product[] = data.products;

          // --- Logic for LowStockAlerts ---
          const mappedLowStock = products.map((p: Product) => ({
            sku: p.sku,
            name: p.name,
            lowStockAlert: p.lowStockAlert,
            currentStock: p.currentStock,
            alert: p.lowStockAlert > 0 && (p.currentStock ?? 0) <= p.lowStockAlert,
          }));
          setLowStockItems(mappedLowStock.filter((i: any) => i.alert));

          // --- Logic for StatsCards ---
          let computedStockValue = 0;
          let computedLowStock = 0;

          products.forEach((p: any) => {
            computedStockValue += getStockValue(p);
            const qty = Number(p.currentStock ?? 0) || 0;
            const alertThreshold = Number(p.lowStockAlert) || 0;
            if (alertThreshold > 0 && qty <= alertThreshold) {
              computedLowStock++;
            }
          });
          setStatsData(prev => ({
            salesMTD: prev?.salesMTD ?? null,
            purchasesMTD: prev?.purchasesMTD ?? null,
            salesMomChange: prev?.salesMomChange ?? null,
            purchasesMomChange: prev?.purchasesMomChange ?? null,
            stockValue: computedStockValue, lowStockCount: computedLowStock 
          }));

          // Group by category
          const categoryMap: Record<string, number> = {};
          products.forEach((p) => {
            const cat = p.category && p.category.trim() !== "" ? p.category : "Uncategorized";
            // Prioritize currentStock if available, otherwise fallback to openingStock
            categoryMap[cat] = (categoryMap[cat] || 0) + (p.currentStock ?? 0);
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
        console.error("Failed to load product data", err);
        setError("Could not load product data.");
      } finally {
        setLoading(false);
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

  const [recentActivitiesState, setRecentActivitiesState] = useState<string[] | null>(null);

  useEffect(() => {
    let mounted = true;
    async function fetchRecent() {
      try {
        const res = await fetch('/api/audit?limit=5');
        if (!res.ok) throw new Error('Audit API error');
        const json = await res.json();

        // json.logs expected from /api/audit
        if (Array.isArray(json.logs)) {
          const mapped = json.logs.map((l: any) => {
            const when = new Date(l.createdAt).toLocaleString();
            const user = l.user?.name || (l.user?.email ?? 'Unknown');
            // prefer action + resourceType/resourceId
            if (l.action) return `${when} — ${user}: ${l.action}`;
            return `${when} — ${user}: ${l.resourceType || 'Activity'}`;
          });

          if (mounted) setRecentActivitiesState(mapped);
        }
      } catch (err) {
        // If audit returns 403 or otherwise not allowed, fallback to recent sales/purchases/products
        console.error('Failed to load recent activities via /api/audit, attempting fallback:', err);
        try {
          // attempt fallback: fetch recent sales and purchases and product low-stock
          const [salesRes, purchasesRes, productsRes] = await Promise.allSettled([
            fetch('/api/new_sale?limit=5'),
            fetch('/api/new_purchase?limit=5'),
            fetch('/api/product?limit=5')
          ]);

          const activities: string[] = [];

          if (salesRes.status === 'fulfilled' && (salesRes.value.ok)) {
            const j = await salesRes.value.json();
            const sales = j.data || j.sales || j;
            if (Array.isArray(sales)) {
              sales.slice(0,5).forEach((s: any) => {
                const when = s.invoiceDate ? new Date(s.invoiceDate).toLocaleString() : 'Recently';
                activities.push(`${when} — Sale: Invoice ${s.invoiceNo ?? s._id ?? ''} — ₹${s.totalAmount ?? s.invoiceAmount ?? s.total ?? ''}`);
              });
            }
          }

          if (purchasesRes.status === 'fulfilled' && (purchasesRes.value.ok)) {
            const j = await purchasesRes.value.json();
            const purchases = j.data || j.purchases || j;
            if (Array.isArray(purchases)) {
              purchases.slice(0,5).forEach((p: any) => {
                const when = p.invoiceDate ? new Date(p.invoiceDate).toLocaleString() : 'Recently';
                activities.push(`${when} — Purchase: Invoice ${p.invoiceNo ?? p._id ?? ''} — ₹${p.totalAmount ?? p.invoiceAmount ?? p.total ?? ''}`);
              });
            }
          }

          if (productsRes.status === 'fulfilled' && (productsRes.value.ok)) {
            const j = await productsRes.value.json();
            const products = j.products || j.data || j;
            if (Array.isArray(products)) {
              // add low stock alerts
              products.slice(0,5).forEach((pr: any) => {
                const qty = pr.currentStock ?? 0;
                const threshold = pr.lowStockAlert ?? 0;
                if (threshold > 0 && qty <= threshold) {
                  activities.push(`Low stock: ${pr.name ?? pr.sku ?? 'Item'} — ${qty} left`);
                }
              });
            }
          }

          if (activities.length && mounted) setRecentActivitiesState(activities.slice(0,10));
        } catch (fallbackErr) {
          console.error('Fallback generation of recent activities failed:', fallbackErr);
        }
      }
    }

    fetchRecent();
    return () => { mounted = false; };
  }, []);

  return (
    <div className="min-h-screen bg-gray-100">
      <main className="p-6 max-w-7xl mx-auto">
        <StatsCards data={statsData} loading={loading} />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <SalesChart data={chartData} />
          <StockOverview data={categoryData} />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {loading ? (
            <div className="bg-gray-800 text-white rounded-xl p-6 shadow-lg">Loading...</div>
          ) : error ? (
            <div className="bg-red-200 text-red-800 rounded-xl p-6 shadow-lg">{error}</div>
          ) : (
            <LowStockAlerts data={lowStockItems} />
          )}
          <div className="space-y-6">
            <UpgradeBanner />
            <RecentActivity data={recentActivitiesState ?? recentActivities} />
          </div>
        </div>
      </main>
    </div>
  );
}