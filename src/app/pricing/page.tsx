
"use client";
import PricingHeader from "@/components/PricingHeaderSection";
import PricingCard  from "@/components/PricingCardSection"
import PricingPersonlized  from "@/components/PricingPersonlizedSection"
import PricingFAQ  from "@/components/PricingFAQSection"
import OfferPopup from "@/components/OfferPopup";
import AdvertisementPopup from "@/components/AdvertisementPopup";


export default function Home() {
  return (
    <>
     <AdvertisementPopup />
     <OfferPopup/>
      <PricingHeader/>
      <PricingCard/>
      <PricingPersonlized/>
      <PricingFAQ/>
     
    </>
  );
}
