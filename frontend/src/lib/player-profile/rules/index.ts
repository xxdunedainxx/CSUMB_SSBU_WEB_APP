import type {
  ProfileRule,
  ProfileTag,
  RuleContext,
} from "../types";
import { runSimpleReactionRules, simpleReactionRules } from "./simpleReaction";
import { runTaskSwitchingRules, taskSwitchingRules } from "./taskSwitching";
import { runGoNoGoRules, goNoGoRules } from "./goNoGo";
import { runPosnerRules, posnerRules } from "./posner";
import { runControllerRules, controllerRules } from "./controller";

export {
  bandStrength,
  bandToStrength,
  closenessStrength,
  feat,
  hasAllFeatures,
  higherIsStronger,
  lowerIsStronger,
  makeTag,
} from "./helpers";

export {
  simpleReactionRules,
  taskSwitchingRules,
  goNoGoRules,
  posnerRules,
  controllerRules,
};

export const ALL_RULES: ProfileRule[] = [
  ...simpleReactionRules,
  ...taskSwitchingRules,
  ...goNoGoRules,
  ...posnerRules,
  ...controllerRules,
];

/**
 * Runs every rule and returns raw candidate tags. Rules that depend on missing
 * data are skipped; they never throw.
 */
export function runRules(ctx: RuleContext): ProfileTag[] {
  return [
    ...runSimpleReactionRules(ctx),
    ...runTaskSwitchingRules(ctx),
    ...runGoNoGoRules(ctx),
    ...runPosnerRules(ctx),
    ...runControllerRules(ctx),
  ];
}

function exclusiveGroupKey(tag: ProfileTag): string | null {
  const rule = ALL_RULES.find((r) => r.id === tag.ruleId);
  if (!rule || rule.mode !== "exclusive") return null;
  const group = rule.group ?? rule.facet;
  return `${rule.domain}|${rule.facet}|${group}`;
}

/**
 * Resolution pipeline:
 *  1. Exclusive rules within the same (domain, facet, group) keep only the
 *     highest-strength tag.
 *  2. Weak supporting / secondary tags are filtered out.
 *  3. Additive tags per facet are capped (default 3), strongest first.
 *  Core tags always survive filtering.
 */
export function resolveTags(
  candidates: ProfileTag[],
  config: RuleContext["config"]
): ProfileTag[] {
  const { supportingMinimumStrength, secondaryMinimumStrength, maxAdditiveTags } =
    config.tagFilters;

  // 1. Exclusive resolution.
  const exclusiveWinners = new Map<string, ProfileTag>();
  const additive: ProfileTag[] = [];
  for (const tag of candidates) {
    const key = exclusiveGroupKey(tag);
    if (key === null) {
      additive.push(tag);
      continue;
    }
    const current = exclusiveWinners.get(key);
    if (!current || tag.strength > current.strength) {
      exclusiveWinners.set(key, tag);
    }
  }

  // 2. Strength filtering.
  const kept: ProfileTag[] = [...exclusiveWinners.values()].filter(
    (tag) => tag.priority === "core" || tag.strength >= strengthFloor(tag.priority, config)
  );
  kept.push(
    ...additive.filter(
      (tag) => tag.priority === "core" || tag.strength >= strengthFloor(tag.priority, config)
    )
  );

  // 3. Cap additive tags per facet (exclusive winners are not capped).
  const perFacet = new Map<string, ProfileTag[]>();
  for (const tag of kept) {
    const key = exclusiveGroupKey(tag);
    if (key !== null) continue; // exclusive winner — uncapped
    const list = perFacet.get(`${tag.domain}|${tag.facet}`) ?? [];
    list.push(tag);
    perFacet.set(`${tag.domain}|${tag.facet}`, list);
  }

  const result = new Map<string, ProfileTag>();
  for (const tag of kept) {
    if (exclusiveGroupKey(tag) !== null) {
      result.set(tag.id, tag);
    }
  }
  for (const [, tags] of perFacet) {
    const sorted = [...tags].sort((a, b) => b.strength - a.strength);
    for (const tag of sorted.slice(0, maxAdditiveTags)) {
      result.set(tag.id, tag);
    }
  }

  // Deterministic ordering: domain order, then facet, then strength desc.
  const domainOrder: Record<string, number> = {
    reaction: 0,
    flexibility: 1,
    inhibition: 2,
    attention: 3,
    controller: 4,
  };
  return [...result.values()].sort((a, b) => {
    const d = (domainOrder[a.domain] ?? 9) - (domainOrder[b.domain] ?? 9);
    if (d !== 0) return d;
    const f = a.facet.localeCompare(b.facet);
    if (f !== 0) return f;
    return b.strength - a.strength;
  });
}

function strengthFloor(priority: ProfileTag["priority"], config: RuleContext["config"]): number {
  if (priority === "supporting") return config.tagFilters.supportingMinimumStrength;
  if (priority === "secondary") return config.tagFilters.secondaryMinimumStrength;
  return 0;
}
