import type { DerivedFeature } from "../types";
import type { SrtMeasurements } from "../extractors";
import { safeRatio } from "../math";
import { ev, fmtMs, fmtPercent } from "./helpers";

export function srtFeatures(m: SrtMeasurements): DerivedFeature[] {
  const features: DerivedFeature[] = [];

  // Warm-up gain — how much faster the Real block was versus Practice.
  const warmupGain = safeRatio(m.practice.average - m.real.average, m.practice.average);
  if (warmupGain !== null) {
    features.push({
      id: "srt_warmup_gain",
      domain: "reaction",
      facet: "Adaptation",
      value: warmupGain,
      unit: "ratio",
      quality: "high",
      evidence: [
        ev("Practice average", m.practice.average, fmtMs(m.practice.average)),
        ev("Real average", m.real.average, fmtMs(m.real.average)),
        ev("Warm-up gain", warmupGain, fmtPercent(warmupGain)),
      ],
    });
  }

  // Average change Practice -> Real (signed; negative = faster).
  const avgChange = safeRatio(m.real.average - m.practice.average, m.practice.average);
  if (avgChange !== null) {
    features.push({
      id: "srt_avg_change",
      domain: "reaction",
      facet: "Adaptation",
      value: avgChange,
      unit: "ratio",
      quality: "high",
      evidence: [
        ev("Practice average", m.practice.average, fmtMs(m.practice.average)),
        ev("Real average", m.real.average, fmtMs(m.real.average)),
      ],
    });
  }

  // Peak gap — distance from the fastest trial to the Real average.
  const peakGap = safeRatio(m.real.average - m.real.peak, m.real.average);
  if (peakGap !== null) {
    features.push({
      id: "srt_peak_gap",
      domain: "reaction",
      facet: "Response Pattern",
      value: peakGap,
      unit: "ratio",
      quality: "medium",
      evidence: [
        ev("Real average", m.real.average, fmtMs(m.real.average)),
        ev("Real peak", m.real.peak, fmtMs(m.real.peak)),
        ev("Peak gap", peakGap, fmtPercent(peakGap)),
      ],
    });
  }

  // Peak change Practice -> Real (signed; negative = faster).
  const peakChange = safeRatio(m.real.peak - m.practice.peak, m.practice.peak);
  if (peakChange !== null) {
    features.push({
      id: "srt_peak_change",
      domain: "reaction",
      facet: "Response Pattern",
      value: peakChange,
      unit: "ratio",
      quality: "medium",
      evidence: [
        ev("Practice peak", m.practice.peak, fmtMs(m.practice.peak)),
        ev("Real peak", m.real.peak, fmtMs(m.real.peak)),
      ],
    });
  }

  return features;
}
