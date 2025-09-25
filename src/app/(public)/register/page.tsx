"use client";

import React, { useState, useEffect } from "react";
import { Eye, EyeOff } from "lucide-react";

export default function RegisterPage() {
  const [step, setStep] = useState<"IDENTITY" | "OTP" | "PASSWORD">("IDENTITY");
  const [identifier, setIdentifier] = useState("");
  const [otp, setOtp] = useState<string[]>(["", "", "", ""]);
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [show, setShow] = useState(false);
  const [timer, setTimer] = useState(0);
  const otpCode = otp.join("");

  useEffect(() => {
    if (step === "OTP" && timer > 0) {
      const t = setTimeout(() => setTimer((x) => x - 1), 1000);
      return () => clearTimeout(t);
    }
  }, [step, timer]);

  const strong = (p: string) =>
    /[A-Z]/.test(p) && /[a-z]/.test(p) && /[0-9]/.test(p) && /[^A-Za-z0-9]/.test(p) && p.length >= 8;

  async function sendOtp() {
    const r = await fetch("/api/auth/send-otp", {
      method: "POST",
      body: JSON.stringify({ identifier }),
      headers: { "Content-Type": "application/json" },
    });
    const data = await r.json();
    if (!r.ok) return alert(data.error || "Failed to send OTP");
    setStep("OTP");
    setTimer(30);
  }

  async function verifyOtp() {
    const r = await fetch("/api/auth/verify-otp", {
      method: "POST",
      body: JSON.stringify({ identifier, otp: otpCode }),
      headers: { "Content-Type": "application/json" },
    });
    const data = await r.json();
    if (!r.ok) return alert(data.error || "Invalid OTP");
    setStep("PASSWORD");
  }

  async function setPasswordHandler() {
    if (!strong(password)) return alert("Weak password");
    if (password !== confirm) return alert("Passwords do not match");
    const r = await fetch("/api/auth/set-password", {
      method: "POST",
      body: JSON.stringify({ identifier, password }),
      headers: { "Content-Type": "application/json" },
    });
    const data = await r.json();
    if (!r.ok) return alert(data.error || "Failed");
    alert("Registered. Please login with OTP.");
    window.location.href = "/login";
  }

  function updateOtp(idx: number, v: string) {
    if (!/^\d?$/.test(v)) return;
    const next = [...otp];
    next[idx] = v;
    setOtp(next);
  }

  return (
    <div className="min-h-screen grid place-items-center bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl p-8 space-y-6">
        <h1 className="text-2xl font-bold text-center">Create your account</h1>

        {step === "IDENTITY" && (
          <>
            <input
              className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-indigo-400"
              placeholder="Phone or Email"
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
            />
            <button
              onClick={sendOtp}
              disabled={!identifier}
              className="w-full py-3 rounded-lg font-semibold bg-indigo-600 hover:bg-indigo-700 text-white disabled:opacity-50"
            >
              Send OTP
            </button>
            <p className="text-sm text-center text-gray-500">
              Already have an account?{" "}
              <a className="text-indigo-600 underline" href="/login">Login</a>
            </p>
          </>
        )}

        {step === "OTP" && (
          <>
            <div className="flex justify-center gap-3">
              {otp.map((d, i) => (
                <input
                  key={i}
                  value={d}
                  onChange={(e) => updateOtp(i, e.target.value)}
                  maxLength={1}
                  className="w-12 h-12 text-center border rounded-lg text-xl font-bold focus:ring-2 focus:ring-indigo-400"
                />
              ))}
            </div>
            <button
              onClick={verifyOtp}
              disabled={otpCode.length !== 4}
              className="w-full py-3 rounded-lg font-semibold bg-green-600 hover:bg-green-700 text-white disabled:opacity-50"
            >
              Verify OTP
            </button>
            <p className="text-sm text-center text-gray-500">
              {timer > 0 ? (
                <>Resend OTP in {timer}s</>
              ) : (
                <button onClick={sendOtp} className="text-indigo-600 underline">Resend OTP</button>
              )}
            </p>
          </>
        )}

        {step === "PASSWORD" && (
          <>
            <div className="relative">
              <input
                type={show ? "text" : "password"}
                className="w-full p-3 border rounded-lg pr-10 focus:ring-2 focus:ring-indigo-400"
                placeholder="Create password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <button type="button" className="absolute right-3 top-3" onClick={() => setShow(!show)}>
                {show ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
            <input
              type={show ? "text" : "password"}
              className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-indigo-400"
              placeholder="Confirm password"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
            />

            {/* Strength meter */}
            <div className="space-y-2">
              <div className="h-2 bg-gray-200 rounded">
                <div
                  className={`h-2 rounded ${
                    !password ? '' :
                    !strong(password) ? 'w-2/5 bg-red-500' : 'w-full bg-green-600'
                  }`}
                />
              </div>
              <ul className="text-xs text-gray-500 list-disc pl-5">
                <li>At least 8 characters</li>
                <li>Uppercase, lowercase, number & symbol</li>
              </ul>
            </div>

            <button
              onClick={setPasswordHandler}
              disabled={!strong(password) || password !== confirm}
              className="w-full py-3 rounded-lg font-semibold bg-indigo-600 hover:bg-indigo-700 text-white disabled:opacity-50"
            >
              Save password
            </button>
          </>
        )}
      </div>
    </div>
  );
}
