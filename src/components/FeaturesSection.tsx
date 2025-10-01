<<<<<<< HEAD
// src/components/FeaturesSection.tsx
'use client'
=======
// // src/components/FeaturesSection.tsx
// 'use client'

// import {
//   BarChart2,
//   Bell,
//   Eye,
//   Cpu,
//   Clock3,
//   ShieldCheck,
//   FileText,
//   Smartphone,
//   Gift,
//   ListChecks,
//   Archive,
//   Zap,
//   TrendingUp,
//   Users,
// } from 'lucide-react'

// const features = [
//   {
//     icon: BarChart2,
//     title: 'Live Inventory Dashboard',
//     desc: 'Gain instant visibility into your entire stock with real-time updates and intuitive analytics.',
//   },
//   {
//     icon: Bell,
//     title: 'Automated Stock Alerts',
//     desc: 'Receive proactive notifications for low stock, expiry, or critical events—never miss a beat.',
//   },
//   {
//     icon: Eye,
//     title: 'Demand Forecasting',
//     desc: 'Leverage advanced forecasting to anticipate demand, optimize purchasing, and reduce excess inventory.',
//   },
//   {
//     icon: Cpu,
//     title: 'AI-Driven Optimization',
//     desc: 'Utilize artificial intelligence to recommend reorder points, minimize deadstock, and maximize ROI.',
//   },
//   {
//     icon: Clock3,
//     title: 'Workflow Automation',
//     desc: 'Automate routine tasks such as reordering, reporting, and billing to save time and reduce errors.',
//   },
//   {
//     icon: ShieldCheck,
//     title: 'Enterprise-Grade Security',
//     desc: 'Your data is protected with industry-leading encryption and compliance standards.',
//   },
//   {
//     icon: FileText,
//     title: 'Professional Billing',
//     desc: 'Generate branded invoices and bills in seconds, ready to share or print.',
//   },
//   {
//     icon: Smartphone,
//     title: 'WhatsApp Billing & QR Payments',
//     desc: 'Send bills directly to customers via WhatsApp, complete with QR codes for instant payment.',
//   },
//   {
//     icon: Gift,
//     title: 'Automated Customer Offers',
//     desc: 'Delight your customers with personalized offers and loyalty rewards, sent automatically.',
//   },
//   {
//     icon: ListChecks,
//     title: 'Comprehensive Transaction History',
//     desc: 'Track, filter, and export all your sales and purchase transactions for full transparency.',
//   },
//   {
//     icon: Archive,
//     title: 'Deadstock Management',
//     desc: 'Identify slow-moving or obsolete items and take action to optimize your inventory turnover.',
//   },
//   {
//     icon: Zap,
//     title: 'Smart Business Logic',
//     desc: 'Benefit from intelligent automations and insights tailored to your unique business needs.',
//   },
//   {
//     icon: TrendingUp,
//     title: 'Growth Analytics',
//     desc: 'Visualize trends, monitor KPIs, and make data-driven decisions to accelerate your business growth.',
//   },
//   {
//     icon: Users,
//     title: 'Team Collaboration',
//     desc: 'Assign roles, manage permissions, and collaborate seamlessly with your entire team.',
//   },
// ]

// export default function FeaturesSection() {
//   return (
//     <section className="bg-gray-50 py-20 px-6">
//       <div className="max-w-7xl mx-auto text-center">
//         <h2 className="text-3xl font-extrabold text-gray-800 mb-4">
//           Powerful Features for Modern Businesses
//         </h2>
//         <p className="text-gray-600 mb-12 text-lg max-w-2xl mx-auto">
//           Our platform combines advanced technology and business intelligence to streamline your inventory operations, enhance customer experience, and drive sustainable growth.
//         </p>
//         <div className="grid gap-8 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
//           {features.map(({ icon: Icon, title, desc }, idx) => (
//             <div
//               key={idx}
//               className="group bg-white p-6 rounded-xl shadow-md hover:shadow-lg transition duration-300 border border-transparent hover:border-pink-500"
//             >
//               <div className="flex items-center justify-center w-12 h-12 mx-auto mb-4 bg-pink-100 text-pink-600 rounded-full">
//                 <Icon className="w-6 h-6" />
//               </div>
//               <h3 className="text-xl font-semibold mb-2 text-gray-800 group-hover:text-pink-600 transition">
//                 {title}
//               </h3>
//               <p className="text-gray-600 text-sm">{desc}</p>
//             </div>
//           ))}
//         </div>
//       </div>
//     </section>
//   )
// }


