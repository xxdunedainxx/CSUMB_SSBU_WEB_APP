import type { ProfileRule, ProfileTag, RuleContext } from "../types";
import {
  bandStrength,
  bandToStrength,
  feat,
  hasAllFeatures,
  higherIsStronger,
  lowerIsStronger,
  makeTag,
} from "./helpers";

const DOMAIN = "attention" as const;

export const posnerRules: ProfileRule[] = [
  /* ---------- Core: cue cost (exclusive group "cue") ---------- */

  {
    id: "pos-cue-neutral",
    domain: DOMAIN,
    facet: "Cue Influence",
    priority: "core",
    mode: "exclusive",
    group: "cue",
    requiredFeatures: ["pos_relative_cue_cost"],
    evaluate: (ctx) => cueCostRule(ctx, "neutral"),
  },
  {
    id: "pos-cue-responsive",
    domain: DOMAIN,
    facet: "Cue Influence",
    priority: "core",
    mode: "exclusive",
    group: "cue",
    requiredFeatures: ["pos_relative_cue_cost"],
    evaluate: (ctx) => cueCostRule(ctx, "responsive"),
  },
  {
    id: "pos-cue-driven",
    domain: DOMAIN,
    facet: "Cue Influence",
    priority: "core",
    mode: "exclusive",
    group: "cue",
    requiredFeatures: ["pos_relative_cue_cost"],
    evaluate: (ctx) => cueCostRule(ctx, "driven"),
  },
  {
    id: "pos-strong-cue-pull",
    domain: DOMAIN,
    facet: "Cue Influence",
    priority: "core",
    mode: "exclusive",
    group: "cue",
    requiredFeatures: ["pos_relative_cue_cost"],
    evaluate: (ctx) => cueCostRule(ctx, "strong"),
  },

  /* ---------- Supporting: reverse cue effect (additive, low confidence) ---------- */

  {
    id: "pos-reverse-cue-effect",
    domain: DOMAIN,
    facet: "Cue Influence",
    priority: "supporting",
    mode: "additive",
    requiredFeatures: ["pos_relative_cue_cost"],
    evaluate: (ctx) => {
      const cost = feat(ctx, "pos_relative_cue_cost");
      if (!cost || cost.value >= 0) return null;
      return makeTag({
        id: "reverse-cue-effect",
        label: "Reverse Cue Effect",
        domain: DOMAIN,
        facet: "Cue Influence",
        priority: "supporting",
        evidenceQuality: "low",
        description:
          "Invalid-cue trials were actually faster than valid-cue trials — possible reverse cuing; low confidence.",
        evidence: cost.evidence,
        ruleId: "pos-reverse-cue-effect",
        strength: 1 - Math.abs(cost.value) / 0.1,
      });
    },
  },

  /* ---------- Core: error cost (exclusive group "error") ---------- */

  {
    id: "pos-accuracy-holding",
    domain: DOMAIN,
    facet: "Error Control",
    priority: "core",
    mode: "exclusive",
    group: "error",
    requiredFeatures: ["pos_error_cost"],
    evaluate: (ctx) => errorCostRule(ctx, "holding"),
  },
  {
    id: "pos-error-responsive",
    domain: DOMAIN,
    facet: "Error Control",
    priority: "core",
    mode: "exclusive",
    group: "error",
    requiredFeatures: ["pos_error_cost"],
    evaluate: (ctx) => errorCostRule(ctx, "responsive"),
  },
  {
    id: "pos-misdirection-sensitive",
    domain: DOMAIN,
    facet: "Error Control",
    priority: "core",
    mode: "exclusive",
    group: "error",
    requiredFeatures: ["pos_error_cost"],
    evaluate: (ctx) => errorCostRule(ctx, "sensitive"),
  },
  {
    id: "pos-high-error-disruption",
    domain: DOMAIN,
    facet: "Error Control",
    priority: "core",
    mode: "exclusive",
    group: "error",
    requiredFeatures: ["pos_error_cost"],
    evaluate: (ctx) => errorCostRule(ctx, "disrupted"),
  },

  /* ---------- Supporting: reorientation style (additive) ---------- */

  {
    id: "pos-misdirection-resilient",
    domain: DOMAIN,
    facet: "Reorientation Style",
    priority: "supporting",
    mode: "additive",
    requiredFeatures: ["pos_relative_cue_cost", "pos_error_cost"],
    evaluate: (ctx) => reorientationRule(ctx, "resilient"),
  },
  {
    id: "pos-accuracy-holding-reorienter",
    domain: DOMAIN,
    facet: "Reorientation Style",
    priority: "supporting",
    mode: "additive",
    requiredFeatures: ["pos_relative_cue_cost", "pos_error_cost"],
    evaluate: (ctx) => reorientationRule(ctx, "accuracy"),
  },
  {
    id: "pos-speed-holding-reorienter",
    domain: DOMAIN,
    facet: "Reorientation Style",
    priority: "supporting",
    mode: "additive",
    requiredFeatures: ["pos_relative_cue_cost", "pos_error_cost"],
    evaluate: (ctx) => reorientationRule(ctx, "speed"),
  },
  {
    id: "pos-cue-disrupted",
    domain: DOMAIN,
    facet: "Reorientation Style",
    priority: "supporting",
    mode: "additive",
    requiredFeatures: ["pos_relative_cue_cost", "pos_error_cost"],
    evaluate: (ctx) => reorientationRule(ctx, "disrupted"),
  },

  /* ---------- Supporting: adaptation (exclusive group "adapt") ---------- */

  {
    id: "pos-quick-reorient-learner",
    domain: DOMAIN,
    facet: "Adaptation",
    priority: "supporting",
    mode: "exclusive",
    group: "adapt",
    requiredFeatures: ["pos_cue_cost_change"],
    evaluate: (ctx) => adaptationRule(ctx, "quick"),
  },
  {
    id: "pos-cue-adapter",
    domain: DOMAIN,
    facet: "Adaptation",
    priority: "supporting",
    mode: "exclusive",
    group: "adapt",
    requiredFeatures: ["pos_cue_cost_change"],
    evaluate: (ctx) => adaptationRule(ctx, "adapter"),
  },
  {
    id: "pos-stable-cue-strategy",
    domain: DOMAIN,
    facet: "Adaptation",
    priority: "supporting",
    mode: "exclusive",
    group: "adapt",
    requiredFeatures: ["pos_cue_cost_change"],
    evaluate: (ctx) => adaptationRule(ctx, "stable"),
  },
  {
    id: "pos-late-cue-friction",
    domain: DOMAIN,
    facet: "Adaptation",
    priority: "supporting",
    mode: "exclusive",
    group: "adapt",
    requiredFeatures: ["pos_cue_cost_change"],
    evaluate: (ctx) => adaptationRule(ctx, "friction"),
  },
  {
    id: "pos-increasing-cue-pull",
    domain: DOMAIN,
    facet: "Adaptation",
    priority: "supporting",
    mode: "exclusive",
    group: "adapt",
    requiredFeatures: ["pos_cue_cost_change"],
    evaluate: (ctx) => adaptationRule(ctx, "increasing"),
  },

  /* ---------- Supporting: full adaptation (both cue + error improved) ---------- */

  {
    id: "pos-full-cue-adaptation",
    domain: DOMAIN,
    facet: "Adaptation",
    priority: "supporting",
    mode: "additive",
    requiredFeatures: ["pos_cue_cost_change", "pos_error_cost_change"],
    evaluate: (ctx) => {
      const cue = feat(ctx, "pos_cue_cost_change");
      const err = feat(ctx, "pos_error_cost_change");
      if (!cue || !err) return null;
      const { adapterMin } = ctx.config.posner.adaptation;
      if (cue.value < adapterMin || err.value < adapterMin) return null;
      return makeTag({
        id: "full-cue-adaptation",
        label: "Full Cue Adaptation",
        domain: DOMAIN,
        facet: "Adaptation",
        priority: "supporting",
        evidenceQuality: "high",
        description:
          "Both cue-driven RT cost and error cost improved from practice to the real block.",
        evidence: [...cue.evidence, ...err.evidence],
        ruleId: "pos-full-cue-adaptation",
        strength: Math.min(1, (cue.value + err.value) / 20),
      });
    },
  },
];

