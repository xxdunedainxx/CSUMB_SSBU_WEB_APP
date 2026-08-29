import type { DerivedFeature } from "../types";
import type { PosnerMeasurements } from "../extractors";
import { safeRatio } from "../math";
import { ev, fmtMs, fmtPercent, fmtPp } from "./helpers";

/**
 * Posner feature derivation. `Type` is intentionally never read — the shape
 * provides it but it is not part of the v1 interpretation.
 */
export function posnerFeatures(m: PosnerMeasurements): DerivedFeature[] {
  const features: DerivedFeature[] = [];

  // Cue cost from the Real block (the interpreted test phase).
  const cueCost = safeRatio(
    m.real.invalid.average !== null && m.real.valid.average !== null
      ? m.real.invalid.average - m.real.valid.average
      : null,
    m.real.valid.average
  );
  if (cueCost !== null) {
    features.push({
      id: "pos_relative_cue_cost",
      domain: "attention",
      facet: "Cue Influence",
      value: cueCost,
      unit: "ratio",
      quality: "high",
      evidence: [
        ev("Invalid-cue average", m.real.invalid.average ?? 0, fmtMs(m.real.invalid.average ?? 0)),
        ev("Valid-cue average", m.real.valid.average ?? 0, fmtMs(m.real.valid.average ?? 0)),
        ev("Relative cue cost", cueCost, fmtPercent(cueCost)),
      ],
    });
    features.push({
      id: "pos_cue_cost_ms",
      domain: "attention",
      facet: "Cue Influence",
      value: (m.real.invalid.average ?? 0) - (m.real.valid.average ?? 0),
      unit: "milliseconds",
      quality: "high",
      evidence: [
        ev("Invalid-cue average", m.real.invalid.average ?? 0, fmtMs(m.real.invalid.average ?? 0)),
        ev("Valid-cue average", m.real.valid.average ?? 0, fmtMs(m.real.valid.average ?? 0)),
      ],
    });
  }

  // Error cost in percentage points.
  if (m.real.invalid.incorrectPercentage !== null && m.real.valid.incorrectPercentage !== null) {
    const errorCost = m.real.invalid.incorrectPercentage - m.real.valid.incorrectPercentage;
    features.push({
      id: "pos_error_cost",
      domain: "attention",
      facet: "Error Control",
      value: errorCost,
      unit: "percentage-points",
      quality: "high",
      evidence: [
        ev("Invalid-cue error", m.real.invalid.incorrectPercentage, fmtPp(m.real.invalid.incorrectPercentage)),
        ev("Valid-cue error", m.real.valid.incorrectPercentage, fmtPp(m.real.valid.incorrectPercentage)),
        ev("Error cost", errorCost, fmtPp(errorCost)),
      ],
    });
  }

  // Cue-cost adaptation — percentage-point change between Practice and Real
  // relative cue costs (per the brief: use pp change, not division).
  const practiceCueCost = safeRatio(
    m.practice.invalid.average !== null && m.practice.valid.average !== null
      ? m.practice.invalid.average - m.practice.valid.average
      : null,
    m.practice.valid.average
  );
  if (practiceCueCost !== null && cueCost !== null) {
    const changePp = (practiceCueCost - cueCost) * 100;
    features.push({
      id: "pos_cue_cost_change",
      domain: "attention",
      facet: "Adaptation",
      value: changePp,
      unit: "percentage-points",
      quality: "medium",
      evidence: [
        ev("Practice relative cue cost", practiceCueCost, fmtPercent(practiceCueCost)),
        ev("Real relative cue cost", cueCost, fmtPercent(cueCost)),
        ev("Cue-cost change", changePp, fmtPp(changePp)),
      ],
    });
  }

  // Error-cost adaptation (pp change between Practice and Real).
  if (
    m.practice.invalid.incorrectPercentage !== null &&
    m.practice.valid.incorrectPercentage !== null &&
    m.real.invalid.incorrectPercentage !== null &&
    m.real.valid.incorrectPercentage !== null
  ) {
    const practiceErrorCost = m.practice.invalid.incorrectPercentage - m.practice.valid.incorrectPercentage;
    const realErrorCost = m.real.invalid.incorrectPercentage - m.real.valid.incorrectPercentage;
    const changePp = practiceErrorCost - realErrorCost;
    features.push({
      id: "pos_error_cost_change",
      domain: "attention",
      facet: "Adaptation",
      value: changePp,
      unit: "percentage-points",
      quality: "medium",
      evidence: [
        ev("Practice error cost", practiceErrorCost, fmtPp(practiceErrorCost)),
        ev("Real error cost", realErrorCost, fmtPp(realErrorCost)),
        ev("Error-cost change", changePp, fmtPp(changePp)),
      ],
    });
  }

  return features;
}
