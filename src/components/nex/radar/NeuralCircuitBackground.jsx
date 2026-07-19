import React, { useRef, useEffect, useState } from "react";
import { Loader2 } from "lucide-react";

/**
 * NeuralCircuitBackground
 *
 * A hidden layer of circuitry behind the NEX2 radar.
 * - Dark & invisible by default.
 * - Tilting the phone reveals the circuit grid in the tilt direction.
 * - Tilt magnitude increases circuit brightness.
 * - Parallax depth, soft node pulses, minimal ambient dust.
 *
 * Desktop preview falls back to mouse movement (the API exists on desktop
 * but never fires events, so we probe and switch).
 */

// ---- Pre-generated circuit layout (stable across frames) ----
function buildCircuit(cols, rows) {
  const nodes = [];
  const paths = [];
  const cellW = 1 / cols;
  const cellH = 1 / rows;
  for (let r = 0; r <= rows; r++) {
    for (let c = 0; c <= cols; c++) {
      const jitter = 0.18;
      const x = (c + (Math.random() - 0.5) * jitter) * cellW;
      const y = (r + (Math.random() - 0.5) * jitter) * cellH;
      nodes.push({
        x,
        y,
        gx: c,
        gy: r,
        phase: Math.random() * Math.PI * 2,
        size: Math.random() * 0.6 + 0.5,
      });
    }
  }
  const idx = (c, r) => (r < 0 || r > rows || c < 0 || c > cols) ? -1 : r * (cols + 1) + c;
  for (let r = 0; r <= rows; r++) {
    for (let c = 0; c <= cols; c++) {
      const i = idx(c, r);
      // right neighbor
      if (c < cols && Math.random() > 0.25) {
        paths.push({ a: i, b: idx(c + 1, r) });
      }
      // down neighbor
      if (r < rows && Math.random() > 0.25) {
        paths.push({ a: i, b: idx(c, r + 1) });
      }
      // diagonal (occasional) for organic feel
      if (c < cols && r < rows && Math.random() > 0.8) {
        paths.push({ a: i, b: idx(c + 1, r + 1) });
      }
    }
  }
  return { nodes, paths };
}

