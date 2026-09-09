import type { EvidenceItem } from "../types";

export function fmtMs(value: number): string {
  return `${Math.round(value)} ms`;
}

export function fmtPercent(value: number, digits = 1): string {
  return `${(value * 100).toFixed(digits)}%`;
}

export function fmtPp(value: number, digits = 1): string {
  return `${value.toFixed(digits)} pp`;
}

export function fmtRatio(value: number, digits = 2): string {
  return value.toFixed(digits);
}

export function fmtDegrees(value: number, digits = 1): string {
  return `${value.toFixed(digits)}°`;
}

export function fmtCount(value: number): string {
  return String(value);
}

export function ev(
  label: string,
  value: number | string | null,
  formatted: string
): EvidenceItem {
  return { label, value, formatted };
}
