// src/components/TestimonialSection.tsx
export default function TestimonialSection() {
  const testimonials = [
    {
      name: 'Rohit Sharma',
      role: 'Inventory Manager, AutoParts Inc.',
      text: 'Used Our Mind has completely transformed how we track and manage stock. Real-time updates and smart alerts keep us ahead.',
      image: '/images/user.png',
    },
    {
      name: 'Sneha Verma',
      role: 'Co-founder, StyleKart',
      text: 'This system is intuitive and powerful. It helps us manage thousands of SKUs effortlessly. Highly recommended!',
      image: '/images/user.png',
    },
    {
      name: 'Aditya Mehra',
      role: 'Ops Lead, QuickMart',
      text: 'We saved hours every week thanks to automated reports and low stock notifications. Game changer!',
      image: '/images/user.png',
    },
  ]

  return (
    <section className="bg-white py-20 px-6">
      <div className="max-w-6xl mx-auto text-center">
        <h2 className="text-3xl font-bold text-gray-800 mb-12">What Our Customers Say</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {testimonials.map((t, idx) => (
            <div
              key={idx}
              className="bg-gray-50 p-6 rounded-2xl shadow hover:shadow-lg transition"
            >
              <div className="flex items-center gap-4 mb-4">
                <img
                  src={t.image}
                  alt={t.name}
                  className="w-14 h-14 rounded-full object-cover border-2 border-pink-500"
                />
                <div className="text-left">
                  <h4 className="text-lg font-semibold text-gray-800">{t.name}</h4>
                  <p className="text-sm text-gray-500">{t.role}</p>
                </div>
              </div>
              <p className="text-gray-600 text-left">“{t.text}”</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
