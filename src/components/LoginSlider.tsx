



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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
      <div className="relative w-full max-w-md bg-white p-8 rounded-2xl shadow-2xl flex flex-col">
        {/* header */}
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Welcome Back</h2>
          <p className="text-gray-500 mt-2 text-sm">Enter your details to access your account.</p>
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-gray-400 hover:text-gray-800 transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
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
              placeholder="Enter your phone or email"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg mb-4 focus:outline-none focus:ring-2 focus:ring-[#460F58] focus:border-transparent"
              disabled={loading}
            />
            <button
              onClick={sendOTP}
              disabled={loading || !identifier.trim()}
              className={`w-full font-semibold py-3 rounded-lg transition-all ${
                loading
                  ? 'bg-[#460F58]/50 cursor-not-allowed'
                  : 'bg-[#460F58] hover:bg-[#370a46]'
              } text-white`}
            >
              {loading ? 'Sending...' : 'Send OTP'}
            </button>
          </>
        ) : (
          <>
            <label className="block mb-2 text-sm font-medium text-gray-700">
              Enter 6-digit OTP
            </label>
            <input
              ref={otpInputRef}
              type="text"
              value={otp}
              onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
              placeholder="123456"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg mb-4 tracking-widest text-center focus:outline-none focus:ring-2 focus:ring-[#460F58] focus:border-transparent"
              inputMode="numeric"
              maxLength={6}
              disabled={loading}
            />
            <button
              onClick={verifyOTP}
              disabled={loading || otp.length !== 6}
              className={`w-full font-semibold mb-3 py-3 rounded-lg transition-all ${
                loading
                  ? 'bg-[#460F58]/50 cursor-not-allowed'
                  : 'bg-[#460F58] hover:bg-[#370a46]'
              } text-white`}
            >
              {loading ? 'Verifying...' : 'Verify OTP'}
            </button>
            <button
              onClick={resendTimer > 0 ? undefined : sendOTP}
              disabled={resendTimer > 0 || loading}
              className={`w-full py-2 rounded-lg transition-colors text-sm font-medium ${
                resendTimer > 0
                  ? 'bg-gray-100 text-gray-500 cursor-not-allowed'
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