function cueCostRule(ctx: RuleContext, mode: string): ReturnType<typeof makeTag> | null {
  const cost = feat(ctx, "pos_relative_cue_cost");
  if (!cost) return null;
  const { neutralMax, responsiveMax, drivenMax } = ctx.config.posner.cueCost;

  const bands: Record<string, { min: number; max: number; label: string; desc: string; isHigh?: boolean; isNeutral?: boolean }> = {
    neutral: { min: -Infinity, max: neutralMax, label: "Cue-Neutral", desc: "Invalid-cue trials were about as fast as valid-cue trials — cues barely steered attention." },
    responsive: { min: neutralMax, max: responsiveMax, label: "Cue-Responsive", desc: "Invalid cues cost a small amount of time — attention follows the cue modestly." },
    driven: { min: responsiveMax, max: drivenMax, label: "Cue-Driven", desc: "Invalid cues clearly slowed responses — attention is strongly driven by the cue." },
    strong: { min: drivenMax, max: Infinity, label: "Strong Cue Pull", desc: "Invalid cues cost a large amount of time — a strong pull toward the cued location." },
  };
  const band = bands[mode];
  if (!band) return null;

  if (mode === "neutral") {
    if (cost.value > neutralMax) return null;
    return makeTag({
      id: "cue-neutral",
      label: band.label,
      domain: DOMAIN,
      facet: "Cue Influence",
      priority: "core",
      evidenceQuality: "high",
      description: band.desc,
      evidence: cost.evidence,
      ruleId: "pos-cue-neutral",
      strength: 1 - cost.value / neutralMax,
    });
  }

  if (mode === "strong") {
    if (cost.value <= drivenMax) return null;
    return makeTag({
      id: "strong-cue-pull",
      label: band.label,
      domain: DOMAIN,
      facet: "Cue Influence",
      priority: "core",
      evidenceQuality: "high",
      description: band.desc,
      evidence: cost.evidence,
      ruleId: "pos-strong-cue-pull",
      strength: 1,
    });
  }

  if (cost.value <= band.min || cost.value > band.max) return null;
  return makeTag({
    id: `cue-${mode}`,
    label: band.label,
    domain: DOMAIN,
    facet: "Cue Influence",
    priority: "core",
    evidenceQuality: "high",
    description: band.desc,
    evidence: cost.evidence,
    ruleId: `pos-cue-${mode}`,
    strength: bandStrength(cost.value, band.min, band.max),
  });
}

