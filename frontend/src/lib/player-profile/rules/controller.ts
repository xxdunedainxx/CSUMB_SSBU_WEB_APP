import type {
  DirectionKey,
  ProfileRule,
  ProfileTag,
  RuleContext,
} from "../types";
import type { ControllerMeasurements } from "../extractors";
import { CARDINAL_KEYS, meanHitPercent } from "../extractors";
import { clamp01, safeRatio } from "../math";
import {
  bandStrength,
  bandToStrength,
  feat,
  hasAllFeatures,
  higherIsStronger,
  lowerIsStronger,
  makeTag,
} from "./helpers";

const DOMAIN = "controller" as const;

const DIRECTION_LABELS: Record<DirectionKey, string> = {
  Left: "Left",
  Up_Left: "Up-Left",
  Up: "Up",
  Up_Right: "Up-Right",
  Right: "Right",
  Down_Right: "Down-Right",
  Down: "Down",
  Down_Left: "Down-Left",
};

export const controllerRules: ProfileRule[] = [
  /* ---------- Core: precision bands (exclusive group "precision") ---------- */

  {
    id: "ctl-center-locked",
    domain: DOMAIN,
    facet: "Targeting",
    priority: "core",
    mode: "exclusive",
    group: "precision",
    requiredFeatures: ["ctl_combined_precision"],
    evaluate: (ctx) => precisionRule(ctx, "center"),
  },
  {
    id: "ctl-bullseye-leaning",
    domain: DOMAIN,
    facet: "Targeting",
    priority: "core",
    mode: "exclusive",
    group: "precision",
    requiredFeatures: ["ctl_combined_precision"],
    evaluate: (ctx) => precisionRule(ctx, "bullseye"),
  },
  {
    id: "ctl-target-secure",
    domain: DOMAIN,
    facet: "Targeting",
    priority: "core",
    mode: "exclusive",
    group: "precision",
    requiredFeatures: ["ctl_combined_precision"],
    evaluate: (ctx) => precisionRule(ctx, "secure"),
  },
  {
    id: "ctl-wide-placement",
    domain: DOMAIN,
    facet: "Targeting",
    priority: "core",
    mode: "exclusive",
    group: "precision",
    requiredFeatures: ["ctl_combined_precision"],
    evaluate: (ctx) => precisionRule(ctx, "wide"),
  },

  /* ---------- Supporting: hit x precision (additive) ---------- */

  {
    id: "ctl-precision-biased",
    domain: DOMAIN,
    facet: "Targeting",
    priority: "supporting",
    mode: "additive",
    requiredFeatures: ["ctl_single_hit_rate", "ctl_combined_precision"],
    evaluate: (ctx) => hitPrecisionRule(ctx, "precision-biased"),
  },
  {
    id: "ctl-placement-variable",
    domain: DOMAIN,
    facet: "Targeting",
    priority: "supporting",
    mode: "additive",
    requiredFeatures: ["ctl_single_hit_rate", "ctl_combined_precision"],
    evaluate: (ctx) => hitPrecisionRule(ctx, "placement-variable"),
  },

  /* ---------- Core: stick balance (exclusive group "balance") ---------- */

  {
    id: "ctl-balanced-sticks",
    domain: DOMAIN,
    facet: "Stick Balance",
    priority: "core",
    mode: "exclusive",
    group: "balance",
    requiredFeatures: ["ctl_stick_rt_balance"],
    evaluate: (ctx) => balanceRule(ctx, "balanced"),
  },
  {
    id: "ctl-left-leaning",
    domain: DOMAIN,
    facet: "Stick Balance",
    priority: "core",
    mode: "exclusive",
    group: "balance",
    requiredFeatures: ["ctl_stick_rt_balance"],
    evaluate: (ctx) => balanceRule(ctx, "left"),
  },
  {
    id: "ctl-right-leaning",
    domain: DOMAIN,
    facet: "Stick Balance",
    priority: "core",
    mode: "exclusive",
    group: "balance",
    requiredFeatures: ["ctl_stick_rt_balance"],
    evaluate: (ctx) => balanceRule(ctx, "right"),
  },
  {
    id: "ctl-split-control",
    domain: DOMAIN,
    facet: "Stick Balance",
    priority: "core",
    mode: "exclusive",
    group: "balance",
    requiredFeatures: ["ctl_stick_rt_balance"],
    evaluate: (ctx) => balanceRule(ctx, "split"),
  },

  /* ---------- Supporting: directionality spreads (additive) ---------- */

  {
    id: "ctl-omni-directional",
    domain: DOMAIN,
    facet: "Directionality",
    priority: "supporting",
    mode: "additive",
    requiredFeatures: ["ctl_left_rt_spread", "ctl_right_rt_spread"],
    evaluate: (ctx) => directionalityRule(ctx, "omni"),
  },
  {
    id: "ctl-directional-tempo",
    domain: DOMAIN,
    facet: "Directionality",
    priority: "supporting",
    mode: "additive",
    requiredFeatures: ["ctl_left_rt_spread", "ctl_right_rt_spread"],
    evaluate: (ctx) => directionalityRule(ctx, "tempo"),
  },
  {
    id: "ctl-directional-precision",
    domain: DOMAIN,
    facet: "Directionality",
    priority: "supporting",
    mode: "additive",
    requiredFeatures: ["ctl_left_precision_spread", "ctl_right_precision_spread"],
    evaluate: (ctx) => directionalityRule(ctx, "precision"),
  },
  {
    id: "ctl-directional-specialist",
    domain: DOMAIN,
    facet: "Directionality",
    priority: "supporting",
    mode: "additive",
    requiredFeatures: ["ctl_left_rt_spread", "ctl_right_rt_spread", "ctl_left_precision_spread", "ctl_right_precision_spread"],
    evaluate: (ctx) => directionalityRule(ctx, "specialist"),
  },

  /* ---------- Supporting: directional lean (additive) ---------- */

  ...(
    ["Left", "Up_Left", "Up", "Up_Right", "Right", "Down_Right", "Down", "Down_Left"] as DirectionKey[]
  ).map((dir): ProfileRule => ({
    id: `ctl-lean-${dir}`,
    domain: DOMAIN,
    facet: "Directionality",
    priority: "supporting",
    mode: "additive",
    requiredFeatures: ["ctl_left_rt_spread", "ctl_right_rt_spread"],
    evaluate: (ctx: RuleContext) => leanRule(ctx, dir),
  })),

  /* ---------- Supporting: axis patterns (additive) ---------- */

  {
    id: "ctl-horizontal-bias",
    domain: DOMAIN,
    facet: "Directionality",
    priority: "supporting",
    mode: "additive",
    requiredFeatures: ["ctl_left_rt_spread", "ctl_right_rt_spread"],
    evaluate: (ctx) => axisRule(ctx, "horizontal"),
  },
  {
    id: "ctl-vertical-bias",
    domain: DOMAIN,
    facet: "Directionality",
    priority: "supporting",
    mode: "additive",
    requiredFeatures: ["ctl_left_rt_spread", "ctl_right_rt_spread"],
    evaluate: (ctx) => axisRule(ctx, "vertical"),
  },
  {
    id: "ctl-diagonal-bias",
    domain: DOMAIN,
    facet: "Directionality",
    priority: "supporting",
    mode: "additive",
    requiredFeatures: ["ctl_left_rt_spread", "ctl_right_rt_spread"],
    evaluate: (ctx) => axisRule(ctx, "diagonal"),
  },

  /* ---------- Core: dual coordination style (exclusive group "dual-style") ---------- */

  {
    id: "ctl-dual-coordinator",
    domain: DOMAIN,
    facet: "Dual Coordination",
    priority: "core",
    mode: "exclusive",
    group: "dual-style",
    requiredFeatures: ["ctl_left_dual_rt_cost", "ctl_right_dual_rt_cost"],
    evaluate: (ctx) => dualStyleRule(ctx, "coordinator"),
  },
  {
    id: "ctl-precision-preserving-dualist",
    domain: DOMAIN,
    facet: "Dual Coordination",
    priority: "core",
    mode: "exclusive",
    group: "dual-style",
    requiredFeatures: ["ctl_left_dual_rt_cost", "ctl_right_dual_rt_cost"],
    evaluate: (ctx) => dualStyleRule(ctx, "precision-preserving"),
  },
  {
    id: "ctl-tempo-preserving-dualist",
    domain: DOMAIN,
    facet: "Dual Coordination",
    priority: "core",
    mode: "exclusive",
    group: "dual-style",
    requiredFeatures: ["ctl_left_dual_rt_cost", "ctl_right_dual_rt_cost"],
    evaluate: (ctx) => dualStyleRule(ctx, "tempo-preserving"),
  },
  {
    id: "ctl-dual-taxed",
    domain: DOMAIN,
    facet: "Dual Coordination",
    priority: "core",
    mode: "exclusive",
    group: "dual-style",
    requiredFeatures: ["ctl_left_dual_rt_cost", "ctl_right_dual_rt_cost"],
    evaluate: (ctx) => dualStyleRule(ctx, "dual-taxed"),
  },
  {
    id: "ctl-mixed-dual-load",
    domain: DOMAIN,
    facet: "Dual Coordination",
    priority: "core",
    mode: "exclusive",
    group: "dual-style",
    requiredFeatures: ["ctl_left_dual_rt_cost", "ctl_right_dual_rt_cost"],
    evaluate: (ctx) => dualStyleRule(ctx, "mixed"),
  },

  /* ---------- Supporting: dual balance (exclusive group "dual-balance") ---------- */

  {
    id: "ctl-balanced-dual-load",
    domain: DOMAIN,
    facet: "Dual Balance",
    priority: "supporting",
    mode: "exclusive",
    group: "dual-balance",
    requiredFeatures: ["ctl_left_interference", "ctl_right_interference"],
    evaluate: (ctx) => dualBalanceRule(ctx, "balanced"),
  },
  {
    id: "ctl-left-load-sensitive",
    domain: DOMAIN,
    facet: "Dual Balance",
    priority: "supporting",
    mode: "exclusive",
    group: "dual-balance",
    requiredFeatures: ["ctl_left_interference", "ctl_right_interference"],
    evaluate: (ctx) => dualBalanceRule(ctx, "left"),
  },
  {
    id: "ctl-right-load-sensitive",
    domain: DOMAIN,
    facet: "Dual Balance",
    priority: "supporting",
    mode: "exclusive",
    group: "dual-balance",
    requiredFeatures: ["ctl_left_interference", "ctl_right_interference"],
    evaluate: (ctx) => dualBalanceRule(ctx, "right"),
  },

  /* ---------- Core: sequence (exclusive group "sequence") ---------- */

  {
    id: "ctl-order-locked",
    domain: DOMAIN,
    facet: "Sequence",
    priority: "core",
    mode: "exclusive",
    group: "sequence",
    requiredFeatures: ["ctl_order_error_rate"],
    evaluate: (ctx) => sequenceRule(ctx, "locked"),
  },
  {
    id: "ctl-sequence-steady",
    domain: DOMAIN,
    facet: "Sequence",
    priority: "core",
    mode: "exclusive",
    group: "sequence",
    requiredFeatures: ["ctl_order_error_rate"],
    evaluate: (ctx) => sequenceRule(ctx, "steady"),
  },
  {
    id: "ctl-sequence-slips",
    domain: DOMAIN,
    facet: "Sequence",
    priority: "core",
    mode: "exclusive",
    group: "sequence",
    requiredFeatures: ["ctl_order_error_rate"],
    evaluate: (ctx) => sequenceRule(ctx, "slips"),
  },
  {
    id: "ctl-order-disrupted",
    domain: DOMAIN,
    facet: "Sequence",
    priority: "core",
    mode: "exclusive",
    group: "sequence",
    requiredFeatures: ["ctl_order_error_rate"],
    evaluate: (ctx) => sequenceRule(ctx, "disrupted"),
  },

  /* ---------- Secondary: peak / burst (additive) ---------- */

  {
    id: "ctl-even-tempo",
    domain: DOMAIN,
    facet: "Response Pattern",
    priority: "secondary",
    mode: "additive",
    requiredFeatures: ["ctl_left_burst_gap"],
    evaluate: (ctx) => burstRule(ctx, "even"),
  },
  {
    id: "ctl-reaction-burst",
    domain: DOMAIN,
    facet: "Response Pattern",
    priority: "secondary",
    mode: "additive",
    requiredFeatures: ["ctl_left_burst_gap"],
    evaluate: (ctx) => burstRule(ctx, "burst"),
  },
  {
    id: "ctl-high-burst-gap",
    domain: DOMAIN,
    facet: "Response Pattern",
    priority: "secondary",
    mode: "additive",
    requiredFeatures: ["ctl_left_burst_gap"],
    evaluate: (ctx) => burstRule(ctx, "high"),
  },
  {
    id: "ctl-dual-burst-preserved",
    domain: DOMAIN,
    facet: "Response Pattern",
    priority: "secondary",
    mode: "additive",
    requiredFeatures: ["ctl_left_burst_gap", "ctl_dual_burst_gap"],
    evaluate: (ctx) => burstRule(ctx, "dual-preserved"),
  },
];

