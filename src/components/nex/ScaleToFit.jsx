import React, { useEffect, useRef, useState } from "react";

const DESIGN_W = 402;
const DESIGN_H = 874;

export default function ScaleToFit({ children, background = "#01050c", maxScale = 1.35 }) {
  const [scale, setScale] = useState(0);
  const box = useRef(null);

  useEffect(() => {
    const el = box.current;
    if (!el) return;
    const fit = () => {
      const r = el.getBoundingClientRect();
      if (!r.width || !r.height) return;
      setScale(Math.min(r.width / DESIGN_W, r.height / DESIGN_H, maxScale));
    };
    fit();
    const ro = new ResizeObserver(fit);
    ro.observe(el);
    window.addEventListener("orientationchange", fit);
    window.visualViewport?.addEventListener("resize", fit);
    window.visualViewport?.addEventListener("scroll", fit);
    return () => {
      ro.disconnect();
      window.removeEventListener("orientationchange", fit);
      window.visualViewport?.removeEventListener("resize", fit);
      window.visualViewport?.removeEventListener("scroll", fit);
    };
  }, [maxScale]);

  return (
    <div style={{
      position: "fixed", inset: 0, overflow: "hidden", background,
      paddingTop: "env(safe-area-inset-top, 0px)",
      paddingBottom: "env(safe-area-inset-bottom, 0px)",
      paddingLeft: "env(safe-area-inset-left, 0px)",
      paddingRight: "env(safe-area-inset-right, 0px)",
      boxSizing: "border-box",
    }}>
      <div ref={box} style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden" }}>
        <div
          className="scaled-frame"
          style={{
            width: DESIGN_W, height: DESIGN_H, flex: "none",
            transform: `scale(${scale})`, transformOrigin: "center center",
            visibility: scale ? "visible" : "hidden",
            position: "relative", overflow: "hidden",
          }}
        >
          {children}
        </div>
      </div>
    </div>
  );
}
