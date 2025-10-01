import { AlertTriangle } from 'lucide-react';

interface LowStockItem {
  sku: string;
  name: string;
  minOrder: number;
  currentQty: number;
  alert: boolean;
}

interface LowStockAlertsProps {
  data: LowStockItem[];
}

export default function LowStockAlerts({ data }: LowStockAlertsProps) {
  return (
    <div className="bg-gray-800 text-white rounded-xl p-6 shadow-lg">
      <h3 className="text-lg font-semibold mb-4">Low Stock Alerts</h3>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="text-left text-sm text-gray-400 border-b border-gray-700">
              <th className="pb-3">SKU</th>
              <th className="pb-3">Product Name</th>
              <th className="pb-3">Low Stock</th>
              <th className="pb-3">Current Qty</th>
            </tr>
          </thead>
          <tbody>
            {data.map((item, idx) => (
              <tr key={idx} className="border-b border-gray-700 text-sm">
                <td className="py-3">{item.sku}</td>
                <td className="py-3">{item.name}</td>
                <td className="py-3">
                  {item.alert ? (
                    <span className="bg-red-500 text-white px-2 py-1 rounded text-xs font-semibold">
                      {item.minOrder}
                    </span>
                  ) : (
                    item.minOrder
                  )}
                </td>
                <td className="py-3">{item.currentQty}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}