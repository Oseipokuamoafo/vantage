import { useEffect, useRef } from 'react';

/**
 * Live topographic background. A slowly drifting terrain is contoured with marching squares;
 * the pointer raises a hill (contours bend around it and pick up the accent color) and a click
 * sends a ripple across the terrain. Decorative only: aria-hidden and pointer-events: none.
 *
 * Performance: ~30 fps cap, paused while the tab is hidden, DPR capped at 1.5.
 * Reduced motion: drawn once, no drift and no pointer response.
 * Low-power devices: no drift; redraws only when the pointer moves.
 */

const CELL = 22; // px between field samples
const LEVEL_MIN = -1.3;
const LEVEL_MAX = 2.0;
const LEVEL_STEP = 0.11;
const INDEX_EVERY = 5; // every fifth contour is a thicker "index contour", as on survey maps
const FRAME_MS = 33;

interface Ripple {
  x: number;
  y: number;
  t0: number;
}

export function TopoBackground({ strength = 1 }: { strength?: number }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const strengthRef = useRef(strength);
  strengthRef.current = strength;

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) return;

    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const nav = navigator as Navigator & { connection?: { saveData?: boolean } };
    const lowPower = (nav.hardwareConcurrency ?? 8) <= 2 || nav.connection?.saveData === true;

    let w = 0;
    let h = 0;
    let cols = 0;
    let rows = 0;
    let field = new Float32Array(0);
    const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
    const pointer = { x: -1e4, y: -1e4, tx: -1e4, ty: -1e4, s: 0, ts: 0 };
    const ripples: Ripple[] = [];
    let raf = 0;
    let last = 0;
    let dirty = true;
    const start = performance.now();

    function resize() {
      w = window.innerWidth;
      h = window.innerHeight;
      canvas!.width = Math.round(w * dpr);
      canvas!.height = Math.round(h * dpr);
      ctx!.setTransform(dpr, 0, 0, dpr, 0, 0);
      cols = Math.ceil(w / CELL) + 2;
      rows = Math.ceil(h / CELL) + 2;
      field = new Float32Array(cols * rows);
      dirty = true;
    }

    function elevation(x: number, y: number, t: number): number {
      let v =
        0.55 * Math.sin(x * 0.0042 + t * 0.05) * Math.cos(y * 0.0051 - t * 0.04) +
        0.35 * Math.sin((x + y) * 0.0031 + 1.7 + t * 0.03) +
        0.25 * Math.cos(x * 0.0093 - y * 0.0067 + t * 0.06) +
        0.18 * Math.sin(Math.hypot(x - w * 0.72, y - h * 0.28) * 0.012 - t * 0.08);
      if (pointer.s > 0.002) {
        const dx = x - pointer.x;
        const dy = y - pointer.y;
        v += 1.15 * pointer.s * Math.exp(-(dx * dx + dy * dy) / 24000);
      }
      for (const r of ripples) {
        const age = t - r.t0;
        const radius = age * 280;
        const d = Math.hypot(x - r.x, y - r.y) - radius;
        v += 0.55 * Math.exp(-age * 1.5) * Math.exp(-(d * d) / 1800);
      }
      return v;
    }

    function draw(t: number) {
      const s = strengthRef.current;
      for (let j = 0; j < rows; j++) {
        for (let i = 0; i < cols; i++) field[j * cols + i] = elevation(i * CELL, j * CELL, t);
      }
      ctx!.clearRect(0, 0, w, h);
      ctx!.lineJoin = 'round';

      // Lines near the pointer take on the accent color.
      const active = pointer.s > 0.02;

      let levelIndex = 0;
      for (let level = LEVEL_MIN; level <= LEVEL_MAX; level += LEVEL_STEP, levelIndex++) {
        const isIndex = levelIndex % INDEX_EVERY === 0;
        const base = (isIndex ? 0.17 : 0.085) * s;
        ctx!.beginPath();
        for (let j = 0; j < rows - 1; j++) {
          for (let i = 0; i < cols - 1; i++) {
            const a = field[j * cols + i]!;
            const b = field[j * cols + i + 1]!;
            const c = field[(j + 1) * cols + i + 1]!;
            const d = field[(j + 1) * cols + i]!;
            const idx =
              (a > level ? 8 : 0) | (b > level ? 4 : 0) | (c > level ? 2 : 0) | (d > level ? 1 : 0);
            if (idx === 0 || idx === 15) continue;
            const x = i * CELL;
            const y = j * CELL;
            const top = (): [number, number] => [x + CELL * ((level - a) / (b - a)), y];
            const right = (): [number, number] => [x + CELL, y + CELL * ((level - b) / (c - b))];
            const bottom = (): [number, number] => [x + CELL * ((level - d) / (c - d)), y + CELL];
            const left = (): [number, number] => [x, y + CELL * ((level - a) / (d - a))];
            const seg = (p: [number, number], q: [number, number]) => {
              ctx!.moveTo(p[0], p[1]);
              ctx!.lineTo(q[0], q[1]);
            };
            switch (idx) {
              case 1:
              case 14:
                seg(left(), bottom());
                break;
              case 2:
              case 13:
                seg(bottom(), right());
                break;
              case 3:
              case 12:
                seg(left(), right());
                break;
              case 4:
              case 11:
                seg(top(), right());
                break;
              case 6:
              case 9:
                seg(top(), bottom());
                break;
              case 7:
              case 8:
                seg(left(), top());
                break;
              case 5:
                seg(left(), top());
                seg(bottom(), right());
                break;
              case 10:
                seg(top(), right());
                seg(left(), bottom());
                break;
            }
          }
        }
        if (active) {
          const g = ctx!.createRadialGradient(pointer.x, pointer.y, 0, pointer.x, pointer.y, 240);
          g.addColorStop(0, `rgba(31,79,216,${Math.min(0.75, base * 4.2 * pointer.s + base)})`);
          g.addColorStop(1, `rgba(15,42,38,${base})`);
          ctx!.strokeStyle = g;
        } else {
          ctx!.strokeStyle = `rgba(15,42,38,${base})`;
        }
        ctx!.lineWidth = isIndex ? 1.35 : 0.8;
        ctx!.stroke();
      }
    }

    function frame(now: number) {
      raf = requestAnimationFrame(frame);
      if (now - last < FRAME_MS) return;
      last = now;
      const t = lowPower ? 0 : (now - start) / 1000;
      // Ease the pointer hill toward its target so it trails the cursor.
      pointer.x += (pointer.tx - pointer.x) * 0.14;
      pointer.y += (pointer.ty - pointer.y) * 0.14;
      pointer.s += (pointer.ts - pointer.s) * 0.08;
      while (ripples.length && t - ripples[0]!.t0 > 3) ripples.shift();
      const settling = Math.abs(pointer.ts - pointer.s) > 0.003 || ripples.length > 0;
      if (lowPower && !dirty && !settling) return;
      dirty = false;
      draw(t);
    }

    const onMove = (e: PointerEvent) => {
      if (pointer.ts === 0) {
        pointer.x = e.clientX;
        pointer.y = e.clientY;
      }
      pointer.tx = e.clientX;
      pointer.ty = e.clientY;
      pointer.ts = 1;
      dirty = true;
    };
    const onLeave = () => {
      pointer.ts = 0;
    };
    const onDown = (e: PointerEvent) => {
      ripples.push({
        x: e.clientX,
        y: e.clientY,
        t0: lowPower ? 0 : (performance.now() - start) / 1000,
      });
      if (ripples.length > 4) ripples.shift();
    };
    const onVisibility = () => {
      cancelAnimationFrame(raf);
      if (!document.hidden && !reduceMotion) raf = requestAnimationFrame(frame);
    };

    resize();
    if (reduceMotion) {
      draw(0);
      const onResize = () => {
        resize();
        draw(0);
      };
      window.addEventListener('resize', onResize);
      return () => window.removeEventListener('resize', onResize);
    }

    window.addEventListener('resize', resize);
    window.addEventListener('pointermove', onMove, { passive: true });
    window.addEventListener('pointerdown', onDown, { passive: true });
    document.documentElement.addEventListener('pointerleave', onLeave);
    document.addEventListener('visibilitychange', onVisibility);
    raf = requestAnimationFrame(frame);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', resize);
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerdown', onDown);
      document.documentElement.removeEventListener('pointerleave', onLeave);
      document.removeEventListener('visibilitychange', onVisibility);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 z-0 h-full w-full"
    />
  );
}
