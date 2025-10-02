// // src/components/HowItWorksSection.tsx

// import {
//   PackageSearch,
//   FilePlus,
//   BarChart3,
//   BellRing,
//   Users,
//   Cloud,
//   ShieldCheck,
//   Zap,
// } from 'lucide-react'

// export default function HowItWorksSection() {
//   const steps = [
//     {
//       icon: <FilePlus className="w-8 h-8 text-pink-600" />,
//       title: 'Add Your Inventory',
//       description:
//         'Easily upload or manually add products to your dashboard in minutes.',
//     },
//     {
//       icon: <PackageSearch className="w-8 h-8 text-pink-600" />,
//       title: 'Track in Real-Time',
//       description:
//         'Monitor product movement, current stock, and updates in real-time.',
//     },
//     {
//       icon: <BellRing className="w-8 h-8 text-pink-600" />,
//       title: 'Get Instant Alerts',
//       description:
//         'Receive smart notifications for low stock, expiry, or order delays.',
//     },
//     {
//       icon: <BarChart3 className="w-8 h-8 text-pink-600" />,
//       title: 'Analyze & Optimize',
//       description:
//         'Use analytics to understand trends, reduce waste, and grow smarter.',
//     },
//     {
//       icon: <Users className="w-8 h-8 text-pink-600" />,
//       title: 'Collaborate with Teams',
//       description:
//         'Invite team members, assign roles, and work together seamlessly.',
//     },
//     {
//       icon: <Cloud className="w-8 h-8 text-pink-600" />,
//       title: 'Cloud Access Anywhere',
//       description:
//         'Access your inventory securely from any device, anytime, anywhere.',
//     },
//     {
//       icon: <ShieldCheck className="w-8 h-8 text-pink-600" />,
//       title: 'Enterprise-Grade Security',
//       description:
//         'Your data is protected with advanced encryption and security protocols.',
//     },
//     {
//       icon: <Zap className="w-8 h-8 text-pink-600" />,
//       title: 'Automate Workflows',
//       description:
//         'Set up rules to automate reordering, reporting, and routine tasks.',
//     },
//   ]

//   return (
//     <section className="bg-gray-100 py-20 px-6">
//       <div className="max-w-6xl mx-auto text-center">
//         <h2 className="text-3xl font-bold text-gray-800 mb-12">How It Works</h2>
//         <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10 text-left">
//           {steps.map((step, idx) => (
//             <div
//               key={idx}
//               className="bg-white p-6 rounded-xl shadow hover:shadow-md transition"
//             >
//               <div className="mb-4">{step.icon}</div>
//               <h3 className="text-lg font-semibold text-gray-800 mb-2">
//                 {step.title}
//               </h3>
//               <p className="text-sm text-gray-600">{step.description}</p>
//             </div>
//           ))}
//         </div>
//       </div>
//     </section>
//   )
// }


"use client";

"use client";

import { useState } from "react";
import {
  PackageSearch,
  FilePlus,
  BarChart3,
  BellRing,
  Users,
  Cloud,
  ShieldCheck,
  Zap,
} from "lucide-react";

export default function HowItWorksSection() {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  const steps = [
    { icon: <FilePlus className="w-8 h-8 text-white" />, title: "Add Your Inventory", description: "Easily upload or manually add products to your dashboard in minutes." },
    { icon: <PackageSearch className="w-8 h-8 text-white" />, title: "Track in Real-Time", description: "Monitor product movement, current stock, and updates in real-time." },
    { icon: <BellRing className="w-8 h-8 text-white" />, title: "Get Instant Alerts", description: "Receive smart notifications for low stock, expiry, or order delays." },
    { icon: <BarChart3 className="w-8 h-8 text-white" />, title: "Analyze & Optimize", description: "Use analytics to understand trends, reduce waste, and grow smarter." },
    { icon: <Users className="w-8 h-8 text-white" />, title: "Collaborate with Teams", description: "Invite team members, assign roles, and work together seamlessly." },
    { icon: <Cloud className="w-8 h-8 text-white" />, title: "Cloud Access Anywhere", description: "Access your inventory securely from any device, anytime, anywhere." },
    { icon: <ShieldCheck className="w-8 h-8 text-white" />, title: "Enterprise-Grade Security", description: "Your data is protected with advanced encryption and security protocols." },
    { icon: <Zap className="w-8 h-8 text-white" />, title: "Automate Workflows", description: "Set up rules to automate reordering, reporting, and routine tasks." },
  ];

  return (
    <section className="bg-[#F7FBFB] py-20 px-6 font-['Poppins']">
  <div className="max-w-6xl mx-auto text-center sm:px-8 lg:px-10">
    {/* Heading with gradient */}
    <h2
      className="text-3xl md:text-4xl font-extrabold mb-12 
        bg-gradient-to-r from-[#390F59] via-[#460F58] to-[#7B53A6] bg-clip-text text-transparent"
      style={{ fontFamily: 'Roboto, sans-serif' }} // ✅ Roboto for heading
    >
      How It Works
    </h2>

    {/* Cards Grid */}
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 text-left">
      {steps.map((step, idx) => {
        const isHovered = hoveredIndex === idx;

        return (
          <div
            key={idx}
            onMouseEnter={() => setHoveredIndex(idx)}
            onMouseLeave={() => setHoveredIndex(null)}
            className={`relative group bg-[#F7FBFB] rounded-2xl shadow-sm p-6 flex flex-col items-start border  transition-all duration-300
              hover:border-[#7B53A6] hover:shadow-2xl hover:-translate-y-3 hover:shadow-[0_8px_20px_rgba(123,83,166,0.25)] 
              ${isHovered ? "z-10" : ""}`}
          >
            {/* Gradient Glow Overlay */}
            <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-20 transition duration-300 
              pointer-events-none blur-2xl"></div>

            {/* Icon */}
            <div className="mb-4 flex items-center justify-center w-12 h-12 rounded-full bg-gradient-to-r from-[#390F59] via-[#460F58] to-[#7B53A6] text-white shadow-md transition-transform duration-300 group-hover:scale-110 group-hover:shadow-lg">
              {step.icon}
            </div>

            {/* Title */}
            <h3
              className="text-lg font-semibold mb-2 text-[#390F59]"
              style={{ fontFamily: 'Roboto, sans-serif' }} // ✅ Roboto for card titles
            >
              {step.title}
            </h3>

            {/* Description */}
            <p
              className="text-gray-500 text-sm leading-relaxed"
              style={{ fontFamily: 'Poppins, sans-serif' }} // ✅ Poppins for body text
            >
              {step.description}
            </p>
          </div>
        );
      })}
    </div>
  </div>
</section>


  );
}


