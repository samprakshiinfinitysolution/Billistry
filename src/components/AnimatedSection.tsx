// src/components/AnimatedSection.tsx
"use client";

import { motion, useInView } from "framer-motion";
import { useRef } from "react";

interface AnimatedSectionProps {
  children: React.ReactNode;
  className?: string;
}

export default function AnimatedSection({ children, className }: AnimatedSectionProps) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, amount: 0.2 });

  const variants = {
    hidden: { opacity: 0, y: 50 },
    visible: { opacity: 1, y: 0 },
  };

  return (
    <motion.section ref={ref} initial="hidden" animate={isInView ? "visible" : "hidden"} variants={variants} transition={{ duration: 0.6, ease: "easeOut" }} className={className}>
      {children}
    </motion.section>
  );
}