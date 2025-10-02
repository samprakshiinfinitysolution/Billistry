import { useEffect, useRef, useState } from "react";

interface AnimatedNumberProps {
  value: number;
  duration?: number; // in milliseconds
  className?: string;
}

export default function AnimatedNumber({
  value,
  duration = 1000,
  className,
}: AnimatedNumberProps) {
  const [displayValue, setDisplayValue] = useState(value);
  const prevValueRef = useRef(value);

  useEffect(() => {
    const startValue = prevValueRef.current;
    const change = value - startValue;
    const startTime = performance.now();

    const animate = (currentTime: number) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      setDisplayValue(Math.floor(startValue + change * progress));

      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        prevValueRef.current = value; // update previous value
      }
    };

    requestAnimationFrame(animate);
  }, [value, duration]);

  return <span className={className}>{displayValue.toLocaleString("en-IN")}</span>;
}
