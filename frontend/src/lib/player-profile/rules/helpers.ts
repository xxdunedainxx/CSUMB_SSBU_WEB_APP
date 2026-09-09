import type {
  EvidenceItem,
  ProfileTag,
  RuleContext,
} from "../types";
import { clamp01 } from "../math";

/**
 * Strength helpers — every helper clamps only its OUTPUT to 0..1. Raw derived
 * values are never clamped.
 */

/** Lower raw values express the pattern more strongly. */
export function lowerIsStronger(
  value: number,
  threshold: number,
  strongAt: number,
  fallback = 0.4
): number {
  if (value <= strongAt) return 1;
  if (value >= threshold) return 0;
  return 1 - (value - strongAt) / (threshold - strongAt);
}

/** Higher raw values express the pattern more strongly. */
export function higherIsStronger(
  value: number,
  threshold: number,
  strongAt: number,
  fallback = 0.4
): number {
  if (value >= strongAt) return 1;
  if (value <= threshold) return 0;
  return (value - threshold) / (strongAt - threshold);
}

/** Strength of being within `tolerance` of an ideal value. */
export function closenessStrength(
  value: number,
  ideal: number,
  tolerance: number
): number {
  const distance = Math.abs(value - ideal);
  if (distance >= tolerance) return 0;
  return 1 - distance / tolerance;
}

/** Bands helper: returns the strength between `low` and `high` bounds. */
export function bandStrength(value: number, low: number, high: number): number {
  if (value <= low) return 1;
  if (value >= high) return 0;
  return 1 - (value - low) / (high - low);
}

/**
 * Builds a ProfileTag. `strength` is clamped to 0..1. When a threshold is
 * barely crossed the strength degrades smoothly via the provided `strongness`
 * (0..1) value.
 */
export function makeTag(args: {
  id: string;
  label: string;
  domain: ProfileTag["domain"];
  facet: string;
  priority: ProfileTag["priority"];
  evidenceQuality: ProfileTag["evidenceQuality"];
  description: string;
  evidence: EvidenceItem[];
  ruleId: string;
  strength: number;
}): ProfileTag {
  return {
    id: args.id,
    label: args.label,
    domain: args.domain,
    facet: args.facet,
    priority: args.priority,
    evidenceQuality: args.evidenceQuality,
    description: args.description,
    evidence: args.evidence,
    ruleId: args.ruleId,
    strength: clamp01(args.strength),
  };
}

/** Convenience feature accessor inside rule evaluation. */
export function feat(ctx: RuleContext, id: string) {
  return ctx.features.get(id) ?? null;
}

/** A feature that may be missing — guards rules against absent data. */
export function hasAllFeatures(ctx: RuleContext, ids: string[]): boolean {
  return ids.every((id) => ctx.features.has(id));
}

/** Effective strength for a band-positioned rule with midpoint decay. */
export function bandToStrength(
  value: number,
  bandMin: number,
  bandMax: number
): number {
  const mid = (bandMin + bandMax) / 2;
  if (bandMax <= bandMin) return 0.5;
  const t = Math.min(1, Math.max(0, (value - bandMin) / (bandMax - bandMin)));
  // Peak in the middle of the band, decay toward the edges.
  return 0.55 + 0.45 * (1 - Math.abs(2 * t - 1));
}
