import type { CognitiveTestResults } from "../types";
import { isFiniteNum } from "../math";

export interface SrtMeasurements {
  practice: { peak: number; average: number };
  real: { peak: number; average: number };
}

export function extractSimpleReaction(
  results: CognitiveTestResults
): SrtMeasurements | null {
  const practice = results.SimpleReaction?.Practice;
  const real = results.SimpleReaction?.Real;
  if (!practice || !real) return null;

  const pPeak = practice.Peak;
  const pAvg = practice.Average;
  const rPeak = real.Peak;
  const rAvg = real.Average;
  if (![pPeak, pAvg, rPeak, rAvg].every(isFiniteNum)) return null;

  return {
    practice: { peak: pPeak as number, average: pAvg as number },
    real: { peak: rPeak as number, average: rAvg as number },
  };
}
