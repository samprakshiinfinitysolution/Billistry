// 'use client';
// import { useState } from 'react';

// export default function LoginSlider({ onClose }: { onClose: () => void }) {
//   const [phone, setPhone] = useState('');
//   const [otpSent, setOtpSent] = useState(false);
//   const [otp, setOtp] = useState('');

//   const handleSendOTP = () => {
//     // Simulate sending OTP
//     setOtpSent(true);
//   };

//   const handleVerifyOTP = () => {
//     // Simulate OTP verification
//     alert('Logged in successfully!');
//     onClose();
//   };

//   return (
//     <div className="fixed inset-0 z-50 flex justify-end bg-opacity-40">
//       <div className="w-80 h-full bg-white p-6 shadow-lg">
//         <div className="flex justify-between items-center mb-4">
//           <h2 className="text-lg font-semibold">Login</h2>
//           <button onClick={onClose} className="text-red-500 font-bold text-xl">&times;</button>
//         </div>

//         {!otpSent ? (
//           <>
//             <label className="block mb-2 text-sm font-medium text-gray-700">Phone Number</label>
//             <input
//               type="tel"
//               value={phone}
//               onChange={(e) => setPhone(e.target.value)}
//               placeholder="Enter your phone"
//               className="w-full px-4 py-2 border rounded-md mb-4"
//             />
//             <button
//               onClick={handleSendOTP}
//               className="w-full bg-pink-500 text-white py-2 rounded hover:bg-pink-600"
//             >
//               Send OTP
//             </button>
//           </>
//         ) : (
//           <>
//             <label className="block mb-2 text-sm font-medium text-gray-700">Enter OTP</label>
//             <input
//               type="text"
//               value={otp}
//               onChange={(e) => setOtp(e.target.value)}
//               placeholder="123456"
//               className="w-full px-4 py-2 border rounded-md mb-4"
//             />
//             <button
//               onClick={handleVerifyOTP}
//               className="w-full bg-green-500 text-white py-2 rounded hover:bg-green-600"
//             >
//               Verify OTP
//             </button>
//           </>
//         )}
//       </div>
//     </div>
//   );
// }



// 'use client';

// import { useState, useEffect } from 'react';
// import { useRouter } from 'next/navigation';
// import useGuestGuard from '@/hooks/useGuestGuard';


// export default function LoginSlider({ onClose }: { onClose: () => void }) {
//  useGuestGuard();
//   const [identifier, setIdentifier] = useState('');
//   const [otpSent, setOtpSent] = useState(false);
//   const [otp, setOtp] = useState('');
//   const [resendTimer, setResendTimer] = useState(0);
//   const [loading, setLoading] = useState(false);
//   const router = useRouter();

//   // Resend countdown
//   useEffect(() => {
//     if (!resendTimer) return;
//     const t = setInterval(() => setResendTimer((s) => (s > 0 ? s - 1 : 0)), 1000);
//     return () => clearInterval(t);
//   }, [resendTimer]);

//   // Detect email or phone
//   const parseIdentifier = () => {
//     if (!identifier) return {};
//     const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
//     if (emailRegex.test(identifier)) {
//       return { email: identifier };
//     }
//     return { phone: identifier }; // fallback to phone
//   };

//   const sendOTP = async () => {
//     if (!identifier) return alert('Enter phone or email');
//     try {
//       setLoading(true);
//       const payload = parseIdentifier();
//       const res = await fetch('/api/auth/send-otp', {
//         method: 'POST',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify(payload),
//       });
//       const data = await res.json();
//       if (!res.ok) throw new Error(data?.error || 'Failed to send OTP');
//       setOtpSent(true);
//       setResendTimer(30);
//       alert('OTP sent!');
//     } catch (e: any) {
//       alert(e.message || 'Error sending OTP');
//     } finally {
//       setLoading(false);
//     }
//   };

//   const verifyOTP = async () => {
//     if (!otp) return alert('Enter OTP');
//     try {
//       setLoading(true);
//       const payload = { ...parseIdentifier(), otp };
//       const res = await fetch('/api/auth/verify-otp', {
//         method: 'POST',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify(payload),
//       });
//       const data = await res.json();
//       if (!res.ok) throw new Error(data?.error || 'Failed to verify OTP');
//       alert('Logged in!');
//       onClose();
//       router.push('/dashboard');
//     } catch (e: any) {
//       alert(e.message || 'Error verifying OTP');
//     } finally {
//       setLoading(false);
//     }
//   };

