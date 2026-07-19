import React, { useRef, useEffect, useState } from "react";
import { Loader2 } from "lucide-react";

/**
 * DnaBackground — interactive futuristic background behind the radar.
 * On phones: underglow follows device tilt (gyroscope). The direction and
 * magnitude of the tilt steer the glow; tilting more lights it up.
 * On desktop: falls back to mouse movement.
 */
export default function DnaBackground() {
  const canvasRef = useRef(null);
  const [needsPermission, setNeedsPermission] = useState(false);
  const [requesting, setRequesting] = useState(false);
  const stateRef = useRef({
    w: 0,
    h: 0,
    mx: 0,
    my: 0,
    tx: 0,
    ty: 0,
    angle: 0,
    targetAngle: 0,
    glow: 0.18,
    targetGlow: 0.18,
    t: 0,
    dpr: 1,
    usingTilt: false,
  });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    const s = stateRef.current;

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const w = window.innerWidth;
      const h = window.innerHeight;
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      canvas.style.width = w + "px";
      canvas.style.height = h + "px";
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      s.w = w;
      s.h = h;
      s.dpr = dpr;
      if (s.mx === 0 && s.my === 0) {
        s.mx = w / 2;
        s.my = h / 2;
        s.tx = w / 2;
        s.ty = h / 2;
      }
    };

    // ===== Device tilt handler (phones) =====
    const onTilt = (e) => {
      // gamma: left/right tilt (-90..90), beta: front/back tilt (-180..180)
      const gamma = e.gamma ?? 0;
      const beta = e.beta ?? 0;
      // Map tilt to a screen-space direction vector
      const dx = Math.max(-1, Math.min(1, gamma / 45));
      const dy = Math.max(-1, Math.min(1, (beta - 30) / 45)); // neutral ~30deg hold
      const magnitude = Math.sqrt(dx * dx + dy * dy);
      if (magnitude > 0.03) {
        s.targetAngle = Math.atan2(dy, dx);
        s.targetGlow = 0.4 + Math.min(1.4, magnitude * 1.6); // tilt harder → much brighter
      } else {
        s.targetGlow = 0.22;
      }
      // Move the glow origin proportionally to tilt within the screen
      s.tx = s.w / 2 + dx * (s.w * 0.4);
      s.ty = s.h / 2 + dy * (s.h * 0.4);
      s.usingTilt = true;
    };

    // ===== Mouse fallback (desktop) =====
    const onMove = (e) => {
      if (s.usingTilt) return;
      const x = e.touches ? e.touches[0].clientX : e.clientX;
      const y = e.touches ? e.touches[0].clientY : e.clientY;
      const dx = x - s.tx;
      const dy = y - s.ty;
      if (Math.abs(dx) > 1 || Math.abs(dy) > 1) {
        s.targetAngle = Math.atan2(dy, dx);
        s.targetGlow = 0.5;
      }
      s.tx = x;
      s.ty = y;
    };

    const onLeave = () => {
      if (!s.usingTilt) s.targetGlow = 0.18;
    };

    // ===== Setup =====
    resize();
    window.addEventListener("resize", resize);

    const hasTilt = typeof window.DeviceOrientationEvent !== "undefined";
    // iOS 13+ requires explicit permission
    if (hasTilt && typeof DeviceOrientationEvent.requestPermission === "function") {
      setNeedsPermission(true);
    } else if (hasTilt) {
      // Android / older iOS: listen directly
      window.addEventListener("deviceorientation", onTilt, true);
    } else {
      // Desktop fallback
      window.addEventListener("mousemove", onMove);
      window.addEventListener("touchmove", onMove, { passive: true });
      window.addEventListener("mouseleave", onLeave);
    }

    let raf;
    const render = () => {
      s.t += 0.008;

      s.mx += (s.tx - s.mx) * 0.08;
      s.my += (s.ty - s.my) * 0.08;
      s.glow += (s.targetGlow - s.glow) * 0.04;

      let da = s.targetAngle - s.angle;
      while (da > Math.PI) da -= Math.PI * 2;
      while (da < -Math.PI) da += Math.PI * 2;
      s.angle += da * 0.06;

      const { w, h, mx, my, angle, glow, t } = s;
      ctx.clearRect(0, 0, w, h);

      // Underglow follows tilt direction
      const glowRadius = Math.max(w, h) * 0.85;
      const gx = mx + Math.cos(angle) * 140;
      const gy = my + Math.sin(angle) * 140;
      const grad = ctx.createRadialGradient(gx, gy, 0, gx, gy, glowRadius);
      const hue = 190 + Math.sin(angle) * 30;
      const g = Math.min(1, glow);
      grad.addColorStop(0, `hsla(${hue}, 100%, 65%, ${g})`);
      grad.addColorStop(0.25, `hsla(${hue + 15}, 100%, 55%, ${g * 0.7})`);
      grad.addColorStop(0.6, `hsla(${hue + 25}, 100%, 45%, ${g * 0.3})`);
      grad.addColorStop(1, "hsla(200, 100%, 40%, 0)");
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, w, h);

      // Secondary bloom for extra punch when tilting hard
      if (g > 0.5) {
        const bloom = ctx.createRadialGradient(gx, gy, 0, gx, gy, glowRadius * 0.45);
        bloom.addColorStop(0, `hsla(${hue - 10}, 100%, 75%, ${(g - 0.5) * 0.8})`);
        bloom.addColorStop(1, "hsla(200, 100%, 50%, 0)");
        ctx.fillStyle = bloom;
        ctx.fillRect(0, 0, w, h);
      }

      // Directional beam matching tilt angle
      ctx.save();
      ctx.translate(mx, my);
      ctx.rotate(angle);
      const beamLen = 400;
      const beamGrad = ctx.createLinearGradient(0, 0, beamLen, 0);
      beamGrad.addColorStop(0, `hsla(${hue}, 100%, 70%, ${g * 0.7})`);
      beamGrad.addColorStop(0.5, `hsla(${hue + 10}, 100%, 60%, ${g * 0.3})`);
      beamGrad.addColorStop(1, "hsla(200, 100%, 50%, 0)");
      ctx.fillStyle = beamGrad;
      ctx.beginPath();
      ctx.moveTo(0, -3);
      ctx.lineTo(beamLen, -55);
      ctx.lineTo(beamLen, 55);
      ctx.lineTo(0, 3);
      ctx.closePath();
      ctx.fill();
      ctx.restore();

      // DNA helix columns
      const cols = Math.max(3, Math.ceil(w / 180));
      const colW = w / cols;
      for (let c = 0; c < cols; c++) {
        const cx = colW * c + colW / 2;
        drawHelix(ctx, cx, h, t + c * 0.6, colW * 0.32, glow);
      }

      drawParticles(ctx, w, h, t, mx, my);

      raf = requestAnimationFrame(render);
    };
    render();

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
      window.removeEventListener("deviceorientation", onTilt, true);
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("touchmove", onMove);
      window.removeEventListener("mouseleave", onLeave);
    };
  }, []);

  // iOS permission request
  const requestTiltPermission = async () => {
    setRequesting(true);
    try {
      const res = await DeviceOrientationEvent.requestPermission();
      if (res === "granted") {
        window.addEventListener("deviceorientation", (e) => {
          const s = stateRef.current;
          const gamma = e.gamma ?? 0;
          const beta = e.beta ?? 0;
          const dx = Math.max(-1, Math.min(1, gamma / 45));
          const dy = Math.max(-1, Math.min(1, (beta - 30) / 45));
          const magnitude = Math.sqrt(dx * dx + dy * dy);
          if (magnitude > 0.03) {
            s.targetAngle = Math.atan2(dy, dx);
            s.targetGlow = 0.4 + Math.min(1.4, magnitude * 1.6);
          } else {
            s.targetGlow = 0.22;
          }
          s.tx = s.w / 2 + dx * (s.w * 0.4);
          s.ty = s.h / 2 + dy * (s.h * 0.4);
          s.usingTilt = true;
        }, true);
        setNeedsPermission(false);
      }
    } catch {
      // ignore
    } finally {
      setRequesting(false);
    }
  };

  return (
    <>
      <canvas
        ref={canvasRef}
        className="absolute inset-0 pointer-events-none"
        style={{ opacity: 1 }}
        aria-hidden="true"
      />
      {needsPermission && (
        <div className="absolute inset-x-0 bottom-24 z-20 flex justify-center px-4 pointer-events-none">
          <button
            onClick={requestTiltPermission}
            className="pointer-events-auto px-4 py-2 rounded-full cyber-frame text-blue-200/70 text-[11px] font-cyber tracking-wider flex items-center gap-2"
          >
            {requesting ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 ai-dot" />
            )}
            TILT TO LIGHT UP THE RADAR
          </button>
        </div>
      )}
    </>
  );
}

