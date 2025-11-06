interface RecentActivityProps {
  data: string[];
  range?: string;
  startDate?: string | null;
  endDate?: string | null;
}

export default function RecentActivity({ data, range, startDate, endDate }: RecentActivityProps) {
  return (
    <div className="bg-gray-800 text-white rounded-xl p-6 shadow-lg">
      <div className="flex items-start justify-between">
        <h3 className="text-lg font-semibold mb-4">Recent Activity</h3>
        {range && (
          <p className="text-sm text-gray-400 mt-1">
            {range === 'custom' && startDate && endDate ? (
              <>{new Date(startDate).toLocaleDateString()} — {new Date(endDate).toLocaleDateString()}</>
            ) : (
              <>Range: {range}</>
            )}
          </p>
        )}
      </div>
      <ul className="space-y-3">
        {data.map((activity, idx) => (
          <li key={idx} className="text-sm text-gray-300 flex items-start">
            <span className="w-2 h-2 bg-blue-500 rounded-full mt-1.5 mr-3 flex-shrink-0"></span>
            {activity}
          </li>
        ))}
      </ul>
    </div>
  );
}