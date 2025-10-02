// src/components/CTASection.tsx
//  import { Sparkles, ArrowRight } from 'lucide-react'

// export default function CTASection() {
//   return (
//     <section className="relative bg-gradient-to-br from-pink-500 via-fuchsia-500 to-pink-600 py-24 px-4 text-white text-center overflow-hidden">
//       {/* Decorative SVG Blobs */}
//       <div className="absolute -top-24 -left-24 w-96 h-96 opacity-30 blur-2xl pointer-events-none select-none">
//         <svg viewBox="0 0 400 400" fill="none">
//           <circle cx="200" cy="200" r="200" fill="#fff" />
//         </svg>
//       </div>
//       <div className="absolute bottom-0 right-0 w-80 h-80 opacity-20 blur-2xl pointer-events-none select-none">
//         <svg viewBox="0 0 320 320" fill="none">
//           <circle cx="160" cy="160" r="160" fill="#fff" />
//         </svg>
//       </div>
//       {/* Content */}
//       <div className="relative max-w-3xl mx-auto z-10 flex flex-col items-center">
//         <span className="inline-flex items-center gap-2 bg-white/10 px-4 py-2 rounded-full text-base font-semibold mb-4 shadow-lg backdrop-blur">
//           <Sparkles className="w-5 h-5 text-yellow-300 animate-pulse" />
//           Premium Inventory Experience
//         </span>
//         <h2 className="text-4xl sm:text-5xl md:text-6xl font-extrabold mb-6 drop-shadow-xl leading-tight">
//           Supercharge Your Inventory <br className="hidden sm:block" />
//           with <span className="bg-white/20 px-2 rounded-lg">AI Insights</span>
//         </h2>
//         <p className="text-lg sm:text-2xl mb-10 font-medium drop-shadow-lg text-white/90">
//           Unlock real-time analytics, low-stock alerts, and seamless management.<br className="hidden sm:block" />
//           Start your free trial and join the next generation of inventory control.
//         </p>
//         <div className="flex flex-col sm:flex-row gap-4 justify-center">
//           <button className="inline-flex items-center gap-2 bg-white text-pink-600 px-8 py-3 rounded-full font-bold text-lg shadow-xl hover:bg-pink-50 hover:scale-105 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-pink-400">
//             Start Free Trial <ArrowRight className="w-5 h-5" />
//           </button>
//           <a
//             href="/contact"
//             className="inline-flex items-center gap-2 bg-pink-700/80 hover:bg-pink-800 text-white px-8 py-3 rounded-full font-bold text-lg shadow-xl transition-all duration-200 border border-white/20 focus:outline-none focus:ring-2 focus:ring-pink-400"
//           >
//             Contact Sales
//           </a>
//         </div>
//         <div className="mt-10 flex flex-wrap justify-center gap-6 text-white/80 text-sm">
//           <div className="flex items-center gap-2">
//             <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
//             99.99% Uptime
//           </div>
//           <div className="flex items-center gap-2">
//             <span className="w-2 h-2 rounded-full bg-blue-400" />
//             24/7 Support
//           </div>
//           <div className="flex items-center gap-2">
//             <span className="w-2 h-2 rounded-full bg-yellow-400" />
//             AI-powered Reports
//           </div>
//           <div className="flex items-center gap-2">
//             <span className="w-2 h-2 rounded-full bg-fuchsia-400" />
//             Secure & Fast
//           </div>
//         </div>
//       </div>
//     </section>
//   )
// }

// import { Sparkles, ArrowRight } from "lucide-react"

// export default function CTASection() {
//   return (
//     <section className="relative bg-white py-20 px-6 text-center overflow-hidden">
//       {/* Subtle background pattern/light gradient */}
//       <div className="absolute inset-0 bg-gradient-to-br from-indigo-50 via-white to-blue-50 opacity-80"></div>

//       <div className="relative max-w-4xl mx-auto z-10 flex flex-col items-center">
//         {/* Badge */}
//         <span className="inline-flex items-center gap-2 bg-indigo-100 text-indigo-700 px-4 py-2 rounded-full text-sm font-semibold mb-6 shadow-sm">
//           <Sparkles className="w-5 h-5 text-indigo-500" />
//           Premium Inventory Experience
//         </span>

//         {/* Heading */}
//         <h2 className="text-4xl sm:text-5xl md:text-6xl font-extrabold mb-6 leading-tight text-gray-800">
//           Supercharge Your Inventory <br className="hidden sm:block" />
//           with <span className="text-indigo-600">AI Insights</span>
//         </h2>

//         {/* Subtext */}
//         <p className="text-lg sm:text-xl md:text-2xl mb-10 font-medium text-gray-600 max-w-2xl">
//           Unlock real-time analytics, low-stock alerts, and seamless management. <br className="hidden sm:block" />
//           Start your free trial and join the next generation of inventory control.
//         </p>

