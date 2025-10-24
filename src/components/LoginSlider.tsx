



'use client';

import toast from 'react-hot-toast';
import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import useGuestGuard from '@/hooks/useGuestGuard';

interface LoginSliderProps {
  onClose: () => void;
}

export default function LoginSlider({ onClose }: LoginSliderProps) {
  const loadingGuard = useGuestGuard();
  const router = useRouter();
  const otpInputRef = useRef<HTMLInputElement>(null);

  const [identifier, setIdentifier] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState('');
  const [resendTimer, setResendTimer] = useState(0);
  const [loading, setLoading] = useState(false);

  // countdown for resend
  useEffect(() => {
    if (resendTimer <= 0) return;
    const interval = setInterval(
      () => setResendTimer(prev => Math.max(prev - 1, 0)),
      1000
    );
    return () => clearInterval(interval);
  }, [resendTimer]);

  // auto focus OTP field
  useEffect(() => {
    if (otpSent && otpInputRef.current) otpInputRef.current.focus();
  }, [otpSent]);

  // detect email vs phone
  const parseIdentifier = () => {
    const trimmed = identifier.trim();
    if (!trimmed) return {};
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const phoneRegex = /^[0-9]{8,15}$/;
    if (emailRegex.test(trimmed)) return { email: trimmed.toLowerCase() };
    if (phoneRegex.test(trimmed)) return { phone: trimmed };
    return {};
  };

  const sendOTP = async () => {
    if (loading || resendTimer > 0) return;

    const payload = parseIdentifier();
    if (!payload.email && !payload.phone) {
      toast.error('Enter a valid phone number or email');
      return;
    }

    try {
      setLoading(true);
      const res = await fetch('/api/auth/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...payload, name: identifier }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || 'Failed to send OTP');

      setOtpSent(true);
      setOtp('');
      setResendTimer(30);
    } catch (err: any) {
      toast.error(err.message || 'Error sending OTP');
    } finally {
      setLoading(false);
    }
  };

  const verifyOTP = async () => {
    if (loading) return;

    if (!otp.trim() || otp.length !== 6) {
      toast.error('Enter a valid 6-digit OTP');
      return;
    }

    try {
      setLoading(true);
      const payload = { ...parseIdentifier(), otp };
      const res = await fetch('/api/auth/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || 'Failed to verify OTP');

      // ✅ Success → go to dashboard
      router.push('/dashboard');
      onClose();
    } catch (err: any) {
      toast.error(err.message || 'Error verifying OTP');
    } finally {
      setLoading(false);
    }
  };

  // auto-submit OTP when 6 digits entered
  useEffect(() => {
    if (otp.length === 6 && !loading) verifyOTP();
  
  }, [otp]);

  if (loadingGuard) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/40">
      <div className="w-80 h-full bg-white p-6 shadow-lg flex flex-col transition-all">
        {/* header */}
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold">Login</h2>
          <button
            onClick={onClose}
            className="text-red-500 font-bold text-xl"
          >
            &times;
          </button>
        </div>

        {!otpSent ? (
          <>
            <label className="block mb-2 text-sm font-medium text-gray-700">
              Phone or Email
            </label>
            <input
              type="text"
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
              placeholder="Enter phone or email"
              className="w-full px-4 py-2 border rounded-md mb-4 focus:ring-2 focus:ring-pink-400"
              disabled={loading}
            />
            <button
              onClick={sendOTP}
              disabled={loading || !identifier.trim()}
              className={`w-full ${
                loading
                  ? 'bg-pink-300 cursor-not-allowed'
                  : 'bg-pink-500 hover:bg-pink-600'
              } text-white py-2 rounded transition`}
            >
              {loading ? 'Sending...' : 'Send OTP'}
            </button>
          </>
        ) : (
          <>
            <label className="block mb-2 text-sm font-medium text-gray-700">
              Enter OTP
            </label>
            <input
              ref={otpInputRef}
              type="text"
              value={otp}
              onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
              placeholder="123456"
              className="w-full px-4 py-2 border rounded-md mb-4 tracking-widest text-center focus:ring-2 focus:ring-green-400"
              inputMode="numeric"
              maxLength={6}
              disabled={loading}
            />
            <button
              onClick={verifyOTP}
              disabled={loading || otp.length !== 6}
              className={`w-full mb-2 ${
                loading
                  ? 'bg-green-300 cursor-not-allowed'
                  : 'bg-green-500 hover:bg-green-600'
              } text-white py-2 rounded transition`}
            >
              {loading ? 'Verifying...' : 'Verify OTP'}
            </button>
            <button
              onClick={resendTimer > 0 ? undefined : sendOTP}
              disabled={resendTimer > 0 || loading}
              className={`w-full py-2 rounded transition ${
                resendTimer > 0
                  ? 'bg-gray-300 text-gray-600 cursor-not-allowed'
                  : 'bg-yellow-500 text-white hover:bg-yellow-600'
              }`}
            >
              {resendTimer > 0
                ? `Resend OTP in ${resendTimer}s`
                : 'Resend OTP'}
            </button>
          </>
        )}
      </div>
    </div>
  );
}
