import type { ProfileRule, ProfileTag, RuleContext } from "../types";
import {
  bandStrength,
  bandToStrength,
  feat,
  hasAllFeatures,
  higherIsStronger,
  makeTag,
} from "./helpers";

const DOMAIN = "flexibility" as const;

const SWITCH_STRENGTHS = [
  { id: "fluid-switcher", label: "Fluid Switcher", max: "fluidMax", desc: "Switching between tasks added very little response time." },
  { id: "responsive-switcher", label: "Responsive Switcher", max: "responsiveMax", desc: "Switch trials added a modest response-time cost." },
  { id: "switch-aware", label: "Switch-Aware", max: "awareMax", desc: "Switch trials added a clear response-time cost — the player is aware of but taxed by switching." },
  { id: "switch-heavy", label: "Switch-Heavy", max: null, desc: "Switch trials added a large response-time cost — switching is costly for this player." },
] as const;

const ADAPT_DEFS = [
  { id: "rapid", label: "Rapid Adapter", min: "rapidAt", mode: "high", desc: "Switch/mix cost dropped sharply from practice to the actual block — rapid adaptation." },
  { id: "adaptive", label: "Adaptive Switcher", min: "adaptiveMin", max: "adaptiveMax", mode: "mid", desc: "Switch/mix cost improved moderately from practice to the actual block." },
  { id: "stable", label: "Stable Switcher", mode: "stable", desc: "Switch/mix cost stayed essentially the same between practice and the actual block." },
  { id: "friction", label: "Late Friction", min: "adaptiveMin", max: "adaptiveMax", mode: "negMid", desc: "Switch/mix cost grew moderately by the actual block — late friction appeared." },
  { id: "reversal", label: "Practice Reversal", min: "rapidAt", mode: "negHigh", desc: "Switch/mix cost grew sharply by the actual block — practice gains reversed." },
] as const;

