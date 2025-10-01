<<<<<<< HEAD
import Image from 'next/image'
import { Sparkles, ArrowRight } from 'lucide-react'

export default function HeroSection() {
  return (
    <section className="relative bg-gradient-to-br from-pink-50 via-white to-fuchsia-50 py-20 sm:py-28 px-4 overflow-hidden">
      {/* Decorative Blobs */}
      <div className="absolute -top-32 -left-32 w-96 h-96 opacity-30 blur-2xl pointer-events-none select-none z-0">
        <svg viewBox="0 0 400 400" fill="none">
          <circle cx="200" cy="200" r="200" fill="#f9a8d4" />
        </svg>
      </div>
      <div className="absolute bottom-0 right-0 w-80 h-80 opacity-20 blur-2xl pointer-events-none select-none z-0">
        <svg viewBox="0 0 320 320" fill="none">
          <circle cx="160" cy="160" r="160" fill="#a21caf" />
        </svg>
      </div>
      {/* Content */}
      <div className="relative max-w-6xl mx-auto flex flex-col md:flex-row items-center gap-12 z-10">
        {/* Left: Text */}
        <div className="flex-1 text-center md:text-left">
          <span className="inline-flex items-center gap-2 bg-white/20 px-4 py-2 rounded-full text-base font-semibold mb-4 shadow-lg backdrop-blur text-pink-700">
            <Sparkles className="w-5 h-5 text-yellow-400 animate-pulse" />
            Next-Gen Inventory Platform
          </span>
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold text-pink-600 mb-6 leading-tight drop-shadow-xl">
            Manage Inventory Smarter <br className="hidden sm:block" />
            <span className="bg-pink-100 px-2 rounded-lg text-fuchsia-700">with AI & Automation</span>
          </h1>
          <p className="text-lg sm:text-xl text-gray-700 mb-8 font-medium">
            Modern, intuitive inventory management with real-time tracking, low stock alerts, AI-powered analytics, and seamless team collaboration. Take control and grow your business with confidence.
          </p>
          <div className="flex flex-col sm:flex-row justify-center md:justify-start flex-wrap gap-4 mb-6">
            <button className="inline-flex items-center gap-2 bg-gradient-to-r from-pink-600 to-fuchsia-600 text-white px-8 py-3 rounded-full font-bold text-lg shadow-xl hover:from-pink-700 hover:to-fuchsia-700 hover:scale-105 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-pink-400">
              Get Started <ArrowRight className="w-5 h-5" />
            </button>
            <a
              href="#demo"
              className="inline-flex items-center gap-2 border-2 border-pink-600 text-pink-600 px-8 py-3 rounded-full font-bold text-lg hover:bg-pink-600 hover:text-white transition-all duration-200 shadow focus:outline-none focus:ring-2 focus:ring-pink-400"
            >
              Request Demo
            </a>
          </div>
          <div className="flex flex-wrap gap-4 sm:gap-6 mt-6 justify-center md:justify-start text-gray-600 text-sm">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
              Real-time Stock
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-blue-400" />
              AI Analytics
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-yellow-400" />
              Multi-user Collaboration
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-fuchsia-400" />
              Secure Cloud
            </div>
          </div>
        </div>
        {/* Right: Illustration */}
        <div className="flex-1 flex justify-center md:justify-end mt-12 md:mt-0">
          <div className="relative w-full max-w-md">
            <div className="absolute -top-8 -left-8 w-32 h-32 bg-pink-200 rounded-full blur-2xl opacity-40 z-0" />
            <Image
              src="/images/inventory-hero.svg"
              alt="Inventory Management Illustration"
              width={480}
              height={360}
              className="mx-auto relative z-10 drop-shadow-2xl w-full h-auto"
              priority
            />
            <div className="absolute bottom-0 right-0 w-20 h-20 bg-fuchsia-200 rounded-full blur-2xl opacity-40 z-0" />
          </div>
        </div>
      </div>
    </section>
  )
}
=======
// import Image from 'next/image'
// import { Sparkles, ArrowRight } from 'lucide-react'

