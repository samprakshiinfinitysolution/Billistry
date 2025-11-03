"use client";
import { useEffect, useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Megaphone, X } from "lucide-react";

interface AnnouncementBarProps {
  setHeight: (height: number) => void;
}

export default function AnnouncementBar({ setHeight }: AnnouncementBarProps) {
  const [showBar, setShowBar] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);
  const [isDismissed, setIsDismissed] = useState(false);
  const barRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleScroll = () => {
      const currentScroll = window.scrollY;
      if (currentScroll > lastScrollY && currentScroll > 50) {
        // user scrolled down
        setShowBar(false);
      } else {
        // user scrolled up
        setShowBar(true);
      }
      setLastScrollY(currentScroll);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [lastScrollY]);

  useEffect(() => {
    // Check session storage on mount to see if the bar was already dismissed
    if (sessionStorage.getItem("announcementDismissed") === "true") {
      setIsDismissed(true);
    }
  }, []);

  useEffect(() => {
    // Set height to 0 if the bar is hidden OR dismissed
    const newHeight = showBar && !isDismissed && barRef.current ? barRef.current.offsetHeight : 0;
    setHeight(newHeight);
  }, [showBar, isDismissed, setHeight]);

  return (
    <AnimatePresence>
      {showBar && !isDismissed && (
        <motion.div
          initial={{ y: -60, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -60, opacity: 0 }}
          transition={{ duration: 0.3, ease: "easeInOut" }}
          ref={barRef}
          className="w-full bg-gradient-to-r from-[#390F59] via-[#460F58] to-[#7B53A6] text-white text-center py-2.5 font-medium shadow-md fixed top-0 left-0 z-50"
        >
          <div className="relative flex items-center justify-center gap-3 px-12">
            <Megaphone className="w-5 h-5 text-yellow-300" />
            <span>Festive Offer: Get <strong className="font-bold">20% OFF</strong> on all plans!</span>
            <a href="/pricing" className="underline font-bold hover:text-yellow-300 transition-colors">Claim Now</a>
            <button
              onClick={() => {
                setIsDismissed(true);
                sessionStorage.setItem("announcementDismissed", "true");
              }}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-white/70 hover:text-white transition-colors"
              aria-label="Dismiss announcement"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