export const taskSwitchingRules: ProfileRule[] = [
  /* ---------- Core: relative switch cost (exclusive) ---------- */

  ...SWITCH_STRENGTHS.map((band) => ({
    id: `ts-${band.id}`,
    domain: DOMAIN,
    facet: "Switching",
    priority: "core" as const,
    mode: "exclusive" as const,
    requiredFeatures: ["ts_relative_switch_cost_actual"],
    evaluate: (ctx: RuleContext) => {
      const rel = feat(ctx, "ts_relative_switch_cost_actual");
      if (!rel) return null;
      const { fluidMax, responsiveMax, awareMax } = ctx.config.taskSwitching.switchCost;
      const bounds = [fluidMax, responsiveMax, awareMax];
      const maxAt = band.max ? bounds[SWITCH_STRENGTHS.indexOf(band)] : Infinity;
      const minAt = SWITCH_STRENGTHS.indexOf(band) === 0 ? -Infinity : bounds[SWITCH_STRENGTHS.indexOf(band) - 1];
      if (band.max === null) {
        if (rel.value <= awareMax) return null;
      } else if (rel.value <= minAt || rel.value > maxAt) {
        return null;
      }
      const strength =
        band.max === null ? 1 : band.max === "fluidMax" ? 1 - rel.value / fluidMax : bandToStrength(rel.value, minAt, maxAt);
      return makeTag({
        id: band.id,
        label: band.label,
        domain: DOMAIN,
        facet: "Switching",
        priority: "core",
        evidenceQuality: "high",
        description: band.desc,
        evidence: rel.evidence,
        ruleId: `ts-${band.id}`,
        strength,
      });
    },
  })),

  /* ---------- Core: relative mixing cost (exclusive) ---------- */

  ...SWITCH_STRENGTHS.map((band) => ({
    id: `ts-${band.id}-mix`,
    domain: DOMAIN,
    facet: "Mixed Load",
    priority: "core" as const,
    mode: "exclusive" as const,
    requiredFeatures: ["ts_relative_mix_cost_actual"],
    evaluate: (ctx: RuleContext) => {
      const rel = feat(ctx, "ts_relative_mix_cost_actual");
      if (!rel) return null;
      const { nativeMax, steadyMax, sensitiveMax } = ctx.config.taskSwitching.mixCost;
      const bounds = [nativeMax, steadyMax, sensitiveMax];
      const maxAt = band.max ? bounds[SWITCH_STRENGTHS.indexOf(band)] : Infinity;
      const minAt = SWITCH_STRENGTHS.indexOf(band) === 0 ? -Infinity : bounds[SWITCH_STRENGTHS.indexOf(band) - 1];
      if (band.max === null) {
        if (rel.value <= sensitiveMax) return null;
      } else if (rel.value <= minAt || rel.value > maxAt) {
        return null;
      }
      const strength =
        band.max === null ? 1 : band.max === "fluidMax" ? 1 - rel.value / nativeMax : bandToStrength(rel.value, minAt, maxAt);
      const labels: Record<string, string> = {
        "fluid-switcher": "Mix-Native",
        "responsive-switcher": "Load-Steady",
        "switch-aware": "Mix-Sensitive",
        "switch-heavy": "Context-Taxed",
      };
      return makeTag({
        id: `mix-${band.id.replace("switch-", "")}`,
        label: labels[band.id],
        domain: DOMAIN,
        facet: "Mixed Load",
        priority: "core",
        evidenceQuality: "high",
        description:
          band.id === "fluid-switcher"
            ? "Working inside a mixed block added very little response time."
            : band.id === "responsive-switcher"
              ? "Mixed-block repetition added a moderate response-time cost."
              : band.id === "switch-aware"
                ? "Mixed-block repetition added a clear response-time cost."
                : "Mixed-block repetition added a large response-time cost.",
        evidence: rel.evidence,
        ruleId: `ts-${band.id}-mix`,
        strength,
      });
    },
  })),

  /* ---------- Supporting: load pattern combos (additive) ---------- */

  {
    id: "ts-flow-switcher",
    domain: DOMAIN,
    facet: "Mixed Load",
    priority: "supporting",
    mode: "additive",
    requiredFeatures: ["ts_relative_switch_cost_actual", "ts_relative_mix_cost_actual"],
    evaluate: (ctx) => {
      const sw = feat(ctx, "ts_relative_switch_cost_actual");
      const mx = feat(ctx, "ts_relative_mix_cost_actual");
      if (!sw || !mx) return null;
      const { clearlyLow } = ctx.config.taskSwitching.load;
      if (sw.value > clearlyLow || mx.value > clearlyLow) return null;
      return makeTag({
        id: "flow-switcher",
        label: "Flow Switcher",
        domain: DOMAIN,
        facet: "Mixed Load",
        priority: "supporting",
        evidenceQuality: "high",
        description:
          "Both switching and mixed-block load were clearly low — the player flows through task changes.",
        evidence: [...sw.evidence, ...mx.evidence],
        ruleId: "ts-flow-switcher",
        strength: Math.min(1, (clearlyLow * 2 - sw.value - mx.value) / (clearlyLow * 2)),
      });
    },
  },

  {
    id: "ts-context-loader",
    domain: DOMAIN,
    facet: "Mixed Load",
    priority: "supporting",
    mode: "additive",
    requiredFeatures: ["ts_relative_switch_cost_actual", "ts_relative_mix_cost_actual"],
    evaluate: (ctx) => {
      const sw = feat(ctx, "ts_relative_switch_cost_actual");
      const mx = feat(ctx, "ts_relative_mix_cost_actual");
      if (!sw || !mx) return null;
      const { clearlyLow, clearlyHigh } = ctx.config.taskSwitching.load;
      if (mx.value < clearlyHigh || sw.value > clearlyLow) return null;
      return makeTag({
        id: "context-loader",
        label: "Context Loader",
        domain: DOMAIN,
        facet: "Mixed Load",
        priority: "supporting",
        evidenceQuality: "high",
        description:
          "High mixed-block load with low switch cost — context maintenance, not switching, drives the cost.",
        evidence: [...sw.evidence, ...mx.evidence],
        ruleId: "ts-context-loader",
        strength: 1 - sw.value / clearlyLow,
      });
    },
  },

  {
    id: "ts-shift-sensitive",
    domain: DOMAIN,
    facet: "Mixed Load",
    priority: "supporting",
    mode: "additive",
    requiredFeatures: ["ts_relative_switch_cost_actual", "ts_relative_mix_cost_actual"],
    evaluate: (ctx) => {
      const sw = feat(ctx, "ts_relative_switch_cost_actual");
      const mx = feat(ctx, "ts_relative_mix_cost_actual");
      if (!sw || !mx) return null;
      const { clearlyLow, clearlyHigh } = ctx.config.taskSwitching.load;
      if (sw.value < clearlyHigh || mx.value > clearlyLow) return null;
      return makeTag({
        id: "shift-sensitive",
        label: "Shift Sensitive",
        domain: DOMAIN,
        facet: "Mixed Load",
        priority: "supporting",
        evidenceQuality: "high",
        description:
          "Low mixed-block load with high switch cost — the act of switching itself is what taxes the player.",
        evidence: [...sw.evidence, ...mx.evidence],
        ruleId: "ts-shift-sensitive",
        strength: 1 - mx.value / clearlyLow,
      });
    },
  },

  {
    id: "ts-load-sensitive",
    domain: DOMAIN,
    facet: "Mixed Load",
    priority: "supporting",
    mode: "additive",
    requiredFeatures: ["ts_relative_switch_cost_actual", "ts_relative_mix_cost_actual"],
    evaluate: (ctx) => {
      const sw = feat(ctx, "ts_relative_switch_cost_actual");
      const mx = feat(ctx, "ts_relative_mix_cost_actual");
      if (!sw || !mx) return null;
      const { clearlyHigh } = ctx.config.taskSwitching.load;
      if (sw.value < clearlyHigh || mx.value < clearlyHigh) return null;
      return makeTag({
        id: "load-sensitive",
        label: "Load Sensitive",
        domain: DOMAIN,
        facet: "Mixed Load",
        priority: "supporting",
        evidenceQuality: "high",
        description:
          "Both switching and mixed-block load were clearly high — the player is sensitive to cognitive load overall.",
        evidence: [...sw.evidence, ...mx.evidence],
        ruleId: "ts-load-sensitive",
        strength: 1,
      });
    },
  },

  /* ---------- Core: adaptation across blocks (exclusive group "adapt") ---------- */
  /* Switch-cost and mixing-cost adaptation are the same trait measured on two
     axes; emit one tag per player using the stronger signal. */

  ...ADAPT_DEFS.map((def) => ({
    id: `ts-adapt-${def.id}`,
    domain: DOMAIN,
    facet: "Adaptation",
    priority: "core" as const,
    mode: "exclusive" as const,
    group: "adapt",
    requiredFeatures: ["ts_switch_adaptation", "ts_mix_adaptation"],
    evaluate: (ctx: RuleContext) => combinedAdaptationRule(ctx, def),
  })),
];

