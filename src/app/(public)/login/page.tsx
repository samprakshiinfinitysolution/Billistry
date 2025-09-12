"use client";
import { useState } from "react";

export default function LoginPage() {
  const [input, setInput] = useState("");
  const [otp, setOtp] = useState("");
  const [step, setStep] = useState(1);

  const requestOtp = async () => {
    const res = await fetch("/api/request-otp", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ input }),
    });
    const data = await res.json();
    if (res.ok) setStep(2);
    alert(data.msg);
  };

  const verifyOtp = async () => {
    const res = await fetch("/api/verify-otp", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ input, otp }),
    });
    const data = await res.json();
    if (res.ok) {
      alert(data.msg);
      // redirect to dashboard
      window.location.href = "/dashboard";
    } else alert(data.msg);
  };

  return (
    <div style={{ maxWidth: 400, margin: "auto", padding: 20 }}>
      {step === 1 && (
        <><input
            type="text"
            placeholder="Email or Phone"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            style={{ width: "100%", padding: 8, marginBottom: 10 }}
          />
          <input
            type="text"
            placeholder="Email or Phone"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            style={{ width: "100%", padding: 8, marginBottom: 10 }}
          />
          <button onClick={requestOtp} style={{ width: "100%", padding: 10 }}>Send OTP</button>
        </>
      )}
      {step === 2 && (
        <>
          <input
            type="text"
            placeholder="Enter OTP"
            value={otp}
            onChange={(e) => setOtp(e.target.value)}
            style={{ width: "100%", padding: 8, marginBottom: 10 }}
          />
          <button onClick={verifyOtp} style={{ width: "100%", padding: 10 }}>Verify OTP</button>
        </>
      )}
    </div>
  );
}