//   const resendOTP = () => {
//     if (resendTimer > 0) return;
//     sendOTP();
//   };

//   return (
//     <div className="fixed inset-0 z-50 flex justify-end bg-black/40">
//       <div className="w-80 h-full bg-white p-6 shadow-lg">
//         <div className="flex justify-between items-center mb-4">
//           <h2 className="text-lg font-semibold">Login</h2>
//           <button onClick={onClose} className="text-red-500 font-bold text-xl">
//             &times;
//           </button>
//         </div>

//         {!otpSent ? (
//           <>
//             <label className="block mb-2 text-sm font-medium text-gray-700">
//               Phone or Email
//             </label>
//             <input
//               type="text"
//               value={identifier}
//               onChange={(e) => setIdentifier(e.target.value)}
//               placeholder="Enter phone or email"
//               className="w-full px-4 py-2 border rounded-md mb-4"
//             />
//             <button
//               onClick={sendOTP}
//               disabled={loading}
//               className={`w-full ${
//                 loading ? 'bg-pink-300' : 'bg-pink-500 hover:bg-pink-600'
//               } text-white py-2 rounded`}
//             >
//               {loading ? 'Sending...' : 'Send OTP'}
//             </button>
//           </>
//         ) : (
//           <>
//             <label className="block mb-2 text-sm font-medium text-gray-700">
//               Enter OTP
//             </label>
//             <input
//               type="text"
//               value={otp}
//               onChange={(e) => setOtp(e.target.value)}
//               placeholder="123456"
//               className="w-full px-4 py-2 border rounded-md mb-4"
//               inputMode="numeric"
//               maxLength={6}
//             />
//             <button
//               onClick={verifyOTP}
//               disabled={loading}
//               className={`w-full mb-2 ${
//                 loading ? 'bg-green-300' : 'bg-green-500 hover:bg-green-600'
//               } text-white py-2 rounded`}
//             >
//               {loading ? 'Verifying...' : 'Verify OTP'}
//             </button>
//             <button
//               onClick={resendOTP}
//               disabled={resendTimer > 0 || loading}
//               className={`w-full py-2 rounded ${
//                 resendTimer > 0
//                   ? 'bg-gray-300 text-gray-600 cursor-not-allowed'
//                   : 'bg-yellow-500 text-white hover:bg-yellow-600'
//               }`}
//             >
//               {resendTimer > 0
//                 ? `Resend OTP in ${resendTimer}s`
//                 : 'Resend OTP'}
//             </button>
//           </>
//         )}
//       </div>
//     </div>
//   );
// }





// 'use client';

// import { useState, useEffect, useRef } from 'react';
// import { useRouter } from 'next/navigation';
// import useGuestGuard from '@/hooks/useGuestGuard';

// interface LoginSliderProps {
//   onClose: () => void;
// }

// export default function LoginSlider({ onClose }: LoginSliderProps) {
//   const loadingGuard = useGuestGuard(); // always called
//   const router = useRouter();
//   const otpInputRef = useRef<HTMLInputElement>(null);

//   const [identifier, setIdentifier] = useState('');
//   const [otpSent, setOtpSent] = useState(false);
//   const [otp, setOtp] = useState('');
//   const [resendTimer, setResendTimer] = useState(0);
//   const [loading, setLoading] = useState(false);

//   // Countdown for resend OTP
//   useEffect(() => {
//     if (resendTimer <= 0) return;
//     const interval = setInterval(() => setResendTimer(prev => (prev > 0 ? prev - 1 : 0)), 1000);
//     return () => clearInterval(interval);
//   }, [resendTimer]);

//   // Auto-focus OTP input when sent
//   useEffect(() => {
//     if (otpSent && otpInputRef.current) otpInputRef.current.focus();
//   }, [otpSent]);

//   // Determine if identifier is email or phone
//   const parseIdentifier = () => {
//     const trimmed = identifier.trim();
//     if (!trimmed) return {};
//     const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
//     if (emailRegex.test(trimmed)) return { email: trimmed };
//     return { phone: trimmed };
//   };

//   const sendOTP = async () => {
//     if (!identifier.trim()) return alert('Enter phone or email');
//     try {
//       setLoading(true);
//       const payload = parseIdentifier();
//       const res = await fetch('/api/auth/send-otp', {
//         method: 'POST',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify(payload),
//       });
//       const data = await res.json();
//       if (!res.ok) throw new Error(data?.error || 'Failed to send OTP');
//       setOtpSent(true);
//       setResendTimer(30);
//     } catch (err: any) {
//       alert(err.message || 'Error sending OTP');
//     } finally {
//       setLoading(false);
//     }
//   };

