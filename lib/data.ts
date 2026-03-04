export const cultureDomains = [
  { domain: "Change", score: 72, weight: 0.02 },
  { domain: "Job Clarity", score: 74, weight: 0.05 },
  { domain: "Job Control", score: 62, weight: 0.12 },
  { domain: "Job Demands", score: 55, weight: 0.16 },
  { domain: "Support", score: 80, weight: 0.08 },
  { domain: "Relationships", score: 75, weight: 0.06 },
  { domain: "Leadership", score: 72, weight: 0.18 },
  { domain: "Justice", score: 66, weight: 0.12 },
  { domain: "Trust", score: 68, weight: 0.05 },
  { domain: "Inclusion", score: 78, weight: 0.10 },
  { domain: "Respectful Norms", score: 70, weight: 0.04 },
  { domain: "Reward + Recognition", score: 60, weight: 0.01 },
  { domain: "Opportunity", score: 65, weight: 0.01 },
  { domain: "Environment", score: 85, weight: 0.10 },
];

export const behaviouralIncidents = [
  { behaviour: "Bullying", ratePerHundred: 0.8, heightBand: 3 },
  { behaviour: "Harassment", ratePerHundred: 0.4, heightBand: 2 },
  { behaviour: "Sexual Harassment", ratePerHundred: 0.2, heightBand: 1 },
  { behaviour: "Discrimination", ratePerHundred: 0.1, heightBand: 1 },
  { behaviour: "Vilification", ratePerHundred: 0.0, heightBand: 0 },
];

export const behaviourStatusMix = [
  { behaviour: "Bullying", status: "Reported", proportion: 0.20 },
  { behaviour: "Bullying", status: "Investigating", proportion: 0.30 },
  { behaviour: "Bullying", status: "Substantiated", proportion: 0.40 },
  { behaviour: "Bullying", status: "Unsubstantiated", proportion: 0.10 },
  { behaviour: "Harassment", status: "Reported", proportion: 0.25 },
  { behaviour: "Harassment", status: "Investigating", proportion: 0.25 },
  { behaviour: "Harassment", status: "Substantiated", proportion: 0.20 },
  { behaviour: "Harassment", status: "Unsubstantiated", proportion: 0.30 },
];

export const statusColors: Record<string, string> = {
  Reported: "#FDDFD5",                   // salmon-100 — lightest
  Investigating: "#F89E80",              // salmon-base
  Substantiated: "#D44A27",             // salmon-700 — darkest
  "Partially Substantiated": "#F2603C", // salmon-600
  Unsubstantiated: "#FBCAB8",           // salmon-200
};

export function getScoreColor(score: number): string {
  if (score >= 80) return "#81C784";
  if (score >= 65) return "#FFB74D";
  return "#E57373";
}

export function calculateCultureIndex(): number {
  const weightedSum = cultureDomains.reduce(
    (sum, d) => sum + d.score * d.weight,
    0
  );
  return Math.round(weightedSum * 10) / 10;
}
