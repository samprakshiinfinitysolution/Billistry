"use client";
import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, X, CheckCircle2 } from "lucide-react";

export default function FreeTrialPopup() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    // Show popup after 2 seconds — every page load
    const timer = setTimeout(() => setShow(true), 2000);
    return () => clearTimeout(timer);
  }, []);

  const closePopup = () => setShow(false);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        duration: 0.4,
        ease: "easeInOut",
      },
    },
    exit: {
      opacity: 0,
      transition: {
        duration: 0.3,
        ease: "easeInOut",
      },
    },
  };

  const popupVariants = {
    hidden: { y: 50, opacity: 0, scale: 0.95 },
    visible: {
      y: 0,
      opacity: 1,
      scale: 1,
      transition: {
        type: "spring",
        stiffness: 400,
        damping: 25,
        staggerChildren: 0.1,
      },
    },
    exit: {
      y: 30,
      opacity: 0,
      scale: 0.95,
      transition: {
        duration: 0.2,
        ease: "easeIn",
      },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1 },
  };

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-[999] p-4"
        >
          <motion.div
            variants={popupVariants}
            className="relative bg-gradient-to-br from-white to-gray-50 rounded-2xl shadow-2xl p-8 w-full max-w-md text-center border border-gray-200/50"
          >
            <motion.div 
              variants={itemVariants}
              className="text-[#460F58] mb-4 inline-block"
              // Add a subtle animation to the icon
              animate={{
                rotate: [0, 10, -10, 0],
                scale: [1, 1.1, 1],
              }}
              transition={{
                duration: 2,
                ease: "easeInOut",
                repeat: Infinity,
                repeatDelay: 3,
              }}
            >
              <Sparkles className="h-12 w-12" fill="currentColor" />
            </motion.div>
            <motion.h2 variants={itemVariants} className="text-2xl font-bold text-[#3A0F59] mb-2">
              Start Your Free Trial
            </motion.h2>
            <motion.p variants={itemVariants} className="text-gray-600 mb-6">
              Try Billistry free for 7 days — no card required.
            </motion.p>

            <motion.div variants={itemVariants} className="my-6 space-y-3 text-left px-4">
              <div className="flex items-start">
                <CheckCircle2 className="h-5 w-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                <span className="text-gray-700">Access all premium features</span>
              </div>
              <div className="flex items-start">
                <CheckCircle2 className="h-5 w-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                <span className="text-gray-700">Unlimited inventory tracking</span>
              </div>
              <div className="flex items-start">
                <CheckCircle2 className="h-5 w-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                <span className="text-gray-700">Advanced sales analytics & reports</span>
              </div>
            </motion.div>


            <Link href="/login" passHref legacyBehavior={false}>
              <motion.div variants={itemVariants} className="relative group overflow-hidden rounded-lg">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="w-full bg-[#460F58] text-white px-5 py-3 rounded-lg font-semibold hover:bg-[#3A0F59] focus:outline-none focus:ring-2 focus:ring-[#460F58] focus:ring-offset-2 transition-all duration-300"
                >
                  Start Free Trial
                </motion.button>
                {/* Shine effect on hover */}
                <div className="absolute top-0 -inset-full h-full w-1/2 z-5 block transform -skew-x-12 bg-gradient-to-r from-transparent to-white opacity-40 group-hover:animate-shine" />
              </motion.div>
            </Link>

            <motion.div variants={itemVariants} className="mt-6 text-center">
              <p className="text-xs text-gray-500 mb-3">Download on the</p>
              <div className="flex justify-center items-center space-x-4">
                <a href="https://www.apple.com/app-store/" target="_blank" rel="noopener noreferrer" aria-label="Download on the App Store" className="inline-flex items-center justify-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors">
                  <Image src="/images/appstore.png" alt="App Store" width={24} height={24} className="mr-2" />
                  <div>
                    <span className="block text-xs">Download on the</span>
                    <span className="block text-base font-semibold">App Store</span>
                  </div>
                </a>
                <a href="https://play.google.com/store" target="_blank" rel="noopener noreferrer" aria-label="Get it on Google Play" className="inline-flex items-center justify-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors">
                  <Image src="/images/playstore.png" alt="Google Play" width={22} height={22} className="mr-2" />
                  <div>
                    <span className="block text-xs">GET IT ON</span>
                    <span className="block text-base font-semibold">Google Play</span>
                  </div>
                </a>
              </div>
            </motion.div>

            <motion.button
              onClick={closePopup}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
              aria-label="Close popup"
            >
              <X className="h-5 w-5" />
            </motion.button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
