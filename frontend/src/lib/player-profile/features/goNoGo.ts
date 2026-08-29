import type { DerivedFeature } from "../types";
import type { GngMeasurements } from "../extractors";
import { safeRatio } from "../math";
import { ev, fmtCount, fmtMs, fmtPercent } from "./helpers";

export function goNoGoFeatures(m: GngMeasurements): DerivedFeature[] {
  const features: DerivedFeature[] = [];

  const rtGain = safeRatio(m.practice.mean !== null && m.real.mean !== null ? m.practice.mean - m.real.mean : null, m.practice.mean);
  if (rtGain !== null) {
    features.push({
      id: "gng_rt_gain",
      domain: "inhibition",
      facet: "Adaptation",
      value: rtGain,
      unit: "ratio",
      quality: "medium",
      evidence: [
        ev("Practice mean", m.practice.mean ?? 0, fmtMs(m.practice.mean ?? 0)),
        ev("Real mean", m.real.mean ?? 0, fmtMs(m.real.mean ?? 0)),
        ev("RT gain", rtGain, fmtPercent(rtGain)),
      ],
    });
  }

  if (m.practice.errors !== null && m.real.errors !== null) {
    const change = m.real.errors - m.practice.errors;
    features.push({
      id: "gng_error_change",
      domain: "inhibition",
      facet: "Control Shift",
      value: change,
      unit: "count",
      quality: "medium",
      evidence: [
        ev("Practice error count", m.practice.errors, fmtCount(m.practice.errors)),
        ev("Real error count", m.real.errors, fmtCount(m.real.errors)),
        ev("Error change", change, fmtCount(change)),
      ],
    });
  }

  const peakGap = safeRatio(m.real.mean !== null && m.real.peak !== null ? m.real.mean - m.real.peak : null, m.real.mean);
  if (peakGap !== null) {
    features.push({
      id: "gng_peak_gap",
      domain: "inhibition",
      facet: "Response Pattern",
      value: peakGap,
      unit: "ratio",
      quality: "low",
      evidence: [
        ev("Real mean", m.real.mean ?? 0, fmtMs(m.real.mean ?? 0)),
        ev("Real peak", m.real.peak ?? 0, fmtMs(m.real.peak ?? 0)),
        ev("Peak gap", peakGap, fmtPercent(peakGap)),
      ],
    });
  }

  return features;
}
