'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function Dashboard() {
  const router = useRouter();

  useEffect(() => {
    const checkAuth = async () => {
      const res = await fetch('/api/verify-token');
      if (!res.ok) {
        router.replace('/wp-admin');
      }
    };
    checkAuth();
  }, []);

  const logout = async () => {
    await fetch('/api/logout', { method: 'POST' });
    router.push('/wp-admin');
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Welcome to Dashboard</h1>
      <button
        onClick={logout}
        className="bg-red-600 text-white px-4 py-2"
      >
        Logout
      </button>
    </div>
  );
}