// export default function HeroSection() {
//   return (
//     <section className="relative bg-gradient-to-br from-pink-50 via-white to-fuchsia-50 py-20 sm:py-28 px-4 overflow-hidden">
//       {/* Decorative Blobs */}
//       <div className="absolute -top-32 -left-32 w-96 h-96 opacity-30 blur-2xl pointer-events-none select-none z-0">
//         <svg viewBox="0 0 400 400" fill="none">
//           <circle cx="200" cy="200" r="200" fill="#f9a8d4" />
//         </svg>
//       </div>
//       <div className="absolute bottom-0 right-0 w-80 h-80 opacity-20 blur-2xl pointer-events-none select-none z-0">
//         <svg viewBox="0 0 320 320" fill="none">
//           <circle cx="160" cy="160" r="160" fill="#a21caf" />
//         </svg>
//       </div>
//       {/* Content */}
//       <div className="relative max-w-6xl mx-auto flex flex-col md:flex-row items-center gap-12 z-10">
//         {/* Left: Text */}
//         <div className="flex-1 text-center md:text-left">
//           <span className="inline-flex items-center gap-2 bg-white/20 px-4 py-2 rounded-full text-base font-semibold mb-4 shadow-lg backdrop-blur text-pink-700">
//             <Sparkles className="w-5 h-5 text-yellow-400 animate-pulse" />
//             Next-Gen Inventory Platform
//           </span>
//           <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold text-pink-600 mb-6 leading-tight drop-shadow-xl">
//             Manage Inventory Smarter <br className="hidden sm:block" />
//             <span className="bg-pink-100 px-2 rounded-lg text-fuchsia-700">with AI & Automation</span>
//           </h1>
//           <p className="text-lg sm:text-xl text-gray-700 mb-8 font-medium">
//             Modern, intuitive inventory management with real-time tracking, low stock alerts, AI-powered analytics, and seamless team collaboration. Take control and grow your business with confidence.
//           </p>
//           <div className="flex flex-col sm:flex-row justify-center md:justify-start flex-wrap gap-4 mb-6">
//             <button className="inline-flex items-center gap-2 bg-gradient-to-r from-pink-600 to-fuchsia-600 text-white px-8 py-3 rounded-full font-bold text-lg shadow-xl hover:from-pink-700 hover:to-fuchsia-700 hover:scale-105 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-pink-400">
//               Get Started <ArrowRight className="w-5 h-5" />
//             </button>
//             <a
//               href="#demo"
//               className="inline-flex items-center gap-2 border-2 border-pink-600 text-pink-600 px-8 py-3 rounded-full font-bold text-lg hover:bg-pink-600 hover:text-white transition-all duration-200 shadow focus:outline-none focus:ring-2 focus:ring-pink-400"
//             >
//               Request Demo
//             </a>
//           </div>
//           <div className="flex flex-wrap gap-4 sm:gap-6 mt-6 justify-center md:justify-start text-gray-600 text-sm">
//             <div className="flex items-center gap-2">
//               <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
//               Real-time Stock
//             </div>
//             <div className="flex items-center gap-2">
//               <span className="w-2 h-2 rounded-full bg-blue-400" />
//               AI Analytics
//             </div>
//             <div className="flex items-center gap-2">
//               <span className="w-2 h-2 rounded-full bg-yellow-400" />
//               Multi-user Collaboration
//             </div>
//             <div className="flex items-center gap-2">
//               <span className="w-2 h-2 rounded-full bg-fuchsia-400" />
//               Secure Cloud
//             </div>
//           </div>
//         </div>
//         {/* Right: Illustration */}
//         <div className="flex-1 flex justify-center md:justify-end mt-12 md:mt-0">
//           <div className="relative w-full max-w-md">
//             <div className="absolute -top-8 -left-8 w-32 h-32 bg-pink-200 rounded-full blur-2xl opacity-40 z-0" />
//             <Image
//               src="/images/inventory-hero.svg"
//               alt="Inventory Management Illustration"
//               width={480}
//               height={360}
//               className="mx-auto relative z-10 drop-shadow-2xl w-full h-auto"
//               priority
//             />
//             <div className="absolute bottom-0 right-0 w-20 h-20 bg-fuchsia-200 rounded-full blur-2xl opacity-40 z-0" />
//           </div>
//         </div>
//       </div>
//     </section>
//   )
// }


