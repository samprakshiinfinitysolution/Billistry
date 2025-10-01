import { TrendingUp, AlertTriangle } from 'lucide-react';

export default function StatsCards() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      <div className="bg-gray-800 text-white rounded-xl p-6 shadow-lg">
        <h3 className="text-sm text-gray-400 mb-2">Total Sales (MTD)</h3>
        <div className="flex items-end justify-between">
          <div>
            <p className="text-3xl font-bold text-green-400">$1.8M</p>
            <p className="text-xs text-green-400 mt-1 flex items-center">
              +12% this month
              <TrendingUp className="w-3 h-3 ml-1" />
            </p>
          </div>
        </div>
      </div>

      <div className="bg-gray-800 text-white rounded-xl p-6 shadow-lg">
        <h3 className="text-sm text-gray-400 mb-2">Total Purchases (MTD)</h3>
        <div className="flex items-end justify-between">
          <div>
            <p className="text-3xl font-bold text-orange-400">$850K</p>
            <p className="text-xs text-orange-400 mt-1 flex items-center">
              +8% this month
              <TrendingUp className="w-3 h-3 ml-1" />
            </p>
          </div>
        </div>
      </div>

      <div className="bg-gray-800 text-white rounded-xl p-6 shadow-lg">
        <h3 className="text-sm text-gray-400 mb-2">Current Stock Value</h3>
        <div className="flex items-end justify-between">
          <div>
            <p className="text-3xl font-bold text-blue-400">$3.5M</p>
            <p className="text-xs text-blue-400 mt-1 flex items-center">
              +5% this month
              <TrendingUp className="w-3 h-3 ml-1" />
            </p>
          </div>
        </div>
      </div>

      <div className="bg-gray-800 text-white rounded-xl p-6 shadow-lg">
        <h3 className="text-sm text-gray-400 mb-2">Low Stock Items</h3>
        <div className="flex items-end justify-between">
          <div>
            <p className="text-3xl font-bold text-red-400">24 Alerts</p>
            <AlertTriangle className="w-5 h-5 text-red-400 mt-2" />
          </div>
        </div>
      </div>
    </div>
  );
}