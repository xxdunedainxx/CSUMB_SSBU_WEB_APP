import type { DerivedFeature, ProfileConfig } from "../types";
import type { ControllerMeasurements, DirectionMetrics } from "../extractors";
import { clamp01, relativeSpread, safeRatio } from "../math";
import {
  cardinalOnlyBaseline,
  dualLeftWeightedAccuracy,
  dualLeftWeightedReaction,
  meanAccuracy,
  meanHitPercent,
} from "../extractors";
import { ev, fmtCount, fmtDegrees, fmtMs, fmtPp, fmtPercent, fmtRatio } from "./helpers";

function normalizedPrecision(accuracyDegrees: number | null, radius: number): number | null {
  if (accuracyDegrees === null) return null;
  return accuracyDegrees / radius;
}

export function controllerFeatures(
  m: ControllerMeasurements,
  config: ProfileConfig
): DerivedFeature[] {
  const features: DerivedFeature[] = [];
  const radius = config.controller.targetRadiusDegrees;
  const singleTrials = config.controller.singleTrials;

  /* ----- Targeting: precision, hit rate ----- */

  const leftPrec = normalizedPrecision(meanAccuracy(m.left), radius);
  const rightPrec = normalizedPrecision(meanAccuracy(m.right), radius);
  if (leftPrec !== null) {
    features.push({
      id: "ctl_left_precision",
      domain: "controller",
      facet: "Targeting",
      value: leftPrec,
      unit: "ratio",
      quality: "high",
      evidence: [
        ev("Left mean angular error", meanAccuracy(m.left), fmtDegrees(meanAccuracy(m.left) ?? 0)),
        ev("Normalized error", leftPrec, fmtRatio(leftPrec)),
      ],
    });
  }
  if (rightPrec !== null) {
    features.push({
      id: "ctl_right_precision",
      domain: "controller",
      facet: "Targeting",
      value: rightPrec,
      unit: "ratio",
      quality: "high",
      evidence: [
        ev("Right mean angular error", meanAccuracy(m.right), fmtDegrees(meanAccuracy(m.right) ?? 0)),
        ev("Normalized error", rightPrec, fmtRatio(rightPrec)),
      ],
    });
  }
  if (leftPrec !== null && rightPrec !== null) {
    const combined = (leftPrec + rightPrec) / 2;
    features.push({
      id: "ctl_combined_precision",
      domain: "controller",
      facet: "Targeting",
      value: combined,
      unit: "ratio",
      quality: "high",
      evidence: [
        ev("Left normalized error", leftPrec, fmtRatio(leftPrec)),
        ev("Right normalized error", rightPrec, fmtRatio(rightPrec)),
      ],
    });
  }

  const leftMisses = m.left.targetsMissed;
  const rightMisses = m.right.targetsMissed;
  if (leftMisses !== null) {
    const hitRate = (singleTrials - leftMisses) / singleTrials;
    features.push({
      id: "ctl_left_hit_rate",
      domain: "controller",
      facet: "Targeting",
      value: hitRate,
      unit: "ratio",
      quality: "high",
      evidence: [
        ev("Left targets missed", leftMisses, fmtCount(leftMisses)),
        ev("Left trial count", singleTrials, fmtCount(singleTrials)),
      ],
    });
  }
  if (rightMisses !== null) {
    const hitRate = (singleTrials - rightMisses) / singleTrials;
    features.push({
      id: "ctl_right_hit_rate",
      domain: "controller",
      facet: "Targeting",
      value: hitRate,
      unit: "ratio",
      quality: "high",
      evidence: [
        ev("Right targets missed", rightMisses, fmtCount(rightMisses)),
        ev("Right trial count", singleTrials, fmtCount(singleTrials)),
      ],
    });
  }
  if (leftMisses !== null && rightMisses !== null) {
    const hitRate = (singleTrials * 2 - leftMisses - rightMisses) / (singleTrials * 2);
    features.push({
      id: "ctl_single_hit_rate",
      domain: "controller",
      facet: "Targeting",
      value: hitRate,
      unit: "ratio",
      quality: "high",
      evidence: [
        ev("Left targets missed", leftMisses, fmtCount(leftMisses)),
        ev("Right targets missed", rightMisses, fmtCount(rightMisses)),
        ev("Combined trials", singleTrials * 2, fmtCount(singleTrials * 2)),
      ],
    });
  }

  /* ----- Stick balance ----- */

  const leftRt = m.left.totalAverageReaction;
  const rightRt = m.right.totalAverageReaction;
  if (leftRt !== null && rightRt !== null && leftRt + rightRt > 0) {
    const diff = Math.abs(leftRt - rightRt) / ((leftRt + rightRt) / 2);
    features.push({
      id: "ctl_stick_rt_balance",
      domain: "controller",
      facet: "Stick Balance",
      value: diff,
      unit: "ratio",
      quality: "high",
      evidence: [
        ev("Left average RT", leftRt, fmtMs(leftRt)),
        ev("Right average RT", rightRt, fmtMs(rightRt)),
      ],
    });
  }

  if (m.left.directions && m.right.directions) {
    const leftHit = meanHitPercent(m.left);
    const rightHit = meanHitPercent(m.right);
    if (leftHit !== null && rightHit !== null) {
      const diffPp = Math.abs(leftHit - rightHit);
      features.push({
        id: "ctl_stick_hit_balance",
        domain: "controller",
        facet: "Stick Balance",
        value: diffPp,
        unit: "percentage-points",
        quality: "medium",
        evidence: [
          ev("Left mean hit rate", leftHit, fmtPercent(leftHit / 100, 0)),
          ev("Right mean hit rate", rightHit, fmtPercent(rightHit / 100, 0)),
        ],
      });
    }
  }

  if (leftPrec !== null && rightPrec !== null) {
    const diff = Math.abs(leftPrec - rightPrec);
    features.push({
      id: "ctl_stick_precision_balance",
      domain: "controller",
      facet: "Stick Balance",
      value: diff,
      unit: "ratio",
      quality: "high",
      evidence: [
        ev("Left normalized precision", leftPrec, fmtRatio(leftPrec)),
        ev("Right normalized precision", rightPrec, fmtRatio(rightPrec)),
      ],
    });
  }

  /* ----- Directionality ----- */

  for (const [side, stick] of [["left", m.left], ["right", m.right]] as const) {
    const reactions = Object.values(stick.directions)
      .filter((d): d is DirectionMetrics => d !== undefined)
      .map((d) => d.reactionMs);
    const rtSpread = relativeSpread(reactions);
    if (rtSpread !== null) {
      features.push({
        id: `ctl_${side}_rt_spread`,
        domain: "controller",
        facet: "Directionality",
        value: rtSpread,
        unit: "ratio",
        quality: "medium",
        evidence: [
          ev(`${side} direction reaction spread`, rtSpread, fmtPercent(rtSpread)),
        ],
      });
    }

    const normAccuracies = Object.values(stick.directions)
      .filter((d): d is DirectionMetrics => d !== undefined)
      .map((d) => normalizedPrecision(d.accuracyDegrees, radius));
    const usable = normAccuracies.filter((v): v is number => v !== null);
    if (usable.length >= 2) {
      const spread = Math.max(...usable) - Math.min(...usable);
      features.push({
        id: `ctl_${side}_precision_spread`,
        domain: "controller",
        facet: "Directionality",
        value: spread,
        unit: "ratio",
        quality: "medium",
        evidence: [
          ev(`${side} precision spread (normalized)`, spread, fmtRatio(spread)),
        ],
      });
    }
  }

  /* ----- Dual interference ----- */

  const dualLeftRt = dualLeftWeightedReaction(m.dualLeft);
  const dualRightRt = meanReactionOf(m.dualRight);
  const rightBaseline = cardinalOnlyBaseline(m.right);

  const leftRtCost = safeRatio(dualLeftRt !== null && leftRt !== null ? dualLeftRt - leftRt : null, leftRt);
  if (leftRtCost !== null) {
    features.push({
      id: "ctl_left_dual_rt_cost",
      domain: "controller",
      facet: "Dual Coordination",
      value: leftRtCost,
      unit: "ratio",
      quality: "high",
      evidence: [
        ev("Dual left weighted RT", dualLeftRt ?? 0, fmtMs(dualLeftRt ?? 0)),
        ev("Single left RT", leftRt ?? 0, fmtMs(leftRt ?? 0)),
        ev("RT cost", leftRtCost, fmtPercent(leftRtCost)),
      ],
    });
  }

  const rightRtCost = safeRatio(dualRightRt !== null && rightBaseline.reaction !== null ? dualRightRt - rightBaseline.reaction : null, rightBaseline.reaction);
  if (rightRtCost !== null) {
    features.push({
      id: "ctl_right_dual_rt_cost",
      domain: "controller",
      facet: "Dual Coordination",
      value: rightRtCost,
      unit: "ratio",
      quality: "high",
      evidence: [
        ev("Dual right RT", dualRightRt ?? 0, fmtMs(dualRightRt ?? 0)),
        ev("Single right cardinal RT", rightBaseline.reaction ?? 0, fmtMs(rightBaseline.reaction ?? 0)),
        ev("RT cost", rightRtCost, fmtPercent(rightRtCost)),
      ],
    });
  }

  // Hit cost in percentage points.
  const dualTrials = config.controller.dualTrials;
  if (m.dualLeft.targetsMissed !== null && leftMisses !== null) {
    const singleRate = (singleTrials - leftMisses) / singleTrials;
    const dualRate = (dualTrials - m.dualLeft.targetsMissed) / dualTrials;
    const hitCostPp = (singleRate - dualRate) * 100;
    features.push({
      id: "ctl_left_dual_hit_cost",
      domain: "controller",
      facet: "Dual Coordination",
      value: hitCostPp,
      unit: "percentage-points",
      quality: "high",
      evidence: [
        ev("Single left hit rate", singleRate, fmtPercent(singleRate)),
        ev("Dual left hit rate", dualRate, fmtPercent(dualRate)),
      ],
    });
  }
  if (m.dualRight.targetsMissed !== null && rightMisses !== null) {
    const singleRate = (singleTrials - rightMisses) / singleTrials;
    const dualRate = (dualTrials - m.dualRight.targetsMissed) / dualTrials;
    const hitCostPp = (singleRate - dualRate) * 100;
    features.push({
      id: "ctl_right_dual_hit_cost",
      domain: "controller",
      facet: "Dual Coordination",
      value: hitCostPp,
      unit: "percentage-points",
      quality: "high",
      evidence: [
        ev("Single right hit rate", singleRate, fmtPercent(singleRate)),
        ev("Dual right hit rate", dualRate, fmtPercent(dualRate)),
      ],
    });
  }

  // Precision cost (normalized).
  const dualLeftPrec = normalizedPrecision(dualLeftWeightedAccuracy(m.dualLeft), radius);
  const dualRightPrec = normalizedPrecision(meanAccuracyOf(m.dualRight), radius);
  if (dualLeftPrec !== null && leftPrec !== null) {
    const cost = dualLeftPrec - leftPrec;
    features.push({
      id: "ctl_left_dual_precision_cost",
      domain: "controller",
      facet: "Dual Coordination",
      value: cost,
      unit: "ratio",
      quality: "high",
      evidence: [
        ev("Dual left normalized precision", dualLeftPrec, fmtRatio(dualLeftPrec)),
        ev("Single left normalized precision", leftPrec, fmtRatio(leftPrec)),
      ],
    });
  }
  if (dualRightPrec !== null && rightPrec !== null) {
    const cost = dualRightPrec - rightPrec;
    features.push({
      id: "ctl_right_dual_precision_cost",
      domain: "controller",
      facet: "Dual Coordination",
      value: cost,
      unit: "ratio",
      quality: "high",
      evidence: [
        ev("Dual right normalized precision", dualRightPrec, fmtRatio(dualRightPrec)),
        ev("Single right normalized precision", rightPrec, fmtRatio(rightPrec)),
      ],
    });
  }

  /* ----- Dual balance (internal interference scores) ----- */

  const interference = (rtCost: number | null, hitCostPp: number | null, precCost: number | null) => {
    const rtImpact = rtCost === null ? null : clamp01(rtCost / 0.3);
    const hitImpact = hitCostPp === null ? null : clamp01(hitCostPp / 15);
    const precImpact = precCost === null ? null : clamp01(precCost / 0.3);
    const parts = [rtImpact, hitImpact, precImpact].filter((v): v is number => v !== null);
    if (parts.length === 0) return null;
    return parts.reduce((s, v) => s + v, 0) / parts.length;
  };

  const leftInterference = interference(leftRtCost, getFeatureValue(features, "ctl_left_dual_hit_cost"), getFeatureValue(features, "ctl_left_dual_precision_cost"));
  const rightInterference = interference(rightRtCost, getFeatureValue(features, "ctl_right_dual_hit_cost"), getFeatureValue(features, "ctl_right_dual_precision_cost"));
  if (leftInterference !== null) {
    features.push({
      id: "ctl_left_interference",
      domain: "controller",
      facet: "Dual Balance",
      value: leftInterference,
      unit: "ratio",
      quality: "medium",
      evidence: [ev("Left dual interference score", leftInterference, fmtRatio(leftInterference))],
    });
  }
  if (rightInterference !== null) {
    features.push({
      id: "ctl_right_interference",
      domain: "controller",
      facet: "Dual Balance",
      value: rightInterference,
      unit: "ratio",
      quality: "medium",
      evidence: [ev("Right dual interference score", rightInterference, fmtRatio(rightInterference))],
    });
  }

  /* ----- Sequence control ----- */

  const orderRate = safeRatio(m.dual.outOfOrderCount, dualTrials);
  if (orderRate !== null) {
    features.push({
      id: "ctl_order_error_rate",
      domain: "controller",
      facet: "Sequence",
      value: orderRate,
      unit: "ratio",
      quality: "high",
      evidence: [
        ev("Out-of-order events", m.dual.outOfOrderCount ?? 0, fmtCount(m.dual.outOfOrderCount ?? 0)),
        ev("Dual trials", dualTrials, fmtCount(dualTrials)),
      ],
    });
  }

  /* ----- Peak / burst ----- */

  for (const [side, stick] of [["left", m.left], ["right", m.right]] as const) {
    const gap = safeRatio(stick.totalAverageReaction !== null && stick.peakReaction !== null ? stick.totalAverageReaction - stick.peakReaction : null, stick.totalAverageReaction);
    if (gap !== null) {
      features.push({
        id: `ctl_${side}_burst_gap`,
        domain: "controller",
        facet: "Response Pattern",
        value: gap,
        unit: "ratio",
        quality: "low",
        evidence: [
          ev(`${side} average RT`, stick.totalAverageReaction ?? 0, fmtMs(stick.totalAverageReaction ?? 0)),
          ev(`${side} peak RT`, stick.peakReaction ?? 0, fmtMs(stick.peakReaction ?? 0)),
        ],
      });
    }
  }
  const dualBurstGap = safeRatio(m.dual.totalAverageReaction !== null && m.dual.peakReaction !== null ? m.dual.totalAverageReaction - m.dual.peakReaction : null, m.dual.totalAverageReaction);
  if (dualBurstGap !== null) {
    features.push({
      id: "ctl_dual_burst_gap",
      domain: "controller",
      facet: "Response Pattern",
      value: dualBurstGap,
      unit: "ratio",
      quality: "low",
      evidence: [
        ev("Dual average RT", m.dual.totalAverageReaction ?? 0, fmtMs(m.dual.totalAverageReaction ?? 0)),
        ev("Dual peak RT", m.dual.peakReaction ?? 0, fmtMs(m.dual.peakReaction ?? 0)),
      ],
    });
  }

  return features;
}

function meanReactionOf(stick: { directions: Partial<Record<string, DirectionMetrics>> }): number | null {
  const values = Object.values(stick.directions)
    .filter((d): d is DirectionMetrics => d !== undefined)
    .map((d) => d.reactionMs);
  const usable = values.filter((v): v is number => v !== null);
  if (usable.length === 0) return null;
  return usable.reduce((s, v) => s + v, 0) / usable.length;
}

function meanAccuracyOf(stick: { directions: Partial<Record<string, DirectionMetrics>> }): number | null {
  const values = Object.values(stick.directions)
    .filter((d): d is DirectionMetrics => d !== undefined)
    .map((d) => d.accuracyDegrees);
  const usable = values.filter((v): v is number => v !== null);
  if (usable.length === 0) return null;
  return usable.reduce((s, v) => s + v, 0) / usable.length;
}

function getFeatureValue(features: DerivedFeature[], id: string): number | null {
  return features.find((f) => f.id === id)?.value ?? null;
}