/**
 * Emits a single adaptation tag from both the switch-cost and mixing-cost
 * adaptation features. The two dimensions measure the same trait, so the rule
 * uses whichever shows the stronger deviation and reports one tag.
 */
function combinedAdaptationRule(
  ctx: RuleContext,
  def: (typeof ADAPT_DEFS)[number]
): ReturnType<typeof makeTag> | null {
  const switchF = feat(ctx, "ts_switch_adaptation");
  const mixF = feat(ctx, "ts_mix_adaptation");
  const f =
    switchF && mixF
      ? Math.abs(switchF.value) >= Math.abs(mixF.value)
        ? switchF
        : mixF
      : (switchF ?? mixF);
  if (!f) return null;

  const { rapidAt, adaptiveMin, adaptiveMax, stableTolerance } = ctx.config.taskSwitching.adaptation;
  const v = f.value;
  let match = false;
  let strength = 0.5;

  switch (def.mode) {
    case "high":
      match = v >= rapidAt;
      strength = higherIsStronger(v, rapidAt, rapidAt + 0.2);
      break;
    case "mid":
      match = v >= adaptiveMin && v < adaptiveMax;
      strength = bandToStrength(v, adaptiveMin, adaptiveMax);
      break;
    case "stable":
      match = Math.abs(v) <= stableTolerance;
      strength = 1 - Math.abs(v) / stableTolerance;
      break;
    case "negMid":
      match = v <= -adaptiveMin && v > -adaptiveMax;
      strength = bandToStrength(-v, adaptiveMin, adaptiveMax);
      break;
    case "negHigh":
      match = v <= -rapidAt;
      strength = higherIsStronger(-v, rapidAt, rapidAt + 0.2);
      break;
  }

  if (!match) return null;

  return makeTag({
    id: `adapt-${def.id}`,
    label: def.label,
    domain: DOMAIN,
    facet: "Adaptation",
    priority: "core",
    evidenceQuality: "high",
    description: def.desc,
    evidence: f.evidence,
    ruleId: `ts-adapt-${def.id}`,
    strength,
  });
}

export function runTaskSwitchingRules(ctx: RuleContext): ProfileTag[] {
  return taskSwitchingRules
    .filter((rule) => hasAllFeatures(ctx, rule.requiredFeatures))
    .map((rule) => rule.evaluate(ctx))
    .filter((tag): tag is ProfileTag => tag !== null);
}
