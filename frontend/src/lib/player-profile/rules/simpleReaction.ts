import type { ProfileRule, ProfileTag, RuleContext } from "../types";
import { bandStrength, feat, hasAllFeatures, higherIsStronger, makeTag } from "./helpers";

const DOMAIN = "reaction" as const;

export const simpleReactionRules: ProfileRule[] = [
  /* ---------- Core: warm-up band (exclusive) ---------- */

  {
    id: "srt-fast-warmup",
    domain: DOMAIN,
    facet: "Adaptation",
    priority: "core",
    mode: "exclusive",
    requiredFeatures: ["srt_warmup_gain"],
    evaluate: (ctx) => {
      const warmup = feat(ctx, "srt_warmup_gain");
      if (!warmup || warmup.value < ctx.config.srt.warmUp.fastAt) return null;
      const { fastAt } = ctx.config.srt.warmUp;
      const strength = higherIsStronger(warmup.value, fastAt, fastAt + 0.12);
      return makeTag({
        id: "fast-warm-up",
        label: "Fast Warm-Up",
        domain: DOMAIN,
        facet: "Adaptation",
        priority: "core",
        evidenceQuality: "high",
        description:
          "Real-block average reaction time was markedly faster than practice, indicating a quick warm-up into the task.",
        evidence: warmup.evidence,
        ruleId: "srt-fast-warmup",
        strength,
      });
    },
  },

  {
    id: "srt-settles-in",
    domain: DOMAIN,
    facet: "Adaptation",
    priority: "core",
    mode: "exclusive",
    requiredFeatures: ["srt_warmup_gain"],
    evaluate: (ctx) => {
      const warmup = feat(ctx, "srt_warmup_gain");
      if (!warmup) return null;
      const { settleMin, settleMax } = ctx.config.srt.warmUp;
      if (warmup.value < settleMin || warmup.value > settleMax) return null;
      return makeTag({
        id: "settles-in",
        label: "Settles In",
        domain: DOMAIN,
        facet: "Adaptation",
        priority: "core",
        evidenceQuality: "high",
        description:
          "Real-block average was a moderate improvement over practice — the player settled into a stable, faster pace.",
        evidence: warmup.evidence,
        ruleId: "srt-settles-in",
        strength: bandStrength(warmup.value, settleMin, settleMax),
      });
    },
  },

  {
    id: "srt-ready-starter",
    domain: DOMAIN,
    facet: "Adaptation",
    priority: "core",
    mode: "exclusive",
    requiredFeatures: ["srt_warmup_gain"],
    evaluate: (ctx) => {
      const warmup = feat(ctx, "srt_warmup_gain");
      if (!warmup) return null;
      const { settleMin } = ctx.config.srt.warmUp;
      if (Math.abs(warmup.value) > settleMin) return null;
      return makeTag({
        id: "ready-starter",
        label: "Ready Starter",
        domain: DOMAIN,
        facet: "Adaptation",
        priority: "core",
        evidenceQuality: "high",
        description:
          "Practice and real-block averages were nearly identical — the player started already at their sustained pace.",
        evidence: warmup.evidence,
        ruleId: "srt-ready-starter",
        strength: 1 - Math.abs(warmup.value) / settleMin,
      });
    },
  },

  {
    id: "srt-early-peak",
    domain: DOMAIN,
    facet: "Adaptation",
    priority: "core",
    mode: "exclusive",
    requiredFeatures: ["srt_warmup_gain"],
    evaluate: (ctx) => {
      const warmup = feat(ctx, "srt_warmup_gain");
      if (!warmup) return null;
      const { settleMin, earlyMin } = ctx.config.srt.warmUp;
      if (warmup.value > -settleMin || warmup.value < earlyMin) return null;
      return makeTag({
        id: "early-peak",
        label: "Early Peak",
        domain: DOMAIN,
        facet: "Adaptation",
        priority: "core",
        evidenceQuality: "high",
        description:
          "Real-block average was slower than practice — performance peaked early in the session.",
        evidence: warmup.evidence,
        ruleId: "srt-early-peak",
        strength: bandStrength(warmup.value, earlyMin, -settleMin),
      });
    },
  },

  {
    id: "srt-practice-peak",
    domain: DOMAIN,
    facet: "Adaptation",
    priority: "core",
    mode: "exclusive",
    requiredFeatures: ["srt_warmup_gain"],
    evaluate: (ctx) => {
      const warmup = feat(ctx, "srt_warmup_gain");
      if (!warmup) return null;
      const { earlyMin } = ctx.config.srt.warmUp;
      if (warmup.value >= earlyMin) return null;
      return makeTag({
        id: "practice-peak",
        label: "Practice Peak",
        domain: DOMAIN,
        facet: "Adaptation",
        priority: "core",
        evidenceQuality: "high",
        description:
          "Real-block average was substantially slower than practice — the best performance stayed in the practice block.",
        evidence: warmup.evidence,
        ruleId: "srt-practice-peak",
        strength: 1,
      });
    },
  },

  /* ---------- Secondary: peak gap (exclusive) ---------- */

  {
    id: "srt-even-paced",
    domain: DOMAIN,
    facet: "Response Pattern",
    priority: "secondary",
    mode: "exclusive",
    requiredFeatures: ["srt_peak_gap"],
    evaluate: (ctx) => {
      const peakGap = feat(ctx, "srt_peak_gap");
      if (!peakGap || peakGap.value >= ctx.config.srt.peakGap.evenAt) return null;
      return makeTag({
        id: "even-paced",
        label: "Even-Paced",
        domain: DOMAIN,
        facet: "Response Pattern",
        priority: "secondary",
        evidenceQuality: "medium",
        description:
          "The fastest trial was close to the session average — little single-trial burst.",
        evidence: peakGap.evidence,
        ruleId: "srt-even-paced",
        strength: 1 - peakGap.value / ctx.config.srt.peakGap.evenAt,
      });
    },
  },

  {
    id: "srt-burst-capable",
    domain: DOMAIN,
    facet: "Response Pattern",
    priority: "secondary",
    mode: "exclusive",
    requiredFeatures: ["srt_peak_gap"],
    evaluate: (ctx) => {
      const peakGap = feat(ctx, "srt_peak_gap");
      if (!peakGap) return null;
      const { evenAt, burstAt } = ctx.config.srt.peakGap;
      if (peakGap.value < evenAt || peakGap.value >= burstAt) return null;
      return makeTag({
        id: "burst-capable",
        label: "Burst-Capable",
        domain: DOMAIN,
        facet: "Response Pattern",
        priority: "secondary",
        evidenceQuality: "medium",
        description:
          "The fastest trial beat the average by a noticeable margin — the player can produce a quick burst.",
        evidence: peakGap.evidence,
        ruleId: "srt-burst-capable",
        strength: bandStrength(peakGap.value, evenAt, burstAt),
      });
    },
  },

  {
    id: "srt-high-burst",
    domain: DOMAIN,
    facet: "Response Pattern",
    priority: "secondary",
    mode: "exclusive",
    requiredFeatures: ["srt_peak_gap"],
    evaluate: (ctx) => {
      const peakGap = feat(ctx, "srt_peak_gap");
      if (!peakGap) return null;
      const { burstAt, flashAt } = ctx.config.srt.peakGap;
      if (peakGap.value < burstAt || peakGap.value >= flashAt) return null;
      return makeTag({
        id: "high-burst",
        label: "High Burst",
        domain: DOMAIN,
        facet: "Response Pattern",
        priority: "secondary",
        evidenceQuality: "medium",
        description:
          "A large gap between the fastest trial and the average — strong single-trial acceleration.",
        evidence: peakGap.evidence,
        ruleId: "srt-high-burst",
        strength: bandStrength(peakGap.value, burstAt, flashAt),
      });
    },
  },

  {
    id: "srt-flash-response",
    domain: DOMAIN,
    facet: "Response Pattern",
    priority: "secondary",
    mode: "exclusive",
    requiredFeatures: ["srt_peak_gap"],
    evaluate: (ctx) => {
      const peakGap = feat(ctx, "srt_peak_gap");
      if (!peakGap || peakGap.value < ctx.config.srt.peakGap.flashAt) return null;
      return makeTag({
        id: "flash-response",
        label: "Flash Response",
        domain: DOMAIN,
        facet: "Response Pattern",
        priority: "secondary",
        evidenceQuality: "low",
        description:
          "The fastest trial was far above the average — a flash-like single reaction.",
        evidence: peakGap.evidence,
        ruleId: "srt-flash-response",
        strength: 1,
      });
    },
  },

  /* ---------- Supporting: average × peak adaptation combos ---------- */

  {
    id: "srt-full-warmup",
    domain: DOMAIN,
    facet: "Adaptation",
    priority: "supporting",
    mode: "additive",
    requiredFeatures: ["srt_avg_change", "srt_peak_change"],
    evaluate: (ctx) => {
      const avgChange = feat(ctx, "srt_avg_change");
      const peakChange = feat(ctx, "srt_peak_change");
      if (!avgChange || !peakChange) return null;
      const avgImprovement = -avgChange.value;
      const peakImprovement = -peakChange.value;
      const { fullWarmUpAt } = ctx.config.srt;
      if (avgImprovement < fullWarmUpAt || peakImprovement < fullWarmUpAt) return null;
      return makeTag({
        id: "full-warm-up",
        label: "Full Warm-Up",
        domain: DOMAIN,
        facet: "Adaptation",
        priority: "supporting",
        evidenceQuality: "high",
        description:
          "Both average and peak reaction times improved together from practice to the real block.",
        evidence: [...avgChange.evidence, ...peakChange.evidence],
        ruleId: "srt-full-warmup",
        strength: Math.min(avgImprovement / 0.2, peakImprovement / 0.2),
      });
    },
  },

  {
    id: "srt-burst-unlock",
    domain: DOMAIN,
    facet: "Adaptation",
    priority: "supporting",
    mode: "additive",
    requiredFeatures: ["srt_avg_change", "srt_peak_change"],
    evaluate: (ctx) => {
      const avgChange = feat(ctx, "srt_avg_change");
      const peakChange = feat(ctx, "srt_peak_change");
      if (!avgChange || !peakChange) return null;
      const avgImprovement = -avgChange.value;
      const peakImprovement = -peakChange.value;
      const { burstUnlockAt, burstUnlockLead } = ctx.config.srt;
      if (peakImprovement < burstUnlockAt || peakImprovement - avgImprovement < burstUnlockLead) return null;
      return makeTag({
        id: "burst-unlock",
        label: "Burst Unlock",
        domain: DOMAIN,
        facet: "Adaptation",
        priority: "supporting",
        evidenceQuality: "medium",
        description:
          "Peak reaction time improved far more than the average — a new burst appeared in the real block.",
        evidence: [...avgChange.evidence, ...peakChange.evidence],
        ruleId: "srt-burst-unlock",
        strength: Math.min(1, peakImprovement / 0.25),
      });
    },
  },

  {
    id: "srt-settled-rhythm",
    domain: DOMAIN,
    facet: "Adaptation",
    priority: "supporting",
    mode: "additive",
    requiredFeatures: ["srt_avg_change", "srt_peak_change"],
    evaluate: (ctx) => {
      const avgChange = feat(ctx, "srt_avg_change");
      const peakChange = feat(ctx, "srt_peak_change");
      if (!avgChange || !peakChange) return null;
      if (Math.abs(avgChange.value) > 0.05 || Math.abs(peakChange.value) > 0.05) return null;
      return makeTag({
        id: "settled-rhythm",
        label: "Settled Rhythm",
        domain: DOMAIN,
        facet: "Adaptation",
        priority: "supporting",
        evidenceQuality: "high",
        description:
          "Average and peak reaction times were both stable from practice to the real block — a settled, consistent rhythm.",
        evidence: [...avgChange.evidence, ...peakChange.evidence],
        ruleId: "srt-settled-rhythm",
        strength: 1 - Math.max(Math.abs(avgChange.value), Math.abs(peakChange.value)) / 0.05,
      });
    },
  },
];

export function runSimpleReactionRules(ctx: RuleContext): ProfileTag[] {
  return simpleReactionRules
    .filter((rule) => hasAllFeatures(ctx, rule.requiredFeatures))
    .map((rule) => rule.evaluate(ctx))
    .filter((tag): tag is ProfileTag => tag !== null);
}
