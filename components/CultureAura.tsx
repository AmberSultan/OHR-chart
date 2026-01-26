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

interface StatusSubSegment {
  status: string;
  color: string;
  startAngle: number;
  endAngle: number;
  proportion: number;
}

interface AuraSegment {
  name: string;
  type: "domain" | "behaviour";
  startAngle: number;
  endAngle: number;
  midAngle: number;
  pressure: number;
  color: string;
  score?: number;
  statusSubSegments?: StatusSubSegment[];
}

function getBehaviourStatusColors(behaviour: string): Array<{ color: string; weight: number }> {
  const statusMix = behaviourStatusMix.filter((s) => s.behaviour === behaviour);
  if (statusMix.length === 0) {
    return [{ color: "#c52822", weight: 1 }];
  }
  return statusMix.map((s) => ({
    color: statusColors[s.status] || "#365584",
    weight: s.proportion,
  }));
}

function hexToRgb(hex: string): { r: number; g: number; b: number } {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16),
      }
    : { r: 148, g: 163, b: 184 };
}

export default function CultureAura() {
  const cultureIndex = calculateCultureIndex();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>(0);
  const timeRef = useRef<number>(0);

  const [tooltip, setTooltip] = useState<{ x: number; y: number; text: string } | null>(null);
  const [hoveredSegment, setHoveredSegment] = useState<AuraSegment | null>(null);
  const hoveredSegmentRef = useRef<AuraSegment | null>(null);

  const size = 500;
  const displaySize = 490;
  const center = size / 2;
  const baseRadius = 120;
  const maxExtension = 60;
  const innerRingRadius = 95;

  const getDominantBehaviourColor = (behaviour: string): string => {
    const colors = getBehaviourStatusColors(behaviour);
    const dominant = colors.reduce((prev, curr) =>
      curr.weight > prev.weight ? curr : prev
    );
    return dominant.color;
  };

  const totalItems = cultureDomains.length + behaviouralIncidents.length;
  const segmentAngle = (Math.PI * 2) / totalItems;

  const segments: AuraSegment[] = [];
  let segmentIndex = 0;

  // Add domain segments
  cultureDomains.forEach((d) => {
    const startAngle = segmentIndex * segmentAngle - Math.PI / 2;
    const endAngle = (segmentIndex + 1) * segmentAngle - Math.PI / 2;
    segments.push({
      name: d.domain,
      type: "domain",
      pressure: (100 - d.score) / 150,
      color: getScoreColor(d.score),
      score: d.score,
      startAngle,
      endAngle,
      midAngle: (startAngle + endAngle) / 2,
    });
    segmentIndex++;
  });

  // Add behaviour segments with status sub-segments
  behaviouralIncidents.forEach((b) => {
    const startAngle = segmentIndex * segmentAngle - Math.PI / 2;
    const endAngle = (segmentIndex + 1) * segmentAngle - Math.PI / 2;
    const segmentWidth = endAngle - startAngle;

    // Get status colors and proportions for this behaviour
    const statusColors_arr = getBehaviourStatusColors(b.behaviour);
    const totalWeight = statusColors_arr.reduce((sum, s) => sum + s.weight, 0);

    // Create sub-segments for each status
    const statusSubSegments: StatusSubSegment[] = [];
    let currentAngle = startAngle;

    statusColors_arr.forEach((status, idx) => {
      const proportion = status.weight / totalWeight;
      const subSegmentWidth = segmentWidth * proportion;
      const subEndAngle = currentAngle + subSegmentWidth;

      // Get the status name from behaviourStatusMix
      const statusMix = behaviourStatusMix.filter((s) => s.behaviour === b.behaviour);
      const statusName = statusMix[idx]?.status || "Unknown";

      statusSubSegments.push({
        status: statusName,
        color: status.color,
        startAngle: currentAngle,
        endAngle: subEndAngle,
        proportion,
      });
      currentAngle = subEndAngle;
    });

    segments.push({
      name: b.behaviour,
      type: "behaviour",
      pressure: b.ratePerHundred * 1.5,
      color: getDominantBehaviourColor(b.behaviour),
      startAngle,
      endAngle,
      midAngle: (startAngle + endAngle) / 2,
      statusSubSegments,
    });
    segmentIndex++;
  });

  /** --- Canvas Animation --- */
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    canvas.width = size * dpr;
    canvas.height = size * dpr;
    ctx.scale(dpr, dpr);

    let lastTime = 0;
    const animate = (timestamp: number) => {
      const delta = timestamp - lastTime;
      lastTime = timestamp;
      timeRef.current += delta * 0.001;

      ctx.clearRect(0, 0, size, size);
      drawAura(ctx, timeRef.current);
      drawGlowingRing(ctx);

      animationRef.current = requestAnimationFrame(animate);
    };
    animationRef.current = requestAnimationFrame(animate);

    return () => cancelAnimationFrame(animationRef.current);
  }, []);

  /** --- Hover Detection --- */
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const handleMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      const scaleX = size / rect.width;
      const scaleY = size / rect.height;
      const mouseX = e.clientX - rect.left;
      const mouseY = e.clientY - rect.top;
      const x = mouseX * scaleX;
      const y = mouseY * scaleY;

      const dx = x - center;
      const dy = y - center;
      const angle = Math.atan2(dy, dx);
      const radius = Math.sqrt(dx * dx + dy * dy);

      const normalizedAngle = angle < 0 ? angle + Math.PI * 2 : angle;
      const hovered = segments.find((seg) => {
        let segStart = seg.startAngle;
        let segEnd = seg.endAngle;
        if (segEnd < segStart) segEnd += Math.PI * 2;
        if (normalizedAngle >= segStart && normalizedAngle <= segEnd) {
          const pressure = getPressureAtAngle(seg.midAngle, timeRef.current);
          const extension = baseRadius + pressure * maxExtension;
          return radius <= extension + 30;
        }
        return false;
      }) || null;

      setHoveredSegment(hovered);
      hoveredSegmentRef.current = hovered;

      if (hovered) {
        const incident = behaviouralIncidents.find(b => b.behaviour === hovered.name);
        let text: string;

        if (hovered.type === "domain") {
          text = `${hovered.name}: ${hovered.score}`;
        } else {
          // For behaviours, find which sub-segment is hovered
          let statusText = "";
          if (hovered.statusSubSegments && hovered.statusSubSegments.length > 0) {
            const hoveredSub = hovered.statusSubSegments.find(
              (sub) => normalizedAngle >= sub.startAngle && normalizedAngle <= sub.endAngle
            );
            if (hoveredSub) {
              statusText = ` (${hoveredSub.status}: ${Math.round(hoveredSub.proportion * 100)}%)`;
            }
          }
          text = `${hovered.name}: ${incident ? incident.ratePerHundred : 0}/100${statusText}`;
        }
        setTooltip({ x: mouseX, y: mouseY, text });
      } else {
        setTooltip(null);
      }
    };

    const handleMouseLeave = () => {
      setTooltip(null);
      setHoveredSegment(null);
    };

    canvas.addEventListener("mousemove", handleMouseMove);
    canvas.addEventListener("mouseleave", handleMouseLeave);

    return () => {
      canvas.removeEventListener("mousemove", handleMouseMove);
      canvas.removeEventListener("mouseleave", handleMouseLeave);
    };
  }, [segments]);

  /** --- Helpers --- */
  function getColorAtAngle(angle: number): { r: number; g: number; b: number } {
    let totalR = 0, totalG = 0, totalB = 0;
    let totalWeight = 0;

    // Normalize angle to handle wrap-around
    let normAngle = angle;
    while (normAngle < -Math.PI) normAngle += Math.PI * 2;
    while (normAngle > Math.PI) normAngle -= Math.PI * 2;

    segments.forEach((seg) => {
      let angularDist = Math.abs(angle - seg.midAngle);
      if (angularDist > Math.PI) angularDist = Math.PI * 2 - angularDist;

      const spread = 0.25;
      const influence = Math.exp(-Math.pow(angularDist, 2) / (2 * spread * spread));

      if (influence > 0.01) {
        let segColor = seg.color;

        // For behaviour segments, determine which sub-segment this angle falls into
        if (seg.type === "behaviour" && seg.statusSubSegments && seg.statusSubSegments.length > 0) {
          // Check if angle is within this segment's range
          const inSegment = normAngle >= seg.startAngle && normAngle <= seg.endAngle;
          if (inSegment) {
            // Find the sub-segment for this angle
            const subSeg = seg.statusSubSegments.find(
              (sub) => normAngle >= sub.startAngle && normAngle <= sub.endAngle
            );
            if (subSeg) {
              segColor = subSeg.color;
            }
          } else {
            // For nearby angles, blend based on closest sub-segment
            const closestSub = seg.statusSubSegments.reduce((closest, sub) => {
              const subMid = (sub.startAngle + sub.endAngle) / 2;
              let distToSub = Math.abs(angle - subMid);
              if (distToSub > Math.PI) distToSub = Math.PI * 2 - distToSub;

              const closestMid = (closest.startAngle + closest.endAngle) / 2;
              let distToClosest = Math.abs(angle - closestMid);
              if (distToClosest > Math.PI) distToClosest = Math.PI * 2 - distToClosest;

              return distToSub < distToClosest ? sub : closest;
            });
            segColor = closestSub.color;
          }
        }

        const rgb = hexToRgb(segColor);
        const weight = influence * (0.4 + seg.pressure * 0.6);
        totalR += rgb.r * weight;
        totalG += rgb.g * weight;
        totalB += rgb.b * weight;
        totalWeight += weight;
      }
    });

    if (totalWeight > 0) {
      return {
        r: Math.round(totalR / totalWeight),
        g: Math.round(totalG / totalWeight),
        b: Math.round(totalB / totalWeight),
      };
    }
    return { r: 34, g: 197, b: 94 };
  }

  function getPressureAtAngle(angle: number, time: number): number {
    let totalPressure = 0;
    segments.forEach((seg) => {
      let angularDist = Math.abs(angle - seg.midAngle);
      if (angularDist > Math.PI) angularDist = Math.PI * 2 - angularDist;
      const spread = 0.35;
      const influence = Math.exp(-Math.pow(angularDist, 2) / (2 * spread * spread));
      const wave = Math.sin(time * 0.4 + seg.midAngle * 2) * 0.08 + 1;
      totalPressure += influence * seg.pressure * wave;
    });
    return totalPressure;
  }

  /** --- Draw Aura --- */
  function drawAura(ctx: CanvasRenderingContext2D, time: number) {
    const pointCount = 180;
    const points: Array<{ x: number; y: number; color: { r: number; g: number; b: number } }> = [];

    for (let i = 0; i <= pointCount; i++) {
      const angle = (i / pointCount) * Math.PI * 2;
      const pressure = getPressureAtAngle(angle, time);
      const color = getColorAtAngle(angle);

      const localNoise =
        (Math.sin(angle * 3 + time * 0.8) * 4 +
          Math.sin(angle * 5 - time * 0.5) * 3 +
          Math.cos(angle * 2 + time * 0.4) * 3) *
        pressure;

      const localBreathe = (Math.sin(time * 0.3) * 3 + Math.sin(time * 0.2 + angle * 0.15) * 2) * pressure;
      const radius = baseRadius + pressure * maxExtension + localNoise + localBreathe;

      points.push({
        x: center + radius * Math.cos(angle),
        y: center + radius * Math.sin(angle),
        color,
      });
    }

    // Fill main shape
    ctx.beginPath();
    ctx.moveTo(points[0].x, points[0].y);
    for (let i = 1; i < points.length; i++) {
      const prev = points[i - 1];
      const curr = points[i];
      const midX = (prev.x + curr.x) / 2;
      const midY = (prev.y + curr.y) / 2;
      ctx.quadraticCurveTo(prev.x, prev.y, midX, midY);
    }
    ctx.closePath();

    const avgColor = getColorAtAngle(0);
    const gradient = ctx.createRadialGradient(center, center, innerRingRadius - 10, center, center, baseRadius + maxExtension + 30);
    gradient.addColorStop(0, `rgba(255,255,255,0.9)`);
    gradient.addColorStop(0.3, `rgba(${avgColor.r},${avgColor.g},${avgColor.b},0.4)`);
    gradient.addColorStop(0.7, `rgba(${avgColor.r},${avgColor.g},${avgColor.b},0.6)`);
    gradient.addColorStop(1, `rgba(${avgColor.r},${avgColor.g},${avgColor.b},0.1)`);

    ctx.fillStyle = gradient;
    ctx.fill();

    // Colored spikes
    for (let i = 0; i < points.length - 1; i += 3) {
      const curr = points[i];
      const next = points[Math.min(i + 3, points.length - 1)];
      const c = curr.color;

      ctx.beginPath();
      ctx.moveTo(center, center);
      ctx.lineTo(curr.x, curr.y);
      ctx.lineTo(next.x, next.y);
      ctx.closePath();
      ctx.fillStyle = `rgba(${c.r},${c.g},${c.b},0.35)`;
      ctx.fill();
    }

    // Outer stroke
    ctx.beginPath();
    ctx.moveTo(points[0].x, points[0].y);
    for (let i = 1; i < points.length; i++) {
      const prev = points[i - 1];
      const curr = points[i];
      const midX = (prev.x + curr.x) / 2;
      const midY = (prev.y + curr.y) / 2;
      ctx.quadraticCurveTo(prev.x, prev.y, midX, midY);
    }
    ctx.closePath();
    ctx.strokeStyle = "rgba(255,255,255,0.2)";
    ctx.lineWidth = 1.5;
    ctx.stroke();

    // Highlight hovered segment
    // const hovered = hoveredSegmentRef.current;
    // if (hovered) {
    //   const pressure = getPressureAtAngle(hovered.midAngle, time);
    //   const extension = baseRadius + pressure * maxExtension;
    //   ctx.beginPath();
    //   ctx.arc(center, center, extension + 5, hovered.startAngle, hovered.endAngle);
    //   ctx.strokeStyle = "#ffffffaa";
    //   ctx.lineWidth = 3;
    //   ctx.stroke();
    // }
  }

  /** --- Draw Glowing Ring --- */
  function drawGlowingRing(ctx: CanvasRenderingContext2D) {
    ctx.beginPath();
    ctx.arc(center, center, innerRingRadius + 15, 0, Math.PI * 2);
    ctx.fillStyle = "rgba(255,255,255,0.15)";
    ctx.fill();

    ctx.beginPath();
    ctx.arc(center, center, innerRingRadius + 5, 0, Math.PI * 2);
    ctx.fillStyle = "rgba(255,255,255,0.4)";
    ctx.fill();

    ctx.beginPath();
    ctx.arc(center, center, innerRingRadius, 0, Math.PI * 2);
    const innerGradient = ctx.createRadialGradient(center - 10, center - 10, 0, center, center, innerRingRadius);
    innerGradient.addColorStop(0, "#ffffff");
    innerGradient.addColorStop(0.9, "#ffffff");
    innerGradient.addColorStop(1, "#f1f5f9");
    ctx.fillStyle = innerGradient;
    ctx.fill();
  }

  const scoreColor = getScoreColor(cultureIndex);

  return (
    <div className="relative w-[780px] h-[490px] mx-auto flex items-center justify-center">
      <canvas
        ref={canvasRef}
        className="absolute"
        style={{ width: displaySize, height: displaySize }}/>
      <div className="absolute text-center z-10 flex flex-col items-center">
        <Image src="/vite.svg" alt="O Logo" width={28} height={28} className="mb-2" />
        <div className="text-3xl font-semibold -mt-1" style={{ color: scoreColor }}>
          {cultureIndex}
        </div>
        <div className="text-[10px] text-slate-400 mt-1 uppercase tracking-[0.2em]">
          Culture Index
        </div>
      </div>

      {tooltip && (
        <div
          className="absolute z-50 bg-zinc-800 text-white text-xs px-2 py-1 rounded shadow"
          style={{ left: tooltip.x + 10, top: tooltip.y + 10 }}
        >
          {tooltip.text}
        </div>
      )}
    </div>
  );
}