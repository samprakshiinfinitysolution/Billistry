import { useMemo } from 'react';
import { TrendingUp, TrendingDown, AlertTriangle } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import CardSkeleton from '@/components/ui/CardSkeleton';

// Indian currency formatting helper
const currencyFmt = new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 });
const fmt = (v: number) => currencyFmt.format(v);

interface StatsData {
  salesMTD: number | null;
  purchasesMTD: number | null;
  stockValue: number | null;
  lowStockCount: number | null;
  salesMomChange: number | null;
  purchasesMomChange: number | null;
}

interface StatsCardsProps {
  data: StatsData | null;
  loading: boolean;
}

export default function StatsCards({ data, loading }: StatsCardsProps) {
  const salesMTD = data?.salesMTD;
  const purchasesMTD = data?.purchasesMTD;
  const stockValue = data?.stockValue;
  const lowStockCount = data?.lowStockCount;
  const salesMomChange = data?.salesMomChange;
  const purchasesMomChange = data?.purchasesMomChange;

  const salesDisplay = useMemo(() => fmt(salesMTD ?? 0), [salesMTD]);
  const purchasesDisplay = useMemo(() => fmt(purchasesMTD ?? 0), [purchasesMTD]);
  const stockValueDisplay = useMemo(() => fmt(stockValue ?? 0), [stockValue]);
  const lowStockDisplay = useMemo(() => `${lowStockCount ?? 0} Items`, [lowStockCount]);

  const formatChange = (change: number | null | undefined) => {
    if (change === null || change === undefined || isNaN(change)) {
      return null;
    }
    const isPositive = change >= 0;
    const symbol = isPositive ? '+' : '';
    const color = isPositive ? 'text-green-400' : 'text-red-400';
    const Icon = isPositive ? TrendingUp : TrendingDown;

    return (
      <p className={`text-xs ${color} mt-1 flex items-center`}>
        {symbol}{change.toFixed(1)}% this month
        <Icon className="w-3 h-3 ml-1" />
      </p>
    );
  };

  const salesChangeDisplay = useMemo(() => formatChange(salesMomChange), [salesMomChange]);
  const purchasesChangeDisplay = useMemo(() => formatChange(purchasesMomChange), [purchasesMomChange]);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      {loading ? (
        <CardSkeleton title subtitle />
      ) : (
        <div className="bg-gray-800 text-white rounded-xl p-6 shadow-lg">
          <h3 className="text-sm text-gray-400 mb-2">Total Sales (MTD)</h3>
          <div className="flex items-end justify-between">
            <div>
              <p className="text-3xl font-bold text-green-400">{salesDisplay}</p>
              {salesChangeDisplay}
            </div>
          </div>
        </div>
      )}

      {loading ? (
        <CardSkeleton title subtitle />
      ) : (
        <div className="bg-gray-800 text-white rounded-xl p-6 shadow-lg">
          <h3 className="text-sm text-gray-400 mb-2">Total Purchases (MTD)</h3>
          <div className="flex items-end justify-between">
            <div>
              <p className="text-3xl font-bold text-orange-400">{purchasesDisplay}</p>
              {purchasesChangeDisplay}
            </div>
          </div>
        </div>
      )}

      {loading ? (
        <CardSkeleton title subtitle />
      ) : (
        <div className="bg-gray-800 text-white rounded-xl p-6 shadow-lg">
          <h3 className="text-sm text-gray-400 mb-2">Current Stock Value</h3>
          <div className="flex items-end justify-between">
            <div>
              <p className="text-3xl font-bold text-blue-400">{stockValueDisplay}</p>
              <p className="text-xs text-blue-400 mt-1 flex items-center">
                Live Value
              </p>
            </div>
          </div>
        </div>
      )}

      {loading ? (
        <CardSkeleton title subtitle />
      ) : (
        <div className="bg-gray-800 text-white rounded-xl p-6 shadow-lg">
          <h3 className="text-sm text-gray-400 mb-2">Low Stock Items</h3>
          <div className="flex items-end justify-between">
            <div>
              <p className={`text-3xl font-bold ${lowStockCount && lowStockCount > 0 ? 'text-red-400' : 'text-green-400'}`}>{lowStockDisplay}</p>
            </div>
            <AlertTriangle className="w-5 h-5 text-red-400 mt-2" />
          </div>
        </div>
      )}
    </div>
  );
}