// import Image from "next/image";
// import { Sparkles, ArrowRight } from "lucide-react";
// import { motion } from "framer-motion";
// import { useState, useEffect } from "react";

// export default function HeroSection() {
//   const words = ["Smarter", "Faster", "Effortless"];
//   const [index, setIndex] = useState(0);
//   const [displayedText, setDisplayedText] = useState("");
//   const [isDeleting, setIsDeleting] = useState(false);

//   useEffect(() => {
//     const currentWord = words[index];
//     let typingSpeed = isDeleting ? 60 : 120;

//     const typingEffect = setTimeout(() => {
//       if (!isDeleting && displayedText.length < currentWord.length) {
//         setDisplayedText(currentWord.slice(0, displayedText.length + 1));
//       } else if (isDeleting && displayedText.length > 0) {
//         setDisplayedText(currentWord.slice(0, displayedText.length - 1));
//       } else if (!isDeleting && displayedText.length === currentWord.length) {
//         setTimeout(() => setIsDeleting(true), 1000);
//       } else if (isDeleting && displayedText.length === 0) {
//         setIsDeleting(false);
//         setIndex((prev) => (prev + 1) % words.length);
//       }
//     }, typingSpeed);

//     return () => clearTimeout(typingEffect);
//   }, [displayedText, isDeleting, index, words]);

//   return (
//     <section className="relative py-16 sm:py-20 px-4 overflow-hidden font-['Poppins']">
//       {/* Gradient Blobs */}
//       <div className="absolute -top-40 -left-40 w-80 h-80 rounded-full to-transparent opacity-60 blur-3xl" />
//       <div className="absolute bottom-0 right-0 w-[22rem] h-[22rem] rounded-full bg-gradient-to-tr from-[#6C63FF]/20 via-[#3B3D72]/10 to-transparent opacity-60 blur-3xl" />

//       {/* Content Wrapper */}
//       <div className="relative max-w-6xl mx-auto flex flex-col-reverse md:flex-row items-center md:items-start gap-12 z-10 text-center md:text-left">
//         {/* Left: Text */}
//         <motion.div
//           className="flex-1"
//           initial="hidden"
//           whileInView="visible"
//           viewport={{ once: true }}
//           transition={{ staggerChildren: 0.2 }}
//         >
//           <motion.span
//             variants={{
//               hidden: { opacity: 0, y: -20 },
//               visible: { opacity: 1, y: 0 },
//             }}
//             className="inline-flex items-center gap-2 bg-[#EEF0FF] px-4 py-2 rounded-full text-sm sm:text-base font-semibold mb-4 shadow-sm backdrop-blur-sm text-[#3B3D72]"
//           >
//             <Sparkles className="w-5 h-5 text-[#00C9A7] animate-pulse" />
//             Next-Gen Inventory Platform
//           </motion.span>

//           <motion.h1
//             variants={{
//               hidden: { opacity: 0, y: 30 },
//               visible: { opacity: 1, y: 0 },
//             }}
//             transition={{ duration: 0.8 }}
//             className="text-3xl sm:text-5xl md:text-6xl font-extrabold text-[#1E1E2F] mb-6 leading-tight drop-shadow-sm"
//           >
//             <span className="bg-gradient-to-r from-[#3B3D72] to-[#6C63FF] bg-clip-text text-transparent">
//               Manage Inventory
//             </span>
//             <br />
//             <span className="bg-gradient-to-r from-[#6C63FF] via-[#3B3D72] to-[#6C63FF] bg-clip-text text-transparent">
//               {displayedText}
//               <span className="animate-pulse">|</span>
//             </span>
//             <br className="hidden sm:block" />
//             <span className="bg-gradient-to-r from-[#3B3D72] to-[#6C63FF] bg-clip-text text-transparent">
//               with AI & Automation
//             </span>
//           </motion.h1>