/* ================================================================== */
/* Rule implementations                                               */
/* ================================================================== */

function precisionRule(ctx: RuleContext, mode: string): ReturnType<typeof makeTag> | null {
  const p = feat(ctx, "ctl_combined_precision");
  if (!p) return null;
  const { centerMax, bullseyeMax, secureMax } = ctx.config.controller.precision;

  const bands: Record<string, { min: number; max: number; label: string; desc: string }> = {
    center: { min: -Infinity, max: centerMax, label: "Center-Locked", desc: "Stick landings hugged the target center — tight, precise control." },
    bullseye: { min: centerMax, max: bullseyeMax, label: "Bullseye-Leaning", desc: "Stick landings were consistently close to the target center." },
    secure: { min: bullseyeMax, max: secureMax, label: "Target-Secure", desc: "Stick landings stayed reliably on target with a moderate spread." },
    wide: { min: secureMax, max: Infinity, label: "Wide Placement", desc: "Stick landings spread wide around the target — loose placement control." },
  };
  const band = bands[mode];
  if (!band) return null;

  if (mode === "center") {
    if (p.value > centerMax) return null;
    return makeTag({
      id: "center-locked",
      label: band.label,
      domain: DOMAIN,
      facet: "Targeting",
      priority: "core",
      evidenceQuality: "high",
      description: band.desc,
      evidence: p.evidence,
      ruleId: "ctl-center-locked",
      strength: 1 - p.value / centerMax,
    });
  }
  if (mode === "wide") {
    if (p.value <= secureMax) return null;
    return makeTag({
      id: "wide-placement",
      label: band.label,
      domain: DOMAIN,
      facet: "Targeting",
      priority: "core",
      evidenceQuality: "medium",
      description: band.desc,
      evidence: p.evidence,
      ruleId: "ctl-wide-placement",
      strength: 1,
    });
  }
  if (p.value <= band.min || p.value > band.max) return null;
  const ruleId = PRECISION_RULE_ID[mode] ?? `ctl-${mode}`;
  return makeTag({
    id: PRECISION_TAG_ID[mode] ?? `precision-${mode}`,
    label: band.label,
    domain: DOMAIN,
    facet: "Targeting",
    priority: "core",
    evidenceQuality: "high",
    description: band.desc,
    evidence: p.evidence,
    ruleId,
    strength: bandStrength(p.value, band.min, band.max),
  });
}

