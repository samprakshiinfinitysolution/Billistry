<<<<<<< HEAD
// src/components/StatsSection.tsx
'use client'

=======
// // src/components/StatsSection.tsx
// 'use client'

// import { useEffect, useRef } from 'react'

// const stats = [
//   { label: 'Active Warehouses', value: 120 },
//   { label: 'Products Tracked', value: 45000 },
//   { label: 'Integrations', value: 20 },
//   { label: 'System Uptime', value: 99.98, suffix: '%' },
// ]

// function useCountUp(ref: React.RefObject<HTMLSpanElement>, end: number, duration = 1200, suffix = '') {
//   useEffect(() => {
//     if (!ref.current) return
//     let start = 0
//     const increment = end / (duration / 16)
//     let current = start
//     const animate = () => {
//       current += increment
//       if ((increment > 0 && current >= end) || (increment < 0 && current <= end)) {
//         ref.current!.textContent = end.toLocaleString() + suffix
//         return
//       }
//       ref.current!.textContent = Math.floor(current).toLocaleString() + suffix
//       requestAnimationFrame(animate)
//     }
//     animate()
//   }, [end, ref, duration, suffix])
// }

// export default function StatsSection() {
//   const refs = [
//     useRef<HTMLSpanElement>(null),
//     useRef<HTMLSpanElement>(null),
//     useRef<HTMLSpanElement>(null),
//     useRef<HTMLSpanElement>(null),
//   ]

//   stats.forEach((stat, i) => {
//     useCountUp(refs[i], stat.value, 1200, stat.suffix || (stat.label === 'System Uptime' ? '%' : '+'))
//   })

//   return (
//     <section className="relative bg-gradient-to-br from-pink-50 via-white to-fuchsia-50 py-24 px-4 overflow-hidden">
//       {/* Decorative Blobs */}
//       <div className="absolute -top-24 -left-24 w-72 h-72 opacity-20 blur-2xl pointer-events-none select-none z-0">
//         <svg viewBox="0 0 400 400" fill="none">
//           <circle cx="200" cy="200" r="200" fill="#f9a8d4" />
//         </svg>
//       </div>
//       <div className="absolute bottom-0 right-0 w-60 h-60 opacity-10 blur-2xl pointer-events-none select-none z-0">
//         <svg viewBox="0 0 320 320" fill="none">
//           <circle cx="160" cy="160" r="160" fill="#a21caf" />
//         </svg>
//       </div>
//       <div className="relative max-w-6xl mx-auto text-center z-10">
//         <h2 className="text-3xl sm:text-4xl font-extrabold text-pink-600 mb-12 drop-shadow">
//           We Power Trusted Operations
//         </h2>
//         <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8">
//           {stats.map((stat, idx) => (
//             <div
//               key={idx}
//               className="bg-white/80 backdrop-blur rounded-3xl shadow-xl p-10 flex flex-col items-center border border-pink-100 hover:shadow-2xl transition group"
//             >
//               <span
//                 ref={refs[idx]}
//                 className="text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-pink-500 to-fuchsia-500 mb-3 block group-hover:scale-110 transition-transform"
//               >
//                 {stat.value.toLocaleString()}
//                 {stat.suffix || (stat.label === 'System Uptime' ? '%' : '+')}
//               </span>
//               <p className="text-gray-700 text-lg font-semibold">{stat.label}</p>
//             </div>
//           ))}
//         </div>
//       </div>
//     </section>
//   )
// }




'use client'
>>>>>>> ce21ec2fdc56a92ea043161788371f59da47de6b
import { useEffect, useRef } from 'react'

const stats = [
  { label: 'Active Warehouses', value: 120 },
  { label: 'Products Tracked', value: 45000 },
  { label: 'Integrations', value: 20 },
  { label: 'System Uptime', value: 99.98, suffix: '%' },
]

<<<<<<< HEAD
function useCountUp(ref: React.RefObject<HTMLSpanElement>, end: number, duration = 1200, suffix = '') {
=======
// Count-up hook
function useCountUp(
  ref: React.RefObject<HTMLSpanElement>,
  end: number,
  duration = 1200,
  suffix = ''
) {
>>>>>>> ce21ec2fdc56a92ea043161788371f59da47de6b
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
<<<<<<< HEAD
  const refs = [
    useRef<HTMLSpanElement>(null),
    useRef<HTMLSpanElement>(null),
    useRef<HTMLSpanElement>(null),
    useRef<HTMLSpanElement>(null),
  ]

=======
  const refs = stats.map(() => useRef<HTMLSpanElement>(null))
>>>>>>> ce21ec2fdc56a92ea043161788371f59da47de6b
  stats.forEach((stat, i) => {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    useCountUp(refs[i], stat.value, 1200, stat.suffix || (stat.label === 'System Uptime' ? '%' : '+'))
  })

  return (
<<<<<<< HEAD
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
=======
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
>>>>>>> ce21ec2fdc56a92ea043161788371f59da47de6b
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
<<<<<<< HEAD
=======






>>>>>>> ce21ec2fdc56a92ea043161788371f59da47de6b