//           <motion.p
//             variants={{
//               hidden: { opacity: 0, y: 20 },
//               visible: { opacity: 1, y: 0 },
//             }}
//             className="text-base sm:text-lg text-[#4B5563] mb-8 font-medium max-w-lg mx-auto md:mx-0"
//           >
//             Simplify inventory management with real-time tracking, predictive
//             analytics, and seamless collaboration. Grow your business smarter
//             with AI-powered insights.
//           </motion.p>

//          <motion.div
//   variants={{
//     hidden: { opacity: 0, scale: 0.9 },
//     visible: { opacity: 1, scale: 1 },
//   }}
//   className="flex flex-col sm:flex-row justify-center md:justify-start gap-4 mb-6 w-full"
// >
//   {/* Get Started Button */}
//   <button className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-gradient-to-r from-[#3B3D72] to-[#6C63FF] text-white px-4 sm:px-6 md:px-8 py-3 rounded-lg font-semibold text-base sm:text-lg shadow-md hover:scale-105 transition-all duration-200">
//     Get Started <ArrowRight className="w-5 h-5" />
//   </button>

//   {/* Request Demo Button */}
//   <a
//     href="#demo"
//     className="w-full sm:w-auto inline-flex items-center justify-center gap-2 border-2 border-[#3B3D72] text-[#3B3D72] px-4 sm:px-6 md:px-8 py-3 rounded-lg font-semibold text-base sm:text-lg hover:bg-[#F0F0FF] hover:text-[#6C63FF] transition-all duration-200 shadow-sm"
//   >
//     Request Demo
//   </a>
// </motion.div>

//         </motion.div>

//         {/* Right: Illustration */}
//         <motion.div
//           className="flex-1 flex justify-center md:justify-end"
//           initial={{ opacity: 0, x: 50 }}
//           whileInView={{ opacity: 1, x: 0 }}
//           transition={{ duration: 0.8 }}
//         >
//           <motion.div
//             className="relative w-full max-w-sm sm:max-w-md"
//             animate={{ y: [0, -10, 0] }}
//             transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
//           >
//             <Image
//               src="/images/inventory-hero.svg"
//               alt="Inventory Management Illustration"
//               width={480}
//               height={360}
//               className="mx-auto relative z-10 drop-shadow-lg w-full h-auto"
//               priority
//             />
//           </motion.div>
//         </motion.div>
//       </div>
//     </section>
//   );
// }

