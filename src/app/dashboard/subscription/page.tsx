"use client";

import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { CheckCircle2 } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { useRouter } from "next/navigation";

interface Plan {
  _id: string;
  name: string;
  description?: string;
  price: number;
  durationInDays: number;
  totalCount: number;
  features: string[];
}

export default function SubscriptionPage() {
  const [plans, setPlans] = useState<Plan[]>([]);  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const controller = new AbortController();
    const fetchPlans = async () => {
      setLoading(true);
      try {
        const res = await fetch("/api/subscription-plan", { signal: controller.signal });
        const data = await res.json();
        if (!res.ok) throw new Error(data?.error || "Failed to load plans");
        setPlans(data.plans || []);
      } catch (err: any) {
        if (err.name === "AbortError") return;
        setError(err.message || "Failed to load plans");
      } finally {
        setLoading(false);
      }
    };

    fetchPlans();

    return () => controller.abort();
  }, []);

  const handleChoosePlan = (planId: string) => {
    router.push(`/dashboard/subscription/confirm/${planId}`);
  };

  const fmt = (n: number) => new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(n);

  return (
      <div className="bg-slate-50 min-h-screen">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 lg:py-20">
          <div className="text-center mb-12 lg:mb-16">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-slate-900 tracking-tight">
              Find the perfect plan for your business
            </h1>
            <p className="mt-4 text-lg sm:text-xl text-slate-600 max-w-2xl mx-auto">
              Get started with a plan that works for you. Cancel anytime.
            </p>
          </div>

          {error && <div className="mb-4 text-red-600 text-center">Error: {error}</div>}

          {loading ? (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 max-w-sm mx-auto lg:max-w-5xl items-start">
              {[...Array(3)].map((_, i) => (
                <div key={i} className={`relative border rounded-2xl p-8 shadow-lg flex flex-col bg-white ${i === 1 ? 'lg:scale-110' : ''}`}>
                  <Skeleton className="h-7 w-3/5 mb-6" />
                  <Skeleton className="h-10 w-4/5 mb-2" />
                  <Skeleton className="h-5 w-2/5 mb-6" />
                  <Skeleton className="h-5 w-full mb-4" />
                  <div className="flex-1 space-y-4">
                    <Skeleton className="h-5 w-full" />
                    <Skeleton className="h-5 w-full" />
                    <Skeleton className="h-5 w-4/5" />
                  </div>
                  <Skeleton className="h-12 w-full mt-8" />
                </div>
              ))}
            </div>
          )
           : (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 max-w-sm mx-auto lg:max-w-5xl items-start">
              {plans.map((plan, index) => {
                const isPopular = index === 1; // Assuming the second plan is the most popular
                return (
                  <div
                    key={plan._id}
                    className={`relative border rounded-2xl p-8 shadow-lg flex flex-col transition-all duration-300 ease-in-out hover:-translate-y-2 ${isPopular ? 'bg-indigo-600 text-white transform lg:scale-110' : 'bg-white'}`}
                  >
                    {isPopular && (
                      <div className="absolute top-0 -translate-y-1/2 left-1/2 -translate-x-1/2">
                        <span className="inline-flex items-center px-4 py-1 rounded-full text-sm font-semibold tracking-wider text-white bg-pink-500 shadow-lg">
                          MOST POPULAR
                        </span>
                      </div>
                    )}
                    <h2 className={`text-2xl font-bold ${isPopular ? 'text-white' : 'text-gray-900'}`}>{plan.name}</h2>
                    <p className={`mt-4 text-4xl font-extrabold ${isPopular ? 'text-white' : 'text-gray-900'}`}>{fmt(plan.price)}
                      <span className={`text-lg font-medium ${isPopular ? 'text-indigo-200' : 'text-gray-500'}`}>/ {plan.durationInDays === 365 ? 'year' : `${plan.durationInDays} days`}</span>
                    </p>
                    <p className={`mt-4 text-sm h-10 ${isPopular ? 'text-indigo-100' : 'text-gray-600'}`}>{plan.description || 'Perfect for growing businesses.'}</p>
                    <ul className={`mt-6 space-y-4 text-sm flex-1 ${isPopular ? 'text-indigo-100' : 'text-gray-600'}`}>
                      {plan.features?.map((feature, i) => (
                        <li key={i} className="flex items-start">
                          <CheckCircle2 className={`h-5 w-5 flex-shrink-0 mr-3 ${isPopular ? 'text-white' : 'text-indigo-500'}`} aria-hidden="true" />
                          <span>{feature}</span>
                        </li>
                      ))}
                    </ul>
                    <Button
                      onClick={() => handleChoosePlan(plan._id)}
                      className={`w-full mt-8 py-3 text-base font-semibold rounded-lg transition-transform duration-200 hover:scale-105 ${isPopular ? 'bg-white text-indigo-600 hover:bg-gray-100' : 'bg-indigo-600 text-white hover:bg-indigo-700'}`}
                      aria-label={`Choose the ${plan.name} plan`}
                    >
                      Choose Plan
                    </Button>
                  </div>
                );
              })}
            </div>
          )}

          {plans.length === 0 && !error && !loading && (
            <div className="mt-10 text-center text-gray-600">
              <p>No subscription plans available at the moment.</p>
              <p>Please check back later.</p>
            </div>
          )}
        </div>
      </div>
  );
}