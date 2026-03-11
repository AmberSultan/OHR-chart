"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import {
  cultureDomains,
  behaviouralIncidents,
  behaviourStatusMix,
  statusColors,
  sourceRecords,
  calculateCultureIndex,
  type SourceRecord,
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
  description?: string;
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

export default function CultureAura({ showAxisLines = false }: { showAxisLines?: boolean }) {
  const cultureIndex = calculateCultureIndex();

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const animRef = useRef<number>(0);
  const timeRef = useRef<number>(0);
  /** Ref-based so the animation loop always reads the latest value without re-renders */
  const hovRef    = useRef<AuraSegment | null>(null);
  /** Which obligation arc is currently hovered (null | "psych" | "posduty") */
  const hovArcRef = useRef<"psych" | "posduty" | null>(null);

  const [displayIndex, setDisplayIndex] = useState(0);
  const [clickedSeg, setClickedSeg] = useState<AuraSegment | null>(null);
  const [displaySize, setDisplaySize] = useState(490);

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

  // ── Responsive display size ──
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const update = () => setDisplaySize(Math.min(el.offsetWidth, 490));
    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  // ── Canvas dimensions ──
  const SIZE = 500;
  const C = SIZE / 2;       // centre
  const INNER_R = 82;       // solid centre circle radius
  const AURA_START = 100;   // where aura begins (just outside centre circle)
  const AURA_BASE = 152;    // base outer radius (zero extrusion)
  const MAX_EXT = 48;       // max extrusion pixels (represents "+2 units")

  // ── Obligation arc geometry — hoisted so onMove can do hit-testing ──
  const OBL_GAP       = 6;
  const OBL_THICKNESS = 13;   // 5.2% of chart radius (250) — within 5–8% spec
  const OBL_SPACING   = 3;
  const OBL1_INNER = AURA_BASE + MAX_EXT + OBL_GAP;   // 206
  const OBL1_OUTER = OBL1_INNER + OBL_THICKNESS;      // 219
  const OBL2_INNER = OBL1_OUTER + OBL_SPACING;        // 222
  const OBL2_OUTER = OBL2_INNER + OBL_THICKNESS;      // 235

  // ── FIX #2: Centre colour aligned to warm salmon palette (was olive #d3d0a5) ──
  const CENTER_COLOR = "#F89E80"; // salmon-base — warm, grounds the palette

  // Domain ring — #F89E80 salmon, light → dark
  const DOMAIN_COLORS = [
    "#FEF0EB", // salmon-50
    "#FDDFD5", // salmon-100
    "#FBCAB8", // salmon-200
    "#FAB49B", // salmon-250
    "#F9A08E", // salmon-300
    "#F89E80", // salmon-base
    "#F68A69", // salmon-500
    "#F47553", // salmon-550
    "#F2603C", // salmon-600
    "#E85530", // salmon-650
    "#D44A27", // salmon-700
    "#BF401F", // salmon-750
    "#A83618", // salmon-800
    "#8C2C12", // salmon-900
  ];

  // ── Build segments ──
  const totalItems = cultureDomains.length + behaviouralIncidents.length;
  const segW = (Math.PI * 2) / totalItems;
  const segments: AuraSegment[] = [];
  let si = 0;

  // Domain segments (inner ring — living condition layer)
  cultureDomains.forEach((d) => {
    const sa = si * segW - Math.PI / 2;
    const ea = (si + 1) * segW - Math.PI / 2;
    const ext = Math.min(((100 - d.score) / 100) * (d.weight + 1), 1);
    segments.push({
      name: d.domain,
      type: "domain",
      description: d.description,
      startAngle: sa,
      endAngle: ea,
      midAngle: (sa + ea) / 2,
      extrusion: ext,
      color: DOMAIN_COLORS[si % DOMAIN_COLORS.length],
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
        color: statusColors[s.status] || "#F89E80",
        proportion: prop,
        startAngle: subSa,
        endAngle: subEa,
      };
    });

    const dominant =
      statusArr.length > 0
        ? statusArr.reduce((a, x) => (x.proportion > a.proportion ? x : a))
        : null;
    const domCol = dominant ? statusColors[dominant.status] || "#F89E80" : "#F89E80";

    segments.push({
      name: b.behaviour,
      type: "behaviour",
      description: b.description,
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

  // ── FIX #6: Outer radius — static, no radius breathing (brief: no continuous looping motion) ──
  // Only saturation breathing is allowed as continuous motion (applied in drawAuraWedges).
  function outerRadius(seg: AuraSegment): number {
    return AURA_BASE + seg.extrusion * MAX_EXT;
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

    // Pre-compute arc angle spans for hit-testing (segments is stable for static data)
    const arcSpan = (names: string[]) => {
      const segs = names.map(n => segments.find(s => s.name === n)).filter((s): s is AuraSegment => !!s);
      if (!segs.length) return null;
      return { sa: Math.min(...segs.map(s => s.startAngle)), ea: Math.max(...segs.map(s => s.endAngle)) };
    };
    const psychSpan    = arcSpan(["Safety","Job Clarity","Job Control","Justice","Relationships","Reward"]);
    const pdTopSpan    = arcSpan(["Opportunity","Contribution"]);
    const pdBotSpan    = arcSpan(["Reward","Support","Leadership","Inclusion","Respectful Norms","Trust"]);

    const onMove = (e: MouseEvent) => {
      const { x, y } = toCanvas(e);
      const dx = x - C, dy = y - C;
      const r = Math.sqrt(dx * dx + dy * dy);

      // ── Obligation arc hit zone (OBL1_INNER … OBL2_OUTER) ──
      if (r >= OBL1_INNER && r <= OBL2_OUTER) {
        const a = normaliseAngle(Math.atan2(dy, dx));
        const inPsych = r <= OBL1_OUTER && !!psychSpan && a >= psychSpan.sa && a <= psychSpan.ea;
        const inPd    = r >= OBL2_INNER  && !!pdTopSpan && !!pdBotSpan &&
                        ((a >= pdTopSpan.sa && a <= pdTopSpan.ea) ||
                         (a >= pdBotSpan.sa && a <= pdBotSpan.ea));
        if (inPsych || inPd) {
          hovArcRef.current = inPsych ? "psych" : "posduty";
          hovRef.current    = null;
          return;
        }
      }

      hovArcRef.current = null;
      hovRef.current =
        r >= AURA_START && r <= AURA_BASE + MAX_EXT + 18
          ? findSegment(Math.atan2(dy, dx))
          : null;
    };

    const onLeave = () => { hovRef.current = null; hovArcRef.current = null; };

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

  // ── Animation loop — kept alive for saturation breathing only ──
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
    drawAuraWedges(ctx, time);                        // Layer 1: coloured wedges (condition + response)
    drawInnerRing(ctx);                               // Layer 2: ring between centre circle and aura
    drawObligationArcs(ctx);                          // Layer 3: static structural governance bands (duty — no motion)
    if (showAxisLines) drawAxisLines(ctx, time);      // Layer 4: per-segment axis lines (optional)
    drawCenterCircle(ctx);                            // Layer 5: stable solid centre with inner shadow (anchor)
    drawHoverLabel(ctx, time);                        // Layer 6: label on hover
  }

  // ── Layer 2: Inner ring (outside centre, inside aura) ──
  function drawInnerRing(ctx: CanvasRenderingContext2D) {
    const outerEdge = AURA_START + 7;
    const innerEdge = INNER_R - 4;

    ctx.save();
    ctx.beginPath();
    ctx.arc(C, C, outerEdge, 0, Math.PI * 2, false);
    ctx.arc(C, C, innerEdge, 0, Math.PI * 2, true);
    ctx.fillStyle = "#FDDFD5";
    ctx.fill("evenodd");
    ctx.restore();
  }

  // ── Layer 1: Aura wedges ──
  // FIX #7: Saturation breathing — gentle ±2.5% global saturation cycle is the
  // ONLY continuous motion. Radius is static. Brief: "no continuous looping
  // motion beyond subtle saturation breathing."
  // Indicators governed by each obligation arc (for hover highlight)
  const PSYCH_NAMES   = ["Safety","Job Clarity","Job Control","Justice","Relationships","Reward"];
  const POSDUTY_NAMES = ["Opportunity","Contribution","Reward","Support","Leadership","Inclusion","Respectful Norms","Trust"];

  function drawAuraWedges(ctx: CanvasRenderingContext2D, time: number) {
    const hov    = hovRef.current;
    const hovArc = hovArcRef.current;
    // Gentle global saturation breath: ±2.5%, period ≈42s — imperceptible but alive
    const breathSat = 1.0 + Math.sin(time * 0.15) * 0.025;

    segments.forEach((seg) => {
      const isHov        = hov?.name === seg.name;
      const isArcHovered = hovArc === "psych"   ? PSYCH_NAMES.includes(seg.name)
                         : hovArc === "posduty" ? POSDUTY_NAMES.includes(seg.name)
                         : false;
      const oR = outerRadius(seg); // static — no radius pulse
      // Direct hover +5%; arc hover highlights mapped indicators at +15%; otherwise breathing
      const sat = isHov ? 1.05 : isArcHovered ? 1.15 : breathSat;

      if (seg.type === "behaviour" && seg.statusSubSegments?.length) {
        seg.statusSubSegments.forEach((sub) => {
          drawWedge(ctx, sub.startAngle, sub.endAngle, oR, hexToRgb(sub.color), sat);
        });
      } else {
        drawWedge(ctx, seg.startAngle, seg.endAngle, oR, hexToRgb(seg.color), sat);
      }
    });
  }

  /**
   * Single pie-slice wedge with a radial gradient.
   *
   * FIX #8: Alpha is now fixed across all states. No hover alpha change.
   * Brief prohibits glow and transparency-based hover effects.
   * Only saturation shifts on hover (+5%) and at rest (breathing cycle).
   * Gradient provides 6% luminosity variation at outer edge (within 5–8% spec).
   */
  function drawWedge(
    ctx: CanvasRenderingContext2D,
    sa: number,
    ea: number,
    oR: number,
    rgb: { r: number; g: number; b: number },
    sat: number,
  ) {
    const r = Math.min(255, Math.round(rgb.r * sat));
    const g = Math.min(255, Math.round(rgb.g * sat));
    const b = Math.min(255, Math.round(rgb.b * sat));

    // 6% luminosity reduction at outer edge (within 5–8% spec)
    const rD = Math.round(r * 0.94);
    const gD = Math.round(g * 0.94);
    const bD = Math.round(b * 0.94);

    // Fixed alpha — no hover alpha change (brief prohibits glow/fade effects)
    const baseAlpha = 0.72;
    const midAlpha  = 0.80;

    const grad = ctx.createRadialGradient(C, C, AURA_START, C, C, oR);
    grad.addColorStop(0,   `rgba(${r},${g},${b},${baseAlpha})`);
    grad.addColorStop(0.5, `rgba(${r},${g},${b},${midAlpha})`);
    grad.addColorStop(1,   `rgba(${rD},${gD},${bD},${baseAlpha})`);

    ctx.beginPath();
    ctx.moveTo(C, C);
    ctx.arc(C, C, oR, sa, ea);
    ctx.closePath();
    ctx.fillStyle = grad;
    ctx.fill();
  }

  // ── Layer 3: Obligation arcs ──
  // Partial arcs rendered OUTSIDE the outer ring, spanning only the angular range
  // of their mapped indicators — not full circles. This is the correct architecture:
  // the arc visually marks *which segments* fall under each governance framework.
  //
  // Arc 1 — Psychological Safety: Safety, Job Clarity, Job Control, Justice, Relationships, Reward
  //   → contiguous span (indices 2–8), note Job Demand(5) is visually enclosed in the span
  // Arc 2 — Positive Duty: Opportunity, Contribution (top group) + Reward→Trust (bottom group)
  //   → rendered as two separate partial bands since the groups are not contiguous
  function drawObligationArcs(ctx: CanvasRenderingContext2D) {
    // Radii are hoisted to component level (OBL1_INNER … OBL2_OUTER)
    const hovArc = hovArcRef.current;

    // Find angular extent of a contiguous group of named segments
    const segRange = (names: string[]): { sa: number; ea: number; mid: number } | null => {
      const matched = names
        .map(n => segments.find(s => s.name === n))
        .filter((s): s is AuraSegment => s !== undefined);
      if (!matched.length) return null;
      const sa = Math.min(...matched.map(s => s.startAngle));
      const ea = Math.max(...matched.map(s => s.endAngle));
      return { sa, ea, mid: (sa + ea) / 2 };
    };

    // Draw a filled annular sector (partial donut slice)
    const drawSector = (iR: number, oR: number, sa: number, ea: number, fill: string, stroke: string) => {
      ctx.beginPath();
      ctx.arc(C, C, oR, sa, ea, false);
      ctx.arc(C, C, iR, ea, sa, true);
      ctx.closePath();
      ctx.fillStyle = fill;
      ctx.fill();
      ctx.lineWidth = 0.5;
      ctx.strokeStyle = stroke;
      ctx.stroke();
    };

    // Draw label centred along the arc — text rotated to follow the arc tangent
    const drawArcLabel = (text: string, r: number, midAngle: number) => {
      const x = C + r * Math.cos(midAngle);
      const y = C + r * Math.sin(midAngle);
      ctx.save();
      ctx.translate(x, y);
      // Rotate so text runs along the arc; flip if bottom half so text stays readable
      const rot = midAngle + Math.PI / 2;
      const flip = midAngle > Math.PI / 2 || midAngle < -Math.PI / 2;
      ctx.rotate(flip ? rot + Math.PI : rot);
      ctx.font = "600 6px system-ui, -apple-system, sans-serif";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillStyle = "rgba(255,255,255,0.90)";
      ctx.fillText(text, 0, 0);
      ctx.restore();
    };

    ctx.save();

    // ── Arc 1: Psychological Safety ──
    const psych = segRange(["Safety", "Job Clarity", "Job Control", "Justice", "Relationships", "Reward"]);
    if (psych) {
      const hov1 = hovArc === "psych";
      drawSector(OBL1_INNER, OBL1_OUTER, psych.sa, psych.ea,
        hov1 ? "rgba(212,168,148,0.55)" : "rgba(212,168,148,0.30)",
        hov1 ? "rgba(180,125,105,0.70)" : "rgba(180,125,105,0.35)");
      drawArcLabel("Psychological Safety", (OBL1_INNER + OBL1_OUTER) / 2, psych.mid);
    }

    // ── Arc 2: Positive Duty ──
    // Maps: Opportunity + Contribution (top, indices 0–1) AND Reward→Trust (bottom, indices 8–13)
    // Rendered as two separate bands since these two groups are not angularly contiguous.
    const pdTop = segRange(["Opportunity", "Contribution"]);
    const pdBot = segRange(["Reward", "Support", "Leadership", "Inclusion", "Respectful Norms", "Trust"]);

    const hov2 = hovArc === "posduty";
    if (pdTop) {
      drawSector(OBL2_INNER, OBL2_OUTER, pdTop.sa, pdTop.ea,
        hov2 ? "rgba(185,155,172,0.52)" : "rgba(185,155,172,0.26)",
        hov2 ? "rgba(155,115,138,0.65)" : "rgba(155,115,138,0.30)");
    }
    if (pdBot) {
      drawSector(OBL2_INNER, OBL2_OUTER, pdBot.sa, pdBot.ea,
        hov2 ? "rgba(185,155,172,0.52)" : "rgba(185,155,172,0.26)",
        hov2 ? "rgba(155,115,138,0.65)" : "rgba(155,115,138,0.30)");
      drawArcLabel("Positive Duty", (OBL2_INNER + OBL2_OUTER) / 2, pdBot.mid);
    }

    ctx.restore();
  }

  // ── Layer 4: Axis lines ──
  function drawAxisLines(ctx: CanvasRenderingContext2D, time: number) {
    const hov = hovRef.current;
    segments.forEach((seg) => {
      const isHov = hov?.name === seg.name;
      const oR = outerRadius(seg); // static radius
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
    void time; // time unused now radius is static; kept for consistent drawScene signature
  }

  // ── Layer 5: Centre circle — FIX #1 + #2: Stable solid circle, warm salmon colour ──
  // Brief: "solid colour fill with slight inner shadow to create depth."
  // No blob, no wobble, no shape deformation, no outer glow.
  // This function intentionally takes no `time` argument — it must never animate.
  function drawCenterCircle(ctx: CanvasRenderingContext2D) {
    const rgb = hexToRgb(CENTER_COLOR);

    // Solid colour fill
    ctx.beginPath();
    ctx.arc(C, C, INNER_R, 0, Math.PI * 2);
    ctx.fillStyle = CENTER_COLOR;
    ctx.fill();

    // Slight inner shadow — gradient transparent at centre, darkened at rim
    // Creates depth without glow. Brief: "slight inner shadow to create depth."
    const shadow = ctx.createRadialGradient(C, C, INNER_R * 0.5, C, C, INNER_R);
    shadow.addColorStop(0, "rgba(0,0,0,0)");
    shadow.addColorStop(1, "rgba(0,0,0,0.20)");
    ctx.beginPath();
    ctx.arc(C, C, INNER_R, 0, Math.PI * 2);
    ctx.fillStyle = shadow;
    ctx.fill();

    // Subtle border to separate centre from aura
    const darkR = Math.max(0, rgb.r - 35);
    const darkG = Math.max(0, rgb.g - 35);
    const darkB = Math.max(0, rgb.b - 35);
    ctx.beginPath();
    ctx.arc(C, C, INNER_R, 0, Math.PI * 2);
    ctx.strokeStyle = `rgba(${darkR},${darkG},${darkB},0.30)`;
    ctx.lineWidth = 1;
    ctx.stroke();
  }

  // ── Layer 6: Labels (hover only, opacity increases on hover) ──
  function drawHoverLabel(ctx: CanvasRenderingContext2D, time: number) {
    const hov = hovRef.current;
    const MARGIN = 4;

    ctx.font = "500 9.5px system-ui, -apple-system, sans-serif";

    segments.forEach((seg) => {
      const isHov = hov?.name === seg.name;
      const oR = outerRadius(seg) + 14; // static radius + label offset
      const rawX = C + oR * Math.cos(seg.midAngle);
      const rawY = C + oR * Math.sin(seg.midAngle);

      const cosA = Math.cos(seg.midAngle);
      let align: CanvasTextAlign;
      if (cosA > 0.15)       align = "left";
      else if (cosA < -0.15) align = "right";
      else                   align = "center";
      ctx.textAlign = align;

      const metrics = ctx.measureText(seg.name);
      const tw = metrics.width;

      let textLeft: number;
      if (align === "left")        textLeft = rawX;
      else if (align === "right")  textLeft = rawX - tw;
      else                         textLeft = rawX - tw / 2;

      let clampedX = rawX;
      if (textLeft < MARGIN) {
        clampedX = rawX + (MARGIN - textLeft);
      } else if (textLeft + tw > SIZE - MARGIN) {
        clampedX = rawX - (textLeft + tw - (SIZE - MARGIN));
      }

      const clampedY = Math.max(MARGIN + 10, Math.min(SIZE - MARGIN, rawY));

      if (!isHov) return;
      ctx.fillStyle = "rgba(243,232,255,0.88)";
      ctx.fillText(seg.name, clampedX, clampedY + 4);
    });
    void time; // time unused now radius is static; kept for consistent drawScene signature
  }

  // ══════════════════════════════════════════
  //  Render
  // ══════════════════════════════════════════

  return (
    <div ref={containerRef} className="relative w-full flex items-center justify-center" style={{ minHeight: displaySize }}>

      {/* Chart canvas zone — always centered, table never affects its position */}
      <div className="relative" style={{ width: displaySize, height: displaySize }}>

        <canvas
          ref={canvasRef}
          className="absolute inset-0 cursor-pointer"
          style={{ width: displaySize, height: displaySize }}
        />

        {/* Centre overlay — pointer-events-none so clicks pass through to canvas */}
        <div className="absolute inset-0 z-10 flex flex-col items-center justify-center pointer-events-none">
          <div style={{ width: INNER_R * 1.7 * (displaySize / SIZE) }} className="flex flex-col items-center">
            <Image src="/vite.svg" alt="O Logo" width={22} height={22} className="mb-1.5" />
            <div
              className="text-[22px] font-semibold tabular-nums leading-none"
              style={{ color: "#1a1a1a" }}
            >
              {displayIndex}
            </div>
            <div className="text-[8px] text-black/60 mt-1 uppercase tracking-[0.18em]">
              Culture Index
            </div>
          </div>
        </div>

      </div>

      {/* Detail panel — source records table per brief (col E: Sunburst Table + Data Mapping) */}
      {clickedSeg && (() => {
        const records: SourceRecord[] = sourceRecords.filter(
          (r) => r.indicatorId === clickedSeg.name
        );
        return (
          <div
            className="absolute z-20 bg-white/95 border border-slate-100 rounded-xl shadow-sm p-4"
            style={{
              left: `calc(50% + ${displaySize / 2 + 8}px)`,
              top: "8px",
              width: "420px",
              backdropFilter: "blur(10px)",
              maxHeight: "480px",
              overflowY: "auto",
            }}
          >
            {/* Header */}
            <div className="flex justify-between items-start mb-3">
              <div>
                <div className="text-[9px] uppercase tracking-widest text-slate-400 mb-0.5">
                  {clickedSeg.type === "domain" ? "Inner Ring · Domain" : "Outer Ring · Behaviour"}
                </div>
                <div className="font-semibold text-slate-800 text-[13px] leading-tight">
                  {clickedSeg.name}
                </div>
              </div>
              <button
                onClick={() => setClickedSeg(null)}
                className="text-slate-300 hover:text-slate-500 text-xl leading-none mt-0.5 ml-4 flex-shrink-0"
              >
                ×
              </button>
            </div>

            {/* Description */}
            {clickedSeg.description && (
              <p className="text-[11px] text-slate-500 leading-relaxed mb-3 border-b border-slate-100 pb-3">
                {clickedSeg.description}
              </p>
            )}

            {/* Summary row */}
            <div className="flex gap-3 mb-3 text-[11px]">
              {clickedSeg.type === "domain" && (
                <>
                  <span className="bg-slate-50 rounded px-2 py-1 text-slate-500">
                    Score <span className="font-semibold text-slate-700">{clickedSeg.score}</span>
                  </span>
                  <span className="bg-slate-50 rounded px-2 py-1 text-slate-500">
                    Weight <span className="font-semibold text-slate-700">{((clickedSeg.weight ?? 0) * 100).toFixed(0)}%</span>
                  </span>
                  <span className="bg-slate-50 rounded px-2 py-1 text-slate-500">
                    Activation <span className="font-semibold text-slate-700">{(clickedSeg.extrusion * 2).toFixed(2)}/2</span>
                  </span>
                </>
              )}
              {clickedSeg.type === "behaviour" && (
                <span className="bg-slate-50 rounded px-2 py-1 text-slate-500">
                  Rate <span className="font-semibold text-slate-700">{clickedSeg.ratePerHundred}/100</span>
                </span>
              )}
            </div>

            {/* Response Records — column format per brief col E */}
            {records.length > 0 && (
              <div>
                <div className="text-[9px] uppercase tracking-widest text-slate-400 mb-1.5">Response Records</div>
                <div className="overflow-x-auto">
                  <table className="w-full text-[10px] border-collapse">
                    <thead>
                      <tr className="border-b border-slate-200 bg-slate-50">
                        <th className="text-left py-1.5 pr-2 pl-1 font-semibold text-slate-500">id</th>
                        <th className="text-left py-1.5 pr-2 font-semibold text-slate-500">timestamp</th>
                        <th className="text-left py-1.5 pr-2 font-semibold text-slate-500">workflow_id</th>
                        <th className="text-left py-1.5 pr-2 font-semibold text-slate-500">question_id</th>
                        <th className="text-left py-1.5 pr-2 font-semibold text-slate-500">indicator_id</th>
                        <th className="text-center py-1.5 pr-2 font-semibold text-slate-500">response_value</th>
                        <th className="text-left py-1.5 font-semibold text-slate-500">respondent_id</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                      {records.map((r: SourceRecord) => (
                        <tr key={r.id} className="hover:bg-slate-50">
                          <td className="py-1.5 pr-2 pl-1 text-slate-500 font-mono">{r.id}</td>
                          <td className="py-1.5 pr-2 text-slate-600 whitespace-nowrap">{r.timestamp}</td>
                          <td className="py-1.5 pr-2 text-slate-600">{r.workflowId}</td>
                          <td className="py-1.5 pr-2 text-slate-600 font-mono">{r.questionId}</td>
                          <td className="py-1.5 pr-2 text-slate-600">{r.indicatorId}</td>
                          <td className="py-1.5 pr-2 text-center font-semibold"
                            style={{ color: r.responseValue === 1 ? "#4CAF50" : "#E57373" }}>
                            {r.responseValue === 1 ? "+1" : "-1"}
                          </td>
                          <td className="py-1.5 text-slate-600">{r.respondentId}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        );
      })()}

    </div>
  );
}
