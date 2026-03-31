export function calculateEnergy(weightKg) {
  return weightKg * 0.5;
}

export function calculateCO2Saved(weightKg) {
  return weightKg * 0.8;
}

export function calculatePoints(weightKg) {
  return Math.round(weightKg * 10);
}
