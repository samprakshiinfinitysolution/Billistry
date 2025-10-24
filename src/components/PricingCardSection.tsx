"use client";

import { useState } from "react";
import { CheckCircle2 } from "lucide-react";

type Plan = {
  name: string;
  monthly: number | null;
  yearly: number | null;
  description: string;
  features: string[];
  highlight?: boolean;
};

const plans: Plan[] = [
  {
    name: "Standard",
    monthly: 29,
    yearly: 299,
    description: "Essential tools to get started with your business.",
    features: [
      "5 users",
      "Basic integrations",
      "Email support",
      "Create quotes and GST compliant invoices",
      "Customize for local languages and tax laws",
      "Multi-user access for up to 3 users",
      "Handle multi-currency transactions",
      "Set up automated payment reminders",
      "Manage projects & timesheets",
      "Enable self-service customer portal",
      "Customize your transaction templates",
      "Use custom domains",
      "Customize business workflows",
      "Generate detailed GST reports",
      "Progress invoicing",
    ],
  },
  {
    name: "Premium",
    monthly: 59,
    yearly: 599,
    description: "Advanced features for growing teams.",
    features: [
      "Includes everything in Standard +",
      "20 users",
      "Advanced integrations",
      "Priority support",
      "Manage subscription billing",
      "Multi-user access for up to 10 users",
      "Use hosted payment pages",
      "Automate billing for usage-based pricing models",
      "Handle proration calculation",
      "Manage in-app purchases (NEW)",
      "Send abandoned cart reminders",
      "Allow customers to review timesheets",
      "Reduce failed payments with dunning management",
      "Use custom modules and custom functions",
      "Customize and schedule reports",
      "Access advanced business analytics",
    ],
    highlight: true,
  },
  {
    name: "Custom",
    monthly: null,
    yearly: null,
    description: "Tailored solution for large organizations.",
    features: [
      "Includes everything in Premium +",
      "Unlimited users",
      "All integrations",
      "Dedicated manager",
      "Use advanced billing capabilities",
      "Visualize data with cohort charts",
      "Automate revenue recognition",
      "Schedule cancellations",
      "Access advanced analytics and BI",
      "Work with a dedicated account manager",
    ],
  },
];

const addons = [
  { name: "user-addon", title: "Users", monthly: "₹540", yearly: "₹450", note: "user/month" },
  { name: "timesheet-addon", title: "Timesheet user", monthly: "₹180", yearly: "₹150", note: "user/month" },
  { name: "autoscan-addon", title: "Advanced autoscans", monthly: "₹499", yearly: "₹419", note: "50 scans/month" },
  { name: "location-addon", title: "Locations", monthly: "₹720", yearly: "₹600", note: "location/month" },
  { name: "timbers-addon", title: "Timbres", monthly: "Mex$69", yearly: "Mex$69", note: "(100 timbres)", hide: true },
];

