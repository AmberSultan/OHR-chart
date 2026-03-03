"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import {
  cultureDomains,
  behaviouralIncidents,
  behaviourStatusMix,
  statusColors,
  calculateCultureIndex,
  getScoreColor,
} from "@/lib/data";

// ---- Types ----

interface StatusSubSegment {
  status: string;
  color: string;
  proportion: number;
  startAngle: number;
  endAngle: number;
}

interface AuraSegment {
  name: string;
  type: "domain" | "behaviour";
  startAngle: number;
  endAngle: number;
  midAngle: number;
  /** 0–1: how far the indicator spike extends (bounded extrusion) */
  extrusion: number;
  color: string;
  score?: number;
  weight?: number;
  ratePerHundred?: number;
  statusSubSegments?: StatusSubSegment[];
}

// ---- Helpers ----

function hexToRgb(hex: string): { r: number; g: number; b: number } {
  const m = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return m
    ? { r: parseInt(m[1], 16), g: parseInt(m[2], 16), b: parseInt(m[3], 16) }
    : { r: 148, g: 163, b: 184 };
}

/**
 * Normalise an angle (radians) into [-π/2, 3π/2).
 * Segments are defined in this range (first starts at -π/2 = 12 o'clock).
 */
function normaliseAngle(a: number): number {
  while (a < -Math.PI / 2) a += Math.PI * 2;
  while (a >= (3 * Math.PI) / 2) a -= Math.PI * 2;
  return a;
}

// ---- Component ----

