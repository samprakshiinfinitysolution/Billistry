


"use client";


import PricingHeader from "@/components/PricingHeaderSection";
import PricingCard  from "@/components/PricingCardSection"
import PricingPersonlized  from "@/components/PricingPersonlizedSection"
import PricingFAQ  from "@/components/PricingFAQSection"


export default function Home() {
  return (
    <>
      <PricingHeader/>
      <PricingCard/>
      <PricingPersonlized/>
      <PricingFAQ/>
     
    </>
  );
}
