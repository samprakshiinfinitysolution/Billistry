"use client";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight } from "lucide-react";

const images = [
  { src: "/images/Anytime.jpg", alt: "Generate GST Bills Anytime" },
  { src: "/images/Anytime2.png", alt: "Get Payment Updates on Phone" },
  { src: "/images/Anytime1.png", alt: "Create Bills From Anywhere" },
  { src: "/images/Anytime3.png", alt: "Create Bills From Anywhere" },
];

export default function AnytimeSection() {
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrent((prev) => (prev + 1) % images.length);
    }, 3000); // 3s per image
    return () => clearInterval(interval);
  }, []);

  return (
    <section
      id="anytime-section"
      className="py-16 px-4 sm:px-6 lg:px-12 bg-[#F7FBFB] text-[#390F59] relative overflow-hidden"
      style={{ fontFamily: "Poppins, sans-serif" }} // ✅ Poppins for body text
    >
      <div className="relative max-w-7xl mx-auto flex flex-col lg:flex-row items-center gap-10 lg:gap-16 z-10 sm:px-8 lg:px-10">
        {/* Text Section */}
        <div className="flex-1 text-center lg:text-left space-y-4">
          <h2
            className="text-2xl sm:text-3xl md:text-4xl font-extrabold leading-snug 
              bg-gradient-to-r from-[#390F59] via-[#460F58] to-[#7B53A6] bg-clip-text text-transparent drop-shadow"
            style={{ fontFamily: "Roboto, sans-serif" }} // ✅ Roboto for heading
          >
            Easily run your business
          </h2>
          <h3
            className="text-lg sm:text-xl md:text-2xl font-semibold text-gray-700"
            style={{ fontFamily: "Roboto, sans-serif" }} // ✅ Roboto
          >
            With the Best Billing & Accounting Software
          </h3>
          <h3
            className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-[#460F58] leading-tight"
            style={{ fontFamily: "Roboto, sans-serif" }} // ✅ Roboto
          >
            Anytime,<br />Anywhere!
          </h3>

          <p className="text-gray-500 mt-4 sm:mt-6 text-base sm:text-lg md:text-lg max-w-md sm:max-w-lg mx-auto lg:mx-0 leading-relaxed">
            Multi-user, multi-device, multi-business functionalities make <br />
            <span className="text-[#7B53A6] font-semibold">Billistry</span> billing software a superpower for your business!
          </p>

          <button
            id="get-started-cta"
            className="mt-6 inline-flex items-center gap-2 bg-gradient-to-r from-[#390F59] via-[#460F58] to-[#7B53A6] text-white px-6 sm:px-8 py-3 sm:py-3 rounded-full font-bold text-base sm:text-lg shadow-md hover:scale-105 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-[#7B53A6]"
          >
            Get Started Now
            <ArrowRight className="w-4 sm:w-5 h-4 sm:h-5" />
          </button>
        </div>

        {/* Image Section */}
        <div className="flex-1 relative w-full lg:w-auto h-[300px] sm:h-[380px] md:h-[420px] rounded-3xl shadow-lg border bg-[#F7FBFB] overflow-hidden">
          <AnimatePresence>
            <motion.img
              key={current}
              src={images[current].src}
              alt={images[current].alt}
              className="w-full h-full object-cover rounded-2xl"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 1 }}
            />
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
}