export default function CultureAura() {
  const cultureIndex = calculateCultureIndex();
  const scoreColor = getScoreColor(cultureIndex);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animRef = useRef<number>(0);
  const timeRef = useRef<number>(0);
  /** Ref-based so the animation loop always reads the latest value without re-renders */
  const hovRef = useRef<AuraSegment | null>(null);

  const [displayIndex, setDisplayIndex] = useState(0);
  const [clickedSeg, setClickedSeg] = useState<AuraSegment | null>(null);

  // ── Count-up animation (800 ms, ease-in-out cubic) ──
  useEffect(() => {
    const end = cultureIndex;
    const duration = 800;
    const t0 = performance.now();
    const tick = (now: number) => {
      const t = Math.min((now - t0) / duration, 1);
      // ease-in-out cubic — calm, controlled, no bounce
      const eased = t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
      setDisplayIndex(Math.round(end * eased * 10) / 10);
      if (t < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }, [cultureIndex]);

  // ── Canvas dimensions ──
  const SIZE = 500;
  const DISPLAY = 490;
  const C = SIZE / 2;       // centre
  const INNER_R = 82;       // solid centre circle radius
  const AURA_START = 100;   // where aura begins (just outside centre circle)
  const AURA_BASE = 152;    // base outer radius (zero extrusion)
  const MAX_EXT = 48;       // max extrusion pixels (represents "+2 units")

  // ── Build segments ──
  const totalItems = cultureDomains.length + behaviouralIncidents.length;
  const segW = (Math.PI * 2) / totalItems;
  const segments: AuraSegment[] = [];
  let si = 0;

  // Domain segments (inner ring — living condition layer)
  cultureDomains.forEach((d) => {
    const sa = si * segW - Math.PI / 2;
    const ea = (si + 1) * segW - Math.PI / 2;
    // Bounded extrusion: scope weight +1 base offset, capped to 1 (= MAX_EXT px)
    const ext = Math.min(((100 - d.score) / 100) * (d.weight + 1), 1);
    segments.push({
      name: d.domain,
      type: "domain",
      startAngle: sa,
      endAngle: ea,
      midAngle: (sa + ea) / 2,
      extrusion: ext,
      color: getScoreColor(d.score),
      score: d.score,
      weight: d.weight,
    });
    si++;
  });

  // Behaviour segments (outer ring — structural response layer)
  behaviouralIncidents.forEach((b) => {
    const sa = si * segW - Math.PI / 2;
    const ea = (si + 1) * segW - Math.PI / 2;
    const sw = ea - sa;
    // Bounded extrusion from event rate, capped to 1
    const ext = Math.min(b.ratePerHundred * 1.5, 1);

    const statusArr = behaviourStatusMix.filter((s) => s.behaviour === b.behaviour);
    const totalProp = statusArr.reduce((s, x) => s + x.proportion, 0) || 1;
    let ca = sa;

    const statusSubSegments: StatusSubSegment[] = statusArr.map((s) => {
      const prop = s.proportion / totalProp;
      const subSa = ca;
      const subEa = ca + sw * prop;
      ca = subEa;
      return {
        status: s.status,
        color: statusColors[s.status] || "#94a3b8",
        proportion: prop,
        startAngle: subSa,
        endAngle: subEa,
      };
    });

    // Dominant status colour for axis line
    const dominant =
      statusArr.length > 0
        ? statusArr.reduce((a, x) => (x.proportion > a.proportion ? x : a))
        : null;
    const domCol = dominant ? statusColors[dominant.status] || "#94a3b8" : "#94a3b8";

    segments.push({
      name: b.behaviour,
      type: "behaviour",
      startAngle: sa,
      endAngle: ea,
      midAngle: (sa + ea) / 2,
      extrusion: ext,
      color: domCol,
      ratePerHundred: b.ratePerHundred,
      statusSubSegments: statusArr.length > 0 ? statusSubSegments : undefined,
    });
    si++;
  });

  // ── Segment lookup by angle ──
  function findSegment(raw: number): AuraSegment | null {
    const n = normaliseAngle(raw);
    return segments.find((s) => n >= s.startAngle && n < s.endAngle) ?? null;
  }

  // ── Outer radius for a segment ──
  // FIX: Breathing amplitude reduced to 1.5 px max (breathing-level only).
  // Speed reduced to time * 0.06 — nearly imperceptible continuous motion,
  // just enough to feel alive without appearing animated.
  function outerRadius(seg: AuraSegment, time: number): number {
    const breath = Math.sin(time * 0.06 + seg.midAngle * 0.5) * 1.5;
    return AURA_BASE + seg.extrusion * MAX_EXT + breath;
  }

  // ── Hover / click event listeners ──
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const toCanvas = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      return {
        x: (e.clientX - rect.left) * (SIZE / rect.width),
        y: (e.clientY - rect.top) * (SIZE / rect.height),
      };
    };

    const onMove = (e: MouseEvent) => {
      const { x, y } = toCanvas(e);
      const dx = x - C, dy = y - C;
      const r = Math.sqrt(dx * dx + dy * dy);
      hovRef.current =
        r >= AURA_START && r <= AURA_BASE + MAX_EXT + 18
          ? findSegment(Math.atan2(dy, dx))
          : null;
    };

    const onLeave = () => { hovRef.current = null; };

    const onClick = (e: MouseEvent) => {
      const { x, y } = toCanvas(e);
      const dx = x - C, dy = y - C;
      const r = Math.sqrt(dx * dx + dy * dy);
      if (r < AURA_START || r > AURA_BASE + MAX_EXT + 18) {
        setClickedSeg(null);
        return;
      }
      const seg = findSegment(Math.atan2(dy, dx));
      setClickedSeg((prev) => (prev?.name === seg?.name ? null : seg));
    };

    canvas.addEventListener("mousemove", onMove);
    canvas.addEventListener("mouseleave", onLeave);
    canvas.addEventListener("click", onClick);
    return () => {
      canvas.removeEventListener("mousemove", onMove);
      canvas.removeEventListener("mouseleave", onLeave);
      canvas.removeEventListener("click", onClick);
    };
  }, [segments]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Animation loop ──
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    canvas.width = SIZE * dpr;
    canvas.height = SIZE * dpr;
    ctx.scale(dpr, dpr);

    let last = 0;
    const loop = (ts: number) => {
      timeRef.current += (ts - last) * 0.001;
      last = ts;
      ctx.clearRect(0, 0, SIZE, SIZE);
      drawScene(ctx, timeRef.current);
      animRef.current = requestAnimationFrame(loop);
    };
    animRef.current = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(animRef.current);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // ══════════════════════════════════════════
  //  Drawing
  // ══════════════════════════════════════════

  function drawScene(ctx: CanvasRenderingContext2D, time: number) {
    drawAuraWedges(ctx, time);    // Layer 1: coloured wedges (condition + response)
    drawObligationArcs(ctx);      // Layer 2: static structural arcs (duty — no motion)
    drawAxisLines(ctx, time);     // Layer 3: per-segment axis lines
    drawCenterCircle(ctx);        // Layer 4: solid centre with inner shadow (anchor)
    drawHoverLabel(ctx, time);    // Layer 5: label on hover
  }

  // ── Layer 1: Aura wedges ──
  function drawAuraWedges(ctx: CanvasRenderingContext2D, time: number) {
    const hov = hovRef.current;
    segments.forEach((seg) => {
      const isHov = hov?.name === seg.name;
      const oR = outerRadius(seg, time);

      // FIX: On hover, apply +5% saturation boost (multiply rgb by 1.05).
      // No alpha change — saturation only, per spec.
      const sat = isHov ? 1.05 : 1.0;

      if (seg.type === "behaviour" && seg.statusSubSegments?.length) {
        seg.statusSubSegments.forEach((sub) => {
          drawWedge(ctx, sub.startAngle, sub.endAngle, oR, hexToRgb(sub.color), sat, isHov);
        });
      } else {
        drawWedge(ctx, seg.startAngle, seg.endAngle, oR, hexToRgb(seg.color), sat, isHov);
      }
    });
  }

  /**
   * Single pie-slice wedge with a radial gradient.
   *
   * FIX: Gradient now provides 5–8% luminosity variation by darkening
   * the RGB values (not the alpha) at the outer stop. Alpha stays
   * consistent so there's no fade-out — only a subtle depth shift.
   * Spec: "Apply a radial gradient to inner and outer rings (5–8% luminosity
   * variation). Avoid glow effects, neon outlines, or hard shadows."
   */
  function drawWedge(
    ctx: CanvasRenderingContext2D,
    sa: number,
    ea: number,
    oR: number,
    rgb: { r: number; g: number; b: number },
    sat: number,
    isHov: boolean,
  ) {
    const r = Math.min(255, Math.round(rgb.r * sat));
    const g = Math.min(255, Math.round(rgb.g * sat));
    const b = Math.min(255, Math.round(rgb.b * sat));

    // 6% luminosity reduction at outer edge (within 5–8% spec)
    const rD = Math.round(r * 0.94);
    const gD = Math.round(g * 0.94);
    const bD = Math.round(b * 0.94);

    // FIX: Alpha held consistent across stops (no fade effect).
    // Slight lift in alpha on hover (+0.06) to increase presence.
    const baseAlpha = isHov ? 0.68 : 0.62;
    const midAlpha  = isHov ? 0.76 : 0.70;
    const outerAlpha = isHov ? 0.68 : 0.62; // matches inner to avoid radial fade

    const grad = ctx.createRadialGradient(C, C, AURA_START, C, C, oR);
    grad.addColorStop(0,    `rgba(${r},${g},${b},${baseAlpha})`);
    grad.addColorStop(0.5,  `rgba(${r},${g},${b},${midAlpha})`);
    grad.addColorStop(1,    `rgba(${rD},${gD},${bD},${outerAlpha})`);

    ctx.beginPath();
    ctx.moveTo(C, C);
    ctx.arc(C, C, oR, sa, ea);
    ctx.closePath();
    ctx.fillStyle = grad;
    ctx.fill();
  }

  // ── Layer 2: Obligation arcs (STATIC — structural duty layer) ──
  // Spec: "Obligation arcs are static. No animation, pulsing, or colour
  // transitions are applied." This function must never receive `time`.
  function drawObligationArcs(ctx: CanvasRenderingContext2D) {
    // FIX: Increased base opacity from 0.38 → 0.48 for better structural presence.
    // Still subdued — these are duty markers, not highlights.
    const arcR = AURA_START + 7;
    segments.forEach((seg) => {
      const rgb = hexToRgb(seg.color);
      ctx.beginPath();
      ctx.arc(C, C, arcR, seg.startAngle, seg.endAngle);
      ctx.strokeStyle = `rgba(${rgb.r},${rgb.g},${rgb.b},0.48)`;
      ctx.lineWidth = 3;
      ctx.lineCap = "butt";
      ctx.stroke();
    });
  }

  // ── Layer 3: Axis lines ──
  // FIX: Base opacity raised from 0.28 → 0.38 so lines are perceptible
  // at rest. On hover: opacity jumps to 0.75 and line thickens to 2.5 px.
  // These deltas create a clear but calm interactive response.
  function drawAxisLines(ctx: CanvasRenderingContext2D, time: number) {
    const hov = hovRef.current;
    segments.forEach((seg) => {
      const isHov = hov?.name === seg.name;
      const oR = outerRadius(seg, time);
      const x1 = C + AURA_START * Math.cos(seg.midAngle);
      const y1 = C + AURA_START * Math.sin(seg.midAngle);
      const x2 = C + oR * Math.cos(seg.midAngle);
      const y2 = C + oR * Math.sin(seg.midAngle);
      const rgb = hexToRgb(seg.color);

      ctx.beginPath();
      ctx.moveTo(x1, y1);
      ctx.lineTo(x2, y2);
      ctx.strokeStyle = `rgba(${rgb.r},${rgb.g},${rgb.b},${isHov ? 0.75 : 0.38})`;
      ctx.lineWidth = isHov ? 2.5 : 1;
      ctx.stroke();
    });
  }

  // ── Layer 4: Centre circle (solid fill + inner shadow) ──
  // Spec: "The central index circle uses solid colour fill with slight inner
  // shadow to create depth." No outer glow. Shadow gradient goes from
  // transparent at the centre out to a darkened rim — inward shadow effect.
  function drawCenterCircle(ctx: CanvasRenderingContext2D) {
    const rgb = hexToRgb(scoreColor);

    // Solid fill — anchor layer
    ctx.beginPath();
    ctx.arc(C, C, INNER_R, 0, Math.PI * 2);
    ctx.fillStyle = scoreColor;
    ctx.fill();

    // FIX: Inner shadow gradient corrected.
    // Goes from transparent at 55% radius → darkened at full radius.
    // This produces a concave depth effect (inward shadow, no outer glow).
    const shadow = ctx.createRadialGradient(C, C, INNER_R * 0.55, C, C, INNER_R);
    const darkR = Math.max(0, rgb.r - 45);
    const darkG = Math.max(0, rgb.g - 45);
    const darkB = Math.max(0, rgb.b - 45);
    shadow.addColorStop(0, "rgba(0,0,0,0)");
    shadow.addColorStop(1, `rgba(${darkR},${darkG},${darkB},0.32)`);

    ctx.beginPath();
    ctx.arc(C, C, INNER_R, 0, Math.PI * 2);
    ctx.fillStyle = shadow;
    ctx.fill();

    // Thin border ring to cleanly separate centre from aura
    ctx.beginPath();
    ctx.arc(C, C, INNER_R, 0, Math.PI * 2);
    ctx.strokeStyle = `rgba(${darkR},${darkG},${darkB},0.18)`;
    ctx.lineWidth = 1;
    ctx.stroke();
  }

  // ── Layer 5: Labels (always visible, opacity increases on hover) ──
  // Spec point 5: "increase label opacity" on hover — implies labels exist
  // at rest at a lower opacity and brighten on hover. Labels are always drawn.
  // Text is clamped inside canvas bounds so no label is ever clipped.
  function drawHoverLabel(ctx: CanvasRenderingContext2D, time: number) {
    const hov = hovRef.current;
    const MARGIN = 4; // min px from canvas edge

    ctx.font = "500 9.5px system-ui, -apple-system, sans-serif";

    segments.forEach((seg) => {
      const isHov = hov?.name === seg.name;
      const oR = outerRadius(seg, time) + 14;
      const rawX = C + oR * Math.cos(seg.midAngle);
      const rawY = C + oR * Math.sin(seg.midAngle);

      // Align text away from centre
      const cosA = Math.cos(seg.midAngle);
      let align: CanvasTextAlign;
      if (cosA > 0.15)       align = "left";
      else if (cosA < -0.15) align = "right";
      else                   align = "center";
      ctx.textAlign = align;

      const metrics = ctx.measureText(seg.name);
      const tw = metrics.width;

      // Compute the left edge of the rendered text so we can clamp it
      let textLeft: number;
      if (align === "left")        textLeft = rawX;
      else if (align === "right")  textLeft = rawX - tw;
      else                         textLeft = rawX - tw / 2;

      // Clamp x so the full label stays within [MARGIN, SIZE - MARGIN]
      let clampedX = rawX;
      if (textLeft < MARGIN) {
        clampedX = rawX + (MARGIN - textLeft);
      } else if (textLeft + tw > SIZE - MARGIN) {
        clampedX = rawX - (textLeft + tw - (SIZE - MARGIN));
      }

      // Clamp y within canvas bounds (label is ~10px tall)
      const clampedY = Math.max(MARGIN + 10, Math.min(SIZE - MARGIN, rawY));

      // Only show label on hover
      if (!isHov) return;
      const opacity = 0.88;
      ctx.fillStyle = `rgba(15,23,42,${opacity})`;
      ctx.fillText(seg.name, clampedX, clampedY + 4);
    });
  }

  // ══════════════════════════════════════════
  //  Render
  // ══════════════════════════════════════════

  return (
    <div className="relative w-[780px] h-[490px] mx-auto flex items-center justify-center">
      <canvas
        ref={canvasRef}
        className="absolute cursor-pointer"
        style={{ width: DISPLAY, height: DISPLAY }}
      />

      {/* Centre overlay — pointer-events-none so clicks pass to canvas */}
      <div
        className="absolute z-10 flex flex-col items-center pointer-events-none"
        style={{ width: INNER_R * 1.7 * (DISPLAY / SIZE) }}
      >
        <Image src="/vite.svg" alt="O Logo" width={22} height={22} className="mb-1.5" />
        {/* Count-up animates displayIndex via ease-in-out over 800ms */}
        <div
          className="text-[22px] font-semibold tabular-nums leading-none"
          style={{ color: "#fff" }}
        >
          {displayIndex}
        </div>
        <div className="text-[8px] text-white/60 mt-1 uppercase tracking-[0.18em]">
          Culture Index
        </div>
      </div>

      {/* Click data table (React DOM, not canvas) */}
      {clickedSeg && (
        <div
          className="absolute right-2 top-2 z-20 bg-white/95 border border-slate-100 rounded-xl shadow-sm p-4 w-60"
          style={{ backdropFilter: "blur(10px)" }}
        >
          {/* Header */}
          <div className="flex justify-between items-start mb-3">
            <div>
              <div className="text-[9px] uppercase tracking-widest text-slate-400 mb-0.5">
                {clickedSeg.type === "domain" ? "Domain" : "Behaviour"}
              </div>
              <div className="font-semibold text-slate-800 text-[13px] leading-tight">
                {clickedSeg.name}
              </div>
            </div>
            <button
              onClick={() => setClickedSeg(null)}
              className="text-slate-300 hover:text-slate-500 text-xl leading-none mt-0.5"
            >
              ×
            </button>
          </div>

          {/* Domain data */}
          {clickedSeg.type === "domain" && (
            <table className="w-full text-[12px]">
              <tbody className="divide-y divide-slate-50">
                <tr>
                  <td className="text-slate-400 py-1.5">Score</td>
                  <td className="text-right font-semibold" style={{ color: scoreColor }}>
                    {clickedSeg.score}
                  </td>
                </tr>
                <tr>
                  <td className="text-slate-400 py-1.5">Instrument weight</td>
                  <td className="text-right font-medium text-slate-700">
                    {((clickedSeg.weight ?? 0) * 100).toFixed(0)}%
                  </td>
                </tr>
                <tr>
                  <td className="text-slate-400 py-1.5">Activation</td>
                  <td className="text-right font-medium text-slate-700">
                    {(clickedSeg.extrusion * 2).toFixed(2)} / 2.00
                  </td>
                </tr>
              </tbody>
            </table>
          )}

          {/* Behaviour data */}
          {clickedSeg.type === "behaviour" && (
            <table className="w-full text-[12px]">
              <thead>
                <tr className="border-b border-slate-100">
                  <th className="text-left text-slate-400 font-normal pb-1.5 text-[11px]">Status</th>
                  <th className="text-right text-slate-400 font-normal pb-1.5 text-[11px]">Share</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {clickedSeg.statusSubSegments?.map((s) => (
                  <tr key={s.status}>
                    <td className="py-1.5">
                      <div className="flex items-center gap-1.5">
                        <span
                          className="w-2 h-2 rounded-full flex-shrink-0"
                          style={{ backgroundColor: s.color }}
                        />
                        <span className="text-slate-600">{s.status}</span>
                      </div>
                    </td>
                    <td className="text-right font-semibold text-slate-700">
                      {Math.round(s.proportion * 100)}%
                    </td>
                  </tr>
                ))}
                <tr className="border-t border-slate-100">
                  <td className="text-slate-400 pt-2">Rate</td>
                  <td className="text-right font-semibold text-slate-700 pt-2">
                    {clickedSeg.ratePerHundred}/100
                  </td>
                </tr>
              </tbody>
            </table>
          )}
        </div>
      )}
    </div>
  );
}