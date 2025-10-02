import { ChevronDown, Info } from 'lucide-react'
import { useState } from 'react'

export default function FAQSection() {
  const faqs = [
    { q: "Is there a free version?", a: "Yes! Our Starter plan is free forever." },
    { q: "Can I cancel anytime?", a: "Absolutely. No long-term commitments." },
    { q: "Do you offer support?", a: "Yes, all plans come with support, and Pro includes priority access." },
    { q: "Is my data secure?", a: "Yes, we use industry-standard encryption and cloud security best practices." },
    { q: "Can I upgrade or downgrade later?", a: "You can change your plan at any time from your dashboard." },
  ]

  const [open, setOpen] = useState<number | null>(null)
  const [formData, setFormData] = useState({ name: '', email: '', question: '' })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    alert(`Question submitted!\nName: ${formData.name}\nEmail: ${formData.email}\nQuestion: ${formData.question}`)
    setFormData({ name: '', email: '', question: '' })
  }

  return (
    <section className="bg-[#F7FBFB] py-20 px-6 font-poppins">
  <div className="max-w-7xl mx-auto flex flex-col lg:flex-row items-center justify-center gap-12 sm:px-8 lg:px-10">
    
    {/* Left: FAQ Form */}
    <div className="lg:w-1/3 w-full bg-[#F7FBFB] rounded-3xl p-10 shadow-md border border-[#E5E7EB] hover:border-[#7B53A6] transition-all">
      <h2 className="text-4xl font-extrabold text-[#460F58] mb-6 font-roboto">Ask a Question</h2>
      <form onSubmit={handleSubmit} className="space-y-5">
        <input
          type="text"
          name="name"
          placeholder="Your Name"
          value={formData.name}
          onChange={handleChange}
          className="w-full px-5 py-3 rounded-xl border border-[#E5E7EB] focus:ring-2 focus:ring-[#7B53A6] focus:outline-none transition text-gray-600"
          required
        />
        <input
          type="email"
          name="email"
          placeholder="Your Email"
          value={formData.email}
          onChange={handleChange}
          className="w-full px-5 py-3 rounded-xl border border-[#E5E7EB] focus:ring-2 focus:ring-[#7B53A6] focus:outline-none transition text-gray-600"
          required
        />
        <textarea
          name="question"
          placeholder="Your Question"
          value={formData.question}
          onChange={handleChange}
          rows={4}
          className="w-full px-5 py-3 rounded-xl border border-[#E5E7EB] focus:ring-2 focus:ring-[#7B53A6] focus:outline-none resize-none transition text-gray-600"
          required
        />
        <button
          type="submit"
          className="w-full py-3 rounded-full bg-gradient-to-r from-[#390F59] via-[#460F58] to-[#7B53A6] text-white font-semibold shadow-md hover:bg-[#460F58] transition"
        >
          Submit Question
        </button> 
      </form>
    </div>

    {/* Right: FAQ List */}
    <div className="lg:w-1/2 w-full space-y-6 max-h-[600px] overflow-y-auto no-scrollbar">
      {faqs.map((f, i) => (
        <div
          key={i}
          className={`relative bg-[#F7FBFB] mt-2 rounded-3xl shadow-md p-4 cursor-pointer flex flex-col sm:flex-row items-center sm:items-start gap-4 sm:gap-5 border border-[#E5E7EB] hover:shadow-xl hover:border-[#7B53A6] hover:-translate-y-1 transition-all duration-300`}
          onClick={() => setOpen(open === i ? null : i)}
        >
          {/* Icon */}
          <div className="flex-shrink-0 w-12 h-12 sm:w-9 sm:h-9 bg-[#F7FBFB] rounded-full flex items-center justify-center shadow-sm">
            <Info className="w-6 h-6 text-[#7B53A6]" />
          </div>

          {/* Content */}
          <div className="flex-1 w-full">
            <div className="flex items-center mt-2 justify-between w-full">
              <h3 className="text-lg sm:text-base font-semibold text-gray-900 hover:text-[#7B53A6] transition-colors duration-300 font-roboto">
                {f.q}
              </h3>
              <ChevronDown
                className={`w-6 h-6 text-[#7B53A6] transition-transform duration-300 ${open === i ? 'rotate-180' : ''}`}
              />
            </div>
            <p
              className={`text-gray-500 mt-2 text-sm overflow-hidden transition-all duration-500 ${open === i ? 'max-h-40' : 'max-h-0'}`}
            >
              {f.a}
            </p>
          </div>
        </div>
      ))}
    </div>

  </div>
</section>

  )
}