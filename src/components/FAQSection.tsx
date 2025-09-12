import { ChevronDown } from 'lucide-react'
import { useState } from 'react'

// src/components/FAQSection.tsx
export default function FAQSection() {
  const faqs = [
    { q: "Is there a free version?", a: "Yes! Our Starter plan is free forever." },
    { q: "Can I cancel anytime?", a: "Absolutely. No long-term commitments." },
    { q: "Do you offer support?", a: "Yes, all plans come with support, and Pro includes priority access." },
    { q: "Is my data secure?", a: "Yes, we use industry-standard encryption and cloud security best practices." },
    { q: "Can I upgrade or downgrade later?", a: "You can change your plan at any time from your dashboard." },
  ]
  const [open, setOpen] = useState<number | null>(null)

  return (
    <section className="bg-gradient-to-br from-pink-50 via-white to-fuchsia-50 py-20 px-6">
      <div className="max-w-4xl mx-auto">
        <h2 className="text-3xl sm:text-4xl font-extrabold text-pink-600 text-center mb-10 drop-shadow">
          Frequently Asked Questions
        </h2>
        <div className="space-y-4">
          {faqs.map((f, i) => (
            <div
              key={i}
              className={`rounded-xl shadow-md bg-white border border-pink-100 transition-all duration-200 ${
                open === i ? 'ring-2 ring-pink-300' : ''
              }`}
            >
              <button
                className="w-full flex items-center justify-between px-6 py-5 text-left focus:outline-none"
                onClick={() => setOpen(open === i ? null : i)}
                aria-expanded={open === i}
                aria-controls={`faq-${i}`}
              >
                <span className="font-semibold text-pink-600 text-lg">{f.q}</span>
                <ChevronDown
                  className={`w-6 h-6 text-pink-400 transition-transform duration-200 ${
                    open === i ? 'rotate-180' : ''
                  }`}
                />
              </button>
              <div
                id={`faq-${i}`}
                className={`px-6 pb-5 text-gray-700 text-base transition-all duration-200 ${
                  open === i ? 'block' : 'hidden'
                }`}
              >
                {f.a}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
