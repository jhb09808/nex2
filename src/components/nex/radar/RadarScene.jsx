import React, { useEffect, useRef, useState } from "react";

const MAP_IMAGE =
  "https://media.base44.com/images/public/6a4d6cb08bae15f4dac3aca3/1ec3114e9_C8F69EA0-D379-44E6-A041-34FA6084E404.png";

const clamp = (v) => Math.max(-1, Math.min(1, v));

/**
 * The radar surface.
 *
 * Only the HUD frame and the disc tilt. The city map and the four corner
 * lights are siblings outside the tilted layer, so they stay level however the
 * phone is held — leaning toward an edge just brightens the two lights on it.
 */
export default function RadarScene({ blips = [], zoom = 1, selectedId = null, onSelect }) {
  const tiltRef = useRef(null);
  const lightRefs = { tl: useRef(null), tr: useRef(null), bl: useRef(null), br: useRef(null), glare: useRef(null) };
  const rimRef = useRef(null);
  const discGlareRef = useRef(null);
  const discRimRef = useRef(null);
  const live = useRef(false);
  const [needsTiltPermission, setNeedsTiltPermission] = useState(false);

  useEffect(() => {
    const apply = (tx, ty) => {
      if (tiltRef.current) {
        tiltRef.current.style.transform =
          `rotateX(${(-ty * 5).toFixed(2)}deg) rotateY(${(tx * 6.5).toFixed(2)}deg)` +
          ` translateX(${(tx * 5).toFixed(1)}px) translateY(${(ty * 4).toFixed(1)}px)`;
      }
      const set = (ref, v) => { if (ref.current) ref.current.style.opacity = v.toFixed(3); };
      set(lightRefs.tl, 0.10 + Math.max(0, -tx) * 0.46 + Math.max(0, -ty) * 0.46);
      set(lightRefs.tr, 0.10 + Math.max(0, tx) * 0.46 + Math.max(0, -ty) * 0.46);
      set(lightRefs.bl, 0.09 + Math.max(0, -tx) * 0.42 + Math.max(0, ty) * 0.42);
      set(lightRefs.br, 0.09 + Math.max(0, tx) * 0.42 + Math.max(0, ty) * 0.42);

      const gx = `${(50 + tx * 42).toFixed(1)}%`;
      const gy = `${(50 + ty * 42).toFixed(1)}%`;
      if (lightRefs.glare.current) {
        lightRefs.glare.current.style.background =
          `radial-gradient(26% 18% at ${gx} ${gy},rgba(235,248,255,.5),rgba(235,248,255,0) 72%)`;
      }
      const rimAngle = `${(Math.atan2(ty, tx) * 180 / Math.PI + 90).toFixed(1)}deg`;
      if (rimRef.current) {
        rimRef.current.style.background =
          `linear-gradient(${rimAngle},rgba(220,245,255,.85),rgba(220,245,255,0) 42%) border-box`;
      }
      if (discGlareRef.current) {
        discGlareRef.current.style.background =
          `radial-gradient(circle at ${gx} ${gy},rgba(190,230,255,.34) 0%,rgba(150,210,255,.12) 26%,rgba(150,210,255,0) 58%)`;
      }
      if (discRimRef.current) {
        discRimRef.current.style.background =
          `linear-gradient(${rimAngle},rgba(200,238,255,.75),rgba(200,238,255,0) 46%) border-box`;
      }
    };

    const onOrientation = (e) => {
      live.current = true;
      apply(clamp((e.gamma || 0) / 35), clamp(((e.beta || 0) - 40) / 35));
    };
    const onPointer = (e) => {
      if (live.current) return;
      apply(
        clamp((e.clientX / (window.innerWidth || 1) - 0.5) * 2),
        clamp((e.clientY / (window.innerHeight || 1) - 0.5) * 2)
      );
    };

    window.addEventListener("deviceorientation", onOrientation);
    window.addEventListener("pointermove", onPointer, { passive: true });
    apply(0, 0);

    // iOS needs an explicit gesture before it will report orientation.
    const DOE = window.DeviceOrientationEvent;
    if (DOE && typeof DOE.requestPermission === "function") setNeedsTiltPermission(true);

    return () => {
      window.removeEventListener("deviceorientation", onOrientation);
      window.removeEventListener("pointermove", onPointer);
    };
  }, []);

  const enableTilt = () => {
    const DOE = window.DeviceOrientationEvent;
    if (DOE && typeof DOE.requestPermission === "function") {
      DOE.requestPermission()
        .then((r) => { if (r === "granted") setNeedsTiltPermission(false); })
        .catch(() => setNeedsTiltPermission(false));
    }
  };

  const discSize = "min(84vw, 46vh)";

  return (
    <>
      {/* Steady: city map */}
      <div aria-hidden="true" style={{ position: "absolute", inset: 0, zIndex: 0 }}>
        <img src={MAP_IMAGE} alt="" style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
        <div style={{ position: "absolute", inset: 0, background: "radial-gradient(62% 34% at 50% 47%,rgba(1,6,14,.96) 0%,rgba(1,6,14,.80) 52%,rgba(1,6,14,.34) 100%)" }} />
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(180deg,rgba(1,6,14,.86) 0%,rgba(1,6,14,.42) 24%,rgba(1,6,14,.46) 70%,rgba(1,5,12,.94) 100%)" }} />
      </div>

      {/* Steady: corner lights that track the tilt direction */}
      <div aria-hidden="true" style={{ position: "absolute", inset: "-12%", zIndex: 1, pointerEvents: "none", mixBlendMode: "screen" }}>
        <div ref={lightRefs.tl} style={{ position: "absolute", inset: 0, background: "radial-gradient(58% 44% at 8% 4%,rgba(90,200,255,.9),rgba(90,200,255,0) 70%)", opacity: 0.1, transition: "opacity .14s ease-out" }} />
        <div ref={lightRefs.tr} style={{ position: "absolute", inset: 0, background: "radial-gradient(58% 44% at 92% 4%,rgba(190,120,255,.85),rgba(190,120,255,0) 70%)", opacity: 0.1, transition: "opacity .14s ease-out" }} />
        <div ref={lightRefs.bl} style={{ position: "absolute", inset: 0, background: "radial-gradient(58% 44% at 8% 96%,rgba(80,235,190,.75),rgba(80,235,190,0) 70%)", opacity: 0.09, transition: "opacity .14s ease-out" }} />
        <div ref={lightRefs.br} style={{ position: "absolute", inset: 0, background: "radial-gradient(58% 44% at 92% 96%,rgba(255,180,110,.7),rgba(255,180,110,0) 70%)", opacity: 0.09, transition: "opacity .14s ease-out" }} />
        <div ref={lightRefs.glare} style={{ position: "absolute", inset: 0, transition: "background .14s ease-out" }} />
      </div>

      {/* Tilts: HUD frame + radar */}
      <div ref={tiltRef} style={{ position: "absolute", inset: 0, pointerEvents: "none", transformStyle: "preserve-3d", transition: "transform .14s ease-out" }}>
        <div style={{ position: "absolute", inset: 8, border: "1px solid rgba(86,180,255,.10)", zIndex: 5, transform: "translateZ(40px)" }} />
        <div ref={rimRef} style={{ position: "absolute", inset: 8, zIndex: 7, transform: "translateZ(42px)", border: "1px solid transparent", background: "linear-gradient(0deg,rgba(220,245,255,.85),rgba(220,245,255,0) 42%) border-box", WebkitMask: "linear-gradient(#000 0 0) padding-box,linear-gradient(#000 0 0)", WebkitMaskComposite: "xor", maskComposite: "exclude", transition: "background .14s ease-out" }} />
        <div style={{ position: "absolute", top: 8, left: 8, width: 20, height: 20, borderLeft: "1.5px solid rgba(125,205,255,.55)", borderTop: "1.5px solid rgba(125,205,255,.55)", zIndex: 5 }} />
        <div style={{ position: "absolute", top: 8, right: 8, width: 20, height: 20, borderRight: "1.5px solid rgba(125,205,255,.55)", borderTop: "1.5px solid rgba(125,205,255,.55)", zIndex: 5 }} />
        <div style={{ position: "absolute", bottom: 8, left: 8, width: 20, height: 20, borderLeft: "1.5px solid rgba(125,205,255,.55)", borderBottom: "1.5px solid rgba(125,205,255,.55)", zIndex: 5 }} />
        <div style={{ position: "absolute", bottom: 8, right: 8, width: 20, height: 20, borderRight: "1.5px solid rgba(125,205,255,.55)", borderBottom: "1.5px solid rgba(125,205,255,.55)", zIndex: 5 }} />

        <div style={{ position: "absolute", left: 0, right: 0, top: 100, bottom: 90, pointerEvents: "auto" }}>
          <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden" }}>
            <div style={{ position: "absolute", width: "min(100vw, 420px)", height: "min(100vw, 420px)", borderRadius: "50%", background: "radial-gradient(circle,rgba(40,120,230,.16) 0%,rgba(4,16,31,0) 66%)" }} />
            <div ref={discGlareRef} style={{ position: "absolute", width: discSize, height: discSize, borderRadius: "50%", pointerEvents: "none", mixBlendMode: "screen", transition: "background .12s ease-out", zIndex: 2 }} />
            <div ref={discRimRef} style={{ position: "absolute", width: discSize, height: discSize, borderRadius: "50%", pointerEvents: "none", border: "1px solid transparent", WebkitMask: "linear-gradient(#000 0 0) padding-box,linear-gradient(#000 0 0)", WebkitMaskComposite: "xor", maskComposite: "exclude", transition: "background .12s ease-out", zIndex: 2 }} />

            {/* Range rings */}
            <div style={{ position: "absolute", width: discSize, height: discSize, transition: "width .35s ease, height .35s ease" }}>
              <div style={{ position: "absolute", inset: 0, borderRadius: "50%", border: "1px solid rgba(110,190,255,.14)" }} />
              <div style={{ position: "absolute", inset: "14%", borderRadius: "50%", border: "1px solid rgba(110,190,255,.13)" }} />
              <div style={{ position: "absolute", inset: "28%", borderRadius: "50%", border: "1px solid rgba(110,190,255,.12)" }} />
              <div style={{ position: "absolute", inset: "42%", borderRadius: "50%", border: "1px solid rgba(110,190,255,.10)" }} />
              <div style={{ position: "absolute", left: "50%", top: 0, bottom: 0, width: 1, background: "linear-gradient(180deg,transparent,rgba(110,190,255,.14),transparent)" }} />
              <div style={{ position: "absolute", top: "50%", left: 0, right: 0, height: 1, background: "linear-gradient(90deg,transparent,rgba(110,190,255,.14),transparent)" }} />
            </div>

            {/* Sweep arm */}
            <div style={{ position: "absolute", width: discSize, height: discSize, borderRadius: "50%", overflow: "hidden" }}>
              <div style={{ position: "absolute", inset: 0, background: "conic-gradient(from 0deg,rgba(90,175,255,.34),rgba(90,175,255,.05) 16%,rgba(90,175,255,0) 34%)", animation: "nxsweep 4s linear infinite" }} />
            </div>

            {/* You */}
            <div style={{ position: "absolute", width: 9, height: 9, borderRadius: "50%", background: "#cdeaff", boxShadow: "0 0 22px 6px rgba(120,200,255,.85)" }} />
            <div style={{ position: "absolute", width: 60, height: 60, borderRadius: "50%", background: "rgba(90,180,255,.16)", animation: "nxpulse 3.2s ease-out infinite" }} />

            {/* Blips */}
            <div style={{ position: "absolute", width: discSize, height: discSize, transition: "width .35s ease, height .35s ease" }}>
              {blips.map((b) => {
                const on = selectedId === b.id;
                const r = Math.min(46, (13 + (b.distance / 1.6) * 33) * zoom);
                const rad = (b.angle * Math.PI) / 180;
                // The sweep starts at 12 o'clock and takes 4s, so a blip at
                // angle A is crossed at (A + 90) into the cycle. A negative
                // delay seeks the halo to that phase, locking it to the arm.
                const phase = (((b.angle + 90) % 360) + 360) % 360;
                const delay = (((360 - phase) % 360) / 360) * 4;
                return (
                  <button
                    key={b.id}
                    aria-label={b.name}
                    onClick={() => onSelect && onSelect(on ? null : b.id)}
                    style={{ position: "absolute", left: `${(50 + r * Math.cos(rad)).toFixed(1)}%`, top: `${(50 + r * Math.sin(rad)).toFixed(1)}%`, width: 38, height: 38, margin: "-19px 0 0 -19px", padding: 0, border: 0, background: "transparent", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}
                  >
                    <span style={{ position: "relative", display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <span style={{ position: "absolute", width: on ? 46 : 30, height: on ? 46 : 30, borderRadius: "50%", background: `radial-gradient(circle,${b.color} 0%,rgba(0,0,0,0) 68%)`, pointerEvents: "none", opacity: 0, animation: on ? "none" : `nxblip 4s linear -${delay.toFixed(2)}s infinite` }} />
                      <span style={{ position: "relative", width: on ? 15 : 9, height: on ? 15 : 9, borderRadius: "50%", background: b.color, boxShadow: on ? `0 0 26px 7px ${b.color}` : `0 0 6px 1px ${b.color}`, border: on ? "2px solid rgba(255,255,255,.85)" : 0 }} />
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {needsTiltPermission && (
        <button
          onClick={enableTilt}
          style={{ position: "absolute", left: "50%", bottom: 104, transform: "translateX(-50%)", zIndex: 11, display: "flex", alignItems: "center", gap: 8, height: 38, padding: "0 14px", border: "1px solid rgba(105,190,255,.4)", borderRadius: 999, background: "rgba(8,26,54,.8)", backdropFilter: "blur(10px)", color: "#bfe2ff", fontFamily: "var(--font-chakra)", fontWeight: 600, fontSize: 10, lineHeight: 1, letterSpacing: "0.18em", textTransform: "uppercase", cursor: "pointer" }}
        >
          Enable tilt
        </button>
      )}
    </>
  );
}
