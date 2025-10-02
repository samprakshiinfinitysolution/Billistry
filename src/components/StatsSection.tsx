'use client'
import { useEffect, useRef } from 'react'

const stats = [
  { label: 'Active Warehouses', value: 120 },
  { label: 'Products Tracked', value: 45000 },
  { label: 'Integrations', value: 20 },
  { label: 'System Uptime', value: 99.98, suffix: '%' },
]

// Count-up hook
function useCountUp(
  ref: React.RefObject<HTMLSpanElement>,
  end: number,
  duration = 1200,
  suffix = ''
) {
  useEffect(() => {
    if (!ref.current) return
    const start = 0
    const increment = end / (duration / 16)
    let current = start
    const animate = () => {
      current += increment
      if ((increment > 0 && current >= end) || (increment < 0 && current <= end)) {
        ref.current!.textContent = end.toLocaleString() + suffix
        return
      }
      ref.current!.textContent = Math.floor(current).toLocaleString() + suffix
      requestAnimationFrame(animate)
    }
    animate()
  }, [end, ref, duration, suffix])
}

export default function StatsSection() {
  const refs = [
    useRef<HTMLSpanElement>(null),
    useRef<HTMLSpanElement>(null),
    useRef<HTMLSpanElement>(null),
    useRef<HTMLSpanElement>(null),
  ];

  stats.forEach((stat, i) => {
    useCountUp(refs[i], stat.value, 1200, stat.suffix || (stat.label === 'System Uptime' ? '%' : '+'));
  });

  return (
    <section className="relative bg-[#F7FBFB] py-24 px-4 " style={{ fontFamily: 'Roboto, sans-serif' }}>
      <div className="relative max-w-6xl mx-auto text-center sm:px-8 lg:px-10">
        {/* Heading with gradient */}
        <h2 className="text-3xl sm:text-4xl font-extrabold mb-12 bg-gradient-to-r from-[#390F59] via-[#460F58] to-[#7B53A6] bg-clip-text text-transparent"
         >
          We Power Trusted Operations
        </h2>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {stats.map((stat, idx) => (
            <div
              key={idx}
              className="bg-[#F7FBFB] rounded-2xl shadow-sm p-8 flex flex-col items-center justify-center text-center border border-[#744D81] 
              hover:border-[#7B53A6] hover:shadow-[0_8px_20px_rgba(123,83,166,0.25)]  transition duration-300 min-h-[200px]"
            >
              {/* Number */}
              <span
                ref={refs[idx]}
                className="text-4xl sm:text-5xl font-extrabold text-[#390F59] mb-3"
              >
                {stat.value.toLocaleString()}
                {stat.suffix || (stat.label === "System Uptime" ? "%" : "+")}
              </span>

              {/* Label */}
              <p className="text-gray-500 text-lg font-medium">{stat.label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}