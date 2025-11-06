interface LowStockItem {
  sku: string;
  name: string;
  lowStockAlert: number;
  currentStock: number;
  alert: boolean;
}

interface LowStockAlertsProps {
  data: LowStockItem[];
  range?: string;
  startDate?: string | null;
  endDate?: string | null;
}

export default function LowStockAlerts({ data, range, startDate, endDate }: LowStockAlertsProps) {
  return (
    <div className="bg-gray-800 text-white rounded-xl p-6 shadow-lg">
      <h3 className="text-lg font-semibold mb-4">Low Stock Alerts</h3>
      {range && (
        <p className="text-sm text-gray-400 mb-2">
          {range === 'custom' && startDate && endDate ? (
            <>{new Date(startDate).toLocaleDateString()} — {new Date(endDate).toLocaleDateString()}</>
          ) : (
            <>Range: {range}</>
          )}
        </p>
      )}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="text-left text-sm text-gray-400 border-b border-gray-700">
              <th className="pb-3">SKU</th>
              <th className="pb-3">Product Name</th>
              <th className="pb-3">Low Stock Alert</th>
              <th className="pb-3">Current Stock</th>
            </tr>
          </thead>
          <tbody>
            {data.length === 0 ? (
              <tr>
                <td colSpan={4} className="py-6 text-center text-sm text-gray-400">
                  No low stock alerts
                </td>
              </tr>
            ) : data.map((item, idx) => (
              <tr key={idx} className="border-b border-gray-700 text-sm">
                <td className="py-3">{item.sku}</td>
                <td className="py-3">{item.name}</td>
                <td className="py-3">
                  <span className="bg-red-500 text-white px-2 py-1 rounded text-xs font-semibold">
                    {item.lowStockAlert}
                  </span>
                </td>
                <td className="py-3">{item.currentStock}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
