import React, { useEffect, useRef, useState } from "react";

// The design is authored at this width. Every fixed pixel value in the pages
// is relative to it, so locking the width and scaling by it keeps the layout
// proportional edge-to-edge on any phone.
const DESIGN_W = 402;

/**
 * Fills the whole screen instead of letterboxing a fixed-size box.
 *
 * The width is scaled to the device (so 402 design px always spans the full
 * screen width), and the height is whatever the screen gives us, expressed in
 * design pixels. Pages are height:100%, so their flexible rows — the radar, a
 * message list, a spacer — absorb the difference. Taller phones get more room,
 * shorter phones get less, and nothing is boxed in or cropped.
 */
export default function ScaleToFit({ children, background = "#01050c", maxScale = 1.35 }) {
  const box = useRef(null);
  const [{ scale, designH }, setFit] = useState({ scale: 0, designH: 0 });

  useEffect(() => {
    const el = box.current;
    if (!el) return;
    const fit = () => {
      const r = el.getBoundingClientRect();
      if (!r.width || !r.height) return;
      // Phones land under the cap, so the design spans the full width. Wider
      // viewports (desktop, the Base44 preview) stop at maxScale and stay a
      // centered phone-sized column instead of blowing up to fill the window.
      const s = Math.min(r.width / DESIGN_W, maxScale);
      setFit({ scale: s, designH: r.height / s });
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
            width: DESIGN_W,
            height: designH || "100%",
            flex: "none",
            transform: `scale(${scale})`,
            transformOrigin: "center center",
            visibility: scale ? "visible" : "hidden",
            position: "relative",
            overflow: "hidden",
          }}
        >
          {children}
        </div>
      </div>
    </div>
  );
}