const PRECISION_RULE_ID: Record<string, string> = {
  bullseye: "ctl-bullseye-leaning",
  secure: "ctl-target-secure",
};

const PRECISION_TAG_ID: Record<string, string> = {
  bullseye: "precision-bullseye",
  secure: "precision-secure",
};

function hitPrecisionRule(ctx: RuleContext, mode: string): ReturnType<typeof makeTag> | null {
  const hit = feat(ctx, "ctl_single_hit_rate");
  const p = feat(ctx, "ctl_combined_precision");
  if (!hit || !p) return null;
  const { reliableAt } = ctx.config.controller.hit;
  const { bullseyeMax } = ctx.config.controller.precision;

  const lowHit = hit.value < reliableAt;
  const highPrecision = p.value <= bullseyeMax;

  if (mode === "precision-biased") {
    if (!(lowHit && highPrecision)) return null;
    return makeTag({
      id: "precision-biased",
      label: "Precision-Biased",
      domain: DOMAIN,
      facet: "Targeting",
      priority: "supporting",
      evidenceQuality: "medium",
      description:
        "Landings were tight around the target, but some targets were missed — precision favored over speed/reliability.",
      evidence: [...hit.evidence, ...p.evidence],
      ruleId: "ctl-precision-biased",
      strength: 0.6,
    });
  }
  if (mode === "placement-variable") {
    if (!(lowHit && !highPrecision)) return null;
    return makeTag({
      id: "placement-variable",
      label: "Placement-Variable",
      domain: DOMAIN,
      facet: "Targeting",
      priority: "supporting",
      evidenceQuality: "medium",
      description:
        "Landings spread widely and targets were missed — placement control was variable this session.",
      evidence: [...hit.evidence, ...p.evidence],
      ruleId: "ctl-placement-variable",
      strength: 0.6,
    });
  }
  return null;
}

