import type {
  CognitiveTestResults,
  ControllerStickTest,
  DirectionKey,
} from "../types";
import { isFiniteNum, safeMean, safeWeightedMean } from "../math";

export interface DirectionMetrics {
  hitPercent: number | null;
  accuracyDegrees: number | null;
  reactionMs: number | null;
}

export interface StickMetrics {
  totalAverageReaction: number | null;
  peakReaction: number | null;
  targetsMissed: number | null;
  trialCount: number;
  /** Map of available directions to their per-direction metrics. */
  directions: Partial<Record<DirectionKey, DirectionMetrics>>;
}

export interface DualMetrics {
  totalAverageReaction: number | null;
  peakReaction: number | null;
  targetsMissed: number | null;
  outOfOrderCount: number | null;
}

export interface ControllerMeasurements {
  left: StickMetrics;
  right: StickMetrics;
  dualLeft: StickMetrics;
  dualRight: StickMetrics;
  dual: DualMetrics;
}

export const CARDINAL_KEYS: DirectionKey[] = ["Left", "Up", "Right", "Down"];
export const ALL_KEYS: DirectionKey[] = [
  "Left",
  "Up_Left",
  "Up",
  "Up_Right",
  "Right",
  "Down_Right",
  "Down",
  "Down_Left",
];

function extractStickMetrics(
  stick: ControllerStickTest | undefined,
  trialCount: number
): StickMetrics {
  if (!stick) {
    return {
      totalAverageReaction: null,
      peakReaction: null,
      targetsMissed: null,
      trialCount,
      directions: {},
    };
  }

  const directions: Partial<Record<DirectionKey, DirectionMetrics>> = {};
  for (const key of ALL_KEYS) {
    const hit = stick.Target_Hit_Average_Percentages?.[key];
    const acc = stick.Accuracy_Averages?.[key];
    const rt = stick.Reaction_Averages?.[key];
    if (hit === undefined && acc === undefined && rt === undefined) continue;
    directions[key] = {
      hitPercent: isFiniteNum(hit) ? (hit as number) : null,
      accuracyDegrees: isFiniteNum(acc) ? (acc as number) : null,
      reactionMs: isFiniteNum(rt) ? (rt as number) : null,
    };
  }

  return {
    totalAverageReaction: isFiniteNum(stick.Total_Average_Reaction) ? (stick.Total_Average_Reaction as number) : null,
    peakReaction: isFiniteNum(stick.Peak_Reaction) ? (stick.Peak_Reaction as number) : null,
    targetsMissed: isFiniteNum(stick.Targets_Missed) ? (stick.Targets_Missed as number) : null,
    trialCount,
    directions,
  };
}

export function extractController(
  results: CognitiveTestResults,
  singleTrials = 16,
  dualTrials = 28
): ControllerMeasurements | null {
  const ctl = results.Controller_Test;
  if (!ctl) return null;

  return {
    left: extractStickMetrics(ctl.Left_Test, singleTrials),
    right: extractStickMetrics(ctl.Right_Test, singleTrials),
    dualLeft: extractStickMetrics(ctl.Dual_Test?.Left_Stick, dualTrials),
    dualRight: extractStickMetrics(ctl.Dual_Test?.Right_Stick, dualTrials),
    dual: {
      totalAverageReaction: isFiniteNum(ctl.Dual_Test?.Total_Average_Reaction)
        ? (ctl.Dual_Test?.Total_Average_Reaction as number)
        : null,
      peakReaction: isFiniteNum(ctl.Dual_Test?.Peak_Reaction)
        ? (ctl.Dual_Test?.Peak_Reaction as number)
        : null,
      targetsMissed: isFiniteNum(ctl.Dual_Test?.Targets_Missed)
        ? (ctl.Dual_Test?.Targets_Missed as number)
        : null,
      outOfOrderCount: isFiniteNum(ctl.Dual_Test?.Out_Of_Order_Count)
        ? (ctl.Dual_Test?.Out_Of_Order_Count as number)
        : null,
    },
  };
}

/** Mean reaction over the given direction keys. */
export function meanReaction(
  stick: StickMetrics,
  keys: DirectionKey[] = ALL_KEYS
): number | null {
  return safeMean(keys.map((k) => stick.directions[k]?.reactionMs));
}

/** Mean accuracy (degrees from target center) over the given direction keys. */
export function meanAccuracy(
  stick: StickMetrics,
  keys: DirectionKey[] = ALL_KEYS
): number | null {
  return safeMean(keys.map((k) => stick.directions[k]?.accuracyDegrees));
}

/** Mean hit percentage over the given direction keys. */
export function meanHitPercent(
  stick: StickMetrics,
  keys: DirectionKey[] = ALL_KEYS
): number | null {
  return safeMean(keys.map((k) => stick.directions[k]?.hitPercent));
}

/**
 * Weighted mean reaction for dual-left: cardinals (L/U/R/D) appear 3x and
 * diagonals appear 4x per the 28-trial dual design.
 */
export function dualLeftWeightedReaction(stick: StickMetrics): number | null {
  return safeWeightedMean(
    ALL_KEYS.map((key) => ({
      value: stick.directions[key]?.reactionMs,
      weight: CARDINAL_KEYS.includes(key) ? 3 : 4,
    }))
  );
}

/** Weighted mean accuracy for dual-left using the same 3/4 trial weighting. */
export function dualLeftWeightedAccuracy(stick: StickMetrics): number | null {
  return safeWeightedMean(
    ALL_KEYS.map((key) => ({
      value: stick.directions[key]?.accuracyDegrees,
      weight: CARDINAL_KEYS.includes(key) ? 3 : 4,
    }))
  );
}

/**
 * Matched cardinal-only baseline from a single-stick test — used when
 * comparing against dual-right, which only contains the four cardinal
 * directions (each appearing 7x).
 */
export function cardinalOnlyBaseline(stick: StickMetrics): {
  reaction: number | null;
  accuracy: number | null;
  hitPercent: number | null;
} {
  return {
    reaction: meanReaction(stick, CARDINAL_KEYS),
    accuracy: meanAccuracy(stick, CARDINAL_KEYS),
    hitPercent: meanHitPercent(stick, CARDINAL_KEYS),
  };
}
