/**
 * Pure numeric helpers. All functions tolerate null/undefined/NaN inputs and
 * return null instead of propagating invalid numbers.
 */

export type MaybeNumber = number | null | undefined;

export function isFiniteNum(v: unknown): v is number {
  return typeof v === "number" && Number.isFinite(v);
}

/** Clamps a number to [min, max]. Non-finite input returns fallback (default 0). */
export function clamp(
  value: MaybeNumber,
  min = 0,
  max = 1,
  fallback = 0
): number {
  if (!isFiniteNum(value)) return fallback;
  return Math.min(max, Math.max(min, value));
}

export function clamp01(value: MaybeNumber, fallback = 0): number {
  return clamp(value, 0, 1, fallback);
}

/** value / denominator with a guard against zero and invalid numbers. */
export function safeRatio(
  numerator: MaybeNumber,
  denominator: MaybeNumber
): number | null {
  if (!isFiniteNum(numerator) || !isFiniteNum(denominator)) return null;
  if (denominator === 0) return null;
  return numerator / denominator;
}

/** Mean of finite values; null when there are no usable values. */
export function safeMean(values: MaybeNumber[]): number | null {
  const usable = values.filter(isFiniteNum);
  if (usable.length === 0) return null;
  return usable.reduce((sum, v) => sum + v, 0) / usable.length;
}

/** Weighted mean of finite entries; null when there are no usable entries. */
export function safeWeightedMean(
  entries: { value: MaybeNumber; weight: number }[]
): number | null {
  let sum = 0;
  let weightSum = 0;
  for (const entry of entries) {
    if (!isFiniteNum(entry.value)) continue;
    sum += entry.value * entry.weight;
    weightSum += entry.weight;
  }
  if (weightSum === 0) return null;
  return sum / weightSum;
}

/** Max of finite values; null when none. */
export function safeMax(values: MaybeNumber[]): number | null {
  const usable = values.filter(isFiniteNum);
  if (usable.length === 0) return null;
  return Math.max(...usable);
}

/** Min of finite values; null when none. */
export function safeMin(values: MaybeNumber[]): number | null {
  const usable = values.filter(isFiniteNum);
  if (usable.length === 0) return null;
  return Math.min(...usable);
}

/** (max - min) / mean over finite values; null when not computable. */
export function relativeSpread(values: MaybeNumber[]): number | null {
  const mean = safeMean(values);
  const min = safeMin(values);
  const max = safeMax(values);
  if (mean === null || min === null || max === null || mean === 0) return null;
  return (max - min) / mean;
}

/** true when the value is finite and present (not null/undefined/NaN). */
export function hasValue(v: MaybeNumber): boolean {
  return isFiniteNum(v);
}
