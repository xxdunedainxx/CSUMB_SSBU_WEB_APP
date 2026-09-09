import type { ProfileRule, ProfileTag, RuleContext } from "../types";
import { bandToStrength, feat, hasAllFeatures, higherIsStronger, lowerIsStronger, makeTag } from "./helpers";

const DOMAIN = "inhibition" as const;

export const goNoGoRules: ProfileRule[] = [
  /* ---------- Supporting: RT adaptation (exclusive group "rt") ---------- */

  {
    id: "gng-quick-accelerator",
    domain: DOMAIN,
    facet: "Adaptation",
    priority: "supporting",
    mode: "exclusive",
    group: "rt",
    requiredFeatures: ["gng_rt_gain"],
    evaluate: (ctx) => rtAdaptationRule(ctx, "quick"),
  },
  {
    id: "gng-settles-into-pace",
    domain: DOMAIN,
    facet: "Adaptation",
    priority: "supporting",
    mode: "exclusive",
    group: "rt",
    requiredFeatures: ["gng_rt_gain"],
    evaluate: (ctx) => rtAdaptationRule(ctx, "settles"),
  },
  {
    id: "gng-tempo-stable",
    domain: DOMAIN,
    facet: "Adaptation",
    priority: "supporting",
    mode: "exclusive",
    group: "rt",
    requiredFeatures: ["gng_rt_gain"],
    evaluate: (ctx) => rtAdaptationRule(ctx, "stable"),
  },
  {
    id: "gng-measured-shift",
    domain: DOMAIN,
    facet: "Adaptation",
    priority: "supporting",
    mode: "exclusive",
    group: "rt",
    requiredFeatures: ["gng_rt_gain"],
    evaluate: (ctx) => rtAdaptationRule(ctx, "measured"),
  },
  {
    id: "gng-late-slowdown",
    domain: DOMAIN,
    facet: "Adaptation",
    priority: "supporting",
    mode: "exclusive",
    group: "rt",
    requiredFeatures: ["gng_rt_gain"],
    evaluate: (ctx) => rtAdaptationRule(ctx, "slow"),
  },

  /* ---------- Supporting: speed x error interaction (exclusive group "speed-error") ---------- */

  {
    id: "gng-controlled-acceleration",
    domain: DOMAIN,
    facet: "Control Shift",
    priority: "supporting",
    mode: "exclusive",
    group: "speed-error",
    requiredFeatures: ["gng_rt_gain", "gng_error_change"],
    evaluate: (ctx) => speedErrorRule(ctx, "controlled-acceleration"),
  },
  {
    id: "gng-speed-first-shift",
    domain: DOMAIN,
    facet: "Control Shift",
    priority: "supporting",
    mode: "exclusive",
    group: "speed-error",
    requiredFeatures: ["gng_rt_gain", "gng_error_change"],
    evaluate: (ctx) => speedErrorRule(ctx, "speed-first"),
  },
  {
    id: "gng-restraint-calibration",
    domain: DOMAIN,
    facet: "Control Shift",
    priority: "supporting",
    mode: "exclusive",
    group: "speed-error",
    requiredFeatures: ["gng_rt_gain", "gng_error_change"],
    evaluate: (ctx) => speedErrorRule(ctx, "restraint"),
  },
  {
    id: "gng-cleaner-control",
    domain: DOMAIN,
    facet: "Control Shift",
    priority: "supporting",
    mode: "exclusive",
    group: "speed-error",
    requiredFeatures: ["gng_rt_gain", "gng_error_change"],
    evaluate: (ctx) => speedErrorRule(ctx, "cleaner"),
  },
  {
    id: "gng-stable-control",
    domain: DOMAIN,
    facet: "Control Shift",
    priority: "supporting",
    mode: "exclusive",
    group: "speed-error",
    requiredFeatures: ["gng_rt_gain", "gng_error_change"],
    evaluate: (ctx) => speedErrorRule(ctx, "stable"),
  },

  /* ---------- Secondary: peak gap ---------- */

  {
    id: "gng-even-pace",
    domain: DOMAIN,
    facet: "Response Pattern",
    priority: "secondary",
    mode: "exclusive",
    requiredFeatures: ["gng_peak_gap"],
    evaluate: (ctx) => {
      const gap = feat(ctx, "gng_peak_gap");
      if (!gap || gap.value >= ctx.config.goNoGo.peakGap.highAt) return null;
      return makeTag({
        id: "gng-even-pace",
        label: "Even-Paced Inhibition",
        domain: DOMAIN,
        facet: "Response Pattern",
        priority: "secondary",
        evidenceQuality: "low",
        description:
          "The fastest Go trial sat close to the session mean — steady, even pacing during Go/No-Go.",
        evidence: gap.evidence,
        ruleId: "gng-even-pace",
        strength: 1 - gap.value / ctx.config.goNoGo.peakGap.highAt,
      });
    },
  },
  {
    id: "gng-burst-responder",
    domain: DOMAIN,
    facet: "Response Pattern",
    priority: "secondary",
    mode: "exclusive",
    requiredFeatures: ["gng_peak_gap"],
    evaluate: (ctx) => {
      const gap = feat(ctx, "gng_peak_gap");
      if (!gap || gap.value < ctx.config.goNoGo.peakGap.highAt) return null;
      return makeTag({
        id: "gng-burst-responder",
        label: "Burst Responder",
        domain: DOMAIN,
        facet: "Response Pattern",
        priority: "secondary",
        evidenceQuality: "low",
        description:
          "A fast single Go trial stood out well above the session mean.",
        evidence: gap.evidence,
        ruleId: "gng-burst-responder",
        strength: 1,
      });
    },
  },
];