function errorCostRule(ctx: RuleContext, mode: string): ReturnType<typeof makeTag> | null {
  const cost = feat(ctx, "pos_error_cost");
  if (!cost) return null;
  const { holdingMax, responsiveMax, sensitiveMax } = ctx.config.posner.errorCost;

  const bands: Record<string, { min: number; max: number; label: string; desc: string }> = {
    holding: { min: -Infinity, max: holdingMax, label: "Accuracy-Holding", desc: "Invalid cues barely changed error rates — accuracy held steady even when misled." },
    responsive: { min: holdingMax, max: responsiveMax, label: "Error-Responsive", desc: "Invalid cues raised errors by a small amount." },
    sensitive: { min: responsiveMax, max: sensitiveMax, label: "Misdirection-Sensitive", desc: "Invalid cues clearly raised errors — the player is sensitive to being misdirected." },
    disrupted: { min: sensitiveMax, max: Infinity, label: "High Error Disruption", desc: "Invalid cues sharply raised errors — misdirection strongly disrupted accuracy." },
  };
  const band = bands[mode];
  if (!band) return null;

  if (mode === "holding") {
    if (cost.value > holdingMax) return null;
    return makeTag({
      id: "accuracy-holding",
      label: band.label,
      domain: DOMAIN,
      facet: "Error Control",
      priority: "core",
      evidenceQuality: "high",
      description: band.desc,
      evidence: cost.evidence,
      ruleId: "pos-accuracy-holding",
      strength: 1 - cost.value / holdingMax,
    });
  }

  if (mode === "disrupted") {
    if (cost.value <= sensitiveMax) return null;
    return makeTag({
      id: "high-error-disruption",
      label: band.label,
      domain: DOMAIN,
      facet: "Error Control",
      priority: "core",
      evidenceQuality: "high",
      description: band.desc,
      evidence: cost.evidence,
      ruleId: "pos-high-error-disruption",
      strength: 1,
    });
  }

  if (cost.value <= band.min || cost.value > band.max) return null;
  return makeTag({
    id: `error-${mode}`,
    label: band.label,
    domain: DOMAIN,
    facet: "Error Control",
    priority: "core",
    evidenceQuality: "high",
    description: band.desc,
    evidence: cost.evidence,
    ruleId: ERROR_COST_RULE_ID[mode] ?? `pos-error-${mode}`,
    strength: bandStrength(cost.value, band.min, band.max),
  });
}

const ERROR_COST_RULE_ID: Record<string, string> = {
  sensitive: "pos-misdirection-sensitive",
};

