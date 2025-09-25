// src/components/AboutSection.tsx
import Image from 'next/image'

export default function AboutSection() {
  return (
    <section className="bg-gradient-to-br from-pink-50 via-white to-fuchsia-50 py-20 px-4">
      <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-12 items-center">
        <div className="order-2 md:order-1">
          <h2 className="text-4xl sm:text-5xl font-extrabold text-pink-600 mb-6 leading-tight drop-shadow">
            About <span className="bg-pink-100 px-2 rounded-lg">“Used Our Mind”</span>
          </h2>
          <p className="text-gray-700 text-lg mb-5">
            Our mission is to empower businesses with <span className="font-semibold text-pink-500">smart inventory tools</span> built for speed and simplicity.
          </p>
          <ul className="mb-6 space-y-3">
            <li className="flex items-center gap-3">
              <span className="w-3 h-3 rounded-full bg-pink-400 inline-block" />
              Real-time analytics & low-stock alerts
            </li>
            <li className="flex items-center gap-3">
              <span className="w-3 h-3 rounded-full bg-fuchsia-400 inline-block" />
              Seamless, intuitive management for teams
            </li>
            <li className="flex items-center gap-3">
              <span className="w-3 h-3 rounded-full bg-yellow-400 inline-block" />
              Secure, cloud-based, and always up-to-date
            </li>
          </ul>
          <p className="text-gray-600 text-base">
            We help small and medium businesses scale efficiently with <span className="font-semibold text-fuchsia-500">real-time control</span> and actionable insights.
          </p>
        </div>
        <div className="order-1 md:order-2 flex justify-center">
          <div className="relative">
            <div className="absolute -top-8 -left-8 w-32 h-32 bg-pink-200 rounded-full blur-2xl opacity-40 z-0" />
            <Image
              src="/images/about-illustration.svg"
              alt="Inventory Illustration"
              width={500}
              height={350}
              className="mx-auto relative z-10 drop-shadow-2xl"
              priority
            />
            <div className="absolute bottom-0 right-0 w-20 h-20 bg-fuchsia-200 rounded-full blur-2xl opacity-40 z-0" />
          </div>
        </div>
      </div>
    </section>
  )
}
