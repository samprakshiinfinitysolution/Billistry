'use client';

import { useState } from "react";

export default function SettingsPage() {
  const [companyName, setCompanyName] = useState("Billistry Company");
  const [email, setEmail] = useState("admin@billistry.com");
  const [phone, setPhone] = useState("1234567890");
  const [currency, setCurrency] = useState("INR");
  const [timezone, setTimezone] = useState("Asia/Kolkata");

  const handleSave = () => {
    // TODO: Connect to API to save settings
    alert("Settings saved successfully!");
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <h1 className="text-3xl font-bold mb-6 text-gray-800">Settings</h1>

      <div className="bg-white p-6 rounded-lg shadow space-y-6 max-w-2xl">
        {/* Company Info */}
        <div>
          <h2 className="text-xl font-semibold mb-4">Company Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Company Name</label>
              <input
                type="text"
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Phone</label>
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Currency</label>
              <input
                type="text"
                value={currency}
                onChange={(e) => setCurrency(e.target.value)}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Timezone</label>
              <input
                type="text"
                value={timezone}
                onChange={(e) => setTimezone(e.target.value)}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
              />
            </div>
          </div>
        </div>

        {/* System Preferences */}
        <div>
          <h2 className="text-xl font-semibold mb-4">System Preferences</h2>
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <input type="checkbox" className="h-4 w-4" />
              <label className="text-gray-700">Enable notifications</label>
            </div>
            <div className="flex items-center gap-2">
              <input type="checkbox" className="h-4 w-4" />
              <label className="text-gray-700">Enable auto-updates</label>
            </div>
            <div className="flex items-center gap-2">
              <input type="checkbox" className="h-4 w-4" />
              <label className="text-gray-700">Show system alerts</label>
            </div>
          </div>
        </div>

        {/* Save Button */}
        <div className="flex justify-end">
          <button
            onClick={handleSave}
            className="bg-blue-600 text-white px-6 py-2 rounded shadow hover:bg-blue-700 transition"
          >
            Save Settings
          </button>
        </div>
      </div>
    </div>
  );
}
