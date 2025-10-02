"use client";
// app/components/PricingHeader.tsx


import { CheckCircle2 } from "lucide-react";

export default function PricingHeader() {
  return (
    <section className="bg-gradient-to-br from-[#F7FBFB] via-white to-[#F7FBFB] py-16 px-6 text-center font-['Poppins']">
  <div className="max-w-4xl mx-auto">
    {/* Title */}
    <h1 className="text-4xl sm:text-5xl font-extrabold leading-tight mb-6 font-['Roboto']">
      <span className="bg-gradient-to-r from-[#390F59] via-[#460F58] to-[#7B53A6] bg-clip-text text-transparent">
        Choose the plan
      </span>{" "}
      that fits
      <br />
      <span className="text-[#390F59]">your business needs!</span>
    </h1>

    {/* Benefits list */}
    <div className="mt-6 flex justify-center">
      <ul className="flex flex-col sm:flex-row gap-4 sm:gap-8 text-lg text-gray-700">
        <li className="flex items-center gap-2 font-['Poppins']">
          <CheckCircle2 className="text-gray-700 rounded-full bg-gradient-to-r from-[#390F59] via-[#460F58] to-[#7B53A6] text-white w-6 h-6" />
          No hidden charges
        </li>
        <li className="flex items-center gap-2 font-['Poppins']">
          <CheckCircle2 className="text-gray-700 rounded-full bg-gradient-to-r from-[#390F59] via-[#460F58] to-[#7B53A6] text-white w-6 h-6" />
          Straightforward pricing
        </li>
        <li className="flex items-center gap-2 font-['Poppins']">
          <CheckCircle2 className="text-gray-700 rounded-full bg-gradient-to-r from-[#390F59] via-[#460F58] to-[#7B53A6] text-white w-6 h-6" />
          Cancel anytime
        </li>
      </ul>
    </div>
  </div>
</section>

  );
}