const RT_DEFS = [
  { id: "quick", label: "Quick Accelerator", mode: "high", desc: "Real-block Go response times were clearly faster than practice — quick acceleration." },
  { id: "settles", label: "Settles Into Pace", mode: "mid", desc: "Real-block Go response times improved modestly over practice." },
  { id: "stable", label: "Tempo Stable", mode: "stable", desc: "Go response times were essentially unchanged between practice and the real block." },
  { id: "measured", label: "Measured Shift", mode: "negMid", desc: "Go response times slowed modestly in the real block — a measured, careful shift." },
  { id: "slow", label: "Late Slowdown", mode: "negHigh", desc: "Go response times slowed substantially in the real block." },
] as const;

function rtAdaptationRule(ctx: RuleContext, mode: string): ReturnType<typeof makeTag> | null {
  const f = feat(ctx, "gng_rt_gain");
  if (!f) return null;
  const { quickAt, slowAt } = ctx.config.goNoGo.rtGain;
  const def = RT_DEFS.find((d) => d.mode === mode);
  if (!def) return null;

  const v = f.value;
  let match = false;
  let strength = 0.5;
  switch (def.mode) {
    case "high":
      match = v >= quickAt;
      strength = higherIsStronger(v, quickAt, quickAt + 0.1);
      break;
    case "mid":
      match = v > 0 && v < quickAt;
      strength = bandToStrength(v, 0, quickAt);
      break;
    case "stable":
      match = Math.abs(v) <= 0.03;
      strength = 1 - Math.abs(v) / 0.03;
      break;
    case "negMid":
      match = v < 0 && v > slowAt;
      strength = bandToStrength(-v, 0, -slowAt);
      break;
    case "negHigh":
      match = v <= slowAt;
      strength = higherIsStronger(-v, -slowAt, -slowAt + 0.1);
      break;
  }
  if (!match) return null;

  return makeTag({
    id: RT_RULE_ID[mode],
    label: def.label,
    domain: DOMAIN,
    facet: "Adaptation",
    priority: "supporting",
    evidenceQuality: "medium",
    description: def.desc,
    evidence: f.evidence,
    ruleId: RT_RULE_ID[mode],
    strength,
  });
}

const RT_RULE_ID: Record<string, string> = {
  quick: "gng-quick-accelerator",
  settles: "gng-settles-into-pace",
  stable: "gng-tempo-stable",
  measured: "gng-measured-shift",
  slow: "gng-late-slowdown",
};

function speedErrorRule(ctx: RuleContext, mode: string): ReturnType<typeof makeTag> | null {
  const rt = feat(ctx, "gng_rt_gain");
  const err = feat(ctx, "gng_error_change");
  if (!rt || !err) return null;

  const { increaseAt, decreaseAt } = ctx.config.goNoGo.errorChange;
  const faster = rt.value >= 0.02;
  const slower = rt.value <= -0.02;
  const stableRt = !faster && !slower;
  const errorsUp = err.value >= increaseAt;
  const errorsDown = err.value <= decreaseAt;
  const errorsStable = !errorsUp && !errorsDown;

  let match = false;
  let def: { label: string; desc: string } | null = null;
  switch (mode) {
    case "controlled-acceleration":
      match = faster && (errorsStable || errorsDown);
      def = { label: "Controlled Acceleration", desc: "Got faster while errors stayed level or dropped — acceleration without losing control." };
      break;
    case "speed-first":
      match = faster && errorsUp;
      def = { label: "Speed-First Shift", desc: "Got faster while errors rose — speed took priority over restraint." };
      break;
    case "restraint":
      match = slower && errorsDown;
      def = { label: "Restraint Calibration", desc: "Slowed down while errors dropped — a deliberate accuracy-first adjustment." };
      break;
    case "cleaner":
      match = stableRt && errorsDown;
      def = { label: "Cleaner Control", desc: "Kept the same pace while errors dropped — cleaner control without changing speed." };
      break;
    case "stable":
      match = stableRt && errorsStable;
      def = { label: "Stable Control", desc: "Both pace and error level stayed steady across blocks." };
      break;
  }
  if (!match || !def) return null;

  const strength =
    mode === "controlled-acceleration"
      ? Math.min(1, (rt.value + 0.2) / 0.4)
      : mode === "stable"
        ? 1 - Math.abs(rt.value) / 0.02 - Math.abs(err.value) / Math.max(increaseAt, 1)
        : 0.7;

  return makeTag({
    id: SPEED_ERROR_RULE_ID[mode],
    label: def.label,
    domain: DOMAIN,
    facet: "Control Shift",
    priority: "supporting",
    evidenceQuality: "medium",
    description: def.desc,
    evidence: [...rt.evidence, ...err.evidence],
    ruleId: SPEED_ERROR_RULE_ID[mode],
    strength: Math.max(0.05, Math.min(1, strength)),
  });
}

const SPEED_ERROR_RULE_ID: Record<string, string> = {
  "controlled-acceleration": "gng-controlled-acceleration",
  "speed-first": "gng-speed-first-shift",
  restraint: "gng-restraint-calibration",
  cleaner: "gng-cleaner-control",
  stable: "gng-stable-control",
};

export function runGoNoGoRules(ctx: RuleContext): ProfileTag[] {
  return goNoGoRules
    .filter((rule) => hasAllFeatures(ctx, rule.requiredFeatures))
    .map((rule) => rule.evaluate(ctx))
    .filter((tag): tag is ProfileTag => tag !== null);
}