"use client";
>>>>>>> ce21ec2fdc56a92ea043161788371f59da47de6b

import {
  BarChart2,
  Bell,
  Eye,
  Cpu,
  Clock3,
  ShieldCheck,
  FileText,
  Smartphone,
  Gift,
  ListChecks,
  Archive,
  Zap,
  TrendingUp,
  Users,
} from 'lucide-react'

const features = [
<<<<<<< HEAD
  {
    icon: BarChart2,
    title: 'Live Inventory Dashboard',
    desc: 'Gain instant visibility into your entire stock with real-time updates and intuitive analytics.',
  },
  {
    icon: Bell,
    title: 'Automated Stock Alerts',
    desc: 'Receive proactive notifications for low stock, expiry, or critical events—never miss a beat.',
  },
  {
    icon: Eye,
    title: 'Demand Forecasting',
    desc: 'Leverage advanced forecasting to anticipate demand, optimize purchasing, and reduce excess inventory.',
  },
  {
    icon: Cpu,
    title: 'AI-Driven Optimization',
    desc: 'Utilize artificial intelligence to recommend reorder points, minimize deadstock, and maximize ROI.',
  },
  {
    icon: Clock3,
    title: 'Workflow Automation',
    desc: 'Automate routine tasks such as reordering, reporting, and billing to save time and reduce errors.',
  },
  {
    icon: ShieldCheck,
    title: 'Enterprise-Grade Security',
    desc: 'Your data is protected with industry-leading encryption and compliance standards.',
  },
  {
    icon: FileText,
    title: 'Professional Billing',
    desc: 'Generate branded invoices and bills in seconds, ready to share or print.',
  },
  {
    icon: Smartphone,
    title: 'WhatsApp Billing & QR Payments',
    desc: 'Send bills directly to customers via WhatsApp, complete with QR codes for instant payment.',
  },
  {
    icon: Gift,
    title: 'Automated Customer Offers',
    desc: 'Delight your customers with personalized offers and loyalty rewards, sent automatically.',
  },
  {
    icon: ListChecks,
    title: 'Comprehensive Transaction History',
    desc: 'Track, filter, and export all your sales and purchase transactions for full transparency.',
  },
  {
    icon: Archive,
    title: 'Deadstock Management',
    desc: 'Identify slow-moving or obsolete items and take action to optimize your inventory turnover.',
  },
  {
    icon: Zap,
    title: 'Smart Business Logic',
    desc: 'Benefit from intelligent automations and insights tailored to your unique business needs.',
  },
  {
    icon: TrendingUp,
    title: 'Growth Analytics',
    desc: 'Visualize trends, monitor KPIs, and make data-driven decisions to accelerate your business growth.',
  },
  {
    icon: Users,
    title: 'Team Collaboration',
    desc: 'Assign roles, manage permissions, and collaborate seamlessly with your entire team.',
  },
=======
  { icon: BarChart2, title: 'Live Inventory Dashboard', desc: 'Gain instant visibility into your entire stock with real-time updates and intuitive analytics.' },
  { icon: Bell, title: 'Automated Stock Alerts', desc: 'Receive proactive notifications for low stock, expiry, or critical events—never miss a beat.' },
  { icon: Eye, title: 'Demand Forecasting', desc: 'Leverage advanced forecasting to anticipate demand, optimize purchasing, and reduce excess inventory.' },
  { icon: Cpu, title: 'AI-Driven Optimization', desc: 'Utilize artificial intelligence to recommend reorder points, minimize deadstock, and maximize ROI.' },
  { icon: Clock3, title: 'Workflow Automation', desc: 'Automate routine tasks such as reordering, reporting, and billing to save time and reduce errors.' },
  { icon: ShieldCheck, title: 'Enterprise-Grade Security', desc: 'Your data is protected with industry-leading encryption and compliance standards.' },
  { icon: FileText, title: 'Professional Billing', desc: 'Generate branded invoices and bills in seconds, ready to share or print.' },
  { icon: Smartphone, title: 'WhatsApp Billing & QR Payments', desc: 'Send bills directly to customers via WhatsApp, complete with QR codes for instant payment.' },
  { icon: Gift, title: 'Automated Customer Offers', desc: 'Delight your customers with personalized offers and loyalty rewards, sent automatically.' },
  { icon: ListChecks, title: 'Comprehensive Transaction History', desc: 'Track, filter, and export all your sales and purchase transactions for full transparency.' },
  { icon: Archive, title: 'Deadstock Management', desc: 'Identify slow-moving or obsolete items and take action to optimize your inventory turnover.' },
  { icon: Zap, title: 'Smart Business Logic', desc: 'Benefit from intelligent automations and insights tailored to your unique business needs.' },
  { icon: TrendingUp, title: 'Growth Analytics', desc: 'Visualize trends, monitor KPIs, and make data-driven decisions to accelerate your business growth.' },
  { icon: Users, title: 'Team Collaboration', desc: 'Assign roles, manage permissions, and collaborate seamlessly with your entire team.' },
>>>>>>> ce21ec2fdc56a92ea043161788371f59da47de6b
]

