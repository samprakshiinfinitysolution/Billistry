"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { X, Gift, ArrowRight } from "lucide-react";

export default function OfferPopup() {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    // Show popup after a short delay on every page load
    const timer = setTimeout(() => setIsOpen(true), 3000); // 3-second delay
    return () => clearTimeout(timer);
  }, []); // The empty dependency array ensures this runs once on mount

  const closePopup = () => setIsOpen(false);

  const popupVariants = {
    hidden: { opacity: 0, y: 50, scale: 0.95 },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        type: "spring",
        stiffness: 400,
        damping: 25,
      },
    },
    exit: {
      opacity: 0,
      y: 30,
      scale: 0.95,
      transition: { duration: 0.2 },
    },
  } as const;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          variants={popupVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
          className="fixed bottom-5 right-5 z-[999] w-full max-w-sm"
        >
          <div className="relative bg-white rounded-2xl shadow-2xl p-6 border border-gray-200/80 flex items-start gap-4">
            <div className="flex-shrink-0 w-12 h-12 rounded-full bg-gradient-to-br from-[#460F58] to-[#7B53A6] flex items-center justify-center text-white">
              <Gift className="w-6 h-6" />
            </div>
            <div className="flex-1">
              <h3 className="font-bold text-lg text-[#3A0F59]">Special Offer!</h3>
              <p className="text-sm text-gray-600 mt-1 mb-3">
                Get <span className="font-semibold">20% OFF</span> your first Premium plan subscription.
              </p>
              <Link href="/pricing" onClick={closePopup}>
                <button className="inline-flex items-center gap-2 text-sm font-semibold text-white bg-[#460F58] px-4 py-2 rounded-lg hover:bg-[#3A0F59] transition-colors">
                  Claim Offer <ArrowRight className="w-4 h-4" />
                </button>
              </Link>
            </div>
            <button onClick={closePopup} className="absolute top-3 right-3 text-gray-400 hover:text-gray-600">
              <X className="w-5 h-5" />
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}