export default function PricingSection() {
  const [billing, setBilling] = useState<"monthly" | "yearly">("monthly");
  const [currency, setCurrency] = useState("INR");

  return (
    <section className="relative bg-[#F7FBFB] py-20 px-6 font-['Poppins'] sm:px-8 lg:px-12 ">
      <div className="max-w-7xl mx-auto text-center">
        {/* Toggle */}
        <div className="flex justify-center mb-12 sticky top-0">
          <div className="flex bg-[#E5E7EB] rounded-full gap-7 p-1">
            <button
              onClick={() => setBilling("monthly")}
              className={`px-5 py-2 rounded-full font-medium text-sm transition ${
                billing === "monthly"
                  ? "bg-gradient-to-r from-[#390F59] via-[#460F58] to-[#7B53A6] text-white shadow-md"
                  : "bg-white text-[#460F58] border border-[#D1D5DB] hover:bg-[#EDE9F8]"
              }`}
            >
              Monthly
            </button>
            <button
              onClick={() => setBilling("yearly")}
              className={`px-5 py-2 rounded-full font-medium text-sm transition ${
                billing === "yearly"
                  ? "bg-gradient-to-r from-[#390F59] via-[#460F58] to-[#7B53A6] text-white shadow-md"
                  : "bg-white text-[#460F58] border border-[#D1D5DB] hover:bg-[#EDE9F8]"
              }`}
            >
              Yearly
            </button>
          </div>
        </div>

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10 items-stretch">
          {plans.map((p, i) => (
            <div
              key={i}
              className={`relative flex flex-col bg-[#F7FBFB] rounded-2xl shadow-md border transition-all duration-300 p-8 
              hover:-translate-y-3 hover:shadow-[0_8px_20px_rgba(123,83,166,0.25)] ${
                p.highlight
                  ? "border-[#7B53A6] scale-105 bg-gradient-to-br from-[#F7FBFB] to-[#EEE7F5]"
                  : "border-gray-200 hover:border-[#7B53A6]"
              }`}
            >
              {/* Heading */}
              <h3 className="text-xl font-bold text-[#460F58] mb-2 font-['Roboto']">{p.name}</h3>
              {/* Description */}
              <p className={`mb-6 ${p.highlight ? "text-[#7B53A6]" : "text-gray-600"} font-['Poppins']`}>
                {p.description}
              </p>

              {/* Price */}
              {p.monthly ? (
                <p className="text-3xl font-extrabold mb-6 text-[#390F59] font-['Roboto']">
                  {currency} {billing === "monthly" ? p.monthly : p.yearly}
                  <span className="text-lg font-medium text-[#744D81]">/{billing}</span>
                </p>
              ) : (
                <p className="text-2xl font-semibold mb-6 text-[#744D81] font-['Roboto']">Contact Sales</p>
              )}

              {/* CTA */}
              <button
                className={`w-full py-3 rounded-full cursor-pointer font-bold text-lg transition-all duration-300 shadow-md
                ${
                  p.highlight
                    ? "bg-gradient-to-r from-[#390F59] via-[#460F58] to-[#7B53A6] text-white hover:scale-105 whitespace-nowrap overflow-hidden text-ellipsis"
                    : " border-2 border-[#7B53A6] text-[#7B53A6] px-4 sm:px-6 md:px-8 py-3 rounded-lg font-semibold text-base sm:text-lg hover:bg-gradient-to-r hover:from-[#390F59] hover:via-[#460F58] hover:to-[#7B53A6] hover:text-[#F7FBFB] transition-all duration-200 shadow-sm whitespace-nowrap overflow-hidden text-ellipsis"
                }`}
              >
                {p.name === "Custom" ? "Request Demo" : "Get Started"}
              </button>

              {/* Features */}
              <ul className="mt-6 space-y-2">
  {p.features.map((f, j) => (
    <li
      key={j}
      className="flex items-center gap-2 text-sm text-gray-600 font-['Poppins'] truncate"
    >
      <CheckCircle2 className="w-4 h-4 rounded-full bg-gradient-to-r from-[#390F59] via-[#460F58] to-[#7B53A6] text-white mt-1 flex-shrink-0" />
      <span className="truncate">{f}</span>
    </li>
  ))}
</ul>

            </div>
          ))}
        </div>
      </div>

      {/* Add-on Repository */}
      <div className="max-w-7xl mx-auto text-center mt-20">
        <h2 className="text-4xl sm:text-5xl font-extrabold text-[#460F58] mb-2 font-['Roboto']">
          Our Add-on Repository
        </h2>
        <div className="text-[#744D81] mb-12 font-['Poppins']">
          {billing === "yearly" ? "(Billed annually)" : "(Billed monthly)"}
        </div>

        {/* Add-on Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {addons.map((addon, i) => {
            if (addon.hide) return null;
            return (
              <div
                key={i}
                className="bg-[#F7FBFB] rounded-2xl shadow-sm p-8 cursor-pointer flex flex-col items-center justify-center text-center border border-gray-200 
              hover:border-[#7B53A6] hover:shadow-[0_8px_20px_rgba(123,83,166,0.25)] transition duration-300 min-h-[200px] hover:-translate-y-2"
              >
                <div className="text-2xl sm:text-xl font-extrabold text-[#460F58] mb-3 font-['Roboto']">
                  {addon.title}
                </div>
                <div className="text-3xl font-bold mb-2 text-[#390F59] font-['Roboto'] whitespace-nowrap overflow-hidden text-ellipsis">
                  {billing === "monthly" ? addon.monthly : addon.yearly}
                </div>
                <div className="text-gray-600 font-['Poppins']">{addon.note}</div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}




