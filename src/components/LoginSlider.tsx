



'use client';

import toast from 'react-hot-toast';
import { useState, useEffect, useRef } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import useGuestGuard from '@/hooks/useGuestGuard';

interface LoginSliderProps {
  onClose: () => void;
}

export default function LoginSlider({ onClose }: LoginSliderProps) {
  const loadingGuard = useGuestGuard();
  const router = useRouter();
  const pathname = usePathname();
  const otpInputRef = useRef<HTMLInputElement>(null);

  const [loginMethod, setLoginMethod] = useState<'phone' | 'email'>('phone');
  const [identifier, setIdentifier] = useState(''); // Will hold phone number or email
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
    if (loginMethod === 'email') {
      const trimmed = identifier.trim();
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (emailRegex.test(trimmed)) return { email: trimmed.toLowerCase() };
    }
    if (loginMethod === 'phone') {
      const trimmed = identifier.trim().replace(/\s/g, '');
      const phoneRegex = /^[6-9]\d{9}$/; // Indian mobile number regex (10 digits, starts with 6-9)
      if (phoneRegex.test(trimmed)) {
        return { phone: `+91${trimmed}` };
      }
    }
    return {};
  };

  const sendOTP = async () => {
    if (loading || resendTimer > 0) return;

    const payload = parseIdentifier();
    if (!payload.email && !payload.phone) {
      if (loginMethod === 'phone') {
        toast.error('Please enter a valid 10-digit mobile number.');
      } else {
        toast.error('Please enter a valid email address.');
      }
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

      // Role-based redirect
      let redirectPath = '/dashboard';
      if (data.role === 'superadmin' || data.role === 'admin') {
        redirectPath = '/wp-admin/dashboard';
      } else if (pathname.startsWith('/wp-admin')) {
        // If a non-admin tries to log in from an admin page, send them to the user dashboard.
        redirectPath = '/dashboard';
      }

      router.push(redirectPath);
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
      <div className="relative w-full max-w-sm bg-white p-8 rounded-2xl shadow-2xl flex flex-col">
        {/* header */}
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Welcome Back</h2>
          <p className="text-gray-500 mt-2 text-sm">Enter your details to access your account.</p>
          <button
            onClick={onClose}
            className="absolute top-3 right-3 p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-800 rounded-full transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>

        {/* Tabs for Phone/Email */}
        <div className="flex border-b mb-6">
          <button
            onClick={() => { setLoginMethod('phone'); setIdentifier(''); }}
            className={`flex-1 py-3 font-semibold text-center transition-colors ${
              loginMethod === 'phone'
                ? 'text-[#460F58] border-b-2 border-[#460F58]'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Phone
          </button>
          <button
            onClick={() => { setLoginMethod('email'); setIdentifier(''); }}
            className={`flex-1 py-3 font-semibold text-center transition-colors ${
              loginMethod === 'email'
                ? 'text-[#460F58] border-b-2 border-[#460F58]'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Email
          </button>
        </div>

        {!otpSent ? (
          <>
            {loginMethod === 'phone' ? (
              <div className="relative mb-4">
                <label className="block mb-2 text-sm font-medium text-gray-700">Phone Number</label>
                <div className="flex items-center border border-gray-300 rounded-lg focus-within:ring-2 focus-within:ring-[#460F58] focus-within:border-transparent">
                  <span className="px-3 text-gray-500 bg-gray-50 rounded-l-lg h-full flex items-center border-r">+91</span>
                  <input
                    type="tel"
                    value={identifier}
                    onChange={(e) => setIdentifier(e.target.value.replace(/\D/g, ''))}
                    placeholder="Enter 10-digit mobile number"
                    className="w-full px-4 py-3 border-none rounded-r-lg focus:outline-none focus:ring-0"
                    maxLength={10}
                    disabled={loading}
                  />
                </div>
              </div>
            ) : (
              <div className="relative mb-4">
                <label className="block mb-2 text-sm font-medium text-gray-700">Email Address</label>
                <input
                  type="email"
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  placeholder="Enter your email address"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#460F58] focus:border-transparent"
                  disabled={loading}
                />
              </div>
            )}
            <button
              onClick={sendOTP}
              disabled={loading || !identifier.trim()}
              className={`w-full font-semibold py-3 rounded-lg transition-all ${loading || !identifier.trim() ? 'bg-[#460F58]/50 cursor-not-allowed' : 'bg-[#460F58] hover:bg-[#370a46]'} text-white`}
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
              className={`w-full font-semibold mb-3 py-3 rounded-lg transition-all ${loading || otp.length !== 6 ? 'bg-[#460F58]/50 cursor-not-allowed' : 'bg-[#460F58] hover:bg-[#370a46]'} text-white`}
            >
              {loading ? 'Verifying...' : 'Verify OTP'}
            </button>
            <button
              onClick={resendTimer > 0 ? undefined : sendOTP}
              disabled={resendTimer > 0 || loading}
              className={`w-full py-2 rounded-lg transition-colors text-sm font-medium ${resendTimer > 0 || loading ? 'bg-gray-100 text-gray-500 cursor-not-allowed' : 'bg-yellow-500 text-white hover:bg-yellow-600'}`}
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