function reorientationRule(ctx: RuleContext, mode: string): ReturnType<typeof makeTag> | null {
  const rt = feat(ctx, "pos_relative_cue_cost");
  const err = feat(ctx, "pos_error_cost");
  if (!rt || !err) return null;

  const { rtLow, rtHigh, errorLow, errorHigh } = ctx.config.posner.reorient;
  const rtLowFlag = rt.value <= rtLow;
  const rtHighFlag = rt.value >= rtHigh;
  const errLowFlag = err.value <= errorLow;
  const errHighFlag = err.value >= errorHigh;

  let match = false;
  let def: { label: string; desc: string } | null = null;
  switch (mode) {
    case "resilient":
      match = rtLowFlag && errLowFlag;
      def = { label: "Misdirection Resilient", desc: "Invalid cues cost little time and little accuracy — misdirection barely lands." };
      break;
    case "accuracy":
      match = rtHighFlag && errLowFlag;
      def = { label: "Accuracy-Holding Reorienter", desc: "Invalid cues cost time but not accuracy — reorientation is accurate though slow." };
      break;
    case "speed":
      match = rtLowFlag && errHighFlag;
      def = { label: "Speed-Holding Reorienter", desc: "Invalid cues cost accuracy but not time — the player reorients quickly, sometimes at the cost of precision." };
      break;
    case "disrupted":
      match = rtHighFlag && errHighFlag;
      def = { label: "Cue-Disrupted", desc: "Invalid cues cost both time and accuracy — misdirection strongly disrupts performance." };
      break;
  }
  if (!match || !def) return null;

  return makeTag({
    id: `reorient-${mode}`,
    label: def.label,
    domain: DOMAIN,
    facet: "Reorientation Style",
    priority: "supporting",
    evidenceQuality: "medium",
    description: def.desc,
    evidence: [...rt.evidence, ...err.evidence],
    ruleId: REORIENT_RULE_ID[mode] ?? `pos-${mode}`,
    strength: 0.75,
  });
}

const REORIENT_RULE_ID: Record<string, string> = {
  resilient: "pos-misdirection-resilient",
  accuracy: "pos-accuracy-holding-reorienter",
  speed: "pos-speed-holding-reorienter",
  disrupted: "pos-cue-disrupted",
};

function adaptationRule(ctx: RuleContext, mode: string): ReturnType<typeof makeTag> | null {
  const change = feat(ctx, "pos_cue_cost_change");
  if (!change) return null;
  const { quickAt, adapterMin, adapterMax, stableTolerance } = ctx.config.posner.adaptation;

  const v = change.value;
  let match = false;
  let def: { label: string; desc: string } | null = null;
  switch (mode) {
    case "quick":
      match = v >= quickAt;
      def = { label: "Quick Reorient Learner", desc: "Cue-driven RT cost dropped sharply from practice — quick reorientation learning." };
      break;
    case "adapter":
      match = v >= adapterMin && v < adapterMax;
      def = { label: "Cue Adapter", desc: "Cue-driven RT cost improved moderately across blocks." };
      break;
    case "stable":
      match = Math.abs(v) <= stableTolerance;
      def = { label: "Stable Cue Strategy", desc: "Cue-driven RT cost stayed essentially the same across blocks." };
      break;
    case "friction":
      match = v <= -adapterMin && v > -adapterMax;
      def = { label: "Late Cue Friction", desc: "Cue-driven RT cost grew moderately by the real block — late friction appeared." };
      break;
    case "increasing":
      match = v <= -quickAt;
      def = { label: "Increasing Cue Pull", desc: "Cue-driven RT cost grew sharply by the real block — the cue pulled harder over time." };
      break;
  }
  if (!match || !def) return null;

  const strength =
    mode === "quick" ? higherIsStronger(v, quickAt, quickAt + 8)
    : mode === "adapter" ? bandToStrength(v, adapterMin, adapterMax)
    : mode === "stable" ? 1 - Math.abs(v) / stableTolerance
    : mode === "friction" ? bandToStrength(-v, adapterMin, adapterMax)
    : 1;

  return makeTag({
    id: `cue-adapt-${mode}`,
    label: def.label,
    domain: DOMAIN,
    facet: "Adaptation",
    priority: "supporting",
    evidenceQuality: "medium",
    description: def.desc,
    evidence: change.evidence,
    ruleId: ADAPT_RULE_ID[mode] ?? `pos-${mode}`,
    strength,
  });
}

const ADAPT_RULE_ID: Record<string, string> = {
  quick: "pos-quick-reorient-learner",
  adapter: "pos-cue-adapter",
  stable: "pos-stable-cue-strategy",
  friction: "pos-late-cue-friction",
  increasing: "pos-increasing-cue-pull",
};

export function runPosnerRules(ctx: RuleContext): ProfileTag[] {
  return posnerRules
    .filter((rule) => hasAllFeatures(ctx, rule.requiredFeatures))
    .map((rule) => rule.evaluate(ctx))
    .filter((tag): tag is ProfileTag => tag !== null);
}
