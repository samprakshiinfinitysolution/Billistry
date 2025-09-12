import { CheckCircle2, Star } from 'lucide-react'

export default function PlansSection() {
  const plans = [
    {
      name: "Starter",
      price: "Free",
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
      price: "$49/mo",
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
  ]
  return (
    <section className="bg-gradient-to-br from-pink-50 via-white to-fuchsia-50 py-20 px-4">
      <div className="max-w-6xl mx-auto text-center">
        <h2 className="text-4xl font-extrabold text-pink-600 mb-4 drop-shadow">
          Choose Your Plan
        </h2>
        <p className="text-gray-600 mb-12 text-lg">
          Flexible pricing for every stage of your business.
        </p>
        <div className="grid md:grid-cols-2 gap-10">
          {plans.map((p, i) => (
            <div
              key={i}
              className={`relative bg-white p-8 rounded-2xl shadow-xl border-2 transition-all duration-200 ${
                p.highlight
                  ? 'border-pink-500 scale-105 z-10'
                  : 'border-transparent hover:border-pink-300'
              }`}
            >
              {p.highlight && (
                <span className="absolute -top-4 right-6 bg-pink-600 text-white px-4 py-1 rounded-full text-xs font-bold flex items-center gap-1 shadow-lg">
                  <Star className="w-4 h-4 fill-yellow-300 text-yellow-300" /> Most Popular
                </span>
              )}
              <h3 className="text-2xl font-bold text-pink-600 mb-2">{p.name}</h3>
              <p className="text-3xl font-extrabold mb-2">{p.price}</p>
              <p className="text-gray-500 mb-6">{p.description}</p>
              <ul className="text-gray-700 space-y-3 mb-8 text-left">
                {p.features.map((f, j) => (
                  <li key={j} className="flex items-center gap-2">
                    <CheckCircle2 className="w-5 h-5 text-pink-500" /> {f}
                  </li>
                ))}
              </ul>
              <button
                className={`w-full py-3 rounded-full font-bold text-lg transition-all duration-200 shadow ${
                  p.highlight
                    ? 'bg-gradient-to-r from-pink-500 to-fuchsia-500 text-white hover:from-pink-600 hover:to-fuchsia-600'
                    : 'bg-pink-100 text-pink-700 hover:bg-pink-200'
                }`}
              >
                {p.highlight ? 'Upgrade Now' : 'Get Started'}
              </button>
            </div>
          ))}
        </div>
        <div className="mt-12 text-sm text-gray-500">
          Need a custom plan? <a href="/contact" className="text-pink-600 underline hover:text-fuchsia-600">Contact us</a>
        </div>
      </div>
    </section>
  )
}
