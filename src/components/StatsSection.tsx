// src/components/StatsSection.tsx
'use client'

import { useEffect, useRef } from 'react'

const stats = [
  { label: 'Active Warehouses', value: 120 },
  { label: 'Products Tracked', value: 45000 },
  { label: 'Integrations', value: 20 },
  { label: 'System Uptime', value: 99.98, suffix: '%' },
]

function useCountUp(ref: React.RefObject<HTMLSpanElement>, end: number, duration = 1200, suffix = '') {
  useEffect(() => {
    if (!ref.current) return
<<<<<<< HEAD
    const start = 0
=======
    let start = 0
>>>>>>> dcc59acd5f59524ac9f5cc4448fa122e42a677b1
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
  ]

  stats.forEach((stat, i) => {
<<<<<<< HEAD
    // eslint-disable-next-line react-hooks/rules-of-hooks
=======
>>>>>>> dcc59acd5f59524ac9f5cc4448fa122e42a677b1
    useCountUp(refs[i], stat.value, 1200, stat.suffix || (stat.label === 'System Uptime' ? '%' : '+'))
  })

  return (
    <section className="relative bg-gradient-to-br from-pink-50 via-white to-fuchsia-50 py-24 px-4 overflow-hidden">
      {/* Decorative Blobs */}
      <div className="absolute -top-24 -left-24 w-72 h-72 opacity-20 blur-2xl pointer-events-none select-none z-0">
        <svg viewBox="0 0 400 400" fill="none">
          <circle cx="200" cy="200" r="200" fill="#f9a8d4" />
        </svg>
      </div>
      <div className="absolute bottom-0 right-0 w-60 h-60 opacity-10 blur-2xl pointer-events-none select-none z-0">
        <svg viewBox="0 0 320 320" fill="none">
          <circle cx="160" cy="160" r="160" fill="#a21caf" />
        </svg>
      </div>
      <div className="relative max-w-6xl mx-auto text-center z-10">
        <h2 className="text-3xl sm:text-4xl font-extrabold text-pink-600 mb-12 drop-shadow">
          We Power Trusted Operations
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8">
          {stats.map((stat, idx) => (
            <div
              key={idx}
              className="bg-white/80 backdrop-blur rounded-3xl shadow-xl p-10 flex flex-col items-center border border-pink-100 hover:shadow-2xl transition group"
            >
              <span
                ref={refs[idx]}
                className="text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-pink-500 to-fuchsia-500 mb-3 block group-hover:scale-110 transition-transform"
              >
                {stat.value.toLocaleString()}
                {stat.suffix || (stat.label === 'System Uptime' ? '%' : '+')}
              </span>
              <p className="text-gray-700 text-lg font-semibold">{stat.label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