function balanceRule(ctx: RuleContext, mode: string): ReturnType<typeof makeTag> | null {
  const rt = feat(ctx, "ctl_stick_rt_balance");
  const hit = feat(ctx, "ctl_stick_hit_balance");
  const prec = feat(ctx, "ctl_stick_precision_balance");
  const m = ctx.measurements.controller;
  if (!rt || !m) return null;

  const { rtDiffMax, hitDiffMaxPp, precisionDiffMax } = ctx.config.controller.stickBalance;
  const rtSimilar = rt.value <= rtDiffMax;
  const hitSimilar = hit === null || hit.value <= hitDiffMaxPp;
  const precSimilar = prec === null || prec.value <= precisionDiffMax;

  const similarCount = [rtSimilar, hitSimilar, precSimilar].filter(Boolean).length;

  if (mode === "balanced") {
    if (similarCount < 2) return null;
    return makeTag({
      id: "balanced-sticks",
      label: "Balanced Sticks",
      domain: DOMAIN,
      facet: "Stick Balance",
      priority: "core",
      evidenceQuality: "high",
      description:
        "Left and right sticks behaved similarly across speed, hit rate, and precision — balanced control.",
      evidence: [rt.evidence, hit?.evidence, prec?.evidence].flatMap((e) => e ?? []),
      ruleId: "ctl-balanced-sticks",
      strength: similarCount / 3,
    });
  }

  // Favor direction per metric.
  const leftRt = m.left.totalAverageReaction;
  const rightRt = m.right.totalAverageReaction;
  const rtFavorsLeft = leftRt !== null && rightRt !== null && leftRt < rightRt;
  const rtFavorsRight = leftRt !== null && rightRt !== null && rightRt < leftRt;

  const leftPrecVal = feat(ctx, "ctl_left_precision")?.value;
  const rightPrecVal = feat(ctx, "ctl_right_precision")?.value;
  const precFavorsLeft = leftPrecVal !== undefined && rightPrecVal !== undefined && leftPrecVal < rightPrecVal;
  const precFavorsRight = leftPrecVal !== undefined && rightPrecVal !== undefined && rightPrecVal < leftPrecVal;

  const leftHitVal = feat(ctx, "ctl_left_hit_rate")?.value ?? null;
  const rightHitVal = feat(ctx, "ctl_right_hit_rate")?.value ?? null;
  const hitFavorsLeft = leftHitVal !== null && rightHitVal !== null && leftHitVal > rightHitVal;
  const hitFavorsRight = leftHitVal !== null && rightHitVal !== null && rightHitVal > leftHitVal;

  const leftCount = [rtFavorsLeft, precFavorsLeft, hitFavorsLeft].filter(Boolean).length;
  const rightCount = [rtFavorsRight, precFavorsRight, hitFavorsRight].filter(Boolean).length;

  if (mode === "left") {
    if (leftCount < 2) return null;
    return makeTag({
      id: "left-leaning-control",
      label: "Left-Leaning Control",
      domain: DOMAIN,
      facet: "Stick Balance",
      priority: "core",
      evidenceQuality: "high",
      description:
        "The left stick consistently outperformed the right across speed, hit rate, and/or precision.",
      evidence: [rt.evidence, prec?.evidence, hit?.evidence].flatMap((e) => e ?? []),
      ruleId: "ctl-left-leaning",
      strength: leftCount / 3,
    });
  }
  if (mode === "right") {
    if (rightCount < 2) return null;
    return makeTag({
      id: "right-leaning-control",
      label: "Right-Leaning Control",
      domain: DOMAIN,
      facet: "Stick Balance",
      priority: "core",
      evidenceQuality: "high",
      description:
        "The right stick consistently outperformed the left across speed, hit rate, and/or precision.",
      evidence: [rt.evidence, prec?.evidence, hit?.evidence].flatMap((e) => e ?? []),
      ruleId: "ctl-right-leaning",
      strength: rightCount / 3,
    });
  }
  if (mode === "split") {
    const speedFavorsLeft = rtFavorsLeft;
    const speedFavorsRight = rtFavorsRight;
    const controlFavorsLeft = (precFavorsLeft ? 1 : 0) + (hitFavorsLeft ? 1 : 0);
    const controlFavorsRight = (precFavorsRight ? 1 : 0) + (hitFavorsRight ? 1 : 0);
    const split = (speedFavorsLeft && controlFavorsRight >= 1) || (speedFavorsRight && controlFavorsLeft >= 1);
    if (!split) return null;
    return makeTag({
      id: "split-control",
      label: "Split Control",
      domain: DOMAIN,
      facet: "Stick Balance",
      priority: "core",
      evidenceQuality: "medium",
      description:
        "Speed favored one stick while precision/hit favored the other — split control profile.",
      evidence: [rt.evidence, prec?.evidence, hit?.evidence].flatMap((e) => e ?? []),
      ruleId: "ctl-split-control",
      strength: 0.65,
    });
  }
  return null;
}

