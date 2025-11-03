"use client";
import Image from "next/image";
import { useState } from "react";
import RequestDemo from "./RequestDemo";


export default function PaidSupportSection() {
  const [showDemo, setShowDemo] = useState(false);
  return (
    <>
    <section className="max-w-7xl mx-auto bg-gradient-to-br from-[#F7FBFB] via-white to-[#F7FBFB] px-6 sm:px-10 lg:px-12 py-10 sm:py-12 rounded-3xl shadow-sm">
  <div className="flex flex-col lg:flex-row items-center justify-between gap-10 lg:gap-16">
    
    {/* Left: Icon + Content */}
    <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 text-center sm:text-left">
      <div className="flex-shrink-0 p-4 rounded-2xl bg-gradient-to-r from-[#390F59] to-[#7B53A6] shadow-lg">
        <Image
          src="/images/computer.jpg"
          alt="Customer Support"
          width={68}
          height={68}
          className="object-contain rounded-lg"
        />
      </div>
      <div>
        <h3 className="text-2xl sm:text-3xl font-extrabold bg-gradient-to-r from-[#390F59] via-[#460F58] to-[#7B53A6] bg-clip-text text-transparent mb-3 font-['Roboto']">
          Personalized product demo
        </h3>
        <p className="text-gray-600 text-base sm:text-lg leading-relaxed max-w-xl font-['Poppins']">
          Get a quick overview of Billistry Billing’s capabilities in a 45-minute
          session with our product experts.
        </p>
      </div>
    </div>

    {/* Right: CTA Button */}
    <div className="w-full sm:w-auto flex justify-center lg:justify-end">
        <button
          onClick={() => setShowDemo(true)}
          className="bg-gradient-to-r from-[#390F59] via-[#460F58] to-[#7B53A6] text-white cursor-pointer font-bold px-6 sm:px-8 py-3 rounded-full shadow-md hover:shadow-xl hover:scale-105 transition-transform duration-300 w-full sm:w-auto"
        >
          Schedule a demo
        </button>
    </div>
  </div>
</section>
    {showDemo && <RequestDemo isOpen={showDemo} onClose={() => setShowDemo(false)} />}
    </>

  );
}
