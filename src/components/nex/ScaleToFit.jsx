import React, { useEffect, useState } from "react";

const DESIGN_W = 402;
const DESIGN_H = 874;

export default function ScaleToFit({ children, background = "#01050c", maxScale = 1.35 }) {
  const [scale, setScale] = useState(1);

  useEffect(() => {
    const fit = () => {
      const vw = window.visualViewport?.width || window.innerWidth;
      const vh = window.visualViewport?.height || window.innerHeight;
      setScale(Math.min(vw / DESIGN_W, vh / DESIGN_H, maxScale));
    };
    fit();
    window.addEventListener("resize", fit);
    window.addEventListener("orientationchange", fit);
    window.visualViewport?.addEventListener("resize", fit);
    return () => {
      window.removeEventListener("resize", fit);
      window.removeEventListener("orientationchange", fit);
      window.visualViewport?.removeEventListener("resize", fit);
    };
  }, [maxScale]);

  return (
    <div style={{ position: "fixed", inset: 0, overflow: "hidden", background, display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ width: DESIGN_W, height: DESIGN_H, flex: "none", transform: `scale(${scale})`, transformOrigin: "center center", position: "relative", overflow: "hidden" }}>
        {children}
      </div>
    </div>
  );
}
