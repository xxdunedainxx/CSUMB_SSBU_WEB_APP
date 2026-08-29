import type {
  CognitiveTestResults,
  PlayerProfile,
  ProfileWarning,
  RuleContext,
} from "./types";
import { PROFILE_ENGINE_VERSION, profileConfigV1 } from "./config";
import { validateResults } from "./validation";
import { deriveFeatures, extractMeasurements } from "./features";
import { runRules, resolveTags } from "./rules";
import { deriveArchetype } from "./rules/archetypes";
import { applyTagBudget } from "./tagBudget";
import { buildDomains } from "./buildDomains";
import { composeProfileTree } from "./composeProfileTree";

/**
 * Full pipeline: validate -> extract -> derive features -> run rules ->
 * resolve exclusive/additive -> filter weak tags -> archetype -> build
 * archetype-aware domains/visual weights -> compose the signature-chain
 * sunburst tree (2-4 branches, capped visible arcs).
 *
 * Deterministic: the same input yields the same profile. Never throws on bad
 * input — invalid data degrades to warnings and missing rules are skipped.
 */
export function buildPlayerProfile(
  results: CognitiveTestResults,
  config = profileConfigV1
): PlayerProfile {
  const warnings: ProfileWarning[] = validateResults(results);

  const measurements = extractMeasurements(results, config);
  const features = deriveFeatures(measurements, config);
  const featureMap = new Map(features.map((f) => [f.id, f]));

  const ctx: RuleContext = { features: featureMap, measurements, config };
  const candidates = runRules(ctx);
  const tags = resolveTags(candidates, config);

  const archetype = deriveArchetype(tags);
  const budgeted = applyTagBudget(tags, archetype, config);
  const { domains } = buildDomains(budgeted, config, archetype);
  const sunburst = composeProfileTree(budgeted, archetype, config);

  if (measurements.gng && !config.goNoGo.useErrorCountsAsRates) {
    warnings.push({
      code: "GNG_TRIAL_COUNTS_UNVERIFIED",
      message:
        "Go/No-Go error counts are compared directly across blocks; trial counts are not present in the aggregate data, so errors are not compared as rates.",
      path: "GoNoGo",
    });
  }

  return {
    engineVersion: PROFILE_ENGINE_VERSION,
    thresholdVersion: config.version,
    features,
    domains,
    archetype,
    sunburst,
    warnings,
  };
}
