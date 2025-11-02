'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import type { UserInfo } from '@/types/user';
import axios from 'axios';

export default function VerifyPage() {
  const [otp, setOtp] = useState('');
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null);
  const router = useRouter();

  useEffect(() => {
    const stored = localStorage.getItem('userInfo');
    if (!stored) {
      router.push('/login');
    } else {
      setUserInfo(JSON.parse(stored));
    }
  }, [router]);

  const handleVerify = async () => {
    if (!userInfo) return;

    try {
      const res = await axios.post('http://localhost:4000/api/verify-otp', {
        phone: userInfo.phone,
        otp,
      });
      localStorage.setItem('token', res.data.token);
      router.push('/dashboard');
    } catch (err: any) {
      alert(err?.response?.data?.message || 'Invalid OTP');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="p-6 bg-white shadow rounded w-80">
        <h1 className="text-lg font-bold mb-4 text-center">Enter OTP</h1>
        <input
          type="text"
          placeholder="Enter OTP"
          className="border w-full p-2 mb-4"
          value={otp}
          onChange={(e) => setOtp(e.target.value)}
        />
        <button
          onClick={handleVerify}
          className="bg-green-600 text-white w-full p-2 rounded"
        >
          Verify
        </button>
      </div>
    </div>
  );
}
