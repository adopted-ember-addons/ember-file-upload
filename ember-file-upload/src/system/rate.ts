// Calculate from the last x rate recordings
const CALCULATE_FROM_LAST = 30;

// Weigh recent rates more highly
const THRESHOLDS = [
  { threshold: 10, proportion: 3 },
  { threshold: 20, proportion: 2 },
  { threshold: 30, proportion: 1 },
];
const DEFAULT_PROPORTION = 1;

export function estimatedRate(allRates: number[]): number {
  if (!allRates.length) return 0;

  const rates = allRates.slice(CALCULATE_FROM_LAST * -1).reverse();
  const weights = generateWeights(rates.length);

  return rates.reduce((acc, rate, index) => {
    const weight = weights[index] as number;
    return acc + rate * weight;
  }, 0);
}

export function generateWeights(totalRates: number): number[] {
  const proportions: number[] = [];

  Array.from({ length: totalRates }).forEach((_, index) => {
    proportions.push(proportionForPosition(index + 1));
  });

  const proportionTotal = proportions.reduce((acc, value) => acc + value, 0);
  const realWeights = proportions.map(
    (proportion) => proportion / proportionTotal,
  );

  return realWeights;
}

export function proportionForPosition(position: number) {
  for (const { threshold, proportion } of THRESHOLDS) {
    if (position <= threshold) {
      return proportion;
    }
  }
  return DEFAULT_PROPORTION;
}
