// src/components/FeaturesSection.tsx
'use client'

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
]

export default function FeaturesSection() {
  return (
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
