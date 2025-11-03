"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { X, Zap, BarChart3, Rocket } from "lucide-react";

export default function AdvertisementPopup() {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const lastShown = localStorage.getItem("advertisementPopupLastShown");
    const now = new Date().getTime();
    const oneDay = 24 * 60 * 60 * 1000; // 24 hours in milliseconds

    if (!lastShown || now - Number(lastShown) > oneDay) {
      const timer = setTimeout(() => {
        setIsOpen(true);
        localStorage.setItem("advertisementPopupLastShown", String(now));
      }, 5000); // Show after 5 seconds

      return () => clearTimeout(timer);
    }
  }, []);

  const closePopup = () => setIsOpen(false);

  const overlayVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1 },
    exit: { opacity: 0 },
  };

  const popupVariants = {
    hidden: { opacity: 0, scale: 0.9, y: 50 },
    visible: {
      opacity: 1,
      scale: 1,
      y: 0,
      transition: {
        when: "beforeChildren",
        staggerChildren: 0.1
      },
    },
    exit: { opacity: 0, scale: 0.9, y: 30 },
  };

  const popupTransition = { type: "spring", stiffness: 300, damping: 30 } as const;

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };

  const features = [
    { icon: <Zap className="w-5 h-5 text-yellow-400" />, text: "AI-Powered Insights & Forecasting" },
    { icon: <BarChart3 className="w-5 h-5 text-yellow-400" />, text: "Advanced Reporting & Analytics" },
    { icon: <Rocket className="w-5 h-5 text-yellow-400" />, text: "Priority 24/7 Customer Support" },
  ];

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          variants={overlayVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
          className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[999] p-4"
        >
          <motion.div
            variants={popupVariants}
            transition={popupTransition}
            className="relative bg-gradient-to-r from-[#390F59] via-[#460F58] to-[#7B53A6] border border-purple-900/50 rounded-2xl shadow-2xl w-full max-w-3xl text-white overflow-hidden"
          >
            <motion.button
              onClick={closePopup}
              className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors z-20"
              aria-label="Close popup"
            >
              <X className="h-6 w-6" />
            </motion.button>

            {/* Animated Aurora Background */}
            <div className="absolute inset-0 -z-10 overflow-hidden">
              <div className="absolute -left-40 -top-40 h-96 w-96 animate-aurora-1 rounded-full bg-purple-500/30 blur-3xl filter"></div>
              <div className="absolute -right-40 -bottom-40 h-96 w-96 animate-aurora-2 rounded-full bg-blue-500/30 blur-3xl filter"></div>
            </div>

            <div className="grid md:grid-cols-2 items-center">
              {/* Left Column: Illustration */}
              <div className="p-8 hidden md:flex justify-center items-center bg-[#3A0F59]/20">
                <motion.div
                  initial={{ x: -50, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: 0.2, duration: 0.5, type: 'spring' }}
                >
                  <Image
                    src="/images/upgrade-illustration.svg" // Replace with your actual illustration
                    alt="Upgrade to Premium"
                    width={250}
                    height={250}
                    className="animate-float drop-shadow-[0_20px_25px_rgba(0,0,0,0.5)]"
                  />
                </motion.div>
              </div>

              {/* Right Column: Content */}
              <div className="p-8 text-center md:text-left">
                <motion.h2 variants={itemVariants} className="text-3xl font-bold text-white mb-2">
                  Unlock Your Business&lsquo;s Full Potential
                </motion.h2>

                <motion.p variants={itemVariants} className="text-purple-200/80 mb-6">
                  Upgrade to <span className="font-semibold text-white">Billistry Premium</span> to access exclusive features and accelerate your growth.
                </motion.p>

                <motion.div variants={itemVariants} className="space-y-2 text-left my-8">
                  {features.map((feature, index) => (
                    <motion.div
                      key={index}
                      className="flex items-center gap-3 p-2 rounded-lg transition-all hover:bg-white/10"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.3 + index * 0.1 }}
                    >
                      <div className="flex-shrink-0">{feature.icon}</div>
                      <span className="text-gray-300 text-sm">{feature.text}</span>
                    </motion.div>
                  ))}
                </motion.div>

                <motion.div variants={itemVariants} className="relative group overflow-hidden rounded-lg">
                  <Link href="/pricing" passHref>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={closePopup}
                      className="w-full bg-gradient-to-r from-[#7B53A6] to-[#460F58] text-white px-6 py-3 rounded-lg font-semibold text-lg shadow-lg hover:shadow-purple-500/40 focus:outline-none focus:ring-2 focus:ring-purple-400 focus:ring-offset-2 focus:ring-offset-slate-800 transition-all duration-300"
                    >
                      Upgrade Now
                    </motion.button>
                  </Link>
                  <div className="absolute top-0 -inset-full h-full w-1/2 z-5 block transform -skew-x-12 bg-gradient-to-r from-transparent to-white opacity-40 group-hover:animate-shine" />
                </motion.div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}