export default function FeaturesSection() {
  return (
<<<<<<< HEAD
    <section className="bg-gray-50 py-20 px-6">
      <div className="max-w-7xl mx-auto text-center">
        <h2 className="text-3xl font-extrabold text-gray-800 mb-4">
          Powerful Features for Modern Businesses
        </h2>
        <p className="text-gray-600 mb-12 text-lg max-w-2xl mx-auto">
          Our platform combines advanced technology and business intelligence to streamline your inventory operations, enhance customer experience, and drive sustainable growth.
        </p>
        <div className="grid gap-8 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
          {features.map(({ icon: Icon, title, desc }, idx) => (
            <div
              key={idx}
              className="group bg-white p-6 rounded-xl shadow-md hover:shadow-lg transition duration-300 border border-transparent hover:border-pink-500"
            >
              <div className="flex items-center justify-center w-12 h-12 mx-auto mb-4 bg-pink-100 text-pink-600 rounded-full">
                <Icon className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-semibold mb-2 text-gray-800 group-hover:text-pink-600 transition">
                {title}
              </h3>
              <p className="text-gray-600 text-sm">{desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
=======
   <section className="relative bg-[#F7FBFB] py-24 px-6 ">
  <div className="max-w-7xl mx-auto relative z-10 sm:px-8 lg:px-10        ">
    {/* Heading */}
    <h2
      className="text-4xl md:text-5xl font-extrabold text-center mb-6 
        bg-gradient-to-r from-[#390F59] via-[#460F58] to-[#7B53A6] bg-clip-text text-transparent"
      style={{ fontFamily: 'Roboto, sans-serif' }} // ✅ Roboto for headings
    >
      Powerful Features for Modern Businesses
    </h2>

    {/* Description */}
    <p
      className="text-gray-500 mb-16 text-lg max-w-3xl mx-auto text-center"
      style={{ fontFamily: 'Poppins, sans-serif' }} // ✅ Poppins for body text
    >
      Our platform blends technology and intelligence to streamline operations, enhance experiences, and fuel growth with confidence.
    </p>

    {/* Responsive Cards Grid */}
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      {features.map(({ icon: Icon, title, desc }, idx) => (
        <div
          key={idx}
          className="relative group bg-[#F7FBFB] rounded-2xl shadow-sm p-8 flex flex-col items-center text-center border  
            transition-all duration-300 hover:shadow-[0_8px_20px_rgba(123,83,166,0.25)] hover:border-[#7B53A6] hover:shadow-2xl hover:-translate-y-3 cursor-pointer min-h-[300px]"
        >
          {/* Gradient Glow */}
          <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-30 transition duration-300 
             blur-2xl pointer-events-none"></div>

          {/* Icon */}
          <div className="w-14 h-14 mb-4 flex items-center justify-center rounded-full bg-gradient-to-r from-[#390F59] via-[#460F58] to-[#7B53A6] text-white shadow-md transition-transform duration-300 hover:scale-110 hover:shadow-xl">
            <Icon className="w-7 h-7" />
          </div>

          {/* Title */}
          <h3
            className="text-xl font-semibold mb-3 text-[#390F59]"
            style={{ fontFamily: 'Roboto, sans-serif' }} // ✅ Roboto for card titles
          >
            {title}
          </h3>

          {/* Description */}
          <p style={{ fontFamily: 'Poppins, sans-serif' }} className="text-gray-500 text-sm leading-relaxed">
            {desc}
          </p>
        </div>
      ))}
    </div>
  </div>
</section>

  )
}


>>>>>>> ce21ec2fdc56a92ea043161788371f59da47de6b