import Image from "next/image";
import { Sparkles, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";
import { useState, useEffect } from "react";

export default function HeroSection() {
  const words = ["Smarter", "Faster", "Effortless"];
  const [index, setIndex] = useState(0);
  const [displayedText, setDisplayedText] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const currentWord = words[index];
    let typingSpeed = isDeleting ? 60 : 120;

    const typingEffect = setTimeout(() => {
      if (!isDeleting && displayedText.length < currentWord.length) {
        setDisplayedText(currentWord.slice(0, displayedText.length + 1));
      } else if (isDeleting && displayedText.length > 0) {
        setDisplayedText(currentWord.slice(0, displayedText.length - 1));
      } else if (!isDeleting && displayedText.length === currentWord.length) {
        setTimeout(() => setIsDeleting(true), 1000);
      } else if (isDeleting && displayedText.length === 0) {
        setIsDeleting(false);
        setIndex((prev) => (prev + 1) % words.length);
      }
    }, typingSpeed);

    return () => clearTimeout(typingEffect);
  }, [displayedText, isDeleting, index, words]);

  return (
   <section className="relative py-16 sm:py-20 overflow-hidden font-['Poppins'] bg-[#F7FBFB]">
  {/* Gradient Blobs */}
  <div className="absolute -top-40 -left-40 w-80 h-80 rounded-full bg-gradient-to-br from-[#460F58]/20 to-[#7B53A6]/20 opacity-60 blur-3xl" />
  <div className="absolute bottom-0 right-0 w-[22rem] h-[22rem] rounded-full bg-gradient-to-tr from-[#7B53A6]/20 via-[#460F58]/10 to-transparent opacity-60 blur-3xl" />

  {/* Content Wrapper with proper container & padding */}
  <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-12  flex flex-col-reverse md:flex-row items-center gap-12 z-10 text-center md:text-left">
    
    {/* Left: Text */}
    <motion.div
      className="flex-1"
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true }}
      transition={{ staggerChildren: 0.2 }}
    >
      <motion.span
        variants={{
          hidden: { opacity: 0, y: -20 },
          visible: { opacity: 1, y: 0 },
        }}
        className="inline-flex items-center gap-2 bg-[#F7FBFB] px-4 py-2 rounded-full text-sm sm:text-base font-semibold mb-4 shadow-sm backdrop-blur-sm text-[#390F59] border border-[#744D81]"
      >
        <Sparkles className="w-5 h-5 text-[#7B53A6] animate-pulse" />
        Next-Gen Inventory Platform
      </motion.span>

      <motion.h1
        variants={{
          hidden: { opacity: 0, y: 30 },
          visible: { opacity: 1, y: 0 },
        }}
        transition={{ duration: 0.8 }}
        className="text-3xl sm:text-5xl md:text-6xl font-extrabold mb-6 leading-tight drop-shadow-sm"
      >
        <span className="bg-gradient-to-r from-[#390F59] to-[#7B53A6] bg-clip-text text-transparent">
          Manage Inventory
        </span>
        <br />
        <span className="bg-gradient-to-r from-[#7B53A6] via-[#390F59] to-[#7B53A6] bg-clip-text text-transparent">
          {displayedText}
          <span className="animate-pulse">|</span>
        </span>
        <br className="hidden sm:block" />
        <span className="bg-gradient-to-r from-[#390F59] to-[#7B53A6] bg-clip-text text-transparent">
          with AI & Automation
        </span>
      </motion.h1>

      <motion.p
        variants={{
          hidden: { opacity: 0, y: 20 },
          visible: { opacity: 1, y: 0 },
        }}
        className="text-gray-500 text-base sm:text-lg mb-8 font-medium max-w-lg mx-auto md:mx-0"
        style={{ fontFamily: "Poppins, sans-serif" }}
      >
        Simplify inventory management with real-time tracking, predictive
        analytics, and seamless collaboration. Grow your business smarter
        with AI-powered insights.
      </motion.p>

      {/* Buttons */}
      <motion.div
        variants={{
          hidden: { opacity: 0, scale: 0.9 },
          visible: { opacity: 1, scale: 1 },
        }}
        className="flex flex-col sm:flex-row justify-center md:justify-start gap-4 mb-6 w-full"
      >
        <button className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-gradient-to-r from-[#390F59] via-[#460F58] to-[#7B53A6] text-[#F7FBFB] px-4 sm:px-6 md:px-8 py-3 rounded-lg font-semibold text-base sm:text-lg shadow-md hover:scale-105 transition-all duration-200">
          Get Started <ArrowRight className="w-5 h-5" />
        </button>

        <a
          href="#demo"
          className="w-full sm:w-auto inline-flex items-center justify-center gap-2 border-2 border-[#7B53A6] text-[#7B53A6] px-4 sm:px-6 md:px-8 py-3 rounded-lg font-semibold text-base sm:text-lg hover:bg-gradient-to-r hover:from-[#390F59] hover:via-[#460F58] hover:to-[#7B53A6] hover:text-[#F7FBFB] transition-all duration-200 shadow-sm"
        >
          Request Demo
        </a>
      </motion.div>
    </motion.div>

    {/* Right: Illustration */}
    <motion.div
      className="flex-1 flex justify-center md:justify-end"
      initial={{ opacity: 0, x: 50 }}
      whileInView={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.8 }}
    >
      <motion.div
        className="relative w-full max-w-sm sm:max-w-md"
        animate={{ y: [0, -10, 0] }}
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
      >
        <Image
          src="/images/Gemini-herosection.png"
          alt="Inventory Management Illustration"
          width={600}
          height={500}
          className="mx-auto relative z-10 drop-shadow-lg w-full h-auto"
          priority
        />
      </motion.div>
    </motion.div>
  </div>
</section>


  );
}


>>>>>>> ce21ec2fdc56a92ea043161788371f59da47de6b
