// import { CheckCircle2, Star } from 'lucide-react'

// export default function PlansSection() {
//   const plans = [
//     {
//       name: "Starter",
//       price: "Free",
//       highlight: false,
//       description: "Perfect for individuals and small teams starting out.",
//       features: [
//         "Basic Analytics",
//         "Real-time Tracking",
//         "1 User",
//         "Email Support",
//       ],
//     },
//     {
//       name: "Pro",
//       price: "$49/mo",
//       highlight: true,
//       description: "Advanced features for growing businesses.",
//       features: [
//         "All Starter Features",
//         "Stock Alerts",
//         "Unlimited Users",
//         "Priority Support",
//         "AI-powered Reports",
//       ],
//     },
//   ]
//   return (
//     <section className="bg-gradient-to-br from-pink-50 via-white to-fuchsia-50 py-20 px-4">
//       <div className="max-w-6xl mx-auto text-center">
//         <h2 className="text-4xl font-extrabold text-pink-600 mb-4 drop-shadow">
//           Choose Your Plan
//         </h2>
//         <p className="text-gray-600 mb-12 text-lg">
//           Flexible pricing for every stage of your business.
//         </p>
//         <div className="grid md:grid-cols-2 gap-10">
//           {plans.map((p, i) => (
//             <div
//               key={i}
//               className={`relative bg-white p-8 rounded-2xl shadow-xl border-2 transition-all duration-200 ${
//                 p.highlight
//                   ? 'border-pink-500 scale-105 z-10'
//                   : 'border-transparent hover:border-pink-300'
//               }`}
//             >
//               {p.highlight && (
//                 <span className="absolute -top-4 right-6 bg-pink-600 text-white px-4 py-1 rounded-full text-xs font-bold flex items-center gap-1 shadow-lg">
//                   <Star className="w-4 h-4 fill-yellow-300 text-yellow-300" /> Most Popular
//                 </span>
//               )}
//               <h3 className="text-2xl font-bold text-pink-600 mb-2">{p.name}</h3>
//               <p className="text-3xl font-extrabold mb-2">{p.price}</p>
//               <p className="text-gray-500 mb-6">{p.description}</p>
//               <ul className="text-gray-700 space-y-3 mb-8 text-left">
//                 {p.features.map((f, j) => (
//                   <li key={j} className="flex items-center gap-2">
//                     <CheckCircle2 className="w-5 h-5 text-pink-500" /> {f}
//                   </li>
//                 ))}
//               </ul>
//               <button
//                 className={`w-full py-3 rounded-full font-bold text-lg transition-all duration-200 shadow ${
//                   p.highlight
//                     ? 'bg-gradient-to-r from-pink-500 to-fuchsia-500 text-white hover:from-pink-600 hover:to-fuchsia-600'
//                     : 'bg-pink-100 text-pink-700 hover:bg-pink-200'
//                 }`}
//               >
//                 {p.highlight ? 'Upgrade Now' : 'Get Started'}
//               </button>
//             </div>
//           ))}
//         </div>
//         <div className="mt-12 text-sm text-gray-500">
//           Need a custom plan? <a href="/contact" className="text-pink-600 underline hover:text-fuchsia-600">Contact us</a>
//         </div>
//       </div>
//     </section>
//   )
// }




"use client";
import { useState } from "react";
import { CheckCircle2, Star } from "lucide-react";