function directionalityRule(ctx: RuleContext, mode: string): ReturnType<typeof makeTag> | null {
  const lRt = feat(ctx, "ctl_left_rt_spread");
  const rRt = feat(ctx, "ctl_right_rt_spread");
  const lPrec = feat(ctx, "ctl_left_precision_spread");
  const rPrec = feat(ctx, "ctl_right_precision_spread");
  if (!lRt || !rRt) return null;

  const { rtLow, rtHigh, precisionLow, precisionHigh } = ctx.config.controller.spread;
  const rtSpread = Math.max(lRt.value, rRt.value);
  const precSpread = lPrec && rPrec ? Math.max(lPrec.value, rPrec.value) : null;

  switch (mode) {
    case "omni": {
      if (rtSpread > rtLow || (precSpread !== null && precSpread > precisionLow)) return null;
      return makeTag({
        id: "omni-directional",
        label: "Omni-Directional",
        domain: DOMAIN,
        facet: "Directionality",
        priority: "supporting",
        evidenceQuality: "medium",
        description:
          "Reaction speed and precision were consistent in every direction — no directional weakness.",
        evidence: [...lRt.evidence, ...rRt.evidence],
        ruleId: "ctl-omni-directional",
        strength: 1 - rtSpread / rtLow,
      });
    }
    case "tempo": {
      if (rtSpread < rtHigh) return null;
      return makeTag({
        id: "directional-tempo",
        label: "Directional Tempo",
        domain: DOMAIN,
        facet: "Directionality",
        priority: "supporting",
        evidenceQuality: "medium",
        description:
          "Reaction speed varied noticeably by direction — some directions are clearly faster.",
        evidence: [...lRt.evidence, ...rRt.evidence],
        ruleId: "ctl-directional-tempo",
        strength: higherIsStronger(rtSpread, rtHigh, rtHigh + 0.15),
      });
    }
    case "precision": {
      if (precSpread === null || precSpread < precisionHigh) return null;
      return makeTag({
        id: "directional-precision",
        label: "Directional Precision",
        domain: DOMAIN,
        facet: "Directionality",
        priority: "supporting",
        evidenceQuality: "medium",
        description:
          "Precision varied noticeably by direction — some directions are clearly more accurate.",
        evidence: [...(lPrec?.evidence ?? []), ...(rPrec?.evidence ?? [])],
        ruleId: "ctl-directional-precision",
        strength: higherIsStronger(precSpread, precisionHigh, precisionHigh + 0.2),
      });
    }
    case "specialist": {
      if (precSpread === null || rtSpread < rtHigh || precSpread < precisionHigh) return null;
      return makeTag({
        id: "directional-specialist",
        label: "Directional Specialist",
        domain: DOMAIN,
        facet: "Directionality",
        priority: "supporting",
        evidenceQuality: "medium",
        description:
          "Both speed and precision varied strongly by direction — a specialist profile favoring specific directions.",
        evidence: [...lRt.evidence, ...rRt.evidence, ...(lPrec?.evidence ?? []), ...(rPrec?.evidence ?? [])],
        ruleId: "ctl-directional-specialist",
        strength: 1,
      });
    }
  }
  return null;
}

/** Per-direction composite score across both single-stick tests. */
function directionScores(ctx: RuleContext): Map<DirectionKey, number> {
  const m = ctx.measurements.controller;
  const scores = new Map<DirectionKey, number>();
  if (!m) return scores;

  const collect = (
    stick: ControllerMeasurements["left"],
    scaleRt: number,
    scalePrec: number,
    scaleHit: number
  ) => {
    const rtVals: number[] = [];
    const precVals: number[] = [];
    const hitVals: number[] = [];
    for (const dir of CARDINAL_KEYS) {
      const d = stick.directions[dir];
      if (d?.reactionMs != null) rtVals.push(d.reactionMs);
      if (d?.accuracyDegrees != null) precVals.push(d.accuracyDegrees);
      if (d?.hitPercent != null) hitVals.push(d.hitPercent);
    }
    return { rtVals, precVals, hitVals };
  };

  for (const stick of [m.left, m.right]) {
    const { rtVals, precVals, hitVals } = collect(stick, 0, 0, 0);
    const minRt = Math.min(...rtVals);
    const maxRt = Math.max(...rtVals);
    const minPrec = Math.min(...precVals);
    const maxPrec = Math.max(...precVals);
    const minHit = Math.min(...hitVals);
    const maxHit = Math.max(...hitVals);
    const spanRt = maxRt - minRt;
    const spanPrec = maxPrec - minPrec;
    const spanHit = maxHit - minHit;

    for (const dir of CARDINAL_KEYS) {
      const d = stick.directions[dir];
      if (!d) continue;
      const rtScore = d.reactionMs == null ? 0.5 : spanRt === 0 ? 1 : 1 - (d.reactionMs - minRt) / spanRt;
      const precScore = d.accuracyDegrees == null ? 0.5 : spanPrec === 0 ? 1 : 1 - (d.accuracyDegrees - minPrec) / spanPrec;
      const hitScore = d.hitPercent == null ? 0.5 : spanHit === 0 ? 0.5 : (d.hitPercent - minHit) / spanHit;
      const composite = 0.4 * rtScore + 0.4 * precScore + 0.2 * hitScore;
      scores.set(dir, (scores.get(dir) ?? 0) + composite);
    }
  }

  // Normalize to average of both sticks.
  for (const dir of scores.keys()) {
    scores.set(dir, scores.get(dir)! / 2);
  }
  return scores;
}

