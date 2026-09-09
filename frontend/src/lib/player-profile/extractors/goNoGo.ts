import type { CognitiveTestResults, GoNoGoBlock } from "../types";
import { isFiniteNum } from "../math";

export interface GngMeasurements {
  practice: { peak: number | null; mean: number | null; errors: number | null };
  real: { peak: number | null; mean: number | null; errors: number | null };
}

export function extractGoNoGo(results: CognitiveTestResults): GngMeasurements | null {
  const gng = results.GoNoGo;
  if (!gng) return null;

  const pick = (block?: GoNoGoBlock) => ({
    peak: isFiniteNum(block?.Peak) ? (block?.Peak as number) : null,
    mean: isFiniteNum(block?.Mean) ? (block?.Mean as number) : null,
    errors: isFiniteNum(block?.Error_Count) ? (block?.Error_Count as number) : null,
  });

  return {
    practice: pick(gng.Practice),
    real: pick(gng.Real),
  };
}