//   const verifyOTP = async () => {
//     if (!otp.trim()) return alert('Enter OTP');
//     try {
//       setLoading(true);
//       const payload = { ...parseIdentifier(), otp };
//       const res = await fetch('/api/auth/verify-otp', {
//         method: 'POST',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify(payload),
//       });
//       const data = await res.json();
//       if (!res.ok) throw new Error(data?.error || 'Failed to verify OTP');

//       router.push('/dashboard');
//       onClose();
//     } catch (err: any) {
//       alert(err.message || 'Error verifying OTP');
//     } finally {
//       setLoading(false);
//     }
//   };

//   const resendOTP = () => {
//     if (resendTimer > 0) return;
//     sendOTP();
//   };

//   // Conditionally render slider content without conditionally calling hooks
//   return (
//     <>
//       {!loadingGuard && (
//         <div className="fixed inset-0 z-50 flex justify-end bg-black/40">
//           <div className="w-80 h-full bg-white p-6 shadow-lg">
//             {/* Header */}
//             <div className="flex justify-between items-center mb-4">
//               <h2 className="text-lg font-semibold">Login</h2>
//               <button onClick={onClose} className="text-red-500 font-bold text-xl">
//                 &times;
//               </button>
//             </div>

//             {!otpSent ? (
//               <>
//                 <label className="block mb-2 text-sm font-medium text-gray-700">
//                   Phone or Email
//                 </label>
//                 <input
//                   type="text"
//                   value={identifier}
//                   onChange={(e) => setIdentifier(e.target.value)}
//                   placeholder="Enter phone or email"
//                   className="w-full px-4 py-2 border rounded-md mb-4"
//                   disabled={loading}
//                 />
//                 <button
//                   onClick={sendOTP}
//                   disabled={loading}
//                   className={`w-full ${loading ? 'bg-pink-300' : 'bg-pink-500 hover:bg-pink-600'} text-white py-2 rounded`}
//                 >
//                   {loading ? 'Sending...' : 'Send OTP'}
//                 </button>
//               </>
//             ) : (
//               <>
//                 <label className="block mb-2 text-sm font-medium text-gray-700">
//                   Enter OTP
//                 </label>
//                 <input
//                   ref={otpInputRef}
//                   type="text"
//                   value={otp}
//                   onChange={(e) => setOtp(e.target.value)}
//                   placeholder="123456"
//                   className="w-full px-4 py-2 border rounded-md mb-4"
//                   inputMode="numeric"
//                   maxLength={6}
//                   disabled={loading}
//                 />
//                 <button
//                   onClick={verifyOTP}
//                   disabled={loading}
//                   className={`w-full mb-2 ${loading ? 'bg-green-300' : 'bg-green-500 hover:bg-green-600'} text-white py-2 rounded`}
//                 >
//                   {loading ? 'Verifying...' : 'Verify OTP'}
//                 </button>
//                 <button
//                   onClick={resendOTP}
//                   disabled={resendTimer > 0 || loading}
//                   className={`w-full py-2 rounded ${resendTimer > 0 ? 'bg-gray-300 text-gray-600 cursor-not-allowed' : 'bg-yellow-500 text-white hover:bg-yellow-600'}`}
//                 >
//                   {resendTimer > 0 ? `Resend OTP in ${resendTimer}s` : 'Resend OTP'}
//                 </button>
//               </>
//             )}
//           </div>
//         </div>
//       )}
//     </>
//   );
// }



'use client';

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
  const [error, setError] = useState<string | null>(null);

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
    setError(null);

    const payload = parseIdentifier();
    if (!payload.email && !payload.phone) {
      setError('Enter a valid phone number or email');
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
      setError(err.message || 'Error sending OTP');
    } finally {
      setLoading(false);
    }
  };

  const verifyOTP = async () => {
    if (loading) return;
    setError(null);

    if (!otp.trim() || otp.length !== 6) {
      setError('Enter a valid 6-digit OTP');
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
      setError(err.message || 'Error verifying OTP');
    } finally {
      setLoading(false);
    }
  };

  // auto-submit OTP when 6 digits entered
  useEffect(() => {
    if (otp.length === 6 && !loading) verifyOTP();
    // eslint-disable-next-line react-hooks/exhaustive-deps
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

        {/* error */}
        {error && (
          <div className="mb-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-md p-2">
            {error}
          </div>
        )}

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
