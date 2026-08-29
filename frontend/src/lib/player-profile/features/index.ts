import type {
  CognitiveTestResults,
  DerivedFeature,
  Measurements,
  ProfileConfig,
} from "../types";
import {
  extractController,
  extractGoNoGo,
  extractPosner,
  extractSimpleReaction,
  extractTaskSwitching,
} from "../extractors";
import { srtFeatures } from "./simpleReaction";
import { taskSwitchingFeatures } from "./taskSwitching";
import { goNoGoFeatures } from "./goNoGo";
import { posnerFeatures } from "./posner";
import { controllerFeatures } from "./controller";

export { fmtCount, fmtDegrees, fmtMs, fmtPercent, fmtPp, fmtRatio } from "./helpers";

/** Extracts typed measurements from the raw aggregate results. */
export function extractMeasurements(
  results: CognitiveTestResults,
  config: ProfileConfig
): Measurements {
  return {
    srt: extractSimpleReaction(results),
    ts: extractTaskSwitching(results),
    gng: extractGoNoGo(results),
    posner: extractPosner(results),
    controller: extractController(
      results,
      config.controller.singleTrials,
      config.controller.dualTrials
    ),
  };
}

/**
 * Derives all features for a session. Features are deterministic pure
 * calculations; NaN/Infinity never escape (invalid inputs yield null and are
 * skipped). Returns features sorted by id for stable ordering.
 */
export function deriveFeatures(
  measurements: Measurements,
  config: ProfileConfig
): DerivedFeature[] {
  const features: DerivedFeature[] = [];

  if (measurements.srt) {
    features.push(...srtFeatures(measurements.srt));
  }
  if (measurements.ts) {
    features.push(...taskSwitchingFeatures(measurements.ts));
  }
  if (measurements.gng) {
    features.push(...goNoGoFeatures(measurements.gng));
  }
  if (measurements.posner) {
    features.push(...posnerFeatures(measurements.posner));
  }
  if (measurements.controller) {
    features.push(...controllerFeatures(measurements.controller, config));
  }

  return features.sort((a, b) => (a.id < b.id ? -1 : a.id > b.id ? 1 : 0));
}
