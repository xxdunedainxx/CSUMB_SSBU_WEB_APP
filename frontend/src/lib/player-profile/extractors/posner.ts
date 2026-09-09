import type { CognitiveTestResults, PosnerBlock } from "../types";
import { isFiniteNum } from "../math";

export interface PosnerBlockMeasurements {
  average: number | null;
  peak: number | null;
  incorrectPercentage: number | null;
  incorrectCount: number | null;
}

export interface PosnerMeasurements {
  practice: { valid: PosnerBlockMeasurements; invalid: PosnerBlockMeasurements };
  real: { valid: PosnerBlockMeasurements; invalid: PosnerBlockMeasurements };
}

function extractPosnerBlock(block?: PosnerBlock): PosnerBlockMeasurements {
  if (!block) {
    return { average: null, peak: null, incorrectPercentage: null, incorrectCount: null };
  }
  return {
    average: isFiniteNum(block.Average) ? (block.Average as number) : null,
    peak: isFiniteNum(block.Peak) ? (block.Peak as number) : null,
    incorrectPercentage: isFiniteNum(block.Incorrect_Percentage) ? (block.Incorrect_Percentage as number) : null,
    incorrectCount: isFiniteNum(block.Incorrect_Count) ? (block.Incorrect_Count as number) : null,
  };
}

export function extractPosner(results: CognitiveTestResults): PosnerMeasurements | null {
  const posner = results.PosnerCue;
  if (!posner) return null;
  return {
    practice: {
      valid: extractPosnerBlock(posner.Practice?.Valid),
      invalid: extractPosnerBlock(posner.Practice?.Non_Valid),
    },
    real: {
      valid: extractPosnerBlock(posner.Real?.Valid),
      invalid: extractPosnerBlock(posner.Real?.Non_Valid),
    },
  };
}