export default function PlansSection() {
  const [billing, setBilling] = useState("monthly"); // monthly | yearly

  const plans = [
    {
      name: "Starter",
      price: { monthly: "Free", yearly: "Free" },
      highlight: false,
      description: "Perfect for individuals and small teams starting out.",
      features: [
        "Basic Analytics",
        "Real-time Tracking",
        "1 User",
        "Email Support",
      ],
    },
    {
      name: "Pro",
      price: { monthly: "$59/mo", yearly: "$599/yr" },
      highlight: true,
      description: "Advanced features for growing businesses.",
      features: [
        "All Starter Features",
        "Stock Alerts",
        "Unlimited Users",
        "Priority Support",
        "AI-powered Reports",
      ],
    },
    {
      name: "Enterprise",
      price: { monthly: "Custom", yearly: "Custom" },
      highlight: false,
      description: "Tailored solutions for large organizations.",
      features: [
        "All Pro Features",
        "Dedicated Account Manager",
        "Custom Integrations",
        "24/7 Premium Support",
      ],
    },
  ];

  return (
   <section className="relative bg-[#F7FBFB] py-24 px-6 font-poppins ">
  <div className="max-w-7xl mx-auto text-center sm:px-8 lg:px-10">
    {/* Heading */}
    <h2 className="text-4xl sm:text-5xl font-extrabold mb-2 text-[#390F59] font-roboto">
      Choose Your Plan
    </h2>
    <p className="text-gray-500 mb-10 text-lg">
      Flexible pricing for every stage of your business.
    </p>

    {/* Billing Switch */}
    <div className="flex justify-center items-center gap-6 mb-16">
      <button
        onClick={() => setBilling("monthly")}
        className={`px-4 py-2 rounded-full font-semibold transition ${
          billing === "monthly"
            ? "bg-gradient-to-r from-[#390F59] via-[#460F58] to-[#7B53A6] text-white shadow-md"
            : "bg-white text-[#460F58] border border-[#D1D5DB] hover:bg-[#EDE9F8]"
        }`}
      >
        Monthly
      </button>
      <button
        onClick={() => setBilling("yearly")}
        className={`px-4 py-2 rounded-full font-semibold transition ${
          billing === "yearly"
            ? "bg-gradient-to-r from-[#390F59] via-[#460F58] to-[#7B53A6] text-white shadow-md"
            : "bg-white text-[#460F58] border border-[#D1D5DB] hover:bg-[#EDE9F8]"
        }`}
      >
        Yearly
      </button>
    </div>

    {/* Plans */}
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 items-stretch">
      {plans.map((p, i) => (
        <div
          key={i}
          className={`relative flex flex-col bg-white rounded-2xl shadow-md border transition-all duration-300 p-8
            hover:-translate-y-3 hover:shadow-2xl ${
              p.highlight
                ? "border-[#460F58] scale-105 bg-gradient-to-br from-[#EDE9F8] to-[#E0E7FF]"
                : "border-[#E5E7EB] hover:border-[#460F58]"
            }`}
        >
          {/* Badge for Pro */}
          {p.highlight && (
            <span className="absolute -top-4 items-center  bg-[#460F58] text-white px-5 py-1 rounded-full text-xs font-bold flex items-center gap-1 shadow-lg">
              <Star className="w-4 h-4 fill-yellow-300 text-yellow-300" />
              Most Popular
            </span>
          )}

          {/* Plan Name & Price */}
          <h3 className="text-2xl font-bold text-[#3B3D72] mb-2 font-roboto">
            {p.name}
          </h3>
          <p className="text-4xl font-extrabold mb-2 text-[#390F59] font-roboto">
            {p.price[billing]}
          </p>
          <p>{p.description}</p> {/* Poppins inherited from section */}

          {/* Features */}
          <ul className="text-gray-500 space-y-3 mb-8 mt-3 text-left flex-1">
            {p.features.map((f, j) => (
              <li key={j} className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 rounded-full bg-gradient-to-r from-[#390F59] via-[#460F58] to-[#7B53A6] text-white" />{" "}
                {f}
              </li>
            ))}
          </ul>

          {/* Button */}
          <button
            className={`w-full py-3 rounded-full cursor-pointer font-bold text-lg transition-all duration-300 shadow-md
              ${
                p.highlight
                  ? "bg-gradient-to-r from-[#390F59] via-[#460F58] to-[#7B53A6] text-white hover:scale-105"
                  : " border-2 border-[#7B53A6] text-[#7B53A6] px-4 sm:px-6 md:px-8 py-3 rounded-lg font-semibold text-base sm:text-lg hover:bg-gradient-to-r hover:from-[#390F59] hover:via-[#460F58] hover:to-[#7B53A6] hover:text-[#F7FBFB] transition-all duration-200 shadow-sm"
              }`}
          >
            {p.highlight ? "Upgrade Now" : "Get Started"}
          </button>
        </div>
      ))}
    </div>

    {/* Footer */}
    <div className="mt-12 text-sm text-[#3B3D72]">
      Need a custom plan?{" "}
      <a href="/contact" className="text-[#744D81] underline hover:text-[#460F58]">
        Contact us
      </a>
    </div>
  </div>
</section>

  );
}





