import type { DerivedFeature } from "../types";
import type { TsMeasurements } from "../extractors";
import { safeRatio } from "../math";
import { ev, fmtMs, fmtPercent } from "./helpers";

function switchCostFeature(block: { single: number | null; repeat: number | null; switch: number | null; storedCost: number | null }, source: "practice" | "actual"): DerivedFeature[] {
  const out: DerivedFeature[] = [];
  if (block.repeat === null || block.switch === null) return out;

  const cost = block.switch - block.repeat;
  const relative = safeRatio(cost, block.repeat);

  const evidence = [
    ev("Mixed switch RT", block.switch, fmtMs(block.switch)),
    ev("Mixed repeat RT", block.repeat, fmtMs(block.repeat)),
  ];
  if (block.storedCost !== null) {
    evidence.push(ev("Stored switch cost", block.storedCost, fmtMs(block.storedCost)));
  }
  if (relative !== null) {
    evidence.push(ev("Relative switch cost", relative, fmtPercent(relative)));
  }

  out.push({
    id: `ts_switch_cost_${source}`,
    domain: "flexibility",
    facet: "Switching",
    value: cost,
    unit: "milliseconds",
    quality: "high",
    evidence,
  });
  if (relative !== null) {
    out.push({
      id: `ts_relative_switch_cost_${source}`,
      domain: "flexibility",
      facet: "Switching",
      value: relative,
      unit: "ratio",
      quality: "high",
      evidence,
    });
  }
  return out;
}

function mixingCostFeature(block: { single: number | null; repeat: number | null; switch: number | null; storedCost: number | null }, source: "practice" | "actual"): DerivedFeature[] {
  const out: DerivedFeature[] = [];
  if (block.single === null || block.repeat === null) return out;

  const cost = block.repeat - block.single;
  const relative = safeRatio(cost, block.single);

  const evidence = [
    ev("Single-task RT", block.single, fmtMs(block.single)),
    ev("Mixed repeat RT", block.repeat, fmtMs(block.repeat)),
  ];
  if (relative !== null) {
    evidence.push(ev("Relative mixing cost", relative, fmtPercent(relative)));
  }

  out.push({
    id: `ts_mix_cost_${source}`,
    domain: "flexibility",
    facet: "Mixed Load",
    value: cost,
    unit: "milliseconds",
    quality: "high",
    evidence,
  });
  if (relative !== null) {
    out.push({
      id: `ts_relative_mix_cost_${source}`,
      domain: "flexibility",
      facet: "Mixed Load",
      value: relative,
      unit: "ratio",
      quality: "high",
      evidence,
    });
  }
  return out;
}

export function taskSwitchingFeatures(m: TsMeasurements): DerivedFeature[] {
  const features: DerivedFeature[] = [];
  const actual = m.mean.actual;
  const practice = m.mean.practice;

  features.push(...switchCostFeature(actual, "actual"));
  features.push(...switchCostFeature(practice, "practice"));
  features.push(...mixingCostFeature(actual, "actual"));
  features.push(...mixingCostFeature(practice, "practice"));

  // Adaptation is computed over relative costs so general speed changes are
  // not mistaken for switch-specific adaptation.
  const relCost = (block: { repeat: number | null; switch: number | null }) =>
    block.repeat !== null && block.switch !== null ? safeRatio(block.switch - block.repeat, block.repeat) : null;
  const relMix = (block: { single: number | null; repeat: number | null }) =>
    block.single !== null && block.repeat !== null ? safeRatio(block.repeat - block.single, block.single) : null;

  const pSwitch = relCost(practice);
  const aSwitch = relCost(actual);
  if (pSwitch !== null && aSwitch !== null && pSwitch !== 0) {
    const adapt = safeRatio(pSwitch - aSwitch, pSwitch);
    if (adapt !== null) {
      features.push({
        id: "ts_switch_adaptation",
        domain: "flexibility",
        facet: "Adaptation",
        value: adapt,
        unit: "ratio",
        quality: "high",
        evidence: [
          ev("Practice relative switch cost", pSwitch, fmtPercent(pSwitch)),
          ev("Actual relative switch cost", aSwitch, fmtPercent(aSwitch)),
          ev("Switch adaptation", adapt, fmtPercent(adapt)),
        ],
      });
    }
  }

  const pMix = relMix(practice);
  const aMix = relMix(actual);
  if (pMix !== null && aMix !== null && pMix !== 0) {
    const adapt = safeRatio(pMix - aMix, pMix);
    if (adapt !== null) {
      features.push({
        id: "ts_mix_adaptation",
        domain: "flexibility",
        facet: "Adaptation",
        value: adapt,
        unit: "ratio",
        quality: "high",
        evidence: [
          ev("Practice relative mixing cost", pMix, fmtPercent(pMix)),
          ev("Actual relative mixing cost", aMix, fmtPercent(aMix)),
          ev("Mixing adaptation", adapt, fmtPercent(adapt)),
        ],
      });
    }
  }

  // Baseline RT adaptation (mixed repeat block) — speed improvement in general.
  const pBase = practice.repeat;
  const aBase = actual.repeat;
  const baselineAdapt = safeRatio(pBase !== null && aBase !== null ? pBase - aBase : null, pBase);
  if (baselineAdapt !== null) {
    features.push({
      id: "ts_baseline_rt_adaptation",
      domain: "flexibility",
      facet: "Adaptation",
      value: baselineAdapt,
      unit: "ratio",
      quality: "medium",
      evidence: [
        ev("Practice mixed repeat RT", pBase ?? 0, fmtMs(pBase ?? 0)),
        ev("Actual mixed repeat RT", aBase ?? 0, fmtMs(aBase ?? 0)),
      ],
    });
  }

  return features;
}