function drawHelix(ctx, cx, h, t, amp, glow) {
  const segments = Math.ceil(h / 22);
  const step = h / segments;
  for (let i = 0; i <= segments; i++) {
    const y = i * step;
    const phase = i * 0.45 + t * 2.2;
    const x1 = cx + Math.sin(phase) * amp;
    const x2 = cx + Math.sin(phase + Math.PI) * amp;
    const z1 = Math.cos(phase);
    const z2 = Math.cos(phase + Math.PI);

    if (i % 2 === 0) {
      const rungAlpha = 0.04 + 0.06 * glow;
      ctx.strokeStyle = `rgba(120, 200, 255, ${rungAlpha})`;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(x1, y);
      ctx.lineTo(x2, y);
      ctx.stroke();
    }

    const r1 = 1.2 + (z1 + 1) * 1.6;
    const a1 = 0.1 + (z1 + 1) * 0.25 * glow + 0.05;
    ctx.fillStyle = `rgba(80, 180, 255, ${a1})`;
    ctx.beginPath();
    ctx.arc(x1, y, r1, 0, Math.PI * 2);
    ctx.fill();

    const r2 = 1.2 + (z2 + 1) * 1.6;
    const a2 = 0.1 + (z2 + 1) * 0.25 * glow + 0.05;
    ctx.fillStyle = `rgba(40, 220, 255, ${a2})`;
    ctx.beginPath();
    ctx.arc(x2, y, r2, 0, Math.PI * 2);
    ctx.fill();
  }
}

const particles = Array.from({ length: 36 }, () => ({
  x: Math.random(),
  y: Math.random(),
  r: Math.random() * 1.5 + 0.4,
  s: Math.random() * 0.3 + 0.1,
}));

function drawParticles(ctx, w, h, t, mx, my) {
  for (const p of particles) {
    p.x += Math.sin(t + p.y * 6) * 0.0004 + p.s * 0.0006;
    p.y -= p.s * 0.0004;
    if (p.y < 0) p.y = 1;
    if (p.x > 1) p.x = 0;
    const px = p.x * w;
    const py = p.y * h;
    const dx = px - mx;
    const dy = py - my;
    const dist = Math.sqrt(dx * dx + dy * dy);
    const near = Math.max(0, 1 - dist / 200);
    const alpha = 0.08 + near * 0.5;
    ctx.fillStyle = `rgba(120, 220, 255, ${alpha})`;
    ctx.beginPath();
    ctx.arc(px, py, p.r + near * 1.2, 0, Math.PI * 2);
    ctx.fill();
  }
}