function leanRule(ctx: RuleContext, dir: DirectionKey): ReturnType<typeof makeTag> | null {
  const m = ctx.measurements.controller;
  if (!m) return null;
  const scores = directionScores(ctx);
  if (scores.size < 4) return null;

  const sorted = [...scores.entries()].sort((a, b) => b[1] - a[1]);
  const [topDir, topScore] = sorted[0];
  const secondScore = sorted[1]?.[1] ?? 0;
  const separation = topScore - secondScore;
  if (topDir !== dir || separation < 0.15) return null;

  return makeTag({
    id: `lean-${dir}`,
    label: `${DIRECTION_LABELS[dir]} Lean`,
    domain: DOMAIN,
    facet: "Directionality",
    priority: "supporting",
    evidenceQuality: "medium",
    description: `${DIRECTION_LABELS[dir]} was the player's clearest directional strength this session (composite of speed, precision, and hit rate).`,
    evidence: [],
    ruleId: `ctl-lean-${dir}`,
    strength: Math.min(1, separation / 0.3),
  });
}

function axisRule(ctx: RuleContext, mode: string): ReturnType<typeof makeTag> | null {
  const m = ctx.measurements.controller;
  if (!m) return null;
  const scores = directionScores(ctx);

  const horizontal = (["Left", "Right"] as DirectionKey[]).reduce((s, d) => s + (scores.get(d) ?? 0), 0) / 2;
  const vertical = (["Up", "Down"] as DirectionKey[]).reduce((s, d) => s + (scores.get(d) ?? 0), 0) / 2;
  const diagonal = (["Up_Left", "Up_Right", "Down_Right", "Down_Left"] as DirectionKey[]).reduce((s, d) => s + (scores.get(d) ?? 0), 0) / 4;

  const max = Math.max(horizontal, vertical, diagonal);
  const min = Math.min(horizontal, vertical, diagonal);

  if (mode === "horizontal") {
    if (!(horizontal >= vertical + 0.08 && horizontal >= diagonal + 0.08)) return null;
    return makeTag({
      id: "horizontal-bias",
      label: "Horizontal Bias",
      domain: DOMAIN,
      facet: "Directionality",
      priority: "supporting",
      evidenceQuality: "low",
      description: "Left/right control clearly outperformed vertical and diagonal directions.",
      evidence: [],
      ruleId: "ctl-horizontal-bias",
      strength: Math.min(1, (horizontal - vertical) / 0.2),
    });
  }
  if (mode === "vertical") {
    if (!(vertical >= horizontal + 0.08 && vertical >= diagonal + 0.08)) return null;
    return makeTag({
      id: "vertical-bias",
      label: "Vertical Bias",
      domain: DOMAIN,
      facet: "Directionality",
      priority: "supporting",
      evidenceQuality: "low",
      description: "Up/down control clearly outperformed horizontal and diagonal directions.",
      evidence: [],
      ruleId: "ctl-vertical-bias",
      strength: Math.min(1, (vertical - horizontal) / 0.2),
    });
  }
  if (mode === "diagonal") {
    if (!(diagonal >= horizontal + 0.08 && diagonal >= vertical + 0.08)) return null;
    return makeTag({
      id: "diagonal-bias",
      label: "Diagonal Bias",
      domain: DOMAIN,
      facet: "Directionality",
      priority: "supporting",
      evidenceQuality: "low",
      description: "Diagonal control clearly outperformed horizontal and vertical directions.",
      evidence: [],
      ruleId: "ctl-diagonal-bias",
      strength: Math.min(1, (diagonal - horizontal) / 0.2),
    });
  }
  return null;
}

