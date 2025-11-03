"use client";

import React, { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import toast from "react-hot-toast";
import { Skeleton } from "@/components/ui/skeleton";
import { CheckCircle2, ArrowLeft, ShieldCheck, CreditCard } from "lucide-react";
import { motion } from "framer-motion";

interface Plan {
  _id: string;
  name: string;
  description?: string;
  price: number;
  durationInDays: number;
  features: string[];
}

declare global {
  interface Window {
    Razorpay: any;
  }
}

export default function ConfirmSubscriptionPage({ params }: { params: { planId: string } }) {
  const { planId } = params;
  const [plan, setPlan] = useState<Plan | null>(null);
  const [pageLoading, setPageLoading] = useState(true);
  const [paymentLoading, setPaymentLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const fmt = useCallback((n: number) => new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(n), []);

  useEffect(() => {
    if (!planId) return;
    const controller = new AbortController();
    const fetchPlan = async () => {
      setPageLoading(true);
      setError(null);
      try {
        const res = await fetch(`/api/subscription-plan`, { signal: controller.signal, credentials: 'include' });
        const data = await res.json();
        if (!res.ok) throw new Error(data?.error || "Failed to load plan details");
        const selectedPlan = data.plans?.find((p: Plan) => p._id === planId);
        if (selectedPlan) {
          setPlan(selectedPlan);
        } else {
          throw new Error("Plan not found.");
        }
      } catch (err: any) {
        if (err.name !== "AbortError") {
          setError(err.message || "Failed to load plan details");
        }
      } finally {
        setPageLoading(false);
      }
    };
    fetchPlan();
    return () => controller.abort();
  }, [planId]);

  const handlePayNow = async () => {
    if (!planId || !plan) return;
    setPaymentLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/subscription/create", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ planId }),
      });

      const data = await res.json();
      if (!res.ok) {
        if (res.status === 401) router.push("/login");
        throw new Error(data?.error || "Failed to create subscription");
      }

      const subscriptionId = data.subscriptionId || data.subscription?.razorpaySubscriptionId;
      if (!subscriptionId) throw new Error("Subscription ID not found.");

      const loadScript = (src: string) => new Promise<void>((resolve, reject) => {
        if (document.querySelector(`script[src="${src}"]`)) return resolve();
        const script = document.createElement("script");
        script.src = src;
        script.onload = () => resolve();
        script.onerror = () => reject(new Error("Razorpay script failed to load"));
        document.body.appendChild(script);
      });

      await loadScript("https://checkout.razorpay.com/v1/checkout.js");

      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || "",
        subscription_id: subscriptionId,
        name: "Billistry",
        description: `Payment for ${plan.name} Plan`,
        modal: {
          ondismiss: () => {
            setPaymentLoading(false);
            toast.error("Payment was not completed.");
          }
        },
        handler: async function (response: any) {
          try {
            const verifyRes = await fetch("/api/subscription/verify", {
              method: "POST",
              credentials: "include",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_subscription_id: response.razorpay_subscription_id,
                razorpay_signature: response.razorpay_signature,
              }),
            });
            const verifyData = await verifyRes.json();
            if (!verifyRes.ok) throw new Error(verifyData?.error || "Payment verification failed");
            toast.success("Subscription activated successfully!");
            router.push("/dashboard");
            router.refresh(); // Refresh to get new subscription state
          } catch (err: any) {
            setLoading(false);
            toast.error(err.message || "Payment verification failed.");
          }
        },
        theme: { color: "#4f46e5" },
      };
      
      const rzp = new window.Razorpay(options);
      rzp.open();

    } catch (err: any) {
      setError(err.message);
      toast.error(err.message);
      setPaymentLoading(false);
    }
  };

  if (pageLoading) {
    return (
      <div className="min-h-screen bg-gray-100 dark:bg-gray-900 flex flex-col items-center justify-center p-4">
        <div className="w-full max-w-2xl">
          <Skeleton className="h-8 w-1/3 mb-4" />
          <Skeleton className="h-5 w-2/3 mb-12" />
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8 space-y-6">
            <Skeleton className="h-7 w-1/2" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-5/6" />
            <hr className="border-gray-200 dark:border-gray-700" />
            <Skeleton className="h-6 w-1/4 mb-4" />
            <Skeleton className="h-5 w-full" />
            <Skeleton className="h-5 w-full" />
            <Skeleton className="h-5 w-4/5" />
            <hr className="border-gray-200 dark:border-gray-700" />
            <div className="flex justify-between items-center">
              <Skeleton className="h-6 w-1/3" />
              <Skeleton className="h-8 w-1/4" />
            </div>
            <Skeleton className="h-12 w-full rounded-lg" />
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-100 dark:bg-gray-900 flex flex-col items-center justify-center text-center p-4">
        <p className="text-lg font-semibold mb-4">Error: {error}</p>
        <Button onClick={() => router.back()} variant="outline">
          <ArrowLeft className="w-4 h-4 mr-2" /> Go Back
        </Button>
      </div>
    );
  }

  if (!plan) {
    return (
      <div className="min-h-screen bg-gray-100 dark:bg-gray-900 flex flex-col items-center justify-center text-center p-4">
        <p className="text-lg font-semibold mb-4 text-gray-600 dark:text-gray-300">Plan not found.</p>
        <Button onClick={() => router.back()} variant="outline">
          <ArrowLeft className="w-4 h-4 mr-2" /> Back to Plans
        </Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-black py-12 sm:py-16 lg:py-20">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 dark:text-white mb-2 text-center tracking-tight">Confirm Your Subscription</h1>
          <p className="text-lg text-gray-500 dark:text-gray-400 mb-10 text-center">You've selected the perfect plan. Review and pay below.</p>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }} 
          animate={{ opacity: 1, y: 0 }} 
          transition={{ duration: 0.5, delay: 0.1 }}
          className="bg-white dark:bg-gray-900/50 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-800"
        >
          <div className="p-6 sm:p-8">
            <div className="flex justify-between items-start mb-6">
              <div>
                <h2 className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">{plan.name} Plan</h2>
                <p className="text-gray-500 dark:text-gray-400 mt-1">{plan.description || 'The best choice for your business.'}</p>
              </div>
              <div className="text-right">
                <p className="text-3xl font-extrabold text-gray-900 dark:text-white">{fmt(plan.price)}</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">/ {plan.durationInDays === 365 ? 'Year' : `${plan.durationInDays} Days`}</p>
              </div>
            </div>

            <div className="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-6">
              <h3 className="text-md font-semibold text-gray-800 dark:text-gray-100 mb-4">What's Included:</h3>
              <ul className="space-y-3 text-sm text-gray-600 dark:text-gray-300">
                {plan.features?.map((feature, i) => (
                  <motion.li 
                    key={i} 
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3, delay: 0.3 + i * 0.05 }}
                    className="flex items-center"
                  >
                    <CheckCircle2 className="h-4 w-4 flex-shrink-0 mr-3 text-green-500" />
                    <span className="flex-1">{feature}</span>
                  </motion.li>
                ))}
              </ul>
            </div>
          </div>

          <div className="bg-gray-50 dark:bg-gray-900 rounded-b-2xl px-6 sm:px-8 py-6">
            <Button
              onClick={handlePayNow}
              disabled={paymentLoading}
              className="w-full bg-indigo-600 text-white hover:bg-indigo-700 focus-visible:ring-indigo-500 h-14 text-lg font-bold rounded-xl shadow-lg hover:shadow-indigo-500/30 transition-all duration-300 transform hover:-translate-y-1 flex items-center justify-center gap-3"
            >
              {paymentLoading ? "Processing..." : (
                <>
                  <CreditCard className="w-5 h-5" />
                  <span>{`Pay Securely - ${fmt(plan.price)}`}</span>
                </>
              )}
            </Button>

            <div className="mt-6 flex items-center justify-center gap-3 text-xs text-gray-500 dark:text-gray-400">
              <ShieldCheck className="h-4 w-4 text-green-600 dark:text-green-400" />
              <span>100% Secure Payment via Razorpay</span>
            </div>
          </div>
        </motion.div>

        <div className="mt-8 text-center">
          <button onClick={() => router.back()} className="text-sm font-medium text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-white transition-colors">
            <ArrowLeft className="w-4 h-4 inline-block mr-1" />
            Change Plan
          </button>
        </div>
      </div>
    </div>
  );
}