//         {/* Buttons (light + indigo theme) */}
//         <div className="flex flex-col sm:flex-row gap-4 justify-center">
//           <button className="inline-flex items-center gap-2 bg-gradient-to-r from-[#3B3D72] to-[#6C63FF] text-white px-8 py-3 rounded-lg font-semibold text-lg shadow hover:bg-indigo-700 hover:scale-105 transition-all duration-200">
//             Start Free Trial <ArrowRight className="w-5 h-5" />
//           </button>
//           <a
//             href="/contact"
//             className="inline-flex items-center gap-2 bg-white border border-indigo-900 text-indigo-00 hover:text-indigo-400 px-8 py-3 rounded-lg font-semibold text-lg shadow hover:bg-indigo-50 transition-all duration-200"
//           >
//             Contact Sales
//           </a>
//         </div>

//         {/* Features */}
//         <div className="mt-10 flex flex-wrap justify-center gap-6 text-gray-700 text-sm sm:text-base">
//           <div className="flex items-center gap-2">
//             <span className="w-2 h-2 rounded-full bg-green-400" />
//             99.99% Uptime
//           </div>
//           <div className="flex items-center gap-2">
//             <span className="w-2 h-2 rounded-full bg-blue-400" />
//             24/7 Support
//           </div>
//           <div className="flex items-center gap-2">
//             <span className="w-2 h-2 rounded-full bg-yellow-400" />
//             AI-powered Reports
//           </div>
//           <div className="flex items-center gap-2">
//             <span className="w-2 h-2 rounded-full bg-indigo-400" />
//             Secure & Fast
//           </div>
//         </div>
//       </div>
//     </section>
//   )
// }



import { Sparkles, ArrowRight } from "lucide-react"

export default function CTASection() {
  return (
  <section
  className="relative bg-gray-900 py-20 px-6 text-center overflow-hidden footer-animate-bg bg-fixed font-poppins"
  style={{
    backgroundImage: "url('/images/cta-bg.jpg')",
    backgroundSize: "cover",
    backgroundPosition: "center",
  }}
>
  {/* Dark Overlay for readability */}
  <div className="absolute inset-0 bg-black/70 "></div>

  <div className="relative max-w-4xl mx-auto z-10 flex flex-col items-center text-white ">
    {/* Badge */}
    <span className="inline-flex items-center gap-2 bg-[#F7FBFB] px-4 py-2 rounded-full text-sm sm:text-base font-semibold mb-4 shadow-sm backdrop-blur-sm text-[#390F59] border border-[#744D81]">
      <Sparkles className="w-5 h-5 text-yellow-300" />
      Premium Inventory Experience
    </span>

    {/* Heading */}
    <h2 className="text-4xl sm:text-5xl md:text-6xl font-extrabold mb-6 leading-tight font-roboto">
      Supercharge Your Inventory <br className="hidden sm:block" />
      with <span className="text-[#7B53A6]">Billistry Insights</span>
    </h2>

    {/* Subtext */}
    <p className="text-lg sm:text-lg md:text-lg mb-10 font-medium text-gray-200 max-w-2xl">
      Unlock real-time analytics, low-stock alerts, and seamless management. <br className="hidden sm:block" />
      Start your free trial and join the next generation of inventory control.
    </p>

    {/* Buttons */}
    <div className="flex flex-col sm:flex-row gap-4 justify-center">
      <button className="inline-flex items-center gap-2  bg-gradient-to-r from-[#390F59] via-[#460F58] to-[#7B53A6] text-[#F7FBFB] px-4 sm:px-6 md:px-8 py-3 rounded-lg font-semibold text-base sm:text-lg shadow-md hover:scale-105 transition-all duration-200">
        Start Free Trial <ArrowRight className="w-5 h-5" />
      </button>
      <a
        href="/contact"
        className="inline-flex items-center justify-center gap-2 border-2 border-[#7B53A6] text-white px-4 sm:px-6 md:px-8 py-3 rounded-lg font-semibold text-base sm:text-lg hover:bg-gradient-to-r hover:from-[#390F59] hover:via-[#460F58] hover:to-[#7B53A6] hover:text-[#F7FBFB] transition-all duration-200 shadow-sm"
      >
        Contact Sales
      </a>
    </div>

    {/* Features */}
    <div className="mt-10 flex flex-wrap justify-center gap-6 text-gray-200 text-sm sm:text-base">
      <div className="flex items-center gap-2">
        <span className="w-2 h-2 rounded-full bg-green-400" />
        99.99% Uptime
      </div>
      <div className="flex items-center gap-2">
        <span className="w-2 h-2 rounded-full bg-blue-400" />
        24/7 Support
      </div>
      <div className="flex items-center gap-2">
        <span className="w-2 h-2 rounded-full bg-yellow-400" />
        AI-powered Reports
      </div>
      <div className="flex items-center gap-2">
        <span className="w-2 h-2 rounded-full bg-indigo-400" />
        Secure & Fast
      </div>
    </div>
  </div>
</section>


  )
}