export default function NeuralCircuitBackground() {
  const canvasRef = useRef(null);
  const [needsPermission, setNeedsPermission] = useState(false);
  const [requesting, setRequesting] = useState(false);
  const circuitRef = useRef(null);
  const stateRef = useRef({
    w: 0, h: 0, dpr: 1,
    tx: 0, ty: 0,           // target glow center (px)
    mx: 0, my: 0,           // smoothed glow center (px)
    tiltX: 0, tiltY: 0,     // -1..1 normalized tilt vector
    smoothTiltX: 0, smoothTiltY: 0,
    magnitude: 0, smoothMag: 0,
    parallaxX: 0, parallaxY: 0,
    t: 0,
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
      s.w = w; s.h = h; s.dpr = dpr;
      if (s.tx === 0 && s.ty === 0) { s.tx = w / 2; s.ty = h / 2; s.mx = w / 2; s.my = h / 2; }
      // rebuild circuit to match aspect
      const cols = Math.max(6, Math.round(w / 110));
      const rows = Math.max(8, Math.round(h / 110));
      circuitRef.current = buildCircuit(cols, rows);
    };

    // ===== Tilt (phone) =====
    const onTilt = (e) => {
      const gamma = e.gamma ?? 0; // -90..90 left/right
      const beta = e.beta ?? 0;  // -180..180 front/back
      const dx = Math.max(-1, Math.min(1, gamma / 35));
      const dy = Math.max(-1, Math.min(1, (beta - 35) / 35)); // neutral ~35deg
      const mag = Math.sqrt(dx * dx + dy * dy);
      s.tiltX = dx; s.tiltY = dy;
      s.magnitude = mag;
      s.usingTilt = true;
    };

    // ===== Mouse fallback (desktop) =====
    const onMove = (e) => {
      if (s.usingTilt) return;
      const x = e.touches ? e.touches[0].clientX : e.clientX;
      const y = e.touches ? e.touches[0].clientY : e.clientY;
      const dx = (x / s.w - 0.5) * 2;
      const dy = (y / s.h - 0.5) * 2;
      const mag = Math.sqrt(dx * dx + dy * dy);
      s.tiltX = dx; s.tiltY = dy;
      s.magnitude = Math.min(1, mag);
      s.tx = x; s.ty = y;
    };

    resize();
    window.addEventListener("resize", resize);
    circuitRef.current = circuitRef.current || buildCircuit(8, 12);

    const hasTiltAPI = typeof window.DeviceOrientationEvent !== "undefined";
    let mouseBound = false;
    const bindMouse = () => {
      if (mouseBound) return;
      mouseBound = true;
      window.addEventListener("mousemove", onMove);
      window.addEventListener("touchmove", onMove, { passive: true });
    };

    if (hasTiltAPI && typeof DeviceOrientationEvent.requestPermission === "function") {
      setNeedsPermission(true);
    } else if (hasTiltAPI) {
      let gotMotion = false;
      const probe = (e) => {
        if (e.gamma === null && e.beta === null) return;
        gotMotion = true;
        onTilt(e);
      };
      window.addEventListener("deviceorientation", probe, true);
      setTimeout(() => {
        if (!gotMotion) {
          window.removeEventListener("deviceorientation", probe, true);
          bindMouse();
        }
      }, 700);
    } else {
      bindMouse();
    }

    let raf;
    const render = () => {
      s.t += 0.012;

      // smooth tilt
      s.smoothTiltX += (s.tiltX - s.smoothTiltX) * 0.06;
      s.smoothTiltY += (s.tiltY - s.smoothTiltY) * 0.06;
      s.smoothMag += (s.magnitude - s.smoothMag) * 0.05;

      // glow center follows tilt direction (scaled to screen)
      const targetX = s.w / 2 + s.smoothTiltX * (s.w * 0.38);
      const targetY = s.h / 2 + s.smoothTiltY * (s.h * 0.38);
      s.tx += (targetX - s.tx) * 0.08;
      s.ty += (targetY - s.ty) * 0.08;
      s.mx += (s.tx - s.mx) * 0.1;
      s.my += (s.ty - s.my) * 0.1;

      // parallax (opposite direction, subtle)
      s.parallaxX += (-s.smoothTiltX * 24 - s.parallaxX) * 0.05;
      s.parallaxY += (-s.smoothTiltY * 24 - s.parallaxY) * 0.05;

      const { w, h, mx, my, t, smoothMag, parallaxX, parallaxY } = s;
      ctx.clearRect(0, 0, w, h);

      const circuit = circuitRef.current;
      if (!circuit) { raf = requestAnimationFrame(render); return; }

      const reveal = Math.min(1, smoothMag * 1.8); // 0..1 overall brightness, amplified
      // Base ambient (very dim) + reveal — potent
      const baseGlow = 0.02 + reveal * 0.65;

      ctx.save();
      ctx.translate(parallaxX, parallaxY);

      const radius = Math.max(w, h) * 0.55;

      // ---- Draw circuit paths ----
      ctx.lineWidth = 0.6;
      for (let i = 0; i < circuit.paths.length; i++) {
        const p = circuit.paths[i];
        const a = circuit.nodes[p.a];
        const b = circuit.nodes[p.b];
        const ax = a.x * w, ay = a.y * h;
        const bx = b.x * w, by = b.y * h;

        // distance from path midpoint to glow center
        const midX = (ax + bx) / 2;
        const midY = (ay + by) / 2;
        const ddx = midX - mx;
        const ddy = midY - my;
        const dist = Math.sqrt(ddx * ddx + ddy * ddy);
        // proximity falloff — strongest near tilt direction
        const proximity = Math.max(0, 1 - dist / radius);
        const dirDot = (ddx * s.smoothTiltX + ddy * s.smoothTiltY);
        const dirBoost = Math.max(0, dirDot / radius) * reveal;

        const alpha = baseGlow * proximity * 0.8 + dirBoost * 1.1 + 0.02;
        if (alpha < 0.02) continue;

        ctx.strokeStyle = `rgba(60, 180, 255, ${Math.min(0.95, alpha)})`;
        ctx.beginPath();
        ctx.moveTo(ax, ay);
        // L-shaped routing for circuit-board feel
        ctx.lineTo(bx, ay);
        ctx.lineTo(bx, by);
        ctx.stroke();
      }

      // ---- Draw nodes ----
      for (let i = 0; i < circuit.nodes.length; i++) {
        const n = circuit.nodes[i];
        const nx = n.x * w;
        const ny = n.y * h;
        const ddx = nx - mx;
        const ddy = ny - my;
        const dist = Math.sqrt(ddx * ddx + ddy * ddy);
        const proximity = Math.max(0, 1 - dist / radius);
        const pulse = 0.5 + 0.5 * Math.sin(t * 2 + n.phase);
        const dirDot = (ddx * s.smoothTiltX + ddy * s.smoothTiltY);
        const dirBoost = Math.max(0, dirDot / radius) * reveal;

        const nodeAlpha = (baseGlow * proximity * 2.2) + dirBoost * 1.4 + 0.04;
        if (nodeAlpha < 0.03) continue;

        const size = n.size * (1.2 + proximity * 1.8) * (0.8 + pulse * 0.4);

        // glow halo — saturated electric blue
        if (proximity > 0.25 && reveal > 0.08) {
          const halo = ctx.createRadialGradient(nx, ny, 0, nx, ny, size * 8);
          halo.addColorStop(0, `rgba(80, 200, 255, ${Math.min(0.8, nodeAlpha * 0.7 * proximity)})`);
          halo.addColorStop(0.4, `rgba(50, 150, 255, ${nodeAlpha * 0.3 * proximity})`);
          halo.addColorStop(1, "rgba(30, 100, 220, 0)");
          ctx.fillStyle = halo;
          ctx.beginPath();
          ctx.arc(nx, ny, size * 8, 0, Math.PI * 2);
          ctx.fill();
        }

        ctx.fillStyle = `rgba(170, 230, 255, ${Math.min(1, nodeAlpha)})`;
        ctx.beginPath();
        ctx.arc(nx, ny, size, 0, Math.PI * 2);
        ctx.fill();
      }

      ctx.restore();

      // ---- Soft directional bloom (tilt direction) ----
      if (reveal > 0.08) {
        const bloomR = Math.max(w, h) * 0.65;
        const bx = mx;
        const by = my;
        const bg = ctx.createRadialGradient(bx, by, 0, bx, by, bloomR);
        const bloomA = reveal * 0.26;
        bg.addColorStop(0, `rgba(50, 150, 255, ${bloomA})`);
        bg.addColorStop(0.4, `rgba(40, 120, 255, ${bloomA * 0.45})`);
        bg.addColorStop(1, "rgba(20, 70, 200, 0)");
        ctx.fillStyle = bg;
        ctx.fillRect(0, 0, w, h);
      }

      // ---- Ambient dust ----
      drawDust(ctx, w, h, t, mx, my, reveal);

      raf = requestAnimationFrame(render);
    };
    render();

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
      window.removeEventListener("deviceorientation", onTilt, true);
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("touchmove", onMove);
    };
  }, []);

  const requestTiltPermission = async () => {
    setRequesting(true);
    try {
      const res = await DeviceOrientationEvent.requestPermission();
      if (res === "granted") {
        window.addEventListener("deviceorientation", (e) => {
          const s = stateRef.current;
          const gamma = e.gamma ?? 0;
          const beta = e.beta ?? 0;
          const dx = Math.max(-1, Math.min(1, gamma / 35));
          const dy = Math.max(-1, Math.min(1, (beta - 35) / 35));
          s.tiltX = dx; s.tiltY = dy;
          s.magnitude = Math.sqrt(dx * dx + dy * dy);
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
            TILT TO REVEAL THE GRID
          </button>
        </div>
      )}
    </>
  );
}

const dust = Array.from({ length: 28 }, () => ({
  x: Math.random(),
  y: Math.random(),
  r: Math.random() * 1.2 + 0.3,
  s: Math.random() * 0.2 + 0.05,
  phase: Math.random() * Math.PI * 2,
}));

function drawDust(ctx, w, h, t, mx, my, reveal) {
  for (const p of dust) {
    p.x += p.s * 0.0006;
    p.y -= p.s * 0.0003;
    if (p.x > 1) p.x = 0;
    if (p.y < 0) p.y = 1;
    const px = p.x * w;
    const py = p.y * h;
    const dx = px - mx;
    const dy = py - my;
    const dist = Math.sqrt(dx * dx + dy * dy);
    const near = Math.max(0, 1 - dist / 240);
    const alpha = 0.04 + near * 0.5 * (0.4 + reveal);
    const twinkle = 0.6 + 0.4 * Math.sin(t * 3 + p.phase);
    ctx.fillStyle = `rgba(160, 220, 255, ${alpha * twinkle})`;
    ctx.beginPath();
    ctx.arc(px, py, p.r + near * 0.8, 0, Math.PI * 2);
    ctx.fill();
  }
}