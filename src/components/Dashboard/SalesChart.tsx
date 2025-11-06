import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface SalesData {
  month: string;
  sales: number;
  purchases: number;
}

interface SalesChartProps {
  data: SalesData[];
  subtitle?: string;
}

export default function SalesChart({ data, subtitle }: SalesChartProps) {
  return (
    <div className="bg-gray-800 text-white rounded-xl p-6 shadow-lg">
      <div className="mb-4">
        <h3 className="text-lg font-semibold">Sales & Purchase Trends</h3>
        <p className="text-sm text-gray-400">{subtitle ?? '(Last 6 Months)'}</p>
      </div>
      <ResponsiveContainer width="100%" height={250}>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
          <XAxis dataKey="month" stroke="#9ca3af" />
          <YAxis stroke="#9ca3af" />
          <Tooltip 
            contentStyle={{ backgroundColor: '#1f2937', border: 'none', borderRadius: '8px' }}
            labelStyle={{ color: '#fff' }}
          />
          <Line type="monotone" dataKey="sales" stroke="#3b82f6" strokeWidth={2} dot={{ r: 4 }} />
          <Line type="monotone" dataKey="purchases" stroke="#f59e0b" strokeWidth={2} dot={{ r: 4 }} />
        </LineChart>
      </ResponsiveContainer>
      <div className="text-right mt-2">
        <button className="text-sm text-gray-400 hover:text-white">Zoom</button>
      </div>
    </div>
  );
}