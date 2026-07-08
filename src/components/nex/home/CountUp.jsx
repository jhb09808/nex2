import { useEffect, useState } from "react";

export default function CountUp({ to, duration = 1.5 }) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    const startTime = performance.now();
    let raf;
    const tick = (now) => {
      const progress = Math.min((now - startTime) / (duration * 1000), 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setCount(Math.floor(eased * to));
      if (progress < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [to, duration]);
  return <>{count.toLocaleString()}</>;
}