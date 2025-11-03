
'use client';
import Image from "next/image";
import { Sparkles, ArrowRight, Star, ShieldCheck } from "lucide-react";
import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import LoginSlider from "./LoginSlider";
import RequestDemo from "./RequestDemo";

export default function HeroSection() {
  const words = ["Smarter", "Faster", "Effortless"];
  const [index, setIndex] = useState(0);
  const [displayedText, setDisplayedText] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);
  const [showLogin, setShowLogin] = useState(false);
  const [showDemo, setShowDemo] = useState(false);
  useEffect(() => {
    const currentWord = words[index];
    const typingSpeed = isDeleting ? 60 : 120;

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
<>
   <section className="relative py-0 sm:py-20 overflow-hidden font-['Poppins'] bg-[#F7FBFB]">
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
        className="text-3xl sm:text-4xl md:text-5xl font-extrabold mb-6 leading-tight drop-shadow-sm"
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
        <button
          onClick={() => setShowLogin(true)}
          className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-gradient-to-r from-[#390F59] via-[#460F58] to-[#7B53A6] text-[#F7FBFB] px-4 sm:px-6 md:px-8 py-3 rounded-lg font-semibold text-base sm:text-lg shadow-md hover:scale-105 transition-all duration-200"
        >
          Get Started <ArrowRight className="w-5 h-5" />
        </button>

        <button
          onClick={() => setShowDemo(true)}
          className="w-full sm:w-auto inline-flex items-center justify-center gap-2 border-2 border-[#7B53A6] text-[#7B53A6] px-4 sm:px-6 md:px-8 py-3 rounded-lg font-semibold text-base sm:text-lg hover:bg-gradient-to-r hover:from-[#390F59] hover:via-[#460F58] hover:to-[#7B53A6] hover:text-[#F7FBFB] transition-all duration-200 shadow-sm"
        >
          Request Demo
        </button>
      </motion.div>
    </motion.div>

    {/* Right: Illustration */}
    <motion.div 
      className="flex-1 flex flex-col items-center md:items-end" 
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
       {/* Ratings and Certification */}
       <div className="mt-8 flex flex-wrap items-center justify-center md:justify-end gap-x-6 gap-y-4 text-sm text-gray-600">
         <div className="flex items-center">
           <Image src="/images/play-store-rating.png" alt="Google Play Rating" width={120} height={40} />
         </div>
         <div className="flex items-center">
           <Image src="/images/apple-store-rating.png" alt="App Store Rating" width={120} height={40} />
         </div>
         <div className="flex items-center">
            <Image src="/images/iso-certified.png" alt="ISO Certified" width={120} height={40} />
         </div>
         <div className="flex items-center">
            <Image src="/images/madeinindia1.png" alt="Made in India" width={120} height={40} />
         </div>
       </div>
    </motion.div>
  </div>
</section>

{showLogin && <LoginSlider onClose={() => setShowLogin(false)} />}
{showDemo && <RequestDemo isOpen={showDemo} onClose={() => setShowDemo(false)} />}
</>
  );
}
