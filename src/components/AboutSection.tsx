// // src/components/AboutSection.tsx
// import Image from 'next/image'

// export default function AboutSection() {
//   return (
//     <section className="bg-gradient-to-br from-pink-50 via-white to-fuchsia-50 py-20 px-4">
//       <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-12 items-center">
//         <div className="order-2 md:order-1">
//           <h2 className="text-4xl sm:text-5xl font-extrabold text-pink-600 mb-6 leading-tight drop-shadow">
//             About <span className="bg-pink-100 px-2 rounded-lg">“Used Our Mind”</span>
//           </h2>
//           <p className="text-gray-700 text-lg mb-5">
//             Our mission is to empower businesses with <span className="font-semibold text-pink-500">smart inventory tools</span> built for speed and simplicity.
//           </p>
//           <ul className="mb-6 space-y-3">
//             <li className="flex items-center gap-3">
//               <span className="w-3 h-3 rounded-full bg-pink-400 inline-block" />
//               Real-time analytics & low-stock alerts
//             </li>
//             <li className="flex items-center gap-3">
//               <span className="w-3 h-3 rounded-full bg-fuchsia-400 inline-block" />
//               Seamless, intuitive management for teams
//             </li>
//             <li className="flex items-center gap-3">
//               <span className="w-3 h-3 rounded-full bg-yellow-400 inline-block" />
//               Secure, cloud-based, and always up-to-date
//             </li>
//           </ul>
//           <p className="text-gray-600 text-base">
//             We help small and medium businesses scale efficiently with <span className="font-semibold text-fuchsia-500">real-time control</span> and actionable insights.
//           </p>
//         </div>
//         <div className="order-1 md:order-2 flex justify-center">
//           <div className="relative">
//             <div className="absolute -top-8 -left-8 w-32 h-32 bg-pink-200 rounded-full blur-2xl opacity-40 z-0" />
//             <Image
//               src="/images/about-illustration.svg"
//               alt="Inventory Illustration"
//               width={500}
//               height={350}
//               className="mx-auto relative z-10 drop-shadow-2xl"
//               priority
//             />
//             <div className="absolute bottom-0 right-0 w-20 h-20 bg-fuchsia-200 rounded-full blur-2xl opacity-40 z-0" />
//           </div>
//         </div>
//       </div>
//     </section>
//   )
// }




// src/components/AboutSection.tsx
export default function AboutSection() {
  return (
    <section className="relative bg-[#F7FBFB] py-16 px-4 sm:px-6 lg:px-12" style={{ fontFamily: "Poppins, sans-serif" }}>
      {/* Background Accent */}
      <div className="absolute inset-0 -z-10">
        <div className="bg-gradient-to-br from-[#F7FBFB] via-[#F0F0F7] to-[#EDE7F3] w-full h-full" />
      </div>

      <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-12 items-center sm:px-8 lg:px-10">
        {/* Left: Content */}
        <div>
          <h2
            className="text-3xl sm:text-4xl md:text-5xl font-extrabold mb-6 
            bg-gradient-to-r from-[#390F59] via-[#460F58] to-[#7B53A6] bg-clip-text text-transparent"
            style={{ fontFamily: "Roboto, sans-serif" }} // ✅ Roboto for heading
          >
            About <br/>
            <span className="px-2 rounded-lg text-[#390F59]">“Billistry”</span>
          </h2>

          <p className="text-gray-500 text-base sm:text-lg mb-5">
            Our mission is to empower businesses with a
             <span className="font-semibold text-[#7B53A6]"> smart inventory tools<br/>
              </span> built for speed and simplicity.
          </p>

          <ul className="mb-6 space-y-3 text-gray-600">
            <li className="flex items-center gap-3">
              <span className="w-3 h-3 rounded-full bg-[#7B53A6] inline-block" />
              Real-time analytics & low-stock alerts
            </li>
            <li className="flex items-center gap-3">
              <span className="w-3 h-3 rounded-full bg-[#460F58] inline-block" />
              Seamless, intuitive management for teams
            </li>
            <li className="flex items-center gap-3">
              <span className="w-3 h-3 rounded-full bg-[#7B53A6]/80 inline-block" />
              Secure, cloud-based, and always up-to-date
            </li>
          </ul>

          <p className="text-gray-500 text-sm sm:text-base">
            We help small and medium businesses scale efficiently with <span className="font-semibold text-[#390F59]">real-time control</span> and actionable insights.
          </p>
        </div>

        {/* Right: Video */}
        <div className="flex justify-center sm:justify-end">
          <div className="relative w-full max-w-md sm:max-w-lg lg:max-w-xl rounded-3xl overflow-hidden shadow-lg transition-transform duration-300 hover:scale-105 hover:shadow-2xl">
            {/* Blur Background Accents */}
            <div className="absolute -top-8 -left-8 w-24 sm:w-32 h-24 sm:h-32 bg-[#744D81]/30 rounded-full blur-2xl opacity-40 z-0" />
            <div className="absolute bottom-0 right-0 w-16 sm:w-20 h-16 sm:h-20 bg-[#7B53A6]/30 rounded-full blur-2xl opacity-40 z-0" />

            {/* Video */}
            <video
              src="/videos/Billistry.mp4"
              autoPlay
              muted
              loop
              playsInline
              className="w-full h-full object-cover relative z-10 rounded-3xl"
            />
          </div>
        </div>
      </div>
    </section>
  )
}
