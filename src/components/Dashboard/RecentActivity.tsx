interface RecentActivityProps {
  data: string[];
}

export default function RecentActivity({ data }: RecentActivityProps) {
  return (
    <div className="bg-gray-800 text-white rounded-xl p-6 shadow-lg">
      <h3 className="text-lg font-semibold mb-4">Recent Activity</h3>
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