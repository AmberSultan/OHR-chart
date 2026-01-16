"use client";

import dynamic from "next/dynamic";
import { useMemo } from "react";
import {
  cultureDomains,
  behaviouralIncidents,
  behaviourStatusMix,
  statusColors,
  getScoreColor,
  calculateCultureIndex,
} from "@/lib/data";

const Plot = dynamic(() => import("react-plotly.js"), {
  ssr: false,
  loading: () => <div>Loading chart...</div>
});

interface SunburstNode {
  id: string;
  parent: string;
  label: string;
  value: number;
  color: string;
}

export default function SunburstChart() {
  const chartData = useMemo(() => {
    const nodes: SunburstNode[] = [];
    const cultureIndex = calculateCultureIndex();

    // Root node
    nodes.push({
      id: "Culture Index",
      parent: "",
      label: `Culture Index: ${cultureIndex}`,
      value: 1,
      color: getScoreColor(cultureIndex),
    });

    // Culture domains ring
    cultureDomains.forEach((domain) => {
      nodes.push({
        id: `domain-${domain.domain}`,
        parent: "Culture Index",
        label: domain.domain,
        value: Math.max(domain.weight, 0.01), // avoid 0
        color: getScoreColor(domain.score),
      });
    });

    // Behaviour ring
    behaviouralIncidents.forEach((incident) => {
      const { behaviour, heightBand, ratePerHundred } = incident;

      const behaviourId = `behaviour-${behaviour}`;

      if (heightBand === 0) {
        // Very small / invisible behaviour
        nodes.push({
          id: behaviourId,
          parent: "Culture Index",
            label: `${behaviour} (${ratePerHundred}/100)`,
          value: 0.01,
          color: "#d1d5db",
        });
        return;
      }

      // Add parent behaviour node
      nodes.push({
        id: behaviourId,
        parent: "Culture Index",
        label: `${behaviour} `,
        value: ratePerHundred,
        color: "#ffffff",
      });

      // Add statuses
      const statuses = behaviourStatusMix.filter((s) => s.behaviour === behaviour);
      statuses.forEach((status, idx) => {
        nodes.push({
          id: `${behaviourId}-${status.status}-${idx}`,
          parent: behaviourId,
          label: `${status.status} (${(status.proportion * 100).toFixed(0)}%)`,
             value: Math.max(status.proportion * ratePerHundred, 0.01),
          color: statusColors[status.status] || "#9ca3af",
        });
      });
    });

    return nodes;
  }, []);

  return (
    <Plot
      data={[
        {
          type: "sunburst",
          ids: chartData.map((d) => d.id),
          labels: chartData.map((d) => d.label),
          parents: chartData.map((d) => d.parent),
          values: chartData.map((d) => d.value),
          marker: { colors: chartData.map((d) => d.color) },
          branchvalues: "remainder",
          hovertemplate: "<b>%{label}</b><br>Value: %{value}<extra></extra>",
        },
      ]}
      layout={{
        margin: { t: 10, l: 10, r: 10, b: 10 },
        height: 700,
        paper_bgcolor: "transparent",
      }}
      config={{
        responsive: true,
        displayModeBar: true,
        displaylogo: false,
      }}
      style={{ width: "100%", height: "100%" }}
    />
  );
}
