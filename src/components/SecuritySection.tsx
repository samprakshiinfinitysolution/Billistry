// import { ShieldCheck, Lock, UserCheck } from 'lucide-react'

// export default function SecuritySection() {
//   return (
//     <section className="relative bg-gradient-to-br from-white via-pink-50 to-fuchsia-50 py-20 px-6 overflow-hidden">
//       {/* Decorative Blobs */}
//       <div className="absolute -top-16 -left-16 w-60 h-60 opacity-20 blur-2xl pointer-events-none select-none z-0">
//         <svg viewBox="0 0 240 240" fill="none">
//           <circle cx="120" cy="120" r="120" fill="#f9a8d4" />
//         </svg>
//       </div>
//       <div className="absolute bottom-0 right-0 w-48 h-48 opacity-10 blur-2xl pointer-events-none select-none z-0">
//         <svg viewBox="0 0 192 192" fill="none">
//           <circle cx="96" cy="96" r="96" fill="#a21caf" />
//         </svg>
//       </div>
//       <div className="relative max-w-4xl mx-auto text-center z-10">
//         <ShieldCheck className="mx-auto w-14 h-14 text-pink-500 mb-4" />
//         <h2 className="text-3xl sm:text-4xl font-extrabold text-pink-600 mb-4 drop-shadow">
//           Your Data, Fully Secured
//         </h2>
//         <p className="text-gray-600 mb-10 text-lg">
//           We use bank-level encryption, role-based access controls, and regular audits to ensure your data is always protected.
//         </p>
//         <div className="flex flex-wrap justify-center gap-6 mb-8">
//           <span className="inline-flex items-center gap-2 bg-green-100 text-green-800 px-5 py-2 rounded-full text-base font-semibold shadow">
//             <Lock className="w-5 h-5" /> SSL 256-bit Encryption
//           </span>
//           <span className="inline-flex items-center gap-2 bg-blue-100 text-blue-800 px-5 py-2 rounded-full text-base font-semibold shadow">
//             <UserCheck className="w-5 h-5" /> OAuth 2.0 Auth
//           </span>
//           <span className="inline-flex items-center gap-2 bg-yellow-100 text-yellow-800 px-5 py-2 rounded-full text-base font-semibold shadow">
//             GDPR Compliant
//           </span>
//         </div>
//         <div className="text-gray-500 text-sm">
//           Regular security audits &bull; Data encrypted at rest and in transit &bull; 24/7 monitoring
//         </div>
//       </div>
//     </section>
//   )
// }


import { ShieldCheck, Lock, UserCheck } from "lucide-react";

export default function SecuritySection() {
  const features = [
    { icon: <Lock className="w-6 h-6 text-white" />, title: "SSL 256-bit Encryption", color: "bg-[#390F59]" },
    { icon: <UserCheck className="w-6 h-6 text-white" />, title: "OAuth 2.0 Auth", color: "bg-[#390F59]" },
    { icon: <ShieldCheck className="w-6 h-6 text-white" />, title: "GDPR Compliant", color: "bg-[#390F59]" },
  ];

  return (
    <section className="relative bg-[#F7FBFB] py-24 px-6 sm:px-10 font-poppins overflow-hidden">
  {/* Background Shapes */}
  <div className="absolute -top-20 -left-20 w-72 h-72 bg-[#390F59]/20 rounded-full opacity-30 blur-3xl pointer-events-none" />
  <div className="absolute -bottom-16 -right-16 w-64 h-64 bg-[#7B53A6]/20 rounded-full opacity-20 blur-3xl pointer-events-none" />

  <div className="relative max-w-7xl mx-auto flex flex-col lg:flex-row items-center justify-center gap-12">
    
    {/* Left: Main Heading */}
    <div className="text-center lg:text-left lg:w-1/2 flex flex-col items-center lg:items-start">
      <ShieldCheck className="w-16 h-16 text-[#7B53A6] mb-6" />
      <h2 className="text-3xl sm:text-4xl font-extrabold mb-4 bg-gradient-to-r from-[#390F59] via-[#5C2E91] to-[#7B53A6] bg-clip-text text-transparent drop-shadow font-roboto">
        Your Data, Fully Secured
      </h2>
      <p className="text-gray-700 text-base sm:text-lg mb-8 max-w-md">
        Protect your sensitive information with state-of-the-art encryption, multi-layer
        security protocols, and 24/7 monitoring.  
        Our platform ensures your data is always safe and compliant.
      </p>
      <a
        href="/AboutUs"
        className="inline-block px-8 py-3 rounded-full bg-gradient-to-r from-[#390F59] via-[#5C2E91] to-[#7B53A6] text-white font-semibold shadow-md hover:opacity-90 transition-all duration-300"
      >
        Learn More
      </a>
    </div>

    {/* Right: Feature Cards */}
    <div className="grid grid-cols-1 sm:grid-cols-1 gap-6 lg:w-1/3">
      {features.map((f, i) => (
        <div
          key={i}
          className="flex items-center gap-4 p-5 rounded-2xl shadow-md border border-transparent hover:shadow-lg hover:border-[#7B53A6] hover:-translate-y-1 transition-all duration-300 bg-white"
        >
          <div className={`p-3 rounded-full ${f.color} flex items-center justify-center`}>
            {f.icon}
          </div>
          <h3 className="text-[#1E1E2F] font-semibold font-roboto">{f.title}</h3>
        </div>
      ))}
    </div>

  </div>
</section>

  );
}