function dualStyleRule(ctx: RuleContext, mode: string): ReturnType<typeof makeTag> | null {
  const m = ctx.measurements.controller;
  if (!m) return null;
  const { rtLow, rtHigh, hitHighPp, precisionHigh } = ctx.config.controller.dualInterference;

  const leftRt = feat(ctx, "ctl_left_dual_rt_cost")?.value ?? null;
  const rightRt = feat(ctx, "ctl_right_dual_rt_cost")?.value ?? null;
  const leftHit = feat(ctx, "ctl_left_dual_hit_cost")?.value ?? null;
  const rightHit = feat(ctx, "ctl_right_dual_hit_cost")?.value ?? null;
  const leftPrec = feat(ctx, "ctl_left_dual_precision_cost")?.value ?? null;
  const rightPrec = feat(ctx, "ctl_right_dual_precision_cost")?.value ?? null;

  const rtCosts = [leftRt, rightRt].filter((v): v is number => v !== null);
  const hitCosts = [leftHit, rightHit].filter((v): v is number => v !== null);
  const precCosts = [leftPrec, rightPrec].filter((v): v is number => v !== null);

  if (rtCosts.length === 0) return null;

  const avgRt = rtCosts.reduce((s, v) => s + v, 0) / rtCosts.length;
  const avgHit = hitCosts.length ? hitCosts.reduce((s, v) => s + v, 0) / hitCosts.length : null;
  const avgPrec = precCosts.length ? precCosts.reduce((s, v) => s + v, 0) / precCosts.length : null;

  const accuracyImpact = (avgHit !== null && avgHit >= hitHighPp) || (avgPrec !== null && avgPrec >= precisionHigh);
  const rtLowFlag = avgRt <= rtLow;
  const rtHighFlag = avgRt >= rtHigh;

  let match = false;
  let def: { label: string; desc: string } | null = null;
  switch (mode) {
    case "dual-taxed":
      match = rtHighFlag && accuracyImpact;
      def = { label: "Dual-Taxed", desc: "Dual-stick control cost speed AND accuracy — sustained multitasking taxed the player." };
      break;
    case "precision-preserving":
      match = rtHighFlag && !accuracyImpact;
      def = { label: "Precision-Preserving Dualist", desc: "Dual-stick control cost speed but accuracy was preserved — precision held under load." };
      break;
    case "tempo-preserving":
      match = rtLowFlag && accuracyImpact;
      def = { label: "Tempo-Preserving Dualist", desc: "Dual-stick control kept speed but accuracy dropped — tempo was preserved at a cost." };
      break;
    case "coordinator":
      match = rtLowFlag && !accuracyImpact;
      def = { label: "Dual Coordinator", desc: "Dual-stick control cost almost nothing in speed or accuracy — smooth dual coordination." };
      break;
    case "mixed":
      match = !rtLowFlag && !rtHighFlag;
      def = { label: "Mixed Dual Load", desc: "Dual-stick interference sat between clear patterns — a mixed dual-load profile." };
      break;
  }
  if (!match || !def) return null;

  const evidence = [
    ...(leftRt !== null ? (feat(ctx, "ctl_left_dual_rt_cost")?.evidence ?? []) : []),
    ...(rightRt !== null ? (feat(ctx, "ctl_right_dual_rt_cost")?.evidence ?? []) : []),
  ];

  return makeTag({
    id: DUAL_STYLE_TAG_ID[mode] ?? `dual-${mode}`,
    label: def.label,
    domain: DOMAIN,
    facet: "Dual Coordination",
    priority: "core",
    evidenceQuality: "high",
    description: def.desc,
    evidence,
    ruleId: DUAL_STYLE_RULE_ID[mode] ?? `ctl-${mode}`,
    strength: mode === "coordinator" ? 1 - avgRt / (rtLow * 2) : mode === "dual-taxed" ? 1 : mode === "mixed" ? 0.55 : 0.8,
  });
}

const DUAL_STYLE_RULE_ID: Record<string, string> = {
  coordinator: "ctl-dual-coordinator",
  "precision-preserving": "ctl-precision-preserving-dualist",
  "tempo-preserving": "ctl-tempo-preserving-dualist",
  "dual-taxed": "ctl-dual-taxed",
  mixed: "ctl-mixed-dual-load",
};

const DUAL_STYLE_TAG_ID: Record<string, string> = {
  coordinator: "dual-coordinator",
  "precision-preserving": "dual-precision-preserving",
  "tempo-preserving": "dual-tempo-preserving",
  "dual-taxed": "dual-taxed",
  mixed: "dual-mixed-load",
};

function dualBalanceRule(ctx: RuleContext, mode: string): ReturnType<typeof makeTag> | null {
  const l = feat(ctx, "ctl_left_interference");
  const r = feat(ctx, "ctl_right_interference");
  if (!l || !r) return null;
  const { meaningfulDiff } = ctx.config.controller.dualBalance;
  const diff = l.value - r.value;

  if (mode === "balanced") {
    if (Math.abs(diff) >= meaningfulDiff) return null;
    return makeTag({
      id: "balanced-dual-load",
      label: "Balanced Dual Load",
      domain: DOMAIN,
      facet: "Dual Balance",
      priority: "supporting",
      evidenceQuality: "medium",
      description: "Both sticks carried a similar amount of dual-task interference.",
      evidence: [...l.evidence, ...r.evidence],
      ruleId: "ctl-balanced-dual-load",
      strength: 1 - Math.abs(diff) / meaningfulDiff,
    });
  }
  if (mode === "left") {
    if (diff <= meaningfulDiff) return null;
    return makeTag({
      id: "left-load-sensitive",
      label: "Left-Load Sensitive",
      domain: DOMAIN,
      facet: "Dual Balance",
      priority: "supporting",
      evidenceQuality: "medium",
      description: "The left stick absorbed noticeably more dual-task interference than the right.",
      evidence: [...l.evidence, ...r.evidence],
      ruleId: "ctl-left-load-sensitive",
      strength: Math.min(1, diff / 0.3),
    });
  }
  if (mode === "right") {
    if (diff >= -meaningfulDiff) return null;
    return makeTag({
      id: "right-load-sensitive",
      label: "Right-Load Sensitive",
      domain: DOMAIN,
      facet: "Dual Balance",
      priority: "supporting",
      evidenceQuality: "medium",
      description: "The right stick absorbed noticeably more dual-task interference than the left.",
      evidence: [...l.evidence, ...r.evidence],
      ruleId: "ctl-right-load-sensitive",
      strength: Math.min(1, -diff / 0.3),
    });
  }
  return null;
}

