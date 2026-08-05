import React, { useRef, useState, useEffect } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { getSubInterestName } from "@/components/nex/radar/interestCategories";

export default function InterestBanner({ interests = [], highlight = [] }) {
  const scrollRef = useRef(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);
  const [paused, setPaused] = useState(false);

  // Duplicate interests for seamless marquee loop
  const items = interests.length > 0 ? [...interests, ...interests] : [];

  const updateScrollState = () => {
    const el = scrollRef.current;
    if (!el) return;
    setCanScrollLeft(el.scrollLeft > 4);
    setCanScrollRight(el.scrollLeft < el.scrollWidth - el.clientWidth - 4);
  };

  useEffect(() => {
    updateScrollState();
    const el = scrollRef.current;
    if (!el) return;
    el.addEventListener("scroll", updateScrollState, { passive: true });
    window.addEventListener("resize", updateScrollState);
    return () => {
      el.removeEventListener("scroll", updateScrollState);
      window.removeEventListener("resize", updateScrollState);
    };
  }, [interests.length]);

  const scrollBy = (dir) => {
    const el = scrollRef.current;
    if (!el) return;
    el.scrollBy({ left: dir * 200, behavior: "smooth" });
  };

  if (interests.length === 0) return null;

  return (
    <div
      className="relative"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      {/* Left arrow */}
      {canScrollLeft && (
        <button
          onClick={() => scrollBy(-1)}
          className="absolute left-0 top-1/2 -translate-y-1/2 z-10 w-7 h-7 rounded-full cyber-frame flex items-center justify-center"
        >
          <ChevronLeft className="w-4 h-4 text-cyan-300/80" />
        </button>
      )}

      {/* Right arrow */}
      {canScrollRight && (
        <button
          onClick={() => scrollBy(1)}
          className="absolute right-0 top-1/2 -translate-y-1/2 z-10 w-7 h-7 rounded-full cyber-frame flex items-center justify-center"
        >
          <ChevronRight className="w-4 h-4 text-cyan-300/80" />
        </button>
      )}

      {/* Edge fades */}
      <div className="absolute left-0 top-0 bottom-0 w-8 bg-gradient-to-r from-black to-transparent pointer-events-none z-[5]" />
      <div className="absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-black to-transparent pointer-events-none z-[5]" />

      <div
        ref={scrollRef}
        className="flex gap-2 overflow-x-auto scrollbar-hide py-1"
        style={{
          scrollBehavior: "auto",
        }}
      >
        {/* Auto-scrolling marquee track */}
        <div
          className="flex gap-2 flex-shrink-0"
          style={{
            animation: paused ? "none" : "interest-marquee 40s linear infinite",
          }}
        >
          {items.map((interest, idx) => {
            const isMutual = highlight.includes(interest);
            return (
              <span
                key={`${interest}-${idx}`}
                className={`px-3 py-1.5 rounded-full text-xs font-cyber font-medium whitespace-nowrap flex-shrink-0 border ${
                  isMutual
                    ? "neon-btn text-white border-transparent"
                    : "bg-cyan-500/5 text-cyan-300/70 border-cyan-500/15"
                }`}
              >
                {getSubInterestName(interest)}
              </span>
            );
          })}
        </div>
      </div>
    </div>
  );
}