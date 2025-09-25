import { useEffect, useState } from "react";

interface AnimatedNumberProps {
  value: number;
  duration?: number; // in milliseconds
  className?: string;
}

export default function AnimatedNumber({ value, duration = 1000, className }: AnimatedNumberProps) {
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    let start: number | null = null;

    const step = (timestamp: number) => {
      if (!start) start = timestamp;
      const progress = Math.min((timestamp - start) / duration, 1);
      setDisplayValue(Math.floor(progress * value));
      if (progress < 1) {
        requestAnimationFrame(step);
      }
    };

    requestAnimationFrame(step);

    return () => setDisplayValue(0); // cleanup if component unmounts
  }, [value, duration]);

  return <span className={className}>{displayValue.toLocaleString("en-IN")}</span>;
}
