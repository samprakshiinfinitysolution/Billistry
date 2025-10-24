export default function UpgradeBanner() {
  return (
    <div className="bg-gradient-to-r from-orange-400 to-red-400 rounded-xl p-6 shadow-lg">
      <h3 className="text-xl font-bold text-white mb-3">Upgrade to Premium</h3>
      <ul className="space-y-2 mb-4">
        <li className="text-white text-sm">• Advanced Analytics</li>
        <li className="text-white text-sm">• Priority Support</li>
      </ul>
      <button className="bg-gray-900 text-white px-6 py-2 rounded-lg font-semibold hover:bg-gray-800 transition">
        Unlock Premium Now
      </button>
    </div>
  );
}