function sequenceRule(ctx: RuleContext, mode: string): ReturnType<typeof makeTag> | null {
  const m = ctx.measurements.controller;
  if (!m) return null;
  const outOfOrder = m.dual.outOfOrderCount;
  if (outOfOrder === null) return null;
  const { steadyMax, slipsMax } = ctx.config.controller.sequence;

  let match = false;
  let def: { label: string; desc: string } | null = null;
  if (mode === "locked") {
    match = outOfOrder === 0;
    def = { label: "Order-Locked", desc: "Every dual-stick target was taken in sequence — flawless order control." };
  } else if (mode === "steady") {
    match = outOfOrder >= 1 && outOfOrder <= steadyMax;
    def = { label: "Sequence-Steady", desc: "Only occasional out-of-order events during dual-stick sequences." };
  } else if (mode === "slips") {
    match = outOfOrder > steadyMax && outOfOrder <= slipsMax;
    def = { label: "Sequence-Slips", desc: "A moderate number of out-of-order events — sequence slips appeared under load." };
  } else if (mode === "disrupted") {
    match = outOfOrder > slipsMax;
    def = { label: "Order-Disrupted", desc: "Frequent out-of-order events — sequence control was disrupted in dual-stick mode." };
  }
  if (!match || !def) return null;

  return makeTag({
    id: SEQUENCE_TAG_ID[mode] ?? `sequence-${mode}`,
    label: def.label,
    domain: DOMAIN,
    facet: "Sequence",
    priority: "core",
    evidenceQuality: "high",
    description: def.desc,
    evidence: [
      { label: "Out-of-order events", value: outOfOrder, formatted: String(outOfOrder) },
      { label: "Dual trials", value: ctx.config.controller.dualTrials, formatted: String(ctx.config.controller.dualTrials) },
    ],
    ruleId: SEQUENCE_RULE_ID[mode] ?? `ctl-sequence-${mode}`,
    strength: mode === "locked" ? 1 : mode === "steady" ? 0.8 : mode === "slips" ? 0.7 : 1,
  });
}

const SEQUENCE_RULE_ID: Record<string, string> = {
  locked: "ctl-order-locked",
  steady: "ctl-sequence-steady",
  slips: "ctl-sequence-slips",
  disrupted: "ctl-order-disrupted",
};

const SEQUENCE_TAG_ID: Record<string, string> = {
  locked: "sequence-locked",
  steady: "sequence-steady",
  slips: "sequence-slips",
  disrupted: "order-disrupted",
};

function burstRule(ctx: RuleContext, mode: string): ReturnType<typeof makeTag> | null {
  const l = feat(ctx, "ctl_left_burst_gap");
  const r = feat(ctx, "ctl_right_burst_gap");
  const dual = feat(ctx, "ctl_dual_burst_gap");
  if (!l && !dual) return null;
  const { evenAt, burstAt, highAt } = ctx.config.controller.burst;

  const gaps = [l?.value, r?.value, dual?.value].filter((v): v is number => v !== null);
  if (gaps.length === 0) return null;
  const maxGap = Math.max(...gaps);

  switch (mode) {
    case "even":
      if (maxGap >= evenAt) return null;
      return makeTag({
        id: "even-tempo",
        label: "Even Tempo",
        domain: DOMAIN,
        facet: "Response Pattern",
        priority: "secondary",
        evidenceQuality: "low",
        description: "Peak reactions sat close to average — steady, even stick tempo.",
        evidence: [...(l?.evidence ?? []), ...(dual?.evidence ?? [])],
        ruleId: "ctl-even-tempo",
        strength: 1 - maxGap / evenAt,
      });
    case "burst":
      if (maxGap < evenAt || maxGap >= highAt) return null;
      return makeTag({
        id: "reaction-burst",
        label: "Reaction Burst",
        domain: DOMAIN,
        facet: "Response Pattern",
        priority: "secondary",
        evidenceQuality: "low",
        description: "A clearly faster peak reaction stood out from the average.",
        evidence: [...(l?.evidence ?? []), ...(dual?.evidence ?? [])],
        ruleId: "ctl-reaction-burst",
        strength: (maxGap - evenAt) / (highAt - evenAt),
      });
    case "high":
      if (maxGap < highAt) return null;
      return makeTag({
        id: "high-burst-gap",
        label: "High Burst Gap",
        domain: DOMAIN,
        facet: "Response Pattern",
        priority: "secondary",
        evidenceQuality: "low",
        description: "The fastest reaction was far above average — a sharp single burst.",
        evidence: [...(l?.evidence ?? []), ...(dual?.evidence ?? [])],
        ruleId: "ctl-high-burst-gap",
        strength: 1,
      });
    case "dual-preserved": {
      if (!dual || dual.value < burstAt || !l || l.value < burstAt) return null;
      return makeTag({
        id: "dual-burst-preserved",
        label: "Dual Burst Preserved",
        domain: DOMAIN,
        facet: "Response Pattern",
        priority: "secondary",
        evidenceQuality: "low",
        description: "A strong peak reaction survived into dual-stick mode.",
        evidence: [...l.evidence, ...dual.evidence],
        ruleId: "ctl-dual-burst-preserved",
        strength: 0.8,
      });
    }
  }
  return null;
}

export function runControllerRules(ctx: RuleContext): ProfileTag[] {
  return controllerRules
    .filter((rule) => hasAllFeatures(ctx, rule.requiredFeatures))
    .map((rule) => rule.evaluate(ctx))
    .filter((tag): tag is ProfileTag => tag !== null);
}
