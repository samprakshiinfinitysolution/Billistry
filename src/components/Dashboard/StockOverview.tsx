


import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";

interface CategoryData {
  name: string;
  value: number;
  color: string;
}

interface StockOverviewProps {
  data: CategoryData[];
  range?: string;
  startDate?: string | null;
  endDate?: string | null;
}

export default function StockOverview({ data, range, startDate, endDate }: StockOverviewProps) {
  // total stock to calculate percentages
  const total = data.reduce((sum, item) => sum + item.value, 0);

  return (
    <div className="bg-gray-800 text-white rounded-xl p-6 shadow-lg">
      <h3 className="text-lg font-semibold mb-4">Stock Overview by Category</h3>
      {range && (
        <p className="text-sm text-gray-400 mb-2">
          {range === 'custom' && startDate && endDate ? (
            <>{new Date(startDate).toLocaleDateString()} — {new Date(endDate).toLocaleDateString()}</>
          ) : (
            <>Range: {range}</>
          )}
        </p>
      )}
      <div className="flex items-center justify-between">
        {/* Pie Chart */}
        <div className="flex-1 relative">
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={90}
                paddingAngle={2}
                dataKey="value"
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>

          {/* Center text */}
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center">
            <p className="text-2xl font-bold">{total}</p>
            <p className="text-xs text-gray-400">Total Units</p>
          </div>
        </div>

        {/* Dynamic Legend */}
        <div className="space-y-3 ml-6">
          {data.map((cat, idx) => {
            const percent = total > 0 ? ((cat.value / total) * 100).toFixed(1) : 0;
            return (
              <div key={idx} className="flex items-center space-x-2">
                <div
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: cat.color }}
                ></div>
                <span className="text-sm">
                  {cat.name} ({percent}%)
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
