// src/components/HowItWorksSection.tsx

import {
  PackageSearch,
  FilePlus,
  BarChart3,
  BellRing,
  Users,
  Cloud,
  ShieldCheck,
  Zap,
} from 'lucide-react'

export default function HowItWorksSection() {
  const steps = [
    {
      icon: <FilePlus className="w-8 h-8 text-pink-600" />,
      title: 'Add Your Inventory',
      description:
        'Easily upload or manually add products to your dashboard in minutes.',
    },
    {
      icon: <PackageSearch className="w-8 h-8 text-pink-600" />,
      title: 'Track in Real-Time',
      description:
        'Monitor product movement, current stock, and updates in real-time.',
    },
    {
      icon: <BellRing className="w-8 h-8 text-pink-600" />,
      title: 'Get Instant Alerts',
      description:
        'Receive smart notifications for low stock, expiry, or order delays.',
    },
    {
      icon: <BarChart3 className="w-8 h-8 text-pink-600" />,
      title: 'Analyze & Optimize',
      description:
        'Use analytics to understand trends, reduce waste, and grow smarter.',
    },
    {
      icon: <Users className="w-8 h-8 text-pink-600" />,
      title: 'Collaborate with Teams',
      description:
        'Invite team members, assign roles, and work together seamlessly.',
    },
    {
      icon: <Cloud className="w-8 h-8 text-pink-600" />,
      title: 'Cloud Access Anywhere',
      description:
        'Access your inventory securely from any device, anytime, anywhere.',
    },
    {
      icon: <ShieldCheck className="w-8 h-8 text-pink-600" />,
      title: 'Enterprise-Grade Security',
      description:
        'Your data is protected with advanced encryption and security protocols.',
    },
    {
      icon: <Zap className="w-8 h-8 text-pink-600" />,
      title: 'Automate Workflows',
      description:
        'Set up rules to automate reordering, reporting, and routine tasks.',
    },
  ]

  return (
    <section className="bg-gray-100 py-20 px-6">
      <div className="max-w-6xl mx-auto text-center">
        <h2 className="text-3xl font-bold text-gray-800 mb-12">How It Works</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10 text-left">
          {steps.map((step, idx) => (
            <div
              key={idx}
              className="bg-white p-6 rounded-xl shadow hover:shadow-md transition"
            >
              <div className="mb-4">{step.icon}</div>
              <h3 className="text-lg font-semibold text-gray-800 mb-2">
                {step.title}
              </h3>
              <p className="text-sm text-gray-600">{step.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
