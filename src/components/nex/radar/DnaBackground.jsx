import React, { useRef, useEffect } from "react";

/**
 * DnaBackground — interactive futuristic background behind the radar.
 * Draws a DNA double-helix structure that gently flows, plus an underglow
 * that follows the mouse / touch and rotates to match movement angle.
 */
export default function DnaBackground() {
  const canvasRef = useRef(null);
  const stateRef = useRef({
    w: 0,
    h: 0,
    mx: 0,
    my: 0,
    tx: 0,
    ty: 0,
    angle: 0,
    targetAngle: 0,
    glow: 0.25,
    targetGlow: 0.25,
    t: 0,
    dpr: 1,
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

    const onMove = (e) => {
      const x = e.touches ? e.touches[0].clientX : e.clientX;
      const y = e.touches ? e.touches[0].clientY : e.clientY;
      const dx = x - s.tx;
      const dy = y - s.ty;
      if (Math.abs(dx) > 1 || Math.abs(dy) > 1) {
        s.targetAngle = Math.atan2(dy, dx);
        s.targetGlow = 0.55;
      }
      s.tx = x;
      s.ty = y;
    };

    const onLeave = () => {
      s.targetGlow = 0.2;
    };

    resize();
    window.addEventListener("resize", resize);
    window.addEventListener("mousemove", onMove);
    window.addEventListener("touchmove", onMove, { passive: true });
    window.addEventListener("mouseleave", onLeave);

    let raf;
    const render = () => {
      s.t += 0.008;

      // Smooth interpolation
      s.mx += (s.tx - s.mx) * 0.08;
      s.my += (s.ty - s.my) * 0.08;
      s.glow += (s.targetGlow - s.glow) * 0.04;

      // Smooth angle interpolation (shortest path)
      let da = s.targetAngle - s.angle;
      while (da > Math.PI) da -= Math.PI * 2;
      while (da < -Math.PI) da += Math.PI * 2;
      s.angle += da * 0.06;

      const { w, h, mx, my, angle, glow, t } = s;

      ctx.clearRect(0, 0, w, h);

      // ===== Underglow: large radial gradient that follows the mouse =====
      const glowRadius = Math.max(w, h) * 0.7;
      const gx = mx + Math.cos(angle) * 120;
      const gy = my + Math.sin(angle) * 120;
      const grad = ctx.createRadialGradient(gx, gy, 0, gx, gy, glowRadius);
      // Shift hue slightly based on angle for an iridescent feel
      const hue = 195 + Math.sin(angle) * 25;
      grad.addColorStop(0, `hsla(${hue}, 100%, 55%, ${glow})`);
      grad.addColorStop(0.35, `hsla(${hue + 20}, 100%, 50%, ${glow * 0.35})`);
      grad.addColorStop(1, "hsla(200, 100%, 40%, 0)");
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, w, h);

      // ===== Movement streak: a directional light beam matching the angle =====
      ctx.save();
      ctx.translate(mx, my);
      ctx.rotate(angle);
      const beamGrad = ctx.createLinearGradient(0, 0, 320, 0);
      beamGrad.addColorStop(0, `hsla(${hue}, 100%, 60%, ${glow * 0.4})`);
      beamGrad.addColorStop(1, "hsla(200, 100%, 50%, 0)");
      ctx.fillStyle = beamGrad;
      ctx.beginPath();
      ctx.moveTo(0, -2);
      ctx.lineTo(320, -40);
      ctx.lineTo(320, 40);
      ctx.lineTo(0, 2);
      ctx.closePath();
      ctx.fill();
      ctx.restore();

      // ===== DNA double helix =====
      // Vertical helix centered, multiple columns offset across width
      const cols = Math.max(3, Math.ceil(w / 180));
      const colW = w / cols;
      for (let c = 0; c < cols; c++) {
        const cx = colW * c + colW / 2;
        drawHelix(ctx, cx, h, t + c * 0.6, colW * 0.32, glow);
      }

      // ===== Floating particles =====
      drawParticles(ctx, w, h, t, mx, my);

      raf = requestAnimationFrame(render);
    };
    render();

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("touchmove", onMove);
      window.removeEventListener("mouseleave", onLeave);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 pointer-events-none"
      style={{ opacity: 0.85 }}
      aria-hidden="true"
    />
  );
}

/**
 * Draws a single vertical DNA double-helix column.
 */
function drawHelix(ctx, cx, h, t, amp, glow) {
  const segments = Math.ceil(h / 22);
  const step = h / segments;
  for (let i = 0; i <= segments; i++) {
    const y = i * step;
    const phase = i * 0.45 + t * 2.2;
    const x1 = cx + Math.sin(phase) * amp;
    const x2 = cx + Math.sin(phase + Math.PI) * amp;
    const z1 = Math.cos(phase); // -1..1, used for depth shading
    const z2 = Math.cos(phase + Math.PI);

    // Rungs (connectors between the two strands) — faint
    if (i % 2 === 0) {
      const rungAlpha = 0.04 + 0.06 * glow;
      ctx.strokeStyle = `rgba(120, 200, 255, ${rungAlpha})`;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(x1, y);
      ctx.lineTo(x2, y);
      ctx.stroke();
    }

    // Strand 1 node
    const r1 = 1.2 + (z1 + 1) * 1.6;
    const a1 = 0.1 + (z1 + 1) * 0.25 * glow + 0.05;
    ctx.fillStyle = `rgba(80, 180, 255, ${a1})`;
    ctx.beginPath();
    ctx.arc(x1, y, r1, 0, Math.PI * 2);
    ctx.fill();

    // Strand 2 node
    const r2 = 1.2 + (z2 + 1) * 1.6;
    const a2 = 0.1 + (z2 + 1) * 0.25 * glow + 0.05;
    ctx.fillStyle = `rgba(40, 220, 255, ${a2})`;
    ctx.beginPath();
    ctx.arc(x2, y, r2, 0, Math.PI * 2);
    ctx.fill();
  }
}

// Lightweight particle field that drifts toward the cursor
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